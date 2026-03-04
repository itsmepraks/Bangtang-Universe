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

const TABS = [
  { id: 'audio', label: 'Audio Features', icon: BarChart3, group: 'music' },
  { id: 'era', label: 'Era Evolution', icon: TrendingUp, group: 'music' },
  { id: 'sentiment', label: 'Sentiment', icon: Heart, group: 'music' },
  { id: 'writing', label: 'Writing Network', icon: Network, group: 'career' },
  { id: 'awards-charts', label: 'Awards & Charts', icon: Trophy, group: 'career' },
  { id: 'career', label: 'Career Timeline', icon: Calendar, group: 'career' },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles, group: 'explore' },
  { id: 'qa', label: 'Q&A', icon: MessageSquare, group: 'explore' },
  { id: 'lyrics', label: 'Lyrics', icon: BookOpen, group: 'explore' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AnalyticsSection({ songs, albums, members, lyrics, awards, chartEntries, concerts, memberEvents }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('audio');

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

      {/* Flat single-row tab strip */}
      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
        <div
          className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide border-b border-white/[0.06]"
          role="tablist"
          aria-label="Analytics views"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const prevTab = TABS[index - 1];
            const showDivider = index > 0 && prevTab?.group !== tab.group;
            return (
              <div key={tab.id} className="flex items-center flex-shrink-0">
                {showDivider && (
                  <span className="w-px h-4 bg-white/[0.10] mx-2 flex-shrink-0" aria-hidden="true" />
                )}
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="analytics-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px ${
                    isActive
                      ? 'text-white border-purple-500'
                      : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {tab.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id="analytics-panel"
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
