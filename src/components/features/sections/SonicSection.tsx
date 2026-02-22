import { useMemo, useState, Suspense, lazy } from 'react';
import { Activity, BarChart3, Compass, PieChart, GitCompare } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell } from 'recharts';
import type { Song, Album } from '../../../types/database';
import { GlassHUD } from '../../layout/GlassHUD';
import { getSentimentColor, CHART_STYLES } from '../../../constants/colors';
import Badge from '../../ui/Badge';
import SongComparison from '../comparison/SongComparison';

const SonicAnalyzer = lazy(() => import('../SonicAnalyzer'));

interface SonicSectionProps {
  songs: Song[];
  albums: Album[];
  analyzingSong: Song | null;
  onSelectSong: (s: Song | null) => void;
  playing: boolean;
  onTogglePlay: () => void;
  getAlbumTitle: (id: number | null) => string;
}

export default function SonicSection({ songs, albums, analyzingSong, onSelectSong, playing, onTogglePlay, getAlbumTitle }: SonicSectionProps) {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareSong, setCompareSong] = useState<Song | null>(null);

  // Mood Quadrant data
  const scatterData = useMemo(() => {
    return songs
      .filter(s => s.energy != null && s.valence != null)
      .map(s => ({
        x: s.valence || 0,
        y: s.energy || 0,
        title: s.title,
        sentiment: s.sentiment || 'Unknown',
        fill: getSentimentColor(s.sentiment || '') || '#A855F7',
      }));
  }, [songs]);

  // Era Averages data
  const eraData = useMemo(() => {
    const eraMap: Record<string, { bpm: number[]; energy: number[]; valence: number[] }> = {};
    songs.forEach(s => {
      const album = albums.find(a => a.id === s.album_id);
      const era = album?.era || 'Unknown';
      if (!eraMap[era]) eraMap[era] = { bpm: [], energy: [], valence: [] };
      if (s.bpm) eraMap[era].bpm.push(s.bpm);
      if (s.energy != null) eraMap[era].energy.push(s.energy);
      if (s.valence != null) eraMap[era].valence.push(s.valence);
    });

    return Object.entries(eraMap)
      .filter(([name]) => name !== 'Unknown')
      .map(([era, data]) => ({
        era,
        avgBPM: data.bpm.length ? Math.round(data.bpm.reduce((a, b) => a + b, 0) / data.bpm.length) : 0,
        avgEnergy: data.energy.length ? +(data.energy.reduce((a, b) => a + b, 0) / data.energy.length).toFixed(2) : 0,
        avgValence: data.valence.length ? +(data.valence.reduce((a, b) => a + b, 0) / data.valence.length).toFixed(2) : 0,
      }))
      .sort((a, b) => a.era.localeCompare(b.era));
  }, [songs, albums]);

  // Sentiment distribution data
  const sentimentData = useMemo(() => {
    const counts: Record<string, number> = {};
    songs.forEach(s => {
      const sentiment = s.sentiment || 'Unknown';
      counts[sentiment] = (counts[sentiment] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        color: getSentimentColor(name) || '#A855F7',
      }))
      .sort((a, b) => b.count - a.count);
  }, [songs]);

  return (
    <div className="space-y-8">
      {/* Waveform Analyzer */}
      <GlassHUD title="Waveform Analysis" icon={Activity}
        headerAction={
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded-full border transition-all duration-300 ${
              comparisonMode ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
            }`}
          >Compare</button>
        }
      >
        <div className={comparisonMode ? 'grid grid-cols-2 gap-6' : ''}>
          <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}>
            <SonicAnalyzer
              playing={playing}
              togglePlay={onTogglePlay}
              song={analyzingSong}
              onSelectSong={onSelectSong}
              songs={songs}
              getAlbumTitle={getAlbumTitle}
            />
          </Suspense>
          {comparisonMode && (
            <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}>
              <SonicAnalyzer
                playing={false}
                togglePlay={() => {}}
                song={compareSong}
                onSelectSong={setCompareSong}
                songs={songs}
                getAlbumTitle={getAlbumTitle}
              />
            </Suspense>
          )}
        </div>
      </GlassHUD>

      <div className="grid grid-cols-2 gap-6">
        {/* Mood Quadrant */}
        <GlassHUD title="Mood Quadrant" icon={Compass}>
          <div className="relative">
            {/* Quadrant labels */}
            <div className="absolute top-2 left-2 text-xs font-medium text-white/30 uppercase tracking-wide z-10">Sad & Calm</div>
            <div className="absolute top-2 right-2 text-xs font-medium text-white/30 uppercase tracking-wide text-right z-10">Happy & Calm</div>
            <div className="absolute bottom-10 left-2 text-xs font-medium text-white/30 uppercase tracking-wide z-10">Sad & Intense</div>
            <div className="absolute bottom-10 right-2 text-xs font-medium text-white/30 uppercase tracking-wide text-right z-10">Happy & Intense</div>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 1]}
                  tick={CHART_STYLES.AXIS}
                  label={{ value: 'Valence →', position: 'bottom', ...CHART_STYLES.AXIS }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 1]}
                  tick={CHART_STYLES.AXIS}
                  label={{ value: 'Energy →', angle: -90, position: 'left', ...CHART_STYLES.AXIS }}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={CHART_STYLES.TOOLTIP.contentStyle}>
                        <div className="text-sm text-white font-semibold">{d.title}</div>
                        <div className="text-xs text-white/60 mt-1">{d.sentiment}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fillOpacity={0.6}>
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} r={4} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassHUD>

        {/* Era Averages */}
        <GlassHUD title="Era Averages" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={eraData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid {...CHART_STYLES.GRID} />
              <XAxis
                dataKey="era"
                tick={CHART_STYLES.AXIS}
              />
              <YAxis tick={CHART_STYLES.AXIS} />
              <Tooltip
                contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
              <Bar dataKey="avgEnergy" name="Energy" fill="#A855F7" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgValence" name="Valence" fill="#818CF8" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassHUD>
      </div>

      {/* Sentiment Distribution */}
      <GlassHUD title="Sentiment Distribution" icon={PieChart}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {sentimentData.map(s => (
              <Badge key={s.name} variant="sentiment" size="sm" color={s.color}>
                {s.name} ({s.count})
              </Badge>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sentimentData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 100 }}>
              <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
              <XAxis type="number" tick={CHART_STYLES.AXIS} />
              <YAxis type="category" dataKey="name" tick={CHART_STYLES.AXIS} width={90} />
              <Tooltip
                contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                formatter={(value) => [`${value} songs`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassHUD>

      {/* Song Comparison */}
      <GlassHUD title="Song Comparison" icon={GitCompare}>
        <SongComparison songs={songs} initialSongA={analyzingSong} />
      </GlassHUD>
    </div>
  );
}
