# BTS Wiki Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the BTS Universe dashboard into a comprehensive BTS encyclopedia with 5 new database tables, 8 scraper scripts, an upgraded AI assistant, and 2 new UI sections (Awards, Tours).

**Architecture:** Supabase database expansion with new tables (awards, chart_entries, concerts, collaborations, member_events), CLI scraper scripts following existing pipeline patterns (MusicBrainz + Wikipedia + ColorCodedLyrics), local-first AI assistant with knowledge index and Claude API swap interface, React lazy-loaded sections with existing UI component library.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Supabase, Recharts, Fuse.js, MusicBrainz API, Cheerio (Wikipedia scraping), existing scrape-utils.ts pipeline.

---

## Task 1: Database Schema Migration

**Files:**
- Modify: `database/schema.sql`
- Create: `database/migration-wiki-expansion.sql`

**Step 1: Create the migration SQL file**

Create `database/migration-wiki-expansion.sql` with 5 new tables and column additions:

```sql
-- BTS Wiki Expansion Migration
-- Run in Supabase SQL Editor

-- ==================== NEW TABLES ====================

CREATE TABLE IF NOT EXISTS awards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ceremony TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT,
    result TEXT CHECK (result IN ('won', 'nominated')) NOT NULL,
    scope TEXT CHECK (scope IN ('group', 'solo', 'unit')) DEFAULT 'group',
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE SET NULL,
    work_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chart_entries (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL,
    album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
    chart_name TEXT NOT NULL,
    peak_position INTEGER NOT NULL,
    weeks_on_chart INTEGER,
    entry_date DATE,
    certification TEXT,
    region TEXT DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concerts (
    id SERIAL PRIMARY KEY,
    tour_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    date DATE NOT NULL,
    attendance INTEGER,
    setlist JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaborations (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('feature', 'production', 'remix', 'ost')) NOT NULL,
    release_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_events (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== NEW COLUMNS ====================

-- songs: lyrics + solo/collab flags
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_ko TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_en TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_romanized TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS music_video_url TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS is_solo BOOLEAN DEFAULT FALSE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS is_collab BOOLEAN DEFAULT FALSE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS featured_members TEXT[];

-- members: extended bio
ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_name_ko TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enlistment_start DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enlistment_end DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS solo_debut_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bio_long TEXT;

-- albums: cover art + sales
ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_art_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS total_sales BIGINT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS label TEXT;

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_awards_ceremony ON awards(ceremony);
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
CREATE INDEX IF NOT EXISTS idx_awards_member ON awards(member_id);
CREATE INDEX IF NOT EXISTS idx_chart_entries_chart ON chart_entries(chart_name);
CREATE INDEX IF NOT EXISTS idx_chart_entries_song ON chart_entries(song_id);
CREATE INDEX IF NOT EXISTS idx_concerts_tour ON concerts(tour_name);
CREATE INDEX IF NOT EXISTS idx_concerts_date ON concerts(date);
CREATE INDEX IF NOT EXISTS idx_collaborations_member ON collaborations(member_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_artist ON collaborations(artist);
CREATE INDEX IF NOT EXISTS idx_member_events_member ON member_events(member_id);
CREATE INDEX IF NOT EXISTS idx_member_events_type ON member_events(event_type);

-- ==================== RLS ====================

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on awards" ON awards FOR SELECT USING (true);
CREATE POLICY "Allow public read on chart_entries" ON chart_entries FOR SELECT USING (true);
CREATE POLICY "Allow public read on concerts" ON concerts FOR SELECT USING (true);
CREATE POLICY "Allow public read on collaborations" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Allow public read on member_events" ON member_events FOR SELECT USING (true);
```

**Step 2: Update the main schema.sql**

Append the new tables to `database/schema.sql` so the full schema is in one place.

**Step 3: Run the migration in Supabase**

Run: `Copy the SQL from database/migration-wiki-expansion.sql into Supabase SQL Editor and execute`
Expected: All tables created, columns added, indexes built, RLS enabled.

**Step 4: Commit**

```bash
git add database/migration-wiki-expansion.sql database/schema.sql
git commit -m "feat: add wiki expansion database migration (5 new tables, new columns)"
```

---

## Task 2: TypeScript Types for New Tables

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add new interfaces to database.ts**

After the existing `Lyrics` interface (~line 85), add:

```typescript
export interface Award {
    id: number;
    name: string;
    ceremony: string;
    year: number;
    category: string | null;
    result: 'won' | 'nominated';
    scope: 'group' | 'solo' | 'unit';
    member_id: string | null;
    work_title: string | null;
    created_at: string;
}

export interface ChartEntry {
    id: number;
    song_id: number | null;
    album_id: number | null;
    chart_name: string;
    peak_position: number;
    weeks_on_chart: number | null;
    entry_date: string | null;
    certification: string | null;
    region: string;
    created_at: string;
}

export interface Concert {
    id: number;
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    attendance: number | null;
    setlist: string[] | null;
    notes: string | null;
    created_at: string;
}

export interface Collaboration {
    id: number;
    song_id: number | null;
    title: string;
    artist: string;
    member_id: string | null;
    type: 'feature' | 'production' | 'remix' | 'ost';
    release_date: string | null;
    created_at: string;
}

export interface MemberEvent {
    id: number;
    member_id: string;
    event_type: string;
    title: string;
    date: string;
    description: string | null;
    source_url: string | null;
    created_at: string;
}
```

**Step 2: Add new columns to existing Song/Member/Album interfaces**

Add to `Song` interface:
```typescript
    lyrics_ko: string | null;
    lyrics_en: string | null;
    lyrics_romanized: string | null;
    music_video_url: string | null;
    is_solo: boolean;
    is_collab: boolean;
    featured_members: string[] | null;
```

