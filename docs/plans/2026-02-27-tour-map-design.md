# Tour Map Design

**Date:** 2026-02-27
**Feature:** World map of BTS concert tours with year filter
**Status:** Approved

---

## Goal

Add a "World Map" tab to the existing `ToursSection` that plots every concert location on an interactive SVG world map, with year-based filtering.

## Approach

`react-simple-maps` — pure SVG, no tile server, offline-capable, dark-UI friendly. ~50 KB bundle addition.

## Architecture

```
ToursSection (index.tsx)
  ├── Tab: Tour List      (TourList.tsx — unchanged)
  ├── Tab: Statistics     (TourStats.tsx — unchanged)
  └── Tab: World Map      (TourMap.tsx — new)

src/data/cityCoords.ts   — static "City, Country" → [lng, lat] lookup (~50 entries)
```

## New Files

### `src/data/cityCoords.ts`
Static lookup table:
```ts
export const CITY_COORDS: Record<string, [number, number]> = {
  "Seoul, South Korea": [126.978, 37.566],
  "Los Angeles, United States": [-118.243, 34.052],
  // ... ~50 entries covering all known BTS concert cities
};
```
Key format: `"${concert.city}, ${concert.country}"`.
Unknown cities fall back to country centroid; unknown countries are silently skipped on the map (still shown in Tour List).

### `src/components/features/sections/ToursSection/TourMap.tsx`
- Receives `concerts: Concert[]`
- Derives available years from concert dates
- State: `selectedYear: number | null` (null = All)
- State: `hoveredCity: CityData | null` (for tooltip)
- Filters concerts by selected year, groups by city key, computes `showCount` and `tourNames[]` per city
- Renders:
  - Year filter pills row: `All · 2014 · 2015 · ... · 2023`
  - `<ComposableMap>` with `<Geographies>` + `<Marker>` per city
  - Floating tooltip div (absolute positioned) on hover

## Modified Files

### `src/components/features/sections/ToursSection/index.tsx`
- Add `'map'` to `TABS` constant with a `Globe` icon and label "World Map"
- Add `case 'map': return <TourMap concerts={concerts} />;` to `renderPanel()`

## Visual Design

| Element | Style |
|---|---|
| Ocean / background | `#0c0c12` (matches card bg) |
| Country fill | `rgba(255,255,255,0.03)` |
| Country stroke | `rgba(255,255,255,0.08)` |
| Marker fill | `#A855F7` (purple-500) |
| Marker stroke | `#7C3AED` (purple-700) |
| Marker size | `r = 4 + sqrt(showCount) * 2` |
| Hovered marker | Scale up + brighter fill `#C084FC` |
| Year pill active | `bg-purple-500/10 border-purple-500/30 text-white` |
| Year pill inactive | `text-white/50 hover:text-white/70` |

## Tooltip Content (on marker hover)

```
Seoul
South Korea
─────────────
8 shows
Tours: BTS World Tour 'Love Yourself', Map of the Soul ON:E
```

## Dependencies

```
npm install react-simple-maps
```

No types package needed — `react-simple-maps` ships its own `.d.ts`.

## Country Centroid Fallback

A secondary lookup `COUNTRY_CENTROIDS: Record<string, [number, number]>` covers ~30 countries from BTS tour history, used when city coords are not found in `CITY_COORDS`.

## Out of Scope

- Multi-year selection
- Animated tour routes (lines between cities)
- Click-to-drill-down on a city
- Zoom / pan interaction
