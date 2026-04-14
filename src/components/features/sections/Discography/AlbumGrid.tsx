import { useMemo, useState } from 'react';
import { Music, Users } from 'lucide-react';
import type { Song, Album } from '../../../../types/database';
import FilterBar from '../../../ui/FilterBar';
import Badge from '../../../ui/Badge';
import BtsLogo from '../../../ui/BtsLogo';


type Category = 'all' | 'group' | 'solo' | 'collab';

const categoryOptions = [
  { value: 'group', label: 'Group' },
  { value: 'solo', label: 'Solo' },
  { value: 'collab', label: 'Collaborations' },
];

interface AlbumGridProps {
  albums: Album[];
  songs: Song[];
  eraFilter: string | null;
  onSelectAlbum: (id: number) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AlbumGrid({ albums, songs, eraFilter, onSelectAlbum }: AlbumGridProps) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [activeEra, setActiveEra] = useState<string | null>(eraFilter);
  const [category, setCategory] = useState<Category>('all');

  const types = useMemo(() => [...new Set(albums.map(a => a.type).filter(Boolean))].map(t => ({ value: t!, label: t! })), [albums]);
  const eras = useMemo(() => [...new Set(albums.map(a => a.era).filter(Boolean))].sort().map(e => ({ value: e!, label: e! })), [albums]);

  // Build a lookup from album_id to album for era filtering of songs
  const albumMap = useMemo(() => {
    const map: Record<number, Album> = {};
    albums.forEach(a => { map[a.id] = a; });
    return map;
  }, [albums]);

  // Filter songs by era (using their album's era)
  const eraFilteredSongs = useMemo(() => {
    if (!activeEra) return songs;
    return songs.filter(s => {
      if (!s.album_id) return false;
      const album = albumMap[s.album_id];
      return album?.era === activeEra;
    });
  }, [songs, activeEra, albumMap]);

  // Solo songs grouped by member
  const soloSongsByMember = useMemo(() => {
    const soloSongs = eraFilteredSongs.filter(s => s.is_solo === true);
    const grouped: Record<string, Song[]> = {};
    soloSongs.forEach(s => {
      const members = s.featured_members?.length
        ? s.featured_members
        : s.member_credits?.length
          ? s.member_credits
          : ['Unknown'];
      members.forEach(member => {
        if (!grouped[member]) grouped[member] = [];
        grouped[member].push(s);
      });
    });
    // Sort members alphabetically
    const sorted = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    return sorted;
  }, [eraFilteredSongs]);

  // Collab songs
  const collabSongs = useMemo(() => {
    return eraFilteredSongs.filter(s => s.is_collab === true);
  }, [eraFilteredSongs]);

  // Group albums: filter out albums whose songs are all solo/collab
  const groupAlbums = useMemo(() => {
    if (category !== 'group') return albums;
    // An album counts as "group" if it has at least one song that is NOT solo and NOT collab
    const albumIdsWithGroupSongs = new Set<number>();
    songs.forEach(s => {
      if (s.album_id && !s.is_solo && !s.is_collab) {
        albumIdsWithGroupSongs.add(s.album_id);
      }
    });
    return albums.filter(a => albumIdsWithGroupSongs.has(a.id));
  }, [albums, songs, category]);

  const baseAlbums = category === 'group' ? groupAlbums : albums;

  const filtered = useMemo(() => {
    let result = baseAlbums;
    if (typeFilter) result = result.filter(a => a.type === typeFilter);
    if (activeEra) result = result.filter(a => a.era === activeEra);
    return result;
  }, [baseAlbums, typeFilter, activeEra]);

