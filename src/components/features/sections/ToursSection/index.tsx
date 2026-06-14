import { useState, useRef, Suspense, lazy } from 'react';
import { MapPin, BarChart3, Globe } from 'lucide-react';
import type { Concert } from '../../../../types/database';
import { EditorialPageHeader, GallerySection } from '../../../editorial';


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
  const uniqueCountries = new Set(concerts.map((concert) => concert.country)).size;
  const uniqueTours = new Set(concerts.map((concert) => concert.tour_name)).size;

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
    <div className="space-y-4">
      <EditorialPageHeader
        eyebrow="Geographic Exhibition / Tours"
        title="Tours"
        note="Review concerts by route, city, venue, country, setlist, tour name, and audience scale."
        meta={
          <>
            <span>{concerts.length.toLocaleString()} shows</span>
            <span>{uniqueTours} tours</span>
            <span>{uniqueCountries} countries</span>
          </>
        }
      />

      <div
        ref={tablistRef}
        className="archive-tab-row scroll-fade-x"
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
                className="archive-tab-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                style={{ '--tab-accent': '#10B981' } as React.CSSProperties}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
      </div>

      <GallerySection
        number="01"
        label="Route Records"
        title={TABS.find((tab) => tab.id === activeTab)?.label ?? 'Tour records'}
        claim="Switch between the world map, tour list, and route statistics."
        caption="Use map and list views together: the map shows concentration, the list keeps exact venue records."
      >
        <div
          id="tours-panel"
          className={activeTab === 'map' ? 'overflow-hidden rounded-md' : ''}
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
      </GallerySection>
    </div>
  );
}
