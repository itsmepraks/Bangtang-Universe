import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BTSLogo, ArmyBombCanvas } from '../visual';

export interface LandingRitualProps {
    onSync: () => void;
}

// 7 BTS members — signature concert color, pulse delay, stage name
// Colors tuned for concert spotlight visibility and member identity
const MEMBERS = [
  { color: '#3B82F6', glow: '#60A5FA', delay: 0.00, name: 'RM'     },  // blue
  { color: '#F472B6', glow: '#FB7185', delay: 0.30, name: 'JIN'    },  // pink
  { color: '#CBD5E1', glow: '#E2E8F0', delay: 0.55, name: 'SUGA'   },  // silver
  { color: '#F8FAFC', glow: '#FFFFFF', delay: 0.15, name: 'J-HOPE' },  // white
  { color: '#FBBF24', glow: '#FCD34D', delay: 0.45, name: 'JIMIN'  },  // amber
  { color: '#34D399', glow: '#6EE7B7', delay: 0.70, name: 'V'      },  // green
  { color: '#A78BFA', glow: '#C4B5FD', delay: 0.25, name: 'JK'     },  // purple
] as const;

// Foreground army bomb orbs — purple ocean glow (you're in the crowd)
const FOREGROUND_BOMBS = [
  { x:  3, y:  2, size: 62, color: '#A855F7', blur: 20, opacity: 0.52, dur: 3.2, delay: 0.0 },
  { x:  9, y: 12, size: 50, color: '#8B5CF6', blur: 16, opacity: 0.42, dur: 2.8, delay: 0.8 },
  { x: 16, y:  3, size: 78, color: '#C084FC', blur: 24, opacity: 0.58, dur: 3.6, delay: 1.2 },
  { x: 23, y: 14, size: 44, color: '#9333EA', blur: 14, opacity: 0.38, dur: 2.4, delay: 0.4 },
  { x: 31, y:  6, size: 58, color: '#A855F7', blur: 18, opacity: 0.48, dur: 3.0, delay: 1.6 },
  { x: 40, y:  1, size: 85, color: '#D8B4FE', blur: 28, opacity: 0.35, dur: 4.0, delay: 2.0 },
  { x: 49, y:  9, size: 52, color: '#8B5CF6', blur: 17, opacity: 0.45, dur: 2.6, delay: 0.6 },
  { x: 58, y:  4, size: 70, color: '#C084FC', blur: 22, opacity: 0.52, dur: 3.4, delay: 1.0 },
  { x: 66, y: 13, size: 46, color: '#9333EA', blur: 15, opacity: 0.42, dur: 2.9, delay: 1.8 },
  { x: 74, y:  5, size: 64, color: '#A855F7', blur: 19, opacity: 0.48, dur: 3.1, delay: 0.3 },
  { x: 82, y:  1, size: 80, color: '#B47EE5', blur: 24, opacity: 0.55, dur: 3.7, delay: 1.4 },
  { x: 90, y: 10, size: 54, color: '#8B5CF6', blur: 18, opacity: 0.44, dur: 2.7, delay: 2.2 },
  { x: 96, y:  4, size: 66, color: '#C084FC', blur: 21, opacity: 0.50, dur: 3.3, delay: 0.9 },
] as const;

