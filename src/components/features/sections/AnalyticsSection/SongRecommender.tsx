import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Song, Album } from '../../../../types/database';
import { getRecommendations } from '../../../../services/recommendationService';
import { CHART_STYLES } from '../../../../constants/colors';
import EmptyState from '../../../ui/EmptyState';

interface SongRecommenderProps {
  songs: Song[];
  albums: Album[];
}

interface RadarDataPoint {
  feature: string;
  selected: number;
  recommended: number;
}

function buildRadarData(songA: Song, songB: Song): RadarDataPoint[] {
  return [
    {
      feature: 'Energy',
      selected: (songA.energy ?? 0) * 100,
      recommended: (songB.energy ?? 0) * 100,
    },
    {
      feature: 'Valence',
      selected: (songA.valence ?? 0) * 100,
      recommended: (songB.valence ?? 0) * 100,
    },
    {
      feature: 'Danceability',
      selected: (songA.danceability ?? 0) * 100,
      recommended: (songB.danceability ?? 0) * 100,
    },
    {
      feature: 'Acousticness',
      selected: (songA.acousticness ?? 0) * 100,
      recommended: (songB.acousticness ?? 0) * 100,
    },
  ];
}

export default function SongRecommender({ songs, albums }: SongRecommenderProps) {
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

  const selectedSong = useMemo(
    () => songs.find((s) => s.id === selectedSongId) ?? null,
    [songs, selectedSongId],
  );

  const recommendations = useMemo(() => {
    if (!selectedSong) return [];
    return getRecommendations(selectedSong, songs, albums, 8);
  }, [selectedSong, songs, albums]);

  const topRecommendation = recommendations[0] ?? null;

  const radarData = useMemo(() => {
    if (!selectedSong || !topRecommendation) return [];
    return buildRadarData(selectedSong, topRecommendation.song);
  }, [selectedSong, topRecommendation]);

  return (
    <div className="space-y-8">
      {/* ===== Song Selector ===== */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Song Recommendations
        </h3>
        <select
          value={selectedSongId ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedSongId(val ? Number(val) : null);
          }}
          className="w-full bg-[#0c0c12] border border-white/[0.10] rounded-xl text-sm text-white/80 px-4 py-3 cursor-pointer focus:outline-none focus:border-purple-500/40 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '36px',
          }}
        >
          <option value="" style={{ background: '#0c0c12' }}>Select a song...</option>
          {songs.map((song) => (
            <option key={song.id} value={song.id} style={{ background: '#0c0c12' }}>
              {song.title}
            </option>
          ))}
        </select>
      </div>

      {/* ===== Placeholder when nothing selected ===== */}
      {!selectedSong && (
        <EmptyState
          icon={Sparkles}
          title="Pick a song to start"
          description="Pick a song. We'll find 8 that sound like it."
        />
      )}

      {/* ===== No recommendations found ===== */}
      {selectedSong && recommendations.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No similar songs found"
          description="Nothing close. Try a different track."
        />
      )}

      {/* ===== Recommendations Grid ===== */}
      {selectedSong && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.song.id}
              className="bg-[#0e0e16] border border-white/[0.04] rounded-xl p-4 hover:bg-[#131320] transition-colors"
            >
              <p className="text-base font-semibold text-white/90">
                {rec.song.title}
              </p>
              <p className="text-xs text-white/40 mt-1">{rec.albumTitle}</p>
              <p className="text-sm font-mono text-purple-400 mt-2">
                {Math.round(rec.similarity * 100)}% similar
              </p>
              {rec.reasons.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-fade-x mt-2 pb-0.5">
                  {rec.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/15 flex-shrink-0 whitespace-nowrap"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== Radar Comparison ===== */}
      {selectedSong && topRecommendation && radarData.length > 0 && (
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-white/70 mb-2">
            Audio Comparison
          </h4>
          <p className="text-xs text-white/40 mb-4">
            <span className="text-purple-400">{selectedSong.title}</span>
            {' vs '}
            <span className="text-indigo-400">{topRecommendation.song.title}</span>
          </p>

          <div className="min-h-[260px]">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="feature"
                tick={{ ...CHART_STYLES.AXIS }}
              />
              <Radar
                name={selectedSong.title}
                dataKey="selected"
                stroke="#A855F7"
                fill="#A855F7"
                fillOpacity={0.2}
              />
              <Radar
                name={topRecommendation.song.title}
                dataKey="recommended"
                stroke="#818CF8"
                fill="#818CF8"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
