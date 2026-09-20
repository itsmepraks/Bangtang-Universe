import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { Album } from '../../types/database';
import AlbumArtwork from './AlbumArtwork';

it('replaces a failed external cover with a labeled placeholder and can show a different album', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  const root = createRoot(host);
  const album = { title: 'Test release', cover_art_url: 'http://covers.example/first.jpg' } as Album;
  try {
    await act(async () => root.render(<AlbumArtwork album={album} />));
    expect(host.querySelector('img')?.getAttribute('src')).toBe('https://covers.example/first.jpg');
    await act(async () => host.querySelector('img')!.dispatchEvent(new Event('error')));
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.album-artwork-fallback')?.textContent).toBe('Test release');
    await act(async () => root.render(<AlbumArtwork album={{ ...album, cover_art_url: 'https://covers.example/second.jpg' }} />));
    expect(host.querySelector('img')?.getAttribute('src')).toBe('https://covers.example/second.jpg');
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});
