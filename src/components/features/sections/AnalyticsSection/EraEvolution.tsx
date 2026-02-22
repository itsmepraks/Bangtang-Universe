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

  return (
    <div className="space-y-8">
      {/* 1. Era Audio Evolution (Line Chart) */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">
          Sound Evolution Across Eras
        </h3>
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
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Songs Per Era</h3>
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
            />
            <Bar
              dataKey="songCount"
              fill="#A855F7"
              radius={[4, 4, 0, 0]}
              name="Songs"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Era Stats Table */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Era Details</h3>
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
