import { useState, Suspense, lazy } from 'react';
import { BarChart3, TrendingUp, Network, Heart, Sparkles, MessageSquare, BookOpen, Trophy, Calendar } from 'lucide-react';
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

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  group: 'music' | 'career' | 'explore';
}

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

const GROUP_LABELS: Record<string, string> = {
  music: 'Music Science',
  career: 'Credits & Career',
  explore: 'Explore',
};

export default function AnalyticsSection({ songs, albums, members, lyrics, awards, chartEntries, concerts, memberEvents }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('audio');

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

  // Build grouped tab bar with dividers
  let lastGroup = '';
  const tabElements: React.ReactNode[] = [];
  for (const tab of TABS) {
    if (tab.group !== lastGroup) {
      if (lastGroup !== '') {
        tabElements.push(
          <span key={`div-${tab.group}`} className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />,
        );
      }
      tabElements.push(
        <span key={`lbl-${tab.group}`} className="text-[9px] text-white/25 uppercase tracking-widest font-medium px-1 shrink-0 hidden md:inline">
          {GROUP_LABELS[tab.group]}
        </span>,
      );
      lastGroup = tab.group;
    }
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    tabElements.push(
      <button
        key={tab.id}
        id={`analytics-tab-${tab.id}`}
        role="tab"
        aria-selected={isActive}
        aria-controls="analytics-tabpanel"
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 ${
          isActive
            ? 'bg-purple-500/10 text-white border border-purple-500/30'
            : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
        }`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span className="whitespace-nowrap">{tab.label}</span>
      </button>,
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2" role="tablist" aria-label="Analytics views">
          {tabElements}
        </div>
      </div>

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
