/**
 * Spotify OAuth 2.0 with PKCE (Proof Key for Code Exchange)
 * Implementation following: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

import { SPOTIFY_CONFIG } from '../config/spotify';
import type { SpotifyAuthTokens } from '../types/spotify';

/**
 * Generate a cryptographically random code verifier
 */
const generateCodeVerifier = (length: number = 128): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

/**
 * Generate code challenge from verifier using SHA-256
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Base64URL encode
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Generate random state for CSRF protection
 */
const generateRandomState = (length: number = 16): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

/**
 * Initiate Spotify authorization flow
 */
export const initiateSpotifyAuth = async (): Promise<void> => {
  try {
    // Generate and store code verifier
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem(SPOTIFY_CONFIG.STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    
    // Generate code challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Generate and store state
    const state = generateRandomState();
    localStorage.setItem(SPOTIFY_CONFIG.STORAGE_KEYS.STATE, state);
    
    // Build authorization URL
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      state: state,
      scope: SPOTIFY_CONFIG.SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });
    
    // Redirect to Spotify authorization
    window.location.href = `${SPOTIFY_CONFIG.AUTH_ENDPOINT}?${params.toString()}`;
  } catch (error) {
    console.error('Error initiating Spotify auth:', error);
    throw new Error('Failed to initiate Spotify authentication');
  }
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string, state: string): Promise<SpotifyAuthTokens> => {
  try {
    // Verify state matches
    const storedState = localStorage.getItem(SPOTIFY_CONFIG.STORAGE_KEYS.STATE);
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }
    
    // Get stored code verifier
    const codeVerifier = localStorage.getItem(SPOTIFY_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }
    
    // Exchange code for token
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      code_verifier: codeVerifier,
    });
    
    const response = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }
    
    const data = await response.json();
    
    // Calculate expiration timestamp
    const expiresAt = Date.now() + data.expires_in * 1000;
    
    const tokens: SpotifyAuthTokens = {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
    };
    
    // Store tokens
    storeTokens(tokens);
    
    // Clean up temporary storage
    localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
    localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.STATE);
    
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyAuthTokens> => {
  try {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    
    const response = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    const expiresAt = Date.now() + data.expires_in * 1000;
    
    const tokens: SpotifyAuthTokens = {
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token || refreshToken, // Use existing if not provided
      expires_at: expiresAt,
    };
    
    storeTokens(tokens);
    
    return tokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, clear all tokens
    clearTokens();
    throw error;
  }
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: SpotifyAuthTokens): void => {
  localStorage.setItem(SPOTIFY_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(SPOTIFY_CONFIG.STORAGE_KEYS.EXPIRES_AT, tokens.expires_at.toString());
  if (tokens.refresh_token) {
    localStorage.setItem(SPOTIFY_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }
};

/**
 * Retrieve stored tokens
 */
export const getStoredTokens = (): SpotifyAuthTokens | null => {
  const accessToken = localStorage.getItem(SPOTIFY_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(SPOTIFY_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  const expiresAt = localStorage.getItem(SPOTIFY_CONFIG.STORAGE_KEYS.EXPIRES_AT);
  
  if (!accessToken || !expiresAt) {
    return null;
  }
  
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    scope: SPOTIFY_CONFIG.SCOPES,
    expires_in: 3600,
    refresh_token: refreshToken || undefined,
    expires_at: parseInt(expiresAt, 10),
  };
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (tokens: SpotifyAuthTokens | null): boolean => {
  if (!tokens) return true;
  // Add 5 minute buffer
  return Date.now() >= tokens.expires_at - 5 * 60 * 1000;
};

/**
 * Clear all stored tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
  localStorage.removeItem(SPOTIFY_CONFIG.STORAGE_KEYS.STATE);
};

/**
 * Logout - clear tokens and optionally redirect
 */
export const logout = (redirectToHome: boolean = true): void => {
  clearTokens();
  if (redirectToHome) {
    window.location.href = '/';
  }
};
