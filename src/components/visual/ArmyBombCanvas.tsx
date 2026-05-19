/* eslint-disable react-hooks/purity */
// Decorative ARMY bomb field — Math.random() inside the useMemo is intentional.
// Bombs are generated once on mount (deps: []) and never re-randomize.
import React, { useRef, useEffect, useMemo } from 'react';
import { BORAHAE_COLORS } from '../../constants/colors';

interface Bomb {
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    brightness: number;
    twinkleSpeed: number;
}

/**
 * Live audio reactivity. Pass a ref so the canvas can read fresh band energies
 * each frame without re-mounting the draw loop.
 */
export interface ArmyBombCanvasProps {
    audioRef?: React.MutableRefObject<{ bass: number; treble: number; isChorus: boolean } | null>;
}

export const ArmyBombCanvas: React.FC<ArmyBombCanvasProps> = ({ audioRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Smoothed band trackers — instantaneous FFT readings are jittery. EMAs
    // give a "sustained shine" response that follows the song's beat without
    // jumping frame-to-frame.
    const smoothedBassRef = useRef(0);
    const smoothedTrebleRef = useRef(0);

    const bombs = useMemo<Bomb[]>(() => {
        const result: Omit<Bomb, 'twinkleSpeed'>[] = [];

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const isLowPower = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) < 4;
        const density = isMobile || isLowPower ? 0.5 : 1;

        const colors = [
            BORAHAE_COLORS.PRIMARY, '#9333EA', '#7C3AED', '#8B5CF6', '#C084FC', '#B47EE5',
            '#D8B4FE', '#E9D5FF', '#F3E8FF',
            '#FFFFFF', '#F5F3FF',
        ];

        const getColor = () => {
            const rand = Math.random();
            if (rand < 0.88) return colors[Math.floor(Math.random() * 9)];
            return colors[9 + Math.floor(Math.random() * 2)];
        };

        // 180-degree semicircle
        const numArcs = Math.round(20 * density);
        for (let arc = 0; arc < numArcs; arc++) {
            const radiusPercent = 15 + arc * 4;
            const baseY = 35 - arc * 1.5;
            const pointsInArc = Math.round((35 + arc * 5) * density);
            for (let p = 0; p < pointsInArc; p++) {
                const angle = (p / (pointsInArc - 1)) * Math.PI;
                const x = 50 + radiusPercent * Math.cos(angle);
                const y = baseY + radiusPercent * 0.4 * Math.sin(angle);
                const perspectiveScale = 0.4 + (1 - arc / numArcs) * 0.6;
                result.push({
                    x: x + (Math.random() - 0.5) * 4,
                    y: Math.max(3, y + (Math.random() - 0.5) * 3),
                    size: (2 + Math.random() * 3) * perspectiveScale,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.5 + Math.random() * 0.5,
                });
            }
        }

        // Left stadium wall
        for (let row = 0; row < 12; row++) {
            const rowY = 10 + row * 5;
            const bombsInRow = Math.round((10 + row * 2) * density);
            for (let i = 0; i < bombsInRow; i++) {
                result.push({
                    x: 2 + i * 1.2 + Math.pow(row / 12, 1.5) * 10,
                    y: rowY + (Math.random() - 0.5) * 2,
                    size: 2.5 + Math.random() * 3,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.55 + Math.random() * 0.4,
                });
            }
        }

        // Right stadium wall
        for (let row = 0; row < 12; row++) {
            const rowY = 10 + row * 5;
            const bombsInRow = Math.round((10 + row * 2) * density);
            for (let i = 0; i < bombsInRow; i++) {
                result.push({
                    x: 98 - i * 1.2 - Math.pow(row / 12, 1.5) * 10,
                    y: rowY + (Math.random() - 0.5) * 2,
                    size: 2.5 + Math.random() * 3,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.55 + Math.random() * 0.4,
                });
            }
        }

        // Bottom crowd
        for (let row = 0; row < 10; row++) {
            const rowY = 72 + row * 2.5;
            const bombsInRow = Math.round((80 - row * 6) * density);
            const rowWidth = 95 - row * 7;
            for (let i = 0; i < bombsInRow; i++) {
                const xPercent = (50 - rowWidth / 2) + (i / (bombsInRow - 1)) * rowWidth;
                result.push({
                    x: xPercent + (Math.random() - 0.5) * 2,
                    y: rowY + (Math.random() - 0.5) * 1,
                    size: 5 + Math.random() * 4 - row * 0.2,
                    color: getColor(),
                    delay: Math.random() * 3,
                    brightness: 0.8 + Math.random() * 0.2,
                });
            }
        }

        return result.map(b => ({
            ...b,
            twinkleSpeed: 2 * Math.PI / (2.5 + (b.delay % 2.5)),
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        let resizeTimer: number | undefined;
        const onResize = () => {
            if (resizeTimer) window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(resize, 150);
        };
        window.addEventListener('resize', onResize);

        // Pre-render glow sprites per unique color (11 colors → 11 sprites)
        const glowSprites = new Map<string, HTMLCanvasElement>();
        const spriteSize = 64;

        const getSprite = (color: string) => {
            if (glowSprites.has(color)) return glowSprites.get(color)!;
            const s = document.createElement('canvas');
            s.width = spriteSize;
            s.height = spriteSize;
            const sctx = s.getContext('2d')!;
            const cx = spriteSize / 2;
            const grad = sctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
            grad.addColorStop(0, color);
            grad.addColorStop(0.2, color + 'CC');
            grad.addColorStop(0.5, color + '40');
            grad.addColorStop(1, 'transparent');
            sctx.fillStyle = grad;
            sctx.fillRect(0, 0, spriteSize, spriteSize);
            glowSprites.set(color, s);
            return s;
        };

        // Warm up sprite cache
        bombs.forEach(b => getSprite(b.color));

        let animId: number;
        const draw = (time: number) => {
            ctx.clearRect(0, 0, w, h);
            const t = time / 1000;

            // Read live audio bands once per frame from the ref.
            const audio = audioRef?.current;
            const bass = audio?.bass ?? 0;
            const treble = audio?.treble ?? 0;
            const isChorus = audio?.isChorus ?? false;

            // Smooth the bands so bombs SHINE with the song's energy instead
            // of jittering on every individual FFT frame.
            smoothedBassRef.current += (bass - smoothedBassRef.current) * 0.16;
            smoothedTrebleRef.current += (treble - smoothedTrebleRef.current) * 0.20;
            const sBass = smoothedBassRef.current;
            const sTreble = smoothedTrebleRef.current;

            // Real concert shine — bombs visibly grow and blaze with the
            // song's beat. Smoothed so it sustains as a swell rather than
            // jitters per kick. Chorus drops add a noticeable bonus.
            const beatScale = 1 + sBass * 0.55 + (isChorus ? 0.3 : 0);
            const beatBrightness = 1 + sBass * 1.1 + sTreble * 0.35 + (isChorus ? 0.5 : 0);

            // Crowd sway — slow horizontal wave that travels left → right
            // every ~3 seconds. Each bomb's brightness gently rises when the
            // wave passes its x position. Feels like fans swaying their
            // lightsticks in time, never harsh.
            const swayPhase = t * 0.6;
            const swayWavelength = 0.55;

            for (const bomb of bombs) {
                const twinkle = 0.5 + 0.5 * Math.sin((t + bomb.delay) * bomb.twinkleSpeed);
                const sway = 0.5 + 0.5 * Math.sin((bomb.x / 100) * Math.PI * 2 * swayWavelength - swayPhase);
                const swayBrightness = 0.78 + sway * 0.44;
                const alpha = Math.min(1, bomb.brightness * (0.4 + 0.6 * twinkle) * beatBrightness * swayBrightness);

                const px = (bomb.x / 100) * w;
                const swayBob = (sway - 0.5) * 4;
                const py = (bomb.y / 100) * h + swayBob;
                const drawSize = bomb.size * 5 * beatScale;

                ctx.globalAlpha = alpha;
                const sprite = getSprite(bomb.color);
                ctx.drawImage(sprite, px - drawSize / 2, py - drawSize / 2, drawSize, drawSize);
            }

            ctx.globalAlpha = 1;
            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animId);
            if (resizeTimer) window.clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
        };
    }, [bombs, audioRef]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default ArmyBombCanvas;
