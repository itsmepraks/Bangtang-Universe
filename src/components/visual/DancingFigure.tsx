import { useId } from 'react';

interface DancingFigureProps {
  /** Member accent color e.g. "#3B82F6" */
  color: string;
  /** Three dance styles — used to stagger choreography across members */
  variant?: 'a' | 'b' | 'c';
  /** CSS animation-delay in seconds */
  delay?: number;
  /** Animation speed multiplier — 1 = normal, 1.5 = fast (on hover) */
  speed?: number;
  /** Height in px of the SVG element */
  size?: number;
  /** Show glow filter + floor shadow */
  glowing?: boolean;
}

// Per-variant dance parameters
const VARIANTS = {
  a: {
    leftArm:  { from: '-70deg',  to: '-130deg', dur: 0.65 },
    rightArm: { from:  '70deg',  to:  '130deg', dur: 0.65 },
    leftLeg:  { from: '-18deg',  to:   '18deg', dur: 0.65 },
    rightLeg: { from:  '18deg',  to:  '-18deg', dur: 0.65 },
    bounce:   { amt: 7,  dur: 0.65 },
  },
  b: {
    leftArm:  { from: '-15deg',  to:  '-65deg', dur: 0.88 },
    rightArm: { from:  '65deg',  to:   '15deg', dur: 0.88 },
    leftLeg:  { from: '-25deg',  to:   '-5deg', dur: 0.88 },
    rightLeg: { from:   '5deg',  to:   '25deg', dur: 0.88 },
    bounce:   { amt: 4,  dur: 0.88 },
  },
  c: {
    leftArm:  { from: '-30deg',  to: '-105deg', dur: 0.55 },
    rightArm: { from: '105deg',  to:   '30deg', dur: 0.55 },
    leftLeg:  { from: '-22deg',  to:   '22deg', dur: 0.55 },
    rightLeg: { from:  '22deg',  to:  '-22deg', dur: 0.55 },
    bounce:   { amt: 10, dur: 0.55 },
  },
} as const;

export default function DancingFigure({
  color,
  variant = 'a',
  delay = 0,
  speed = 1,
  size = 130,
  glowing = false,
}: DancingFigureProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const v = VARIANTS[variant];
  const dur = (base: number) => `${(base / speed).toFixed(3)}s`;
  const del = (offset = 0) => `${(delay + offset).toFixed(3)}s`;
  const half = (base: number) => (base / speed / 2);

  return (
    <svg
      viewBox="0 0 80 200"
      width={Math.round(size * 0.5)}
      height={size}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <style>{`
          @keyframes bounce-${id} {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-${v.bounce.amt}px); }
          }
          @keyframes la-${id} {
            0%, 100% { transform: rotate(${v.leftArm.from}); }
            50%       { transform: rotate(${v.leftArm.to}); }
          }
          @keyframes ra-${id} {
            0%, 100% { transform: rotate(${v.rightArm.from}); }
            50%       { transform: rotate(${v.rightArm.to}); }
          }
          @keyframes ll-${id} {
            0%, 100% { transform: rotate(${v.leftLeg.from}); }
            50%       { transform: rotate(${v.leftLeg.to}); }
          }
          @keyframes rl-${id} {
            0%, 100% { transform: rotate(${v.rightLeg.from}); }
            50%       { transform: rotate(${v.rightLeg.to}); }
          }
        `}</style>

        {glowing && (
          <filter id={`glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {glowing && (
        <ellipse
          cx="40" cy="195" rx="22" ry="6"
          fill={color}
          opacity={0.2}
          style={{ filter: 'blur(5px)' }}
        />
      )}

      <g
        style={{
          animation: `bounce-${id} ${dur(v.bounce.dur)} ease-in-out infinite`,
          animationDelay: del(),
        }}
        filter={glowing ? `url(#glow-${id})` : undefined}
      >
        <circle
          cx="40" cy="16" r="13"
          fill={color}
          style={{ filter: glowing ? `drop-shadow(0 0 6px ${color})` : undefined }}
        />

        <rect x="29" y="29" width="22" height="44" rx="7" fill={color} />

        <rect
          x="8" y="33" width="21" height="8" rx="4"
          fill={color}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '100% 50%',
            animation: `la-${id} ${dur(v.leftArm.dur)} ease-in-out infinite`,
            animationDelay: del(),
          }}
        />

        <rect
          x="51" y="33" width="21" height="8" rx="4"
          fill={color}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '0% 50%',
            animation: `ra-${id} ${dur(v.rightArm.dur)} ease-in-out infinite`,
            animationDelay: del(half(v.rightArm.dur)),
          }}
        />

        <rect
          x="27" y="73" width="12" height="48" rx="5"
          fill={color}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 0%',
            animation: `ll-${id} ${dur(v.leftLeg.dur)} ease-in-out infinite`,
            animationDelay: del(),
          }}
        />

        <rect
          x="41" y="73" width="12" height="48" rx="5"
          fill={color}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '50% 0%',
            animation: `rl-${id} ${dur(v.rightLeg.dur)} ease-in-out infinite`,
            animationDelay: del(half(v.rightLeg.dur)),
          }}
        />

        <ellipse cx="33" cy="122" rx="9" ry="5" fill={color} />
        <ellipse cx="47" cy="122" rx="9" ry="5" fill={color} />
      </g>
    </svg>
  );
}
