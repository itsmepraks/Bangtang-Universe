# Supabase Live Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Supabase the single source of truth for all 5 tables, and wire search/export services to use live data instead of static imports.

**Architecture:** Hook-driven approach. All Supabase fetching lives in React hooks with local fallback. Services accept data as parameters. Components pass hook data into services.

**Tech Stack:** React 19, TypeScript 5.9, Supabase JS 2.93, Fuse.js 7.1, Vite 7.2

---

## Task 1: Create Solo Albums Fallback Data

**Files:**
- Create: `src/data/soloAlbums.ts`

**Step 1: Create the solo albums data file**

Extract `soloAlbums` from each member in `src/data/members.ts` (the `ExtendedMember.soloAlbums` field) into a flat array matching the `SoloAlbum` DB type from `src/types/database.ts`.

```ts
/**
 * BTS Solo Albums Data - Local Fallback
 *
 * Extracted from member profiles for offline fallback.
 */

import type { SoloAlbum } from '../types/database';

export const SOLO_ALBUMS: SoloAlbum[] = [
    // RM
    {
        id: 1,
        member_id: 'rm',
        title: 'RM (Mixtape)',
        release_date: '2015-03-20',
        type: 'Mixtape',
        tracks: ['Voice', 'Do You', 'Awakening', 'Monster', 'Throw Away', 'Joke', 'God Rap', 'Rush', 'Life', 'Adrift'],
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        member_id: 'rm',
        title: 'mono.',
        release_date: '2018-10-23',
        type: 'Mixtape',
        tracks: ['tokyo', 'seoul', 'moonchild', 'badbye', 'uhgood', 'everythingoes', 'forever rain'],
        created_at: new Date().toISOString(),
    },
    {
        id: 3,
        member_id: 'rm',
        title: 'Indigo',
        release_date: '2022-12-02',
        type: 'Studio',
        tracks: ['Yun', 'Still Life', 'All Day', 'Lonely', 'Change pt.2', 'Closer', 'Wild Flower', 'Hectic', 'Forg_tful', 'No.2'],
        created_at: new Date().toISOString(),
    },
    {
        id: 4,
        member_id: 'rm',
        title: 'Right Place, Wrong Person',
        release_date: '2024-05-24',
        type: 'Studio',
        tracks: ['Right Place, Wrong Person', 'Nuts', 'out of love', 'Domodachi', 'Heaven', 'Lost', 'LOST!!!', 'Around the world in a day', 'Groin', 'Come back to me', '?'],
        created_at: new Date().toISOString(),
    },
    // JIN
    {
        id: 5,
        member_id: 'jin',
        title: 'Happy',
        release_date: '2024-11-15',
        type: 'Studio',
        tracks: ['Running Wild', "I'll Be There", 'Another Level', 'Until It Reaches You', 'Heart on the Window', 'In Yearning/Longing'],
        created_at: new Date().toISOString(),
    },
    // SUGA
    {
        id: 6,
        member_id: 'suga',
        title: 'Agust D',
        release_date: '2016-08-15',
        type: 'Mixtape',
        tracks: ['Intro: Dt sugA', 'Agust D', 'Give It To Me', 'Skit', 'Tony Montana', 'Interlude: Dream, Reality', 'So Far Away', 'The Last', '724148'],
        created_at: new Date().toISOString(),
    },
    {
        id: 7,
        member_id: 'suga',
        title: 'D-2',
        release_date: '2020-05-22',
        type: 'Mixtape',
        tracks: ['Moonlight', 'Daechwita', 'What Do You Think?', 'Strange', '28', 'Burn It', 'People', 'Honsool', 'Interlude: Set Me Free', 'Dear My Friend'],
        created_at: new Date().toISOString(),
    },
    {
        id: 8,
        member_id: 'suga',
        title: 'D-DAY',
        release_date: '2023-04-21',
        type: 'Studio',
        tracks: ['D-Day', 'Haegeum', 'Amygdala', 'SDL', 'People Pt.2', 'Polar Night', 'Interlude: Dawn', 'AMYGDALA', 'Snooze', 'Life Goes On'],
        created_at: new Date().toISOString(),
    },
    // J-HOPE
    {
        id: 9,
        member_id: 'jh',
        title: 'Hope World',
        release_date: '2018-03-02',
        type: 'Mixtape',
        tracks: ['Hope World', 'P.O.P (Piece of Peace) Pt.1', 'Daydream', 'Base Line', 'Hangsang', 'Airplane', 'Blue Side'],
        created_at: new Date().toISOString(),
    },
    {
        id: 10,
        member_id: 'jh',
        title: 'Jack In The Box',
        release_date: '2022-07-15',
        type: 'Studio',
        tracks: ['Intro', "Pandora's Box", 'MORE', 'STOP', 'Equal Sign', '= (Equal Sign)', 'Music Box: Reflection', 'What If...', 'Safety Zone', 'Future', 'Arson'],
        created_at: new Date().toISOString(),
    },
    {
        id: 11,
        member_id: 'jh',
        title: 'HOPE ON THE STREET VOL.1',
        release_date: '2024-03-29',
        type: 'EP',
        tracks: ['on the street', 'i wonder...', 'lock / unlock', "i don't know", 'NEURON', 'Dejavu'],
        created_at: new Date().toISOString(),
    },
    // JIMIN
    {
        id: 12,
        member_id: 'jm',
        title: 'FACE',
        release_date: '2023-03-24',
        type: 'Studio',
        tracks: ['Face-Off', 'Interlude: Dive', 'Like Crazy', 'Alone', 'Set Me Free Pt.2', 'Letter'],
        created_at: new Date().toISOString(),
    },
    {
        id: 13,
        member_id: 'jm',
        title: 'MUSE',
        release_date: '2024-07-19',
        type: 'Studio',
        tracks: ['Rebirth (Intro)', 'Interlude: Showtime', 'Slow Motion', 'Be Mine', 'Smeraldo Garden Marching Band (feat. Loco)', 'Who', 'Closer Than This'],
        created_at: new Date().toISOString(),
    },
    // V
    {
        id: 14,
        member_id: 'v',
        title: 'Layover',
        release_date: '2023-09-08',
        type: 'EP',
        tracks: ['Rainy Days', 'Blue', 'Love Me Again', 'Slow Dancing', 'For Us'],
        created_at: new Date().toISOString(),
    },
    // JK
    {
        id: 15,
        member_id: 'jk',
        title: 'GOLDEN',
        release_date: '2023-11-03',
        type: 'Studio',
        tracks: ['Standing Next to You', 'Yes or No', "Please Don't Change", 'Hate You', 'Too Sad to Dance', 'Shot Glass of Tears', '3D', 'Closer to You', 'Seven', 'Somebody'],
        created_at: new Date().toISOString(),
    },
];

export default SOLO_ALBUMS;
```

**Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/data/soloAlbums.ts` (or just `npm run type-check`)
Expected: No errors

**Step 3: Commit**

```bash
git add src/data/soloAlbums.ts
git commit -m "feat: add solo albums local fallback data"
```

---

## Task 2: Create `useSoloAlbums` Hook

**Files:**
- Create: `src/hooks/useSoloAlbums.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create the hook**

Follow the exact pattern of `src/hooks/useAlbums.ts`:

```ts
/**
 * useSoloAlbums Hook
 *
 * Fetches solo album data from Supabase database
 * Falls back to local data if database is unavailable
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SoloAlbum } from '../types/database';
import { SOLO_ALBUMS } from '../data/soloAlbums';

interface UseSoloAlbumsResult {
    soloAlbums: SoloAlbum[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
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
```

**Step 2: Update barrel export**

Add to `src/hooks/index.ts`:

```ts
export { useSoloAlbums, useSoloAlbumsByMember } from './useSoloAlbums';
```

**Step 3: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add src/hooks/useSoloAlbums.ts src/hooks/index.ts
git commit -m "feat: add useSoloAlbums hook with Supabase fetch and local fallback"
```

---

## Task 3: Create `useLyrics` Hook

**Files:**
- Create: `src/hooks/useLyrics.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create the hook**

```ts
/**
 * useLyrics Hook
 *
 * Fetches lyrics data from Supabase database
 * No local fallback - returns empty array if unavailable
 */

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
            console.log('📝 Lyrics unavailable (Supabase not configured)');
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
            console.log(`📝 Loaded ${data?.length || 0} lyrics from database`);
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
```

**Step 2: Update barrel export**

Add to `src/hooks/index.ts`:

```ts
export { useLyrics, useLyricsBySongId } from './useLyrics';
```

**Step 3: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add src/hooks/useLyrics.ts src/hooks/index.ts
git commit -m "feat: add useLyrics hook with Supabase fetch"
```

---

## Task 4: Refactor Export Service to Accept Data Parameters

**Files:**
- Modify: `src/services/exportService.ts`
- Modify: `src/components/features/DataHub.tsx`

**Step 1: Refactor exportService.ts**

Change every export function to accept data as a parameter. Remove all static imports from `../data/*`. Keep the `toCSV` utility and `saveAs` logic unchanged.

Replace the full file with:

```ts
/**
 * Export Service
 *
 * Provides client-side export functionality for data in JSON and CSV formats.
 * All functions accept data as parameters (from hooks).
 */

