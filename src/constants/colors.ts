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
 * This function maps member IDs to their unique colors used throughout
 * the application. Falls back to the primary Borahae purple if the
 * member ID is not recognized.
 * 
 * @param memberId - The member's ID (case-insensitive)
 *                   Accepts: 'rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'
 * @returns The member's signature color as a hex string
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const rmColor = getMemberColor('rm');
 * // Returns: '#2563EB' (blue)
 * ```
 * 
 * @example
 * Case-insensitive lookup:
 * ```typescript
 * const jiminColor = getMemberColor('JM');
 * // Returns: '#F59E0B' (gold)
 * ```
 * 
 * @example
 * Fallback for unknown IDs:
 * ```typescript
 * const unknownColor = getMemberColor('unknown');
 * // Returns: '#A855F7' (primary Borahae purple)
 * ```
 * 
 * @example
 * Using in component styling:
 * ```tsx
 * function MemberCard({ memberId }: { memberId: string }) {
 *   const color = getMemberColor(memberId);
 *   return (
 *     <div style={{ borderColor: color, boxShadow: `0 0 20px ${color}` }}>
 *       Member Profile
 *     </div>
 *   );
 * }
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
 * Basic sentiment lookup:
 * ```typescript
 * const joyColor = getSentimentColor('joy');
 * // Returns: '#FBBF24' (yellow/gold)
 * ```
 * 
 * @example
 * Case-insensitive matching:
 * ```typescript
 * const comfortColor = getSentimentColor('COMFORT');
 * // Returns: '#10B981' (green)
 * ```
 * 
 * @example
 * Fallback for unknown sentiments:
 * ```typescript
 * const unknownColor = getSentimentColor('nostalgia');
 * // Returns: '#A855F7' (primary Borahae purple)
 * ```
 * 
 * @example
 * Using in song analysis visualization:
 * ```tsx
 * function SongSentiment({ sentiment }: { sentiment: string }) {
 *   const color = getSentimentColor(sentiment);
 *   return (
 *     <div className="sentiment-badge" style={{ backgroundColor: color }}>
 *       {sentiment}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Creating sentiment-based gradients:
 * ```typescript
 * const song = { sentiments: ['joy', 'gratitude', 'celebration'] };
 * const gradient = song.sentiments
 *   .map(s => getSentimentColor(s))
 *   .join(', ');
 * // Use in: background: linear-gradient(to right, ${gradient})
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
 * Useful for creating layered effects, glassmorphism, and subtle overlays
 * while maintaining the base color.
 * 
 * @param hex - Hex color code (with or without '#' prefix)
 * @param alpha - Alpha transparency value (0.0 = fully transparent, 1.0 = fully opaque)
 * @returns RGBA color string in format 'rgba(r, g, b, alpha)'
 * 
 * @example
 * Basic transparency:
 * ```typescript
 * const semiTransparent = withAlpha('#A855F7', 0.5);
 * // Returns: 'rgba(168, 85, 247, 0.5)'
 * ```
 * 
 * @example
 * Creating glass effect overlays:
 * ```typescript
 * const glassBg = withAlpha(BORAHAE_COLORS.PRIMARY, 0.1);
 * // Use in: background-color: glassBg
 * ```
 * 
 * @example
 * Member color with transparency:
 * ```typescript
 * const rmGlow = withAlpha(MEMBER_COLORS.RM, 0.3);
 * // Returns: 'rgba(37, 99, 235, 0.3)'
 * // Use for glowing effects around member cards
 * ```
 * 
 * @example
 * Layered bokeh effect:
 * ```tsx
 * function BokehBubble({ color }: { color: string }) {
 *   return (
 *     <div 
 *       className="bokeh-bubble"
 *       style={{
 *         background: `radial-gradient(
 *           circle,
 *           ${withAlpha(color, 0.6)} 0%,
 *           ${withAlpha(color, 0.2)} 50%,
 *           ${withAlpha(color, 0)} 100%
 *         )`
 *       }}
 *     />
 *   );
 * }
 * ```
 * 
 * @example
 * Creating hover states:
 * ```css
 * .member-card {
 *   background: withAlpha(MEMBER_COLORS.JIMIN, 0.1);
 * }
 * .member-card:hover {
 *   background: withAlpha(MEMBER_COLORS.JIMIN, 0.2);
 * }
 * ```
 * 
 * @example
 * Text shadow with color and transparency:
 * ```typescript
 * const textGlow = `0 0 20px ${withAlpha(BORAHAE_COLORS.PRIMARY, 0.8)}`;
 * // Use in: text-shadow: textGlow
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