  const songCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    songs.forEach(s => { if (s.album_id) map[s.album_id] = (map[s.album_id] || 0) + 1; });
    return map;
  }, [songs]);

  const showAlbumGrid = category === 'all' || category === 'group';

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-4">
        <FilterBar
          options={categoryOptions}
          value={category === 'all' ? null : category}
          onChange={(v) => {
            setCategory((v as Category) || 'all');
            setTypeFilter(null);
          }}
          allLabel="All"
        />
      </div>

      {/* Type & Era Filters (shown for album grid views) */}
      {showAlbumGrid && (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={typeFilter || ''}
            onChange={(e) => { setTypeFilter(e.target.value || null); setActiveEra(null); }}
            className="bg-[#111118] border border-white/[0.08] rounded-xl text-xs text-white/70 px-3 py-2 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-purple-500/40 appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="" style={{ background: '#111118' }}>All Types</option>
            {types.map(t => <option key={t.value} value={t.value} style={{ background: '#111118' }}>{t.label}</option>)}
          </select>
          <select
            value={activeEra || ''}
            onChange={(e) => { setActiveEra(e.target.value || null); setTypeFilter(null); }}
            className="bg-[#111118] border border-white/[0.08] rounded-xl text-xs text-white/70 px-3 py-2 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-purple-500/40 appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="" style={{ background: '#111118' }}>All Eras</option>
            {eras.map(e => <option key={e.value} value={e.value} style={{ background: '#111118' }}>{e.label}</option>)}
          </select>
          {(typeFilter || activeEra) && (
            <button
              onClick={() => { setTypeFilter(null); setActiveEra(null); }}
              className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Era filter for solo/collab views */}
      {!showAlbumGrid && eras.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            value={activeEra || ''}
            onChange={(e) => setActiveEra(e.target.value || null)}
            className="bg-[#111118] border border-white/[0.08] rounded-xl text-xs text-white/70 px-3 py-2 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-purple-500/40 appearance-none pr-7"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            <option value="" style={{ background: '#111118' }}>All Eras</option>
            {eras.map(e => <option key={e.value} value={e.value} style={{ background: '#111118' }}>{e.label}</option>)}
          </select>
          {activeEra && (
            <button
              onClick={() => setActiveEra(null)}
              className="text-xs text-purple-400/60 hover:text-purple-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Album Grid (All / Group) */}
      {showAlbumGrid && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
            {filtered.map(album => (
              <button
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className="text-left group rounded-2xl border border-white/[0.06] bg-[#111118] hover:border-purple-500/20 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
              >
                <div
                  className="h-32 w-full relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${album.cover_color || '#A855F7'}40, ${album.cover_color || '#A855F7'}10)` }}
                >
                  {album.cover_art_url ? (
                    <img
                      src={album.cover_art_url}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BtsLogo size={40} className="text-white/[0.08] group-hover:text-white/[0.15] transition-colors" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors truncate">{album.title}</h3>
                  {album.title_korean && <p className="text-xs text-white/50 truncate">{album.title_korean}</p>}
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>{album.release_date?.slice(0, 4)}</span>
                    <span className="text-white/20">·</span>
                    <span>{album.type}</span>
                    <span className="text-white/20">·</span>
                    <span>{songCountMap[album.id] || album.track_count || 0} tracks</span>
                  </div>
                  {album.era && (
                    <Badge variant="purple" size="sm">{album.era}</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/50 text-center">{filtered.length} albums</p>
        </>
      )}

      {/* Solo Songs View */}
      {category === 'solo' && (
        <div className="space-y-8">
          {soloSongsByMember.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">No solo tracks found.</p>
          ) : (
            soloSongsByMember.map(([member, memberSongs]) => (
              <div key={member} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-purple-400" />
                  <h3 className="text-sm font-semibold text-white/85">{member}</h3>
                  <Badge variant="purple" size="sm">{memberSongs.length} track{memberSongs.length !== 1 ? 's' : ''}</Badge>
                </div>
                <div className="space-y-1">
                  {memberSongs.map(song => {
                    const album = song.album_id ? albumMap[song.album_id] : null;
                    return (
                      <div
                        key={song.id}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/20 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/80 truncate">{song.title}</p>
                          {song.title_korean && (
                            <p className="text-xs text-white/40 truncate">{song.title_korean}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 shrink-0 ml-4">
                          {album && <span>{album.title}</span>}
                          {song.release_date && <span>{song.release_date.slice(0, 4)}</span>}
                          {song.duration_seconds && <span>{formatDuration(song.duration_seconds)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <p className="text-xs text-white/50 text-center">
            {soloSongsByMember.reduce((sum, [, s]) => sum + s.length, 0)} solo tracks
          </p>
        </div>
      )}

      {/* Collaboration Songs View */}
      {category === 'collab' && (
        <div className="space-y-3">
          {collabSongs.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">No collaboration tracks found.</p>
          ) : (
            collabSongs.map(song => {
              const album = song.album_id ? albumMap[song.album_id] : null;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/20 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Users size={16} className="text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate">{song.title}</p>
                      {song.title_korean && (
                        <p className="text-xs text-white/40 truncate">{song.title_korean}</p>
                      )}
                      {song.featured_members && song.featured_members.length > 0 && (
                        <p className="text-xs text-purple-300/60 truncate">
                          feat. {song.featured_members.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 shrink-0 ml-4">
                    {album && <span>{album.title}</span>}
                    {song.release_date && <span>{song.release_date.slice(0, 4)}</span>}
                    {song.duration_seconds && <span>{formatDuration(song.duration_seconds)}</span>}
                  </div>
                </div>
              );
            })
          )}
          <p className="text-xs text-white/50 text-center">
            {collabSongs.length} collaboration{collabSongs.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
