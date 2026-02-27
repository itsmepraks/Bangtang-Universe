import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import type { Song } from '../../../../types/database';
import { useLyricsBySongId } from '../../../../hooks';
import Badge from '../../../ui/Badge';
import TabBar from '../../../ui/TabBar';

interface LyricsViewerProps {
    song: Song;
}

/**
 * Strip Genius page navigation that gets stored before the actual lyrics.
 * e.g. "15 ContributorsTranslationsRomanizationEnglish... [가사] [Intro: RM]..."
 * → "[Intro: RM]..."
 */
function cleanLyrics(raw: string): string {
    const sectionPattern = /\[(?:Intro|Verse|Chorus|Pre-Chorus|Bridge|Outro|Hook|Interlude|Rap|Part|Refrain|Coda|Skit)/i;
    const match = raw.match(sectionPattern);
    if (match?.index !== undefined && match.index > 0) {
        return raw.slice(match.index).trim();
    }
    return raw.trim();
}

type LyricsMode = 'english' | 'korean' | 'romanized' | 'side-by-side';

export default function LyricsViewer({ song }: LyricsViewerProps) {
    const { lyric: lyrics } = useLyricsBySongId(song.id);

    // Get lyrics from either the lyrics table or the song's direct fields, stripped of Genius navigation
    const rawKo = lyrics?.lyrics_korean || song.lyrics_ko || null;
    const rawEn = lyrics?.lyrics_english || song.lyrics_en || null;
    const rawRom = lyrics?.lyrics_romanized || song.lyrics_romanized || null;
    const lyricsKo = rawKo ? cleanLyrics(rawKo) : null;
    const lyricsEn = rawEn ? cleanLyrics(rawEn) : null;
    const lyricsRom = rawRom ? cleanLyrics(rawRom) : null;

    const hasAnyLyrics = lyricsKo || lyricsEn || lyricsRom;

    // Build available mode tabs based on which lyrics exist
    const availableTabs = useMemo(() => {
        const tabs: { value: LyricsMode; label: string }[] = [];
        if (lyricsKo) tabs.push({ value: 'korean', label: 'Korean' });
        if (lyricsEn) tabs.push({ value: 'english', label: 'English' });
        if (lyricsRom) tabs.push({ value: 'romanized', label: 'Romanized' });
        if (lyricsKo && lyricsEn) tabs.push({ value: 'side-by-side', label: 'Side by Side' });
        return tabs;
    }, [lyricsKo, lyricsEn, lyricsRom]);

    // Default to the first available mode
    const defaultMode = availableTabs.length > 0 ? availableTabs[0].value : 'english';
    const [mode, setMode] = useState<LyricsMode>(defaultMode);

    // Ensure current mode is still valid when lyrics change
    const activeMode = useMemo(() => {
        if (availableTabs.some(t => t.value === mode)) return mode;
        return availableTabs.length > 0 ? availableTabs[0].value : 'english';
    }, [mode, availableTabs]);

    if (!hasAnyLyrics) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen size={32} className="text-white/20 mb-3" />
                <p className="text-sm text-white/50 mb-1">No lyrics available</p>
                <p className="text-xs text-white/40">Lyrics for this song haven't been added yet</p>
            </div>
        );
    }

    const getLyricsContent = () => {
        switch (activeMode) {
            case 'korean':
                return lyricsKo;
            case 'english':
                return lyricsEn;
            case 'romanized':
                return lyricsRom;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <TabBar
                    tabs={availableTabs}
                    active={activeMode}
                    onChange={(v) => setMode(v as LyricsMode)}
                />
                {lyrics?.genius_url && (
                    <a
                        href={lyrics.genius_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400/60 hover:text-purple-300 tracking-wide transition-colors"
                    >
                        View on Genius
                    </a>
                )}
            </div>

            {lyrics?.themes && lyrics.themes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {lyrics.themes.map((theme, i) => (
                        <Badge key={i} variant="purple" size="sm">{theme}</Badge>
                    ))}
                </div>
            )}

            <div className="max-h-[500px] overflow-y-auto pretty-scrollbar p-6 bg-[#111118] rounded-2xl border border-white/[0.06]">
                {activeMode === 'side-by-side' ? (
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Korean</h4>
                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{lyricsKo}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">English</h4>
                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{lyricsEn}</p>
                        </div>
                    </div>
                ) : (
                    getLyricsContent() ? (
                        <pre className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-sans select-text">
                            {getLyricsContent()}
                        </pre>
                    ) : (
                        <p className="text-sm text-white/40 italic">No {activeMode} lyrics available</p>
                    )
                )}
            </div>
        </div>
    );
}
