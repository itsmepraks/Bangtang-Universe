import { useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ConcertArenaFallback from './ConcertArenaFallback';
import { sampleAudioRhythm, type ConcertAudioFrame } from '../../utils/audioRhythm';
import type { ConcertScene, StageMember } from './concert/createConcertScene';

interface ConcertArenaProps {
  members: readonly StageMember[];
  focused: string | null;
  audioRef: RefObject<ConcertAudioFrame | null>;
  paused: boolean;
}

export default function ConcertArena(props: ConcertArenaProps) {
  const { members, focused, audioRef, paused } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ConcertScene | null>(null);
  const stateRef = useRef({ time: 0, bass: 0, vocal: 0, beatPulse: 0, beatPosition: 0, bpm: 0, audioPlaying: false, pointerX: 0, pointerY: 0, focus: -1 });
  const scheduleRef = useRef<(() => void) | null>(null);
  const stoppedRef = useRef(false);
  const [fallback, setFallback] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    stoppedRef.current = paused || reduced;
    if (reduced) { stateRef.current.pointerX = 0; stateRef.current.pointerY = 0; }
    scheduleRef.current?.();
  }, [paused, reduced]);
  useEffect(() => {
    stateRef.current.focus = members.findIndex(member => member.name === focused);
    if (sceneRef.current) sceneRef.current.render(stateRef.current);
  }, [focused, members]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fallback) return;
    let cancelled = false, frame = 0, last = 0, sampleStart = 0, samples = 0;
    let pointerX = 0, pointerY = 0, vx = 0, vy = 0;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const tick = (now: number) => {
      frame = 0;
      if (cancelled || document.hidden || !sceneRef.current) return;
      if (!stoppedRef.current && last && now - last < 1000 / 60 - 2) {
        frame = requestAnimationFrame(tick); return;
      }
      const state = stateRef.current;
      if (!stoppedRef.current) {
        const dt = Math.min((now - (last || now)) / 1000, .05);
        state.time += dt;
        const rhythm = sampleAudioRhythm(audioRef.current, now);
        state.beatPulse = rhythm.pulse; state.beatPosition += (rhythm.position - state.beatPosition) * (1 - Math.exp(-dt / .65));
        state.bpm = rhythm.bpm; state.audioPlaying = rhythm.playing;
        vx += ((pointerX - state.pointerX) * 100 - vx * 10) * dt;
        vy += ((pointerY - state.pointerY) * 100 - vy * 10) * dt;
        state.pointerX += vx * dt; state.pointerY += vy * dt;
        state.bass += ((audioRef.current?.bass || 0) - state.bass) * Math.min(1, dt * 5);
        const voice = Math.max(audioRef.current?.mid || 0, (audioRef.current?.treble || 0) * .75);
        state.vocal += (voice - state.vocal) * Math.min(1, dt * 14);
      }
      last = now;
      samples++;
      if (!sampleStart) sampleStart = now;
      if (now - sampleStart > 1000) {
        canvas.dataset.fps = String(Math.round(samples * 1000 / (now - sampleStart)));
        sampleStart = now; samples = 0;
      }
      sceneRef.current.render(state);
      if (!stoppedRef.current) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (frame) cancelAnimationFrame(frame); frame = 0; last = 0;
      if (!document.hidden && sceneRef.current) {
        if (stoppedRef.current) sceneRef.current.render(stateRef.current);
        else frame = requestAnimationFrame(tick);
      }
    };
    scheduleRef.current = schedule;
    const resize = () => { sceneRef.current?.resize(); sceneRef.current?.render(stateRef.current); };
    const move = (event: PointerEvent) => {
      if (!fine.matches || stoppedRef.current) return;
      pointerX = (event.clientX / Math.max(1, canvas.clientWidth) - .5) * 2;
      pointerY = (event.clientY / Math.max(1, canvas.clientHeight) - .5) * 2;
    };
    const leave = () => { pointerX = pointerY = 0; };
    const contextLost = (event: Event) => { event.preventDefault(); setFallback(true); };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    canvas.addEventListener('webglcontextlost', contextLost);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', schedule);
    // Keep the WebGL renderer out of archive routes, and retain the lightweight
    // perspective renderer on devices where a WebGL context is unavailable.
    void import('./concert/createConcertScene').then(({ createConcertScene }) => {
      if (cancelled) return;
      sceneRef.current = createConcertScene(canvas, members);
      canvas.dataset.renderer = 'webgl';
      sceneRef.current.render(stateRef.current); schedule();
    }).catch(() => { if (!cancelled) setFallback(true); });
    return () => {
      cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); scheduleRef.current = null;
      canvas.removeEventListener('webglcontextlost', contextLost); window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', schedule);
      sceneRef.current?.dispose(); sceneRef.current = null;
    };
  }, [audioRef, members, fallback]);

  if (fallback) return <ConcertArenaFallback {...props} />;
  return <div className="absolute inset-0">
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,1,6,.72), transparent 32%, transparent 68%, rgba(2,1,6,.78))' }} />
  </div>;
}
