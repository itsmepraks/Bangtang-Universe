// Data is passed in (already fetched in App) to avoid duplicate Supabase reads.
// searchAllAsync uses the RAG API when configured, else Supabase, else local Fuse.

import { useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Song, Member, Album, Award, Concert } from '../types/database';
import {
    SONG_FUSE_OPTIONS,
    MEMBER_FUSE_OPTIONS,
    ALBUM_FUSE_OPTIONS,
    AWARD_FUSE_OPTIONS,
    CONCERT_FUSE_OPTIONS,
    mapSongResult,
    mapMemberResult,
    mapAlbumResult,
    mapAwardResult,
    mapConcertResult,
    MOOD_MAP,
    type SearchResult,
} from '../services/searchService';
import { isAiSearchConfigured, searchWithAi } from '../services/aiSearchService';
import { searchWithSupabase } from '../services/supabaseSearchService';
import { isSupabaseConfigured } from '../lib/supabase';

export { type SearchResult } from '../services/searchService';
export { isAiSearchConfigured } from '../services/aiSearchService';

interface UseSearchResult {
    searchSongs: (query: string, limit?: number) => SearchResult[];
    searchMembers: (query: string, limit?: number) => SearchResult[];
    searchAlbums: (query: string, limit?: number) => SearchResult[];
    searchAwards: (query: string, limit?: number) => SearchResult[];
    searchConcerts: (query: string, limit?: number) => SearchResult[];
    searchAll: (query: string, limit?: number) => SearchResult[];
    searchAllAsync: (query: string, limit?: number) => Promise<SearchResult[]>;
    getSuggestions: (query: string, limit?: number) => string[];
    searchByMood: (mood: string) => Song[];
    isAiSearchConfigured: () => boolean;
    isSupabaseSearchEnabled: () => boolean;
}

export function useSearch(
    songs: Song[],
    members: Member[],
    albums: Album[],
    awards: Award[],
    concerts: Concert[],
): UseSearchResult {
    const songFuse = useMemo(() => new Fuse(songs, SONG_FUSE_OPTIONS), [songs]);
    const memberFuse = useMemo(() => new Fuse(members, MEMBER_FUSE_OPTIONS), [members]);
    const albumFuse = useMemo(() => new Fuse(albums, ALBUM_FUSE_OPTIONS), [albums]);
    const awardFuse = useMemo(() => new Fuse(awards, AWARD_FUSE_OPTIONS), [awards]);
    const concertFuse = useMemo(() => new Fuse(concerts, CONCERT_FUSE_OPTIONS), [concerts]);

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

    const searchAwards = useCallback((query: string, limit = 10): SearchResult[] => {
        if (!query.trim()) return [];
        return awardFuse.search(query, { limit }).map(mapAwardResult);
    }, [awardFuse]);

    const searchConcerts = useCallback((query: string, limit = 10): SearchResult[] => {
        if (!query.trim()) return [];
        return concertFuse.search(query, { limit }).map(mapConcertResult);
    }, [concertFuse]);

    const searchAll = useCallback((query: string, limit = 15): SearchResult[] => {
        if (!query.trim()) return [];

        const allResults = [
            ...searchSongs(query, limit),
            ...searchMembers(query, limit),
            ...searchAlbums(query, limit),
            ...searchAwards(query, limit),
            ...searchConcerts(query, limit),
        ]
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return allResults;
    }, [searchSongs, searchMembers, searchAlbums, searchAwards, searchConcerts]);

    const searchAllAsync = useCallback(async (query: string, limit = 15): Promise<SearchResult[]> => {
        if (!query.trim()) return [];
        if (isAiSearchConfigured()) {
            try {
                return await searchWithAi(query, limit);
            } catch {
                return searchAll(query, limit);
            }
        }
        if (isSupabaseConfigured()) {
            try {
                const supabaseResults = await searchWithSupabase(query, limit);
                if (supabaseResults.length > 0) return supabaseResults;
            } catch {
                // fall through to local
            }
        }
        return Promise.resolve(searchAll(query, limit));
    }, [searchAll]);

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
        searchAwards,
        searchConcerts,
        searchAll,
        searchAllAsync,
        getSuggestions,
        searchByMood,
        isAiSearchConfigured,
        isSupabaseSearchEnabled: isSupabaseConfigured,
    };
}

export default useSearch;
