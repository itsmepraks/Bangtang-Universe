import { describe, expect, it } from 'vitest';
import { performerMotion } from './performerMotion';

describe('restrained concert gestures', () => {
  it('keeps free-arm rotations under fourteen degrees and microphone movement under four degrees, even at maximum energy', () => {
    for (let i = 0; i < 7; i++) {
      for (let time = 0; time < 30; time += .1) {
        const pose = performerMotion(time, i, 2, 2);
        const next = performerMotion(time + 1 / 60, i, 2, 2);
        pose.freeArm.forEach((angle, joint) => {
          expect(Math.abs(angle)).toBeLessThan(14 * Math.PI / 180);
          expect(Math.abs(next.freeArm[joint] - angle)).toBeLessThan(.004);
        });
        pose.micArm.forEach(angle => expect(Math.abs(angle)).toBeLessThan(4 * Math.PI / 180));
      }
    }
  });
  it('holds the same pose while paused and closes the mouth when the audio envelope is silent', () => {
    for (let i = 0; i < 7; i++) {
      expect(performerMotion(9, i, .5, .4)).toEqual(performerMotion(9, i, .5, .4));
      expect(performerMotion(9, i, .5, 0).singing).toBe(0);
    }
    expect(performerMotion(9, 0, .5, .7).singing).toBe(.7);
    expect(performerMotion(9, 4, .5, .7).singing).toBe(0);
  });
});
