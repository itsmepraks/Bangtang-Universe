import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Database, 
  Cpu, 
  Zap, 
  BarChart3, 
  Mic2, 
  Play, 
  Pause, 
  Settings, 
  Network,
  Share2,
  X,
  Globe,
  Music,
  Maximize2,
  Minimize2,
  Disc,
  Command,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Layers,
  Code,
  PenTool,
  Sliders,
  Headphones,
  Sparkles,
  Download,
  Heart,
  RefreshCw,
  Filter,
  Wifi,
  Radio,
  Hand,
  Users,
  Fingerprint,
  Award,
  BookOpen
} from 'lucide-react';

// --- TYPES ---
interface Member {
  id: string;
  name: string;
  full: string;
  color: string;
  role: string;
  mic: string;
  komca: number;
  bio: string;
  soloTracks: string[];
  achievements: string[];
}

interface Song {
  id: number;
  title: string;
  album: string;
  bpm: number;
  energy: number;
  valence: number;
  sentiment: string;
}

// --- CONSTANTS & DUMMY DATA ---
const MEMBER_DATA: Member[] = [
  { 
    id: 'rm', 
    name: 'RM', 
    full: 'Kim Namjoon',
    color: '#2563EB', 
    role: 'Leader / Main Rapper / Producer', 
    mic: 'Blue',
    komca: 218,
    bio: 'The poetic leader and linguistic genius behind BTS. Known for his philosophical lyrics and robust production skills.',
    soloTracks: ['Indigo', 'Wild Flower', 'Persona', 'Seoul', 'Moonchild'],
    achievements: ['UN Speaker', 'Youngest Most Credited Korean Artist', 'Cultural Merit Medal']
  }, 
  { 
    id: 'jin', 
    name: 'JIN', 
    full: 'Kim Seokjin',
    color: '#EC4899', 
    role: 'Sub Vocalist / Visual', 
    mic: 'Pink',
    komca: 35,
    bio: 'The Silver Voice. Known for his stable vocals, emotional range, and being Worldwide Handsome.',
    soloTracks: ['The Astronaut', 'Epiphany', 'Moon', 'Awake', 'Abyss'],
    achievements: ['Cultural Merit Medal', 'Sold Out King', '联合国 (UN) Envoy']
  }, 
  { 
    id: 'suga', 
    name: 'SUGA', 
    full: 'Min Yoongi',
    color: '#10B981', 
    role: 'Lead Rapper / Producer', 
    mic: 'Black',
    komca: 169,
    bio: 'The Minstradamus. A prolific producer who captures raw human emotion and social commentary.',
    soloTracks: ['D-DAY', 'Daechwita', 'Haegeum', 'Seesaw', 'Shadow'],
    achievements: ['Produced for IU, PSY', 'Samsung Ambassador', 'NBA Ambassador']
  }, 
  { 
    id: 'jh', 
    name: 'J-HOPE', 
    full: 'Jung Hoseok',
    color: '#EF4444', 
    role: 'Main Dancer / Sub Rapper', 
    mic: 'Red',
    komca: 137,
    bio: 'The Golden Hyung. Bringing sunshine and street dance roots to the global stage.',
    soloTracks: ['Jack In The Box', 'Arson', 'More', 'Ego', 'Just Dance'],
    achievements: ['Lollapalooza Headliner', 'Louis Vuitton Ambassador', 'Cultural Merit Medal']
  }, 
  { 
    id: 'jm', 
    name: 'JIMIN', 
    full: 'Park Jimin',
    color: '#F59E0B', 
    role: 'Lead Vocalist / Main Dancer', 
    mic: 'Gold',
    komca: 15,
    bio: 'The Stage Commander. Known for his unique vocal tone and contemporary dance background.',
    soloTracks: ['FACE', 'Like Crazy', 'Set Me Free Pt.2', 'Filter', 'Serendipity'],
    achievements: ['Billboard Hot 100 #1 (Solo)', 'Dior Ambassador', 'Tiffany & Co. Ambassador']
  }, 
  { 
    id: 'v', 
    name: 'V', 
    full: 'Kim Taehyung',
    color: '#22c55e', 
    role: 'Sub Vocalist / Visual', 
    mic: 'Green',
    komca: 19,
    bio: 'The Soulful Baritone. Known for his deep voice, jazz influences, and artistic vision.',
    soloTracks: ['Layover', 'Slow Dancing', 'Love Me Again', 'Singularity', 'Stigma'],
    achievements: ['Celine Ambassador', 'Cartier Ambassador', 'Vogue Cover Star']
  }, 
  { 
    id: 'jk', 
    name: 'JK', 
    full: 'Jeon Jungkook',
    color: '#8B5CF6', 
    role: 'Main Vocalist / Center', 
    mic: 'Purple',
    komca: 22,
    bio: 'The Golden Maknae. Exceling in vocals, dance, and videography. The pop star of the generation.',
    soloTracks: ['GOLDEN', 'Seven', 'Standing Next to You', 'Euphoria', 'My Time'],
    achievements: ['FIFA World Cup Performer', 'Calvin Klein Ambassador', 'Spotify Billion Club']
  }, 
];

