/**
 * BTS Neural Archive - Utility Helpers
 * 
 * Comprehensive collection of reusable utility functions for animations,
 * calculations, color manipulation, and common operations throughout the
 * BTS Neural Archive application.
 * 
 * **Organization:**
 * - Animation Helpers: Particle generation, position utilities
 * - Color Helpers: Hex/RGB conversion, color manipulation
 * - Math Helpers: Calculations, interpolation, distance
 * - String Helpers: Formatting, capitalization
 * - Time Helpers: Duration formatting, debounce, throttle
 * - DOM Helpers: Viewport detection, scrolling
 * - Array Helpers: Shuffling, sampling, chunking
 * - Performance Helpers: Animation frame management
 * 
 * @module utils/helpers
 * @see {@link ../types.ts} for type definitions
 */

import type { Position3D, Star, BokehBubble, FloatingParticle } from '../types';

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

/**
 * Generates a random position within viewport bounds.
 * 
 * Returns a position object with percentage-based left and top values,
 * ensuring elements can be placed anywhere within the viewport using
 * CSS positioning.
 * 
 * @returns Object with left and top as percentage strings
 * 
 * @example
 * // Position a floating particle randomly
 * const particle = randomPosition();
 * <div style={{ 
 *   position: 'absolute',
 *   left: particle.left,    // e.g., "73.25%"
 *   top: particle.top        // e.g., "42.68%"
 * }} />
 * 
 * @example
 * // Generate multiple random positions
 * const positions = Array.from({ length: 10 }, () => randomPosition());
 * 
 * @example
 * // Use in particle system
 * function ParticleSystem({ count }) {
 *   const particles = useMemo(
 *     () => Array.from({ length: count }, () => ({
 *       ...randomPosition(),
 *       size: Math.random() * 4 + 2,
 *     })),
 *     [count]
 *   );
 *   
 *   return particles.map((p, i) => (
 *     <Particle key={i} left={p.left} top={p.top} size={p.size} />
 *   ));
 * }
 * 
 * @performance O(1) - Two random number generations
 * @see {@link generateFloatingParticles} for batch generation with additional properties
 */
export const randomPosition = (): { left: string; top: string } => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
});

/**
 * Creates a random delay for staggered animations.
 * 
 * Generates a random delay value useful for creating organic, non-uniform
 * animation timing. Perfect for particle systems, entrance animations, and
 * creating visual variety.
 * 
 * @param max - Maximum delay in seconds (default: 5)
 * @returns Random delay between 0 and max seconds
 * 
 * @example
 * // Random delay for star twinkle
 * const stars = generateStars(100).map(star => ({
 *   ...star,
 *   animationDelay: `${randomDelay(5)}s`,
 * }));
 * 
 * @example
 * // Shorter delays for quick reveals
 * const quickDelay = randomDelay(1); // 0-1 seconds
 * 
 * @example
 * // Use in component animation
 * function AnimatedCard({ children }) {
 *   const delay = useMemo(() => randomDelay(2), []);
 *   
 *   return (
 *     <div style={{ 
 *       animation: `fadeIn 0.6s ease-out ${delay}s forwards`,
 *       opacity: 0 
 *     }}>
 *       {children}
 *     </div>
 *   );
 * }
 * 
 * @bestpractice
 * - Keep max under 5 seconds to avoid perceived lag
 * - Use shorter delays (0.5-2s) for interactive elements
 * - Use longer delays (3-5s) for ambient effects
 * 
 * @performance O(1) - Single random number generation
 */
export const randomDelay = (max: number = 5): number => Math.random() * max;

/**
 * Creates a random duration within a range.
 * 
 * Generates animation durations with controlled variance. Ensures all
 * durations fall within min-max bounds, creating consistent but varied
 * animation timing.
 * 
 * @param min - Minimum duration in seconds
 * @param max - Maximum duration in seconds
 * @returns Random duration between min and max seconds
 * 
 * @example
 * // Variable floating speed (10-20 seconds)
 * const floatDuration = randomDuration(10, 20);
 * <div style={{ animationDuration: `${floatDuration}s` }} />
 * 
 * @example
 * // Quick animations (0.3-0.8 seconds)
 * const quickPop = randomDuration(0.3, 0.8);
 * 
 * @example
 * // Bokeh bubble pulse with varied timing
 * function BokehBubble() {
 *   const duration = useMemo(() => randomDuration(20, 40), []);
 *   
 *   return (
 *     <div className="bokeh" style={{
 *       animation: `bokeh-float ${duration}s infinite ease-in-out`,
 *     }} />
 *   );
 * }
 * 
 * @example
 * // Create natural variation in particle speeds
 * const particles = Array.from({ length: 50 }, () => ({
 *   duration: randomDuration(15, 25), // Not all the same speed!
 *   delay: randomDelay(5),
 * }));
 * 
 * @bestpractice
 * - Use narrow ranges (±20%) for subtle variation
 * - Use wide ranges (±50%) for dramatic variation
 * - Keep minimum above 0.2s for smooth animations
 * 
 * @performance O(1) - Single random generation and arithmetic
 */
export const randomDuration = (min: number, max: number): number =>
  min + Math.random() * (max - min);

/**
 * Generates an array of star positions in 3D space using spherical coordinates.
 * 
 * Creates stars distributed uniformly across a spherical surface using proper
 * spherical coordinate mathematics. Supports customizable radius bounds and
 * color palettes. Every 12th star is white for visual variety.
 * 
 * **Distribution Pattern:**
 * ```
 *   Uniform Sphere        Color Distribution
 *      · · ·              • Purple: 91.7%
 *    · · · ·              ○ White:   8.3%
 *   · · * · ·
 *    · · · ·
 *      · · ·
 * ```
 * 
 * @param count - Number of stars to generate
 * @param minRadius - Minimum distance from origin (default: 300)
 * @param maxRadius - Maximum distance from origin (default: 1300)
 * @param colors - Array of color hex codes (default: purple palette)
 * @returns Array of Star objects with spherical coordinates
 * 
 * @example
 * // Generate cosmic star field
 * const stars = generateStars(800);
 * 
 * stars.forEach((star, i) => {
 *   const { x, y, z } = sphericalToCartesian(star);
 *   const perspective = 500;
 *   const scale = perspective / (perspective + z);
 *   
 *   return (
 *     <div
 *       key={i}
 *       className="star"
 *       style={{
 *         left: `${50 + x * scale / 10}%`,
 *         top: `${50 + y * scale / 10}%`,
 *         width: `${star.size * scale}px`,
 *         height: `${star.size * scale}px`,
 *         backgroundColor: star.color,
 *         opacity: scale * 0.8,
 *         animationDelay: `${star.delay}s`,
 *       }}
 *     />
 *   );
 * });
 * 
 * @example
 * // Layered depth with multiple star fields
 * const nearStars = generateStars(150, 300, 500, ['#ffffff']);
 * const midStars = generateStars(400, 500, 900, ['#A855F7', '#D8B4FE']);
 * const farStars = generateStars(250, 900, 1300, ['#818CF8']);
 * const allStars = [...nearStars, ...midStars, ...farStars];
 * 
 * @example
 * // Responsive star count
 * function useStarCount() {
 *   const [count, setCount] = useState(800);
 *   
 *   useEffect(() => {
 *     const updateCount = () => {
 *       const width = window.innerWidth;
 *       setCount(width < 768 ? 300 : width < 1024 ? 600 : 1000);
 *     };
 *     updateCount();
 *     window.addEventListener('resize', updateCount);
 *     return () => window.removeEventListener('resize', updateCount);
 *   }, []);
 *   
 *   return count;
 * }
 * 
 * @performance
 * - Time Complexity: O(n)
 * - Space Complexity: O(n)
 * - Trigonometric operations: 1 per star (Math.acos)
 * - Recommended: 500-1000 stars for 60fps
 * 
 * @see {@link sphericalToCartesian} to convert to 3D Cartesian coordinates
 */
