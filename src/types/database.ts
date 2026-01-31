/**
 * Database Types for Supabase
 * 
 * TypeScript types matching our PostgreSQL schema
 */

// ==================== TABLE TYPES ====================

export interface Album {
    id: number;
    title: string;
    title_korean: string | null;
    release_date: string;
    type: 'Studio' | 'Mini' | 'Compilation' | 'Single' | 'Repackage';
    track_count: number | null;
    description: string | null;
    era: string | null;
    cover_color: string | null;
    spotify_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Song {
    id: number;
    title: string;
    title_korean: string | null;
    album_id: number | null;
    release_date: string | null;
    duration_seconds: number | null;
    bpm: number | null;
    energy: number | null;
    valence: number | null;
    danceability: number | null;
    acousticness: number | null;
    sentiment: string | null;
    keywords: string[] | null;
    writers: string[] | null;
    producers: string[] | null;
    member_credits: string[] | null;
    is_title_track: boolean;
    has_mv: boolean;
    spotify_id: string | null;
    created_at: string;
}

export interface Member {
    id: string;
    stage_name: string;
    full_name: string | null;
    color: string | null;
    role: string | null;
    mic_color: string | null;
    komca_credits: number;
    bio: string | null;
    birth_date: string | null;
    birth_place: string | null;
    height: string | null;
    mbti: string | null;
    zodiac: string | null;
    instagram: string | null;
    image_url: string | null;
    solo_tracks: string[] | null;
    achievements: string[] | null;
    featured_tracks: string[] | null;
    producer_credits: number;
    writer_credits: number;
    created_at: string;
}

export interface SoloAlbum {
    id: number;
    member_id: string;
    title: string;
    release_date: string | null;
    type: 'Studio' | 'Mixtape' | 'EP' | 'Single';
    tracks: string[] | null;
    created_at: string;
}

export interface Lyrics {
    id: number;
    song_id: number;
    lyrics_korean: string | null;
    lyrics_english: string | null;
    lyrics_romanized: string | null;
    genius_url: string | null;
    sentiment_score: number | null;
    themes: string[] | null;
    created_at: string;
}

// ==================== DATABASE SCHEMA TYPE ====================

export interface Database {
    public: {
        Tables: {
            albums: {
                Row: Album;
                Insert: Omit<Album, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Album, 'id' | 'created_at'>>;
            };
            songs: {
                Row: Song;
                Insert: Omit<Song, 'id' | 'created_at'>;
                Update: Partial<Omit<Song, 'id' | 'created_at'>>;
            };
            members: {
                Row: Member;
                Insert: Omit<Member, 'created_at'>;
                Update: Partial<Omit<Member, 'id' | 'created_at'>>;
            };
            solo_albums: {
                Row: SoloAlbum;
                Insert: Omit<SoloAlbum, 'id' | 'created_at'>;
                Update: Partial<Omit<SoloAlbum, 'id' | 'created_at'>>;
            };
            lyrics: {
                Row: Lyrics;
                Insert: Omit<Lyrics, 'id' | 'created_at'>;
                Update: Partial<Omit<Lyrics, 'id' | 'created_at'>>;
            };
        };
    };
}

// ==================== HELPER TYPES ====================

export type AlbumInsert = Database['public']['Tables']['albums']['Insert'];
export type SongInsert = Database['public']['Tables']['songs']['Insert'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type SoloAlbumInsert = Database['public']['Tables']['solo_albums']['Insert'];

// Song with joined album data
export interface SongWithAlbum extends Song {
    album: Album | null;
}

// Member with solo albums
export interface MemberWithSoloAlbums extends Member {
    solo_albums: SoloAlbum[];
}
