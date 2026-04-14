import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { Song, Album } from '../../../../types/database';
import { computeEraEvolution } from '../../../../services/analyticsService';
import { CHART_STYLES } from '../../../../constants/colors';
import GlossaryTip from '../../../ui/GlossaryTip';

interface EraEvolutionProps {
  songs: Song[];
  albums: Album[];
}

export default function EraEvolution({ songs, albums }: EraEvolutionProps) {
  const eraStats = useMemo(() => computeEraEvolution(songs, albums), [songs, albums]);

  // Normalize BPM to 0-1 range (divide by 200) so all lines share the same scale
  const lineChartData = useMemo(
    () =>
      eraStats.map((era) => ({
        era: era.era,
        BPM: +(era.avgBpm / 200).toFixed(3),
        Energy: era.avgEnergy,
        Valence: era.avgValence,
        Danceability: era.avgDanceability,
      })),
    [eraStats],
  );

  const barChartData = useMemo(
    () =>
      eraStats.map((era) => ({
        era: era.era,
        songCount: era.songCount,
      })),
    [eraStats],
  );

  if (eraStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm">
        No era data available. Songs need album associations with era tags.
      </div>
    );
  }

  // Summary insight
  const eraSummary = useMemo(() => {
    if (eraStats.length < 2) return null;
    const first = eraStats[0];
    const last = eraStats[eraStats.length - 1];
    const mostEnergetic = [...eraStats].sort((a, b) => b.avgEnergy - a.avgEnergy)[0];
    const mostDanceable = [...eraStats].sort((a, b) => b.avgDanceability - a.avgDanceability)[0];
    const totalSongs = eraStats.reduce((s, e) => s + e.songCount, 0);
    const bpmTrend = last.avgBpm > first.avgBpm ? 'increased' : 'decreased';
    return { first, last, mostEnergetic, mostDanceable, totalSongs, bpmTrend };
  }, [eraStats]);

  return (
    <div className="space-y-8">
      {/* 1. Era Audio Evolution (Line Chart) */}
      <div className="bg-[#0e0e16] border-l-2 border-l-purple-500/20 border border-white/[0.04] rounded-xl p-4 md:p-6">
        <h3 className="text-base font-bold text-white/85 mb-2">
          Sound Evolution Across Eras
        </h3>
        {eraSummary && (
          <p className="text-xs text-white/40 leading-relaxed mb-4 max-w-2xl">
            Tracking how BTS's sound evolved across {eraStats.length} <GlossaryTip term="era">eras</GlossaryTip> and{' '}
            {eraSummary.totalSongs} songs. Average <GlossaryTip term="BPM" /> has {eraSummary.bpmTrend} from{' '}
            {eraSummary.first.avgBpm} ({eraSummary.first.era}) to {eraSummary.last.avgBpm} ({eraSummary.last.era}).{' '}
            <span className="text-white/60 font-medium">{eraSummary.mostEnergetic.era}</span> is the most energetic era
            and <span className="text-white/60 font-medium">{eraSummary.mostDanceable.era}</span> the most danceable.
          </p>
        )}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={lineChartData}>
            <CartesianGrid {...CHART_STYLES.GRID} />
            <XAxis
              dataKey="era"
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1]}
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
              labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
            />
            <Line
              type="monotone"
              dataKey="BPM"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#F59E0B' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Energy"
              stroke="#A855F7"
              strokeWidth={2}
              dot={{ r: 3, fill: '#A855F7' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Valence"
              stroke="#818CF8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#818CF8' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Danceability"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10B981' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Songs Per Era (Bar Chart) */}
      <div className="bg-[#0e0e16] border-l-2 border-l-purple-500/20 border border-white/[0.04] rounded-xl p-4 md:p-6">
        <h3 className="text-base font-bold text-white/85 mb-4">Songs Per Era</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barChartData}>
            <CartesianGrid {...CHART_STYLES.GRID} />
            <XAxis
              dataKey="era"
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
              labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
              cursor={CHART_STYLES.TOOLTIP.cursor}
            />
            <Bar
              dataKey="songCount"
              fill="#A855F7"
              radius={[4, 4, 0, 0]}
              name="Songs"
              activeBar={CHART_STYLES.BAR_ACTIVE}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Era Stats Table */}
      <div className="bg-[#0e0e16] border-l-2 border-l-purple-500/20 border border-white/[0.04] rounded-xl p-4 md:p-6">
        <h3 className="text-base font-bold text-white/85 mb-4">Era Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-xs text-white/50 font-medium pb-3 pr-4">Era</th>
                <th className="text-xs text-white/50 font-medium pb-3 pr-4">Songs</th>
                <th className="text-xs text-white/50 font-medium pb-3 pr-4">Avg BPM</th>
                <th className="text-xs text-white/50 font-medium pb-3 pr-4">Avg Energy</th>
                <th className="text-xs text-white/50 font-medium pb-3">Avg Valence</th>
              </tr>
            </thead>
            <tbody>
              {eraStats.map((era) => (
                <tr key={era.era} className="even:bg-white/[0.02]">
                  <td className="text-sm text-white/70 py-2.5 pr-4">{era.era}</td>
                  <td className="text-sm text-white/70 py-2.5 pr-4">{era.songCount}</td>
                  <td className="text-sm text-white/70 py-2.5 pr-4">{era.avgBpm}</td>
                  <td className="text-sm text-white/70 py-2.5 pr-4">{era.avgEnergy}</td>
                  <td className="text-sm text-white/70 py-2.5">{era.avgValence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
