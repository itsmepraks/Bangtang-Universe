/**
 * BTS Neural Archive - Animation Utilities
 * Reusable animation helpers and generators
 */

import type { ParticleProps, BokehProps, StarProps } from '../types';

/**
 * Generates random particle properties for floating animations
 * @param count Number of particles to generate
 * @returns Array of particle configuration objects
 */
export function generateParticles(count: number): ParticleProps[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: Math.random() * 3 + 1,
  }));
}

/**
 * Generates bokeh light properties for purple ocean effect
 * @param count Number of bokeh lights to generate
 * @returns Array of bokeh configuration objects
 */
export function generateBokehLights(count: number): BokehProps[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 200 + 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));
}

/**
 * Generates 3D star positions for the cosmic universe
 * @param count Number of stars to generate
 * @param colors Array of color values for stars
 * @returns Array of star configuration objects with 3D coordinates
 */
export function generateStars(count: number, colors: string[]): StarProps[] {
  return Array.from({ length: count }, (_, i) => ({
    theta: Math.random() * 2 * Math.PI,
    phi: Math.acos(Math.random() * 2 - 1),
    r: 300 + Math.random() * 1000,
    size: Math.random() * 2.5 + 0.5,
    color: i % 12 === 0 ? '#ffffff' : colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
  }));
}

/**
 * Converts spherical coordinates to 3D Cartesian coordinates
 * @param theta Azimuthal angle
 * @param phi Polar angle
 * @param r Radius
 * @returns Object with x, y, z coordinates
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

/**
 * Calculates orbital position for member constellation
 * @param index Member index (0-6)
 * @param totalMembers Total number of members (default: 7)
 * @param distance Distance from center
 * @returns Object with x, y coordinates and angle
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

/**
 * Generates a random delay for staggered animations
 * @param index Element index
 * @param baseDelay Base delay in milliseconds
 * @param increment Delay increment per index
 * @returns Delay string for CSS
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  increment: number = 100
): string {
  return `${baseDelay + index * increment}ms`;
}

/**
 * Creates an easing function for smooth animations
 * @param t Current time (0-1)
 * @returns Eased value (0-1)
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Clamps a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param start Start value
 * @param end End value
 * @param t Progress (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Generates a random value within a range
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random value
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
