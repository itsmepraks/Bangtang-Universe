/**
 * BTS Neural Archive - Type Definitions
 * Centralized type definitions for type safety and code maintainability
 */

// ==================== MEMBER TYPES ====================

export interface Member {
  id: string;
  name: string;
  full: string;
  color: string;
  role: string;
  mic: string;
  komca: number;
  bio: string;
  soloTracks: string[];
  achievements: string[];
}

export type MemberId = 'rm' | 'jin' | 'suga' | 'jh' | 'jm' | 'v' | 'jk';

// ==================== MUSIC TYPES ====================

export interface Song {
  id: number;
  title: string;
  album: string;
  bpm: number;
  energy: number;
  valence: number;
  sentiment: SongSentiment;
}

export type SongSentiment = 
  | 'Gratitude'
  | 'Determination'
  | 'Fear'
  | 'Longing'
  | 'Joy'
  | 'Pain'
  | 'Comfort'
  | 'Destiny'
  | 'Celebration'
  | 'Confidence';

// ==================== UI TYPES ====================

export type AppMode = 'landing' | 'warp' | 'dashboard';

export type DashboardSection = 'overview' | 'rag' | 'sonic' | 'data';

export interface NavigationItem {
  id: DashboardSection;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

// ==================== COMPONENT PROP TYPES ====================

export interface UniverseProps {
  mode: AppMode;
}

export interface LandingRitualProps {
  onSync: () => void;
}

export interface GlassHUDProps {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  headerAction?: React.ReactNode;
  accentColor?: string;
}

export interface SonicAnalyzerProps {
  playing: boolean;
  togglePlay: () => void;
  accentColor?: string;
}

export interface RAGNetworkProps {
  accentColor?: string;
}

export interface DataHubProps {
  accentColor?: string;
}

export interface MemberDNAProps {
  memberId: string;
  onClose: () => void;
}

export interface SettingsOverlayProps {
  onClose: () => void;
}

// ==================== SEARCH TYPES ====================

export interface SearchResult {
  id: number;
  title: string;
  score: number;
  context: string;
}

// ==================== ANIMATION TYPES ====================

export interface ParticleProps {
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
}

export interface BokehProps {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}

export interface StarProps {
  theta: number;
  phi: number;
  r: number;
  size: number;
  color: string;
  delay: number;
}

// ==================== SETTINGS TYPES ====================

export interface AudioSettings {
  volume: number;
  quality: 'low' | 'medium' | 'high';
  spatialAudio: boolean;
}

export interface GraphicsSettings {
  particleDensity: 'low' | 'medium' | 'high';
  animationSpeed: number;
  reducedMotion: boolean;
  performanceMode: boolean;
}

export interface AppSettings {
  audio: AudioSettings;
  graphics: GraphicsSettings;
}

// ==================== UTILITY TYPES ====================

/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * CSS custom properties type for styled components
 */
export type CSSCustomProperties = {
  [key: `--${string}`]: string | number;
} & React.CSSProperties;

// ==================== CONSTANTS ====================

export const MEMBER_IDS: ReadonlyArray<MemberId> = [
  'rm',
  'jin',
  'suga',
  'jh',
  'jm',
  'v',
  'jk',
] as const;

export const BORAHAE_COLORS = {
  primary: '#A855F7',
  light: '#D8B4FE',
  indigo: '#818CF8',
  violet: '#C084FC',
  dark: '#581c87',
  background: '#020005',
} as const;

export const DASHBOARD_SECTIONS: ReadonlyArray<DashboardSection> = [
  'overview',
  'sonic',
  'rag',
  'data',
] as const;
