import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Album } from '../types/database';
import { ALBUMS } from '../data/albums';
import { getCoverArtUrl } from '../data/coverArt';
import type { AsyncResource } from './types';

interface UseAlbumsResult extends AsyncResource {
    albums: Album[];
}

export function useAlbums(): UseAlbumsResult {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAlbums = async () => {
        if (!isSupabaseConfigured()) {
            setAlbums(ALBUMS.map(a => ({
                id: a.id,
                title: a.title,
                title_korean: a.titleKorean || null,
                release_date: a.releaseDate,
                type: a.type,
                track_count: a.trackCount,
                description: a.description,
                era: a.era,
                cover_color: a.coverColor,
                spotify_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                cover_art_url: a.coverArtUrl || null,
                total_sales: null,
                label: null,
            })));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('albums')
                .select('*')
                .order('release_date', { ascending: true });

            if (dbError) throw dbError;

            const albums = (data || []) as Album[];
            const enriched = albums.map(album => {
                if (!album.cover_art_url) {
                    const url = getCoverArtUrl(album.title);
                    if (url) return { ...album, cover_art_url: url };
                }
                return album;
            });
            setAlbums(enriched);
        } catch (err) {
            console.error('Failed to fetch albums:', err);
            setError(err as Error);
            setAlbums(ALBUMS.map(a => ({
                id: a.id,
                title: a.title,
                title_korean: a.titleKorean || null,
                release_date: a.releaseDate,
                type: a.type,
                track_count: a.trackCount,
                description: a.description,
                era: a.era,
                cover_color: a.coverColor,
                spotify_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                cover_art_url: a.coverArtUrl || null,
                total_sales: null,
                label: null,
            })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    return { albums, loading, error, refetch: fetchAlbums };
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
