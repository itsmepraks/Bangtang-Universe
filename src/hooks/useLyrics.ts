import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Lyrics } from '../types/database';

interface UseLyricsResult {
    lyrics: Lyrics[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useLyrics(): UseLyricsResult {
    const [lyrics, setLyrics] = useState<Lyrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchLyrics = async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('lyrics')
                .select('*')
                .order('song_id', { ascending: true });

            if (dbError) throw dbError;

            setLyrics(data || []);
        } catch (err) {
            console.error('Failed to fetch lyrics:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLyrics();
    }, []);

    return { lyrics, loading, error, refetch: fetchLyrics };
}

export function useLyricsBySongId(songId: number) {
    const { lyrics, loading, error } = useLyrics();
    const lyric = useMemo(
        () => lyrics.find(l => l.song_id === songId) || null,
        [lyrics, songId]
    );
    return { lyric, loading, error };
}

export default useLyrics;
