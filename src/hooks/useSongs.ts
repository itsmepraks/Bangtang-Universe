import { useMemo } from 'react';
import type { Song } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseSongsResult extends AsyncResource {
    songs: Song[];
}

export function useSongs(): UseSongsResult {
    const { data: songs, loading, error, refetch } = useCatalogResource('songs');
    return { songs, loading, error, refetch };
}

export function useSongsByAlbum(albumId: number) {
    const { songs, loading, error } = useSongs();
    const filteredSongs = useMemo(
        () => songs.filter(s => s.album_id === albumId),
        [songs, albumId]
    );
    return { songs: filteredSongs, loading, error };
}

export function useSongsBySentiment(sentiment: string) {
    const { songs, loading, error } = useSongs();
    const filteredSongs = useMemo(
        () => songs.filter(s => s.sentiment === sentiment),
        [songs, sentiment]
    );
    return { songs: filteredSongs, loading, error };
}

export function useTitleTracks() {
    const { songs, loading, error } = useSongs();
    const titleTracks = useMemo(
        () => songs.filter(s => s.is_title_track),
        [songs]
    );
    return { songs: titleTracks, loading, error };
}

export function useSongById(id: number) {
    const { songs, loading, error } = useSongs();
    return {
        song: songs.find(s => s.id === id) || null,
        loading,
        error,
    };
}

export function useSongsSortedBy(feature: 'bpm' | 'energy' | 'valence' | 'danceability', ascending = false) {
    const { songs, loading, error } = useSongs();

    const sortedSongs = useMemo(() => {
        return [...songs]
            .filter(s => s[feature] != null)
            .sort((a, b) => {
                const aVal = a[feature]!;
                const bVal = b[feature]!;
                return ascending ? aVal - bVal : bVal - aVal;
            });
    }, [songs, feature, ascending]);

    return { songs: sortedSongs, loading, error };
}

export function useSongsByMember(memberName: string) {
    const { songs, loading, error } = useSongs();
    const filtered = useMemo(
        () => songs.filter(s => (s.member_credits || []).some(
            c => c.toLowerCase().includes(memberName.toLowerCase())
        )),
        [songs, memberName]
    );
    return { songs: filtered, loading, error };
}

export function useSongsByWriter(writerName: string) {
    const { songs, loading, error } = useSongs();
    const filtered = useMemo(
        () => songs.filter(s => (s.writers || []).some(
            w => w.toLowerCase().includes(writerName.toLowerCase())
        )),
        [songs, writerName]
    );
    return { songs: filtered, loading, error };
}

export default useSongs;
