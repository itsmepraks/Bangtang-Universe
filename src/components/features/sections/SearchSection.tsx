import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Network, RefreshCw, Music, Disc, User, Sparkles, Trophy, MapPin } from 'lucide-react';
import { useSearch, type SearchResult } from '../../../hooks';
import { MOOD_MAP } from '../../../services/searchService';
import { getSentimentColor } from '../../../constants/colors';
import type { Song, Member, Album, Award, Concert } from '../../../types/database';
import type { DashboardSection } from '../../../types/index';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';

interface SearchSectionProps {
  songs: Song[];
  members: Member[];
  albums: Album[];
  awards: Award[];
  concerts: Concert[];
  onSelectSong: (s: Song) => void;
  onNavigate: (section: DashboardSection, payload?: unknown) => void;
}

const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  energetic: 'Energetic',
  calm: 'Calm',
  romantic: 'Romantic',
  motivational: 'Motivational',
};

export default function SearchSection({ songs, members, albums, awards, concerts, onSelectSong, onNavigate }: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'song' | 'album' | 'member' | 'award' | 'concert'>('all');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);

  const { searchAll, searchByMood, getSuggestions } = useSearch(songs, members, albums, awards, concerts);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return getSuggestions(query, 5);
  }, [query, getSuggestions]);

  const runSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setActiveMood(null);
    setShowSuggestions(false);
    setTimeout(() => {
      const res = searchAll(searchQuery);
      setResults(res);
      setSearching(false);
    }, 200);
  }, [searchAll]);

  const handleSearch = () => runSearch(query);

  const handleMoodSearch = (mood: string) => {
    setActiveMood(mood);
    setQuery('');
    setShowSuggestions(false);
    const moodSongs = searchByMood(mood as keyof typeof MOOD_MAP);
    setResults(moodSongs.map((s, i) => ({
      id: s.id,
      type: 'song' as const,
      title: s.title,
      subtitle: s.sentiment || '',
      score: 100 - i * 5,
      context: `${s.bpm || '?'} BPM · ${s.sentiment || 'Unknown'}`,
      item: s,
    })));
  };

  const filteredResults = useMemo(() => {
    if (typeFilter === 'all') return results;
    return results.filter(r => r.type === typeFilter);
  }, [results, typeFilter]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'song') {
      onSelectSong(result.item as Song);
    } else if (result.type === 'album') {
      onNavigate('discography', (result.item as { id: number }).id);
    } else if (result.type === 'member') {
      onNavigate('members', (result.item as { id: string }).id);
    }
  };

  const resultIcon = (type: string) => {
    switch (type) {
      case 'song': return Music;
      case 'album': return Disc;
      case 'member': return User;
      case 'award': return Trophy;
      case 'concert': return MapPin;
      default: return Search;
    }
  };

  const resultAccent = (type: string) => {
    switch (type) {
      case 'award': return 'text-yellow-400/70';
      case 'concert': return 'text-green-400/70';
      default: return 'text-purple-400/70';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-4 bg-[#111118] border border-white/[0.06] rounded-2xl px-6 py-4 focus-within:border-purple-500/30 transition-colors">
          <Search size={20} className="text-white/40" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search songs, albums, members..."
            aria-label="Search the archive"
            className="flex-1 bg-transparent text-base text-white/80 outline-none placeholder:text-white/40"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-5 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium uppercase tracking-wide text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-50"
          >
            {searching ? <RefreshCw size={14} className="animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="absolute top-full mt-2 left-0 right-0 bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden z-50">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); setShowSuggestions(false); runSearch(s); }}
                className="w-full text-left px-6 py-3 text-sm text-white/60 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mood Filter Pills */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide">Search by Mood</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(MOOD_LABELS).map(mood => (
            <button
              key={mood}
              onClick={() => handleMoodSearch(mood)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-2 ${
                activeMood === mood
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15'
              }`}
            >
              <Sparkles size={12} />
              {MOOD_LABELS[mood]}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter + Results Count */}
      <div className="flex items-center gap-2">
        {(['all', 'song', 'album', 'member', 'award', 'concert'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
              typeFilter === t ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'
            }`}
          >{t === 'all' ? 'All' : t + 's'}</button>
        ))}
        {results.length > 0 && (
          <span className="ml-auto text-sm text-white/50">{filteredResults.length} results</span>
        )}
      </div>

      {/* Results */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Results list */}
          <div className="md:col-span-8 space-y-2">
            {filteredResults.map(r => {
              const Icon = resultIcon(r.type);
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleResultClick(r)}
                  onMouseEnter={() => setHoveredResult(r)}
                  onMouseLeave={() => setHoveredResult(null)}
                  className="w-full text-left flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-purple-500/20 hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{r.title}</div>
                    <div className="text-xs text-white/50 mt-0.5 truncate">{r.context}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" size="sm">{r.type}</Badge>
                    <span className={`text-xs font-mono ${resultAccent(r.type)}`}>{r.score}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview Panel */}
          <div className="hidden md:block md:col-span-4">
            <div className="sticky top-6 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl min-h-[200px]">
              {hoveredResult ? (
                <PreviewPanel result={hoveredResult} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Search size={24} className="text-white/20 mb-3" />
                  <p className="text-xs text-white/40">Hover a result to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Network size={40} className="text-white/20 mb-4" />
          <p className="text-sm text-white/40">
            {query || activeMood ? 'No results found' : 'Search the archive'}
          </p>
          <p className="text-xs text-white/40 mt-2">Try searching for a song, album, or member</p>
        </div>
      )}
    </div>
  );
}

function PreviewPanel({ result }: { result: SearchResult }) {
  if (result.type === 'song') {
    const song = result.item as Song;
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white/90">{song.title}</h4>
          {song.title_korean && <p className="text-xs text-white/50 mt-0.5">{song.title_korean}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40">BPM</span>
            <div className="text-white/70 font-mono mt-0.5">{song.bpm || '—'}</div>
          </div>
          <div>
            <span className="text-white/40">Sentiment</span>
            <div className="mt-0.5">
              {song.sentiment ? <Badge variant="sentiment" size="sm" color={getSentimentColor(song.sentiment)}>{song.sentiment}</Badge> : <span className="text-white/40">—</span>}
            </div>
          </div>
        </div>
        {(song.energy != null || song.valence != null) && (
          <div className="space-y-2">
            {song.energy != null && <ProgressBar value={song.energy} label="Energy" showPercent size="sm" />}
            {song.valence != null && <ProgressBar value={song.valence} label="Valence" showPercent size="sm" />}
            {song.danceability != null && <ProgressBar value={song.danceability} label="Dance" showPercent size="sm" />}
          </div>
        )}
      </div>
    );
  }

  if (result.type === 'album') {
    const album = result.item as { id: number; title: string; title_korean?: string; type?: string; era?: string; track_count?: number; cover_color?: string };
    return (
      <div className="space-y-4">
        <div
          className="h-20 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${album.cover_color || '#A855F7'}40, ${album.cover_color || '#A855F7'}10)` }}
        />
        <div>
          <h4 className="text-sm font-semibold text-white/90">{album.title}</h4>
          {album.title_korean && <p className="text-xs text-white/50 mt-0.5">{album.title_korean}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {album.type && <Badge variant="purple" size="sm">{album.type}</Badge>}
          {album.era && <Badge variant="default" size="sm">{album.era}</Badge>}
        </div>
        {album.track_count && <p className="text-xs text-white/50">{album.track_count} tracks</p>}
      </div>
    );
  }

  if (result.type === 'member') {
    const member = result.item as { stage_name: string; full_name?: string; role?: string; image_url?: string; komca_credits?: number };
    return (
      <div className="space-y-4">
        {member.image_url && (
          <img src={member.image_url} alt={member.stage_name} className="w-full h-32 object-cover rounded-xl" />
        )}
        <div>
          <h4 className="text-sm font-semibold text-white/90">{member.stage_name}</h4>
          {member.full_name && <p className="text-xs text-white/50 mt-0.5">{member.full_name}</p>}
        </div>
        {member.role && <Badge variant="purple" size="sm">{member.role}</Badge>}
        {member.komca_credits != null && (
          <p className="text-xs text-white/60">{member.komca_credits} KOMCA credits</p>
        )}
      </div>
    );
  }

  if (result.type === 'award') {
    const award = result.item as { name: string; ceremony: string; year: number; category?: string | null; result: string; work_title?: string | null };
    return (
      <div className="space-y-4">
        <div
          className="h-20 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.3), rgba(234,179,8,0.08))' }}
        >
          <Trophy size={32} className="text-yellow-400/60" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/90">{award.name}</h4>
          <p className="text-xs text-white/50 mt-0.5">{award.ceremony} ({award.year})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={award.result === 'won' ? 'purple' : 'default'} size="sm">
            {award.result === 'won' ? 'Won' : 'Nominated'}
          </Badge>
          {award.category && <Badge variant="default" size="sm">{award.category}</Badge>}
        </div>
        {award.work_title && <p className="text-xs text-white/60">{award.work_title}</p>}
      </div>
    );
  }

  if (result.type === 'concert') {
    const concert = result.item as { tour_name: string; venue: string; city: string; country: string; date: string; attendance?: number | null };
    return (
      <div className="space-y-4">
        <div
          className="h-20 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.08))' }}
        >
          <MapPin size={32} className="text-green-400/60" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white/90">{concert.tour_name}</h4>
          <p className="text-xs text-white/50 mt-0.5">{concert.venue}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40">Location</span>
            <div className="text-white/70 mt-0.5">{concert.city}, {concert.country}</div>
          </div>
          <div>
            <span className="text-white/40">Date</span>
            <div className="text-white/70 mt-0.5">{concert.date}</div>
          </div>
        </div>
        {concert.attendance != null && (
          <p className="text-xs text-white/60">{concert.attendance.toLocaleString()} attendance</p>
        )}
      </div>
    );
  }

  return null;
}
