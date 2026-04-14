import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { Song, Album } from '../../../../types/database';
import {
  computeEraEvolution,
  computeAudioHistograms,
  computeRankings,
} from '../../../../services/analyticsService';
import { getSentimentColor, CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';
import ChartSection from '../../../ui/ChartSection';

// ==================== TYPES ====================

interface SoundPanelProps {
  songs: Song[];
  albums: Album[];
}

type HistogramFeature = 'BPM' | 'Energy' | 'Valence' | 'Danceability' | 'Acousticness';

// ==================== CONSTANTS ====================

const HISTOGRAM_FEATURES: HistogramFeature[] = [
  'BPM',
  'Energy',
  'Valence',
  'Danceability',
  'Acousticness',
];

// ==================== COMPONENT ====================

export default function SoundPanel({ songs, albums }: SoundPanelProps) {
  const [selectedFeature, setSelectedFeature] = useState<HistogramFeature>('BPM');
  const [selectedRankingCategory, setSelectedRankingCategory] = useState<string>('Highest Energy');

  // Data coverage
  const withAudio = useMemo(
    () => songs.filter((s) => s.energy != null || s.bpm != null).length,
    [songs],
  );

  // 1. Mood quadrant scatter data
  const scatterData = useMemo(
    () =>
      songs
        .filter(
          (s) =>
            s.valence !== null &&
            s.valence !== undefined &&
            s.energy !== null &&
            s.energy !== undefined,
        )
        .map((s) => ({
          valence: s.valence as number,
          energy: s.energy as number,
          title: s.title,
          sentiment: s.sentiment ?? 'Unknown',
          color: getSentimentColor(s.sentiment ?? ''),
        })),
    [songs],
  );

  // 2. Era evolution
  const eraStats = useMemo(() => computeEraEvolution(songs, albums), [songs, albums]);

  const lineChartData = useMemo(
    () =>
      eraStats.map((era) => ({
        era: era.era,
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

  // 3. Audio feature histograms
  const histograms = useMemo(() => computeAudioHistograms(songs), [songs]);

  const selectedHistogram = useMemo(() => {
    const hist = histograms.find((h) => h.feature === selectedFeature) ?? null;
    if (!hist) return null;

    // Use 5 buckets when data is sparse
    if (withAudio < 100 && hist.buckets.length === 10) {
      const merged = [];
      for (let i = 0; i < 10; i += 2) {
        const a = hist.buckets[i];
        const b = hist.buckets[i + 1];
        if (a && b) {
          merged.push({
            range: `${a.range.split('-')[0]}-${b.range.split('-')[1]}`,
            min: a.min,
            max: b.max,
            count: a.count + b.count,
          });
        }
      }
      return { feature: hist.feature, buckets: merged };
    }
    return hist;
  }, [histograms, selectedFeature, withAudio]);

  // 4. Song rankings
  const rankings = useMemo(() => computeRankings(songs, albums), [songs, albums]);

  const rankingCategories = useMemo(() => rankings.map((r) => r.category), [rankings]);

  const selectedRanking = useMemo(
    () => rankings.find((r) => r.category === selectedRankingCategory) ?? null,
    [rankings, selectedRankingCategory],
  );

  return (
    <div className="space-y-8">
      {/* ==================== DATA COVERAGE BANNER ==================== */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-300/70 mb-4">
        Audio data for {withAudio} of {songs.length} songs (
        {songs.length > 0 ? Math.round((withAudio / songs.length) * 100) : 0}%)
      </div>

      {/* ==================== MOOD QUADRANT ==================== */}
      <ChartSection title="Mood Quadrant" subtitle="Valence vs Energy for each song, colored by sentiment." variant="immersive">
        <div className="relative">
          {/* X-axis label row */}
          <div className="flex justify-between text-[10px] text-white/25 mb-1">
            <span>&larr; Sad</span>
            <span>Happy &rarr;</span>
          </div>

          {/* Chart with overlaid Y-axis labels */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis
                  type="number"
                  dataKey="valence"
                  domain={[0, 1]}
                  name="Valence"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="energy"
                  domain={[0, 1]}
                  name="Energy"
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  width={0}
                />
                <Tooltip
                  {...CHART_STYLES.TOOLTIP}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload as (typeof scatterData)[number];
                    return (
                      <div style={{ ...CHART_STYLES.TOOLTIP.contentStyle }}>
                        <p style={CHART_STYLES.TOOLTIP.labelStyle}>{data.title}</p>
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '11px',
                            marginTop: 3,
                          }}
                        >
                          {data.sentiment}
                        </p>
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '11px',
                            marginTop: 2,
                          }}
                        >
                          Valence {data.valence.toFixed(2)} &middot; Energy{' '}
                          {data.energy.toFixed(2)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} isAnimationActive={false}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`scatter-${index}`}
                      fill={entry.color}
                      fillOpacity={0.8}
                      r={5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Overlaid Y-axis labels */}
            <div className="absolute left-1 top-2 flex flex-col justify-between h-[288px] pointer-events-none">
              <span className="text-[10px] text-white/25">Intense &uarr;</span>
              <span className="text-[10px] text-white/25">&darr; Calm</span>
            </div>
          </div>
        </div>
      </ChartSection>

      {/* ==================== ERA EVOLUTION LINE CHART ==================== */}
      {eraStats.length > 0 && (
        <ChartSection title="Sound Evolution Across Eras" subtitle="Energy, valence, and danceability averaged per era." variant="timeline">
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
                dataKey="Energy"
                stroke={BORAHAE_COLORS.PRIMARY}
                strokeWidth={2}
                dot={{ r: 3, fill: BORAHAE_COLORS.PRIMARY }}
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
        </ChartSection>
      )}

      {/* ==================== SONGS PER ERA BAR CHART ==================== */}
      {eraStats.length > 0 && (
        <ChartSection title="Songs Per Era" variant="timeline">
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
        </ChartSection>
      )}

      {/* ==================== AUDIO FEATURE HISTOGRAMS ==================== */}
      {withAudio >= 20 ? (
        <ChartSection title="Audio Feature Distributions" subtitle="How songs are distributed across each audio dimension." variant="subtle">
          {/* Feature filter pills */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
            {HISTOGRAM_FEATURES.map((feature) => {
              const isActive = feature === selectedFeature;
              return (
                <button
                  key={feature}
                  onClick={() => setSelectedFeature(feature)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-purple-500/15 text-white border-purple-500/30'
                      : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white/70'
                  }`}
                >
                  {feature}
                </button>
              );
            })}
          </div>

          {/* Histogram bar chart */}
          {selectedHistogram && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={selectedHistogram.buckets}
                margin={{ top: 8, right: 8, bottom: 36, left: 0 }}
              >
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis
                  dataKey="range"
                  tick={{ ...CHART_STYLES.AXIS, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={CHART_STYLES.AXIS}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip {...CHART_STYLES.TOOLTIP} cursor={CHART_STYLES.TOOLTIP.cursor} />
                <Bar
                  dataKey="count"
                  fill="#A855F7"
                  fillOpacity={0.7}
                  radius={[4, 4, 0, 0]}
                  activeBar={CHART_STYLES.BAR_ACTIVE}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      ) : (
        <div className="bg-[#111118]/80 border border-white/[0.04] rounded-xl p-3 md:p-5">
          <p className="text-sm text-white/30">
            Not enough audio data for detailed distributions.
          </p>
        </div>
      )}

      {/* ==================== SONG RANKINGS ==================== */}
      <div className="bg-[#111118]/80 border border-white/[0.04] rounded-xl p-3 md:p-5">
        <div className="flex items-center justify-between mb-2 gap-3">
          <h3 className="text-base font-bold text-white/85">Song Rankings</h3>
          <select
            value={selectedRankingCategory}
            onChange={(e) => setSelectedRankingCategory(e.target.value)}
            className="bg-[#111118] border border-white/[0.10] rounded-lg text-xs text-white/70 px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-purple-500/40 appearance-none pr-6 shrink-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {rankingCategories.map((cat) => (
              <option key={cat} value={cat} style={{ background: '#111118' }}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Top songs sorted by the selected audio characteristic.
        </p>

        {selectedRanking && (
          <div>
            {selectedRanking.songs.slice(0, 10).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 py-2.5 px-1 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-xs text-white/30 w-4 text-right shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{song.title}</p>
                  {song.album && (
                    <p className="text-[11px] text-white/35 truncate">{song.album}</p>
                  )}
                </div>
                <span className="text-sm text-white/55 font-mono shrink-0">
                  {song.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== ERA DETAIL TABLE ==================== */}
      {eraStats.length > 0 && (
        <ChartSection title="Era Details" variant="timeline">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-xs text-white/50 font-medium pb-3 pr-4">Era</th>
                  <th className="text-xs text-white/50 font-medium pb-3 pr-4">Songs</th>
                  <th className="text-xs text-white/50 font-medium pb-3 pr-4">Avg BPM</th>
                  <th className="text-xs text-white/50 font-medium pb-3 pr-4">Avg Energy</th>
                  <th className="text-xs text-white/50 font-medium pb-3 pr-4">Avg Valence</th>
                  <th className="text-xs text-white/50 font-medium pb-3">Avg Danceability</th>
                </tr>
              </thead>
              <tbody>
                {eraStats.map((era) => (
                  <tr key={era.era} className="even:bg-white/[0.02]">
                    <td className="text-sm text-white/70 py-2.5 pr-4">{era.era}</td>
                    <td className="text-sm text-white/70 py-2.5 pr-4">{era.songCount}</td>
                    <td className="text-sm text-white/70 py-2.5 pr-4">{era.avgBpm}</td>
                    <td className="text-sm text-white/70 py-2.5 pr-4">{era.avgEnergy}</td>
                    <td className="text-sm text-white/70 py-2.5 pr-4">{era.avgValence}</td>
                    <td className="text-sm text-white/70 py-2.5">{era.avgDanceability}</td>
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
