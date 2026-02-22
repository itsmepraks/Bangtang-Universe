import { useMemo, Suspense, lazy } from 'react';
import { Activity, Music, Disc, BookOpen } from 'lucide-react';
import type { Song, Album, Member } from '../../../../types/database';
import { GlassHUD } from '../../../layout/GlassHUD';
import StatCard from './StatCard';
import EraOverview from './EraOverview';
import TitleTrackSpotlight from './TitleTrackSpotlight';
import type { DashboardSection } from '../../../../types/index';

const SonicAnalyzer = lazy(() => import('../../SonicAnalyzer'));

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  lyricsCount: number;
  analyzingSong: Song | null;
  onSelectSong: (s: Song | null) => void;
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
  getAlbumTitle: (id: number | null) => string;
  playing: boolean;
  onTogglePlay: () => void;
}

export default function HomeSection({
  songs, albums, members, lyricsCount,
  analyzingSong, onSelectSong, onNavigate,
  getAlbumTitle, playing, onTogglePlay,
}: HomeSectionProps) {
  const eras = useMemo(() => [...new Set(albums.map(a => a.era).filter(Boolean))], [albums]);

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Activity} accent="#C084FC" subtitle="7 active" />
        <StatCard label="Lyrics" value={lyricsCount} icon={BookOpen} accent="#D8B4FE" />
      </div>

      {/* Waveform + Title Tracks */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <GlassHUD title="Waveform Analysis" icon={Activity}>
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
          </GlassHUD>
        </div>
        <div className="col-span-4">
          <GlassHUD title="Title Tracks" icon={Music}>
            <TitleTrackSpotlight
              songs={songs}
              analyzingSong={analyzingSong}
              onSelectSong={(s) => onSelectSong(s)}
              onTogglePlay={onTogglePlay}
            />
          </GlassHUD>
        </div>
      </div>

      {/* Era Overview */}
      <GlassHUD title="Eras & Albums" icon={Disc}>
        <EraOverview
          albums={albums}
          onNavigateToEra={(era) => onNavigate('discography', era)}
        />
      </GlassHUD>
    </div>
  );
}
