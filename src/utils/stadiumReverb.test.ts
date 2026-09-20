import { describe, expect, it } from 'vitest';
import { stadiumImpulse } from './stadiumReverb';

describe('stadium impulse', () => {
  it('leaves the initial attack dry and creates distinct, bounded stereo tails', () => {
    const [left, right] = stadiumImpulse(8000);
    expect(left.length).toBe(17600);
    expect(left.slice(0, 360).every(value => value === 0)).toBe(true);
    expect(right.slice(0, 424).every(value => value === 0)).toBe(true);
    expect(left.every(value => Number.isFinite(value) && Math.abs(value) <= .35)).toBe(true);
    expect(left[1000]).not.toBe(right[1000]);
    const energy = (data: Float32Array) => data.reduce((sum, value) => sum + value * value, 0);
    expect(energy(left.slice(-1000))).toBeLessThan(energy(left.slice(1000, 2000)) * .001);
  });
});
