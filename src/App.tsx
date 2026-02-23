import { useState, useEffect, useMemo, Suspense, lazy } from 'react';

// Import data and hooks
import { useMembers, useSongs, useAlbums, useLyrics, useAwards, useChartEntries, useConcerts, useMemberEvents } from './hooks';
import type { DashboardSection, DiscographyState } from './types/index';

// Lightweight components - imported directly
import {
  BTSLogo,
} from './components';
import { Breadcrumb } from './components/ui';

// Heavy components - lazy loaded for code-splitting
const Universe3D = lazy(() => import('./components/features/Universe3D'));
const LandingRitual = lazy(() => import('./components/features/LandingRitual'));
const MemberDNA = lazy(() => import('./components/features/MemberDNA'));
const SectionTransition = lazy(() => import('./components/features/sections/SectionTransition'));

// Section components - lazy loaded
const HomeSection = lazy(() => import('./components/features/sections/HomeSection'));
const DiscographySection = lazy(() => import('./components/features/sections/Discography'));
const MembersSection = lazy(() => import('./components/features/sections/MembersSection'));
const AnalyticsSection = lazy(() => import('./components/features/sections/AnalyticsSection'));
const SearchSection = lazy(() => import('./components/features/sections/SearchSection'));
const AwardsSection = lazy(() => import('./components/features/sections/AwardsSection'));
const ToursSection = lazy(() => import('./components/features/sections/ToursSection'));

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      <span className="text-xs text-white/50 tracking-wider uppercase font-mono">Loading...</span>
    </div>
  </div>
);

const SectionSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

import {
  BarChart3,
  Search,
  Home,
  Disc,
  Users,
  Trophy,
  MapPin,
  Menu,
  X,
} from 'lucide-react';

const SECTION_TITLES: Record<DashboardSection, string> = {
  overview: 'Overview',
  discography: 'Discography',
  members: 'Members',
  analytics: 'Analytics',
  awards: 'Awards',
  tours: 'Tours',
  search: 'Search',
};

const NAV_ITEMS: { id: DashboardSection; icon: React.ElementType; label: string }[] = [
  { id: 'overview', icon: Home, label: 'Overview' },
  { id: 'discography', icon: Disc, label: 'Discography' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'awards', icon: Trophy, label: 'Awards' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'search', icon: Search, label: 'Search' },
];

