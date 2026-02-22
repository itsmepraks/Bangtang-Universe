import { useMemo, useState } from 'react';
import { ChevronLeft, Music } from 'lucide-react';
import type { Song, Album } from '../../../../types/database';
import { useLyricsBySongId } from '../../../../hooks';
import { getSentimentColor } from '../../../../constants/colors';
import Badge from '../../../ui/Badge';
import TabBar from '../../../ui/TabBar';
import ProgressBar from '../../../ui/ProgressBar';
import MetricCard from '../../../ui/MetricCard';

interface SongDetailProps {
  song: Song;
  songs: Song[];
  albums: Album[];
  onBack: () => void;
  onSelectSong: (songId: number) => void;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SONG_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'lyrics', label: 'Lyrics' },
  { value: 'credits', label: 'Credits' },
  { value: 'similar', label: 'Similar' },
];

const LYRIC_TABS = [
  { value: 'korean', label: 'Korean' },
  { value: 'english', label: 'English' },
  { value: 'romanized', label: 'Romanized' },
];

export default function SongDetail({ song, songs, albums, onBack, onSelectSong }: SongDetailProps) {
  const album = useMemo(() => albums.find(a => a.id === song.album_id), [albums, song.album_id]);
  const { lyric: lyrics } = useLyricsBySongId(song.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [lyricsTab, setLyricsTab] = useState('korean');

  const similarSongs = useMemo(() => {
    return songs.filter(s =>
      s.id !== song.id && (
        s.sentiment === song.sentiment ||
        (song.bpm && s.bpm && Math.abs((s.bpm || 0) - (song.bpm || 0)) <= 10)
      )
    ).slice(0, 6);
  }, [songs, song]);

  const features = [
    { label: 'Energy', value: song.energy },
    { label: 'Valence', value: song.valence },
    { label: 'Danceability', value: song.danceability },
    { label: 'Acousticness', value: song.acousticness },
  ];

  const lyricsContent = lyrics
    ? (lyricsTab === 'korean' ? lyrics.lyrics_korean : lyricsTab === 'english' ? lyrics.lyrics_english : lyrics.lyrics_romanized)
    : null;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-wide uppercase transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      {/* Song Header */}
      <div className="flex gap-8 items-start">
        <div
          className="w-32 h-32 rounded-2xl flex-shrink-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${album?.cover_color || '#A855F7'}60, ${album?.cover_color || '#A855F7'}15)` }}
        >
          <Music size={36} className="text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white/95">{song.title}</h2>
          {song.title_korean && <p className="text-lg text-white/60">{song.title_korean}</p>}
          <div className="flex items-center gap-3 text-sm text-white/50">
            {album && <span>{album.title}</span>}
            <span className="text-white/20">·</span>
            <span>{song.release_date?.slice(0, 4)}</span>
            {song.duration_seconds && <><span className="text-white/20">·</span><span>{formatDuration(song.duration_seconds)}</span></>}
            {song.bpm && <><span className="text-white/20">·</span><span>{song.bpm} BPM</span></>}
          </div>
          <div className="flex gap-2 mt-2">
            {song.is_title_track && <Badge variant="purple" size="md">Title Track</Badge>}
            {song.has_mv && <Badge variant="blue" size="md">Music Video</Badge>}
            {song.sentiment && <Badge variant="sentiment" size="md" color={getSentimentColor(song.sentiment)}>{song.sentiment}</Badge>}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabBar tabs={SONG_TABS} active={activeTab} onChange={setActiveTab} />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Audio Feature Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {features.map(f => (
              <MetricCard
                key={f.label}
                label={f.label}
                value={f.value != null ? `${(f.value * 100).toFixed(0)}%` : '—'}
                size="sm"
              />
            ))}
          </div>

          {/* Audio Feature Bars */}
          <div className="space-y-4 p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            {features.map(f => (
              <ProgressBar
                key={f.label}
                value={f.value || 0}
                label={f.label}
                showPercent
              />
            ))}
          </div>

          {/* Keywords */}
          {song.keywords && song.keywords.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {song.keywords.map((kw, i) => (
                  <Badge key={i} variant="default" size="md">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Lyrics */}
      {activeTab === 'lyrics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <TabBar tabs={LYRIC_TABS} active={lyricsTab} onChange={setLyricsTab} />
            {lyrics?.genius_url && (
              <a href={lyrics.genius_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-purple-400/60 hover:text-purple-300 tracking-wide transition-colors">
                View on Genius
              </a>
            )}
          </div>

          {lyrics?.themes && lyrics.themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lyrics.themes.map((theme, i) => (
                <Badge key={i} variant="purple" size="sm">{theme}</Badge>
              ))}
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto pretty-scrollbar p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            {lyricsContent ? (
              <pre className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-sans select-text">{lyricsContent}</pre>
            ) : (
              <p className="text-sm text-white/40 italic">No {lyricsTab} lyrics available</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Credits */}
      {activeTab === 'credits' && (
        <div className="space-y-6 p-6 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
          {song.writers && song.writers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide">Writers</h4>
              <div className="flex flex-wrap gap-2">
                {song.writers.map((w, i) => (
                  <Badge key={i} variant="default" size="md">{w}</Badge>
                ))}
              </div>
            </div>
          )}
          {song.producers && song.producers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide">Producers</h4>
              <div className="flex flex-wrap gap-2">
                {song.producers.map((p, i) => (
                  <Badge key={i} variant="default" size="md">{p}</Badge>
                ))}
              </div>
            </div>
          )}
          {song.member_credits && song.member_credits.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide">Member Credits</h4>
              <div className="flex flex-wrap gap-2">
                {song.member_credits.map((m, i) => (
                  <Badge key={i} variant="purple" size="md">{m}</Badge>
                ))}
              </div>
            </div>
          )}
          {(!song.writers?.length && !song.producers?.length && !song.member_credits?.length) && (
            <p className="text-sm text-white/40 italic">No credit information available</p>
          )}
        </div>
      )}

      {/* Tab: Similar Songs */}
      {activeTab === 'similar' && (
        <div>
          {similarSongs.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {similarSongs.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelectSong(s.id)}
                  className="text-left p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-purple-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <div className="text-sm text-white/80 group-hover:text-white transition-colors truncate">{s.title}</div>
                  <div className="text-xs text-white/50 mt-1.5">{s.bpm} BPM</div>
                  {s.sentiment && (
                    <div className="mt-2">
                      <Badge variant="sentiment" size="sm" color={getSentimentColor(s.sentiment)}>{s.sentiment}</Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 text-center py-12">No similar songs found</p>
          )}
        </div>
      )}
    </div>
  );
}
