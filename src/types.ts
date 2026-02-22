/**
 * Type Definitions for BTS Neural Archive
 * 
 * This file centralizes all TypeScript interfaces and types used throughout
 * the application for better maintainability, type safety, and code organization.
 * 
 * **Type Categories:**
 * - Member Types: BTS member profile data
 * - Song & Music Types: Discography and audio analysis
 * - Component Props Types: React component interfaces
 * - Search & RAG Types: Semantic search results
 * - Animation & Visual Types: 3D positioning and particles
 * - Application State Types: App-wide state management
 * - Utility Types: Common type aliases
 * 
 * @module types
 */

// ============================================================================
// MEMBER TYPES
// ============================================================================

/**
 * Represents a BTS member with their complete profile information.
 * 
 * Contains biographical data, achievements, solo work, and metadata for
 * each member of BTS. Used throughout the application for member profiles,
 * constellation displays, and DNA visualizations.
 * 
 * **Data Source:** Static member data from constants/members.ts
 * 
 * @interface Member
 * 
 * @example
 * // Complete member object
 * const rm: Member = {
 *   id: 'rm',
 *   name: 'RM',
 *   full: 'Kim Namjoon',
 *   color: '#A855F7',
 *   role: 'Leader, Main Rapper',
 *   mic: 'Black',
 *   komca: 227,
 *   bio: 'RM is the leader of BTS and a prolific songwriter...',
 *   soloTracks: ['Moonchild', 'Forever Rain', 'Wild Flower'],
 *   achievements: ['First K-pop artist at LACMA', 'Multiple #1 albums'],
 * };
 * 
 * @example
 * // Member card component
 * function MemberCard({ member }: { member: Member }) {
 *   return (
 *     <div 
 *       className="member-card"
 *       style={{ borderColor: member.color }}
 *     >
 *       <h2>{member.name}</h2>
 *       <p className="role">{member.role}</p>
 *       <p className="bio">{member.bio}</p>
 *       <div className="stats">
 *         <span>{member.komca} KOMCA credits</span>
 *         <span>{member.soloTracks.length} solo tracks</span>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Filter members by role
 * const rappers = members.filter(m => 
 *   m.role.toLowerCase().includes('rapper')
 * );
 * 
 * @example
 * // Sort by KOMCA credits
 * const byCredits = [...members].sort((a, b) => b.komca - a.komca);
 * console.log(`Most credits: ${byCredits[0].name} (${byCredits[0].komca})`);
 * 
 * @validation
 * - id: Must be unique, lowercase, alphanumeric
 * - name: Must be non-empty string
 * - color: Must be valid hex color (#RRGGBB)
 * - komca: Must be non-negative integer
 * - soloTracks/achievements: Must be arrays (can be empty)
 * 
 * @see {@link getMemberColor} in constants/colors.ts for color utilities
 */
export interface Member {
  /** Unique identifier (e.g., 'rm', 'jin', 'suga') */
  id: string;
  
  /** Stage name (e.g., 'RM', 'JIN') */
  name: string;
  
  /** Full legal name (e.g., 'Kim Namjoon') */
  full: string;
  
  /** Signature color in hex format (e.g., '#A855F7') */
  color: string;
  
  /** Role in the group (e.g., 'Leader, Main Rapper') */
  role: string;
  
  /** Microphone color used in performances (e.g., 'Black') */
  mic: string;
  
  /** Number of KOMCA (Korea Music Copyright Association) credits */
  komca: number;
  
  /** Biography/description of the member */
  bio: string;
  
  /** List of solo tracks (song titles) */
  soloTracks: string[];
  
  /** List of achievements and milestones */
  achievements: string[];
}

// ============================================================================
// SONG & MUSIC TYPES
// ============================================================================

/**
 * Represents a song in the BTS discography.
 * 
 * Contains metadata and audio analysis metrics for a single song. Used for
 * visualizations, filtering, searching, and sonic analysis throughout the
 * BTS Neural Archive.
 * 
 * **Audio Metrics:**
 * - Energy: Overall intensity and activity (0.0 = calm, 1.0 = intense)
 * - Valence: Musical positivity (0.0 = sad, 1.0 = happy)
 * - BPM: Tempo in beats per minute (typical range: 60-180)
 * 
 * @interface Song
 * 
 * @example
 * // Complete song object
 * const springDay: Song = {
 *   id: 1,
 *   title: 'Spring Day',
 *   album: 'You Never Walk Alone',
 *   bpm: 92,
 *   energy: 0.45,
 *   valence: 0.35,
 *   sentiment: 'Melancholic',
 * };
 * 
 * @example
 * // Song list component
 * function SongList({ songs }: { songs: Song[] }) {
 *   return (
 *     <ul className="song-list">
 *       {songs.map(song => (
 *         <li key={song.id}>
 *           <span className="title">{song.title}</span>
 *           <span className="album">{song.album}</span>
 *           <span className="bpm">{song.bpm} BPM</span>
 *           <span className="sentiment">{song.sentiment}</span>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * 
 * @example
 * // Filter high-energy songs
 * const highEnergy = songs.filter(song => song.energy > 0.7);
 * 
 * @example
 * // Find songs by sentiment
 * const uplifting = songs.filter(song => 
 *   song.sentiment === 'Uplifting' || song.valence > 0.7
 * );
 * 
 * @example
 * // Audio visualization based on metrics
 * function SongVisualizer({ song }: { song: Song }) {
 *   const energyColor = `hsl(${song.energy * 120}, 70%, 50%)`;
 *   const valenceSize = 50 + song.valence * 100;
 *   
 *   return (
 *     <div className="visualizer">
 *       <div 
 *         className="energy-bar"
 *         style={{ 
 *           width: `${song.energy * 100}%`,
 *           backgroundColor: energyColor 
 *         }}
 *       />
 *       <div 
 *         className="valence-circle"
 *         style={{ 
 *           width: valenceSize,
 *           height: valenceSize 
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * 
 * @validation
 * - id: Must be unique positive integer
 * - title: Must be non-empty string
 * - album: Must be non-empty string
 * - bpm: Must be positive number (typical range: 60-180)
 * - energy: Must be 0.0 to 1.0 (inclusive)
 * - valence: Must be 0.0 to 1.0 (inclusive)
 * - sentiment: Must be descriptive string (e.g., 'Uplifting', 'Melancholic')
 * 
 * @see {@link AudioMetrics} for additional audio analysis properties
 * @see {@link getSentimentColor} in constants/colors.ts for sentiment color mapping
 */
