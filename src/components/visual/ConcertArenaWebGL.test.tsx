// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConcertArena from './ConcertArena';

const mocks = vi.hoisted(() => ({
  reduced: false,
  create: vi.fn(), render: vi.fn(), resize: vi.fn(), dispose: vi.fn(),
}));
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: () => mocks.reduced }));
vi.mock('./concert/createConcertScene', () => ({ createConcertScene: mocks.create }));
vi.mock('./ConcertArenaFallback', () => ({ default: () => <div data-testid="fallback">Still usable</div> }));
const members = [{ name: 'RM', short: 'RM', color: '#3b82f6', glow: '#93c5fd' }];
const audioRef = { current: { bass: 0, treble: 0, isChorus: false } };
const request = vi.fn(() => 21), cancel = vi.fn();
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  mocks.reduced = false;
  mocks.create.mockReturnValue({ render: mocks.render, resize: mocks.resize, dispose: mocks.dispose });
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', request); vi.stubGlobal('cancelAnimationFrame', cancel);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
async function render(paused = false, focused: string | null = null) {
  await act(async () => { root.render(<ConcertArena members={members} focused={focused} audioRef={audioRef} paused={paused} />); });
  await act(async () => { await vi.dynamicImportSettled(); });
}

describe('WebGL arena lifecycle', () => {
  it('pauses and resumes without recreating GPU resources', async () => {
    await render(); expect(mocks.create).toHaveBeenCalledTimes(1); expect(request).toHaveBeenCalledTimes(1);
    await render(true); expect(cancel).toHaveBeenCalledWith(21); expect(request).toHaveBeenCalledTimes(1);
    await render(false); expect(request).toHaveBeenCalledTimes(2); expect(mocks.create).toHaveBeenCalledTimes(1);
  });
  it('keeps the static WebGL scene and projected focus under reduced motion', async () => {
    mocks.reduced = true; await render();
    expect(mocks.render).toHaveBeenCalled(); expect(request).not.toHaveBeenCalled();
    await render(false, 'RM'); expect(mocks.render).toHaveBeenLastCalledWith(expect.objectContaining({ focus: 0, time: 0 }));
  });
  it('updates spotlight selection without rebuilding the renderer', async () => {
    await render(); await render(false, 'RM');
    expect(mocks.create).toHaveBeenCalledTimes(1); expect(mocks.render).toHaveBeenLastCalledWith(expect.objectContaining({ focus: 0 }));
  });
  it('disposes the scene and offers the fallback on GPU context loss', async () => {
    await render();
    await act(async () => { host.querySelector('canvas')!.dispatchEvent(new Event('webglcontextlost', { cancelable: true })); });
    expect(host.querySelector('[data-testid="fallback"]')).not.toBeNull(); expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });
  it('offers the fallback when WebGL initialization fails', async () => {
    mocks.create.mockImplementationOnce(() => { throw new Error('WebGL unavailable'); });
    await render(); expect(host.querySelector('[data-testid="fallback"]')).not.toBeNull(); expect(request).not.toHaveBeenCalled();
  });
});
