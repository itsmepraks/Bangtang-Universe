# 🚀 Spotify Integration - Quick Start Guide

Get Spotify integration working in your BTS-universe app in **5 minutes**!

## ⚡ 3-Step Setup

### Step 1: Spotify Developer Setup (2 minutes)

1. Visit https://developer.spotify.com/dashboard
2. Click "Create an App"
3. Name: `BTS Neural Archive`
4. Description: `Interactive BTS discography explorer`
5. Click "Edit Settings" → Add Redirect URI: `http://localhost:5173/callback`
6. Save and copy your **Client ID**

### Step 2: Environment Configuration (30 seconds)

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### Step 3: Update App.tsx (2 minutes)

Add these imports at the top of `src/App.tsx`:

```tsx
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useBTSCompleteCatalog } from './hooks/useSpotifyData';
import SpotifyCallback from './components/SpotifyCallback';
```

Inside your `App()` component, add at the top:

```tsx
export default function App() {
  // Add Spotify hooks
  const { isAuthenticated, user, login, logout } = useSpotifyAuth();
  const { 
    data: spotifySongs, 
    isLoading: loadingCatalog, 
    fetchCatalog 
  } = useBTSCompleteCatalog();
  
  // Use Spotify data if available, otherwise use mock data
  const SONG_DATABASE_LIVE = spotifySongs || SONG_DATABASE;
  
  // Rest of your existing code...
```

## 🎨 Add "Connect Spotify" Button

### Option 1: In the Landing Page

Replace or add alongside the existing "HOLD TO SYNC" button:

```tsx
const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
  const { isAuthenticated, login } = useSpotifyAuth();
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden select-none">
      {/* Existing landing content */}
      
      <div className="absolute bottom-20 flex flex-col items-center gap-4">
        <button 
          onClick={onSync}
          className="px-8 py-4 bg-purple-600 rounded-2xl text-white"
        >
          Enter Archive
        </button>
        
        {!isAuthenticated && (
          <button 
            onClick={login}
            className="px-8 py-3 bg-green-600 rounded-2xl text-white flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Spotify
          </button>
        )}
      </div>
    </div>
  );
};
```

### Option 2: In the Dashboard Header

Add to the header next to member selectors:

```tsx
<header className="h-28 flex items-center justify-between px-16">
  <div>{/* Existing title */}</div>
  
  <div className="flex items-center gap-4">
    {/* Spotify Status */}
    {isAuthenticated ? (
      <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-2xl">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-green-300">{user?.display_name}</span>
        <button onClick={logout} className="text-xs text-white/40 hover:text-white">
          Disconnect
        </button>
      </div>
    ) : (
      <button 
        onClick={login}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-2xl text-white text-xs font-bold"
      >
        Connect Spotify
      </button>
    )}
    
    {/* Existing member selectors */}
  </div>
</header>
```

## 🎵 Use Real BTS Data

### In DataHub Component

Replace the static `SONG_DATABASE` with live data:

```tsx
const DataHub = ({ accentColor = "#A855F7" }: { accentColor?: string }) => {
  const { data: spotifySongs, isLoading } = useBTSCompleteCatalog();
  
  // Use Spotify data if available
  const songs = spotifySongs || SONG_DATABASE;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-purple-300 mb-4">Loading BTS Catalog...</div>
          <div className="text-sm text-white/40">Fetching from Spotify</div>
        </div>
      </div>
    );
  }
  
  return (
    // Your existing DataHub UI with `songs` instead of SONG_DATABASE
  );
};
```

### In RAGNetwork (Search)

Use real Spotify search:

```tsx
const RAGNetwork = ({ accentColor = "#A855F7" }: { accentColor?: string }) => {
  const { data: results, isLoading, search } = useSearchBTS();
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    await search(query);
  };

  return (
    // Your existing RAGNetwork UI
    // results will contain actual Spotify tracks
  );
};
```

### Load Catalog on Demand

Add a button to fetch the full catalog:

```tsx
const [catalogLoaded, setCatalogLoaded] = useState(false);

const handleLoadCatalog = async () => {
  await fetchCatalog();
  setCatalogLoaded(true);
};

{!catalogLoaded && isAuthenticated && (
  <button 
    onClick={handleLoadCatalog}
    className="px-6 py-3 bg-purple-600 rounded-xl"
  >
    Load Complete BTS Catalog
  </button>
)}
```

## 🎯 Handle the Callback Route

You have two options:

### Option A: Simple Hash Router (Recommended)

Add this at the beginning of your `App()` component:

```tsx
export default function App() {
  // Check if we're on the callback page
  if (window.location.pathname === '/callback') {
    return <SpotifyCallback />;
  }
  
  // Rest of your app...
```

### Option B: Add React Router (if you want routing)

```bash
npm install react-router-dom
```

Update `main.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpotifyCallback from './components/SpotifyCallback';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

## ✅ Test It!

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Click "Connect Spotify"

3. Authorize the app on Spotify

4. You'll be redirected back and authenticated!

5. Load the BTS catalog and see real data

## 🎨 Show Loading Progress

When fetching the complete catalog (200+ songs), show progress:

```tsx
const { 
  data: songs, 
  isLoading, 
  progress, 
  progressMessage,
  fetchCatalog 
} = useBTSCompleteCatalog();

{isLoading && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="text-4xl font-light text-white mb-4">
        {progress}%
      </div>
      <div className="text-purple-300 text-sm">
        {progressMessage}
      </div>
      <div className="w-64 h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
        <div 
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
)}
```

## 🔥 Pro Tips

### 1. Cache the Catalog

Save to localStorage to avoid re-fetching:

```tsx
useEffect(() => {
  if (spotifySongs) {
    localStorage.setItem('bts-catalog', JSON.stringify(spotifySongs));
  }
}, [spotifySongs]);

// On mount, try to load from cache
useEffect(() => {
  const cached = localStorage.getItem('bts-catalog');
  if (cached) {
    // Use cached data
  }
}, []);
```

### 2. Auto-Fetch on Auth

Automatically load catalog when user connects:

```tsx
useEffect(() => {
  if (isAuthenticated && !spotifySongs) {
    fetchCatalog();
  }
}, [isAuthenticated]);
```

### 3. Show Spotify Attribution

Add Spotify logo when using their data:

```tsx
{spotifySongs && (
  <div className="flex items-center gap-2 text-xs text-white/40">
    <span>Powered by</span>
    <svg className="w-16 h-5" viewBox="0 0 167 40" fill="currentColor">
      {/* Spotify logo SVG */}
    </svg>
  </div>
)}
```

## 🐛 Common Issues

### "Redirect URI mismatch"
- Check your `.env` matches exactly what's in Spotify Dashboard
- Restart dev server after changing `.env`

### "Invalid client"  
- Double-check your Client ID
- Make sure there are no spaces before/after

### Token expires immediately
- Check your system clock is accurate
- Clear localStorage: `localStorage.clear()`

## 📚 Full Documentation

For complete documentation, see:
- **SPOTIFY_INTEGRATION.md** - Complete guide with all features
- **src/hooks/** - Hook documentation in JSDoc comments
- **src/lib/** - API client documentation

## 🎉 You're Done!

Your app now has:
- ✅ Spotify authentication
- ✅ Real BTS discography
- ✅ Audio features (BPM, energy, etc.)
- ✅ Search functionality
- ✅ Automatic caching

**Enjoy your Spotify-powered BTS Neural Archive!** 🌌✨