export interface Song {
  /** Unique song identifier */
  id: number;
  
  /** Song title */
  title: string;
  
  /** Album name */
  album: string;
  
  /** Beats per minute (tempo) */
  bpm: number;
  
  /** Energy level (0.0 = calm, 1.0 = intense) */
  energy: number;
  
  /** Valence/positivity level (0.0 = sad, 1.0 = happy) */
  valence: number;
  
  /** Emotional sentiment classification (e.g., 'Uplifting', 'Melancholic') */
  sentiment: string;
}

/**
 * Audio analysis metrics for advanced music analysis.
 * 
 * Extended audio features beyond basic Song interface. Used for detailed
 * sonic analysis, audio visualizations, and similarity matching. Can be
 * obtained from Spotify API, audio processing libraries, or pre-computed.
 * 
 * **Metric Definitions:**
 * - Energy: Perceptual intensity and activity (0.0-1.0)
 * - Valence: Musical positiveness conveyed (0.0-1.0)
 * - BPM: Tempo in beats per minute
 * - Danceability: How suitable for dancing (0.0-1.0)
 * - Acousticness: Confidence the track is acoustic (0.0-1.0)
 * - Instrumentalness: Predicts vocal absence (0.0-1.0)
 * 
 * @interface AudioMetrics
 * 
 * @example
 * // Complete audio metrics
 * const metrics: AudioMetrics = {
 *   energy: 0.85,
 *   valence: 0.65,
 *   bpm: 128,
 *   danceability: 0.72,
 *   acousticness: 0.12,
 *   instrumentalness: 0.05,
 * };
 * 
 * @example
 * // Sonic analyzer component
 * function SonicAnalyzer({ metrics }: { metrics: AudioMetrics }) {
 *   return (
 *     <div className="sonic-analyzer">
 *       <MetricBar label="Energy" value={metrics.energy} />
 *       <MetricBar label="Valence" value={metrics.valence} />
 *       <MetricBar label="Danceability" value={metrics.danceability || 0} />
 *       <MetricBar label="Acousticness" value={metrics.acousticness || 0} />
 *       <div className="bpm">
 *         <span>{metrics.bpm} BPM</span>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Find similar songs by metrics
 * function findSimilarSongs(target: AudioMetrics, songs: AudioMetrics[]) {
 *   return songs.map(song => ({
 *     song,
 *     similarity: calculateSimilarity(target, song),
 *   }))
 *   .sort((a, b) => b.similarity - a.similarity)
 *   .slice(0, 5);
 * }
 * 
 * function calculateSimilarity(a: AudioMetrics, b: AudioMetrics): number {
 *   const energyDiff = Math.abs(a.energy - b.energy);
 *   const valenceDiff = Math.abs(a.valence - b.valence);
 *   const bpmDiff = Math.abs(a.bpm - b.bpm) / 180; // Normalize
 *   
 *   return 1 - (energyDiff + valenceDiff + bpmDiff) / 3;
 * }
 * 
 * @example
 * // Recommend based on mood
 * function getPlaylistByMood(mood: 'happy' | 'sad' | 'energetic' | 'calm') {
 *   const filters: Record<string, Partial<AudioMetrics>> = {
 *     happy: { valence: 0.7, energy: 0.6 },
 *     sad: { valence: 0.3, energy: 0.4 },
 *     energetic: { energy: 0.8, bpm: 120 },
 *     calm: { energy: 0.3, acousticness: 0.6 },
 *   };
 *   
 *   return filterSongsByMetrics(filters[mood]);
 * }
 * 
 * @validation
 * - energy, valence, danceability, acousticness, instrumentalness: 0.0-1.0
 * - bpm: Positive number, typical range 60-180
 * - All optional fields can be undefined
 * 
 * @see {@link Song} for basic song metadata
 */
export interface AudioMetrics {
  /** Energy level (0.0-1.0) */
  energy: number;
  
