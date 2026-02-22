interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
  showAll?: boolean;
  className?: string;
}

export default function FilterBar({ options, value, onChange, allLabel = 'All', showAll = true, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showAll && (
        <button
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
            value === null
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]'
          }`}
        >
          {allLabel}
        </button>
      )}
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value === value ? null : opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
            value === opt.value
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]'
          }`}
        >
          {opt.label}{opt.count != null && ` (${opt.count})`}
        </button>
      ))}
    </div>
  );
}
