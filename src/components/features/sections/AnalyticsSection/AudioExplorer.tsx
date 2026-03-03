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
} from 'recharts';
import type { Song, Album } from '../../../../types/database';
import { computeAudioHistograms, computeRankings } from '../../../../services/analyticsService';
import { getSentimentColor, CHART_STYLES } from '../../../../constants/colors';

// ==================== TYPES ====================

interface AudioExplorerProps {
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

export default function AudioExplorer({ songs, albums }: AudioExplorerProps) {
  const [selectedFeature, setSelectedFeature] = useState<HistogramFeature>('BPM');
  const [selectedRankingCategory, setSelectedRankingCategory] = useState<string>('Highest Energy');

  // Mood quadrant scatter data: { valence, energy, title, sentiment, color }
  const scatterData = useMemo(() => {
    return songs
      .filter(
        (s) =>
          s.valence !== null &&
          s.valence !== undefined &&
          s.energy !== null &&
          s.energy !== undefined
      )
      .map((s) => ({
        valence: s.valence as number,
        energy: s.energy as number,
        title: s.title,
        sentiment: s.sentiment ?? 'Unknown',
        color: getSentimentColor(s.sentiment ?? ''),
      }));
  }, [songs]);

  // Audio feature histograms
  const histograms = useMemo(() => computeAudioHistograms(songs), [songs]);

  const selectedHistogram = useMemo(() => {
    return histograms.find((h) => h.feature === selectedFeature) ?? null;
  }, [histograms, selectedFeature]);

  // Song rankings
  const rankings = useMemo(() => computeRankings(songs, albums), [songs, albums]);

  const rankingCategories = useMemo(() => rankings.map((r) => r.category), [rankings]);

  const selectedRanking = useMemo(() => {
    return rankings.find((r) => r.category === selectedRankingCategory) ?? null;
  }, [rankings, selectedRankingCategory]);

  return (
    <div className="space-y-6">
      {/* ==================== MOOD QUADRANT ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Mood Quadrant</h3>

        <div className="relative">
          {/* Quadrant axis labels */}
          <div className="flex justify-between text-xs text-white/30 mb-1 px-1">
            <span>← Sad</span>
            <span className="text-center">Valence</span>
            <span>Happy →</span>
          </div>

          <div className="flex gap-2">
            {/* Y-axis label */}
            <div className="flex flex-col justify-between text-xs text-white/30 py-1 shrink-0 w-14 text-right">
              <span>Intense ↑</span>
              <span>Energy</span>
              <span>↓ Calm</span>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
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
                  />
              <Tooltip
                {...CHART_STYLES.TOOLTIP}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload as (typeof scatterData)[number];
                  return (
                    <div
                      style={{
                        ...CHART_STYLES.TOOLTIP.contentStyle,
                      }}
                    >
                      <p style={CHART_STYLES.TOOLTIP.labelStyle}>{data.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: 4 }}>
                        Sentiment: {data.sentiment}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: 2 }}>
                        Valence: {data.valence.toFixed(2)} / Energy: {data.energy.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} isAnimationActive={false}>
                {scatterData.map((entry, index) => (
                  <Cell key={`scatter-${index}`} fill={entry.color} fillOpacity={0.75} r={5} />
                ))}
              </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== AUDIO FEATURE DISTRIBUTIONS ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Audio Feature Distributions</h3>

        {/* Feature filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {HISTOGRAM_FEATURES.map((feature) => {
            const isActive = feature === selectedFeature;
            return (
              <button
                key={feature}
                onClick={() => setSelectedFeature(feature)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={selectedHistogram.buckets}
              margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
            >
              <CartesianGrid {...CHART_STYLES.GRID} />
              <XAxis
                dataKey="range"
                tick={CHART_STYLES.AXIS}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={CHART_STYLES.AXIS}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip {...CHART_STYLES.TOOLTIP} cursor={CHART_STYLES.TOOLTIP.cursor} />
              <Bar dataKey="count" fill="#A855F7" fillOpacity={0.7} radius={[4, 4, 0, 0]} activeBar={CHART_STYLES.BAR_ACTIVE} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ==================== SONG RANKINGS ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Song Rankings</h3>

        {/* Ranking category pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {rankingCategories.map((category) => {
            const isActive = category === selectedRankingCategory;
            return (
              <button
                key={category}
                onClick={() => setSelectedRankingCategory(category)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  isActive
                    ? 'bg-purple-500/15 text-white border-purple-500/30'
                    : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:text-white/70'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Rankings list */}
        {selectedRanking && (
          <div>
            {selectedRanking.songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 border-b border-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-5 text-right">{index + 1}</span>
                  <div>
                    <p className="text-sm text-white/80">{song.title}</p>
                    {song.album && <p className="text-xs text-white/40">{song.album}</p>}
                  </div>
                </div>
                <span className="text-sm text-white/60 font-mono">{song.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