  /** Valence/happiness level (0.0-1.0) */
  valence: number;
  
  /** Beats per minute */
  bpm: number;
  
  /** Danceability score (0.0-1.0, optional) */
  danceability?: number;
  
  /** Acousticness level (0.0-1.0, optional) */
  acousticness?: number;
  
  /** Instrumentalness (0.0-1.0, optional) - predicts vocal absence */
  instrumentalness?: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for the Universe3D background component.
 * 
 * Controls the visual state of the 3D cosmic universe background. The mode
 * determines star behavior, camera effects, and transition animations.
 * 
 * **Mode Descriptions:**
 * - `landing`: Initial state, slow star drift, subtle parallax
 * - `warp`: Transition state, stars stream toward camera
 * - `dashboard`: Active state, stars as background, minimal movement
 * 
 * @interface UniverseProps
 * 
 * @example
 * // Basic usage
 * <Universe3D mode="landing" />
 * 
 * @example
 * // State-driven mode
 * function App() {
 *   const [appMode, setAppMode] = useState<AppMode>('landing');
 *   
 *   return (
 *     <>
 *       <Universe3D mode={appMode} />
 *       {appMode === 'landing' && <LandingRitual onSync={() => setAppMode('warp')} />}
 *       {appMode === 'dashboard' && <Dashboard />}
 *     </>
 *   );
 * }
 * 
 * @example
 * // Animated mode transitions
 * function useWarpTransition() {
 *   const [mode, setMode] = useState<AppMode>('landing');
 *   
 *   const startWarp = useCallback(() => {
 *     setMode('warp');
 *     setTimeout(() => setMode('dashboard'), 2000); // 2s warp animation
 *   }, []);
 *   
 *   return { mode, startWarp };
 * }
 * 
 * @validation
 * - mode: Must be one of 'landing', 'warp', or 'dashboard'
 * 
 * @see {@link AppMode} for type definition
 */
export interface UniverseProps {
  /** Current application mode affecting the visual state */
  mode: 'landing' | 'warp' | 'dashboard';
}

/**
 * Props for the Landing Ritual component.
 * 
 * The initial screen that welcomes users and initiates the journey into
 * the BTS Neural Archive. Callback is triggered when user initiates sync.
 * 
 * @interface LandingRitualProps
 * 
 * @example
 * // Basic usage
 * <LandingRitual onSync={handleSync} />
 * 
 * @example
 * // Complete landing flow
 * function App() {
 *   const [mode, setMode] = useState<AppMode>('landing');
 *   
 *   const handleSync = useCallback(() => {
 *     setMode('warp');
 *     
 *     // Trigger warp animation
 *     setTimeout(() => {
 *       setMode('dashboard');
 *     }, 2000);
 *   }, []);
 *   
 *   return mode === 'landing' ? (
 *     <LandingRitual onSync={handleSync} />
 *   ) : (
 *     <Dashboard />
 *   );
 * }
 * 
 * @example
 * // With analytics
 * function handleSyncWithTracking() {
 *   analytics.track('sync_initiated');
 *   startWarpTransition();
 * }
 * 
 * <LandingRitual onSync={handleSyncWithTracking} />
 * 
 * @validation
 * - onSync: Must be a function
 */
export interface LandingRitualProps {
  /** Callback when user initiates sync/transition */
  onSync: () => void;
}

/**
 * Props for reusable Glass HUD panel component.
 * 
 * Creates consistent glass morphism panels throughout the dashboard.
 * Supports icons, custom styling, close handlers, and accent colors
 * for member-specific theming.
 * 
 * **Design Pattern:** Compound component for flexible content
 * 
 * @interface GlassHUDProps
 * 
 * @example
 * // Basic panel
 * <GlassHUD title="Sonic Lab">
 *   <p>Audio analysis content...</p>
 * </GlassHUD>
 * 
 * @example
 * // With icon and actions
 * import { Music, X } from 'lucide-react';
 * 
 * <GlassHUD
 *   title="Now Playing"
 *   icon={Music}
 *   onClose={handleClose}
 *   headerAction={
 *     <button onClick={togglePlay}>Play</button>
 *   }
 * >
 *   <SongInfo song={currentSong} />
 * </GlassHUD>
 * 
 * @example
 * // Member-themed panel
 * function MemberPanel({ member }: { member: Member }) {
 *   return (
 *     <GlassHUD
 *       title={`${member.name} DNA`}
 *       accentColor={member.color}
 *       className="member-panel"
 *     >
 *       <MemberProfile member={member} />
 *     </GlassHUD>
 *   );
 * }
 * 
 * @example
 * // Closeable modal
 * function Modal({ isOpen, onClose, children }) {
 *   if (!isOpen) return null;
 *   
 *   return (
 *     <div className="modal-overlay">
 *       <GlassHUD
 *         title="Details"
 *         onClose={onClose}
 *         className="modal-content"
 *       >
 *         {children}
 *       </GlassHUD>
 *     </div>
 *   );
 * }
 * 
 * @validation
 * - title: Must be non-empty string
 * - icon: Must be valid React component (from lucide-react)
 * - children: Any valid React nodes
 * - className: Valid CSS class string
 * - accentColor: Valid CSS color (hex, rgb, hsl)
 * 
 * @see {@link Member} for member color extraction
 */
export interface GlassHUDProps {
  /** Panel title */
  title: string;
  
