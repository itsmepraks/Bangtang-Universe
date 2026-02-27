import type { ReactNode } from 'react';

interface MetricChip {
  value: string | number;
  label: string;
}

interface BentoCardProps {
  title: string;
  metrics: MetricChip[];
  onExplore?: () => void;
  children: ReactNode;
  className?: string;
}

export default function BentoCard({
  title,
  metrics,
  onExplore,
  children,
  className = '',
}: BentoCardProps) {
  return (
    <div
      className={`bg-[#0e0e14] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.10] transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">
          {title}
        </span>
        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            aria-label={`Explore ${title}`}
            className="text-white/20 hover:text-purple-400/70 transition-colors duration-200 text-sm leading-none"
          >
            {'\u2192'}
          </button>
        )}
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-2xl font-bold text-white/95 tabular-nums leading-none">
              {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide mt-1">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart slot */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
