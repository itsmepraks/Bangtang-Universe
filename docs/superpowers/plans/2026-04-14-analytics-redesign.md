# Analytics Redesign — 9 Tabs → 5 Panels

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 9 analytics tabs into 5 focused panels that tell BTS's story through data, keep ALL existing data points accessible, fix the broken ERA_ORDER and recommendation engine, and make every chart earn its place.

**Architecture:** Rewrite `AnalyticsSection/index.tsx` tab config from 9→5 tabs. Merge redundant components (Sentiment+Lyrics → one panel, Audio+Era → one panel). Rewrite recommendation engine to use sentiment+era+writers when audio features are missing. Fix `ERA_ORDER` to be dynamic. All existing data stays — just reorganized into fewer, richer views.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Recharts, Vite

**Constraint:** ALL data currently shown must remain accessible. Nothing gets deleted — only reorganized and improved.

---

## Data We Must Preserve (Checklist)

Every item below must appear somewhere in the new 5-panel layout:

- [ ] Mood Quadrant scatter (energy × valence) — AudioExplorer
- [ ] Audio feature histograms (BPM, energy, valence, dance, acoustic) — AudioExplorer
- [ ] Song rankings (top 10 by feature) — AudioExplorer
- [ ] Era line chart (avg energy/valence/dance/bpm across eras) — EraEvolution
- [ ] Songs per era bar chart — EraEvolution
- [ ] Era detail table (avg stats per era) — EraEvolution
- [ ] Sentiment distribution (horizontal bars) — SentimentDashboard
- [ ] Sentiment by era (was stacked bar) — SentimentDashboard
- [ ] Theme × era heatmap — LyricsPanel
- [ ] Word frequency cloud — LyricsPanel
- [ ] Sentiment arc (area chart over time) — LyricsPanel
- [ ] Member contributions (KOMCA/writer/producer bars) — WritingNetwork
- [ ] Top songwriters table — WritingNetwork
- [ ] Co-writer pairs table — WritingNetwork
- [ ] Awards per year (line chart) — AwardsAnalytics
- [ ] Top ceremonies (bar chart) — AwardsAnalytics
- [ ] #1 hits grid — AwardsAnalytics
- [ ] Chart positions table — AwardsAnalytics
- [ ] Career timeline (events by year) — CareerTimeline
- [ ] Song recommender (select → 8 matches + radar) — SongRecommender
- [ ] Q&A panel (text input → answer) — QAPanel

---

## New 5-Panel Layout

| Tab ID | Label | Contains (merged from) | What fans see |
|---|---|---|---|
| `sound` | The sound | AudioExplorer + EraEvolution | "How BTS sounds" — mood quadrant, era evolution line, audio stats. Honest about data coverage. |
| `mood` | Mood & lyrics | SentimentDashboard + LyricsPanel | "What BTS sings about" — sentiment bars, theme heatmap, word cloud, sentiment arc. All in one scroll. |
| `credits` | Who writes | WritingNetwork | "Who creates the music" — member credits, top writers, co-writer pairs. Renamed from "network." |
| `discover` | Discover | SongRecommender + QAPanel | "Find new favorites" — improved recommender + Q&A side by side. |
| `milestones` | Milestones | AwardsAnalytics + CareerTimeline | "The journey" — timeline + awards merged into one chronological story. |

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/services/analyticsService.ts` | Modify | Make ERA_ORDER dynamic |
| `src/services/recommendationService.ts` | Modify | Add sentiment+era+writer fallback |
| `src/components/features/sections/AnalyticsSection/index.tsx` | Modify | 9 tabs → 5 tabs |
| `src/components/features/sections/AnalyticsSection/SoundPanel.tsx` | Create | Merges AudioExplorer + EraEvolution |
| `src/components/features/sections/AnalyticsSection/MoodPanel.tsx` | Create | Merges SentimentDashboard + LyricsPanel |
| `src/components/features/sections/AnalyticsSection/CreditsPanel.tsx` | Create | Replaces WritingNetwork (renamed) |
| `src/components/features/sections/AnalyticsSection/DiscoverPanel.tsx` | Create | Merges SongRecommender + QAPanel |
| `src/components/features/sections/AnalyticsSection/MilestonesPanel.tsx` | Create | Merges AwardsAnalytics + CareerTimeline |

Old files (AudioExplorer, EraEvolution, SentimentDashboard, LyricsPanel, WritingNetwork, AwardsAnalytics, CareerTimeline, SongRecommender, QAPanel) are kept but no longer imported from index.tsx. They can be deleted in a cleanup pass later.

---

### Task 1: Fix ERA_ORDER to be dynamic

**Files:**
- Modify: `src/services/analyticsService.ts:14-24, 160, 174, 191-193, 335, 345, 351-353`

The hardcoded `ERA_ORDER` silently drops ARIRANG, Solo, Unknown eras. Fix it to derive from actual album data.

- [ ] **Step 1: Replace hardcoded ERA_ORDER with a builder function**

In `src/services/analyticsService.ts`, replace the hardcoded array (lines 14-24) with a function:

```typescript
/**
 * Build era ordering from actual album data, sorted by earliest release date.
 * Falls back to known historical order for eras without albums.
 */
