/**
 * Spotify API Client
 * Main interface for interacting with Spotify Web API
 */

import { SPOTIFY_CONFIG } from '../config/spotify';
import { getStoredTokens, isTokenExpired, refreshAccessToken } from './spotifyAuth';
import type {
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyPaging,
  SpotifySearchResponse,
  SpotifyError,
  MappedSong,
  MappedArtist,
} from '../types/spotify';

/**
 * Base fetch wrapper with automatic token refresh
 */
const spotifyFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let tokens = getStoredTokens();
  
  // Refresh token if expired
  if (isTokenExpired(tokens) && tokens?.refresh_token) {
    try {
      tokens = await refreshAccessToken(tokens.refresh_token);
    } catch (error) {
      throw new Error('Authentication expired. Please log in again.');
    }
  }
  
  if (!tokens) {
    throw new Error('No authentication token available');
  }
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${SPOTIFY_CONFIG.API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error: SpotifyError = await response.json();
    throw new Error(error.error?.message || 'Spotify API request failed');
  }
  
  return response.json();
};

// ============================================================================
// ARTIST ENDPOINTS
// ============================================================================

/**
 * Get BTS artist information
 */
export const getBTSArtist = async (): Promise<SpotifyArtist> => {
  return spotifyFetch<SpotifyArtist>(
    `/artists/${SPOTIFY_CONFIG.BTS_ARTIST_IDS.BTS_GROUP}`
  );
};

/**
 * Get artist by ID
 */
export const getArtist = async (artistId: string): Promise<SpotifyArtist> => {
  return spotifyFetch<SpotifyArtist>(`/artists/${artistId}`);
};

/**
 * Get multiple artists by IDs
 */
export const getArtists = async (artistIds: string[]): Promise<{ artists: SpotifyArtist[] }> => {
  const ids = artistIds.join(',');
  return spotifyFetch<{ artists: SpotifyArtist[] }>(`/artists?ids=${ids}`);
};

/**
 * Get artist's albums
 */
export const getArtistAlbums = async (
  artistId: string,
  options: {
    include_groups?: string; // 'album,single,appears_on,compilation'
    limit?: number;
    offset?: number;
  } = {}
): Promise<SpotifyPaging<SpotifyAlbum>> => {
  const params = new URLSearchParams({
    include_groups: options.include_groups || 'album,single',
    limit: (options.limit || 50).toString(),
    offset: (options.offset || 0).toString(),
  });
  
  return spotifyFetch<SpotifyPaging<SpotifyAlbum>>(
    `/artists/${artistId}/albums?${params.toString()}`
  );
};

/**
 * Get BTS discography (all albums)
 */
