import React from 'react';
import { ChevronLeft, PenTool, Disc, Award } from 'lucide-react';
import { useMemberById } from '../../hooks';
import { BTSLogo, FloatingParticles } from '../visual';

export interface MemberDNAProps {
    memberId: string;
    onClose: () => void;
}

export const MemberDNA: React.FC<MemberDNAProps> = ({ memberId, onClose }) => {
    // Fetch member from database (includes Supabase image_url)
    const { member, loading } = useMemberById(memberId);

    if (loading) return (
        <div className="absolute inset-0 z-[100] bg-[#020005]/85 backdrop-blur-[80px] flex items-center justify-center">
            <div className="text-white/50 text-lg tracking-widest uppercase animate-pulse">Loading...</div>
        </div>
    );

    if (!member) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-[#020005]/85 backdrop-blur-[80px] animate-in fade-in duration-700 flex flex-col overflow-hidden">
            {/* Dynamic Member Aura - Enhanced with stronger gradients */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-40 blur-[180px]"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${member.color} 0%, transparent 50%)` }} />
                <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] opacity-30 blur-[180px]"
                    style={{ background: `radial-gradient(circle at 70% 70%, ${member.color} 0%, transparent 50%)` }} />
                <FloatingParticles />
            </div>

            {/* Top Bar - Enhanced with gradient background */}
            <div
                className="h-28 flex items-center justify-between px-16 border-b border-white/[0.06] relative z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)' }}
            >
                <div className="flex items-center gap-8">
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:scale-105 group border border-white/[0.06] hover:border-white/20">
                        <ChevronLeft size={24} className="text-white group-hover:text-purple-300 transition-colors" />
                    </button>
                    <div>
                        <h1
                            className="text-3xl font-light tracking-[0.4em] text-white uppercase"
                            style={{ textShadow: `0 0 30px ${member.color}40, 0 4px 20px rgba(0,0,0,0.3)` }}
                        >
                            Artist Profile Archive
                        </h1>
                        <div className="text-[10px] text-white/40 font-mono tracking-[0.5em] mt-2 uppercase">Subject ID: {member.id.toUpperCase()} • Connection Stable</div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <span
                        className="px-6 py-2.5 rounded-full border text-[10px] font-bold tracking-widest uppercase"
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
                        <div className="relative aspect-[3/4.2] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
                            {/* Image Placeholder with Member Aura */}
                            <div className="absolute inset-0 bg-[#0a0a0f]" />

                            {/* Member Photo */}
                            <img
                                src={member.image_url || ''}
                                alt={member.stage_name}
                                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100 filter grayscale group-hover:grayscale-0"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'; // Hide if missing
                                    e.currentTarget.parentElement?.querySelector('.placeholder-fallback')?.classList.remove('hidden');
                                }}
                            />

                            {/* Fallback Placeholder (Hidden by default, shown via JS if image fails) */}
                            <div className="placeholder-fallback hidden absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                                <BTSLogo className="w-32 h-32 text-white/5 mb-8" />
                                <span className="text-[120px] font-black text-white/5 tracking-tighter">{member.id.toUpperCase()}</span>
                            </div>

                            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 mix-blend-overlay"
                                style={{ background: `radial-gradient(circle at center, ${member.color} 0%, transparent 80%)` }} />

                            <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                <h2 className="text-7xl font-light text-white mb-4 tracking-tighter drop-shadow-2xl">{member.stage_name}</h2>
                                <p className="text-2xl font-light tracking-[0.2em] opacity-60" style={{ color: member.color || '#fff' }}>{member.full_name}</p>
                                <div className="mt-8 flex gap-3">
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold tracking-widest text-white/40 uppercase">Mic: {member.mic_color || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-700 shadow-2xl group">
                            <div className="flex items-center gap-4 mb-6" style={{ color: member.color || '#fff' }}>
                                <PenTool size={22} className="group-hover:animate-bounce" />
                                <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-60">KOMCA Credits</span>
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="text-7xl font-light text-white tracking-tighter">{member.komca_credits || 0}</div>
                                <div className="text-[10px] text-white/30 mb-3 font-mono tracking-widest uppercase">Verified Productions</div>
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
                            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Subject Profile Analysis</h3>
                            <p className="text-3xl text-white/80 leading-[1.6] font-extralight border-l-4 pl-12 transition-all duration-1000 hover:border-white/40" style={{ borderColor: member.color || '#fff' }}>
                                {member.bio}
                            </p>
                        </div>

                        {/* Solo Discography */}
                        <div className="space-y-8">
                            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Discography Link</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {(member.solo_tracks || []).map((track, i) => (
                                    <div key={track} className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-700 cursor-pointer group flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Disc className="text-white/20 group-hover:text-white transition-colors" style={{ color: i === 0 ? member.color || '#fff' : '' }} size={28} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-white group-hover:text-purple-200 transition-colors tracking-tight">{track}</div>
                                            <div className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-mono">Archive Record 0{i + 1}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="space-y-8">
                            <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">Milestone Archive</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {(member.achievements || []).map((ach, i) => (
                                    <div key={ach}
                                        className="flex items-center gap-8 p-6 bg-gradient-to-r from-white/[0.03] to-transparent rounded-[1.5rem] border-l-4 group transition-all duration-500 hover:translate-x-2"
                                        style={{ borderColor: member.color || '#fff', animationDelay: `${i * 0.2}s` }}>
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                            <Award className="text-white/40 group-hover:text-yellow-400 transition-colors" size={20} />
                                        </div>
                                        <span className="text-lg text-white/70 font-light tracking-wide group-hover:text-white transition-colors">{ach}</span>
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
