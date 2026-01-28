/**
 * BTS Neural Archive - Animation Utilities
 * 
 * Reusable animation helpers and generators for creating the cosmic universe
 * experience. These utilities handle 3D positioning, particle generation,
 * and mathematical transformations for the immersive BTS visualization.
 * 
 * @module utils/animations
 * @see {@link ../types.ts} for type definitions
 */

import type { FloatingParticle, BokehBubble, Star } from '../types';

// ============================================================================
// PARTICLE GENERATION
// ============================================================================

/**
 * Generates random particle properties for floating animations.
 * 
 * Creates an array of particle configurations with randomized positions,
 * delays, durations, and sizes. These particles create the ambient "cosmic dust"
 * effect throughout the BTS Neural Archive interface.
 * 
 * **Visual Representation:**
 * ```
 *     ·  Viewport (100% x 100%)   ·
 *     ┌─────────────────────────┐
 *     │  •      ·         •     │  Each particle:
 *     │     ·        •    ·     │  - Random position
 *     │ •      •         ·   •  │  - Random delay (0-5s)
 *     │    ·        •      ·    │  - Random duration (10-20s)
 *     │  •     ·     •         │  - Random size (1-4px)
 *     └─────────────────────────┘
 * ```
 * 
 * **Animation Pattern:**
 * - Particles float from bottom-left to top-right
 * - Each has unique timing for organic movement
 * - Opacity fades in/out during animation
 * - Creates depth through size variation
 * 
 * @param count - Number of particles to generate (recommended: 20-50)
 * @returns Array of particle configuration objects
 * 
 * @example
 * // Generate 30 floating particles for background ambience
 * const particles = generateParticles(30);
 * 
 * particles.forEach((particle, i) => (
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
 * // Performance considerations
 * // For slower devices, reduce particle count:
 * const isMobile = window.innerWidth < 768;
 * const particleCount = isMobile ? 15 : 40;
 * const particles = generateParticles(particleCount);
 * 
 * @performance
 * - Time Complexity: O(n) where n is count
 * - Space Complexity: O(n)
 * - Uses CSS animations (GPU accelerated)
 * - Recommended max: 50 particles for 60fps
 */
export function generateParticles(count: number): FloatingParticle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: Math.random() * 3 + 1,
  }));
}

// ============================================================================
// BOKEH LIGHT GENERATION
// ============================================================================

/**
 * Generates bokeh light properties for the "Purple Ocean" effect.
 * 
 * Creates soft, out-of-focus light orbs that float and pulse in the background,
 * simulating the photographic bokeh effect. These lights create the signature
 * BTS "Borahae" (보라해) purple atmosphere.
 * 
 * **Visual Representation:**
 * ```
 *     Purple Ocean Effect
 *     ┌─────────────────────────┐
 *     │   ◉           ○         │  ◉ = Large bokeh (200-300px)
 *     │      ○    ◉         ○   │  ○ = Medium bokeh (150-200px)
 *     │ ○         ○      ◉      │  · = Small bokeh (100-150px)
 *     │    ◉   ○      ○     ·   │
 *     │       ·    ◉    ○       │  Opacity: 0.1-0.3
 *     └─────────────────────────┘  Blur: 40-80px
 * ```
 * 
 * **Bokeh Characteristics:**
 * - Size: 100-300px diameter
 * - Duration: 20-40 seconds per cycle
 * - Delay: 0-10 seconds stagger
 * - Color: Purple (#A855F7) with low opacity
 * - Effect: Soft blur creates depth of field
 * 
 * @param count - Number of bokeh lights (recommended: 8-15)
 * @returns Array of bokeh configuration objects
 * 
 * @example
 * // Create purple ocean bokeh effect
 * const bokehLights = generateBokehLights(12);
 * 
 * bokehLights.map((bokeh, i) => (
 *   <div
 *     key={i}
 *     className="bokeh-bubble"
 *     style={{
 *       left: bokeh.left,
 *       top: bokeh.top,
 *       width: `${bokeh.size}px`,
 *       height: `${bokeh.size}px`,
 *       animationDelay: `${bokeh.delay}s`,
 *       animationDuration: `${bokeh.duration}s`,
 *       background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
 *       filter: 'blur(60px)',
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
 * const lights = generateBokehLights(getBokehCount());
 * 
 * @performance
 * - Time Complexity: O(n)
 * - Large blur radius = GPU intensive
 * - Recommended max: 15 lights for smooth performance
 * - Consider reducing on lower-end devices
 * 
 * @see {@link https://en.wikipedia.org/wiki/Bokeh} for bokeh photography effect
 */