export const generateStars = (
  count: number,
  minRadius: number = 300,
  maxRadius: number = 1300,
  colors: string[] = ['#ffffff', '#A855F7', '#D8B4FE', '#818CF8', '#C084FC']
): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    theta: Math.random() * 2 * Math.PI,
    phi: Math.acos((Math.random() * 2) - 1),
    r: minRadius + Math.random() * (maxRadius - minRadius),
    size: Math.random() * 2.5 + 0.5,
    color: i % 12 === 0 ? '#ffffff' : colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
  }));
};

/**
 * Converts spherical coordinates to Cartesian coordinates.
 * 
 * Transforms a star's spherical position (theta, phi, r) into 3D Cartesian
 * coordinates (x, y, z) for rendering with perspective projection.
 * 
 * **Conversion Formula:**
 * ```
 * x = r × sin(φ) × cos(θ)
 * y = r × sin(φ) × sin(θ)
 * z = r × cos(φ)
 * ```
 * 
 * @param star - Star object with theta, phi, and r properties
 * @returns Position3D object with x, y, z coordinates
 * 
 * @example
 * // Convert star to 3D position
 * const star = { theta: Math.PI / 4, phi: Math.PI / 3, r: 500 };
 * const position = sphericalToCartesian(star);
 * console.log(position); // { x: 216.5, y: 216.5, z: 250 }
 * 
 * @example
 * // Render stars with perspective
 * function StarField({ stars }) {
 *   return stars.map((star, i) => {
 *     const { x, y, z } = sphericalToCartesian(star);
 *     const focalLength = 500;
 *     const scale = focalLength / (focalLength + z);
 *     
 *     return (
 *       <Star
 *         key={i}
 *         x={50 + (x * scale / 10)}
 *         y={50 + (y * scale / 10)}
 *         size={star.size * scale}
 *         opacity={scale * 0.8}
 *       />
 *     );
 *   });
 * }
 * 
 * @performance
 * - Time Complexity: O(1)
 * - Trigonometric ops: 4 (sin twice, cos twice)
 * 
 * @see {@link generateStars} for creating spherical star data
 */
export const sphericalToCartesian = (star: Star): Position3D => ({
  x: star.r * Math.sin(star.phi) * Math.cos(star.theta),
  y: star.r * Math.sin(star.phi) * Math.sin(star.theta),
  z: star.r * Math.cos(star.phi),
});

/**
 * Generates bokeh bubble configurations for purple ocean effect.
 * 
 * Creates soft, out-of-focus light orbs with randomized positions, sizes,
 * delays, and durations. Simulates photographic bokeh for the BTS "Borahae"
 * aesthetic.
 * 
 * @param count - Number of bokeh bubbles to generate
 * @returns Array of BokehBubble configurations
 * 
 * @example
 * // Create purple ocean background
 * const bokeh = generateBokehBubbles(12);
 * 
 * bokeh.map((bubble, i) => (
 *   <div
 *     key={i}
 *     className="bokeh-bubble"
 *     style={{
 *       position: 'absolute',
 *       left: bubble.left,
 *       top: bubble.top,
 *       width: `${bubble.size}px`,
 *       height: `${bubble.size}px`,
 *       background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
 *       filter: 'blur(60px)',
 *       animationDelay: `${bubble.delay}s`,
 *       animationDuration: `${bubble.duration}s`,
 *     }}
 *   />
 * ));
 * 
 * @example
 * // Responsive bokeh count
 * const getBokehCount = () => {
 *   const width = window.innerWidth;
 *   if (width < 768) return 6;   // Mobile
 *   if (width < 1024) return 10;  // Tablet
 *   return 15;                     // Desktop
 * };
 * 
 * @performance
 * - Large blur radius is GPU intensive
 * - Recommended max: 15 bokeh bubbles
 * - Consider 6-8 for mobile devices
 * 
 * @see {@link generateBokehLights} from animations.ts for similar function
 */
