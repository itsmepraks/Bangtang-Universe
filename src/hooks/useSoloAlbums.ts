import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SoloAlbum } from '../types/database';
import { SOLO_ALBUMS } from '../data/soloAlbums';
import type { AsyncResource } from './types';

interface UseSoloAlbumsResult extends AsyncResource {
    soloAlbums: SoloAlbum[];
}

export function useSoloAlbums(): UseSoloAlbumsResult {
    const [soloAlbums, setSoloAlbums] = useState<SoloAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSoloAlbums = async () => {
        if (!isSupabaseConfigured()) {
            console.log('💿 Using local solo album data (Supabase not configured)');
            setSoloAlbums(SOLO_ALBUMS);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('solo_albums')
                .select('*')
                .order('release_date', { ascending: true });

            if (dbError) throw dbError;

            setSoloAlbums(data || []);
            console.log(`💿 Loaded ${data?.length || 0} solo albums from database`);
        } catch (err) {
            console.error('Failed to fetch solo albums:', err);
            setError(err as Error);
            setSoloAlbums(SOLO_ALBUMS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoloAlbums();
    }, []);

    return { soloAlbums, loading, error, refetch: fetchSoloAlbums };
}

export function useSoloAlbumsByMember(memberId: string) {
    const { soloAlbums, loading, error } = useSoloAlbums();
    const filtered = useMemo(
        () => soloAlbums.filter(a => a.member_id === memberId),
        [soloAlbums, memberId]
    );
    return { soloAlbums: filtered, loading, error };
}

export default useSoloAlbums;
