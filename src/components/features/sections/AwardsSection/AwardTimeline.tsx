import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';
import Badge from '../../../ui/Badge';

interface AwardTimelineProps {
  awards: Award[];
  members: Member[];
}

interface YearGroup {
  year: number;
  awards: Award[];
  wonCount: number;
}

export default function AwardTimeline({ awards, members }: AwardTimelineProps) {
  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => {
      map[m.id] = m.stage_name;
    });
    return map;
  }, [members]);

  const yearGroups = useMemo(() => {
    const grouped: Record<number, Award[]> = {};
    awards.forEach((a) => {
      if (!grouped[a.year]) grouped[a.year] = [];
      grouped[a.year].push(a);
    });

    return Object.entries(grouped)
      .map(([year, yearAwards]): YearGroup => ({
        year: Number(year),
        awards: yearAwards.sort((a, b) => {
          // Sort won first, then by ceremony name
          if (a.result !== b.result) return a.result === 'won' ? -1 : 1;
          return a.ceremony.localeCompare(b.ceremony);
        }),
        wonCount: yearAwards.filter((a) => a.result === 'won').length,
      }))
      .sort((a, b) => b.year - a.year);
  }, [awards]);

  if (awards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy size={48} className="text-white/20 mb-4" />
        <h2 className="text-lg font-semibold text-white/60 mb-2">No awards data yet</h2>
        <p className="text-sm text-white/40">Run the awards scraper to populate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {yearGroups.map((group, groupIdx) => (
        <div key={group.year} className="relative">
          {/* Connector line */}
          {groupIdx < yearGroups.length - 1 && (
            <div className="absolute left-[23px] top-12 bottom-0 w-px bg-white/[0.06]" />
          )}

          {/* Year Header */}
          <div className="flex items-center gap-4 mb-4 pt-2">
            <div className="w-12 h-12 rounded-xl bg-[#0c0c12] border border-white/[0.06] flex items-center justify-center shrink-0 z-10">
              <span className="text-sm font-bold text-white/80">{group.year}</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white/90">{group.year}</h3>
              <span className="text-xs text-white/40">
                {group.wonCount} won &middot; {group.awards.length} total
              </span>
            </div>
          </div>

          {/* Award Entries */}
          <div className="ml-[23px] pl-8 border-l border-white/[0.06] pb-6 space-y-3">
            {group.awards.map((award) => {
              const isWon = award.result === 'won';
              return (
                <div
                  key={award.id}
                  className="relative bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4 transition-all duration-200 hover:bg-white/[0.02]"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[21px] top-5 w-2.5 h-2.5 rounded-full border-2 ${
                      isWon
                        ? 'bg-yellow-400 border-yellow-400/50'
                        : 'bg-white/20 border-white/10'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/40 uppercase tracking-wide">
                          {award.ceremony}
                        </span>
                        <Badge variant={isWon ? 'purple' : 'default'} size="sm">
                          {isWon ? 'Won' : 'Nominated'}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-medium text-white/90 leading-snug">
                        {award.name}
                        {award.category && (
                          <span className="text-white/40 font-normal"> &mdash; {award.category}</span>
                        )}
                      </h4>

                      {award.work_title && (
                        <div className="mt-1 text-xs text-white/40">
                          for &ldquo;{award.work_title}&rdquo;
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        {award.scope !== 'group' && (
                          <Badge variant="blue" size="sm">
                            {award.scope === 'solo' ? 'Solo' : 'Unit'}
                          </Badge>
                        )}
                        {award.member_id && memberMap[award.member_id] && (
                          <span className="text-xs text-purple-300/70">
                            {memberMap[award.member_id]}
                          </span>
                        )}
                      </div>
                    </div>

                    {isWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0 mt-1" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