export function generateBokehLights(count: number): BokehBubble[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 200 + 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));
}

// ============================================================================
// 3D STAR FIELD GENERATION
// ============================================================================

/**
 * Generates 3D star positions for the cosmic universe background.
 * 
 * Creates a spherical star field using spherical coordinates (θ, φ, r).
 * Stars are distributed uniformly across a sphere, creating a realistic
 * "looking into deep space" effect. This is the foundation of the
 * BTS Neural Archive's 3D cosmic environment.
 * 
 * **Spherical Coordinate System:**
 * ```
 *                    Z-axis (φ = 0°)
 *                      ↑
 *                      |
 *                      |
 *                      * Star(θ, φ, r)
 *                     /|
 *                    / |
 *                   /  |
 *                  /   |
 *                 /    |
 *                /     |
 *               /      |
 *              /       |
 *     ────────●────────┼──────→ X-axis (θ = 0°, φ = 90°)
 *            Origin    |
 *                      |
 *                      ↓
 *                    Y-axis
 * 
 * Where:
 * - θ (theta) = azimuthal angle (0 to 2π) - rotation around Z-axis
 * - φ (phi) = polar angle (0 to π) - angle from Z-axis
 * - r = radius (300-1300px) - distance from origin
 * ```
 * 
 * **Why Spherical Coordinates?**
 * 
 * Using spherical coordinates ensures uniform distribution across the sphere's
 * surface. Random Cartesian (x,y,z) would create clustering at corners!
 * 
 * ```
 * Uniform Distribution (Spherical)    vs    Clustered (Random Cartesian)
 *         · · · ·                                  ·   ·
 *       ·   · ·   ·                              ·   · · ·
 *      · · · * · · ·                            · · · * · ·
 *       ·   · ·   ·                              ·  · · · 
 *         · · · ·                                  ·   ·
 * ```
 * 
 * **Star Distribution:**
 * - Radius: 300-1300px (creates depth layers)
 * - Size: 0.5-3px (smaller = further away)
 * - Colors: White (8.3%) + Purple spectrum (91.7%)
 * - White stars: Every 12th star (i % 12 === 0)
 * - Purple stars: Random from color palette
 * 
 * **Mathematical Formula:**
 * ```
 * For uniform sphere distribution:
 * θ = random(0, 2π)              // Full rotation
 * φ = arccos(random(-1, 1))      // Uniform latitude (not random(0, π)!)
 * r = random(rMin, rMax)         // Depth variation
 * 
 * Note: φ uses arccos(random(-1,1)) not random(0,π) to avoid
 * pole clustering. This ensures equal area distribution.
 * ```
 * 
 * @param count - Number of stars to generate (recommended: 500-1000)
 * @param colors - Array of color hex codes for star palette
 * @returns Array of star configuration objects with spherical coordinates
 * 
 * @example
 * // Generate 800 stars with BTS purple color palette
 * const purplePalette = ['#A855F7', '#D8B4FE', '#818CF8', '#C084FC', '#E9D5FF'];
 * const stars = generateStars(800, purplePalette);
 * 
 * stars.forEach((star, i) => {
 *   const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
 *   const perspective = 500; // Camera distance
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
 * // Performance optimization for different devices
 * const getStarCount = () => {
 *   const gpu = detectGPU(); // Hypothetical GPU detection
 *   if (gpu === 'low') return 300;
 *   if (gpu === 'medium') return 600;
 *   return 1000;
 * };
 * 
 * @example
 * // Layered star field with depth
 * const nearStars = generateStars(200, colors); // r: 300-500
 * const midStars = generateStars(400, colors);  // r: 500-900
 * const farStars = generateStars(200, colors);  // r: 900-1300
 * 
 * @performance
 * - Time Complexity: O(n)
 * - Space Complexity: O(n)
 * - Trigonometric operations: 2 per star (Math.random, Math.acos)
 * - Recommended: 500-1000 stars for balance of density and performance
 * - GPU accelerated when using CSS transforms
 * - Consider reducing on mobile devices
 * 
 * @see {@link sphericalToCartesian} to convert coordinates to Cartesian (x,y,z)
 * @see {@link https://mathworld.wolfram.com/SpherePointPicking.html} for distribution math
 */
