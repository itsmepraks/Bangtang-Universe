import React, { useState, useEffect } from 'react';
import { generateStars, generateBokehBubbles, generateFloatingParticles } from './utils/helpers';
import type { SearchResult } from './types';
import {
  Activity,
  Search,
  Database,
  Cpu,
  Mic2,
  Play,
  Pause,
  Settings,
  Network,
  X,
  Disc,
  ChevronRight,
  ChevronLeft,
  Layers,
  PenTool,
  Sparkles,
  Download,
  RefreshCw,
  Award,
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

const ShootingStar = () => {
  const [style] = useState(() => ({
    top: `${Math.random() * 50}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 20}s`,
    duration: `${2 + Math.random() * 3}s`
  }));

  return (
    <div
      className="absolute w-[2px] h-[2px] bg-white rounded-full animate-[shooting-star_linear_infinite]"
      style={{
        top: style.top,
        left: style.left,
        animationDelay: style.delay,
        animationDuration: style.duration,
        boxShadow: '0 0 10px 2px white'
      }}
    >
      <div className="absolute top-1/2 left-0 w-[150px] h-[1px] bg-gradient-to-r from-white to-transparent -translate-y-1/2 rotate-[-45deg] origin-left opacity-40" />
    </div>
  );
};

const Whalien = () => (
  <div className="absolute w-[600px] h-[300px] opacity-40 animate-[float_80s_linear_infinite] pointer-events-none mix-blend-screen" style={{ top: '15%', left: '-30%' }}>
    <svg viewBox="0 0 400 200" className="w-full h-full">
      {/* The "Whalien" Constellation Lines */}
      <path
        d="M40,100 L100,60 L180,50 L280,70 L360,100 L320,140 L240,150 L140,140 L40,100 M100,60 L140,90 L240,100 L320,140 M180,50 L200,80 L240,100"
        fill="none"
        stroke="#A855F7"
        strokeWidth="0.8"
        strokeDasharray="1000"
        className="animate-[draw-line_15s_ease-out_infinite_alternate] opacity-60"
      />
      {/* Constellation Stars (Nodes) */}
      {[
        [40, 100], [100, 60], [180, 50], [280, 70], [360, 100],
        [320, 140], [240, 150], [140, 140], [140, 90], [240, 100], [200, 80]
      ].map(([x, y], idx) => (
        <circle
          key={idx}
          cx={x} cy={y} r="1.5"
          fill="white"
          className="animate-pulse shadow-[0_0_10px_white]"
          style={{ animationDelay: `${idx * 0.3}s` }}
        />
      ))}
      {/* Soft body glow */}
      <path
        d="M40,100 Q100,40 200,50 T360,100 Q300,160 200,150 T40,100"
        fill="url(#whaleGradient)"
        className="opacity-20 blur-xl"
      />
      <defs>
        <radialGradient id="whaleGradient">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

const PurpleOcean = () => {
  const [bubbles] = useState(() => generateBokehBubbles(20));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-600/20 blur-[80px] animate-[bokeh-float_infinite_ease-in-out]"
          style={{
            left: b.left,
            top: b.top,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

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
  const [stars] = useState(() => generateStars(800));

  return (
    <div className="absolute inset-0 bg-[#020005] overflow-hidden perspective-[1200px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.4),_rgba(0,0,0,1)_95%)]" />

      {/* DEEP COSMIC NEBULAS */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_20%_30%,_#4c1d95_0%,_transparent_60%)] animate-[nebula-pulse_30s_infinite_alternate]" />
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_80%_70%,_#1e1b4b_0%,_transparent_60%)] animate-[nebula-pulse_35s_infinite_alternate_reverse]" />
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.1)_0%,_transparent_50%)] animate-[galaxy-spin_120s_infinite_linear]" />
      </div>

      {/* SHOOTING STARS */}
      <ShootingStar />
      <ShootingStar />
      <ShootingStar />

      <div className="mist-layer opacity-20" />
      <div className="mist-layer opacity-15 blur-[180px]" style={{ animationDelay: '-45s' }} />

      {/* THE PURPLE OCEAN (Bokeh Layer) */}
      <PurpleOcean />

      {/* The Space Whale Swimming in Background */}
      <Whalien />

      <div
        className={`absolute inset-0 flex items-center justify-center transform-style-3d transition-all duration-[2500ms] cubic-bezier(0.4, 0, 0.2, 1)
          ${mode === 'warp' ? 'scale-[8] translate-z-[2000px] blur-sm opacity-50' : mode === 'dashboard' ? 'scale-[0.95] rotate-x-5' : 'scale-100'}
        `}
      >
        <div className={`relative w-[1200px] h-[1200px] transform-style-3d ${mode === 'landing' ? 'animate-[spin_100s_linear_infinite]' : 'animate-[spin_300s_linear_infinite]'}`}>

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
  return (
    <div className="absolute inset-0 z-50 grid place-items-center overflow-hidden select-none">
      {/* Title Section - Properly spaced at top */}
      <div className="absolute top-[12%] left-0 right-0 text-center z-10 animate-in fade-in slide-in-from-top-8 duration-1000">
        <h1
          className="text-6xl md:text-8xl font-black text-white tracking-[0.2em] uppercase leading-tight"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            textShadow: '0 0 60px rgba(168,85,247,0.6), 0 0 120px rgba(168,85,247,0.3), 0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          BTS Neural Archive
        </h1>
        <p className="mt-6 text-white/30 text-sm tracking-[0.5em] uppercase font-light">
          Seven Stars • One Universe
        </p>
      </div>

      {/* Decorative Constellation Lines */}
      <div className="absolute inset-0 pointer-events-none z-5">
        <svg className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Constellation Lines */}
          <line x1="15%" y1="25%" x2="30%" y2="35%" stroke="url(#lineGrad)" strokeWidth="1" className="animate-pulse" />
          <line x1="70%" y1="28%" x2="85%" y2="22%" stroke="url(#lineGrad)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="70%" x2="35%" y2="65%" stroke="url(#lineGrad)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '2s' }} />
          <line x1="75%" y1="72%" x2="90%" y2="78%" stroke="url(#lineGrad)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '3s' }} />
        </svg>
        {/* Subtle corner accents */}
        <div className="absolute top-[22%] left-[15%] w-2 h-2 bg-purple-400/40 rounded-full blur-[2px] animate-pulse" />
        <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 bg-purple-300/30 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[28%] left-[18%] w-1.5 h-1.5 bg-purple-400/30 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[22%] right-[15%] w-2 h-2 bg-purple-300/40 rounded-full blur-[2px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Centered Logo Section - Perfectly centered */}
      <div className="relative flex flex-col items-center justify-center z-20 gap-12 group">
        {/* THE GATEWAY LOGO */}
        <button
          onClick={onSync}
          className="relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer outline-none focus:outline-none ring-0 focus:ring-0 select-none hover:scale-105 active:scale-95 group/logo"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Multi-layer glow effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Outer ambient glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse group-hover/logo:opacity-60 transition-opacity duration-1000"
            />
            {/* Inner glow ring */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/25 blur-[80px] group-hover/logo:scale-110 transition-transform duration-1000"
            />
            {/* Core glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-purple-400/30 blur-[40px] group-hover/logo:bg-purple-300/40 transition-all duration-700"
            />
          </div>

          {/* BTS Logo - Larger and more prominent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-[logo-glow_6s_infinite] group-hover/logo:drop-shadow-[0_0_40px_rgba(255,255,255,0.9)] transition-all duration-700">
            <BTSLogo className="w-24 h-24 text-white" />
          </div>

          {/* Orbiting Connection Points - Larger and more visible */}
          {MEMBER_DATA.map((m, i) => {
            const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
            const dist = 140;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            return (
              <div
                key={m.id}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full opacity-60 transition-all duration-700 group-hover/logo:opacity-100 group-hover/logo:scale-125"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  backgroundColor: m.color,
                  boxShadow: `0 0 20px ${m.color}, 0 0 40px ${m.color}50`,
                  transitionDelay: `${i * 60}ms`
                }}
              />
            )
          })}

          {/* Connection lines between dots */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 group-hover/logo:opacity-50 transition-opacity duration-700">
            {MEMBER_DATA.map((_, i) => {
              const angle1 = (i / 7) * Math.PI * 2 - Math.PI / 2;
              const angle2 = ((i + 1) / 7) * Math.PI * 2 - Math.PI / 2;
              const dist = 140;
              const x1 = 112 + Math.cos(angle1) * dist;
              const y1 = 112 + Math.sin(angle1) * dist;
              const x2 = 112 + Math.cos(angle2) * dist;
              const y2 = 112 + Math.sin(angle2) * dist;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#A855F7"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              );
            })}
          </svg>
        </button>

        {/* Enhanced Call to Action - Much more visible */}
        <button
          onClick={onSync}
          className="flex flex-col items-center gap-5 group/text cursor-pointer hover:scale-105 transition-all duration-500"
        >
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent group-hover/text:w-32 group-hover/text:via-purple-300 transition-all duration-700" />
          <span className="text-sm text-white/50 tracking-[0.6em] font-medium uppercase group-hover/text:text-white group-hover/text:tracking-[0.8em] transition-all duration-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            Enter Dashboard
          </span>
          <div className="flex items-center gap-2 opacity-0 group-hover/text:opacity-100 transition-opacity duration-500">
            <ChevronRight size={16} className="text-purple-400 animate-pulse" />
          </div>
        </button>
      </div>
    </div>
  );
};

const FloatingParticles = () => {
  const [particles] = useState(() => generateFloatingParticles(15));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/20 animate-[float-particle_infinite_ease-in-out]"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
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
  accentColor?: string;
}

const GlassHUD: React.FC<GlassHUDProps> = ({ title, icon: Icon, children, className = "", onClose, headerAction, accentColor = "#A855F7" }) => (
  <div className={`
    relative rounded-3xl flex flex-col overflow-hidden
    transition-all duration-500 group/hud
    border border-white/[0.06] hover:border-purple-500/30
    ${className}
  `}
    style={{
      '--accent-color': accentColor,
      background: 'linear-gradient(135deg, rgba(20, 10, 35, 0.5) 0%, rgba(8, 4, 15, 0.7) 100%)',
      backdropFilter: 'blur(40px) saturate(180%)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.03)'
    } as React.CSSProperties}>
    {/* Soft Inner Glow */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-500 group-hover/hud:opacity-[0.08]"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 60%)` }} />
    {/* Top edge highlight */}
    <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    <div className="px-7 py-6 border-b border-white/[0.04] bg-white/[0.015] flex items-center justify-between relative z-10">
      <div className="flex items-center gap-4">
        {Icon && <Icon size={20} className="group-hover/hud:animate-pulse transition-colors duration-500" style={{ color: accentColor }} />}
        <span className="text-xs font-bold tracking-[0.35em] text-white/50 uppercase group-hover/hud:text-white/80 transition-colors duration-500">{title}</span>
      </div>
      <div className="flex gap-2">
        {headerAction}
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
    <div className="p-7 flex-1 overflow-auto pretty-scrollbar relative z-10">
      {children}
    </div>
  </div>
);

// --- MODULE: SONIC LAB ---
const SonicAnalyzer = ({ playing, togglePlay, accentColor = "#A855F7" }: { playing: boolean; togglePlay: () => void; accentColor?: string }) => {

  useEffect(() => {
    // Determine heights only on mount to be pure, then we can animate with CSS or update periodically if needed.
    // However, to keep it simple and pure, we generate a static set of random heights for the "stopped" state.
    // For "playing", we can rely on CSS animations or we can use a simpler deterministic value.
    // Actually, `playing ? random : sine`. The playing part needs to animate.
    // We can simulate the "random" equalizer effect using CSS keyframes for each bar with different durations.
    // That avoids Math.random() in render entirely.

    // So here just generate the static "sine" wave offsets or just nothing, 
    // and let the render logic use the index `i` for the sine wave.
  }, []);

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex-1 bg-black/20 border border-white/5 rounded-[2.5rem] flex items-end justify-center px-10 pb-10 gap-2 relative overflow-hidden group shadow-inner">
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-20 group-hover:opacity-40"
          style={{ background: `linear-gradient(to top, ${accentColor} 0%, transparent 100%)` }} />
        <FloatingParticles />
        {[...Array(24)].map((_, i) => {
          // Deterministic value for "paused" state
          const pausedHeight = 15 + Math.sin(i * 0.4) * 10;

          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              style={{
                height: `${pausedHeight}%`, // Base height
                animation: playing ? `equalizer ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : 'none',
                background: `linear-gradient(to top, ${accentColor} 0%, white 100%)`,
                filter: 'blur(0.5px)',
                opacity: playing ? 0.9 : 0.2,
                transitionDelay: `${i * 20}ms`
              }}
            />
          )
        })}

        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 bg-black/20 backdrop-blur-[4px]"
        >
          <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-white/20 transition-all duration-500 backdrop-blur-xl">
            {playing ? <Pause className="fill-white text-white" size={32} /> : <Play className="fill-white text-white ml-2" size={32} />}
          </div>
        </button>

        {/* Inject custom keyframes for the equalizer if not present in global CSS */}
        <style>{`
        @keyframes equalizer {
          0% { height: 15%; }
          50% { height: 80%; }
          100% { height: 30%; }
        }
      `}</style>
      </div>

      <div className="grid grid-cols-4 gap-6 px-2">
        {['Energy', 'Valence', 'BPM', 'Dance'].map(s => (
          <div key={s} className="bg-white/[0.01] rounded-[1.5rem] p-5 text-center border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-700 cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700" style={{ backgroundColor: accentColor }} />
            <div className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2 group-hover:text-white/60 transition-colors relative z-10">{s}</div>
            <div className="text-3xl font-light text-white/90 font-mono tracking-tighter relative z-10">0.85</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MODULE: RAG GRAPH ---
const RAGNetwork = ({ accentColor = "#A855F7" }: { accentColor?: string }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query) return;
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
    <div className="h-full flex flex-col gap-8">
      <div className="flex gap-4 p-2 bg-white/[0.02] rounded-2xl border border-white/5">
        <div className="flex-1 flex items-center px-4 gap-3">
          <Search size={16} className="text-white/20" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            type="text"
            placeholder="Search the Archive..."
            className="bg-transparent border-none text-[13px] text-white focus:outline-none w-full placeholder:text-white/10 font-light tracking-wide"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 rounded-xl text-white font-bold text-[10px] tracking-widest transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {searching ? <RefreshCw className="animate-spin" size={14} /> : 'EXECUTE'}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {results.length > 0 ? (
          <div className="space-y-3 overflow-y-auto pretty-scrollbar pr-2">
            {results.map(r => (
              <div key={r.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 animate-in slide-in-from-bottom-4 cursor-pointer group">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-white/80 group-hover:text-white transition-colors tracking-tight">{r.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-mono transition-colors"
                    style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}>
                    {r.score}% Match
                  </span>
                </div>
                <div className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">{r.context}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 border border-white/5 rounded-[2rem] flex items-center justify-center relative overflow-hidden bg-black/20">
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }} />
            <div className="text-center space-y-4 relative z-10">
              <Network size={40} className="text-white/10 mx-auto group-hover:scale-110 transition-transform duration-1000" />
              <p className="text-[10px] text-white/20 font-mono tracking-[0.5em] uppercase">SYSTEM IDLE • READY FOR ANALYSIS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODULE: DATA HUB ---
const DataHub = ({ accentColor = "#A855F7" }: { accentColor?: string }) => (
  <div className="h-full flex flex-col gap-8">
    <div className="flex justify-between items-center px-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Database Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">245 Records</span>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-white/5 mx-2" />
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Last Update</span>
          <span className="text-[10px] font-bold text-purple-300/80 tracking-[0.2em] uppercase">Synchronized Today</span>
        </div>
      </div>
      <button className="flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 hover:text-white hover:border-white/30 tracking-[0.2em] uppercase transition-all duration-700 hover:scale-105 group">
        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Export Neural Archive
      </button>
    </div>
    <div className="flex-1 border border-white/5 rounded-[2.5rem] overflow-hidden bg-black/10 backdrop-blur-xl shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <table className="w-full text-left text-[12px] text-white/60 border-collapse">
        <thead className="bg-white/[0.03] text-white/20 uppercase tracking-[0.3em] font-black sticky top-0 backdrop-blur-3xl border-b border-white/5 z-20">
          <tr>
            <th className="px-8 py-6">Composition</th>
            <th className="px-8 py-6">Source Album</th>
            <th className="px-8 py-6 text-center">BPM</th>
            <th className="px-8 py-6 text-right">Emotional Index</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
          {SONG_DATABASE.map(s => (
            <tr key={s.id} className="hover:bg-white/[0.03] transition-all duration-700 cursor-pointer group">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-white/80 group-hover:text-white transition-colors tracking-tight text-sm">{s.title}</span>
                  <span className="text-[9px] text-white/20 uppercase tracking-widest mt-1 font-mono">Archive ID: {s.id.toString().padStart(3, '0')}</span>
                </div>
              </td>
              <td className="px-8 py-6 text-white/40 group-hover:text-white/60 transition-colors font-light tracking-wide">{s.album}</td>
              <td className="px-8 py-6 text-center">
                <span className="font-mono text-[13px] text-white/30 group-hover:text-white/80 transition-colors" style={{ color: s.bpm > 130 ? accentColor : '' }}>{s.bpm}</span>
              </td>
              <td className="px-8 py-6 text-right">
                <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-700 group-hover:scale-110 inline-block ${s.sentiment === 'Joy' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400/60 group-hover:bg-yellow-500/10 group-hover:text-yellow-400' :
                  s.sentiment === 'Fear' ? 'bg-red-500/5 border-red-500/20 text-red-400/60 group-hover:bg-red-500/10 group-hover:text-red-400' :
                    'bg-blue-500/5 border-blue-500/20 text-blue-400/60 group-hover:bg-blue-500/10 group-hover:text-blue-400'
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
    <div className="absolute inset-0 z-[100] bg-[#020005]/85 backdrop-blur-[80px] animate-in fade-in duration-700 flex flex-col overflow-hidden">
      {/* Dynamic Member Aura - Enhanced with stronger gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-40 blur-[180px]"
          style={{ background: `radial-gradient(circle at 30% 30%, ${member.color} 0%, transparent 50%)` }} />
        <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] opacity-30 blur-[180px]"
          style={{ background: `radial-gradient(circle at 70% 70%, ${member.color} 0%, transparent 50%)` }} />
        <FloatingParticles />
      </div>

      {/* Top Bar - Enhanced with gradient background */}
      <div
        className="h-28 flex items-center justify-between px-16 border-b border-white/[0.06] relative z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)' }}
      >
        <div className="flex items-center gap-8">
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:scale-105 group border border-white/[0.06] hover:border-white/20">
            <ChevronLeft size={24} className="text-white group-hover:text-purple-300 transition-colors" />
          </button>
          <div>
            <h1
              className="text-3xl font-light tracking-[0.4em] text-white uppercase"
              style={{ textShadow: `0 0 30px ${member.color}40, 0 4px 20px rgba(0,0,0,0.3)` }}
            >
              Artist Profile Archive
            </h1>
            <div className="text-[10px] text-white/40 font-mono tracking-[0.5em] mt-2 uppercase">Subject ID: {member.id.toUpperCase()} • Connection Stable</div>
          </div>
        </div>
        <div className="flex gap-4">
          <span
            className="px-6 py-2.5 rounded-full border text-[10px] font-bold tracking-widest uppercase"
            style={{
              borderColor: `${member.color}40`,
              backgroundColor: `${member.color}10`,
              color: member.color
            }}
          >
            {member.role}
          </span>
        </div>
      </div>

      <div className="flex-1 p-16 overflow-y-auto pretty-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-16 items-start">

          {/* Left Column: ID Card */}
          <div className="col-span-5 space-y-12 animate-in slide-in-from-left-12 duration-1000">
            <div className="relative aspect-[3/4.2] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
              {/* Image Placeholder with Member Aura */}
              <div className="absolute inset-0 bg-[#0a0a0f]" />
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
                style={{ background: `radial-gradient(circle at center, ${member.color} 0%, transparent 80%)` }} />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <BTSLogo className="w-32 h-32 text-white/5 mb-8 group-hover:scale-110 transition-transform duration-1000" />
                <span className="text-[120px] font-black text-white/5 tracking-tighter group-hover:text-white/[0.08] transition-colors duration-1000">{member.id.toUpperCase()}</span>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <h2 className="text-7xl font-light text-white mb-4 tracking-tighter drop-shadow-2xl">{member.name}</h2>
                <p className="text-2xl font-light tracking-[0.2em] opacity-60" style={{ color: member.color }}>{member.full}</p>
                <div className="mt-8 flex gap-3">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold tracking-widest text-white/40 uppercase">Mic: {member.mic}</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-700 shadow-2xl group">
              <div className="flex items-center gap-4 mb-6" style={{ color: member.color }}>
                <PenTool size={22} className="group-hover:animate-bounce" />
                <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-60">KOMCA Credits</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="text-7xl font-light text-white tracking-tighter">{member.komca}</div>
                <div className="text-[10px] text-white/30 mb-3 font-mono tracking-widest uppercase">Verified Productions</div>
              </div>
              <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-current transition-all duration-1000 w-[70%]" style={{ backgroundColor: member.color, width: `${(member.komca / 220) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Right Column: Data */}
          <div className="col-span-7 space-y-16 animate-in slide-in-from-right-12 duration-1000">
            {/* Bio */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Subject Profile Analysis</h3>
              <p className="text-3xl text-white/80 leading-[1.6] font-extralight border-l-4 pl-12 transition-all duration-1000 hover:border-white/40" style={{ borderColor: member.color }}>
                {member.bio}
              </p>
            </div>

            {/* Solo Discography */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Discography Link</h3>
              <div className="grid grid-cols-2 gap-6">
                {member.soloTracks.map((track, i) => (
                  <div key={track} className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-700 cursor-pointer group flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Disc className="text-white/20 group-hover:text-white transition-colors" style={{ color: i === 0 ? member.color : '' }} size={28} />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white group-hover:text-purple-200 transition-colors tracking-tight">{track}</div>
                      <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-mono">Archive Record 0{i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Milestone Archive</h3>
              <div className="grid grid-cols-1 gap-4">
                {member.achievements.map((ach, i) => (
                  <div key={ach}
                    className="flex items-center gap-8 p-6 bg-gradient-to-r from-white/[0.03] to-transparent rounded-[1.5rem] border-l-4 group transition-all duration-500 hover:translate-x-2"
                    style={{ borderColor: member.color, animationDelay: `${i * 0.2}s` }}>
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                      <Award className="text-white/40 group-hover:text-yellow-400 transition-colors" size={20} />
                    </div>
                    <span className="text-lg text-white/70 font-light tracking-wide group-hover:text-white transition-colors">{ach}</span>
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
        {gen && <span className="w-1.5 h-3 bg-white inline-block ml-1 animate-pulse" />}
      </div>
      <button
        onClick={run}
        disabled={gen}
        className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-xs font-bold tracking-widest text-white flex items-center justify-center gap-2 transition-all"
      >
        {gen ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />} GENERATE
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
  const [showSettings, setShowSettings] = useState(false);

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
                  <div className="col-span-8 flex flex-col gap-8">
                    <GlassHUD title="Live Waveform Analysis" icon={Activity} className="h-72">
                      <SonicAnalyzer playing={playing} togglePlay={() => setPlaying(!playing)} />
                    </GlassHUD>
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
                    <SonicAnalyzer playing={playing} togglePlay={() => setPlaying(!playing)} />
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
