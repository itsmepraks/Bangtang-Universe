# Landing Concert Stage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the capsule-silhouette members on the `LandingRitual` splash screen with CSS-animated SVG dancing figures on a proper CSS concert stage with LED screens, speaker stacks, and hover interactions.

**Architecture:** Two new pieces: (1) a reusable `DancingFigure` SVG component with CSS `@keyframes` animations — 3 dance variants, color-tintable, per-instance unique animation IDs via `useId()`; (2) a CSS concert stage structure inside `LandingRitual` using `clip-path` trapezoid for the stage floor + vertical back wall with LED screens. All existing atmosphere layers (nebula, starfield, ARMY bomb canvas, spotlight beams) are kept untouched.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4, inline SVG + CSS keyframes. No new packages.

---

### Task 1: Create `DancingFigure` SVG component

**Files:**
- Create: `src/components/visual/DancingFigure.tsx`

**Step 1: Create the file with this exact content**

```tsx
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
  // useId produces a stable unique string per component instance,
  // preventing @keyframes name collisions when 7 figures render simultaneously.
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const v = VARIANTS[variant];
  const dur = (base: number) => `${(base / speed).toFixed(3)}s`;
  const del = (offset = 0) => `${(delay + offset).toFixed(3)}s`;
  // Half-period offset makes opposite limbs move in anti-phase
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

      {/* Floor shadow when glowing */}
      {glowing && (
        <ellipse
          cx="40" cy="195" rx="22" ry="6"
          fill={color}
          opacity={0.2}
          style={{ filter: 'blur(5px)' }}
        />
      )}

      {/* ── Whole-body bounce group ── */}
      <g
        style={{
          animation: `bounce-${id} ${dur(v.bounce.dur)} ease-in-out infinite`,
          animationDelay: del(),
        }}
        filter={glowing ? `url(#glow-${id})` : undefined}
      >
        {/* Head */}
        <circle
          cx="40" cy="16" r="13"
          fill={color}
          style={{ filter: glowing ? `drop-shadow(0 0 6px ${color})` : undefined }}
        />

        {/* Torso */}
        <rect x="29" y="29" width="22" height="44" rx="7" fill={color} />

        {/* Left arm — pivot at RIGHT end = shoulder joint at (29, 37) */}
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

        {/* Right arm — pivot at LEFT end = shoulder joint at (51, 37) */}
        <rect
          x="51" y="33" width="21" height="8" rx="4"
          fill={color}
          style={{
            transformBox: 'fill-box',
            transformOrigin: '0% 50%',
            animation: `ra-${id} ${dur(v.rightArm.dur)} ease-in-out infinite`,
            // Half-period offset = opposite phase from left arm
            animationDelay: del(half(v.rightArm.dur)),
          }}
        />

        {/* Left leg — pivot at TOP center */}
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

        {/* Right leg — pivot at TOP center, opposite phase */}
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

        {/* Left foot */}
        <ellipse cx="33" cy="122" rx="9" ry="5" fill={color} />

        {/* Right foot */}
        <ellipse cx="47" cy="122" rx="9" ry="5" fill={color} />
      </g>
    </svg>
  );
}
```

**Step 2: Type-check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/components/visual/DancingFigure.tsx && git commit -m "feat: add DancingFigure SVG animated concert performer component"
```

---

### Task 2: Add CSS stage keyframes to `src/index.css`

**Files:**
- Modify: `src/index.css`

**Context:** `src/index.css` already has many `@keyframes` blocks (star-twinkle, nebula-breathe, etc.). Append the new stage animations at the end of the file.

**Step 1: Read the end of `src/index.css` to find the last line**

Use Read tool to check the end of the file.

**Step 2: Append these keyframes at the bottom of `src/index.css`**

```css
/* ── Concert stage animations ── */
@keyframes scanline {
  0%   { transform: translateY(-100%); opacity: 0.6; }
  50%  { opacity: 1; }
  100% { transform: translateY(200%); opacity: 0.6; }
}

@keyframes led-pulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.9; }
}

@keyframes truss-glow {
  0%, 100% { opacity: 0.25; }
  50%       { opacity: 0.55; }
}

@keyframes stage-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

**Step 3: Type-check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

**Step 4: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/index.css && git commit -m "feat: add concert stage CSS keyframe animations"
```

---

### Task 3: Rebuild the concert stage + members in `LandingRitual.tsx`

**Files:**
- Modify: `src/components/features/LandingRitual.tsx`

**Context — what to keep (DO NOT touch these blocks):**
- The `universeStars` useMemo + the stars/nebula/galaxy render loop (lines 12–131)
- The NEBULA LAYER divs (lines 134–147)
- The upper darkness gradient div (lines 150–152)
- `<ArmyBombCanvas />` (line 155)
- The STADIUM SPOTLIGHT SYSTEM divs (lines 185–272)
- The TITLE block at top (lines 379–392)
- The ENTER THE UNIVERSE CTA block (lines 394–422)
- The bottom vignette (line 425)