  /** Optional icon component from lucide-react */
  icon?: React.ElementType;
  
  /** Panel content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Optional close handler (shows close button if provided) */
  onClose?: () => void;
  
  /** Optional header action button/element */
  headerAction?: React.ReactNode;
  
  /** Accent color for theming (hex format) */
  accentColor?: string;
}

/**
 * Props for Member DNA profile component.
 * 
 * Displays detailed member information in an interactive panel. Includes
 * biography, achievements, solo work, and visual theming based on member
 * signature color.
 * 
 * @interface MemberDNAProps
 * 
 * @example
 * // Basic usage
 * <MemberDNA memberId="rm" onClose={handleClose} />
 * 
 * @example
 * // Integrated with state
 * function Dashboard() {
 *   const [activeMember, setActiveMember] = useState<string | null>(null);
 *   
 *   return (
 *     <>
 *       <MemberConstellation 
 *         onMemberClick={(id) => setActiveMember(id)} 
 *       />
 *       
 *       {activeMember && (
 *         <MemberDNA
 *           memberId={activeMember}
 *           onClose={() => setActiveMember(null)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * 
 * @example
 * // With URL routing
 * function MemberRoute() {
 *   const { memberId } = useParams();
 *   const navigate = useNavigate();
 *   
 *   if (!memberId) return <Navigate to="/dashboard" />;
 *   
 *   return (
 *     <MemberDNA
 *       memberId={memberId}
 *       onClose={() => navigate('/dashboard')}
 *     />
 *   );
 * }
 * 
 * @validation
 * - memberId: Must be valid member ID from constants/members.ts
 * - Valid IDs: 'rm', 'jin', 'suga', 'jhope', 'jimin', 'v', 'jungkook'
 * 
 * @see {@link Member} for member data structure
 */
export interface MemberDNAProps {
  /** Member ID to display */
  memberId: string;
  
  /** Callback to close the profile */
  onClose: () => void;
}

/**
 * Props for Sonic Analyzer component.
 * 
 * Real-time audio visualization and analysis panel. Displays frequency
 * spectrum, waveforms, and audio metrics with interactive controls.
 * 
 * @interface SonicAnalyzerProps
 * 
 * @example
 * // Basic usage
 * <SonicAnalyzer
 *   playing={isPlaying}
 *   togglePlay={() => setIsPlaying(!isPlaying)}
 * />
 * 
 * @example
 * // With member theming
 * function ThemedSonicLab({ member }: { member: Member }) {
 *   const [playing, setPlaying] = useState(false);
 *   
 *   return (
 *     <SonicAnalyzer
 *       playing={playing}
 *       togglePlay={() => setPlaying(!playing)}
 *       accentColor={member.color}
 *     />
 *   );
 * }
 * 
 * @example
 * // With audio context
 * function AudioPlayer() {
 *   const [playing, setPlaying] = useState(false);
 *   const audioRef = useRef<HTMLAudioElement>(null);
 *   
 *   const togglePlay = useCallback(() => {
 *     if (audioRef.current) {
 *       if (playing) {
 *         audioRef.current.pause();
 *       } else {
 *         audioRef.current.play();
 *       }
 *       setPlaying(!playing);
 *     }
 *   }, [playing]);
 *   
 *   return (
 *     <>
 *       <audio ref={audioRef} src="/song.mp3" />
 *       <SonicAnalyzer playing={playing} togglePlay={togglePlay} />
 *     </>
 *   );
 * }
 * 
 * @validation
 * - playing: Boolean value
 * - togglePlay: Must be a function
 * - accentColor: Valid CSS color if provided
 */
export interface SonicAnalyzerProps {
  /** Whether audio is currently playing */
  playing: boolean;
  
  /** Toggle play/pause callback */
  togglePlay: () => void;
  
