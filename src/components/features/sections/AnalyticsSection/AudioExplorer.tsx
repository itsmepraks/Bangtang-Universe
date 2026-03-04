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
import GlossaryTip from '../../../ui/GlossaryTip';

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

  // Summary insight
  const moodSummary = useMemo(() => {
    if (scatterData.length === 0) return null;
    const avgValence = scatterData.reduce((s, d) => s + d.valence, 0) / scatterData.length;
    const avgEnergy = scatterData.reduce((s, d) => s + d.energy, 0) / scatterData.length;
    const highEnergy = scatterData.filter(d => d.energy > 0.7).length;
    const highValence = scatterData.filter(d => d.valence > 0.6).length;
    const quadrant =
      avgEnergy > 0.5 && avgValence > 0.5 ? 'energetic and uplifting' :
      avgEnergy > 0.5 && avgValence <= 0.5 ? 'intense and moody' :
      avgEnergy <= 0.5 && avgValence > 0.5 ? 'relaxed and happy' :
      'calm and introspective';
    return { avgValence: avgValence.toFixed(2), avgEnergy: avgEnergy.toFixed(2), highEnergy, highValence, quadrant, total: scatterData.length };
  }, [scatterData]);

  return (
    <div className="space-y-6">
      {/* ==================== MOOD QUADRANT ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-1">Mood Quadrant</h3>
        <p className="text-xs text-white/35 mb-3">Each dot is a song — tap to see title, sentiment, and audio values.</p>
        {moodSummary && (
          <p className="text-xs text-white/40 leading-relaxed mb-4 max-w-2xl">
            Mapping {moodSummary.total} songs by <GlossaryTip term="valence" /> (happiness) and{' '}
            <GlossaryTip term="energy" /> (intensity). BTS's sound center is{' '}
            <span className="text-white/60 font-medium">{moodSummary.quadrant}</span> (avg valence {moodSummary.avgValence}, energy {moodSummary.avgEnergy}).{' '}
            {moodSummary.highEnergy} songs are high-energy and {moodSummary.highValence} lean happy.
          </p>
        )}

        <div className="relative">
          {/* X-axis label row */}
          <div className="flex justify-between text-[10px] text-white/25 mb-1">
            <span>← Sad</span>
            <span>Happy →</span>
          </div>

          {/* Chart full-width with overlaid Y-axis labels */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis type="number" dataKey="valence" domain={[0, 1]} name="Valence" tick={false} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="energy" domain={[0, 1]} name="Energy" tick={false} tickLine={false} axisLine={false} width={0} />
                <Tooltip
                  {...CHART_STYLES.TOOLTIP}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload as (typeof scatterData)[number];
                    return (
                      <div style={{ ...CHART_STYLES.TOOLTIP.contentStyle }}>
                        <p style={CHART_STYLES.TOOLTIP.labelStyle}>{data.title}</p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: 3 }}>
                          {data.sentiment}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: 2 }}>
                          Valence {data.valence.toFixed(2)} · Energy {data.energy.toFixed(2)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} isAnimationActive={false}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`scatter-${index}`} fill={entry.color} fillOpacity={0.8} r={5} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Overlaid Y-axis labels */}
            <div className="absolute left-1 top-2 flex flex-col justify-between h-[288px] pointer-events-none">
              <span className="text-[10px] text-white/25">Intense ↑</span>
              <span className="text-[10px] text-white/25">↓ Calm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== AUDIO FEATURE DISTRIBUTIONS ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-1">Audio Feature Distributions</h3>
        <p className="text-xs text-white/35 mb-3">How songs are distributed across each audio dimension.</p>

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
                interval={1}
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
              <Bar dataKey="count" fill="#A855F7" fillOpacity={0.7} radius={[4, 4, 0, 0]} activeBar={CHART_STYLES.BAR_ACTIVE} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ==================== SONG RANKINGS ==================== */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-3 md:p-6">
        <div className="flex items-center justify-between mb-2 gap-3">
          <h3 className="text-sm font-semibold text-white/70">Song Rankings</h3>
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
              <option key={cat} value={cat} style={{ background: '#111118' }}>{cat}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-white/35 mb-3">Top songs sorted by the selected audio characteristic.</p>

        {/* Rankings list */}
        {selectedRanking && (
          <div>
            {selectedRanking.songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 py-2.5 px-1 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-xs text-white/30 w-4 text-right shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{song.title}</p>
                  {song.album && <p className="text-[11px] text-white/35 truncate">{song.album}</p>}
                </div>
                <span className="text-sm text-white/55 font-mono shrink-0">{song.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
