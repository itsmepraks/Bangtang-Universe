# Responsive Improvements + Visual Polish + Code Cleanup

**Date:** 2026-03-04
**Scope:** Option B — Full responsive pass, visual polish, dead code removal
**Target:** True responsive — equal quality on phone (375px), tablet, laptop, wide monitor

---

## Problem Summary

The app is feature-complete but has responsiveness and polish gaps:

1. Landing page: 7 spotlight columns at 32px each on 375px — names unreadable
2. AnalyticsSection tab row: no overflow handling, long labels clip on mobile
3. MemberComparison table: 3-column layout doesn't collapse on mobile
4. Recharts charts: flex blowout in some containers
5. Inconsistent spacing across section panels
6. Dead code: two unused visual components
7. Outdated dep: `prop-types` (TypeScript makes it redundant)

---

## Design

### Section 1 — Responsiveness Fixes

| Component | Problem | Fix |
|---|---|---|
| `LandingRitual` | 7 spotlight columns cramped at 375px | Tighter clamp values for column width + gap; name font scales to `clamp(9px, 2vw, 13px)` |
| `AnalyticsSection` tab row | `flex` row with no overflow — long labels clip | Add `overflow-x-auto scrollbar-hide flex-nowrap` + right-fade gradient hint |
| `MemberComparison` table | 3-column fixed layout | Stack stat rows vertically on mobile (`flex-col` < md, `grid-cols-3` >= md) |
| Recharts containers | Flex blowout from missing `min-w-0` | Wrap each `ResponsiveContainer` parent in `min-w-0` |

ToursSection, AwardsSection, MediaSection already have `overflow-x-auto scrollbar-hide` — no changes needed.

### Section 2 — Visual Polish

- Spacing: standardize all section panel padding to `p-4 sm:p-6`
- Landing title: tighter tracking on mobile
- CTA area: ensure 44px minimum touch targets (WCAG AA)
- Charts: add explicit `minHeight` on chart wrappers to prevent collapse
- Scrollbar: audit and apply `scrollbar-hide` where missing

### Section 3 — Code Cleanup

- Delete `src/components/visual/DancingFigure.tsx` (unused)
- Delete `src/components/visual/MemberSilhouette.tsx` (unused)
- Remove `prop-types` from `package.json`
- Update `src/components/visual/index.ts` to remove deleted exports

---

## Constraints

- Do NOT restructure the mobile nav (keep sidebar drawer — no bottom nav bar)
- Do NOT break the landing concert stage visual design
- Do NOT add new routes or features — this is a polish pass only