export function generateStars(count: number, colors: string[]): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    theta: Math.random() * 2 * Math.PI,
    phi: Math.acos(Math.random() * 2 - 1),
    r: 300 + Math.random() * 1000,
    size: Math.random() * 2.5 + 0.5,
    color: i % 12 === 0 ? '#ffffff' : colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
  }));
}

// ============================================================================
// COORDINATE TRANSFORMATIONS
// ============================================================================

/**
 * Converts spherical coordinates to 3D Cartesian coordinates.
 * 
 * Transforms from spherical (θ, φ, r) to Cartesian (x, y, z) coordinate system.
 * This is essential for rendering 3D star positions in 2D space with perspective.
 * 
 * **Coordinate System Transformation:**
 * ```
 * Spherical (θ, φ, r)  →  Cartesian (x, y, z)
 * 
 *     Z                           Z
 *     ↑                           ↑
 *     |                           |    P(x,y,z)
 *     |  * P                      |   *
 *     | /|                        |  /|
 *     |/ |r                       | / |z
 *     /  |                        |/  |
 *    / φ |                        *───┼──→ X
 *   /────┼──→ X                  /    |
 *  θ     |                      /y    |
 *        ↓                     ↓      ↓
 *        Y                     Y
 * 
 * Spherical:              Cartesian:
 * θ = azimuth (0-2π)      x = r·sin(φ)·cos(θ)
 * φ = polar (0-π)         y = r·sin(φ)·sin(θ)
 * r = radius              z = r·cos(φ)
 * ```
 * 
 * **Mathematical Formulas:**
 * ```
 * x = r × sin(φ) × cos(θ)
 * y = r × sin(φ) × sin(θ)
 * z = r × cos(φ)
 * 
 * Where:
 * - sin(φ) projects onto XY plane
 * - cos(θ) and sin(θ) determine XY position
 * - cos(φ) determines Z height
 * ```
 * 
 * **Example Values:**
 * ```
 * Input: θ=0°, φ=90°, r=100    Output: x=100, y=0, z=0     (positive X-axis)
 * Input: θ=90°, φ=90°, r=100   Output: x=0, y=100, z=0     (positive Y-axis)
 * Input: θ=0°, φ=0°, r=100     Output: x=0, y=0, z=100     (positive Z-axis)
 * Input: θ=45°, φ=45°, r=100   Output: x≈50, y≈50, z≈71   (diagonal)
 * ```
 * 
 * **Conversion Steps:**
 * 1. Calculate projection onto XY plane: `ρ = r × sin(φ)`
 * 2. Calculate X component: `x = ρ × cos(θ)`
 * 3. Calculate Y component: `y = ρ × sin(θ)`
 * 4. Calculate Z component: `z = r × cos(φ)`
 * 
 * @param theta - Azimuthal angle in radians (0 to 2π)
 * @param phi - Polar angle in radians (0 to π)
 * @param r - Radius/distance from origin
 * @returns Object containing Cartesian coordinates {x, y, z}
 * 
 * @example
 * // Convert a star's spherical coordinates to Cartesian
 * const star = { theta: Math.PI / 4, phi: Math.PI / 3, r: 500 };
 * const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
 * console.log({ x, y, z }); // { x: 216.5, y: 216.5, z: 250 }
 * 
 * @example
 * // Apply perspective projection for 2D rendering
 * const stars = generateStars(100, ['#A855F7']);
 * stars.forEach(star => {
 *   const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
 *   
 *   // Perspective projection
 *   const focalLength = 500;
 *   const scale = focalLength / (focalLength + z);
 *   
 *   // Project to screen coordinates (centered)
 *   const screenX = 50 + (x * scale / 10); // Percentage from center
 *   const screenY = 50 + (y * scale / 10);
 *   
 *   // Size diminishes with distance
 *   const screenSize = star.size * scale;
 *   
 *   return { screenX, screenY, screenSize, scale };
 * });
 * 
 * @example
 * // Rotate star field around Y-axis
 * function rotateStarField(stars: Star[], angle: number) {
 *   return stars.map(star => {
 *     let { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
 *     
 *     // Rotate around Y-axis
 *     const newX = x * Math.cos(angle) - z * Math.sin(angle);
 *     const newZ = x * Math.sin(angle) + z * Math.cos(angle);
 *     
 *     return { x: newX, y, z: newZ };
 *   });
 * }
 * 
 * @performance
 * - Time Complexity: O(1) - constant time
 * - Trigonometric operations: 4 (sin, cos × 2, sin again)
 * - Modern browsers optimize Math.sin/cos well
 * - Consider caching for frequently accessed stars
 * - Can be vectorized for batch processing
 * 
 * @see {@link generateStars} for creating spherical star coordinates
 * @see {@link https://en.wikipedia.org/wiki/Spherical_coordinate_system} for coordinate systems
 */
