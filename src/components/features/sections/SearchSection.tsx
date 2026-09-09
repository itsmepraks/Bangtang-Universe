import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, Music, Disc, User, Trophy, MapPin, X } from 'lucide-react';
import { useSearch, type SearchResult } from '../../../hooks';
import { MOOD_MAP } from '../../../services/searchService';
import { getSentimentColor, BORAHAE_COLORS } from '../../../constants/colors';
import type { Song, Member, Album, Award, Concert } from '../../../types/database';
import type { DashboardSection } from '../../../types/index';
import Badge from '../../ui/Badge';
import ProgressBar from '../../ui/ProgressBar';
import ArchiveImage from '../../ui/ArchiveImage';
import { EditorialPageHeader } from '../../editorial';

interface SearchSectionProps {
  songs: Song[]; members: Member[]; albums: Album[]; awards: Award[]; concerts: Concert[];
  onSelectSong: (s: Song) => void;
  onNavigate: (section: DashboardSection, payload?: string | number) => void;
  initialQuery?: string;
  initialMood?: string | null;
  onSearchStateChange: (query: string, mood: string | null) => void;
}
const MOOD_LABELS: Record<string, string> = { happy: 'Happy', sad: 'Sad', energetic: 'Energetic', calm: 'Calm', romantic: 'Romantic', motivational: 'Motivational' };
const RESULT_TYPES = ['all', 'song', 'album', 'member', 'award', 'concert'] as const;