  /** Optional accent color for visualization */
  accentColor?: string;
}

/**
 * Props for RAG Network component.
 * 
 * Semantic search interface with graph visualization of related concepts.
 * Future implementation will include AI-powered search, embeddings, and
 * knowledge graph navigation.
 * 
 * @interface RAGNetworkProps
 * 
 * @example
 * // Basic usage
 * <RAGNetwork />
 * 
 * @example
 * // With theming
 * <RAGNetwork accentColor="#A855F7" />
 * 
 * @example
 * // Integrated search
 * function SearchDashboard() {
 *   const [query, setQuery] = useState('');
 *   const [results, setResults] = useState<SearchResult[]>([]);
 *   
 *   const handleSearch = async (searchQuery: string) => {
 *     const data = await searchRAG(searchQuery);
 *     setResults(data);
 *   };
 *   
 *   return (
 *     <RAGNetwork 
 *       accentColor="#A855F7"
 *       // Future props: onSearch, results, etc.
 *     />
 *   );
 * }
 * 
 * @validation
 * - accentColor: Valid CSS color if provided
 * 
 * @see {@link SearchResult} for search result structure
 */
export interface RAGNetworkProps {
  /** Optional accent color for UI elements */
  accentColor?: string;
}

/**
 * Props for Data Hub component.
 * 
 * Data export and statistics panel. Allows users to download song data,
 * view analytics, and explore dataset metadata.
 * 
 * @interface DataHubProps
 * 
 * @example
 * // Basic usage
 * <DataHub />
 * 
 * @example
 * // With theming
 * <DataHub accentColor="#D8B4FE" />
 * 
 * @example
 * // With export handlers
 * function DataExport() {
 *   const handleExport = (format: 'json' | 'csv') => {
 *     const data = getSongData();
 *     downloadFile(data, format);
 *   };
 *   
 *   return (
 *     <DataHub 
 *       accentColor="#C084FC"
 *       // Future props: onExport, format, etc.
 *     />
 *   );
 * }
 * 
 * @validation
 * - accentColor: Valid CSS color if provided
 */
export interface DataHubProps {
  /** Optional accent color for UI elements */
  accentColor?: string;
}

// ============================================================================
// SEARCH & RAG TYPES
// ============================================================================

/**
 * Search result from RAG (Retrieval-Augmented Generation) network.
 * 
 * Represents a single result from semantic search. Includes relevance score,
 * context snippet, and optional metadata for rich result display.
 * 
 * **Future Implementation:** Will be powered by OpenAI embeddings and
 * vector similarity search for intelligent, context-aware results.
 * 
 * @interface SearchResult
 * 
 * @example
 * // Search result object
 * const result: SearchResult = {
 *   id: 42,
 *   title: 'Spring Day',
 *   score: 95.5,
 *   context: '...metaphor for longing and hope...',
 *   metadata: {
 *     album: 'You Never Walk Alone',
 *     year: 2017,
 *     tags: ['melancholic', 'hopeful', 'winter'],
 *   },
 * };
 * 
 * @example
 * // Search results list
 * function SearchResults({ results }: { results: SearchResult[] }) {
 *   return (
 *     <div className="search-results">
 *       {results.map(result => (
 *         <div key={result.id} className="result-card">
 *           <h3>{result.title}</h3>
 *           <div className="score">
 *             Relevance: {result.score.toFixed(1)}%
 *           </div>
 *           <p className="context">{result.context}</p>
 *           {result.metadata && (
 *             <div className="metadata">
 *               {Object.entries(result.metadata).map(([key, value]) => (
 *                 <span key={key}>{key}: {String(value)}</span>
 *               ))}
 *             </div>
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Filter high-confidence results
 * const confident = results.filter(r => r.score > 80);
 * 
 * @example
 * // Group by score ranges
 * const grouped = {
 *   high: results.filter(r => r.score >= 80),
 *   medium: results.filter(r => r.score >= 50 && r.score < 80),
 *   low: results.filter(r => r.score < 50),
 * };
 * 
 * @validation
 * - id: Must be unique positive integer
 * - title: Must be non-empty string
 * - score: Must be 0-100 (percentage relevance)
 * - context: Must be non-empty string
 * - metadata: Object with string keys and any values
 * 
 * @future
 * - Embedding vectors for similarity
 * - Relationship graph data
 * - Source attribution
 * - Confidence intervals
 */
export interface SearchResult {
  /** Result identifier */
  id: number;
  
  /** Title of matched item */
  title: string;
  
  /** Match score (0-100 percentage) */
  score: number;
  
  /** Context snippet or description */
  context: string;
  
  /** Optional metadata (album, year, tags, etc.) */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ANIMATION & VISUAL TYPES
// ============================================================================

/**
 * 3D position in Cartesian coordinate space.
 * 
 * Represents a point in 3D space using Cartesian coordinates. Used after
 * converting spherical coordinates for rendering stars, particles, and
 * other 3D elements with perspective projection.
 * 
 * @interface Position3D
 * 
 * @example
 * // Star position
 * const position: Position3D = { x: 150, y: -200, z: 500 };
 * 
 * @example
 * // Convert spherical to Cartesian
 * import { sphericalToCartesian } from './utils/animations';
 * 
 * const star = { theta: Math.PI / 4, phi: Math.PI / 3, r: 500 };
 * const position: Position3D = sphericalToCartesian(star.theta, star.phi, star.r);
 * 
 * @example
 * // Apply perspective projection
 * function projectTo2D(pos: Position3D, focalLength: number = 500) {
 *   const scale = focalLength / (focalLength + pos.z);
 *   
 *   return {
 *     x: pos.x * scale,
 *     y: pos.y * scale,
 *     scale,
 *   };
 * }
 * 
 * @example
 * // Calculate distance from origin
 * function distanceFromOrigin(pos: Position3D): number {
 *   return Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
 * }
 * 
 * @validation
 * - x, y, z: Can be any number (positive, negative, or zero)
 * - Typically measured in pixels for rendering
 * 
 * @see {@link Star} for spherical coordinate representation
 * @see {@link sphericalToCartesian} in utils/animations.ts
 */
export interface Position3D {
  /** X coordinate (left-right) */
  x: number;
  
  /** Y coordinate (up-down) */
  y: number;
  
