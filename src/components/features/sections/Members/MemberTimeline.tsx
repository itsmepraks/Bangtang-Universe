import { useMemo } from 'react';
import { Calendar, Star, Shield, Music, Award } from 'lucide-react';
import type { MemberEvent } from '../../../../types/database';
import { BORAHAE_COLORS } from '../../../../constants/colors';

interface MemberTimelineProps {
    events: MemberEvent[];
}

const EVENT_STYLES: Record<string, { color: string; icon: typeof Star }> = {
    enlistment_start: { color: '#6B7280', icon: Shield },
    enlistment_end: { color: '#10B981', icon: Shield },
    solo_debut: { color: BORAHAE_COLORS.PRIMARY, icon: Music },
    milestone: { color: '#FBBF24', icon: Star },
    variety_show: { color: '#3B82F6', icon: Star },
    ambassador: { color: '#EC4899', icon: Award },
};

export default function MemberTimeline({ events }: MemberTimelineProps) {
    const sorted = useMemo(
        () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
        [events]
    );

    if (events.length === 0) {
        return (
            <div className="py-8 text-center">
                <Calendar size={24} className="text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No timeline events yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {sorted.map((event, i) => {
                const style = EVENT_STYLES[event.event_type] || { color: BORAHAE_COLORS.PRIMARY, icon: Star };
                const Icon = style.icon;
                const dateStr = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                return (
                    <div key={event.id} className="flex gap-4 relative">
                        {/* Connector line */}
                        {i < sorted.length - 1 && (
                            <div className="absolute left-[19px] top-8 bottom-0 w-px bg-white/[0.06]" />
                        )}
                        {/* Dot */}
                        <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/[0.06] bg-[#111118] z-10"
                            style={{ borderColor: `${style.color}40` }}
                        >
                            <Icon size={14} style={{ color: style.color }} />
                        </div>
                        {/* Content */}
                        <div className="pb-6 flex-1">
                            <p className="text-xs text-white/40 mb-1">{dateStr}</p>
                            <p className="text-sm font-medium text-white/80">{event.title}</p>
                            {event.description && (
                                <p className="text-xs text-white/50 mt-1 leading-relaxed">{event.description}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
