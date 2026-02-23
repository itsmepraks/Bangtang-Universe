# BTS Universe — Wiki Expansion Design

**Date**: 2026-02-22
**Status**: Approved
**Goal**: Transform the BTS Universe app from a basic dashboard into a comprehensive BTS encyclopedia with real scraped data, expanded analytics, and an AI assistant trained on all available information.

---

## 1. Database Schema

### New Tables (5)

**awards**
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | e.g. "Daesang", "Top Social Artist" |
| ceremony | text | e.g. "MAMA", "Billboard Music Awards" |
| year | int | |
| category | text | e.g. "Album of the Year" |
| result | text | 'won' or 'nominated' |
| scope | text | 'group', 'solo', 'unit' |
| member_id | uuid FK nullable | null = group award |
| work_title | text nullable | album/song title if relevant |
| created_at | timestamptz | |

**chart_entries**
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| song_id | uuid FK nullable | |
| album_id | int FK nullable | |
| chart_name | text | e.g. "Billboard Hot 100", "Oricon" |
| peak_position | int | |
| weeks_on_chart | int nullable | |
| entry_date | date nullable | |
| certification | text nullable | e.g. "Platinum", "Diamond" |
| region | text | e.g. "US", "KR", "JP" |
| created_at | timestamptz | |

**concerts**
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| tour_name | text | e.g. "Love Yourself: Speak Yourself" |
| venue | text | |
| city | text | |
| country | text | |
| date | date | |
| attendance | int nullable | |
| setlist | jsonb nullable | array of song titles |
| notes | text nullable | special events |
| created_at | timestamptz | |

**collaborations**
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| song_id | uuid FK nullable | links to songs table if we have it |
| title | text | |
| artist | text | external collaborator name |
| member_id | uuid FK nullable | which BTS member(s) |
| type | text | 'feature', 'production', 'remix', 'ost' |
| release_date | date nullable | |
| created_at | timestamptz | |

**member_events**
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| member_id | uuid FK | |
| event_type | text | 'enlistment_start', 'enlistment_end', 'solo_debut', 'variety_show', 'ambassador', 'milestone' |
| title | text | |
| date | date | |
| description | text nullable | |
| source_url | text nullable | |
| created_at | timestamptz | |

### New Columns on Existing Tables

**songs** (add):
- `lyrics_ko` text — Korean original
- `lyrics_en` text — English translation
- `lyrics_romanized` text — Romanized Korean
- `music_video_url` text nullable
- `is_solo` boolean default false
- `is_collab` boolean default false
- `featured_members` text[] — array of member IDs/names

**members** (add):
- `birth_name_ko` text — Korean name
- `birth_date` date
- `birthplace` text
- `education` text nullable
- `enlistment_start` date nullable
- `enlistment_end` date nullable
- `solo_debut_date` date nullable
- `instagram_handle` text nullable
- `bio_long` text — detailed biography paragraph

**albums** (add):
- `cover_art_url` text nullable — from Cover Art Archive
- `total_sales` bigint nullable
- `label` text nullable

### New Scraper Scripts (8)

| Script | Source | Data |
|--------|--------|------|
| `scrape-08-expand-discography.ts` | MusicBrainz | Solo + collab songs (~170 new) |
| `scrape-09-cover-art.ts` | Cover Art Archive | Album artwork URLs |
| `scrape-10-lyrics-translations.ts` | ColorCodedLyrics | Korean + English + romanized |
| `scrape-11-awards.ts` | Wikipedia tables | Awards won/nominated |
| `scrape-12-chart-entries.ts` | Wikipedia tables | Billboard, Oricon, Gaon entries |
| `scrape-13-concerts.ts` | Wikipedia / setlist.fm | Tour dates, venues, attendance |
| `scrape-14-collaborations.ts` | MusicBrainz relations | Featured artists, production credits |
| `scrape-15-member-events.ts` | Wikipedia member pages | Enlistment, solo debuts, milestones |

All scrapers follow existing pipeline conventions:
- Rate limiting (1 req/sec for MusicBrainz, polite delays for Wikipedia)
- Cache to `scripts/cache/` as JSON before DB insert
- Idempotent (upsert, not duplicate)
- CLI with `--dry-run` flag

---

## 2. AI Assistant Architecture

### Knowledge Index

Build a comprehensive knowledge index from all database tables at app startup:

```
KnowledgeIndex {
  songs: indexed by title, members, era, sentiment, features
  albums: indexed by title, era, year
  members: indexed by name, role, stats
  awards: indexed by ceremony, year, category
  charts: indexed by chart_name, song, peak
  concerts: indexed by tour, city, year
  collaborations: indexed by artist, member
  memberEvents: indexed by member, type, year

  // Pre-computed aggregates
  aggregates: {
    totalAwards: number
    totalConcerts: number
    awardsByMember: Map
    chartRecords: Map
    eraStats: Map
    ...
  }
}
```

### Smart Query Router

Pattern-matching categories (extend existing `qaService.ts`):

