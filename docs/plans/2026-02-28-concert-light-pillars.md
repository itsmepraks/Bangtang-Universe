# Concert Light Pillars Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the member SVG silhouettes with 7 soft colored light beam pillars on stage — one per BTS member in their color — so the landing page reads as pure concert atmosphere with no cartoon figures.

**Architecture:** Single file change to `LandingRitual.tsx`: remove `MemberSilhouette` import + `SILHOUETTE_CONFIGS` + `hoveredMember` state, add `MEMBER_LIGHTS` constant, replace the entire silhouettes JSX section with 7 vertically-blurred colored `<div>` pillars that use the existing `led-pulse` CSS keyframe.

**Tech Stack:** React 18, TypeScript, inline CSS, existing `led-pulse` keyframe already in `src/index.css`. No new files, no new packages.

---

### Task 1: Replace silhouettes with concert light pillars in `LandingRitual.tsx`

**Files:**
- Modify: `src/components/features/LandingRitual.tsx`

**Step 1: Read the current file to confirm line numbers**

Read `src/components/features/LandingRitual.tsx`. Verify:
- Line 1: `import React, { useMemo, useState }`
- Line 4: `import MemberSilhouette from '../visual/MemberSilhouette';`
- Lines 10–18: `SILHOUETTE_CONFIGS` constant
- Line 84: `const [hoveredMember, setHoveredMember] = useState<string | null>(null);`
- Lines ~368–422: `{/* 7 MEMBER SILHOUETTES */}` JSX section

**Step 2: Make all changes**

**Change A — Line 1:** Remove `useState` from the React import (it won't be used once `hoveredMember` is removed):

Change:
```tsx
import React, { useMemo, useState } from 'react';
```
To:
```tsx
import React, { useMemo } from 'react';
```

**Change B — Line 4:** Remove the `MemberSilhouette` import entirely (delete the whole line):
```tsx
import MemberSilhouette from '../visual/MemberSilhouette';
```

**Change C — Lines 10–18:** Replace `SILHOUETTE_CONFIGS` with `MEMBER_LIGHTS`:

Remove:
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
```

Add:
```tsx
// 7 colored concert light pillars — one per member in their signature color
const MEMBER_LIGHTS = [
  { color: '#3B82F6', delay: 0.00 },  // RM    — blue
  { color: '#EC4899', delay: 0.30 },  // Jin   — pink
  { color: '#94A3B8', delay: 0.55 },  // Suga  — silver
  { color: '#FFFFFF', delay: 0.15 },  // JHope — white
  { color: '#F59E0B', delay: 0.45 },  // Jimin — amber
  { color: '#10B981', delay: 0.70 },  // V     — green
  { color: '#8B5CF6', delay: 0.25 },  // JK    — purple
] as const;
```

**Change D — Line 84:** Remove the `hoveredMember` state line entirely:
```tsx
const [hoveredMember, setHoveredMember] = useState<string | null>(null);
```

**Change E — Replace the entire `{/* 7 MEMBER SILHOUETTES */}` JSX block**

Find the comment `{/* ══════════════════════════════════════════` for "7 MEMBER SILHOUETTES" and delete everything from that comment through its closing `</div>` (the one just before `{/* FOREGROUND ARMY BOMBS */}`).

Replace the deleted block with:

```tsx
      {/* ══════════════════════════════════════════
          CONCERT LIGHT PILLARS
          7 soft colored beams rising from stage —
          one per member, pure light no figures
      ══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 'calc(22% + 66px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 'clamp(10px, 3.5vw, 52px)',
          width: 'min(780px, 90%)',
          zIndex: 6,
        }}
      >
        {MEMBER_LIGHTS.map((m, i) => (
          <div
            key={i}
            style={{
              width: '22px',
              height: '270px',
              background: `linear-gradient(to top,
                ${m.color}dd 0%,
                ${m.color}99 20%,
                ${m.color}55 45%,
                ${m.color}22 65%,
                transparent 100%)`,
              filter: 'blur(18px)',
              borderRadius: '50%',
              flexShrink: 0,
              animation: `led-pulse ${3.0 + m.delay * 0.8}s ease-in-out infinite`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>
```

**Step 3: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

Common errors and fixes:
- `useState` not found: already removed in Change A — correct
- `hoveredMember` referenced elsewhere: search for any remaining references and remove them
- `SILHOUETTE_CONFIGS` still referenced: confirm Change C removed all occurrences

Expected: zero errors.

**Step 4: Commit**

```bash
cd "C:\Development\BTS universe" && git add src/components/features/LandingRitual.tsx && git commit -m "feat: replace member silhouettes with pure concert light pillars"
```

---

### Task 2: Export MemberSilhouette from visual barrel + push

**Files:**
- Modify: `src/components/visual/index.ts`

**Step 1: Read `src/components/visual/index.ts`**

Check current exports — it should have `BTSLogo`, `ArmyBombCanvas`, `StarFieldCanvas`, `DancingFigure`.

**Step 2: Add MemberSilhouette export**

Add this line (even though LandingRitual no longer uses it directly, it keeps the barrel consistent):
```typescript
export { default as MemberSilhouette } from './MemberSilhouette';
```

**Step 3: TypeScript check**

```bash
cd "C:\Development\BTS universe" && npx tsc --noEmit
```

**Step 4: Commit and push all**

```bash
cd "C:\Development\BTS universe" && git add src/components/visual/index.ts && git commit -m "feat: export MemberSilhouette from visual barrel"
cd "C:\Development\BTS universe" && git push
```
