import type { FloatingParticle, BokehBubble, Star } from '../types/index';

export function generateParticles(count: number): FloatingParticle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: Math.random() * 3 + 1,
  }));
}

export function generateBokehLights(count: number): BokehBubble[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 200 + 100,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));
}

// Uniform sphere distribution. φ uses arccos(random(-1,1)) rather than
// random(0,π) to avoid pole clustering — ensures equal area distribution.
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

// x = r·sin(φ)·cos(θ), y = r·sin(φ)·sin(θ), z = r·cos(φ)
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

// Distributes items evenly around a circle. Index 0 = 3 o'clock; rotates CCW.
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

export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  increment: number = 100
): string {
  return `${baseDelay + index * increment}ms`;
}

// https://easings.net/#easeInOutCubic
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
