import { useState, useMemo } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import type { Song } from '../../../types/database';
import MetricCard from '../../ui/MetricCard';
import Badge from '../../ui/Badge';
import { getSentimentColor, CHART_STYLES } from '../../../constants/colors';

interface SongComparisonProps {
  songs: Song[];
  initialSongA?: Song | null;
  initialSongB?: Song | null;
}

export default function SongComparison({ songs, initialSongA, initialSongB }: SongComparisonProps) {
  const [songAId, setSongAId] = useState<number | ''>(initialSongA?.id || '');
  const [songBId, setSongBId] = useState<number | ''>(initialSongB?.id || '');

  const songA = useMemo(() => songs.find(s => s.id === songAId) || null, [songs, songAId]);
  const songB = useMemo(() => songs.find(s => s.id === songBId) || null, [songs, songBId]);

  const radarData = useMemo(() => {
    if (!songA && !songB) return [];
    return [
      { feature: 'Energy', a: (songA?.energy || 0) * 100, b: (songB?.energy || 0) * 100 },
      { feature: 'Valence', a: (songA?.valence || 0) * 100, b: (songB?.valence || 0) * 100 },
      { feature: 'Danceability', a: (songA?.danceability || 0) * 100, b: (songB?.danceability || 0) * 100 },
      { feature: 'Acousticness', a: (songA?.acousticness || 0) * 100, b: (songB?.acousticness || 0) * 100 },
    ];
  }, [songA, songB]);

  const differences = useMemo(() => {
    if (!songA || !songB) return [];
    const diffs = [];
    const features = [
      { name: 'Energy', a: songA.energy, b: songB.energy },
      { name: 'Valence', a: songA.valence, b: songB.valence },
      { name: 'Danceability', a: songA.danceability, b: songB.danceability },
      { name: 'Acousticness', a: songA.acousticness, b: songB.acousticness },
    ];
    for (const f of features) {
      if (f.a != null && f.b != null) {
        const diff = Math.round((f.a - f.b) * 100);
        if (diff !== 0) {
          diffs.push({
            feature: f.name,
            diff,
            text: `${songA.title} is ${Math.abs(diff)}% ${diff > 0 ? 'more' : 'less'} ${f.name.toLowerCase()}`,
          });
        }
      }
    }
    return diffs;
  }, [songA, songB]);

  return (
    <div className="space-y-6">
      {/* Song Selectors */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide block mb-2">Song A</label>
          <select
            value={songAId}
            onChange={(e) => setSongAId(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none focus:border-purple-500/30"
          >
            <option value="">Select a song...</option>
            {songs.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide block mb-2">Song B</label>
          <select
            value={songBId}
            onChange={(e) => setSongBId(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none focus:border-purple-500/30"
          >
            <option value="">Select a song...</option>
            {songs.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {(songA || songB) && (
        <>
          {/* Radar Chart */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="feature" tick={{ ...CHART_STYLES.AXIS }} />
                {songA && <Radar name={songA.title} dataKey="a" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} strokeWidth={2} />}
                {songB && <Radar name={songB.title} dataKey="b" stroke="#818CF8" fill="#818CF8" fillOpacity={0.2} strokeWidth={2} />}
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Side-by-side Metrics */}
          <div className="grid grid-cols-2 gap-6">
            {songA && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-300">{songA.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="BPM" value={songA.bpm || '—'} size="sm" accent="#A855F7" />
                  <MetricCard label="Duration" value={songA.duration_seconds ? `${Math.floor(songA.duration_seconds / 60)}:${(songA.duration_seconds % 60).toString().padStart(2, '0')}` : '—'} size="sm" />
                </div>
                {songA.sentiment && (
                  <Badge variant="sentiment" size="md" color={getSentimentColor(songA.sentiment)}>{songA.sentiment}</Badge>
                )}
              </div>
            )}
            {songB && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-indigo-300">{songB.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="BPM" value={songB.bpm || '—'} size="sm" accent="#818CF8" />
                  <MetricCard label="Duration" value={songB.duration_seconds ? `${Math.floor(songB.duration_seconds / 60)}:${(songB.duration_seconds % 60).toString().padStart(2, '0')}` : '—'} size="sm" />
                </div>
                {songB.sentiment && (
                  <Badge variant="sentiment" size="md" color={getSentimentColor(songB.sentiment)}>{songB.sentiment}</Badge>
                )}
              </div>
            )}
          </div>

          {/* Difference Summary */}
          {differences.length > 0 && (
            <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Differences</h4>
              {differences.map(d => (
                <div key={d.feature} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${d.diff > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-white/60">{d.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
