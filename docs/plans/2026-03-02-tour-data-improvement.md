# Tour Data Improvement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fill missing concert data (~84 → ~250+) using setlist.fm API merged with Wikipedia data, and add a scrubable timeline slider to the TourMap.

**Architecture:** New scraper (`scrape-16-setlistfm.ts`) fetches all BTS setlists from setlist.fm API, merges with existing Wikipedia data for attendance numbers, and upserts to Supabase. The TourMap component gets an interactive timeline slider that filters concerts by date. TourList and TourStats benefit automatically from richer data.

**Tech Stack:** TypeScript, axios, setlist.fm REST API, Supabase, React, react-simple-maps, Tailwind CSS

---

### Task 1: Add SETLISTFM_API_KEY to .env

**Files:**
- Modify: `.env:22` (after GENIUS_ACCESS_TOKEN line)
- Modify: `.env.example` (if it exists, add placeholder)

**Step 1: Add the env var to .env**

Add after the Genius section (line 31) in `.env`:

```env
# Setlist.fm API (for concert/setlist scraping)
# Get API key at: https://api.setlist.fm/docs/1.0/ui/index.html (free, non-commercial)
SETLISTFM_API_KEY=
```

**Step 2: Verify dotenv loads it**

The existing `scrape-utils.ts` already calls `dotenv.config()` at line 11, so no changes needed there.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add SETLISTFM_API_KEY env var placeholder"
```

Note: Do NOT commit `.env` itself — only `.env.example`.

---

### Task 2: Create the setlist.fm scraper

**Files:**
- Create: `scripts/scrape-16-setlistfm.ts`

**Step 1: Write the scraper**

```typescript
/**
 * Script 16: Scrape BTS concert/setlist data from setlist.fm API
 *
 * Fetches all BTS setlists via the setlist.fm API, which provides:
 * - Complete concert dates and venues
 * - City/country with coordinates
 * - Full song setlists per show
 * - Tour names
 *
 * Usage:
 *   npx tsx scripts/scrape-16-setlistfm.ts           # cache only (dry run)
 *   npx tsx scripts/scrape-16-setlistfm.ts --upsert   # cache + write to DB
 *   npx tsx scripts/scrape-16-setlistfm.ts --force     # re-fetch even if cached
 */

import axios from 'axios';
import {
  createSupabaseAdmin,
  delay,
  saveCache,
  loadCache,
  logStart,
  logProgress,
  logSuccess,
  logError,
  logWarning,
  logDone,
} from './scrape-utils.js';

const BTS_MBID = '0d79fe8e-ba27-4859-bb8c-2f255f346853';
const BASE_URL = 'https://api.setlist.fm/rest/1.0';
const USER_AGENT = 'BangtanUniverse/1.0 (https://github.com/itsmepraks/BTS-universe)';

interface SetlistFmVenue {
  id: string;
  name: string;
  city: {
    id: number;
    name: string;
    state?: string;
    stateCode?: string;
    coords: { lat: number; long: number };
    country: { code: string; name: string };
  };
  url: string;
}

interface SetlistFmSong {
  name: string;
  info?: string;
  cover?: { mbid: string; name: string };
  with?: { mbid: string; name: string };
}

interface SetlistFmSet {
  name?: string;
  encore?: number;
  song: SetlistFmSong[];
}

interface SetlistFmSetlist {
  id: string;
  versionId: string;
  eventDate: string; // DD-MM-YYYY
  lastUpdated: string;
  artist: { mbid: string; name: string };
  venue: SetlistFmVenue;
  tour?: { name: string };
  sets: { set: SetlistFmSet[] };
  info?: string;
  url: string;
}

interface SetlistFmResponse {
  type: string;
  itemsPerPage: number;
  page: number;
  total: number;
  setlist: SetlistFmSetlist[];
}

