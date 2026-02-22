import { useMemo } from 'react';
import type { Song } from '../../../../types/database';
import Badge from '../../../ui/Badge';
import { getSentimentColor } from '../../../../constants/colors';

interface TitleTrackSpotlightProps {
  songs: Song[];
  analyzingSong: Song | null;
  onSelectSong: (s: Song) => void;
  onTogglePlay: () => void;
}

export default function TitleTrackSpotlight({ songs, analyzingSong, onSelectSong, onTogglePlay }: TitleTrackSpotlightProps) {
  const titleTracks = useMemo(() => songs.filter(s => s.is_title_track).slice(0, 15), [songs]);

  return (
    <div className="space-y-3 max-h-[260px] overflow-y-auto pretty-scrollbar">
      {titleTracks.map(s => (
        <button
          key={s.id}
          onClick={() => { onSelectSong(s); onTogglePlay(); }}
          className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ${
            analyzingSong?.id === s.id
              ? 'bg-purple-500/15 border border-purple-500/30'
              : 'hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className={`text-sm truncate ${analyzingSong?.id === s.id ? 'text-purple-300 font-medium' : 'text-white/80'}`}>
              {s.title}
            </div>
            <div className="text-xs text-white/40 mt-0.5">
              {s.release_date?.slice(0, 4)}
            </div>
          </div>
          {s.sentiment && (
            <Badge variant="sentiment" size="sm" color={getSentimentColor(s.sentiment)}>
              {s.sentiment}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
