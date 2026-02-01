import React from 'react';
import { X } from 'lucide-react';

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
    accentColor = "#A855F7"
}) => (
    <div className={`
    relative rounded-3xl flex flex-col overflow-hidden
    transition-all duration-500 group/hud
    border border-white/[0.06] hover:border-purple-500/30
    ${className}
  `}
        style={{
            '--accent-color': accentColor,
            background: 'linear-gradient(135deg, rgba(20, 10, 35, 0.5) 0%, rgba(8, 4, 15, 0.7) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255,255,255,0.03)'
        } as React.CSSProperties}>
        {/* Soft Inner Glow */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-500 group-hover/hud:opacity-[0.08]"
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 60%)` }} />
        {/* Top edge highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="px-7 py-6 border-b border-white/[0.04] bg-white/[0.015] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                {Icon && <Icon size={20} className="group-hover/hud:animate-pulse transition-colors duration-500" style={{ color: accentColor }} />}
                <span className="text-xs font-bold tracking-[0.35em] text-white/50 uppercase group-hover/hud:text-white/80 transition-colors duration-500">{title}</span>
            </div>
            <div className="flex gap-2">
                {headerAction}
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/30 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
        <div className="p-7 flex-1 overflow-auto pretty-scrollbar relative z-10">
            {children}
        </div>
    </div>
);

export default GlassHUD;
