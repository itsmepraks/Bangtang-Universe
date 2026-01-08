/**
 * Spotify API Configuration
 * Manages environment variables and API constants
 */

export const SPOTIFY_CONFIG = {
  // Client credentials from environment
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  
  // Redirect URI must match exactly what's registered in Spotify Dashboard
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback',
  
  // Scopes required for the application
  // See: https://developer.spotify.com/documentation/web-api/concepts/scopes
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'playlist-read-private',
  ].join(' '),
  
  // Spotify API endpoints
  API_BASE_URL: 'https://api.spotify.com/v1',
  AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
  TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'spotify_access_token',
    REFRESH_TOKEN: 'spotify_refresh_token',
    EXPIRES_AT: 'spotify_expires_at',
    CODE_VERIFIER: 'spotify_code_verifier',
    STATE: 'spotify_auth_state',
  },
  
  // BTS Artist IDs on Spotify
  BTS_ARTIST_IDS: {
    BTS_GROUP: '3Nrfpe0tUJi4K4DXYWgMUX', // Official BTS Spotify ID
  },
  
  // Cache configuration
  CACHE_DURATION: 1000 * 60 * 30, // 30 minutes
} as const;

// Validation helper
export const validateSpotifyConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!SPOTIFY_CONFIG.CLIENT_ID) {
    errors.push('VITE_SPOTIFY_CLIENT_ID is not configured');
  }
  
  if (!SPOTIFY_CONFIG.REDIRECT_URI) {
    errors.push('VITE_SPOTIFY_REDIRECT_URI is not configured');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Helper to check if running in development
export const isDevelopment = import.meta.env.DEV;

// Helper to check if running in production
export const isProduction = import.meta.env.PROD;
