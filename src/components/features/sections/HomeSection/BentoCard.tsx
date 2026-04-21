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
      role="region"
      aria-labelledby={`bento-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`bg-[#0e0e14] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.15] transition-colors duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          id={`bento-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-xs font-semibold text-white/50 tracking-wide"
        >
          {title}
        </h2>
        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            aria-label={`Explore ${title}`}
            className="text-white/40 hover:text-purple-400/70 transition-colors duration-200 text-sm leading-none p-3 -mr-1"
          >
            {'\u2192'}
          </button>
        )}
      </div>

      {/* Metric chips */}
      {metrics.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {metrics.map((m, i) => (
            <div key={`${m.label}-${i}`}>
              <p className="text-2xl font-bold text-white/95 tabular-nums leading-none">
                {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart slot */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
