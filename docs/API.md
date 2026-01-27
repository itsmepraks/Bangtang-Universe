# BTS Neural Archive - Utility Functions API Reference

Comprehensive documentation for all utility functions in the `src/utils/` directory.

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

Functions from `src/utils/animations.ts`

### `generateParticles(count: number): FloatingParticle[]`

Generates random particle properties for floating animations.

**Parameters:**
- `count` (number): Number of particles to generate

**Returns:** `FloatingParticle[]` - Array of particle configuration objects

**Example:**
```typescript
import { generateParticles } from '@/utils/animations';

const particles = generateParticles(50);
// Returns array of 50 particle objects with random positions, delays, durations, and sizes

particles.forEach((particle, i) => {
  console.log(`Particle ${i}:`, {
    position: `${particle.left}, ${particle.top}`,
    delay: `${particle.delay}s`,
    duration: `${particle.duration}s`,
    size: `${particle.size}px`
  });
});
```

**Use Case:** Creating ambient floating particles for the cosmic background.

---

### `generateBokehLights(count: number): BokehBubble[]`

Generates bokeh light properties for the "Purple Ocean" effect (ARMY bomb lights).

**Parameters:**
- `count` (number): Number of bokeh lights to generate

**Returns:** `BokehBubble[]` - Array of bokeh configuration objects

**Example:**
```typescript
import { generateBokehLights } from '@/utils/animations';

const bokehBubbles = generateBokehLights(30);
// Creates 30 bokeh light configurations

bokehBubbles.forEach(bubble => {
  console.log(`Bokeh: Size ${bubble.size}px, Duration ${bubble.duration}s`);
});
```

**Use Case:** Creating the signature "Purple Ocean" bokeh effect representing ARMY bombs.

---

### `generateStars(count: number, colors: string[]): Star[]`

Generates 3D star positions for the cosmic universe using spherical coordinates.

**Parameters:**
- `count` (number): Number of stars to generate
- `colors` (string[]): Array of hex color values for stars

**Returns:** `Star[]` - Array of star configuration objects with 3D coordinates

**Example:**
```typescript
import { generateStars } from '@/utils/animations';
import { UNIVERSE_COLORS } from '@/constants/colors';

const stars = generateStars(800, UNIVERSE_COLORS.STARS);
// Creates 800 stars with Borahae purple color variations

stars.forEach(star => {
  console.log(`Star:`, {
    theta: star.theta,      // Azimuthal angle (0 to 2π)
    phi: star.phi,          // Polar angle (0 to π)
    radius: star.r,         // Distance from center
    size: star.size,        // Visual size in pixels
    color: star.color       // Hex color code
  });
});
```

**Use Case:** Creating the 800+ star cosmic universe background.

---

### `sphericalToCartesian(theta: number, phi: number, r: number): Position3D`

Converts spherical coordinates to 3D Cartesian coordinates.

**Parameters:**
- `theta` (number): Azimuthal angle in radians (horizontal rotation)
- `phi` (number): Polar angle in radians (vertical angle)
- `r` (number): Radius (distance from origin)

**Returns:** `{ x: number, y: number, z: number }` - Cartesian coordinates

**Example:**
```typescript
import { sphericalToCartesian } from '@/utils/animations';

const spherical = { theta: Math.PI / 4, phi: Math.PI / 3, r: 500 };
const cartesian = sphericalToCartesian(
  spherical.theta, 
  spherical.phi, 
  spherical.r
);

console.log(cartesian); 
// { x: 216.5, y: 375.0, z: 250.0 }
```

**Mathematical Background:**
- x = r × sin(φ) × cos(θ)
- y = r × sin(φ) × sin(θ)  
- z = r × cos(φ)

**Use Case:** Converting spherical star positions to screen coordinates for rendering.

---

### `calculateOrbitalPosition(index: number, totalMembers?: number, distance?: number): { x: number, y: number, angle: number }`

Calculates orbital position for member constellation (7 members in a circle).

