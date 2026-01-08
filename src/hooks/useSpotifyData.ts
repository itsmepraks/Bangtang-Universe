/**
 * React Hook for Spotify Data Fetching
 * Provides convenient hooks for fetching BTS data from Spotify
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBTSArtist,
  getBTSDiscography,
  fetchBTSCompleteDiscography,
  searchBTSTracks,
  getTrack,
  getAudioFeatures,
  getCachedData,
} from '../lib/spotify';
import type {
  SpotifyArtist,
  SpotifyAlbum,
  MappedSong,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from '../types/spotify';

interface UseSpotifyDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  progress?: number;
  progressMessage?: string;
}

/**
 * Hook to fetch BTS artist information
 */
export const useBTSArtist = () => {
  const [state, setState] = useState<UseSpotifyDataState<SpotifyArtist>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const artist = await getCachedData('bts-artist', getBTSArtist);
        setState({ data: artist, isLoading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch artist';
        setState({ data: null, isLoading: false, error: errorMessage });
      }
    };

    fetchArtist();
  }, []);

  return state;
};

/**
 * Hook to fetch BTS discography (albums only)
 */
export const useBTSDiscography = () => {
  const [state, setState] = useState<UseSpotifyDataState<SpotifyAlbum[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDiscography = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const albums = await getCachedData('bts-discography', getBTSDiscography);
        setState({ data: albums, isLoading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch discography';
        setState({ data: null, isLoading: false, error: errorMessage });
      }
    };

    fetchDiscography();
  }, []);

  return state;
};

/**
 * Hook to fetch complete BTS track catalog with audio features
 * This is the main hook for getting all BTS songs
 */
export const useBTSCompleteCatalog = (autoFetch: boolean = false) => {
  const [state, setState] = useState<UseSpotifyDataState<MappedSong[]>>({
    data: null,
    isLoading: false,
    error: null,
    progress: 0,
    progressMessage: '',
  });

  const fetchCatalog = useCallback(async () => {
    try {
      setState({
        data: null,
        isLoading: true,
        error: null,
        progress: 0,
        progressMessage: 'Starting...',
      });

      const songs = await fetchBTSCompleteDiscography((progress, message) => {
        setState(prev => ({
          ...prev,
          progress,
          progressMessage: message,
        }));
      });

      setState({
        data: songs,
        isLoading: false,
        error: null,
        progress: 100,
        progressMessage: 'Complete!',
      });

      return songs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch catalog';
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        progress: 0,
        progressMessage: '',
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCatalog();
    }
  }, [autoFetch, fetchCatalog]);

  return {
    ...state,
    fetchCatalog,
    refetch: fetchCatalog,
  };
};

/**
 * Hook to search BTS tracks
 */
export const useSearchBTS = () => {
  const [state, setState] = useState<UseSpotifyDataState<SpotifyTrack[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const results = await searchBTSTracks(query);
      setState({ data: results, isLoading: false, error: null });
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const clear = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    search,
    clear,
  };
};

/**
 * Hook to fetch track details with audio features
 */
export const useTrackWithFeatures = (trackId: string | null) => {
  const [state, setState] = useState<
    UseSpotifyDataState<{ track: SpotifyTrack; features: SpotifyAudioFeatures }>
  >({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!trackId) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    const fetchTrackData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [track, features] = await Promise.all([
          getTrack(trackId),
          getAudioFeatures(trackId),
        ]);

        setState({
          data: { track, features },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch track';
        setState({ data: null, isLoading: false, error: errorMessage });
      }
    };

    fetchTrackData();
  }, [trackId]);

  return state;
};

/**
 * Hook for managing Spotify data cache
 */
export const useSpotifyCache = () => {
  const clearCache = useCallback((key?: string) => {
    const { clearCache: clearCacheFn } = require('../lib/spotify');
    clearCacheFn(key);
  }, []);

  return { clearCache };
};

export default {
  useBTSArtist,
  useBTSDiscography,
  useBTSCompleteCatalog,
  useSearchBTS,
  useTrackWithFeatures,
  useSpotifyCache,
};
