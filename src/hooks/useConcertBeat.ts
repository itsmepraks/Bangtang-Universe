import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives the landing-page concert effect:
 *   - Playlist of license-cleared 30s previews fetched from iTunes Search API
 *   - Real-time beat detection (FFT → bass / mid / treble bands)
 *   - Hidden YouTube IFrame Player for the official fan-chant intro
 *   - Optional /public/chant.mp3 drop-in
 *   - Synthesized fallback if everything above fails
 *
 * Audio can only start after a user gesture (browser autoplay policy),
 * so `start()` must be called from a click/tap handler.
 */

// Minimal YouTube IFrame Player API typing — we only use a handful of methods.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}
type YTPlayerCtor = new (
  el: string | HTMLElement,
  opts: {
    videoId: string;
    width?: string | number;
    height?: string | number;
    playerVars?: Record<string, string | number>;
    events?: { onReady?: () => void; onError?: (e: { data: number }) => void; onStateChange?: (e: { data: number }) => void };
  },
) => YTPlayer;
declare global {
  interface Window {
    YT?: { Player: YTPlayerCtor };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// YouTube video ID for the chant intro. Pulled from a Shorts URL the user
// provided as their reference. If embedding is disabled on the video, the
// onError event fires and we transparently fall back to chant.mp3 → synth.
const YT_CHANT_VIDEO_ID = 'XICFnjbVD00';
// How many seconds to let the YouTube audio play after the visual sequence
// finishes, so the chant gets a moment to breathe before the first song.
const YT_CHANT_TAIL_MS = 1500;

/**
 * Video-anchored chant schedule. Each entry says: at this `t` (seconds into
 * the YouTube video), fire the visual beat for member `id`.
 *
 * ⚙️ TUNING: open the video, note the exact seconds-mark when each name
 * starts being called, and edit the `t` values below. If the video calls
 * the names twice, list all 16 beats in order. If it only calls once,
 * keep just the first 8.
 *
 * These defaults are educated guesses — re-calibrate to match the actual
 * audio when you watch it.
 */
const CHANT_SCHEDULE: Array<{ id: 'RM' | 'JIN' | 'SUGA' | 'J-HOPE' | 'JIMIN' | 'V' | 'JK' | 'ALL'; t: number }> = [
  // All beats nudged 0.5s earlier globally to fix a slight late-feel.
  // First pass
  { id: 'RM',     t: 0.5 },
  { id: 'JIN',    t: 2.5 },
  { id: 'SUGA',   t: 4.5 },
  { id: 'J-HOPE', t: 6.5 },
  { id: 'JIMIN',  t: 7.5 },
  { id: 'V',      t: 8.5 },
  { id: 'JK',     t: 9.5 },
  { id: 'ALL',    t: 11.5 },
  // Second pass
  { id: 'RM',     t: 12.5 },
  { id: 'JIN',    t: 14.5 },
  { id: 'SUGA',   t: 16.5 },
  { id: 'J-HOPE', t: 17.5 },
  { id: 'JIMIN',  t: 19.5 },
  { id: 'V',      t: 20.5 },
  { id: 'JK',     t: 21.5 },
  { id: 'ALL',    t: 22.5 },  // +0.5s slower than pass-1 cadence (user-tuned)
];
export interface ConcertBeatOptions {
  /** Songs to queue — searched via iTunes Search API. */
  tracks?: string[];
  /** Fallback BPM used when no streamed audio is playing. */
  fallbackBpm?: number;
  /** Frames between beats min — prevents double-trigger on a single kick. */
  minBeatGapMs?: number;
  /** Skip the chant intro and go straight to the playlist. */
  skipChant?: boolean;
  /** Milliseconds between chant beats (each name call). */
  chantBeatMs?: number;
}

/**
 * The fan-chant calls each member by their real personal name, then "BTS"
 * as the closing beat. We synthesize this via the browser's SpeechSynthesis
 * API (TTS) — no recorded audio is embedded. Names are factual labels.
 */
export interface ChantStep {
  /** Member id ("RM", "JIN", ...) for visual sync, or "ALL" for the final beat. */
  id: 'RM' | 'JIN' | 'SUGA' | 'J-HOPE' | 'JIMIN' | 'V' | 'JK' | 'ALL';
  /** Personal name spoken via TTS during this beat. */
  spoken: string;
}

const CHANT_SEQUENCE: ChantStep[] = [
  { id: 'RM',     spoken: 'Kim Namjoon' },
  { id: 'JIN',    spoken: 'Kim Seokjin' },
  { id: 'SUGA',   spoken: 'Min Yoongi' },
  { id: 'J-HOPE', spoken: 'Jung Hoseok' },
  { id: 'JIMIN',  spoken: 'Park Jimin' },
  { id: 'V',      spoken: 'Kim Taehyung' },
  { id: 'JK',     spoken: 'Jeon Jungkook' },
  { id: 'ALL',    spoken: 'B T S' },
];

export interface PlaylistEntry {
  query: string;
  trackName: string | null;
  artistName: string | null;
  previewUrl: string | null;
}

export interface ConcertBeatState {
  /** Pulse 0..1 — bass envelope when streaming, exponential decay when synth/idle. */
  pulse: number;
  /** Bass band energy 0..1 (sub-150Hz). */
  bass: number;
  /** Mid band energy 0..1 (250-2000Hz). */
  mid: number;
  /** Treble band energy 0..1 (4-8kHz). */
  treble: number;
  /** True for the single frame a beat fired. */
  isBeat: boolean;
  /** True on a "drop" — bass + treble simultaneously spike. */
  isChorus: boolean;
  /** Audio playing right now. */
  audioOn: boolean;
  /** Where the current sound comes from. */
  audioSource: 'streamed' | 'synth' | 'none' | 'chant';
  /** Current track in the playlist (or null). */
  currentTrack: PlaylistEntry | null;
  /** Playlist position. */
  currentIndex: number;
  /** Full playlist (after iTunes resolution). */
  playlist: PlaylistEntry[];
  /** Chant intro phase. */
  chantPhase: 'idle' | 'running' | 'done';
  /** Member id currently being called in the chant, or null when not chanting. */
  chantMember: ChantStep['id'] | null;
  /** Index into the chant sequence (0..7). */
  chantStep: number;
  /** Monotonic counter — increments once per detected beat during songs.
   *  Use modulo 7 to drive a "lead" spotlight that chases the kicks. */
  beatCount: number;
  /** Index of the strobe burst — increments on each detected chorus drop
   *  so LandingRitual can re-mount and re-fire the strobe animation. */
  strobeId: number;
}

interface ITunesTrack {
  trackName: string;
  artistName: string;
  previewUrl: string;
}

const DEFAULT_TRACKS = [
  'BTS Mikrokosmos',
  'BTS Dynamite',
  'BTS Boy With Luv',
  'BTS Spring Day',
  'BTS DNA',
];

// FFT bin index → Hz: Hz = (binIndex * sampleRate) / fftSize
// At 44.1kHz, fftSize 2048: ~21.5 Hz per bin
const FFT_SIZE = 2048;
const BASS_BINS: [number, number] = [1, 7];      // ~20–150 Hz (kick drum)
const MID_BINS: [number, number] = [12, 94];     // ~250–2000 Hz (vocals/melody)
const TREBLE_BINS: [number, number] = [186, 372]; // ~4000–8000 Hz (hi-hats)
const ENERGY_HISTORY = 45; // shorter window → more responsive to current section
const BEAT_THRESHOLD = 1.18; // looser threshold catches more kicks (was 1.32)
const BEAT_MIN_BASS = 0.10;  // lower minimum so quiet sections still pulse (was 0.18)

export function useConcertBeat({
  tracks = DEFAULT_TRACKS,
  fallbackBpm = 120,
  minBeatGapMs = 200,
  skipChant = false,
  chantBeatMs = 820,
}: ConcertBeatOptions = {}) {
  const [state, setState] = useState<ConcertBeatState>({
    pulse: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    isBeat: false,
    isChorus: false,
    audioOn: false,
    audioSource: 'none',
    currentTrack: null,
    currentIndex: 0,
    playlist: tracks.map((q) => ({ query: q, trackName: null, artistName: null, previewUrl: null })),
    chantPhase: 'idle',
    chantMember: null,
    chantStep: -1,
    beatCount: 0,
    strobeId: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<PlaylistEntry[]>(state.playlist);
  const currentIndexRef = useRef(0);
  const streamPlayingRef = useRef(false);
  const lastBeatTimeRef = useRef(0);
  const bassHistoryRef = useRef<number[]>([]);
  const trebleHistoryRef = useRef<number[]>([]);
  const synthPadRef = useRef<{ master: GainNode } | null>(null);
  // Live band values readable by canvas/imperative consumers without forcing
  // a React re-render on every frame.
  const beatRef = useRef<{ bass: number; mid: number; treble: number; isBeat: boolean; isChorus: boolean }>({
    bass: 0, mid: 0, treble: 0, isBeat: false, isChorus: false,
  });
  // Chant control — abort flag flips on stop()/skip(); timer ref for the
  // active wait so we can cancel a beat in flight.
  const chantAbortRef = useRef(false);
  const chantTimerRef = useRef<number | null>(null);
  // If the user drops a file at /public/chant.mp3 we'll play that instead of
  // the synthesized chant. Visual beats still fire on their own timer.
  const customChantAudioRef = useRef<HTMLAudioElement | null>(null);
  // Hidden YouTube IFrame Player that streams the reference chant video.
  // Preferred over synth when ready and the video allows embedding.
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);
  const ytFailedRef = useRef(false);
  // Mirrors state.chantPhase synchronously so start() can branch without
  // racing the React update queue.
  const chantPhaseRef = useRef<'idle' | 'running' | 'done'>('idle');
  // Mirrors streaming/audio state for the RAF loop so we can return early
  // (and freeze visuals) when audio is off.
  const audioActiveRef = useRef(false);

  // Keep refs in sync with state so the RAF loop & onended callback see fresh values
  // without re-attaching listeners.
  useEffect(() => {
    playlistRef.current = state.playlist;
  }, [state.playlist]);

  // ── YouTube IFrame Player — lazily initialized.
  //    Originally injected the script + iframe on mount, which spent ~150 KB
  //    of network + ~50 ms of main-thread work for every visitor whether or
  //    not they tapped for sound. Now we wait for the user's first start()
  //    gesture and defer all of it. The cleanup-on-unmount path below tears
  //    down whatever ensureYouTubePlayer() managed to build, if anything.
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytInitStartedRef = useRef(false);

  const ensureYouTubePlayer = useCallback(() => {
    if (typeof window === 'undefined' || ytInitStartedRef.current) return;
    ytInitStartedRef.current = true;

    if (!document.getElementById('yt-iframe-api-script')) {
      const script = document.createElement('script');
      script.id = 'yt-iframe-api-script';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }

    const container = document.createElement('div');
    container.id = 'yt-chant-container';
    container.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:-9999px',
      'width:1px',
      'height:1px',
      'opacity:0',
      'pointer-events:none',
      'overflow:hidden',
    ].join(';');
    const target = document.createElement('div');
    target.id = 'yt-chant-target';
    container.appendChild(target);
    document.body.appendChild(container);
    ytContainerRef.current = container;

    const buildPlayer = () => {
      if (!window.YT?.Player || ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('yt-chant-target', {
          videoId: YT_CHANT_VIDEO_ID,
          width: '1',
          height: '1',
          playerVars: {
            autoplay: 0,
            controls: 0,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            disablekb: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => { ytReadyRef.current = true; },
            onError: () => {
              ytFailedRef.current = true;
              ytReadyRef.current = false;
            },
          },
        });
      } catch {
        ytFailedRef.current = true;
      }
    };

    if (window.YT?.Player) {
      buildPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) try { prev(); } catch { /* noop */ }
        buildPlayer();
      };
    }
  }, []);

  // Cleanup only — handles whatever ensureYouTubePlayer() built, if anything.
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch { /* noop */ }
        ytPlayerRef.current = null;
      }
      ytReadyRef.current = false;
      if (ytContainerRef.current) {
        ytContainerRef.current.remove();
        ytContainerRef.current = null;
      }
    };
  }, []);

  // ── Optional custom chant audio — if the user drops a file at
  //    /public/chant.mp3 we use that during the chant phase instead of the
  //    synth beats. Silently ignored if the file doesn't exist.
  useEffect(() => {
    const probe = new Audio();
    probe.preload = 'auto';
    probe.src = '/chant.mp3';
    const handleReady = () => {
      customChantAudioRef.current = probe;
    };
    const handleError = () => {
      customChantAudioRef.current = null;
    };
    probe.addEventListener('canplaythrough', handleReady, { once: true });
    probe.addEventListener('error', handleError, { once: true });
    return () => {
      probe.removeEventListener('canplaythrough', handleReady);
      probe.removeEventListener('error', handleError);
      probe.pause();
      probe.src = '';
      customChantAudioRef.current = null;
    };
  }, []);

  // ── Pre-fetch all preview URLs once the browser is idle.
  //    Firing 5 parallel cross-origin requests on mount competed with paint
  //    on the first impression. requestIdleCallback (with a setTimeout
  //    fallback for Safari) lets the landing finish rendering first.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const resolveTrack = async (query: string): Promise<PlaylistEntry> => {
      try {
        const params = new URLSearchParams({ term: query, entity: 'song', limit: '5' });
        const res = await fetch(`https://itunes.apple.com/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error('fetch failed');
        const data = (await res.json()) as { results: ITunesTrack[] };
        const target = query.toLowerCase();
        const hit =
          data.results.find((t) => `${t.artistName} ${t.trackName}`.toLowerCase().includes(target.replace(/\s+/g, ' ')))
          ?? data.results.find((t) => t.previewUrl)
          ?? null;
        if (!hit) throw new Error('no match');
        return { query, trackName: hit.trackName, artistName: hit.artistName, previewUrl: hit.previewUrl };
      } catch {
        return { query, trackName: null, artistName: null, previewUrl: null };
      }
    };

    const kickOff = () => {
      if (cancelled) return;
      void Promise.all(tracks.map(resolveTrack)).then((resolved) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          playlist: resolved,
          currentTrack: resolved[0] ?? null,
        }));
      });
    };

    const w = typeof window !== 'undefined' ? (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void }) : null;
    if (w?.requestIdleCallback) {
      idleHandle = w.requestIdleCallback(kickOff, { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(kickOff, 800);
    }

    return () => {
      cancelled = true;
      controller.abort();
      if (idleHandle !== null && w?.cancelIdleCallback) w.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
    };
  }, [tracks]);

  // ── Set up the audio element once, lazily wired to AudioContext on first play ──
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = 0;
    audioElRef.current = audio;

    const handleEnded = () => {
      // Auto-advance to the next track in the playlist.
      const list = playlistRef.current;
      const nextIndex = (currentIndexRef.current + 1) % list.length;
      const next = list[nextIndex];
      if (!next?.previewUrl || !audioElRef.current) {
        streamPlayingRef.current = false;
        audioActiveRef.current = false;
        setState((s) => ({ ...s, audioOn: false, audioSource: 'none' }));
        return;
      }
      currentIndexRef.current = nextIndex;
      audioElRef.current.src = next.previewUrl;
      audioElRef.current.volume = 0;
      void audioElRef.current.play().then(() => {
        // Quick fade-in for the new track
        const a = audioElRef.current!;
        const start = performance.now();
        const fadeIn = () => {
          const t = Math.min((performance.now() - start) / 800, 1);
          a.volume = 0.55 * t;
          if (t < 1) requestAnimationFrame(fadeIn);
        };
        requestAnimationFrame(fadeIn);
        setState((s) => ({ ...s, currentIndex: nextIndex, currentTrack: next }));
      }).catch(() => {
        streamPlayingRef.current = false;
        audioActiveRef.current = false;
        setState((s) => ({ ...s, audioOn: false, audioSource: 'none' }));
      });
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ── Beat clock: RAF loop that runs always. When streaming is active, beats
  //    come from real-time FFT analysis. Otherwise, falls back to a metronome
  //    derived from `fallbackBpm`.
  useEffect(() => {
    let rafId = 0;
    let metroStart: number | null = null;
    let lastMetroBeat = -1;
    const fallbackInterval = 60_000 / fallbackBpm;
    const freqBuf = new Uint8Array(FFT_SIZE / 2);

    const sampleBand = (data: Uint8Array, [lo, hi]: [number, number]) => {
      let sum = 0;
      for (let i = lo; i <= hi; i++) sum += data[i];
      return sum / (hi - lo + 1) / 255; // 0..1
    };

    let lastZeroed = false; // avoid spamming setState when already at rest

    // React-state throttle. The canvas reads beatRef every frame (60 fps),
    // but LandingRitual's JSX only needs to re-render fast enough for the
    // eye — ~20 fps is plenty for the bass-driven filter values, and it cuts
    // React reconciliation work to a third.
    let lastReactStateMs = 0;
    const REACT_STATE_INTERVAL_MS = 50; // ~20 Hz

    const loop = (time: number) => {
      const streaming = streamPlayingRef.current;
      const analyser = analyserRef.current;
      const audioOn = audioActiveRef.current;

      // During the chant, runChant writes beatRef + state directly per beat.
      // Don't fight it from here — just keep the RAF alive.
      if (chantPhaseRef.current === 'running') {
        lastZeroed = false;
        metroStart = null; // reset metronome so it doesn't drift while we wait
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (audioOn && streaming && analyser) {
        // Real-time beat detection from the playing audio
        analyser.getByteFrequencyData(freqBuf);
        const bass = sampleBand(freqBuf, BASS_BINS);
        const mid = sampleBand(freqBuf, MID_BINS);
        const treble = sampleBand(freqBuf, TREBLE_BINS);

        // Rolling history for adaptive thresholds
        const bassHist = bassHistoryRef.current;
        const trebleHist = trebleHistoryRef.current;
        bassHist.push(bass);
        trebleHist.push(treble);
        if (bassHist.length > ENERGY_HISTORY) bassHist.shift();
        if (trebleHist.length > ENERGY_HISTORY) trebleHist.shift();

        const avgBass = bassHist.reduce((a, b) => a + b, 0) / bassHist.length || 0.001;
        const avgTreble = trebleHist.reduce((a, b) => a + b, 0) / trebleHist.length || 0.001;

        const beatGap = time - lastBeatTimeRef.current;
        const isBeat = beatGap > minBeatGapMs && bass > BEAT_THRESHOLD * avgBass && bass > BEAT_MIN_BASS;
        const isChorus = isBeat && treble > 1.25 * avgTreble && treble > 0.25;

        if (isBeat) lastBeatTimeRef.current = time;

        beatRef.current = { bass, mid, treble, isBeat, isChorus };
        lastZeroed = false;

        // Always push when a discrete event lands (beat / chorus) so the
        // spotlight chase + strobe stay tight to the music. Between events,
        // throttle continuous band updates to ~20 Hz.
        const shouldUpdateContinuous = time - lastReactStateMs >= REACT_STATE_INTERVAL_MS;
        if (isBeat || isChorus || shouldUpdateContinuous) {
          lastReactStateMs = time;
          setState((s) => ({
            ...s,
            pulse: Math.min(1, bass * 1.4),
            bass, mid, treble, isBeat, isChorus,
            beatCount: isBeat ? s.beatCount + 1 : s.beatCount,
            strobeId: isChorus ? s.strobeId + 1 : s.strobeId,
          }));
        }
      } else if (audioOn) {
        // Audio is on but not streamed (e.g. synth pad swell). Run the fallback
        // metronome so spotlights still pulse to *something*.
        if (metroStart === null) metroStart = time;
        const elapsed = time - metroStart;
        const beatFloat = elapsed / fallbackInterval;
        const beat = Math.floor(beatFloat);
        const phase = beatFloat - beat;
        const pulse = Math.exp(-phase * 5);

        const justBeat = beat !== lastMetroBeat;
        lastMetroBeat = beat;
        const isChorus = justBeat && beat > 0 && beat % 8 === 0;

        beatRef.current = { bass: pulse * 0.6, mid: 0, treble: 0, isBeat: justBeat, isChorus };
        lastZeroed = false;

        setState((s) => ({
          ...s,
          pulse, bass: pulse * 0.6, mid: 0, treble: 0, isBeat: justBeat, isChorus,
        }));
      } else {
        // Audio is OFF — freeze everything to zero. Visuals revert to their
        // original CSS-only ambient state (twinkle/foreground-twinkle keyframes).
        metroStart = null;
        lastMetroBeat = -1;
        if (!lastZeroed) {
          beatRef.current = { bass: 0, mid: 0, treble: 0, isBeat: false, isChorus: false };
          setState((s) => ({
            ...s,
            pulse: 0, bass: 0, mid: 0, treble: 0, isBeat: false, isChorus: false,
          }));
          lastZeroed = true;
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [fallbackBpm, minBeatGapMs]);

  // ── Lazy Web Audio setup: wire the audio element through an analyser ───
  const ensureWebAudio = useCallback(() => {
    if (audioCtxRef.current && analyserRef.current) return audioCtxRef.current;

    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    const ctx = new AudioCtor();

    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.6;
    analyser.connect(master);
    analyserRef.current = analyser;

    // Connect the existing audio element through the analyser
    const audio = audioElRef.current;
    if (audio) {
      // createMediaElementSource can only be called once per element — that's
      // safe here because we re-use the same element across the playlist.
      const src = ctx.createMediaElementSource(audio);
      src.connect(analyser);
      sourceNodeRef.current = src;
    }

    // Build a quiet synth pad for fallback (chord stays muted until needed)
    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 900;
    padGain.connect(padFilter).connect(master);
    const chordHz = [110, 164.81, 196, 261.63, 493.88]; // A minor 9
    chordHz.forEach((hz, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = hz;
      osc.detune.value = i % 2 === 0 ? -6 : 6;
      osc.connect(padGain);
      osc.start();
    });
    synthPadRef.current = { master: padGain };

    audioCtxRef.current = ctx;
    return ctx;
  }, []);

  const playIndex = useCallback(async (index: number): Promise<boolean> => {
    const list = playlistRef.current;
    if (!list.length) return false;
    const target = list[index];
    if (!target?.previewUrl) return false;

    const ctx = ensureWebAudio();
    const audio = audioElRef.current;
    if (!ctx || !audio) return false;
    if (ctx.state === 'suspended') await ctx.resume();

    audio.src = target.previewUrl;
    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      return false;
    }
    streamPlayingRef.current = true;
    audioActiveRef.current = true;
    currentIndexRef.current = index;

    // 1.2-sec fade-in
    const fadeStart = performance.now();
    const fadeIn = () => {
      if (audio.paused) return;
      const t = Math.min((performance.now() - fadeStart) / 1200, 1);
      audio.volume = 0.55 * t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);

    setState((s) => ({
      ...s,
      audioOn: true,
      audioSource: 'streamed',
      currentIndex: index,
      currentTrack: target,
    }));
    return true;
  }, [ensureWebAudio]);

  // ── Chant runner ─────────────────────────────────────────────────────
  // Per beat we synthesize a cinematic stinger from scratch using Web Audio
  // oscillators + filtered noise: a kick, a short formant burst that reads
  // as a vocal "yeah!" stab (not a recognizable word), and a crowd-cheer
  // noise swell that builds energy beat-over-beat. The final beat replaces
  // the stab with a crash + sustained roar.

  // Filtered-noise crowd cheer. Three bandpass layers — low rumble of
  // crowd voices, mid shout band, and high excitement — fade in and out
  // per beat. Pumped up to be properly LOUD against a real concert vibe.
  const playCrowdCheer = useCallback((ctx: AudioContext, master: GainNode, intensity: number, durationMs: number) => {
    const sampleCount = Math.floor(ctx.sampleRate * (durationMs / 1000));
    const buf = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) data[i] = Math.random() * 2 - 1;

    const make = (centerHz: number, q: number, gain: number) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = centerHz;
      filt.Q.value = q;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain * intensity, now + durationMs / 1000 * 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
      src.connect(filt).connect(g).connect(master);
      src.start(now);
    };
    make(380, 1.0, 0.34);   // low crowd rumble — boosted
    make(1100, 2.2, 0.28);  // mid crowd shout band — boosted
    make(2400, 3.0, 0.18);  // high excitement layer — new
  }, []);

  // Vocal-stab synthesis — punchy "hah!" texture without uttering a word.
  // Two sawtooth voices an octave apart give a wider crowd-like shout.
  const playVocalStab = useCallback((ctx: AudioContext, master: GainNode) => {
    const now = ctx.currentTime;

    const makeVoice = (baseHz: number, peakHz: number, tailHz: number, gain: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseHz, now);
      osc.frequency.exponentialRampToValueAtTime(peakHz, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(tailHz, now + 0.2);

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 820;
      f1.Q.value = 3;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 1700;
      f2.Q.value = 4;

      const stabGain = ctx.createGain();
      stabGain.gain.setValueAtTime(0, now);
      stabGain.gain.linearRampToValueAtTime(gain, now + 0.012);
      stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(f1).connect(stabGain).connect(master);
      osc.connect(f2).connect(stabGain);
      osc.start(now);
      osc.stop(now + 0.3);
    };

    makeVoice(190, 230, 170, 0.55); // lead voice
    makeVoice(380, 460, 340, 0.32); // octave-up companion for width
  }, []);

  // Big finale: crash cymbal (high-pass noise) + sub-bass boom + sustained
  // crowd roar (~2.5s). The "drop" before the first song fades in.
  const playFinaleHit = useCallback((ctx: AudioContext, master: GainNode) => {
    const now = ctx.currentTime;

    // Sub-bass boom — long, deep, gut punch
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.frequency.setValueAtTime(58, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 0.7);
    subG.gain.setValueAtTime(0.95, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    sub.connect(subG).connect(master);
    sub.start(now);
    sub.stop(now + 0.95);

    // Second sub layer one octave down for extra weight
    const sub2 = ctx.createOscillator();
    const sub2G = ctx.createGain();
    sub2.frequency.setValueAtTime(40, now);
    sub2.frequency.exponentialRampToValueAtTime(20, now + 0.9);
    sub2G.gain.setValueAtTime(0.5, now);
    sub2G.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    sub2.connect(sub2G).connect(master);
    sub2.start(now);
    sub2.stop(now + 1.1);

    // Crash cymbal — long high-passed noise tail, much louder
    const crashBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.4), ctx.sampleRate);
    const crashData = crashBuf.getChannelData(0);
    for (let i = 0; i < crashData.length; i++) crashData[i] = (Math.random() * 2 - 1) * (1 - i / crashData.length);
    const crash = ctx.createBufferSource();
    crash.buffer = crashBuf;
    const crashHp = ctx.createBiquadFilter();
    crashHp.type = 'highpass';
    crashHp.frequency.value = 4500;
    const crashG = ctx.createGain();
    crashG.gain.setValueAtTime(0.85, now);
    crashG.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    crash.connect(crashHp).connect(crashG).connect(master);
    crash.start(now);

    // Sustained crowd roar — bigger and longer
    playCrowdCheer(ctx, master, 2.0, 2500);
  }, [playCrowdCheer]);

  const playChantBeat = useCallback((ctx: AudioContext, master: GainNode, isFinale: boolean) => {
    const now = ctx.currentTime;
    // Kick drum — louder, punchier
    const kick = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kick.frequency.setValueAtTime(170, now);
    kick.frequency.exponentialRampToValueAtTime(42, now + 0.22);
    kickGain.gain.setValueAtTime(isFinale ? 1.0 : 0.75, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    kick.connect(kickGain).connect(master);
    kick.start(now);
    kick.stop(now + 0.4);

    // Clap on finale — louder noise burst high-passed
    if (isFinale) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3200;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.7, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(hp).connect(ng).connect(master);
      noise.start(now);
    }
  }, []);

  const runChant = useCallback(async (): Promise<boolean> => {
    chantAbortRef.current = false;
    const ctx = ensureWebAudio();
    if (!ctx) return false;
    if (ctx.state === 'suspended') await ctx.resume();
    const master = masterGainRef.current;
    if (!master) return false;

    chantPhaseRef.current = 'running';
    audioActiveRef.current = true;
    setState((s) => ({ ...s, chantPhase: 'running', audioOn: true, audioSource: 'chant' }));

    // Audio source priority for the chant:
    //   1) YouTube IFrame Player (reference video the user provided)
    //   2) /public/chant.mp3 if it exists
    //   3) Synthesized stinger
    const ytPlayer = ytPlayerRef.current;
    const useYouTube = !!ytPlayer && ytReadyRef.current && !ytFailedRef.current;

    const customAudio = customChantAudioRef.current;
    const useCustom = !useYouTube && !!customAudio;

    if (useYouTube && ytPlayer) {
      try {
        ytPlayer.unMute();
        ytPlayer.setVolume(0);
        ytPlayer.playVideo();
        // setVolume() steps in integer 0–100. Ramp it up smoothly.
        let v = 0;
        const fadeIn = window.setInterval(() => {
          v = Math.min(85, v + 6);
          try { ytPlayer.setVolume(v); } catch { /* noop */ }
          if (v >= 85) window.clearInterval(fadeIn);
        }, 45);
        // Stash the timer on the player so we can clear it from outside
        (ytPlayer as unknown as { _fadeInTimer?: number })._fadeInTimer = fadeIn;
      } catch {
        ytFailedRef.current = true;
      }
    } else if (useCustom && customAudio) {
      customAudio.currentTime = 0;
      customAudio.volume = 0;
      try {
        await customAudio.play();
        const fadeStart = performance.now();
        const fadeIn = () => {
          if (customAudio.paused) return;
          const t = Math.min((performance.now() - fadeStart) / 400, 1);
          customAudio.volume = 0.95 * t;
          if (t < 1) requestAnimationFrame(fadeIn);
        };
        requestAnimationFrame(fadeIn);
      } catch {
        /* If browser blocked playback fall back to synth */
      }
    }

    const suppressSynth = useYouTube || useCustom;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        chantTimerRef.current = window.setTimeout(() => {
          chantTimerRef.current = null;
          resolve();
        }, ms);
      });

    // Polls the YouTube player and resolves when its currentTime hits
    // `targetSec`. Watchdog: if the clock stops advancing for 2.5s (player
    // paused, errored, ad insert, or video ended), give up so the chant
    // doesn't hang silently — the rest of the beats fall back to a fixed
    // cadence and we transition to the playlist on schedule.
    const waitForVideoTime = (player: YTPlayer, targetSec: number): Promise<'reached' | 'stalled'> =>
      new Promise<'reached' | 'stalled'>((resolve) => {
        let lastCt = -1;
        let lastChangeAt = performance.now();
        const tick = () => {
          if (chantAbortRef.current) { resolve('stalled'); return; }
          let ct = 0;
          try { ct = (player as unknown as { getCurrentTime: () => number }).getCurrentTime(); } catch { /* noop */ }
          if (ct >= targetSec) { resolve('reached'); return; }
          if (ct !== lastCt) {
            lastCt = ct;
            lastChangeAt = performance.now();
          } else if (performance.now() - lastChangeAt > 2500) {
            resolve('stalled');
            return;
          }
          chantTimerRef.current = window.setTimeout(tick, 30);
        };
        tick();
      });

    // YouTube path: iterate the video-anchored CHANT_SCHEDULE so beats
    // line up with the actual chant audio. Synth/custom paths stay on
    // the existing fixed-cadence CHANT_SEQUENCE loop.
    const beats = useYouTube ? CHANT_SCHEDULE : CHANT_SEQUENCE.map((s) => ({ id: s.id, t: -1 }));
    // If YT stalls mid-chant we flip this and finish the remaining beats
    // on a fixed timer so the visual + audio never freeze on screen.
    let ytStalled = false;

    for (let i = 0; i < beats.length; i++) {
      if (chantAbortRef.current) break;
      const step = beats[i];
      const isFinale = step.id === 'ALL';

      // Wait for the right moment — either the video's clock or a fixed delay.
      if (useYouTube && ytPlayer && !ytStalled) {
        const reason = await waitForVideoTime(ytPlayer, step.t);
        if (reason === 'stalled') {
          ytStalled = true;
        }
      }

      // Individual name beats stay quiet — only the called member's spotlight
      // lights up, the rest of the stage (ARMY bomb canvas, foreground
      // crowd bombs, title halo, floor LED) stays calm. The "BTS!" beat is
      // the one moment everything blazes together.
      setState((s) => ({
        ...s,
        chantMember: step.id,
        chantStep: i,
        bass: isFinale ? 1 : 0,
        mid: isFinale ? 0.6 : 0,
        treble: isFinale ? 1 : 0,
        pulse: isFinale ? 1 : 0,
        isBeat: isFinale,
        isChorus: isFinale,
      }));

      beatRef.current = {
        bass: isFinale ? 1 : 0,
        mid: isFinale ? 0.6 : 0,
        treble: isFinale ? 1 : 0,
        isBeat: isFinale,
        isChorus: isFinale,
      };

      // Fire the synth bed when no real audio source is playing, OR when
      // YouTube has stalled mid-chant (so the user isn't left silent for
      // the remaining beats).
      const synthShouldFire = !suppressSynth || ytStalled;
      if (synthShouldFire) {
        playChantBeat(ctx, master, isFinale);
        if (isFinale) {
          playFinaleHit(ctx, master);
        } else {
          playVocalStab(ctx, master);
          const intensity = 0.55 + (i / (beats.length - 1)) * 0.6;
          playCrowdCheer(ctx, master, intensity, 480);
        }
      }

      // Fixed cadence between beats when not video-anchored, or once YT
      // has stalled.
      if (!useYouTube || ytStalled) {
        await wait(isFinale ? chantBeatMs * 1.8 : chantBeatMs);
      }
    }

    // Let YouTube/custom audio breathe for a beat after the visual sequence
    // — but skip the tail if YT stalled (no audio to wait on).
    if ((useYouTube && !ytStalled) || useCustom) {
      await wait(YT_CHANT_TAIL_MS);
    }

    // Fade YouTube out
    if (useYouTube && ytPlayer && !chantAbortRef.current) {
      try {
        const t = (ytPlayer as unknown as { _fadeInTimer?: number })._fadeInTimer;
        if (t) window.clearInterval(t);
        let v = 85;
        const fadeOut = window.setInterval(() => {
          v = Math.max(0, v - 7);
          try { ytPlayer.setVolume(v); } catch { /* noop */ }
          if (v <= 0) {
            window.clearInterval(fadeOut);
            try { ytPlayer.pauseVideo(); } catch { /* noop */ }
          }
        }, 50);
      } catch { /* noop */ }
    }

    // Fade the custom chant audio out if it's still playing
    if (useCustom && customAudio && !customAudio.paused) {
      const startVol = customAudio.volume;
      const fadeStart = performance.now();
      const fadeOut = () => {
        const t = Math.min((performance.now() - fadeStart) / 700, 1);
        customAudio.volume = startVol * (1 - t);
        if (t < 1) requestAnimationFrame(fadeOut);
        else customAudio.pause();
      };
      requestAnimationFrame(fadeOut);
    }

    chantPhaseRef.current = 'done';
    setState((s) => ({ ...s, chantPhase: 'done', chantMember: null }));
    return !chantAbortRef.current;
  }, [ensureWebAudio, playChantBeat, playVocalStab, playCrowdCheer, playFinaleHit, chantBeatMs]);

  const startSynth = useCallback(async () => {
    const ctx = ensureWebAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    const pad = synthPadRef.current;
    if (!pad) return;
    const now = ctx.currentTime;
    pad.master.gain.cancelScheduledValues(now);
    pad.master.gain.setValueAtTime(pad.master.gain.value, now);
    pad.master.gain.linearRampToValueAtTime(0.18, now + 2.2);
    audioActiveRef.current = true;
    setState((s) => ({ ...s, audioOn: true, audioSource: 'synth' }));
  }, [ensureWebAudio]);

  const startPlaylist = useCallback(async () => {
    const list = playlistRef.current;
    for (let i = 0; i < list.length; i++) {
      const idx = (currentIndexRef.current + i) % list.length;
      if (list[idx]?.previewUrl) {
        const ok = await playIndex(idx);
        if (ok) return true;
      }
    }
    await startSynth();
    return false;
  }, [playIndex, startSynth]);

  const start = useCallback(async () => {
    // Now is the right time to spin up the YouTube IFrame player — the user
    // has actually asked for sound. Doing this on mount was eating network
    // and main-thread time for visitors who never tapped.
    ensureYouTubePlayer();

    // First-time start: run the chant intro, then auto-advance to the playlist.
    // If the user already heard the chant (or opted out), go straight to songs.
    if (!skipChant && chantPhaseRef.current === 'idle') {
      const completed = await runChant();
      if (completed) {
        await startPlaylist();
      }
      return;
    }
    await startPlaylist();
  }, [ensureYouTubePlayer, skipChant, runChant, startPlaylist]);

  const skip = useCallback(async () => {
    // Skip during chant → abort, then start the playlist.
    let inChant = false;
    setState((s) => {
      inChant = s.chantPhase === 'running';
      return s;
    });
    if (inChant) {
      chantAbortRef.current = true;
      chantPhaseRef.current = 'done';
      if (chantTimerRef.current !== null) {
        clearTimeout(chantTimerRef.current);
        chantTimerRef.current = null;
      }
      // Pause YouTube + custom audio mid-playback
      const yt = ytPlayerRef.current;
      if (yt) {
        try { yt.pauseVideo(); yt.setVolume(0); } catch { /* noop */ }
      }
      const ca = customChantAudioRef.current;
      if (ca && !ca.paused) ca.pause();
      setState((s) => ({ ...s, chantPhase: 'done', chantMember: null }));
      await startPlaylist();
      return;
    }

    const list = playlistRef.current;
    if (!list.length) return;
    const nextIdx = (currentIndexRef.current + 1) % list.length;
    const audio = audioElRef.current;
    if (audio && streamPlayingRef.current) {
      const startVol = audio.volume;
      const fadeStart = performance.now();
      const fadeOut = () => {
        const t = Math.min((performance.now() - fadeStart) / 300, 1);
        audio.volume = startVol * (1 - t);
        if (t < 1) requestAnimationFrame(fadeOut);
        else void playIndex(nextIdx);
      };
      requestAnimationFrame(fadeOut);
    } else {
      await playIndex(nextIdx);
    }
  }, [playIndex, startPlaylist]);

  const stop = useCallback(() => {
    // Abort chant if running
    chantAbortRef.current = true;
    if (chantTimerRef.current !== null) {
      clearTimeout(chantTimerRef.current);
      chantTimerRef.current = null;
    }
    if (chantPhaseRef.current === 'running') chantPhaseRef.current = 'done';
    audioActiveRef.current = false;
    const ca = customChantAudioRef.current;
    if (ca && !ca.paused) ca.pause();
    const yt = ytPlayerRef.current;
    if (yt) {
      try { yt.pauseVideo(); yt.setVolume(0); } catch { /* noop */ }
    }
    setState((s) => (s.chantPhase === 'running' ? { ...s, chantPhase: 'done', chantMember: null, audioOn: false, audioSource: 'none' } : s));

    const audio = audioElRef.current;
    if (audio && streamPlayingRef.current) {
      const startVol = audio.volume;
      const fadeStart = performance.now();
      const fadeOut = () => {
        const t = Math.min((performance.now() - fadeStart) / 600, 1);
        audio.volume = startVol * (1 - t);
        if (t < 1) requestAnimationFrame(fadeOut);
        else {
          audio.pause();
          streamPlayingRef.current = false;
          audioActiveRef.current = false;
          setState((s) => ({ ...s, audioOn: false, audioSource: 'none' }));
        }
      };
      requestAnimationFrame(fadeOut);
      return;
    }

    const pad = synthPadRef.current;
    const ctx = audioCtxRef.current;
    if (pad && ctx) {
      const now = ctx.currentTime;
      pad.master.gain.cancelScheduledValues(now);
      pad.master.gain.setValueAtTime(pad.master.gain.value, now);
      pad.master.gain.linearRampToValueAtTime(0, now + 0.6);
      audioActiveRef.current = false;
      setState((s) => ({ ...s, audioOn: false, audioSource: 'none' }));
    }
  }, []);

  // Tear everything down on unmount
  useEffect(() => {
    return () => {
      chantAbortRef.current = true;
      if (chantTimerRef.current !== null) {
        clearTimeout(chantTimerRef.current);
        chantTimerRef.current = null;
      }
      const audio = audioElRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      const customChant = customChantAudioRef.current;
      if (customChant) {
        customChant.pause();
        customChant.src = '';
      }
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => { /* noop */ });
      }
    };
  }, []);

  return { ...state, start, stop, skip, beatRef };
}
