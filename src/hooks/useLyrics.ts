import { useMemo } from 'react';
import type { Lyrics } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseLyricsResult extends AsyncResource {
    lyrics: Lyrics[];
}

export function useLyrics(enabled = true): UseLyricsResult {
    const { data: lyrics, loading, error, refetch } = useCatalogResource('lyrics', enabled);
    return { lyrics, loading, error, refetch };
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
