// Fuse.js options and result mappers. Fuse instances are constructed in
// useSearch against live data.

import type { IFuseOptions, FuseResult } from 'fuse.js';
import type { Song, Member, Album, Award, Concert } from '../types/database';

export interface SearchResult {
    id: number | string;
    type: 'song' | 'member' | 'album' | 'award' | 'concert' | 'collaboration';
    title: string;
    subtitle: string;
    score: number;
    context: string;
    color?: string;
    item: Song | Member | Album | Award | Concert;
}

export const SONG_FUSE_OPTIONS: IFuseOptions<Song> = {
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

export const MEMBER_FUSE_OPTIONS: IFuseOptions<Member> = {
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

export const ALBUM_FUSE_OPTIONS: IFuseOptions<Album> = {
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

export const AWARD_FUSE_OPTIONS: IFuseOptions<Award> = {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'ceremony', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'work_title', weight: 0.2 },
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
};

export const CONCERT_FUSE_OPTIONS: IFuseOptions<Concert> = {
    keys: [
        { name: 'tour_name', weight: 0.3 },
        { name: 'venue', weight: 0.3 },
        { name: 'city', weight: 0.2 },
        { name: 'country', weight: 0.2 },
    ],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
};

export const mapSongResult = (r: FuseResult<Song>): SearchResult => ({
    id: r.item.id,
    type: 'song',
    title: r.item.title,
    subtitle: r.item.sentiment || 'Unknown',
    score: Math.round((1 - (r.score || 0)) * 100),
    context: `${r.item.sentiment || 'N/A'} \u2022 ${r.item.bpm || '?'} BPM \u2022 ${(r.item.keywords || []).slice(0, 3).join(', ')}`,
    item: r.item
});

export const mapMemberResult = (r: FuseResult<Member>): SearchResult => ({
    id: r.item.id,
    type: 'member',
    title: r.item.stage_name,
    subtitle: r.item.full_name || '',
    score: Math.round((1 - (r.score || 0)) * 100),
    context: r.item.role || '',
    color: r.item.color || undefined,
    item: r.item
});

export const mapAlbumResult = (r: FuseResult<Album>): SearchResult => ({
    id: r.item.id,
    type: 'album',
    title: r.item.title,
    subtitle: `${r.item.type || 'Album'} \u2022 ${(r.item.release_date || '').split('-')[0]}`,
    score: Math.round((1 - (r.score || 0)) * 100),
    context: r.item.era || '',
    color: r.item.cover_color || undefined,
    item: r.item
});

export const mapAwardResult = (r: FuseResult<Award>): SearchResult => ({
    id: r.item.id,
    type: 'award',
    title: r.item.name || r.item.category || 'Award',
    subtitle: `${r.item.ceremony} (${r.item.year})`,
    score: Math.round((1 - (r.score || 0)) * 100),
    context: `${r.item.result === 'won' ? 'Won' : 'Nominated'} \u2014 ${r.item.work_title || ''}`,
    item: r.item,
});

export const mapConcertResult = (r: FuseResult<Concert>): SearchResult => ({
    id: r.item.id,
    type: 'concert',
    title: r.item.tour_name,
    subtitle: `${r.item.city}, ${r.item.country}`,
    score: Math.round((1 - (r.score || 0)) * 100),
    context: `${r.item.venue} \u2014 ${r.item.date}`,
    item: r.item,
});

export const MOOD_MAP: Record<string, string[]> = {
    happy: ['Joy', 'Celebration', 'Confidence'],
    sad: ['Pain', 'Melancholy', 'Longing'],
    energetic: ['Determination', 'Empowerment', 'Celebration'],
    calm: ['Comfort', 'Reflection', 'Hope'],
    romantic: ['Love', 'Longing'],
    motivational: ['Determination', 'Empowerment', 'Hope']
};
