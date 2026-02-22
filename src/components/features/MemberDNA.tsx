import React from 'react';
import { ChevronLeft, PenTool, Disc, Award } from 'lucide-react';
import { useMemberById } from '../../hooks';
import { BTSLogo } from '../visual';

export interface MemberDNAProps {
    memberId: string;
    onClose: () => void;
}

export const MemberDNA: React.FC<MemberDNAProps> = ({ memberId, onClose }) => {
    const { member, loading } = useMemberById(memberId);

    if (loading) return (
        <div className="absolute inset-0 z-[100] bg-[#020005]/85 backdrop-blur-[80px] flex items-center justify-center">
            <div className="text-white/50 text-lg tracking-wide uppercase animate-pulse">Loading...</div>
        </div>
    );

    if (!member) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-[#020005]/85 backdrop-blur-[80px] animate-in fade-in duration-700 flex flex-col overflow-hidden">
            {/* Dynamic Member Aura */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-40 blur-[180px]"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${member.color} 0%, transparent 50%)` }} />
                <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] opacity-30 blur-[180px]"
                    style={{ background: `radial-gradient(circle at 70% 70%, ${member.color} 0%, transparent 50%)` }} />
            </div>

            {/* Top Bar */}
            <div
                className="h-20 flex items-center justify-between px-16 border-b border-white/[0.06] relative z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)' }}
            >
                <div className="flex items-center gap-8">
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:scale-105 group border border-white/[0.06] hover:border-white/20">
                        <ChevronLeft size={24} className="text-white group-hover:text-purple-300 transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-wide text-white/95">
                            Artist Profile
                        </h1>
                        <div className="text-xs text-white/50 mt-1">Subject: {member.stage_name}</div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <span
                        className="px-5 py-2 rounded-full border text-xs font-medium tracking-wide uppercase"
                        style={{
                            borderColor: `${member.color}40`,
                            backgroundColor: `${member.color}10`,
                            color: member.color || '#fff'
                        }}
                    >
                        {member.role}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-16 overflow-y-auto pretty-scrollbar relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-16 items-start">

                    {/* Left Column: ID Card */}
                    <div className="col-span-5 space-y-12 animate-in slide-in-from-left-12 duration-1000">
                        <div className="relative aspect-[3/4.2] rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
                            <div className="absolute inset-0 bg-[#0a0a0f]" />

                            <img
                                src={member.image_url || ''}
                                alt={member.stage_name}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100 filter grayscale group-hover:grayscale-0"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.querySelector('.placeholder-fallback')?.classList.remove('hidden');
                                }}
                            />

                            <div className="placeholder-fallback hidden absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                                <BTSLogo className="w-32 h-32 text-white/5 mb-8" />
                                <span className="text-[120px] font-black text-white/5 tracking-tighter">{member.id.toUpperCase()}</span>
                            </div>

                            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 mix-blend-overlay"
                                style={{ background: `radial-gradient(circle at center, ${member.color} 0%, transparent 80%)` }} />

                            <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                <h2 className="text-6xl font-semibold text-white mb-4 tracking-tight drop-shadow-2xl">{member.stage_name}</h2>
                                <p className="text-xl font-normal tracking-wide opacity-60" style={{ color: member.color || '#fff' }}>{member.full_name}</p>
                                <div className="mt-8 flex gap-3">
                                    <div className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-medium tracking-wide text-white/50 uppercase">Mic: {member.mic_color || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[#111118] rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-700 shadow-2xl group">
                            <div className="flex items-center gap-4 mb-6" style={{ color: member.color || '#fff' }}>
                                <PenTool size={22} />
                                <span className="text-xs font-semibold tracking-wide uppercase opacity-70">KOMCA credits</span>
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="text-6xl font-semibold text-white tracking-tight">{member.komca_credits || 0}</div>
                                <div className="text-xs text-white/50 mb-3 tracking-wide uppercase">Verified Productions</div>
                            </div>
                            <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-current transition-all duration-1000 w-[70%]" style={{ backgroundColor: member.color || '#fff', width: `${((member.komca_credits || 0) / 220) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Data */}
                    <div className="col-span-7 space-y-16 animate-in slide-in-from-right-12 duration-1000">
                        {/* Bio */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Biography</h3>
                            <p className="text-2xl text-white/80 leading-[1.6] font-normal border-l-4 pl-12 transition-all duration-1000 hover:border-white/40" style={{ borderColor: member.color || '#fff' }}>
                                {member.bio}
                            </p>
                        </div>

                        {/* Solo Discography */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Solo Discography</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {(member.solo_tracks || []).map((track, i) => (
                                    <div key={track} className="p-6 bg-[#111118] rounded-2xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-700 cursor-pointer group flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Disc className="text-white/30 group-hover:text-white transition-colors" style={{ color: i === 0 ? member.color || '#fff' : '' }} size={28} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg text-white/80 group-hover:text-purple-200 transition-colors tracking-tight">{track}</div>
                                            <div className="text-xs text-white/40 mt-1 uppercase tracking-wide">Track {i + 1}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Achievements</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {(member.achievements || []).map((ach, i) => (
                                    <div key={ach}
                                        className="flex items-center gap-8 p-6 bg-gradient-to-r from-white/[0.03] to-transparent rounded-2xl border-l-4 group transition-all duration-500 hover:translate-x-2"
                                        style={{ borderColor: member.color || '#fff', animationDelay: `${i * 0.2}s` }}>
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                            <Award className="text-white/50 group-hover:text-yellow-400 transition-colors" size={20} />
                                        </div>
                                        <span className="text-base text-white/70 tracking-wide group-hover:text-white transition-colors">{ach}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
};

export default MemberDNA;