interface ScrapedConcert {
  tour_name: string;
  venue: string;
  city: string;
  country: string;
  date: string; // YYYY-MM-DD
  attendance: number | null;
  setlist: string[] | null;
  notes: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * Convert setlist.fm date DD-MM-YYYY to YYYY-MM-DD
 */
function normalizeDate(sfmDate: string): string {
  const [dd, mm, yyyy] = sfmDate.split('-');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Extract song names from setlist.fm sets structure
 */
function extractSongs(sets: { set: SetlistFmSet[] }): string[] {
  const songs: string[] = [];
  if (!sets || !sets.set) return songs;
  for (const s of sets.set) {
    if (!s.song) continue;
    for (const song of s.song) {
      if (song.name) songs.push(song.name);
    }
  }
  return songs;
}

/**
 * Fetch all BTS setlists from setlist.fm API with pagination
 */
async function fetchAllSetlists(): Promise<ScrapedConcert[]> {
  const apiKey = process.env.SETLISTFM_API_KEY;
  if (!apiKey) {
    logError('Missing SETLISTFM_API_KEY in .env');
    logError('Register at https://api.setlist.fm/ to get a free API key');
    process.exit(1);
  }

  logStart('Fetching BTS setlists from setlist.fm API');

  const concerts: ScrapedConcert[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    logProgress(page, totalPages, `Fetching page ${page}...`);

    const { data } = await axios.get<SetlistFmResponse>(
      `${BASE_URL}/artist/${BTS_MBID}/setlists`,
      {
        params: { p: page },
        headers: {
          Accept: 'application/json',
          'x-api-key': apiKey,
          'User-Agent': USER_AGENT,
        },
        timeout: 15000,
      }
    );

    // Calculate total pages on first request
    if (page === 1) {
      totalPages = Math.ceil(data.total / data.itemsPerPage);
      logSuccess(`Found ${data.total} setlists across ${totalPages} pages`);
    }

    for (const sl of data.setlist) {
      const songs = extractSongs(sl.sets);
      const venue = sl.venue;

      concerts.push({
        tour_name: sl.tour?.name || 'Unknown Tour',
        venue: venue.name,
        city: venue.city.name,
        country: venue.city.country.name,
        date: normalizeDate(sl.eventDate),
        attendance: null, // setlist.fm doesn't provide attendance
        setlist: songs.length > 0 ? songs : null,
        notes: sl.info || null,
        lat: venue.city.coords.lat,
        lng: venue.city.coords.long,
      });
    }

    page++;

    // Respect rate limits: ~16 req/sec, be conservative with 200ms delay
    if (page <= totalPages) {
      await delay(200);
    }
  }

  logSuccess(`Fetched ${concerts.length} concerts from setlist.fm`);
  return concerts;
}

/**
 * Merge setlist.fm data with Wikipedia data.
 * - setlist.fm is source of truth for existence, dates, venues, setlists
 * - Wikipedia provides attendance numbers where available
 * - Match by (date, city) tuple
 */
function mergeWithWikipedia(
  sfmConcerts: ScrapedConcert[],
  wikiConcerts: Array<{
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    attendance: number | null;
    notes: string | null;
  }>
): ScrapedConcert[] {
  // Build a lookup from Wikipedia data: "YYYY-MM-DD|city" → concert
  const wikiLookup = new Map<string, typeof wikiConcerts[0]>();
  for (const wc of wikiConcerts) {
    const key = `${wc.date}|${wc.city.toLowerCase()}`;
    wikiLookup.set(key, wc);
  }

  let attendanceFilled = 0;

  const merged = sfmConcerts.map((concert) => {
    const key = `${concert.date}|${concert.city.toLowerCase()}`;
    const wiki = wikiLookup.get(key);

    if (wiki && wiki.attendance) {
      concert.attendance = wiki.attendance;
      attendanceFilled++;
    }

    return concert;
  });

  // Also add any Wikipedia concerts not found in setlist.fm
  // (some small events may only be on Wikipedia)
  const sfmDates = new Set(sfmConcerts.map((c) => `${c.date}|${c.city.toLowerCase()}`));
  let wikiOnly = 0;

  for (const wc of wikiConcerts) {
    const key = `${wc.date}|${wc.city.toLowerCase()}`;
    if (!sfmDates.has(key)) {
      merged.push({
        tour_name: wc.tour_name,
        venue: wc.venue,
        city: wc.city,
        country: wc.country,
        date: wc.date,
        attendance: wc.attendance,
        setlist: null,
        notes: wc.notes,
        lat: null,
        lng: null,
      });
      wikiOnly++;
    }
  }

  logSuccess(`Merged: ${attendanceFilled} attendance fills, ${wikiOnly} wiki-only concerts added`);
  logSuccess(`Total after merge: ${merged.length} concerts`);

  return merged;
}

/**
 * Upsert merged concerts into Supabase
 */
async function upsertConcerts(concerts: ScrapedConcert[]): Promise<void> {
  const supabase = createSupabaseAdmin();

  logStart('Upserting concerts to Supabase');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < concerts.length; i++) {
    const concert = concerts[i];
    logProgress(i + 1, concerts.length, `${concert.tour_name} - ${concert.city} (${concert.date})`);

    // Check for existing entry by date + venue
    const { data: existing } = await supabase
      .from('concerts')
      .select('id, setlist, attendance')
      .eq('date', concert.date)
      .eq('venue', concert.venue)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update if we have new data (setlist or attendance)
      const row = existing[0];
      const needsUpdate =
        (concert.setlist && (!row.setlist || row.setlist.length === 0)) ||
        (concert.attendance && !row.attendance);

      if (needsUpdate) {
        const updates: Record<string, unknown> = {};
        if (concert.setlist && (!row.setlist || row.setlist.length === 0)) {
          updates.setlist = concert.setlist;
        }
        if (concert.attendance && !row.attendance) {
          updates.attendance = concert.attendance;
        }

        const { error } = await supabase
          .from('concerts')
          .update(updates)
          .eq('id', row.id);

        if (error) {
          logWarning(`Failed to update ${concert.city} (${concert.date}): ${error.message}`);
        } else {
          updated++;
        }
      } else {
        skipped++;
      }
      continue;
    }

    // Insert new concert
    const { error } = await supabase.from('concerts').insert({
      tour_name: concert.tour_name,
      venue: concert.venue,
      city: concert.city,
      country: concert.country,
      date: concert.date,
      attendance: concert.attendance,
      setlist: concert.setlist,
      notes: concert.notes,
    });

    if (error) {
      logWarning(`Failed to insert ${concert.city} (${concert.date}): ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`\n   Summary: ${inserted} inserted, ${updated} updated, ${skipped} unchanged`);
  logDone('Concerts upserted!');
}

async function main() {
  const forceRefresh = process.argv.includes('--force');

  // Step 1: Fetch from setlist.fm (or use cache)
  let sfmConcerts: ScrapedConcert[];
  const cached = loadCache<ScrapedConcert[]>('concerts-setlistfm');

  if (cached && !forceRefresh) {
    console.log(`\n   Using cached setlist.fm data (${cached.length} entries).`);
    sfmConcerts = cached;
  } else {
    sfmConcerts = await fetchAllSetlists();
    saveCache('concerts-setlistfm', sfmConcerts);
  }

  // Step 2: Load Wikipedia data
  const wikiConcerts = loadCache<Array<{
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    attendance: number | null;
    notes: string | null;
  }>>('concerts');

  // Step 3: Merge
  let merged: ScrapedConcert[];
  if (wikiConcerts) {
    merged = mergeWithWikipedia(sfmConcerts, wikiConcerts);
  } else {
    logWarning('No Wikipedia concert cache found — using setlist.fm data only');
    logWarning('Run "npm run scrape:concerts" first for attendance data');
    merged = sfmConcerts;
  }

  // Step 4: Save merged result
  saveCache('concerts-merged', merged);

  // Step 5: Sort by date
  merged.sort((a, b) => a.date.localeCompare(b.date));

  // Print summary
  const withSetlist = merged.filter((c) => c.setlist && c.setlist.length > 0).length;
  const withAttendance = merged.filter((c) => c.attendance).length;
  const countries = new Set(merged.map((c) => c.country)).size;
  const tours = new Set(merged.map((c) => c.tour_name)).size;

  console.log('\n   📊 Final stats:');
  console.log(`     Total concerts: ${merged.length}`);
  console.log(`     With setlists: ${withSetlist}`);
  console.log(`     With attendance: ${withAttendance}`);
  console.log(`     Countries: ${countries}`);
  console.log(`     Tours: ${tours}`);

  // Step 6: Upsert to DB
  if (process.argv.includes('--upsert')) {
    await upsertConcerts(merged);
  } else {
    console.log('\n   Dry run complete. Use --upsert to write to database.');
  }

  logDone('Setlist.fm scraping complete!');
}

main().catch(console.error);
```

**Step 2: Run dry (no --upsert) to verify it works**

```bash
npx tsx scripts/scrape-16-setlistfm.ts
```

Expected: Fetches pages from setlist.fm API, caches to `scripts/cache/concerts-setlistfm.json`, merges with existing Wikipedia cache, prints stats summary. Should show ~200+ concerts.

**Step 3: Register the npm script in package.json**

Add to the `scripts` section in `package.json` after line 102:

```json
"scrape:setlistfm": "npx tsx scripts/scrape-16-setlistfm.ts",
```

Also add `npm run scrape:setlistfm` to the `scrape:all` chain.

**Step 4: Commit**

```bash
git add scripts/scrape-16-setlistfm.ts package.json
git commit -m "feat: add setlist.fm scraper for complete concert data"
```

---

### Task 3: Auto-extend cityCoords.ts from setlist.fm coordinates

**Files:**
- Modify: `src/data/cityCoords.ts`
- Create: `scripts/generate-city-coords.ts`

setlist.fm returns lat/lng with every venue. Instead of manually maintaining `cityCoords.ts`, generate missing entries from the scraped data.

**Step 1: Write the coord generator script**

```typescript
/**
 * Generate missing city coordinates from setlist.fm scraped data.
 * Reads concerts-setlistfm.json and outputs cities not in cityCoords.ts.
 *
 * Usage: npx tsx scripts/generate-city-coords.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScrapedConcert {
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

const CACHE_PATH = path.resolve(process.cwd(), 'scripts/cache/concerts-setlistfm.json');
const COORDS_PATH = path.resolve(process.cwd(), 'src/data/cityCoords.ts');

function main() {
  if (!fs.existsSync(CACHE_PATH)) {
    console.error('No setlist.fm cache found. Run scrape:setlistfm first.');
    process.exit(1);
  }

  const concerts: ScrapedConcert[] = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  const coordsSource = fs.readFileSync(COORDS_PATH, 'utf-8');

  // Find cities with coords from setlist.fm that aren't in cityCoords.ts
  const missing = new Map<string, [number, number]>();

  for (const c of concerts) {
    if (!c.lat || !c.lng) continue;
    const key = `${c.city}, ${c.country}`;
    if (coordsSource.includes(`"${key}"`)) continue;
    if (missing.has(key)) continue;
    missing.set(key, [c.lng, c.lat]);
  }

  if (missing.size === 0) {
    console.log('All cities are already in cityCoords.ts!');
    return;
  }

  console.log(`Found ${missing.size} missing cities:\n`);

  // Output as TypeScript entries to paste into CITY_COORDS
  const entries: string[] = [];
  for (const [key, [lng, lat]] of missing) {
    entries.push(`  "${key}": [${lng.toFixed(3)}, ${lat.toFixed(3)}],`);
    console.log(`  "${key}": [${lng.toFixed(3)}, ${lat.toFixed(3)}],`);
  }

  // Auto-patch cityCoords.ts: insert before the closing `};` of CITY_COORDS
  const marker = '};';
  const firstClosingBrace = coordsSource.indexOf(marker);
  if (firstClosingBrace === -1) {
    console.error('Could not find closing brace of CITY_COORDS');
    return;
  }

  const newSource =
    coordsSource.slice(0, firstClosingBrace) +
    '\n  // Auto-generated from setlist.fm data\n' +
    entries.join('\n') +
    '\n' +
    coordsSource.slice(firstClosingBrace);

  fs.writeFileSync(COORDS_PATH, newSource, 'utf-8');
  console.log(`\nPatched cityCoords.ts with ${missing.size} new entries.`);
}

main();
```

**Step 2: Run it after the scraper has cached data**

```bash
npx tsx scripts/generate-city-coords.ts
```

Expected: Prints new city entries and patches `cityCoords.ts`.

**Step 3: Verify the patched file looks correct**

Read `src/data/cityCoords.ts` and confirm the new entries are properly formatted inside CITY_COORDS.

**Step 4: Commit**

```bash
git add scripts/generate-city-coords.ts src/data/cityCoords.ts
git commit -m "feat: auto-generate city coords from setlist.fm venue data"
```

---

### Task 4: Add timeline slider to TourMap

**Files:**
- Modify: `src/components/features/sections/ToursSection/TourMap.tsx`

This is the core UI change. Add a scrubable date slider at the bottom of the map that filters concerts cumulatively (start → slider position).

**Step 1: Add slider state and date range computation**

At the top of the `TourMap` component (after line 33 in TourMap.tsx), add:

```typescript
// Compute date range for timeline slider
const dateRange = useMemo(() => {
  if (concerts.length === 0) return { min: 0, max: 0, dates: [] as string[] };
  const sorted = [...concerts].map(c => c.date).sort();
  const min = new Date(sorted[0]).getTime();
  const max = new Date(sorted[sorted.length - 1]).getTime();
  return { min, max, dates: sorted };
}, [concerts]);

const [sliderValue, setSliderValue] = useState<number>(dateRange.max);
```

**Step 2: Replace the year filter logic with timeline filtering**

Replace the existing `filtered` useMemo (lines 41-44) with:

```typescript
const filtered = useMemo(() => {
  if (selectedYear !== null) {
    return concerts.filter((c) => new Date(c.date).getFullYear() === selectedYear);
  }
  // Timeline slider: show all concerts up to the slider date
  return concerts.filter((c) => new Date(c.date).getTime() <= sliderValue);
}, [concerts, selectedYear, sliderValue]);

// Current tour at slider position
const currentTour = useMemo(() => {
  const atDate = concerts
    .filter((c) => new Date(c.date).getTime() <= sliderValue)
    .sort((a, b) => b.date.localeCompare(a.date));
  return atDate[0]?.tour_name || '';
}, [concerts, sliderValue]);

// Format slider date for display
const sliderDateLabel = useMemo(() => {
  const d = new Date(sliderValue);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}, [sliderValue]);
```

**Step 3: Make year pills jump the slider**

Update the year pill `onClick` handler (around line 168) to also set the slider:

```typescript
onClick={() => {
  if (year === selectedYear) {
    setSelectedYear(null);
    setSliderValue(dateRange.max);
  } else {
    setSelectedYear(year);
    // Jump slider to end of that year
    setSliderValue(new Date(`${year}-12-31`).getTime());
  }
}}
```

**Step 4: Add the timeline slider UI**

Insert before the closing `</div>` of the map container (before line 242), add the timeline slider:

```tsx
{/* ── Timeline Slider — bottom center ── */}
{dateRange.min > 0 && (
  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 w-[min(90%,600px)]">
    <div className="bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-xl px-5 py-3">
      <input
        type="range"
        min={dateRange.min}
        max={dateRange.max}
        value={sliderValue}
        onChange={(e) => {
          setSliderValue(Number(e.target.value));
          setSelectedYear(null); // Clear year filter when scrubbing
        }}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400
          [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.5)]
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-white/30">
          {new Date(dateRange.min).getFullYear()}
        </span>
        <div className="text-center">
          <span className="text-xs font-medium text-purple-300">{sliderDateLabel}</span>
          {currentTour && (
            <div className="text-[10px] text-white/40 truncate max-w-[250px]">{currentTour}</div>
          )}
        </div>
        <span className="text-[10px] text-white/30">
          {new Date(dateRange.max).getFullYear()}
        </span>
      </div>
    </div>
  </div>
)}
```

**Step 5: Move the stats overlay up to avoid overlap**

Change the stats overlay position (line 181) from `bottom-4` to `bottom-28`:

```tsx
<div className="absolute bottom-28 left-4 z-10 flex items-center gap-3">
```

**Step 6: Add CSS transitions to map markers**

On the marker `<circle>` elements (around line 141), add transition for smooth appear/disappear:

```tsx
style={{ cursor: 'pointer', transition: 'opacity 0.3s ease, r 0.3s ease' }}
```

**Step 7: Verify the map works with the slider**

```bash
npm run dev
```

Open the Tours section → World Map tab. The timeline slider should appear at the bottom. Dragging it should show/hide dots on the map.

**Step 8: Commit**

```bash
git add src/components/features/sections/ToursSection/TourMap.tsx
git commit -m "feat: add timeline slider to TourMap for date-based exploration"
```

---

### Task 5: Run setlist.fm scraper and upsert to database

**Files:**
- No new files — running existing scripts

**Prerequisite:** User must have a setlist.fm API key in `.env`.

**Step 1: Run Wikipedia scraper first (to get attendance data)**

```bash
npm run scrape:concerts -- --force
```

Expected: Re-fetches from Wikipedia, caches to `scripts/cache/concerts.json`.

**Step 2: Run the setlist.fm scraper (dry run)**

```bash
npm run scrape:setlistfm
```

Expected: Fetches from API, merges with Wikipedia data, prints stats showing ~200+ concerts.

**Step 3: Generate new city coordinates**

```bash
npx tsx scripts/generate-city-coords.ts
```

Expected: Patches `cityCoords.ts` with any new cities from setlist.fm data.

**Step 4: Upsert to database**

```bash
npm run scrape:setlistfm -- --upsert
```

Expected: Inserts new concerts, updates existing ones with setlists. Summary shows insertions and updates.

**Step 5: Verify in browser**

```bash
npm run dev
```

Open Tours section. Check:
- World Map shows many more dots across 25+ countries
- Timeline slider scrubs through 2013-2022
- Tour List shows world tours (Wings, Love Yourself, Speak Yourself, etc.)
- TourStats charts reflect ~250 concerts
- Setlist buttons appear in TourList for concerts that have song data

**Step 6: Commit the updated coords**

```bash
git add src/data/cityCoords.ts
git commit -m "feat: add city coordinates for new concert locations"
```

---

### Task 6: Final cleanup and verification

**Files:**
- Verify: all tour components render without errors

**Step 1: Run the dev server and verify all three tabs**

```bash
npm run dev
```

Check:
1. **World Map tab:** Dots visible on all continents, slider works, year pills jump slider, tooltip shows correct data
2. **Tour List tab:** Major world tours appear (Wings, Love Yourself, etc.), setlist buttons work for concerts with songs
3. **Statistics tab:** Charts show fuller data, country distribution includes 25+ countries

**Step 2: Check for console errors**

Open browser dev tools → Console tab. There should be no React errors or warnings related to the tour components.

**Step 3: Build check**

```bash
npm run build
```

Expected: Clean build with no TypeScript errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete tour data improvement — setlist.fm integration + timeline map"
```
