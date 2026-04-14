# Concert-Energy Visual Overhaul

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip AI-generated feel from the dashboard and replace with concert-energy aesthetics — ARMY bomb glow, member spotlight colors, dynamic light effects — so the site feels like being at a BTS concert, not reading a ChatGPT template.

**Architecture:** Six surgical passes across the codebase. Tasks 1-2 fix copy (kill AI words). Tasks 3-4 fix layout (deduplicate, restructure Home). Tasks 5-6 fix visuals (section-specific colors, concert lighting effects). Each task is independently committable.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Recharts, Vite

---

## File Map

| File | Responsibility | Tasks |
|---|---|---|
| `src/components/ui/SectionIntro.tsx` | Section description wrapper | T1 (gutted) |
| `src/components/ui/GlossaryTip.tsx` | Tooltip definitions | T2 |
| `src/components/features/sections/HomeSection/index.tsx` | Home overview page | T1, T3, T4 |
| `src/components/features/sections/AnalyticsSection/index.tsx` | Analytics tab shell | T1 |
| `src/components/features/sections/AnalyticsSection/AudioExplorer.tsx` | Audio explorer + Mood Quadrant | T3 |
| `src/components/features/sections/Discography/AlbumGrid.tsx` | Album grid + filters | T1 |
| `src/components/features/sections/MembersSection.tsx` | Members grid + profiles | T1 |
| `src/components/features/sections/AwardsSection/index.tsx` | Awards section | T1, T5 |
| `src/components/features/sections/ToursSection/index.tsx` | Tours section | T1, T5 |
| `src/components/features/sections/MediaSection/index.tsx` | Media section | T1 |
| `src/components/features/sections/SearchSection.tsx` | Search section | T4 |
| `src/components/features/sections/AnalyticsSection/QAPanel.tsx` | Q&A panel | T4 |
| `src/components/features/sections/AnalyticsSection/SongRecommender.tsx` | Recommender empty states | T4 |
| `src/constants/colors.ts` | Color constants | T5 |
| `src/index.css` | Global styles | T6 |
| `src/App.tsx` | App shell, sidebar, header | T6 |
| `src/components/features/sections/HomeSection/StatCard.tsx` | Stat card component | T6 |
| `src/components/features/sections/HomeSection/BentoCard.tsx` | Bento grid cards | T6 |

---

### Task 1: Kill AI Copy — Section Intros

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx:159-166`
- Modify: `src/components/features/sections/Discography/AlbumGrid.tsx:114-121`
- Modify: `src/components/features/sections/MembersSection.tsx:438-445`
- Modify: `src/components/features/sections/AnalyticsSection/index.tsx:79-88`
- Modify: `src/components/features/sections/AwardsSection/index.tsx:45`
- Modify: `src/components/features/sections/ToursSection/index.tsx:60`
- Modify: `src/components/features/sections/MediaSection/index.tsx:42`

- [ ] **Step 1: Replace Home tagline**

In `src/components/features/sections/HomeSection/index.tsx`, replace the `<div className="pt-1">` block (lines 159-167) with:

```tsx
<div className="pt-1">
  <h1 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
    Bangtan Universe
  </h1>
  <p className="text-sm text-white/35 mt-1">
    11 years. 7 members. The numbers behind the music.
  </p>
</div>
```

- [ ] **Step 2: Replace Discography intro**

In `src/components/features/sections/Discography/AlbumGrid.tsx`, replace the `<SectionIntro>` block (lines 114-121) with:

```tsx
{/* No intro — filter bar is self-explanatory */}
```

Remove the `import SectionIntro` and `import GlossaryTip` lines (7-8) if they become unused.

- [ ] **Step 3: Replace Members intro**

In `src/components/features/sections/MembersSection.tsx`, replace the `<SectionIntro>` block (lines 438-445) with nothing — delete it. The member grid with photos is self-evident.

Remove the `SectionIntro` import (line 9) and `GlossaryTip` import if unused.

- [ ] **Step 4: Replace Analytics intro**

In `src/components/features/sections/AnalyticsSection/index.tsx`, replace the `<SectionIntro>` block (lines 79-88) with nothing — delete it. The tab strip is the intro.

Remove the `SectionIntro` and `GlossaryTip` imports (lines 4-5).

- [ ] **Step 5: Replace Awards intro**

In `src/components/features/sections/AwardsSection/index.tsx`, replace the SectionIntro at line 45 with:

```tsx
{/* Awards data speaks for itself — the podium + filters are the intro */}
```

Remove the `SectionIntro` import (line 4).

- [ ] **Step 6: Replace Tours intro**

In `src/components/features/sections/ToursSection/index.tsx`, replace the SectionIntro at line 60 with nothing — delete it. The map is the intro.

Remove the `SectionIntro` import (line 4).

- [ ] **Step 7: Replace Media intro**

In `src/components/features/sections/MediaSection/index.tsx`, replace the SectionIntro at line 42 with nothing — delete it.

Remove the `SectionIntro` import (line 4).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "fix: strip AI-generated section intros — let UI speak for itself"
```