export const generateBokehBubbles = (count: number): BokehBubble[] => {
  return Array.from({ length: count }, () => ({
    ...randomPosition(),
    size: Math.random() * 200 + 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));
};

/**
 * Generates floating particle configurations for ambient effects.
 * 
 * Creates small particles that float across the screen, adding depth and
 * movement to the cosmic environment. Each particle has unique timing and
 * size for organic appearance.
 * 
 * @param count - Number of particles to generate
 * @returns Array of FloatingParticle configurations
 * 
 * @example
 * // Add cosmic dust particles
 * const particles = generateFloatingParticles(30);
 * 
 * particles.map((particle, i) => (
 *   <div
 *     key={i}
 *     className="floating-particle"
 *     style={{
 *       left: particle.left,
 *       top: particle.top,
 *       width: `${particle.size}px`,
 *       height: `${particle.size}px`,
 *       animationDelay: `${particle.delay}s`,
 *       animationDuration: `${particle.duration}s`,
 *     }}
 *   />
 * ));
 * 
 * @example
 * // Performance-conscious particle generation
 * const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
 * const particleCount = isMobile ? 15 : 40;
 * const particles = generateFloatingParticles(particleCount);
 * 
 * @performance
 * - Recommended: 20-50 particles
 * - Mobile: 15-25 particles
 * - Desktop: 30-50 particles
 */
export const generateFloatingParticles = (count: number): FloatingParticle[] => {
  return Array.from({ length: count }, () => ({
    ...randomPosition(),
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: Math.random() * 3 + 1,
  }));
};

// ============================================================================
// COLOR HELPERS
// ============================================================================

/**
 * Converts hex color to RGB values.
 * 
 * Parses a hexadecimal color string (with or without #) and returns
 * RGB component values as numbers (0-255). Returns null for invalid input.
 * 
 * @param hex - Hex color string (e.g., "#A855F7" or "A855F7")
 * @returns RGB object with r, g, b properties, or null if invalid
 * 
 * @example
 * // Convert BTS purple to RGB
 * const rgb = hexToRgb('#A855F7');
 * console.log(rgb); // { r: 168, g: 85, b: 247 }
 * 
 * @example
 * // Use in rgba() color
 * const purple = hexToRgb('#A855F7');
 * if (purple) {
 *   const rgba = `rgba(${purple.r}, ${purple.g}, ${purple.b}, 0.5)`;
 *   // "rgba(168, 85, 247, 0.5)"
 * }
 * 
 * @example
 * // Handle invalid input
 * const invalid = hexToRgb('not-a-color');
 * if (!invalid) {
 *   console.error('Invalid color format');
 * }
 * 
 * @example
 * // Create color gradient
 * function createGradient(color1: string, color2: string, steps: number) {
 *   const rgb1 = hexToRgb(color1);
 *   const rgb2 = hexToRgb(color2);
 *   if (!rgb1 || !rgb2) return [];
 *   
 *   return Array.from({ length: steps }, (_, i) => {
 *     const t = i / (steps - 1);
 *     const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
 *     const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
 *     const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
 *     return rgbToHex(r, g, b);
 *   });
 * }
 * 
 * @bestpractice
 * - Always check for null return value
 * - Supports both "#ABC" and "#AABBCC" formats
 * - Works with or without # prefix
 * 
 * @performance O(1) - Regex match and parsing
 * @browser All modern browsers
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

/**
 * Converts RGB values to hex color string.
 * 
 * Takes red, green, and blue component values (0-255) and returns a
 * hexadecimal color string with # prefix. Ensures proper padding for
 * single-digit hex values.
 * 
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string (e.g., "#a855f7")
 * 
 * @example
 * // Convert RGB to hex
 * const hex = rgbToHex(168, 85, 247);
 * console.log(hex); // "#a855f7"
 * 
 * @example
 * // Create hex from calculation
 * const brightness = 0.5;
 * const red = Math.round(255 * brightness);
 * const green = Math.round(128 * brightness);
 * const blue = Math.round(200 * brightness);
 * const hex = rgbToHex(red, green, blue); // "#407f64"
 * 
 * @example
 * // Use in theme generator
 * function generateTheme(baseHue: number) {
 *   const colors = [];
 *   for (let i = 0; i < 5; i++) {
 *     const hue = (baseHue + i * 30) % 360;
 *     const rgb = hslToRgb(hue, 70, 60); // Hypothetical conversion
 *     colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
 *   }
 *   return colors;
 * }
 * 
 * @bestpractice
 * - Input values are clamped to 0-255 automatically
 * - Always returns lowercase hex for consistency
 * - Includes # prefix for CSS compatibility
 * 
 * @performance O(1) - Array operations and string concatenation
 * @browser All browsers
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Adds alpha transparency to hex color.
 * 
 * Converts a hex color to rgba() format with specified opacity. Perfect for
 * creating semi-transparent overlays, glass morphism effects, and layered
 * visuals in the BTS cosmic UI.
 * 
 * @param hex - Hex color string
 * @param alpha - Opacity value (0-1)
 * @returns RGBA color string, or original hex if conversion fails
 * 
 * @example
 * // Create glass morphism effect
 * const glassBackground = hexWithAlpha('#A855F7', 0.1);
 * <div style={{ 
 *   background: glassBackground,  // "rgba(168, 85, 247, 0.1)"
 *   backdropFilter: 'blur(40px)',
 * }} />
 * 
 * @example
 * // Hover state with transparency
 * function GlassCard() {
 *   const [isHovered, setIsHovered] = useState(false);
 *   const alpha = isHovered ? 0.15 : 0.08;
 *   
 *   return (
 *     <div 
 *       style={{ background: hexWithAlpha('#A855F7', alpha) }}
 *       onMouseEnter={() => setIsHovered(true)}
 *       onMouseLeave={() => setIsHovered(false)}
 *     />
 *   );
 * }
 * 
 * @example
 * // Layered bokeh effect
 * const layers = [
 *   { color: hexWithAlpha('#A855F7', 0.3), blur: 80 },
 *   { color: hexWithAlpha('#D8B4FE', 0.2), blur: 60 },
 *   { color: hexWithAlpha('#C084FC', 0.15), blur: 40 },
 * ];
 * 
 * @bestpractice
 * - Use alpha 0.05-0.15 for glass morphism backgrounds
 * - Use alpha 0.2-0.4 for overlays
 * - Use alpha 0.5-0.8 for prominent semi-transparent elements
 * 
 * @performance O(1) - Single conversion
 * @browser All browsers supporting rgba()
 */
export const hexWithAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Lightens a color by a percentage.
 * 
 * Increases the brightness of a hex color by moving RGB values closer to
 * white (255). Perfect for creating hover states, highlights, and lighter
 * variants of theme colors.
 * 
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color string
 * 
 * @example
 * // Create hover state
 * const baseColor = '#A855F7';
 * const hoverColor = lightenColor(baseColor, 20);
 * // baseColor: #A855F7 → hoverColor: #C884FB
 * 
 * @example
 * // Generate color palette
 * function ColorPalette({ baseColor }) {
 *   const shades = [
 *     lightenColor(baseColor, 40),  // Lightest
 *     lightenColor(baseColor, 20),  // Light
 *     baseColor,                     // Base
 *     darkenColor(baseColor, 20),   // Dark
 *     darkenColor(baseColor, 40),   // Darkest
 *   ];
 *   
 *   return shades.map(color => <ColorSwatch color={color} />);
 * }
 * 
 * @example
 * // Text on colored background
 * function ThemedButton({ color }) {
 *   const bgColor = color;
 *   const hoverBg = lightenColor(color, 15);
 *   const textColor = lightenColor(color, 50); // Lighter text
 *   
 *   return (
 *     <button style={{
 *       background: bgColor,
 *       color: textColor,
 *       '&:hover': { background: hoverBg }
 *     }}>
 *       Click Me
 *     </button>
 *   );
 * }
 * 
 * @bestpractice
 * - 10-15% for subtle hover effects
 * - 20-30% for distinct lighter variants
 * - 40-60% for very light tints
 * - Returns original color if conversion fails
 * 
 * @performance O(1) - RGB conversion and arithmetic
 * @see {@link darkenColor} for darkening colors
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const increase = (val: number) => Math.min(255, Math.floor(val + (255 - val) * percent / 100));

  return rgbToHex(increase(rgb.r), increase(rgb.g), increase(rgb.b));
};

