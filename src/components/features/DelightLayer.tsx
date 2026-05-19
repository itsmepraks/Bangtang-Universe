import { useEffect, useRef, useState } from 'react';
import { MEMBER_COLORS } from '../../constants/colors';

// Konami code → confetti burst. Also logs a Borahae greeting in devtools.
// Respects prefers-reduced-motion (confetti disabled, console message still prints).

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

  useEffect(() => {
    const styles = [
      'color: #A855F7',
      'font-size: 14px',
      'font-weight: 600',
      'padding: 2px 0',
    ].join(';');
     
    console.log('%c💜 Borahae — you found the source.', styles);
     
    console.log(
      '%cBuilt by fans, for fans. Try the Konami code on the keyboard.',
      'color: rgba(255,255,255,0.6); font-size: 12px',
    );
  }, []);

  const triggerBurst = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

      console.log('%c💜 Borahae!', 'color: #A855F7; font-size: 18px; font-weight: 700');
      return;
    }
    setParticles(createBurst(80));
    setTimeout(() => setParticles([]), 3000);
  };

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
        // Allow restart if the wrong key happens to be the sequence's first.
        sequenceRef.current = key === KONAMI_SEQUENCE[0] ? [key] : [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
