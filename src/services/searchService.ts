/**
 * Search Service - Fuse.js Integration
 * 
 * Provides fuzzy search across songs, members, and albums
 * using the Fuse.js library for client-side search.
 */

import Fuse from 'fuse.js';
import { SONGS, type Song } from '../data/songs';
import { MEMBER_DATA, type ExtendedMember } from '../data/members';
import { ALBUMS, type Album } from '../data/albums';

// ============ SEARCH RESULT TYPES ============

export interface SearchResult {
    id: number | string;
    type: 'song' | 'member' | 'album';
    title: string;
    subtitle: string;
    score: number; // 0-100, higher is better
    context: string;
    color?: string;
    item: Song | ExtendedMember | Album;
}

// ============ FUSE INSTANCES ============

// Song search configuration
const songFuse = new Fuse(SONGS, {
    keys: [
        { name: 'title', weight: 0.4 },
        { name: 'album', weight: 0.2 },
        { name: 'keywords', weight: 0.25 },
        { name: 'sentiment', weight: 0.1 },
        { name: 'writers', weight: 0.05 }
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
});

// Member search configuration
const memberFuse = new Fuse(MEMBER_DATA, {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'full', weight: 0.25 },
        { name: 'role', weight: 0.15 },
        { name: 'bio', weight: 0.2 },
        { name: 'soloTracks', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
});

// Album search configuration
const albumFuse = new Fuse(ALBUMS, {
    keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'era', weight: 0.2 },
        { name: 'type', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
});

// ============ SEARCH FUNCTIONS ============

/**
 * Search songs by query
 */
export const searchSongs = (query: string, limit = 10): SearchResult[] => {
    if (!query.trim()) return [];

    const results = songFuse.search(query, { limit });

    return results.map(r => ({
        id: r.item.id,
        type: 'song' as const,
        title: r.item.title,
        subtitle: r.item.album,
        score: Math.round((1 - (r.score || 0)) * 100),
        context: `${r.item.sentiment} • ${r.item.bpm} BPM • ${r.item.keywords.slice(0, 3).join(', ')}`,
        item: r.item
    }));
};

/**
 * Search members by query
 */
export const searchMembers = (query: string, limit = 7): SearchResult[] => {
    if (!query.trim()) return [];

    const results = memberFuse.search(query, { limit });

    return results.map(r => ({
        id: r.item.id,
        type: 'member' as const,
        title: r.item.name,
        subtitle: r.item.full,
        score: Math.round((1 - (r.score || 0)) * 100),
        context: r.item.role,
        color: r.item.color,
        item: r.item
    }));
};

/**
 * Search albums by query
 */
export const searchAlbums = (query: string, limit = 10): SearchResult[] => {
    if (!query.trim()) return [];

    const results = albumFuse.search(query, { limit });

    return results.map(r => ({
        id: r.item.id,
        type: 'album' as const,
        title: r.item.title,
        subtitle: `${r.item.type} • ${r.item.releaseDate.split('-')[0]}`,
        score: Math.round((1 - (r.score || 0)) * 100),
        context: r.item.era,
        color: r.item.coverColor,
        item: r.item
    }));
};

/**
 * Unified search across all content types
 */
export const searchAll = (query: string, limit = 15): SearchResult[] => {
    if (!query.trim()) return [];

    const songs = searchSongs(query, limit);
    const members = searchMembers(query, limit);
    const albums = searchAlbums(query, limit);

    // Combine and sort by score
    const allResults = [...songs, ...members, ...albums]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return allResults;
};

/**
 * Get search suggestions (autocomplete)
 */
export const getSuggestions = (query: string, limit = 5): string[] => {
    if (!query.trim() || query.length < 2) return [];

    const suggestions = new Set<string>();

    // Add song titles
    searchSongs(query, 3).forEach(r => suggestions.add(r.title));

    // Add member names
    searchMembers(query, 2).forEach(r => suggestions.add(r.title));

    // Add keywords that match
    SONGS.forEach(s => {
        s.keywords.forEach(k => {
            if (k.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(k);
            }
        });
    });

    return Array.from(suggestions).slice(0, limit);
};

/**
 * Search by sentiment/mood
 */
export const searchByMood = (mood: string): Song[] => {
    const moodMap: Record<string, string[]> = {
        happy: ['Joy', 'Celebration', 'Confidence'],
        sad: ['Pain', 'Melancholy', 'Longing'],
        energetic: ['Determination', 'Empowerment', 'Celebration'],
        calm: ['Comfort', 'Reflection', 'Hope'],
        romantic: ['Love', 'Longing'],
        motivational: ['Determination', 'Empowerment', 'Hope']
    };

    const sentiments = moodMap[mood.toLowerCase()] || [];
    return SONGS.filter(s => sentiments.includes(s.sentiment));
};

export default {
    searchSongs,
    searchMembers,
    searchAlbums,
    searchAll,
    getSuggestions,
    searchByMood
};