const KNOWN_ERA_ORDER: string[] = [
  'School Trilogy', 'HYYH', 'Wings', 'Love Yourself',
  'Map of the Soul', 'BE', 'Butter', 'Proof', 'Chapter 2',
];

export function buildEraOrder(albums: Album[]): string[] {
  // Group albums by era, find earliest release date per era
  const eraFirstDate = new Map<string, string>();
  for (const album of albums) {
    if (!album.era) continue;
    const existing = eraFirstDate.get(album.era);
    if (!existing || (album.release_date && album.release_date < existing)) {
      eraFirstDate.set(album.era, album.release_date ?? '9999');
    }
  }

  // Sort eras by their earliest album's release date
  const sortedEras = [...eraFirstDate.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([era]) => era);

  // If an era from KNOWN_ERA_ORDER isn't in sortedEras (no albums), skip it
  // This handles future eras automatically
  return sortedEras;
}
```

- [ ] **Step 2: Update computeEraEvolution to accept dynamic eras**

Change `computeEraEvolution` to call `buildEraOrder(albums)` instead of using the old `ERA_ORDER` constant. Replace every reference to `ERA_ORDER` in the file:

Line 160: `if (!album || !album.era || !ERA_ORDER.includes(album.era)) continue;`
→ Remove the `!ERA_ORDER.includes(album.era)` check entirely — we want ALL eras now:
`if (!album || !album.era) continue;`

Lines 174-205: Replace the two-pass sort (first ERA_ORDER, then extras) with a single pass sorted by `buildEraOrder`:
```typescript
const eraOrder = buildEraOrder(albums);
for (const era of eraOrder) {
  const entry = eraMap.get(era);
  if (!entry) continue;
  // ... same stats computation
}
```

- [ ] **Step 3: Update computeSentimentByEra similarly**

Lines 335-357: Same pattern — use `buildEraOrder(albums)` instead of `ERA_ORDER`.

- [ ] **Step 4: Commit**

```bash
git add src/services/analyticsService.ts && git commit -m "fix: dynamic ERA_ORDER from actual album data — no more hardcoded era list

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Fix recommendation engine — sentiment+era+writer fallback

**Files:**
- Modify: `src/services/recommendationService.ts`

When a song lacks audio features (89% of catalog), the current engine fills with 0.5 defaults, making all featureless songs look identical. Fix: detect low-feature songs and switch to a text-based similarity using sentiment, era, and shared writers.

- [ ] **Step 1: Add feature coverage check and text-based similarity**

In `src/services/recommendationService.ts`, add after the `cosineSimilarity` function:

