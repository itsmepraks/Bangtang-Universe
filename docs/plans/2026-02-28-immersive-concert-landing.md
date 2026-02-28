# Immersive Concert Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the colorful dancing stick figures and clinical CSS stage with dark human silhouettes on a backlit stage surrounded by a sea of purple ARMY bomb bokeh — POV concert feel.

**Architecture:** New `MemberSilhouette` SVG component (dark human shapes, 7 poses, backlit glow), one new CSS keyframe, then LandingRitual rebuilt to swap the entire stage section. `ArmyBombCanvas` stays untouched — its existing arcs/walls provide the upper-crowd. A foreground orb layer added below the stage gives the "you're in the crowd" immersion.

**Tech Stack:** React 18, TypeScript, inline SVG, CSS keyframes, Tailwind CSS 4. No new packages.

---

### Task 1: Create `MemberSilhouette` SVG component

**Files:**
- Create: `src/components/visual/MemberSilhouette.tsx`

**Step 1: Create the file with this exact content**

```tsx
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
```

**Step 2: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/components/visual/MemberSilhouette.tsx && git commit -m "feat: add MemberSilhouette SVG component with 7 backlit concert poses"
```

---

### Task 2: Add `foreground-twinkle` keyframe to `src/index.css`

**Files:**
- Modify: `src/index.css` (append at end)

**Step 1: Append this block at the very end of `src/index.css`**

```css

/* ── Foreground army bomb bokeh animation ── */
@keyframes foreground-twinkle {
  0%, 100% { transform: scale(1) translateY(0px); }
  50%       { transform: scale(1.12) translateY(-5px); }
}
```

**Step 2: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/index.css && git commit -m "feat: add foreground-twinkle keyframe for concert crowd bokeh"
```

---

### Task 3: Redesign `LandingRitual.tsx`

**Files:**
- Modify: `src/components/features/LandingRitual.tsx`

**Context — the current file structure (read the file first to verify line numbers):**
- Lines 1–4: imports (React, ChevronRight, BTSLogo/ArmyBombCanvas, DancingFigure)
- Lines 10–18: `MEMBER_CONFIGS` constant at module scope
- Lines 20–66: `LandingRitual` component open + `universeStars` useMemo
- Line 66: `hoveredMember` state
- Lines 68–274: JSX return open → background layers → spotlights (KEEP ALL OF THIS)
- Lines 275–517: `{/* CONCERT STAGE */}` + `{/* 7 DANCING MEMBERS */}` ← **REPLACE THIS ENTIRE BLOCK**
- Lines 520–571: TITLE + CTA + bottom vignette + closing tags (KEEP)

**Step 1: Replace the import on line 4**

Change:
```tsx
import DancingFigure from '../visual/DancingFigure';
```

To:
```tsx
import MemberSilhouette from '../visual/MemberSilhouette';
```

**Step 2: Replace lines 10–18 (the `MEMBER_CONFIGS` constant)**

Remove the existing `MEMBER_CONFIGS` and replace with these two new constants:

```tsx
const SILHOUETTE_CONFIGS = [
  { id: 'rm',    name: 'RM',     pose: 1 as const, delay: 0.0  },
  { id: 'jin',   name: 'Jin',    pose: 2 as const, delay: 0.35 },
  { id: 'suga',  name: 'Suga',   pose: 3 as const, delay: 0.70 },
  { id: 'jhope', name: 'J-Hope', pose: 4 as const, delay: 0.15 },
  { id: 'jimin', name: 'Jimin',  pose: 5 as const, delay: 0.50 },
  { id: 'v',     name: 'V',      pose: 6 as const, delay: 0.80 },
  { id: 'jk',    name: 'JK',     pose: 7 as const, delay: 0.25 },
] as const;

// Precomputed foreground army bomb orbs — large blurry bokeh simulating
// fans' army bombs held right next to the viewer (the "you're in the crowd" layer)
const FOREGROUND_BOMBS = [
  { x:  3, y:  2, size: 55, color: '#A855F7', blur: 18, opacity: 0.38, dur: 3.2, delay: 0.0 },
  { x:  9, y: 12, size: 42, color: '#8B5CF6', blur: 14, opacity: 0.28, dur: 2.8, delay: 0.8 },
  { x: 16, y:  3, size: 68, color: '#C084FC', blur: 22, opacity: 0.42, dur: 3.6, delay: 1.2 },
  { x: 23, y: 14, size: 38, color: '#9333EA', blur: 12, opacity: 0.24, dur: 2.4, delay: 0.4 },
  { x: 31, y:  6, size: 52, color: '#A855F7', blur: 16, opacity: 0.32, dur: 3.0, delay: 1.6 },
  { x: 40, y:  1, size: 75, color: '#D8B4FE', blur: 25, opacity: 0.20, dur: 4.0, delay: 2.0 },
  { x: 49, y:  9, size: 46, color: '#8B5CF6', blur: 15, opacity: 0.30, dur: 2.6, delay: 0.6 },
  { x: 58, y:  4, size: 62, color: '#C084FC', blur: 20, opacity: 0.36, dur: 3.4, delay: 1.0 },
  { x: 66, y: 13, size: 40, color: '#9333EA', blur: 13, opacity: 0.27, dur: 2.9, delay: 1.8 },
  { x: 74, y:  5, size: 56, color: '#A855F7', blur: 17, opacity: 0.33, dur: 3.1, delay: 0.3 },
  { x: 82, y:  1, size: 70, color: '#B47EE5', blur: 22, opacity: 0.37, dur: 3.7, delay: 1.4 },
  { x: 90, y: 10, size: 48, color: '#8B5CF6', blur: 16, opacity: 0.29, dur: 2.7, delay: 2.2 },
  { x: 96, y:  4, size: 58, color: '#C084FC', blur: 19, opacity: 0.34, dur: 3.3, delay: 0.9 },
] as const;
```