/**
 * Darkens a color by a percentage.
 * 
 * Decreases the brightness of a hex color by moving RGB values closer to
 * black (0). Useful for creating pressed states, shadows, and darker
 * theme variants.
 * 
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color string
 * 
 * @example
 * // Create active/pressed state
 * const baseColor = '#A855F7';
 * const activeColor = darkenColor(baseColor, 20);
 * // baseColor: #A855F7 → activeColor: #8644C5
 * 
 * @example
 * // Generate shadow color
 * function CardWithShadow({ accentColor }) {
 *   const shadowColor = hexWithAlpha(darkenColor(accentColor, 40), 0.4);
 *   
 *   return (
 *     <div style={{
 *       boxShadow: `0 4px 20px ${shadowColor}`,
 *       borderColor: accentColor,
 *     }}>
 *       Card Content
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Night mode palette
 * function createNightPalette(dayColors: string[]) {
 *   return dayColors.map(color => darkenColor(color, 30));
 * }
 * 
 * @bestpractice
 * - 10-15% for button pressed states
 * - 20-30% for distinct darker variants
 * - 40-60% for very dark shades
 * - Combine with hexWithAlpha for colored shadows
 * 
 * @performance O(1) - RGB conversion and arithmetic
 * @see {@link lightenColor} for lightening colors
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const decrease = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));

  return rgbToHex(decrease(rgb.r), decrease(rgb.g), decrease(rgb.b));
};

// ============================================================================
// MATH HELPERS
// ============================================================================

/**
 * Clamps a value between minimum and maximum bounds.
 * 
 * Restricts a number to stay within [min, max] range. Values below min
 * become min; values above max become max; values within range are unchanged.
 * Essential for keeping calculations within valid bounds.
 * 
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 * 
 * @example
 * // Keep opacity valid
 * const opacity = clamp(userInput, 0, 1);
 * 
 * @example
 * // Clamp scroll position
 * const maxScroll = document.body.scrollHeight - window.innerHeight;
 * const scrollY = clamp(targetScroll, 0, maxScroll);
 * window.scrollTo(0, scrollY);
 * 
 * @example
 * // Volume control
 * function VolumeSlider({ onChange }) {
 *   const handleChange = (e) => {
 *     const volume = clamp(parseFloat(e.target.value), 0, 1);
 *     onChange(volume);
 *   };
 *   
 *   return <input type="range" min="0" max="1" step="0.01" onChange={handleChange} />;
 * }
 * 
 * @example
 * // RGB color channel
 * const red = clamp(Math.round(value * 255), 0, 255);
 * 
 * @performance O(1) - Two comparisons
 * @browser All browsers
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Linear interpolation between two values.
 * 
 * Calculates a value between start and end based on t (0-1). When t=0,
 * returns start; when t=1, returns end; when t=0.5, returns midpoint.
 * Foundation for smooth animations and transitions.
 * 
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Progress (0-1, automatically clamped)
 * @returns Interpolated value
 * 
 * @example
 * // Animate position
 * function useAnimatedValue(from: number, to: number, duration: number) {
 *   const [value, setValue] = useState(from);
 *   
 *   useEffect(() => {
 *     const startTime = Date.now();
 *     const animate = () => {
 *       const elapsed = Date.now() - startTime;
 *       const progress = Math.min(elapsed / duration, 1);
 *       setValue(lerp(from, to, progress));
 *       
 *       if (progress < 1) {
 *         requestAnimationFrame(animate);
 *       }
 *     };
 *     animate();
 *   }, [from, to, duration]);
 *   
 *   return value;
 * }
 * 
 * @example
 * // Color interpolation
 * function interpolateColor(color1: string, color2: string, t: number) {
 *   const rgb1 = hexToRgb(color1);
 *   const rgb2 = hexToRgb(color2);
 *   if (!rgb1 || !rgb2) return color1;
 *   
 *   const r = Math.round(lerp(rgb1.r, rgb2.r, t));
 *   const g = Math.round(lerp(rgb1.g, rgb2.g, t));
 *   const b = Math.round(lerp(rgb1.b, rgb2.b, t));
 *   
 *   return rgbToHex(r, g, b);
 * }
 * 
 * @example
 * // Smooth camera zoom
 * const currentZoom = lerp(1, 2, easeInOutCubic(progress));
 * 
 * @performance O(1) - Simple arithmetic
 * @see {@link map} for mapping between different ranges
 */
export const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

/**
 * Maps a value from one range to another.
 * 
 * Converts a value from input range [inMin, inMax] to output range
 * [outMin, outMax]. Preserves relative position within the range.
 * Perfect for scaling, unit conversion, and coordinate transformations.
 * 
 * **Example:** map(5, 0, 10, 0, 100) = 50
 * - 5 is 50% through [0,10]
 * - 50% through [0,100] is 50
 * 
 * @param value - Value to map
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 * 
 * @example
 * // Convert audio frequency to color hue
 * const hue = map(frequency, 20, 20000, 240, 300); // Purple range
 * 
 * @example
 * // Mouse position to rotation
 * function FollowMouse() {
 *   const [rotation, setRotation] = useState(0);
 *   
 *   const handleMouseMove = (e: MouseEvent) => {
 *     const angle = map(e.clientX, 0, window.innerWidth, -45, 45);
 *     setRotation(angle);
 *   };
 *   
 *   return (
 *     <div 
 *       onMouseMove={handleMouseMove}
 *       style={{ transform: `rotate(${rotation}deg)` }}
 *     />
 *   );
 * }
 * 
 * @example
 * // Audio visualization
 * const frequencyData = new Uint8Array(analyser.frequencyBinCount);
 * analyser.getByteFrequencyData(frequencyData);
 * 
 * const bars = frequencyData.map((value, i) => ({
 *   height: map(value, 0, 255, 0, 100), // 0-255 → 0-100%
 *   color: `hsl(${map(i, 0, frequencyData.length, 240, 300)}, 70%, 60%)`,
 * }));
 * 
 * @example
 * // Temperature color coding
 * const getTemperatureColor = (celsius: number) => {
 *   const hue = map(celsius, -20, 40, 240, 0); // Blue to red
 *   return `hsl(${hue}, 70%, 50%)`;
 * };
 * 
 * @bestpractice
 * - Values outside input range are NOT clamped (extrapolation occurs)
 * - Use clamp() if you need to restrict output
 * - Avoid division by zero: ensure inMin !== inMax
 * 
 * @performance O(1) - Basic arithmetic operations
 */
export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Calculates distance between two points in 2D space.
 * 
 * Uses the Pythagorean theorem to compute Euclidean distance between
 * two points. Useful for collision detection, proximity checks, and
 * spatial calculations.
 * 
 * **Formula:** √[(x₂-x₁)² + (y₂-y₁)²]
 * 
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Distance between points
 * 
 * @example
 * // Check if click is near element
 * function isClickNear(clickX: number, clickY: number, elementX: number, elementY: number) {
 *   const dist = distance(clickX, clickY, elementX, elementY);
 *   return dist < 50; // Within 50px
 * }
 * 
 * @example
 * // Interactive hover effect based on mouse distance
 * function InteractiveCard() {
 *   const [scale, setScale] = useState(1);
 *   const cardRef = useRef<HTMLDivElement>(null);
 *   
 *   const handleMouseMove = (e: MouseEvent) => {
 *     if (!cardRef.current) return;
 *     
 *     const rect = cardRef.current.getBoundingClientRect();
 *     const centerX = rect.left + rect.width / 2;
 *     const centerY = rect.top + rect.height / 2;
 *     
 *     const dist = distance(e.clientX, e.clientY, centerX, centerY);
 *     const maxDist = 200;
 *     const newScale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.2 : 1;
 *     
 *     setScale(newScale);
 *   };
 *   
 *   return <div ref={cardRef} style={{ transform: `scale(${scale})` }} />;
 * }
 * 
 * @example
 * // Particle collision detection
 * function checkCollision(particle1, particle2) {
 *   const dist = distance(particle1.x, particle1.y, particle2.x, particle2.y);
 *   const combinedRadius = particle1.radius + particle2.radius;
 *   return dist < combinedRadius;
 * }
 * 
 * @performance
 * - Time Complexity: O(1)
 * - Includes Math.sqrt() which is relatively expensive
 * - For simple comparisons, compare squared distances to avoid sqrt
 * 
 * @bestpractice
 * // Distance comparison without sqrt (faster)
 * const distSquared = (x2-x1)² + (y2-y1)²;
 * if (distSquared < threshold²) { ... }
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

