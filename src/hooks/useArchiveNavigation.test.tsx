import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseArchiveHash, serializeArchiveRoute, useArchiveNavigation } from './useArchiveNavigation';

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  window.history.replaceState(null, '', '#/overview');
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });

describe('archive navigation', () => {
  it('round-trips album filters and a song detail through its bookmark', () => {
    const route = parseArchiveHash('#/discography/song/7/42?type=Studio&era=Love+Yourself&category=group');
    expect(route.filters).toEqual({ type: 'Studio', era: 'Love Yourself', category: 'group' });
    expect(route.discography).toEqual({ view: 'song', selectedAlbumId: 7, selectedSongId: 42 });
    expect(parseArchiveHash(serializeArchiveRoute(route))).toEqual(route);
  });
  it('supports songs without an album and rejects malformed record ids', () => {
    expect(parseArchiveHash('#/discography/song/0/42').discography).toEqual({ view: 'song', selectedAlbumId: null, selectedSongId: 42 });
    expect(parseArchiveHash('#/discography/album/NaN').discography.view).toBe('grid');
    expect(parseArchiveHash('#/discography/album/-3').discography.view).toBe('grid');
  });
  it('round-trips query punctuation and moods', () => {
    const route = { ...parseArchiveHash('#/search'), searchQuery: 'Love & "Hope"?', searchMood: null };
    expect(parseArchiveHash(serializeArchiveRoute(route)).searchQuery).toBe(route.searchQuery);
    expect(parseArchiveHash('#/search?mood=calm').searchMood).toBe('calm');
  });
  it('adds history entries for navigation and restores route on browser Back', async () => {
    function Harness() {
      const { route, navigate } = useArchiveNavigation();
      return <><output>{route.section}</output><button onClick={() => navigate({ section: 'discography' })}>Browse</button><button onClick={() => navigate({ section: 'members' })}>Members</button></>;
    }
    await act(async () => root.render(<Harness />));
    const previousLength = window.history.length;
    await act(async () => host.querySelectorAll('button')[0].click());
    await act(async () => host.querySelectorAll('button')[1].click());
    expect(window.history.length).toBe(previousLength + 2);
    await act(async () => {
      window.history.back();
      await vi.waitFor(() => expect(window.location.hash).toBe('#/discography'));
    });
    expect(host.querySelector('output')?.textContent).toBe('discography');
  });
});
