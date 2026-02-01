import React, { useState } from 'react';

export const ShootingStar: React.FC = () => {
    const [style] = useState(() => ({
        top: `${Math.random() * 50}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`,
        duration: `${2 + Math.random() * 3}s`
    }));

    return (
        <div
            className="absolute w-[2px] h-[2px] bg-white rounded-full animate-[shooting-star_linear_infinite]"
            style={{
                top: style.top,
                left: style.left,
                animationDelay: style.delay,
                animationDuration: style.duration,
                boxShadow: '0 0 10px 2px white'
            }}
        >
            <div className="absolute top-1/2 left-0 w-[150px] h-[1px] bg-gradient-to-r from-white to-transparent -translate-y-1/2 rotate-[-45deg] origin-left opacity-40" />
        </div>
    );
};

export default ShootingStar;
