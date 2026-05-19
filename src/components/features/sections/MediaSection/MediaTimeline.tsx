import { useMemo } from 'react';
import { Film, Tv, Camera, Play, Users } from 'lucide-react';
import type { Media, Member } from '../../../../types/database';

interface MediaTimelineProps {
    media: Media[];
    members: Member[];
}

const TYPE_CONFIG: Record<Media['type'], { label: string; icon: typeof Film; color: string; dot: string }> = {
    documentary: { label: 'Documentary', icon: Film, color: 'text-blue-400', dot: 'bg-blue-400' },
    concert_film: { label: 'Concert Film', icon: Camera, color: 'text-purple-400', dot: 'bg-purple-400' },
    docu_series: { label: 'Docu-Series', icon: Play, color: 'text-cyan-400', dot: 'bg-cyan-400' },
    variety: { label: 'Variety', icon: Tv, color: 'text-amber-400', dot: 'bg-amber-400' },
    reality: { label: 'Reality', icon: Users, color: 'text-green-400', dot: 'bg-green-400' },
};

export default function MediaTimeline({ media, members }: MediaTimelineProps) {
    const memberMap = useMemo(
        () => new Map(members.map(m => [m.id, m])),
        [members]
    );

    const yearGroups = useMemo(() => {
        const sorted = [...media].sort((a, b) => {
            const da = a.release_date || '';
            const db = b.release_date || '';
            return da.localeCompare(db);
        });

        const groups: { year: string; items: Media[] }[] = [];
        let currentYear = '';

        for (const item of sorted) {
            const year = item.release_date?.slice(0, 4) || 'Unknown';
            if (year !== currentYear) {
                currentYear = year;
                groups.push({ year, items: [] });
            }
            groups[groups.length - 1].items.push(item);
        }

        return groups;
    }, [media]);

    if (media.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Film size={32} className="text-white/20 mb-3" />
                <p className="text-sm text-white/50">No media found</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-px bg-white/[0.08]" />

            <div className="space-y-8">
                {yearGroups.map((group) => (
                    <div key={group.year}>
                        {/* Year marker */}
                        <div className="relative flex items-center gap-4 mb-4">
                            <div className="w-12 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center z-10">
                                <span className="text-xs font-bold text-purple-300 font-mono">{group.year}</span>
                            </div>
                        </div>

                        {/* Items for this year */}
                        <div className="space-y-3 ml-1">
                            {group.items.map((item) => {
                                const config = TYPE_CONFIG[item.type];
                                const Icon = config.icon;
                                const month = item.release_date
                                    ? new Date(item.release_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : null;
                                const memberNames = item.member_ids
                                    ?.map(id => memberMap.get(id))
                                    .filter(Boolean);

                                return (
                                    <div key={item.id} className="relative flex items-start gap-4 group">
                                        {/* Timeline dot */}
                                        <div className="relative flex-shrink-0 w-[46px] flex justify-center pt-2.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${config.dot} ring-2 ring-[#111118] z-10 group-hover:scale-125 transition-transform`} />
                                        </div>

                                        {/* Card */}
                                        <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Icon size={14} className={config.color} />
                                                        <span className={`text-xs font-medium ${config.color} opacity-80`}>{config.label}</span>
                                                        {item.platform && (
                                                            <>
                                                                <span className="text-white/15">·</span>
                                                                <span className="text-xs text-white/30">{item.platform}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{item.title}</h3>
                                                    {item.description && (
                                                        <p className="text-xs text-white/40 mt-1 line-clamp-1">{item.description}</p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                    {month && (
                                                        <span className="text-[11px] text-white/40 font-mono">{month}</span>
                                                    )}
                                                    <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                                                        {item.seasons > 1 && <span>{item.seasons} seasons</span>}
                                                        {item.episodes && <span>{item.episodes} eps</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {memberNames && memberNames.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                                                    {memberNames.map(member => member && (
                                                        <span
                                                            key={member.id}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                                                            style={{
                                                                color: member.color || '#a855f7',
                                                                backgroundColor: `${member.color || '#a855f7'}15`,
                                                                borderColor: `${member.color || '#a855f7'}30`,
                                                                borderWidth: 1,
                                                            }}
                                                        >
                                                            {member.stage_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
