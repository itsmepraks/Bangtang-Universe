import { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: string;
  subtitle?: string;
}

export default function StatCard({ label, value, icon: Icon, accent = '#A855F7', subtitle }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="p-5 bg-[#111118] border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-all duration-300 group" style={{ borderTop: `2px solid ${accent || '#A855F7'}20` }}>
      <div className="h-0.5 w-10 rounded-full mb-4" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-semibold text-white/95 tabular-nums">{displayed.toLocaleString()}</span>
          <div className="text-xs font-medium text-white/50 mt-1">{label}</div>
          {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
        </div>
        <Icon size={20} className="text-white/20 group-hover:text-purple-400/60 transition-colors duration-500" />
      </div>
    </div>
  );
}
