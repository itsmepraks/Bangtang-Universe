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

        setTimeout(() => {
            const searchResults = searchAll(searchQuery);
            setResults(searchResults);
            setSearching(false);
        }, 400);
    };

    return (
        <div className="h-full flex flex-col gap-8">
            <div className="flex gap-4 p-2 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                <div className="flex-1 flex items-center px-4 gap-3">
                    <Search size={16} className="text-white/40" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        type="text"
                        placeholder="Search the archive..."
                        className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-white/30 tracking-wide"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-6 py-3 rounded-xl text-white font-medium text-xs tracking-wide transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: accentColor }}
                >
                    {searching ? <RefreshCw className="animate-spin" size={14} /> : 'SEARCH'}
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {results.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto pretty-scrollbar pr-2">
                        {results.map(r => (
                            <div key={r.id} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-500 animate-in slide-in-from-bottom-4 cursor-pointer group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors">{r.title}</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full border font-mono transition-colors"
                                        style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}>
                                        {r.score}%
                                    </span>
                                </div>
                                <div className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">{r.context}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 border border-white/[0.06] rounded-2xl flex items-center justify-center relative overflow-hidden bg-black/20">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }} />
                        <div className="text-center space-y-4 relative z-10">
                            <Network size={40} className="text-white/20 mx-auto" />
                            <p className="text-xs text-white/40 tracking-wide uppercase">Ready for analysis</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RAGNetwork;