**Parameters:**
- `index` (number): Member index (0-6)
- `totalMembers` (number, optional): Total number of members (default: 7)
- `distance` (number, optional): Distance from center (default: 100)

**Returns:** Object with `x`, `y` coordinates and `angle` in radians

**Example:**
```typescript
import { calculateOrbitalPosition } from '@/utils/animations';

// Position all 7 BTS members in a circular constellation
const memberIds = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];
const memberPositions = memberIds.map((id, index) => ({
  id,
  ...calculateOrbitalPosition(index, 7, 150)
}));

memberPositions.forEach(member => {
  console.log(`${member.id}: (${member.x}, ${member.y}), angle: ${member.angle}`);
});
// rm: (150, 0), angle: 0
// jin: (106.07, 106.07), angle: 0.898
// suga: (0, 150), angle: 1.571
// ... etc.
```

**Use Case:** Positioning the 7 BTS members as a constellation in the landing ritual.

---

### `getStaggerDelay(index: number, baseDelay?: number, increment?: number): string`

Generates a staggered animation delay for sequential animations.

**Parameters:**
- `index` (number): Element index in sequence
- `baseDelay` (number, optional): Base delay in milliseconds (default: 0)
- `increment` (number, optional): Delay increment per index (default: 100ms)

**Returns:** `string` - Delay string for CSS (e.g., "300ms")

**Example:**
```typescript
import { getStaggerDelay } from '@/utils/animations';

// Staggered fade-in for navigation items
const navItems = ['Home', 'Explore', 'Archive', 'About'];
navItems.forEach((item, index) => {
  const delay = getStaggerDelay(index, 200, 150);
  console.log(`${item}: animation-delay: ${delay}`);
});
// Home: animation-delay: 200ms
// Explore: animation-delay: 350ms
// Archive: animation-delay: 500ms
// About: animation-delay: 650ms
```

**Use Case:** Creating smooth, sequential animations for lists or grids.

---

### `easeInOutCubic(t: number): number`

Cubic easing function for smooth animations.

**Parameters:**
- `t` (number): Progress value between 0 and 1

**Returns:** `number` - Eased value between 0 and 1

**Example:**
```typescript
import { easeInOutCubic } from '@/utils/animations';

// Smooth transition from 0 to 1
for (let i = 0; i <= 10; i++) {
  const t = i / 10;
  const eased = easeInOutCubic(t);
  console.log(`t: ${t.toFixed(1)}, eased: ${eased.toFixed(3)}`);
}
// t: 0.0, eased: 0.000
// t: 0.1, eased: 0.004
// t: 0.2, eased: 0.032
// t: 0.5, eased: 0.500 (midpoint)
// t: 0.8, eased: 0.968
// t: 1.0, eased: 1.000
```

**Use Case:** Creating natural-feeling animations (acceleration and deceleration).

---

### `clamp(value: number, min: number, max: number): number`

Constrains a value between minimum and maximum bounds.

**Parameters:**
- `value` (number): Value to clamp
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** `number` - Clamped value

**Example:**
```typescript
import { clamp } from '@/utils/animations';

clamp(50, 0, 100);   // 50 (within range)
clamp(-10, 0, 100);  // 0 (below minimum)
clamp(150, 0, 100);  // 100 (above maximum)

// Practical use: keeping values in valid range
const opacity = clamp(userInput, 0, 1);
const volume = clamp(volumeLevel, 0, 100);
```

**Use Case:** Ensuring values stay within valid ranges (opacity, volume, coordinates).

---

### `lerp(start: number, end: number, t: number): number`

Linear interpolation between two values.

**Parameters:**
- `start` (number): Start value
- `end` (number): End value
- `t` (number): Progress (0 to 1)

**Returns:** `number` - Interpolated value

**Example:**
```typescript
import { lerp } from '@/utils/animations';

// Animate from 0 to 100 over 10 frames
for (let frame = 0; frame <= 10; frame++) {
  const progress = frame / 10;
  const value = lerp(0, 100, progress);
  console.log(`Frame ${frame}: ${value}`);
}
// Frame 0: 0
// Frame 5: 50
// Frame 10: 100

// Color transitions
const startColor = 168; // R value of #A855F7
const endColor = 255;   // R value of #FFFFFF
const midColor = lerp(startColor, endColor, 0.5); // 211.5
```

