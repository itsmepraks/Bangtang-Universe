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

/** Produce a short but unique era label for the Music area chart x-axis.
 *  "Love Yourself: Her" → "LY:Her"  |  "WINGS" → "WINGS"  |  "Dark & Wild" → "D&W"
 */
function abbreviateEra(era: string): string {
  if (era.includes(':')) {
    const [main, sub] = era.split(':').map((s) => s.trim());
    const initials = main.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? '').join('');
    const subFirst = sub.split(/\s+/)[0].slice(0, 3);
    return `${initials}:${subFirst}`;
  }
  const words = era.split(/\s+/);
  if (words.length === 1) return era.slice(0, 6);
  return words.map((w) => w[0]?.toUpperCase() ?? '').join('');
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
        era: abbreviateEra(e.era),
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
      .map(([year, count]) => ({ year: `'${String(year).slice(2)}`, count: Number(count) }));
  }, [awards]);

  // ── CONCERTS card ─────────────────────────────────────────────
  const uniqueCountries = useMemo(
    () => new Set(concerts.map((c) => c.country)).size,
    [concerts],
  );
  const concertChartData = useMemo(() => {
    const map: Record<string, number> = {};
    concerts.forEach((c) => {
      map[c.tour_name] = (map[c.tour_name] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [concerts]);

  return (
    <main className="space-y-6">
      {/* ── Page title + tagline ─────────────────────────────────── */}
      <div className="pt-1">
        <h1 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Bangtan Universe
        </h1>
        <p className="text-sm text-white/35 mt-1">
          A complete data archive of BTS — music, members, awards, concerts, and deep audio
          analytics across every era.
        </p>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle="active artists" />
        <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" subtitle="total production" />
        <StatCard label="Awards Won" value={awardsWon} icon={Trophy} accent="#FBBF24" subtitle={`${awards.length} nominations`} />
        <StatCard label="Concerts" value={concerts.length} icon={MapPin} accent="#10B981" subtitle={`${uniqueTours} tours`} />
      </div>

      {/* ── Bento grid ──────────────────────────────────────────── */}
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
          {/* Legend */}
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1.5 text-[10px] text-white/35">
              <span className="w-3 h-0.5 rounded bg-[#A855F7] inline-block" />
              Energy
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-white/35">
              <span className="w-3 h-0.5 rounded bg-[#C084FC] inline-block" />
              Valence
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
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
            { value: totalKomca, label: 'KOMCA' },
            { value: topContributor, label: 'top writer' },
          ]}
          onExplore={() => onNavigate('members')}
        >
          <ResponsiveContainer width="100%" height={196}>
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
                interval={0}
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
          className="lg:row-span-2 lg:col-span-1"
        >
          {/* Quadrant axis labels overlaid on the chart */}
          <div className="relative">
            <span className="absolute top-0 inset-x-0 text-center text-[9px] text-white/25 uppercase tracking-wide pointer-events-none select-none">
              Energetic ↑
            </span>
            <span className="absolute bottom-1 inset-x-0 text-center text-[9px] text-white/25 uppercase tracking-wide pointer-events-none select-none">
              ↓ Calm
            </span>
            <span className="absolute top-1/2 left-0 -translate-y-1/2 text-[9px] text-white/25 uppercase tracking-wide pointer-events-none select-none">
              Sad
            </span>
            <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[9px] text-white/25 uppercase tracking-wide pointer-events-none select-none">
              Happy
            </span>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 18, right: 28, bottom: 18, left: 24 }}>
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
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as (typeof scatterData)[number];
                    const valPct = Math.round(d.valence * 100);
                    const engPct = Math.round(d.energy * 100);
                    return (
                      <div style={{ ...CHART_STYLES.TOOLTIP.contentStyle, minWidth: 160 }}>
                        <p style={CHART_STYLES.TOOLTIP.labelStyle}>{d.title}</p>
                        <p style={{ color: d.color, fontSize: 11, marginTop: 3, marginBottom: 8 }}>
                          {d.sentiment}
                        </p>
                        {/* Valence bar */}
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Valence</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{valPct}%</span>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${valPct}%`, background: '#C084FC', borderRadius: 2 }} />
                          </div>
                        </div>
                        {/* Energy bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Energy</span>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{engPct}%</span>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${engPct}%`, background: '#A855F7', borderRadius: 2 }} />
                          </div>
                        </div>
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
          </div>
        </BentoCard>

        {/* AWARDS — col 1, row 2 */}
        <BentoCard
          title="Awards"
          metrics={[
            { value: awardsWon, label: 'won' },
            { value: awards.length - awardsWon, label: 'nominated' },
            { value: uniqueCeremonies, label: 'ceremonies' },
          ]}
          onExplore={() => onNavigate('awards')}
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

        {/* CONCERTS — col 2, row 2 */}
        <BentoCard
          title="Concerts"
          metrics={[
            { value: concerts.length, label: 'shows' },
            { value: uniqueCountries, label: 'countries' },
            { value: uniqueTours, label: 'tours' },
          ]}
          onExplore={() => onNavigate('tours')}
        >
          <div className="space-y-2">
            {concertChartData.map((tour) => (
              <div key={tour.name} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 flex-[2] min-w-0 truncate">
                  {tour.name}
                </span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden min-w-[32px]">
                  <div
                    className="h-full rounded-full bg-emerald-500/70"
                    style={{ width: `${(tour.count / (concertChartData[0]?.count ?? 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/30 shrink-0 w-5 text-right tabular-nums">
                  {tour.count}
                </span>
              </div>
            ))}
          </div>
        </BentoCard>

      </div>
    </main>
  );
}
