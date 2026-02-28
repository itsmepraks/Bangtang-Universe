# Immersive Concert Landing Page Redesign

**Date:** 2026-02-28

## Goal

Replace the clinical CSS concert stage + colorful stick figures with a POV concert experience: dark human silhouettes on a backlit stage, surrounded by a sea of purple ARMY bomb bokeh — making the user feel like they're standing inside a BTS stadium concert.

## What Changes

### Layout Philosophy

The screen becomes a first-person concert shot: cosmic sky above, BTS members as dark silhouettes center-stage against dramatic backlight, ARMY bomb bokeh filling the entire frame (crowd in arcs/sides from ArmyBombCanvas, large close-up orbs at screen bottom as if you're in the crowd).

### 1. Replace `DancingFigure` → `MemberSilhouette`

New `src/components/visual/MemberSilhouette.tsx`:
- 7 distinct SVG human-body silhouettes, one per member, in unique performance poses
- Dark fill (`rgba(15, 8, 25, 0.95)`) — these are backlit silhouettes, not colored cartoons
- Backlit glow: a blurred radial-gradient div behind each figure, white/lavender
- On hover: backlight intensifies, figure scales up, rim-light appears
- Gentle bounce animation per instance via `useId()` scoped `@keyframes`
- Size prop (default 150px height)

**7 Poses (arm angles from horizontal):**
| # | Member | Left Arm | Right Arm | Character |
|---|--------|----------|-----------|-----------|
| 1 | RM     | -30°     | +20°      | Left arm partially raised, right relaxed |
| 2 | Jin    | -50°     | -50°      | Both arms raised — V-shape |
| 3 | Suga   | +55°     | -5°       | Chill — left arm hanging, right neutral |
| 4 | J-Hope | 0°       | 0°        | Arms spread wide — max energy |
| 5 | Jimin  | -75°     | -75°      | Both arms high — celebration |
| 6 | V      | +10°     | -60°      | Right arm reaching up, left relaxed |
| 7 | JK     | -85°     | -35°      | Left fist pumped up, right raised |

### 2. Replace CSS Concert Stage

Remove: back wall, LED screens, speaker stacks, center banner, catwalk.

Add:
- **Central backlight bloom**: large blurred radial-gradient ellipse (white center → purple edge) behind the member row — simulates the powerful stage backlight that creates the silhouette effect
- **BTS arch**: SVG pointed arch / gate shape behind the members, glowing neon white/purple
- **Stage floor**: same trapezoid clip-path floor, but narrower and simpler (no back wall)

### 3. Foreground Army Bomb Layer

New CSS div layer at z-8, `bottom: 0, height: 16%`:
- 13 large blurry orbs (38–75px, blur 12–25px) — precomputed constant, no `Math.random()` in render
- Simulate army bombs held by fans right next to the viewer
- Combined with `ArmyBombCanvas`'s existing arcs/walls/bottom-crowd creates full surround effect

## Files to Touch

- **Create:** `src/components/visual/MemberSilhouette.tsx`
- **Modify:** `src/index.css` — add `@keyframes foreground-twinkle`
- **Modify:** `src/components/features/LandingRitual.tsx` — full stage section replacement
- **Modify:** `src/components/visual/index.ts` — add MemberSilhouette export
