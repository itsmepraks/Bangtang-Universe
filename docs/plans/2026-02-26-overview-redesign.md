# Overview Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the HomeSection into a hero + stats strip + 6 uniform section cards layout so that both new and returning visitors immediately understand what the site contains and can navigate to each section.

**Architecture:** Single new component (`SectionCard.tsx`) plus a full rewrite of `HomeSection/index.tsx`. All data is already passed in as props; no new hooks or services needed. Mini-previews are CSS/div-based (no recharts).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, lucide-react icons

---

### Task 1: Create SectionCard component

**Files:**
- Create: `src/components/features/sections/HomeSection/SectionCard.tsx`

**Step 1: Create the file with this exact content**

```tsx
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  label: string;
  headline: string;
  subheadline?: string;
  onExplore: () => void;
  children: React.ReactNode;
}

export default function SectionCard({
  icon: Icon,
  label,
  headline,
  subheadline,
  onExplore,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.12] transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-white/40 group-hover:text-purple-400/60 transition-colors duration-500"
        />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Headline */}
      <div>
        <p className="text-2xl font-semibold text-white/90 leading-tight">{headline}</p>
        {subheadline && (
          <p className="text-xs text-white/40 mt-0.5">{subheadline}</p>
        )}
      </div>

      {/* Mini-preview */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Explore button */}
      <button
        type="button"
        onClick={onExplore}
        className="text-xs text-purple-400/70 hover:text-purple-300 transition-colors duration-200 text-left"
      >
        Explore →
      </button>
    </div>
  );
}
```

