import { useMemo } from 'react';
import type { Album } from '../../../../types/database';

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
    <div className="overflow-x-auto pretty-scrollbar pb-2">
      <div className="flex gap-3 min-w-max">
        {eras.map(([name, data], i) => (
          <div key={name} className="flex items-center">
            <button
              onClick={() => onNavigateToEra(name)}
              className="w-44 p-4 bg-[#111118] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all duration-300 text-left group flex-shrink-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: data.color }}
                />
                <span className="text-sm font-semibold text-white/90 group-hover:text-white truncate">{name}</span>
              </div>
              <div className="text-xs text-white/50">
                {data.albums.length} album{data.albums.length !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                {data.minDate.slice(0, 4)}{data.minDate.slice(0, 4) !== data.maxDate.slice(0, 4) ? `–${data.maxDate.slice(0, 4)}` : ''}
              </div>
            </button>
            {/* Connector line between eras */}
            {i < eras.length - 1 && (
              <div className="w-6 h-px bg-white/[0.08] flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
