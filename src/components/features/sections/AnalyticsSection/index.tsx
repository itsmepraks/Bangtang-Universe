import { useState, Suspense, lazy, useMemo } from 'react';
// GroupId kept for TABS type alignment
import { BarChart3, TrendingUp, Network, Heart, Sparkles, MessageSquare, BookOpen, Trophy, Calendar, Beaker, Users, Compass } from 'lucide-react';
import type { Song, Album, Member, Lyrics, Award, ChartEntry, Concert, MemberEvent } from '../../../../types/database';
import SectionIntro from '../../../ui/SectionIntro';
import GlossaryTip from '../../../ui/GlossaryTip';

const AudioExplorer = lazy(() => import('./AudioExplorer'));
const EraEvolution = lazy(() => import('./EraEvolution'));
const WritingNetwork = lazy(() => import('./WritingNetwork'));
const SentimentDashboard = lazy(() => import('./SentimentDashboard'));
const SongRecommender = lazy(() => import('./SongRecommender'));
const QAPanel = lazy(() => import('./QAPanel'));
const LyricsPanel = lazy(() => import('./LyricsPanel'));
const AwardsAnalytics = lazy(() => import('./AwardsAnalytics'));
const CareerTimeline = lazy(() => import('./CareerTimeline'));

interface AnalyticsSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  lyrics: Lyrics[];
  awards?: Award[];
  chartEntries?: ChartEntry[];
  concerts?: Concert[];
  memberEvents?: MemberEvent[];
}

type GroupId = 'music' | 'career' | 'explore';

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  group: GroupId;
}

const GROUPS: { id: GroupId; label: string; shortLabel: string; icon: React.ElementType; description: string }[] = [
  { id: 'music', label: 'Music Science', shortLabel: 'Music', icon: Beaker, description: 'Audio features, eras & emotional analysis' },
  { id: 'career', label: 'Credits & Career', shortLabel: 'Career', icon: Users, description: 'Writing credits, awards & milestones' },
  { id: 'explore', label: 'Explore', shortLabel: 'Explore', icon: Compass, description: 'Recommendations, Q&A & lyrics search' },
];

const TABS: TabDef[] = [
  { id: 'audio', label: 'Audio Features', icon: BarChart3, group: 'music' },
  { id: 'era', label: 'Era Evolution', icon: TrendingUp, group: 'music' },
  { id: 'sentiment', label: 'Sentiment', icon: Heart, group: 'music' },
  { id: 'writing', label: 'Writing Network', icon: Network, group: 'career' },
  { id: 'awards-charts', label: 'Awards & Charts', icon: Trophy, group: 'career' },
  { id: 'career', label: 'Career Timeline', icon: Calendar, group: 'career' },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles, group: 'explore' },
  { id: 'qa', label: 'Q&A', icon: MessageSquare, group: 'explore' },
  { id: 'lyrics', label: 'Lyrics', icon: BookOpen, group: 'explore' },
];

export default function AnalyticsSection({ songs, albums, members, lyrics, awards, chartEntries, concerts, memberEvents }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('audio');

  const activeGroup = useMemo(() => TABS.find(t => t.id === activeTab)?.group ?? 'music', [activeTab]);

  const renderPanel = () => {
    switch (activeTab) {
      case 'audio':        return <AudioExplorer songs={songs} albums={albums} />;
      case 'era':          return <EraEvolution songs={songs} albums={albums} />;
      case 'writing':      return <WritingNetwork songs={songs} members={members} />;
      case 'sentiment':    return <SentimentDashboard songs={songs} albums={albums} />;
      case 'recommendations': return <SongRecommender songs={songs} albums={albums} />;
      case 'awards-charts':   return <AwardsAnalytics awards={awards || []} chartEntries={chartEntries || []} songs={songs} />;
      case 'career':       return <CareerTimeline albums={albums} awards={awards || []} concerts={concerts || []} memberEvents={memberEvents || []} />;
      case 'qa':           return <QAPanel songs={songs} albums={albums} members={members} awards={awards} chartEntries={chartEntries} concerts={concerts} memberEvents={memberEvents} />;
      case 'lyrics':       return <LyricsPanel lyrics={lyrics} songs={songs} albums={albums} />;
      default:             return null;
    }
  };

  return (
    <div className="space-y-4">
      <SectionIntro
        description={
          <>
            Deep-dive into BTS's music through data. Explore audio features like{' '}
            <GlossaryTip term="energy" />, <GlossaryTip term="valence" />, and{' '}
            <GlossaryTip term="BPM" /> across <GlossaryTip term="era">eras</GlossaryTip>,
            trace the writing network, or discover songs by mood.
          </>
        }
      />

      {/* Single-row navigation: group pills + all tabs */}
      <div className="space-y-2">
        {/* Group pills — compact segmented control */}
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
          {GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  const firstTab = TABS.find(t => t.group === group.id);
                  if (firstTab) setActiveTab(firstTab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                    : 'text-white/40 hover:text-white/70 border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{group.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for active group */}
        <div className="relative">
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Analytics views">
            {TABS.filter(t => t.group === activeGroup).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/45 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        className="bg-[#111118] rounded-2xl border border-white/[0.06] p-3 md:p-5"
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          }
        >
          {renderPanel()}
        </Suspense>
      </div>
    </div>
  );
}