1. **Stats queries**: "how many awards", "total concerts" — direct aggregate lookup
2. **Ranking queries**: "who has the most", "top songs by" — sort and return top N
3. **Comparison queries**: "compare RM and SUGA", "group vs solo" — side-by-side data
4. **Timeline queries**: "when did they enlist", "concert history" — chronological results
5. **Discovery queries**: "songs similar to", "recommend" — cosine similarity
6. **Factual queries**: "where was Jimin born", "what awards at MAMA 2019" — direct lookup
7. **Lyrics queries**: "songs about love", "themes in Dark & Wild era" — lyrics analysis

### Response Generator

```typescript
interface QAResponse {
  text: string;           // Natural language answer
  data?: any;             // Structured data for rendering
  type: 'text' | 'ranking' | 'comparison' | 'stat' | 'list' | 'timeline';
  confidence: number;     // 0-1, show "I'm not sure" below 0.3
  sources?: string[];     // Which tables/data contributed
}
```

### Claude API Swap Point

```typescript
interface QAProvider {
  answer(question: string, context: QAContext): Promise<QAResponse>;
}

// Current: RuleBasedQA implements QAProvider
// Future:  ClaudeQA implements QAProvider (RAG with embeddings)
```

The swap is a single line change — replace the `qaService` singleton export.

---

## 3. UI Changes

### Navigation: 5 → 7 Sections

| Current | New |
|---------|-----|
| Overview | Overview (enhanced with new data) |
| Discography | Discography (+ lyrics viewer, solo/collab tabs) |
| Members | Members (+ timeline, enlistment, solo careers) |
| Analytics | Analytics (+ awards/charts analytics tabs) |
| Search | Search (expanded to search all new tables) |
| — | **Awards** (new: trophy room, timeline, stats) |
| — | **Tours** (new: concert map, setlists, attendance) |

### Enhanced Existing Sections

**Overview**: Add award count stat card, recent milestones feed, "BTS by the Numbers" summary pulling from all tables.

**Discography**: Add lyrics viewer panel (Korean/English/romanized toggle), solo/collab filter tabs, chart performance badges on songs.

**Members**: Add timeline component (enlistment, solo debuts, milestones), detailed bio panel, solo discography sub-section, individual award counts.

**Analytics**: Add two new tabs — "Awards & Charts" (award trends over years, chart peak distributions) and "Career Timeline" (group milestones visualization).

**Search**: Extend Fuse.js index to cover awards, concerts, collaborations, member_events. Search results grouped by category.

### New Sections

**Awards**: Trophy room grid, filter by ceremony/year/member, group vs solo toggle, "Record Breakers" highlight cards.

**Tours**: Concert list by tour, attendance stats, world map pins (future), setlist viewer.

---

## 4. Scraping Pipeline Execution

### Phase A: Data Collection (8 scripts)

Run order matters due to dependencies:

1. `scrape-08-expand-discography.ts` — needs to run first (new songs get IDs)
2. `scrape-09-cover-art.ts` — needs album MusicBrainz IDs from step 1
3. `scrape-10-lyrics-translations.ts` — needs song titles from steps 1
4. `scrape-14-collaborations.ts` — needs MusicBrainz relation data
5. `scrape-11-awards.ts` — independent, can run in parallel with 5-8
6. `scrape-12-chart-entries.ts` — independent
7. `scrape-13-concerts.ts` — independent
8. `scrape-15-member-events.ts` — independent

Scripts 5-8 are independent and can run in parallel.

### Phase B: App Integration

1. Database migration (new tables + columns)
2. New TypeScript types and Supabase hooks
3. Awards section UI
4. Tours section UI
5. Enhanced Discography (lyrics viewer, solo/collab tabs)
6. Enhanced Members (timeline, bio, solo career)
7. Enhanced Overview (new stat cards, milestones)
8. Upgraded AI assistant with full knowledge index

### Phase C: Polish

1. Expanded search across all new tables
2. New analytics tabs (Awards & Charts, Career Timeline)
3. Updated `generateInsights()` with award/concert/chart data
4. Cross-section navigation (click award → related song/album)

---

## Data Sources

| Source | Data | Auth | Rate Limit |
|--------|------|------|------------|
| MusicBrainz API | Discography, collaborations | None (User-Agent required) | 1 req/sec |
| Cover Art Archive | Album artwork | None | Generous |
| Wikipedia | Awards, charts, concerts, member events | None | Polite scraping |
| Wikidata SPARQL | Structured award/chart data | None | Reasonable |
| ColorCodedLyrics | Korean + English + romanized lyrics | None (robots.txt open) | Polite delays |
| Genius API | Original lyrics, credits | Existing API key | Standard |

---

## Technical Notes

- All scraping is CLI-only (no in-app scraping)
- Local-first AI with Claude API swap interface for future upgrade
- Supabase as primary DB, local JSON fallback preserved
- Existing 57 songs with audio features are kept as-is (Spotify API deprecated, no new audio features)
- All new data is real, scraped from royalty-free sources
- Scraper scripts are idempotent and cache intermediate results