**Step 2: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/sections/HomeSection/SectionCard.tsx
git commit -m "feat: add SectionCard component for overview grid"
```

---

### Task 2: Rewrite HomeSection/index.tsx

**Files:**
- Modify: `src/components/features/sections/HomeSection/index.tsx`

**Step 1: Replace the entire file with the following**

Read the current file first to confirm the import list, then replace with:

```tsx
import { useMemo, useState, useEffect } from 'react';
import {
  Music,
  Disc,
  Users,
  PenTool,
  Trophy,
  MapPin,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import type { Song, Album, Member, Award, Concert, MemberEvent } from '../../../../types/database';
import type { DashboardSection } from '../../../../types/index';
import StatCard from './StatCard';
import SectionCard from './SectionCard';
import {
  computeEraEvolution,
  computeSentimentDistribution,
  generateInsights,
} from '../../../../services/analyticsService';
import { getSentimentColor } from '../../../../constants/colors';

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards: Award[];
  concerts: Concert[];
  memberEvents: MemberEvent[];
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
  // ── Top-level stats ──────────────────────────────────────────
  const eras = useMemo(
    () => [...new Set(albums.map((a) => a.era).filter(Boolean))],
    [albums],
  );
  const totalKomca = useMemo(
    () => members.reduce((sum, m) => sum + (m.komca_credits || 0), 0),
    [members],
  );
  const awardsWon = useMemo(() => awards.filter((a) => a.result === 'won').length, [awards]);
  const uniqueTours = useMemo(() => new Set(concerts.map((c) => c.tour_name)).size, [concerts]);

  // ── Music card ───────────────────────────────────────────────
  const eraStats = useMemo(() => computeEraEvolution(songs, albums), [songs, albums]);
  const eraColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    albums.forEach((a) => {
      if (a.era && a.cover_color && !map[a.era]) map[a.era] = a.cover_color;
    });
    return map;
  }, [albums]);
  const maxEraSongs = useMemo(
    () => Math.max(...eraStats.map((e) => e.songCount), 1),
    [eraStats],
  );

  // ── Analytics card ───────────────────────────────────────────
  const sentiments = useMemo(() => computeSentimentDistribution(songs), [songs]);

  // ── Concerts card ────────────────────────────────────────────
  const uniqueCountries = useMemo(
    () => new Set(concerts.map((c) => c.country)).size,
    [concerts],
  );
  const topTours = useMemo(() => {
    const map: Record<string, number> = {};
    concerts.forEach((c) => {
      map[c.tour_name] = (map[c.tour_name] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [concerts]);

  // ── Insights card ────────────────────────────────────────────
  const insights = useMemo(
    () => generateInsights(songs, albums, members, awards, concerts),
    [songs, albums, members, awards, concerts],
  );
  const [insightIdx, setInsightIdx] = useState(0);
  useEffect(() => {
    if (insights.length === 0) return;
    const timer = setInterval(
      () => setInsightIdx((i) => (i + 1) % insights.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [insights.length]);
  const currentInsight = insights[insightIdx] ?? null;

  // ── Awards card helpers ───────────────────────────────────────
  const wonPct = awards.length > 0 ? (awardsWon / awards.length) * 100 : 0;
  const nomPct = 100 - wonPct;

  return (
    <div className="space-y-8">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white/95 tracking-tight">
          Bangtan Universe
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
          A complete data archive of BTS — music, members, awards, concerts, and
          deep audio analytics across every era.
        </p>
      </div>

      {/* ── Stats Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle="7 artists" />
        <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" subtitle="total production" />
        <StatCard label="Awards Won" value={awardsWon} icon={Trophy} accent="#FBBF24" subtitle={`${awards.length} nominations`} />
        <StatCard label="Concerts" value={concerts.length} icon={MapPin} accent="#10B981" subtitle={`${uniqueTours} tours`} />
      </div>

      {/* ── Section Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Music */}
        <SectionCard
          icon={Music}
          label="Music"
          headline={`${songs.length} songs`}
          subheadline={`across ${eras.length} eras`}
          onExplore={() => onNavigate('discography')}
        >
          <div className="space-y-1.5">
            {eraStats.slice(0, 4).map((era) => (
              <div key={era.era} className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-20 shrink-0 truncate">{era.era}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(era.songCount / maxEraSongs) * 100}%`,
                      backgroundColor: eraColorMap[era.era] ?? '#A855F7',
                    }}
                  />
                </div>
                <span className="text-xs text-white/30 w-5 text-right shrink-0">
                  {era.songCount}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Members */}
        <SectionCard
          icon={Users}
          label="Members"
          headline="7 artists"
          subheadline={`${totalKomca.toLocaleString()} KOMCA credits`}
          onExplore={() => onNavigate('members')}
        >
          <div className="space-y-1.5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: m.color ?? '#A855F7' }}
                />
                <span className="text-xs text-white/60">{m.stage_name}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Awards */}
        <SectionCard
          icon={Trophy}
          label="Awards"
          headline={`${awardsWon} won`}
          subheadline={`from ${awards.length} nominations`}
          onExplore={() => onNavigate('awards')}
        >
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Won</span>
                <span>{awardsWon}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${wonPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Nominated</span>
                <span>{awards.length - awardsWon}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-400 transition-all duration-500"
                  style={{ width: `${nomPct}%` }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Analytics */}
        <SectionCard
          icon={BarChart3}
          label="Analytics"
          headline={sentiments[0]?.sentiment ?? 'Audio Data'}
          subheadline="top sentiment"
          onExplore={() => onNavigate('analytics')}
        >
          <div className="space-y-1.5">
            {sentiments.slice(0, 3).map((s) => (
              <div key={s.sentiment}>
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>{s.sentiment}</span>
                  <span>{s.percentage}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${s.percentage}%`,
                      backgroundColor: getSentimentColor(s.sentiment),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Concerts */}
        <SectionCard
          icon={MapPin}
          label="Concerts"
          headline={`${concerts.length} shows`}
          subheadline={`across ${uniqueCountries} countries`}
          onExplore={() => onNavigate('tours')}
        >
          <div className="space-y-1.5">
            {topTours.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-xs text-white/60 truncate mr-2">{name}</span>
                <span className="text-xs text-white/30 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Insights */}
        <SectionCard
          icon={Sparkles}
          label="Insights"
          headline={currentInsight ? currentInsight.value ?? '—' : '—'}
          subheadline="rotating data fact"
          onExplore={() => onNavigate('analytics')}
        >
          <p className="text-xs text-white/50 leading-relaxed">
            {currentInsight?.text ?? 'Loading insights…'}
          </p>
        </SectionCard>

      </div>
    </div>
  );
}
```

**Step 2: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/sections/HomeSection/index.tsx
git commit -m "feat: redesign Overview as hero + stats + section cards grid"
```

---

### Task 3: Push

```bash
git push
```
