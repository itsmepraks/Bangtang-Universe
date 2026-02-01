import React, { useState } from 'react';
import { generateStars } from '../../utils/helpers';
import { MEMBER_DATA } from '../../data/members';
import { ShootingStar, PurpleOcean, Whalien } from '../visual';

export interface UniverseProps {
    mode: 'landing' | 'warp' | 'dashboard';
}

export const Universe3D: React.FC<UniverseProps> = ({ mode }) => {
    const [stars] = useState(() => generateStars(800));

    return (
        <div className="absolute inset-0 bg-[#020005] overflow-hidden perspective-[1200px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.4),_rgba(0,0,0,1)_95%)]" />

            {/* DEEP COSMIC NEBULAS */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_20%_30%,_#4c1d95_0%,_transparent_60%)] animate-[nebula-pulse_30s_infinite_alternate]" />
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_80%_70%,_#1e1b4b_0%,_transparent_60%)] animate-[nebula-pulse_35s_infinite_alternate_reverse]" />
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.1)_0%,_transparent_50%)] animate-[galaxy-spin_120s_infinite_linear]" />
            </div>

            {/* SHOOTING STARS */}
            <ShootingStar />
            <ShootingStar />
            <ShootingStar />

            <div className="mist-layer opacity-20" />
            <div className="mist-layer opacity-15 blur-[180px]" style={{ animationDelay: '-45s' }} />

            {/* THE PURPLE OCEAN (Bokeh Layer) */}
            <PurpleOcean />

            {/* The Space Whale Swimming in Background */}
            <Whalien />

            <div
                className={`absolute inset-0 flex items-center justify-center transform-style-3d transition-all duration-[2500ms] cubic-bezier(0.4, 0, 0.2, 1)
          ${mode === 'warp' ? 'scale-[8] translate-z-[2000px] blur-sm opacity-50' : mode === 'dashboard' ? 'scale-[0.95] rotate-x-5' : 'scale-100'}
        `}
            >
                <div className={`relative w-[1200px] h-[1200px] transform-style-3d ${mode === 'landing' ? 'animate-[spin_100s_linear_infinite]' : 'animate-[spin_300s_linear_infinite]'}`}>

                    {/* THE 7 MEMBERS (Central Constellation) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
                        {MEMBER_DATA.map((m, i) => {
                            const angle = (i / 7) * Math.PI * 2;
                            const dist = mode === 'dashboard' ? 180 : 100;
                            const x = Math.cos(angle) * dist;
                            const y = Math.sin(angle) * dist;
                            return (
                                <div
                                    key={m.id}
                                    className="absolute flex items-center justify-center transition-all duration-1000"
                                    style={{ transform: `translate(${x}px, ${y}px) rotate(${-angle}rad)` }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full shadow-[0_0_40px_currentColor] animate-pulse"
                                        style={{ backgroundColor: m.color, color: m.color }}
                                    />
                                </div>
                            )
                        })}
                        <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_100px_white]" />
                    </div>

                    {/* THE ARMY (Purple Ocean) */}
                    {stars.map((s, i) => {
                        const x = s.r * Math.sin(s.phi) * Math.cos(s.theta);
                        const y = s.r * Math.sin(s.phi) * Math.sin(s.theta);
                        const z = s.r * Math.cos(s.phi);
                        return (
                            <div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                                    width: `${s.size}px`,
                                    height: `${s.size}px`,
                                    backgroundColor: s.color,
                                    boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                                    opacity: 0.8,
                                    animation: `twinkle 4s infinite ${s.delay}s`
                                }}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Universe3D;
