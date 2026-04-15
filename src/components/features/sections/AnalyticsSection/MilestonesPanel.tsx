import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import type { Album, Award, ChartEntry, Song, Concert, MemberEvent } from '../../../../types/database';
import { CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';
import ChartSection from '../../../ui/ChartSection';

// ==================== TYPES ====================

interface MilestonesPanelProps {
  albums: Album[];
  awards: Award[];
  chartEntries: ChartEntry[];
  songs: Song[];
  concerts: Concert[];
  memberEvents: MemberEvent[];
}

interface TimelineEntry {
  date: string;
  year: number;
  title: string;
  description: string;
  category: 'album' | 'award' | 'tour' | 'event';
}

// ==================== CONSTANTS ====================

const CATEGORY_COLORS: Record<TimelineEntry['category'], string> = {
  album: BORAHAE_COLORS.PRIMARY,   // purple
  award: '#EAB308',   // gold
  tour: '#22C55E',    // green
  event: '#3B82F6',   // blue
};

const CATEGORY_LABELS: Record<TimelineEntry['category'], string> = {
  album: 'Album Release',
  award: 'Award',
  tour: 'Tour',
  event: 'Member Event',
};

// ==================== COMPONENT ====================

export default function MilestonesPanel({
  albums,
  awards,
  chartEntries,
  songs,
  concerts,
  memberEvents,
}: MilestonesPanelProps) {
  // ---- Awards Summary Stats ----
  const totalWins = useMemo(() => awards.filter((a) => a.result === 'won').length, [awards]);
  const totalNominations = awards.length;
  const uniqueCeremonies = useMemo(() => new Set(awards.map((a) => a.ceremony)).size, [awards]);
  const numberOneHits = useMemo(
    () => chartEntries.filter((c) => c.peak_position === 1).length,
    [chartEntries],
  );

  // ---- Awards Per Year (Line Chart) ----
  const awardsPerYear = useMemo(() => {
    const won = awards.filter((a) => a.result === 'won');
    const yearMap = new Map<number, number>();
    for (const a of won) {
      yearMap.set(a.year, (yearMap.get(a.year) || 0) + 1);
    }
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  }, [awards]);

  // ---- Chart Positions Table ----
  const topChartSongs = useMemo(() => {
    const songEntries = chartEntries.filter((ce) => ce.song_id !== null);
    const sorted = [...songEntries].sort((a, b) => a.peak_position - b.peak_position);
    return sorted.slice(0, 15).map((ce) => {
      const song = songs.find((s) => s.id === ce.song_id);
      return {
        title: song?.title ?? 'Unknown',
        chart: ce.chart_name,
        peak: ce.peak_position,
        weeks: ce.weeks_on_chart ?? 0,
        certification: ce.certification ?? '',
      };
    });
  }, [chartEntries, songs]);

  // ---- Career Timeline ----
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeCategories, setActiveCategories] = useState<Set<TimelineEntry['category']>>(
    () => new Set(['album', 'award', 'tour', 'event']),
  );

  const allEntries = useMemo(() => {
    const entries: TimelineEntry[] = [];

    // Album releases
    for (const album of albums) {
      if (!album.release_date) continue;
      entries.push({
        date: album.release_date,
        year: parseInt(album.release_date.split('-')[0], 10),
        title: album.title,
        description: `${album.type} album${album.era ? ` \u2014 ${album.era} era` : ''}`,
        category: 'album',
      });
    }

    // Award wins (deduplicated by ceremony+year)
    const wonAwards = awards.filter((a) => a.result === 'won');
    const seenCeremonyYear = new Set<string>();
    for (const award of wonAwards) {
      const key = `${award.ceremony}-${award.year}`;
      if (seenCeremonyYear.has(key)) continue;
      seenCeremonyYear.add(key);
      entries.push({
        date: `${award.year}-01-01`,
        year: award.year,
        title: award.name,
        description: `${award.ceremony}${award.category ? ` \u2014 ${award.category}` : ''}`,
        category: 'award',
      });
    }

    // Tour starts (first concert of each tour)
    const tourFirstConcert = new Map<string, Concert>();
    for (const concert of concerts) {
      const existing = tourFirstConcert.get(concert.tour_name);
      if (!existing || new Date(concert.date) < new Date(existing.date)) {
        tourFirstConcert.set(concert.tour_name, concert);
      }
    }
    for (const [tourName, concert] of tourFirstConcert) {
      entries.push({
        date: concert.date,
        year: parseInt(concert.date.split('-')[0], 10),
        title: tourName,
        description: `Tour start \u2014 ${concert.venue}, ${concert.city}`,
        category: 'tour',
      });
    }

    // Member events
    for (const event of memberEvents) {
      entries.push({
        date: event.date,
        year: parseInt(event.date.split('-')[0], 10),
        title: event.title,
        description: event.description || event.event_type.replace(/_/g, ' '),
        category: 'event',
      });
    }

    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return entries;
  }, [albums, awards, concerts, memberEvents]);

  const milestones = useMemo(() => {
    const filtered = allEntries.filter((e) => activeCategories.has(e.category));
    return sortOrder === 'desc' ? [...filtered].reverse() : filtered;
  }, [allEntries, activeCategories, sortOrder]);

  const toggleCategory = (cat: TimelineEntry['category']) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of allEntries) {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    }
    return counts;
  }, [allEntries]);

  // Group by year
  const yearGroups = milestones.reduce<Record<number, TimelineEntry[]>>((acc, entry) => {
    if (!acc[entry.year]) acc[entry.year] = [];
    acc[entry.year].push(entry);
    return acc;
  }, {});

  const years = Object.keys(yearGroups)
    .map(Number)
    .sort((a, b) => (sortOrder === 'desc' ? b - a : a - b));

  // ---- Empty state ----
  if (awards.length === 0 && chartEntries.length === 0 && allEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-white/40">No milestone data available yet.</p>
        <p className="text-xs text-white/40 mt-2">
          Awards, chart entries, and timeline events will appear here once data is loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== 1. Awards Summary Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Wins" value={totalWins} />
        <SummaryCard label="Nominations" value={totalNominations} />
        <SummaryCard label="Ceremonies" value={uniqueCeremonies} />
        <SummaryCard label="#1 Chart Hits" value={numberOneHits} />
      </div>

      {/* ===== 2. Awards Per Year (Line Chart) ===== */}
      {awardsPerYear.length > 0 && (
        <ChartSection title="Awards Won Per Year" variant="gradient">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={awardsPerYear}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis dataKey="year" tick={CHART_STYLES.AXIS} />
                <YAxis tick={CHART_STYLES.AXIS} allowDecimals={false} />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#EAB308"
                  strokeWidth={2}
                  dot={{ fill: '#EAB308', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Awards Won"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>
      )}

      {/* ===== 3. Career Timeline ===== */}
      {allEntries.length > 0 && (
        <div className="bg-[#0d0d15] rounded-xl p-4 md:p-5">
          <h3 className="text-base font-bold text-white/85 mb-4">Career Timeline</h3>

          {/* Controls: filters + sort */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-0.5">
              {(Object.keys(CATEGORY_COLORS) as TimelineEntry['category'][]).map((cat) => {
                const isActive = activeCategories.has(cat);
                const color = CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
                    style={{
                      color: isActive ? color : 'rgba(255,255,255,0.3)',
                      borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.08)',
                      backgroundColor: isActive ? `${color}12` : 'transparent',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full transition-opacity"
                      style={{
                        backgroundColor: color,
                        opacity: isActive ? 1 : 0.3,
                      }}
                    />
                    {CATEGORY_LABELS[cat]}
                    <span className="text-[10px] opacity-60">({categoryCounts[cat] ?? 0})</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 border border-white/[0.08] hover:text-white/70 hover:border-white/[0.15] transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.08]" />

            <div className="space-y-6 md:space-y-8">
              {years.map((year) => (
                <div key={year}>
                  {/* Year marker */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 border-2 border-purple-500/50 relative z-10" />
                    <span className="text-sm font-semibold text-white/80">{year}</span>
                    <span className="text-[10px] text-white/30">
                      {yearGroups[year].length} events
                    </span>
                  </div>

                  {/* Entries */}
                  <div className="ml-6 md:ml-8 space-y-3">
                    {yearGroups[year].map((entry, i) => (
                      <div
                        key={`${entry.date}-${i}`}
                        className="relative flex items-start gap-3"
                      >
                        <div className="absolute -left-[21px] md:-left-[25px] top-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                          />
                        </div>

                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex-1 hover:border-white/[0.12] transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-white/85">{entry.title}</p>
                              <p className="text-xs text-white/50 mt-0.5">{entry.description}</p>
                            </div>
                            <span className="text-xs text-white/40 whitespace-nowrap">
                              {entry.date}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[entry.category]}15`,
                                color: CATEGORY_COLORS[entry.category],
                                border: `1px solid ${CATEGORY_COLORS[entry.category]}30`,
                              }}
                            >
                              {CATEGORY_LABELS[entry.category]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 4. Chart Positions Table ===== */}
      {topChartSongs.length > 0 && (
        <ChartSection title="Top Chart Positions" variant="dashed">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-2 px-3 w-10 text-xs font-medium text-white/40 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="py-2 px-3 min-w-[140px] text-xs font-medium text-white/40 uppercase tracking-wider">
                    Song
                  </th>
                  <th className="py-2 px-3 min-w-[100px] text-xs font-medium text-white/40 uppercase tracking-wider">
                    Chart
                  </th>
                  <th className="py-2 px-3 w-14 text-xs font-medium text-white/40 uppercase tracking-wider">
                    Peak
                  </th>
                  <th className="py-2 px-3 w-14 text-xs font-medium text-white/40 uppercase tracking-wider">
                    Weeks
                  </th>
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                    Cert.
                  </th>
                </tr>
              </thead>
              <tbody>
                {topChartSongs.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-3 text-white/50 text-xs">{i + 1}</td>
                    <td className="py-2 px-3 text-white/70">{row.title}</td>
                    <td className="py-2 px-3 text-white/50">{row.chart}</td>
                    <td className="py-2 px-3 text-white/90 font-mono font-semibold">
                      {row.peak === 1 ? (
                        <span className="text-yellow-400">#{row.peak}</span>
                      ) : (
                        <span>#{row.peak}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-white/50">{row.weeks || '\u2014'}</td>
                    <td className="py-2 px-3 text-white/50">{row.certification || '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartSection>
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#111118]/80 border border-white/[0.04] rounded-xl p-4 border-t-2 border-t-amber-500/40">
      <div className="text-2xl font-bold text-white/95">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  );
}
