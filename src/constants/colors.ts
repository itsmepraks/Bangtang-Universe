/**
 * BTS Neural Archive - Color Constants
 * 
 * Centralized color definitions following the "Borahae" (보라해) aesthetic.
 * Borahae means "I Purple You" - a phrase coined by V representing love and trust.
 */

/**
 * Primary purple color palette inspired by BTS's signature "Borahae" purple
 */
export const BORAHAE_COLORS = {
  /** Primary purple - Main accent color */
  PRIMARY: '#A855F7',

  /** Light purple - Soft highlights */
  LIGHT: '#D8B4FE',

  /** Indigo purple - Cool tones */
  INDIGO: '#818CF8',

  /** Violet purple - Warm tones */
  VIOLET: '#C084FC',

  /** Dark purple - Deep shadows */
  DARK: '#7E22CE',
} as const;

/**
 * Individual member signature colors
 * Each member has a unique color representing their personality
 */
export const MEMBER_COLORS = {
  /** RM - Blue (Leader, intellectual) */
  RM: '#2563EB',

  /** Jin - Pink (Visual, warmth) */
  JIN: '#EC4899',

  /** SUGA - Green (Producer, growth) */
  SUGA: '#10B981',

  /** J-Hope - Red (Main Dancer, energy) */
  J_HOPE: '#EF4444',

  /** Jimin - Gold (Lead Vocalist, elegance) */
  JIMIN: '#F59E0B',

  /** V - Green (Visual, natural) */
  V: '#22c55e',

  /** Jungkook - Purple (Golden Maknae, versatility) */
  JUNGKOOK: '#8B5CF6',
} as const;

/**
 * Background and ambient colors for the cosmic universe
 */
export const UNIVERSE_COLORS = {
  /** Deep space background */
  SPACE: '#020005',

  /** Nebula effect */
  NEBULA: 'rgba(88, 28, 135, 0.4)',

  /** Star colors (white and purple variations) */
  STARS: ['#ffffff', '#A855F7', '#D8B4FE', '#818CF8', '#C084FC'],
} as const;

/**
 * UI element colors for glass morphism and panels
 */
export const UI_COLORS = {
  /** Glass panel background */
  GLASS_BG: 'rgba(255, 255, 255, 0.02)',

  /** Glass panel border */
  GLASS_BORDER: 'rgba(255, 255, 255, 0.05)',

  /** Text primary color */
  TEXT_PRIMARY: 'rgba(255, 255, 255, 0.9)',

  /** Text secondary color */
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.4)',

  /** Text muted color */
  TEXT_MUTED: 'rgba(255, 255, 255, 0.2)',
} as const;

/**
 * Sentiment-based colors for emotional analysis
 */
export const SENTIMENT_COLORS = {
  JOY: '#FBBF24',        // Yellow/Gold
  GRATITUDE: '#A78BFA',  // Soft Purple
  DETERMINATION: '#F59E0B', // Orange
  FEAR: '#EF4444',       // Red
  LONGING: '#3B82F6',    // Blue
  PAIN: '#DC2626',       // Deep Red
  COMFORT: '#10B981',    // Green
  DESTINY: '#8B5CF6',    // Purple
  CELEBRATION: '#EC4899', // Pink
  CONFIDENCE: '#F59E0B', // Gold
} as const;

/**
 * Retrieves the signature color for a BTS member by their ID
 * 
 * @param memberId - The member's ID (case-insensitive): 'rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'
 * @returns The member's signature color as a hex string, or primary purple if not found
 * 
 * @example
 * ```typescript
 * getMemberColor('rm');      // '#2563EB' (blue)
 * getMemberColor('jm');      // '#F59E0B' (gold)
 * getMemberColor('unknown'); // '#A855F7' (fallback purple)
 * ```
 */
export const getMemberColor = (memberId: string): string => {
  const colorMap: Record<string, string> = {
    'rm': MEMBER_COLORS.RM,
    'jin': MEMBER_COLORS.JIN,
    'suga': MEMBER_COLORS.SUGA,
    'jh': MEMBER_COLORS.J_HOPE,
    'jm': MEMBER_COLORS.JIMIN,
    'v': MEMBER_COLORS.V,
    'jk': MEMBER_COLORS.JUNGKOOK,
  };

  return colorMap[memberId.toLowerCase()] || BORAHAE_COLORS.PRIMARY;
};

/**
 * Retrieves the color associated with an emotional sentiment
 * 
 * Maps sentiment strings to their corresponding color values from the
 * SENTIMENT_COLORS palette. Handles multi-word sentiments by converting
 * spaces to underscores. Falls back to primary Borahae purple for
 * unrecognized sentiments.
 * 
 * @param sentiment - The emotional sentiment (case-insensitive)
 *                    Examples: 'joy', 'gratitude', 'determination', etc.
 * @returns The corresponding color as a hex string
 * 
 * @example
 * ```typescript
  * const joyColor = getSentimentColor('joy');      // '#FBBF24'
 * const painColor = getSentimentColor('pain');    // '#DC2626'
 * const unknownColor = getSentimentColor('xyz');  // '#A855F7' (fallback)
 * ```
 */
export const getSentimentColor = (sentiment: string): string => {
  const sentimentKey = sentiment.toUpperCase().replace(/\s+/g, '_');
  return SENTIMENT_COLORS[sentimentKey as keyof typeof SENTIMENT_COLORS] || BORAHAE_COLORS.PRIMARY;
};

/**
 * Adds alpha transparency to a hex color code
 * 
 * Converts a hex color to RGBA format with specified transparency.
 * Useful for glassmorphism effects and layered overlays.
 * 
 * @param hex - Hex color code (with '#' prefix)
 * @param alpha - Alpha value (0.0 = transparent, 1.0 = opaque)
 * @returns RGBA color string
 * 
 * @example
 * ```typescript
 * withAlpha('#A855F7', 0.5);  // 'rgba(168, 85, 247, 0.5)'
 * withAlpha('#FFFFFF', 0.1);  // 'rgba(255, 255, 255, 0.1)'
 * withAlpha('#000000', 0.75); // 'rgba(0, 0, 0, 0.75)'
 * ```
 */
export const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Export all color constants as a single object for convenience
export const COLORS = {
  BORAHAE: BORAHAE_COLORS,
  MEMBERS: MEMBER_COLORS,
  UNIVERSE: UNIVERSE_COLORS,
  UI: UI_COLORS,
  SENTIMENT: SENTIMENT_COLORS,
} as const;

export default COLORS;