Add to `Member` interface:
```typescript
    birth_name_ko: string | null;
    education: string | null;
    enlistment_start: string | null;
    enlistment_end: string | null;
    solo_debut_date: string | null;
    instagram_handle: string | null;
    bio_long: string | null;
```

Add to `Album` interface:
```typescript
    cover_art_url: string | null;
    total_sales: number | null;
    label: string | null;
```

**Step 3: Update the Database schema type**

Add new table entries to the `Database['public']['Tables']` type.

**Step 4: Add helper insert/update types**

```typescript
export type AwardInsert = Database['public']['Tables']['awards']['Insert'];
export type ChartEntryInsert = Database['public']['Tables']['chart_entries']['Insert'];
export type ConcertInsert = Database['public']['Tables']['concerts']['Insert'];
export type CollaborationInsert = Database['public']['Tables']['collaborations']['Insert'];
export type MemberEventInsert = Database['public']['Tables']['member_events']['Insert'];
```

**Step 5: Verify build**

Run: `npm run build`
Expected: PASS (no type errors)

**Step 6: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add TypeScript types for wiki expansion tables"
```

---

## Task 3: Data Hooks for New Tables

**Files:**
- Create: `src/hooks/useAwards.ts`
- Create: `src/hooks/useChartEntries.ts`
- Create: `src/hooks/useConcerts.ts`
- Create: `src/hooks/useCollaborations.ts`
- Create: `src/hooks/useMemberEvents.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create useAwards.ts**

Follow the same pattern as `src/hooks/useAlbums.ts`: useState + useEffect + Supabase fetch + empty array fallback (no local data for new tables).

```typescript
import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Award } from '../types/database';

interface UseAwardsResult {
    awards: Award[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useAwards(): UseAwardsResult {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAwards = async () => {
        if (!isSupabaseConfigured()) {
            setAwards([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('awards')
                .select('*')
                .order('year', { ascending: false });
            if (dbError) throw dbError;
            setAwards(data || []);
        } catch (err) {
            setError(err as Error);
            setAwards([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAwards(); }, []);
    return { awards, loading, error, refetch: fetchAwards };
}

export function useAwardsByMember(memberId: string) {
    const { awards, loading, error } = useAwards();
    const filtered = useMemo(
        () => awards.filter(a => a.member_id === memberId),
        [awards, memberId]
    );
    return { awards: filtered, loading, error };
}

export function useAwardsByCeremony(ceremony: string) {
    const { awards, loading, error } = useAwards();
    const filtered = useMemo(
        () => awards.filter(a => a.ceremony === ceremony),
        [awards, ceremony]
    );
    return { awards: filtered, loading, error };
}
```

**Step 2: Create useChartEntries.ts, useConcerts.ts, useCollaborations.ts, useMemberEvents.ts**

Same pattern. Each hook:
- Fetches from its respective Supabase table
- Falls back to empty array when Supabase not configured
- Provides secondary filter hooks (e.g., `useConcertsByTour`, `useChartEntriesByChart`)

Key secondary hooks:
- `useChartEntriesBySong(songId)`, `useChartEntriesByChart(chartName)`
- `useConcertsByTour(tourName)`, `useConcertsByCountry(country)`
- `useCollaborationsByMember(memberId)`, `useCollaborationsByArtist(artist)`
- `useMemberEventsByMember(memberId)`, `useMemberEventsByType(type)`

**Step 3: Update hooks/index.ts**

Add exports for all 5 new hook files.

**Step 4: Verify build**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useAwards.ts src/hooks/useChartEntries.ts src/hooks/useConcerts.ts src/hooks/useCollaborations.ts src/hooks/useMemberEvents.ts src/hooks/index.ts
git commit -m "feat: add data hooks for awards, charts, concerts, collaborations, member events"
```

---

## Task 4: Update Local Data Fallbacks

**Files:**
- Modify: `src/hooks/useSongs.ts` — update `convertLocalSong` to include new fields with null defaults
- Modify: `src/hooks/useMembers.ts` — update `convertLocalMember` to include new fields with null defaults
- Modify: `src/hooks/useAlbums.ts` — update album mapping to include new fields with null defaults

**Step 1: Update convertLocalSong in useSongs.ts**

Add new nullable fields to the returned object:
```typescript
lyrics_ko: null,
lyrics_en: null,
lyrics_romanized: null,
music_video_url: null,
is_solo: false,
is_collab: false,
featured_members: null,
```

**Step 2: Update convertLocalMember in useMembers.ts**

Add new nullable fields:
```typescript
birth_name_ko: null,
education: null,
enlistment_start: null,
enlistment_end: null,
solo_debut_date: null,
instagram_handle: m.instagram || null,
bio_long: null,
```

**Step 3: Update album mapping in useAlbums.ts**

Add:
```typescript
cover_art_url: null,
total_sales: null,
label: null,
```

**Step 4: Verify build**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useSongs.ts src/hooks/useMembers.ts src/hooks/useAlbums.ts
git commit -m "feat: update local fallbacks with new wiki expansion fields"
```

---

## Task 5: Navigation Update (5 → 7 Sections)

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/types.ts` (if DashboardSection duplicated here)
- Modify: `src/App.tsx`

**Step 1: Update DashboardSection type**

In `src/types/index.ts`, change:
```typescript
export type DashboardSection = 'overview' | 'discography' | 'members' | 'analytics' | 'search' | 'awards' | 'tours';
```

Do the same in `src/types.ts` if duplicated there.

**Step 2: Update App.tsx — SECTION_TITLES**

```typescript
const SECTION_TITLES: Record<DashboardSection, string> = {
  overview: 'Overview',
  discography: 'Discography',
  members: 'Members',
  analytics: 'Analytics',
  awards: 'Awards',
  tours: 'Tours',
  search: 'Search',
};
```

**Step 3: Update App.tsx — NAV_ITEMS**

Add imports: `Trophy, MapPin` from lucide-react.

```typescript
const NAV_ITEMS: { id: DashboardSection; icon: React.ElementType; label: string }[] = [
  { id: 'overview', icon: Home, label: 'Overview' },
  { id: 'discography', icon: Disc, label: 'Discography' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'awards', icon: Trophy, label: 'Awards' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'search', icon: Search, label: 'Search' },
];
```

**Step 4: Add placeholder sections in App.tsx rendering**

After the analytics section block, add:
```tsx
{activeSection === 'awards' && (
  <div className="text-center text-white/40 py-20">Awards section coming soon</div>
)}

