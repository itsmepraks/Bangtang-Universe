# BTS Universe

A data-driven web dashboard exploring BTS's discography, tours, awards, member profiles, and analytics. Built as a single-page application with a Supabase backend and 17+ automated data scrapers.

## Stack

- **Frontend:** React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7
- **Backend:** Supabase (PostgreSQL)
- **Data:** Recharts, React Simple Maps, Framer Motion, Fuse.js
- **Scrapers:** cheerio, MusicBrainz API, Genius API, Setlist.fm API

## Dashboard Sections

| Section | Description |
|---------|-------------|
| **Landing** | Concert stage experience with animated spotlights, ARMY bomb crowd, and starfield |
| **Overview** | Key stats, recent releases, and quick navigation |
| **Discography** | Full album/single catalog with cover art, tracklists, and era filtering |
| **Members** | Tabbed artist profiles — bio, career timeline, solo music, achievements, awards |
| **Analytics** | Charts for album sales, streaming trends, chart positions over time |
| **Awards** | Group and solo awards with collapsible podium tree (Grammy, MAMA, Billboard, etc.) |
| **Tours** | Interactive world map with tour routes, setlists, venue stats, and timeline slider |
| **Search** | Fuzzy search across songs, albums, lyrics, and members |
| **Sonic Lab** | Audio waveform visualization and music metrics |

## Data Pipeline

Scrapers collect data from public sources and populate the Supabase database:

```
scripts/scrape-01 → MusicBrainz discography
scripts/scrape-02 → Wikipedia album metadata
scripts/scrape-03 → Genius song IDs
scripts/scrape-04 → Upsert albums to Supabase
scripts/scrape-05 → Upsert songs to Supabase
scripts/scrape-06 → Genius lyrics
scripts/scrape-07 → Verification pass
scripts/scrape-08 → Expanded discography (Japanese, solo)
scripts/scrape-09 → Cover art from Cover Art Archive
scripts/scrape-10 → Korean lyrics translations
scripts/scrape-11 → Group awards (Wikipedia)
scripts/scrape-12 → Chart entries (Billboard, Gaon/Circle)
scripts/scrape-13 → Concert/tour data
scripts/scrape-14 → Collaborations and features
scripts/scrape-15 → Member career events (Wikipedia)
scripts/scrape-16 → Setlist.fm setlists
scripts/scrape-17 → Solo member awards
```

Additional data scripts: `seed-member-events.ts`, `fix-member-data.ts`, `generate-city-coords.ts`

## Getting Started

```bash
git clone https://github.com/itsmepraks/BTS-universe.git
cd BTS-universe
npm install
```

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the dev server:

```bash
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with ESLint |

## Project Structure

```
src/
  components/
    features/
      LandingRitual.tsx        # Concert stage landing page
      MemberDNA.tsx             # Full member profile overlay
      sections/
        HomeSection/            # Overview dashboard
        Discography/            # Album browser
        MembersSection.tsx      # Member grid + tabbed profiles
        AnalyticsSection/       # Charts and trends
        AwardsSection/          # Awards podium
        ToursSection/           # Tour map + setlists
        SearchSection.tsx       # Fuzzy search
        Sonic/                  # Audio analysis
    visual/                     # Reusable visual components (canvas, effects)
    layout/                     # Navigation, sidebar, glass panels
  hooks/                        # Supabase data hooks
  types/                        # TypeScript interfaces
  data/                         # Static fallback data
scripts/                        # Data scrapers and seed scripts
```

## License

Personal portfolio project. Not licensed for commercial use.

All BTS-related content belongs to BigHit Music / HYBE.

Built by [Prakriti Bista](https://github.com/itsmepraks).
