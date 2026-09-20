export interface AudioRhythmState {
  serial: number;
  lastAt: number;
  interval: number;
  intervals: number[];
  playing: boolean;
}
export interface AudioRhythmFrame {
  beatSerial: number;
  beatAt: number;
  beatInterval: number;
  playing: boolean;
}
export interface ConcertAudioFrame extends Partial<AudioRhythmFrame> {
  bass: number; mid?: number; treble: number; isBeat?: boolean; isChorus: boolean;
}
export function createAudioRhythm(): AudioRhythmState {
  return { serial: 0, lastAt: 0, interval: 500, intervals: [], playing: false };
}

// Keep discrete events until the renderer consumes them. A one-frame boolean
// can disappear between the audio RAF and a throttled graphics RAF.
export function updateAudioRhythm(state: AudioRhythmState, now: number, onset: boolean, playing: boolean): AudioRhythmFrame {
  if (!playing) { state.lastAt = 0; state.intervals = []; state.interval = 500; }
  if (playing && onset) {
    const gap = now - state.lastAt;
    if (state.playing && state.lastAt && gap >= 280 && gap <= 1200) {
      state.intervals.push(gap); if (state.intervals.length > 8) state.intervals.shift();
      const sorted = [...state.intervals].sort((a, b) => a - b);
      state.interval = sorted[Math.floor(sorted.length / 2)];
    } else if (gap > 1800) { state.intervals = []; state.interval = 500; }
    state.serial++; state.lastAt = now;
  }
  state.playing = playing;
  return { beatSerial: state.serial, beatAt: state.lastAt, beatInterval: state.interval, playing };
}

export function sampleAudioRhythm(frame: ConcertAudioFrame | null, now: number) {
  const age = Math.max(0, now - (frame?.beatAt || 0));
  const interval = frame?.beatInterval || 500;
  const live = !!frame?.playing && !!frame.beatAt && age < interval * 2.5;
  return {
    pulse: live ? Math.exp(-age / 180) : 0,
    position: (frame?.beatSerial || 0) + (frame?.beatAt ? Math.min(1, age / interval) : 0),
    bpm: live ? 60000 / interval : 0,
    playing: !!frame?.playing,
  };
}
