# 📚 BTS Neural Archive - API Reference

> Complete reference guide for all utility functions in the BTS Neural Archive

This document provides comprehensive documentation for all utility functions exported from `src/utils/`. These functions power the animations, calculations, and visual effects throughout the application.

## Table of Contents

- [Animation Utilities](#animation-utilities)
- [Helper Functions](#helper-functions)
  - [Animation Helpers](#animation-helpers)
  - [Color Helpers](#color-helpers)
  - [Math Helpers](#math-helpers)
  - [String Helpers](#string-helpers)
  - [Time Helpers](#time-helpers)
  - [DOM Helpers](#dom-helpers)
  - [Array Helpers](#array-helpers)
  - [Performance Helpers](#performance-helpers)

---

## Animation Utilities

Functions from `src/utils/animations.ts` for creating the cosmic visual effects.

### `generateParticles(count: number): FloatingParticle[]`

Generates random particle configurations for ambient floating animations.

**Parameters:**
- `count` (number) - Number of particles to generate

**Returns:** Array of `FloatingParticle` objects with properties:
- `left` (string) - Horizontal position (percentage)
- `top` (string) - Vertical position (percentage)
- `delay` (number) - Animation delay in seconds (0-5s)
- `duration` (number) - Animation duration in seconds (10-20s)
- `size` (number) - Particle size in pixels (1-4px)

**Example:**
```typescript
const particles = generateParticles(50);
// Returns 50 particle configurations for floating animations

particles.forEach((particle, index) => {
  console.log(`Particle ${index}: positioned at ${particle.left}, ${particle.top}`);
});
```

**Use Case:**
```tsx
function FloatingParticles() {
  const particles = generateParticles(50);
  
  return (
    <div className="particle-container">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
```

---

### `generateBokehLights(count: number): BokehBubble[]`

Creates bokeh bubble configurations for the "Purple Ocean" ARMY bomb effect.

**Parameters:**
- `count` (number) - Number of bokeh lights to generate

**Returns:** Array of `BokehBubble` objects with properties:
- `left` (string) - Horizontal position (percentage)
- `top` (string) - Vertical position (percentage)
- `size` (number) - Bubble diameter in pixels (100-300px)
- `delay` (number) - Animation delay in seconds (0-10s)
- `duration` (number) - Animation duration in seconds (20-40s)

**Example:**
```typescript
const bokeh = generateBokehLights(30);
// Returns 30 bokeh light configurations

// Average bubble size
const avgSize = bokeh.reduce((sum, b) => sum + b.size, 0) / bokeh.length;
console.log(`Average bokeh size: ${avgSize}px`);
```

**Use Case:**
```tsx
function PurpleOcean() {
  const bokehLights = generateBokehLights(30);
  
  return (
    <div className="bokeh-layer">
      {bokehLights.map((bokeh, i) => (
        <div
          key={i}
          className="bokeh-bubble"
          style={{
            left: bokeh.left,
            top: bokeh.top,
            width: bokeh.size,
            height: bokeh.size,
            animationDelay: `${bokeh.delay}s`,
            animationDuration: `${bokeh.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
```

---

### `generateStars(count: number, colors: string[]): Star[]`

Generates 3D star positions using spherical coordinates for the cosmic universe background.

**Parameters:**
- `count` (number) - Number of stars to generate
- `colors` (string[]) - Array of hex color strings for star colors

**Returns:** Array of `Star` objects with properties:
- `theta` (number) - Azimuthal angle (0 to 2π) - horizontal rotation
- `phi` (number) - Polar angle (0 to π) - vertical angle from axis
- `r` (number) - Radius/distance from center (300-1300px)
- `size` (number) - Star size in pixels (0.5-3px)
- `color` (string) - Star color (hex)
- `delay` (number) - Animation delay (0-5s)

**Example:**
```typescript
import { UNIVERSE_COLORS } from '@/constants/colors';

const stars = generateStars(800, UNIVERSE_COLORS.STARS);
// Generates 800 stars with Borahae colors

// Every 12th star is white (brighter)
const whiteStars = stars.filter(s => s.color === '#ffffff');
console.log(`${whiteStars.length} white stars created`);
```

**Mathematical Note:**
The function uses spherical coordinates to ensure uniform distribution across the sphere surface. Using `Math.acos((Math.random() * 2) - 1)` for phi prevents clustering near the poles, which is a common mistake in spherical generation.

---

### `sphericalToCartesian(theta: number, phi: number, r: number): Position3D`

Converts spherical coordinates to 3D Cartesian coordinates.

**Parameters:**
- `theta` (number) - Azimuthal angle in radians
- `phi` (number) - Polar angle in radians
- `r` (number) - Radius from origin

**Returns:** Object with `x`, `y`, `z` coordinates

**Formula:**
```
x = r * sin(φ) * cos(θ)
y = r * sin(φ) * sin(θ)
z = r * cos(φ)
```

**Example:**
```typescript
const position = sphericalToCartesian(Math.PI / 2, Math.PI / 4, 500);
// Returns: { x: 353.55, y: 353.55, z: 353.55 }

// Convert all stars to cartesian for rendering
const stars = generateStars(800, colors);
const cartesianStars = stars.map(star => ({
  ...star,
  position: sphericalToCartesian(star.theta, star.phi, star.r)
}));
```

---

### `calculateOrbitalPosition(index: number, totalMembers?: number, distance?: number): OrbitalPosition`

Calculates evenly-spaced circular positions for member constellation (the 7 BTS members).

**Parameters:**
- `index` (number) - Member index (0-6 for 7 members)
- `totalMembers` (number) - Total members (default: 7)
- `distance` (number) - Distance from center in pixels (default: 100)

**Returns:** Object with:
- `x` (number) - Horizontal position
- `y` (number) - Vertical position
- `angle` (number) - Angle in radians

**Example:**
```typescript
// Position all 7 BTS members in a circle
const members = ['RM', 'Jin', 'SUGA', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
const positions = members.map((name, i) => ({
  name,
  ...calculateOrbitalPosition(i, 7, 150)
}));

// Result: 7 members evenly spaced around a circle with 150px radius
positions.forEach(m => {
  console.log(`${m.name} at (${m.x}, ${m.y}), angle: ${m.angle}`);
});
```

**Use Case:**
```tsx
function MemberConstellation() {
  const members = MEMBER_DATA;
  
  return (
    <div className="constellation">
      {members.map((member, i) => {
        const pos = calculateOrbitalPosition(i, 7, 200);
        return (
          <div
            key={member.id}
            className="member-star"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
          >
            {member.name}
          </div>
        );
      })}
    </div>
  );
}
```

---

### `getStaggerDelay(index: number, baseDelay?: number, increment?: number): string`

Generates staggered animation delays for sequential animations.

**Parameters:**
- `index` (number) - Element index
- `baseDelay` (number) - Base delay in milliseconds (default: 0)
- `increment` (number) - Delay increment per index in milliseconds (default: 100)

**Returns:** CSS delay string (e.g., "300ms")

**Example:**
```typescript
// Create staggered entrance animations
const delays = [0, 1, 2, 3, 4].map(i => getStaggerDelay(i, 200, 150));
// Returns: ["200ms", "350ms", "500ms", "650ms", "800ms"]
```

**Use Case:**
```tsx
function StaggeredList({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            animationDelay: getStaggerDelay(index, 0, 100),
          }}
          className="fade-in"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

---

### `easeInOutCubic(t: number): number`

Cubic easing function for smooth animations (slow start, fast middle, slow end).

**Parameters:**
- `t` (number) - Progress value between 0 and 1

**Returns:** Eased value between 0 and 1

**Easing Curve:**
- `t < 0.5`: Eases in (accelerates)
- `t >= 0.5`: Eases out (decelerates)

**Example:**
```typescript
// Animate a value from 0 to 100 with easing
const startValue = 0;
const endValue = 100;
const progress = 0.5; // 50% through animation

const easedProgress = easeInOutCubic(progress);
const currentValue = startValue + (endValue - startValue) * easedProgress;
// Result: smooth transition value
```

**Use Case:**
```typescript
function animateValue(start, end, duration) {
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1); // Clamp to 0-1
    const easedT = easeInOutCubic(t);
    const current = start + (end - start) * easedT;
    
    updateDisplay(current);
    
    if (t < 1) requestAnimationFrame(update);
  }
  
  update();
}

animateValue(0, 1000, 2000); // Animate from 0 to 1000 over 2 seconds
```

---

### `clamp(value: number, min: number, max: number): number`

Restricts a value to a specified range.

**Parameters:**
- `value` (number) - Value to clamp
- `min` (number) - Minimum allowed value
- `max` (number) - Maximum allowed value

**Returns:** Clamped value within [min, max]

**Example:**
```typescript
clamp(150, 0, 100);  // Returns: 100
clamp(-50, 0, 100);  // Returns: 0
clamp(75, 0, 100);   // Returns: 75

// Ensure star size stays within bounds
const rawSize = Math.random() * 5;
const size = clamp(rawSize, 0.5, 3); // Size between 0.5px and 3px
```

---

### `lerp(start: number, end: number, t: number): number`

Linear interpolation between two values.

**Parameters:**
- `start` (number) - Starting value
- `end` (number) - Ending value
- `t` (number) - Interpolation factor (0 to 1, automatically clamped)

**Returns:** Interpolated value

**Formula:** `result = start + (end - start) * t`

**Example:**
```typescript
lerp(0, 100, 0);     // Returns: 0
lerp(0, 100, 0.5);   // Returns: 50
lerp(0, 100, 1);     // Returns: 100
lerp(0, 100, 1.5);   // Returns: 100 (clamped)

// Smooth color transition
const startColor = { r: 168, g: 85, b: 247 }; // Purple
const endColor = { r: 236, g: 72, b: 153 };   // Pink
const t = 0.5;

const blendedColor = {
  r: lerp(startColor.r, endColor.r, t),
  g: lerp(startColor.g, endColor.g, t),
  b: lerp(startColor.b, endColor.b, t),
};
// Result: midpoint color between purple and pink
```

---

### `randomInRange(min: number, max: number): number`

Generates a random number within a specified range.

**Parameters:**
- `min` (number) - Minimum value (inclusive)
- `max` (number) - Maximum value (inclusive)

**Returns:** Random number between min and max

**Example:**
```typescript
randomInRange(1, 10);     // Random number like 7.3428
randomInRange(100, 200);  // Random number like 156.89

// Generate random star properties
const star = {
  size: randomInRange(0.5, 3),
  opacity: randomInRange(0.3, 1),
  speed: randomInRange(5, 15),
};
```

---

## Helper Functions

Comprehensive utilities from `src/utils/helpers.ts`.

### Animation Helpers

#### `randomPosition(): { left: string; top: string }`

Generates a random position within the viewport.

**Returns:** Object with `left` and `top` as percentage strings

**Example:**
```typescript
const pos = randomPosition();
// Returns: { left: "67.23%", top: "42.89%" }

// Create randomly positioned elements
const element = document.createElement('div');
const pos = randomPosition();
element.style.left = pos.left;
element.style.top = pos.top;
```

---

#### `randomDelay(max?: number): number`

Generates a random animation delay.

**Parameters:**
- `max` (number) - Maximum delay in seconds (default: 5)

**Returns:** Random delay between 0 and max

**Example:**
```typescript
randomDelay();      // Random value between 0 and 5
randomDelay(10);    // Random value between 0 and 10

// Apply random delays to multiple elements
elements.forEach(el => {
  el.style.animationDelay = `${randomDelay(3)}s`;
});
```

---

#### `randomDuration(min: number, max: number): number`

Generates a random animation duration within a range.

**Parameters:**
- `min` (number) - Minimum duration in seconds
- `max` (number) - Maximum duration in seconds

**Returns:** Random duration between min and max

**Example:**
```typescript
randomDuration(2, 5);   // Random value like 3.7 seconds
randomDuration(10, 20); // Random value like 14.2 seconds

// Vary animation speeds
bokehBubbles.forEach(bubble => {
  bubble.animationDuration = `${randomDuration(15, 30)}s`;
});
```

---

#### `generateBokehBubbles(count: number): BokehBubble[]`

Creates bokeh bubble configurations (same as animations.ts version).

**Parameters:**
- `count` (number) - Number of bubbles

**Returns:** Array of bokeh configurations

---

#### `generateFloatingParticles(count: number): FloatingParticle[]`

Generates floating particle configurations.

**Parameters:**
- `count` (number) - Number of particles

**Returns:** Array of particle configurations

---

### Color Helpers

#### `hexToRgb(hex: string): { r: number; g: number; b: number } | null`

Converts hex color to RGB values.

**Parameters:**
- `hex` (string) - Hex color code (with or without #)

**Returns:** Object with r, g, b values (0-255) or null if invalid

**Example:**
```typescript
hexToRgb('#A855F7');
// Returns: { r: 168, g: 85, b: 247 }

hexToRgb('A855F7');  // Also works without #
// Returns: { r: 168, g: 85, b: 247 }

hexToRgb('invalid');
// Returns: null

// Use for color manipulation
const rgb = hexToRgb(BORAHAE_COLORS.PRIMARY);
if (rgb) {
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  console.log(`Luminance: ${luminance}`);
}
```

---

#### `rgbToHex(r: number, g: number, b: number): string`

Converts RGB values to hex color code.

**Parameters:**
- `r` (number) - Red value (0-255)
- `g` (number) - Green value (0-255)
- `b` (number) - Blue value (0-255)

**Returns:** Hex color string with # prefix

**Example:**
```typescript
rgbToHex(168, 85, 247);
// Returns: '#a855f7'

rgbToHex(255, 0, 0);
// Returns: '#ff0000' (red)

// Round-trip conversion
const hex = '#A855F7';
const rgb = hexToRgb(hex);
const backToHex = rgbToHex(rgb.r, rgb.g, rgb.b);
// backToHex === '#a855f7' (lowercase)
```

---

#### `hexWithAlpha(hex: string, alpha: number): string`

Adds alpha transparency to hex color (returns RGBA).

**Parameters:**
- `hex` (string) - Hex color code
- `alpha` (number) - Alpha value (0-1)

**Returns:** RGBA color string or original hex if invalid

**Example:**
```typescript
hexWithAlpha('#A855F7', 0.5);
// Returns: 'rgba(168, 85, 247, 0.5)'

hexWithAlpha(MEMBER_COLORS.RM, 0.3);
// Returns: 'rgba(37, 99, 235, 0.3)'

// Create glass effect
const glassBackground = hexWithAlpha(BORAHAE_COLORS.PRIMARY, 0.1);
```

---

#### `lightenColor(hex: string, percent: number): string`

Lightens a color by a percentage.

**Parameters:**
- `hex` (string) - Hex color code
- `percent` (number) - Percentage to lighten (0-100)

**Returns:** Lightened hex color

**Example:**
```typescript
lightenColor('#A855F7', 20);
// Returns lighter shade of purple

lightenColor(MEMBER_COLORS.V, 30);
// Returns 30% lighter green

// Create hover effects
const baseColor = BORAHAE_COLORS.PRIMARY;
const hoverColor = lightenColor(baseColor, 15);
```

---

#### `darkenColor(hex: string, percent: number): string`

Darkens a color by a percentage.

**Parameters:**
- `hex` (string) - Hex color code
- `percent` (number) - Percentage to darken (0-100)

**Returns:** Darkened hex color

**Example:**
```typescript
darkenColor('#A855F7', 20);
// Returns darker shade of purple

// Create shadow colors
const shadowColor = darkenColor(BORAHAE_COLORS.PRIMARY, 40);
```

---

### Math Helpers

#### `clamp(value: number, min: number, max: number): number`

(Documented in animations section above)

---

#### `lerp(start: number, end: number, t: number): number`

(Documented in animations section above)

---

#### `map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

Maps a value from one range to another.

**Parameters:**
- `value` (number) - Input value
- `inMin` (number) - Input range minimum
- `inMax` (number) - Input range maximum
- `outMin` (number) - Output range minimum
- `outMax` (number) - Output range maximum

**Returns:** Mapped value

**Example:**
```typescript
map(50, 0, 100, 0, 1);
// Returns: 0.5 (50% of 0-100 mapped to 0-1)

map(0, -1, 1, 0, 255);
// Returns: 127.5 (-1 to 1 range mapped to 0-255)

// Map audio levels to visual scale
const audioLevel = 0.7; // 70% volume
const particleSize = map(audioLevel, 0, 1, 1, 5);
// Returns: 3.8 (particle size based on audio)
```

---

#### `distance(x1: number, y1: number, x2: number, y2: number): number`

Calculates Euclidean distance between two points.

**Parameters:**
- `x1`, `y1` - First point coordinates
- `x2`, `y2` - Second point coordinates

**Returns:** Distance between points

**Formula:** `√((x2-x1)² + (y2-y1)²)`

**Example:**
```typescript
distance(0, 0, 3, 4);
// Returns: 5 (Pythagorean triple)

distance(100, 100, 200, 200);
// Returns: 141.42...

// Check if mouse is near a star
const star = { x: 300, y: 400 };
const mouse = { x: 310, y: 395 };
const dist = distance(star.x, star.y, mouse.x, mouse.y);
if (dist < 50) {
  // Star is within 50px of mouse
  highlightStar(star);
}
```

---

#### `angleBetween(x1: number, y1: number, x2: number, y2: number): number`

Calculates angle between two points in radians.

**Parameters:**
- `x1`, `y1` - First point coordinates
- `x2`, `y2` - Second point coordinates

**Returns:** Angle in radians (-π to π)

**Example:**
```typescript
angleBetween(0, 0, 1, 0);
// Returns: 0 (pointing right)

angleBetween(0, 0, 0, 1);
// Returns: π/2 (pointing down)

// Rotate element to point at mouse
const element = { x: 100, y: 100 };
const mouse = { x: 200, y: 150 };
const angle = angleBetween(element.x, element.y, mouse.x, mouse.y);
const degrees = angle * (180 / Math.PI);
elementRef.style.transform = `rotate(${degrees}deg)`;
```

---

### String Helpers

#### `capitalize(str: string): string`

Capitalizes the first letter of a string.

**Parameters:**
- `str` (string) - Input string

**Returns:** String with first letter capitalized

**Example:**
```typescript
capitalize('hello');
// Returns: 'Hello'

capitalize('ARMY');
// Returns: 'ARMY' (no change)

// Format member names
const memberName = capitalize('jungkook');
// Returns: 'Jungkook'
```

---

#### `toTitleCase(str: string): string`

Converts string to title case (capitalizes each word).

**Parameters:**
- `str` (string) - Input string

**Returns:** String in title case

**Example:**
```typescript
toTitleCase('blood sweat and tears');
// Returns: 'Blood Sweat And Tears'

toTitleCase('the most beautiful moment in life');
// Returns: 'The Most Beautiful Moment In Life'

// Format song titles
const songTitle = toTitleCase('spring day');
// Returns: 'Spring Day'
```

---

#### `truncate(str: string, maxLength: number, suffix?: string): string`

Truncates string to specified length with optional suffix.

**Parameters:**
- `str` (string) - Input string
- `maxLength` (number) - Maximum length
- `suffix` (string) - Suffix to append (default: '...')

**Returns:** Truncated string

**Example:**
```typescript
truncate('Blood, Sweat & Tears', 10);
// Returns: 'Blood, ...'

truncate('This is a long description', 15, '…');
// Returns: 'This is a lon…'

truncate('Short', 10);
// Returns: 'Short' (no truncation)

// Display song lyrics preview
const lyrics = "지나간 얼굴들 내 맘의 조각들...";
const preview = truncate(lyrics, 30);
```

---

#### `formatNumber(num: number): string`

Formats number with thousands separators.

**Parameters:**
- `num` (number) - Number to format

**Returns:** Formatted string with commas

**Example:**
```typescript
formatNumber(1000);
// Returns: '1,000'

formatNumber(1234567);
// Returns: '1,234,567'

// Display play counts
const plays = 54321000;
const formatted = formatNumber(plays);
// Returns: '54,321,000'
```

---

### Time Helpers

#### `formatDuration(seconds: number): string`

Formats duration in seconds to MM:SS format.

**Parameters:**
- `seconds` (number) - Duration in seconds

**Returns:** Formatted string 'MM:SS'

**Example:**
```typescript
formatDuration(65);
// Returns: '1:05'

formatDuration(245);
// Returns: '4:05'

formatDuration(45);
// Returns: '0:45'

// Display song duration
const songLength = 203; // 3 minutes 23 seconds
const display = formatDuration(songLength);
// Returns: '3:23'
```

---

#### `debounce<T>(func: T, wait: number): (...args) => void`

Creates a debounced function that delays execution.

**Parameters:**
- `func` - Function to debounce
- `wait` (number) - Delay in milliseconds

**Returns:** Debounced function

**Example:**
```typescript
// Debounce search input
const searchSongs = (query: string) => {
  console.log('Searching:', query);
};

const debouncedSearch = debounce(searchSongs, 300);

// User types 'spring'
debouncedSearch('s');      // Waits...
debouncedSearch('sp');     // Waits... (cancels previous)
debouncedSearch('spr');    // Waits... (cancels previous)
debouncedSearch('spring'); // Executes after 300ms

// Debounce window resize
const handleResize = debounce(() => {
  console.log('Window resized');
  recalculateLayout();
}, 250);

window.addEventListener('resize', handleResize);
```

---

#### `throttle<T>(func: T, limit: number): (...args) => void`

Creates a throttled function that limits execution frequency.

**Parameters:**
- `func` - Function to throttle
- `limit` (number) - Minimum time between executions (ms)

**Returns:** Throttled function

**Example:**
```typescript
// Throttle scroll handler
const handleScroll = () => {
  console.log('Scrolling:', window.scrollY);
};

const throttledScroll = throttle(handleScroll, 100);

window.addEventListener('scroll', throttledScroll);
// Executes at most once every 100ms

// Throttle mouse move for performance
const trackMouse = throttle((e: MouseEvent) => {
  updateStarPositions(e.clientX, e.clientY);
}, 16); // ~60fps

document.addEventListener('mousemove', trackMouse);
```

---

### DOM Helpers

#### `isInViewport(element: HTMLElement): boolean`

Checks if an element is visible in the viewport.

**Parameters:**
- `element` (HTMLElement) - DOM element to check

**Returns:** `true` if element is in viewport, `false` otherwise

**Example:**
```typescript
const card = document.querySelector('.member-card');
if (isInViewport(card)) {
  card.classList.add('animate-in');
}

// Lazy load images
images.forEach(img => {
  if (isInViewport(img)) {
    img.src = img.dataset.src; // Load image
  }
});

// Trigger animations on scroll
function onScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => {
    if (isInViewport(el)) {
      el.classList.add('animated');
    }
  });
}
```

---

#### `scrollToElement(element: HTMLElement, offset?: number, behavior?: ScrollBehavior): void`

Smoothly scrolls to an element.

**Parameters:**
- `element` (HTMLElement) - Target element
- `offset` (number) - Offset from element top in pixels (default: 0)
- `behavior` (ScrollBehavior) - Scroll behavior: 'smooth' | 'auto' (default: 'smooth')

**Returns:** void

**Example:**
```typescript
const section = document.getElementById('sonic-lab');
scrollToElement(section);
// Smoothly scrolls to section

scrollToElement(section, 100);
// Scrolls to 100px above section

scrollToElement(section, 0, 'auto');
// Instantly jumps to section

// Navigation menu
menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(item.dataset.target);
    scrollToElement(target, 80); // Account for fixed header
  });
});
```

---

### Array Helpers

#### `shuffle<T>(array: T[]): T[]`

Shuffles array using Fisher-Yates algorithm.

**Parameters:**
- `array` (T[]) - Array to shuffle

**Returns:** New shuffled array (original unchanged)

**Example:**
```typescript
const songs = ['Spring Day', 'Blood Sweat Tears', 'Dynamite'];
const shuffled = shuffle(songs);
// Returns: Random order like ['Dynamite', 'Spring Day', 'Blood Sweat Tears']

// Shuffle playlist
const playlist = shuffle(allSongs);

// Shuffle member order
const randomOrder = shuffle(BTS_MEMBERS);
```

---

#### `randomItem<T>(array: T[]): T`

Returns a random item from an array.

**Parameters:**
- `array` (T[]) - Source array

**Returns:** Random item from array

**Example:**
```typescript
const colors = ['#A855F7', '#D8B4FE', '#818CF8'];
const randomColor = randomItem(colors);
// Returns one of the colors

// Random member selector
const randomMember = randomItem(BTS_MEMBERS);

// Random song recommendation
const recommendation = randomItem(discography);
```

---

#### `chunk<T>(array: T[], size: number): T[][]`

Splits array into chunks of specified size.

**Parameters:**
- `array` (T[]) - Array to chunk
- `size` (number) - Chunk size

**Returns:** Array of chunks

**Example:**
```typescript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
chunk(numbers, 3);
// Returns: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

// Paginate songs
const songs = [...]; // 245 songs
const pages = chunk(songs, 20);
// Returns: 13 pages with 20 songs each (last page has 5)

// Grid layout
const items = chunk(allItems, 4);
items.forEach(row => {
  // Render row with 4 items
});
```

---

### Performance Helpers

#### `requestAnimFrame(): Function`

Cross-browser requestAnimationFrame with fallback.

**Returns:** Function for requesting animation frames

**Example:**
```typescript
let frame = 0;

function animate() {
  frame++;
  updateStars(frame);
  
  requestAnimFrame(animate);
}

animate();

// Smooth animation loop
const startTime = Date.now();

function render() {
  const elapsed = Date.now() - startTime;
  const rotation = (elapsed / 1000) * Math.PI * 2; // Full rotation per second
  
  updateMemberConstellation(rotation);
  requestAnimFrame(render);
}
```

---

#### `cancelAnimFrame(): Function`

Cross-browser cancelAnimationFrame with fallback.

**Returns:** Function for canceling animation frames

**Example:**
```typescript
let animId;

function startAnimation() {
  animId = requestAnimFrame(animate);
}

function stopAnimation() {
  cancelAnimFrame(animId);
}

// Start and stop animation
startAnimation();
setTimeout(stopAnimation, 5000); // Stop after 5 seconds
```

---

## Usage Patterns

### Creating the Cosmic Universe

```typescript
import { 
  generateStars, 
  generateBokehLights, 
  generateFloatingParticles 
} from '@/utils/animations';
import { UNIVERSE_COLORS } from '@/constants/colors';

// Generate all visual elements
const stars = generateStars(800, UNIVERSE_COLORS.STARS);
const bokeh = generateBokehLights(30);
const particles = generateFloatingParticles(50);

// Render in component
function Universe3D() {
  return (
    <>
      <StarField stars={stars} />
      <BokehLayer lights={bokeh} />
      <ParticleLayer particles={particles} />
    </>
  );
}
```

### Member Constellation Layout

```typescript
import { calculateOrbitalPosition } from '@/utils/animations';
import { MEMBER_COLORS, getMemberColor } from '@/constants/colors';

const MEMBERS = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];

function MemberConstellation() {
  return (
    <div className="constellation">
      {MEMBERS.map((id, index) => {
        const pos = calculateOrbitalPosition(index, 7, 200);
        const color = getMemberColor(id);
        
        return (
          <div
            key={id}
            className="member-star"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}
```

### Smooth Animations

```typescript
import { lerp, easeInOutCubic } from '@/utils/animations';
import { debounce } from '@/utils/helpers';

function animateToValue(from: number, to: number, duration: number) {
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    const current = lerp(from, to, eased);
    
    updateDisplay(current);
    
    if (progress < 1) {
      requestAnimFrame(update);
    }
  }
  
  requestAnimFrame(update);
}

// Debounced search
const handleSearch = debounce((query: string) => {
  searchDiscography(query);
}, 300);
```

---

## Performance Notes

### Optimization Tips

1. **Star Generation**: Use memoization for `generateStars()` to avoid recreating on every render
2. **Animation Frames**: Always use `requestAnimFrame` instead of `setInterval` for smooth 60fps
3. **Debounce/Throttle**: Apply to event handlers that fire frequently (scroll, resize, input)
4. **Array Operations**: `shuffle` and `chunk` create new arrays - consider reusing when possible
5. **Color Conversions**: Cache `hexToRgb` results if converting the same color multiple times

### Best Practices

```typescript
// ✅ Good: Memoize expensive calculations
const stars = useMemo(
  () => generateStars(800, UNIVERSE_COLORS.STARS),
  []
);

// ❌ Bad: Recreating on every render
const stars = generateStars(800, UNIVERSE_COLORS.STARS);

// ✅ Good: Throttle high-frequency events
const handleMouseMove = throttle((e) => {
  updateParallax(e.clientX, e.clientY);
}, 16);

// ❌ Bad: Executing on every mouse move
const handleMouseMove = (e) => {
  updateParallax(e.clientX, e.clientY);
};
```

---

## TypeScript Types

All functions are fully typed. Import types from:

```typescript
import type {
  Star,
  BokehBubble,
  FloatingParticle,
  Position3D,
} from '@/types';
```

---

## Contributing

When adding new utility functions:

1. Add comprehensive JSDoc with `@param`, `@returns`, and `@example` tags
2. Include TypeScript types for all parameters and return values
3. Write at least 2-3 usage examples
4. Update this API.md documentation
5. Consider performance implications
6. Add unit tests in `__tests__/`

---

## Related Documentation

- [Color Constants Documentation](../src/constants/colors.ts)
- [Type Definitions](../src/types.ts)
- [Component Usage Guide](./COMPONENTS.md) *(coming soon)*
- [Animation Guide](./ANIMATIONS.md) *(coming soon)*

---

Made with 💜 for BTS & ARMY

*"어떤 빛이 맞는 빛일까 (Which light would be the right one?)" - Mikrokosmos*
