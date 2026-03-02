import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { MapPin, Plus, Minus, RotateCcw } from 'lucide-react';
import type { Concert } from '../../../../types/database';
import { resolveCoords } from '../../../../data/cityCoords';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – world-atlas ships plain JSON with no type declarations
import worldData from 'world-atlas/countries-50m.json';

interface TourMapProps {
  concerts: Concert[];
}

interface CityPin {
  cityKey: string;
  city: string;
  country: string;
  coords: [number, number];
  showCount: number;
  tours: string[];
}

interface TooltipState {
  pin: CityPin;
  x: number;
  y: number;
}

export default function TourMap({ concerts }: TourMapProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 10]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    concerts.forEach((c) => yearSet.add(new Date(c.date).getFullYear()));
    return Array.from(yearSet).sort();
  }, [concerts]);

  const filtered = useMemo(() => {
    if (selectedYear === null) return concerts;
    return concerts.filter((c) => new Date(c.date).getFullYear() === selectedYear);
  }, [concerts, selectedYear]);

  const pins = useMemo((): CityPin[] => {
    const map = new Map<string, CityPin>();
    filtered.forEach((c) => {
      const coords = resolveCoords(c.city, c.country);
      if (!coords) return;
      const key = `${c.city}, ${c.country}`;
      const existing = map.get(key);
      if (existing) {
        existing.showCount += 1;
        if (!existing.tours.includes(c.tour_name)) existing.tours.push(c.tour_name);
      } else {
        map.set(key, { cityKey: key, city: c.city, country: c.country, coords, showCount: 1, tours: [c.tour_name] });
      }
    });
    return Array.from(map.values());
  }, [filtered]);

  if (concerts.length === 0) {
    return (
      <div className="py-16 text-center">
        <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white/60 mb-2">No concert data yet</h3>
        <p className="text-sm text-white/40">Run the concerts scraper to populate.</p>
      </div>
    );
  }

  return (
    /* Full-bleed map container — fills the rounded card edge-to-edge */
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-[#080810]"
      style={{ height: 'calc(100vh - 220px)', minHeight: '560px' }}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* Subtle vignette overlay for depth */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(8,8,16,0.55) 100%)',
        }}
      />

      {/* Map */}
      <ComposableMap
        projectionConfig={{ scale: 155, center: [10, 10] }}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={12}
          onMoveEnd={({ zoom: z, coordinates: c }: { zoom: number; coordinates: [number, number] }) => {
            setZoom(z);
            setCenter(c);
          }}
        >
          <Geographies geography={worldData}>
            {({ geographies }: { geographies: { rsmKey: string; [key: string]: unknown }[] }) =>
              geographies.map((geo: { rsmKey: string; [key: string]: unknown }) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.04)"
                  stroke="rgba(168,85,247,0.18)"
                  strokeWidth={0.5 / zoom}
                  style={{
                    outline: 'none',
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: 'rgba(168,85,247,0.10)' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {pins.map((pin) => {
            const baseR = 4 + Math.sqrt(pin.showCount) * 2.2;
            const r = baseR / zoom;
            return (
              <Marker
                key={pin.cityKey}
                coordinates={pin.coords}
                onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                  const container = (e.target as SVGElement).closest('.relative')?.getBoundingClientRect();
                  if (container) {
                    setTooltip({ pin, x: e.clientX - container.left, y: e.clientY - container.top });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Glow ring */}
                <circle r={r * 1.8} fill="rgba(168,85,247,0.12)" />
                {/* Core dot */}
                <circle
                  r={r}
                  fill="#A855F7"
                  fillOpacity={0.92}
                  stroke="#C084FC"
                  strokeWidth={0.8 / zoom}
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e: React.MouseEvent<SVGCircleElement>) => {
                    const container = (e.target as SVGElement).closest('.relative')?.getBoundingClientRect();
                    if (container) {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: e.clientX - container.left, y: e.clientY - container.top } : null
                      );
                    }
                  }}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* ── Year filter overlay — top-left ── */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5">
        {[null, ...years].map((year) => (
          <button
            key={year ?? 'all'}
            onClick={() => setSelectedYear(year === selectedYear ? null : year)}
            className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-150 ${
              selectedYear === year
                ? 'bg-purple-500/20 border-purple-400/40 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-black/30 border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/25'
            }`}
          >
            {year ?? 'All'}
          </button>
        ))}
      </div>

      {/* ── Stats overlay — bottom-left ── */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] backdrop-blur-sm">
          <span className="text-purple-400 font-semibold text-sm tabular-nums">{pins.length}</span>
          <span className="text-white/40 text-xs">{pins.length === 1 ? 'city' : 'cities'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] backdrop-blur-sm">
          <span className="text-purple-400 font-semibold text-sm tabular-nums">{filtered.length}</span>
          <span className="text-white/40 text-xs">
            {filtered.length === 1 ? 'show' : 'shows'}{selectedYear ? ` in ${selectedYear}` : ''}
          </span>
        </div>
      </div>

      {/* ── Zoom controls — bottom-right ── */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 2, 12))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 border border-white/[0.10] text-white/50 hover:text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 2, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 border border-white/[0.10] text-white/50 hover:text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([10, 10]); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 border border-white/[0.10] text-white/50 hover:text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* ── Hover tooltip ── */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 backdrop-blur-md bg-black/70 border border-purple-500/20 rounded-xl px-3 py-2.5 text-xs shadow-2xl"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            transform: tooltip.x > 700 ? 'translateX(-110%)' : undefined,
          }}
        >
          <div className="font-semibold text-white mb-0.5">{tooltip.pin.city}</div>
          <div className="text-white/40 mb-2 text-[11px]">{tooltip.pin.country}</div>
          <div className="border-t border-white/[0.08] pt-1.5 space-y-1">
            <div className="text-white/70">
              <span className="text-purple-400 font-semibold">{tooltip.pin.showCount}</span>{' '}
              {tooltip.pin.showCount === 1 ? 'show' : 'shows'}
            </div>
            {tooltip.pin.tours.map((t) => (
              <div key={t} className="text-white/35 truncate max-w-[200px] text-[11px]">{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