const SONG_DATABASE: Song[] = [
  { id: 1, title: 'Take Two', album: 'Single', bpm: 120, energy: 0.8, valence: 0.7, sentiment: 'Gratitude' },
  { id: 2, title: 'Run BTS', album: 'Proof', bpm: 145, energy: 0.95, valence: 0.6, sentiment: 'Determination' },
  { id: 3, title: 'Black Swan', album: 'MOTS:7', bpm: 147, energy: 0.65, valence: 0.2, sentiment: 'Fear' },
  { id: 4, title: 'Spring Day', album: 'YNWA', bpm: 107, energy: 0.5, valence: 0.4, sentiment: 'Longing' },
  { id: 5, title: 'Dynamite', album: 'BE', bpm: 114, energy: 0.85, valence: 0.8, sentiment: 'Joy' },
  { id: 6, title: 'Fake Love', album: 'LY: Tear', bpm: 78, energy: 0.7, valence: 0.3, sentiment: 'Pain' },
  { id: 7, title: 'Mikrokosmos', album: 'MOTS: Persona', bpm: 120, energy: 0.75, valence: 0.65, sentiment: 'Comfort' },
  { id: 8, title: 'DNA', album: 'LY: Her', bpm: 130, energy: 0.8, valence: 0.6, sentiment: 'Destiny' },
  { id: 9, title: 'IDOL', album: 'LY: Answer', bpm: 126, energy: 0.9, valence: 0.8, sentiment: 'Celebration' },
  { id: 10, title: 'Butter', album: 'Single', bpm: 110, energy: 0.85, valence: 0.75, sentiment: 'Confidence' }
];

// --- VISUAL UTILS ---
const BTSLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={`fill-current ${className}`}>
    <path d="M10 10 L20 5 L20 45 L10 40 Z" />
    <path d="M40 10 L30 5 L30 45 L40 40 Z" />
  </svg>
);

const Whalien = () => (
  <div className="absolute w-96 h-48 opacity-30 animate-[float_60s_linear_infinite] pointer-events-none mix-blend-screen" style={{ top: '20%', left: '-20%' }}>
     <svg viewBox="0 0 200 100" className="w-full h-full fill-purple-500/50 blur-lg">
        {/* Abstract Whale Shape */}
        <path d="M20,50 Q60,20 120,50 T200,50 Q160,80 100,70 T20,50 Z" />
     </svg>
     {/* Sparkling trail */}
     <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-md opacity-50" />
  </div>
);

const NoiseOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.04] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
);

// --- 3D UNIVERSE BACKGROUND ---
interface UniverseProps {
  mode: 'landing' | 'warp' | 'dashboard';
}