{activeSection === 'tours' && (
  <div className="text-center text-white/40 py-20">Tours section coming soon</div>
)}
```

**Step 5: Add data hooks to App.tsx**

Import and call:
```typescript
const { awards } = useAwards();
const { chartEntries } = useChartEntries();
const { concerts } = useConcerts();
const { collaborations } = useCollaborations();
const { memberEvents } = useMemberEvents();
```

Update sidebar stats:
```tsx
<div className="text-xs text-white/40">{awards.length} awards</div>
<div className="text-xs text-white/40">{concerts.length} concerts</div>
```

**Step 6: Verify build**

Run: `npm run build`
Expected: PASS

**Step 7: Commit**

```bash
git add src/types/index.ts src/types.ts src/App.tsx
git commit -m "feat: expand navigation to 7 sections (add Awards, Tours)"
```

---

## Task 6: Scraper — Expand Discography

**Files:**
- Create: `scripts/scrape-08-expand-discography.ts`

**Step 1: Write the scraper**

Uses MusicBrainz API to fetch solo releases for each BTS member. Follow the same pattern as `scripts/scrape-01-musicbrainz-discography.ts`:
- Import from `./scrape-utils.js` (createSupabaseAdmin, delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logDone)
- Use `musicbrainz-api` package
- Rate limit 1.2s between requests
- Cache results to `scripts/cache/expanded-discography.json`
- Upsert into songs table with `is_solo: true` or `is_collab: true`

Member MBIDs to look up:
```typescript
const MEMBER_MBIDS: Record<string, string> = {
    'rm': 'RM MBID',      // look up from MusicBrainz
    'jin': 'Jin MBID',
    'suga': 'Agust D MBID',
    'jh': 'j-hope MBID',
    'jm': 'Jimin MBID',
    'v': 'V MBID',
    'jk': 'Jung Kook MBID',
};
```

The script should:
1. Search MusicBrainz for each member as artist
2. Get their solo release groups
3. Get tracks for each release
4. Cache intermediate results
5. With `--upsert` flag: insert into Supabase songs table

**Step 2: Add npm script**

In `package.json`, add:
```json
"scrape:expand-discography": "npx tsx scripts/scrape-08-expand-discography.ts"
```

**Step 3: Run with dry run**

Run: `npx tsx scripts/scrape-08-expand-discography.ts`
Expected: Caches data to `scripts/cache/expanded-discography.json`

**Step 4: Commit**

```bash
git add scripts/scrape-08-expand-discography.ts package.json
git commit -m "feat: add solo/collab discography scraper (MusicBrainz)"
```

---

## Task 7: Scraper — Cover Art

**Files:**
- Create: `scripts/scrape-09-cover-art.ts`

**Step 1: Write the scraper**

Uses the Cover Art Archive API (`https://coverartarchive.org/release-group/{mbid}`).

1. Load `scripts/cache/musicbrainz-discography.json` to get `mb_release_group_id` for each album
2. For each album, fetch cover art URL from Cover Art Archive
3. Cache to `scripts/cache/cover-art.json`
4. With `--upsert`: update albums table `cover_art_url` column

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-09-cover-art.ts package.json
git commit -m "feat: add album cover art scraper (Cover Art Archive)"
```

---

## Task 8: Scraper — Lyrics & Translations

**Files:**
- Create: `scripts/scrape-10-lyrics-translations.ts`

**Step 1: Write the scraper**

Uses ColorCodedLyrics (colorcodedlyrics.com) + existing Genius scraper:

1. For each song in the DB, search ColorCodedLyrics for Korean + English + romanized
2. Use Cheerio to parse HTML (already in dependencies)
3. Cache to `scripts/cache/lyrics-translations.json`
4. Upsert into `lyrics` table (lyrics_korean, lyrics_english, lyrics_romanized)
5. Also update `songs` table columns (lyrics_ko, lyrics_en, lyrics_romanized)

Rate limiting: 2s between requests to be polite.

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-10-lyrics-translations.ts package.json
git commit -m "feat: add lyrics translation scraper (ColorCodedLyrics)"
```

---

## Task 9: Scraper — Awards

**Files:**
- Create: `scripts/scrape-11-awards.ts`

**Step 1: Write the scraper**

Scrapes Wikipedia tables for BTS awards:
- `https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_BTS`
- Parse HTML tables using Cheerio
- Extract: ceremony, year, category, result (won/nominated), work_title
- Cache to `scripts/cache/awards.json`
- Upsert into `awards` table

