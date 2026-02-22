import { useMemo } from 'react';
import { Music, Disc, Users, PenTool, Lightbulb } from 'lucide-react';
import type { Song, Album, Member } from '../../../../types/database';
import StatCard from './StatCard';
import EraOverview from './EraOverview';
import TitleTrackSpotlight from './TitleTrackSpotlight';
import type { DashboardSection } from '../../../../types/index';
import { generateInsights } from '../../../../services/analyticsService';

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
}

export default function HomeSection({
  songs, albums, members, onNavigate,
}: HomeSectionProps) {
  const eras = useMemo(() => [...new Set(albums.map(a => a.era).filter(Boolean))], [albums]);
  const totalKomca = useMemo(() => members.reduce((sum, m) => sum + (m.komca_credits || 0), 0), [members]);
  const insights = useMemo(() => generateInsights(songs, albums, members), [songs, albums, members]);

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle="7 artists" />
        <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" subtitle="total production" />
      </div>

      {/* Quick Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-white/40" />
          <h3 className="text-sm font-semibold text-white/70">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {insights.slice(0, 6).map(insight => (
            <div key={insight.id} className="p-5 bg-[#111118] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-all duration-300">
              <p className="text-sm text-white/70 leading-relaxed">{insight.text}</p>
              {insight.value && (
                <p className="text-xl font-semibold text-white/90 mt-2">{insight.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Era Timeline + Title Tracks */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <Disc size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold text-white/70">Era Timeline</h3>
          </div>
          <EraOverview
            albums={albums}
            onNavigateToEra={(era) => onNavigate('discography', era)}
          />
        </div>
        <div className="col-span-4">
          <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Music size={16} className="text-white/40" />
              <h3 className="text-sm font-semibold text-white/70">Title Tracks</h3>
            </div>
            <TitleTrackSpotlight
              songs={songs}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