**Use Case:** Smooth transitions, animations, and color blending.

---

### `randomInRange(min: number, max: number): number`

Generates a random number within a specified range.

**Parameters:**
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** `number` - Random value between min and max

**Example:**
```typescript
import { randomInRange } from '@/utils/animations';

const randomSize = randomInRange(1, 5);        // Random star size
const randomDelay = randomInRange(0, 3);       // Random animation delay
const randomOpacity = randomInRange(0.5, 1.0); // Random opacity

console.log(`Star: size ${randomSize}px, delay ${randomDelay}s, opacity ${randomOpacity}`);
```

**Use Case:** Adding randomness to animations and visual elements.

---

## Helper Functions

Functions from `src/utils/helpers.ts`

### Animation Helpers

#### `randomPosition(): { left: string, top: string }`

Generates a random position within viewport bounds.

**Returns:** Object with `left` and `top` as percentage strings

**Example:**
```typescript
import { randomPosition } from '@/utils/helpers';

const pos = randomPosition();
console.log(pos); // { left: '73.45%', top: '28.91%' }

// Use in styling
<div style={{ position: 'absolute', ...randomPosition() }}>
  Floating element
</div>
```

---

#### `randomDelay(max?: number): number`

Creates a random delay for staggered animations.

**Parameters:**
- `max` (number, optional): Maximum delay in seconds (default: 5)

**Returns:** `number` - Random delay value

**Example:**
```typescript
import { randomDelay } from '@/utils/helpers';

const delay = randomDelay(3);
console.log(`Animation delay: ${delay}s`); // 0-3 seconds
```

---

#### `randomDuration(min: number, max: number): number`

Creates a random duration within a range.

**Parameters:**
- `min` (number): Minimum duration in seconds
- `max` (number): Maximum duration in seconds

**Returns:** `number` - Random duration value

**Example:**
```typescript
import { randomDuration } from '@/utils/helpers';

const duration = randomDuration(10, 20);
console.log(`Animation duration: ${duration}s`); // 10-20 seconds
```

---

### Color Helpers

#### `hexToRgb(hex: string): { r: number, g: number, b: number } | null`

Converts hex color to RGB values.

**Parameters:**
- `hex` (string): Hex color code (with or without '#')

**Returns:** RGB object or `null` if invalid

**Example:**
```typescript
import { hexToRgb } from '@/utils/helpers';

const rgb = hexToRgb('#A855F7');
console.log(rgb); // { r: 168, g: 85, b: 247 }

const rgb2 = hexToRgb('A855F7'); // Works without '#'
```

---

#### `rgbToHex(r: number, g: number, b: number): string`

Converts RGB values to hex color.

**Parameters:**
- `r` (number): Red value (0-255)
- `g` (number): Green value (0-255)
- `b` (number): Blue value (0-255)

**Returns:** `string` - Hex color code with '#' prefix

**Example:**
```typescript
import { rgbToHex } from '@/utils/helpers';

const hex = rgbToHex(168, 85, 247);
console.log(hex); // '#A855F7'
```

---

#### `hexWithAlpha(hex: string, alpha: number): string`

Adds alpha transparency to hex color.

**Parameters:**
- `hex` (string): Hex color code
- `alpha` (number): Alpha value (0-1)

**Returns:** `string` - RGBA color string

**Example:**
```typescript
import { hexWithAlpha } from '@/utils/helpers';

const rgba = hexWithAlpha('#A855F7', 0.5);
console.log(rgba); // 'rgba(168, 85, 247, 0.5)'
```

---

#### `lightenColor(hex: string, percent: number): string`

Lightens a color by a percentage.

**Parameters:**
- `hex` (string): Hex color code
- `percent` (number): Percentage to lighten (0-100)

**Returns:** `string` - Lightened hex color

