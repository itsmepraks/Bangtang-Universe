# Landing Concert Stage Design

**Date:** 2026-02-28

## Goal

Replace the capsule silhouette members on the `LandingRitual` splash screen with Lottie animated dancing figures on a CSS 3D perspective concert stage, keeping the existing nebula/starfield/ARMY bomb atmosphere.

## What Stays

- Dark space background (`#050010 → #0a0018 → #080012`)
- Starfield + nebula glow divs
- `ArmyBombCanvas` (purple ARMY bomb ocean)
- Spotlight beam layers (top rig + side beams)
- Stage platform glow + floor reflection grid
- "BANGTAN UNIVERSE" title (top)
- BTS logo + "ENTER THE UNIVERSE" CTA (bottom)

## What Changes

### 1. Concert Stage Structure (CSS 3D)

Replace the simple stage platform glow with a proper isometric concert stage built from CSS 3D-transformed divs:

- **Stage floor** — wide trapezoid using `perspective: 1200px` + `rotateX(25deg)` on a container, giving forced depth/isometric feel
- **Back wall** — vertical rectangle behind the stage in dark charcoal
- **Two LED screens** — tall flanking rectangles, animated purple/magenta scanline gradient (`@keyframes scanline`)
- **Speaker stacks** — two blocky columns left and right of back wall
- **Catwalk** — narrow forward-extending strip from center stage
- **Stage edge strip** — thin glowing line along front edge (purple linear gradient)

All CSS, no new packages for the stage itself.

### 2. Lottie Animated Dancers

Replace the 7 capsule silhouettes with 7 Lottie animation players:

**Package:** `lottie-react` (npm install)

**Animation files:** 2–3 free dancing-person Lottie JSONs from LottieFiles, stored in `public/lottie/`:
- `public/lottie/dancer-a.json` — arms-up dance pose
- `public/lottie/dancer-b.json` — side-step dance pose
- `public/lottie/dancer-c.json` — front-facing performance

Each of the 7 members gets one of the 3 animations (rotated: A, B, C, A, B, C, A).

**Per-member color tinting:** CSS filter on each Lottie wrapper:
```
filter: hue-rotate(Xdeg) saturate(1.8) brightness(1.2)
```
Each member has a pre-calculated `hue-rotate` value to land on their color.

**Staggered timing:** Each dancer has a unique `animationDelay` (0–2s range) and slightly different `speed` prop so they never sync up.

**Member colors & hue-rotate offsets:**
- RM (blue #3B82F6): hue-rotate(220deg)
- Jin (pink #EC4899): hue-rotate(320deg)
- Suga (silver #94A3B8): hue-rotate(210deg) + desaturate
- J-Hope (white #FFFFFF): brightness(2) saturate(0)
- Jimin (amber #F59E0B): hue-rotate(35deg)
- V (green #10B981): hue-rotate(160deg)
- JK (purple #8B5CF6): hue-rotate(270deg)

### 3. Hover Interaction

On hover of a member dancer:
- Their spotlight beam intensifies (CSS variable → opacity transition)
- Name label glows brighter + scales up slightly
- Lottie `speed` increases to 1.5×
- A `box-shadow` halo pulses around the dancer

Implemented via `useState<number | null>(hoveredMember)` and conditional styles.

### 4. Click → Member Navigation

Click a dancer → calls `onNavigate('members', memberId)` if `onNavigate` is wired through. The `LandingRitual` component currently only has `onSync: () => void`. The `onNavigate` prop is optional — if not provided, click is a no-op.

### 5. Responsive Scaling

The entire stage + dancers container uses:
```css
transform: scale(var(--stage-scale));
```
Where `--stage-scale` is set per breakpoint:
- `≥1280px` (xl): 1.0
- `≥1024px` (lg): 0.85
- `≥768px` (md): 0.7
- `<768px`: 0.55

This keeps the stage proportions intact on mobile without complex responsive logic.

## Files to Touch

- **Modify:** `src/components/features/LandingRitual.tsx` — main redesign
- **Add:** `public/lottie/dancer-a.json`, `dancer-b.json`, `dancer-c.json`
- **Install:** `lottie-react`

## New Props

`LandingRitual` gets one optional new prop:
```typescript
onNavigate?: (section: string, payload?: unknown) => void;
```

## Member Lottie Assignment

| Index | Member | Color | Animation | Hue-rotate |
|-------|--------|-------|-----------|------------|
| 0 | RM | #3B82F6 | dancer-a | 220deg |
| 1 | Jin | #EC4899 | dancer-b | 320deg |
| 2 | Suga | #94A3B8 | dancer-c | 210deg |
| 3 | J-Hope | #FFFFFF | dancer-a | 0deg + saturate(0) |
| 4 | Jimin | #F59E0B | dancer-b | 35deg |
| 5 | V | #10B981 | dancer-c | 160deg |
| 6 | JK | #8B5CF6 | dancer-a | 270deg |
