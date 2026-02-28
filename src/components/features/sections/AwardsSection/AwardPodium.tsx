import { useState, useMemo } from 'react';
import { Trophy, ChevronRight, ChevronDown } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';
import Badge from '../../../ui/Badge';

interface AwardPodiumProps {
  awards: Award[];
  members: Member[];
}

type Region = 'korea' | 'usa' | 'global' | 'japan' | 'other';

const REGION_META: Record<Region, { label: string; flag: string }> = {
  korea:  { label: 'Korea',         flag: '🇰🇷' },
  usa:    { label: 'United States', flag: '🇺🇸' },
  global: { label: 'Global',        flag: '🌐' },
  japan:  { label: 'Japan',         flag: '🇯🇵' },
  other:  { label: 'Other',         flag: '🌍' },
};

const REGION_ORDER: Region[] = ['korea', 'usa', 'global', 'japan', 'other'];

const CEREMONY_REGION_MAP: Record<string, Region> = {
  // Korea
  'Melon Music Awards': 'korea',
  'Seoul Music Awards': 'korea',
  'MAMA Awards': 'korea',
  'Golden Disc Awards': 'korea',
  'Circle Chart Music Awards': 'korea',
  'Genie Music Awards': 'korea',
  'Korean Music Awards': 'korea',
  'APAN Music Awards': 'korea',
  'Hanteo Music Awards': 'korea',
  'Korea Broadcasting Awards': 'korea',
  'Korea Popular Music Awards': 'korea',
  'Soribada Best K-Music Awards': 'korea',
  'V Chart Awards': 'korea',
  'Korean PD Awards': 'korea',
  'Edaily Culture Awards': 'korea',
  'Soompi Awards': 'korea',
  'KOMCA Awards': 'korea',
  'Korea First Brand Awards': 'korea',
  'V Live Awards': 'korea',
  'The Fact Music Awards': 'korea',
  'Proud Korean Awards': 'korea',
  // USA
  'Grammy Awards': 'usa',
  'Billboard Music Awards': 'usa',
  'MTV Video Music Awards': 'usa',
  'American Music Awards': 'usa',
  "E! People's Choice Awards": 'usa',
  'iHeartRadio Music Awards': 'usa',
  'iHeartRadio MMVAs': 'usa',
  'Teen Choice Awards': 'usa',
  "Nickelodeon Kids' Choice Awards": 'usa',
  "Nickelodeon Mexico Kids' Choice Awards": 'usa',
  "Nickelodeon Argentina Kids' Choice Awards": 'usa',
  "Nickelodeon Colombia Kids' Choice Awards": 'usa',
  'Radio Disney Music Awards': 'usa',
  'Shorty Awards': 'usa',
  'Webby Awards': 'usa',
  'The WSJ Innovator Awards': 'usa',
  'iF Product Design Awards': 'usa',
  'Myx Music Awards': 'usa',
  'MTV Millennial Awards': 'usa',
  'MTV Millennial Awards Brazil': 'usa',
  'UK Music Video Awards': 'global',
  // Global
  'IFPI Awards': 'global',
  'MTV Europe Music Awards': 'global',
  'Brit Awards': 'global',
  'NME Awards': 'global',
  'The Asian Awards': 'global',
  'Global Awards': 'global',
  'Asia Artist Awards': 'global',
  'BraVo Music Awards': 'global',
  'Anugerah Bintang Popular Berita Harian': 'global',
  // Europe / Other regional
  'NRJ Music Awards': 'global',
  'LOS40 Music Awards': 'global',
  'Rockbjörnen': 'global',
  'Gaffa-Prisen': 'global',
  'BBC Radio1 Teen Awards': 'global',
  'Swiss Music Awards': 'global',
  'Telehit Awards': 'global',
  'Planeta Awards': 'global',
  // Japan
  'Japan Gold Disc Awards': 'japan',
  'Music Awards Japan': 'japan',
  'Space Shower Music Awards': 'japan',
  'MTV Video Music Awards Japan': 'japan',
};

const MEMBER_ORDER = ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook'];

function getRegion(ceremony: string): Region {
  return CEREMONY_REGION_MAP[ceremony] ?? 'other';
}

function toggle(set: Set<string>, key: string): Set<string> {
  const next = new Set(set);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
}

