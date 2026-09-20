import { describe, expect, it } from 'vitest';
import { keyStageArtwork, performerCell } from './performerArtwork';

describe('performance artwork', () => {
  it('removes the bright matte while preserving skin, purple light and V’s dark green microphone', () => {
    const pixels = new Uint8ClampedArray([
      0, 255, 0, 255,
      240, 190, 160, 255,
      145, 65, 210, 255,
      10, 85, 40, 255,
    ]);
    keyStageArtwork(pixels);
    expect(pixels[3]).toBe(0);
    expect(Array.from(pixels.slice(4))).toEqual([
      240, 190, 160, 255,
      145, 65, 210, 255,
      10, 85, 40, 255,
    ]);
  });
  it('maps chant order onto the four-column atlas without using the empty eighth cell', () => {
    expect(performerCell(3)).toEqual({ x: .75, y: 0, width: .25, height: .5 });
    expect(performerCell(4)).toEqual({ x: 0, y: .5, width: .25, height: .5 });
    expect(performerCell(6)).toEqual({ x: .5, y: .5, width: .25, height: .5 });
  });
});