  /** Z coordinate (near-far, depth) */
  z: number;
}

/**
 * Star object for the universe background.
 * 
 * Represents a star in spherical coordinates with visual properties.
 * Spherical coordinates ensure uniform distribution across the cosmic sphere.
 * 
 * **Coordinate System:**
 * - theta (θ): Azimuthal angle, 0 to 2π (rotation around Z-axis)
 * - phi (φ): Polar angle, 0 to π (angle from Z-axis)
 * - r: Radius, distance from origin (depth)
 * 
 * @interface Star
 * 
 * @example
 * // Create a star
 * const star: Star = {
 *   theta: Math.PI / 4,      // 45 degrees
 *   phi: Math.PI / 3,        // 60 degrees
 *   r: 800,                  // 800px from center
 *   size: 2.0,               // 2px diameter
 *   color: '#A855F7',        // Purple
 *   delay: 2.5,              // 2.5s animation delay
 * };
 * 
 * @example
 * // Render star field
 * function StarField({ stars }: { stars: Star[] }) {
 *   return stars.map((star, i) => {
 *     const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
 *     const perspective = 500;
 *     const scale = perspective / (perspective + z);
 *     
 *     return (
 *       <div
 *         key={i}
 *         className="star"
 *         style={{
 *           left: `${50 + x * scale / 10}%`,
 *           top: `${50 + y * scale / 10}%`,
 *           width: `${star.size * scale}px`,
 *           height: `${star.size * scale}px`,
 *           backgroundColor: star.color,
 *           opacity: scale * 0.8,
 *           animationDelay: `${star.delay}s`,
 *         }}
 *       />
 *     );
 *   });
 * }
 * 
 * @example
 * // Generate star field
 * import { generateStars } from './utils/animations';
 * 
 * const colors = ['#ffffff', '#A855F7', '#D8B4FE', '#C084FC'];
 * const stars: Star[] = generateStars(800, colors);
 * 
 * @validation
 * - theta: 0 to 2π radians (0 to 360 degrees)
 * - phi: 0 to π radians (0 to 180 degrees)
 * - r: Positive number, typically 300-1300 pixels
 * - size: Positive number, typically 0.5-3 pixels
 * - color: Valid hex color string
 * - delay: Non-negative number in seconds
 * 
 * @see {@link Position3D} for Cartesian representation
 * @see {@link generateStars} in utils/animations.ts
 */
export interface Star {
  /** Spherical coordinate: azimuthal angle (0 to 2π) */
  theta: number;
  
  /** Spherical coordinate: polar angle (0 to π) */
  phi: number;
  
  /** Radius from center (distance/depth) */
  r: number;
  
  /** Star size in pixels */
  size: number;
  
  /** Star color (hex format) */
  color: string;
  
  /** Animation delay in seconds */
  delay: number;
}

/**
 * Bokeh bubble/particle for the purple ocean effect.
 * 
 * Represents a soft, out-of-focus light orb that creates the photographic
 * bokeh effect. Used for the signature BTS "Borahae" purple atmosphere.
 * 
 * @interface BokehBubble
 * 
 * @example
 * // Create bokeh bubble
 * const bubble: BokehBubble = {
 *   left: '25%',
 *   top: '60%',
 *   size: 180,        // 180px diameter
 *   delay: 3.5,       // 3.5s delay
 *   duration: 35,     // 35s animation cycle
 * };
 * 
 * @example
 * // Render bokeh layer
 * function BokehLayer({ bubbles }: { bubbles: BokehBubble[] }) {
 *   return bubbles.map((bubble, i) => (
 *     <div
 *       key={i}
 *       className="bokeh-bubble"
 *       style={{
 *         position: 'absolute',
 *         left: bubble.left,
 *         top: bubble.top,
 *         width: `${bubble.size}px`,
 *         height: `${bubble.size}px`,
 *         background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
 *         filter: 'blur(60px)',
 *         animationDelay: `${bubble.delay}s`,
 *         animationDuration: `${bubble.duration}s`,
 *         animation: 'bokeh-float infinite ease-in-out',
 *       }}
 *     />
 *   ));
 * }
 * 
 * @example
 * // Generate bokeh bubbles
 * import { generateBokehLights } from './utils/animations';
 * 
 * const bubbles: BokehBubble[] = generateBokehLights(12);
 * 
 * @validation
 * - left, top: Percentage strings (e.g., "25%")
 * - size: Positive number, typically 100-300 pixels
 * - delay: Non-negative number in seconds
 * - duration: Positive number in seconds, typically 20-40
 * 
 * @see {@link generateBokehLights} in utils/animations.ts
 */
export interface BokehBubble {
  /** Left position (percentage) */
  left: string;
  
  /** Top position (percentage) */
  top: string;
  
  /** Size in pixels */
  size: number;
  
  /** Animation delay in seconds */
  delay: number;
  
