# BTS Neural Archive - API Reference

> Comprehensive documentation for utility functions, helpers, and animations

This document provides detailed API reference for all utility functions used throughout the BTS Neural Archive application. These functions handle everything from color manipulation to 3D star generation, animations, and common operations.

---

## Table of Contents

- [Animation Utilities](#animation-utilities)
- [Color Utilities](#color-utilities)
- [Math Utilities](#math-utilities)
- [String Utilities](#string-utilities)
- [Time Utilities](#time-utilities)
- [DOM Utilities](#dom-utilities)
- [Array Utilities](#array-utilities)
- [Performance Utilities](#performance-utilities)

---

## Animation Utilities

Functions for generating and managing animations, particles, and 3D visualizations.

### `generateParticles(count: number): FloatingParticle[]`

Generates random particle properties for floating animations.

**Parameters:**
- `count` (number) - Number of particles to generate

**Returns:** `FloatingParticle[]` - Array of particle configuration objects

**Example:**
```typescript
const particles = generateParticles(50);
// Returns array of 50 particles with random positions, delays, and sizes

particles.forEach(particle => {
  renderParticle({
    left: particle.left,      // '23.5%'
    top: particle.top,         // '67.2%'
    delay: particle.delay,     // 2.3s
    duration: particle.duration, // 15.7s
    size: particle.size        // 2.1px
  });
});
```

---

### `generateBokehLights(count: number): BokehBubble[]`

Generates bokeh light properties for the purple ocean effect.

**Parameters:**
- `count` (number) - Number of bokeh lights to generate

**Returns:** `BokehBubble[]` - Array of bokeh configuration objects

**Example:**
```typescript
const bokehLights = generateBokehLights(20);
// Creates 20 bokeh bubbles for the "ARMY bomb" purple ocean effect

// Each bubble has:
// - left: Random position (0-100%)
// - top: Random position (0-100%)
// - size: 100-300px
// - delay: 0-10s
// - duration: 20-40s
```

---

### `generateStars(count: number, colors: string[]): Star[]`

Generates 3D star positions using spherical coordinates for the cosmic universe.

**Parameters:**
- `count` (number) - Number of stars to generate
- `colors` (string[]) - Array of color values for stars (hex format)

**Returns:** `Star[]` - Array of star configuration objects with 3D coordinates

**Example:**
```typescript
import { UNIVERSE_COLORS } from '@/constants/colors';

const stars = generateStars(800, UNIVERSE_COLORS.STARS);
// Generates 800 stars with Borahae color variations

stars.forEach(star => {
  const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
  renderStar({ x, y, z, size: star.size, color: star.color });
});

// Every 12th star is white for brightness:
// stars[0].color === '#ffffff'
// stars[12].color === '#ffffff'
// stars[24].color === '#ffffff'
// Others are purple variations
```

**Algorithm Details:**
- Uses spherical coordinates (θ, φ, r) for uniform distribution
- `theta`: Azimuthal angle (0 to 2π) - horizontal rotation
- `phi`: Polar angle via `acos(random * 2 - 1)` - prevents pole clustering
- `r`: Radius distance (300-1300 units) creates depth
- Every 12th star is white, rest use provided colors

---

### `sphericalToCartesian(theta: number, phi: number, r: number): Position3D`

Converts spherical coordinates to 3D Cartesian coordinates.

**Parameters:**
- `theta` (number) - Azimuthal angle in radians (0 to 2π)
- `phi` (number) - Polar angle in radians (0 to π)
- `r` (number) - Radius distance from origin

**Returns:** `Position3D` - Object with x, y, z coordinates

**Example:**
```typescript
// Convert a star's spherical position to Cartesian
const position = sphericalToCartesian(
  Math.PI / 4,  // 45° azimuthal
  Math.PI / 3,  // 60° polar
  500           // 500 units from center
);

// Returns: { x: 216.5, y: 433.0, z: 250.0 }

// Use for rendering:
element.style.transform = `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`;
```

**Math Reference:**
- x = r × sin(φ) × cos(θ)
- y = r × sin(φ) × sin(θ)
- z = r × cos(φ)

---

### `calculateOrbitalPosition(index: number, totalMembers: number = 7, distance: number = 100): {x, y, angle}`

Calculates orbital position for member constellation arrangement.

**Parameters:**
- `index` (number) - Member index (0-6 for 7 members)
- `totalMembers` (number) - Total number in constellation (default: 7)
- `distance` (number) - Distance from center (default: 100)

**Returns:** Object with `x`, `y` coordinates and `angle` in radians

**Example:**
```typescript
// Position 7 members in a circle around the BTS logo
const members = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];

members.forEach((memberId, index) => {
  const { x, y, angle } = calculateOrbitalPosition(index, 7, 150);
  
  renderMemberIcon({
    memberId,
    x,     // -75 to 75 (circular)
    y,     // -75 to 75 (circular)
    angle  // 0 to 2π radians
  });
});

// Results in perfect circular constellation:
// Member 0: angle = 0° (right)
// Member 1: angle = 51.4° 
// Member 2: angle = 102.9°
// ... and so on
```

---

### `getStaggerDelay(index: number, baseDelay: number = 0, increment: number = 100): string`

Generates a delay string for staggered animations.

**Parameters:**
- `index` (number) - Element index
- `baseDelay` (number) - Base delay in milliseconds (default: 0)
- `increment` (number) - Delay increment per index in milliseconds (default: 100)

**Returns:** `string` - Delay string for CSS (e.g., '300ms')

**Example:**
```typescript
// Stagger animation for member cards appearing
members.forEach((member, index) => {
  const delay = getStaggerDelay(index, 200, 150);
  
  element.style.animationDelay = delay;
  // index 0: '200ms'
  // index 1: '350ms'
  // index 2: '500ms'
  // index 3: '650ms'
});
```

---

### `easeInOutCubic(t: number): number`

Cubic easing function for smooth animations.

**Parameters:**
- `t` (number) - Current time/progress (0 to 1)

**Returns:** `number` - Eased value (0 to 1)

**Example:**
```typescript
// Smooth transition animation
function animateElement(startValue: number, endValue: number, duration: number) {
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    
    const currentValue = startValue + (endValue - startValue) * easedProgress;
    element.style.opacity = currentValue;
    
    if (progress < 1) requestAnimationFrame(update);
  }
  
  update();
}
```

---

## Color Utilities

Functions for color manipulation, conversion, and generation.

### `hexToRgb(hex: string): {r, g, b} | null`

Converts hex color to RGB values.

**Parameters:**
- `hex` (string) - Hex color code (with or without '#')

**Returns:** Object with r, g, b values (0-255) or null if invalid

**Example:**
```typescript
const rgb = hexToRgb('#A855F7');
// Returns: { r: 168, g: 85, b: 247 }

const rgb2 = hexToRgb('A855F7');
// Also works: { r: 168, g: 85, b: 247 }

const invalid = hexToRgb('invalid');
// Returns: null
```

---

### `rgbToHex(r: number, g: number, b: number): string`

Converts RGB values to hex color.

**Parameters:**
- `r` (number) - Red value (0-255)
- `g` (number) - Green value (0-255)
- `b` (number) - Blue value (0-255)

**Returns:** `string` - Hex color code (e.g., '#A855F7')

**Example:**
```typescript
const hex = rgbToHex(168, 85, 247);
// Returns: '#a855f7'

// Use with color manipulation:
const lightened = rgbToHex(
  Math.min(168 + 50, 255),
  Math.min(85 + 50, 255),
  Math.min(247 + 50, 255)
);
```

---

### `hexWithAlpha(hex: string, alpha: number): string`

Adds alpha transparency to a hex color.

**Parameters:**
- `hex` (string) - Hex color code
- `alpha` (number) - Alpha value (0 to 1)

**Returns:** `string` - RGBA color string

**Example:**
```typescript
const transparent = hexWithAlpha('#A855F7', 0.5);
// Returns: 'rgba(168, 85, 247, 0.5)'

// Glass morphism effect:
element.style.background = hexWithAlpha(BORAHAE_COLORS.PRIMARY, 0.1);
element.style.backdropFilter = 'blur(10px)';
```

---

### `lightenColor(hex: string, percent: number): string`

Lightens a color by a percentage.

**Parameters:**
- `hex` (string) - Hex color code
- `percent` (number) - Percentage to lighten (0-100)

**Returns:** `string` - Lightened hex color

**Example:**
```typescript
const base = '#A855F7';
const lighter = lightenColor(base, 20);
// Returns: '#c589f9' (20% lighter)

// Create hover states:
button.style.background = base;
button.onmouseenter = () => {
  button.style.background = lightenColor(base, 15);
};
```

---

### `darkenColor(hex: string, percent: number): string`

Darkens a color by a percentage.

**Parameters:**
- `hex` (string) - Hex color code
- `percent` (number) - Percentage to darken (0-100)

**Returns:** `string` - Darkened hex color

**Example:**
```typescript
const base = '#A855F7';
const darker = darkenColor(base, 30);
// Returns: '#7a3cb3' (30% darker)

// Active state:
button.onclick = () => {
  button.style.background = darkenColor(base, 20);
};
```

---

## Math Utilities

Mathematical helper functions for calculations and transformations.

### `clamp(value: number, min: number, max: number): number`

Clamps a value between min and max bounds.

**Parameters:**
- `value` (number) - Value to clamp
- `min` (number) - Minimum allowed value
- `max` (number) - Maximum allowed value

**Returns:** `number` - Clamped value

**Example:**
```typescript
clamp(150, 0, 100);   // Returns: 100
clamp(-50, 0, 100);   // Returns: 0
clamp(75, 0, 100);    // Returns: 75

// Ensure opacity stays valid:
element.style.opacity = clamp(userInput, 0, 1);
```

---

### `lerp(start: number, end: number, t: number): number`

Linear interpolation between two values.

**Parameters:**
- `start` (number) - Start value
- `end` (number) - End value
- `t` (number) - Progress (0 to 1)

**Returns:** `number` - Interpolated value

**Example:**
```typescript
lerp(0, 100, 0);     // Returns: 0
lerp(0, 100, 0.5);   // Returns: 50
lerp(0, 100, 1);     // Returns: 100

// Smooth color transition:
const startColor = { r: 168, g: 85, b: 247 };
const endColor = { r: 37, g: 99, b: 235 };
const progress = 0.3;

const r = lerp(startColor.r, endColor.r, progress);
const g = lerp(startColor.g, endColor.g, progress);
const b = lerp(startColor.b, endColor.b, progress);
```

---

### `map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

Maps a value from one range to another.

**Parameters:**
- `value` (number) - Input value
- `inMin` (number) - Input range minimum
- `inMax` (number) - Input range maximum
- `outMin` (number) - Output range minimum
- `outMax` (number) - Output range maximum

**Returns:** `number` - Mapped value

**Example:**
```typescript
// Map 0-100 to 0-1
map(50, 0, 100, 0, 1);  // Returns: 0.5

// Map audio frequency (20-20000 Hz) to visual height (0-500px)
const frequency = 440; // A4 note
const height = map(frequency, 20, 20000, 0, 500);
// Returns: 10.5px

// Map BPM (60-180) to color intensity (0-255)
const bpm = 120;
const intensity = map(bpm, 60, 180, 0, 255);
```

---

### `distance(x1: number, y1: number, x2: number, y2: number): number`

Calculates Euclidean distance between two points.

**Parameters:**
- `x1`, `y1` (number) - First point coordinates
- `x2`, `y2` (number) - Second point coordinates

**Returns:** `number` - Distance between points

**Example:**
```typescript
const dist = distance(0, 0, 3, 4);
// Returns: 5 (Pythagorean theorem: 3² + 4² = 5²)

// Check if mouse is near element:
function isNearElement(mouseX, mouseY, elemX, elemY, threshold) {
  return distance(mouseX, mouseY, elemX, elemY) < threshold;
}
```

---

### `angleBetween(x1: number, y1: number, x2: number, y2: number): number`

Calculates angle between two points in radians.

**Parameters:**
- `x1`, `y1` (number) - First point coordinates
- `x2`, `y2` (number) - Second point coordinates

**Returns:** `number` - Angle in radians (-π to π)

**Example:**
```typescript
const angle = angleBetween(0, 0, 1, 1);
// Returns: 0.785 radians (45 degrees)

// Point element toward mouse:
function pointTowardMouse(element, mouseX, mouseY) {
  const rect = element.getBoundingClientRect();
  const angle = angleBetween(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    mouseX,
    mouseY
  );
  element.style.transform = `rotate(${angle}rad)`;
}
```

---

## String Utilities

Text manipulation and formatting functions.

### `capitalize(str: string): string`

Capitalizes first letter of a string.

**Parameters:**
- `str` (string) - String to capitalize

**Returns:** `string` - Capitalized string

**Example:**
```typescript
capitalize('borahae');  // Returns: 'Borahae'
capitalize('rm');       // Returns: 'Rm'
```

---

### `toTitleCase(str: string): string`

Converts string to title case.

**Parameters:**
- `str` (string) - String to convert

**Returns:** `string` - Title cased string

**Example:**
```typescript
toTitleCase('the most beautiful moment in life');
// Returns: 'The Most Beautiful Moment In Life'

toTitleCase('love yourself: answer');
// Returns: 'Love Yourself: Answer'
```

---

### `truncate(str: string, maxLength: number, suffix: string = '...'): string`

Truncates string to specified length.

**Parameters:**
- `str` (string) - String to truncate
- `maxLength` (number) - Maximum length
- `suffix` (string) - Suffix to append (default: '...')

**Returns:** `string` - Truncated string

**Example:**
```typescript
const long = 'This is a very long song description';
truncate(long, 20);
// Returns: 'This is a very lo...'

truncate(long, 20, '…');
// Returns: 'This is a very long…'

truncate('Short', 20);
// Returns: 'Short' (no truncation needed)
```

---

### `formatNumber(num: number): string`

Formats number with comma separators.

**Parameters:**
- `num` (number) - Number to format

**Returns:** `string` - Formatted number string

**Example:**
```typescript
formatNumber(1000);      // Returns: '1,000'
formatNumber(1234567);   // Returns: '1,234,567'
formatNumber(42);        // Returns: '42'

// Display KOMCA credits:
const credits = 245;
display(`${formatNumber(credits)} credits`);
// Shows: "245 credits"
```

---

## Time Utilities

Time-related functions and performance utilities.

### `formatDuration(seconds: number): string`

Formats duration in seconds to MM:SS format.

**Parameters:**
- `seconds` (number) - Duration in seconds

**Returns:** `string` - Formatted duration (MM:SS)

**Example:**
```typescript
formatDuration(65);    // Returns: '1:05'
formatDuration(125);   // Returns: '2:05'
formatDuration(3599);  // Returns: '59:59'

// Display song duration:
const song = { duration: 243 };
element.textContent = formatDuration(song.duration);
// Shows: "4:03"
```

---

### `debounce<T>(func: T, wait: number): (...args) => void`

Debounces function execution.

**Parameters:**
- `func` (Function) - Function to debounce
- `wait` (number) - Wait time in milliseconds

**Returns:** Debounced function

**Example:**
```typescript
// Search input with debounce
const search = debounce((query: string) => {
  performSearch(query);
}, 300);

input.addEventListener('input', (e) => {
  search(e.target.value);
  // Only searches 300ms after user stops typing
});
```

---

### `throttle<T>(func: T, limit: number): (...args) => void`

Throttles function execution.

**Parameters:**
- `func` (Function) - Function to throttle
- `limit` (number) - Minimum time between calls in milliseconds

**Returns:** Throttled function

**Example:**
```typescript
// Scroll handler with throttle
const onScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', onScroll);
// Function runs at most once every 100ms during scroll
```

---

## DOM Utilities

DOM manipulation and viewport utilities.

### `isInViewport(element: HTMLElement): boolean`

Checks if element is visible in viewport.

**Parameters:**
- `element` (HTMLElement) - Element to check

**Returns:** `boolean` - True if element is in viewport

**Example:**
```typescript
const card = document.querySelector('.member-card');

if (isInViewport(card)) {
  card.classList.add('animate-in');
}

// Lazy load images:
images.forEach(img => {
  if (isInViewport(img)) {
    img.src = img.dataset.src;
  }
});
```

---

### `scrollToElement(element: HTMLElement, offset: number = 0, behavior: ScrollBehavior = 'smooth'): void`

Smoothly scrolls to an element.

**Parameters:**
- `element` (HTMLElement) - Target element
- `offset` (number) - Offset from top in pixels (default: 0)
- `behavior` (ScrollBehavior) - Scroll behavior (default: 'smooth')

**Returns:** `void`

**Example:**
```typescript
const section = document.getElementById('sonic-lab');

// Smooth scroll to section
scrollToElement(section, 100);

// Instant scroll with offset
scrollToElement(section, 80, 'auto');

// Navigation menu:
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.hash);
    scrollToElement(target, 60); // Account for fixed header
  });
});
```

---

## Array Utilities

Array manipulation and transformation functions.

### `shuffle<T>(array: T[]): T[]`

Shuffles array using Fisher-Yates algorithm.

**Parameters:**
- `array` (T[]) - Array to shuffle

**Returns:** `T[]` - New shuffled array (original unchanged)

**Example:**
```typescript
const songs = ['Dynamite', 'Butter', 'Permission to Dance'];
const shuffled = shuffle(songs);
// Returns: ['Butter', 'Permission to Dance', 'Dynamite'] (random order)

// Shuffle playlist:
const playlist = shuffle(allSongs);
```

---

### `randomItem<T>(array: T[]): T`

Gets a random item from array.

**Parameters:**
- `array` (T[]) - Source array

**Returns:** `T` - Random item from array

**Example:**
```typescript
const colors = UNIVERSE_COLORS.STARS;
const randomColor = randomItem(colors);

// Random song suggestion:
const randomSong = randomItem(allSongs);

// Random member highlight:
const members = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];
const featuredMember = randomItem(members);
```

---

### `chunk<T>(array: T[], size: number): T[][]`

Splits array into smaller arrays of specified size.

**Parameters:**
- `array` (T[]) - Array to chunk
- `size` (number) - Chunk size

**Returns:** `T[][]` - Array of chunks

**Example:**
```typescript
const songs = [1, 2, 3, 4, 5, 6, 7];
const pages = chunk(songs, 3);
// Returns: [[1, 2, 3], [4, 5, 6], [7]]

// Paginate song list:
const allSongs = [...]; // 245 songs
const pages = chunk(allSongs, 12); // 12 songs per page
// Returns 21 pages with 12 songs each (last page has 5)
```

---

## Performance Utilities

Browser performance and animation frame utilities.

### `requestAnimFrame: (callback: FrameRequestCallback) => number`

Request animation frame with cross-browser fallback.

**Returns:** `number` - Request ID

**Example:**
```typescript
function animate() {
  // Animation logic
  updatePositions();
  render();
  
  requestAnimFrame(animate); // Continue animation loop
}

// Start animation:
requestAnimFrame(animate);
```

---

### `cancelAnimFrame: (id: number) => void`

Cancel animation frame with cross-browser fallback.

**Parameters:**
- `id` (number) - Request ID to cancel

**Returns:** `void`

**Example:**
```typescript
let animationId: number;

function startAnimation() {
  function loop() {
    updateAnimation();
    animationId = requestAnimFrame(loop);
  }
  animationId = requestAnimFrame(loop);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimFrame(animationId);
  }
}
```

---

## Type Definitions

Key TypeScript interfaces used by these utilities:

```typescript
interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface Star {
  theta: number;  // Azimuthal angle
  phi: number;    // Polar angle
  r: number;      // Radius
  size: number;   // Visual size
  color: string;  // Hex color
  delay: number;  // Animation delay
}

interface BokehBubble {
  left: string;     // Position percentage
  top: string;      // Position percentage
  size: number;     // Bubble size in pixels
  delay: number;    // Animation delay in seconds
  duration: number; // Animation duration in seconds
}

interface FloatingParticle {
  left: string;     // Position percentage
  top: string;      // Position percentage
  delay: number;    // Animation delay in seconds
  duration: number; // Animation duration in seconds
  size: number;     // Particle size in pixels
}
```

---

## Best Practices

### Performance Tips

1. **Use memoization** for expensive calculations
2. **Throttle/debounce** frequently called functions
3. **Batch DOM operations** when possible
4. **Use `requestAnimFrame`** for smooth animations

### Common Patterns

```typescript
// Generate and render stars
const stars = generateStars(800, UNIVERSE_COLORS.STARS);
stars.forEach(star => {
  const pos = sphericalToCartesian(star.theta, star.phi, star.r);
  renderStar(pos, star.size, star.color);
});

// Smooth scroll navigation
navLinks.forEach(link => {
  link.onclick = () => {
    const target = document.querySelector(link.hash);
    scrollToElement(target, 80);
  };
});

// Debounced search
const search = debounce(performSearch, 300);
searchInput.oninput = (e) => search(e.target.value);
```

---

## Contributing

When adding new utility functions:

1. Add comprehensive JSDoc comments
2. Include usage examples
3. Update this API documentation
4. Add TypeScript type definitions
5. Consider edge cases and performance

---

*Made with 💜 for BTS & ARMY*

**Last Updated:** January 2026  
**Version:** 0.0.0