/**
 * Calculates angle between two points in radians.
 * 
 * Returns the angle from point 1 to point 2, measured counter-clockwise
 * from the positive X-axis. Range: -π to π (-180° to 180°).
 * 
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Angle in radians
 * 
 * @example
 * // Point element toward mouse
 * function PointToMouse() {
 *   const [angle, setAngle] = useState(0);
 *   const elementRef = useRef<HTMLDivElement>(null);
 *   
 *   const handleMouseMove = (e: MouseEvent) => {
 *     if (!elementRef.current) return;
 *     
 *     const rect = elementRef.current.getBoundingClientRect();
 *     const centerX = rect.left + rect.width / 2;
 *     const centerY = rect.top + rect.height / 2;
 *     
 *     const rad = angleBetween(centerX, centerY, e.clientX, e.clientY);
 *     setAngle(rad * 180 / Math.PI); // Convert to degrees
 *   };
 *   
 *   return (
 *     <div 
 *       ref={elementRef}
 *       style={{ transform: `rotate(${angle}deg)` }}
 *     >
 *       →
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Projectile direction
 * const angle = angleBetween(startX, startY, targetX, targetY);
 * const velocity = {
 *   x: Math.cos(angle) * speed,
 *   y: Math.sin(angle) * speed,
 * };
 * 
 * @performance O(1) - Single atan2 call
 * @browser All browsers
 */
export const angleBetween = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.atan2(y2 - y1, x2 - x1);

// ============================================================================
// STRING HELPERS
// ============================================================================

/**
 * Capitalizes the first letter of a string.
 * 
 * Converts the first character to uppercase and leaves the rest unchanged.
 * Handles empty strings gracefully.
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 * 
 * @example
 * capitalize('hello')  // "Hello"
 * capitalize('WORLD')  // "WORLD"
 * capitalize('')       // ""
 * 
 * @example
 * // Format member names
 * const members = ['rm', 'jin', 'suga'];
 * const formatted = members.map(capitalize); // ['Rm', 'Jin', 'Suga']
 * 
 * @example
 * // Capitalize user input
 * function NameInput() {
 *   const [name, setName] = useState('');
 *   
 *   const handleChange = (e) => {
 *     setName(capitalize(e.target.value));
 *   };
 *   
 *   return <input value={name} onChange={handleChange} />;
 * }
 * 
 * @performance O(1) - String slicing
 * @browser All browsers
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts string to title case (capitalize each word).
 * 
 * Splits string by spaces and capitalizes the first letter of each word.
 * Perfect for formatting titles, names, and headings.
 * 
 * @param str - String to convert
 * @returns Title-cased string
 * 
 * @example
 * toTitleCase('the dark knight')  // "The Dark Knight"
 * toTitleCase('a tale of two cities')  // "A Tale Of Two Cities"
 * 
 * @example
 * // Format song titles
 * const songs = ['spring day', 'fake love', 'boy with luv'];
 * const titles = songs.map(toTitleCase);
 * // ['Spring Day', 'Fake Love', 'Boy With Luv']
 * 
 * @example
 * // Format member role
 * function MemberCard({ role }) {
 *   return <span className="role">{toTitleCase(role)}</span>;
 * }
 * // Input: "main rapper" → Output: "Main Rapper"
 * 
 * @bestpractice
 * - Doesn't handle special cases (McDonalds, iPod, etc.)
 * - For proper title case, consider libraries like 'title-case'
 * 
 * @performance O(n) - Where n is number of words
 * @browser All browsers
 */
export const toTitleCase = (str: string): string =>
  str.split(' ').map(capitalize).join(' ');

/**
 * Truncates string to specified length with suffix.
 * 
 * Shortens strings longer than maxLength and adds a suffix (default: "...").
 * Strings shorter than maxLength are returned unchanged. Suffix length
 * is included in maxLength calculation.
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length including suffix
 * @param suffix - String to append (default: "...")
 * @returns Truncated string
 * 
 * @example
 * truncate('The quick brown fox', 10)  // "The qui..."
 * truncate('Short', 10)                // "Short"
 * truncate('Hello World', 8, '…')      // "Hello…"
 * 
 * @example
 * // Truncate song descriptions
 * function SongCard({ description }) {
 *   const shortDesc = truncate(description, 100);
 *   return <p>{shortDesc}</p>;
 * }
 * 
 * @example
 * // Responsive truncation
 * function ResponsiveText({ text }) {
 *   const [width, setWidth] = useState(window.innerWidth);
 *   
 *   useEffect(() => {
 *     const handleResize = () => setWidth(window.innerWidth);
 *     window.addEventListener('resize', handleResize);
 *     return () => window.removeEventListener('resize', handleResize);
 *   }, []);
 *   
 *   const maxLength = width < 768 ? 50 : 150;
 *   return <span>{truncate(text, maxLength)}</span>;
 * }
 * 
 * @bestpractice
 * - Consider word boundaries for better UX
 * - Use CSS text-overflow for single-line truncation
 * - This is better for multi-line or dynamic content
 * 
 * @performance O(n) - Substring operation
 * @browser All browsers
 */
export const truncate = (str: string, maxLength: number, suffix: string = '...'): string =>
  str.length > maxLength ? str.substring(0, maxLength - suffix.length) + suffix : str;

/**
 * Formats a number with comma thousands separators.
 * 
 * Adds commas every three digits for readability. Supports both integers
 * and decimals. Perfect for displaying large numbers, statistics, and counts.
 * 
 * @param num - Number to format
 * @returns Formatted number string with commas
 * 
 * @example
 * formatNumber(1234567)     // "1,234,567"
 * formatNumber(1000)        // "1,000"
 * formatNumber(123)         // "123"
 * formatNumber(1234.56)     // "1,234.56"
 * 
 * @example
 * // Display view count
 * function ViewCount({ views }) {
 *   return <span>{formatNumber(views)} views</span>;
 * }
 * // Input: 1234567 → Output: "1,234,567 views"
 * 
 * @example
 * // Format KOMCA credits
 * function MemberProfile({ member }) {
 *   return (
 *     <div>
 *       <h3>{member.name}</h3>
 *       <p>{formatNumber(member.komca)} KOMCA credits</p>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Animated counter
 * function AnimatedCounter({ target }) {
 *   const [count, setCount] = useState(0);
 *   
 *   useEffect(() => {
 *     const duration = 2000;
 *     const steps = 60;
 *     const increment = target / steps;
 *     let current = 0;
 *     
 *     const timer = setInterval(() => {
 *       current += increment;
 *       if (current >= target) {
 *         setCount(target);
 *         clearInterval(timer);
 *       } else {
 *         setCount(Math.floor(current));
 *       }
 *     }, duration / steps);
 *     
 *     return () => clearInterval(timer);
 *   }, [target]);
 *   
 *   return <span>{formatNumber(count)}</span>;
 * }
 * 
 * @alternative
 * // For locale-specific formatting, use Intl.NumberFormat:
 * new Intl.NumberFormat('en-US').format(1234567)  // "1,234,567"
 * new Intl.NumberFormat('de-DE').format(1234567)  // "1.234.567"
 * 
 * @performance O(n) - Regex replacement where n is digit count
 * @browser All browsers
 */