  /** Animation duration in seconds */
  duration: number;
}

/**
 * Floating particle for ambient cosmic effects.
 * 
 * Small particles that float across the screen, creating depth and movement
 * in the cosmic environment. Used for the "cosmic dust" effect.
 * 
 * @interface FloatingParticle
 * 
 * @example
 * // Create particle
 * const particle: FloatingParticle = {
 *   left: '42%',
 *   top: '18%',
 *   delay: 1.2,
 *   duration: 15,
 *   size: 2.5,
 * };
 * 
 * @example
 * // Render particle system
 * function ParticleSystem({ particles }: { particles: FloatingParticle[] }) {
 *   return particles.map((p, i) => (
 *     <div
 *       key={i}
 *       className="floating-particle"
 *       style={{
 *         position: 'absolute',
 *         left: p.left,
 *         top: p.top,
 *         width: `${p.size}px`,
 *         height: `${p.size}px`,
 *         backgroundColor: 'rgba(255, 255, 255, 0.6)',
 *         borderRadius: '50%',
 *         animationDelay: `${p.delay}s`,
 *         animationDuration: `${p.duration}s`,
 *         animation: 'float infinite linear',
 *       }}
 *     />
 *   ));
 * }
 * 
 * @example
 * // Generate particles
 * import { generateParticles } from './utils/animations';
 * 
 * const particles: FloatingParticle[] = generateParticles(30);
 * 
 * @validation
 * - left, top: Percentage strings (e.g., "42%")
 * - delay: Non-negative number in seconds
 * - duration: Positive number, typically 10-20 seconds
 * - size: Positive number, typically 1-4 pixels
 * 
 * @see {@link generateParticles} in utils/animations.ts
 */
export interface FloatingParticle {
  /** Left position (percentage) */
  left: string;
  
  /** Top position (percentage) */
  top: string;
  
  /** Animation delay in seconds */
  delay: number;
  
  /** Animation duration in seconds */
  duration: number;
  
  /** Particle size in pixels */
  size: number;
}

// ============================================================================
// APPLICATION STATE TYPES
// ============================================================================

/**
 * Main application mode.
 * 
 * Represents the three primary states of the BTS Neural Archive application.
 * Controls which view is displayed and how the 3D universe behaves.
 * 
 * **Mode Flow:**
 * ```
 * landing → warp → dashboard
 *    ↓       ↓        ↓
 * Welcome  Transition  Main App
 * ```
 * 
 * @type AppMode
 * 
 * @example
 * // State management
 * const [mode, setMode] = useState<AppMode>('landing');
 * 
 * @example
 * // Mode-based rendering
 * function App() {
 *   const [mode, setMode] = useState<AppMode>('landing');
 *   
 *   return (
 *     <>
 *       <Universe3D mode={mode} />
 *       {mode === 'landing' && <LandingRitual onSync={() => setMode('warp')} />}
 *       {mode === 'warp' && <WarpAnimation onComplete={() => setMode('dashboard')} />}
 *       {mode === 'dashboard' && <Dashboard />}
 *     </>
 *   );
 * }
 * 
 * @validation
 * - Must be one of: 'landing', 'warp', or 'dashboard'
 */
export type AppMode = 'landing' | 'warp' | 'dashboard';

/**
 * Dashboard section identifiers.
 * 
 * Identifies which section of the dashboard is currently active. Controls
 * which panel is displayed and highlighted in the navigation.
 * 
 * **Sections:**
 * - overview: Member constellation and statistics
 * - sonic: Audio analysis and visualization
 * - rag: Semantic search and knowledge graph
 * - data: Data export and statistics
 * 
 * @type DashboardSection
 * 
 * @example
 * // Section state
 * const [section, setSection] = useState<DashboardSection>('overview');
 * 
 * @example
 * // Section navigation
 * function DashboardNav({ active, onChange }: {
 *   active: DashboardSection;
 *   onChange: (section: DashboardSection) => void;
 * }) {
 *   const sections: DashboardSection[] = ['overview', 'sonic', 'rag', 'data'];
 *   
 *   return (
 *     <nav>
 *       {sections.map(section => (
 *         <button
 *           key={section}
 *           className={active === section ? 'active' : ''}
 *           onClick={() => onChange(section)}
 *         >
 *           {section.toUpperCase()}
 *         </button>
 *       ))}
 *     </nav>
 *   );
 * }
 * 
 * @example
 * // Section-based rendering
 * function Dashboard({ section }: { section: DashboardSection }) {
 *   return (
 *     <>
 *       {section === 'overview' && <MemberConstellation />}
 *       {section === 'sonic' && <SonicAnalyzer />}
 *       {section === 'rag' && <RAGNetwork />}
 *       {section === 'data' && <DataHub />}
 *     </>
 *   );
 * }
 * 
 * @validation
 * - Must be one of: 'overview', 'sonic', 'rag', or 'data'
 */
export type DashboardSection = 'overview' | 'discography' | 'members' | 'analytics' | 'search';

/**
 * Application state container.
 * 
 * Centralized state for the entire BTS Neural Archive application. Can be
 * used with Context API, Zustand, or other state management solutions.
 * 
 * @interface AppState
 * 
 * @example
 * // Initial state
 * const initialState: AppState = {
 *   mode: 'landing',
 *   activeSection: 'overview',
 *   activeMemberId: null,
 *   playing: false,
 *   showSettings: false,
 * };
 * 
 * @example
 * // React Context
 * const AppContext = createContext<{
 *   state: AppState;
 *   setState: Dispatch<SetStateAction<AppState>>;
 * } | null>(null);
 * 
 * function AppProvider({ children }) {
 *   const [state, setState] = useState<AppState>(initialState);
 *   
 *   return (
 *     <AppContext.Provider value={{ state, setState }}>
 *       {children}
 *     </AppContext.Provider>
 *   );
 * }
 * 
 * @example
 * // Zustand store
 * import { create } from 'zustand';
 * 
 * const useAppStore = create<AppState & {
 *   setMode: (mode: AppMode) => void;
 *   setSection: (section: DashboardSection) => void;
 *   setActiveMember: (id: string | null) => void;
 *   togglePlaying: () => void;
 *   toggleSettings: () => void;
 * }>((set) => ({
 *   mode: 'landing',
 *   activeSection: 'overview',
 *   activeMemberId: null,
 *   playing: false,
 *   showSettings: false,
 *   
 *   setMode: (mode) => set({ mode }),
 *   setSection: (activeSection) => set({ activeSection }),
 *   setActiveMember: (activeMemberId) => set({ activeMemberId }),
 *   togglePlaying: () => set((state) => ({ playing: !state.playing })),
 *   toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
 * }));
 * 
 * @example
 * // Usage with actions
 * function App() {
 *   const { mode, setMode, activeSection, setSection } = useAppStore();
 *   
 *   return (
 *     <>
 *       <Universe3D mode={mode} />
 *       {mode === 'dashboard' && (
 *         <Dashboard 
 *           section={activeSection}
 *           onSectionChange={setSection}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * 
 * @validation
 * - mode: Valid AppMode
 * - activeSection: Valid DashboardSection
 * - activeMemberId: Valid member ID string or null
 * - playing: Boolean
 * - showSettings: Boolean
 * 
 * @see {@link AppMode} for mode values
 * @see {@link DashboardSection} for section values
 */
export interface AppState {
  /** Current application mode */
  mode: AppMode;
  
