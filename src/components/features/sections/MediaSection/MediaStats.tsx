import { useMemo } from 'react';
import { Film, Tv, Camera, Play, Users, Hash } from 'lucide-react';
import type { Media } from '../../../../types/database';

interface MediaStatsProps {
    media: Media[];
}

const TYPE_ICONS: Record<Media['type'], typeof Film> = {
    documentary: Film,
    concert_film: Camera,
    docu_series: Play,
    variety: Tv,
    reality: Users,
};

const TYPE_COLORS: Record<Media['type'], string> = {
    documentary: 'text-blue-400',
    concert_film: 'text-purple-400',
    docu_series: 'text-cyan-400',
    variety: 'text-amber-400',
    reality: 'text-green-400',
};

export default function MediaStats({ media }: MediaStatsProps) {
    const stats = useMemo(() => {
        const byType: Record<string, number> = {};
        let totalEpisodes = 0;

        for (const item of media) {
            byType[item.type] = (byType[item.type] || 0) + 1;
            if (item.episodes) totalEpisodes += item.episodes;
        }

        return { byType, totalEpisodes, total: media.length };
    }, [media]);

    return (
        <div className="flex items-center gap-3">
            {/* Type counts as compact pills */}
            {Object.entries(stats.byType).map(([type, count]) => {
                const Icon = TYPE_ICONS[type as Media['type']];
                const color = TYPE_COLORS[type as Media['type']];
                return (
                    <div key={type} className="hidden sm:flex items-center gap-1 text-[11px]">
                        <Icon size={12} className={color} />
                        <span className="text-white/40">{count}</span>
                    </div>
                );
            })}

            {/* Total badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <Hash size={12} className="text-white/30" />
                <span className="text-xs text-white/50 font-medium">{stats.total} titles</span>
            </div>
        </div>
    );
}
