import { useMemo } from 'react';
import type { Album } from '../types/database';
import { getCoverArtUrl } from '../data/coverArt';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseAlbumsResult extends AsyncResource {
    albums: Album[];
}

export function useAlbums(): UseAlbumsResult {
    const { data, loading, error, refetch } = useCatalogResource('albums');
    const albums = useMemo(() => data.map((album: Album) => {
        if (album.cover_art_url) return album;
        const url = getCoverArtUrl(album.title);
        return url ? { ...album, cover_art_url: url } : album;
    }), [data]);
    return { albums, loading, error, refetch };
}

export function useAlbumsByEra(era: string) {
    const { albums, loading, error } = useAlbums();
    return {
        albums: albums.filter(a => a.era === era),
        loading,
        error,
    };
}

export function useAlbumById(id: number) {
    const { albums, loading, error } = useAlbums();
    return {
        album: albums.find(a => a.id === id) || null,
        loading,
        error,
    };
}

export function useEras() {
    const { albums, loading, error } = useAlbums();
    const eras = useMemo(
        () => [...new Set(albums.map(a => a.era).filter(Boolean))].sort() as string[],
        [albums]
    );
    return { eras, loading, error };
}

export function useAlbumsGroupedByEra() {
    const { albums, loading, error } = useAlbums();
    const grouped = useMemo(() => {
        const map: Record<string, Album[]> = {};
        albums.forEach(a => {
            if (!a.era) return;
            if (!map[a.era]) map[a.era] = [];
            map[a.era].push(a);
        });
        return map;
    }, [albums]);
    return { grouped, loading, error };
}

export default useAlbums;