  /** Active dashboard section */
  activeSection: DashboardSection;
  
  /** Currently selected member ID (null if none) */
  activeMemberId: string | null;
  
  /** Audio playback state */
  playing: boolean;
  
  /** Settings panel visibility */
  showSettings: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * CSS color value in any valid format.
 * 
 * Represents any valid CSS color: hex, rgb, rgba, hsl, hsla, or named colors.
 * Used throughout the application for theming and styling.
 * 
 * @type CSSColor
 * 
 * @example
 * // Valid CSS colors
 * const purple: CSSColor = '#A855F7';
 * const transparent: CSSColor = 'rgba(168, 85, 247, 0.5)';
 * const hsl: CSSColor = 'hsl(271, 91%, 65%)';
 * const named: CSSColor = 'purple';
 * 
 * @example
 * // Function accepting CSS color
 * function setAccentColor(color: CSSColor) {
 *   document.documentElement.style.setProperty('--accent', color);
 * }
 * 
 * setAccentColor('#A855F7');
 * setAccentColor('rgba(168, 85, 247, 0.8)');
 */
export type CSSColor = string;

/**
 * Class name string or conditional class names.
 * 
 * Represents CSS class names. Can be a string or undefined for conditional
 * classes. Use with className prop or class name libraries like clsx.
 * 
 * @type ClassName
 * 
 * @example
 * // Component with optional className
 * function Card({ className }: { className?: ClassName }) {
 *   return <div className={className}>Content</div>;
 * }
 * 
 * @example
 * // Conditional classes
 * const className: ClassName = isActive ? 'active' : undefined;
 * 
 * @example
 * // With clsx library
 * import clsx from 'clsx';
 * 
 * const className = clsx(
 *   'base-class',
 *   isActive && 'active',
 *   isDisabled && 'disabled'
 * );
 */
export type ClassName = string | undefined;

/**
 * Generic callback function with no parameters or return value.
 * 
 * Simple function type for callbacks like onClick, onClose, onComplete, etc.
 * 
 * @type Callback
 * 
 * @example
 * // Button with callback
 * function Button({ onClick, label }: { 
 *   onClick: Callback; 
 *   label: string;
 * }) {
 *   return <button onClick={onClick}>{label}</button>;
 * }
 * 
 * @example
 * // Modal with close callback
 * function Modal({ onClose }: { onClose: Callback }) {
 *   return (
 *     <div className="modal">
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 */
export type Callback = () => void;

/**
 * Event handler for React synthetic events.
 * 
 * Type-safe event handler for React events. Generic type parameter specifies
 * the target element type for better type inference.
 * 
 * @type EventHandler
 * 
 * @example
 * // Button click handler
 * const handleClick: EventHandler<HTMLButtonElement> = (e) => {
 *   console.log('Button clicked:', e.currentTarget.textContent);
 * };
 * 
 * <button onClick={handleClick}>Click me</button>
 * 
 * @example
 * // Input change handler
 * const handleChange: EventHandler<HTMLInputElement> = (e) => {
 *   console.log('Input value:', e.currentTarget.value);
 * };
 * 
 * <input onChange={handleChange} />
 * 
 * @example
 * // Form submit handler
 * const handleSubmit: EventHandler<HTMLFormElement> = (e) => {
 *   e.preventDefault();
 *   const formData = new FormData(e.currentTarget);
 *   console.log('Form data:', Object.fromEntries(formData));
 * };
 * 
 * <form onSubmit={handleSubmit}>...</form>
 */
export type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void;
