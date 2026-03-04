# Analytics Section Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Analytics section for smooth, readable, single-click navigation with full data visibility across all screen sizes.

**Architecture:** Flat single-row scrollable tab strip (all 9 views, visually grouped) replaces the 2-level group+sub-tab system. All pill-cloud filter controls are converted to compact selects or single-row scrollable controls. Charts get breathing room, proper heights, and capped/scrollable containers. No new routes or structural rewrites — all changes are targeted file edits.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4, Recharts, Framer Motion

---

## Context for the Implementer

- Repo: `C:\Development\BTS universe`
- Branch: `main`
- No test suite — verify visually at `http://localhost:5173`
- Never run `npx tsc --noEmit` — user has declined this
- Commit without `Co-Authored-By` line
- Tailwind 4: no `tailwind.config.js`, uses `@import "tailwindcss"` in `src/index.css`
- `scrollbar-hide` is a custom utility already defined in `src/index.css`
- All analytics panels live in `src/components/features/sections/AnalyticsSection/`

---

## Task 1: Flat single-row tab navigation in AnalyticsSection/index.tsx

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/index.tsx`

**What to do:**

Replace the current 2-row layout (group pills + sub-tabs) with a single horizontal scrollable tab strip containing all 9 tabs. Tabs are separated into 3 groups with a thin `|` divider element between groups. Active tab gets a bottom border accent (not a box).

**Step 1: Replace the navigation JSX**

Current lines in `index.tsx` (the `space-y-2` block with group pills + sub-tabs):

```tsx
{/* Single-row navigation: group pills + all tabs */}
<div className="space-y-2">
  {/* Group pills — compact segmented control */}
  <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
    ...
  </div>

  {/* Sub-tabs for active group */}
  <div className="relative">
    ...
  </div>
</div>
```

Replace the entire navigation block with this:

```tsx
{/* Flat single-row tab strip */}
<div className="relative">
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
  <div
    className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide border-b border-white/[0.06]"
    role="tablist"
    aria-label="Analytics views"
  >
    {TABS.map((tab, index) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      const prevTab = TABS[index - 1];
      const showDivider = index > 0 && prevTab?.group !== tab.group;
      return (
        <div key={tab.id} className="flex items-center flex-shrink-0">
          {showDivider && (
            <span className="w-px h-4 bg-white/[0.10] mx-2 flex-shrink-0" aria-hidden="true" />
          )}
          <button
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px ${
              isActive
                ? 'text-white border-purple-500'
                : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/20'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            {tab.label}
          </button>
        </div>
      );
    })}
  </div>
</div>
```

**Step 2: Remove unused state and imports**

The `activeGroup` derived state and `GROUPS` constant are no longer needed in the render. Remove:
- The `activeGroup` useMemo
- The `GROUPS` constant definition
- The `GroupId` type (keep only if used in TABS)
- Unused imports: `Beaker`, `Users`, `Compass` (check if any remain in TABS icons — they don't, TABS uses `BarChart3`, `TrendingUp`, etc.)

Keep: `useState`, `Suspense`, `lazy`, `useMemo` (useMemo still used for renderPanel if needed, or remove)

After cleanup the component should only have:
```tsx
const [activeTab, setActiveTab] = useState<string>('audio');
```

And the TABS array stays as-is.

**Step 3: Remove the comment line added in previous session**
```tsx
// GroupId kept for TABS type alignment
```
Delete this line.

**Step 4: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/index.tsx
git commit -m "feat: analytics flat single-row tab strip with group dividers"
```

---

## Task 2: AudioExplorer — replace pill clouds with selects, fix chart spacing

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/AudioExplorer.tsx`

**What to do:**

1. Replace the 5-option Audio Feature pill row with a segmented control (≤5 fits in one row, but keep pills as scrollable row — already done in previous session, verify it looks right)
2. Replace the 8-option Song Rankings pill row with a styled `<select>` dropdown
3. Add a brief description line under each section heading

**Step 1: Replace Song Rankings pill row with a select**

Find:
```tsx
<h3 className="text-sm font-semibold text-white/70 mb-4">Song Rankings</h3>

