import { useMemo } from 'react';
import { Film, Tv, Camera, Play, Users } from 'lucide-react';
import type { Media, Member } from '../../../../types/database';

interface MediaGridProps {
    media: Media[];
    members: Member[];
}

const TYPE_CONFIG: Record<Media['type'], { label: string; icon: typeof Film; color: string }> = {
    documentary: { label: 'Documentary', icon: Film, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    concert_film: { label: 'Concert Film', icon: Camera, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    docu_series: { label: 'Docu-Series', icon: Play, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    variety: { label: 'Variety', icon: Tv, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    reality: { label: 'Reality', icon: Users, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

export default function MediaGrid({ media, members }: MediaGridProps) {
    const memberMap = useMemo(
        () => new Map(members.map(m => [m.id, m])),
        [members]
    );

    const sorted = useMemo(
        () => [...media].sort((a, b) => {
            const da = a.release_date || '';
            const db = b.release_date || '';
            return db.localeCompare(da);
        }),
        [media]
    );

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Film size={32} className="text-white/20 mb-3" />
                <p className="text-sm text-white/50">No media found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config.icon;
                const year = item.release_date?.slice(0, 4);
                const memberNames = item.member_ids
                    ?.map(id => memberMap.get(id)?.stage_name)
                    .filter(Boolean);

                return (
                    <div
                        key={item.id}
                        className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-5 hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.color}`}>
                                <Icon size={12} />
                                {config.label}
                            </span>
                            {year && <span className="text-xs text-white/40 font-mono">{year}</span>}
                        </div>

                        <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{item.title}</h3>

                        {item.description && (
                            <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-white/30">
                            {item.platform && <span>{item.platform}</span>}
                            <div className="flex items-center gap-2">
                                {item.seasons > 1 && <span>{item.seasons} seasons</span>}
                                {item.episodes && <span>{item.episodes} eps</span>}
                            </div>
                        </div>

                        {memberNames && memberNames.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                                {item.member_ids?.map(id => {
                                    const member = memberMap.get(id);
                                    if (!member) return null;
                                    return (
                                        <span
                                            key={id}
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
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
