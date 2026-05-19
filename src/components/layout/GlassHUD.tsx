import React from 'react';
import { X } from 'lucide-react';
import { BORAHAE_COLORS } from '../../constants/colors';

export interface GlassHUDProps {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
    headerAction?: React.ReactNode;
    accentColor?: string;
}

export const GlassHUD: React.FC<GlassHUDProps> = ({
    title,
    icon: Icon,
    children,
    className = "",
    onClose,
    headerAction,
    accentColor = BORAHAE_COLORS.PRIMARY
}) => (
    <div className={`relative rounded-2xl flex flex-col overflow-hidden border border-white/[0.06] bg-[#111118] ${className}`}>
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={18} style={{ color: accentColor }} />}
                <span className="text-sm font-semibold text-white/70">{title}</span>
            </div>
            <div className="flex gap-2">
                {headerAction}
                {onClose && (
                    <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-white/10 rounded-xl transition-[background-color,color] text-white/60 hover:text-white">
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
        <div className="p-6 flex-1 overflow-auto pretty-scrollbar">
            {children}
        </div>
    </div>
);

export default GlassHUD;