export default function AwardPodium({ awards, members }: AwardPodiumProps) {
  const [mode, setMode] = useState<'group' | 'solo'>('group');
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<'won' | 'nominated' | null>(null);
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set());
  const [openCeremonies, setOpenCeremonies] = useState<Set<string>>(new Set());
  const [openMembers, setOpenMembers] = useState<Set<string>>(new Set());

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m) => { map[m.id] = m.stage_name; });
    return map;
  }, [members]);

  const years = useMemo(
    () => [...new Set(awards.map((a) => String(a.year)))].sort((a, b) => Number(b) - Number(a)),
    [awards],
  );

  const filtered = useMemo(
    () =>
      awards.filter((a) => {
        if (yearFilter && String(a.year) !== yearFilter) return false;
        if (resultFilter && a.result !== resultFilter) return false;
        return true;
      }),
    [awards, yearFilter, resultFilter],
  );

  // ── Group mode: region → ceremony → awards ──────────────────────────
  const regionNodes = useMemo(() => {
    if (mode !== 'group') return [];
    const regionMap = new Map<Region, Map<string, Award[]>>();
    REGION_ORDER.forEach((r) => regionMap.set(r, new Map()));
    filtered.forEach((a) => {
      const region = getRegion(a.ceremony);
      const cerMap = regionMap.get(region)!;
      if (!cerMap.has(a.ceremony)) cerMap.set(a.ceremony, []);
      cerMap.get(a.ceremony)!.push(a);
    });
    return REGION_ORDER.map((region) => {
      const cerMap = regionMap.get(region)!;
      const ceremonies = Array.from(cerMap.entries())
        .map(([ceremony, aws]) => ({
          ceremony,
          awards: aws.sort((a, b) => b.year - a.year),
          winsCount: aws.filter((a) => a.result === 'won').length,
          nominatedCount: aws.filter((a) => a.result === 'nominated').length,
        }))
        .sort((a, b) => b.winsCount - a.winsCount);
      const allAwards = ceremonies.flatMap((c) => c.awards);
      return {
        region,
        ...REGION_META[region],
        ceremonies,
        winsCount: allAwards.filter((a) => a.result === 'won').length,
        nominatedCount: allAwards.filter((a) => a.result === 'nominated').length,
        total: allAwards.length,
      };
    }).filter((r) => r.total > 0);
  }, [filtered, mode]);

  // ── Solo mode: member → awards ───────────────────────────────────────
  const memberNodes = useMemo(() => {
    if (mode !== 'solo') return [];
    const soloAwards = filtered.filter((a) => a.scope !== 'group' && a.member_id);
    const memberAwardsMap = new Map<string, Award[]>();
    soloAwards.forEach((a) => {
      const key = a.member_id!;
      if (!memberAwardsMap.has(key)) memberAwardsMap.set(key, []);
      memberAwardsMap.get(key)!.push(a);
    });
    return Array.from(memberAwardsMap.entries())
      .map(([memberId, aws]) => ({
        memberId,
        name: memberMap[memberId] ?? memberId,
        awards: aws.sort((a, b) => b.year - a.year),
        winsCount: aws.filter((a) => a.result === 'won').length,
        nominatedCount: aws.filter((a) => a.result === 'nominated').length,
      }))
      .sort((a, b) => {
        const ai = MEMBER_ORDER.indexOf(a.name);
        const bi = MEMBER_ORDER.indexOf(b.name);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [filtered, mode, memberMap]);

  return (
    <div className="space-y-5">
      {/* ── Mode toggle + filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {(['group', 'solo'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m
                  ? 'bg-purple-500/20 text-white border border-purple-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {m === 'group' ? 'As a Group' : 'Solo / Unit'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[null, ...years].map((y) => (
              <button
                key={y ?? 'all'}
                type="button"
                onClick={() => setYearFilter(y)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  yearFilter === y
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                }`}
              >
                {y ?? 'All'}
              </button>
            ))}
          </div>
          {/* Result pills */}
          <div className="flex items-center gap-1.5">
            {([null, 'won', 'nominated'] as const).map((r) => (
              <button
                key={r ?? 'all'}
                type="button"
                onClick={() => setResultFilter(r)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  resultFilter === r
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                }`}
              >
                {r === null ? 'All' : r === 'won' ? 'Won' : 'Nominated'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Group mode tree ── */}
      {mode === 'group' && (
        <div className="space-y-2">
          {regionNodes.map((rn) => {
            const isOpen = openRegions.has(rn.region);
            return (
              <div key={rn.region} className="rounded-xl border border-white/[0.06] overflow-hidden">
                {/* Region header */}
                <button
                  type="button"
                  onClick={() => setOpenRegions(toggle(openRegions, rn.region))}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] ${
                    isOpen ? 'bg-white/[0.03] border-b border-white/[0.06]' : 'bg-[#0c0c12]'
                  }`}
                >
                  <span className="text-xl leading-none">{rn.flag}</span>
                  <span className="flex-1 text-sm font-semibold text-white text-left">{rn.label}</span>
                  <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                    <Trophy className="w-3 h-3" /> {rn.winsCount}
                  </span>
                  {rn.nominatedCount > 0 && (
                    <span className="text-xs text-white/30">{rn.nominatedCount} nom.</span>
                  )}
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-white/30" />
                    : <ChevronRight className="w-4 h-4 text-white/30" />}
                </button>

                {/* Ceremony rows */}
                {isOpen && (
                  <div className="bg-[#0a0a10]">
                    {rn.ceremonies.map((cn) => {
                      const cerKey = `${rn.region}::${cn.ceremony}`;
                      const isCerOpen = openCeremonies.has(cerKey);
                      return (
                        <div key={cn.ceremony} className="border-t border-white/[0.04] first:border-t-0">
                          <button
                            type="button"
                            onClick={() => setOpenCeremonies(toggle(openCeremonies, cerKey))}
                            className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 transition-colors hover:bg-white/[0.02] ${
                              isCerOpen ? 'bg-white/[0.02]' : ''
                            }`}
                          >
                            <span className={`flex-1 text-xs font-medium text-left ${isCerOpen ? 'text-white/90' : 'text-white/60'}`}>
                              {cn.ceremony}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-yellow-400/80">
                              <Trophy className="w-2.5 h-2.5" /> {cn.winsCount}
                            </span>
                            {cn.nominatedCount > 0 && (
                              <span className="text-xs text-white/25">{cn.nominatedCount} nom.</span>
                            )}
                            {isCerOpen
                              ? <ChevronDown className="w-3.5 h-3.5 text-white/25" />
                              : <ChevronRight className="w-3.5 h-3.5 text-white/25" />}
                          </button>

                          {/* Award leaf rows */}
                          {isCerOpen && (
                            <div className="border-t border-white/[0.04]">
                              {cn.awards.map((a) => (
                                <div
                                  key={a.id}
                                  className="flex items-center gap-3 pl-16 pr-4 py-2 border-t border-white/[0.03] first:border-t-0 hover:bg-white/[0.01]"
                                >
                                  <span className="text-xs text-white/30 tabular-nums w-10 shrink-0">{a.year}</span>
                                  <span className="flex-1 text-xs text-white/70 leading-snug min-w-0">
                                    {a.name}
                                    {a.category && <span className="text-white/30"> — {a.category}</span>}
                                  </span>
                                  {a.work_title && (
                                    <span className="text-xs text-white/25 truncate max-w-[120px] hidden sm:block shrink-0">
                                      {a.work_title}
                                    </span>
                                  )}
                                  {a.member_id && memberMap[a.member_id] && (
                                    <span className="text-xs text-purple-300/60 shrink-0">{memberMap[a.member_id]}</span>
                                  )}
                                  <Badge variant={a.result === 'won' ? 'purple' : 'default'} size="sm">
                                    {a.result === 'won' ? 'Won' : 'Nom.'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {regionNodes.length === 0 && (
            <div className="py-12 text-center text-sm text-white/40">No awards match the selected filters.</div>
          )}
        </div>
      )}

      {/* ── Solo mode tree ── */}
      {mode === 'solo' && (
        <div className="space-y-2">
          {memberNodes.map((mn) => {
            const isOpen = openMembers.has(mn.memberId);
            return (
              <div key={mn.memberId} className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenMembers(toggle(openMembers, mn.memberId))}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] ${
                    isOpen ? 'bg-white/[0.03] border-b border-white/[0.06]' : 'bg-[#0c0c12]'
                  }`}
                >
                  <span className="flex-1 text-sm font-semibold text-white text-left">{mn.name}</span>
                  <span className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
                    <Trophy className="w-3 h-3" /> {mn.winsCount}
                  </span>
                  {mn.nominatedCount > 0 && (
                    <span className="text-xs text-white/30">{mn.nominatedCount} nom.</span>
                  )}
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-white/30" />
                    : <ChevronRight className="w-4 h-4 text-white/30" />}
                </button>
                {isOpen && (
                  <div className="bg-[#0a0a10]">
                    {mn.awards.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 pl-6 pr-4 py-2.5 border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.01]"
                      >
                        <span className="text-xs text-white/30 tabular-nums w-10 shrink-0">{a.year}</span>
                        <span className="text-xs text-white/40 shrink-0 max-w-[140px] truncate hidden sm:block">{a.ceremony}</span>
                        <span className="flex-1 text-xs text-white/70 leading-snug min-w-0">
                          {a.name}
                          {a.category && <span className="text-white/30"> — {a.category}</span>}
                        </span>
                        {a.work_title && (
                          <span className="text-xs text-white/25 truncate max-w-[100px] hidden md:block shrink-0">{a.work_title}</span>
                        )}
                        <Badge variant={a.result === 'won' ? 'purple' : 'default'} size="sm">
                          {a.result === 'won' ? 'Won' : 'Nom.'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {memberNodes.length === 0 && (
            <div className="py-12 text-center text-sm text-white/40">No solo or unit awards match the selected filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
