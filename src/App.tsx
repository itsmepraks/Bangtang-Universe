import { useState, useEffect, Suspense, lazy } from 'react';

import { useMembers, useSongs, useAlbums, useLyrics, useAwards, useChartEntries, useConcerts, useMemberEvents, useMedia } from './hooks';
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
  const [mode, setMode] = useState<'landing' | 'warp' | 'onboarding' | 'dashboard'>('landing');
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [concertMode, setConcertMode] = useState(false);

  const [discographyState, setDiscographyState] = useState<DiscographyState>({
    selectedAlbumId: null, selectedSongId: null, view: 'grid',
  });
  const [memberSectionId, setMemberSectionId] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string | null>(null);

  // URL hash format: #/<section>[/<arg1>[/<arg2>]]. See applyHash below for
  // section-specific sub-paths.
  const [analyticsTabFromHash, setAnalyticsTabFromHash] = useState<string | null>(null);

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '');
      if (!raw) return;
      const parts = raw.split('/').filter(Boolean);
      const section = parts[0] as DashboardSection | undefined;
      const validSections: DashboardSection[] = ['overview', 'discography', 'members', 'analytics', 'awards', 'tours', 'media', 'search'];
      if (!section || !validSections.includes(section)) return;
      setActiveSection(section);
      if (section === 'discography') {
        if (parts[1] === 'album' && parts[2]) {
          setDiscographyState({ selectedAlbumId: Number(parts[2]), selectedSongId: null, view: 'album' });
        } else if (parts[1] === 'song' && parts[2] && parts[3]) {
          setDiscographyState({ selectedAlbumId: Number(parts[2]), selectedSongId: Number(parts[3]), view: 'song' });
        } else {
          setDiscographyState({ selectedAlbumId: null, selectedSongId: null, view: 'grid' });
        }
      } else if (section === 'members') {
        setMemberSectionId(parts[1] ?? null);
      } else if (section === 'analytics' && parts[1]) {
        setAnalyticsTabFromHash(parts[1]);
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
     
  }, []);

  useEffect(() => {
    if (mode !== 'dashboard') return;
    let hash = `#/${activeSection}`;
    if (activeSection === 'discography') {
      if (discographyState.view === 'song' && discographyState.selectedAlbumId && discographyState.selectedSongId) {
        hash = `#/discography/song/${discographyState.selectedAlbumId}/${discographyState.selectedSongId}`;
      } else if (discographyState.view === 'album' && discographyState.selectedAlbumId) {
        hash = `#/discography/album/${discographyState.selectedAlbumId}`;
      }
    } else if (activeSection === 'members' && memberSectionId) {
      hash = `#/members/${memberSectionId}`;
    } else if (activeSection === 'analytics' && analyticsTabFromHash) {
      hash = `#/analytics/${analyticsTabFromHash}`;
    }
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [mode, activeSection, discographyState, memberSectionId, analyticsTabFromHash]);

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

  // ESC closes the mobile sidebar drawer.
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  const { songs, error: songsError, refetch: refetchSongs } = useSongs();
  const { albums, error: albumsError, refetch: refetchAlbums } = useAlbums();
  const { members, error: membersError, refetch: refetchMembers } = useMembers();
  const { lyrics, error: lyricsError, refetch: refetchLyrics } = useLyrics();
  const { awards, error: awardsError, refetch: refetchAwards } = useAwards();
  const { chartEntries, error: chartEntriesError, refetch: refetchChartEntries } = useChartEntries();
  const { concerts, error: concertsError, refetch: refetchConcerts } = useConcerts();
  const { memberEvents, error: memberEventsError, refetch: refetchMemberEvents } = useMemberEvents();
  const { media, error: mediaError, refetch: refetchMedia } = useMedia();

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
    try {
      if (localStorage.getItem('bts-onboarded') === '1') {
        setMode('dashboard');
        return;
      }
    } catch { /* noop */ }
    setMode('onboarding');
  };

  const navigateTo = (section: DashboardSection, payload?: string | number) => {
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

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white noise-texture">

      {/* Universe layer — landing/warp only */}
      {(mode === 'landing' || mode === 'warp') && (
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
        <div className="editorial-dashboard absolute inset-0 z-10 flex animate-in fade-in zoom-in-95 duration-1000">
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
              <aside className="absolute inset-y-0 left-0 w-[min(88vw,360px)] bg-[#12100e] border-r border-[var(--editorial-border-soft)] px-5 py-5 shadow-2xl">
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
                    className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] text-white/55 hover:text-white"
                    aria-label="Close collection index"
                  >
                    <X size={17} />
                  </button>
                </div>
                <nav aria-label="Collection navigation" className="mt-8 grid gap-1">
                  {NAV_ITEMS.map((item, index) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center justify-between border-b border-white/[0.07] px-1 py-3 text-left transition-colors ${
                          isActive ? 'text-white' : 'text-white/55 hover:text-white/85'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[10px] tabular-nums text-white/35">{String(index + 1).padStart(2, '0')}</span>
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

          <div className="flex-1 flex flex-col min-w-0 relative z-10">

            <header className="flex flex-col border-b border-[var(--editorial-border-soft)] bg-[#100f0d]/88 backdrop-blur-xl">
              <div className="min-h-16 flex items-center justify-between gap-4 px-4 md:px-8">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="xl:hidden grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] text-white/60 hover:text-white"
                    aria-label="Open collection index"
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
                  {NAV_ITEMS.map((item, index) => {
                    const isActive = activeSection === item.id;
                    const accent = SECTION_ACCENTS[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative px-3 py-5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                          isActive ? 'text-white' : 'text-white/43 hover:text-white/78'
                        }`}
                      >
                        <span className="mr-2 text-[9px] font-medium text-white/25 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
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
                      className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.045] hover:text-white/80 transition-colors"
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
              id="main-content"
              tabIndex={-1}
              className={`flex-1 p-4 md:p-8 pb-16 overflow-y-auto relative pretty-scrollbar focus:outline-none ${concertMode ? 'concert-intense' : 'concert-bg'}`}
            >
              <Suspense fallback={<SectionSpinner />}>
                <SectionTransition sectionKey={activeSection}>

                  {activeSection === 'overview' && (
                    <HomeSection
                      songs={songs}
                      albums={albums}
                      members={members}
                      awards={awards}
                      concerts={concerts}
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
                    <AwardsSection awards={awards} members={members} />
                  )}

                  {activeSection === 'tours' && (
                    <ToursSection concerts={concerts} />
                  )}

                  {activeSection === 'media' && (
                    <MediaSection media={media} members={members} />
                  )}

                  {activeSection === 'search' && (
                    <SearchSection
                      songs={songs}
                      members={members}
                      albums={albums}
                      awards={awards}
                      concerts={concerts}
                      onSelectSong={(song) => {
                        const album = albums.find(a => a.id === song.album_id);
                        setDiscographyState({
                          selectedAlbumId: album?.id ?? null,
                          selectedSongId: song.id,
                          view: 'song',
                        });
                        setActiveSection('discography');
                      }}
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
            onSelectSong={(song) => {
              const album = albums.find((a) => a.id === song.album_id);
              setDiscographyState({
                selectedAlbumId: album?.id ?? null,
                selectedSongId: song.id,
                view: 'song',
              });
              setActiveSection('discography');
            }}
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