---

### Task 2: Humanize GlossaryTip Definitions

**Files:**
- Modify: `src/components/ui/GlossaryTip.tsx:3-13`

- [ ] **Step 1: Replace definitions**

Replace the GLOSSARY object with terse, human definitions:

```typescript
const GLOSSARY: Record<string, string> = {
  era: 'Album era (e.g. Love Yourself, Wings)',
  komca: 'Official Korean songwriting credits',
  valence: 'How happy a song sounds (0-1)',
  energy: 'How intense a song feels (0-1)',
  danceability: 'How danceable (0-1)',
  acousticness: 'How acoustic vs. electronic (0-1)',
  sentiment: 'Dominant emotion (Joy, Pain, Hope, etc.)',
  bpm: 'Tempo in beats per minute',
  'title track': 'Lead single with music video',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/GlossaryTip.tsx && git commit -m "fix: terse glossary definitions — 5 words, not paragraphs"
```

---

### Task 3: Remove Duplicate Visualizations from Home

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx`
- Modify: `src/components/features/sections/AnalyticsSection/AudioExplorer.tsx:99`

The Home "Mood Quadrant" (scatter plot) duplicates the AudioExplorer. Replace it with a concert-themed "Now Playing" card showing the most recent album + random song highlight. Keep the unique bento cards (Music, Members, Awards, Concerts).

- [ ] **Step 1: Replace Mood Quadrant card on Home**

In `src/components/features/sections/HomeSection/index.tsx`, replace the `{/* MOOD QUADRANT */}` BentoCard (the one with `className="lg:row-span-2 lg:col-span-1"`, approximately lines 273-362) with a "Latest Release" card:

```tsx
{/* LATEST RELEASE — col 3, rows 1+2 (tall) */}
<BentoCard
  title="Latest Release"
  metrics={[
    { value: latestAlbum?.title ?? '—', label: 'album' },
    { value: latestAlbum?.release_date?.slice(0, 4) ?? '—', label: 'year' },
  ]}
  onExplore={() => latestAlbum && onNavigate('discography', latestAlbum.id)}
  className="lg:row-span-2 lg:col-span-1"
