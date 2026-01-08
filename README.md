# BTS Neural Archive 🌌

An immersive, cosmic web experience exploring the BTS universe with real-time Spotify integration, featuring interactive 3D visualizations, audio analysis, and a complete discography archive.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?style=flat&logo=tailwind-css)
![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?style=flat&logo=spotify)

## ✨ Features

### 🎵 Spotify Integration
- **OAuth 2.0 Authentication** - Secure login with PKCE flow
- **Complete BTS Discography** - 200+ tracks with metadata
- **Audio Features** - Real-time BPM, energy, valence, danceability from Spotify
- **Smart Search** - Full-text search across BTS catalog
- **Artist Data** - Popularity, followers, genres, and more
- **Auto-Caching** - Performance-optimized data fetching

### 🌟 Cosmic Experience
- **3D Universe Background** - 800+ procedurally generated stars
- **Purple Ocean Effect** - Bokeh-style ARMY bomb visualization
- **Whalien 52 Constellation** - Animated space whale artwork
- **Shooting Stars** - Dynamic celestial animations
- **Glassmorphic UI** - Beautiful frosted glass panels

### 📊 Interactive Modules
- **Mission Control** - Dashboard overview
- **Sonic Lab** - Real-time audio visualizer with Spotify data
- **Archive Graph** - RAG-powered search system
- **Records Hub** - Complete database viewer with filtering
- **Member DNA** - Detailed artist profiles for each BTS member

### 🎨 Design
- **Borahae Purple Theme** - Member-specific color palette
- **Custom Animations** - 20+ CSS keyframe animations
- **Responsive Layout** - Optimized for all screen sizes
- **Noise Overlay** - Film grain aesthetic
- **Smooth Transitions** - Cinematic state changes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Spotify Developer Account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsmepraks/BTS-universe.git
   cd BTS-universe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify API** (Optional - app works with mock data without this)
   
   a. Create a Spotify app at [Spotify for Developers](https://developer.spotify.com/dashboard)
   
   b. Add redirect URI: `http://localhost:5173/callback`
   
   c. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   d. Add your Spotify Client ID to `.env`:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute integration guide
- **[SPOTIFY_INTEGRATION.md](./SPOTIFY_INTEGRATION.md)** - Complete API documentation
- **[AESTHETIC_PLAN.md](./AESTHETIC_PLAN.md)** - Visual design philosophy

## 🎯 Usage

### Basic Usage (Without Spotify)

The app works immediately with mock BTS data:

```bash
npm run dev
```

Click "Go to Dashboard" to explore the interface.

### With Spotify Integration

1. Follow setup steps above to configure Spotify
2. Click "Connect Spotify" in the app
3. Authorize the app on Spotify
4. Load the complete BTS catalog with real audio features
5. Search, explore, and analyze with real data!

### Example: Loading Real Data

```tsx
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useBTSCompleteCatalog } from './hooks/useSpotifyData';

function App() {
  const { isAuthenticated, login } = useSpotifyAuth();
  const { data: songs, fetchCatalog } = useBTSCompleteCatalog();

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={login}>Connect Spotify</button>
      ) : (
        <button onClick={fetchCatalog}>Load BTS Catalog</button>
      )}
      
      {songs && <p>{songs.length} songs loaded!</p>}
    </div>
  );
}
```

## 🛠️ Tech Stack

### Core
- **React 19.2.0** - UI library with React Compiler
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool with HMR

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **Custom CSS** - 20+ keyframe animations
- **Lucide React** - Icon library

### API Integration
- **Spotify Web API** - Music data and audio features
- **OAuth 2.0 PKCE** - Secure authentication
- **Custom Hooks** - React data fetching patterns

## 📂 Project Structure

```
BTS-universe/
├── src/
│   ├── components/
│   │   └── SpotifyCallback.tsx    # OAuth redirect handler
│   ├── hooks/
│   │   ├── useSpotifyAuth.ts      # Authentication hook
│   │   └── useSpotifyData.ts      # Data fetching hooks
│   ├── lib/
│   │   ├── spotify.ts             # Spotify API client
│   │   └── spotifyAuth.ts         # OAuth implementation
│   ├── types/
│   │   └── spotify.ts             # TypeScript definitions
│   ├── config/
│   │   └── spotify.ts             # Configuration
│   ├── App.tsx                    # Main application
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── public/
├── .env.example                    # Environment template
├── QUICKSTART.md                   # Quick integration guide
├── SPOTIFY_INTEGRATION.md          # Full API documentation
└── AESTHETIC_PLAN.md               # Design documentation
```

## 🎨 Customization

### Colors

The app uses a "Borahae" purple palette with member-specific colors:

```typescript
const MEMBER_COLORS = {
  RM: '#2563EB',      // Blue
  Jin: '#EC4899',     // Pink
  Suga: '#10B981',    // Green
  J-Hope: '#EF4444',  // Red
  Jimin: '#F59E0B',   // Gold
  V: '#22c55e',       // Green
  Jungkook: '#8B5CF6' // Purple
};
```

### Animations

Modify animations in `src/index.css`:

```css
@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.3; }
}
```

## 🔒 Security

- ✅ OAuth 2.0 with PKCE (no client secret exposure)
- ✅ CSRF protection with state parameter
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Input validation

## 📊 Data Sources

### Mock Data (Default)
- 7 BTS members with profiles
- 10 sample songs with features
- Instant load, no API required

### Spotify Data (Optional)
- 200+ BTS tracks
- Real audio features (BPM, energy, valence)
- Artist metadata
- Album artwork
- Search functionality

## 🎯 Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SPOTIFY_CLIENT_ID`
   - `VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback`
4. Deploy!

### Other Platforms

Works with any static hosting (Netlify, GitHub Pages, etc.)

Remember to update the Spotify redirect URI in your Spotify app settings.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **BTS** - For the incredible music and inspiration
- **Spotify** - For the comprehensive Web API
- **ARMY** - The purple ocean that connects us all 💜

## 🌟 Features Roadmap

- [ ] Audio playback with preview tracks
- [ ] Playlist creation
- [ ] Lyric analysis with NLP
- [ ] Timeline visualization of releases
- [ ] Member recommendation engine
- [ ] Share favorite songs on social media
- [ ] Dark/Light theme toggle
- [ ] Mobile app version

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check [SPOTIFY_INTEGRATION.md](./SPOTIFY_INTEGRATION.md) for API help
- See [QUICKSTART.md](./QUICKSTART.md) for setup help

---

**Built with 💜 for ARMY**

*"Shine, dream, smile. Oh let us light up the night."* - Mikrokosmos