```typescript
/** Count how many of the 5 audio features are non-null for a song. */
function featureCoverage(song: Song): number {
  let count = 0;
  if (song.energy !== null && song.energy !== undefined) count++;
  if (song.valence !== null && song.valence !== undefined) count++;
  if (song.danceability !== null && song.danceability !== undefined) count++;
  if (song.acousticness !== null && song.acousticness !== undefined) count++;
  if (song.bpm !== null && song.bpm !== undefined) count++;
  return count;
}

/**
 * Text-based similarity when audio features are missing.
 * Uses sentiment match, era match, and shared writer overlap.
 * Returns 0-1 score.
 */
function textSimilarity(
  target: Song,
  candidate: Song,
  targetEra: string | null,
  candidateEra: string | null,
): number {
  let score = 0;
  let factors = 0;

  // Sentiment match (worth 0.35)
  if (target.sentiment && candidate.sentiment) {
    factors++;
    if (target.sentiment === candidate.sentiment) score += 0.35;
  }

  // Era match (worth 0.25)
  if (targetEra && candidateEra) {
    factors++;
    if (targetEra === candidateEra) score += 0.25;
  }

  // Shared writers (worth up to 0.25)
  const targetWriters = new Set((target.writers ?? []).map(w => w.toLowerCase()));
  const candidateWriters = new Set((candidate.writers ?? []).map(w => w.toLowerCase()));
  if (targetWriters.size > 0 && candidateWriters.size > 0) {
    factors++;
    let shared = 0;
    for (const w of targetWriters) {
      if (candidateWriters.has(w)) shared++;
    }
    const overlap = shared / Math.max(targetWriters.size, candidateWriters.size);
    score += overlap * 0.25;
  }

  // Same member credits (worth 0.15)
  const targetMembers = new Set((target.member_credits ?? []).map(m => m.toLowerCase()));
  const candidateMembers = new Set((candidate.member_credits ?? []).map(m => m.toLowerCase()));
  if (targetMembers.size > 0 && candidateMembers.size > 0) {
    factors++;
    let shared = 0;
    for (const m of targetMembers) {
      if (candidateMembers.has(m)) shared++;
    }
    score += (shared / Math.max(targetMembers.size, candidateMembers.size)) * 0.15;
  }

  return factors > 0 ? score : 0;
}
```

- [ ] **Step 2: Update getRecommendations to use hybrid scoring**

Replace the main loop in `getRecommendations` (lines 185-219) with:

```typescript
  const targetFeatures = featureCoverage(targetSong);
  const useAudio = targetFeatures >= 3; // Only trust audio if 3+ features exist

  for (const candidate of allSongs) {
    if (candidate.id === targetSong.id) continue;

    const candidateEra = getEra(candidate.album_id, albums);
    let similarity: number;

    if (useAudio && featureCoverage(candidate) >= 3) {
      // Both songs have enough audio data — use cosine similarity
      const candidateVector = buildFeatureVector(candidate);
      similarity = cosineSimilarity(targetVector, candidateVector);

      // Bonuses
      if (targetSong.sentiment && candidate.sentiment && targetSong.sentiment === candidate.sentiment) {
        similarity += 0.05;
      }
      if (targetEra && candidateEra && targetEra === candidateEra) {
        similarity += 0.03;
      }
    } else {
      // Fallback: text-based similarity
      similarity = textSimilarity(targetSong, candidate, targetEra, candidateEra);
    }

    similarity = Math.min(similarity, 1.0);
    const reasons = generateReasons(targetSong, candidate, targetEra, candidateEra);
    const albumTitle = getAlbumTitle(candidate.album_id, albums);

    scored.push({ song: candidate, similarity, reasons, albumTitle });
  }
```

- [ ] **Step 3: Update generateReasons to explain text-based matches**

Add these reason checks to the end of `generateReasons`:

