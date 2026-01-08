/**
 * React Hook for Spotify Authentication
 * Manages authentication state and provides auth functions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  initiateSpotifyAuth,
  exchangeCodeForToken,
  getStoredTokens,
  isTokenExpired,
  refreshAccessToken,
  clearTokens,
} from '../lib/spotifyAuth';
import { spotifyFetch } from '../lib/spotify';
import type { SpotifyAuthState, SpotifyUser } from '../types/spotify';

/**
 * Custom hook for Spotify authentication
 */
export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    tokens: null,
    user: null,
  });

  /**
   * Fetch current user profile
   */
  const fetchUserProfile = useCallback(async (): Promise<SpotifyUser | null> => {
    try {
      const tokens = getStoredTokens();
      if (!tokens || isTokenExpired(tokens)) {
        return null;
      }

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  /**
   * Check and restore authentication state on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokens = getStoredTokens();

        if (!tokens) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // If token is expired and we have refresh token, try to refresh
        if (isTokenExpired(tokens) && tokens.refresh_token) {
          try {
            const newTokens = await refreshAccessToken(tokens.refresh_token);
            const user = await fetchUserProfile();
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              tokens: newTokens,
              user,
            });
          } catch (error) {
            // Refresh failed, clear tokens
            clearTokens();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              error: 'Session expired. Please log in again.',
              tokens: null,
              user: null,
            });
          }
        } else if (!isTokenExpired(tokens)) {
          // Token is still valid
          const user = await fetchUserProfile();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokens,
            user,
          });
        } else {
          // Token expired and no refresh token
          clearTokens();
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to restore session',
          tokens: null,
          user: null,
        });
      }
    };

    checkAuth();
  }, [fetchUserProfile]);

  /**
   * Handle OAuth callback
   */
  const handleCallback = useCallback(async (code: string, state: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tokens = await exchangeCodeForToken(code, state);
      const user = await fetchUserProfile();

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens,
        user,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        tokens: null,
        user: null,
      });
      return false;
    }
  }, [fetchUserProfile]);

  /**
   * Login - initiate OAuth flow
   */
  const login = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await initiateSpotifyAuth();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate login';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  /**
   * Logout - clear tokens and state
   */
  const logout = useCallback(() => {
    clearTokens();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokens: null,
      user: null,
    });
  }, []);

  /**
   * Refresh tokens manually
   */
  const refreshTokens = useCallback(async () => {
    try {
      const currentTokens = getStoredTokens();
      if (!currentTokens?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const newTokens = await refreshAccessToken(currentTokens.refresh_token);
      setAuthState(prev => ({
        ...prev,
        tokens: newTokens,
      }));
      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      logout();
      return false;
    }
  }, [logout]);

  return {
    ...authState,
    login,
    logout,
    handleCallback,
    refreshTokens,
  };
};

export default useSpotifyAuth;
