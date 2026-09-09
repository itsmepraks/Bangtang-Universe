import { useState, useEffect, useRef, Suspense, lazy } from 'react';

import { useMembers, useSongs, useAlbums, useLyrics, useAwards, useChartEntries, useConcerts, useMemberEvents, useMedia } from './hooks';
import { useArchiveNavigation } from './hooks/useArchiveNavigation';
import ResourceState from './components/ui/ResourceState';
import type { DashboardSection, DiscographyState } from './types/index';
import { SECTION_ACCENTS } from './constants/colors';

import {
  BTSLogo,
} from './components';
import { DataStatusBanner, DotLoader } from './components/ui';

const Universe3D = lazy(() => import('./components/features/Universe3D'));
const LandingRitual = lazy(() => import('./components/features/LandingRitual'));
const MemberDNA = lazy(() => import('./components/features/MemberDNA'));
const SectionTransition = lazy(() => import('./components/features/sections/SectionTransition'));

const HomeSection = lazy(() => import('./components/features/sections/HomeSection'));
const DiscographySection = lazy(() => import('./components/features/sections/Discography'));
const MembersSection = lazy(() => import('./components/features/sections/MembersSection'));
const AnalyticsSection = lazy(() => import('./components/features/sections/AnalyticsSection'));
const SearchSection = lazy(() => import('./components/features/sections/SearchSection'));
const AwardsSection = lazy(() => import('./components/features/sections/AwardsSection'));
const ToursSection = lazy(() => import('./components/features/sections/ToursSection'));
const MediaSection = lazy(() => import('./components/features/sections/MediaSection'));
const OnboardingFlow = lazy(() => import('./components/features/OnboardingFlow'));
const CommandPalette = lazy(() => import('./components/features/CommandPalette'));
const DelightLayer = lazy(() => import('./components/features/DelightLayer'));

const LoadingFallback = () => (
  <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center">
    <DotLoader tone="gradient" size="md" />
  </div>
);

const SectionSpinner = () => (
  <div className="flex items-center justify-center h-full py-20">
    <DotLoader />
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
  Film,
  Menu,
  X,
  Info,
  Settings2,
} from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Burning midnight oil, ARMY';
  if (h < 12) return 'Good morning, ARMY';
  if (h < 17) return 'Good afternoon, ARMY';
  if (h < 22) return 'Good evening, ARMY';
  return 'Night owl, ARMY';
}

// Concert-mode background bokeh — fixed positions so the field looks
// composed rather than random per render. Mix of brand purple, soft
// lavender, and the occasional member-color highlight.
const CONCERT_BOMBS = [
  { x:  6, y:  4, size: 130, color: '#A855F7', blur: 36, delay:  0,    duration: 22 },
  { x: 18, y:  8, size:  90, color: '#C084FC', blur: 28, delay:  3.5,  duration: 19 },
  { x: 28, y:  2, size: 110, color: '#8B5CF6', blur: 32, delay:  6.2,  duration: 24 },
  { x: 41, y: 10, size: 100, color: '#EC4899', blur: 30, delay:  1.8,  duration: 21 },
  { x: 55, y:  3, size: 140, color: '#A855F7', blur: 38, delay:  9,    duration: 25 },
  { x: 68, y:  9, size:  85, color: '#FBBF24', blur: 26, delay:  4.4,  duration: 20 },
  { x: 78, y:  5, size: 115, color: '#9333EA', blur: 32, delay:  7.8,  duration: 23 },
  { x: 88, y:  1, size:  95, color: '#D8B4FE', blur: 28, delay: 11.5,  duration: 22 },
  { x: 94, y: 12, size: 105, color: '#2563EB', blur: 30, delay:  2.6,  duration: 24 },
  { x: 12, y: 14, size:  80, color: '#34D399', blur: 24, delay: 13,    duration: 20 },
];

const NAV_ITEMS: { id: DashboardSection; icon: React.ElementType; label: string }[] = [
  { id: 'overview', icon: Home, label: 'Overview' },
  { id: 'discography', icon: Disc, label: 'Discography' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'awards', icon: Trophy, label: 'Awards' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'media', icon: Film, label: 'Media' },
  { id: 'search', icon: Search, label: 'Search' },
];

