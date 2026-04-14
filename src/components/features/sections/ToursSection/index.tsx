import { useState, useRef, Suspense, lazy } from 'react';
import { MapPin, BarChart3, Globe } from 'lucide-react';
import type { Concert } from '../../../../types/database';


const TourList = lazy(() => import('./TourList'));
const TourStats = lazy(() => import('./TourStats'));
const TourMap = lazy(() => import('./TourMap'));

interface ToursSectionProps {
  concerts: Concert[];
}

const TABS = [
  { id: 'map', label: 'World Map', icon: Globe },
  { id: 'list', label: 'Tour List', icon: MapPin },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ToursSection({ concerts }: ToursSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const tablistRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next !== null) {
      e.preventDefault();
      const nextId = TABS[next].id;
      setActiveTab(nextId);
      requestAnimationFrame(() => {
        tablistRef.current
          ?.querySelector<HTMLButtonElement>(`[data-tab-id="${nextId}"]`)
          ?.focus();
      });
    }
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'list':
        return <TourList concerts={concerts} />;
      case 'stats':
        return <TourStats concerts={concerts} />;
      case 'map':
        return <TourMap concerts={concerts} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto scrollbar-hide scroll-fade-x">
        <div
          ref={tablistRef}
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Tours views"
          onKeyDown={handleTabKeyDown}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls="tours-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                  isActive
                    ? 'bg-purple-500/10 text-white border border-purple-500/30'
                    : 'text-white/60 hover:text-white/85 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="tours-panel"
        className={`bg-[#111118] rounded-2xl border border-white/[0.06] ${activeTab === 'map' ? 'p-0 overflow-hidden' : 'p-4 sm:p-6'}`}
        role="tabpanel"
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
