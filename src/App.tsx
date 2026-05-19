import { useState, useEffect, useMemo, Suspense, lazy } from 'react';

import { useMembers, useSongs, useAlbums, useLyrics, useAwards, useChartEntries, useConcerts, useMemberEvents, useMedia } from './hooks';
import type { DashboardSection, DiscographyState } from './types/index';
import { SECTION_ACCENTS } from './constants/colors';

import {
  BTSLogo,
} from './components';
import { Breadcrumb, DataStatusBanner, DotLoader } from './components/ui';

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
  PanelLeftClose,
  PanelLeftOpen,
  Music,
} from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Burning midnight oil, ARMY';
  if (h < 12) return 'Good morning, ARMY';
  if (h < 17) return 'Good afternoon, ARMY';
  if (h < 22) return 'Good evening, ARMY';
  return 'Night owl, ARMY';
}

const SECTION_TITLES: Record<DashboardSection, string> = {
  overview: 'Overview',
  discography: 'Discography',
  members: 'Members',
  analytics: 'Analytics',
  awards: 'Awards',
  tours: 'Tours',
  media: 'Media',
  search: 'Search',
};

const ANALYTICS_TAB_LABELS: Record<string, string> = {
  sound: 'The sound',
  mood: 'Mood & lyrics',
  credits: 'Who writes',
  discover: 'Discover',
  milestones: 'Milestones',
};

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('bts-sidebar-collapsed') === '1';
    } catch { return false; }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bts-sidebar-collapsed', sidebarCollapsed ? '1' : '0');
    } catch { /* noop */ }
  }, [sidebarCollapsed]);
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

  const { songs, loading: songsLoading, error: songsError, refetch: refetchSongs } = useSongs();
  const { albums, loading: albumsLoading, error: albumsError, refetch: refetchAlbums } = useAlbums();
  const { members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useMembers();
  const { lyrics, error: lyricsError, refetch: refetchLyrics } = useLyrics();
  const { awards, loading: awardsLoading, error: awardsError, refetch: refetchAwards } = useAwards();
  const { chartEntries, error: chartEntriesError, refetch: refetchChartEntries } = useChartEntries();
  const { concerts, loading: concertsLoading, error: concertsError, refetch: refetchConcerts } = useConcerts();
  const { memberEvents, error: memberEventsError, refetch: refetchMemberEvents } = useMemberEvents();
  const { media, loading: mediaLoading, error: mediaError, refetch: refetchMedia } = useMedia();

  const dataLoading = songsLoading || albumsLoading || membersLoading || awardsLoading || concertsLoading || mediaLoading;
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

    if (activeSection === 'analytics' && analyticsTabFromHash && ANALYTICS_TAB_LABELS[analyticsTabFromHash]) {
      items.push({ label: ANALYTICS_TAB_LABELS[analyticsTabFromHash] });
    }

    return items;
  }, [activeSection, selectedAlbum, selectedSong, selectedMember, analyticsTabFromHash]);

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
        <div className="absolute inset-0 z-10 flex animate-in fade-in zoom-in-95 duration-1000">
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
            <div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className={`fixed inset-y-0 left-0 ${sidebarCollapsed ? 'w-[72px]' : 'w-56'} bg-[#0c0c12] border-r border-white/[0.06] flex flex-col py-4 ${sidebarCollapsed ? 'px-3' : 'px-4'} z-50 transform transition-[transform,width,padding] duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
              <div
                onClick={() => setMode('landing')}
                className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'} group cursor-pointer min-w-0`}
              >
                <BTSLogo className="w-7 h-7 text-white group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-white/80 leading-tight truncate">Bangtan Universe</span>
                    <span className="block text-[10px] text-white/55 leading-tight truncate">{getGreeting()}</span>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-colors flex-shrink-0"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={16} />
                </button>
              )}
            </div>

            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden md:flex items-center justify-center w-full h-9 mb-3 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}

            <nav aria-label="Main navigation" className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map(item => {
                const isActive = activeSection === item.id;
                const accent = SECTION_ACCENTS[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-[color,background-color] duration-200 w-full text-left ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
                    }`}
                    style={isActive ? { backgroundColor: `${accent}22` } : undefined}
                  >
                    {/* Active items recolor the icon to the section accent —
                        replaces the previous left-stripe indicator. */}
                    <item.icon
                      size={18}
                      aria-hidden="true"
                      className="flex-shrink-0"
                      style={isActive ? { color: accent } : undefined}
                    />
                    {!sidebarCollapsed && (
                      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className={`pt-4 border-t border-white/[0.06] mb-3 ${sidebarCollapsed ? 'px-0' : 'px-2'} space-y-2`}>
              <button
                onClick={() => setConcertMode(c => !c)}
                aria-pressed={concertMode}
                title="Concert mode: brighter ambient glow that cycles through member colors, like a stadium during a tour"
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2 px-4'} py-2.5 rounded-xl text-xs font-medium transition-[color,background-color,border-color] duration-200 w-full text-left ${
                  concertMode
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
              >
                <span className="text-base" aria-hidden="true">{concertMode ? '🔥' : '🎆'}</span>
                {!sidebarCollapsed && <span>{concertMode ? 'Concert mode on' : 'Concert mode'}</span>}
              </button>
              <button
                onClick={() => setMode('onboarding')}
                title={sidebarCollapsed ? 'About this project' : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-2'} text-xs text-white/55 hover:text-white/80 transition-colors cursor-pointer`}
              >
                <Info size={14} />
                {!sidebarCollapsed && <span>About this project</span>}
              </button>
            </div>

            {!sidebarCollapsed && (
              <div className="pt-4 border-t border-white/[0.06] mb-2">
                {dataLoading ? (
                  <div className="grid grid-cols-2 gap-1.5 px-2">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-8 rounded-md bg-white/[0.02] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-2">
                    {[
                      { icon: Music, label: 'songs', value: songs.length, color: SECTION_ACCENTS.discography },
                      { icon: Disc, label: 'albums', value: albums.length, color: SECTION_ACCENTS.discography },
                      { icon: Users, label: 'members', value: members.length, color: SECTION_ACCENTS.members },
                      { icon: Trophy, label: 'awards', value: awards.length, color: SECTION_ACCENTS.awards },
                      { icon: MapPin, label: 'shows', value: concerts.length, color: SECTION_ACCENTS.tours },
                      { icon: Film, label: 'media', value: media.length, color: SECTION_ACCENTS.media },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex items-center gap-1.5 py-1">
                        <Icon size={11} style={{ color: `${color}cc` }} className="flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs font-semibold text-white/70 tabular-nums">{value.toLocaleString()}</span>
                        <span className="text-[10px] text-white/55">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="flex-1 flex flex-col min-w-0 relative z-10">

            <header className="flex flex-col bg-[#0c0c12]/50 border-b border-white/[0.06]">
              <div className="h-14 flex items-center justify-between px-4 md:px-8">
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
                <button
                  onClick={() => setPaletteOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors text-xs"
                  aria-label="Open command palette"
                >
                  <Search size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">Search…</span>
                  <kbd className="hidden sm:inline-block text-[10px] px-1 rounded bg-white/[0.06] border border-white/[0.08] font-mono">⌘&nbsp;K</kbd>
                </button>
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
