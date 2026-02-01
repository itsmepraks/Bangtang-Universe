import React, { useState } from 'react';
import { generateBokehBubbles } from '../../utils/helpers';

export const PurpleOcean: React.FC = () => {
    const [bubbles] = useState(() => generateBokehBubbles(20));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {bubbles.map((b, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-purple-600/20 blur-[80px] animate-[bokeh-float_infinite_ease-in-out]"
                    style={{
                        left: b.left,
                        top: b.top,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                        animationDelay: `${b.delay}s`,
                        animationDuration: `${b.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default PurpleOcean;
