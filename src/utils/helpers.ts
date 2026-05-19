import type { Position3D, Star, BokehBubble, FloatingParticle } from '../types/index';
import { UNIVERSE_COLORS } from '../constants/colors';

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

export const randomPosition = (): { left: string; top: string } => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
});

export const randomDelay = (max: number = 5): number => Math.random() * max;

export const randomDuration = (min: number, max: number): number =>
  min + Math.random() * (max - min);

// Uniform sphere distribution via spherical coordinates. Every 12th star is
// white for visual variety against the purple palette.
export const generateStars = (
  count: number,
  minRadius: number = 300,
  maxRadius: number = 1300,
  colors: string[] = [...UNIVERSE_COLORS.STARS]
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

// x = r·sin(φ)·cos(θ), y = r·sin(φ)·sin(θ), z = r·cos(φ)
export const sphericalToCartesian = (star: Star): Position3D => ({
  x: star.r * Math.sin(star.phi) * Math.cos(star.theta),
  y: star.r * Math.sin(star.phi) * Math.sin(star.theta),
  z: star.r * Math.cos(star.phi),
});

export const generateBokehBubbles = (count: number): BokehBubble[] => {
  return Array.from({ length: count }, () => ({
    ...randomPosition(),
    size: Math.random() * 200 + 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));
};

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

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const hexWithAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const increase = (val: number) => Math.min(255, Math.floor(val + (255 - val) * percent / 100));

  return rgbToHex(increase(rgb.r), increase(rgb.g), increase(rgb.b));
};

export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const decrease = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));

  return rgbToHex(decrease(rgb.r), decrease(rgb.g), decrease(rgb.b));
};

// ============================================================================
// MATH HELPERS
// ============================================================================

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

export const angleBetween = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.atan2(y2 - y1, x2 - x1);

// ============================================================================
// STRING HELPERS
// ============================================================================

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const toTitleCase = (str: string): string =>
  str.split(' ').map(capitalize).join(' ');

export const truncate = (str: string, maxLength: number, suffix: string = '...'): string =>
  str.length > maxLength ? str.substring(0, maxLength - suffix.length) + suffix : str;

export const formatNumber = (num: number): string =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ============================================================================
// TIME HELPERS
// ============================================================================

export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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

export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

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

// Fisher-Yates shuffle. Returns a new array; does not mutate the input.
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const randomItem = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

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

export const requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitRequestAnimationFrame ||
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 1000 / 60))
  );
})();

export const cancelAnimFrame = (() => {
  return (
    window.cancelAnimationFrame ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitCancelAnimationFrame ||
    clearTimeout
  );
})();

export default {
  randomPosition,
  randomDelay,
  randomDuration,
  generateStars,
  sphericalToCartesian,
  generateBokehBubbles,
  generateFloatingParticles,
  hexToRgb,
  rgbToHex,
  hexWithAlpha,
  lightenColor,
  darkenColor,
  clamp,
  lerp,
  map,
  distance,
  angleBetween,
  capitalize,
  toTitleCase,
  truncate,
  formatNumber,
  formatDuration,
  debounce,
  throttle,
  isInViewport,
  scrollToElement,
  shuffle,
  randomItem,
  chunk,
  requestAnimFrame,
  cancelAnimFrame,
};
