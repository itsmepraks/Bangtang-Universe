import React from 'react';

interface BTSLogoProps {
    className?: string;
}

export const BTSLogo: React.FC<BTSLogoProps> = ({ className }) => (
    <svg viewBox="0 0 50 50" className={`fill-current ${className}`}>
        <path d="M10 10 L20 5 L20 45 L10 40 Z" />
        <path d="M40 10 L30 5 L30 45 L40 40 Z" />
    </svg>
);

export default BTSLogo;
