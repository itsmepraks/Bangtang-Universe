import React from 'react';
import { Download } from 'lucide-react';
import { useSongs, useAlbums, useMembers } from '../../hooks';
import type { Song } from '../../types/database';
import { exportFullArchive } from '../../services/exportService';

export interface DataHubProps {
    accentColor?: string;
    onSelectSong: (s: Song) => void;
}

export const DataHub: React.FC<DataHubProps> = ({ accentColor = "#A855F7", onSelectSong }) => {
    const { songs } = useSongs();
    const { albums } = useAlbums();
    const { members } = useMembers();

    const getAlbumTitle = (id: number | null) => albums.find(a => a.id === id)?.title || 'Unknown Album';

    return (
        <div className="h-full flex flex-col gap-8">
            <div className="flex justify-between items-center px-4">
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Database Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">{songs.length} Records</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 mx-2" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">Last Update</span>
                        <span className="text-[10px] font-bold text-purple-300/80 tracking-[0.2em] uppercase">LIVE CONNECTION</span>
                    </div>
                </div>
                <button
                    onClick={() => exportFullArchive(songs, members, albums)}
                    className="flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 hover:text-white hover:border-white/30 tracking-[0.2em] uppercase transition-all duration-700 hover:scale-105 group"
                >
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
                        {songs.map(s => (
                            <tr
                                key={s.id}
                                onClick={() => onSelectSong(s)}
                                className="hover:bg-white/[0.03] transition-all duration-700 cursor-pointer group hover:pl-2"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white/80 group-hover:text-white transition-colors tracking-tight text-sm">{s.title}</span>
                                        <span className="text-[9px] text-white/20 uppercase tracking-widest mt-1 font-mono">Archive ID: {s.id.toString().padStart(3, '0')}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-white/40 group-hover:text-white/60 transition-colors font-light tracking-wide">{getAlbumTitle(s.album_id)}</td>
                                <td className="px-8 py-6 text-center">
                                    <span className="font-mono text-[13px] text-white/30 group-hover:text-white/80 transition-colors" style={{ color: (s.bpm || 0) > 130 ? accentColor : '' }}>{s.bpm || '-'}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-700 group-hover:scale-110 inline-block ${s.sentiment === 'Joy' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400/60 group-hover:bg-yellow-500/10 group-hover:text-yellow-400' :
                                        s.sentiment === 'Fear' ? 'bg-red-500/5 border-red-500/20 text-red-400/60 group-hover:bg-red-500/10 group-hover:text-red-400' :
                                            'bg-blue-500/5 border-blue-500/20 text-blue-400/60 group-hover:bg-blue-500/10 group-hover:text-blue-400'
                                        }`}>
                                        {s.sentiment || 'NEUTRAL'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataHub;
