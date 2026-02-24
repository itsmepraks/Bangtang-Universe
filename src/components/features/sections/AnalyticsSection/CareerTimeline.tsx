import { useMemo } from 'react';
import type { Album, Award, Concert, MemberEvent } from '../../../../types/database';

// ==================== TYPES ====================

interface CareerTimelineProps {
  albums: Album[];
  awards: Award[];
  concerts: Concert[];
  memberEvents: MemberEvent[];
}

interface TimelineEntry {
  date: string;
  year: number;
  title: string;
  description: string;
  category: 'album' | 'award' | 'tour' | 'event';
}

// ==================== CONSTANTS ====================

const CATEGORY_COLORS: Record<TimelineEntry['category'], string> = {
  album: '#A855F7',   // purple
  award: '#EAB308',   // gold
  tour: '#22C55E',    // green
  event: '#3B82F6',   // blue
};

const CATEGORY_LABELS: Record<TimelineEntry['category'], string> = {
  album: 'Album Release',
  award: 'Award',
  tour: 'Tour',
  event: 'Member Event',
};

// ==================== COMPONENT ====================

export default function CareerTimeline({ albums, awards, concerts, memberEvents }: CareerTimelineProps) {
  const milestones = useMemo(() => {
    const entries: TimelineEntry[] = [];

    // Album releases
    for (const album of albums) {
      if (!album.release_date) continue;
      entries.push({
        date: album.release_date,
        year: parseInt(album.release_date.split('-')[0], 10),
        title: album.title,
        description: `${album.type} album${album.era ? ` \u2014 ${album.era} era` : ''}`,
        category: 'album',
      });
    }

    // Award wins (significant ones)
    const wonAwards = awards.filter((a) => a.result === 'won');
    // Deduplicate by ceremony+year, keeping first occurrence
    const seenCeremonyYear = new Set<string>();
    for (const award of wonAwards) {
      const key = `${award.ceremony}-${award.year}`;
      if (seenCeremonyYear.has(key)) continue;
      seenCeremonyYear.add(key);
      entries.push({
        date: `${award.year}-01-01`,
        year: award.year,
        title: award.name,
        description: `${award.ceremony}${award.category ? ` \u2014 ${award.category}` : ''}`,
        category: 'award',
      });
    }

    // Tour starts (first concert of each tour)
    const tourFirstConcert = new Map<string, Concert>();
    for (const concert of concerts) {
      const existing = tourFirstConcert.get(concert.tour_name);
      if (!existing || new Date(concert.date) < new Date(existing.date)) {
        tourFirstConcert.set(concert.tour_name, concert);
      }
    }
    for (const [tourName, concert] of tourFirstConcert) {
      entries.push({
        date: concert.date,
        year: parseInt(concert.date.split('-')[0], 10),
        title: tourName,
        description: `Tour start \u2014 ${concert.venue}, ${concert.city}`,
        category: 'tour',
      });
    }

    // Member events (enlistments, solo debuts, etc.)
    for (const event of memberEvents) {
      entries.push({
        date: event.date,
        year: parseInt(event.date.split('-')[0], 10),
        title: event.title,
        description: event.description || event.event_type.replace(/_/g, ' '),
        category: 'event',
      });
    }

    // Sort chronologically
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return entries;
  }, [albums, awards, concerts, memberEvents]);

  // Empty state
  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-white/40">No timeline data available yet.</p>
        <p className="text-xs text-white/40 mt-2">
          Timeline milestones will appear here once albums, awards, concerts, and events are loaded.
        </p>
      </div>
    );
  }

  // Group by year for visual clarity
  const yearGroups = milestones.reduce<Record<number, TimelineEntry[]>>((acc, entry) => {
    if (!acc[entry.year]) acc[entry.year] = [];
    acc[entry.year].push(entry);
    return acc;
  }, {});

  const years = Object.keys(yearGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {(Object.keys(CATEGORY_COLORS) as TimelineEntry['category'][]).map((cat) => (
          <div key={cat} className="flex items-center gap-2 text-xs text-white/50">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            {CATEGORY_LABELS[cat]}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.08]" />

        <div className="space-y-6 md:space-y-8">
          {years.map((year) => (
            <div key={year}>
              {/* Year marker */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 rounded-full bg-purple-500/20 border-2 border-purple-500/50 relative z-10" />
                <span className="text-sm font-semibold text-white/80">{year}</span>
              </div>

              {/* Entries for this year */}
              <div className="ml-6 md:ml-8 space-y-3">
                {yearGroups[year].map((entry, i) => (
                  <div
                    key={`${entry.date}-${i}`}
                    className="relative flex items-start gap-3"
                  >
                    {/* Dot connector */}
                    <div className="absolute -left-[21px] md:-left-[25px] top-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
                      />
                    </div>

                    {/* Content */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex-1 hover:border-white/[0.12] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white/85">{entry.title}</p>
                          <p className="text-xs text-white/50 mt-0.5">{entry.description}</p>
                        </div>
                        <span className="text-xs text-white/40 whitespace-nowrap">{entry.date}</span>
                      </div>
                      <div className="mt-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[entry.category]}15`,
                            color: CATEGORY_COLORS[entry.category],
                            border: `1px solid ${CATEGORY_COLORS[entry.category]}30`,
                          }}
                        >
                          {CATEGORY_LABELS[entry.category]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
