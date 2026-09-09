import { describe, expect, it, vi } from 'vitest';
import { createSurfaceResizer, createQualityMonitor } from './renderSurface';

describe('concert drawing-buffer stability', () => {
  it('does not clear a completed frame on duplicate or hidden-container resize notifications', () => {
    const renderer = { setDrawingBufferSize: vi.fn() }, effects = { setSize: vi.fn() };
    const resize = createSurfaceResizer(renderer, effects);
    resize(1440, 900, 2);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledWith(1440, 900, 1.5);
    expect(effects.setSize).toHaveBeenCalledWith(2160, 1350);
    for (const [w, h] of [[1440, 900], [0, 900], [1440, 0], [0, 0], [1440, 900]]) {
      expect(resize(w, h, 2)).toBeNull();
    }
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(1);
    expect(effects.setSize).toHaveBeenCalledTimes(1);
  });
  it('resizes once per real layout or display-density change with matching render targets', () => {
    const renderer = { setDrawingBufferSize: vi.fn() }, effects = { setSize: vi.fn() };
    const resize = createSurfaceResizer(renderer, effects);
    resize(1440, 900, 2);
    resize(390, 844, 2);
    expect(renderer.setDrawingBufferSize).toHaveBeenLastCalledWith(390, 844, 1.25);
    expect(effects.setSize).toHaveBeenLastCalledWith(487, 1055);
    resize(390, 844, 1);
    expect(effects.setSize).toHaveBeenLastCalledWith(390, 844);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(3);
    expect(effects.setSize).toHaveBeenCalledTimes(3);
  });
});


it('adapts to a slowdown after a long smooth intro, exactly once', () => {
  const shouldReduce = createQualityMonitor();
  let time = 0, changes = 0;
  for (let i = 0; i < 600; i++) {
    time += 1 / 60;
    expect(shouldReduce(time)).toBe(false);
  }
  for (let i = 0; i < 180; i++) {
    time += 1 / 25;
    if (shouldReduce(time)) changes++;
  }
  expect(changes).toBe(1);
  for (let i = 0; i < 180; i++) {
    time += 1 / 60;
    expect(shouldReduce(time)).toBe(false);
  }
});
