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
                        <span className="text-xs text-white/50 tracking-wide uppercase">Database Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">{songs.length} Records</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/[0.06] mx-2" />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-white/50 tracking-wide uppercase">Last Update</span>
                        <span className="text-xs font-semibold text-purple-300/80 tracking-wide uppercase">LIVE CONNECTION</span>
                    </div>
                </div>
                <button
                    onClick={() => exportFullArchive(songs, members, albums)}
                    className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-medium text-white/50 hover:text-white hover:border-white/20 tracking-wide uppercase transition-all duration-500 hover:scale-105 group"
                >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> Export Archive
                </button>
            </div>
            <div className="flex-1 border border-white/[0.06] rounded-2xl overflow-hidden bg-black/10 backdrop-blur-xl shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                <table className="w-full text-left text-sm text-white/60 border-collapse">
                    <thead className="bg-white/[0.03] text-xs text-white/50 uppercase tracking-wide font-medium sticky top-0 backdrop-blur-3xl border-b border-white/[0.06] z-20">
                        <tr>
                            <th className="px-6 py-4">Composition</th>
                            <th className="px-6 py-4">Source Album</th>
                            <th className="px-6 py-4 text-center">BPM</th>
                            <th className="px-6 py-4 text-right">Sentiment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {songs.map(s => (
                            <tr
                                key={s.id}
                                onClick={() => onSelectSong(s)}
                                className="hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white/80 group-hover:text-white transition-colors text-sm">{s.title}</span>
                                        <span className="text-xs text-white/40 mt-0.5">ID: {s.id.toString().padStart(3, '0')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white/50 group-hover:text-white/70 transition-colors tracking-wide">{getAlbumTitle(s.album_id)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="font-mono text-sm text-white/50 group-hover:text-white/80 transition-colors" style={{ color: (s.bpm || 0) > 130 ? accentColor : '' }}>{s.bpm || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-3 py-1 rounded-full border text-xs font-medium tracking-wide uppercase transition-all duration-500 inline-block ${s.sentiment === 'Joy' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400/70' :
                                        s.sentiment === 'Fear' ? 'bg-red-500/10 border-red-500/20 text-red-400/70' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-400/70'
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