**Example:**
```typescript
import { lightenColor } from '@/utils/helpers';

const lighter = lightenColor('#A855F7', 20);
// Returns lighter purple shade
```

---

#### `darkenColor(hex: string, percent: number): string`

Darkens a color by a percentage.

**Parameters:**
- `hex` (string): Hex color code
- `percent` (number): Percentage to darken (0-100)

**Returns:** `string` - Darkened hex color

**Example:**
```typescript
import { darkenColor } from '@/utils/helpers';

const darker = darkenColor('#A855F7', 20);
// Returns darker purple shade
```

---

### Math Helpers

#### `map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

Maps a value from one range to another.

**Parameters:**
- `value` (number): Input value
- `inMin` (number): Input range minimum
- `inMax` (number): Input range maximum
- `outMin` (number): Output range minimum
- `outMax` (number): Output range maximum

**Returns:** `number` - Mapped value

**Example:**
```typescript
import { map } from '@/utils/helpers';

// Map mouse position (0-1920px) to opacity (0-1)
const mouseX = 960;
const opacity = map(mouseX, 0, 1920, 0, 1);
console.log(opacity); // 0.5

// Map BPM (60-180) to color intensity (0-255)
const bpm = 120;
const intensity = map(bpm, 60, 180, 0, 255);
console.log(intensity); // 127.5
```

---

#### `distance(x1: number, y1: number, x2: number, y2: number): number`

Calculates Euclidean distance between two points.

**Parameters:**
- `x1`, `y1`: Coordinates of first point
- `x2`, `y2`: Coordinates of second point

**Returns:** `number` - Distance between points

**Example:**
```typescript
import { distance } from '@/utils/helpers';

const dist = distance(0, 0, 3, 4);
console.log(dist); // 5 (Pythagorean theorem: 3² + 4² = 5²)

// Check if cursor is near an element
const cursorX = 100, cursorY = 100;
const elementX = 150, elementY = 150;
const distToCursor = distance(cursorX, cursorY, elementX, elementY);
if (distToCursor < 50) {
  console.log('Cursor is near element!');
}
```

---

#### `angleBetween(x1: number, y1: number, x2: number, y2: number): number`

Calculates angle between two points in radians.

**Parameters:**
- `x1`, `y1`: Coordinates of first point
- `x2`, `y2`: Coordinates of second point

**Returns:** `number` - Angle in radians

**Example:**
```typescript
import { angleBetween } from '@/utils/helpers';

const angle = angleBetween(0, 0, 1, 1);
console.log(angle); // 0.785 radians (45 degrees)

// Convert to degrees
const degrees = (angle * 180) / Math.PI;
console.log(degrees); // 45
```

---

### String Helpers

#### `capitalize(str: string): string`

Capitalizes the first letter of a string.

**Parameters:**
- `str` (string): Input string

**Returns:** `string` - Capitalized string

**Example:**
```typescript
import { capitalize } from '@/utils/helpers';

capitalize('hello');      // 'Hello'
capitalize('WORLD');      // 'WORLD'
capitalize('borahae');    // 'Borahae'
```

---

#### `toTitleCase(str: string): string`

Converts string to title case (capitalizes each word).

**Parameters:**
- `str` (string): Input string

**Returns:** `string` - Title-cased string

**Example:**
```typescript
import { toTitleCase } from '@/utils/helpers';

toTitleCase('hello world');           // 'Hello World'
toTitleCase('boy with luv');          // 'Boy With Luv'
toTitleCase('map of the soul: 7');    // 'Map Of The Soul: 7'
```

---

#### `truncate(str: string, maxLength: number, suffix?: string): string`

Truncates string to specified length.

**Parameters:**
- `str` (string): Input string
- `maxLength` (number): Maximum length
- `suffix` (string, optional): Suffix to add (default: '...')

**Returns:** `string` - Truncated string

**Example:**
```typescript
import { truncate } from '@/utils/helpers';

truncate('This is a very long song title', 20);
// 'This is a very lo...'

truncate('Short', 20);
// 'Short' (unchanged - below max length)

truncate('Custom suffix example', 15, '…');
// 'Custom suffix…'
```

