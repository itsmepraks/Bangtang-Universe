import { useState } from 'react';

// Import data and hooks
import { MEMBER_DATA } from './data/members';
import { SONGS, type Song } from './data/songs';
import { useMembers, useSongs, useAlbums } from './hooks';

// Import components from new modular structure
import {
  BTSLogo,
  NoiseOverlay,
  FloatingParticles,
  GlassHUD,
  Universe3D,
  LandingRitual,
  SonicAnalyzer,
  RAGNetwork,
  DataHub,
  MemberDNA,
  LyricistAI,
} from './components';

import {
  Activity,
  Search,
  Database,
  Cpu,
  Network,
  Settings,
  Layers,
  Mic2,
  ChevronRight,
} from 'lucide-react';

// --- MAIN APPLICATION ---
export default function App() {
  const [mode, setMode] = useState<'landing' | 'warp' | 'dashboard'>('landing');
  const [activeSection, setActiveSection] = useState('overview'); // overview, rag, sonic, data
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [analyzingSong, setAnalyzingSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Database hooks called for future features
  // Currently using local SONGS constant directly
  useSongs();
  useAlbums();
  useMembers();

  const handleSync = () => {
    setMode('dashboard');
  };


  return (
    <div className="relative w-screen h-screen bg-[#020005] text-white font-sans overflow-hidden selection:bg-purple-500/30 selection:text-white">
      <NoiseOverlay />

      {/* 1. UNIVERSE LAYER - PERSISTENT */}
      <Universe3D mode={mode} />

      {/* 2. LANDING */}
      {mode === 'landing' && <LandingRitual onSync={handleSync} />}

      {/* 3. DASHBOARD */}
      {mode === 'dashboard' && !activeMemberId && (
        <div className="absolute inset-0 z-10 flex animate-in fade-in zoom-in-95 duration-1000">

          {/* Dashboard Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] right-[5%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_#3b0764_0%,_transparent_70%)] opacity-30 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_transparent_70%)] opacity-25 blur-[120px] animate-pulse" style={{ animationDelay: '-5s' }} />
            <FloatingParticles />
          </div>

          {/* Sidebar */}
          <div className="w-28 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-12 gap-12 z-50 shadow-2xl relative">
            <div
              onClick={() => setMode('landing')}
              className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-inner group cursor-pointer hover:border-purple-500/50 transition-all duration-700 hover:bg-white/[0.05]">
              <BTSLogo className="w-8 h-8 text-white group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-700" />
            </div>

            <nav className="flex flex-col gap-10 w-full px-5 mt-4">
              {[
                { id: 'overview', icon: Layers, label: 'Control' },
                { id: 'sonic', icon: Activity, label: 'Sonic' },
                { id: 'rag', icon: Network, label: 'Archive' },
                { id: 'data', icon: Database, label: 'Records' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    p-5 rounded-3xl transition-all duration-1000 relative group
                    ${activeSection === item.id
                      ? 'bg-purple-600/15 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.1)] border border-purple-500/30'
                      : 'text-white/10 hover:text-white/40 hover:bg-white/[0.03] border border-transparent'}
                  `}
                >
                  <item.icon size={24} className={activeSection === item.id ? "animate-[pulse-glow_4s_infinite]" : "group-hover:scale-110 transition-transform duration-700"} />
                  {activeSection === item.id && (
                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-12 bg-purple-500 rounded-r-full shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
                  )}
                  {/* Tooltip */}
                  <div className="absolute left-full ml-6 px-4 py-2 bg-purple-900/90 backdrop-blur-2xl border border-white/10 rounded-xl text-[10px] font-bold tracking-[0.3em] text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-500 translate-x-[-20px] group-hover:translate-x-0 shadow-2xl z-[100] uppercase">
                    {item.label}
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-8 mb-6">
              <button
                onClick={() => setShowSettings(true)}
                className="w-14 h-14 rounded-[1.25rem] bg-white/[0.02] border border-white/5 hover:border-white/30 flex items-center justify-center transition-all duration-700 group hover:bg-white/[0.05]">
                <Settings size={22} className="text-white/20 group-hover:text-white transition-all duration-700 group-hover:rotate-90" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">

            {/* Header - Enhanced visibility */}
            <header className="h-32 flex items-center justify-between px-16 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-auto border-b border-white/[0.05]">
              <div className="animate-in slide-in-from-left-10 duration-1000">
                <h1
                  className="text-5xl font-light tracking-[0.25em] text-white uppercase"
                  style={{ textShadow: '0 0 40px rgba(168,85,247,0.5), 0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  {activeSection === 'overview' ? 'Mission Control' : activeSection === 'sonic' ? 'Sonic Lab' : activeSection === 'rag' ? 'Archive Graph' : 'Records Hub'}
                </h1>
                <div className="flex items-center gap-4 text-[11px] text-purple-300/70 font-mono tracking-[0.4em] mt-4 font-semibold">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]"></span>
                  </span>
                  SYSTEM ONLINE • ARCHIVE SYNCHRONIZED
                </div>
              </div>

              {/* Member Selectors - Enhanced with cleaner hover states */}
              <div className="flex gap-3 bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] px-6 py-3 rounded-[2rem] shadow-2xl animate-in slide-in-from-right-10 duration-1000">
                {MEMBER_DATA.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMemberId(m.id)}
                    className="w-14 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all duration-500 border border-transparent hover:border-white/20 hover:bg-white/[0.06] relative group overflow-hidden"
                    style={{ color: m.color }}
                  >
                    <span className="relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:text-white">{m.name}</span>
                    <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-current opacity-0 group-hover:opacity-80 transition-all duration-500" />
                  </button>
                ))}
              </div>
            </header>

            {/* Main Views */}
            <main className="flex-1 p-12 pb-24 overflow-y-auto relative pretty-scrollbar">

              {/* OVERVIEW MODE */}
              {activeSection === 'overview' && (
                <div className="grid grid-cols-12 gap-8 h-full">
                  <div className="col-span-8 flex flex-col gap-6">
                    <GlassHUD title="Live Waveform Analysis" icon={Activity} className="h-80">
                      <SonicAnalyzer
                        playing={playing}
                        togglePlay={() => setPlaying(prev => !prev)}
                        song={analyzingSong}
                        onSelectSong={setAnalyzingSong}
                      />
                    </GlassHUD>

                    {/* Quick Picks Bar */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {['Butter', 'Dynamite', 'Spring Day', 'Run BTS', 'Mic Drop'].map(title => {
                        const s = SONGS.find(song => song.title.toLowerCase() === title.toLowerCase());
                        if (!s) return null;
                        return (
                          <button
                            key={title}
                            onClick={() => { setAnalyzingSong(s); setPlaying(true); }}
                            className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${analyzingSong?.id === s.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30 hover:text-white'}`}
                          >
                            {title}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-8">
                      <GlassHUD title="Recent Neural Queries" icon={Search} className="h-full">
                        <div className="space-y-4">
                          {['Themes of "Love"', 'BPM > 120', 'Lyricist Analysis'].map((q, i) => (
                            <div key={i} className="px-6 py-5 bg-white/[0.02] rounded-3xl border border-white/[0.03] text-[12px] text-white/50 flex justify-between items-center hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-700 cursor-pointer group">
                              <span className="group-hover:text-white transition-colors duration-500 tracking-wider font-medium">{q}</span>
                              <ChevronRight size={18} className="text-white/10 group-hover:text-purple-400 transition-all duration-700 translate-x-[-8px] group-hover:translate-x-0" />
                            </div>
                          ))}
                        </div>
                      </GlassHUD>
                      <GlassHUD title="Neural Sub-Systems" icon={Cpu} className="h-full">
                        <div className="space-y-8 pt-4">
                          {['Vector Engine', 'Harmonic Processor', 'Archive Link'].map(s => (
                            <div key={s} className="flex justify-between items-center px-4">
                              <span className="text-[11px] text-white/40 font-black tracking-[0.3em] uppercase">{s}</span>
                              <span className="text-[9px] font-black tracking-[0.2em] bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.1)]">ONLINE</span>
                            </div>
                          ))}
                        </div>
                      </GlassHUD>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <GlassHUD title="Neural Lyricist AI" icon={Mic2} className="h-full">
                      <LyricistAI />
                    </GlassHUD>
                  </div>
                </div>
              )}

              {/* SONIC MODE */}
              {activeSection === 'sonic' && (
                <div className="h-full max-w-5xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <GlassHUD title="High-Fidelity Vector Analysis" icon={Activity} className="flex-1">
                    <SonicAnalyzer
                      playing={playing}
                      togglePlay={() => setPlaying(prev => !prev)}
                      song={analyzingSong}
                      onSelectSong={setAnalyzingSong}
                    />
                  </GlassHUD>
                </div>
              )}

              {/* GRAPH MODE */}
              {activeSection === 'rag' && (
                <div className="h-full max-w-4xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <GlassHUD title="Knowledge Archive Explorer" icon={Network} className="flex-1">
                    <RAGNetwork />
                  </GlassHUD>
                </div>
              )}

              {/* DATA MODE */}
              {activeSection === 'data' && (
                <div className="h-full max-w-6xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <GlassHUD title="Global Discography Archive" icon={Database} className="flex-1">
                    <DataHub onSelectSong={(s) => {
                      setAnalyzingSong(s);
                      setActiveSection('overview'); // Switch to main view to see analysis
                      setPlaying(true); // Auto play visualization
                    }} />
                  </GlassHUD>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* 4. MEMBER DETAIL OVERLAY (FULL SCREEN) */}
      {activeMemberId && (
        <MemberDNA memberId={activeMemberId} onClose={() => setActiveMemberId(null)} />
      )}

      {/* 5. SETTINGS OVERLAY */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="w-[500px] max-w-[90vw] h-[600px] max-h-[90vh]">
            <GlassHUD title="System Configuration" icon={Settings} onClose={() => setShowSettings(false)}>
              <div className="space-y-8">
                {/* Audio Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Audio Interface</h3>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white/90">Dolby Atmos (Virtual)</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Spatial Audio Engine</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
                  </div>
                </div>

                {/* Graphics Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Visual Processing</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Eco', 'Balanced', 'Ultra'].map((mode, i) => (
                      <button key={mode} className={`
                                        py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all duration-300
                                        ${i === 2
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'}
                                    `}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Neural Link</h3>
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
                <div className="pt-6 border-t border-white/5 text-center">
                  <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
                    BTS Universe v2.4.0 • Build 2024.03.09
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
