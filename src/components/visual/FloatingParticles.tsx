import React, { useState } from 'react';
import { generateFloatingParticles } from '../../utils/helpers';

export const FloatingParticles: React.FC = () => {
    const [particles] = useState(() => generateFloatingParticles(15));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-white/20 animate-[float-particle_infinite_ease-in-out]"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingParticles;
