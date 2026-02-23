import { useState, Suspense, lazy } from 'react';
import { BarChart3, TrendingUp, Network, Heart, Sparkles, MessageSquare, BookOpen, Trophy, Calendar } from 'lucide-react';
import type { Song, Album, Member, Lyrics, Award, ChartEntry, Concert, MemberEvent } from '../../../../types/database';

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
  { id: 'audio', label: 'Audio Features', icon: BarChart3 },
  { id: 'era', label: 'Era Evolution', icon: TrendingUp },
  { id: 'writing', label: 'Writing Network', icon: Network },
  { id: 'sentiment', label: 'Sentiment', icon: Heart },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'awards-charts', label: 'Awards & Charts', icon: Trophy },
  { id: 'career', label: 'Career Timeline', icon: Calendar },
  { id: 'qa', label: 'Q&A', icon: MessageSquare },
  { id: 'lyrics', label: 'Lyrics', icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AnalyticsSection({ songs, albums, members, lyrics, awards, chartEntries, concerts, memberEvents }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('audio');

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
    <div className="space-y-6">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2" role="tablist" aria-label="Analytics views">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
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

      <div className="bg-[#111118] rounded-2xl border border-white/[0.06] p-3 md:p-6" role="tabpanel">
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
