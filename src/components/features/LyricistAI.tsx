import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateVerse } from '../../services/lyricGenerator';

export const LyricistAI: React.FC = () => {
    const [text, setText] = useState("");
    const [gen, setGen] = useState(false);

    const run = () => {
        setGen(true);
        setText("");
        const poem = generateVerse();
        let i = 0;
        const t = window.setInterval(() => {
            setText(p => p + poem.charAt(i));
            i++;
            if (i >= poem.length) { clearInterval(t); setGen(false); }
        }, 30);
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

export default LyricistAI;
