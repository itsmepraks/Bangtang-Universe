import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { MEMBER_DATA } from '../../data/members';
import { BTSLogo } from '../visual';

export interface LandingRitualProps {
    onSync: () => void;
}

export const LandingRitual: React.FC<LandingRitualProps> = ({ onSync }) => {
    // Generate ARMY bomb positions - MASSIVE 180-DEGREE SURROUNDING EFFECT
    const armyBombs = useMemo(() => {
        const bombs: { x: number; y: number; z: number; size: number; color: string; delay: number; brightness: number }[] = [];

        // ARMY BOMB PURPLE PALETTE - vibrant purples with occasional white
        const colors = [
            '#A855F7', '#9333EA', '#7C3AED', '#8B5CF6', '#C084FC', '#B47EE5', // Core purples
            '#D8B4FE', '#E9D5FF', '#F3E8FF', // Light purples
            '#FFFFFF', '#F5F3FF', // White accents
        ];

        const getColor = () => {
            const rand = Math.random();
            if (rand < 0.88) return colors[Math.floor(Math.random() * 9)];
            return colors[9 + Math.floor(Math.random() * 2)];
        };

        // === 180-DEGREE SEMICIRCLE AROUND THE STAGE ===
        const numArcs = 20;

        for (let arc = 0; arc < numArcs; arc++) {
            const radiusPercent = 15 + arc * 4;
            const baseY = 35 - arc * 1.5;
            const pointsInArc = 35 + arc * 5;

            for (let p = 0; p < pointsInArc; p++) {
                const angle = (p / (pointsInArc - 1)) * Math.PI;
                const x = 50 + radiusPercent * Math.cos(angle);
                const y = baseY + radiusPercent * 0.4 * Math.sin(angle);
                const perspectiveScale = 0.4 + (1 - arc / numArcs) * 0.6;

                bombs.push({
                    x: x + (Math.random() - 0.5) * 4,
                    y: Math.max(3, y + (Math.random() - 0.5) * 3),
                    z: 100 - arc * 3 + Math.random() * 10,
                    size: (2 + Math.random() * 3) * perspectiveScale,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.5 + Math.random() * 0.5,
                });
            }
        }

        // === LEFT STADIUM WALL ===
        for (let row = 0; row < 12; row++) {
            const rowY = 10 + row * 5;
            const bombsInRow = 10 + row * 2;
            for (let i = 0; i < bombsInRow; i++) {
                bombs.push({
                    x: 2 + i * 1.2 + Math.pow(row / 12, 1.5) * 10,
                    y: rowY + (Math.random() - 0.5) * 2,
                    z: 50 + Math.random() * 30,
                    size: 2.5 + Math.random() * 3,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.55 + Math.random() * 0.4,
                });
            }
        }

        // === RIGHT STADIUM WALL ===
        for (let row = 0; row < 12; row++) {
            const rowY = 10 + row * 5;
            const bombsInRow = 10 + row * 2;
            for (let i = 0; i < bombsInRow; i++) {
                bombs.push({
                    x: 98 - i * 1.2 - Math.pow(row / 12, 1.5) * 10,
                    y: rowY + (Math.random() - 0.5) * 2,
                    z: 50 + Math.random() * 30,
                    size: 2.5 + Math.random() * 3,
                    color: getColor(),
                    delay: Math.random() * 5,
                    brightness: 0.55 + Math.random() * 0.4,
                });
            }
        }

        // === BOTTOM CROWD (closest to camera) ===
        for (let row = 0; row < 10; row++) {
            const rowY = 72 + row * 2.5;
            const bombsInRow = 80 - row * 6;
            const rowWidth = 95 - row * 7;

            for (let i = 0; i < bombsInRow; i++) {
                const xPercent = (50 - rowWidth / 2) + (i / (bombsInRow - 1)) * rowWidth;
                bombs.push({
                    x: xPercent + (Math.random() - 0.5) * 2,
                    y: rowY + (Math.random() - 0.5) * 1,
                    z: 10 + row * 5 + Math.random() * 5,
                    size: 5 + Math.random() * 4 - row * 0.2,
                    color: getColor(),
                    delay: Math.random() * 3,
                    brightness: 0.8 + Math.random() * 0.2,
                });
            }
        }

        return bombs;
    }, []);

    // Enhanced UNIVERSE/GALAXY stars for cosmic backdrop
    const universeStars = useMemo(() => {
        const stars: { x: number; y: number; size: number; delay: number; duration: number; type: 'star' | 'galaxy' | 'nebula' }[] = [];

        // Regular stars
        for (let i = 0; i < 80; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 0.5 + Math.random() * 1.5,
                delay: Math.random() * 5,
                duration: 3 + Math.random() * 4,
                type: 'star'
            });
        }

        // Distant galaxies (larger, dimmer, slower)
        for (let i = 0; i < 8; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 50, // Upper half only
                size: 3 + Math.random() * 4,
                delay: Math.random() * 8,
                duration: 8 + Math.random() * 6,
                type: 'galaxy'
            });
        }

        // Small purple nebula spots
        for (let i = 0; i < 5; i++) {
            stars.push({
                x: Math.random() * 100,
                y: Math.random() * 60,
                size: 15 + Math.random() * 20,
                delay: Math.random() * 10,
                duration: 15 + Math.random() * 10,
                type: 'nebula'
            });
        }

        return stars;
    }, []);

    // Member silhouette colors
    const brightColors = [
        '#3B82F6', // RM - Bright Blue
        '#EC4899', // Jin - Hot Pink
        '#94A3B8', // Suga - Silver Gray
        '#FFFFFF', // J-Hope - White (center)
        '#F59E0B', // Jimin - Orange/Amber
        '#10B981', // V - Emerald Green
        '#8B5CF6', // JK - Purple
    ];

    const bodyHeights = [120, 135, 110, 150, 130, 115, 140];

    return (
        <div className="absolute inset-0 z-50 flex flex-col overflow-hidden select-none bg-gradient-to-b from-[#050010] via-[#0a0018] to-[#080012]">

            {/* UNIVERSE LAYER: Stars, Galaxies, and Nebulae */}
            <div className="absolute inset-0 pointer-events-none">
                {universeStars.map((star, i) => {
                    if (star.type === 'nebula') {
                        return (
                            <div
                                key={`nebula-${i}`}
                                className="absolute rounded-full"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    width: `${star.size}px`,
                                    height: `${star.size}px`,
                                    background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
                                    filter: 'blur(8px)',
                                    opacity: 0.6,
                                    animation: `nebula-breathe ${star.duration}s ease-in-out infinite`,
                                    animationDelay: `${star.delay}s`,
                                }}
                            />
                        );
                    }
                    if (star.type === 'galaxy') {
                        return (
                            <div
                                key={`galaxy-${i}`}
                                className="absolute"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    width: `${star.size}px`,
                                    height: `${star.size * 0.4}px`,
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(200,180,255,0.3) 30%, rgba(255,255,255,0.5) 50%, rgba(200,180,255,0.3) 70%, transparent 100%)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    opacity: 0.4,
                                    transform: `rotate(${Math.random() * 60 - 30}deg)`,
                                    animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
                                    animationDelay: `${star.delay}s`,
                                }}
                            />
                        );
                    }
                    // Regular star
                    return (
                        <div
                            key={`star-${i}`}
                            className="absolute rounded-full bg-white"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                opacity: 0.4 + Math.random() * 0.4,
                                boxShadow: '0 0 2px rgba(255,255,255,0.8)',
                                animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    );
                })}
            </div>

            {/* NEBULA LAYER: Cosmic purple glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-purple-600/10 blur-[150px]"
                    style={{ animation: 'nebula-breathe 25s ease-in-out infinite' }}
                />
                <div
                    className="absolute top-[60%] left-[30%] w-[400px] h-[300px] rounded-full bg-violet-500/8 blur-[120px]"
                    style={{ animation: 'nebula-breathe 30s ease-in-out infinite', animationDelay: '-10s' }}
                />
                <div
                    className="absolute bottom-[10%] right-[20%] w-[500px] h-[300px] rounded-full bg-purple-700/10 blur-[130px]"
                    style={{ animation: 'nebula-breathe 28s ease-in-out infinite', animationDelay: '-18s' }}
                />
            </div>

            {/* Upper darkness gradient (stadium ceiling) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black to-transparent" />
            </div>

            {/* ARMY Bomb Ocean - Purple Universe Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {armyBombs.map((bomb, i) => (
                    <div
                        key={`bomb-${i}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${bomb.x}%`,
                            top: `${bomb.y}%`,
                            width: `${bomb.size}px`,
                            height: `${bomb.size}px`,
                            backgroundColor: bomb.color,
                            opacity: bomb.brightness,
                            boxShadow: `0 0 ${bomb.size}px ${bomb.color}, 0 0 ${bomb.size * 2.5}px ${bomb.color}90, 0 0 ${bomb.size * 5}px ${bomb.color}40`,
                            animation: `star-twinkle ${2.5 + Math.random() * 2.5}s ease-in-out infinite`,
                            animationDelay: `${bomb.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Stage Spotlights */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-full h-[50%]">
                    {/* Central white beam */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[90%] opacity-15"
                        style={{
                            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 70%)',
                            filter: 'blur(25px)',
                        }}
                    />
                    {/* Side beams */}
                    {[-35, -20, -8, 8, 20, 35].map((angle, i) => (
                        <div
                            key={`beam-${i}`}
                            className="absolute bottom-0 left-1/2 w-3 h-[80%] opacity-8"
                            style={{
                                background: 'linear-gradient(to top, rgba(168,85,247,0.5) 0%, transparent 65%)',
                                filter: 'blur(12px)',
                                transform: `translateX(-50%) rotate(${angle}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* STADIUM SPOTLIGHT SYSTEM */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* TOP LIGHTING RIG */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%]">
                    <div className="absolute top-[1%] left-1/2 -translate-x-1/2 w-[90%] h-[2px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((offset, idx) => (
                        <div
                            key={`top-beam-${idx}`}
                            className="absolute top-0"
                            style={{
                                left: `calc(50% + ${offset * 1.8}%)`,
                                width: offset === 0 ? '8px' : '3px',
                                height: '100%',
                                background: offset === 0
                                    ? `linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 15%, rgba(200,200,255,0.3) 45%, transparent 75%)`
                                    : `linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(200,200,255,0.3) 15%, rgba(168,85,247,0.15) 40%, transparent 70%)`,
                                transform: `rotate(${offset * 0.25}deg)`,
                                transformOrigin: 'top center',
                                filter: offset === 0 ? 'blur(5px)' : 'blur(2px)',
                                opacity: offset === 0 ? 0.9 : 0.6,
                            }}
                        />
                    ))}
                </div>

                {/* LEFT SIDE SPOTLIGHTS */}
                <div className="absolute top-[10%] left-0 w-[50%] h-[60%]">
                    {[15, 25, 35].map((angle, idx) => (
                        <div
                            key={`left-beam-${idx}`}
                            className="absolute"
                            style={{
                                top: `${10 + idx * 15}%`,
                                left: '0',
                                width: '120%',
                                height: '4px',
                                background: 'linear-gradient(to right, rgba(168,85,247,0.4) 0%, rgba(200,200,255,0.2) 40%, transparent 80%)',
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: 'left center',
                                filter: 'blur(4px)',
                                opacity: 0.5,
                            }}
                        />
                    ))}
                </div>

                {/* RIGHT SIDE SPOTLIGHTS */}
                <div className="absolute top-[10%] right-0 w-[50%] h-[60%]">
                    {[-15, -25, -35].map((angle, idx) => (
                        <div
                            key={`right-beam-${idx}`}
                            className="absolute"
                            style={{
                                top: `${10 + idx * 15}%`,
                                right: '0',
                                width: '120%',
                                height: '4px',
                                background: 'linear-gradient(to left, rgba(168,85,247,0.4) 0%, rgba(200,200,255,0.2) 40%, transparent 80%)',
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: 'right center',
                                filter: 'blur(4px)',
                                opacity: 0.5,
                            }}
                        />
                    ))}
                </div>

                {/* STAGE FOCUS */}
                <div
                    className="absolute top-[35%] left-1/2 -translate-x-1/2"
                    style={{
                        width: '700px',
                        height: '300px',
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, rgba(200,200,255,0.1) 30%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Atmospheric haze */}
                <div
                    className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: '800px',
                        height: '250px',
                        background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 60%)',
                        filter: 'blur(50px)',
                    }}
                />
            </div>

            {/* Stage Platform Glow */}
            <div className="absolute top-[62%] left-1/2 -translate-x-1/2 pointer-events-none">
                <div
                    className="w-[900px] h-10 rounded-full opacity-80"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.5) 20%, rgba(255,255,255,0.35) 50%, rgba(168,85,247,0.5) 80%, transparent 100%)',
                        filter: 'blur(15px)',
                    }}
                />
                <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-[700px] h-3 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        filter: 'blur(4px)',
                    }}
                />
            </div>

            {/* Floor Reflection Grid */}
            <div className="absolute top-[60%] left-0 right-0 h-[15%] pointer-events-none overflow-hidden opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(168,85,247,0.1) 30px, rgba(168,85,247,0.1) 31px)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
                    }}
                />
            </div>

            {/* 7 Member Silhouettes */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 flex items-end justify-center gap-3 sm:gap-5 md:gap-8 pointer-events-none z-10">
                {MEMBER_DATA.map((member, i) => {
                    const headSize = i === 3 ? 26 : 22;
                    const bodyWidth = i === 3 ? 22 : 18;
                    const solidColor = brightColors[i];

                    return (
                        <div key={member.id} className="relative flex flex-col items-center">
                            {/* Outer glow effect */}
                            <div
                                className="absolute"
                                style={{
                                    width: '70px',
                                    height: `${bodyHeights[i] + headSize + 60}px`,
                                    top: '-20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: `radial-gradient(ellipse at center, ${solidColor}60 0%, ${solidColor}30 40%, transparent 70%)`,
                                    filter: 'blur(18px)',
                                }}
                            />

                            {/* HEAD */}
                            <div
                                className="relative z-10"
                                style={{
                                    width: `${headSize}px`,
                                    height: `${headSize}px`,
                                    backgroundColor: solidColor,
                                    borderRadius: '50%',
                                    boxShadow: `
                    0 0 10px ${solidColor},
                    0 0 20px ${solidColor}cc,
                    0 0 40px ${solidColor}80,
                    0 0 60px ${solidColor}50
                  `,
                                    marginBottom: '4px',
                                }}
                            />

                            {/* BODY */}
                            <div
                                className="relative z-10"
                                style={{
                                    width: `${bodyWidth}px`,
                                    height: `${bodyHeights[i]}px`,
                                    backgroundColor: solidColor,
                                    borderRadius: '50px',
                                    boxShadow: `
                    0 0 10px ${solidColor},
                    0 0 25px ${solidColor}cc,
                    0 0 50px ${solidColor}80,
                    0 0 80px ${solidColor}50,
                    0 0 120px ${solidColor}30
                  `,
                                }}
                            />

                            {/* Name below */}
                            <span
                                className="mt-4 text-[9px] sm:text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap relative z-10"
                                style={{
                                    color: solidColor,
                                    textShadow: `0 0 8px ${solidColor}, 0 0 15px ${solidColor}cc`,
                                }}
                            >
                                {member.name}
                            </span>
                        </div>
                    );
                })}
            </div>


            {/* TITLE - At top */}
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="text-center animate-in fade-in slide-in-from-top-8 duration-1000">
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-[0.1em] uppercase"
                        style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                            textShadow: '0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(168,85,247,0.3), 0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        Bangtan Universe
                    </h1>
                </div>
            </div>

            {/* ENTER THE UNIVERSE */}
            <div className="absolute top-[76%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
                {/* BTS Logo - Primary CTA */}
                <button
                    onClick={onSync}
                    className="relative w-16 h-16 flex items-center justify-center transition-all duration-700 cursor-pointer outline-none focus:outline-none select-none hover:scale-110 active:scale-95 group animate-in fade-in zoom-in-95 duration-1000"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="absolute inset-0 rounded-full bg-purple-500/25 blur-[18px] group-hover:bg-purple-400/45 transition-all duration-500" />
                    <div className="relative z-10 animate-[logo-glow_4s_infinite] group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] transition-all duration-500">
                        <BTSLogo className="w-10 h-10 text-white" />
                    </div>
                </button>

                {/* Enter The Universe */}
                <button
                    onClick={onSync}
                    className="flex items-center group cursor-pointer hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                >
                    <span
                        className="text-xs text-white/70 tracking-[0.3em] font-medium uppercase group-hover:text-white group-hover:tracking-[0.4em] transition-all duration-500"
                        style={{ textShadow: '0 0 15px rgba(168,85,247,0.4)' }}
                    >
                        Enter The Universe
                    </span>
                </button>

                <ChevronRight size={14} className="text-purple-400/50 animate-pulse rotate-90" />
            </div>

            {/* Bottom subtle vignette */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default LandingRitual;
