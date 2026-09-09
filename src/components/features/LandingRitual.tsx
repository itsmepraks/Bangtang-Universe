import React, { useState } from 'react';
import { ChevronRight, Volume2, VolumeX, SkipForward, Pause, Play } from 'lucide-react';
import { BTSLogo } from '../visual';
import { MEMBER_STAGE_LIGHTS } from '../../constants/colors';
import { useConcertBeat } from '../../hooks';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ConcertArena from '../visual/ConcertArena';

export interface LandingRitualProps {
    onSync: () => void;
}

// Signature concert lighting + pulse delays for the 7 spotlight columns.
// Colors come from the shared MEMBER_STAGE_LIGHTS token (constants/colors.ts).
const MEMBERS = [
  { ...MEMBER_STAGE_LIGHTS.RM,     delay: 0.00, name: 'RM', fullName: 'Kim Namjoon',     short: 'RM'  },
  { ...MEMBER_STAGE_LIGHTS.JIN,    delay: 0.30, name: 'JIN', fullName: 'Kim Seokjin',    short: 'JIN' },
  { ...MEMBER_STAGE_LIGHTS.SUGA,   delay: 0.55, name: 'SUGA', fullName: 'Min Yoongi',   short: 'SG'  },
  { ...MEMBER_STAGE_LIGHTS.J_HOPE, delay: 0.15, name: 'J-HOPE', fullName: 'Jung Hoseok', short: 'JH'  },
  { ...MEMBER_STAGE_LIGHTS.JIMIN,  delay: 0.45, name: 'JIMIN', fullName: 'Park Jimin',  short: 'JM'  },
  { ...MEMBER_STAGE_LIGHTS.V,      delay: 0.70, name: 'V', fullName: 'Kim Taehyung',      short: 'V'   },
  { ...MEMBER_STAGE_LIGHTS.JK,     delay: 0.25, name: 'JK', fullName: 'Jeon Jungkook',     short: 'JK'  },
] as const;

export const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
    const [paused, setPaused] = useState(false);
    const reducedMotion = useReducedMotion();
    const {
        audioOn, audioSource,
        currentTrack, playlist, currentIndex, beatRef,
        chantPhase, chantMember,
        start: startAudio, stop: stopAudio, skip: skipTrack,
    } = useConcertBeat();

    // Enter-the-universe handler. If audio is playing, fade it out first
    // (~600 ms fade, matches the stop() routine in useConcertBeat) and then
    // unmount the landing — feels like the music gracefully bowing out
    // instead of being yanked. If audio's off, transition immediately.
    const handleEnter = () => {
        if (audioOn) {
            stopAudio();
            window.setTimeout(onSync, 650);
        } else {
            onSync();
        }
    };

    // Individual names and follow-spots belong to the intro chant only.
    // Songs return to the group screen; ALL lights the whole stage together.
    const isChanting = chantPhase === 'running';
    const chantFocusName = chantMember && chantMember !== 'ALL' ? chantMember : null;
    const effectiveFocused = isChanting ? chantFocusName : null;
    return (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden select-none bg-[#020008]">

            <ConcertArena members={MEMBERS} focused={effectiveFocused}
              audioRef={beatRef} paused={paused} />
            {!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}
              aria-label={paused ? 'Resume arena motion' : 'Pause arena motion'}
              className="absolute top-6 left-4 sm:left-6 z-30 flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 text-white/70 hover:text-white">
              {paused ? <Play size={14} /> : <Pause size={14} />}<span className="hidden sm:inline text-[10px] uppercase tracking-widest">{paused ? 'Resume motion' : 'Pause motion'}</span>
            </button>}

            {/* TITLE — Bangtan Universe only */}
            <div className="absolute top-[15%] sm:top-[12%] left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[94%] text-center">
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
                    onClick={handleEnter}
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
                    onClick={handleEnter}
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
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-center text-[10px] sm:text-[11px] text-white/45 tracking-wide pointer-events-none px-3 w-[92%] max-w-[640px]"
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
