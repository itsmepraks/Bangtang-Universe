import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BTSLogo, ArmyBombCanvas } from '../visual';
import MemberSilhouette from '../visual/MemberSilhouette';

export interface LandingRitualProps {
    onSync: () => void;
}

const SILHOUETTE_CONFIGS = [
  { id: 'rm',    name: 'RM',     pose: 1 as const, delay: 0.0  },
  { id: 'jin',   name: 'Jin',    pose: 2 as const, delay: 0.35 },
  { id: 'suga',  name: 'Suga',   pose: 3 as const, delay: 0.70 },
  { id: 'jhope', name: 'J-Hope', pose: 4 as const, delay: 0.15 },
  { id: 'jimin', name: 'Jimin',  pose: 5 as const, delay: 0.50 },
  { id: 'v',     name: 'V',      pose: 6 as const, delay: 0.80 },
  { id: 'jk',    name: 'JK',     pose: 7 as const, delay: 0.25 },
] as const;

// Precomputed foreground army bomb orbs — large blurry bokeh simulating
// fans' army bombs held right next to the viewer (the "you're in the crowd" layer)
const FOREGROUND_BOMBS = [
  { x:  3, y:  2, size: 55, color: '#A855F7', blur: 18, opacity: 0.38, dur: 3.2, delay: 0.0 },
  { x:  9, y: 12, size: 42, color: '#8B5CF6', blur: 14, opacity: 0.28, dur: 2.8, delay: 0.8 },
  { x: 16, y:  3, size: 68, color: '#C084FC', blur: 22, opacity: 0.42, dur: 3.6, delay: 1.2 },
  { x: 23, y: 14, size: 38, color: '#9333EA', blur: 12, opacity: 0.24, dur: 2.4, delay: 0.4 },
  { x: 31, y:  6, size: 52, color: '#A855F7', blur: 16, opacity: 0.32, dur: 3.0, delay: 1.6 },
  { x: 40, y:  1, size: 75, color: '#D8B4FE', blur: 25, opacity: 0.20, dur: 4.0, delay: 2.0 },
  { x: 49, y:  9, size: 46, color: '#8B5CF6', blur: 15, opacity: 0.30, dur: 2.6, delay: 0.6 },
  { x: 58, y:  4, size: 62, color: '#C084FC', blur: 20, opacity: 0.36, dur: 3.4, delay: 1.0 },
  { x: 66, y: 13, size: 40, color: '#9333EA', blur: 13, opacity: 0.27, dur: 2.9, delay: 1.8 },
  { x: 74, y:  5, size: 56, color: '#A855F7', blur: 17, opacity: 0.33, dur: 3.1, delay: 0.3 },
  { x: 82, y:  1, size: 70, color: '#B47EE5', blur: 22, opacity: 0.37, dur: 3.7, delay: 1.4 },
  { x: 90, y: 10, size: 48, color: '#8B5CF6', blur: 16, opacity: 0.29, dur: 2.7, delay: 2.2 },
  { x: 96, y:  4, size: 58, color: '#C084FC', blur: 19, opacity: 0.34, dur: 3.3, delay: 0.9 },
] as const;