>
  <div className="relative h-full min-h-[280px] rounded-xl overflow-hidden">
    {latestAlbum?.cover_art_url ? (
      <img
        src={latestAlbum.cover_art_url}
        alt={latestAlbum.title}
        className="w-full h-full object-cover opacity-80"
        loading="lazy"
      />
    ) : (
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${latestAlbum?.cover_color || '#A855F7'}60, ${latestAlbum?.cover_color || '#A855F7'}10)`,
        }}
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
    <div className="absolute bottom-4 left-4 right-4">
      <p className="text-lg font-bold text-white">{latestAlbum?.title}</p>
      {latestAlbum?.era && (
        <p className="text-xs text-white/60 mt-1">{latestAlbum.era} era</p>
      )}
    </div>
  </div>
</BentoCard>
```

- [ ] **Step 2: Add latestAlbum computed value**

Add this near the other useMemo blocks (around line 60):

```typescript
const latestAlbum = useMemo(
  () => [...albums].sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))[0] ?? null,
  [albums],
);
```

- [ ] **Step 3: Remove unused scatter/sentiment imports**

Remove the `ScatterChart`, `Scatter`, `Cell` imports from recharts and the `getSentimentColor` import if they're no longer used by any remaining card.

Remove the `scatterData` and `topSentiment` useMemo blocks.

- [ ] **Step 4: Kill the explanatory text in AudioExplorer**

In `src/components/features/sections/AnalyticsSection/AudioExplorer.tsx`, replace line 99:
```
<p className="text-xs text-white/35 mb-3">Each dot is a song — tap to see title, sentiment, and audio values.</p>
```
with nothing — delete the line. The chart's axis labels and tooltips are self-explanatory.

Also delete the `moodSummary` paragraph (lines 100-106) — that entire "Mapping N songs by valence..." block. The chart already shows this.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "fix: replace duplicate Mood Quadrant with Latest Release card, kill explanatory text"
```

---

### Task 4: Humanize Remaining Copy

**Files:**
- Modify: `src/components/features/sections/SearchSection.tsx`
- Modify: `src/components/features/sections/AnalyticsSection/QAPanel.tsx`
- Modify: `src/components/features/sections/AnalyticsSection/SongRecommender.tsx`
- Modify: `src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Fix EmptyState descriptions to be terse**

In `src/components/features/sections/AnalyticsSection/SongRecommender.tsx`, find the EmptyState for pre-selection and change description from:
```
"We'll suggest 8 tracks with similar energy, mood, danceability, and acoustic character — and show a side-by-side radar of the closest match."
```
to:
```
"Pick a song. We'll find 8 that sound like it."
```

And for no-results, change from:
```
"This track's audio profile is unusual in the catalog. Try another song."
```
to:
```
"Nothing close. Try a different track."
```

- [ ] **Step 2: Fix QAPanel empty state**

In `src/components/features/sections/AnalyticsSection/QAPanel.tsx`, find the EmptyState description:
```tsx
<>
  Try natural questions like <em>"Who has the most KOMCA credits?"</em> or
  {' '}<em>"What were their Grammy nominations?"</em> — or tap a suggestion above.
</>
```
Replace with:
```
"Type a question or tap a suggestion."
```

- [ ] **Step 3: Fix Search empty states**

In `src/components/features/sections/SearchSection.tsx`, find the EmptyState descriptions and simplify:

No-results description: change from `'Try a different spelling, a mood pill above, or a broader term.'` to `'Try different words or pick a mood above.'`

Default description: change from `'Search songs, albums, members, awards, concerts — or pick a mood to explore by vibe.'` to `'Songs, albums, members, moods.'`

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "fix: humanize empty states — terse, no em-dashes, no 'explore'"
```

---

### Task 5: Section-Specific Accent Colors (Concert Spotlight Feel)

**Files:**
- Modify: `src/constants/colors.ts`
- Modify: `src/components/features/sections/AwardsSection/index.tsx`
- Modify: `src/components/features/sections/ToursSection/index.tsx`

Instead of purple everywhere, each section gets its own "spotlight color" — like concert stage lights switching color per act.

- [ ] **Step 1: Add section accent colors to constants**

In `src/constants/colors.ts`, add after `SENTIMENT_COLORS`:

```typescript
/**
 * Section-specific accent colors — each section has its own concert spotlight.
 * Purple remains the brand color; these are section highlights only.
 */
export const SECTION_ACCENTS = {
  overview: '#A855F7',     // purple — brand home
  discography: '#818CF8',  // indigo — musical
  members: '#EC4899',      // pink — personality
  analytics: '#06B6D4',    // cyan — data/tech
  awards: '#FBBF24',       // gold — trophies
  tours: '#10B981',        // emerald — global/travel
  media: '#F97316',        // orange — visual/creative
  search: '#A855F7',       // purple — brand
} as const;
```

- [ ] **Step 2: Apply gold accent to Awards**

In `src/components/features/sections/AwardsSection/index.tsx`, find any hardcoded `purple-500` classes in tab buttons or active states and replace with `amber-500` / `yellow-500` equivalents. Specifically:
- Active tab: `bg-purple-500/10 text-white border border-purple-500/30` → `bg-amber-500/10 text-white border border-amber-500/30`
- Tab hover: `hover:text-white/70` stays

- [ ] **Step 3: Apply emerald accent to Tours**

In `src/components/features/sections/ToursSection/index.tsx`, find the active tab class:
```
bg-purple-500/10 text-white border border-purple-500/30
```
Replace with:
```
bg-emerald-500/10 text-white border border-emerald-500/30
```
Also update the focus ring from `ring-purple-500/50` to `ring-emerald-500/50`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: section-specific accent colors — gold awards, emerald tours, concert spotlight feel"
```

---

### Task 6: Concert Lighting Effects — ARMY Bomb Glow + Member Spotlights

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx` (background glow)
- Modify: `src/components/features/sections/HomeSection/StatCard.tsx`
- Modify: `src/components/features/sections/HomeSection/BentoCard.tsx`

This is the big visual shift. The dashboard background gets a subtle animated glow that shifts through member colors (like concert stage lights), and cards get a warmer, less glass-morphism treatment.

- [ ] **Step 1: Add concert glow keyframe to index.css**

In `src/index.css`, add a new keyframe animation. Place it in the KEYFRAME ANIMATIONS section:

```css
/**
 * Concert spotlight — cycles through member colors as a soft ambient glow.
 * Like ARMY bombs shifting color in unison during a concert.
 */
@keyframes concert-glow {
  0%, 100% { background-color: rgba(168, 85, 247, 0.04); }   /* purple */
  14% { background-color: rgba(37, 99, 235, 0.04); }          /* RM blue */
  28% { background-color: rgba(236, 72, 153, 0.04); }         /* Jin pink */
  42% { background-color: rgba(16, 185, 129, 0.04); }         /* SUGA green */
  56% { background-color: rgba(239, 68, 68, 0.04); }          /* j-hope red */
  70% { background-color: rgba(245, 158, 11, 0.04); }         /* Jimin gold */
  84% { background-color: rgba(139, 92, 246, 0.04); }         /* JK purple */
}

.concert-bg {
  animation: concert-glow 42s ease-in-out infinite;
}
```

- [ ] **Step 2: Apply concert-bg to main content area**

In `src/App.tsx`, find the `<main>` element with `id="main-content"` and add the `concert-bg` class:

```tsx
<main
  id="main-content"
  tabIndex={-1}
  className="flex-1 p-4 md:p-8 pb-16 overflow-y-auto relative pretty-scrollbar focus:outline-none concert-bg"
>
```

- [ ] **Step 3: Replace the static purple radial blur**

In `src/App.tsx`, find the Dashboard Background div (the one with `radial-gradient(circle, #A855F7 0%, transparent 70%)`). Replace the static purple blob with a more dynamic, warmer treatment:

```tsx
{/* Dashboard Background — concert venue ambient */}
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  <div className="absolute top-[15%] right-[5%] w-[35%] h-[35%] rounded-full opacity-[0.03]"
    style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)', filter: 'blur(80px)' }} />
  <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full opacity-[0.03]"
    style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)', filter: 'blur(80px)' }} />
</div>
```

Two colored blobs (pink + blue) instead of one purple = more depth, less template.

- [ ] **Step 4: Warm up StatCard**

In `src/components/features/sections/HomeSection/StatCard.tsx`, find the card's outer container class. Replace uniform glass bg with a slightly warmer treatment that uses the `accent` prop color for a faint top-border glow:

Add this to the card's style attribute:
```
borderTop: `2px solid ${accent || '#A855F7'}20`
```

This gives each stat card a subtle colored top border — like individual spotlights on a stage.

- [ ] **Step 5: Warm up BentoCard hover**

In `src/components/features/sections/HomeSection/BentoCard.tsx`, find the hover effect. If it uses `hover:border-purple-500/20`, change to `hover:border-white/15` — neutral hover instead of always-purple.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: concert lighting — ARMY bomb glow cycle, member spotlight colors, warm venue ambient"
```

---

## Execution Notes

- **Each task is independently committable** — if you stop mid-plan, the app still works.
- **Task order matters for tasks 1-4** (copy first, then layout, then visuals) but 5-6 can run in parallel.
- **Test after each commit:** `npm run dev` and visually inspect the changed section.
- **The concert-glow animation (Task 6) is subtle by design** — 0.04 opacity, 42s cycle. It should feel like a venue's ambient lighting, not a disco ball. User can increase opacity later.

## Post-Plan: Items 7-8 (Deferred)

After tasks 1-6 land, reassess whether items 7 (reduce uppercase tracking-wider) and 8 (reduce tech-demo effects) are still needed given the concert aesthetic. The concert theme may actually justify some of those effects — glowing borders become stage lights, uppercase labels become event signage.