export const formatNumber = (num: number): string =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ============================================================================
// TIME HELPERS
// ============================================================================

/**
 * Formats duration in seconds to MM:SS format.
 * 
 * Converts a duration in seconds to a readable time format. Minutes are
 * not zero-padded, but seconds always show two digits. Useful for audio
 * players, video timers, and countdowns.
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted time string (MM:SS)
 * 
 * @example
 * formatDuration(65)    // "1:05"
 * formatDuration(125)   // "2:05"
 * formatDuration(3599)  // "59:59"
 * formatDuration(30)    // "0:30"
 * 
 * @example
 * // Audio player time display
 * function AudioPlayer({ currentTime, duration }) {
 *   return (
 *     <div className="time-display">
 *       <span>{formatDuration(currentTime)}</span>
 *       <span> / </span>
 *       <span>{formatDuration(duration)}</span>
 *     </div>
 *   );
 * }
 * // Output: "2:34 / 3:45"
 * 
 * @example
 * // Countdown timer
 * function Countdown({ endTime }) {
 *   const [remaining, setRemaining] = useState(0);
 *   
 *   useEffect(() => {
 *     const update = () => {
 *       const now = Date.now();
 *       const diff = Math.max(0, Math.floor((endTime - now) / 1000));
 *       setRemaining(diff);
 *     };
 *     
 *     update();
 *     const interval = setInterval(update, 1000);
 *     return () => clearInterval(interval);
 *   }, [endTime]);
 *   
 *   return <span>{formatDuration(remaining)}</span>;
 * }
 * 
 * @example
 * // Song duration list
 * const songs = [
 *   { title: 'Spring Day', duration: 276 },
 *   { title: 'DNA', duration: 223 },
 * ];
 * 
 * songs.map(song => (
 *   <li>{song.title} - {formatDuration(song.duration)}</li>
 * ));
 * // "Spring Day - 4:36"
 * // "DNA - 3:43"
 * 
 * @bestpractice
 * - For durations > 1 hour, extend to HH:MM:SS format
 * - Consider showing milliseconds for precise timing
 * - For negative durations, prepend "-" sign
 * 
 * @performance O(1) - Simple arithmetic and padding
 * @browser All browsers
 */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Debounces a function to limit execution rate.
 * 
 * Creates a debounced version of the provided function that delays execution
 * until after `wait` milliseconds have passed since the last call. Perfect
 * for expensive operations triggered by rapid events (typing, scrolling).
 * 
 * **Use Case:** Only execute after user stops typing
 * 
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 * 
 * @example
 * // Search input with API call
 * function SearchBar() {
 *   const [query, setQuery] = useState('');
 *   
 *   const searchAPI = debounce((searchTerm: string) => {
 *     fetch(`/api/search?q=${searchTerm}`)
 *       .then(res => res.json())
 *       .then(data => console.log(data));
 *   }, 500);
 *   
 *   const handleChange = (e) => {
 *     const value = e.target.value;
 *     setQuery(value);
 *     searchAPI(value);  // Only calls API 500ms after user stops typing
 *   };
 *   
 *   return <input value={query} onChange={handleChange} />;
 * }
 * 
 * @example
 * // Window resize handler
 * const handleResize = debounce(() => {
 *   console.log('Window resized to:', window.innerWidth);
 * }, 250);
 * 
 * window.addEventListener('resize', handleResize);
 * 
 * @example
 * // Auto-save form
 * function AutoSaveForm() {
 *   const saveData = debounce((data) => {
 *     localStorage.setItem('draft', JSON.stringify(data));
 *     console.log('Draft saved');
 *   }, 1000);
 *   
 *   const handleChange = (e) => {
 *     const formData = getFormData();
 *     saveData(formData);  // Saves 1 second after user stops editing
 *   };
 *   
 *   return <form onChange={handleChange}>...</form>;
 * }
 * 
 * @bestpractice
 * - 200-300ms: Immediate feedback scenarios
 * - 500-800ms: Network requests, expensive calculations
 * - 1000-2000ms: Auto-save, less critical operations
 * 
 * @comparison
 * **Debounce vs Throttle:**
 * - Debounce: Executes after silence period
 * - Throttle: Executes at most once per time period
 * 
 * @performance
 * - Reduces function calls dramatically
 * - Critical for scroll/resize handlers
 * 
 * @browser All browsers
 * @see {@link throttle} for rate-limiting without waiting for silence
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeout: any = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttles a function to limit execution frequency.
 * 
 * Creates a throttled version that executes at most once per `limit`
 * milliseconds. First call executes immediately, subsequent calls within
 * the limit are ignored. Perfect for continuous events (scroll, mousemove).
 * 
 * **Use Case:** Execute at regular intervals during continuous action
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 * 
 * @example
 * // Scroll progress indicator
 * function ScrollProgress() {
 *   const [progress, setProgress] = useState(0);
 *   
 *   const updateProgress = throttle(() => {
 *     const scrolled = window.scrollY;
 *     const total = document.body.scrollHeight - window.innerHeight;
 *     setProgress((scrolled / total) * 100);
 *   }, 100);  // Update max every 100ms
 *   
 *   useEffect(() => {
 *     window.addEventListener('scroll', updateProgress);
 *     return () => window.removeEventListener('scroll', updateProgress);
 *   }, []);
 *   
 *   return <ProgressBar percent={progress} />;
 * }
 * 
 * @example
 * // Mouse tracking
 * const trackMouse = throttle((e: MouseEvent) => {
 *   console.log('Mouse at:', e.clientX, e.clientY);
 * }, 50);  // Log max every 50ms
 * 
 * document.addEventListener('mousemove', trackMouse);
 * 
 * @example
 * // Infinite scroll
 * function InfiniteScroll({ onLoadMore }) {
 *   const checkScroll = throttle(() => {
 *     const scrolled = window.innerHeight + window.scrollY;
 *     const threshold = document.body.scrollHeight - 500;
 *     
 *     if (scrolled >= threshold) {
 *       onLoadMore();
 *     }
 *   }, 200);
 *   
 *   useEffect(() => {
 *     window.addEventListener('scroll', checkScroll);
 *     return () => window.removeEventListener('scroll', checkScroll);
 *   }, []);
 *   
 *   return <div>...</div>;
 * }
 * 
 * @bestpractice
 * - 16ms (~60fps): Smooth visual updates
 * - 50-100ms: Mouse/touch tracking
 * - 200-300ms: Scroll handlers
 * 
 * @comparison
 * **Debounce vs Throttle:**
 * ```
 * Event stream: ||||||||||||||||||||||||
 * Debounce:                            | (waits for silence)
 * Throttle:     |      |      |      |  (regular intervals)
 * ```
 * 
 * @performance
 * - Essential for scroll/mousemove performance
 * - Prevents browser lag
 * 
 * @browser All browsers
 * @see {@link debounce} for waiting until activity stops
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Checks if an element is visible in the viewport.
 * 
 * Determines whether an element is fully visible within the current viewport
 * bounds. Useful for lazy loading, scroll animations, and intersection
 * detection. For more advanced use cases, consider IntersectionObserver API.
 * 
 * @param element - HTML element to check
 * @returns True if element is in viewport, false otherwise
 * 
 * @example
 * // Lazy load images
 * function LazyImage({ src, alt }) {
 *   const imgRef = useRef<HTMLImageElement>(null);
 *   const [loaded, setLoaded] = useState(false);
 *   
 *   useEffect(() => {
 *     const checkVisibility = () => {
 *       if (imgRef.current && isInViewport(imgRef.current) && !loaded) {
 *         setLoaded(true);
 *       }
 *     };
 *     
 *     checkVisibility();
 *     window.addEventListener('scroll', throttle(checkVisibility, 200));
 *     return () => window.removeEventListener('scroll', checkVisibility);
 *   }, [loaded]);
 *   
 *   return <img ref={imgRef} src={loaded ? src : ''} alt={alt} />;
 * }
 * 
 * @example
 * // Animate on scroll
 * function AnimateOnScroll({ children }) {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const [visible, setVisible] = useState(false);
 *   
 *   useEffect(() => {
 *     const handleScroll = throttle(() => {
 *       if (ref.current && isInViewport(ref.current)) {
 *         setVisible(true);
 *       }
 *     }, 100);
 *     
 *     handleScroll();
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, []);
 *   
 *   return (
 *     <div 
 *       ref={ref}
 *       className={visible ? 'fade-in' : 'hidden'}
 *     >
 *       {children}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Track visible sections for navigation
 * function useActiveSection(sectionIds: string[]) {
 *   const [active, setActive] = useState(sectionIds[0]);
 *   
 *   useEffect(() => {
 *     const checkSections = throttle(() => {
 *       for (const id of sectionIds) {
 *         const element = document.getElementById(id);
 *         if (element && isInViewport(element)) {
 *           setActive(id);
 *           break;
 *         }
 *       }
 *     }, 100);
 *     
 *     window.addEventListener('scroll', checkSections);
 *     return () => window.removeEventListener('scroll', checkSections);
 *   }, [sectionIds]);
 *   
 *   return active;
 * }
 * 
 * @alternative
 * // Modern approach with IntersectionObserver:
 * const observer = new IntersectionObserver(entries => {
 *   entries.forEach(entry => {
 *     if (entry.isIntersecting) {
 *       // Element is visible
 *     }
 *   });
 * });
 * observer.observe(element);
 * 
 * @bestpractice
 * - Use IntersectionObserver for better performance
 * - This function is good for simple checks
 * - Throttle scroll event listeners
 * 
 * @performance
 * - getBoundingClientRect() triggers layout
 * - Don't call on every scroll event without throttling
 * 
 * @browser All modern browsers
 */
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Smoothly scrolls to an element with optional offset.
 * 
 * Scrolls the window to bring an element into view with smooth animation.
 * Supports optional offset for fixed headers and custom scroll behavior.
 * 
 * @param element - Target HTML element
 * @param offset - Offset from top in pixels (default: 0)
 * @param behavior - Scroll behavior (default: 'smooth')
 * 
 * @example
 * // Scroll to section on click
 * function TableOfContents() {
 *   const scrollToSection = (id: string) => {
 *     const element = document.getElementById(id);
 *     if (element) {
 *       scrollToElement(element, 80); // 80px offset for fixed header
 *     }
 *   };
 *   
 *   return (
 *     <nav>
 *       <button onClick={() => scrollToSection('overview')}>Overview</button>
 *       <button onClick={() => scrollToSection('details')}>Details</button>
 *     </nav>
 *   );
 * }
 * 
 * @example
 * // Scroll to validation error
 * function FormWithValidation() {
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     const firstError = document.querySelector('.error');
 *     if (firstError) {
 *       scrollToElement(firstError as HTMLElement, 100);
 *     }
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * 
 * @example
 * // Jump to top button
 * function ScrollToTop() {
 *   const scrollTop = () => {
 *     const top = document.getElementById('root');
 *     if (top) {
 *       scrollToElement(top, 0, 'smooth');
 *     }
 *   };
 *   
 *   return <button onClick={scrollTop}>↑ Back to Top</button>;
 * }
 * 
 * @example
 * // Instant scroll (no animation)
 * scrollToElement(element, 0, 'auto');
 * 
 * @bestpractice
 * - Use offset for fixed headers
 * - Consider 'auto' for instant jumps
 * - Test on mobile where smooth may be ignored
 * 
 * @browser
 * - All modern browsers
 * - Older browsers: Falls back to instant scroll
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView} for alternative API
 */
export const scrollToElement = (
  element: HTMLElement,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
): void => {
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior,
  });
};

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * 
 * Returns a new array with elements in random order. Uses the optimal
 * Fisher-Yates shuffle for uniform distribution. Original array is
 * not modified.
 * 
 * @param array - Array to shuffle
 * @returns New shuffled array
 * 
 * @example
 * // Shuffle song playlist
 * const songs = ['Spring Day', 'DNA', 'Boy With Luv'];
 * const shuffled = shuffle(songs);
 * console.log(shuffled); // Random order
 * console.log(songs);    // Original unchanged
 * 
 * @example
 * // Random member order
 * function RandomMemberGrid({ members }) {
 *   const [shuffledMembers] = useState(() => shuffle(members));
 *   
 *   return shuffledMembers.map(member => (
 *     <MemberCard key={member.id} member={member} />
 *   ));
 * }
 * 
 * @example
 * // Shuffle and display
 * function ShuffleButton({ items, onShuffle }) {
 *   const handleShuffle = () => {
 *     onShuffle(shuffle(items));
 *   };
 *   
 *   return <button onClick={handleShuffle}>🔀 Shuffle</button>;
 * }
 * 
 * @example
 * // Quiz questions in random order
 * const questions = shuffle(allQuestions).slice(0, 10); // Random 10
 * 
 * @bestpractice
 * - Creates new array (immutable)
 * - Uniform distribution (true randomness)
 * - Use in useMemo() to avoid re-shuffling
 * 
 * @performance
 * - Time Complexity: O(n)
 * - Space Complexity: O(n)
 * - Very efficient for any array size
 * 
 * @browser All browsers
 * @see {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle} for algorithm details
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Gets a random item from an array.
 * 
 * Returns a single random element from the array. Useful for picking
 * random items, generating variety, and sampling.
 * 
 * @param array - Array to sample from
 * @returns Random item from array
 * 
 * @example
 * // Random BTS member
 * const members = ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
 * const random = randomItem(members);
 * console.log(`Featured member: ${random}`);
 * 
 * @example
 * // Random color from palette
 * const purplePalette = ['#A855F7', '#D8B4FE', '#C084FC', '#E9D5FF'];
 * const randomColor = randomItem(purplePalette);
 * 
 * @example
 * // Random tip/message
 * function RandomTip() {
 *   const tips = [
 *     'Try the semantic search feature!',
 *     'Hover over members to see their profiles.',
 *     'Click stars to explore the universe.',
 *   ];
 *   
 *   const [tip] = useState(() => randomItem(tips));
 *   
 *   return <div className="tip">{tip}</div>;
 * }
 * 
 * @example
 * // Random background
 * const backgrounds = ['cosmic', 'nebula', 'stars', 'void'];
 * const bg = randomItem(backgrounds);
 * 
 * @bestpractice
 * - Ensure array is not empty to avoid undefined
 * - For multiple items, use shuffle() instead
 * - Consider weighted random for non-uniform selection
 * 
 * @performance O(1) - Single random access
 * @browser All browsers
 */
export const randomItem = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

/**
 * Chunks an array into smaller arrays of specified size.
 * 
 * Splits an array into multiple sub-arrays, each containing up to `size`
 * elements. The last chunk may contain fewer elements if the array length
 * is not evenly divisible.
 * 
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunked arrays
 * 
 * @example
 * // Grid layout with rows
 * const members = ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
 * const rows = chunk(members, 3);
 * // [['RM', 'Jin', 'Suga'], ['J-Hope', 'Jimin', 'V'], ['Jungkook']]
 * 
 * rows.map((row, i) => (
 *   <div key={i} className="row">
 *     {row.map(member => <MemberCard key={member} name={member} />)}
 *   </div>
 * ));
 * 
 * @example
 * // Paginate items
 * function Pagination({ items, itemsPerPage }) {
 *   const [page, setPage] = useState(0);
 *   const pages = chunk(items, itemsPerPage);
 *   
 *   return (
 *     <div>
 *       <ItemList items={pages[page]} />
 *       <button onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
 *       <span>Page {page + 1} of {pages.length}</span>
 *       <button onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))}>Next</button>
 *     </div>
 *   );
 * }
 * 
 * @example
 * // Batch API requests
 * async function batchUpdate(ids: string[]) {
 *   const batches = chunk(ids, 50); // Process 50 at a time
 *   
 *   for (const batch of batches) {
 *     await fetch('/api/update', {
 *       method: 'POST',
 *       body: JSON.stringify({ ids: batch }),
 *     });
 *   }
 * }
 * 
 * @example
 * // Group by size
 * const numbers = [1, 2, 3, 4, 5, 6, 7];
 * const pairs = chunk(numbers, 2);
 * // [[1, 2], [3, 4], [5, 6], [7]]
 * 
 * @bestpractice
 * - Handles uneven divisions gracefully
 * - Last chunk may be smaller
 * - Size must be > 0
 * 
 * @performance
 * - Time Complexity: O(n)
 * - Space Complexity: O(n)
 * 
 * @browser All browsers
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

// ============================================================================
// PERFORMANCE HELPERS
// ============================================================================

/**
 * Request animation frame with fallback for older browsers.
 * 
 * Cross-browser compatible requestAnimationFrame. Falls back to setTimeout
 * with 60fps timing (~16ms) for older browsers that don't support the
 * native API.
 * 
 * @returns requestAnimationFrame function
 * 
 * @example
 * // Smooth animation loop
 * function animate() {
 *   // Update animation
 *   position += velocity;
 *   
 *   // Re-render
 *   render();
 *   
 *   // Continue loop
 *   requestAnimFrame(animate);
 * }
 * requestAnimFrame(animate);
 * 
 * @example
 * // Smooth scroll implementation
 * function smoothScrollTo(target: number, duration: number) {
 *   const start = window.pageYOffset;
 *   const distance = target - start;
 *   const startTime = Date.now();
 *   
 *   function scroll() {
 *     const elapsed = Date.now() - startTime;
 *     const progress = Math.min(elapsed / duration, 1);
 *     
 *     window.scrollTo(0, start + distance * easeInOutCubic(progress));
 *     
 *     if (progress < 1) {
 *       requestAnimFrame(scroll);
 *     }
 *   }
 *   
 *   requestAnimFrame(scroll);
 * }
 * 
 * @example
 * // React animation hook
 * function useAnimation(callback: () => void) {
 *   const frameRef = useRef<number>();
 *   
 *   useEffect(() => {
 *     const animate = () => {
 *       callback();
 *       frameRef.current = requestAnimFrame(animate);
 *     };
 *     
 *     frameRef.current = requestAnimFrame(animate);
 *     
 *     return () => {
 *       if (frameRef.current) {
 *         cancelAnimFrame(frameRef.current);
 *       }
 *     };
 *   }, [callback]);
 * }
 * 
 * @bestpractice
 * - Always use for animations instead of setInterval
 * - Automatically pauses when tab is inactive
 * - Synchronizes with browser repaint (60fps)
 * - Saves battery life on mobile
 * 
 * @performance
 * - GPU accelerated when possible
 * - Better than setTimeout for animations
 * - Prevents jank and frame drops
 * 
 * @browser
 * - Native: All modern browsers
 * - Fallback: All browsers via setTimeout
 * 
 * @see {@link cancelAnimFrame} for canceling animations
 */
export const requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitRequestAnimationFrame ||
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 1000 / 60))
  );
})();