const Universe3D: React.FC<UniverseProps> = ({ mode }) => {
  const stars = useMemo(() => {
    return [...Array(600)].map((_, i) => ({
      theta: Math.random() * 2 * Math.PI,
      phi: Math.acos((Math.random() * 2) - 1),
      r: 400 + Math.random() * 800,
      size: Math.random() * 2 + 0.5,
      color: i % 8 === 0 ? '#ffffff' : '#A855F7', // Mostly Purple Ocean
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <div className="absolute inset-0 bg-[#020005] overflow-hidden perspective-[1000px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.3),_rgba(0,0,0,1)_90%)]" />
      
      {/* The Space Whale Swimming in Background */}
      <Whalien />

      <div 
        className={`absolute inset-0 flex items-center justify-center transform-style-3d transition-transform duration-[2000ms] ease-in-out
          ${mode === 'warp' ? 'scale-[5] translate-z-[1000px]' : mode === 'dashboard' ? 'scale-[0.9] rotate-x-10' : 'scale-100'}
        `}
      >
        <div className={`relative w-[1000px] h-[1000px] transform-style-3d ${mode === 'landing' ? 'animate-[spin_60s_linear_infinite]' : 'animate-[spin_240s_linear_infinite]'}`}>
          
          {/* THE 7 MEMBERS (Central Constellation) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
            {MEMBER_DATA.map((m, i) => {
              const angle = (i / 7) * Math.PI * 2;
              const dist = mode === 'dashboard' ? 180 : 100;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              return (
                <div 
                  key={m.id}
                  className="absolute flex items-center justify-center transition-all duration-1000"
                  style={{ transform: `translate(${x}px, ${y}px) rotate(${-angle}rad)` }}
                >
                  <div 
                    className="w-4 h-4 rounded-full shadow-[0_0_40px_currentColor] animate-pulse"
                    style={{ backgroundColor: m.color, color: m.color }}
                  />
                </div>
              )
            })}
            <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_100px_white]" />
          </div>

          {/* THE ARMY (Purple Ocean) */}
          {stars.map((s, i) => {
            const x = s.r * Math.sin(s.phi) * Math.cos(s.theta);
            const y = s.r * Math.sin(s.phi) * Math.sin(s.theta);
            const z = s.r * Math.cos(s.phi);
            return (
              <div 
                key={i}
                className="absolute rounded-full"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  backgroundColor: s.color,
                  boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  opacity: 0.8,
                  animation: `twinkle 4s infinite ${s.delay}s`
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
};

// --- LANDING RITUAL ---
interface LandingRitualProps {
  onSync: () => void;
}

const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startHold = () => {
    setHolding(true);
    // Use window.setInterval to avoid NodeJS/DOM timer type conflicts in TS
    intervalRef.current = window.setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(onSync, 500); 
          return 100;
        }
        return p + 2;
      });
    }, 20); 
  };

  const stopHold = () => {
    setHolding(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${holding ? 'backdrop-blur-sm' : ''}`}>
      <div className={`text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000 ${holding ? 'opacity-50 scale-90' : 'opacity-100'}`}>
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-100 to-purple-900/20 tracking-tighter drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          MIKROKOSMOS
        </h1>
        <p className="text-purple-300 tracking-[0.5em] text-xs mt-4 uppercase">
          Neural Archive v7.0
        </p>
      </div>

      <div className="relative w-96 h-96 flex items-center justify-center">
         {/* THE 7 HANDS ORBITING */}
         {MEMBER_DATA.map((m, i) => {
            const angle = (i / 7) * Math.PI * 2 - Math.PI / 2; 
            const radius = holding ? 70 : 160; // Move hands inward on hold
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
               <div 
                  key={m.id}
                  className="absolute transition-all duration-500 ease-out flex flex-col items-center gap-2"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
               >
                  <div className={`
                     p-3 rounded-full bg-black/50 border backdrop-blur-md transition-all duration-300
                     ${holding ? 'border-white shadow-[0_0_20px_white]' : `border-white/10 shadow-[0_0_15px_${m.color}]`}
                  `}
                  style={{ borderColor: holding ? 'white' : m.color }}
                  >
                     <Hand 
                        size={24} 
                        className={`transition-colors duration-300 ${holding ? 'text-white' : 'text-white/50'}`} 
                        style={{ color: holding ? 'white' : m.color }}
                     />
                  </div>
                  <span className={`text-[9px] font-bold tracking-widest text-white/50 uppercase transition-opacity duration-300 ${holding ? 'opacity-0' : 'opacity-100'}`}>
                     {m.name}
                  </span>
               </div>
            )
         })}

         {/* CENTRAL CORE (YOU) */}
         <button 
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className={`
               relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md transition-all duration-300 cursor-pointer
               ${holding ? 'scale-110 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.6)]' : 'hover:scale-105 hover:border-white/30'}
            `}
         >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="64" cy="64" r="62" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
               <circle 
                  cx="64" cy="64" r="62" 
                  stroke="#A855F7" strokeWidth="2" fill="none"
                  strokeDasharray="389" 
                  strokeDashoffset={389 - (389 * progress) / 100}
                  className="transition-all duration-100 ease-linear"
               />
            </svg>
            
            <div className="relative z-10 flex flex-col items-center gap-1">
               {progress >= 100 ? <Sparkles className="animate-spin text-white" size={32}/> : <Fingerprint size={32} className={`transition-colors ${holding ? 'text-white' : 'text-purple-400'}`} />}
               <span className="text-[8px] tracking-widest text-white/50 mt-2">{holding ? 'CONNECTING...' : 'HOLD TO SYNC'}</span>
            </div>
            
            {!holding && <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping" />}
         </button>
      </div>
    </div>
  );
};

// --- REUSABLE GLASS HUD ---
interface GlassHUDProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  headerAction?: React.ReactNode;
}

const GlassHUD: React.FC<GlassHUDProps> = ({ title, icon: Icon, children, className = "", onClose, headerAction }) => (
  <div className={`
    bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden
    shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors
    ${className}
  `}>
    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={16} className="text-purple-400" />}
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">{title}</span>
      </div>
      <div className="flex gap-2">
        {headerAction}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
    <div className="p-5 flex-1 overflow-auto custom-scrollbar relative">
      {children}
    </div>
  </div>
);

// --- MODULE: SONIC LAB ---
const SonicAnalyzer = ({ playing, togglePlay }: { playing: boolean; togglePlay: () => void }) => (
  <div className="h-full flex flex-col gap-6">
    <div className="flex-1 bg-black/20 border border-white/5 rounded-xl flex items-end justify-center px-6 pb-6 gap-1.5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
      {[...Array(32)].map((_, i) => (
        <div 
          key={i} 
          className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-[2px] transition-all duration-75 ease-out shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          style={{ 
            height: playing ? `${Math.random() * 80 + 10}%` : `${15 + Math.sin(i * 0.5) * 10}%`,
            opacity: playing ? 1 : 0.4
          }}
        />
      ))}
      <button 
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
          {playing ? <Pause className="fill-black text-black" size={24} /> : <Play className="fill-black text-black ml-1" size={24} />}
        </div>
      </button>
    </div>
    
    <div className="grid grid-cols-4 gap-4">
      {['Energy', 'Valence', 'BPM', 'Dance'].map(s => (
        <div key={s} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:border-purple-500/30 transition-colors cursor-pointer">
          <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">{s}</div>
          <div className="text-xl font-bold text-white font-mono">0.85</div>
        </div>
      ))}
    </div>
  </div>
);

// --- MODULE: RAG GRAPH ---
const RAGNetwork = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if(!query) return;
    setSearching(true);
    setResults([]);
    setTimeout(() => {
      setSearching(false);
      setResults([
        { id: 1, title: 'Mikrokosmos', score: 98, context: 'Lyrics match: "Shine, dream, smile"' },
        { id: 2, title: 'Magic Shop', score: 95, context: 'Theme: Healing & Comfort' },
        { id: 3, title: 'Home', score: 91, context: 'Semantic overlap: "Connection"' }
      ]);
    }, 1200);
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 py-2 gap-2">
          <Search size={14} className="text-white/40"/>
          <input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            type="text" 
            placeholder="Query the Archive..." 
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-white/20"
          />
        </div>
        <button onClick={handleSearch} className="bg-purple-600 px-4 rounded-lg text-white hover:bg-purple-500 transition-colors">
          {searching ? <RefreshCw className="animate-spin" size={14}/> : <ChevronRight size={14}/>}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {results.length > 0 ? (
          <div className="space-y-2 overflow-y-auto">
            {results.map(r => (
              <div key={r.id} className="p-3 bg-white/5 border border-white/5 rounded-lg hover:border-purple-500/30 transition-all animate-in slide-in-from-bottom-2 cursor-pointer group">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-white group-hover:text-purple-300">{r.title}</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded font-mono">{r.score}%</span>
                </div>
                <div className="text-[10px] text-white/50">{r.context}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden bg-black/20">
             <div className="text-center space-y-2">
                <Network size={32} className="text-white/20 mx-auto" />
                <p className="text-[10px] text-white/30 font-mono">WAITING FOR QUERY</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODULE: DATA HUB ---
const DataHub = () => (
  <div className="h-full flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/50">245 Records</span>
        <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-[10px]">Updated Today</span>
      </div>
      <button className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors">
        <Download size={12}/> Export CSV
      </button>
    </div>
    <div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <table className="w-full text-left text-[10px] text-white/70">
        <thead className="bg-white/5 text-white/40 sticky top-0 backdrop-blur-md">
          <tr>
            <th className="p-3 font-medium">Title</th>
            <th className="p-3 font-medium">Album</th>
            <th className="p-3 font-medium">BPM</th>
            <th className="p-3 font-medium">Sentiment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {SONG_DATABASE.map(s => (
            <tr key={s.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
              <td className="p-3 font-medium text-white group-hover:text-purple-300">{s.title}</td>
              <td className="p-3">{s.album}</td>
              <td className="p-3 font-mono">{s.bpm}</td>
              <td className="p-3">
                <span className={`px-1.5 py-0.5 rounded ${
                  s.sentiment === 'Joy' ? 'bg-yellow-500/10 text-yellow-400' : 
                  s.sentiment === 'Fear' ? 'bg-red-500/10 text-red-400' : 
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {s.sentiment}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- MODULE: MEMBER DNA (Full Screen) ---
interface MemberDNAProps {
  memberId: string;
  onClose: () => void;
}

const MemberDNA: React.FC<MemberDNAProps> = ({ memberId, onClose }) => {
  const member = MEMBER_DATA.find(m => m.id === memberId);
  if (!member) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#050010]/95 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-10 duration-500 flex flex-col">
      {/* Top Bar */}
      <div className="h-20 flex items-center justify-between px-10 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} className="text-white"/>
          </button>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Artist DNA Archive</h1>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 rounded-full border border-white/10 text-xs text-white/60">{member.role}</span>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-10">
          
          {/* Left Column: ID Card */}
          <div className="col-span-4 space-y-8">
             <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                   {/* Placeholder for Artist Image */}
                   <span className="text-6xl font-bold text-white/10">{member.id.toUpperCase()}</span>
                </div>
                <div className="absolute bottom-0 left-0 p-8">
                   <h2 className="text-6xl font-bold text-white mb-2 tracking-tighter">{member.name}</h2>
                   <p className="text-purple-300 font-mono">{member.full}</p>
                </div>
             </div>
             
             <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-purple-400">
                   <PenTool size={20}/>
                   <span className="text-xs font-bold tracking-widest uppercase">KOMCA Credits</span>
                </div>
                <div className="text-5xl font-bold text-white">{member.komca}</div>
                <div className="text-xs text-white/40 mt-2">Registered Songs</div>
             </div>
          </div>

          {/* Right Column: Data */}
          <div className="col-span-8 space-y-8">
             {/* Bio */}
             <div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Profile Analysis</h3>
                <p className="text-xl text-white/90 leading-relaxed font-light border-l-2 border-purple-500 pl-6">
                   {member.bio}
                </p>
             </div>

             {/* Solo Discography */}
             <div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Key Productions & Solos</h3>
                <div className="grid grid-cols-3 gap-4">
                   {member.soloTracks.map(track => (
                      <div key={track} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
                         <Disc className="text-white/20 mb-3 group-hover:text-purple-400 transition-colors" size={24}/>
                         <div className="font-bold text-white">{track}</div>
                         <div className="text-xs text-white/40 mt-1">Single</div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Achievements */}
             <div>
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Achievements</h3>
                <div className="flex flex-col gap-3">
                   {member.achievements.map(ach => (
                      <div key={ach} className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border-l-4 border-purple-500">
                         <Award className="text-yellow-400" size={20}/>
                         <span className="text-white font-medium">{ach}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- MODULE: LYRICIST ---
const LyricistAI = () => {
  const [text, setText] = useState("");
  const [gen, setGen] = useState(false);

  const run = () => {
    setGen(true);
    setText("");
    const poem = "Galaxy wide, eyes open,\nWe connect through the light.\n(Chorus)\nShining through the darkest night,\nYou are my universe.";
    let i = 0;
    const t = window.setInterval(() => {
      setText(p => p + poem.charAt(i));
      i++;
      if (i >= poem.length) { clearInterval(t); setGen(false); }
    }, 50);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-xs text-purple-200 leading-relaxed overflow-y-auto">
        {!text && !gen && <span className="text-white/20">// Neural Lyricist Ready...</span>}
        {text}
        {gen && <span className="w-1.5 h-3 bg-white inline-block ml-1 animate-pulse"/>}
      </div>
      <button 
        onClick={run}
        disabled={gen}
        className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-xs font-bold tracking-widest text-white flex items-center justify-center gap-2 transition-all"
      >
        {gen ? <RefreshCw className="animate-spin" size={12}/> : <Sparkles size={12}/>} GENERATE
      </button>
    </div>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  const [mode, setMode] = useState<'landing' | 'warp' | 'dashboard'>('landing');
  const [activeSection, setActiveSection] = useState('overview'); // overview, rag, sonic, data
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleSync = () => {
    setMode('warp');
    setTimeout(() => {
      setMode('dashboard');
    }, 2000);
  };

  return (
    <div className="relative w-screen h-screen bg-black text-white font-sans overflow-hidden selection:bg-purple-500/50">
      <NoiseOverlay />

      {/* 1. UNIVERSE LAYER */}
      <Universe3D mode={mode} />

      {/* 2. LANDING */}
      {mode === 'landing' && <LandingRitual onSync={handleSync} />}

      {/* 3. DASHBOARD */}
      {mode === 'dashboard' && !activeMemberId && (
        <div className="absolute inset-0 z-10 flex animate-in fade-in duration-1000">
          
          {/* Sidebar */}
          <div className="w-20 bg-[#0A051A]/80 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 gap-8 z-50">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <BTSLogo className="w-5 h-5 text-white" />
            </div>
            
            <nav className="flex flex-col gap-6 w-full px-3">
              {[
                { id: 'overview', icon: Layers, label: 'Dash' },
                { id: 'sonic', icon: Activity, label: 'Sonic' },
                { id: 'rag', icon: Network, label: 'Graph' },
                { id: 'data', icon: Database, label: 'Data' },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    p-3 rounded-xl transition-all duration-300 relative group
                    ${activeSection === item.id 
                      ? 'bg-purple-600 text-white shadow-[0_0_20px_#9333ea]' 
                      : 'text-white/40 hover:text-white hover:bg-white/10'}
                  `}
                >
                  <item.icon size={20} />
                </button>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
               <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Settings size={18} className="text-white/50"/>
               </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
             
             {/* Header */}
             <header className="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-[#020005]/80 to-transparent pointer-events-auto">
                <div>
                   <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      {activeSection === 'overview' ? 'MISSION CONTROL' : activeSection === 'sonic' ? 'SONIC LAB' : activeSection === 'rag' ? 'KNOWLEDGE GRAPH' : 'DATA HUB'}
                   </h1>
                   <div className="flex items-center gap-2 text-[10px] text-purple-300 font-mono tracking-widest mt-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> SYSTEM ONLINE
                   </div>
                </div>

                {/* Member Selectors */}
                <div className="flex gap-3 bg-black/20 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
                   {MEMBER_DATA.map(m => (
                      <button 
                         key={m.id}
                         onClick={() => setActiveMemberId(m.id)}
                         className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border border-transparent hover:border-white/50 hover:bg-white/10 text-white/60 hover:text-white"
                         style={{ color: m.color }}
                      >
                         {m.name}
                      </button>
                   ))}
                </div>
             </header>

             {/* Main Views */}
             <main className="flex-1 p-8 overflow-hidden relative">
                
                {/* OVERVIEW MODE */}
                {activeSection === 'overview' && (
                   <div className="grid grid-cols-12 gap-6 h-full">
                      <div className="col-span-8 flex flex-col gap-6">
                         <GlassHUD title="Live Waveform" icon={Activity} className="h-64">
                            <SonicAnalyzer playing={playing} togglePlay={() => setPlaying(!playing)} />
                         </GlassHUD>
                         <div className="flex-1 grid grid-cols-2 gap-6">
                            <GlassHUD title="Recent Queries" icon={Search} className="h-full">
                               <div className="space-y-2">
                                  {['Themes of "Love"', 'BPM > 120', 'Songwriter: RM'].map((q, i) => (
                                     <div key={i} className="p-3 bg-white/5 rounded border border-white/5 text-xs text-white/70 flex justify-between">
                                        <span>{q}</span>
                                        <ChevronRight size={14} className="text-white/30"/>
                                     </div>
                                  ))}
                               </div>
                            </GlassHUD>
                            <GlassHUD title="System Status" icon={Cpu} className="h-full">
                               <div className="space-y-4 pt-2">
                                  {['Vector Index', 'Audio Engine', 'Lyrics Model'].map(s => (
                                     <div key={s} className="flex justify-between items-center">
                                        <span className="text-xs text-white/60">{s}</span>
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">ACTIVE</span>
                                     </div>
                                  ))}
                               </div>
                            </GlassHUD>
                         </div>
                      </div>
                      <div className="col-span-4">
                         <GlassHUD title="Neural Lyricist" icon={Mic2} className="h-full">
                            <LyricistAI />
                         </GlassHUD>
                      </div>
                   </div>
                )}

                {/* SONIC MODE */}
                {activeSection === 'sonic' && (
                   <div className="h-full max-w-5xl mx-auto">
                      <GlassHUD title="Audio Vector Analysis" icon={Activity} className="h-full">
                         <SonicAnalyzer playing={playing} togglePlay={() => setPlaying(!playing)} />
                      </GlassHUD>
                   </div>
                )}

                {/* GRAPH MODE */}
                {activeSection === 'rag' && (
                   <div className="h-full max-w-4xl mx-auto">
                      <GlassHUD title="Knowledge Graph Explorer" icon={Network} className="h-full">
                         <RAGNetwork />
                      </GlassHUD>
                   </div>
                )}

                {/* DATA MODE */}
                {activeSection === 'data' && (
                   <div className="h-full max-w-6xl mx-auto">
                      <GlassHUD title="Raw Discography Data" icon={Database} className="h-full">
                         <DataHub />
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

    </div>
  );
}