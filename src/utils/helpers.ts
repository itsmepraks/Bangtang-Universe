/**
 * BTS Neural Archive - Utility Helpers
 * 
 * Collection of reusable utility functions for animations,
 * calculations, and common operations throughout the application.
 */

import type { Position, Star, BokehBubble, FloatingParticle } from '../types';

// ==================== ANIMATION HELPERS ====================

/**
 * Generates random position within viewport bounds
 */
export const randomPosition = (): { left: string; top: string } => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
});

/**
 * Creates a random delay for staggered animations
 * @param max - Maximum delay in seconds
 */
export const randomDelay = (max: number = 5): number => Math.random() * max;

/**
 * Creates a random duration within a range
 * @param min - Minimum duration in seconds
 * @param max - Maximum duration in seconds
 */
export const randomDuration = (min: number, max: number): number => 
  min + Math.random() * (max - min);

/**
 * Generates an array of star positions in 3D space using spherical coordinates
 * @param count - Number of stars to generate
 * @param minRadius - Minimum radius from center
 * @param maxRadius - Maximum radius from center
 * @param colors - Array of possible colors
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
 * Converts spherical coordinates to Cartesian coordinates
 */
export const sphericalToCartesian = (star: Star): Position => ({
  x: star.r * Math.sin(star.phi) * Math.cos(star.theta),
  y: star.r * Math.sin(star.phi) * Math.sin(star.theta),
  z: star.r * Math.cos(star.phi),
});

/**
 * Generates bokeh bubble configurations
 * @param count - Number of bubbles to generate
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
 * Generates floating particle configurations
 * @param count - Number of particles to generate
 */
export const generateFloatingParticles = (count: number): FloatingParticle[] => {
  return Array.from({ length: count }, () => ({
    ...randomPosition(),
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: Math.random() * 3 + 1,
  }));
};

// ==================== COLOR HELPERS ====================

/**
 * Converts hex color to RGB values
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
 * Converts RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Adds alpha transparency to hex color
 */
export const hexWithAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Lightens a color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const increase = (val: number) => Math.min(255, Math.floor(val + (255 - val) * percent / 100));
  
  return rgbToHex(increase(rgb.r), increase(rgb.g), increase(rgb.b));
};

/**
 * Darkens a color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const decrease = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));
  
  return rgbToHex(decrease(rgb.r), decrease(rgb.g), decrease(rgb.b));
};

// ==================== MATH HELPERS ====================

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max);

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => 
  start + (end - start) * t;

/**
 * Maps a value from one range to another
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
 * Calculates distance between two points
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => 
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

/**
 * Calculates angle between two points in radians
 */
export const angleBetween = (x1: number, y1: number, x2: number, y2: number): number => 
  Math.atan2(y2 - y1, x2 - x1);

// ==================== STRING HELPERS ====================

/**
 * Capitalizes first letter of a string
 */
export const capitalize = (str: string): string => 
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts string to title case
 */
export const toTitleCase = (str: string): string => 
  str.split(' ').map(capitalize).join(' ');

/**
 * Truncates string to specified length
 */
export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => 
  str.length > maxLength ? str.substring(0, maxLength - suffix.length) + suffix : str;

/**
 * Formats a number with commas as thousands separators
 */
export const formatNumber = (num: number): string => 
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ==================== TIME HELPERS ====================

/**
 * Formats duration in seconds to MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Debounce function to limit execution rate
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
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

// ==================== DOM HELPERS ====================

/**
 * Checks if an element is in viewport
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
 * Smoothly scrolls to an element
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

// ==================== ARRAY HELPERS ====================

/**
 * Shuffles an array (Fisher-Yates algorithm)
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
 * Gets a random item from an array
 */
export const randomItem = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

/**
 * Chunks an array into smaller arrays of specified size
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

// ==================== PERFORMANCE HELPERS ====================

/**
 * Request animation frame with fallback
 */
export const requestAnimFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    ((callback: FrameRequestCallback) => window.setTimeout(callback, 1000 / 60))
  );
})();

/**
 * Cancel animation frame with fallback
 */
export const cancelAnimFrame = (() => {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    clearTimeout
  );
})();

// ==================== EXPORTS ====================

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
