import { useMemo } from 'react';
import { Music, Disc, Users, PenTool, Trophy, MapPin, Sparkles, MessageSquare, Search as SearchIcon, ArrowRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
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
import { CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';

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
  const latestAlbum = useMemo(
    () => [...albums].sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))[0] ?? null,
    [albums],
  );
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
    <main className="space-y-8">
      {/* ── Page title + tagline ─────────────────────────────────── */}
      <div className="pt-1">
        <h1 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Bangtan Universe
        </h1>
        <p className="text-sm text-white/35 mt-1">
          11 years. 7 members. The numbers behind the music.
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

      {/* ── Try this: quick entry cards (Nielsen #6, #7 — surface hidden features) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: SearchIcon,
            label: 'Search by mood',
            hint: 'Happy, sad, energetic…',
            onClick: () => onNavigate('search'),
          },
          {
            icon: Sparkles,
            label: 'Find songs like…',
            hint: 'Recommendations by mood & era',
            onClick: () => { window.location.hash = '#/analytics/discover'; },
          },
          {
            icon: MessageSquare,
            label: 'Ask about BTS',
            hint: '"Who has the most credits?"',
            onClick: () => { window.location.hash = '#/analytics/discover'; },
          },
        ].map(({ icon: Icon, label, hint, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex items-center gap-3 text-left bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.05] hover:border-purple-500/20 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-purple-300/80" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</div>
              <div className="text-[11px] text-white/40 truncate">{hint}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" aria-hidden="true" />
          </button>
        ))}
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
              <span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: BORAHAE_COLORS.PRIMARY }} />
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
              <Tooltip {...CHART_STYLES.TOOLTIP} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke={BORAHAE_COLORS.PRIMARY}
                fill={BORAHAE_COLORS.PRIMARY}
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
          <div className="space-y-2.5">
            {memberChartData.map((member) => (
              <div key={member.name} className="flex items-center gap-2.5">
                <span className="text-[10px] text-white/50 w-[46px] text-right shrink-0 font-medium">
                  {member.name}
                </span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(member.value / (memberChartData[0]?.value || 1)) * 100}%`,
                      backgroundColor: member.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-[10px] text-white/30 w-7 text-right tabular-nums shrink-0">
                  {member.value}
                </span>
              </div>
            ))}
          </div>
        </BentoCard>

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
                  background: `linear-gradient(135deg, ${latestAlbum?.cover_color || BORAHAE_COLORS.PRIMARY}60, ${latestAlbum?.cover_color || BORAHAE_COLORS.PRIMARY}10)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#0a0a0f] tracking-wide">NEW</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-lg font-bold text-white">{latestAlbum?.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {latestAlbum?.era && (
                  <span className="text-xs text-white/60">{latestAlbum.era}</span>
                )}
                {latestAlbum?.track_count && (
                  <span className="text-xs text-white/40">{latestAlbum.track_count} tracks</span>
                )}
              </div>
            </div>
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
              <Tooltip {...CHART_STYLES.TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="count"
                fill={BORAHAE_COLORS.PRIMARY}
                fillOpacity={0.8}
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
                name="Wins"
                activeBar={{ fillOpacity: 0.95 }}
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
