/**
 * BTS Neural Archive - Type Definitions
 * 
 * Centralized TypeScript type definitions for the entire application.
 * This improves code organization, type safety, and maintainability.
 */

// ==================== MEMBER TYPES ====================

/**
 * Represents a BTS member with complete profile information
 */
export interface Member {
  /** Unique identifier (lowercase) */
  id: string;
  /** Stage name (uppercase) */
  name: string;
  /** Full legal name */
  full: string;
  /** Signature color (hex code) */
  color: string;
  /** Role/position in the group */
  role: string;
  /** Microphone color */
  mic: string;
  /** Number of KOMCA (Korea Music Copyright Association) credits */
  komca: number;
  /** Biography/description */
  bio: string;
  /** Array of solo track titles */
  soloTracks: string[];
  /** Array of achievement descriptions */
  achievements: string[];
}

/**
 * Valid member IDs
 */
export type MemberId = 'rm' | 'jin' | 'suga' | 'jh' | 'jm' | 'v' | 'jk';

// ==================== SONG/MUSIC TYPES ====================

/**
 * Represents a song in the database with metadata
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
  /** Valence/positivity (0-1) */
  valence: number;
  /** Emotional sentiment category */
  sentiment: SongSentiment;
}

/**
 * Valid sentiment categories for songs
 */
export type SongSentiment = 
  | 'Joy' 
  | 'Gratitude' 
  | 'Determination' 
  | 'Fear' 
  | 'Longing' 
  | 'Pain' 
  | 'Comfort' 
  | 'Destiny' 
  | 'Celebration' 
  | 'Confidence';

// ==================== UI COMPONENT TYPES ====================

/**
 * Application mode states
 */
export type AppMode = 'landing' | 'warp' | 'dashboard';

/**
 * Dashboard section identifiers
 */
export type DashboardSection = 'overview' | 'sonic' | 'rag' | 'data';

/**
 * Props for Glass HUD component
 */
export interface GlassHUDProps {
  /** Panel title */
  title: string;
  /** Optional icon component */
  icon?: React.ElementType;
  /** Panel content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Close handler function */
  onClose?: () => void;
  /** Additional header actions */
  headerAction?: React.ReactNode;
  /** Accent color (hex code) */
  accentColor?: string;
}

// ==================== ANIMATION TYPES ====================

/**
 * Star configuration for 3D universe
 */
export interface Star {
  /** Spherical coordinate: azimuthal angle */
  theta: number;
  /** Spherical coordinate: polar angle */
  phi: number;
  /** Radial distance from center */
  r: number;
  /** Star size in pixels */
  size: number;
  /** Star color (hex) */
  color: string;
  /** Animation delay in seconds */
  delay: number;
}

/**
 * Bokeh bubble configuration
 */
export interface BokehBubble {
  /** Horizontal position (percentage) */
  left: string;
  /** Vertical position (percentage) */
  top: string;
  /** Bubble size in pixels */
  size: number;
  /** Animation delay in seconds */
  delay: number;
  /** Animation duration in seconds */
  duration: number;
}

/**
 * Floating particle configuration
 */
export interface FloatingParticle {
  /** Horizontal position (percentage) */
  left: string;
  /** Vertical position (percentage) */
  top: string;
  /** Animation delay in seconds */
  delay: number;
  /** Animation duration in seconds */
  duration: number;
  /** Particle size in pixels */
  size: number;
}

// ==================== SEARCH/RAG TYPES ====================

/**
 * Search result from RAG network
 */
export interface SearchResult {
  /** Result identifier */
  id: number;
  /** Song or content title */
  title: string;
  /** Match score (0-100) */
  score: number;
  /** Context or explanation of match */
  context: string;
}

/**
 * Search state
 */
export interface SearchState {
  /** Current search query */
  query: string;
  /** Array of search results */
  results: SearchResult[];
  /** Loading/searching state */
  searching: boolean;
}

// ==================== SONIC LAB TYPES ====================

/**
 * Audio metrics for songs
 */
export interface AudioMetrics {
  /** Energy level (0-1) */
  energy: number;
  /** Valence/positivity (0-1) */
  valence: number;
  /** Beats per minute */
  bpm: number;
  /** Danceability score (0-1) */
  dance: number;
}

/**
 * Props for Sonic Analyzer component
 */
export interface SonicAnalyzerProps {
  /** Whether audio is currently playing */
  playing: boolean;
  /** Function to toggle play state */
  togglePlay: () => void;
  /** Accent color for visualizations */
  accentColor?: string;
}

// ==================== LYRICIST AI TYPES ====================

/**
 * State for lyric generation
 */
export interface LyricGeneratorState {
  /** Generated text */
  text: string;
  /** Whether generation is in progress */
  generating: boolean;
}

// ==================== SETTINGS TYPES ====================

/**
 * Application settings/preferences
 */
export interface AppSettings {
  /** Audio settings */
  audio: {
    /** Master volume (0-1) */
    volume: number;
    /** Audio effects enabled */
    effectsEnabled: boolean;
  };
  /** Graphics settings */
  graphics: {
    /** Particle count */
    particleCount: number;
    /** Animation quality level */
    quality: 'low' | 'medium' | 'high';
    /** Reduced motion mode */
    reducedMotion: boolean;
  };
  /** Theme settings */
  theme: {
    /** Primary accent color */
    accentColor: string;
    /** Background opacity */
    backgroundOpacity: number;
  };
}

// ==================== UTILITY TYPES ====================

/**
 * CSS custom properties interface
 */
export interface CSSProperties extends React.CSSProperties {
  '--accent-color'?: string;
  '--member-color'?: string;
  [key: string]: any;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
  z?: number;
}

/**
 * Animation timing
 */
export interface AnimationTiming {
  /** Duration in milliseconds */
  duration: number;
  /** Delay in milliseconds */
  delay?: number;
  /** Easing function */
  easing?: string;
}

// ==================== COMPONENT PROP TYPES ====================

/**
 * Props for Universe3D component
 */
export interface UniverseProps {
  /** Current application mode */
  mode: AppMode;
}

/**
 * Props for Landing Ritual component
 */
export interface LandingRitualProps {
  /** Callback when sync is triggered */
  onSync: () => void;
}

/**
 * Props for Member DNA component
 */
export interface MemberDNAProps {
  /** ID of the member to display */
  memberId: string;
  /** Close handler function */
  onClose: () => void;
}

/**
 * Props for RAG Network component
 */
export interface RAGNetworkProps {
  /** Accent color for UI elements */
  accentColor?: string;
}

/**
 * Props for Data Hub component
 */
export interface DataHubProps {
  /** Accent color for UI elements */
  accentColor?: string;
}

// ==================== CONSTANTS TYPE ====================

/**
 * Color palette constants
 */
export interface ColorPalette {
  /** Primary purple */
  primary: string;
  /** Deep space background */
  background: string;
  /** Borahae variations */
  borahae: string[];
  /** Member colors mapped by ID */
  members: Record<MemberId, string>;
}

// ==================== EXPORT HELPERS ====================

/**
 * Type guard to check if a value is a valid MemberId
 */
export const isMemberId = (value: any): value is MemberId => {
  return ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'].includes(value);
};

/**
 * Type guard to check if a value is a valid AppMode
 */
export const isAppMode = (value: any): value is AppMode => {
  return ['landing', 'warp', 'dashboard'].includes(value);
};

/**
 * Type guard to check if a value is a valid DashboardSection
 */
export const isDashboardSection = (value: any): value is DashboardSection => {
  return ['overview', 'sonic', 'rag', 'data'].includes(value);
};
