# BTS Neural Archive - Utility Functions API Reference

> Comprehensive documentation for all utility functions in the BTS Neural Archive application.

## Table of Contents

- [Animation Utilities](#animation-utilities)
- [Helper Utilities](#helper-utilities)
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

Functions from `src/utils/animations.ts` for creating and managing animations.

### `generateParticles(count: number): FloatingParticle[]`

Generates random particle properties for floating animations.

**Parameters:**
- `count` (number): Number of particles to generate

**Returns:** Array of `FloatingParticle` configuration objects

**Example:**
```typescript
import { generateParticles } from '@/utils/animations';

// Generate 50 particles for background effect
const particles = generateParticles(50);

particles.forEach(particle => {
  console.log(particle);
  // { left: '45.3%', top: '67.8%', delay: 2.3, duration: 15.7, size: 2.4 }
});
```

---

### `generateBokehLights(count: number): BokehBubble[]`

Generates bokeh light properties for the purple ocean effect.

**Parameters:**
- `count` (number): Number of bokeh lights to generate

**Returns:** Array of `BokehBubble` configuration objects

**Example:**
```typescript
import { generateBokehLights } from '@/utils/animations';

// Create purple ocean effect with 30 bokeh bubbles
const bokehBubbles = generateBokehLights(30);

// Use in component
function PurpleOcean() {
  const bubbles = generateBokehLights(30);
  return (
    <div className="purple-ocean">
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          className="bokeh-bubble"
          style={{
            left: bubble.left,
            top: bubble.top,
            width: bubble.size,
            height: bubble.size,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`
          }}
        />
      ))}
    </div>
  );
}
```

---

### `generateStars(count: number, colors: string[]): Star[]`

Generates 3D star positions for the cosmic universe background.

**Parameters:**
- `count` (number): Number of stars to generate
- `colors` (string[]): Array of color values for stars

**Returns:** Array of `Star` configuration objects with 3D coordinates

**Example:**
```typescript
import { generateStars } from '@/utils/animations';
import { UNIVERSE_COLORS } from '@/constants/colors';

// Generate 800 stars with Borahae colors
const stars = generateStars(800, UNIVERSE_COLORS.STARS);

stars.forEach(star => {
  const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
  // Position star in 3D space
});
```

---

### `sphericalToCartesian(theta: number, phi: number, r: number): { x: number; y: number; z: number }`

Converts spherical coordinates to 3D Cartesian coordinates.

**Parameters:**
- `theta` (number): Azimuthal angle (horizontal rotation)
- `phi` (number): Polar angle (vertical angle from axis)
- `r` (number): Radius (distance from origin)

**Returns:** Object with `x`, `y`, `z` coordinates

**Example:**
```typescript
import { sphericalToCartesian } from '@/utils/animations';

// Convert spherical to Cartesian
const position = sphericalToCartesian(Math.PI / 4, Math.PI / 3, 500);
// Returns: { x: 216.5, y: 375.0, z: 250.0 }

// Use for 3D star positioning
const star = {
  theta: Math.random() * 2 * Math.PI,
  phi: Math.acos(Math.random() * 2 - 1),
  r: 1000
};
const { x, y, z } = sphericalToCartesian(star.theta, star.phi, star.r);
```

---

### `calculateOrbitalPosition(index: number, totalMembers?: number, distance?: number)`

Calculates orbital position for member constellation.

**Parameters:**
- `index` (number): Member index (0-based)
- `totalMembers` (number, optional): Total number of members (default: 7)
- `distance` (number, optional): Distance from center (default: 100)

**Returns:** Object with `x`, `y` coordinates and `angle`

**Example:**
```typescript
import { calculateOrbitalPosition } from '@/utils/animations';

// Calculate positions for 7 BTS members in a circle
const memberPositions = Array.from({ length: 7 }, (_, i) => 
  calculateOrbitalPosition(i, 7, 150)
);

// Position member icons
memberPositions.forEach((pos, i) => {
  console.log(`Member ${i}: x=${pos.x}, y=${pos.y}, angle=${pos.angle}`);
});
```

---

### `getStaggerDelay(index: number, baseDelay?: number, increment?: number): string`

Generates a staggered delay for animations.

**Parameters:**
- `index` (number): Element index
- `baseDelay` (number, optional): Base delay in milliseconds (default: 0)
- `increment` (number, optional): Delay increment per index (default: 100)

**Returns:** CSS delay string (e.g., "300ms")

**Example:**
```typescript
import { getStaggerDelay } from '@/utils/animations';

// Create staggered entrance animation
const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

function StaggeredList() {
  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            animationDelay: getStaggerDelay(i, 200, 150)
          }}
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

Creates cubic easing for smooth animations.

**Parameters:**
- `t` (number): Current time/progress (0-1)

