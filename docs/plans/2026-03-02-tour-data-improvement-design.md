# Tour Data Improvement — Design

## Problem

Current tour data is severely incomplete:

| Metric       | Current | Target  |
|-------------|---------|---------|
| Concerts    | 84      | ~250+   |
| Tours       | 33      | 40+     |
| Countries   | 12      | 25+     |
| Setlists    | 0/84    | most    |

Missing entirely: Wings Tour (2017), Love Yourself World Tour (2018-19), Speak Yourself (2019), Map of the Soul Tour. The Wikipedia scraper only reads the summary page, missing all major world tour sub-pages.

## Solution: Two Parts

### Part 1 — Richer Data via setlist.fm + Wikipedia Merge

**setlist.fm API** as primary source for concert completeness + setlists:
- BTS MBID: `0d79fe8e-ba27-4859-bb8c-2f255f346853`
- Endpoint: `GET /1.0/artist/{mbid}/setlists?p={page}`
- Returns: date, venue, city, country, tour name, full song setlist
- Auth: `x-api-key` header (free, non-commercial)
- Rate limit: 16 req/sec, 50k req/day
- Date format: `DD-MM-YYYY` → normalize to `YYYY-MM-DD`

**Wikipedia** retained for attendance numbers (setlist.fm doesn't have those).

**Merge strategy:**
- setlist.fm is source of truth for concert existence, dates, venues, setlists
- Wikipedia provides attendance where available, matched by (date, venue) tuple
- Dedup: same date + same city = same concert
- New scraper: `scripts/scrape-14-setlistfm.ts`
- Cache: `scripts/cache/concerts-setlistfm.json`
- Merged output overwrites `scripts/cache/concerts.json`
- Upsert to Supabase `concerts` table with `--upsert` flag

**New city coordinates:** setlist.fm returns lat/lng with venue data, so `cityCoords.ts` can be auto-extended for any new cities.

### Part 2 — Timeline Map UI

Enhance TourMap with a scrubable timeline slider.

```
┌─────────────────────────────────────────────────┐
│  [Year pills: 2013 2014 ... 2022 ALL]           │
│                                                  │
│         ╭──── World Map ────╮                    │
│         │  ● Seoul          │                    │
│         │      ● Tokyo      │   Tooltip:         │
│         │           ● LA    │   "Seoul, S.Korea  │
│         │  ● London         │    12 shows"       │
│         ╰───────────────────╯                    │
│                                                  │
│  Stats: 45 cities │ 120 shows │ 18 countries     │
│                                                  │
│  ──●━━━━━━━━━━━━━━━━━━━━━━━━━━━○──────────────── │
│  2013          ▲ drag handle          2022       │
│           "Love Yourself Tour"                   │
└─────────────────────────────────────────────────┘
```

**Slider behavior:**
- Single draggable handle from first concert (2013-06) to last (2022-10)
- Shows all concerts from start up to the slider position (cumulative)
- Dots appear/disappear with CSS opacity transition as slider moves
- Below handle: current tour name at that point in time
- Year pills act as quick-jump shortcuts for the slider
- Stats overlay updates live

**Implementation:** Enhance existing `TourMap.tsx`, not a rewrite.

### Part 3 — Update TourList & TourStats

With richer data, these views improve too:

**TourList:**
- Setlist column now populated with expandable song grids
- More concerts fill in previously sparse tour groups
- World tours appear with full date/city breakdowns

**TourStats:**
- Bar charts reflect full ~250 concerts instead of 84
- Country distribution shows 25+ countries
- Attendance totals more accurate (where Wikipedia provides them)

## Architecture

```
setlist.fm API                    Wikipedia
     │                                │
     ▼                                ▼
scrape-14-setlistfm.ts    scrape-13-concerts.ts
     │                                │
     ▼                                ▼
concerts-setlistfm.json     concerts-wiki.json
     │                                │
     └──────── merge step ────────────┘
                    │
                    ▼
          concerts.json (merged)
                    │
                    ▼
          Supabase `concerts` table
                    │
                    ▼
            useConcerts() hook
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
  TourMap      TourList       TourStats
 (timeline)   (setlists)     (charts)
```

## Environment

- New env var: `SETLISTFM_API_KEY` (server-side only, for scraper scripts)
- Existing: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Out of Scope

- Auto-play / animated timeline playback (manual scrub only)
- Individual concert detail pages
- Fan-submitted media or photos
- Solo member concert data
