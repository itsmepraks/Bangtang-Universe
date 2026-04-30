import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Music, Disc, User, Sparkles, Home, BarChart3, Trophy, MapPin, Film, CornerDownLeft } from 'lucide-react';
import type { Song, Album, Member } from '../../types/database';
import type { DashboardSection } from '../../types/index';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  songs: Song[];
  albums: Album[];
  members: Member[];
  onNavigate: (section: DashboardSection, payload?: string | number) => void;
  onSelectSong: (song: Song) => void;
}

type PaletteItemType = 'section' | 'mood' | 'song' | 'album' | 'member';

interface PaletteItem {
  id: string;
  type: PaletteItemType;
  label: string;
  sublabel?: string;
  keywords: string;
  action: () => void;
}

const SECTION_ITEMS: { id: DashboardSection; label: string; icon: typeof Home }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'discography', label: 'Discography', icon: Disc },
  { id: 'members', label: 'Members', icon: User },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'awards', label: 'Awards', icon: Trophy },
  { id: 'tours', label: 'Tours', icon: MapPin },
  { id: 'media', label: 'Media', icon: Film },
  { id: 'search', label: 'Search', icon: Search },
];

const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Motivational'];

function iconForType(type: PaletteItemType) {
  switch (type) {
    case 'song': return Music;
    case 'album': return Disc;
    case 'member': return User;
    case 'mood': return Sparkles;
    default: return CornerDownLeft;
  }
}

function simpleScore(label: string, query: string): number {
  if (!query) return 0;
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  if (l === q) return 1000;
  if (l.startsWith(q)) return 500;
  if (l.includes(q)) return 250;
  // Subsequence match as last resort.
  let i = 0;
  for (const ch of l) if (ch === q[i]) i++;
  return i === q.length ? 100 - (l.length - q.length) : 0;
}

export default function CommandPalette({
  open,
  onClose,
  songs,
  albums,
  members,
  onNavigate,
  onSelectSong,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Reset state when palette opens; lint rule complains but this is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const allItems = useMemo<PaletteItem[]>(() => {
    const sections: PaletteItem[] = SECTION_ITEMS.map((s) => ({
      id: `section-${s.id}`,
      type: 'section',
      label: `Go to ${s.label}`,
      keywords: s.label,
      action: () => onNavigate(s.id),
    }));
    const moods: PaletteItem[] = MOODS.map((m) => ({
      id: `mood-${m}`,
      type: 'mood',
      label: `Search by mood: ${m}`,
      keywords: `mood ${m}`,
      action: () => onNavigate('search'),
    }));
    const songItems: PaletteItem[] = songs.slice(0, 500).map((s) => {
      const album = albums.find((a) => a.id === s.album_id);
      return {
        id: `song-${s.id}`,
        type: 'song',
        label: s.title,
        sublabel: album?.title,
        keywords: `${s.title} ${s.title_korean ?? ''} ${album?.title ?? ''}`,
        action: () => onSelectSong(s),
      };
    });
    const albumItems: PaletteItem[] = albums.map((a) => ({
      id: `album-${a.id}`,
      type: 'album',
      label: a.title,
      sublabel: a.era ?? undefined,
      keywords: `${a.title} ${a.era ?? ''}`,
      action: () => onNavigate('discography', a.id),
    }));
    const memberItems: PaletteItem[] = members.map((m) => ({
      id: `member-${m.id}`,
      type: 'member',
      label: m.stage_name,
      sublabel: m.full_name ?? undefined,
      keywords: `${m.stage_name} ${m.full_name ?? ''}`,
      action: () => onNavigate('members', m.id),
    }));
    return [...sections, ...moods, ...memberItems, ...albumItems, ...songItems];
  }, [songs, albums, members, onNavigate, onSelectSong]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return allItems.filter((i) => i.type === 'section' || i.type === 'mood').slice(0, 14);
    }
    return allItems
      .map((item) => ({ item, score: simpleScore(item.keywords, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((x) => x.item);
  }, [query, allItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-palette-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const runItem = (item: PaletteItem) => {
    item.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) runItem(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-xl bg-[#0c0c12] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, albums, members, moods…"
            aria-label="Search"
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-white/40 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto pretty-scrollbar py-2">
          {results.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-8 px-4">
              No matches. Try a song title, member name, or album.
            </p>
          ) : (
            results.map((item, idx) => {
              const Icon = iconForType(item.type);
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  data-palette-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => runItem(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'bg-purple-500/15 text-white'
                      : 'text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{item.label}</div>
                    {item.sublabel && (
                      <div className="text-[11px] text-white/40 truncate">{item.sublabel}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/30 flex-shrink-0">
                    {item.type}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.06] text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] font-mono">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <kbd className="px-1 rounded bg-white/[0.06] border border-white/[0.08] font-mono">⌘K</kbd>
            anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
