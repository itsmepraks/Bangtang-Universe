import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchResult } from '../../../services/searchService';
import type { Award, Song } from '../../../types/database';
import SearchSection from './SearchSection';

const search = vi.hoisted(() => ({ searchAllAsync: vi.fn(), searchByMood: vi.fn() }));
vi.mock('../../../hooks', () => ({ useSearch: () => search }));
let root: Root; let host: HTMLDivElement;
const props = { songs: [], members: [], albums: [], awards: [], concerts: [], onSelectSong: vi.fn(), onNavigate: vi.fn(), onSearchStateChange: vi.fn() };
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.clearAllMocks(); search.searchByMood.mockReturnValue([]); search.searchAllAsync.mockResolvedValue([]);
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
const songResult = (title: string): SearchResult => ({ id: 1, type: 'song', title, subtitle: '', context: '', score: 90, item: { id: 1, title } as Song });

describe('search interactions', () => {
  it('shows suggestions instead of an empty-result claim before a search', async () => {
    await act(async () => root.render(<SearchSection {...props} />));
    expect(host.textContent).toContain('Dynamite');
    expect(host.textContent).not.toContain('No matching records');
    expect(search.searchAllAsync).not.toHaveBeenCalled();
  });
  it('does not let an old response overwrite a newer query', async () => {
    let resolveOld!: (results: SearchResult[]) => void;
    search.searchAllAsync.mockImplementation((query: string) => query === 'old' ? new Promise(resolve => { resolveOld = resolve; }) : Promise.resolve([songResult('New result')]));
    await act(async () => root.render(<SearchSection {...props} initialQuery="old" />));
    await act(async () => root.render(<SearchSection {...props} initialQuery="new" />));
    await act(async () => resolveOld([songResult('Old result')]));
    expect(host.textContent).toContain('New result');
    expect(host.textContent).not.toContain('Old result');
  });
  it('applies a bookmarked mood', async () => {
    search.searchByMood.mockReturnValue([{ id: 1, title: 'Quiet song', bpm: 80 }]);
    await act(async () => root.render(<SearchSection {...props} initialMood="calm" />));
    expect(search.searchByMood).toHaveBeenCalledWith('calm');
    expect(host.textContent).toContain('Quiet song');
    expect(host.textContent).not.toContain('100%');
  });
  it('opens award details with an onward destination', async () => {
    const award = { id: 2, name: 'Test award', ceremony: 'Test ceremony', year: 2024, result: 'won' } as Award;
    search.searchAllAsync.mockResolvedValue([{ id: 2, type: 'award', title: award.name, item: award, score: 80, subtitle: '', context: 'Test ceremony' }]);
    await act(async () => root.render(<SearchSection {...props} initialQuery="award" />));
    const result = [...host.querySelectorAll('button')].find(b => b.textContent?.includes('Test award'))!;
    await act(async () => result.click());
    expect(host.querySelector('[aria-label="Selected record"]')?.textContent).toContain('Test award');
    await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === 'Browse all awards')!.click());
    expect(props.onNavigate).toHaveBeenCalledWith('awards');
  });
});