{/* Ranking category pills */}
<div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
  {rankingCategories.map((category) => {
    const isActive = category === selectedRankingCategory;
    return (
      <button
        key={category}
        onClick={() => setSelectedRankingCategory(category)}
        className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex-shrink-0 ${
          isActive
            ? 'bg-purple-500/15 text-white border-purple-500/30'
            : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white/70'
        }`}
      >
        {category}
      </button>
    );
  })}
</div>
```

Replace with:
```tsx
<div className="flex items-center justify-between mb-4 gap-3">
  <h3 className="text-sm font-semibold text-white/70">Song Rankings</h3>
  <select
    value={selectedRankingCategory}
    onChange={(e) => setSelectedRankingCategory(e.target.value)}
    className="bg-[#111118] border border-white/[0.10] rounded-lg text-xs text-white/70 px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-purple-500/40 appearance-none pr-6 shrink-0"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
    }}
  >
    {rankingCategories.map((cat) => (
      <option key={cat} value={cat} style={{ background: '#111118' }}>{cat}</option>
    ))}
  </select>
</div>
```

**Step 2: Add descriptive subtitles to section headings**

Under "Mood Quadrant" heading add:
```tsx
<p className="text-xs text-white/35 mb-3">Each dot is a song — tap to see title, sentiment, and audio values.</p>
```

Under "Audio Feature Distributions" heading add:
```tsx
<p className="text-xs text-white/35 mb-3">How songs are distributed across each audio dimension.</p>
```

Under "Song Rankings" (now in the flex row) — add a subtitle below the heading row:
```tsx
<p className="text-xs text-white/35 mb-3">Top songs sorted by the selected audio characteristic.</p>
```

**Step 3: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/AudioExplorer.tsx
git commit -m "fix: audio explorer — rankings select dropdown, section subtitles"
```

---

## Task 3: SentimentDashboard — cap chart heights, clean badge row

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/SentimentDashboard.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/SentimentDashboard.tsx` fully before editing.

**Step 2: Cap dynamic chart heights**

Find any `Math.max(280, ...)` or `Math.max(300, ...)` dynamic height calculations.

For the Sentiment Distribution chart, cap at 360px:
```tsx
// Before:
height={Math.max(280, distribution.length * 36)}

// After:
height={Math.min(360, Math.max(220, distribution.length * 36))}
```

For the Sentiment Across Eras stacked chart, cap at 380px:
```tsx
// Before:
height={Math.max(300, eraStackedData.length * 48)}

// After:
height={Math.min(380, Math.max(240, eraStackedData.length * 48))}
```

**Step 3: Fix sentiment badges flex-wrap**

Find the flex-wrap badge/pill row rendering sentiments. Change from `flex flex-wrap gap-2` to a scrollable single row:
```tsx
// Before:
<div className="flex flex-wrap gap-2 ...">

// After:
<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 ...">
```
Add `flex-shrink-0` to each badge/button inside.

**Step 4: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/SentimentDashboard.tsx
git commit -m "fix: sentiment dashboard — cap chart heights, scrollable badge row"
```

---

## Task 4: AwardsAnalytics — fix chart YAxis, fix table columns

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx` fully.

**Step 2: Fix Top Ceremonies BarChart YAxis width**

Find the horizontal BarChart for "Top Ceremonies by Wins". The YAxis has a hardcoded `width={160}`.

Replace with a responsive approach — use `width={120}` and add `tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}` with `tickFormatter={(val: string) => val.length > 18 ? val.slice(0, 18) + '…' : val}`:

```tsx
<YAxis
  dataKey="ceremony"
  type="category"
  width={130}
  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
  tickFormatter={(val: string) => val.length > 20 ? val.slice(0, 20) + '…' : val}
  tickLine={false}
  axisLine={false}
/>
```

**Step 3: Fix Top Chart Songs table**

Find the table rendering chart song entries. Wrap it in `overflow-x-auto` if not already. Add `min-w` to columns:

```tsx
// Table wrapper:
<div className="overflow-x-auto">
  <table className="w-full min-w-[480px]">
    ...
    // Peak column th/td:
    <th className="... w-10 text-right">Peak</th>
    // Song column:
    <th className="... min-w-[140px]">Song</th>
    // Chart column:
    <th className="... min-w-[100px]">Chart</th>
    // Weeks column:
    <th className="... w-14 text-right">Wks</th>
```

**Step 4: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/AwardsAnalytics.tsx
git commit -m "fix: awards analytics — responsive YAxis, table min-widths"
```

---

## Task 5: CareerTimeline — filter pills to scrollable row, sort button inline

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/CareerTimeline.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/CareerTimeline.tsx` fully.

**Step 2: Fix filter pill row**

Find the category filter section. Change from `flex flex-wrap` to scrollable single row. Keep `flex-shrink-0` on each button.

```tsx
// Before:
<div className="flex flex-wrap items-center gap-2 ...">
  {categories.map(...)}
  <button ... className="ml-auto ...">Sort</button>  // or similar
</div>

// After — two rows: filters + sort on same line
<div className="flex items-center gap-2">
  <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-0.5">
    {categories.map(cat => (
      <button key={cat.id} ... className="... flex-shrink-0">
        ...
      </button>
    ))}
  </div>
  {/* Sort toggle stays at end */}
  <button ... className="flex-shrink-0 ...">
    ...
  </button>
</div>
```

**Step 3: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/CareerTimeline.tsx
git commit -m "fix: career timeline — scrollable filter row, sort button always visible"
```

---

## Task 6: SongRecommender — style select, radar min-height

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/SongRecommender.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/SongRecommender.tsx` fully.

**Step 2: Style the song selector `<select>`**

Find the native `<select>` for song selection. Apply consistent dark styling matching Task 2:

```tsx
<select
  value={selectedSongId ?? ''}
  onChange={(e) => setSelectedSongId(Number(e.target.value) || null)}
  className="w-full bg-[#0c0c12] border border-white/[0.10] rounded-xl text-sm text-white/80 px-4 py-3 cursor-pointer focus:outline-none focus:border-purple-500/40 appearance-none"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '36px',
  }}
>
  <option value="" style={{ background: '#0c0c12' }}>Select a song…</option>
  {songs.map(s => (
    <option key={s.id} value={s.id} style={{ background: '#0c0c12' }}>{s.title}</option>
  ))}
</select>
```

**Step 3: Add min-height to radar chart container**

Find the RadarChart ResponsiveContainer. Add a min-height wrapper:
```tsx
<div className="min-h-[260px]">
  <ResponsiveContainer width="100%" height={280}>
    ...
  </ResponsiveContainer>
</div>
```

**Step 4: Fix reason badges on recommendation cards**

Find reason badges inside recommendation cards. Change `flex flex-wrap gap-1` to scrollable row:
```tsx
<div className="flex gap-1.5 overflow-x-auto scrollbar-hide mt-2 pb-0.5">
  {rec.reasons.map((reason, i) => (
    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/15 flex-shrink-0 whitespace-nowrap">
      {reason}
    </span>
  ))}
</div>
```

**Step 5: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/SongRecommender.tsx
git commit -m "fix: song recommender — styled select, radar min-height, scrollable reason badges"
```

---

## Task 7: QAPanel — suggestion pills to scrollable row, answer table fix

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/QAPanel.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/QAPanel.tsx` fully.

**Step 2: Fix suggested questions pill cloud**

Find the suggested questions rendering (flex-wrap pills). Change to a single horizontally scrollable row:

```tsx
// Before:
<div className="flex flex-wrap gap-2 ...">

// After:
<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 ...">
```
Add `flex-shrink-0 whitespace-nowrap` to each suggestion button.

**Step 3: Fix answer ranking/list table**

Find the table rendered for `answer.type === 'ranking'` or `answer.type === 'list'`. Wrap in `overflow-x-auto` and add `min-w` to columns:

```tsx
<div className="overflow-x-auto rounded-xl border border-white/[0.06]">
  <table className="w-full min-w-[360px] text-sm">
    ...
  </table>
</div>
```

For `answer.type === 'stat'` card grid, ensure responsive:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 ...">
```

**Step 4: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/QAPanel.tsx
git commit -m "fix: Q&A panel — scrollable suggestion pills, answer table responsive"
```

---

## Task 8: LyricsPanel — improve heatmap labels, cap sentiment arc height

**Files:**
- Modify: `src/components/features/sections/AnalyticsSection/LyricsPanel.tsx`

**Step 1: Read the file first**

Read `src/components/features/sections/AnalyticsSection/LyricsPanel.tsx` fully.

**Step 2: Improve heatmap scroll container**

Find the heatmap section. Ensure the outer wrapper has a visible scroll affordance — add a subtle right-fade gradient hint:

```tsx
<div className="relative">
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111118] to-transparent pointer-events-none z-10" />
  <div className="overflow-x-auto scrollbar-hide">
    {/* heatmap grid content */}
  </div>
</div>
```

**Step 3: Cap the sentiment area chart height**

Find the AreaChart ResponsiveContainer. If height is uncapped or very large, cap at 280px:
```tsx
<ResponsiveContainer width="100%" height={280}>
```

Also ensure the X-axis angle and height work on mobile:
```tsx
<XAxis
  ...
  angle={-35}
  textAnchor="end"
  height={50}
  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
  interval="preserveStartEnd"
/>
```

**Step 4: Commit**
```bash
git add src/components/features/sections/AnalyticsSection/LyricsPanel.tsx
git commit -m "fix: lyrics panel — heatmap scroll hint, capped sentiment arc height"
```

---

## Task 9: Final build verification

**Step 1: Run the build**
```bash
npm run build
```
Expected: `✓ built in XX.XXs` with no errors. Only acceptable warning is TourMap chunk size (pre-existing).

**Step 2: Visual check at localhost:5173**

Test at 375px, 768px, 1280px in DevTools:
- [ ] Analytics tab strip: all 9 tabs in one scrollable row with dividers between groups
- [ ] AudioExplorer: Song Rankings uses select dropdown, no pill cloud
- [ ] SentimentDashboard: charts don't exceed ~380px height
- [ ] AwardsAnalytics: ceremony names truncated in YAxis, table scrolls on mobile
- [ ] CareerTimeline: filter row scrolls horizontally, sort button always visible
- [ ] SongRecommender: select styled dark, radar chart has min-height
- [ ] QAPanel: suggestions scroll horizontally, answer tables have overflow-x-auto
- [ ] LyricsPanel: heatmap has scroll fade hint, arc chart capped

**Step 3: Commit any final tweaks**
```bash
git add -A
git commit -m "fix: analytics final responsive polish pass"
```