export const getBTSDiscography = async (): Promise<SpotifyAlbum[]> => {
  try {
    const albums: SpotifyAlbum[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;
    
    while (hasMore) {
      const response = await getArtistAlbums(
        SPOTIFY_CONFIG.BTS_ARTIST_IDS.BTS_GROUP,
        { include_groups: 'album,single', limit, offset }
      );
      
      albums.push(...response.items);
      
      hasMore = response.next !== null;
      offset += limit;
    }
    
    return albums;
  } catch (error) {
    console.error('Error fetching BTS discography:', error);
    throw error;
  }
};

// ============================================================================
// ALBUM ENDPOINTS
// ============================================================================

/**
 * Get album by ID
 */
export const getAlbum = async (albumId: string): Promise<SpotifyAlbum> => {
  return spotifyFetch<SpotifyAlbum>(`/albums/${albumId}`);
};

/**
 * Get album tracks
 */
export const getAlbumTracks = async (
  albumId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<SpotifyPaging<SpotifyTrack>> => {
  const params = new URLSearchParams({
    limit: (options.limit || 50).toString(),
    offset: (options.offset || 0).toString(),
  });
  
  return spotifyFetch<SpotifyPaging<SpotifyTrack>>(
    `/albums/${albumId}/tracks?${params.toString()}`
  );
};

// ============================================================================
// TRACK ENDPOINTS
// ============================================================================

/**
 * Get track by ID
 */
export const getTrack = async (trackId: string): Promise<SpotifyTrack> => {
  return spotifyFetch<SpotifyTrack>(`/tracks/${trackId}`);
};

/**
 * Get multiple tracks by IDs
 */
export const getTracks = async (trackIds: string[]): Promise<{ tracks: SpotifyTrack[] }> => {
  const ids = trackIds.join(',');
  return spotifyFetch<{ tracks: SpotifyTrack[] }>(`/tracks?ids=${ids}`);
};

/**
 * Get audio features for a track
 */
export const getAudioFeatures = async (trackId: string): Promise<SpotifyAudioFeatures> => {
  return spotifyFetch<SpotifyAudioFeatures>(`/audio-features/${trackId}`);
};

/**
 * Get audio features for multiple tracks
 */
export const getMultipleAudioFeatures = async (
  trackIds: string[]
): Promise<{ audio_features: (SpotifyAudioFeatures | null)[] }> => {
  const ids = trackIds.join(',');
  return spotifyFetch<{ audio_features: (SpotifyAudioFeatures | null)[] }>(
    `/audio-features?ids=${ids}`
  );
};

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

/**
 * Search Spotify catalog
 */
export const search = async (
  query: string,
  types: ('album' | 'artist' | 'track')[] = ['track'],
  options: { limit?: number; offset?: number } = {}
): Promise<SpotifySearchResponse> => {
  const params = new URLSearchParams({
    q: query,
    type: types.join(','),
    limit: (options.limit || 20).toString(),
    offset: (options.offset || 0).toString(),
  });
  
  return spotifyFetch<SpotifySearchResponse>(`/search?${params.toString()}`);
};

/**
 * Search for BTS tracks
 */
export const searchBTSTracks = async (query: string): Promise<SpotifyTrack[]> => {
  const searchQuery = `artist:BTS ${query}`;
  const response = await search(searchQuery, ['track'], { limit: 50 });
  return response.tracks?.items || [];
};

// ============================================================================
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Map sentiment from valence score
 */
const mapValenceToSentiment = (valence: number, energy: number): string => {
  if (valence > 0.7 && energy > 0.7) return 'Joy';
  if (valence > 0.6 && energy > 0.5) return 'Celebration';
  if (valence > 0.5) return 'Comfort';
  if (valence > 0.4) return 'Confidence';
  if (valence > 0.3) return 'Longing';
  if (valence > 0.2) return 'Pain';
  return 'Fear';
};

/**
 * Map Spotify track with audio features to internal schema
 */
export const mapTrackToSong = (
  track: SpotifyTrack,
  audioFeatures: SpotifyAudioFeatures,
  index: number
): MappedSong => {
  return {
    id: index,
    spotifyId: track.id,
    title: track.name,
    album: track.album?.name || 'Unknown Album',
    albumArt: track.album?.images?.[0]?.url,
    artists: track.artists.map(a => a.name),
    bpm: Math.round(audioFeatures.tempo),
    energy: audioFeatures.energy,
    valence: audioFeatures.valence,
    danceability: audioFeatures.danceability,
    sentiment: mapValenceToSentiment(audioFeatures.valence, audioFeatures.energy),
    duration_ms: track.duration_ms,
    popularity: track.popularity || 0,
    preview_url: track.preview_url,
    spotify_url: track.external_urls.spotify,
    release_date: track.album?.release_date || 'Unknown',
  };
};

/**
 * Map Spotify artist to internal schema
 */
export const mapArtistToInternal = (artist: SpotifyArtist): MappedArtist => {
  return {
    id: artist.id,
    name: artist.name,
    spotifyId: artist.id,
    imageUrl: artist.images?.[0]?.url,
    genres: artist.genres || [],
    popularity: artist.popularity || 0,
    followers: artist.followers?.total || 0,
    spotify_url: artist.external_urls.spotify,
  };
};

// ============================================================================
// COMPLETE BTS DATA FETCHING
// ============================================================================

/**
 * Fetch complete BTS track data with audio features
 * This is the main function to get all BTS songs with their features
 */
export const fetchBTSCompleteDiscography = async (
  onProgress?: (progress: number, message: string) => void
): Promise<MappedSong[]> => {
  try {
    onProgress?.(0, 'Fetching BTS albums...');
    
    // Get all albums
    const albums = await getBTSDiscography();
    onProgress?.(20, `Found ${albums.length} albums`);
    
    // Get all tracks from all albums
    const allTracks: SpotifyTrack[] = [];
    for (let i = 0; i < albums.length; i++) {
      const album = albums[i];
      const tracksResponse = await getAlbumTracks(album.id);
      // Add album info to tracks (simplified album object)
      const tracksWithAlbum = tracksResponse.items.map(track => ({
        ...track,
        album: album,
      }));
      allTracks.push(...tracksWithAlbum);
      onProgress?.(
        20 + (30 * (i + 1)) / albums.length,
        `Loading tracks from ${album.name}...`
      );
    }
    
    onProgress?.(50, `Fetching audio features for ${allTracks.length} tracks...`);
    
    // Get audio features in batches (max 100 per request)
    const batchSize = 100;
    const audioFeaturesMap = new Map<string, SpotifyAudioFeatures>();
    
    for (let i = 0; i < allTracks.length; i += batchSize) {
      const batch = allTracks.slice(i, i + batchSize);
      const ids = batch.map(t => t.id);
      const response = await getMultipleAudioFeatures(ids);
      
      response.audio_features.forEach((features, index) => {
        if (features) {
          audioFeaturesMap.set(batch[index].id, features);
        }
      });
      
      onProgress?.(
        50 + (40 * (i + batchSize)) / allTracks.length,
        `Processing audio features...`
      );
    }
    
    onProgress?.(90, 'Mapping data to internal format...');
    
    // Map tracks with audio features
    const mappedSongs: MappedSong[] = allTracks
      .map((track, index) => {
        const audioFeatures = audioFeaturesMap.get(track.id);
        if (!audioFeatures) return null;
        return mapTrackToSong(track, audioFeatures, index + 1);
      })
      .filter((song): song is MappedSong => song !== null);
    
    onProgress?.(100, 'Complete!');
    
    return mappedSongs;
  } catch (error) {
    console.error('Error fetching BTS complete discography:', error);
    throw error;
  }
};

/**
 * Cache implementation for frequently accessed data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

export const getCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = SPOTIFY_CONFIG.CACHE_DURATION
): Promise<T> => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  
  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
};

export const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
