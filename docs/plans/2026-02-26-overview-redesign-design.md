# Overview Page Redesign — Design

**Date:** 2026-02-26
**Status:** Approved
**Scope:** `src/components/features/sections/HomeSection/`

---

## Problem

The current Overview page is a collection of independent widgets (stats strip, text insight cards, milestones, era timeline, title tracks) with no connecting narrative. New visitors cannot tell what the site is about or what information is available. Returning fans cannot navigate quickly.

## Solution

Restructure the Overview as a **hero + stats strip + 6 uniform section cards**, one card per major section of the site. Each card gives a headline stat, a small data preview, and a direct navigation link.

---

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HERO: "Bangtan Universe" · tagline                         │
├──────────────────────────────────────────────────────────────┤
│  STATS STRIP: Songs · Albums · Members · KOMCA · Won · Shows │
├──────────────────────────────────────────────────────────────┤
│  SECTION CARDS — 3×2 grid (desktop), 1-col (mobile)         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│  │ 🎵 Music  │ │ 👥 Members│ │ 🏆 Awards │                  │
│  │ N songs   │ │ 7 artists │ │ N won     │                  │
│  │ [era bars]│ │[color dots│ │[won/nom]  │                  │
│  │ Explore → │ │ Explore → │ │ Explore → │                  │
│  └───────────┘ └───────────┘ └───────────┘                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                  │
│  │📊Analytics│ │🎤 Concerts│ │✨ Insights│                  │
│  │ sentiment │ │N countries│ │ rotating  │                  │
│  │ [bars]    │ │[tour list]│ │ stat fact │                  │
│  │ Explore → │ │ Explore → │ │ Explore → │                  │
│  └───────────┘ └───────────┘ └───────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Card Contents

| Card | Headline stat | Mini-preview | Navigate to |
|------|--------------|-------------|-------------|
| **Music** | "N songs · N eras" | Top 4 eras as labeled bars (width ∝ song count), colored by era `cover_color` | `discography` |
| **Members** | "7 artists" | Row of 7 colored circles with stage names | `members` |
| **Awards** | "N awards won" | Two horizontal bars — Won vs Nominated — with counts | `awards` |
| **Analytics** | "Top sentiment: X" | Top 3 sentiments as percentage bars | `analytics` |
| **Concerts** | "N shows · N countries" | Top 3 tours with show counts | `concerts` |
| **Insights** | rotating fact text | Cycles through `generateInsights()` every 4 s, shows fact + highlighted value | `analytics` |

All mini-previews are CSS/div-based — no recharts overhead in the overview cards.

---

## Implementation

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx` — restructure with hero + stats + section cards
- Create: `src/components/features/sections/HomeSection/SectionCard.tsx` — reusable card shell
- Keep: `StatCard.tsx` — unchanged
- Remove from use: `EraOverview.tsx`, `TitleTrackSpotlight.tsx` — no longer rendered in HomeSection

**Data used:** All props already passed in (`songs`, `albums`, `members`, `awards`, `concerts`, `memberEvents`, `onNavigate`). `analyticsService` exports used: `computeEraEvolution`, `computeMemberContributions`, `computeSentimentDistribution`, `generateInsights`.