**What to replace:**
- Lines 157–182: the old "Stage Spotlights" section → keep these light beams, they still look good
- Lines 274–302: the old "Stage Platform Glow" + "Floor Reflection Grid" → REPLACE with new CSS stage
- Lines 304–376: the old "7 Member Silhouettes" → REPLACE with DancingFigure dancers

**Member config data** — add this constant near the top of the file (after the `brightColors` array):

```tsx
const MEMBER_CONFIGS = [
  { id: 'rm',     name: 'RM',     color: '#3B82F6', variant: 'a' as const, delay: 0.0  },
  { id: 'jin',    name: 'Jin',    color: '#EC4899', variant: 'b' as const, delay: 0.18 },
  { id: 'suga',   name: 'Suga',   color: '#94A3B8', variant: 'c' as const, delay: 0.35 },
  { id: 'jhope',  name: 'J-Hope', color: '#FFFFFF', variant: 'a' as const, delay: 0.52 },
  { id: 'jimin',  name: 'Jimin',  color: '#F59E0B', variant: 'b' as const, delay: 0.28 },
  { id: 'v',      name: 'V',      color: '#10B981', variant: 'c' as const, delay: 0.44 },
  { id: 'jk',     name: 'JK',     color: '#8B5CF6', variant: 'a' as const, delay: 0.12 },
];
```

**Hover state** — add inside the component function (after the existing useMemo calls):

```tsx
const [hoveredMember, setHoveredMember] = useState<string | null>(null);
```

**Add DancingFigure import** at the top of the file alongside other imports:

```tsx
import DancingFigure from '../visual/DancingFigure';
```

**Step 1: Replace lines 274–376 (Stage Platform Glow + Floor Reflection Grid + 7 Member Silhouettes) with this new JSX block**

Find this comment and everything down to and including the closing `</div>` of the member silhouettes section:

```tsx
            {/* Stage Platform Glow */}
```

...all the way to the end of:

```tsx
            </div>
            {/* Bottom subtle vignette */}
```

Wait — more precisely, replace just the Stage Platform / Floor Reflection / Member Silhouettes blocks (leaving bottom vignette intact). Here is the EXACT replacement for those three removed blocks:

```tsx
      {/* ══════════════════════════════════════════
          CONCERT STAGE
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(1100px, 100%)',
        }}
      >
        {/* ── Back wall ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '110px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '78%',
            height: '190px',
            background: 'linear-gradient(180deg, #0a0015 0%, #100020 100%)',
            borderTop: '1px solid rgba(168,85,247,0.2)',
            borderLeft: '1px solid rgba(168,85,247,0.1)',
            borderRight: '1px solid rgba(168,85,247,0.1)',
          }}
        >
          {/* Left LED screen */}
          <div style={{
            position: 'absolute', left: '24px', top: '12px',
            width: '110px', height: '165px',
            background: 'linear-gradient(160deg, #2d0050 0%, #1a0035 100%)',
            border: '2px solid rgba(168,85,247,0.45)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.45) 50%, transparent 100%)',
              backgroundSize: '100% 30px',
              animation: 'scanline 2.4s linear infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(160deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)',
              animation: 'led-pulse 3s ease-in-out infinite',
            }} />
          </div>

          {/* Right LED screen */}
          <div style={{
            position: 'absolute', right: '24px', top: '12px',
            width: '110px', height: '165px',
            background: 'linear-gradient(200deg, #2d0050 0%, #1a0035 100%)',
            border: '2px solid rgba(168,85,247,0.45)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.45) 50%, transparent 100%)',
              backgroundSize: '100% 30px',
              animation: 'scanline 2.4s linear infinite',
              animationDelay: '-1.2s',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(200deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.06) 100%)',
              animation: 'led-pulse 3s ease-in-out infinite',
              animationDelay: '-1.5s',
            }} />
          </div>

          {/* Center banner screen */}
          <div style={{
            position: 'absolute', left: '50%', top: '12px',
            transform: 'translateX(-50%)',
            width: '38%', height: '130px',
            background: 'linear-gradient(180deg, #1a0030 0%, #0d001e 100%)',
            border: '2px solid rgba(168,85,247,0.25)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <span style={{
              color: 'rgba(168,85,247,0.5)',
              fontSize: '13px',
              letterSpacing: '0.35em',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontWeight: 700,
              animation: 'led-pulse 4s ease-in-out infinite',
            }}>
              BTS
            </span>
            {/* Shimmer sweep */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.12) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'stage-shimmer 3s linear infinite',
            }} />
          </div>

          {/* Left speaker stack */}
          <div style={{
            position: 'absolute', left: '142px', top: '20px',
            width: '38px', height: '155px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1f 100%)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: '3px',
            animation: 'truss-glow 4s ease-in-out infinite',
          }} />

          {/* Right speaker stack */}
          <div style={{
            position: 'absolute', right: '142px', top: '20px',
            width: '38px', height: '155px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1f 100%)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: '3px',
            animation: 'truss-glow 4s ease-in-out infinite',
            animationDelay: '-2s',
          }} />
        </div>

        {/* ── Stage floor (trapezoid via clip-path) ── */}
        <div style={{
          position: 'relative',
          height: '120px',
          background: 'linear-gradient(180deg, #1e1a35 0%, #0d0d1f 100%)',
          clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
        }}>
          {/* Subtle grid lines on floor */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(168,85,247,0.06) 60px)',
            clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
          }} />
          {/* Front edge purple glow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.85) 20%, rgba(255,255,255,0.7) 50%, rgba(168,85,247,0.85) 80%, transparent 100%)',
            boxShadow: '0 0 18px rgba(168,85,247,0.6)',
          }} />
          {/* Floor shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.05), transparent)',
            backgroundSize: '200% 100%',
            animation: 'stage-shimmer 4s linear infinite',
          }} />
        </div>

        {/* Catwalk (narrow forward strip) */}
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '32px',
          background: 'linear-gradient(180deg, #1e1a35 0%, #0d0d1f 100%)',
          borderLeft: '1px solid rgba(168,85,247,0.2)',
          borderRight: '1px solid rgba(168,85,247,0.2)',
          borderBottom: '2px solid rgba(168,85,247,0.5)',
        }} />
      </div>

      {/* ══════════════════════════════════════════
          7 DANCING MEMBERS ON STAGE
      ══════════════════════════════════════════ */}
      <div
        className="absolute z-10"
        style={{
          bottom: 'calc(18% + 118px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(4px, 2vw, 28px)',
          width: 'min(900px, 90%)',
        }}
      >
        {MEMBER_CONFIGS.map((m) => {
          const isHovered = hoveredMember === m.id;
          return (
            <div
              key={m.id}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredMember(m.id)}
              onMouseLeave={() => setHoveredMember(null)}
              style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.12) translateY(-6px)' : 'scale(1)' }}
            >
              {/* Spotlight cone when hovered */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80px',
                    height: '120px',
                    background: `linear-gradient(to top, ${m.color}30, transparent)`,
                    clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Dancer */}
              <DancingFigure
                color={m.color}
                variant={m.variant}
                delay={m.delay}
                speed={isHovered ? 1.5 : 1}
                size={clamp(80, 115)}
                glowing={isHovered}
              />

              {/* Name label */}
              <span
                style={{
                  marginTop: '6px',
                  fontSize: isHovered ? '11px' : '9px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: m.color,
                  textShadow: isHovered
                    ? `0 0 8px ${m.color}, 0 0 16px ${m.color}cc`
                    : `0 0 6px ${m.color}80`,
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.name}
              </span>
            </div>
          );
        })}
      </div>
```

