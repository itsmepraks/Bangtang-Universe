# Responsive Improvements + Visual Polish + Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the BTS Universe app fully responsive across all screen sizes (375px–1440px+), with visual polish and dead code removed.

**Architecture:** Pure CSS/Tailwind responsive adjustments with minimal logic changes. No new routes, no structural rewrites. Each task is an isolated file edit followed by a commit.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4, Vite, Recharts, Framer Motion

---

## Context for the Implementer

- Repo: `C:\Development\BTS universe`
- Start from `main` branch (already has the latest code)
- No test suite to run — verify visually in the browser with `npm run dev`
- Never run `npx tsc --noEmit` — user has declined this
- Commit without `Co-Authored-By` line (user preference)
- Tailwind 4 uses `@import "tailwindcss"` — no `tailwind.config.js`

**Key breakpoints used in this project:**
- `sm` = 640px (Tailwind default)
- `md` = 768px
- `lg` = 1024px

---

## Task 1: Remove dead code — unused visual components

**Files:**
- Delete: `src/components/visual/DancingFigure.tsx`
- Delete: `src/components/visual/MemberSilhouette.tsx`
- Modify: `src/components/visual/index.ts`
- Modify: `package.json`

**Step 1: Delete unused component files**

```bash
rm "src/components/visual/DancingFigure.tsx"
rm "src/components/visual/MemberSilhouette.tsx"
```

**Step 2: Remove their exports from the barrel**

Current `src/components/visual/index.ts`:
```ts
export { BTSLogo } from './BTSLogo';
export { ArmyBombCanvas } from './ArmyBombCanvas';
export { StarFieldCanvas } from './StarFieldCanvas';
export { default as DancingFigure } from './DancingFigure';
export { default as MemberSilhouette } from './MemberSilhouette';
```

New `src/components/visual/index.ts`:
```ts
export { BTSLogo } from './BTSLogo';
export { ArmyBombCanvas } from './ArmyBombCanvas';
export { StarFieldCanvas } from './StarFieldCanvas';
```

**Step 3: Remove `prop-types` from package.json**

In `package.json`, find and remove the `"prop-types": "^15.8.1"` line from `dependencies`.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused DancingFigure, MemberSilhouette, prop-types"
```

---

## Task 2: Fix AnalyticsSection tab row overflow on mobile

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/index.tsx`

**Problem:** Line 137 — the sub-tab row (`flex items-center gap-1.5`) has no overflow handling. In the "Career" group the three tabs are "Writing Network" + "Awards & Charts" + "Career Timeline" — combined they exceed 375px.

**Step 1: Add overflow-x-auto and flex-nowrap to the tab row container**

Current (line 137):
```tsx
<div className="flex items-center gap-1.5" role="tablist" aria-label="Analytics views">
```

New:
```tsx
<div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Analytics views">
```

**Step 2: Add flex-shrink-0 to each tab button so tabs don't compress**

Current (line 149):
```tsx
className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
```

New:
```tsx
className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
```

**Step 3: Add a right-side fade hint so users know there's more to scroll**

Wrap the existing tab-row `<div>` in a relative container with a fade overlay:

Replace the entire tab row section (currently lines 136–160):
```tsx
{/* Row 2: Sub-tabs for active group */}
<div className="relative">
  {/* Scroll fade hint */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Analytics views">
    {groupTabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          id={`analytics-tab-${tab.id}`}
          role="tab"
          aria-selected={isActive}
          aria-controls="analytics-tabpanel"
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            isActive
              ? 'bg-purple-500/10 text-white border border-purple-500/30'
              : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          <span className="whitespace-nowrap">{tab.label}</span>
        </button>
      );
    })}
  </div>
</div>
```

**Step 4: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/index.tsx
git commit -m "fix: analytics tab row overflow-x-auto with fade hint for mobile"
```

---

## Task 3: Fix MemberComparison table on mobile

**Files:**
- Modify: `src/components/features/comparison/MemberComparison.tsx`

**Problem:** The comparison table (line 104) has 3 columns with `px-4` cells. On 375px the columns are cramped and may clip.

**Step 1: Wrap the table container in overflow-x-auto and give table a min-width**

Current (lines 102–122):
```tsx
{/* Comparison Table */}
<div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
  <table className="w-full">
```

New:
```tsx
{/* Comparison Table */}
<div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-x-auto">
  <table className="w-full min-w-[360px]">
