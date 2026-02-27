# Overview Bento Grid Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the uniform 6-card overview with a bento-grid dashboard — 4 cards of unequal sizes each containing a real recharts chart and 2–3 metric chips, inspired by a compact dark analytics dashboard aesthetic.

**Architecture:** New `BentoCard` reusable shell replaces `SectionCard`. `HomeSection/index.tsx` is rewritten with a 3-column CSS grid (Music top-left, Members top-middle, Mood Quadrant tall-right spanning 2 rows, Awards wide bottom spanning 2 cols). All data already computed by `analyticsService.ts`; recharts is already installed.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, recharts, lucide-react

---

### Task 1: Create BentoCard component

**Files:**
- Create: `src/components/features/sections/HomeSection/BentoCard.tsx`

**Step 1: Create the file with this exact content**

```tsx
import type { ReactNode } from 'react';

interface MetricChip {
  value: string | number;
  label: string;
}

interface BentoCardProps {
  title: string;
  metrics: MetricChip[];
  onExplore?: () => void;
  children: ReactNode;
  className?: string;
}

export default function BentoCard({
  title,
  metrics,
  onExplore,
  children,
  className = '',
}: BentoCardProps) {
  return (
    <div
      className={`bg-[#0e0e14] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.10] transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">
          {title}
        </span>
        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            aria-label={`Explore ${title}`}
            className="text-white/20 hover:text-purple-400/70 transition-colors duration-200 text-sm leading-none"
          >
            {'\u2192'}
          </button>
        )}
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-2xl font-bold text-white/95 tabular-nums leading-none">
              {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide mt-1">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart slot */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
```

**Step 2: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/sections/HomeSection/BentoCard.tsx
git commit -m "feat: add BentoCard component for bento grid overview"
```

---

### Task 2: Rewrite HomeSection/index.tsx with bento grid

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx`

**Context for the implementer:**
- `recharts` is already installed. Currently used components: `ScatterChart`, `Scatter`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `BarChart`, `Bar`, `CartesianGrid`, `Cell` — all in `AudioExplorer.tsx`. You need to also import `AreaChart` and `Area` which are in recharts but not yet used elsewhere.
- `CHART_STYLES` is exported from `src/constants/colors.ts` — use it for consistent tooltip and grid styling.
- `computeEraEvolution` returns `EraStats[]` with fields: `era: string`, `avgEnergy: number`, `avgValence: number`, `songCount: number`.
- `computeMemberContributions` returns `MemberContribution[]` sorted by `komcaCredits` desc, fields: `stageName: string`, `color: string`, `komcaCredits: number`.
- `getSentimentColor(sentiment: string): string` maps sentiment name → hex color.
- The bento grid uses CSS Grid auto-placement. Render order matters: Music → Members → Mood → Awards. Mood gets `lg:row-span-2`, Awards gets `lg:col-span-2`. Auto-placement fills the grid correctly in this order.

**Step 1: Replace the entire file with this content**

```tsx
import { useMemo } from 'react';
import { Music, Disc, Users, PenTool, Trophy, MapPin } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { Song, Album, Member, Award, Concert } from '../../../../types/database';
import type { DashboardSection } from '../../../../types/index';
import StatCard from './StatCard';
import BentoCard from './BentoCard';
import {
  computeEraEvolution,
  computeMemberContributions,
} from '../../../../services/analyticsService';
import { getSentimentColor, CHART_STYLES } from '../../../../constants/colors';

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards: Award[];
  concerts: Concert[];
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
}