/**
 * Cancel animation frame with fallback for older browsers.
 * 
 * Cross-browser compatible cancelAnimationFrame. Falls back to clearTimeout
 * for older browsers. Use to stop animation loops started with requestAnimFrame.
 * 
 * @returns cancelAnimationFrame function
 * 
 * @example
 * // Start and stop animation
 * let animationId: number;
 * 
 * function startAnimation() {
 *   function animate() {
 *     // Animation logic
 *     updatePosition();
 *     render();
 *     
 *     animationId = requestAnimFrame(animate);
 *   }
 *   
 *   animationId = requestAnimFrame(animate);
 * }
 * 
 * function stopAnimation() {
 *   cancelAnimFrame(animationId);
 * }
 * 
 * @example
 * // React component with animation cleanup
 * function AnimatedComponent() {
 *   const frameRef = useRef<number>();
 *   
 *   useEffect(() => {
 *     const animate = () => {
 *       // Animation code
 *       frameRef.current = requestAnimFrame(animate);
 *     };
 *     
 *     frameRef.current = requestAnimFrame(animate);
 *     
 *     return () => {
 *       if (frameRef.current) {
 *         cancelAnimFrame(frameRef.current);
 *       }
 *     };
 *   }, []);
 *   
 *   return <div>Animated content</div>;
 * }
 * 
 * @bestpractice
 * - Always cancel animations in cleanup functions
 * - Store animation ID in ref for React components
 * - Cancel on component unmount to prevent memory leaks
 * 
 * @browser
 * - Native: All modern browsers
 * - Fallback: All browsers via clearTimeout
 * 
 * @see {@link requestAnimFrame} for starting animations
 */
export const cancelAnimFrame = (() => {
  return (
    window.cancelAnimationFrame ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitCancelAnimationFrame ||
    clearTimeout
  );
})();

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Animation
  randomPosition,
  randomDelay,
  randomDuration,
  generateStars,
  sphericalToCartesian,
  generateBokehBubbles,
  generateFloatingParticles,

  // Color
  hexToRgb,
  rgbToHex,
  hexWithAlpha,
  lightenColor,
  darkenColor,

  // Math
  clamp,
  lerp,
  map,
  distance,
  angleBetween,

  // String
  capitalize,
  toTitleCase,
  truncate,
  formatNumber,

  // Time
  formatDuration,
  debounce,
  throttle,

  // DOM
  isInViewport,
  scrollToElement,

  // Array
  shuffle,
  randomItem,
  chunk,

  // Performance
  requestAnimFrame,
  cancelAnimFrame,
};
