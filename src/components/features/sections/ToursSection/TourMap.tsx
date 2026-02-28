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

  // Derive sorted list of years from concert data
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    concerts.forEach((c) => yearSet.add(new Date(c.date).getFullYear()));
    return Array.from(yearSet).sort();
  }, [concerts]);

  // Filter concerts by selected year
  const filtered = useMemo(() => {
    if (selectedYear === null) return concerts;
    return concerts.filter((c) => new Date(c.date).getFullYear() === selectedYear);
  }, [concerts, selectedYear]);

  // Group by city, resolve coordinates, build pins
  const pins = useMemo((): CityPin[] => {
    const map = new Map<string, CityPin>();
    filtered.forEach((c) => {
      const coords = resolveCoords(c.city, c.country);
      if (!coords) return;
      const key = `${c.city}, ${c.country}`;
      const existing = map.get(key);
      if (existing) {
        existing.showCount += 1;
        if (!existing.tours.includes(c.tour_name)) {
          existing.tours.push(c.tour_name);
        }
      } else {
        map.set(key, {
          cityKey: key,
          city: c.city,
          country: c.country,
          coords,
          showCount: 1,
          tours: [c.tour_name],
        });
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
    <div className="space-y-4">
      {/* Year filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            selectedYear === null
              ? 'bg-purple-500/10 border-purple-500/30 text-white'
              : 'border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/20'
          }`}
        >
          All
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year === selectedYear ? null : year)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedYear === year
                ? 'bg-purple-500/10 border-purple-500/30 text-white'
                : 'border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/20'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-[#0c0c12] min-h-[420px]"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projectionConfig={{ scale: 147, center: [10, 10] }}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={10}
            onMoveEnd={({ zoom: z, coordinates: c }) => {
              setZoom(z);
              setCenter(c as [number, number]);
            }}
          >
            <Geographies geography={worldData}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={0.5 / zoom}
                    style={{ outline: 'none', default: { outline: 'none' }, hover: { outline: 'none', fill: 'rgba(168,85,247,0.08)' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>

            {pins.map((pin) => {
              // Markers scale inversely with zoom so they stay visually consistent
              const baseR = 4 + Math.sqrt(pin.showCount) * 2;
              const r = baseR / zoom;
              return (
                <Marker
                  key={pin.cityKey}
                  coordinates={pin.coords}
                  onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                    const container = (e.target as SVGElement)
                      .closest('.relative')
                      ?.getBoundingClientRect();
                    if (container) {
                      setTooltip({
                        pin,
                        x: e.clientX - container.left,
                        y: e.clientY - container.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle
                    r={r}
                    fill="#A855F7"
                    fillOpacity={0.9}
                    stroke="#7C3AED"
                    strokeWidth={0.8 / zoom}
                    style={{ cursor: 'pointer' }}
                    onMouseMove={(e: React.MouseEvent<SVGCircleElement>) => {
                      const container = (e.target as SVGElement)
                        .closest('.relative')
                        ?.getBoundingClientRect();
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

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom((z) => Math.min(z * 2, 10))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/60 hover:text-white hover:bg-white/[0.10] transition-colors"
            title="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z / 2, 1))}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/60 hover:text-white hover:bg-white/[0.10] transition-colors"
            title="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1); setCenter([10, 10]); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/60 hover:text-white hover:bg-white/[0.10] transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 bg-[#1a1a2e] border border-white/[0.10] rounded-xl px-3 py-2.5 text-xs shadow-xl"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              transform: tooltip.x > 600 ? 'translateX(-110%)' : undefined,
            }}
          >
            <div className="font-semibold text-white/90 mb-0.5">{tooltip.pin.city}</div>
            <div className="text-white/50 mb-2">{tooltip.pin.country}</div>
            <div className="border-t border-white/[0.08] pt-2 space-y-1">
              <div className="text-white/70">
                <span className="text-purple-400 font-medium">{tooltip.pin.showCount}</span>{' '}
                {tooltip.pin.showCount === 1 ? 'show' : 'shows'}
              </div>
              {tooltip.pin.tours.map((t) => (
                <div key={t} className="text-white/40 truncate max-w-[200px]">
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary line */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-white/40">
          {pins.length} {pins.length === 1 ? 'city' : 'cities'}
        </span>
        <span className="text-xs text-white/20">|</span>
        <span className="text-xs text-white/40">
          {filtered.length} {filtered.length === 1 ? 'show' : 'shows'}
          {selectedYear ? ` in ${selectedYear}` : ' total'}
        </span>
      </div>
    </div>
  );
}