---

#### `formatNumber(num: number): string`

Formats a number with commas as thousands separators.

**Parameters:**
- `num` (number): Number to format

**Returns:** `string` - Formatted number string

**Example:**
```typescript
import { formatNumber } from '@/utils/helpers';

formatNumber(1000);        // '1,000'
formatNumber(1234567);     // '1,234,567'
formatNumber(42);          // '42'

// Use in UI
<div>{formatNumber(views)} views</div>
// Displays: "1,234,567 views"
```

---

### Time Helpers

#### `formatDuration(seconds: number): string`

Formats duration in seconds to MM:SS format.

**Parameters:**
- `seconds` (number): Duration in seconds

**Returns:** `string` - Formatted duration string

**Example:**
```typescript
import { formatDuration } from '@/utils/helpers';

formatDuration(65);      // '1:05'
formatDuration(130);     // '2:10'
formatDuration(3600);    // '60:00'
formatDuration(45);      // '0:45'
```

---

#### `debounce<T>(func: T, wait: number): Function`

Debounces a function (delays execution until after wait time).

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (number): Wait time in milliseconds

**Returns:** `Function` - Debounced function

**Example:**
```typescript
import { debounce } from '@/utils/helpers';

const searchSongs = debounce((query: string) => {
  console.log('Searching for:', query);
  // API call here
}, 300);

// User types "BTS" quickly
searchSongs('B');   // Cancelled
searchSongs('BT');  // Cancelled
searchSongs('BTS'); // Executes after 300ms of no typing
```

---

#### `throttle<T>(func: T, limit: number): Function`

Throttles a function (limits execution frequency).

**Parameters:**
- `func` (Function): Function to throttle
- `limit` (number): Minimum time between executions in milliseconds

**Returns:** `Function` - Throttled function

**Example:**
```typescript
import { throttle } from '@/utils/helpers';

const trackScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', trackScroll);
// Executes at most once every 100ms, even if scrolling rapidly
```

---

### DOM Helpers

#### `isInViewport(element: HTMLElement): boolean`

Checks if an element is visible in the viewport.

**Parameters:**
- `element` (HTMLElement): DOM element to check

**Returns:** `boolean` - True if element is in viewport

**Example:**
```typescript
import { isInViewport } from '@/utils/helpers';

const card = document.querySelector('.member-card');
if (card && isInViewport(card)) {
  card.classList.add('animate');
}

// Lazy loading images
images.forEach(img => {
  if (isInViewport(img)) {
    img.src = img.dataset.src;
  }
});
```

---

#### `scrollToElement(element: HTMLElement, offset?: number, behavior?: ScrollBehavior): void`

Smoothly scrolls to an element.

**Parameters:**
- `element` (HTMLElement): Target element
- `offset` (number, optional): Offset from element top (default: 0)
- `behavior` (ScrollBehavior, optional): Scroll behavior (default: 'smooth')

**Returns:** `void`

**Example:**
```typescript
import { scrollToElement } from '@/utils/helpers';

const section = document.querySelector('#sonic-lab');
if (section) {
  scrollToElement(section, 80); // 80px offset for fixed header
}

// Instant scroll
scrollToElement(section, 0, 'auto');
```

---

### Array Helpers

#### `shuffle<T>(array: T[]): T[]`

Shuffles an array using Fisher-Yates algorithm.

**Parameters:**
- `array` (T[]): Array to shuffle

**Returns:** `T[]` - New shuffled array

**Example:**
```typescript
import { shuffle } from '@/utils/helpers';

const songs = ['Dynamite', 'Butter', 'Permission to Dance'];
const shuffled = shuffle(songs);
console.log(shuffled); // Random order, e.g., ['Butter', 'Permission to Dance', 'Dynamite']

// Original array is unchanged
console.log(songs); // ['Dynamite', 'Butter', 'Permission to Dance']
```

---