import { saveAs } from 'file-saver';
import type { Song, Member, Album } from '../types/database';

// ============ CSV CONVERSION ============

const toCSV = <T extends object>(data: T[], columns?: (keyof T)[]): string => {
    if (data.length === 0) return '';

    const cols = columns || (Object.keys(data[0]) as (keyof T)[]);

    const header = cols.map(c => String(c)).join(',');

    const rows = data.map(item => {
        return cols.map(col => {
            const value = item[col];

            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }

            if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }

            return String(value ?? '');
        }).join(',');
    });

    return [header, ...rows].join('\n');
};

// ============ EXPORT FUNCTIONS ============

export const exportSongsJSON = (songs: Song[]): void => {
    const json = JSON.stringify(songs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-songs.json');
};

export const exportSongsCSV = (songs: Song[]): void => {
    const columns: (keyof Song)[] = [
        'id', 'title', 'album_id', 'release_date', 'bpm',
        'energy', 'valence', 'danceability', 'sentiment'
    ];

    const csv = toCSV(songs, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-songs.csv');
};

export const exportMembersJSON = (members: Member[]): void => {
    const json = JSON.stringify(members, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-members.json');
};

export const exportMembersCSV = (members: Member[]): void => {
    const flatMembers = members.map(m => ({
        id: m.id,
        name: m.stage_name,
        fullName: m.full_name,
        role: m.role,
        color: m.color,
        mic: m.mic_color,
        komca: m.komca_credits,
        birthDate: m.birth_date,
        mbti: m.mbti,
        soloTracks: (m.solo_tracks || []).join('; '),
        achievements: (m.achievements || []).join('; ')
    }));

    const csv = toCSV(flatMembers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-members.csv');
};

export const exportAlbumsJSON = (albums: Album[]): void => {
    const json = JSON.stringify(albums, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-albums.json');
};

export const exportAlbumsCSV = (albums: Album[]): void => {
    const columns: (keyof Album)[] = [
        'id', 'title', 'release_date', 'type', 'track_count', 'era'
    ];

    const csv = toCSV(albums, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'bts-albums.csv');
};

export const exportFullArchive = (songs: Song[], members: Member[], albums: Album[]): void => {
    const archive = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
            members,
            songs,
            albums
        },
        stats: {
            totalMembers: members.length,
            totalSongs: songs.length,
            totalAlbums: albums.length,
            totalKOMCACredits: members.reduce((sum, m) => sum + m.komca_credits, 0)
        }
    };

    const json = JSON.stringify(archive, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'bts-neural-archive.json');
};

export default {
    exportSongsJSON,
    exportSongsCSV,
    exportMembersJSON,
    exportMembersCSV,
    exportAlbumsJSON,
    exportAlbumsCSV,
    exportFullArchive
};
```

**Step 2: Update DataHub.tsx**

In `src/components/features/DataHub.tsx`, the component already uses `useSongs` and `useAlbums` hooks. Just update the export call to pass data. Also add `useMembers` for the full archive export.

Change the import:
```ts
import { exportFullArchive } from '../../services/exportService';
```
stays the same.

Add `useMembers` import:
```ts
import { useSongs, useAlbums, useMembers } from '../../hooks';
```

Add inside the component:
```ts
const { members } = useMembers();
```

Change the button onClick:
```ts
onClick={() => exportFullArchive(songs, members, albums)}
```

**Step 3: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add src/services/exportService.ts src/components/features/DataHub.tsx
git commit -m "refactor: export service accepts data params instead of static imports"
```

---

## Task 5: Create `useSearch` Hook and Refactor Search Service

**Files:**
- Create: `src/hooks/useSearch.ts`
- Modify: `src/services/searchService.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Refactor searchService.ts to export config and utilities only**

Strip out all static data imports and Fuse instance creation. Keep the types, Fuse configs, and result mapping functions as pure utilities.

Replace the full file with:

```ts
/**
 * Search Service - Fuse.js Configuration & Utilities
 *
 * Provides Fuse.js config objects and result mapping functions.
 * Actual Fuse instances are created in useSearch hook with live data.
 */

import type Fuse from 'fuse.js';
import type { Song, Member, Album } from '../types/database';

// ============ SEARCH RESULT TYPES ============

export interface SearchResult {
    id: number | string;
    type: 'song' | 'member' | 'album';
    title: string;
    subtitle: string;
    score: number;
    context: string;
    color?: string;
    item: Song | Member | Album;
}

// ============ FUSE CONFIGURATIONS ============

export const SONG_FUSE_OPTIONS: Fuse.IFuseOptions<Song> = {
    keys: [
        { name: 'title', weight: 0.4 },
        { name: 'sentiment', weight: 0.15 },
        { name: 'keywords', weight: 0.25 },
        { name: 'writers', weight: 0.1 },
        { name: 'producers', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
};

export const MEMBER_FUSE_OPTIONS: Fuse.IFuseOptions<Member> = {
    keys: [
        { name: 'stage_name', weight: 0.3 },
        { name: 'full_name', weight: 0.25 },
        { name: 'role', weight: 0.15 },
        { name: 'bio', weight: 0.2 },
        { name: 'solo_tracks', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2
};

export const ALBUM_FUSE_OPTIONS: Fuse.IFuseOptions<Album> = {
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
};

// ============ RESULT MAPPERS ============

export const mapSongResult = (r: Fuse.FuseResult<Song>): SearchResult => ({
    id: r.item.id,
    type: 'song',
    title: r.item.title,
    subtitle: r.item.sentiment || 'Unknown',
    score: Math.round((1 - (r.score || 0)) * 100),
    context: `${r.item.sentiment || 'N/A'} \u2022 ${r.item.bpm || '?'} BPM \u2022 ${(r.item.keywords || []).slice(0, 3).join(', ')}`,
    item: r.item
});

export const mapMemberResult = (r: Fuse.FuseResult<Member>): SearchResult => ({
    id: r.item.id,
    type: 'member',
    title: r.item.stage_name,
    subtitle: r.item.full_name || '',
    score: Math.round((1 - (r.score || 0)) * 100),
    context: r.item.role || '',
    color: r.item.color || undefined,
    item: r.item
});

export const mapAlbumResult = (r: Fuse.FuseResult<Album>): SearchResult => ({
    id: r.item.id,
    type: 'album',
    title: r.item.title,
    subtitle: `${r.item.type || 'Album'} \u2022 ${(r.item.release_date || '').split('-')[0]}`,
    score: Math.round((1 - (r.score || 0)) * 100),
    context: r.item.era || '',
    color: r.item.cover_color || undefined,
    item: r.item
});

// ============ MOOD MAP ============

export const MOOD_MAP: Record<string, string[]> = {
    happy: ['Joy', 'Celebration', 'Confidence'],
    sad: ['Pain', 'Melancholy', 'Longing'],
    energetic: ['Determination', 'Empowerment', 'Celebration'],
    calm: ['Comfort', 'Reflection', 'Hope'],
    romantic: ['Love', 'Longing'],
    motivational: ['Determination', 'Empowerment', 'Hope']
};
```

**Step 2: Create useSearch hook**

```ts
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
```

**Step 3: Update barrel export**

Add to `src/hooks/index.ts`:

```ts
export { useSearch, type SearchResult } from './useSearch';
```

**Step 4: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add src/services/searchService.ts src/hooks/useSearch.ts src/hooks/index.ts
git commit -m "refactor: search service uses live hook data via useSearch hook"
```

---

## Task 6: Update RAGNetwork Component to Use `useSearch` Hook

**Files:**
- Modify: `src/components/features/RAGNetwork.tsx`

**Step 1: Replace static service import with hook**

Change the import from:
```ts
import { searchAll, type SearchResult } from '../../services/searchService';
```

To:
```ts
import { useSearch, type SearchResult } from '../../hooks';
```

Add inside the component, before state declarations:
```ts
const { searchAll } = useSearch();
```

Remove the direct `searchAll` import from the service — it's now destructured from the hook.

The `handleSearch` function stays the same since it already calls `searchAll(searchQuery)`.

**Step 2: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/RAGNetwork.tsx
git commit -m "refactor: RAGNetwork uses useSearch hook for live data search"
```

---

## Task 7: Verify Build and Manual Test

**Files:** None (verification only)

**Step 1: Run type-check**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Run dev server and verify**

Run: `npm run dev`

Manual checks:
- App loads without console errors
- Navigate to Records Hub (DataHub) — songs table shows data
- Click "Export Neural Archive" — downloads a JSON file with live data
- Navigate to Archive Graph (RAGNetwork) — search for "Spring Day" or "RM" — results appear
- Check browser console for `Loaded X from database` logs (confirms Supabase is being used, not just fallback)

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address build/runtime issues from backend integration"
```

---

## Summary of All Commits

| Task | Commit Message |
|------|----------------|
| 1 | `feat: add solo albums local fallback data` |
| 2 | `feat: add useSoloAlbums hook with Supabase fetch and local fallback` |
| 3 | `feat: add useLyrics hook with Supabase fetch` |
| 4 | `refactor: export service accepts data params instead of static imports` |
| 5 | `refactor: search service uses live hook data via useSearch hook` |
| 6 | `refactor: RAGNetwork uses useSearch hook for live data search` |
| 7 | `fix: address build/runtime issues from backend integration` (if needed) |
