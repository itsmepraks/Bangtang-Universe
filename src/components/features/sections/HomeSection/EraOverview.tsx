import { useMemo } from 'react';
import type { Album } from '../../../../types/database';
import { ChevronRight } from 'lucide-react';

interface EraOverviewProps {
  albums: Album[];
  onNavigateToEra: (era: string) => void;
}

export default function EraOverview({ albums, onNavigateToEra }: EraOverviewProps) {
  const eras = useMemo(() => {
    const map: Record<string, { albums: Album[]; minDate: string; maxDate: string; color: string }> = {};
    albums.forEach(a => {
      const era = a.era || 'Unknown';
      if (!map[era]) {
        map[era] = { albums: [], minDate: a.release_date, maxDate: a.release_date, color: a.cover_color || '#A855F7' };
      }
      map[era].albums.push(a);
      if (a.release_date < map[era].minDate) map[era].minDate = a.release_date;
      if (a.release_date > map[era].maxDate) map[era].maxDate = a.release_date;
    });
    return Object.entries(map)
      .filter(([name]) => name !== 'Unknown')
      .sort(([, a], [, b]) => a.minDate.localeCompare(b.minDate));
  }, [albums]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {eras.map(([name, data]) => (
        <button
          key={name}
          onClick={() => onNavigateToEra(name)}
          className="text-left p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-purple-500/20 hover:bg-white/[0.05] transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color, boxShadow: `0 0 12px ${data.color}40` }}
            />
            <ChevronRight size={14} className="text-white/20 group-hover:text-purple-400 transition-colors duration-500" />
          </div>
          <h3 className="text-base font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">{name}</h3>
          <p className="text-sm text-white/60">
            {data.albums.length} album{data.albums.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {data.minDate.slice(0, 4)}–{data.maxDate.slice(0, 4)}
          </p>
        </button>
      ))}
    </div>
  );
}
