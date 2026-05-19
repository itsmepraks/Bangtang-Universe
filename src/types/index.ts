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

export type AppMode = 'landing' | 'warp' | 'dashboard';

export type DashboardSection = 'overview' | 'discography' | 'members' | 'analytics' | 'awards' | 'tours' | 'media' | 'search';

export interface DiscographyState {
  selectedAlbumId: number | null;
  selectedSongId: number | null;
  view: 'grid' | 'album' | 'song';
}

export interface Star {
  // Spherical coordinates: theta (azimuth), phi (polar), r (radial distance).
  theta: number;
  phi: number;
  r: number;
  size: number;
  color: string;
  delay: number;
}

export interface BokehBubble {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}

export interface FloatingParticle {
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
}

export interface AudioMetrics {
  energy: number;
  valence: number;
  bpm: number;
  dance: number;
}

export interface LyricGeneratorState {
  text: string;
  generating: boolean;
}

export interface AppSettings {
  audio: {
    volume: number;
    effectsEnabled: boolean;
  };
  graphics: {
    particleCount: number;
    quality: 'low' | 'medium' | 'high';
    reducedMotion: boolean;
  };
  theme: {
    accentColor: string;
    backgroundOpacity: number;
  };
}

export interface CSSProperties extends React.CSSProperties {
  '--accent-color'?: string;
  '--member-color'?: string;
  [key: string]: string | number | undefined;
}

export interface Position3D {
  x: number;
  y: number;
  z?: number;
}

export interface AnimationTiming {
  duration: number;
  delay?: number;
  easing?: string;
}

export interface ColorPalette {
  primary: string;
  background: string;
  borahae: string[];
  members: Record<MemberId, string>;
}

export const isMemberId = (value: unknown): value is MemberId => {
  return typeof value === 'string' && ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'].includes(value);
};

export const isAppMode = (value: unknown): value is AppMode => {
  return typeof value === 'string' && ['landing', 'warp', 'dashboard'].includes(value);
};

export const isDashboardSection = (value: unknown): value is DashboardSection => {
  return typeof value === 'string' && ['overview', 'discography', 'members', 'analytics', 'awards', 'tours', 'media', 'search'].includes(value);
};