```

**Step 2: Tighten cell padding on mobile**

Current `<th>` padding: `py-3 px-4` (appears on lines 107–109)
New: `py-3 px-3 sm:px-4`

Current `<td>` padding: `py-3 px-4` (lines 115–117)
New: `py-3 px-3 sm:px-4`

**Step 3: Commit**

```bash
git add src/components/features/comparison/MemberComparison.tsx
git commit -m "fix: member comparison table scrollable and tighter padding on mobile"
```

---

## Task 4: Fix LandingRitual spotlight names on mobile

**Files:**
- Modify: `src/components/features/LandingRitual.tsx`

**Problem:** 7 member name labels are centered in 32px-wide columns on 375px. "J-HOPE" at 11px with `letter-spacing: 0.12em` is ~66px wide — 25px wider than the 41px center-to-center spacing. Names overlap each other.

**Step 1: Add a `short` field to the MEMBERS constant**

Current MEMBERS (lines 11–19):
```ts
const MEMBERS = [
  { color: '#3B82F6', glow: '#60A5FA', delay: 0.00, name: 'RM'     },
  { color: '#F472B6', glow: '#FB7185', delay: 0.30, name: 'JIN'    },
  { color: '#CBD5E1', glow: '#E2E8F0', delay: 0.55, name: 'SUGA'   },
  { color: '#F8FAFC', glow: '#FFFFFF', delay: 0.15, name: 'J-HOPE' },
  { color: '#FBBF24', glow: '#FCD34D', delay: 0.45, name: 'JIMIN'  },
  { color: '#34D399', glow: '#6EE7B7', delay: 0.70, name: 'V'      },
  { color: '#A78BFA', glow: '#C4B5FD', delay: 0.25, name: 'JK'     },
] as const;
```

New MEMBERS (add a `short` field for the mobile label):
```ts
const MEMBERS = [
  { color: '#3B82F6', glow: '#60A5FA', delay: 0.00, name: 'RM',     short: 'RM'  },
  { color: '#F472B6', glow: '#FB7185', delay: 0.30, name: 'JIN',    short: 'JIN' },
  { color: '#CBD5E1', glow: '#E2E8F0', delay: 0.55, name: 'SUGA',   short: 'SG'  },
  { color: '#F8FAFC', glow: '#FFFFFF', delay: 0.15, name: 'J-HOPE', short: 'JH'  },
  { color: '#FBBF24', glow: '#FCD34D', delay: 0.45, name: 'JIMIN',  short: 'JM'  },
  { color: '#34D399', glow: '#6EE7B7', delay: 0.70, name: 'V',      short: 'V'   },
  { color: '#A78BFA', glow: '#C4B5FD', delay: 0.25, name: 'JK',     short: 'JK'  },
] as const;
```

**Step 2: Use responsive name display in the button**

Current (lines 240–242):
```tsx
>
  {m.name}
</button>
```

New — show abbreviated name on very small screens, full name on sm+:
```tsx
>
  <span className="sm:hidden">{m.short}</span>
  <span className="hidden sm:inline">{m.name}</span>
</button>
```

**Step 3: Reduce letter-spacing slightly and tighten the gap on mobile**

The member name button currently has `letterSpacing: '0.12em'`. For the short labels on mobile this can stay since they're 2-3 chars. No change needed to the style object.

Tighten the spotlight container gap on mobile — currently `gap: 'clamp(4px, 2.5vw, 40px)'`. Change to `clamp(3px, 2vw, 40px)` to give the names a tiny bit more breathing room:

Current (line 145):
```tsx
gap: 'clamp(4px, 2.5vw, 40px)',
```

New:
```tsx
gap: 'clamp(3px, 2vw, 40px)',
```

**Step 4: Ensure name buttons meet 44px touch target on mobile**

The name buttons have no explicit height. Add `minHeight: '44px'` and flex centering so the tappable area is adequate:

Current button style object (around line 226):
```tsx
style={{
  bottom: '12px',
  fontSize: 'clamp(11px, 2.4vw, 13px)',
  ...
}}
```

New — add `minHeight` and flex display:
```tsx
style={{
  bottom: '0px',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  minHeight: '44px',
  paddingBottom: '4px',
  fontSize: 'clamp(11px, 2.4vw, 13px)',
  fontWeight: '700',
  letterSpacing: '0.12em',
  color: m.glow,
  textShadow: `0 0 12px ${m.color}, 0 0 20px ${m.color}88, 0 1px 4px rgba(0,0,0,0.9)`,
  whiteSpace: 'nowrap',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  background: 'none',
  border: 'none',
  padding: '0 0 4px 0',
  WebkitTapHighlightColor: 'transparent',
}}
```

**Step 5: Commit**

```bash
git add src/components/features/LandingRitual.tsx
git commit -m "fix: landing spotlight names — abbreviated on mobile, 44px touch targets"
```

---

## Task 5: Fix Mood Quadrant chart collapse on mobile

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx`

**Problem:** The Mood Quadrant BentoCard uses `lg:row-span-2` for height on desktop. On mobile (single-column grid), the card has no defined height. The ScatterChart uses `height="100%"` inside `<div className="relative h-full">` — with no parent height, the chart collapses to 0px.