export function sphericalToCartesian(
  theta: number,
  phi: number,
  r: number
): { x: number; y: number; z: number } {
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

// ============================================================================
// ORBITAL POSITIONING
// ============================================================================

/**
 * Calculates orbital position for the BTS member constellation.
 * 
 * Arranges 7 BTS members in a perfect circle around a center point, like
 * planets orbiting a star or a constellation formation. Each member gets an
 * equal slice of the circle (360° / 7 = ~51.43° apart).
 * 
 * **Visual Representation - 7 Member Circle:**
 * ```
 *                 RM (0°)
 *                   ↑
 *                   *
 *                  /|\
 *                 / | \
 *             Jin*  |  *V
 *             ↖    |    ↗
 *                 \|/
 *         Suga* ←──●──→ * Jungkook
 *                 /|\
 *                / | \
 *             J-Hope  *Jimin
 *                ↙     ↘
 * 
 * Center (●) = Origin (0, 0)
 * Distance = 100px (configurable)
 * Angle = index × (360° / 7)
 * ```
 * 
 * **Mathematical Formula:**
 * ```
 * For member at index i in a circle of n members:
 * 
 * angle = (i / n) × 2π radians
 * x = cos(angle) × distance
 * y = sin(angle) × distance
 * 
 * Example for 7 members:
 * Member 0 (RM):       angle = 0°      → x = 100,  y = 0
 * Member 1 (Jin):      angle = 51.43°  → x = 62.3, y = 78.2
 * Member 2 (Suga):     angle = 102.86° → x = -22.3, y = 97.5
 * Member 3 (J-Hope):   angle = 154.29° → x = -90.1, y = 43.4
 * Member 4 (Jimin):    angle = 205.71° → x = -90.1, y = -43.4
 * Member 5 (V):        angle = 257.14° → x = -22.3, y = -97.5
 * Member 6 (Jungkook): angle = 308.57° → x = 62.3, y = -78.2
 * ```
 * 
 * **Starting Position:**
 * - Index 0 starts at 0° (rightmost position: 3 o'clock)
 * - Rotation is counter-clockwise (mathematical convention)
 * - To start at top (12 o'clock), offset by -90° (π/2 radians)
 * 
 * **Rotation Direction:**
 * ```
 * Counter-clockwise (default):        Clockwise (negate angle):
 *        0°                                   0°
 *        ↑                                    ↑
 *    1 * 0                                0 * 6
 *  2 *   * 6                            1 *   * 5
 *    3 * 4                                2 * 4
 *                                           3
 * ```
 * 
 * @param index - Member index in the array (0-based)
 * @param totalMembers - Total number of members to arrange (default: 7 for BTS)
 * @param distance - Distance from center in pixels (default: 100)
 * @returns Object with x, y coordinates and angle in radians
 * 
 * @example
 * // Position 7 BTS members in a circle
 * const members = ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
 * 
 * members.map((name, index) => {
 *   const { x, y, angle } = calculateOrbitalPosition(index, 7, 150);
 *   
 *   return (
 *     <div
 *       key={name}
 *       className="member-constellation"
 *       style={{
 *         transform: `translate(${x}px, ${y}px)`,
 *         '--rotation': `${angle}rad`,
 *       }}
 *     >
 *       <MemberProfile name={name} />
 *     </div>
 *   );
 * });
 * 
 * @example
 * // Start from top (12 o'clock) instead of right
 * function calculateOrbitalPositionTop(
 *   index: number,
 *   totalMembers: number = 7,
 *   distance: number = 100
 * ) {
 *   const angleOffset = -Math.PI / 2; // -90 degrees
 *   const angle = (index / totalMembers) * Math.PI * 2 + angleOffset;
 *   
 *   return {
 *     x: Math.cos(angle) * distance,
 *     y: Math.sin(angle) * distance,
 *     angle,
 *   };
 * }
 * 
 * @example
 * // Animate members rotating around center
 * function AnimatedConstellation() {
 *   const [rotation, setRotation] = useState(0);
 *   
 *   useEffect(() => {
 *     const interval = setInterval(() => {
 *       setRotation(r => (r + 0.01) % (Math.PI * 2));
 *     }, 16); // 60fps
 *     return () => clearInterval(interval);
 *   }, []);
 *   
 *   return members.map((name, index) => {
 *     const { x, y } = calculateOrbitalPosition(index, 7, 150);
 *     const cos = Math.cos(rotation);
 *     const sin = Math.sin(rotation);
 *     
 *     // Rotate point around origin
 *     const rotatedX = x * cos - y * sin;
 *     const rotatedY = x * sin + y * cos;
 *     
 *     return <Member x={rotatedX} y={rotatedY} />;
 *   });
 * }
 * 
 * @example
 * // Responsive sizing
 * const useResponsiveDistance = () => {
 *   const [distance, setDistance] = useState(100);
 *   
 *   useEffect(() => {
 *     const updateDistance = () => {
 *       const width = window.innerWidth;
 *       setDistance(width < 768 ? 80 : width < 1024 ? 120 : 150);
 *     };
 *     updateDistance();
 *     window.addEventListener('resize', updateDistance);
 *     return () => window.removeEventListener('resize', updateDistance);
 *   }, []);
 *   
 *   return distance;
 * };
 * 
 * @performance
 * - Time Complexity: O(1) - constant time calculation
 * - Trigonometric operations: 2 (cos, sin)
 * - Can be pre-calculated for static layouts
 * - Cache results if positions don't change
 * - Very lightweight, suitable for animations
 * 
 * @see {@link https://en.wikipedia.org/wiki/Circular_orbit} for orbital mechanics
 */
export function calculateOrbitalPosition(
  index: number,
  totalMembers: number = 7,
  distance: number = 100
): { x: number; y: number; angle: number } {
  const angle = (index / totalMembers) * Math.PI * 2;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    angle,
  };
}