**Step 3: Replace the entire `{/* CONCERT STAGE */}` + `{/* 7 DANCING MEMBERS */}` JSX block**

Find the comment `{/* ══════════════════════════════════════════` for CONCERT STAGE (around line 275) and delete everything up to and INCLUDING the closing `</div>` of the dancing members section (around line 517), replacing it with:

```tsx
      {/* ══════════════════════════════════════════
          CENTRAL STAGE BACKLIGHT BLOOM
          Creates the dramatic silhouette effect —
          bright light from behind the performers
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '420px',
          background: 'radial-gradient(ellipse at 50% 85%, rgba(255,255,255,0.22) 0%, rgba(220,200,255,0.14) 25%, rgba(168,85,247,0.07) 55%, transparent 75%)',
          filter: 'blur(28px)',
          zIndex: 3,
        }}
      />

      {/* ══════════════════════════════════════════
          BTS ARCH — glowing neon gate behind members
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 'calc(22% + 62px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4,
        }}
      >
        <svg viewBox="0 0 320 240" width="320" height="240" style={{ overflow: 'visible' }}>
          {/* Outer glowing arch */}
          <path
            d="M 24 240 L 24 96 L 160 12 L 296 96 L 296 240"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.8"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(168,85,247,1)) drop-shadow(0 0 18px rgba(255,255,255,0.5))',
            }}
          />
          {/* Inner accent arch */}
          <path
            d="M 54 240 L 54 108 L 160 36 L 266 108 L 266 240"
            fill="none"
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════════
          STAGE FLOOR
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(860px, 96%)',
          height: '68px',
          background: 'linear-gradient(180deg, rgba(160,130,255,0.07) 0%, rgba(80,40,140,0.04) 100%)',
          clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)',
          zIndex: 5,
        }}
      >
        {/* Front edge glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.9) 20%, rgba(255,255,255,0.75) 50%, rgba(168,85,247,0.9) 80%, transparent)',
          boxShadow: '0 0 16px rgba(168,85,247,0.65)',
        }} />
      </div>

      {/* ══════════════════════════════════════════
          7 MEMBER SILHOUETTES
      ══════════════════════════════════════════ */}
      <div
        className="absolute z-[6]"
        style={{
          bottom: 'calc(22% + 62px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(2px, 1.8vw, 22px)',
          width: 'min(860px, 92%)',
        }}
      >
        {SILHOUETTE_CONFIGS.map((m) => {
          const isHovered = hoveredMember === m.id;
          return (
            <div
              key={m.id}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredMember(m.id)}
              onMouseLeave={() => setHoveredMember(null)}
              style={{
                transition: 'transform 0.35s ease',
                transform: isHovered ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
              }}
            >
              <MemberSilhouette
                pose={m.pose}
                size={150}
                delay={m.delay}
                glowing={isHovered}
              />
              {/* Name label */}
              <span style={{
                marginTop: '5px',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.38)',
                textShadow: isHovered ? '0 0 10px rgba(255,255,255,0.6)' : 'none',
                transition: 'all 0.35s ease',
                whiteSpace: 'nowrap',
              }}>
                {m.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          FOREGROUND ARMY BOMBS
          Large blurry bokeh = you're in the crowd
      ══════════════════════════════════════════ */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '18%', zIndex: 8 }}
      >
        {FOREGROUND_BOMBS.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              bottom: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background: `radial-gradient(circle, ${b.color} 0%, ${b.color}90 25%, ${b.color}30 55%, transparent 75%)`,
              filter: `blur(${b.blur}px)`,
              opacity: b.opacity,
              borderRadius: '50%',
              animation: `foreground-twinkle ${b.dur}s ease-in-out infinite`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
```

**Step 4: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Common errors and fixes:
- "Cannot find name 'MemberSilhouette'" → verify import was changed in step 1
- "Cannot find name 'SILHOUETTE_CONFIGS'" → verify constant was added in step 2
- "Property 'pose' does not exist" → check `SILHOUETTE_CONFIGS` typing and `MemberSilhouette` props

Expected: no errors.

**Step 5: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/components/features/LandingRitual.tsx && git commit -m "feat: immersive concert landing — backlit silhouettes, BTS arch, foreground crowd"
```

---

### Task 4: Export `MemberSilhouette` from visual barrel + push

**Files:**
- Modify: `src/components/visual/index.ts`

**Step 1: Read `src/components/visual/index.ts`**

Check current exports. It should have BTSLogo, ArmyBombCanvas, StarFieldCanvas, DancingFigure.

**Step 2: Add MemberSilhouette export**

Add this line:
```typescript
export { default as MemberSilhouette } from './MemberSilhouette';
```

**Step 3: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit and push**

```bash
cd "C:\Development\BTS universe" && git add src/components/visual/index.ts && git commit -m "feat: export MemberSilhouette from visual barrel"
cd "C:\Development\BTS universe" && git push
```
