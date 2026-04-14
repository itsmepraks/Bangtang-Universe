import { useState, useEffect, useRef, Suspense, lazy } from 'react';
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
  initialTab?: string | null;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: 'audio', label: 'Explore audio features', icon: BarChart3, group: 'music' },
  { id: 'era', label: 'How sound changed by era', icon: TrendingUp, group: 'music' },
  { id: 'sentiment', label: 'Mood over time', icon: Heart, group: 'music' },
  { id: 'writing', label: 'Who wrote with whom', icon: Network, group: 'career' },
  { id: 'awards-charts', label: 'Awards & chart history', icon: Trophy, group: 'career' },
  { id: 'career', label: 'Career timeline', icon: Calendar, group: 'career' },
  { id: 'recommendations', label: 'Find songs like…', icon: Sparkles, group: 'explore' },
  { id: 'qa', label: 'Ask about BTS', icon: MessageSquare, group: 'explore' },
  { id: 'lyrics', label: 'Lyric themes by era', icon: BookOpen, group: 'explore' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AnalyticsSection({ songs, albums, members, lyrics, awards, chartEntries, concerts, memberEvents, initialTab, onTabChange }: AnalyticsSectionProps) {
  const isValidTabId = (v: string | null | undefined): v is TabId =>
    !!v && TABS.some((t) => t.id === v);
  const [activeTab, setActiveTab] = useState<TabId>(
    isValidTabId(initialTab) ? initialTab : 'audio',
  );
  // Re-sync when hash-driven initialTab changes from outside
  useEffect(() => {
    if (isValidTabId(initialTab) && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);
  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    onTabChange?.(id);
  };

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
      {/* Flat single-row tab strip — keyboard-navigable via arrow keys */}
      <AnalyticsTabStrip
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

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

// ── Tab strip with arrow-key navigation (WAI-ARIA tablist pattern) ─────────
function AnalyticsTabStrip({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: typeof TABS;
  activeTab: TabId;
  onChange: (id: TabId) => void;
}) {
  const tablistRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIdx = tabs.findIndex((t) => t.id === activeTab);
    if (currentIdx < 0) return;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;
    if (nextIdx !== null) {
      e.preventDefault();
      onChange(tabs[nextIdx].id);
      requestAnimationFrame(() => {
        tablistRef.current
          ?.querySelector<HTMLButtonElement>(`[data-tab-id="${tabs[nextIdx!].id}"]`)
          ?.focus();
      });
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
      <div
        ref={tablistRef}
        className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide border-b border-white/[0.06]"
        role="tablist"
        aria-label="Analytics views"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const prevTab = tabs[index - 1];
          const showDivider = index > 0 && prevTab?.group !== tab.group;
          return (
            <div key={tab.id} className="flex items-center flex-shrink-0">
              {showDivider && (
                <span className="w-px h-4 bg-white/[0.10] mx-2 flex-shrink-0" aria-hidden="true" />
              )}
              <button
                data-tab-id={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls="analytics-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0 rounded-sm ${
                  isActive
                    ? 'text-white border-purple-500'
                    : 'text-white/55 border-transparent hover:text-white/80 hover:border-white/20'
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
  );
}