export default function HomeSection({
  songs,
  albums,
  members,
  awards,
  concerts,
  onNavigate,
}: HomeSectionProps) {
  // ── Stats strip ───────────────────────────────────────────────
  const eras = useMemo(
    () => [...new Set(albums.map((a) => a.era).filter(Boolean))],
    [albums],
  );
  const totalKomca = useMemo(
    () => members.reduce((sum, m) => sum + (m.komca_credits || 0), 0),
    [members],
  );
  const awardsWon = useMemo(() => awards.filter((a) => a.result === 'won').length, [awards]);
  const uniqueTours = useMemo(
    () => new Set(concerts.map((c) => c.tour_name)).size,
    [concerts],
  );

  // ── MUSIC card ────────────────────────────────────────────────
  const eraStats = useMemo(() => computeEraEvolution(songs, albums), [songs, albums]);
  const musicChartData = useMemo(
    () =>
      eraStats.map((e) => ({
        era: e.era.split(' ')[0], // shorten: "Love Yourself" → "Love"
        energy: e.avgEnergy,
        valence: e.avgValence,
      })),
    [eraStats],
  );
  const titleTracksCount = useMemo(
    () => songs.filter((s) => s.is_title_track).length,
    [songs],
  );

  // ── MEMBERS card ──────────────────────────────────────────────
  const contributions = useMemo(
    () => computeMemberContributions(members, songs),
    [members, songs],
  );
  const memberChartData = useMemo(
    () => contributions.map((c) => ({ name: c.stageName, value: c.komcaCredits, color: c.color })),
    [contributions],
  );
  const topContributor = contributions[0]?.stageName ?? '—';

  // ── MOOD card ─────────────────────────────────────────────────
  const scatterData = useMemo(
    () =>
      songs
        .filter((s) => s.valence != null && s.energy != null)
        .map((s) => ({
          valence: s.valence as number,
          energy: s.energy as number,
          sentiment: s.sentiment ?? 'Unknown',
          color: getSentimentColor(s.sentiment ?? ''),
          title: s.title,
        })),
    [songs],
  );
  const topSentiment = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach((s) => {
      if (s.sentiment) counts[s.sentiment] = (counts[s.sentiment] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  }, [songs]);

  // ── AWARDS card ───────────────────────────────────────────────
  const uniqueCeremonies = useMemo(
    () => new Set(awards.map((a) => a.ceremony)).size,
    [awards],
  );
  const winsByYear = useMemo(() => {
    const map: Record<number, number> = {};
    awards
      .filter((a) => a.result === 'won')
      .forEach((a) => {
        map[a.year] = (map[a.year] || 0) + 1;
      });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({ year: `'${String(year).slice(2)}`, count }));
  }, [awards]);

  return (
    <main className="space-y-6">
      {/* ── Page title ──────────────────────────────────────────── */}
      <h1 className="text-xs font-semibold text-white/40 uppercase tracking-widest pt-1">
        Bangtan Universe
      </h1>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle={`${members.length} artists`} />
        <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" subtitle="total production" />
        <StatCard label="Awards Won" value={awardsWon} icon={Trophy} accent="#FBBF24" subtitle={`${awards.length} nominations`} />
        <StatCard label="Concerts" value={concerts.length} icon={MapPin} accent="#10B981" subtitle={`${uniqueTours} tours`} />
      </div>

      {/* ── Bento grid ──────────────────────────────────────────── */}
      {/*
        Render order is significant for CSS auto-placement:
        Music (col1,row1) → Members (col2,row1) → Mood (col3,row1+2) → Awards (col1+2,row2)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* MUSIC — col 1, row 1 */}
        <BentoCard
          title="Music"
          metrics={[
            { value: songs.length, label: 'songs' },
            { value: eras.length, label: 'eras' },
            { value: titleTracksCount, label: 'title tracks' },
          ]}
          onExplore={() => onNavigate('discography')}
        >
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={musicChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="era"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis domain={[0, 1]} tick={false} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLES.TOOLTIP} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#A855F7"
                fill="#A855F7"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
                name="Energy"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="valence"
                stroke="#C084FC"
                fill="#C084FC"
                fillOpacity={0.10}
                strokeWidth={1.5}
                dot={false}
                name="Valence"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* MEMBERS — col 2, row 1 */}
        <BentoCard
          title="Members"
          metrics={[
            { value: members.length, label: 'artists' },
            { value: totalKomca.toLocaleString(), label: 'KOMCA' },
            { value: topContributor, label: 'top writer' },
          ]}
          onExplore={() => onNavigate('members')}
        >
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={memberChartData}
              layout="vertical"
              margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
            >
              <XAxis type="number" tick={false} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip {...CHART_STYLES.TOOLTIP} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} isAnimationActive={false} name="KOMCA">
                {memberChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* MOOD QUADRANT — col 3, rows 1+2 (tall) */}
        <BentoCard
          title="Mood Quadrant"
          metrics={[
            { value: scatterData.length, label: 'songs plotted' },
            { value: topSentiment, label: 'top sentiment' },
          ]}
          onExplore={() => onNavigate('analytics')}
          className="lg:row-span-2 md:col-span-2 lg:col-span-1"
        >
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid {...CHART_STYLES.GRID} />
              <XAxis
                type="number"
                dataKey="valence"
                domain={[0, 1]}
                name="Valence"
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="energy"
                domain={[0, 1]}
                name="Energy"
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...CHART_STYLES.TOOLTIP}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload as (typeof scatterData)[number];
                  return (
                    <div style={CHART_STYLES.TOOLTIP.contentStyle}>
                      <p style={CHART_STYLES.TOOLTIP.labelStyle}>{d.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
                        {d.sentiment} · V:{d.valence.toFixed(2)} E:{d.energy.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} isAnimationActive={false}>
                {scatterData.map((entry, i) => (
                  <Cell key={`scatter-${i}`} fill={entry.color} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </BentoCard>

        {/* AWARDS — cols 1+2, row 2 (wide) */}
        <BentoCard
          title="Awards"
          metrics={[
            { value: awardsWon, label: 'won' },
            { value: awards.length - awardsWon, label: 'nominated' },
            { value: uniqueCeremonies, label: 'ceremonies' },
          ]}
          onExplore={() => onNavigate('awards')}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={winsByYear} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip {...CHART_STYLES.TOOLTIP} />
              <Bar
                dataKey="count"
                fill="#A855F7"
                fillOpacity={0.8}
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
                name="Wins"
              />
            </BarChart>
          </ResponsiveContainer>
        </BentoCard>

      </div>
    </main>
  );
}
```

**Step 2: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/sections/HomeSection/index.tsx
git commit -m "feat: redesign overview as bento grid with recharts mini-charts"
```

---

### Task 3: Delete SectionCard and push

**Files:**
- Delete: `src/components/features/sections/HomeSection/SectionCard.tsx`

**Step 1: Verify SectionCard is no longer imported anywhere**

Run: `grep -r "SectionCard" src/`
Expected: No results (if any file still imports it, fix that import first before deleting)

**Step 2: Delete via git rm**

```bash
git rm src/components/features/sections/HomeSection/SectionCard.tsx
```

**Step 3: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 4: Commit and push**

```bash
git commit -m "chore: remove SectionCard replaced by BentoCard"
git push
```
