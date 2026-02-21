/**
 * useSearch Hook
 *
 * Wraps Fuse.js search with live data from Supabase hooks.
 * Fuse instances are recreated when data changes.
 */

import { useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useSongs } from './useSongs';
import { useMembers } from './useMembers';
import { useAlbums } from './useAlbums';
import type { Song } from '../types/database';
import {
    SONG_FUSE_OPTIONS,
    MEMBER_FUSE_OPTIONS,
    ALBUM_FUSE_OPTIONS,
    mapSongResult,
    mapMemberResult,
    mapAlbumResult,
    MOOD_MAP,
    type SearchResult,
} from '../services/searchService';

export { type SearchResult } from '../services/searchService';

interface UseSearchResult {
    searchSongs: (query: string, limit?: number) => SearchResult[];
    searchMembers: (query: string, limit?: number) => SearchResult[];
    searchAlbums: (query: string, limit?: number) => SearchResult[];
    searchAll: (query: string, limit?: number) => SearchResult[];
    getSuggestions: (query: string, limit?: number) => string[];
    searchByMood: (mood: string) => Song[];
    loading: boolean;
}

export function useSearch(): UseSearchResult {
    const { songs, loading: songsLoading } = useSongs();
    const { members, loading: membersLoading } = useMembers();
    const { albums, loading: albumsLoading } = useAlbums();

    const songFuse = useMemo(() => new Fuse(songs, SONG_FUSE_OPTIONS), [songs]);
    const memberFuse = useMemo(() => new Fuse(members, MEMBER_FUSE_OPTIONS), [members]);
    const albumFuse = useMemo(() => new Fuse(albums, ALBUM_FUSE_OPTIONS), [albums]);

    const loading = songsLoading || membersLoading || albumsLoading;

    const searchSongs = useCallback((query: string, limit = 10): SearchResult[] => {
        if (!query.trim()) return [];
        return songFuse.search(query, { limit }).map(mapSongResult);
    }, [songFuse]);

    const searchMembers = useCallback((query: string, limit = 7): SearchResult[] => {
        if (!query.trim()) return [];
        return memberFuse.search(query, { limit }).map(mapMemberResult);
    }, [memberFuse]);

    const searchAlbums = useCallback((query: string, limit = 10): SearchResult[] => {
        if (!query.trim()) return [];
        return albumFuse.search(query, { limit }).map(mapAlbumResult);
    }, [albumFuse]);

    const searchAll = useCallback((query: string, limit = 15): SearchResult[] => {
        if (!query.trim()) return [];

        const allResults = [
            ...searchSongs(query, limit),
            ...searchMembers(query, limit),
            ...searchAlbums(query, limit)
        ]
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return allResults;
    }, [searchSongs, searchMembers, searchAlbums]);

    const getSuggestions = useCallback((query: string, limit = 5): string[] => {
        if (!query.trim() || query.length < 2) return [];

        const suggestions = new Set<string>();

        searchSongs(query, 3).forEach(r => suggestions.add(r.title));
        searchMembers(query, 2).forEach(r => suggestions.add(r.title));

        songs.forEach(s => {
            (s.keywords || []).forEach(k => {
                if (k.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.add(k);
                }
            });
        });

        return Array.from(suggestions).slice(0, limit);
    }, [searchSongs, searchMembers, songs]);

    const searchByMood = useCallback((mood: string): Song[] => {
        const sentiments = MOOD_MAP[mood.toLowerCase()] || [];
        return songs.filter(s => sentiments.includes(s.sentiment || ''));
    }, [songs]);

    return {
        searchSongs,
        searchMembers,
        searchAlbums,
        searchAll,
        getSuggestions,
        searchByMood,
        loading
    };
}

export default useSearch;