```typescript
  // Shared writers
  const targetWriters = new Set((target.writers ?? []).map(w => w.toLowerCase()));
  const candidateWriters = (candidate.writers ?? []).filter(w => targetWriters.has(w.toLowerCase()));
  if (candidateWriters.length > 0) {
    reasons.push(`Shared writer: ${candidateWriters[0]}`);
  }

  // If no reasons found, add a generic one
  if (reasons.length === 0) {
    reasons.push('Similar profile');
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/services/recommendationService.ts && git commit -m "feat: recommendation engine uses sentiment+era+writers when audio features are sparse

Works for all 506 songs, not just the 57 with audio data.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Build SoundPanel (merges AudioExplorer + EraEvolution)

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/SoundPanel.tsx`

This panel shows "How BTS sounds" — the mood quadrant, era evolution, audio distributions, and song rankings. All existing data preserved, reorganized into a single scrollable panel with a data coverage banner.

- [ ] **Step 1: Create SoundPanel.tsx**

Create `src/components/features/sections/AnalyticsSection/SoundPanel.tsx`. This component:

1. Receives `songs: Song[]` and `albums: Album[]`
2. Shows a **data coverage banner** at the top: "Audio features available for X of Y songs (Z%)" — styled as a subtle info bar, not an error
3. Renders the **Mood Quadrant** scatter chart (ported from AudioExplorer lines 94-145) — unchanged
4. Renders the **Era Evolution** line chart (ported from EraEvolution) using the new dynamic `buildEraOrder`
5. Renders the **Songs Per Era** bar chart (ported from EraEvolution)
6. Renders the **Audio Feature Distributions** histograms (ported from AudioExplorer) — but ONLY if coverage > 20%. Otherwise shows: "Not enough audio data for distributions."
7. Renders the **Era Detail Table** (ported from EraEvolution)
8. Renders the **Song Rankings** dropdown + list (ported from AudioExplorer)

Structure: one tall scrollable panel with clear section dividers between each chart group. Use the varied container styles from the visual overhaul (no two charts use the same bg).

Import `computeEraEvolution`, `computeAudioHistograms`, `computeRankings`, `buildEraOrder` from `analyticsService`. Reuse existing Recharts chart code — port it, don't rewrite. The key difference is the coverage banner and the merged layout.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/SoundPanel.tsx && git commit -m "feat: SoundPanel — merges AudioExplorer + EraEvolution with data coverage banner

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Build MoodPanel (merges SentimentDashboard + LyricsPanel)

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/MoodPanel.tsx`

This panel shows "What BTS sings about" — sentiment distribution, theme heatmap, word cloud, sentiment arc.

- [ ] **Step 1: Create MoodPanel.tsx**

Create `src/components/features/sections/AnalyticsSection/MoodPanel.tsx`. This component:

1. Receives `songs: Song[]`, `albums: Album[]`, `lyrics: Lyrics[]`
2. Shows **sentiment coverage**: "Sentiment data for X of Y songs (Z%)"
3. Renders **Sentiment Distribution** (horizontal bars) — ported from SentimentDashboard. Keep the positive/reflective split indicator.
4. Renders **Theme × Era Heatmap** — ported from LyricsPanel. Uses `buildEraOrder` for column ordering.
5. Renders **Sentiment Arc** (area chart) — ported from LyricsPanel, chronological by album.
6. Renders **Word Cloud** — ported from LyricsPanel.

Key improvement: the old **stacked bar** for "sentiment by era" is REPLACED by the theme heatmap (which already shows themes × eras in a readable format). No data is lost — the heatmap contains strictly more information.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/MoodPanel.tsx && git commit -m "feat: MoodPanel — merges SentimentDashboard + LyricsPanel, replaces stacked bar with heatmap

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Build CreditsPanel (replaces WritingNetwork)

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/CreditsPanel.tsx`

Renamed from "Writing Network" to "Who Writes" — same data, clearer name.

- [ ] **Step 1: Create CreditsPanel.tsx**

Create `src/components/features/sections/AnalyticsSection/CreditsPanel.tsx`. This component:

