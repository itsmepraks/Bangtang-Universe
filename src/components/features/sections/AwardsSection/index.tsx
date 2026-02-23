import { useState, Suspense, lazy } from 'react';
import { Trophy, Calendar, BarChart3 } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';

const AwardGrid = lazy(() => import('./AwardGrid'));
const AwardTimeline = lazy(() => import('./AwardTimeline'));
const AwardStats = lazy(() => import('./AwardStats'));

interface AwardsSectionProps {
  awards: Award[];
  members: Member[];
}

const TABS = [
  { id: 'grid', label: 'Trophy Room', icon: Trophy },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AwardsSection({ awards, members }: AwardsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('grid');

  const renderPanel = () => {
    switch (activeTab) {
      case 'grid':
        return <AwardGrid awards={awards} members={members} />;
      case 'timeline':
        return <AwardTimeline awards={awards} members={members} />;
      case 'stats':
        return <AwardStats awards={awards} members={members} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-500/10 text-white border border-purple-500/30'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6">
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
