import React, { useRef, useEffect, useMemo } from 'react';
import { generateStars } from '../../utils/helpers';

export interface StarFieldCanvasProps {
    mode: 'landing' | 'warp' | 'dashboard';
}

interface Star3D {
    x: number;
    y: number;
    z: number;
    size: number;
    color: string;
    delay: number;
}

export const StarFieldCanvas: React.FC<StarFieldCanvasProps> = ({ mode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angleRef = useRef(0);
    const lastTimeRef = useRef(0);

    const stars = useMemo<Star3D[]>(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const isLowPower = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) < 4;
        const starCount = isMobile || isLowPower ? 350 : 800;
        const rawStars = generateStars(starCount);
        return rawStars.map(s => ({
            x: s.r * Math.sin(s.phi) * Math.cos(s.theta),
            y: s.r * Math.sin(s.phi) * Math.sin(s.theta),
            z: s.r * Math.cos(s.phi),
            size: s.size,
            color: s.color,
            delay: s.delay,
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

        // Pre-render glow sprites per unique color
        const glowSprites = new Map<string, HTMLCanvasElement>();
        const spriteSize = 32;

        const getSprite = (color: string) => {
            if (glowSprites.has(color)) return glowSprites.get(color)!;
            const s = document.createElement('canvas');
            s.width = spriteSize;
            s.height = spriteSize;
            const sctx = s.getContext('2d')!;
            const cx = spriteSize / 2;
            const grad = sctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
            grad.addColorStop(0, color);
            grad.addColorStop(0.3, color + '80');
            grad.addColorStop(1, 'transparent');
            sctx.fillStyle = grad;
            sctx.fillRect(0, 0, spriteSize, spriteSize);
            glowSprites.set(color, s);
            return s;
        };

        stars.forEach(s => getSprite(s.color));

        const perspective = 1200;

        let animId: number;
        const draw = (time: number) => {
            // Track cumulative angle so mode transitions are smooth
            const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
            lastTimeRef.current = time;

            const spinDuration = mode === 'landing' ? 100 : 300;
            angleRef.current += (dt / spinDuration) * 2 * Math.PI;
            const angle = angleRef.current;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const scale = mode === 'warp' ? 8 : mode === 'dashboard' ? 0.95 : 1;

            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const elapsed = time / 1000;

            for (const star of stars) {
                // Rotate around Z axis (matches CSS spin)
                const rx = star.x * cos - star.y * sin;
                const ry = star.x * sin + star.y * cos;
                const rz = star.z;

                // Perspective projection
                const zOffset = perspective + rz * scale * 0.5;
                if (zOffset <= 0) continue;
                const projScale = perspective / zOffset;

                const px = cx + rx * projScale * scale * 0.5;
                const py = cy + ry * projScale * scale * 0.5;

                // Twinkle
                const twinkle = 0.5 + 0.5 * Math.sin((elapsed + star.delay) * (Math.PI / 2));

                const drawSize = star.size * projScale * 4;
                if (drawSize < 0.3) continue;

                ctx.globalAlpha = 0.8 * twinkle;
                const sprite = getSprite(star.color);
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
    }, [stars, mode]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default StarFieldCanvas;