**Returns:** Eased value (0-1)

**Example:**
```typescript
import { easeInOutCubic } from '@/utils/animations';

// Animate value smoothly
function animateValue(start: number, end: number, duration: number) {
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    const currentValue = start + (end - start) * easedProgress;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}
```

---

### `clamp(value: number, min: number, max: number): number`

Clamps a value between minimum and maximum bounds.

**Parameters:**
- `value` (number): Value to clamp
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** Clamped value

**Example:**
```typescript
import { clamp } from '@/utils/animations';

clamp(15, 0, 10);   // Returns: 10
clamp(-5, 0, 10);   // Returns: 0
clamp(7, 0, 10);    // Returns: 7

// Use for volume control
function setVolume(vol: number) {
  return clamp(vol, 0, 100);
}
```

---

### `lerp(start: number, end: number, t: number): number`

Linear interpolation between two values.

**Parameters:**
- `start` (number): Start value
- `end` (number): End value
- `t` (number): Progress (0-1)

**Returns:** Interpolated value

**Example:**
```typescript
import { lerp } from '@/utils/animations';

lerp(0, 100, 0);    // Returns: 0
lerp(0, 100, 0.5);  // Returns: 50
lerp(0, 100, 1);    // Returns: 100

// Smooth color transition
const startOpacity = 0;
const endOpacity = 1;
const currentOpacity = lerp(startOpacity, endOpacity, progress);
```

---

### `randomInRange(min: number, max: number): number`

Generates a random value within a range.

**Parameters:**
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** Random value between min and max

**Example:**
```typescript
import { randomInRange } from '@/utils/animations';

// Random star size between 0.5 and 3
const starSize = randomInRange(0.5, 3);

// Random animation duration
const duration = randomInRange(10, 20);
```

---

## Helper Utilities

Functions from `src/utils/helpers.ts` for various common operations.

### Animation Helpers

#### `randomPosition(): { left: string; top: string }`

Generates random position within viewport bounds.

**Returns:** Object with `left` and `top` percentage strings

**Example:**
```typescript
import { randomPosition } from '@/utils/helpers';

const pos = randomPosition();
// Returns: { left: '45.67%', top: '23.89%' }
```

---

#### `randomDelay(max?: number): number`

Creates a random delay for staggered animations.

**Parameters:**
- `max` (number, optional): Maximum delay in seconds (default: 5)

**Returns:** Random delay value

**Example:**
```typescript
import { randomDelay } from '@/utils/helpers';

const delay = randomDelay(3);
// Returns: Random value between 0 and 3
```

---

#### `randomDuration(min: number, max: number): number`

Creates a random duration within a range.

**Parameters:**
- `min` (number): Minimum duration in seconds
- `max` (number): Maximum duration in seconds

**Returns:** Random duration

**Example:**
```typescript
import { randomDuration } from '@/utils/helpers';

const duration = randomDuration(5, 15);
// Returns: Random value between 5 and 15
```

---

### Color Helpers

#### `hexToRgb(hex: string): { r: number; g: number; b: number } | null`

Converts hex color to RGB values.

