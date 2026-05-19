import React, { useState, useEffect } from 'react';
import { ChevronRight, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { BTSLogo, ArmyBombCanvas } from '../visual';
import { MEMBER_STAGE_LIGHTS, PURPLE_OCEAN } from '../../constants/colors';
import { useConcertBeat } from '../../hooks';

export interface LandingRitualProps {
    onSync: () => void;
}

// Signature concert lighting + pulse delays for the 7 spotlight columns.
// Colors come from the shared MEMBER_STAGE_LIGHTS token (constants/colors.ts).
const MEMBERS = [
  { ...MEMBER_STAGE_LIGHTS.RM,     delay: 0.00, name: 'RM',     short: 'RM'  },
  { ...MEMBER_STAGE_LIGHTS.JIN,    delay: 0.30, name: 'JIN',    short: 'JIN' },
  { ...MEMBER_STAGE_LIGHTS.SUGA,   delay: 0.55, name: 'SUGA',   short: 'SG'  },
  { ...MEMBER_STAGE_LIGHTS.J_HOPE, delay: 0.15, name: 'J-HOPE', short: 'JH'  },
  { ...MEMBER_STAGE_LIGHTS.JIMIN,  delay: 0.45, name: 'JIMIN',  short: 'JM'  },
  { ...MEMBER_STAGE_LIGHTS.V,      delay: 0.70, name: 'V',      short: 'V'   },
  { ...MEMBER_STAGE_LIGHTS.JK,     delay: 0.25, name: 'JK',     short: 'JK'  },
] as const;

// Purple-ocean glow orbs — simulates the crowd's army bombs seen from stage.
// Colors come from the shared PURPLE_OCEAN palette so the landing stays in
// the brand's purple/lavender range.
const FOREGROUND_BOMBS = [
  { x:  3, y:  2, size: 62, color: PURPLE_OCEAN.PRIMARY,  blur: 20, opacity: 0.52, dur: 3.2, delay: 0.0 },
  { x:  9, y: 12, size: 50, color: PURPLE_OCEAN.MID,      blur: 16, opacity: 0.42, dur: 2.8, delay: 0.8 },
  { x: 16, y:  3, size: 78, color: PURPLE_OCEAN.VIOLET,   blur: 24, opacity: 0.58, dur: 3.6, delay: 1.2 },
  { x: 23, y: 14, size: 44, color: PURPLE_OCEAN.DEEP,     blur: 14, opacity: 0.38, dur: 2.4, delay: 0.4 },
  { x: 31, y:  6, size: 58, color: PURPLE_OCEAN.PRIMARY,  blur: 18, opacity: 0.48, dur: 3.0, delay: 1.6 },
  { x: 40, y:  1, size: 85, color: PURPLE_OCEAN.LIGHT,    blur: 28, opacity: 0.35, dur: 4.0, delay: 2.0 },
  { x: 49, y:  9, size: 52, color: PURPLE_OCEAN.MID,      blur: 17, opacity: 0.45, dur: 2.6, delay: 0.6 },
  { x: 58, y:  4, size: 70, color: PURPLE_OCEAN.VIOLET,   blur: 22, opacity: 0.52, dur: 3.4, delay: 1.0 },
  { x: 66, y: 13, size: 46, color: PURPLE_OCEAN.DEEP,     blur: 15, opacity: 0.42, dur: 2.9, delay: 1.8 },
  { x: 74, y:  5, size: 64, color: PURPLE_OCEAN.PRIMARY,  blur: 19, opacity: 0.48, dur: 3.1, delay: 0.3 },
  { x: 82, y:  1, size: 80, color: PURPLE_OCEAN.LAVENDER, blur: 24, opacity: 0.55, dur: 3.7, delay: 1.4 },
  { x: 90, y: 10, size: 54, color: PURPLE_OCEAN.MID,      blur: 18, opacity: 0.44, dur: 2.7, delay: 2.2 },
  { x: 96, y:  4, size: 66, color: PURPLE_OCEAN.VIOLET,   blur: 21, opacity: 0.50, dur: 3.3, delay: 0.9 },
] as const;

export const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
    const [focusedMember, setFocusedMember] = useState<typeof MEMBERS[number]['name'] | null>(null);
    const {
        pulse, bass, mid, treble, isChorus, audioOn, audioSource,
        currentTrack, playlist, currentIndex, beatRef,
        chantPhase, chantMember, chantStep,
        strobeId,
        start: startAudio, stop: stopAudio, skip: skipTrack,
    } = useConcertBeat();

    // During the chant, the spotlight focus is driven by the hook instead
    // of the user's click. ALL means every spotlight blooms together.
    const isChanting = chantPhase === 'running';
    const chantFocusName = chantMember && chantMember !== 'ALL' ? chantMember : null;
    const effectiveFocused = isChanting ? chantFocusName : focusedMember;
    const chantAllBright = chantMember === 'ALL';

    // Map chant beat → that member's color so we can flash the whole stage
    // in their signature shade. ALL beat gets the full rainbow.
    const chantFlashMember = isChanting
        ? MEMBERS.find((m) => m.name === chantMember) ?? null
        : null;
    const chantFlashGradient = chantAllBright
        ? 'radial-gradient(ellipse 120% 90% at 50% 55%, rgba(255,255,255,0.95) 0%, rgba(168,85,247,0.7) 25%, rgba(236,72,153,0.5) 50%, rgba(59,130,246,0.35) 70%, transparent 90%)'
        : chantFlashMember
            ? `radial-gradient(ellipse 100% 80% at 50% 55%, ${chantFlashMember.glow}cc 0%, ${chantFlashMember.color}80 25%, ${chantFlashMember.color}30 55%, transparent 80%)`
            : null;

    // Find the spoken name for the current chant beat (for the overlay text)
    const CHANT_DISPLAY: Record<string, string> = {
        RM: 'Kim Namjoon',
        JIN: 'Kim Seokjin',
        SUGA: 'Min Yoongi',
        'J-HOPE': 'Jung Hoseok',
        JIMIN: 'Park Jimin',
        V: 'Kim Taehyung',
        JK: 'Jeon Jungkook',
        ALL: 'BTS',
    };
    const chantOverlayText = chantMember ? CHANT_DISPLAY[chantMember] : null;

    // Concert-vibe beat envelope. Wider range so spotlights visibly swell
    // and recede with every kick of the song. Still smooth — uses the
    // mid-frequency band as a baseline lift so the stage glows through
    // vocal sections too.
    const beatIntensity = audioSource === 'streamed'
        ? 0.5 + 0.55 * Math.min(1, bass * 1.6) + mid * 0.1
        : 0.7 + 0.3 * pulse;

    // Mid frequencies (vocals/melody) modulate the core beam width
    const beamWidthBoost = audioSource === 'streamed' ? mid * 0.35 : 0;

    // Treble (hi-hats/snares) gives the ARMY bomb canvas a tiny shimmer
    const armyBombBoost = audioSource === 'streamed' ? 1 + treble * 0.35 : 1;

    // Spotlight follows the "singer" — a lighting director holds the
    // spotlight on a member for a full section (~5s) rather than flicking
    // between them every kick. Advances on detected chorus drops AND on a
    // slow 5-second internal clock, whichever comes first.
    const isPlayingSong = audioSource === 'streamed' && !isChanting;
    const [leadIndex, setLeadIndex] = useState(0);
    useEffect(() => {
        if (!isPlayingSong) return;
        const interval = window.setInterval(() => {
            setLeadIndex((i) => (i + 1) % MEMBERS.length);
        }, 5200);
        return () => window.clearInterval(interval);
    }, [isPlayingSong]);
    useEffect(() => {
        // Sudden jumps to a new member on chorus drops — feels like the
        // director "throwing" the spotlight at someone for the big moment.
        // The setState is intentional and gated on strobeId/isPlayingSong
        // deps, so this isn't a cascading-renders bug.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isPlayingSong && strobeId > 0) setLeadIndex((i) => (i + 1) % MEMBERS.length);
    }, [strobeId, isPlayingSong]);
    const leadMemberName = isPlayingSong ? MEMBERS[leadIndex].name : null;

    // Chorus flash — fires when bass + treble drop together during streaming,
    // every 8th beat of the fallback metronome, OR on the final chant beat.
    const chorusFlash = (isChorus || chantAllBright) ? 1 : 0;

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

            {/* ARMY Bomb Ocean — purple ocean glow (crowd light sticks).
                Stays in the ARMY palette: purple, lavender, and white only.
                Brightness/saturation ride bass + treble for the shimmer. */}
            <div
                className="absolute inset-0"
                style={{
                    filter: `brightness(${1.4 * armyBombBoost}) saturate(${1.15 + treble * 0.4})`,
                    transition: 'filter 60ms linear',
                }}
            >
                <ArmyBombCanvas audioRef={beatRef} />
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
          height: 'clamp(48px, 8vh, 68px)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={() => setFocusedMember(null)}
          className="absolute inset-0 w-full h-full cursor-pointer select-none bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Spotlight all members"
        />
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(180deg, rgba(100,70,160,${0.12 + bass * 0.18}) 0%, rgba(70,40,120,${0.08 + bass * 0.12}) 50%, rgba(40,20,80,0.04) 100%)`,
            boxShadow: `0 0 ${40 + bass * 60}px ${20 + bass * 30}px rgba(168,85,247,${0.06 + bass * 0.18}), inset 0 1px 0 rgba(255,255,255,${0.03 + bass * 0.1})`,
            transition: 'box-shadow 60ms linear, background 60ms linear',
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${1 + bass * 3}px`,
              background: 'linear-gradient(90deg, transparent 5%, #3B82F6 15%, #EC4899 28%, #94A3B8 42%, #F8FAFC 50%, #FBBF24 58%, #34D399 72%, #8B5CF6 85%, transparent 95%)',
              opacity: Math.min(1, 0.7 + bass * 0.4),
              filter: `blur(${1 + bass * 1.5}px) brightness(${1 + bass * 0.6})`,
              transition: 'height 60ms linear, opacity 60ms linear, filter 60ms linear',
              animation: 'stage-led-shimmer 3.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MEMBER CONCERT SPOTLIGHTS
          Click member name to focus spotlight — show about to begin

          Beams fade out near the top via a maskImage so they don't
          collide with the BANGTAN UNIVERSE title.
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
          gap: 'clamp(3px, 2vw, 40px)',
          width: 'min(720px, 90%)',
          height: 'clamp(220px, 44vh, 380px)',
          zIndex: 6,
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 14%, black 32%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 14%, black 32%, black 100%)',
        }}
      >
        {MEMBERS.map((m) => {
          const isFocused = effectiveFocused === m.name;
          // On the "ALL" beat at the end of the chant, every spotlight blooms.
          const dimmed = !chantAllBright && effectiveFocused !== null && !isFocused;
          // During songs, the "lead" member chases each detected kick —
          // gets full brightness while others sit at 0.55 baseline.
          const isLead = leadMemberName === m.name;
          // Gentle contrast — lead sits at 1.0, others at 0.75 (not dark).
          // Reads as "spotlight on the singer" without making non-leads
          // look extinguished.
          const baseOpacity = dimmed
            ? 0.18
            : isFocused || chantAllBright
              ? 1
              : isLead
                ? 1.0
                : isPlayingSong
                  ? 0.75
                  : 0.9;
          const opacity = baseOpacity * beatIntensity;
          const leadScale = isLead && isPlayingSong ? 1.04 : 1;
          const animDur = `${3.2 + m.delay * 0.5}s`;
          return (
          <div
            key={m.name}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: 'clamp(32px, 7vw, 52px)',
              height: '100%',
            }}
          >
          {/* Beam scale wrapper — lifts the lead spotlight a touch. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${leadScale})`,
              transformOrigin: 'bottom center',
              transition: 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              pointerEvents: 'none',
            }}
          >
            {/* Atmospheric cone — flows into stage */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(70px, 15vw, 120px)',
              height: 'calc(100% - 22px)',
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
              animation: dimmed ? 'none' : `led-pulse ${animDur} ease-in-out ${m.delay}s infinite`,
            }} />
            {/* Core beam — extends into floor.
                Width grows slightly with the mid-frequency content (vocals / melody)
                so beams visibly "breathe" with the song. */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: `translateX(-50%) scaleX(${1 + beamWidthBoost})`,
              width: isFocused ? 'clamp(28px, 6vw, 48px)' : 'clamp(24px, 5vw, 40px)',
              height: 'calc(100% - 22px)',
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
              transition: 'opacity 0.4s ease, transform 60ms linear',
              animation: dimmed ? 'none' : `spotlight-sweep ${animDur} ease-in-out ${m.delay}s infinite`,
            }} />
            {/* Floor pool — blends into stage, no hard edge */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isFocused ? 'clamp(70px, 16vw, 130px)' : 'clamp(60px, 14vw, 110px)',
              height: isFocused ? 'clamp(32px, 7vh, 56px)' : 'clamp(28px, 6vh, 48px)',
              background: `radial-gradient(ellipse 50% 40% at 50% 60%,
                ${m.color}44 0%,
                ${m.color}55 25%,
                ${m.color}44 50%,
                ${m.color}22 75%,
                transparent 100%)`,
              filter: 'blur(20px)',
              opacity,
              transition: 'opacity 0.4s ease',
              animation: dimmed ? 'none' : `led-pulse ${animDur} ease-in-out ${m.delay}s infinite`,
            }} />
          </div>
            {/* Member name — clickable. */}
            <button
              type="button"
              onClick={() => setFocusedMember(isFocused ? null : m.name)}
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer select-none transition-opacity duration-300 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
              style={{
                bottom: '0px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '44px',
                paddingBottom: '4px',
                fontSize: 'clamp(11px, 2.4vw, 13px)',
                fontWeight: '700',
                letterSpacing: '0.12em',
                color: m.glow,
                // Each label's halo grows with bass — colored, member-specific.
                textShadow: `0 0 ${12 + bass * 18}px ${m.color}, 0 0 ${20 + bass * 30}px ${m.color}${dimmed ? '44' : 'cc'}, 0 1px 4px rgba(0,0,0,0.9)`,
                transition: 'text-shadow 60ms linear',
                whiteSpace: 'nowrap',
                fontFamily: "var(--font-display)",
                background: 'none',
                border: 'none',
                padding: '0 0 4px 0',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span className="sm:hidden">{m.short}</span>
              <span className="hidden sm:inline">{m.name}</span>
            </button>
          </div>
        );
        })}
      </div>

      {/* ══════════════════════════════════════════
          FOREGROUND ARMY BOMBS — purple ocean glow.
          Scale + opacity ride the bass band so the crowd visibly "lifts"
          their light sticks on every kick drum. Treble adds a quick shimmer.
          Stays in the ARMY palette (purple / lavender / white) — no member
          color tinting.
      ══════════════════════════════════════════ */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '24%', zIndex: 7 }}
      >
        {FOREGROUND_BOMBS.map((b, i) => {
          // Each bomb gets a slightly different phase based on its index so the
          // crowd response isn't perfectly uniform — feels like real people.
          // Real-concert-shine multipliers: visible scale + brightness lift
          // with every kick, even more on chorus drops.
          const phase = (i % 5) * 0.04;
          const beatScale = 1 + bass * (0.7 + phase) + (isChorus ? 0.25 : 0);
          const beatGlow = 1 + bass * 1.1 + treble * 0.4 + (isChorus ? 0.7 : 0);
          return (
            <div
              key={b.x}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                bottom: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                background: `radial-gradient(circle, ${b.color} 0%, ${b.color}90 25%, ${b.color}30 55%, transparent 75%)`,
                filter: `blur(${b.blur}px) brightness(${beatGlow})`,
                opacity: Math.min(1, b.opacity * beatGlow),
                borderRadius: '50%',
                transform: `scale(${beatScale})`,
                transformOrigin: 'center',
                transition: 'transform 60ms linear, opacity 60ms linear, filter 60ms linear',
                animation: `foreground-twinkle ${b.dur}s ease-in-out ${b.delay}s infinite`,
              }}
            />
          );
        })}
      </div>

            {/* CHORUS FLASH — stadium-wide burst on a real drop (bass + treble
                simultaneously spike). Two layers stacked: a tight white core +
                a wider purple wash. Both decay over ~600ms. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-[7] transition-opacity duration-[600ms] ease-out"
              style={{
                opacity: chorusFlash * 0.35,
                background: 'radial-gradient(ellipse 70% 60% at 50% 60%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 15%, rgba(216,180,254,0.5) 40%, transparent 75%)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-[7] transition-opacity duration-[800ms] ease-out"
              style={{
                opacity: chorusFlash * 0.22,
                background: 'radial-gradient(ellipse 120% 100% at 50% 50%, rgba(168,85,247,0.6) 0%, rgba(236,72,153,0.3) 40%, transparent 80%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* TITLE — Bangtan Universe only */}
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                {/* Soft backdrop pill — keeps the title legible against the beams */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -inset-x-12 -inset-y-3 -z-10 rounded-full"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(2,0,8,0.85) 0%, rgba(2,0,8,0.55) 40%, transparent 75%)',
                        filter: 'blur(8px)',
                    }}
                />
                <h1
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white/90 tracking-[0.12em] uppercase animate-in fade-in slide-in-from-top-8 duration-1000"
                    style={{
                        fontFamily: "var(--font-display)",
                        // Static glow — used to scale + pulse with the bass band,
                        // but per-user request the title shouldn't move or change
                        // once it's landed.
                        textShadow: '0 0 16px rgba(236,72,153,0.3), 0 0 32px rgba(139,92,246,0.2), 0 2px 8px rgba(0,0,0,0.7)',
                    }}
                >
                    Bangtan Universe
                </h1>
                <p
                    className="text-xs sm:text-sm text-white/55 tracking-[0.25em] uppercase text-center mt-2 animate-in fade-in duration-1000 delay-300"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    The music. The moments. The data.
                </p>
            </div>

            {/* CHANT COLOR FLASH — radial wash of the current member's color
                that fires on each chant beat. Re-mounts per beat via the
                chantStep key so the @keyframes restarts cleanly. */}
            {isChanting && chantFlashGradient && (
                <div
                    key={`chant-flash-${chantStep}`}
                    aria-hidden="true"
                    className="absolute inset-0 z-[16] pointer-events-none"
                    style={{
                        background: chantFlashGradient,
                        mixBlendMode: 'screen',
                        animation: chantAllBright
                            ? 'chant-flash 1400ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards'
                            : 'chant-flash 720ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards',
                    }}
                />
            )}

            {/* CHANT NAME OVERLAY — large centered label that announces each
                member as the chant calls their name. Sits dead-center so it's
                impossible to miss. Hidden when no chant is active. */}
            {isChanting && chantOverlayText && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 z-[18] pointer-events-none flex flex-col items-center justify-center"
                >
                    <div
                        className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/50 mb-4 font-medium"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {chantAllBright ? 'Together' : 'Now calling'}
                    </div>
                    <div
                        key={chantOverlayText}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.16em] uppercase text-white animate-in fade-in zoom-in-75 duration-300"
                        style={{
                            fontFamily: "var(--font-display)",
                            textShadow: chantAllBright
                                ? '0 0 40px rgba(168,85,247,1), 0 0 80px rgba(236,72,153,0.9), 0 0 120px rgba(255,255,255,0.7), 0 4px 16px rgba(0,0,0,0.9)'
                                : '0 0 28px rgba(255,255,255,0.85), 0 0 64px rgba(168,85,247,0.7), 0 4px 16px rgba(0,0,0,0.9)',
                            transform: chantAllBright ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform 140ms ease-out',
                        }}
                    >
                        {chantOverlayText}
                    </div>
                </div>
            )}

            {/* SOUND TOGGLE + SKIP — top-right.
                Browsers block autoplay, so the user has to opt in. Skip cycles
                through the playlist. */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-2 pointer-events-auto">
                <button
                    onClick={() => (audioOn ? stopAudio() : void startAudio())}
                    aria-pressed={audioOn}
                    aria-label={audioOn ? 'Mute concert audio' : 'Play concert audio'}
                    title={
                        audioOn && audioSource === 'streamed' && currentTrack?.trackName
                            ? `Playing: ${currentTrack.trackName} (30-second preview via Apple)`
                            : audioOn
                                ? 'Mute'
                                : 'Tap for sound — plays a set of BTS tracks'
                    }
                    className="relative flex items-center gap-2 px-3 min-h-[44px] rounded-full bg-white/[0.04] border border-white/[0.10] backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors max-w-[260px]"
                >
                    {audioOn ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium hidden sm:inline truncate">
                        {audioOn
                            ? audioSource === 'chant'
                                ? 'Calling the roll'
                                : audioSource === 'streamed' && currentTrack?.trackName
                                    ? currentTrack.trackName
                                    : 'Sound on'
                            : 'Tap for sound'}
                    </span>
                    {audioOn && audioSource === 'streamed' && playlist.length > 1 && (
                        <span className="text-[9px] text-white/40 tabular-nums hidden sm:inline">
                            {currentIndex + 1}/{playlist.length}
                        </span>
                    )}
                    {!audioOn && (
                        <span className="absolute -inset-1 rounded-full bg-purple-400/20 animate-ping pointer-events-none" aria-hidden="true" />
                    )}
                </button>
                {audioOn && (audioSource === 'chant' || (audioSource === 'streamed' && playlist.length > 1)) && (
                    <button
                        onClick={() => void skipTrack()}
                        aria-label={audioSource === 'chant' ? 'Skip chant intro' : 'Skip to next track'}
                        title={audioSource === 'chant' ? 'Skip to first song' : 'Next track'}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-white/[0.04] border border-white/[0.10] backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                        <SkipForward size={14} aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* ENTER THE UNIVERSE — CTA */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
                <button
                    onClick={() => { if (!audioOn) void startAudio(); onSync(); }}
                    aria-label="Enter Bangtan Universe"
                    className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-500 cursor-pointer select-none hover:scale-105 active:scale-95 group animate-in fade-in zoom-in-95 duration-1000 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-[16px] group-hover:from-purple-400/35 group-hover:to-pink-400/35 transition-[background,filter] duration-400" />
                    <div className="relative z-10 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-[filter] duration-400">
                        <BTSLogo className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
                    </div>
                </button>
                <button
                    onClick={() => { if (!audioOn) void startAudio(); onSync(); }}
                    className="flex items-center group cursor-pointer hover:opacity-100 transition-opacity duration-400 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                >
                    <span
                        className="text-xs sm:text-sm text-white/60 tracking-[0.3em] font-medium uppercase group-hover:text-white/90 transition-colors duration-400"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Enter The Universe
                    </span>
                </button>
                <ChevronRight size={12} className="text-pink-400/40 animate-pulse rotate-90" aria-hidden="true" />
            </div>

            {/* Audio attribution — chant is embedded from YouTube; song
                snippets are 30-second previews fetched from Apple's public
                iTunes Search API. Kept small + dim so it sits with the
                vignette without competing with the CTA. */}
            <p
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-center text-[10px] sm:text-[11px] text-white/45 tracking-wide pointer-events-none px-3 max-w-[min(640px,92%)]"
                style={{ fontFamily: "var(--font-display)" }}
            >
                Chant via YouTube · 30s song previews via Apple iTunes Search · Fan project, not affiliated with HYBE or BIGHIT MUSIC
            </p>

            {/* Bottom vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>
    );
};

export default LandingRitual;
