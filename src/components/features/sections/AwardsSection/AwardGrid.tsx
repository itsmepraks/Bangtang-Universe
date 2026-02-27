import { useState, useMemo } from 'react';
import { Trophy, Award as AwardIcon, Star } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';
import FilterBar from '../../../ui/FilterBar';
import Badge from '../../../ui/Badge';

interface AwardGridProps {
  awards: Award[];
  members: Member[];
}

type CeremonyCategory = 'global' | 'regional' | 'fan' | 'specialty';

const CEREMONY_CATEGORY_MAP: Record<string, CeremonyCategory> = {
  // Global
  'Grammy Awards': 'global',
  'Billboard Music Awards': 'global',
  'MAMA Awards': 'global',
  'Golden Disc Awards': 'global',
  'MTV Video Music Awards': 'global',
  'MTV Europe Music Awards': 'global',
  'American Music Awards': 'global',
  'Brit Awards': 'global',
  'NME Awards': 'global',
  'IFPI Awards': 'global',
  "E! People's Choice Awards": 'global',
  'iHeartRadio Music Awards': 'global',
  'The WSJ Innovator Awards': 'global',
  'Webby Awards': 'global',
  'iF Product Design Awards': 'global',
  'The Asian Awards': 'global',
  'Global Awards': 'global',
  // Regional
  'Melon Music Awards': 'regional',
  'Seoul Music Awards': 'regional',
  'Circle Chart Music Awards': 'regional',
  'Japan Gold Disc Awards': 'regional',
  'Genie Music Awards': 'regional',
  'Korean Music Awards': 'regional',
  'APAN Music Awards': 'regional',
  'Hanteo Music Awards': 'regional',
  'Korea Broadcasting Awards': 'regional',
  'Korea Popular Music Awards': 'regional',
  'Soribada Best K-Music Awards': 'regional',
  'V Chart Awards': 'regional',
  'Korean PD Awards': 'regional',
  'Edaily Culture Awards': 'regional',
  'Music Awards Japan': 'regional',
  'Space Shower Music Awards': 'regional',
  'MTV Video Music Awards Japan': 'regional',
  'NRJ Music Awards': 'regional',
  'LOS40 Music Awards': 'regional',
  'Rockbjörnen': 'regional',
  'Gaffa-Prisen': 'regional',
  'BBC Radio1 Teen Awards': 'regional',
  'Swiss Music Awards': 'regional',
  'Telehit Awards': 'regional',
  'Planeta Awards': 'regional',
  'Proud Korean Awards': 'regional',
  // Fan
  'Soompi Awards': 'fan',
  'iHeartRadio MMVAs': 'fan',
  'Teen Choice Awards': 'fan',
  "Nickelodeon Kids' Choice Awards": 'fan',
  "Nickelodeon Mexico Kids' Choice Awards": 'fan',
  "Nickelodeon Argentina Kids' Choice Awards": 'fan',
  "Nickelodeon Colombia Kids' Choice Awards": 'fan',
  'Myx Music Awards': 'fan',
  'Radio Disney Music Awards': 'fan',
  'MTV Millennial Awards': 'fan',
  'MTV Millennial Awards Brazil': 'fan',
  'BraVo Music Awards': 'fan',
  'Anugerah Bintang Popular Berita Harian': 'fan',
  'Shorty Awards': 'fan',
  'UK Music Video Awards': 'fan',
  // Specialty
  'KOMCA Awards': 'specialty',
  'Korea First Brand Awards': 'specialty',
  'V Live Awards': 'specialty',
  'The Fact Music Awards': 'specialty',
};

const CATEGORY_LABELS: Record<CeremonyCategory, string> = {
  global: 'Global',
  regional: 'Regional',
  fan: 'Fan',
  specialty: 'Specialty',
};

const CATEGORY_FILTER_ORDER: (CeremonyCategory | null)[] = [
  null, 'global', 'regional', 'fan', 'specialty',
];

function getCeremonyCategory(ceremony: string): CeremonyCategory | undefined {
  return CEREMONY_CATEGORY_MAP[ceremony];
}

