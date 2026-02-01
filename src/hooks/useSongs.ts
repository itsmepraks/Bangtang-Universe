/**
 * useSongs Hook
 * 
 * Fetches song data from Supabase database
 * Falls back to local data if database is unavailable
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Song } from '../types/database';
import { SONGS, type Song as LocalSong } from '../data/songs';

interface UseSongsResult {
    songs: Song[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// Convert local song format to database format
function convertLocalSong(s: LocalSong): Song {
    return {
        id: s.id,
        title: s.title,
        title_korean: s.titleKorean || null,
        album_id: s.albumId,
        release_date: s.releaseDate,
        duration_seconds: s.duration,
        bpm: s.bpm,
        energy: s.energy,
        valence: s.valence,
        danceability: s.danceability,
        acousticness: s.acousticness,
        sentiment: s.sentiment,
        keywords: s.keywords,
        writers: s.writers,
        producers: s.producers,
        member_credits: s.memberCredits,
        is_title_track: s.isTitle,
        has_mv: s.hasMV,
        spotify_id: null,
        created_at: new Date().toISOString(),
    };
}

export function useSongs(): UseSongsResult {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSongs = async () => {
        if (!isSupabaseConfigured()) {
            console.log('🎵 Using local song data (Supabase not configured)');
            setSongs(SONGS.map(convertLocalSong));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('songs')
                .select('*')
                .order('release_date', { ascending: true });

            if (dbError) throw dbError;

            setSongs(data || []);
            console.log(`🎵 Loaded ${data?.length || 0} songs from database`);
        } catch (err) {
            console.error('Failed to fetch songs:', err);
            setError(err as Error);
            setSongs(SONGS.map(convertLocalSong));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    return { songs, loading, error, refetch: fetchSongs };
}

// Get songs by album
export function useSongsByAlbum(albumId: number) {
    const { songs, loading, error } = useSongs();
    const filteredSongs = useMemo(
        () => songs.filter(s => s.album_id === albumId),
        [songs, albumId]
    );
    return { songs: filteredSongs, loading, error };
}

// Get songs by sentiment
export function useSongsBySentiment(sentiment: string) {
    const { songs, loading, error } = useSongs();
    const filteredSongs = useMemo(
        () => songs.filter(s => s.sentiment === sentiment),
        [songs, sentiment]
    );
    return { songs: filteredSongs, loading, error };
}

// Get title tracks only
export function useTitleTracks() {
    const { songs, loading, error } = useSongs();
    const titleTracks = useMemo(
        () => songs.filter(s => s.is_title_track),
        [songs]
    );
    return { songs: titleTracks, loading, error };
}

// Get song by ID
export function useSongById(id: number) {
    const { songs, loading, error } = useSongs();
    return {
        song: songs.find(s => s.id === id) || null,
        loading,
        error,
    };
}

// Get songs sorted by a feature
export function useSongsSortedBy(feature: 'bpm' | 'energy' | 'valence' | 'danceability', ascending = false) {
    const { songs, loading, error } = useSongs();

    const sortedSongs = useMemo(() => {
        return [...songs].sort((a, b) => {
            const aVal = a[feature] ?? 0;
            const bVal = b[feature] ?? 0;
            return ascending ? aVal - bVal : bVal - aVal;
        });
    }, [songs, feature, ascending]);

    return { songs: sortedSongs, loading, error };
}

export default useSongs;
