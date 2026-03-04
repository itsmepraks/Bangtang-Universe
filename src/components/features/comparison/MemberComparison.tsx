import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Member, Song } from '../../../types/database';
import { CHART_STYLES } from '../../../constants/colors';

interface MemberComparisonProps {
  members: Member[];
  songs: Song[];
}

export default function MemberComparison({ members, songs }: MemberComparisonProps) {
  const [memberAId, setMemberAId] = useState<string>('');
  const [memberBId, setMemberBId] = useState<string>('');

  const memberA = useMemo(() => members.find(m => m.id === memberAId) || null, [members, memberAId]);
  const memberB = useMemo(() => members.find(m => m.id === memberBId) || null, [members, memberBId]);

  const getSongCount = (member: Member) => {
    const name = member.stage_name.toLowerCase();
    return songs.filter(s =>
      (s.member_credits || []).some(c => c.toLowerCase().includes(name)) ||
      (s.writers || []).some(w => w.toLowerCase().includes(name))
    ).length;
  };

  const chartData = useMemo(() => {
    if (!memberA || !memberB) return [];
    return [
      { stat: 'KOMCA', [memberA.stage_name]: memberA.komca_credits || 0, [memberB.stage_name]: memberB.komca_credits || 0 },
      { stat: 'Writer', [memberA.stage_name]: memberA.writer_credits || 0, [memberB.stage_name]: memberB.writer_credits || 0 },
      { stat: 'Producer', [memberA.stage_name]: memberA.producer_credits || 0, [memberB.stage_name]: memberB.producer_credits || 0 },
      { stat: 'Songs', [memberA.stage_name]: getSongCount(memberA), [memberB.stage_name]: getSongCount(memberB) },
    ];
  }, [memberA, memberB, songs]);

  const tableRows = useMemo(() => {
    if (!memberA || !memberB) return [];
    return [
      { label: 'Role', a: memberA.role || '—', b: memberB.role || '—' },
      { label: 'Birth Date', a: memberA.birth_date || '—', b: memberB.birth_date || '—' },
      { label: 'MBTI', a: memberA.mbti || '—', b: memberB.mbti || '—' },
      { label: 'Zodiac', a: memberA.zodiac || '—', b: memberB.zodiac || '—' },
      { label: 'Height', a: memberA.height || '—', b: memberB.height || '—' },
      { label: 'KOMCA Credits', a: String(memberA.komca_credits || 0), b: String(memberB.komca_credits || 0) },
      { label: 'Writer Credits', a: String(memberA.writer_credits || 0), b: String(memberB.writer_credits || 0) },
      { label: 'Producer Credits', a: String(memberA.producer_credits || 0), b: String(memberB.producer_credits || 0) },
    ];
  }, [memberA, memberB]);

  return (
    <div className="space-y-6">
      {/* Member Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide block mb-2">Member A</label>
          <select
            value={memberAId}
            onChange={(e) => setMemberAId(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none focus:border-purple-500/30"
          >
            <option value="">Select a member...</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.stage_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wide block mb-2">Member B</label>
          <select
            value={memberBId}
            onChange={(e) => setMemberBId(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 outline-none focus:border-purple-500/30"
          >
            <option value="">Select a member...</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.stage_name}</option>
            ))}
          </select>
        </div>
      </div>

      {memberA && memberB && (
        <>
          {/* Bar Chart Comparison */}
          <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid {...CHART_STYLES.GRID} />
                <XAxis dataKey="stat" tick={CHART_STYLES.AXIS} />
                <YAxis tick={CHART_STYLES.AXIS} />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
                <Bar dataKey={memberA.stage_name} fill={memberA.color || '#A855F7'} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                <Bar dataKey={memberB.stage_name} fill={memberB.color || '#818CF8'} fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Table */}
          <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wide py-3 px-3 sm:px-4">Stat</th>
                  <th className="text-center text-xs font-medium uppercase tracking-wide py-3 px-3 sm:px-4" style={{ color: memberA.color || '#A855F7' }}>{memberA.stage_name}</th>
                  <th className="text-center text-xs font-medium uppercase tracking-wide py-3 px-3 sm:px-4" style={{ color: memberB.color || '#818CF8' }}>{memberB.stage_name}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(row => (
                  <tr key={row.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="text-sm text-white/50 py-3 px-3 sm:px-4">{row.label}</td>
                    <td className="text-sm text-white/70 text-center py-3 px-3 sm:px-4">{row.a}</td>
                    <td className="text-sm text-white/70 text-center py-3 px-3 sm:px-4">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
