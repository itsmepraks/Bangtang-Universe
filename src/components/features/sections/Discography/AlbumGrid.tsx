import { useMemo, useState } from 'react';
import { Disc } from 'lucide-react';
import type { Song, Album } from '../../../../types/database';
import FilterBar from '../../../ui/FilterBar';
import Badge from '../../../ui/Badge';

interface AlbumGridProps {
  albums: Album[];
  songs: Song[];
  eraFilter: string | null;
  onSelectAlbum: (id: number) => void;
}

export default function AlbumGrid({ albums, songs, eraFilter, onSelectAlbum }: AlbumGridProps) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [activeEra, setActiveEra] = useState<string | null>(eraFilter);

  const types = useMemo(() => [...new Set(albums.map(a => a.type).filter(Boolean))].map(t => ({ value: t!, label: t! })), [albums]);
  const eras = useMemo(() => [...new Set(albums.map(a => a.era).filter(Boolean))].sort().map(e => ({ value: e!, label: e! })), [albums]);

  const filtered = useMemo(() => {
    let result = albums;
    if (typeFilter) result = result.filter(a => a.type === typeFilter);
    if (activeEra) result = result.filter(a => a.era === activeEra);
    return result;
  }, [albums, typeFilter, activeEra]);

  const songCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    songs.forEach(s => { if (s.album_id) map[s.album_id] = (map[s.album_id] || 0) + 1; });
    return map;
  }, [songs]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <FilterBar
          options={types}
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); setActiveEra(null); }}
          allLabel="All Types"
        />
        <span className="border-l border-white/10 h-5" />
        <FilterBar
          options={eras}
          value={activeEra}
          onChange={(v) => { setActiveEra(v); setTypeFilter(null); }}
          showAll={false}
        />
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filtered.map(album => (
          <button
            key={album.id}
            onClick={() => onSelectAlbum(album.id)}
            className="text-left group rounded-2xl border border-white/[0.06] bg-[#111118] hover:border-purple-500/20 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
          >
            <div
              className="h-32 w-full relative"
              style={{ background: `linear-gradient(135deg, ${album.cover_color || '#A855F7'}40, ${album.cover_color || '#A855F7'}10)` }}
            >
              <Disc size={32} className="absolute bottom-3 right-3 text-white/10 group-hover:text-white/20 transition-colors" />
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
    </div>
  );
}
