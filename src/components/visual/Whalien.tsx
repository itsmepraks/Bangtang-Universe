import React from 'react';

export const Whalien: React.FC = () => (
    <div className="absolute w-[600px] h-[300px] opacity-40 animate-[float_80s_linear_infinite] pointer-events-none mix-blend-screen" style={{ top: '15%', left: '-30%' }}>
        <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* The "Whalien" Constellation Lines */}
            <path
                d="M40,100 L100,60 L180,50 L280,70 L360,100 L320,140 L240,150 L140,140 L40,100 M100,60 L140,90 L240,100 L320,140 M180,50 L200,80 L240,100"
                fill="none"
                stroke="#A855F7"
                strokeWidth="0.8"
                strokeDasharray="1000"
                className="animate-[draw-line_15s_ease-out_infinite_alternate] opacity-60"
            />
            {/* Constellation Stars (Nodes) */}
            {[
                [40, 100], [100, 60], [180, 50], [280, 70], [360, 100],
                [320, 140], [240, 150], [140, 140], [140, 90], [240, 100], [200, 80]
            ].map(([x, y], idx) => (
                <circle
                    key={idx}
                    cx={x} cy={y} r="1.5"
                    fill="white"
                    className="animate-pulse shadow-[0_0_10px_white]"
                    style={{ animationDelay: `${idx * 0.3}s` }}
                />
            ))}
            {/* Soft body glow */}
            <path
                d="M40,100 Q100,40 200,50 T360,100 Q300,160 200,150 T40,100"
                fill="url(#whaleGradient)"
                className="opacity-20 blur-xl"
            />
            <defs>
                <radialGradient id="whaleGradient">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
        </svg>
    </div>
);

export default Whalien;