export const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
    const [focusedMember, setFocusedMember] = useState<string | null>(null);

    return (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden select-none bg-[#020008]">

            {/* Dark overlay — dim upper/sides, only stage + lower crowd glow visible */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(2,0,8,0.95) 0%, rgba(2,0,8,0.7) 25%, transparent 55%, transparent 100%)',
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(2,0,8,0.6) 0%, transparent 25%, transparent 75%, rgba(2,0,8,0.6) 100%)',
              }}
            />

            {/* ARMY Bomb Ocean — purple ocean glow (crowd light sticks) */}
            <div className="absolute inset-0" style={{ filter: 'brightness(1.4) saturate(1.15)' }}>
                <ArmyBombCanvas />
            </div>

      {/* ══════════════════════════════════════════
          LIGHTING RIG / TRUSS
          Matches stage width exactly — sleek
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 'calc(32% + 68px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(860px, 96%)',
          height: '4px',
          background: 'linear-gradient(180deg, rgba(80,80,100,0.85) 0%, rgba(40,40,55,0.9) 100%)',
          borderRadius: '1px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.5)',
          zIndex: 4,
        }}
      >
        {/* LED strip — same width as stage */}
        <div
          className="absolute inset-x-0 top-0 h-0.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #3B82F6 10%, #EC4899 25%, #94A3B8 40%, #F8FAFC 50%, #FBBF24 65%, #34D399 80%, #8B5CF6 90%, transparent 100%)',
            opacity: 0.85,
            animation: 'stage-led-shimmer 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════
          STAGE FLOOR — click to spotlight all (group mode)
          Softer edges, light blends into surface
      ══════════════════════════════════════════ */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: '32%',
          width: 'min(860px, 96%)',
          height: '68px',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={() => setFocusedMember(null)}
          className="absolute inset-0 w-full h-full cursor-pointer outline-none focus:outline-none select-none bg-transparent border-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Spotlight all members"
        />
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(100,70,160,0.12) 0%, rgba(70,40,120,0.08) 50%, rgba(40,20,80,0.04) 100%)',
            boxShadow: '0 0 40px 20px rgba(168,85,247,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 5%, #3B82F6 15%, #EC4899 28%, #94A3B8 42%, #F8FAFC 50%, #FBBF24 58%, #34D399 72%, #8B5CF6 85%, transparent 95%)',
              opacity: 0.7,
              filter: 'blur(1px)',
              animation: 'stage-led-shimmer 3.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MEMBER CONCERT SPOTLIGHTS
          Click member name to focus spotlight — show about to begin
      ══════════════════════════════════════════ */}
      <div
        className="absolute"
        style={{
          bottom: '32%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(8px, 2.5vw, 40px)',
          width: 'min(720px, 82%)',
          height: '480px',
          zIndex: 6,
        }}
      >
        {MEMBERS.map((m, i) => {
          const isFocused = focusedMember === m.name;
          const dimmed = focusedMember !== null && !isFocused;
          const opacity = dimmed ? 0.25 : (isFocused ? 1 : 0.9);
          return (
          <div
            key={i}
            style={{ position: 'relative', flexShrink: 0, width: '52px', height: '480px' }}
          >
            {/* Atmospheric cone — flows into stage */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '458px',
              background: `linear-gradient(to top,
                ${m.color}55 0%,
                ${m.color}44 25%,
                ${m.color}33 50%,
                ${m.color}22 75%,
                ${m.color}11 92%,
                transparent 100%)`,
              clipPath: 'polygon(25% 100%, 75% 100%, 52% 0%, 48% 0%)',
              filter: 'blur(20px)',
              opacity,
              transition: 'opacity 0.4s ease',
              animation: dimmed ? 'none' : `led-pulse ${3.2 + m.delay * 0.5}s ease-in-out infinite`,
              animationDelay: `${m.delay}s`,
            }} />
            {/* Core beam — extends into floor */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isFocused ? '48px' : '40px',
              height: '458px',
              background: `linear-gradient(to right,
                ${m.color}88 0%,
                ${m.color}66 18%,
                ${m.color}44 45%,
                ${m.color}44 55%,
                ${m.color}66 82%,
                ${m.color}88 100%)`,
              clipPath: 'polygon(30% 100%, 70% 100%, 52% 0%, 48% 0%)',
              filter: 'blur(5px)',
              opacity,
              transition: 'opacity 0.4s ease, width 0.4s ease',
              animation: dimmed ? 'none' : `spotlight-sweep ${3.2 + m.delay * 0.5}s ease-in-out infinite`,
              animationDelay: `${m.delay}s`,
            }} />
            {/* Floor pool — blends into stage, no hard edge */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isFocused ? '130px' : '110px',
              height: isFocused ? '56px' : '48px',
              background: `radial-gradient(ellipse 50% 40% at 50% 60%,
                ${m.color}44 0%,
                ${m.color}55 25%,
                ${m.color}44 50%,
                ${m.color}22 75%,
                transparent 100%)`,
              filter: 'blur(20px)',
              opacity,
              transition: 'opacity 0.4s ease',
              animation: dimmed ? 'none' : `led-pulse ${3.2 + m.delay * 0.5}s ease-in-out infinite`,
              animationDelay: `${m.delay}s`,
            }} />
            {/* Member name — clickable */}
            <button
              type="button"
              onClick={() => setFocusedMember(isFocused ? null : m.name)}
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer outline-none focus:outline-none select-none transition-all duration-300 hover:opacity-90"
              style={{
                bottom: '12px',
                fontSize: 'clamp(11px, 2.4vw, 13px)',
                fontWeight: '700',
                letterSpacing: '0.12em',
                color: m.glow,
                textShadow: `0 0 12px ${m.color}, 0 0 20px ${m.color}88, 0 1px 4px rgba(0,0,0,0.9)`,
                whiteSpace: 'nowrap',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                background: 'none',
                border: 'none',
                padding: 0,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {m.name}
            </button>
          </div>
        );
        })}
      </div>

      {/* ══════════════════════════════════════════
          FOREGROUND ARMY BOMBS — purple ocean glow
      ══════════════════════════════════════════ */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '24%', zIndex: 7 }}
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


            {/* TITLE — Bangtan Universe only */}
            <div className="absolute top-[6%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white/85 tracking-[0.12em] uppercase animate-in fade-in slide-in-from-top-8 duration-1000"
                    style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        textShadow: '0 0 16px rgba(168,85,247,0.3), 0 2px 8px rgba(0,0,0,0.5)'
                    }}
                >
                    Bangtan Universe
                </h1>
            </div>

            {/* ENTER THE UNIVERSE — CTA */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
                <button
                    onClick={onSync}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-500 cursor-pointer outline-none focus:outline-none select-none hover:scale-105 active:scale-95 group animate-in fade-in zoom-in-95 duration-1000"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-[16px] group-hover:bg-purple-400/35 transition-all duration-400" />
                    <div className="relative z-10 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-400">
                        <BTSLogo className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
                    </div>
                </button>
                <button
                    onClick={onSync}
                    className="flex items-center group cursor-pointer hover:opacity-100 transition-all duration-400 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                >
                    <span
                        className="text-xs sm:text-sm text-white/60 tracking-[0.3em] font-medium uppercase group-hover:text-white/90 transition-all duration-400"
                    >
                        Enter The Universe
                    </span>
                </button>
                <ChevronRight size={12} className="text-purple-400/40 animate-pulse rotate-90" />
            </div>

            {/* Bottom vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>
    );
};

export default LandingRitual;
