/**
 * Spotify API Type Definitions
 * Following Spotify Web API Reference: https://developer.spotify.com/documentation/web-api
 */

// === Artist Types ===
export interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
  genres?: string[];
  href: string;
  id: string;
  images?: SpotifyImage[];
  name: string;
  popularity?: number;
  type: 'artist';
  uri: string;
}

// === Album Types ===
export interface SpotifyAlbum {
  album_type: 'album' | 'single' | 'compilation';
  total_tracks: number;
  available_markets?: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  restrictions?: {
    reason: string;
  };
  type: 'album';
  uri: string;
  artists: SpotifyArtist[];
  tracks?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
}

// === Track Types ===
export interface SpotifyTrack {
  album?: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets?: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: object;
  restrictions?: {
    reason: string;
  };
  name: string;
  popularity?: number;
  preview_url: string | null;
  track_number: number;
  type: 'track';
  uri: string;
  is_local: boolean;
}

// === Audio Features Types ===
export interface SpotifyAudioFeatures {
  acousticness: number; // 0.0 to 1.0
  analysis_url: string;
  danceability: number; // 0.0 to 1.0
  duration_ms: number;
  energy: number; // 0.0 to 1.0
  id: string;
  instrumentalness: number; // 0.0 to 1.0
  key: number; // -1 to 11 (Pitch class notation)
  liveness: number; // 0.0 to 1.0
  loudness: number; // -60 to 0 db
  mode: number; // 0 or 1 (minor or major)
  speechiness: number; // 0.0 to 1.0
  tempo: number; // BPM
  time_signature: number; // 3 to 7
  track_href: string;
  type: 'audio_features';
  uri: string;
  valence: number; // 0.0 to 1.0 (musical positiveness)
}

// === Image Types ===
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

// === Paging Object ===
export interface SpotifyPaging<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

// === Search Response ===
export interface SpotifySearchResponse {
  tracks?: SpotifyPaging<SpotifyTrack>;
  artists?: SpotifyPaging<SpotifyArtist>;
  albums?: SpotifyPaging<SpotifyAlbum>;
}

// === Auth Types ===
export interface SpotifyAuthTokens {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
  expires_at: number; // Calculated timestamp
}

export interface SpotifyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: SpotifyAuthTokens | null;
  user: SpotifyUser | null;
}

// === User Types ===
export interface SpotifyUser {
  display_name: string | null;
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images?: SpotifyImage[];
  type: 'user';
  uri: string;
  country?: string;
  email?: string;
  product?: string;
}

// === Error Types ===
export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

// === API Response Types ===
export interface SpotifyAPIResponse<T> {
  data: T | null;
  error: SpotifyError | null;
  isLoading: boolean;
}

// === Internal App Types ===
export interface MappedSong {
  id: number;
  spotifyId: string;
  title: string;
  album: string;
  albumArt?: string;
  artists: string[];
  bpm: number;
  energy: number;
  valence: number;
  danceability: number;
  sentiment: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  spotify_url: string;
  release_date: string;
}

export interface MappedArtist {
  id: string;
  name: string;
  spotifyId: string;
  imageUrl?: string;
  genres: string[];
  popularity: number;
  followers: number;
  spotify_url: string;
}