// --- MAIN APPLICATION ---
export default function App() {
  const [mode, setMode] = useState<'landing' | 'warp' | 'dashboard'>('landing');
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  // New state for expanded sections
  const [discographyState, setDiscographyState] = useState<DiscographyState>({
    selectedAlbumId: null, selectedSongId: null, view: 'grid',
  });
  const [memberSectionId, setMemberSectionId] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string | null>(null);

  // Database hooks
  const { songs, loading: songsLoading } = useSongs();
  const { albums, loading: albumsLoading } = useAlbums();
  const { members, loading: membersLoading } = useMembers();
  const { lyrics } = useLyrics();
  const { awards, loading: awardsLoading } = useAwards();
  const { chartEntries } = useChartEntries();
  const { concerts, loading: concertsLoading } = useConcerts();
  const { memberEvents } = useMemberEvents();

  const dataLoading = songsLoading || albumsLoading || membersLoading || awardsLoading || concertsLoading;

  const handleSync = () => {
    setMode('dashboard');
  };

  // Cross-section navigation
  const navigateTo = (section: DashboardSection, payload?: unknown) => {
    setActiveSection(section);
    if (section === 'discography') {
      if (typeof payload === 'number') {
        setDiscographyState({ selectedAlbumId: payload, selectedSongId: null, view: 'album' });
        setEraFilter(null);
      } else if (typeof payload === 'string') {
        setDiscographyState({ selectedAlbumId: null, selectedSongId: null, view: 'grid' });
        setEraFilter(payload);
      } else {
        setEraFilter(null);
      }
    }
    if (section === 'members' && typeof payload === 'string') {
      setMemberSectionId(payload);
    }
  };

  // Derive breadcrumb items from current state
  const selectedAlbum = useMemo(() => albums.find(a => a.id === discographyState.selectedAlbumId) || null, [albums, discographyState.selectedAlbumId]);
  const selectedSong = useMemo(() => songs.find(s => s.id === discographyState.selectedSongId) || null, [songs, discographyState.selectedSongId]);
  const selectedMember = useMemo(() => members.find(m => m.id === memberSectionId) || null, [members, memberSectionId]);

  const breadcrumbs = useMemo(() => {
    const items: { label: string; onClick?: () => void }[] = [
      {
        label: SECTION_TITLES[activeSection],
        onClick: () => {
          if (activeSection === 'discography') setDiscographyState({ selectedAlbumId: null, selectedSongId: null, view: 'grid' });
          if (activeSection === 'members') setMemberSectionId(null);
        },
      },
    ];

    if (activeSection === 'discography') {
      if (selectedAlbum) {
        items.push({
          label: selectedAlbum.title,
          onClick: () => setDiscographyState({ selectedAlbumId: selectedAlbum.id, selectedSongId: null, view: 'album' }),
        });
      }
      if (selectedSong) {
        items.push({ label: selectedSong.title });
      }
    }

    if (activeSection === 'members' && selectedMember) {
      items.push({ label: selectedMember.stage_name });
    }

    return items;
  }, [activeSection, selectedAlbum, selectedSong, selectedMember]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white">

      {/* 1. UNIVERSE LAYER - Only shown during landing */}
      {mode !== 'dashboard' && (
        <Suspense fallback={<LoadingFallback />}>
          <Universe3D mode={mode} />
        </Suspense>
      )}

      {/* 2. LANDING */}
      <Suspense fallback={<LoadingFallback />}>
        {mode === 'landing' && <LandingRitual onSync={handleSync} />}
      </Suspense>

      {/* 3. DASHBOARD */}
      {mode === 'dashboard' && !activeMemberId && (
        <div className="absolute inset-0 z-10 flex animate-in fade-in zoom-in-95 duration-1000">

          {/* Dashboard Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)', filter: 'blur(100px)' }} />
          </div>

          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 w-56 bg-[#0c0c12] border-r border-white/[0.06] flex flex-col py-6 px-4 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:transition-none`}>
            <div
              onClick={() => setMode('landing')}
              className="flex items-center gap-3 px-2 mb-8 group cursor-pointer"
            >
              <BTSLogo className="w-7 h-7 text-white group-hover:scale-105 transition-transform duration-300" />
              <span className="text-sm font-semibold text-white/80">Bangtan Universe</span>
            </div>

            <nav aria-label="Main navigation" className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 w-full text-left ${
                    activeSection === item.id
                      ? 'bg-purple-500/10 text-white shadow-[inset_3px_0_0_0_#A855F7]'
                      : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/[0.06] space-y-1.5 px-2 mb-4">
              {dataLoading ? (
                <>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
                  ))}
                </>
              ) : (
                <>
                  <div className="text-xs text-white/40">{songs.length} songs</div>
                  <div className="text-xs text-white/40">{albums.length} albums</div>
                  <div className="text-xs text-white/40">{members.length} members</div>
                  <div className="text-xs text-white/40">{awards.length} awards</div>
                  <div className="text-xs text-white/40">{concerts.length} concerts</div>
                </>
              )}
            </div>

          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">

            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 md:px-8 bg-[#0c0c12]/50 border-b border-white/[0.06]">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(prev => !prev)}
                  className="md:hidden p-2 -ml-2 mr-2 text-white/60 hover:text-white"
                  aria-label="Toggle navigation"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Breadcrumb items={breadcrumbs} />
              </div>
            </header>

            {/* Main Views */}
            <main className="flex-1 p-4 md:p-8 pb-16 overflow-y-auto relative pretty-scrollbar">
              <Suspense fallback={<SectionSpinner />}>
                <SectionTransition sectionKey={activeSection}>

                  {activeSection === 'overview' && (
                    <HomeSection
                      songs={songs}
                      albums={albums}
                      members={members}
                      awards={awards}
                      concerts={concerts}
                      memberEvents={memberEvents}
                      onNavigate={navigateTo}
                    />
                  )}

                  {activeSection === 'discography' && (
                    <DiscographySection
                      songs={songs}
                      albums={albums}
                      discographyState={discographyState}
                      onSetDiscographyState={setDiscographyState}
                      eraFilter={eraFilter}
                    />
                  )}

                  {activeSection === 'members' && (
                    <MembersSection
                      members={members}
                      songs={songs}
                      albums={albums}
                      selectedMemberId={memberSectionId}
                      onSelectMember={setMemberSectionId}
                      onOpenFullProfile={(id) => setActiveMemberId(id)}
                    />
                  )}

                  {activeSection === 'analytics' && (
                    <AnalyticsSection
                      songs={songs}
                      albums={albums}
                      members={members}
                      lyrics={lyrics}
                      awards={awards}
                      chartEntries={chartEntries}
                      concerts={concerts}
                      memberEvents={memberEvents}
                    />
                  )}

                  {activeSection === 'awards' && (
                    <AwardsSection awards={awards} members={members} />
                  )}

                  {activeSection === 'tours' && (
                    <ToursSection concerts={concerts} />
                  )}

                  {activeSection === 'search' && (
                    <SearchSection
                      onSelectSong={() => navigateTo('analytics')}
                      onNavigate={navigateTo}
                    />
                  )}

                </SectionTransition>
              </Suspense>
            </main>
          </div>
        </div>
      )}

      {/* 4. MEMBER DETAIL OVERLAY (FULL SCREEN) */}
      <Suspense fallback={<LoadingFallback />}>
        {activeMemberId && (
          <MemberDNA memberId={activeMemberId} onClose={() => setActiveMemberId(null)} />
        )}
      </Suspense>


    </div>
  );
}
