interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  accent?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const valueSize = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
const padding = { sm: 'p-3', md: 'p-5', lg: 'p-6' };

export default function MetricCard({ label, value, icon: Icon, accent, subtitle, size = 'md', className = '' }: MetricCardProps) {
  return (
    <div className={`${padding[size]} rounded-2xl bg-white/[0.03] border border-white/[0.06] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] ${className}`}>
      {accent && <div className="h-0.5 w-12 rounded-full mb-3" style={{ backgroundColor: accent }} />}
      <div className="flex items-start justify-between">
        <div>
          <div className={`${valueSize[size]} font-semibold text-white/95 tabular-nums`}>{value}</div>
          <div className="text-xs font-medium text-white/50 uppercase tracking-wide mt-1">{label}</div>
          {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
        </div>
        {Icon && <Icon size={size === 'sm' ? 16 : 20} className="text-white/20" />}
      </div>
    </div>
  );
}