export default function AwardGrid({ awards, members }: AwardGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<CeremonyCategory | null>(null);
  const [specificCeremonyFilter, setSpecificCeremonyFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<string | null>(null);

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => {
      map[m.id] = m.stage_name;
    });
    return map;
  }, [members]);

  const ceremonies = useMemo(() => {
    const counts: Record<string, number> = {};
    awards.forEach((a) => {
      counts[a.ceremony] = (counts[a.ceremony] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: value, count }));
  }, [awards]);

  const ceremoniesInCategory = useMemo(() => {
    if (!categoryFilter) return [];
    return ceremonies.filter(c => getCeremonyCategory(c.value) === categoryFilter);
  }, [ceremonies, categoryFilter]);

  const years = useMemo(() => {
    const unique = [...new Set(awards.map((a) => a.year))].sort((a, b) => b - a);
    return unique.map((y) => ({ value: String(y), label: String(y) }));
  }, [awards]);

  const scopeOptions = [
    { value: 'group', label: 'Group' },
    { value: 'solo', label: 'Solo' },
    { value: 'unit', label: 'Unit' },
  ];

  const resultOptions = [
    { value: 'won', label: 'Won' },
    { value: 'nominated', label: 'Nominated' },
  ];

  const filtered = useMemo(() => {
    return awards.filter((a) => {
      if (categoryFilter && getCeremonyCategory(a.ceremony) !== categoryFilter) return false;
      if (specificCeremonyFilter && a.ceremony !== specificCeremonyFilter) return false;
      if (yearFilter && String(a.year) !== yearFilter) return false;
      if (scopeFilter && a.scope !== scopeFilter) return false;
      if (resultFilter && a.result !== resultFilter) return false;
      return true;
    });
  }, [awards, categoryFilter, specificCeremonyFilter, yearFilter, scopeFilter, resultFilter]);

  const totalWon = filtered.filter((a) => a.result === 'won').length;
  const totalNominated = filtered.filter((a) => a.result === 'nominated').length;
  const uniqueCeremonies = new Set(filtered.map((a) => a.ceremony)).size;

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
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-xs text-white/40 uppercase tracking-wide">Ceremony</span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Category pills */}
            {CATEGORY_FILTER_ORDER.map((cat) => (
              <button
                type="button"
                key={cat ?? 'all'}
                onClick={() => { setCategoryFilter(cat); setSpecificCeremonyFilter(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
                  categoryFilter === cat
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15'
                }`}
              >
                {cat ? CATEGORY_LABELS[cat] : 'All'}
              </button>
            ))}

            {/* Scoped ceremony dropdown — only visible when a category is active */}
            {categoryFilter && ceremoniesInCategory.length > 0 && (
              <select
                aria-label={`Filter by ${CATEGORY_LABELS[categoryFilter]} ceremony`}
                value={specificCeremonyFilter ?? ''}
                onChange={(e) => setSpecificCeremonyFilter(e.target.value || null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 bg-[#111118] cursor-pointer outline-none ${
                  specificCeremonyFilter
                    ? 'border-purple-500/30 text-purple-300'
                    : 'border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15'
                }`}
              >
                <option value="">All {CATEGORY_LABELS[categoryFilter]}</option>
                {ceremoniesInCategory.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} ({c.count})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-xs text-white/40 uppercase tracking-wide">Year</span>
            <FilterBar options={years} value={yearFilter} onChange={setYearFilter} allLabel="All Years" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-white/40 uppercase tracking-wide">Scope</span>
            <FilterBar options={scopeOptions} value={scopeFilter} onChange={setScopeFilter} allLabel="All" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-white/40 uppercase tracking-wide">Result</span>
            <FilterBar options={resultOptions} value={resultFilter} onChange={setResultFilter} allLabel="All" />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalWon}</div>
            <div className="text-xs text-white/40">Awards Won</div>
          </div>
        </div>
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalNominated}</div>
            <div className="text-xs text-white/40">Nominations</div>
          </div>
        </div>
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <AwardIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{uniqueCeremonies}</div>
            <div className="text-xs text-white/40">Unique Ceremonies</div>
          </div>
        </div>
      </div>

      {/* Award Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-white/40">No awards match the selected filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((award) => {
            const isWon = award.result === 'won';
            return (
              <div
                key={award.id}
                className={`bg-[#0c0c12] rounded-xl border p-4 transition-all duration-200 hover:bg-white/[0.02] ${
                  isWon ? 'border-yellow-500/20' : 'border-white/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-white/40 uppercase tracking-wide">{award.ceremony}</span>
                  {isWon && <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />}
                </div>

                <h3 className="text-sm font-semibold text-white/90 mb-2 leading-snug">
                  {award.name}
                  {award.category && (
                    <span className="text-white/40 font-normal"> &mdash; {award.category}</span>
                  )}
                </h3>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/50">{award.year}</span>
                  <Badge variant={isWon ? 'purple' : 'default'} size="sm">
                    {isWon ? 'Won' : 'Nominated'}
                  </Badge>
                  {award.scope !== 'group' && (
                    <Badge variant="blue" size="sm">
                      {award.scope === 'solo' ? 'Solo' : 'Unit'}
                    </Badge>
                  )}
                </div>

                {award.work_title && (
                  <div className="mt-2 text-xs text-white/40 truncate">
                    for &ldquo;{award.work_title}&rdquo;
                  </div>
                )}

                {award.member_id && memberMap[award.member_id] && (
                  <div className="mt-1 text-xs text-purple-300/70">{memberMap[award.member_id]}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
