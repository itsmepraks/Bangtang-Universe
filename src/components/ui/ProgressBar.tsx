interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, label, showPercent = false, color, size = 'md' }: ProgressBarProps) {
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const pct = Math.round(value * 100);

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-white/50">{label}</span>}
          {showPercent && <span className="text-xs text-white/60 font-mono">{pct}%</span>}
        </div>
      )}
      <div className={`${barHeight} bg-white/[0.06] rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-1000`}
          style={{
            width: `${pct}%`,
            backgroundColor: color || 'rgba(168, 85, 247, 0.6)',
          }}
        />
      </div>
    </div>
  );
}