// ============================================================================
// ANIMATION TIMING UTILITIES
// ============================================================================

/**
 * Generates a staggered delay for sequential animations.
 * 
 * Creates a CSS animation delay string for staggering element appearances.
 * Useful for revealing lists, grids, or constellations one item at a time
 * with a cascading effect.
 * 
 * **Visual Timeline:**
 * ```
 * Element 0: |▓▓▓▓▓▓| (starts at 0ms)
 * Element 1:   |▓▓▓▓▓▓| (starts at 100ms)
 * Element 2:     |▓▓▓▓▓▓| (starts at 200ms)
 * Element 3:       |▓▓▓▓▓▓| (starts at 300ms)
 * 
 * Base delay = 0ms
 * Increment = 100ms
 * ```
 * 
 * @param index - Element index in sequence (0-based)
 * @param baseDelay - Starting delay in milliseconds (default: 0)
 * @param increment - Delay increment per index in milliseconds (default: 100)
 * @returns CSS delay string (e.g., "300ms")
 * 
 * @example
 * // Stagger member constellation reveals
 * members.map((member, i) => (
 *   <div
 *     key={i}
 *     style={{
 *       animationDelay: getStaggerDelay(i, 500, 150),
 *       animation: 'fadeIn 0.6s ease-out forwards',
 *     }}
 *   >
 *     {member.name}
 *   </div>
 * ));
 * // Result: Member 0 at 500ms, Member 1 at 650ms, Member 2 at 800ms...
 * 
 * @example
 * // Fast reveal for many items
 * const quickStagger = (i: number) => getStaggerDelay(i, 0, 50);
 * 
 * @example
 * // Reverse order reveal (start from last)
 * const reverseDelay = (i: number, total: number) =>
 *   getStaggerDelay(total - 1 - i, 0, 100);
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  increment: number = 100
): string {
  return `${baseDelay + index * increment}ms`;
}

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/**
 * Cubic ease-in-out easing function for smooth animations.
 * 
 * Creates smooth acceleration and deceleration, making animations feel natural.
 * Accelerates quickly at the start, maintains speed in the middle, and
 * decelerates smoothly at the end.
 * 
 * **Easing Curve Visualization:**
 * ```
 * Output (y)
 *   1.0 ┤                    ╭──────
 *       │                  ╭─╯
 *   0.75┤                ╭─╯
 *       │              ╭─╯
 *   0.5 ┤            ╭─╯            ← Inflection point
 *       │          ╭─╯
 *   0.25┤        ╭─╯
 *       │      ╭─╯
 *   0.0 ┤──────╯
 *       └─────┬─────┬─────┬─────┬───→ Input (t)
 *            0.25  0.5  0.75   1.0
 * 
 * Comparison with other easings:
 * Linear:     ────────╱
 * Ease-in:    ______╱╱
 * Ease-out:   ╱╱______
 * Ease-in-out:___╱╲___  (this function)
 * ```
 * 
 * **Mathematical Formula:**
 * ```
 * For t < 0.5:
 *   f(t) = 4t³
 * 
 * For t ≥ 0.5:
 *   f(t) = 1 - (-2t + 2)³ / 2
 *        = 1 - (2 - 2t)³ / 2
 * ```
 * 
 * @param t - Progress value between 0 and 1 (0 = start, 1 = end)
 * @returns Eased value between 0 and 1
 * 
 * @example
 * // Smooth scroll to position
 * function smoothScroll(element: HTMLElement, duration: number) {
 *   const start = window.pageYOffset;
 *   const target = element.offsetTop;
 *   const distance = target - start;
 *   const startTime = Date.now();
 *   
 *   function scroll() {
 *     const elapsed = Date.now() - startTime;
 *     const progress = Math.min(elapsed / duration, 1);
 *     const eased = easeInOutCubic(progress);
 *     
 *     window.scrollTo(0, start + distance * eased);
 *     
 *     if (progress < 1) {
 *       requestAnimationFrame(scroll);
 *     }
 *   }
 *   
 *   scroll();
 * }
 * 
 * @example
 * // Animate value change
 * function animateValue(from: number, to: number, duration: number, callback: (n: number) => void) {
 *   const startTime = Date.now();
 *   
 *   function update() {
 *     const elapsed = Date.now() - startTime;
 *     const progress = Math.min(elapsed / duration, 1);
 *     const eased = easeInOutCubic(progress);
 *     const current = from + (to - from) * eased;
 *     
 *     callback(current);
 *     
 *     if (progress < 1) {
 *       requestAnimationFrame(update);
 *     }
 *   }
 *   
 *   update();
 * }
 * 
 * @performance
 * - Time Complexity: O(1)
 * - Operations: 1 comparison, 1-2 multiplications, 1 power operation
 * - Very fast, suitable for 60fps animations
 * 
 * @see {@link lerp} for linear interpolation with easing
 * @see {@link https://easings.net/#easeInOutCubic} for easing visualization
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// ============================================================================
// MATH UTILITIES
// ============================================================================

/**
 * Clamps a value between minimum and maximum bounds.
 * 
 * Restricts a value to stay within a specified range. Values below the
 * minimum become the minimum; values above the maximum become the maximum.
 * Essential for keeping values within valid bounds.
 * 
 * **Visual Representation:**
 * ```
 *            min          max
 *             ↓            ↓
 *     ────────┼────────────┼────────→
 *     -∞   clamp here  clamp here   +∞
 * 
 * Examples:
 * clamp(-5, 0, 10)  → 0   (too low)
 * clamp(5, 0, 10)   → 5   (in range)
 * clamp(15, 0, 10)  → 10  (too high)
 * ```
 * 
 * @param value - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value within [min, max]
 * 
 * @example
 * // Clamp opacity to valid range
 * const opacity = clamp(userInput, 0, 1);
 * 
 * @example
 * // Clamp scroll position
 * const scrollY = clamp(window.scrollY, 0, document.body.scrollHeight);
 * 
 * @example
 * // Clamp RGB color values
 * const r = clamp(Math.floor(value * 255), 0, 255);
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values.
 * 
 * Calculates a value between start and end based on progress (t).
 * When t=0, returns start; when t=1, returns end; when t=0.5, returns
 * the midpoint. Core function for smooth transitions and animations.
 * 
 * **Visual Representation:**
 * ```
 *  start                      end
 *    ↓                         ↓
 *    ●────────●────────────────●
 *   t=0      t=0.5           t=1
 * 
 * Example: lerp(0, 100, 0.5) = 50
 * ```
 * 
 * **Mathematical Formula:**
 * ```
 * lerp(a, b, t) = a + (b - a) × t
 * 
 * Alternative form:
 * lerp(a, b, t) = a × (1 - t) + b × t
 * ```
 * 
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Progress between 0 and 1 (automatically clamped)
 * @returns Interpolated value
 * 
 * @example
 * // Animate position from 0 to 100
 * const position = lerp(0, 100, progress);
 * 
 * @example
 * // Color interpolation (per channel)
 * const r = lerp(startColor.r, endColor.r, t);
 * const g = lerp(startColor.g, endColor.g, t);
 * const b = lerp(startColor.b, endColor.b, t);
 * 
 * @example
 * // Smooth camera zoom
 * const zoom = lerp(1, 2, easeInOutCubic(progress));
 * 
 * @performance
 * - Time Complexity: O(1)
 * - Operations: 1 clamp, 2 subtractions, 2 multiplications, 1 addition
 * - Highly optimized by modern JavaScript engines
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Generates a random value within a range.
 * 
 * Returns a random number between min (inclusive) and max (exclusive).
 * Useful for creating variation in animations, positions, and timing.
 * 
 * **Distribution:**
 * ```
 * min                max
 *  ↓                  ↓
 *  ●══════════════════○  (inclusive → exclusive)
 *  
 * All values have equal probability (uniform distribution)
 * ```
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random value in range [min, max)
 * 
 * @example
 * // Random star size between 1 and 4 pixels
 * const size = randomInRange(1, 4);
 * 
 * @example
 * // Random animation delay
 * const delay = randomInRange(0, 5);
 * 
 * @example
 * // Random color from palette
 * const colors = ['#A855F7', '#D8B4FE', '#C084FC'];
 * const randomColor = colors[Math.floor(randomInRange(0, colors.length))];
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
