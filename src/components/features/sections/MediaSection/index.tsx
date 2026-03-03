import { useState, Suspense, lazy } from 'react';
import { Film, Tv, User, LayoutGrid } from 'lucide-react';
import type { Media, Member } from '../../../../types/database';
import SectionIntro from '../../../ui/SectionIntro';

const MediaGrid = lazy(() => import('./MediaGrid'));
const MediaTimeline = lazy(() => import('./MediaTimeline'));
const MediaStats = lazy(() => import('./MediaStats'));

interface MediaSectionProps {
    media: Media[];
    members: Member[];
}

const TABS = [
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'documentaries', label: 'Documentaries', icon: Film },
    { id: 'variety', label: 'Variety & Reality', icon: Tv },
    { id: 'solo', label: 'Solo', icon: User },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MediaSection({ media, members }: MediaSectionProps) {
    const [activeTab, setActiveTab] = useState<TabId>('all');

    const filteredMedia = (() => {
        switch (activeTab) {
            case 'documentaries':
                return media.filter(m => m.type === 'documentary' || m.type === 'concert_film' || m.type === 'docu_series');
            case 'variety':
                return media.filter(m => m.type === 'variety' || m.type === 'reality');
            case 'solo':
                return media.filter(m => m.scope === 'solo' || m.scope === 'unit');
            default:
                return media;
        }
    })();

    return (
        <div className="space-y-6">
            <SectionIntro description="Documentaries, concert films, variety shows, and solo projects — the visual story of BTS beyond music." />

            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2" role="tablist" aria-label="Media views">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-purple-500/10 text-white border border-purple-500/30'
                                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                                }`}
                            >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}

                    {/* Stats button on far right */}
                    <div className="ml-auto">
                        <MediaStats media={media} />
                    </div>
                </div>
            </div>

            <div className="bg-[#111118] rounded-2xl border border-white/[0.06] p-6" role="tabpanel">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        </div>
                    }
                >
                    {activeTab === 'all' ? (
                        <MediaTimeline media={filteredMedia} members={members} />
                    ) : (
                        <MediaGrid media={filteredMedia} members={members} />
                    )}
                </Suspense>
            </div>
        </div>
    );
}
