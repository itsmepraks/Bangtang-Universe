import { useState, Suspense, lazy } from 'react';
import { Trophy, Calendar, BarChart3, LayoutList } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';
import { EditorialPageHeader, GallerySection } from '../../../editorial';


const AwardGrid = lazy(() => import('./AwardGrid'));
const AwardTimeline = lazy(() => import('./AwardTimeline'));
const AwardStats = lazy(() => import('./AwardStats'));
const AwardPodium = lazy(() => import('./AwardPodium'));

interface AwardsSectionProps {
  awards: Award[];
  members: Member[];
}

const TABS = [
  { id: 'grid',     label: 'Trophy Room', icon: Trophy },
  { id: 'podium',   label: 'Podium',      icon: LayoutList },
  { id: 'timeline', label: 'Timeline',    icon: Calendar },
  { id: 'stats',    label: 'Statistics',  icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AwardsSection({ awards, members }: AwardsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('grid');
  const wins = awards.filter((award) => award.result === 'won').length;
  const ceremonies = new Set(awards.map((award) => award.ceremony)).size;

  const renderPanel = () => {
    switch (activeTab) {
      case 'grid':
        return <AwardGrid awards={awards} members={members} />;
      case 'timeline':
        return <AwardTimeline awards={awards} members={members} />;
      case 'podium':
        return <AwardPodium awards={awards} members={members} />;
      case 'stats':
        return <AwardStats awards={awards} members={members} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <EditorialPageHeader
        eyebrow="Recognition Index / Awards"
        title="Awards"
        note="Explore nominations and wins by year, ceremony, category, scope, and member-linked records."
        meta={
          <>
            <span>{wins.toLocaleString()} wins</span>
            <span>{awards.length.toLocaleString()} nominations</span>
            <span>{ceremonies} ceremonies</span>
          </>
        }
      />

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2" role="tablist" aria-label="Awards views">
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
                    ? 'bg-amber-500/15 text-white border border-amber-500/30'
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

      <GallerySection
        number="01"
        label="Award Records"
        title={TABS.find((tab) => tab.id === activeTab)?.label ?? 'Award records'}
        claim="Switch between the trophy list, podium grouping, year timeline, and statistical summary."
        caption="Use the filters inside each view to narrow ceremony, year, category, scope, and result."
      >
        <div role="tabpanel">
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
      </GallerySection>
    </div>
  );
}
