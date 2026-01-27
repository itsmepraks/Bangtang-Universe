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
 * 
 * getMemberColor('RM')   // Works - returns '#2563EB'
 * getMemberColor('Rm')   // Works - returns '#2563EB'
 * getMemberColor('rM')   // Works - returns '#2563EB'
 * ```
 * 
 * @example
 * Fallback for unknown IDs:
 * ```typescript
 * const unknownColor = getMemberColor('unknown');
 * // Returns: '#A855F7' (primary Borahae purple - safe fallback)
 * ```
 * 
 * @example
 * Using in component styling:
 * ```tsx
 * function MemberCard({ memberId }: { memberId: string }) {
 *   const color = getMemberColor(memberId);
 *   return (
 *     <div style={{ 
 *       borderColor: color, 
 *       boxShadow: `0 0 20px ${color}`,
 *       background: `linear-gradient(135deg, ${withAlpha(color, 0.1)}, transparent)`
 *     }}>
 *       <h2 style={{ color }}>Member Profile</h2>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Iterating through all members:
 * ```typescript
 * const memberIds = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];
 * const memberPalette = memberIds.map(id => ({
 *   id,
 *   name: id.toUpperCase(),
 *   color: getMemberColor(id)
 * }));
 * // Returns array for generating color legends or UI palettes
 * ```
 * 
 * @example
 * Dynamic CSS custom properties:
 * ```tsx
 * function MemberTheme({ memberId }: Props) {
 *   const color = getMemberColor(memberId);
 *   return (
 *     <div style={{ '--member-color': color } as React.CSSProperties}>
 *       {/* CSS can now use: var(--member-color) */}
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
 * 
 * const painColor = getSentimentColor('pain');
 * // Returns: '#DC2626' (deep red)
 * ```
 * 
 * @example
 * Case-insensitive matching:
 * ```typescript
 * const comfortColor = getSentimentColor('COMFORT');
 * // Returns: '#10B981' (green)
 * 
 * getSentimentColor('joy')           // Works
 * getSentimentColor('JOY')           // Works
 * getSentimentColor('Joy')           // Works
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
 * function SongSentiment({ song }: { song: Song }) {
 *   const color = getSentimentColor(song.sentiment);
 *   return (
 *     <div 
 *       className="sentiment-badge" 
 *       style={{ 
 *         backgroundColor: withAlpha(color, 0.2),
 *         borderLeft: `4px solid ${color}`,
 *         color: color
 *       }}
 *     >
 *       {song.sentiment}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Creating sentiment-based gradients:
 * ```typescript
 * const song = { sentiments: ['joy', 'gratitude', 'celebration'] };
 * const gradientColors = song.sentiments
 *   .map(s => getSentimentColor(s))
 *   .join(', ');
 * // Use in: background: linear-gradient(to right, ${gradientColors})
 * ```
 * 
 * @example
 * Sentiment distribution chart:
 * ```tsx
 * function SentimentChart({ songs }: Props) {
 *   const sentimentCounts = songs.reduce((acc, song) => {
 *     const color = getSentimentColor(song.sentiment);
 *     acc[song.sentiment] = { 
 *       count: (acc[song.sentiment]?.count || 0) + 1, 
 *       color 
 *     };
 *     return acc;
 *   }, {});
 *   
 *   return (
 *     <div className="chart">
 *       {Object.entries(sentimentCounts).map(([sentiment, { count, color }]) => (
 *         <div 
 *           key={sentiment}
 *           style={{ 
 *             width: `${(count / songs.length) * 100}%`,
 *             backgroundColor: color
 *           }}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Combining with opacity for layered mood effects:
 * ```typescript
 * function getMoodGradient(sentiment: string) {
 *   const baseColor = getSentimentColor(sentiment);
 *   return `linear-gradient(135deg, 
 *     ${withAlpha(baseColor, 0.8)} 0%, 
 *     ${withAlpha(baseColor, 0.4)} 50%, 
 *     ${withAlpha(baseColor, 0)} 100%
 *   )`;
 * }
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
 * while maintaining the base color. Essential for the "Purple Ocean" 
 * bokeh effect and glass panel aesthetics.
 * 
 * @param hex - Hex color code (with or without '#' prefix)
 * @param alpha - Alpha transparency value (0.0 = fully transparent, 1.0 = fully opaque)
 * @returns RGBA color string in format 'rgba(r, g, b, alpha)'
 * 
 * @example
 * Basic transparency:
 * ```typescript
 * const semiTransparent = withAlpha('#A855F7', 0.5);
 * // Returns: 'rgba(168, 85, 247, 0.5)' - 50% transparent purple
 * 
 * const fullyOpaque = withAlpha('#A855F7', 1.0);
 * // Returns: 'rgba(168, 85, 247, 1)' - fully opaque
 * 
 * const barelyVisible = withAlpha('#A855F7', 0.05);
 * // Returns: 'rgba(168, 85, 247, 0.05)' - very subtle
 * ```
 * 
 * @example
 * Creating glass morphism effects (Purple Ocean aesthetic):
 * ```typescript
 * const glassBg = withAlpha(BORAHAE_COLORS.PRIMARY, 0.1);
 * const glassBorder = withAlpha('#FFFFFF', 0.05);
 * // Use in: background-color: glassBg; border: 1px solid glassBorder
 * ```
 * 
 * @example
 * Glass panel component:
 * ```tsx
 * function GlassPanel({ children }: Props) {
 *   return (
 *     <div style={{
 *       background: withAlpha('#ffffff', 0.02),
 *       border: `1px solid ${withAlpha('#ffffff', 0.05)}`,
 *       backdropFilter: 'blur(10px)',
 *       borderRadius: '12px',
 *       boxShadow: `0 8px 32px ${withAlpha('#000000', 0.1)}`
 *     }}>
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Member color with transparency:
 * ```typescript
 * const rmGlow = withAlpha(MEMBER_COLORS.RM, 0.3);
 * // Returns: 'rgba(37, 99, 235, 0.3)'
 * // Perfect for glowing effects around member cards
 * ```
 * 
 * @example
 * Layered bokeh bubble effect (ARMY bomb lights):
 * ```tsx
 * function BokehBubble({ color }: { color: string }) {
 *   return (
 *     <div 
 *       className="bokeh-bubble"
 *       style={{
 *         background: `radial-gradient(
 *           circle,
 *           ${withAlpha(color, 0.6)} 0%,
 *           ${withAlpha(color, 0.3)} 40%,
 *           ${withAlpha(color, 0.1)} 70%,
 *           ${withAlpha(color, 0)} 100%
 *         )`
 *       }}
 *     />
 *   );
 * }
 * ```
 * 
 * @example
 * Creating hover states with dynamic opacity:
 * ```tsx
 * function InteractiveCard({ isHovered }: Props) {
 *   const bgOpacity = isHovered ? 0.15 : 0.05;
 *   return (
 *     <div style={{
 *       backgroundColor: withAlpha(BORAHAE_COLORS.PRIMARY, bgOpacity),
 *       transition: 'background-color 0.3s ease'
 *     }}>
 *       Card Content
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Text shadow with purple glow:
 * ```typescript
 * const textGlow = `
 *   0 0 10px ${withAlpha(BORAHAE_COLORS.PRIMARY, 0.5)},
 *   0 0 20px ${withAlpha(BORAHAE_COLORS.PRIMARY, 0.3)},
 *   0 0 30px ${withAlpha(BORAHAE_COLORS.PRIMARY, 0.1)}
 * `;
 * // Use in: text-shadow: textGlow for glowing purple text
 * ```
 * 
 * @example
 * Modal overlay with backdrop:
 * ```tsx
 * function Modal({ children }: Props) {
 *   return (
 *     <div 
 *       className="modal-overlay"
 *       style={{
 *         background: withAlpha('#000000', 0.75),
 *         backdropFilter: 'blur(4px)'
 *       }}
 *     >
 *       <div className="modal-content">{children}</div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Nebula layers effect (multiple transparency layers):
 * ```typescript
 * const nebulaLayers = [
 *   withAlpha('#581C87', 0.6),  // Deep purple base (back)
 *   withAlpha('#7E22CE', 0.4),  // Medium purple (middle)
 *   withAlpha('#A855F7', 0.2),  // Light purple (front)
 * ];
 * 
 * const nebulaEffect = nebulaLayers
 *   .map(color => `radial-gradient(circle, ${color} 0%, transparent 70%)`)
 *   .join(', ');
 * // Creates depth with multiple semi-transparent layers
 * ```
 * 
 * @example
 * Star twinkle animation with varying opacity:
 * ```tsx
 * function TwinklingStar({ color }: { color: string }) {
 *   const [opacity, setOpacity] = useState(0.8);
 *   
 *   useEffect(() => {
 *     const interval = setInterval(() => {
 *       setOpacity(Math.random() * 0.6 + 0.4); // Random 0.4-1.0
 *     }, 2000);
 *     return () => clearInterval(interval);
 *   }, []);
 *   
 *   return (
 *     <div style={{
 *       backgroundColor: withAlpha(color, opacity),
 *       transition: 'opacity 2s ease-in-out'
 *     }} />
 *   );
 * }
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
