import React, { useRef, useEffect, useMemo } from 'react';

interface Bomb {
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    brightness: number;
    twinkleSpeed: number;
}

export const ArmyBombCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const bombs = useMemo<Bomb[]>(() => {
        const result: Omit<Bomb, 'twinkleSpeed'>[] = [];

        const colors = [
            '#A855F7', '#9333EA', '#7C3AED', '#8B5CF6', '#C084FC', '#B47EE5',
            '#D8B4FE', '#E9D5FF', '#F3E8FF',
            '#FFFFFF', '#F5F3FF',
        ];

        const getColor = () => {
            const rand = Math.random();
            if (rand < 0.88) return colors[Math.floor(Math.random() * 9)];
            return colors[9 + Math.floor(Math.random() * 2)];
        };

        // 180-degree semicircle
        const numArcs = 20;
        for (let arc = 0; arc < numArcs; arc++) {
            const radiusPercent = 15 + arc * 4;
            const baseY = 35 - arc * 1.5;
            const pointsInArc = 35 + arc * 5;
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
            const bombsInRow = 10 + row * 2;
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
            const bombsInRow = 10 + row * 2;
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
            const bombsInRow = 80 - row * 6;
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
        window.addEventListener('resize', resize);

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

            for (const bomb of bombs) {
                const twinkle = 0.5 + 0.5 * Math.sin((t + bomb.delay) * bomb.twinkleSpeed);
                const alpha = bomb.brightness * (0.3 + 0.7 * twinkle);

                const px = (bomb.x / 100) * w;
                const py = (bomb.y / 100) * h;
                const drawSize = bomb.size * 5;

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
            window.removeEventListener('resize', resize);
        };
    }, [bombs]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default ArmyBombCanvas;
