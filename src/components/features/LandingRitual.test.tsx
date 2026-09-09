// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { LandingRitual } from './LandingRitual';

const audio = vi.hoisted(() => ({
  isChorus: false, audioOn: true, audioSource: 'chant',
  currentTrack: { trackName: 'Mikrokosmos' }, playlist: [], currentIndex: 0,
  beatRef: { current: null }, chantPhase: 'running', chantMember: 'JK',
  chantStep: 6, strobeId: 0, start: vi.fn(), stop: vi.fn(), skip: vi.fn(),
}));
vi.mock('../../hooks', () => ({ useConcertBeat: () => audio }));
vi.mock('../../hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('../visual', () => ({ BTSLogo: () => null }));
vi.mock('../visual/ConcertArena', () => ({
  default: ({ focused }: { focused: string | null }) => <div data-testid="arena" data-focus={focused || 'group'} />,
}));

it('ends individual name projections when the chant transitions to music', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  const host = document.createElement('div');
  const root = createRoot(host);
  const render = () => act(() => root.render(<LandingRitual onSync={() => {}} />));
  try {
    render();
    expect(host.querySelector('[data-testid="arena"]')?.getAttribute('data-focus')).toBe('JK');
    // Keep the last chant member populated to catch a stale-name regression.
    audio.chantPhase = 'done'; audio.audioSource = 'streamed';
    render();
    expect(host.querySelector('[data-testid="arena"]')?.getAttribute('data-focus')).toBe('group');
    act(() => vi.advanceTimersByTime(16000));
    audio.isChorus = true; audio.strobeId = 1;
    render();
    expect(host.querySelector('[data-testid="arena"]')?.getAttribute('data-focus')).toBe('group');
  } finally {
    act(() => root.unmount());
    vi.useRealTimers(); vi.unstubAllGlobals();
  }
});