**Parameters:**
- `hex` (string): Hex color code (with or without #)

**Returns:** RGB object or null if invalid

**Example:**
```typescript
import { hexToRgb } from '@/utils/helpers';

const rgb = hexToRgb('#A855F7');
// Returns: { r: 168, g: 85, b: 247 }

const rgb2 = hexToRgb('EC4899');
// Returns: { r: 236, g: 72, b: 153 }
```

---

#### `rgbToHex(r: number, g: number, b: number): string`

Converts RGB to hex color.

**Parameters:**
- `r` (number): Red value (0-255)
- `g` (number): Green value (0-255)
- `b` (number): Blue value (0-255)

**Returns:** Hex color string

**Example:**
```typescript
import { rgbToHex } from '@/utils/helpers';

const hex = rgbToHex(168, 85, 247);
// Returns: '#a855f7'
```

---

#### `hexWithAlpha(hex: string, alpha: number): string`

Adds alpha transparency to hex color.

**Parameters:**
- `hex` (string): Hex color code
- `alpha` (number): Alpha value (0-1)

**Returns:** RGBA color string

**Example:**
```typescript
import { hexWithAlpha } from '@/utils/helpers';

const color = hexWithAlpha('#A855F7', 0.5);
// Returns: 'rgba(168, 85, 247, 0.5)'
```

---

#### `lightenColor(hex: string, percent: number): string`

Lightens a color by a percentage.

**Parameters:**
- `hex` (string): Hex color code
- `percent` (number): Percentage to lighten (0-100)

**Returns:** Lightened hex color

**Example:**
```typescript
import { lightenColor } from '@/utils/helpers';

const lighter = lightenColor('#A855F7', 20);
// Returns: Lighter version of the purple
```

---

#### `darkenColor(hex: string, percent: number): string`

Darkens a color by a percentage.

**Parameters:**
- `hex` (string): Hex color code
- `percent` (number): Percentage to darken (0-100)

**Returns:** Darkened hex color

**Example:**
```typescript
import { darkenColor } from '@/utils/helpers';

const darker = darkenColor('#A855F7', 20);
// Returns: Darker version of the purple
```

---

### Math Helpers

#### `clamp(value: number, min: number, max: number): number`

Clamps a value between min and max.

**Parameters:**
- `value` (number): Value to clamp
- `min` (number): Minimum value
- `max` (number): Maximum value

**Returns:** Clamped value

**Example:**
```typescript
import { clamp } from '@/utils/helpers';

clamp(150, 0, 100);  // Returns: 100
clamp(-10, 0, 100);  // Returns: 0
clamp(50, 0, 100);   // Returns: 50
```

---

#### `lerp(start: number, end: number, t: number): number`

Linear interpolation between two values.

**Parameters:**
- `start` (number): Start value
- `end` (number): End value
- `t` (number): Progress (0-1)

**Returns:** Interpolated value

**Example:**
```typescript
import { lerp } from '@/utils/helpers';

lerp(0, 100, 0.25);  // Returns: 25
lerp(50, 150, 0.5);  // Returns: 100
```

---

#### `map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number`

Maps a value from one range to another.

**Parameters:**
- `value` (number): Value to map
- `inMin` (number): Input range minimum
- `inMax` (number): Input range maximum
- `outMin` (number): Output range minimum
- `outMax` (number): Output range maximum

**Returns:** Mapped value

**Example:**
```typescript
import { map } from '@/utils/helpers';

// Convert percentage (0-100) to opacity (0-1)
const opacity = map(75, 0, 100, 0, 1);
// Returns: 0.75

// Map audio frequency (20-20000) to visual height (0-500)
const height = map(440, 20, 20000, 0, 500);
```

---

#### `distance(x1: number, y1: number, x2: number, y2: number): number`

Calculates distance between two points.

**Parameters:**
- `x1`, `y1` (number): First point coordinates
- `x2`, `y2` (number): Second point coordinates

**Returns:** Distance between points

**Example:**
```typescript
import { distance } from '@/utils/helpers';

const dist = distance(0, 0, 3, 4);
// Returns: 5 (Pythagorean theorem)
```

---

#### `angleBetween(x1: number, y1: number, x2: number, y2: number): number`

Calculates angle between two points in radians.

**Parameters:**
- `x1`, `y1` (number): First point coordinates
- `x2`, `y2` (number): Second point coordinates

**Returns:** Angle in radians

**Example:**
```typescript
import { angleBetween } from '@/utils/helpers';

const angle = angleBetween(0, 0, 1, 1);
// Returns: Math.PI / 4 (45 degrees)
```

---

### String Helpers

#### `capitalize(str: string): string`

Capitalizes first letter of a string.

**Parameters:**
- `str` (string): String to capitalize

**Returns:** Capitalized string

**Example:**
```typescript
import { capitalize } from '@/utils/helpers';

capitalize('hello');  // Returns: 'Hello'
capitalize('WORLD');  // Returns: 'WORLD'
```

---

#### `toTitleCase(str: string): string`

Converts string to title case.

**Parameters:**
- `str` (string): String to convert

**Returns:** Title cased string

**Example:**
```typescript
import { toTitleCase } from '@/utils/helpers';

toTitleCase('hello world');  // Returns: 'Hello World'
toTitleCase('the quick brown fox');  // Returns: 'The Quick Brown Fox'
```

---

#### `truncate(str: string, maxLength: number, suffix?: string): string`

Truncates string to specified length.

**Parameters:**
- `str` (string): String to truncate
- `maxLength` (number): Maximum length
- `suffix` (string, optional): Suffix to add (default: '...')

**Returns:** Truncated string

**Example:**
```typescript
import { truncate } from '@/utils/helpers';

truncate('Long description text', 10);
// Returns: 'Long de...'

truncate('Short', 10);
// Returns: 'Short'
```

---

#### `formatNumber(num: number): string`

Formats a number with thousands separators.

**Parameters:**
- `num` (number): Number to format

**Returns:** Formatted string

**Example:**
```typescript
import { formatNumber } from '@/utils/helpers';

formatNumber(1234567);  // Returns: '1,234,567'
formatNumber(1000);     // Returns: '1,000'
```

---

### Time Helpers

#### `formatDuration(seconds: number): string`

Formats duration in seconds to MM:SS.

**Parameters:**
- `seconds` (number): Duration in seconds

**Returns:** Formatted time string

**Example:**
```typescript
import { formatDuration } from '@/utils/helpers';

formatDuration(185);  // Returns: '3:05'
formatDuration(65);   // Returns: '1:05'
formatDuration(45);   // Returns: '0:45'
```

---

#### `debounce<T>(func: T, wait: number): Function`

Debounces function execution.

**Parameters:**
- `func` (Function): Function to debounce
- `wait` (number): Wait time in milliseconds

**Returns:** Debounced function

**Example:**
```typescript
import { debounce } from '@/utils/helpers';

const handleSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

// Call multiple times, only last call executes after 300ms
handleSearch('B');
handleSearch('BT');
handleSearch('BTS');  // Only this executes
```

---

#### `throttle<T>(func: T, limit: number): Function`

Throttles function execution.

**Parameters:**
- `func` (Function): Function to throttle
- `limit` (number): Minimum time between executions (ms)

**Returns:** Throttled function

**Example:**
```typescript
import { throttle } from '@/utils/helpers';

const handleScroll = throttle(() => {
  console.log('Scroll event');
}, 100);

window.addEventListener('scroll', handleScroll);
// Executes maximum once per 100ms
```

---

### DOM Helpers

#### `isInViewport(element: HTMLElement): boolean`

Checks if element is in viewport.

**Parameters:**
- `element` (HTMLElement): Element to check

**Returns:** True if in viewport

**Example:**
```typescript
import { isInViewport } from '@/utils/helpers';

const element = document.getElementById('my-element');
if (isInViewport(element)) {
  // Element is visible, load content
  loadContent();
}
```

---

#### `scrollToElement(element: HTMLElement, offset?: number, behavior?: ScrollBehavior): void`

Smoothly scrolls to an element.

**Parameters:**
- `element` (HTMLElement): Target element
- `offset` (number, optional): Offset from top (default: 0)
- `behavior` (ScrollBehavior, optional): Scroll behavior (default: 'smooth')

**Returns:** void

**Example:**
```typescript
import { scrollToElement } from '@/utils/helpers';

const section = document.getElementById('members');
scrollToElement(section, 100);  // Scroll with 100px offset
```

---

### Array Helpers

#### `shuffle<T>(array: T[]): T[]`

Shuffles an array using Fisher-Yates algorithm.

**Parameters:**
- `array` (T[]): Array to shuffle

**Returns:** New shuffled array

**Example:**
```typescript
import { shuffle } from '@/utils/helpers';

const songs = ['Dynamite', 'Butter', 'Permission to Dance'];
const shuffled = shuffle(songs);
// Returns: Random order, original array unchanged
```

---

#### `randomItem<T>(array: T[]): T`

Gets a random item from array.

**Parameters:**
- `array` (T[]): Source array

**Returns:** Random item

**Example:**
```typescript
import { randomItem } from '@/utils/helpers';

const members = ['RM', 'Jin', 'SUGA', 'J-Hope', 'Jimin', 'V', 'Jungkook'];
const randomMember = randomItem(members);
// Returns: Random member
```

---

#### `chunk<T>(array: T[], size: number): T[][]`

Chunks array into smaller arrays.

**Parameters:**
- `array` (T[]): Array to chunk
- `size` (number): Chunk size

**Returns:** Array of chunks

**Example:**
```typescript
import { chunk } from '@/utils/helpers';

const songs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const pages = chunk(songs, 3);
// Returns: [[1,2,3], [4,5,6], [7,8,9]]
```

---

### Performance Helpers

#### `requestAnimFrame: Function`

Request animation frame with fallback.

**Returns:** Animation frame ID

**Example:**
```typescript
import { requestAnimFrame } from '@/utils/helpers';

function animate() {
  // Animation logic
  requestAnimFrame(animate);
}

requestAnimFrame(animate);
```

---

#### `cancelAnimFrame: Function`

Cancel animation frame with fallback.

**Parameters:**
- Frame ID to cancel

**Example:**
```typescript
import { requestAnimFrame, cancelAnimFrame } from '@/utils/helpers';

const frameId = requestAnimFrame(animate);
// Later...
cancelAnimFrame(frameId);
```

---

## Type Definitions

All utility functions use types defined in `src/types.ts`:

```typescript
interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface Star {
  theta: number;
  phi: number;
  r: number;
  size: number;
  color: string;
  delay: number;
}

interface BokehBubble {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}

interface FloatingParticle {
  left: string;
  top: string;
  delay: number;
  duration: number;
  size: number;
}
```

---

## Contributing

When adding new utility functions:

1. Add comprehensive JSDoc comments
2. Include @param, @returns, and @example tags
3. Update this API documentation
4. Add TypeScript types for parameters and returns
5. Include unit tests (when testing is set up)

---

*Made with 💜 for BTS & ARMY*

**"작은 것들을 위한 시 (A poem for small things)" — BTS**