export default function App() {
  const [mode, setMode] = useState<'landing' | 'warp' | 'onboarding' | 'dashboard'>(() => {
    if (window.location.hash === '#/landing') return 'landing';
    if (/^#\/(overview|discography|members|analytics|awards|tours|media|search)(?:[/?]|$)/.test(window.location.hash)) return 'dashboard';
    try { if (localStorage.getItem('bts-onboarded') === '1') return 'dashboard'; } catch { /* storage unavailable */ }
    return 'landing';
  });
  const { route, navigate } = useArchiveNavigation();
  const activeSection = route.section;
  const discographyState = route.discography;
  const setDiscographyState = (discography: DiscographyState) => navigate({ discography });
  const memberSectionId = route.memberId;
  const setMemberSectionId = (memberId: string | null) => navigate({ memberId });
  const analyticsTabFromHash = route.analyticsTab;
  const setAnalyticsTabFromHash = (analyticsTab: string) => navigate({ analyticsTab });
  const mainRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());
  const scrollKey = `${activeSection}/${discographyState.view}/${discographyState.selectedAlbumId}/${discographyState.selectedSongId}/${memberSectionId}`;
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [concertMode, setConcertMode] = useState(false);

  // ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close mobile sidebar when navigating.
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const drawer = drawerRef.current;
    const controls = () => Array.from(drawer?.querySelectorAll<HTMLElement>('button, a[href]') ?? []);
    controls()[0]?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); previous?.focus(); };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!projectMenuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setProjectMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [projectMenuOpen]);

  const { songs, error: songsError, refetch: refetchSongs } = useSongs();
  const { albums, error: albumsError, refetch: refetchAlbums } = useAlbums();
  const { members, error: membersError, refetch: refetchMembers } = useMembers();
  const { lyrics, error: lyricsError, refetch: refetchLyrics } = useLyrics(mode === 'dashboard' && activeSection === 'analytics');
  const { awards, loading: awardsLoading, error: awardsError, refetch: refetchAwards } = useAwards();
  const { chartEntries, error: chartEntriesError, refetch: refetchChartEntries } = useChartEntries(mode === 'dashboard' && activeSection === 'analytics');
  const { concerts, loading: concertsLoading, error: concertsError, refetch: refetchConcerts } = useConcerts();
  const { memberEvents, error: memberEventsError, refetch: refetchMemberEvents } = useMemberEvents(mode === 'dashboard' && activeSection === 'analytics');
  const { media, loading: mediaLoading, error: mediaError, refetch: refetchMedia } = useMedia(mode === 'dashboard' && activeSection === 'media');

  const hasDataError = Boolean(
    songsError || albumsError || membersError || lyricsError || awardsError ||
    chartEntriesError || concertsError || memberEventsError || mediaError
  );
  const [retrying, setRetrying] = useState(false);
  const handleRetryData = async () => {
    setRetrying(true);
    try {
      await Promise.allSettled([
        refetchSongs(), refetchAlbums(), refetchMembers(), refetchLyrics(),
        refetchAwards(), refetchChartEntries(), refetchConcerts(),
        refetchMemberEvents(), refetchMedia(),
      ]);
    } finally {
      setRetrying(false);
    }
  };

  const handleSync = () => {
    if (window.location.hash === '#/landing') navigate({});
    try {
      if (localStorage.getItem('bts-onboarded') === '1') {
        setMode('dashboard');
        return;
      }
    } catch { /* noop */ }
    setMode('onboarding');
  };

  const navigateTo = (section: DashboardSection, payload?: string | number) => {
    if (section === 'discography') {
      navigate({ section, discography: { selectedAlbumId: typeof payload === 'number' ? payload : null, selectedSongId: null, view: typeof payload === 'number' ? 'album' : 'grid' },
        filters: typeof payload === 'string' ? { category: 'all', type: null, era: payload } : route.filters });
    } else if (section === 'members') {
      navigate({ section, memberId: typeof payload === 'string' ? payload : null });
    } else if (section === 'search' && typeof payload === 'string') {
      navigate({ section, searchMood: payload.startsWith('mood:') ? payload.slice(5) : null, searchQuery: payload.startsWith('mood:') ? '' : payload });
    } else navigate({ section });
  };
  const selectSong = (song: { id: number; album_id: number | null }) => {
    navigate({ section: 'discography', discography: { selectedAlbumId: song.album_id, selectedSongId: song.id, view: 'song' } });
  };

  return (
    <div className="relative w-screen h-dvh bg-[#0a0a0f] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white noise-texture">

      {/* Universe layer — landing/warp only */}
      {mode === 'warp' && (
        <Suspense fallback={<LoadingFallback />}>
          <Universe3D mode={mode} />
        </Suspense>
      )}

      <Suspense fallback={<LoadingFallback />}>
        {mode === 'landing' && <LandingRitual onSync={handleSync} />}
      </Suspense>

      {mode === 'onboarding' && (
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingFlow onComplete={() => setMode('dashboard')} />
        </Suspense>
      )}

      {mode === 'dashboard' && !activeMemberId && (
        <div className="editorial-dashboard absolute inset-0 z-10 flex">
          {/* Skip link — visible only on keyboard focus */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-purple-500 focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
          >
            Skip to main content
          </a>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={`absolute top-[15%] right-[5%] w-[35%] h-[35%] rounded-full ${concertMode ? 'opacity-[0.12]' : 'opacity-[0.03]'}`}
              style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)', filter: 'blur(80px)' }} />
            <div className={`absolute bottom-[20%] left-[10%] w-[30%] h-[30%] rounded-full ${concertMode ? 'opacity-[0.12]' : 'opacity-[0.03]'}`}
              style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)', filter: 'blur(80px)' }} />

            {/* Concert mode — drifting ARMY-bomb bokeh layer. Renders only
                when the toggle is on; orbs slowly float up the viewport
                like fans waving light sticks. Static array so positions
                stay stable; the keyframe handles the motion. */}
            {concertMode && CONCERT_BOMBS.map((b, i) => (
              <div
                key={i}
                className="concert-bomb"
                style={{
                  left: `${b.x}%`,
                  bottom: `${b.y}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  background: `radial-gradient(circle, ${b.color} 0%, ${b.color}80 30%, transparent 70%)`,
                  filter: `blur(${b.blur}px)`,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.duration}s`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Concert mode — thin LED strip across the top of the viewport.
              Slides member-color gradient sideways; subtle but signals
              "the show is on." */}
          {concertMode && <div className="concert-led-strip" aria-hidden="true" />}

          {sidebarOpen && (
            <div className="fixed inset-0 z-40 xl:hidden">
              <div className="absolute inset-0 bg-black/65" onClick={() => setSidebarOpen(false)} />
              <aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Site navigation" className="absolute inset-y-0 left-0 w-[min(88vw,360px)] bg-[#12100e] border-r border-[var(--editorial-border-soft)] px-5 py-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BTSLogo className="w-7 h-7 text-white" />
                    <div>
                      <p className="text-sm font-semibold text-white/90 leading-tight">Bangtan Universe</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Collection index</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="grid h-11 w-11 place-items-center rounded-md border border-white/[0.08] text-white/55 hover:text-white"
                    aria-label="Close collection index"
                  >
                    <X size={17} />
                  </button>
                </div>
                <nav aria-label="Collection navigation" className="mt-8 grid gap-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          navigateTo(item.id);
                          setSidebarOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center justify-between border-b border-white/[0.07] px-1 py-3 text-left transition-colors ${
                          isActive ? 'text-white' : 'text-white/55 hover:text-white/85'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-sm font-medium">{item.label}</span>
                        </span>
                        <item.icon size={15} aria-hidden="true" />
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-8 grid gap-2 border-t border-white/[0.08] pt-5">
                  <button
                    type="button"
                    onClick={() => setConcertMode(c => !c)}
                    aria-pressed={concertMode}
                    className="flex items-center justify-between rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/65 hover:text-white"
                  >
                    <span>Concert mode</span>
                    <span>{concertMode ? 'On' : 'Off'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      setMode('onboarding');
                    }}
                    className="flex items-center gap-2 rounded-md border border-white/[0.08] px-3 py-2 text-xs text-white/65 hover:text-white"
                  >
                    <Info size={14} />
                    About this project
                  </button>
                </div>
              </aside>
            </div>
          )}

          <div inert={sidebarOpen || paletteOpen} className="flex-1 flex flex-col min-w-0 relative z-10">

            <header className="flex flex-col border-b border-[var(--editorial-border-soft)] bg-[#100f0d]/88 backdrop-blur-xl">
              <div className="min-h-16 flex items-center justify-between gap-4 px-4 md:px-8">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="xl:hidden grid h-11 w-11 place-items-center rounded-md border border-white/[0.08] text-white/60 hover:text-white"
                    aria-label="Open navigation"
                    aria-expanded={sidebarOpen}
                  >
                    <Menu size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('landing')}
                    className="hidden sm:flex items-center gap-3 text-left group min-w-0"
                    aria-label="Return to landing page"
                  >
                    <BTSLogo className="w-7 h-7 text-white group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white/90 leading-tight truncate">Bangtan Universe</span>
                      <span className="block text-[10px] uppercase tracking-[0.16em] text-white/42 leading-tight truncate">{getGreeting()}</span>
                    </span>
                  </button>
                </div>

                <nav aria-label="Collection navigation" className="hidden xl:flex items-center justify-center gap-1 flex-1">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    const accent = SECTION_ACCENTS[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative px-3 py-5 text-sm font-medium transition-colors ${
                          isActive ? 'text-white' : 'text-white/65 hover:text-white'
                        }`}
                      >
                        {item.label}
                        <span
                          className={`absolute inset-x-3 bottom-0 h-px transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                          style={{ backgroundColor: accent }}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaletteOpen(true)}
                    className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/50 hover:bg-white/[0.045] hover:text-white/80 transition-colors"
                    aria-label="Open command palette"
                  >
                    <Search size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Search</span>
                    <kbd className="hidden sm:inline-block rounded border border-white/[0.08] bg-white/[0.045] px-1 text-[10px] font-mono">⌘ K</kbd>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProjectMenuOpen(open => !open)}
                      className="grid h-11 w-11 place-items-center rounded-md border border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.045] hover:text-white/80 transition-colors"
                      aria-label="Open project menu"
                      aria-expanded={projectMenuOpen}
                    >
                      <Settings2 size={15} />
                    </button>
                    {projectMenuOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[var(--editorial-border-soft)] bg-[#15120f] p-2 shadow-2xl">
                        <button
                          type="button"
                          onClick={() => setConcertMode(c => !c)}
                          aria-pressed={concertMode}
                          className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-xs text-white/62 hover:bg-white/[0.045] hover:text-white"
                        >
                          <span>Concert mode</span>
                          <span className="text-white/38">{concertMode ? 'On' : 'Off'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectMenuOpen(false);
                            setMode('onboarding');
                          }}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs text-white/62 hover:bg-white/[0.045] hover:text-white"
                        >
                          <Info size={14} />
                          About this project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DataStatusBanner
                hasError={hasDataError}
                onRetry={handleRetryData}
                retrying={retrying}
              />
            </header>

            <main
              ref={mainRef}
              onScroll={(event) => scrollPositions.current.set(scrollKey, event.currentTarget.scrollTop)}
              id="main-content"
              tabIndex={-1}
              className={`flex-1 p-4 md:p-8 pb-16 overflow-y-auto relative pretty-scrollbar focus:outline-none ${concertMode ? 'concert-intense' : 'concert-bg'}`}
            >
              <Suspense fallback={<SectionSpinner />}>
                <SectionTransition sectionKey={scrollKey} restoreScroll={() => { if (mainRef.current) mainRef.current.scrollTop = scrollPositions.current.get(scrollKey) ?? 0; }}>

                  {activeSection === 'overview' && (
                    <HomeSection
                      songs={songs}
                      albums={albums}
                      members={members}
                      awards={awards}
                      concerts={concerts}
                      awardsAvailable={!awardsLoading && (!awardsError || awards.length > 0)}
                      concertsAvailable={!concertsLoading && (!concertsError || concerts.length > 0)}
                      onNavigate={navigateTo}
                    />
                  )}

                  {activeSection === 'discography' && (
                    <DiscographySection
                      songs={songs}
                      albums={albums}
                      discographyState={discographyState}
                      onSetDiscographyState={setDiscographyState}
                      filters={route.filters}
                      onFiltersChange={(filters) => navigate({ filters }, true)}
                    />
                  )}

                  {activeSection === 'members' && (
                    <MembersSection
                      members={members}
                      songs={songs}
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
                      initialTab={analyticsTabFromHash}
                      onTabChange={setAnalyticsTabFromHash}
                    />
                  )}

                  {activeSection === 'awards' && (
                    (awardsLoading || (awardsError && !awards.length)) ? <ResourceState title="Awards" loading={awardsLoading} onRetry={refetchAwards} /> : <AwardsSection awards={awards} members={members} />
                  )}

                  {activeSection === 'tours' && (
                    (concertsLoading || (concertsError && !concerts.length)) ? <ResourceState title="Tours" loading={concertsLoading} onRetry={refetchConcerts} /> : <ToursSection concerts={concerts} />
                  )}

                  {activeSection === 'media' && (
                    (mediaLoading || (mediaError && !media.length)) ? <ResourceState title="Media" loading={mediaLoading} onRetry={refetchMedia} /> : <MediaSection media={media} members={members} />
                  )}

                  {activeSection === 'search' && (
                    <SearchSection
                      songs={songs}
                      members={members}
                      albums={albums}
                      awards={awards}
                      concerts={concerts}
                      initialQuery={route.searchQuery}
                      initialMood={route.searchMood}
                      onSearchStateChange={(searchQuery, searchMood) => navigate({ searchQuery, searchMood }, true)}
                      onSelectSong={selectSong}
                      onNavigate={navigateTo}
                    />
                  )}

                </SectionTransition>
              </Suspense>
            </main>
          </div>
        </div>
      )}

      {mode === 'dashboard' && (
        <Suspense fallback={null}>
          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            songs={songs}
            albums={albums}
            members={members}
            onNavigate={navigateTo}
            onSelectSong={selectSong}
          />
        </Suspense>
      )}

      <Suspense fallback={<LoadingFallback />}>
        {activeMemberId && (
          <MemberDNA memberId={activeMemberId} onClose={() => setActiveMemberId(null)} />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <DelightLayer />
      </Suspense>

    </div>
  );
}
