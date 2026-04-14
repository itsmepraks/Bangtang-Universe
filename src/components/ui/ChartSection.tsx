import type { ReactNode } from 'react';

type ChartVariant = 'immersive' | 'gradient' | 'timeline' | 'dashed' | 'subtle' | 'default';

interface ChartSectionProps {
  title: string;
  subtitle?: string;
  variant?: ChartVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<ChartVariant, string> = {
  immersive: 'bg-[#0c0c14] rounded-2xl p-4 md:p-6',
  gradient: 'bg-gradient-to-br from-[#111118] to-[#0f0f18] border border-white/[0.05] rounded-2xl p-4 md:p-6',
  timeline: 'bg-[#0e0e16] border-l-2 border-l-purple-500/20 border border-white/[0.04] rounded-xl p-4 md:p-6',
  dashed: 'bg-[#111118]/80 border border-dashed border-white/[0.08] rounded-xl p-4 md:p-5',
  subtle: 'bg-[#111118]/80 border border-white/[0.04] rounded-xl p-3 md:p-5',
  default: 'bg-[#111118] border border-white/[0.06] rounded-2xl p-4 md:p-6',
};

export default function ChartSection({
  title,
  subtitle,
  variant = 'default',
  children,
  className = '',
}: ChartSectionProps) {
  return (
    <div className={`${VARIANT_CLASSES[variant]} ${className}`}>
      <h3 className="text-base font-bold text-white/85 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-white/40 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}