**Step 1: Give the chart wrapper an explicit minimum height**

Current (around line 284):
```tsx
<div className="relative h-full">
```

New:
```tsx
<div className="relative h-full min-h-[280px]">
```

**Step 2: Commit**

```bash
git add src/components/features/sections/HomeSection/index.tsx
git commit -m "fix: mood quadrant chart min-height prevents collapse on mobile"
```

---

## Task 6: Scale down StatCard number on mobile

**Files:**
- Modify: `src/components/features/sections/HomeSection/StatCard.tsx`

**Problem:** In a `grid-cols-2` layout on 375px, each StatCard is ~160px wide. The counter uses `text-3xl` (30px). Numbers like "41,000" are ~150px wide — just barely fits but very tight with `p-5` padding.

**Step 1: Responsive font size**

Current (line 37):
```tsx
<span className="text-3xl font-semibold text-white/95 tabular-nums">{displayed.toLocaleString()}</span>
```

New:
```tsx
<span className="text-2xl sm:text-3xl font-semibold text-white/95 tabular-nums">{displayed.toLocaleString()}</span>
```

**Step 2: Commit**

```bash
git add src/components/features/sections/HomeSection/StatCard.tsx
git commit -m "fix: stat card number scales down on mobile"
```

---

## Task 7: Fix section panel padding on mobile

**Files:**
- Modify: `src/components/features/sections/ToursSection/index.tsx`
- Modify: `src/components/features/sections/AwardsSection/index.tsx`
- Modify: `src/components/features/sections/MediaSection/index.tsx`

**Problem:** ToursSection, AwardsSection, and MediaSection render inner panels with hardcoded `p-6`. On a 375px phone with the dashboard's `p-4` container, this creates 16+24 = 40px of left/right padding and makes content very narrow.

**For each of the three files:**

**Step 1: Find panel divs with `p-6` and make them responsive**

Search for: `className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6"`
Replace with: `className="bg-[#111118] rounded-2xl border border-white/[0.06] p-4 sm:p-6"`

Also search for any `p-6` inside tab panel containers in these three files and apply the same `p-4 sm:p-6` pattern.

**Step 2: Commit**

```bash
git add src/components/features/sections/ToursSection/index.tsx
git add src/components/features/sections/AwardsSection/index.tsx
git add src/components/features/sections/MediaSection/index.tsx
git commit -m "fix: section panels responsive padding p-4 sm:p-6"
```

---

## Task 8: Fix BentoCard explore button touch target

**Files:**
- Modify: `src/components/features/sections/HomeSection/BentoCard.tsx`

**Problem:** The `→` explore button uses `p-1.5` — touch target is about 24×24px, below the 44px WCAG minimum.

**Step 1: Increase the button padding**

Current (line 43):
```tsx
className="text-white/40 hover:text-purple-400/70 transition-colors duration-200 text-sm leading-none p-1.5"
```

New:
```tsx
className="text-white/40 hover:text-purple-400/70 transition-colors duration-200 text-sm leading-none p-3 -mr-1"
```

**Step 2: Commit**

```bash
git add src/components/features/sections/HomeSection/BentoCard.tsx
git commit -m "fix: bento card explore button meets 44px touch target"
```

---

## Task 9: Fix sidebar nav touch targets

**Files:**
- Modify: `src/App.tsx`

**Problem:** Sidebar nav items have `py-2.5` (~36px touch height). Should be `py-3` for 44px.

**Step 1: Increase nav item padding**

Current (line 234):
```tsx
className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full text-left ${
```

New:
```tsx
className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "fix: sidebar nav items meet 44px touch target"
```

---

## Task 10: Final verification pass

**Step 1: Run the dev server**

```bash
npm run dev
```

**Step 2: Check each breakpoint in browser DevTools**

Open Chrome DevTools → Toggle Device Toolbar → test at:
- 375px (iPhone SE)
- 430px (iPhone 14 Pro Max)
- 768px (iPad)
- 1280px (laptop)
- 1440px (desktop)

**Checklist:**
- [ ] Landing: 7 member names visible and non-overlapping at 375px (abbreviated: RM, JIN, SG, JH, JM, V, JK)
- [ ] Analytics: "Career" group tabs scroll horizontally with fade hint visible at 375px
- [ ] Member Comparison: table scrolls horizontally at 375px, doesn't clip
- [ ] Mood Quadrant chart: visible at 375px (not collapsed)
- [ ] Stat cards: numbers fit comfortably in 2-column grid at 375px
- [ ] BentoCard explore buttons: easy to tap on phone
- [ ] Sidebar nav: tap areas are comfortable
- [ ] Section panels: not over-padded at 375px
- [ ] No broken layouts at any breakpoint

**Step 3: Final commit if any tweaks were needed**

```bash
git add -A
git commit -m "fix: final responsive tweaks from verification pass"
```
