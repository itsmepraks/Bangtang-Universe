import { useState, useMemo } from 'react';
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
        <h3 className="text-lg font-semibold text-white/90 mb-4">
          Song Recommendations
        </h3>
        <select
          value={selectedSongId ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedSongId(val ? Number(val) : null);
          }}
          className="bg-[#111118] border border-white/[0.06] rounded-xl text-white text-sm p-3 w-full [&>option]:text-black"
        >
          <option value="">Select a song...</option>
          {songs.map((song) => (
            <option key={song.id} value={song.id}>
              {song.title}
            </option>
          ))}
        </select>
      </div>

      {/* ===== Placeholder when nothing selected ===== */}
      {!selectedSong && (
        <p className="text-white/40 text-sm text-center py-12">
          Select a song to see recommendations based on audio similarity.
        </p>
      )}

      {/* ===== Recommendations Grid ===== */}
      {selectedSong && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.song.id}
              className="bg-[#111118] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all"
            >
              <p className="text-base font-semibold text-white/90">
                {rec.song.title}
              </p>
              <p className="text-xs text-white/40 mt-1">{rec.albumTitle}</p>
              <p className="text-sm font-mono text-purple-400 mt-2">
                {Math.round(rec.similarity * 100)}% similar
              </p>
              {rec.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {rec.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-white/50 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
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

          <ResponsiveContainer width="100%" height={300}>
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
      )}
    </div>
  );
}