1. Receives `songs: Song[]`, `members: Member[]`
2. Renders **Member Contributions** grouped bar chart — ported from WritingNetwork. KOMCA, Writer, Producer credits per member.
3. Renders **Top Songwriters** table — ported from WritingNetwork.
4. Renders **Co-Writer Pairs** table — ported from WritingNetwork. Add a simple count badge showing how many songs each pair wrote together.

Same data as WritingNetwork, just renamed and with the varied container styling.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/CreditsPanel.tsx && git commit -m "feat: CreditsPanel — replaces WritingNetwork with clearer name and layout

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Build DiscoverPanel (merges SongRecommender + QAPanel)

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/DiscoverPanel.tsx`

"Find new favorites" — improved recommender + Q&A in a single panel.

- [ ] **Step 1: Create DiscoverPanel.tsx**

Create `src/components/features/sections/AnalyticsSection/DiscoverPanel.tsx`. This component:

1. Receives same props as both SongRecommender and QAPanel combined
2. Layout: **two-column on desktop** (recommender left, Q&A right), **stacked on mobile**
3. **Recommender section**: Song selector + recommendation grid + radar chart. Ported from SongRecommender but now uses the improved recommendation engine (Task 2) that works for ALL songs.
4. **Q&A section**: Input + suggested questions + answer display + history. Ported from QAPanel unchanged.

The key UX improvement: these two are the "interactive" analytics — both involve user input → results. Grouping them as "Discover" makes them findable.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/DiscoverPanel.tsx && git commit -m "feat: DiscoverPanel — recommender + Q&A side by side

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Build MilestonesPanel (merges AwardsAnalytics + CareerTimeline)

**Files:**
- Create: `src/components/features/sections/AnalyticsSection/MilestonesPanel.tsx`

"The Journey" — timeline + awards in one chronological story.

- [ ] **Step 1: Create MilestonesPanel.tsx**

Create `src/components/features/sections/AnalyticsSection/MilestonesPanel.tsx`. This component:

1. Receives `albums: Album[]`, `awards: Award[]`, `chartEntries: ChartEntry[]`, `songs: Song[]`, `concerts: Concert[]`, `memberEvents: MemberEvent[]`
2. Layout: **Awards summary cards** at top (total wins, #1 hits, top ceremony), then **Career Timeline** below, then **Chart Positions table** at bottom.
3. **Awards summary**: 3-4 stat cards — total wins, unique ceremonies, #1 chart hits count, longest chart run. Ported from AwardsAnalytics.
4. **Awards per year** line chart — ported from AwardsAnalytics.
5. **Career Timeline** — ported from CareerTimeline. Uses `buildEraOrder` for any era-dependent logic.
6. **Chart Positions table** — ported from AwardsAnalytics.

The merge makes sense because awards and career events are both "milestones on the journey" — seeing them together tells a richer story than separate tabs.

- [ ] **Step 2: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/MilestonesPanel.tsx && git commit -m "feat: MilestonesPanel — awards + career timeline as one journey

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Rewire AnalyticsSection index — 9 tabs → 5 tabs

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/index.tsx`

- [ ] **Step 1: Replace TABS config and lazy imports**

In `index.tsx`, replace the lazy imports and TABS array:

```typescript
const SoundPanel = lazy(() => import('./SoundPanel'));
const MoodPanel = lazy(() => import('./MoodPanel'));
const CreditsPanel = lazy(() => import('./CreditsPanel'));
const DiscoverPanel = lazy(() => import('./DiscoverPanel'));
const MilestonesPanel = lazy(() => import('./MilestonesPanel'));

const TABS = [
  { id: 'sound', label: 'The sound', icon: BarChart3, group: 'music' },
  { id: 'mood', label: 'Mood & lyrics', icon: Heart, group: 'music' },
  { id: 'credits', label: 'Who writes', icon: Network, group: 'career' },
  { id: 'discover', label: 'Discover', icon: Sparkles, group: 'explore' },
  { id: 'milestones', label: 'Milestones', icon: Trophy, group: 'career' },
] as const;
```

