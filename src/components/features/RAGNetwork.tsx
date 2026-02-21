import React, { useState } from 'react';
import { Search, Network, RefreshCw } from 'lucide-react';
import { useSearch, type SearchResult } from '../../hooks';

export interface RAGNetworkProps {
    accentColor?: string;
}

export const RAGNetwork: React.FC<RAGNetworkProps> = ({ accentColor = "#A855F7" }) => {
    const { searchAll } = useSearch();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setSearching(true);

        // Smooth transition for search
        setTimeout(() => {
            const searchResults = searchAll(searchQuery);
            setResults(searchResults);
            setSearching(false);
        }, 400); // Small delay for UI feel
    };

    return (
        <div className="h-full flex flex-col gap-8">
            <div className="flex gap-4 p-2 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex-1 flex items-center px-4 gap-3">
                    <Search size={16} className="text-white/20" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        type="text"
                        placeholder="ACCESS BANGTAN ARCHIVE..."
                        className="bg-transparent border-none text-[13px] text-white focus:outline-none w-full placeholder:text-white/10 font-light tracking-wide uppercase font-mono"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 rounded-xl text-white font-bold text-[10px] tracking-widest transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: accentColor }}
                >
                    {searching ? <RefreshCw className="animate-spin" size={14} /> : 'SEARCH'}
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

export default RAGNetwork;
