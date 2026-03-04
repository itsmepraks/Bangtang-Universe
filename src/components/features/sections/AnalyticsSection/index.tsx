import { useState, Suspense, lazy, useMemo } from 'react';
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
  const [activeGroup, setActiveGroup] = useState<GroupId>('music');
  const [activeTab, setActiveTab] = useState<string>('audio');

  const groupTabs = useMemo(() => TABS.filter(t => t.group === activeGroup), [activeGroup]);

  const handleGroupChange = (group: GroupId) => {
    setActiveGroup(group);
    // Switch to first tab of the new group
    const firstTab = TABS.find(t => t.group === group);
    if (firstTab) setActiveTab(firstTab.id);
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'audio':
        return <AudioExplorer songs={songs} albums={albums} />;
      case 'era':
        return <EraEvolution songs={songs} albums={albums} />;
      case 'writing':
        return <WritingNetwork songs={songs} members={members} />;
      case 'sentiment':
        return <SentimentDashboard songs={songs} albums={albums} />;
      case 'recommendations':
        return <SongRecommender songs={songs} albums={albums} />;
      case 'awards-charts':
        return <AwardsAnalytics awards={awards || []} chartEntries={chartEntries || []} songs={songs} />;
      case 'career':
        return <CareerTimeline albums={albums} awards={awards || []} concerts={concerts || []} memberEvents={memberEvents || []} />;
      case 'qa':
        return <QAPanel songs={songs} albums={albums} members={members} awards={awards} chartEntries={chartEntries} concerts={concerts} memberEvents={memberEvents} />;
      case 'lyrics':
        return <LyricsPanel lyrics={lyrics} songs={songs} albums={albums} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
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

      {/* Row 1: Group selector */}
      <div className="grid grid-cols-3 gap-2">
        {GROUPS.map((group) => {
          const Icon = group.icon;
          const isActive = activeGroup === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupChange(group.id)}
              className={`flex flex-col items-start gap-1 px-3 sm:px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
                isActive
                  ? 'bg-purple-500/8 border-purple-500/25 shadow-[inset_0_1px_0_0_rgba(168,85,247,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10]'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-400' : 'text-white/35'}`} />
                <span className={`text-xs font-semibold tracking-wide truncate ${isActive ? 'text-white/90' : 'text-white/50'}`}>
                  <span className="sm:hidden">{group.shortLabel}</span>
                  <span className="hidden sm:inline">{group.label}</span>
                </span>
              </div>
              <span className="text-[10px] text-white/30 leading-tight hidden sm:block">
                {group.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2: Sub-tabs for active group */}
      <div className="relative">
        {/* Scroll fade hint */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Analytics views">
          {groupTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`analytics-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls="analytics-tabpanel"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'bg-purple-500/10 text-white border border-purple-500/30'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div
        id="analytics-tabpanel"
        role="tabpanel"
        aria-labelledby={`analytics-tab-${activeTab}`}
        className="bg-[#111118] rounded-2xl border border-white/[0.06] p-3 md:p-6"
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
