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

const POSITIVE_SENTIMENTS = new Set(['Joy', 'Gratitude', 'Comfort', 'Celebration', 'Confidence', 'Determination']);

interface SentimentDashboardProps {
  songs: Song[];
  albums: Album[];
}

export default function SentimentDashboard({ songs, albums }: SentimentDashboardProps) {
  const distribution = useMemo(() => computeSentimentDistribution(songs), [songs]);

  const sentimentByEra = useMemo(() => computeSentimentByEra(songs, albums), [songs, albums]);

  // Map sentiment → example songs (prefer title tracks, max 3)
  const sentimentExamples = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const song of songs) {
      if (!song.sentiment) continue;
      if (!map.has(song.sentiment)) map.set(song.sentiment, []);
      const arr = map.get(song.sentiment)!;
      // title tracks first
      if (song.is_title_track && arr.length < 3) {
        arr.unshift(song.title);
        if (arr.length > 3) arr.pop();
      } else if (arr.length < 3) {
        arr.push(song.title);
      }
    }
    return map;
  }, [songs]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const total = distribution.reduce((s, d) => s + d.count, 0);
    const positiveCount = distribution
      .filter(d => POSITIVE_SENTIMENTS.has(d.sentiment))
      .reduce((s, d) => s + d.count, 0);
    const reflectiveCount = total - positiveCount;
    const top = distribution[0];
    const runner = distribution[1];
    return {
      total,
      positiveCount,
      reflectiveCount,
      positivePct: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
      top,
      runner,
      uniqueCount: distribution.length,
    };
  }, [distribution]);

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
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-lg font-semibold text-white/90 mb-2">
          Sentiment Distribution
        </h3>

        {/* Summary insight */}
        {summaryStats.top && (
          <p className="text-xs text-white/40 leading-relaxed mb-5 max-w-2xl">
            Across {summaryStats.total} songs with {summaryStats.uniqueCount} distinct emotions,{' '}
            <span className="text-white/60 font-medium">{summaryStats.top.sentiment}</span> is the
            dominant mood ({summaryStats.top.count} songs, {summaryStats.top.percentage}%)
            {summaryStats.runner && (
              <>, followed by <span className="text-white/60 font-medium">{summaryStats.runner.sentiment}</span> ({summaryStats.runner.count})</>
            )}
            . Positive sentiments make up{' '}
            <span className="text-white/60 font-medium">{summaryStats.positivePct}%</span> of the
            catalog, with {summaryStats.reflectiveCount} songs exploring deeper, reflective themes.
          </p>
        )}

        {/* Positive vs Reflective split bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">Positive {summaryStats.positivePct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/70" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">Reflective {100 - summaryStats.positivePct}%</span>
            </div>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-400/50 transition-all duration-500"
              style={{ width: `${summaryStats.positivePct}%` }}
            />
            <div
              className="h-full bg-blue-400/40 transition-all duration-500"
              style={{ width: `${100 - summaryStats.positivePct}%` }}
            />
          </div>
        </div>

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
              cursor={CHART_STYLES.TOOLTIP.cursor}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload as { sentiment: string; count: number; percentage: number } | undefined;
                if (!data) return null;
                const color = getSentimentColor(data.sentiment);
                const examples = sentimentExamples.get(data.sentiment) || [];
                return (
                  <div style={CHART_STYLES.TOOLTIP.contentStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ ...CHART_STYLES.TOOLTIP.labelStyle }}>{data.sentiment}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: examples.length > 0 ? 8 : 0 }}>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>{data.count}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 }}>songs</span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>{data.percentage}%</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 }}>of catalog</span>
                      </div>
                    </div>
                    {examples.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example songs</span>
                        {examples.map(title => (
                          <div key={title} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>
                            {title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20} activeBar={CHART_STYLES.BAR_ACTIVE}>
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
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
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
                cursor={CHART_STYLES.TOOLTIP.cursor}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const nonZero = payload.filter(p => (p.value as number) > 0);
                  if (nonZero.length === 0) return null;
                  const total = nonZero.reduce((sum, p) => sum + (p.value as number), 0);
                  return (
                    <div style={CHART_STYLES.TOOLTIP.contentStyle}>
                      <p style={{ ...CHART_STYLES.TOOLTIP.labelStyle, marginBottom: 8 }}>{label}</p>
                      {nonZero.map(p => (
                        <div key={p.dataKey as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.color, flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, flex: 1 }}>{p.dataKey as string}</span>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{p.value as number}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{total}</span>
                      </div>
                    </div>
                  );
                }}
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
                  activeBar={CHART_STYLES.BAR_ACTIVE}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