export const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
    // Enhanced UNIVERSE/GALAXY stars for cosmic backdrop
    const universeStars = useMemo(() => {
        const stars: { x: number; y: number; size: number; delay: number; duration: number; type: 'star' | 'galaxy' | 'nebula'; rotation?: number; baseOpacity?: number }[] = [];

        // Regular stars
        for (let i = 0; i < 80; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 0.5 + Math.random() * 1.5,
                delay: Math.random() * 5,
                duration: 3 + Math.random() * 4,
                type: 'star',
                baseOpacity: 0.4 + Math.random() * 0.4,
            });
        }

        // Distant galaxies (larger, dimmer, slower)
        for (let i = 0; i < 8; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 50, // Upper half only
                size: 3 + Math.random() * 4,
                delay: Math.random() * 8,
                duration: 8 + Math.random() * 6,
                type: 'galaxy',
                rotation: Math.random() * 60 - 30,
            });
        }

        // Small purple nebula spots
        for (let i = 0; i < 5; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 60,
                size: 15 + Math.random() * 20,
                delay: Math.random() * 10,
                duration: 15 + Math.random() * 10,
                type: 'nebula'
            });
        }

        return stars;
    }, []);

    const [hoveredMember, setHoveredMember] = useState<string | null>(null);

    return (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden select-none bg-gradient-to-b from-[#050010] via-[#0a0018] to-[#080012]">

            {/* UNIVERSE LAYER: Stars, Galaxies, and Nebulae */}
            <div className="absolute inset-0 pointer-events-none">
                {universeStars.map((star, i) => {
                    if (star.type === 'nebula') {
                        return (
                            <div
                                key={`nebula-${i}`}
                                className="absolute rounded-full"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    width: `${star.size}px`,
                                    height: `${star.size}px`,
                                    background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
                                    filter: 'blur(8px)',
                                    opacity: 0.6,
                                    animation: `nebula-breathe ${star.duration}s ease-in-out infinite`,
                                    animationDelay: `${star.delay}s`,
                                }}
                            />
                        );
                    }
                    if (star.type === 'galaxy') {
                        return (
                            <div
                                key={`galaxy-${i}`}
                                className="absolute"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    width: `${star.size}px`,
                                    height: `${star.size * 0.4}px`,
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(200,180,255,0.3) 30%, rgba(255,255,255,0.5) 50%, rgba(200,180,255,0.3) 70%, transparent 100%)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    opacity: 0.4,
                                    transform: `rotate(${star.rotation}deg)`,
                                    animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
                                    animationDelay: `${star.delay}s`,
                                }}
                            />
                        );
                    }
                    // Regular star
                    return (
                        <div
                            key={`star-${i}`}
                            className="absolute rounded-full bg-white"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                opacity: star.baseOpacity,
                                boxShadow: '0 0 2px rgba(255,255,255,0.8)',
                                animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    );
                })}
            </div>

            {/* NEBULA LAYER: Cosmic purple glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-purple-600/10 blur-[150px]"
                    style={{ animation: 'nebula-breathe 25s ease-in-out infinite' }}
                />
                <div
                    className="absolute top-[60%] left-[30%] w-[400px] h-[300px] rounded-full bg-violet-500/8 blur-[120px]"
                    style={{ animation: 'nebula-breathe 30s ease-in-out infinite', animationDelay: '-10s' }}
                />
                <div
                    className="absolute bottom-[10%] right-[20%] w-[500px] h-[300px] rounded-full bg-purple-700/10 blur-[130px]"
                    style={{ animation: 'nebula-breathe 28s ease-in-out infinite', animationDelay: '-18s' }}
                />
            </div>

            {/* Upper darkness gradient (stadium ceiling) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black to-transparent" />
            </div>

            {/* ARMY Bomb Ocean - Canvas-rendered for performance (replaces 2,684 divs) */}
            <ArmyBombCanvas />

            {/* Stage Spotlights */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-full h-[50%]">
                    {/* Central white beam */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[90%] opacity-15"
                        style={{
                            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 70%)',
                            filter: 'blur(25px)',
                        }}
                    />
                    {/* Side beams */}
                    {[-35, -20, -8, 8, 20, 35].map((angle, i) => (
                        <div
                            key={`beam-${i}`}
                            className="absolute bottom-0 left-1/2 w-3 h-[80%] opacity-8"
                            style={{
                                background: 'linear-gradient(to top, rgba(168,85,247,0.5) 0%, transparent 65%)',
                                filter: 'blur(12px)',
                                transform: `translateX(-50%) rotate(${angle}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* STADIUM SPOTLIGHT SYSTEM */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* TOP LIGHTING RIG */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%]">
                    <div className="absolute top-[1%] left-1/2 -translate-x-1/2 w-[90%] h-[2px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((offset, idx) => (
                        <div
                            key={`top-beam-${idx}`}
                            className="absolute top-0"
                            style={{
                                left: `calc(50% + ${offset * 1.8}%)`,
                                width: offset === 0 ? '8px' : '3px',
                                height: '100%',
                                background: offset === 0
                                    ? `linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 15%, rgba(200,200,255,0.3) 45%, transparent 75%)`
                                    : `linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(200,200,255,0.3) 15%, rgba(168,85,247,0.15) 40%, transparent 70%)`,
                                transform: `rotate(${offset * 0.25}deg)`,
                                transformOrigin: 'top center',
                                filter: offset === 0 ? 'blur(5px)' : 'blur(2px)',
                                opacity: offset === 0 ? 0.9 : 0.6,
                            }}
                        />
                    ))}
                </div>

                {/* LEFT SIDE SPOTLIGHTS */}
                <div className="absolute top-[10%] left-0 w-[50%] h-[60%]">
                    {[15, 25, 35].map((angle, idx) => (
                        <div
                            key={`left-beam-${idx}`}
                            className="absolute"
                            style={{
                                top: `${10 + idx * 15}%`,
                                left: '0',
                                width: '120%',
                                height: '4px',
                                background: 'linear-gradient(to right, rgba(168,85,247,0.4) 0%, rgba(200,200,255,0.2) 40%, transparent 80%)',
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: 'left center',
                                filter: 'blur(4px)',
                                opacity: 0.5,
                            }}
                        />
                    ))}
                </div>

                {/* RIGHT SIDE SPOTLIGHTS */}
                <div className="absolute top-[10%] right-0 w-[50%] h-[60%]">
                    {[-15, -25, -35].map((angle, idx) => (
                        <div
                            key={`right-beam-${idx}`}
                            className="absolute"
                            style={{
                                top: `${10 + idx * 15}%`,
                                right: '0',
                                width: '120%',
                                height: '4px',
                                background: 'linear-gradient(to left, rgba(168,85,247,0.4) 0%, rgba(200,200,255,0.2) 40%, transparent 80%)',
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: 'right center',
                                filter: 'blur(4px)',
                                opacity: 0.5,
                            }}
                        />
                    ))}
                </div>

                {/* STAGE FOCUS */}
                <div
                    className="absolute top-[35%] left-1/2 -translate-x-1/2"
                    style={{
                        width: '700px',
                        height: '300px',
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, rgba(200,200,255,0.1) 30%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Atmospheric haze */}
                <div
                    className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: '800px',
                        height: '250px',
                        background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 60%)',
                        filter: 'blur(50px)',
                    }}
                />
            </div>

      {/* ══════════════════════════════════════════
          CENTRAL STAGE BACKLIGHT BLOOM
          Creates the dramatic silhouette effect —
          bright light from behind the performers
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '420px',
          background: 'radial-gradient(ellipse at 50% 85%, rgba(255,255,255,0.22) 0%, rgba(220,200,255,0.14) 25%, rgba(168,85,247,0.07) 55%, transparent 75%)',
          filter: 'blur(28px)',
          zIndex: 3,
        }}
      />

      {/* ══════════════════════════════════════════
          BTS ARCH — glowing neon gate behind members
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 'calc(22% + 62px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}
      >
        <svg viewBox="0 0 320 240" width="320" height="240" style={{ overflow: 'visible' }}>
          {/* Outer glowing arch */}
          <path
            d="M 24 240 L 24 96 L 160 12 L 296 96 L 296 240"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.8"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(168,85,247,1)) drop-shadow(0 0 18px rgba(255,255,255,0.5))',
            }}
          />
          {/* Inner accent arch */}
          <path
            d="M 54 240 L 54 108 L 160 36 L 266 108 L 266 240"
            fill="none"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════════
          STAGE FLOOR
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(860px, 96%)',
          height: '68px',
          background: 'linear-gradient(180deg, rgba(160,130,255,0.07) 0%, rgba(80,40,140,0.04) 100%)',
          clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)',
          zIndex: 5,
        }}
      >
        {/* Front edge glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.9) 20%, rgba(255,255,255,0.75) 50%, rgba(168,85,247,0.9) 80%, transparent)',
          boxShadow: '0 0 16px rgba(168,85,247,0.65)',
        }} />
      </div>

      {/* ══════════════════════════════════════════
          7 MEMBER SILHOUETTES
      ══════════════════════════════════════════ */}
      <div
        className="absolute"
        style={{
          bottom: 'calc(22% + 62px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(2px, 1.8vw, 22px)',
          width: 'min(860px, 92%)',
          zIndex: 6,
        }}
      >
        {SILHOUETTE_CONFIGS.map((m) => {
          const isHovered = hoveredMember === m.id;
          return (
            <div
              key={m.id}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredMember(m.id)}
              onMouseLeave={() => setHoveredMember(null)}
              style={{
                transition: 'transform 0.35s ease',
                transform: isHovered ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
              }}
            >
              <MemberSilhouette
                pose={m.pose}
                size={150}
                delay={m.delay}
                glowing={isHovered}
              />
              {/* Name label */}
              <span style={{
                marginTop: '5px',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
                textShadow: isHovered ? '0 0 10px rgba(255,255,255,0.6)' : 'none',
                transition: 'all 0.35s ease',
                whiteSpace: 'nowrap',
              }}>
                {m.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          FOREGROUND ARMY BOMBS
          Large blurry bokeh = you're in the crowd
      ══════════════════════════════════════════ */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '18%', zIndex: 7 }}
      >
        {FOREGROUND_BOMBS.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              bottom: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background: `radial-gradient(circle, ${b.color} 0%, ${b.color}90 25%, ${b.color}30 55%, transparent 75%)`,
              filter: `blur(${b.blur}px)`,
              opacity: b.opacity,
              borderRadius: '50%',
              animation: `foreground-twinkle ${b.dur}s ease-in-out infinite`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>


            {/* TITLE - At top */}
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="text-center animate-in fade-in slide-in-from-top-8 duration-1000">
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-[0.1em] uppercase"
                        style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                            textShadow: '0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(168,85,247,0.3), 0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        Bangtan Universe
                    </h1>
                </div>
            </div>

            {/* ENTER THE UNIVERSE */}
            <div className="absolute top-[76%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
                {/* BTS Logo - Primary CTA */}
                <button
                    onClick={onSync}
                    className="relative w-16 h-16 flex items-center justify-center transition-all duration-700 cursor-pointer outline-none focus:outline-none select-none hover:scale-110 active:scale-95 group animate-in fade-in zoom-in-95 duration-1000"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="absolute inset-0 rounded-full bg-purple-500/25 blur-[18px] group-hover:bg-purple-400/45 transition-all duration-500" />
                    <div className="relative z-10 animate-[logo-glow_4s_infinite] group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] transition-all duration-500">
                        <BTSLogo className="w-10 h-10 text-white" />
                    </div>
                </button>

                {/* Enter The Universe */}
                <button
                    onClick={onSync}
                    className="flex items-center group cursor-pointer hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                >
                    <span
                        className="text-xs text-white/70 tracking-[0.3em] font-medium uppercase group-hover:text-white group-hover:tracking-[0.4em] transition-all duration-500"
                        style={{ textShadow: '0 0 15px rgba(168,85,247,0.4)' }}
                    >
                        Enter The Universe
                    </span>
                </button>

                <ChevronRight size={14} className="text-purple-400/50 animate-pulse rotate-90" />
            </div>

            {/* Bottom subtle vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default LandingRitual;
