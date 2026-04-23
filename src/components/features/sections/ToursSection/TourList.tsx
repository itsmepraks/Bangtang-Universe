import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calendar, MapPin, Music, Filter, ArrowUpDown } from 'lucide-react';
import type { Concert } from '../../../../types/database';

interface TourListProps {
  concerts: Concert[];
}

interface TourGroup {
  tourName: string;
  concerts: Concert[];
  dateRange: { first: string; last: string };
  showCount: number;
  totalAttendance: number;
  countries: string[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TourList({ concerts }: TourListProps) {
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());
  const [expandedSetlists, setExpandedSetlists] = useState<Set<number>>(new Set());
  const [tourFilter, setTourFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { tourNames, countries } = useMemo(() => {
    const tourSet = new Set<string>();
    const countrySet = new Set<string>();
    concerts.forEach((c) => {
      tourSet.add(c.tour_name);
      countrySet.add(c.country);
    });
    return {
      tourNames: Array.from(tourSet).sort(),
      countries: Array.from(countrySet).sort(),
    };
  }, [concerts]);

  const tourGroups = useMemo(() => {
    let filtered = concerts;

    if (tourFilter) {
      filtered = filtered.filter((c) => c.tour_name === tourFilter);
    }
    if (countryFilter) {
      filtered = filtered.filter((c) => c.country === countryFilter);
    }

    const groupMap = new Map<string, Concert[]>();
    filtered.forEach((c) => {
      const existing = groupMap.get(c.tour_name) || [];
      existing.push(c);
      groupMap.set(c.tour_name, existing);
    });

    const groups: TourGroup[] = Array.from(groupMap.entries()).map(([tourName, tourConcerts]) => {
      const sorted = [...tourConcerts].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const countrySet = new Set(sorted.map((c) => c.country));
      return {
        tourName,
        concerts: sorted,
        dateRange: {
          first: sorted[0].date,
          last: sorted[sorted.length - 1].date,
        },
        showCount: sorted.length,
        totalAttendance: sorted.reduce((sum, c) => sum + (c.attendance || 0), 0),
        countries: Array.from(countrySet).sort(),
      };
    });

    groups.sort((a, b) => {
      const dateA = new Date(a.dateRange.first).getTime();
      const dateB = new Date(b.dateRange.first).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return groups;
  }, [concerts, tourFilter, countryFilter, sortOrder]);

  const toggleTour = (tourName: string) => {
    setExpandedTours((prev) => {
      const next = new Set(prev);
      if (next.has(tourName)) {
        next.delete(tourName);
      } else {
        next.add(tourName);
      }
      return next;
    });
  };

  const toggleSetlist = (concertId: number) => {
    setExpandedSetlists((prev) => {
      const next = new Set(prev);
      if (next.has(concertId)) {
        next.delete(concertId);
      } else {
        next.add(concertId);
      }
      return next;
    });
  };

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
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-white/40">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Filters</span>
        </div>

        <select
          value={tourFilter}
          onChange={(e) => setTourFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white/70 outline-none focus:border-purple-500/40 transition-colors"
        >
          <option value="">All Tours</option>
          {tourNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white/70 outline-none focus:border-purple-500/40 transition-colors"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.06] transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Tour Groups */}
      <div className="space-y-3">
        {tourGroups.map((group) => {
          const isExpanded = expandedTours.has(group.tourName);

          return (
            <div
              key={group.tourName}
              className="rounded-xl border border-white/[0.06] bg-[#0c0c12] overflow-hidden"
            >
              {/* Tour Header */}
              <button
                onClick={() => toggleTour(group.tourName)}
                className="w-full flex items-center gap-4 px-3 md:px-5 py-3 md:py-4 hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="text-white/40">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white/90 truncate">
                    {group.tourName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Calendar className="w-3 h-3" />
                      {formatDate(group.dateRange.first)} — {formatDate(group.dateRange.last)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <MapPin className="w-3 h-3" />
                      {group.countries.length} {group.countries.length === 1 ? 'country' : 'countries'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white/80">
                      {group.showCount}
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide">Shows</div>
                  </div>
                  {group.totalAttendance > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-400">
                        {group.totalAttendance.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">
                        Attendance
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded Concert List */}
              {isExpanded && (
                <div className="border-t border-white/[0.06]">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="py-2.5 px-5 text-left text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            Date
                          </th>
                          <th className="py-2.5 px-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            City
                          </th>
                          <th className="py-2.5 px-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            Country
                          </th>
                          <th className="py-2.5 px-4 text-left text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            Venue
                          </th>
                          <th className="py-2.5 px-4 text-right text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            Attendance
                          </th>
                          <th className="py-2.5 px-4 text-center text-[10px] font-medium text-white/40 uppercase tracking-wide">
                            Setlist
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.concerts.map((concert, i) => (
                          <tr
                            key={concert.id}
                            className={`border-b border-white/[0.03] ${
                              i % 2 === 1 ? 'bg-white/[0.01]' : ''
                            }`}
                          >
                            <td className="py-3 px-5 text-sm text-white/70 whitespace-nowrap">
                              {formatDate(concert.date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-white/70">{concert.city}</td>
                            <td className="py-3 px-4 text-sm text-white/50">{concert.country}</td>
                            <td className="py-3 px-4 text-sm text-white/50 max-w-[200px] truncate">
                              {concert.venue}
                            </td>
                            <td className="py-3 px-4 text-sm text-white/60 text-right tabular-nums">
                              {concert.attendance
                                ? concert.attendance.toLocaleString()
                                : '—'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {concert.setlist && concert.setlist.length > 0 ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSetlist(concert.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 border border-purple-500/25 text-purple-300 hover:bg-purple-500/25 transition-colors"
                                >
                                  <Music className="w-3 h-3" />
                                  {expandedSetlists.has(concert.id) ? 'Hide' : 'Setlist'}
                                </button>
                              ) : (
                                <span className="text-xs text-white/20">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Expanded Setlists */}
                  {group.concerts
                    .filter(
                      (c) =>
                        expandedSetlists.has(c.id) &&
                        c.setlist &&
                        c.setlist.length > 0
                    )
                    .map((concert) => (
                      <div
                        key={`setlist-${concert.id}`}
                        className="mx-5 mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                      >
                        <div className="text-xs font-medium text-white/50 mb-3">
                          Setlist — {formatDate(concert.date)}, {concert.city}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1.5">
                          {concert.setlist!.map((song, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 tabular-nums w-5 text-right shrink-0">
                                {idx + 1}.
                              </span>
                              <span className="text-xs text-white/60 truncate">{song}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {tourGroups.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <span className="text-xs text-white/40">
            {tourGroups.length} {tourGroups.length === 1 ? 'tour' : 'tours'}
          </span>
          <span className="text-xs text-white/20">|</span>
          <span className="text-xs text-white/40">
            {tourGroups.reduce((sum, g) => sum + g.showCount, 0)} concerts
          </span>
        </div>
      )}

      {tourGroups.length === 0 && concerts.length > 0 && (
        <div className="py-12 text-center text-sm text-white/40">
          No concerts match the current filters.
        </div>
      )}
    </div>
  );
}