**Important:** The `clamp(80, 115)` in the DancingFigure `size` prop is wrong — use a fixed value of `110` instead. Also add a simple `clamp` helper OR just use `110` directly. Use `110` directly.

So the DancingFigure line should be:
```tsx
<DancingFigure
  color={m.color}
  variant={m.variant}
  delay={m.delay}
  speed={isHovered ? 1.5 : 1}
  size={110}
  glowing={isHovered}
/>
```

**Step 2: Type-check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

If there is a TypeScript error about `MEMBER_CONFIGS` not being defined, make sure you added it **inside** the component function (after `const brightColors = [...]`). If `hoveredMember` is not found, make sure you added `const [hoveredMember, setHoveredMember] = useState<string | null>(null);` inside the component.

Expected: no errors.

**Step 3: Verify in dev server**

```bash
cd "C:\Development\BTS universe" && npm run dev
```

Open the app. The landing screen should show:
- 7 colored dancing figures on a trapezoid stage
- LED screens on back wall flanking a center BTS banner
- Figures bounce and move arms/legs independently
- Hover a figure → it scales up, spotlight cone appears, animation speeds up, name glows
- ARMY bomb ocean still visible in foreground
- Spotlight beams, nebula, stars all intact
- "BANGTAN UNIVERSE" title + "ENTER THE UNIVERSE" CTA still present

**Step 4: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/components/features/LandingRitual.tsx && git commit -m "feat: replace member capsules with animated dancing figures on CSS concert stage"
```

---

### Task 4: Export DancingFigure from visual index + push

**Files:**
- Modify: `src/components/visual/index.ts` (or wherever BTSLogo and ArmyBombCanvas are exported)
- Run: `git push`

**Step 1: Find the visual barrel export file**

```bash
cd "C:\Development\BTS universe" && cat src/components/visual/index.ts 2>/dev/null || cat src/components/visual/index.tsx 2>/dev/null
```

**Step 2: Add DancingFigure to the export**

If `src/components/visual/index.ts` exists and exports `BTSLogo` and `ArmyBombCanvas`, add:
```typescript
export { default as DancingFigure } from './DancingFigure';
```

**Step 3: Type-check one final time**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Expected: clean.

**Step 4: Commit and push**

```bash
cd "C:\Development\BTS universe" && git add src/components/visual/ && git commit -m "feat: export DancingFigure from visual components barrel"
cd "C:\Development\BTS universe" && git push
```
