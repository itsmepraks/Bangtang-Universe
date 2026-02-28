import { useId } from 'react';

interface MemberSilhouetteProps {
  /** 1–7 matching BTS member order: RM, Jin, Suga, J-Hope, Jimin, V, JK */
  pose: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Height in px (width is automatically ~0.5× height) */
  size?: number;
  /** CSS animation-delay in seconds */
  delay?: number;
  /** Intensify backlight + show rim glow on hover */
  glowing?: boolean;
}

// [leftArmDeg, rightArmDeg] — 0=horizontal, -90=straight up, +90=straight down
const POSES: Record<number, [number, number]> = {
  1: [-30,  20],  // RM    — left arm raised, right relaxed
  2: [-50, -50],  // Jin   — V-shape, both arms raised
  3: [ 55,  -5],  // Suga  — chill, left hanging, right neutral
  4: [  0,   0],  // JHope — arms spread wide
  5: [-75, -75],  // Jimin — both arms high
  6: [ 10, -60],  // V     — right arm reaching up
  7: [-85, -35],  // JK    — left fist pump, right raised
};

export default function MemberSilhouette({
  pose,
  size = 150,
  delay = 0,
  glowing = false,
}: MemberSilhouetteProps) {
  const rawId = useId();
  const id = `ms${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [la, ra] = POSES[pose] ?? [0, 0];

  const svgW = Math.round(size * 0.55);
  const svgH = size;
  // Dark near-black fill for silhouette effect
  const fill = 'rgba(15,8,25,0.95)';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end' }}>
      {/* Backlit glow bloom — sits behind the SVG */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 1.5,
          height: size * 0.75,
          background: glowing
            ? 'radial-gradient(ellipse at center bottom, rgba(255,255,255,0.40) 0%, rgba(200,180,255,0.22) 35%, rgba(168,85,247,0.08) 65%, transparent 80%)'
            : 'radial-gradient(ellipse at center bottom, rgba(255,255,255,0.20) 0%, rgba(200,180,255,0.10) 35%, transparent 70%)',
          filter: `blur(${glowing ? 16 : 10}px)`,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'all 0.35s ease',
        }}
      />

      {/* SVG silhouette */}
      <svg
        viewBox="0 0 80 200"
        width={svgW}
        height={svgH}
        style={{
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
          filter: glowing ? 'drop-shadow(0 0 6px rgba(255,255,255,0.45))' : undefined,
          transition: 'filter 0.35s ease',
        }}
        aria-hidden="true"
      >
        <defs>
          <style>{`
            @keyframes bounce-${id} {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-6px); }
            }
          `}</style>
        </defs>

        {/* ── Whole-body bounce group ── */}
        <g style={{
          animation: `bounce-${id} ${(2.8 + delay * 0.4).toFixed(2)}s ease-in-out infinite`,
          animationDelay: `${delay.toFixed(2)}s`,
        }}>
          {/* Head */}
          <circle cx="40" cy="14" r="12" fill={fill} />

          {/* Torso — trapezoid wider at shoulders, narrower at waist */}
          <path d="M 17 28 L 63 28 L 56 94 L 24 94 Z" fill={fill} />

          {/* Hips */}
          <path d="M 24 94 L 56 94 L 59 110 L 21 110 Z" fill={fill} />

          {/* Left upper leg */}
          <rect x="21" y="110" width="18" height="40" rx="7" fill={fill} />
          {/* Left lower leg */}
          <rect x="23" y="147" width="14" height="37" rx="5" fill={fill} />

          {/* Right upper leg */}
          <rect x="41" y="110" width="18" height="40" rx="7" fill={fill} />
          {/* Right lower leg */}
          <rect x="43" y="147" width="14" height="37" rx="5" fill={fill} />

          {/* Feet */}
          <ellipse cx="30" cy="186" rx="13" ry="6" fill={fill} />
          <ellipse cx="50" cy="186" rx="13" ry="6" fill={fill} />

          {/* Left arm — pivots at right end = shoulder (17, 36) */}
          <g transform="translate(17,36)" style={{ transform: `translate(17px,36px) rotate(${la}deg)` }}>
            <rect x="-32" y="-5.5" width="32" height="11" rx="5.5" fill={fill} />
          </g>

          {/* Right arm — pivots at left end = shoulder (63, 36) */}
          <g transform="translate(63,36)" style={{ transform: `translate(63px,36px) rotate(${ra}deg)` }}>
            <rect x="0" y="-5.5" width="32" height="11" rx="5.5" fill={fill} />
          </g>
        </g>
      </svg>
    </div>
  );
}
