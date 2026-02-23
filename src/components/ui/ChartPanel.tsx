import { ResponsiveContainer } from 'recharts';

interface ChartPanelProps {
  title: string;
  icon?: React.ElementType;
  height?: number;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export default function ChartPanel({ title, icon: Icon, height = 300, children, description, className = '' }: ChartPanelProps) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3 md:p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon size={18} className="text-purple-400/60" />}
        <h3 className="text-sm font-semibold tracking-wide text-white/70">{title}</h3>
      </div>
      {description && <p className="text-xs text-white/40 mb-4">{description}</p>}
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
