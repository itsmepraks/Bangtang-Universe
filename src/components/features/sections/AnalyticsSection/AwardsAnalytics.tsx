import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { Award, ChartEntry, Song } from '../../../../types/database';
import { CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';

// ==================== TYPES ====================

interface AwardsAnalyticsProps {
  awards: Award[];
  chartEntries: ChartEntry[];
  songs: Song[];
}

// ==================== COMPONENT ====================

export default function AwardsAnalytics({ awards, chartEntries, songs }: AwardsAnalyticsProps) {
  // Awards won per year (line chart data)
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

  // Top ceremonies by wins (horizontal bar chart data)
  const topCeremonies = useMemo(() => {
    const won = awards.filter((a) => a.result === 'won');
    const ceremonyMap = new Map<string, number>();
    for (const a of won) {
      ceremonyMap.set(a.ceremony, (ceremonyMap.get(a.ceremony) || 0) + 1);
    }
    return Array.from(ceremonyMap.entries())
      .map(([ceremony, wins]) => ({ ceremony, wins }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);
  }, [awards]);

  // Chart entries: top songs by peak position
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

  // Number-one hits
  const numberOneHits = useMemo(() => {
    return chartEntries
      .filter((ce) => ce.peak_position === 1)
      .map((ce) => {
        const song = songs.find((s) => s.id === ce.song_id);
        return {
          title: song?.title ?? 'Unknown',
          chart: ce.chart_name,
          date: ce.entry_date ?? '',
          weeks: ce.weeks_on_chart ?? 0,
        };
      });
  }, [chartEntries, songs]);

  // Empty state
  if (awards.length === 0 && chartEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-white/40">No award or chart data available yet.</p>
        <p className="text-xs text-white/40 mt-2">Data will appear here once awards and chart entries are loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Awards Won" value={awards.filter((a) => a.result === 'won').length} />
        <StatCard label="Total Nominations" value={awards.length} />
        <StatCard label="Chart Entries" value={chartEntries.length} />
        <StatCard label="#1 Hits" value={numberOneHits.length} />
      </div>

      {/* Awards Won Per Year (Line Chart) */}
      {awardsPerYear.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Awards Won Per Year</h3>
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
                  stroke={BORAHAE_COLORS.PRIMARY}
                  strokeWidth={2}
                  dot={{ fill: BORAHAE_COLORS.PRIMARY, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Awards Won"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Ceremonies by Wins (Horizontal Bar Chart) */}
      {topCeremonies.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Top Ceremonies by Wins</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCeremonies} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis type="number" tick={CHART_STYLES.AXIS} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="ceremony"
                  tick={CHART_STYLES.AXIS}
                  width={160}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                />
                <Bar dataKey="wins" fill={BORAHAE_COLORS.INDIGO} radius={[0, 4, 4, 0]} name="Wins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Number-One Hits Highlight */}
      {numberOneHits.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-4">
            #1 Hits ({numberOneHits.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {numberOneHits.map((hit, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-yellow-500/20 rounded-xl p-4 space-y-1"
              >
                <p className="text-sm font-medium text-white/90">{hit.title}</p>
                <p className="text-xs text-white/50">{hit.chart}</p>
                {hit.date && <p className="text-xs text-white/40">{hit.date}</p>}
                {hit.weeks > 0 && (
                  <p className="text-xs text-yellow-400/70">{hit.weeks} weeks on chart</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Chart Songs Table */}
      {topChartSongs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-4">Top Chart Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">Peak</th>
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">Song</th>
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">Chart</th>
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">Weeks</th>
                  <th className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider">Cert.</th>
                </tr>
              </thead>
              <tbody>
                {topChartSongs.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-3 text-white/90 font-mono font-semibold">
                      {row.peak === 1 ? (
                        <span className="text-yellow-400">#{row.peak}</span>
                      ) : (
                        <span>#{row.peak}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-white/70">{row.title}</td>
                    <td className="py-2 px-3 text-white/50">{row.chart}</td>
                    <td className="py-2 px-3 text-white/50">{row.weeks || '\u2014'}</td>
                    <td className="py-2 px-3 text-white/50">{row.certification || '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-2xl font-semibold text-white/90 mt-1">{value}</div>
    </div>
  );
}
