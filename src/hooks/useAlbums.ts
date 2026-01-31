/**
 * useAlbums Hook
 * 
 * Fetches album data from Supabase database
 * Falls back to local data if database is unavailable
 */

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Album } from '../types/database';
import { ALBUMS } from '../data/albums';

interface UseAlbumsResult {
    albums: Album[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useAlbums(): UseAlbumsResult {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAlbums = async () => {
        // If Supabase isn't configured, use local data
        if (!isSupabaseConfigured()) {
            console.log('📀 Using local album data (Supabase not configured)');
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

            setAlbums(data || []);
            console.log(`📀 Loaded ${data?.length || 0} albums from database`);
        } catch (err) {
            console.error('Failed to fetch albums:', err);
            setError(err as Error);
            // Fallback to local data
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

// Helper hooks for specific queries
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

export default useAlbums;
