import { useState, useMemo, Suspense, lazy } from 'react';

// Import data and hooks
import { useMembers, useSongs, useAlbums, useLyrics } from './hooks';
import type { Song } from './types/database';
import type { DashboardSection, DiscographyState } from './types/index';

// Lightweight components - imported directly
import {
  BTSLogo,
  NoiseOverlay,
  FloatingParticles,
  GlassHUD,
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
const SonicSection = lazy(() => import('./components/features/sections/SonicSection'));
const SearchSection = lazy(() => import('./components/features/sections/SearchSection'));
const StudioSection = lazy(() => import('./components/features/sections/StudioSection'));

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="absolute inset-0 bg-[#020005] flex items-center justify-center">
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
  Activity,
  Search,
  Settings,
  Mic2,
  Home,
  Disc,
  Users,
} from 'lucide-react';

const SECTION_TITLES: Record<DashboardSection, string> = {
  home: 'Home',
  discography: 'Discography',
  members: 'Members',
  sonic: 'Sonic Lab',
  search: 'Search',
  studio: 'AI Studio',
};

const NAV_ITEMS: { id: DashboardSection; icon: React.ElementType; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'discography', icon: Disc, label: 'Disco' },
  { id: 'members', icon: Users, label: 'Members' },
  { id: 'sonic', icon: Activity, label: 'Sonic' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'studio', icon: Mic2, label: 'Studio' },
];

// --- MAIN APPLICATION ---
export default function App() {
  const [mode, setMode] = useState<'landing' | 'warp' | 'dashboard'>('landing');
  const [activeSection, setActiveSection] = useState<DashboardSection>('home');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [analyzingSong, setAnalyzingSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // New state for expanded sections
  const [discographyState, setDiscographyState] = useState<DiscographyState>({
    selectedAlbumId: null, selectedSongId: null, view: 'grid',
  });
  const [memberSectionId, setMemberSectionId] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string | null>(null);

  // Database hooks
  const { songs } = useSongs();
  const { albums } = useAlbums();
  const { members } = useMembers();
  const { lyrics } = useLyrics();

  const getAlbumTitle = (id: number | null) => albums.find(a => a.id === id)?.title || 'Unknown Album';

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
    <div className="relative w-screen h-screen bg-[#020005] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white">
      <NoiseOverlay />

      {/* 1. UNIVERSE LAYER - PERSISTENT */}
      <Suspense fallback={<LoadingFallback />}>
        <Universe3D mode={mode} />
      </Suspense>

      {/* 2. LANDING */}
      <Suspense fallback={<LoadingFallback />}>
        {mode === 'landing' && <LandingRitual onSync={handleSync} />}
      </Suspense>

      {/* 3. DASHBOARD */}
      {mode === 'dashboard' && !activeMemberId && (
        <div className="absolute inset-0 z-10 flex animate-in fade-in zoom-in-95 duration-1000">

          {/* Dashboard Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] right-[5%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_#3b0764_0%,_transparent_70%)] opacity-30 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_transparent_70%)] opacity-25 blur-[120px] animate-pulse" style={{ animationDelay: '-5s' }} />
            <FloatingParticles />
          </div>

          {/* Sidebar — compact with icon + label */}
          <div className="w-20 bg-black/40 backdrop-blur-3xl border-r border-white/[0.06] flex flex-col items-center py-6 z-50 shadow-2xl relative">
            <div
              onClick={() => setMode('landing')}
              className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center group cursor-pointer hover:border-purple-500/50 transition-all duration-500 hover:bg-white/[0.05] mb-6"
            >
              <BTSLogo className="w-7 h-7 text-white group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-500" />
            </div>

            <nav className="flex flex-col gap-1 w-full px-2 flex-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-300 relative
                    ${activeSection === item.id
                      ? 'bg-purple-500/10 text-purple-300 border-l-2 border-purple-500'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] border-l-2 border-transparent'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </button>
              ))}
            </nav>

            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 flex items-center justify-center transition-all duration-500 group hover:bg-white/[0.05] mt-4"
            >
              <Settings size={18} className="text-white/30 group-hover:text-white/70 transition-colors duration-500 group-hover:rotate-90" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">

            {/* Header — compact with breadcrumbs */}
            <header className="h-14 flex items-center justify-between px-12 bg-gradient-to-b from-black/40 to-transparent border-b border-white/[0.04]">
              <Breadcrumb items={breadcrumbs} />
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-white/30 hover:text-white/60"
              >
                <Settings size={16} />
              </button>
            </header>

            {/* Main Views */}
            <main className="flex-1 p-12 pb-24 overflow-y-auto relative pretty-scrollbar">
              <Suspense fallback={<SectionSpinner />}>
                <SectionTransition sectionKey={activeSection}>

                  {activeSection === 'home' && (
                    <HomeSection
                      songs={songs}
                      albums={albums}
                      members={members}
                      lyricsCount={lyrics.length}
                      analyzingSong={analyzingSong}
                      onSelectSong={setAnalyzingSong}
                      onNavigate={navigateTo}
                      getAlbumTitle={getAlbumTitle}
                      playing={playing}
                      onTogglePlay={() => setPlaying(prev => !prev)}
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

                  {activeSection === 'sonic' && (
                    <SonicSection
                      songs={songs}
                      albums={albums}
                      analyzingSong={analyzingSong}
                      onSelectSong={setAnalyzingSong}
                      playing={playing}
                      onTogglePlay={() => setPlaying(prev => !prev)}
                      getAlbumTitle={getAlbumTitle}
                    />
                  )}

                  {activeSection === 'search' && (
                    <SearchSection
                      onSelectSong={(s) => { setAnalyzingSong(s); navigateTo('sonic'); }}
                      onNavigate={navigateTo}
                    />
                  )}

                  {activeSection === 'studio' && (
                    <StudioSection
                      songs={songs}
                      members={members}
                      albums={albums}
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

      {/* 5. SETTINGS OVERLAY */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-[500px] max-w-[90vw] h-[600px] max-h-[90vh]">
            <GlassHUD title="System Configuration" icon={Settings} onClose={() => setShowSettings(false)}>
              <div className="space-y-8">
                {/* Audio Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Audio Interface</h3>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white/90">Dolby Atmos (Virtual)</span>
                      <span className="text-xs text-white/50 uppercase tracking-wide">Spatial Audio Engine</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
                  </div>
                </div>

                {/* Graphics Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Visual Processing</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Eco', 'Balanced', 'Ultra'].map((m, i) => (
                      <button key={m} className={`
                        py-3 rounded-xl border text-xs font-medium tracking-wide uppercase transition-all duration-300
                        ${i === 2
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 border-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white/70'}
                      `}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Neural Link</h3>
                  <div className="space-y-3">
                    {['System Alerts', 'Background Sync', 'Haptic Feedback'].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <span className="text-sm text-white/60 group-hover:text-white transition-colors">{item}</span>
                        <div className="w-10 h-5 bg-purple-900/40 rounded-full relative border border-white/10 transition-colors group-hover:border-purple-500/50">
                          <div className="absolute right-1 top-1 bottom-1 w-3 bg-purple-400 rounded-full shadow-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Info */}
                <div className="pt-6 border-t border-white/[0.06] text-center">
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">
                    Bangtan Universe v3.0.0
                  </p>
                </div>
              </div>
            </GlassHUD>
          </div>
        </div>
      )}

    </div>
  );
}