For solo awards, scrape individual member award pages.

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-11-awards.ts package.json
git commit -m "feat: add awards scraper (Wikipedia)"
```

---

## Task 10: Scraper — Chart Entries

**Files:**
- Create: `scripts/scrape-12-chart-entries.ts`

**Step 1: Write the scraper**

Scrapes Wikipedia for BTS chart records:
- `https://en.wikipedia.org/wiki/BTS_discography` (chart positions section)
- Parse tables for Billboard Hot 100, Billboard 200, Oricon, Gaon/Circle
- Extract: chart_name, peak_position, weeks_on_chart, certification, region
- Match to existing songs/albums by title
- Cache to `scripts/cache/chart-entries.json`
- Upsert into `chart_entries` table

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-12-chart-entries.ts package.json
git commit -m "feat: add chart entries scraper (Wikipedia)"
```

---

## Task 11: Scraper — Concerts

**Files:**
- Create: `scripts/scrape-13-concerts.ts`

**Step 1: Write the scraper**

Scrapes Wikipedia for BTS concert history:
- `https://en.wikipedia.org/wiki/List_of_BTS_concert_tours`
- Parse tables for each tour: venue, city, country, date, attendance
- Cache to `scripts/cache/concerts.json`
- Upsert into `concerts` table

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-13-concerts.ts package.json
git commit -m "feat: add concerts scraper (Wikipedia)"
```

---

## Task 12: Scraper — Collaborations

**Files:**
- Create: `scripts/scrape-14-collaborations.ts`

**Step 1: Write the scraper**

Uses MusicBrainz relations API to find collaborations:
- Query MusicBrainz for BTS and each member's artist relations
- Filter for "featured" and "producer" relationships
- Also scrape Wikipedia collaboration lists
- Cache to `scripts/cache/collaborations.json`
- Upsert into `collaborations` table

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-14-collaborations.ts package.json
git commit -m "feat: add collaborations scraper (MusicBrainz + Wikipedia)"
```

---

## Task 13: Scraper — Member Events

**Files:**
- Create: `scripts/scrape-15-member-events.ts`

**Step 1: Write the scraper**

Scrapes Wikipedia member pages for key events:
- Enlistment dates (start/end)
- Solo debut dates
- Variety show appearances
- Brand ambassador appointments
- Key milestones (social media records, etc.)

Sources:
- `https://en.wikipedia.org/wiki/RM_(rapper)` (and each member)
- Parse infobox + career sections
- Cache to `scripts/cache/member-events.json`
- Upsert into `member_events` table
- Also update `members` table: enlistment_start, enlistment_end, solo_debut_date, birth_name_ko, education, bio_long

**Step 2: Add npm script and commit**

```bash
git add scripts/scrape-15-member-events.ts package.json
git commit -m "feat: add member events scraper (Wikipedia)"
```

---

## Task 14: Update scrape:all Pipeline

**Files:**
- Modify: `package.json`

**Step 1: Update the scrape:all script**

```json
"scrape:all": "npm run scrape:musicbrainz && npm run scrape:wiki && npm run scrape:genius && npm run scrape:albums && npm run scrape:songs && npm run scrape:lyrics && npm run scrape:verify && npm run scrape:expand-discography && npm run scrape:cover-art && npm run scrape:lyrics-translations && npm run scrape:awards && npm run scrape:chart-entries && npm run scrape:concerts && npm run scrape:collaborations && npm run scrape:member-events"
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "feat: update scrape:all to include wiki expansion scrapers"
```

---

## Task 15: Upgrade AI Knowledge Index

**Files:**
- Create: `src/services/knowledgeIndex.ts`
- Modify: `src/services/qaService.ts`

**Step 1: Create knowledgeIndex.ts**

```typescript
import Fuse from 'fuse.js';
import type { Song, Album, Member, Award, ChartEntry, Concert, Collaboration, MemberEvent } from '../types/database';

export interface KnowledgeContext {
    songs: Song[];
    albums: Album[];
    members: Member[];
    awards: Award[];
    chartEntries: ChartEntry[];
    concerts: Concert[];
    collaborations: Collaboration[];
    memberEvents: MemberEvent[];
}

export interface Aggregates {
    totalSongs: number;
    totalAlbums: number;
    totalAwards: number;
    totalAwardsWon: number;
    totalConcerts: number;
    totalCollaborations: number;
    uniqueCeremonies: string[];
    uniqueTours: string[];
    uniqueCharts: string[];
    awardsByMember: Map<string, number>;
    awardsByCeremony: Map<string, number>;
    concertsByTour: Map<string, number>;
    concertsByCountry: Map<string, number>;
    chartRecords: { chart: string; bestPosition: number; song: string }[];
}

export class KnowledgeIndex {
    public context: KnowledgeContext;
    public aggregates: Aggregates;
    private songFuse: Fuse<Song>;
    private awardFuse: Fuse<Award>;
    private concertFuse: Fuse<Concert>;

    constructor(ctx: KnowledgeContext) {
        this.context = ctx;
        this.aggregates = this.computeAggregates(ctx);
        this.songFuse = new Fuse(ctx.songs, {
            keys: ['title', 'sentiment', 'keywords'],
            threshold: 0.4,
        });
        this.awardFuse = new Fuse(ctx.awards, {
            keys: ['name', 'ceremony', 'category'],
            threshold: 0.4,
        });
        this.concertFuse = new Fuse(ctx.concerts, {
            keys: ['tour_name', 'venue', 'city'],
            threshold: 0.4,
        });
    }

    searchSongs(query: string) { return this.songFuse.search(query); }
    searchAwards(query: string) { return this.awardFuse.search(query); }
    searchConcerts(query: string) { return this.concertFuse.search(query); }

    private computeAggregates(ctx: KnowledgeContext): Aggregates {
        const awardsByMember = new Map<string, number>();
        const awardsByCeremony = new Map<string, number>();
        ctx.awards.forEach(a => {
            if (a.result === 'won') {
                if (a.member_id) awardsByMember.set(a.member_id, (awardsByMember.get(a.member_id) || 0) + 1);
                awardsByCeremony.set(a.ceremony, (awardsByCeremony.get(a.ceremony) || 0) + 1);
            }
        });

        const concertsByTour = new Map<string, number>();
        const concertsByCountry = new Map<string, number>();
        ctx.concerts.forEach(c => {
            concertsByTour.set(c.tour_name, (concertsByTour.get(c.tour_name) || 0) + 1);
            concertsByCountry.set(c.country, (concertsByCountry.get(c.country) || 0) + 1);
        });

        const chartBest = new Map<string, { position: number; song: string }>();
        ctx.chartEntries.forEach(ce => {
            const existing = chartBest.get(ce.chart_name);
            if (!existing || ce.peak_position < existing.position) {
                const song = ctx.songs.find(s => s.id === ce.song_id);
                chartBest.set(ce.chart_name, { position: ce.peak_position, song: song?.title || 'Unknown' });
            }
        });

        return {
            totalSongs: ctx.songs.length,
            totalAlbums: ctx.albums.length,
            totalAwards: ctx.awards.length,
            totalAwardsWon: ctx.awards.filter(a => a.result === 'won').length,
            totalConcerts: ctx.concerts.length,
            totalCollaborations: ctx.collaborations.length,
            uniqueCeremonies: [...new Set(ctx.awards.map(a => a.ceremony))],
            uniqueTours: [...new Set(ctx.concerts.map(c => c.tour_name))],
            uniqueCharts: [...new Set(ctx.chartEntries.map(c => c.chart_name))],
            awardsByMember,
            awardsByCeremony,
            concertsByTour,
            concertsByCountry,
            chartRecords: Array.from(chartBest.entries()).map(([chart, data]) => ({
                chart, bestPosition: data.position, song: data.song,
            })),
        };
    }
}
```