export default function SearchSection({ songs, members, albums, awards, concerts, onSelectSong, onNavigate, initialQuery = '', initialMood = null, onSearchStateChange }: SearchSectionProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'done' | 'error'>('idle');
  const [typeFilter, setTypeFilter] = useState<typeof RESULT_TYPES[number]>('all');
  const [preview, setPreview] = useState<SearchResult | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SearchResult | null>(null);
  const requestId = useRef(0);
  const { searchAllAsync, searchByMood } = useSearch(songs, members, albums, awards, concerts);

  const runSearch = useCallback(async (text: string) => {
    const id = ++requestId.current;
    setSelectedRecord(null);
    setPreview(null);
    if (!text.trim()) { setResults([]); setStatus('idle'); return; }
    setStatus('searching');
    try {
      const found = await searchAllAsync(text.trim());
      if (id !== requestId.current) return;
      setResults(found);
      setStatus('done');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [searchAllAsync]);

  useEffect(() => {
    // Restore a bookmarked query or mood, including when browser Back returns here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initialQuery);
    setTypeFilter('all');
    setSelectedRecord(null);
    if (initialMood && initialMood in MOOD_LABELS) {
      ++requestId.current;
      const found = searchByMood(initialMood as keyof typeof MOOD_MAP);
      setResults(found.map(song => ({ id: song.id, type: 'song', title: song.title, subtitle: song.sentiment || '', score: 0, context: `${song.bpm || '?'} BPM · ${song.sentiment || 'Unknown'}`, item: song })));
      setStatus('done');
    } else { void runSearch(initialQuery); }
    const pendingRequest = requestId;
    return () => { ++pendingRequest.current; };
  }, [initialQuery, initialMood, runSearch, searchByMood]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    if (text === initialQuery && !initialMood) void runSearch(text);
    else onSearchStateChange(text.trim(), null);
  };
  const filteredResults = useMemo(() => typeFilter === 'all' ? results : results.filter(r => r.type === typeFilter), [results, typeFilter]);
  const openResult = (result: SearchResult) => {
    if (result.type === 'song') onSelectSong(result.item as Song);
    else if (result.type === 'album') onNavigate('discography', Number(result.id));
    else if (result.type === 'member') onNavigate('members', String(result.id));
    else { setSelectedRecord(result); setPreview(result); }
  };
  const iconFor = (type: string) => ({ song: Music, album: Disc, member: User, award: Trophy, concert: MapPin }[type] || Search);

  return <div className="space-y-5">
    <EditorialPageHeader eyebrow="" title="Search" note="Find a song, album, member, award, or live show." />
    <div className="editorial-surface p-4 sm:p-6 space-y-5">
      <form onSubmit={e => { e.preventDefault(); submit(query); }} className="flex items-center gap-3 rounded-lg border border-white/15 bg-[#111118] p-3 focus-within:border-purple-400/60">
        <Search size={20} className="shrink-0 text-white/60" aria-hidden="true" />
        <input type="search" inputMode="search" autoComplete="off" value={query}
          onChange={e => { ++requestId.current; setQuery(e.target.value); setStatus('idle'); setResults([]); setSelectedRecord(null); }}
          aria-label="Search BTS" placeholder="Songs, albums, members…" className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/60" />
        <button type="submit" disabled={!query.trim() || status === 'searching'} className="min-h-11 rounded-md border border-purple-400/35 bg-purple-500/15 px-3 sm:px-5 text-sm text-purple-200 hover:bg-purple-500/25 disabled:opacity-50">Search</button>
      </form>
      <details open={Boolean(initialMood)} className="text-sm text-white/75">
        <summary className="w-fit cursor-pointer py-2">{initialMood ? `Mood: ${MOOD_LABELS[initialMood] || initialMood}` : 'Explore songs by mood'}</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(MOOD_LABELS).map(([mood, label]) => <button key={mood} aria-pressed={initialMood === mood} onClick={() => onSearchStateChange('', mood)} className={`min-h-11 rounded-full border px-4 py-2 text-sm ${initialMood === mood ? 'border-purple-400/50 bg-purple-500/15 text-purple-200' : 'border-white/15 text-white/75 hover:bg-white/5'}`}>{label}</button>)}
        </div>
      </details>
      {status === 'done' && results.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="Filter search results">
        {RESULT_TYPES.map(type => <button key={type} aria-pressed={typeFilter === type} onClick={() => setTypeFilter(type)} className={`min-h-10 rounded-full border px-3 py-2 text-sm ${typeFilter === type ? 'border-purple-400/40 bg-purple-500/15 text-purple-200' : 'border-white/10 text-white/70 hover:bg-white/5'}`}>{type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}</button>)}
        <span role="status" className="ml-auto text-sm text-white/65">{filteredResults.length} results</span>
      </div>}
      {selectedRecord && <section aria-label="Selected record" className="rounded-lg border border-purple-400/25 p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Record details</h2><button aria-label="Close record details" onClick={() => setSelectedRecord(null)} className="grid h-11 w-11 place-items-center"><X size={18} /></button></div>
        <PreviewPanel result={selectedRecord} />
        <button className="min-h-11 text-sm text-purple-200 underline underline-offset-4" onClick={() => onNavigate(selectedRecord.type === 'award' ? 'awards' : 'tours')}>Browse all {selectedRecord.type === 'award' ? 'awards' : 'tours'}</button>
      </section>}
      {status === 'searching' && <p role="status" className="py-8 text-center text-sm text-white/70">Searching the archive…</p>}
      {status === 'error' && <div role="alert" className="py-6 text-center text-sm text-white/75"><p>Search is temporarily unavailable.</p><button onClick={() => submit(query)} className="mt-3 min-h-11 text-purple-200">Try again</button></div>}
      {status === 'done' && filteredResults.length === 0 && <div role="status" className="py-6 text-center text-sm text-white/70"><p>No matching records.</p><p className="mt-2">{results.length ? 'Try another category or show all results.' : 'Try a different name, title, or mood.'}</p>{results.length > 0 && <button onClick={() => setTypeFilter('all')} className="min-h-11 mt-2 text-purple-200">Show all results</button>}</div>}
      {status === 'idle' && <div className="flex flex-wrap items-center gap-2 text-sm text-white/65"><span>Try</span>{['Dynamite', 'Yoongi', 'Love Yourself'].map(example => <button key={example} onClick={() => submit(example)} className="min-h-11 rounded-full border border-white/10 px-4 py-2 text-white/80 hover:bg-white/5">{example}</button>)}</div>}
      {status === 'done' && filteredResults.length > 0 && <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8 space-y-2">{filteredResults.map(result => {
          const Icon = iconFor(result.type);
          return <button key={`${result.type}-${result.id}`} onClick={() => openResult(result)} onMouseEnter={() => setPreview(result)} onFocus={() => setPreview(result)} aria-expanded={result.type === 'award' || result.type === 'concert' ? selectedRecord === result : undefined} className="w-full text-left flex items-center gap-3 rounded-lg border border-white/10 p-4 hover:border-purple-400/30 hover:bg-white/5">
            <Icon size={18} className="shrink-0 text-white/65" aria-hidden="true" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-white/90">{result.title}</span><span className="mt-1 block text-xs text-white/65">{result.context}</span></span>
            <Badge variant="default" size="sm">{result.type}</Badge>
          </button>;
        })}</div>
        <aside className="hidden md:block md:col-span-4"><div className="sticky top-5 rounded-lg border border-white/10 p-5">{preview ? <PreviewPanel result={preview} /> : <p className="text-sm text-white/65">Focus or hover a result to preview it.</p>}</div></aside>
      </div>}
    </div>
  </div>;
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
          style={{ background: `linear-gradient(135deg, ${album.cover_color || BORAHAE_COLORS.PRIMARY}40, ${album.cover_color || BORAHAE_COLORS.PRIMARY}10)` }}
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
          <ArchiveImage src={member.image_url} alt={member.stage_name} width={400} height={128} decoding="async" loading="lazy" className="w-full h-32 object-cover rounded-xl img-outline" />
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
