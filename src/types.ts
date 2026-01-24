/**
 * Type definitions for BTS Neural Archive
 * 
 * This file centralizes all TypeScript interfaces and types used throughout
 * the application for better maintainability and code organization.
 */

// ============================================================================
// MEMBER TYPES
// ============================================================================

/**
 * Represents a BTS member with their profile information
 */
export interface Member {
  /** Unique identifier (e.g., 'rm', 'jin', 'suga') */
  id: string;
  
  /** Stage name (e.g., 'RM', 'JIN') */
  name: string;
  
  /** Full legal name */
  full: string;
  
  /** Signature color in hex format */
  color: string;
  
  /** Role in the group */
  role: string;
  
  /** Microphone color used in performances */
  mic: string;
  
  /** Number of KOMCA (Korea Music Copyright Association) credits */
  komca: number;
  
  /** Biography/description */
  bio: string;
  
  /** List of solo tracks */
  soloTracks: string[];
  
  /** List of achievements and milestones */
  achievements: string[];
}

// ============================================================================
// SONG & MUSIC TYPES
// ============================================================================

/**
 * Represents a song in the BTS discography
 */
export interface Song {
  /** Unique song identifier */
  id: number;
  
  /** Song title */
  title: string;
  
  /** Album name */
  album: string;
  
  /** Beats per minute */
  bpm: number;
  
  /** Energy level (0-1) */
  energy: number;
  
  /** Valence/positivity level (0-1) */
  valence: number;
  
  /** Emotional sentiment classification */
  sentiment: string;
}

/**
 * Audio analysis metrics
 */
export interface AudioMetrics {
  /** Energy level (0-1) */
  energy: number;
  
  /** Valence/happiness level (0-1) */
  valence: number;
  
  /** Beats per minute */
  bpm: number;
  
  /** Danceability score (0-1) */
  danceability?: number;
  
  /** Acousticness level (0-1) */
  acousticness?: number;
  
  /** Instrumentalness (0-1) */
  instrumentalness?: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for the Universe3D background component
 */
export interface UniverseProps {
  /** Current application mode affecting the visual state */
  mode: 'landing' | 'warp' | 'dashboard';
}

/**
 * Props for the Landing Ritual component
 */
export interface LandingRitualProps {
  /** Callback when user initiates sync/transition */
  onSync: () => void;
}

/**
 * Props for reusable Glass HUD panel component
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
  
  /** Optional close handler */
  onClose?: () => void;
  
  /** Optional header action button/element */
  headerAction?: React.ReactNode;
  
  /** Accent color for theming (hex format) */
  accentColor?: string;
}

/**
 * Props for Member DNA profile component
 */
export interface MemberDNAProps {
  /** Member ID to display */
  memberId: string;
  
  /** Callback to close the profile */
  onClose: () => void;
}

/**
 * Props for Sonic Analyzer component
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
 * Props for RAG Network component
 */
export interface RAGNetworkProps {
  /** Optional accent color for UI elements */
  accentColor?: string;
}

/**
 * Props for Data Hub component
 */
export interface DataHubProps {
  /** Optional accent color for UI elements */
  accentColor?: string;
}

// ============================================================================
// SEARCH & RAG TYPES
// ============================================================================

/**
 * Search result from RAG network
 */
export interface SearchResult {
  /** Result identifier */
  id: number;
  
  /** Title of matched item */
  title: string;
  
  /** Match score (0-100) */
  score: number;
  
  /** Context snippet or description */
  context: string;
  
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ANIMATION & VISUAL TYPES
// ============================================================================

/**
 * 3D position in space
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Star object for the universe background
 */
export interface Star {
  /** Spherical coordinate: theta */
  theta: number;
  
  /** Spherical coordinate: phi */
  phi: number;
  
  /** Radius from center */
  r: number;
  
  /** Star size in pixels */
  size: number;
  
  /** Star color (hex) */
  color: string;
  
  /** Animation delay in seconds */
  delay: number;
}

/**
 * Bokeh bubble/particle
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
 * Floating particle for ambient effects
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
 * Main application mode
 */
export type AppMode = 'landing' | 'warp' | 'dashboard';

/**
 * Dashboard section identifiers
 */
export type DashboardSection = 'overview' | 'sonic' | 'rag' | 'data';

/**
 * Application state
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
 * CSS color value (hex, rgb, rgba, etc.)
 */
export type CSSColor = string;

/**
 * Class name string or conditional class names
 */
export type ClassName = string | undefined;

/**
 * Generic callback function
 */
export type Callback = () => void;

/**
 * Event handler for React events
 */
export type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void;