**Step 2: Expand qaService.ts with new patterns**

Add new pattern handlers to the `RuleBasedQA` class:

```typescript
// New patterns to add:
// "how many awards" / "total awards" → aggregates.totalAwardsWon
// "awards at [ceremony]" → filter awards by ceremony
// "awards in [year]" → filter awards by year
// "how many concerts" / "total concerts" → aggregates.totalConcerts
// "[tour name] tour" → filter concerts by tour
// "concerts in [country]" → filter by country
// "who collaborated with" → collaborations lookup
// "when did [member] enlist" → member_events lookup
// "[member] solo career" → member_events + collaborations
// "billboard" / "hot 100" → chart_entries lookup
// "number one" / "#1" → chart_entries where peak_position = 1
```

Update the `answer` method to accept a `KnowledgeContext` (superset of current `QAContext`):

```typescript
export interface QAContext {
    songs: Song[];
    albums: Album[];
    members: Member[];
    awards?: Award[];
    chartEntries?: ChartEntry[];
    concerts?: Concert[];
    collaborations?: Collaboration[];
    memberEvents?: MemberEvent[];
}
```

Add ~15 new regex patterns with handlers. Update `SUGGESTED_QUESTIONS` to include award/concert/chart questions.

**Step 3: Verify build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/services/knowledgeIndex.ts src/services/qaService.ts
git commit -m "feat: upgrade AI assistant with knowledge index and expanded Q&A patterns"
```

---

## Task 16: Awards Section UI

**Files:**
- Create: `src/components/features/sections/AwardsSection/index.tsx`
- Create: `src/components/features/sections/AwardsSection/AwardGrid.tsx`
- Create: `src/components/features/sections/AwardsSection/AwardTimeline.tsx`
- Create: `src/components/features/sections/AwardsSection/AwardStats.tsx`
- Modify: `src/App.tsx`

**Step 1: Create AwardsSection/index.tsx**

Tab-based layout with 3 views: Trophy Room (grid), Timeline, Stats.

```typescript
import { useState, Suspense, lazy } from 'react';
import { Trophy, Calendar, BarChart3 } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';

const AwardGrid = lazy(() => import('./AwardGrid'));
const AwardTimeline = lazy(() => import('./AwardTimeline'));
const AwardStats = lazy(() => import('./AwardStats'));

interface AwardsSectionProps {
    awards: Award[];
    members: Member[];
}