#### `randomItem<T>(array: T[]): T`

Gets a random item from an array.

**Parameters:**
- `array` (T[]): Input array

**Returns:** `T` - Random item from array

**Example:**
```typescript
import { randomItem } from '@/utils/helpers';

const colors = ['#A855F7', '#D8B4FE', '#818CF8', '#C084FC'];
const randomColor = randomItem(colors);
console.log(randomColor); // Random purple shade

const members = ['RM', 'Jin', 'SUGA', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
const featuredMember = randomItem(members);
```

---

#### `chunk<T>(array: T[], size: number): T[][]`

Splits an array into chunks of specified size.

**Parameters:**
- `array` (T[]): Input array
- `size` (number): Chunk size

**Returns:** `T[][]` - Array of chunks

**Example:**
```typescript
import { chunk } from '@/utils/helpers';

const songs = ['Song 1', 'Song 2', 'Song 3', 'Song 4', 'Song 5'];
const pages = chunk(songs, 2);
console.log(pages);
// [['Song 1', 'Song 2'], ['Song 3', 'Song 4'], ['Song 5']]

// Pagination
const itemsPerPage = 12;
const songPages = chunk(allSongs, itemsPerPage);
const currentPage = songPages[pageNumber];
```

---

### Performance Helpers

#### `requestAnimFrame: (callback: FrameRequestCallback) => number`

Request animation frame with cross-browser fallback.

**Example:**
```typescript
import { requestAnimFrame } from '@/utils/helpers';

function animate() {
  // Animation logic
  updateStarPositions();
  
  requestAnimFrame(animate);
}

requestAnimFrame(animate);
```

---

#### `cancelAnimFrame: (handle: number) => void`

Cancel animation frame with cross-browser fallback.

**Example:**
```typescript
import { requestAnimFrame, cancelAnimFrame } from '@/utils/helpers';

let animationId: number;

function startAnimation() {
  animationId = requestAnimFrame(animate);
}

function stopAnimation() {
  cancelAnimFrame(animationId);
}
```

---

## Usage Patterns

### Common Combinations

#### Creating a Floating Star with Random Properties
```typescript
import { randomPosition, randomDelay, randomItem } from '@/utils/helpers';
import { UNIVERSE_COLORS } from '@/constants/colors';

const star = {
  ...randomPosition(),
  color: randomItem(UNIVERSE_COLORS.STARS),
  animationDelay: randomDelay(5),
  size: Math.random() * 3 + 1
};
```

#### Smooth Color Transition Animation
```typescript
import { lerp, easeInOutCubic, hexToRgb, rgbToHex } from '@/utils/helpers';

function transitionColor(startHex: string, endHex: string, progress: number) {
  const start = hexToRgb(startHex)!;
  const end = hexToRgb(endHex)!;
  const eased = easeInOutCubic(progress);
  
  return rgbToHex(
    lerp(start.r, end.r, eased),
    lerp(start.g, end.g, eased),
    lerp(start.b, end.b, eased)
  );
}
```

#### Debounced Search with Throttled Scroll
```typescript
import { debounce, throttle } from '@/utils/helpers';

const handleSearch = debounce((query: string) => {
  performSearch(query);
}, 300);

const handleScroll = throttle(() => {
  checkLazyImages();
}, 100);
```

---

## Performance Considerations

- **Debounce vs Throttle**: Use debounce for actions that should wait (search input), throttle for frequent events (scroll, resize)
- **Animation Frame**: Always use `requestAnimFrame` for smooth 60fps animations
- **Array Operations**: `shuffle`, `chunk`, and `randomItem` create new arrays (immutable)
- **Color Conversions**: Cache results if converting the same colors repeatedly
- **DOM Queries**: Store element references instead of repeated querySelector calls

---

## TypeScript Types

All functions are fully typed. Import types from:
```typescript
import type { Star, BokehBubble, FloatingParticle, Position3D } from '@/types';
```

---

**Made with 💜 for BTS & ARMY**

*"작은 것들을 위한 시 (A poem for small things)" — BTS*
