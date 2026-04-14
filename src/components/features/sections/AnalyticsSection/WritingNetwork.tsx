import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import type { Song, Member } from '../../../../types/database';
import {
  computeWritingNetwork,
  computeMemberContributions,
} from '../../../../services/analyticsService';
import { CHART_STYLES } from '../../../../constants/colors';
import GlossaryTip from '../../../ui/GlossaryTip';

interface WritingNetworkProps {
  songs: Song[];
  members: Member[];
}

export default function WritingNetwork({ songs, members }: WritingNetworkProps) {
  const contributions = useMemo(
    () => computeMemberContributions(members, songs),
    [members, songs],
  );

  const { writers, topPairs } = useMemo(
    () => computeWritingNetwork(songs),
    [songs],
  );

  const topWriters = useMemo(() => writers.slice(0, 15), [writers]);
  const topCollaborators = useMemo(() => topPairs.slice(0, 10), [topPairs]);

  const maxWriterCount = useMemo(
    () => (topWriters.length > 0 ? topWriters[0].songCount : 1),
    [topWriters],
  );

  const maxPairCount = useMemo(
    () => (topCollaborators.length > 0 ? topCollaborators[0].coOccurrences : 1),
    [topCollaborators],
  );

  const barChartData = useMemo(
    () =>
      contributions.map((c) => ({
        name: c.stageName,
        KOMCA: c.komcaCredits,
        Writer: c.writerCredits,
        Producer: c.producerCredits,
        color: c.color,
      })),
    [contributions],
  );

  if (contributions.length === 0 && writers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm">
        No writing credit data available.
      </div>
    );
  }

  // Summary insight
  const writingSummary = useMemo(() => {
    if (contributions.length === 0) return null;
    const topMember = contributions[0];
    const topWriter = topWriters[0];
    const topPair = topCollaborators[0];
    return { topMember, topWriter, topPair, totalWriters: writers.length };
  }, [contributions, topWriters, topCollaborators, writers.length]);

  return (
    <div className="space-y-8">
      {/* 1. Member Contributions (Grouped Bar Chart) */}
      <div className="bg-[#111118] border border-dashed border-white/[0.08] rounded-xl p-4 md:p-5">
        <h3 className="text-base font-bold text-white/85 mb-2">
          Member Contributions
        </h3>
        {writingSummary && (
          <p className="text-xs text-white/40 leading-relaxed mb-4 max-w-2xl">
            {writingSummary.totalWriters} unique writers have contributed to BTS's discography.{' '}
            <span className="text-white/60 font-medium">{writingSummary.topMember.stageName}</span> leads
            with {writingSummary.topMember.komcaCredits} <GlossaryTip term="KOMCA" /> credits.
            {writingSummary.topWriter && (
              <> The most prolific writer overall is <span className="text-white/60 font-medium">{writingSummary.topWriter.name}</span> ({writingSummary.topWriter.songCount} songs).</>
            )}
            {writingSummary.topPair && (
              <> Top writing duo: {writingSummary.topPair.writerA} & {writingSummary.topPair.writerB} ({writingSummary.topPair.coOccurrences} co-writes).</>
            )}
          </p>
        )}
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barChartData}>
            <CartesianGrid {...CHART_STYLES.GRID} />
            <XAxis
              dataKey="name"
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={CHART_STYLES.AXIS}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
              labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
              cursor={CHART_STYLES.TOOLTIP.cursor}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
            />
            <Bar dataKey="KOMCA" name="KOMCA" fill="#A855F7" radius={[4, 4, 0, 0]} activeBar={CHART_STYLES.BAR_ACTIVE}>
              {barChartData.map((entry, index) => (
                <Cell key={`komca-${index}`} fill={entry.color || '#A855F7'} />
              ))}
            </Bar>
            <Bar dataKey="Writer" name="Writer" fill="#818CF8" radius={[4, 4, 0, 0]} activeBar={CHART_STYLES.BAR_ACTIVE} />
            <Bar dataKey="Producer" name="Producer" fill="#10B981" radius={[4, 4, 0, 0]} activeBar={CHART_STYLES.BAR_ACTIVE} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Top Writers (Table) */}
      <div className="bg-[#111118] border border-dashed border-white/[0.08] rounded-xl p-4 md:p-5">
        <h3 className="text-base font-bold text-white/85 mb-4">Top Songwriters</h3>
        <div className="space-y-1.5">
          {topWriters.map((writer, index) => (
            <div
              key={writer.name}
              className="flex items-center gap-3 py-1.5 even:bg-white/[0.02] px-2 rounded-lg"
            >
              <span className="text-xs text-white/40 w-6 text-right shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-white/70 flex-1 min-w-0 truncate">
                {writer.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="h-1.5 rounded-full bg-purple-500/60"
                  style={{
                    width: `${(writer.songCount / maxWriterCount) * 120}px`,
                  }}
                />
                <span className="text-xs text-white/50 w-8 text-right">
                  {writer.songCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Writing Pairs (Table) */}
      <div className="bg-[#111118] border border-dashed border-white/[0.08] rounded-xl p-4 md:p-5">
        <h3 className="text-base font-bold text-white/85 mb-4">
          Frequent Collaborators
        </h3>
        <div className="space-y-1.5">
          {topCollaborators.map((pair, index) => (
            <div
              key={`${pair.writerA}-${pair.writerB}`}
              className="flex items-center gap-3 py-1.5 even:bg-white/[0.02] px-2 rounded-lg"
            >
              <span className="text-xs text-white/40 w-6 text-right shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-white/70 flex-1 min-w-0 truncate">
                {pair.writerA} + {pair.writerB}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="h-1.5 rounded-full bg-indigo-500/60"
                  style={{
                    width: `${(pair.coOccurrences / maxPairCount) * 120}px`,
                  }}
                />
                <span className="text-xs text-white/50 w-8 text-right">
                  {pair.coOccurrences}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
