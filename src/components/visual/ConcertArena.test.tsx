// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConcertArena from './ConcertArenaFallback';

const preference = vi.hoisted(() => ({ reduced: false }));
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: () => preference.reduced }));
const members = [{ name: 'RM', short: 'RM', color: '#3b82f6', glow: '#93c5fd' }];
const audioRef = { current: { bass: 0, treble: 0, isChorus: false } };
let host: HTMLDivElement, root: Root;
const request = vi.fn(() => 17);
const cancel = vi.fn();
const disconnect = vi.fn();
beforeEach(() => {
  preference.reduced = false;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const context = new Proxy({}, { get: (_target, key) => {
    if (key === 'measureText') return (text: string) => ({ width: text.length * 8 });
    if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => ({ addColorStop() {} });
    return () => {};
  } });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as CanvasRenderingContext2D);
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
const render = (paused = false, focused: string | null = null) => act(() => root.render(<ConcertArena members={members} audioRef={audioRef} focused={focused} paused={paused} />));

describe('fallback arena animation lifecycle', () => {
  it('cancels the animation loop when paused and restarts only on resume', () => {
    render(); expect(request).toHaveBeenCalledTimes(1);
    render(true); expect(cancel).toHaveBeenCalledWith(17); expect(request).toHaveBeenCalledTimes(1);
    render(false); expect(request).toHaveBeenCalledTimes(2);
  });
  it('renders a still scene for reduced motion without scheduling frames', () => {
    preference.reduced = true; render();
    expect(host.querySelector('canvas')).not.toBeNull(); expect(request).not.toHaveBeenCalled();
    expect(host.querySelector('button')).toBeNull();
  });
  it('updates spotlight selection without rebuilding the animation loop', () => {
    render(); render(false, 'RM');
    expect(host.querySelector('button')).toBeNull();
    expect(request).toHaveBeenCalledTimes(1); expect(disconnect).not.toHaveBeenCalled();
  });
});