const TABS = [
    { id: 'grid', label: 'Trophy Room', icon: Trophy },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AwardsSection({ awards, members }: AwardsSectionProps) {
    const [activeTab, setActiveTab] = useState<TabId>('grid');
    // ... tab bar + panel rendering (same pattern as AnalyticsSection)
}
```

**Step 2: Create AwardGrid.tsx**

- Filter bar: ceremony, year, member, scope (group/solo), result (won/nominated)
- Cards in grid layout: ceremony name, award name, year, won/nominated badge
- "Record Breakers" highlight cards at top (most awards at ceremony, youngest winner, etc.)
- Uses existing `FilterBar`, `Badge`, `DataTable` UI components

**Step 3: Create AwardTimeline.tsx**

- Vertical timeline grouped by year
- Each year shows awards won with ceremony/category badges
- Highlight "firsts" (first Billboard win, first Grammy nomination, etc.)

**Step 4: Create AwardStats.tsx**

- Awards by ceremony (horizontal bar chart via Recharts)
- Awards by year (line chart showing growth)
- Won vs Nominated ratio (pie chart)
- Group vs Solo breakdown
- Uses existing `ChartPanel` UI component

**Step 5: Wire up in App.tsx**

Replace the placeholder with:
```tsx
const AwardsSection = lazy(() => import('./components/features/sections/AwardsSection'));

// In rendering:
{activeSection === 'awards' && (
    <AwardsSection awards={awards} members={members} />
)}
```

**Step 6: Verify build**

Run: `npm run build`
Expected: PASS

**Step 7: Commit**

```bash
git add src/components/features/sections/AwardsSection/
git commit -m "feat: add Awards section with trophy room, timeline, and statistics"
```

---

## Task 17: Tours Section UI

**Files:**
- Create: `src/components/features/sections/ToursSection/index.tsx`
- Create: `src/components/features/sections/ToursSection/TourList.tsx`
- Create: `src/components/features/sections/ToursSection/TourStats.tsx`
- Modify: `src/App.tsx`

**Step 1: Create ToursSection/index.tsx**

Tab-based: Tour List, Statistics.

```typescript
import { useState, Suspense, lazy } from 'react';
import { MapPin, BarChart3 } from 'lucide-react';
import type { Concert } from '../../../../types/database';

const TourList = lazy(() => import('./TourList'));
const TourStats = lazy(() => import('./TourStats'));

interface ToursSectionProps {
    concerts: Concert[];
}

export default function ToursSection({ concerts }: ToursSectionProps) {
    // Tab bar + panel rendering
}
```

**Step 2: Create TourList.tsx**

- Group concerts by `tour_name`
- Each tour card: name, date range, number of shows, total attendance
- Expand to show individual concerts with venue, city, country, date
- Setlist viewer when clicking a concert (renders `concert.setlist` JSON array)
- Filter by tour, country, year

**Step 3: Create TourStats.tsx**

- Concerts per year (bar chart)
- Concerts by country (horizontal bar chart)
- Total attendance per tour (bar chart)
- Average attendance growth over tours (line chart)

**Step 4: Wire up in App.tsx**

Replace tours placeholder:
```tsx
const ToursSection = lazy(() => import('./components/features/sections/ToursSection'));

{activeSection === 'tours' && (
    <ToursSection concerts={concerts} />
)}
```

**Step 5: Verify build**

Run: `npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/features/sections/ToursSection/
git commit -m "feat: add Tours section with concert list and statistics"
```

---

## Task 18: Enhance Discography — Lyrics Viewer

**Files:**
- Create: `src/components/features/sections/Discography/LyricsViewer.tsx`
- Modify: `src/components/features/sections/Discography/SongDetail.tsx`

**Step 1: Create LyricsViewer.tsx**

```typescript
import { useState } from 'react';
import type { Song } from '../../../../types/database';
import { useLyricsBySongId } from '../../../../hooks';

interface LyricsViewerProps {
    song: Song;
}

type LyricsMode = 'korean' | 'english' | 'romanized' | 'side-by-side';

export default function LyricsViewer({ song }: LyricsViewerProps) {
    const [mode, setMode] = useState<LyricsMode>('english');
    const { lyrics } = useLyricsBySongId(song.id);

    // Tab bar for mode selection
    // Render lyrics text in a scrollable container
    // Side-by-side mode shows Korean + English in two columns
    // Fallback: "No lyrics available" message
}
```

**Step 2: Add lyrics tab to SongDetail.tsx**

In the existing SongDetail tabs (Info, Features, Similar), add a "Lyrics" tab:
- Import and render `LyricsViewer` when lyrics tab active
- Also check `song.lyrics_en` (new column) as fallback if lyrics table empty

**Step 3: Add solo/collab filter badges**

In `SongDetail.tsx`, show badges if `song.is_solo` or `song.is_collab`:
```tsx
{song.is_solo && <Badge variant="purple" size="sm">Solo</Badge>}
{song.is_collab && <Badge variant="blue" size="sm">Collaboration</Badge>}
```

**Step 4: Add chart performance to song detail**

Import `useChartEntriesBySong(song.id)` and display chart entries as badges/table.

**Step 5: Verify build**

Run: `npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/features/sections/Discography/LyricsViewer.tsx src/components/features/sections/Discography/SongDetail.tsx
git commit -m "feat: add lyrics viewer and chart entries to song detail"
```

---

## Task 19: Enhance Discography — Solo/Collab Tabs

**Files:**
- Modify: `src/components/features/sections/Discography/AlbumGrid.tsx`

**Step 1: Add filter tabs to AlbumGrid**

Above the existing era filter, add a category filter:
```typescript
type DiscographyCategory = 'all' | 'group' | 'solo' | 'collab';
const [category, setCategory] = useState<DiscographyCategory>('all');
```

Filter albums/songs based on category:
- 'group': show existing group albums
- 'solo': show songs where `is_solo === true`, grouped by member
- 'collab': show songs where `is_collab === true` or collaborations table entries

Use existing `FilterBar` component for the category selector.

**Step 2: Verify build and commit**

```bash
git add src/components/features/sections/Discography/AlbumGrid.tsx
git commit -m "feat: add solo/collab category tabs to discography"
```

---

## Task 20: Enhance Members — Timeline & Extended Bio

**Files:**
- Create: `src/components/features/sections/Members/MemberTimeline.tsx`
- Modify: `src/components/features/sections/MembersSection.tsx`

**Step 1: Create MemberTimeline.tsx**

```typescript
import { useMemo } from 'react';
import type { MemberEvent } from '../../../../types/database';

interface MemberTimelineProps {
    events: MemberEvent[];
}

export default function MemberTimeline({ events }: MemberTimelineProps) {
    const sorted = useMemo(
        () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
        [events]
    );

    // Vertical timeline with colored dots per event_type
    // event_type colors: enlistment = gray, solo_debut = purple, milestone = gold
    // Each node: date, title, description
}
```

**Step 2: Enhance MemberProfile in MembersSection.tsx**

- Import `useMemberEventsByMember(member.id)`
- Import `useCollaborationsByMember(member.id)`
- Import `useAwardsByMember(member.id)`
- Add new sections below existing content:
  - "Timeline" using MemberTimeline component
  - "Awards" showing count + list of awards won
  - "Collaborations" showing featured/production credits with external artists
- Show extended bio (`member.bio_long`) if available, otherwise fall back to `member.bio`
- Show enlistment status if `member.enlistment_start` is set

**Step 3: Verify build and commit**

```bash
git add src/components/features/sections/Members/MemberTimeline.tsx src/components/features/sections/MembersSection.tsx
git commit -m "feat: add member timeline, awards, and collaborations to profile"
```

---

## Task 21: Enhance Overview with New Data

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx`

**Step 1: Add new stat cards**

Change from 4-column to 6-column or 3-row grid. Add:
- Awards Won stat card (Trophy icon)
- Concerts stat card (MapPin icon)

```tsx
<div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
    <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
    <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
    <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle="7 artists" />
    <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" />
    <StatCard label="Awards Won" value={awardsWon} icon={Trophy} accent="#FBBF24" subtitle={`${awards.length} total nominations`} />
    <StatCard label="Concerts" value={concerts.length} icon={MapPin} accent="#10B981" subtitle={`${uniqueTours} tours`} />
</div>
```

**Step 2: Update HomeSection props**

Add `awards`, `chartEntries`, `concerts` to props. Pass them from App.tsx.

**Step 3: Update generateInsights()**

In `src/services/analyticsService.ts`, expand `generateInsights()` to include award/concert/chart insights:
- "BTS has won X awards across Y ceremonies"
- "They have performed Z concerts in N countries"
- "Their highest-charting song is X at #Y on Z"

**Step 4: Add "Recent Milestones" section**

Below Quick Insights, add a section showing recent member events and achievements (sorted by date, top 5).

**Step 5: Verify build and commit**

```bash
git add src/components/features/sections/HomeSection/index.tsx src/services/analyticsService.ts src/App.tsx
git commit -m "feat: enhance overview with awards, concerts, milestones data"
```

---

## Task 22: Expand Search to All Tables

**Files:**
- Modify: `src/services/searchService.ts`
- Modify: `src/hooks/useSearch.ts`
- Modify: `src/components/features/sections/SearchSection.tsx`

**Step 1: Add Fuse configs for new data types**

In `searchService.ts`, add:
```typescript
export const AWARD_FUSE_OPTIONS: IFuseOptions<Award> = {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'ceremony', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'work_title', weight: 0.2 },
    ],
    includeScore: true,
    threshold: 0.4,
};

export const CONCERT_FUSE_OPTIONS: IFuseOptions<Concert> = {
    keys: [
        { name: 'tour_name', weight: 0.3 },
        { name: 'venue', weight: 0.3 },
        { name: 'city', weight: 0.2 },
        { name: 'country', weight: 0.2 },
    ],
    includeScore: true,
    threshold: 0.4,
};
```

Add result mappers: `mapAwardResult`, `mapConcertResult`.

**Step 2: Expand SearchResult type**

```typescript
export interface SearchResult {
    id: number | string;
    type: 'song' | 'member' | 'album' | 'award' | 'concert' | 'collaboration';
    // ... rest stays the same
}
```

**Step 3: Update useSearch hook**

Import new hooks (`useAwards`, `useConcerts`), create Fuse instances, add `searchAwards`, `searchConcerts` methods, include in `searchAll`.

**Step 4: Update SearchSection.tsx**

Add filter buttons for new types. Show award/concert results with appropriate rendering (ceremony badge for awards, tour name for concerts).

**Step 5: Verify build and commit**

```bash
git add src/services/searchService.ts src/hooks/useSearch.ts src/components/features/sections/SearchSection.tsx
git commit -m "feat: expand search to cover awards, concerts, collaborations"
```

---

## Task 23: Add Analytics Tabs for Awards & Charts

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx`
- Create: `src/components/features/sections/AnalyticsSection/CareerTimeline.tsx`
- Modify: `src/components/features/sections/AnalyticsSection/index.tsx`

**Step 1: Create AwardsAnalytics.tsx**

Charts:
- Awards won per year (line chart)
- Awards by ceremony (horizontal bar)
- Group vs Solo wins (stacked bar by year)
- Certification counts (Platinum, Gold, etc.)
- Uses `computeAwardStats()` function (add to analyticsService)

**Step 2: Create CareerTimeline.tsx**

- Vertical timeline of major milestones from all data:
  - First album release
  - First #1 on Hot 100
  - Sold-out stadiums
  - Enlistment dates
  - Solo debuts
- Combine data from albums, chart_entries, concerts, member_events
- Each milestone shows date, title, description, related members

**Step 3: Update AnalyticsSection/index.tsx**

Add two new tabs to the TABS array:
```typescript
{ id: 'awards-charts', label: 'Awards & Charts', icon: Trophy },
{ id: 'career', label: 'Career Timeline', icon: Calendar },
```

Lazy-load and render the new panels.

Update props to accept `awards`, `chartEntries`, `concerts`, `memberEvents`.

**Step 4: Update App.tsx AnalyticsSection render**

Pass new data props:
```tsx
<AnalyticsSection
    songs={songs}
    albums={albums}
    members={members}
    lyrics={lyrics}
    awards={awards}
    chartEntries={chartEntries}
    concerts={concerts}
    memberEvents={memberEvents}
/>
```

**Step 5: Verify build and commit**

```bash
git add src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx src/components/features/sections/AnalyticsSection/CareerTimeline.tsx src/components/features/sections/AnalyticsSection/index.tsx src/App.tsx
git commit -m "feat: add Awards & Charts and Career Timeline analytics tabs"
```

---

## Task 24: Wire Up QA Panel with Full Knowledge Context

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/QAPanel.tsx`

**Step 1: Update QAPanel props**

Accept the full data context:
```typescript
interface QAPanelProps {
    songs: Song[];
    albums: Album[];
    members: Member[];
    awards?: Award[];
    chartEntries?: ChartEntry[];
    concerts?: Concert[];
    collaborations?: Collaboration[];
    memberEvents?: MemberEvent[];
}
```

**Step 2: Pass full context to qaService**

```typescript
const response = qaService.answer(question, {
    songs, albums, members,
    awards, chartEntries, concerts, collaborations, memberEvents,
});
```

**Step 3: Update suggested questions**

Add new suggestions:
- "How many awards has BTS won?"
- "What tours has BTS done?"
- "When did BTS first chart on Hot 100?"
- "Who has the most solo awards?"
- "How many concerts in Japan?"

**Step 4: Verify build and commit**

```bash
git add src/components/features/sections/AnalyticsSection/QAPanel.tsx
git commit -m "feat: wire QA panel with full wiki knowledge context"
```

---

## Task 25: Final Integration & Polish

**Files:**
- Modify: `src/App.tsx` — final wiring of all data to all sections
- Modify: `src/services/analyticsService.ts` — add award/chart computation functions

**Step 1: Add computation functions to analyticsService**

```typescript
export function computeAwardStats(awards: Award[]): {
    byYear: { year: number; won: number; nominated: number }[];
    byCeremony: { ceremony: string; won: number; nominated: number }[];
    byScope: { scope: string; count: number }[];
} { /* ... */ }

export function computeChartStats(chartEntries: ChartEntry[]): {
    byChart: { chart: string; entries: number; topPosition: number }[];
    numberOnes: ChartEntry[];
    certifications: { cert: string; count: number }[];
} { /* ... */ }

export function computeTourStats(concerts: Concert[]): {
    byTour: { tour: string; shows: number; totalAttendance: number }[];
    byCountry: { country: string; shows: number }[];
    byYear: { year: number; shows: number }[];
} { /* ... */ }
```

**Step 2: Update generateInsights() with new data**

Accept optional parameters:
```typescript
export function generateInsights(
    songs: Song[],
    albums: Album[],
    members: Member[],
    awards?: Award[],
    chartEntries?: ChartEntry[],
    concerts?: Concert[],
): Insight[]
```

Add 5-8 new insights from awards/charts/concerts data.

**Step 3: Verify full build**

Run: `npm run build`
Expected: PASS — zero errors

**Step 4: Test manually**

Run: `npm run dev`
- Navigate all 7 sections
- Verify Awards and Tours show correct empty/loading states
- Verify Analytics has 9 tabs
- Verify QA panel answers award/concert questions
- Verify search finds all data types

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete BTS wiki expansion — 7 sections, full analytics, expanded AI"
```

---

## Execution Dependencies

```
Task 1 (Schema) ──→ Task 2 (Types) ──→ Task 3 (Hooks) ──→ Task 4 (Fallbacks)
                                            │
                                            ▼
                                       Task 5 (Nav) ──→ Task 16 (Awards UI)
                                            │              Task 17 (Tours UI)
                                            │              Task 18 (Lyrics)
                                            │              Task 19 (Solo/Collab)
                                            │              Task 20 (Members)
                                            │              Task 21 (Overview)
                                            │
                                            ▼
Tasks 6-13 (Scrapers) ── can run in parallel, independent of UI tasks
                                            │
                                            ▼
                                       Task 14 (Pipeline)

Task 15 (Knowledge Index) ──→ Task 22 (Search) ──→ Task 24 (QA Panel)
                                                      Task 23 (Analytics Tabs)
                                                      Task 25 (Polish)
```

**Parallelizable groups:**
- Tasks 6-13 (all scrapers) can be developed in parallel
- Tasks 16-21 (all UI sections) can be developed in parallel after Task 5
- Tasks 22-24 can be developed in parallel after Task 15

---

## File Reference

| New File | Task |
|----------|------|
| `database/migration-wiki-expansion.sql` | 1 |
| `src/hooks/useAwards.ts` | 3 |
| `src/hooks/useChartEntries.ts` | 3 |
| `src/hooks/useConcerts.ts` | 3 |
| `src/hooks/useCollaborations.ts` | 3 |
| `src/hooks/useMemberEvents.ts` | 3 |
| `scripts/scrape-08-expand-discography.ts` | 6 |
| `scripts/scrape-09-cover-art.ts` | 7 |
| `scripts/scrape-10-lyrics-translations.ts` | 8 |
| `scripts/scrape-11-awards.ts` | 9 |
| `scripts/scrape-12-chart-entries.ts` | 10 |
| `scripts/scrape-13-concerts.ts` | 11 |
| `scripts/scrape-14-collaborations.ts` | 12 |
| `scripts/scrape-15-member-events.ts` | 13 |
| `src/services/knowledgeIndex.ts` | 15 |
| `src/components/features/sections/AwardsSection/index.tsx` | 16 |
| `src/components/features/sections/AwardsSection/AwardGrid.tsx` | 16 |
| `src/components/features/sections/AwardsSection/AwardTimeline.tsx` | 16 |
| `src/components/features/sections/AwardsSection/AwardStats.tsx` | 16 |
| `src/components/features/sections/ToursSection/index.tsx` | 17 |
| `src/components/features/sections/ToursSection/TourList.tsx` | 17 |
| `src/components/features/sections/ToursSection/TourStats.tsx` | 17 |
| `src/components/features/sections/Discography/LyricsViewer.tsx` | 18 |
| `src/components/features/sections/Members/MemberTimeline.tsx` | 20 |
| `src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx` | 23 |
| `src/components/features/sections/AnalyticsSection/CareerTimeline.tsx` | 23 |

| Modified File | Tasks |
|---------------|-------|
| `database/schema.sql` | 1 |
| `src/types/database.ts` | 2 |
| `src/types/index.ts` | 5 |
| `src/types.ts` | 5 |
| `src/hooks/index.ts` | 3 |
| `src/hooks/useSongs.ts` | 4 |
| `src/hooks/useMembers.ts` | 4 |
| `src/hooks/useAlbums.ts` | 4 |
| `src/hooks/useSearch.ts` | 22 |
| `src/App.tsx` | 5, 16, 17, 21, 23 |
| `src/services/qaService.ts` | 15 |
| `src/services/searchService.ts` | 22 |
| `src/services/analyticsService.ts` | 21, 25 |
| `src/components/features/sections/Discography/SongDetail.tsx` | 18 |
| `src/components/features/sections/Discography/AlbumGrid.tsx` | 19 |
| `src/components/features/sections/MembersSection.tsx` | 20 |
| `src/components/features/sections/HomeSection/index.tsx` | 21 |
| `src/components/features/sections/SearchSection.tsx` | 22 |
| `src/components/features/sections/AnalyticsSection/index.tsx` | 23 |
| `src/components/features/sections/AnalyticsSection/QAPanel.tsx` | 24 |
| `package.json` | 6-14 |
