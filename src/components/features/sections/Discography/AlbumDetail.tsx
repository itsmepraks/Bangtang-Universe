import { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Song, Album } from '../../../../types/database';
import Badge from '../../../ui/Badge';
import DataTable from '../../../ui/DataTable';
import BtsLogo from '../../../ui/BtsLogo';
import { getSentimentColor, BORAHAE_COLORS } from '../../../../constants/colors';

interface AlbumDetailProps {
  album: Album;
  songs: Song[];
  onSelectSong: (songId: number) => void;
  onBack: () => void;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AlbumDetail({ album, songs, onSelectSong, onBack }: AlbumDetailProps) {
  const albumSongs = useMemo(() => songs.filter(s => s.album_id === album.id), [songs, album.id]);

  const columns = [
    {
      key: 'num',
      header: '#',
      width: '48px',
      render: (_: Song, i: number) => <span className="text-sm text-white/40">{i + 1}</span>,
    },
    {
      key: 'title',
      header: 'Title',
      render: (s: Song) => (
        <div>
          <div className="text-sm text-white/80">{s.title}</div>
          {s.title_korean && <div className="text-xs text-white/40">{s.title_korean}</div>}
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: '80px',
      render: (s: Song) => <span className="text-sm text-white/50 font-mono">{formatDuration(s.duration_seconds)}</span>,
    },
    {
      key: 'bpm',
      header: 'BPM',
      width: '70px',
      render: (s: Song) => <span className="text-sm text-white/50 font-mono">{s.bpm || '—'}</span>,
    },
    {
      key: 'sentiment',
      header: 'Sentiment',
      width: '120px',
      render: (s: Song) => s.sentiment ? (
        <Badge variant="sentiment" size="sm" color={getSentimentColor(s.sentiment)}>{s.sentiment}</Badge>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-wide uppercase transition-colors">
        <ChevronLeft size={16} /> All Albums
      </button>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div
          className="w-32 h-32 md:w-48 md:h-48 rounded-2xl flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${album.cover_color || BORAHAE_COLORS.PRIMARY}60, ${album.cover_color || BORAHAE_COLORS.PRIMARY}15)` }}
        >
          {album.cover_art_url ? (
            <img
              src={album.cover_art_url}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BtsLogo size={56} className="text-white/[0.15]" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-2">
          <Badge variant="purple" size="md">{album.type}</Badge>
          <h2 className="text-2xl font-semibold text-white/95">{album.title}</h2>
          {album.title_korean && <p className="text-base text-white/60">{album.title_korean}</p>}
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span>{album.release_date?.slice(0, 4)}</span>
            {album.era && <Badge variant="purple" size="sm">{album.era}</Badge>}
            <span>{albumSongs.length} tracks</span>
          </div>
          {album.description
            ? <p className="text-sm text-white/60 mt-2 max-w-lg leading-relaxed whitespace-pre-wrap">{album.description}</p>
            : <p className="text-sm text-white/30 mt-2 italic">No description available</p>
          }
        </div>
      </div>

      {/* Track List */}
      <DataTable
        columns={columns}
        data={albumSongs}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => onSelectSong(s.id)}
        emptyMessage="No tracks found"
      />
    </div>
  );
}
