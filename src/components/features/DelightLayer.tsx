import { useEffect, useRef, useState } from 'react';
import { MEMBER_COLORS } from '../../constants/colors';

/**
 * Hidden delight layer.
 *
 * - Konami code unlocks a 2-second burst of member-color confetti
 *   rising from the bottom of the viewport.
 * - Logs a Borahae greeting to the console for curious devtools visitors.
 *
 * Both respect prefers-reduced-motion. If the user has reduced motion on,
 * the confetti is disabled (but the console message still prints).
 */

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const MEMBER_COLOR_LIST = Object.values(MEMBER_COLORS);

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

function createBurst(count = 60): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: MEMBER_COLOR_LIST[Math.floor(Math.random() * MEMBER_COLOR_LIST.length)],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 200,
    duration: 1800 + Math.random() * 800,
    drift: (Math.random() - 0.5) * 80,
  }));
}

export default function DelightLayer() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const sequenceRef = useRef<string[]>([]);

  // Console greeting — runs once on mount
  useEffect(() => {
    const styles = [
      'color: #A855F7',
      'font-size: 14px',
      'font-weight: 600',
      'padding: 2px 0',
    ].join(';');
    // eslint-disable-next-line no-console
    console.log('%c💜 Borahae — you found the source.', styles);
    // eslint-disable-next-line no-console
    console.log(
      '%cBuilt by fans, for fans. Try the Konami code on the keyboard.',
      'color: rgba(255,255,255,0.6); font-size: 12px',
    );
  }, []);

  // Konami listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI_SEQUENCE[sequenceRef.current.length];
      if (key === expected) {
        sequenceRef.current.push(key);
        if (sequenceRef.current.length === KONAMI_SEQUENCE.length) {
          sequenceRef.current = [];
          triggerBurst();
        }
      } else {
        // Reset on wrong key; but allow restart from current key if it's the first
        sequenceRef.current = key === KONAMI_SEQUENCE[0] ? [key] : [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const triggerBurst = () => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line no-console
      console.log('%c💜 Borahae!', 'color: #A855F7; font-size: 18px; font-weight: 700');
      return;
    }
    setParticles(createBurst(80));
    setTimeout(() => setParticles([]), 3000);
  };

  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full delight-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}80`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
