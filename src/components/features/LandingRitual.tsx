import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BTSLogo, ArmyBombCanvas } from '../visual';
import DancingFigure from '../visual/DancingFigure';

export interface LandingRitualProps {
    onSync: () => void;
}

const MEMBER_CONFIGS = [
  { id: 'rm',     name: 'RM',     color: '#3B82F6', variant: 'a' as const, delay: 0.0  },
  { id: 'jin',    name: 'Jin',    color: '#EC4899', variant: 'b' as const, delay: 0.18 },
  { id: 'suga',   name: 'Suga',   color: '#94A3B8', variant: 'c' as const, delay: 0.35 },
  { id: 'jhope',  name: 'J-Hope', color: '#FFFFFF', variant: 'a' as const, delay: 0.52 },
  { id: 'jimin',  name: 'Jimin',  color: '#F59E0B', variant: 'b' as const, delay: 0.28 },
  { id: 'v',      name: 'V',      color: '#10B981', variant: 'c' as const, delay: 0.44 },
  { id: 'jk',     name: 'JK',     color: '#8B5CF6', variant: 'a' as const, delay: 0.12 },
];

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
          CONCERT STAGE
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(1100px, 100%)',
        }}
      >
        {/* ── Back wall ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '78%',
            height: '190px',
            background: 'linear-gradient(180deg, #0a0015 0%, #100020 100%)',
            borderTop: '1px solid rgba(168,85,247,0.2)',
            borderLeft: '1px solid rgba(168,85,247,0.1)',
            borderRight: '1px solid rgba(168,85,247,0.1)',
          }}
        >
          {/* Left LED screen */}
          <div style={{
            position: 'absolute', left: '24px', top: '12px',
            width: '110px', height: '165px',
            background: 'linear-gradient(160deg, #2d0050 0%, #1a0035 100%)',
            border: '2px solid rgba(168,85,247,0.45)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.45) 50%, transparent 100%)',
              backgroundSize: '100% 30px',
              animation: 'scanline 2.4s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(160deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)',
              animation: 'led-pulse 3s ease-in-out infinite',
            }} />
          </div>

          {/* Right LED screen */}
          <div style={{
            position: 'absolute', right: '24px', top: '12px',
            width: '110px', height: '165px',
            background: 'linear-gradient(200deg, #2d0050 0%, #1a0035 100%)',
            border: '2px solid rgba(168,85,247,0.45)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.45) 50%, transparent 100%)',
              backgroundSize: '100% 30px',
              animation: 'scanline 2.4s linear infinite',
              animationDelay: '-1.2s',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(200deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)',
              animation: 'led-pulse 3s ease-in-out infinite',
              animationDelay: '-1.5s',
            }} />
          </div>

          {/* Center banner screen */}
          <div style={{
            position: 'absolute', left: '50%', top: '12px',
            transform: 'translateX(-50%)',
            width: '38%', height: '130px',
            background: 'linear-gradient(180deg, #1a0030 0%, #0d001e 100%)',
            border: '2px solid rgba(168,85,247,0.25)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <span style={{
              color: 'rgba(168,85,247,0.5)',
              fontSize: '13px',
              letterSpacing: '0.35em',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontWeight: 700,
              animation: 'led-pulse 4s ease-in-out infinite',
            }}>
              BTS
            </span>
            {/* Shimmer sweep */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.12) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'stage-shimmer 3s linear infinite',
            }} />
          </div>

          {/* Left speaker stack */}
          <div style={{
            position: 'absolute', left: '142px', top: '20px',
            width: '38px', height: '155px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1f 100%)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: '3px',
            animation: 'truss-glow 4s ease-in-out infinite',
          }} />

          {/* Right speaker stack */}
          <div style={{
            position: 'absolute', right: '142px', top: '20px',
            width: '38px', height: '155px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1f 100%)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: '3px',
            animation: 'truss-glow 4s ease-in-out infinite',
            animationDelay: '-2s',
          }} />
        </div>

        {/* ── Stage floor (trapezoid via clip-path) ── */}
        <div style={{
          position: 'relative',
          height: '120px',
          background: 'linear-gradient(180deg, #1e1a35 0%, #0d0d1f 100%)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
        }}>
          {/* Subtle grid lines on floor */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(168,85,247,0.06) 60px)',
            clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
          }} />
          {/* Front edge purple glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.85) 20%, rgba(255,255,255,0.7) 50%, rgba(168,85,247,0.85) 80%, transparent 100%)',
            boxShadow: '0 0 18px rgba(168,85,247,0.6)',
          }} />
          {/* Floor shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.05), transparent)',
            backgroundSize: '200% 100%',
            animation: 'stage-shimmer 4s linear infinite',
          }} />
        </div>

        {/* Catwalk (narrow forward strip) */}
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '32px',
          background: 'linear-gradient(180deg, #1e1a35 0%, #0d0d1f 100%)',
          borderLeft: '1px solid rgba(168,85,247,0.2)',
          borderRight: '1px solid rgba(168,85,247,0.2)',
          borderBottom: '2px solid rgba(168,85,247,0.5)',
        }} />
      </div>

      {/* ══════════════════════════════════════════
          7 DANCING MEMBERS ON STAGE
      ══════════════════════════════════════════ */}
      <div
        className="absolute z-10"
        style={{
          bottom: 'calc(18% + 118px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(4px, 2vw, 28px)',
          width: 'min(900px, 90%)',
        }}
      >
        {MEMBER_CONFIGS.map((m) => {
          const isHovered = hoveredMember === m.id;
          return (
            <div
              key={m.id}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredMember(m.id)}
              onMouseLeave={() => setHoveredMember(null)}
              style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.12) translateY(-6px)' : 'scale(1)' }}
            >
              {/* Spotlight cone when hovered */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '120px',
                    background: `linear-gradient(to top, ${m.color}30, transparent)`,
                    clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Dancer */}
              <DancingFigure
                color={m.color}
                variant={m.variant}
                delay={m.delay}
                speed={isHovered ? 1.5 : 1}
                size={110}
                glowing={isHovered}
              />

              {/* Name label */}
              <span
                style={{
                  marginTop: '6px',
                  fontSize: isHovered ? '11px' : '9px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: m.color,
                  textShadow: isHovered
                    ? `0 0 8px ${m.color}, 0 0 16px ${m.color}cc`
                    : `0 0 6px ${m.color}80`,
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.name}
              </span>
            </div>
          );
        })}
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
