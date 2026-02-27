# Overview Bento Grid Redesign — Design

**Date:** 2026-02-26
**Status:** Approved
**Scope:** `src/components/features/sections/HomeSection/`

---

## Inspiration

Dashboard-style bento grid with unequal card sizes, real recharts mini-charts embedded in each card, multiple metric chips per card, and a vivid accent color palette. BTS Universe uses monochromatic purple (Borahae) in place of the inspiration's green/orange.

---

## Layout

```
[Stats strip — 6 animated StatCards, unchanged]

Desktop 3-column bento grid:
┌──────────────────────┬──────────────────────┬───────────────┐
│ MUSIC                │ MEMBERS              │               │
│ songs · eras ·       │ artists · KOMCA ·    │  MOOD         │
│ title tracks         │ top contributor      │  QUADRANT     │
│ [Area chart]         │ [H-bar chart]        │  [Scatter]    │
│                      │                      │  (tall card,  │
├──────────────────────┴──────────────────────┤  rows 1+2)    │
│ AWARDS                                      │               │
│ won · nominated · ceremonies                │               │
│ [Bar chart — wins by year]                  │               │
└─────────────────────────────────────────────┴───────────────┘

Tablet (md): 2-col, mood drops below awards
Mobile: 1-col stack
```

CSS Grid:
- MUSIC: `lg:col-span-1 lg:row-span-1`
- MEMBERS: `lg:col-span-1 lg:row-span-1`
- MOOD: `lg:col-span-1 lg:row-span-2` (tall)
- AWARDS: `lg:col-span-2 lg:row-span-1` (wide)

---

## Card Anatomy

Every card shares this internal structure:

```
┌─────────────────────────────────────┐
│ TITLE                           ... │  small uppercase, white/50
│                                     │
│  [N]        [N]       [N]           │  2–3 metric chips:
│  label      label     label         │  text-2xl bold + text-xs label
│                                     │
│  ┌─────────────────────────────┐   │
│  │   recharts chart            │   │  fills remaining flex space
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Card styles:**
- Background: `bg-[#0e0e14]`
- Border: `border-white/[0.06]`, hover `border-white/[0.10]`
- Metric number: `text-2xl font-bold text-white/95 tabular-nums`
- Metric label: `text-[10px] text-white/40 uppercase tracking-wide mt-0.5`
- Rounded: `rounded-2xl`
- Padding: `p-5`
- Layout: `flex flex-col gap-4`

---

## Cards

### MUSIC (medium, top-left)
- **Metrics:** `songs.length` · `eras.length` · `songs.filter(is_title_track).length` (title tracks)
- **Chart:** `AreaChart` (recharts) — x-axis = era names from `computeEraEvolution`, two area series: `avgEnergy` (purple) + `avgValence` (purple/40), height 140px
- **Navigate:** `onNavigate('discography')`

### MEMBERS (medium, top-middle)
- **Metrics:** `members.length` (artists) · `totalKomca` (KOMCA credits) · top contributor by `komcaCredits` (name)
- **Chart:** `BarChart` horizontal (recharts) — one bar per member, value = `komcaCredits`, bar fill = member's `color` field, height 160px
- **Navigate:** `onNavigate('members')`

### MOOD QUADRANT (tall, right column, 2 rows)
- **Metrics:** count of songs with valence + energy data · top sentiment label
- **Chart:** `ScatterChart` (recharts) — x = valence, y = energy, dot fill = `getSentimentColor(sentiment)`, height ~300px (fills tall card)
- **Navigate:** `onNavigate('analytics')`

### AWARDS (wide, bottom, 2 cols)
- **Metrics:** `awardsWon` (won) · `awards.length - awardsWon` (nominated) · `uniqueCeremonies` count
- **Chart:** `BarChart` vertical (recharts) — x-axis = year, y-axis = wins count, purple bars, height 140px
- **Navigate:** `onNavigate('awards')`

---

## Implementation

**Files:**
- Create: `src/components/features/sections/HomeSection/BentoCard.tsx` — reusable card shell
- Rewrite: `src/components/features/sections/HomeSection/index.tsx` — stats strip + bento grid
- Delete: `src/components/features/sections/HomeSection/SectionCard.tsx` — replaced by BentoCard

**Data:** All props already on `HomeSectionProps`. Analytics functions from `analyticsService.ts`. Chart components from `recharts` (already installed).

**No new services, hooks, or API calls needed.**