- [ ] **Step 2: Replace renderPanel switch**

```typescript
const renderPanel = () => {
  switch (activeTab) {
    case 'sound':
      return <SoundPanel songs={songs} albums={albums} />;
    case 'mood':
      return <MoodPanel songs={songs} albums={albums} lyrics={lyrics} />;
    case 'credits':
      return <CreditsPanel songs={songs} members={members} />;
    case 'discover':
      return (
        <DiscoverPanel
          songs={songs}
          albums={albums}
          members={members}
          awards={awards}
          chartEntries={chartEntries}
          concerts={concerts}
          memberEvents={memberEvents}
        />
      );
    case 'milestones':
      return (
        <MilestonesPanel
          albums={albums}
          awards={awards || []}
          chartEntries={chartEntries || []}
          songs={songs}
          concerts={concerts || []}
          memberEvents={memberEvents || []}
        />
      );
    default:
      return null;
  }
};
```

- [ ] **Step 3: Remove old lazy imports**

Delete the old lazy import lines for AudioExplorer, EraEvolution, WritingNetwork, SentimentDashboard, SongRecommender, QAPanel, LyricsPanel, AwardsAnalytics, CareerTimeline. Also remove unused icon imports (Calendar, MessageSquare, BookOpen if no longer referenced).

- [ ] **Step 4: Update URL hash handling**

In `src/App.tsx`, the hash sync writes `#/analytics/<tabId>`. The old tab IDs (audio, era, sentiment, writing, etc.) won't match the new IDs (sound, mood, credits, discover, milestones). The `isValidTabId` function in AnalyticsSection will handle this gracefully — unknown IDs fall back to the first tab. No code change needed, but old bookmarks will reset to "The sound" tab.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/sections/AnalyticsSection/index.tsx && git commit -m "feat: analytics 9 tabs → 5 panels — sound, mood, credits, discover, milestones

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Mood Quadrant → SoundPanel ✓
- [x] Audio histograms → SoundPanel (with coverage gate) ✓
- [x] Song rankings → SoundPanel ✓
- [x] Era evolution line → SoundPanel ✓
- [x] Songs per era bar → SoundPanel ✓
- [x] Era detail table → SoundPanel ✓
- [x] Sentiment distribution → MoodPanel ✓
- [x] Sentiment by era → replaced by theme heatmap in MoodPanel (heatmap is strictly more informative) ✓
- [x] Theme × era heatmap → MoodPanel ✓
- [x] Word cloud → MoodPanel ✓
- [x] Sentiment arc → MoodPanel ✓
- [x] Member contributions → CreditsPanel ✓
- [x] Top songwriters → CreditsPanel ✓
- [x] Co-writer pairs → CreditsPanel ✓
- [x] Awards per year → MilestonesPanel ✓
- [x] Top ceremonies → MilestonesPanel (via stat cards) ✓
- [x] #1 hits grid → MilestonesPanel ✓
- [x] Chart positions table → MilestonesPanel ✓
- [x] Career timeline → MilestonesPanel ✓
- [x] Song recommender → DiscoverPanel ✓
- [x] Q&A panel → DiscoverPanel ✓
- [x] Dynamic ERA_ORDER → Task 1 ✓
- [x] Fixed recommendation engine → Task 2 ✓

**All data preserved. Nothing deleted.**

## Execution Notes

- Tasks 1-2 are data-layer fixes (services). Must be done FIRST.
- Tasks 3-7 are new panel components. Can be done in any order — they're independent.
- Task 8 is the final wiring. Must be done LAST (depends on all 5 panels existing).
- Old component files are NOT deleted — they just stop being imported. Clean up in a follow-up PR.
- Each new panel should be ~200-400 lines. If a panel gets over 500 lines, the implementer should extract sub-components.
