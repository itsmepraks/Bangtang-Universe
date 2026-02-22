import React, { useMemo } from 'react';
import { Play, Pause, ChevronDown } from 'lucide-react';
import type { Song } from '../../types/database';

export interface SonicAnalyzerProps {
    playing: boolean;
    togglePlay: () => void;
    song: Song | null;
    onSelectSong: (s: Song | null) => void;
    accentColor?: string;
    songs: Song[];
    getAlbumTitle: (id: number | null) => string;
}

export const SonicAnalyzer: React.FC<SonicAnalyzerProps> = ({
    playing,
    togglePlay,
    song,
    onSelectSong,
    accentColor = "#A855F7",
    songs = [],
    getAlbumTitle
}) => {
    const globalAverages = useMemo(() => {
        if (!songs.length) return { energy: "0.80", valence: "0.50", bpm: 120, dance: "0.70" };

        const totals = songs.reduce((acc, s) => ({
            energy: acc.energy + (s.energy || 0),
            valence: acc.valence + (s.valence || 0),
            bpm: acc.bpm + (s.bpm || 0),
            dance: acc.dance + (s.danceability || 0)
        }), { energy: 0, valence: 0, bpm: 0, dance: 0 });
        const len = songs.length;
        return {
            energy: (totals.energy / len).toFixed(2),
            valence: (totals.valence / len).toFixed(2),
            bpm: Math.round(totals.bpm / len),
            dance: (totals.dance / len).toFixed(2)
        };
    }, [songs]);

    const metrics = song ? {
        energy: (song.energy || 0).toFixed(2),
        valence: (song.valence || 0).toFixed(2),
        bpm: song.bpm || 0,
        dance: song.danceability ? song.danceability.toFixed(2) : "0.75"
    } : globalAverages;

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-end px-4 min-h-[40px]">
                <div className="flex flex-col gap-1 w-full mr-4">
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-xs font-medium uppercase tracking-wide text-white/50">Target Signal</h3>
                        {song && (
                            <button onClick={() => onSelectSong(null)} className="text-xs text-white/50 hover:text-white uppercase tracking-wide border border-white/10 px-2.5 py-1 rounded hover:bg-white/10 transition-colors">
                                Reset to Global
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <select
                            className="w-full bg-transparent text-xl text-white font-semibold tracking-wide appearance-none focus:outline-none cursor-pointer py-1 border-b border-transparent hover:border-white/20 transition-colors [&>option]:text-black"
                            value={song?.id || ""}
                            onChange={(e) => {
                                const s = songs.find(song => song.id === Number(e.target.value));
                                onSelectSong(s || null);
                            }}
                        >
                            <option value="">GLOBAL DISCOGRAPHY</option>
                            {songs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronDown size={14} className="text-white/40" />
                        </div>
                    </div>
                </div>
                {song && (
                    <div className="px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.08] text-xs text-white/60 tracking-wide uppercase whitespace-nowrap">
                        {getAlbumTitle(song.album_id)}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-black/20 border border-white/5 rounded-[2.5rem] flex items-end justify-center px-10 pb-10 gap-2 relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 transition-opacity duration-1000 opacity-20 group-hover:opacity-40"
                    style={{ background: `linear-gradient(to top, ${accentColor} 0%, transparent 100%)` }} />
                {[...Array(24)].map((_, i) => {
                    const seed = song ? (song.id * 13 + i * 7) % 100 : Math.sin(i * 0.4) * 10 + 15;
                    const pausedHeight = song ? 10 + (seed % 60) : 15 + Math.sin(i * 0.4) * 10;

                    return (
                        <div
                            key={i}
                            className="flex-1 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            style={{
                                height: `${pausedHeight}%`,
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

                <style>{`
        @keyframes equalizer {
          0% { height: 15%; }
          50% { height: 80%; }
          100% { height: 30%; }
        }
      `}</style>
            </div>

            <div className="grid grid-cols-4 gap-4 px-2">
                {[
                    { label: 'Energy', value: metrics.energy },
                    { label: 'Valence', value: metrics.valence },
                    { label: 'Avg BPM', value: metrics.bpm },
                    { label: 'Dance', value: metrics.dance }
                ].map(s => (
                    <div key={s.label} className="bg-white/[0.02] rounded-2xl p-4 text-center border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-pointer group relative overflow-hidden">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700" style={{ backgroundColor: accentColor }} />
                        <div className="text-xs font-medium text-white/50 uppercase tracking-wide mb-2 group-hover:text-white/70 transition-colors relative z-10">{s.label}</div>
                        <div className="text-2xl font-semibold text-white/90 font-mono tracking-tight relative z-10">{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SonicAnalyzer;
