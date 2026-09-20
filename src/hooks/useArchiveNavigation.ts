import { useEffect, useRef, useState } from 'react';
import { isDashboardSection, type DashboardSection, type DiscographyState } from '../types';

export interface DiscographyFilters {
  category: 'all' | 'group' | 'solo' | 'collab';
  type: string | null;
  era: string | null;
}
export interface ArchiveRoute {
  section: DashboardSection;
  discography: DiscographyState;
  filters: DiscographyFilters;
  memberId: string | null;
  analyticsTab: string | null;
  searchQuery: string;
  searchMood: string | null;
}
const positiveId = (value?: string) => value && /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;

export function parseArchiveHash(hash: string): ArchiveRoute {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/');
  const params = new URLSearchParams(query);
  const category = params.get('category');
  const albumId = positiveId(parts[2]);
  const songId = parts[1] === 'song' ? positiveId(parts[3]) : null;
  return {
    section: isDashboardSection(parts[0]) ? parts[0] : 'overview',
    discography: {
      selectedAlbumId: albumId,
      selectedSongId: songId,
      view: songId ? 'song' : parts[1] === 'album' && albumId ? 'album' : 'grid',
    },
    filters: {
      category: category === 'group' || category === 'solo' || category === 'collab' ? category : 'all',
      type: params.get('type'), era: params.get('era'),
    },
    memberId: parts[0] === 'members' ? parts[1] || null : null,
    analyticsTab: parts[0] === 'analytics' ? parts[1] || null : null,
    searchQuery: params.get('q') || '',
    searchMood: params.get('mood'),
  };
}

export function serializeArchiveRoute(route: ArchiveRoute): string {
  let path = `#/${route.section}`;
  const params = new URLSearchParams();
  if (route.section === 'discography') {
    const { view, selectedAlbumId, selectedSongId } = route.discography;
    if (view === 'song' && selectedSongId) path += `/song/${selectedAlbumId || 0}/${selectedSongId}`;
    else if (view === 'album' && selectedAlbumId) path += `/album/${selectedAlbumId}`;
    if (route.filters.category !== 'all') params.set('category', route.filters.category);
    if (route.filters.type) params.set('type', route.filters.type);
    if (route.filters.era) params.set('era', route.filters.era);
  }
  if (route.section === 'members' && route.memberId) path += `/${route.memberId}`;
  if (route.section === 'analytics' && route.analyticsTab) path += `/${route.analyticsTab}`;
  if (route.section === 'search') {
    if (route.searchQuery) params.set('q', route.searchQuery);
    if (route.searchMood) params.set('mood', route.searchMood);
  }
  return path + (params.size ? `?${params}` : '');
}

export function useArchiveNavigation() {
  const [route, setRoute] = useState(() => parseArchiveHash(window.location.hash));
  const routeRef = useRef(route);
  useEffect(() => {
    const restore = () => {
      // The skip link is an in-page anchor, not an archive destination.
      if (window.location.hash === '#main-content') return;
      const next = parseArchiveHash(window.location.hash);
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, []);
  const navigate = (patch: Partial<ArchiveRoute>, replace = false) => {
    const next = { ...routeRef.current, ...patch };
    const hash = serializeArchiveRoute(next);
    if (window.location.hash !== hash) {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', hash);
    }
    routeRef.current = next;
    setRoute(next);
  };
  return { route, navigate };
}
