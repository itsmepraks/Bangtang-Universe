import { useMemo } from 'react';
import { Music, Disc, Users, PenTool, Lightbulb, Trophy, MapPin, Calendar } from 'lucide-react';
import type { Song, Album, Member, Award, Concert, MemberEvent } from '../../../../types/database';
import StatCard from './StatCard';
import EraOverview from './EraOverview';
import TitleTrackSpotlight from './TitleTrackSpotlight';
import type { DashboardSection } from '../../../../types/index';
import { generateInsights } from '../../../../services/analyticsService';

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards: Award[];
  concerts: Concert[];
  memberEvents: MemberEvent[];
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
}

export default function HomeSection({
  songs, albums, members, awards, concerts, memberEvents, onNavigate,
}: HomeSectionProps) {
  const eras = useMemo(() => [...new Set(albums.map(a => a.era).filter(Boolean))], [albums]);
  const totalKomca = useMemo(() => members.reduce((sum, m) => sum + (m.komca_credits || 0), 0), [members]);
  const insights = useMemo(() => generateInsights(songs, albums, members, awards, concerts), [songs, albums, members, awards, concerts]);
  const awardsWon = useMemo(() => awards.filter(a => a.result === 'won').length, [awards]);
  const uniqueTours = useMemo(() => new Set(concerts.map(c => c.tour_name)).size, [concerts]);

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard label="Songs" value={songs.length} icon={Music} subtitle={`across ${eras.length} eras`} />
        <StatCard label="Albums" value={albums.length} icon={Disc} accent="#818CF8" />
        <StatCard label="Members" value={members.length} icon={Users} accent="#C084FC" subtitle="7 artists" />
        <StatCard label="KOMCA Credits" value={totalKomca} icon={PenTool} accent="#D8B4FE" subtitle="total production" />
        <StatCard label="Awards Won" value={awardsWon} icon={Trophy} accent="#FBBF24" subtitle={`${awards.length} nominations`} />
        <StatCard label="Concerts" value={concerts.length} icon={MapPin} accent="#10B981" subtitle={`${uniqueTours} tours`} />
      </div>

      {/* Quick Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-white/40" />
          <h3 className="text-sm font-semibold text-white/70">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

      {/* Recent Milestones */}
      {memberEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold text-white/70">Recent Milestones</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {memberEvents
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 6)
              .map(event => {
                const member = members.find(m => m.id === event.member_id);
                return (
                  <div key={event.id} className="p-4 bg-[#111118] border border-white/[0.06] rounded-2xl">
                    <div className="text-xs text-white/40 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {member && <span className="ml-2" style={{ color: member.color || '#A855F7' }}>{member.stage_name}</span>}
                    </div>
                    <p className="text-sm text-white/70">{event.title}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Era Timeline + Title Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        <div className="md:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <Disc size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold text-white/70">Era Timeline</h3>
          </div>
          <EraOverview
            albums={albums}
            onNavigateToEra={(era) => onNavigate('discography', era)}
          />
        </div>
        <div className="md:col-span-4">
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
