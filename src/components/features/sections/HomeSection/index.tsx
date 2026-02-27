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
        era: e.era.split(' ')[0],
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
