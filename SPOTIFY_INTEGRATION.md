# 🎵 Spotify API Integration Guide

Complete guide for integrating Spotify API with the BTS Neural Archive application.

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [Usage Examples](#usage-examples)
4. [API Reference](#api-reference)
5. [Integration with App.tsx](#integration-with-apptsx)
6. [Error Handling](#error-handling)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Instructions

### Step 1: Spotify Developer Account Setup

1. **Create a Spotify Developer Account**
   - Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account (or create one)

2. **Create a New App**
   - Click "Create an App"
   - Fill in the details:
     - **App name**: `BTS Neural Archive`
     - **App description**: `Interactive BTS discography explorer with audio analysis`
     - **Website**: Your website URL (optional)
   - Check the terms and conditions
   - Click "Create"

3. **Configure Redirect URIs**
   - In your app dashboard, click "Edit Settings"
   - Under "Redirect URIs", add:
     - Development: `http://localhost:5173/callback`
     - Production: `https://yourdomain.com/callback`
   - Click "Add"
   - Click "Save"

4. **Copy Your Client ID**
   - You'll see your **Client ID** on the app dashboard
   - **Note**: We use PKCE flow, so you don't need the Client Secret

### Step 2: Environment Configuration

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your credentials**
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_actual_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

3. **Verify `.env` is in `.gitignore`**
   ```bash
   # Should already be there, but double-check
   echo ".env" >> .gitignore
   ```

### Step 3: Install Dependencies (if needed)

The integration uses only built-in browser APIs and React. No additional npm packages are required! ✨

---

## 🏗️ Architecture Overview

### File Structure

```
src/
├── config/
│   └── spotify.ts              # Configuration constants
├── types/
│   └── spotify.ts              # TypeScript type definitions
├── lib/
│   ├── spotifyAuth.ts          # OAuth PKCE authentication
│   └── spotify.ts              # API client and data fetching
├── hooks/
│   ├── useSpotifyAuth.ts       # Authentication hook
│   └── useSpotifyData.ts       # Data fetching hooks
└── components/
    └── SpotifyCallback.tsx     # OAuth callback handler
```

### Authentication Flow

```
1. User clicks "Connect Spotify"
   └─> initiateSpotifyAuth()
       ├─> Generate code_verifier (PKCE)
       ├─> Generate code_challenge from verifier
       ├─> Store verifier in localStorage
       └─> Redirect to Spotify authorization

2. User authorizes app on Spotify
   └─> Spotify redirects to callback URL with code

3. Callback page receives code
   └─> exchangeCodeForToken(code, state)
       ├─> Verify state (CSRF protection)
       ├─> Exchange code + verifier for tokens
       ├─> Store tokens in localStorage
       └─> Redirect to main app

4. App uses tokens for API calls
   └─> Auto-refresh when expired
```

### Data Flow

```
Component
   ├─> useSpotifyAuth() ────────> Auth State
   │   ├─> isAuthenticated
   │   ├─> user
   │   └─> tokens
   │
   └─> useBTSCompleteCatalog() ─> BTS Data
       ├─> fetchBTSCompleteDiscography()
       │   ├─> getBTSDiscography() ──> Albums
       │   ├─> getAlbumTracks() ─────> Tracks
       │   └─> getAudioFeatures() ───> Audio Features
       └─> mapTrackToSong() ─────────> MappedSong[]
```

---

## 💻 Usage Examples

### Example 1: Basic Authentication

```tsx
import { useSpotifyAuth } from './hooks/useSpotifyAuth';

function LoginButton() {
  const { isAuthenticated, isLoading, user, login, logout } = useSpotifyAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div>
        <p>Welcome, {user.display_name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={login}>Connect Spotify</button>;
}
```

### Example 2: Fetch BTS Artist Info

```tsx
import { useBTSArtist } from './hooks/useSpotifyData';

function BTSArtistCard() {
  const { data: artist, isLoading, error } = useBTSArtist();

  if (isLoading) return <div>Loading artist...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!artist) return null;

  return (
    <div>
      <img src={artist.images?.[0]?.url} alt={artist.name} />
      <h2>{artist.name}</h2>
      <p>Followers: {artist.followers?.total.toLocaleString()}</p>
      <p>Popularity: {artist.popularity}/100</p>
      <p>Genres: {artist.genres?.join(', ')}</p>
    </div>
  );
}
```

### Example 3: Fetch Complete BTS Catalog

```tsx
import { useBTSCompleteCatalog } from './hooks/useSpotifyData';

function BTSCatalog() {
  const { 
    data: songs, 
    isLoading, 
    error, 
    progress, 
    progressMessage,
    fetchCatalog 
  } = useBTSCompleteCatalog();

  const handleFetch = async () => {
    try {
      await fetchCatalog();
      console.log('Catalog loaded!');
    } catch (error) {
      console.error('Failed to load catalog:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div>Loading: {progress}%</div>
        <div>{progressMessage}</div>
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  if (!songs) {
    return <button onClick={handleFetch}>Load BTS Catalog</button>;
  }

  return (
    <div>
      <h2>BTS Songs ({songs.length})</h2>
      {songs.map(song => (
        <div key={song.spotifyId}>
          <h3>{song.title}</h3>
          <p>Album: {song.album}</p>
          <p>BPM: {song.bpm} | Energy: {song.energy.toFixed(2)}</p>
          <p>Sentiment: {song.sentiment}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Search BTS Tracks

```tsx
import { useState } from 'react';
import { useSearchBTS } from './hooks/useSpotifyData';

function SearchBTS() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading, search, clear } = useSearchBTS();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search(query);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search BTS songs..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button type="button" onClick={clear}>Clear</button>
      </form>

      {results && (
        <div>
          <h3>Results: {results.length}</h3>
          {results.map(track => (
            <div key={track.id}>
              <h4>{track.name}</h4>
              <p>{track.album?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔌 Integration with App.tsx

### Step 1: Add OAuth Callback Handler

Create `src/components/SpotifyCallback.tsx` (already provided) and add routing:

```tsx
import { useEffect } from 'react';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useNavigate } from 'react-router-dom';

function SpotifyCallback() {
  const { handleCallback } = useSpotifyAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      navigate('/?error=' + error);
      return;
    }

    if (code && state) {
      handleCallback(code, state).then(success => {
        if (success) {
          navigate('/');
        } else {
          navigate('/?error=auth_failed');
        }
      });
    }
  }, [handleCallback, navigate]);

  return <div>Connecting to Spotify...</div>;
}
```

### Step 2: Modify App.tsx to Use Real Spotify Data

Replace the mock `SONG_DATABASE` with real Spotify data:

```tsx
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useBTSCompleteCatalog } from './hooks/useSpotifyData';

export default function App() {
  const { isAuthenticated, login, logout, user } = useSpotifyAuth();
  const { data: spotifySongs, isLoading, fetchCatalog } = useBTSCompleteCatalog();
  
  // Use Spotify data if available, otherwise fall back to mock data
  const SONG_DATABASE = spotifySongs || MOCK_SONG_DATABASE;

  // Add a "Connect Spotify" button in your UI
  const renderSpotifyButton = () => {
    if (!isAuthenticated) {
      return (
        <button onClick={login} className="spotify-connect-btn">
          Connect to Spotify
        </button>
      );
    }

    return (
      <div>
        <span>Connected: {user?.display_name}</span>
        <button onClick={logout}>Disconnect</button>
        {!spotifySongs && (
          <button onClick={fetchCatalog}>Load BTS Catalog</button>
        )}
      </div>
    );
  };

  // Rest of your App.tsx code...
}
```

### Step 3: Update DataHub to Use Real Data

Replace the static table with dynamic Spotify data:

```tsx
const DataHub = ({ accentColor = "#A855F7" }: { accentColor?: string }) => {
  const { data: songs, isLoading } = useBTSCompleteCatalog();
  
  if (isLoading) {
    return <div>Loading BTS catalog...</div>;
  }

  const displaySongs = songs || SONG_DATABASE; // Fallback to mock data

  return (
    // ... existing DataHub UI with displaySongs
  );
};
```

### Step 4: Update SonicAnalyzer with Real Audio Features

```tsx
const SonicAnalyzer = ({ trackId }: { trackId: string }) => {
  const { data, isLoading } = useTrackWithFeatures(trackId);

  if (isLoading) return <div>Loading audio features...</div>;
  if (!data) return <div>Select a track</div>;

  const { track, features } = data;

  return (
    <div>
      <h3>{track.name}</h3>
      <div>BPM: {Math.round(features.tempo)}</div>
      <div>Energy: {(features.energy * 100).toFixed(0)}%</div>
      <div>Valence: {(features.valence * 100).toFixed(0)}%</div>
      <div>Danceability: {(features.danceability * 100).toFixed(0)}%</div>
      {/* Visualize with your existing bars */}
    </div>
  );
};
```

---

## 📚 API Reference

### Authentication Functions

#### `initiateSpotifyAuth()`
Initiates OAuth flow and redirects to Spotify.

```typescript
await initiateSpotifyAuth();
```

#### `exchangeCodeForToken(code, state)`
Exchanges authorization code for access token.

```typescript
const tokens = await exchangeCodeForToken(code, state);
```

#### `refreshAccessToken(refreshToken)`
Refreshes expired access token.

```typescript
const newTokens = await refreshAccessToken(refreshToken);
```

### Data Fetching Functions

#### `getBTSArtist()`
Fetches BTS artist information.

```typescript
const artist: SpotifyArtist = await getBTSArtist();
```

#### `getBTSDiscography()`
Fetches all BTS albums.

```typescript
const albums: SpotifyAlbum[] = await getBTSDiscography();
```

#### `fetchBTSCompleteDiscography(onProgress?)`
Fetches all BTS tracks with audio features.

```typescript
const songs: MappedSong[] = await fetchBTSCompleteDiscography(
  (progress, message) => {
    console.log(`${progress}%: ${message}`);
  }
);
```

#### `searchBTSTracks(query)`
Searches for BTS tracks.

```typescript
const tracks: SpotifyTrack[] = await searchBTSTracks('dynamite');
```

#### `getAudioFeatures(trackId)`
Gets audio features for a track.

```typescript
const features: SpotifyAudioFeatures = await getAudioFeatures(trackId);
```

---

## 🛡️ Error Handling

### Authentication Errors

```tsx
const { error, isAuthenticated, login } = useSpotifyAuth();

if (error) {
  if (error.includes('expired')) {
    // Token expired - prompt re-login
    return <button onClick={login}>Session Expired - Reconnect</button>;
  }
  
  if (error.includes('State mismatch')) {
    // Possible CSRF attack
    return <div>Security error. Please try again.</div>;
  }
  
  // Generic error
  return <div>Error: {error}</div>;
}
```

### API Errors

```tsx
const { data, error, isLoading, fetchCatalog } = useBTSCompleteCatalog();

const handleFetch = async () => {
  try {
    await fetchCatalog();
  } catch (error) {
    if (error.message.includes('Authentication')) {
      // Auth issue - prompt login
      alert('Please connect to Spotify first');
    } else if (error.message.includes('Rate limit')) {
      // Rate limited
      alert('Too many requests. Please wait a moment.');
    } else {
      // Generic error
      console.error('Fetch error:', error);
    }
  }
};
```

### Error Boundaries

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class SpotifyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Spotify integration error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong with Spotify</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🔧 Troubleshooting

### Problem: "Redirect URI mismatch"

**Solution**: 
- Ensure the redirect URI in your `.env` exactly matches what's in Spotify Dashboard
- Check for trailing slashes - they matter!
- Verify the port number (5173 for Vite default)

### Problem: "Invalid client"

**Solution**:
- Double-check your `VITE_SPOTIFY_CLIENT_ID` in `.env`
- Make sure there are no extra spaces
- Restart your dev server after changing `.env`

### Problem: Token expires immediately

**Solution**:
- Check your system clock - it should be accurate
- Clear localStorage and try again:
  ```javascript
  localStorage.clear();
  ```

### Problem: CORS errors

**Solution**:
- CORS shouldn't be an issue with Spotify API
- If you see CORS errors, you might be using the wrong endpoint
- Ensure you're using `https://api.spotify.com/v1/` (with v1)

### Problem: Rate limiting (429 errors)

**Solution**:
- Implement caching (already included)
- Add delays between batch requests
- Reduce the number of concurrent requests

### Problem: "No token available" after login

**Solution**:
- Check browser console for errors during callback
- Verify the callback route is set up correctly
- Clear localStorage and try the auth flow again

---

## 🎯 Best Practices

### 1. Cache Aggressively
```typescript
// Use the built-in cache
const artist = await getCachedData('bts-artist', getBTSArtist);
```

### 2. Handle Loading States
```tsx
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

### 3. Batch Requests
```typescript
// Good: Batch request
const features = await getMultipleAudioFeatures(trackIds);

// Bad: Individual requests
for (const id of trackIds) {
  await getAudioFeatures(id); // Don't do this!
}
```

### 4. Persist Important Data
```typescript
// Save catalog to localStorage for offline access
const songs = await fetchCatalog();
localStorage.setItem('bts-catalog-cache', JSON.stringify(songs));
```

### 5. Graceful Degradation
```typescript
// Always have fallback mock data
const displayData = spotifyData || mockData;
```

---

## 📊 Data Schema Mapping

### Spotify Track → Internal Song

```typescript
SpotifyTrack + SpotifyAudioFeatures → MappedSong
{
  id: number,                    // Sequential ID
  spotifyId: string,             // Spotify track ID
  title: string,                 // track.name
  album: string,                 // track.album.name
  albumArt: string,              // track.album.images[0].url
  artists: string[],             // track.artists.map(a => a.name)
  bpm: number,                   // Math.round(features.tempo)
  energy: number,                // features.energy (0-1)
  valence: number,               // features.valence (0-1)
  danceability: number,          // features.danceability (0-1)
  sentiment: string,             // Calculated from valence + energy
  duration_ms: number,           // track.duration_ms
  popularity: number,            // track.popularity
  preview_url: string | null,    // track.preview_url
  spotify_url: string,           // track.external_urls.spotify
  release_date: string,          // track.album.release_date
}
```

### Sentiment Mapping

```typescript
Valence > 0.7 && Energy > 0.7  → "Joy"
Valence > 0.6 && Energy > 0.5  → "Celebration"
Valence > 0.5                  → "Comfort"
Valence > 0.4                  → "Confidence"
Valence > 0.3                  → "Longing"
Valence > 0.2                  → "Pain"
Otherwise                      → "Fear"
```

---

## 🚢 Production Deployment

### 1. Update Environment Variables

Set these in your hosting provider (Vercel, Netlify, etc.):

```env
VITE_SPOTIFY_CLIENT_ID=your_production_client_id
VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
```

### 2. Update Spotify App Settings

Add production redirect URI to your Spotify app dashboard.

### 3. Enable HTTPS

Spotify requires HTTPS for production redirect URIs.

### 4. Add Error Tracking

```typescript
// Example with Sentry
import * as Sentry from '@sentry/react';

try {
  await fetchBTSCompleteDiscography();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## 📝 License Note

When using Spotify data:
- Display proper attribution (Spotify logo)
- Follow [Spotify's Design Guidelines](https://developer.spotify.com/documentation/general/design-and-branding/)
- Don't cache data for more than 24 hours (as per Spotify TOS)
- Don't download or store audio files

---

## 🎉 You're All Set!

The Spotify integration is now complete. Your app can:
- ✅ Authenticate users with OAuth 2.0 PKCE
- ✅ Fetch BTS artist information
- ✅ Load complete BTS discography
- ✅ Get audio features (BPM, energy, valence, etc.)
- ✅ Search BTS tracks
- ✅ Map data to your existing schema
- ✅ Handle errors gracefully
- ✅ Cache data for performance

For questions or issues, refer to:
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [OAuth 2.0 PKCE Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
