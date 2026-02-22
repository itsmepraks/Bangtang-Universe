import { useMemo } from 'react';
import type { Song } from '../../../../types/database';
import type { DashboardSection } from '../../../../types/index';
import Badge from '../../../ui/Badge';
import { getSentimentColor } from '../../../../constants/colors';

interface TitleTrackSpotlightProps {
  songs: Song[];
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
}

export default function TitleTrackSpotlight({ songs, onNavigate }: TitleTrackSpotlightProps) {
  const titleTracks = useMemo(() => songs.filter(s => s.is_title_track).slice(0, 15), [songs]);

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pretty-scrollbar">
      {titleTracks.map(s => (
        <button
          key={s.id}
          onClick={() => onNavigate('discography', s.album_id)}
          className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/[0.04] border border-transparent"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white/80 truncate">{s.title}</div>
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
