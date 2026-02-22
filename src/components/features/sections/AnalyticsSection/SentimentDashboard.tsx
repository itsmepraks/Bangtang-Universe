import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import type { Song, Album } from '../../../../types/database';
import {
  computeSentimentDistribution,
  computeSentimentByEra,
} from '../../../../services/analyticsService';
import { getSentimentColor, CHART_STYLES } from '../../../../constants/colors';

interface SentimentDashboardProps {
  songs: Song[];
  albums: Album[];
}

export default function SentimentDashboard({ songs, albums }: SentimentDashboardProps) {
  const distribution = useMemo(() => computeSentimentDistribution(songs), [songs]);

  const sentimentByEra = useMemo(() => computeSentimentByEra(songs, albums), [songs, albums]);

  // Collect every unique sentiment across all eras for stacked bars
  const allSentiments = useMemo(() => {
    const set = new Set<string>();
    for (const dist of Object.values(sentimentByEra)) {
      for (const entry of dist) {
        set.add(entry.sentiment);
      }
    }
    // Also include sentiments from the overall distribution for consistency
    for (const entry of distribution) {
      set.add(entry.sentiment);
    }
    return Array.from(set);
  }, [sentimentByEra, distribution]);

  // Build stacked bar data: one row per era, each sentiment as a numeric key
  const eraStackedData = useMemo(() => {
    return Object.entries(sentimentByEra).map(([era, dist]) => {
      const row: Record<string, string | number> = { era };
      for (const sentiment of allSentiments) {
        const match = dist.find((d) => d.sentiment === sentiment);
        row[sentiment] = match ? match.count : 0;
      }
      return row;
    });
  }, [sentimentByEra, allSentiments]);

  const distributionChartHeight = Math.max(280, distribution.length * 36);
  const eraChartHeight = Math.max(300, eraStackedData.length * 48);

  return (
    <div className="space-y-8">
      {/* ===== Overall Sentiment Distribution ===== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white/90 mb-4">
          Sentiment Distribution
        </h3>

        {/* Badge row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {distribution.map((entry) => {
            const color = getSentimentColor(entry.sentiment);
            return (
              <span
                key={entry.sentiment}
                className="px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  color,
                  borderColor: color,
                  backgroundColor: `${color}15`,
                }}
              >
                {entry.sentiment} ({entry.count})
              </span>
            );
          })}
        </div>

        {/* Horizontal bar chart */}
        <ResponsiveContainer width="100%" height={distributionChartHeight}>
          <BarChart
            data={distribution}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
            <XAxis type="number" tick={CHART_STYLES.AXIS} />
            <YAxis
              type="category"
              dataKey="sentiment"
              tick={CHART_STYLES.AXIS}
              width={110}
            />
            <Tooltip
              contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
              labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
              formatter={(value, _name, props) => {
                const pct = (props as { payload?: { percentage?: number } })?.payload?.percentage ?? 0;
                return [`${value} songs (${pct}%)`, 'Count'];
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
              {distribution.map((entry) => (
                <Cell
                  key={entry.sentiment}
                  fill={getSentimentColor(entry.sentiment)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== Sentiment by Era ===== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white/90 mb-4">
          Sentiment Across Eras
        </h3>

        {eraStackedData.length === 0 ? (
          <p className="text-white/40 text-sm">No era data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={eraChartHeight}>
            <BarChart
              data={eraStackedData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
              <XAxis type="number" tick={CHART_STYLES.AXIS} />
              <YAxis
                type="category"
                dataKey="era"
                tick={CHART_STYLES.AXIS}
                width={110}
              />
              <Tooltip
                contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}
              />
              {allSentiments.map((sentiment) => (
                <Bar
                  key={sentiment}
                  dataKey={sentiment}
                  stackId="sentiment"
                  fill={getSentimentColor(sentiment)}
                  barSize={22}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
