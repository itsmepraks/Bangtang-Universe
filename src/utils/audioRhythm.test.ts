import { describe, expect, it } from 'vitest';
import { createAudioRhythm, updateAudioRhythm, sampleAudioRhythm, type AudioRhythmFrame } from './audioRhythm';
const frame = (rhythm: AudioRhythmFrame) => ({ bass: .5, treble: .2, isChorus: false, ...rhythm });

describe('audio-driven lighting rhythm', () => {
  it('preserves a detected beat for a slower renderer without repeating the event', () => {
    const state = createAudioRhythm();
    updateAudioRhythm(state, 1000, true, true);
    const nextAudioFrame = updateAudioRhythm(state, 1016, false, true);
    expect(nextAudioFrame.beatSerial).toBe(1);
    expect(nextAudioFrame.beatAt).toBe(1000);
    const graphics = sampleAudioRhythm(frame(nextAudioFrame), 1033);
    expect(graphics.pulse).toBeGreaterThan(.8);
    expect(sampleAudioRhythm(frame(nextAudioFrame), 1400).pulse).toBeLessThan(.12);
  });
  it('estimates the interval from real onsets and tolerates one missed kick', () => {
    const state = createAudioRhythm();
    let latest = updateAudioRhythm(state, 1000, true, true);
    for (const time of [1500, 2000, 2500, 3500, 4000]) latest = updateAudioRhythm(state, time, true, true);
    expect(latest.beatInterval).toBe(500);
    expect(sampleAudioRhythm(frame(latest), 4000).bpm).toBe(120);
  });
  it('settles without inventing beats in silence, and clears the estimator on stop', () => {
    const state = createAudioRhythm();
    const hit = frame(updateAudioRhythm(state, 1000, true, true));
    const quiet = sampleAudioRhythm(hit, 4000);
    expect(quiet.pulse).toBe(0);
    expect(quiet.bpm).toBe(0);
    expect(quiet.position).toBe(sampleAudioRhythm(hit, 8000).position);
    const stopped = frame(updateAudioRhythm(state, 4200, false, false));
    expect(sampleAudioRhythm(stopped, 4200)).toMatchObject({ pulse: 0, bpm: 0, playing: false });
    expect(state.intervals).toEqual([]);
    expect(stopped.beatSerial).toBe(1);
  });
});
