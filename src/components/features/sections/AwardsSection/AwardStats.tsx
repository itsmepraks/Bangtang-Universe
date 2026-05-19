import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, TrendingUp, Users, Percent } from 'lucide-react';
import type { Award, Member } from '../../../../types/database';
import { CHART_STYLES, BORAHAE_COLORS, withAlpha } from '../../../../constants/colors';

interface AwardStatsProps {
  awards: Award[];
  members: Member[];
}

export default function AwardStats({ awards }: AwardStatsProps) {
  // Awards by year (stacked won/nominated)
  const byYearData = useMemo(() => {
    const grouped: Record<number, { won: number; nominated: number }> = {};
    awards.forEach((a) => {
      if (!grouped[a.year]) grouped[a.year] = { won: 0, nominated: 0 };
      if (a.result === 'won') grouped[a.year].won++;
      else grouped[a.year].nominated++;
    });
    return Object.entries(grouped)
      .map(([year, counts]) => ({
        year: Number(year),
        won: counts.won,
        nominated: counts.nominated,
      }))
      .sort((a, b) => a.year - b.year);
  }, [awards]);

  const byCeremonyData = useMemo(() => {
    const counts: Record<string, { won: number; total: number }> = {};
    awards.forEach((a) => {
      if (!counts[a.ceremony]) counts[a.ceremony] = { won: 0, total: 0 };
      counts[a.ceremony].total++;
      if (a.result === 'won') counts[a.ceremony].won++;
    });
    return Object.entries(counts)
      .map(([ceremony, data]) => ({
        ceremony,
        won: data.won,
        total: data.total,
      }))
      .sort((a, b) => b.won - a.won)
      .slice(0, 10);
  }, [awards]);

  const totalWon = awards.filter((a) => a.result === 'won').length;
  const totalAwards = awards.length;
  const winRate = totalAwards > 0 ? ((totalWon / totalAwards) * 100).toFixed(1) : '0';

  const scopeBreakdown = useMemo(() => {
    const counts = { group: 0, solo: 0, unit: 0 };
    awards.forEach((a) => {
      counts[a.scope]++;
    });
    return counts;
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
    <div className="space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/40 uppercase tracking-wide">Won</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalWon}</div>
        </div>
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/40 uppercase tracking-wide">Total</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalAwards}</div>
        </div>
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/40 uppercase tracking-wide">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{winRate}%</div>
        </div>
        <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/40 uppercase tracking-wide">Scope</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-white/70">G:{scopeBreakdown.group}</span>
            <span className="text-sm text-white/70">S:{scopeBreakdown.solo}</span>
            <span className="text-sm text-white/70">U:{scopeBreakdown.unit}</span>
          </div>
        </div>
      </div>

      {/* Awards by Year Chart */}
      <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Awards by Year</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byYearData} barCategoryGap="20%">
              <CartesianGrid {...CHART_STYLES.GRID} />
              <XAxis dataKey="year" tick={CHART_STYLES.AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_STYLES.AXIS} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                cursor={CHART_STYLES.TOOLTIP.cursor}
              />
              <Bar dataKey="won" stackId="awards" fill="#FBBF24" radius={[0, 0, 0, 0]} name="Won" activeBar={CHART_STYLES.BAR_ACTIVE} />
              <Bar
                dataKey="nominated"
                stackId="awards"
                fill={BORAHAE_COLORS.PRIMARY}
                radius={[4, 4, 0, 0]}
                name="Nominated"
                activeBar={CHART_STYLES.BAR_ACTIVE}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Awards by Ceremony Chart */}
      <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Top Ceremonies by Wins</h3>
        <div style={{ height: Math.max(200, byCeremonyData.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCeremonyData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
              <XAxis type="number" tick={CHART_STYLES.AXIS} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="ceremony"
                tick={CHART_STYLES.AXIS}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                cursor={CHART_STYLES.TOOLTIP.cursor}
              />
              <Bar dataKey="won" fill="#FBBF24" radius={[0, 4, 4, 0]} name="Won" activeBar={CHART_STYLES.BAR_ACTIVE} />
              <Bar dataKey="total" fill={withAlpha(BORAHAE_COLORS.PRIMARY, 0.3)} radius={[0, 4, 4, 0]} name="Total" activeBar={CHART_STYLES.BAR_ACTIVE} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scope Breakdown */}
      <div className="bg-[#0c0c12] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Scope Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Group', count: scopeBreakdown.group, color: 'purple' },
            { label: 'Solo', count: scopeBreakdown.solo, color: 'blue' },
            { label: 'Unit', count: scopeBreakdown.unit, color: 'green' },
          ].map((item) => {
            const pct = totalAwards > 0 ? ((item.count / totalAwards) * 100).toFixed(1) : '0';
            return (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{item.count}</div>
                <div className="text-xs text-white/40 mb-2">{item.label}</div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.color === 'purple'
                        ? 'bg-purple-500'
                        : item.color === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-white/40 mt-1">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
