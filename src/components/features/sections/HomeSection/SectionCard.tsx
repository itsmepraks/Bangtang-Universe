import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  icon: LucideIcon;
  label: string;
  headline: string;
  subheadline?: string;
  onExplore: () => void;
  children: ReactNode;
}

export default function SectionCard({
  icon: Icon,
  label,
  headline,
  subheadline,
  onExplore,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/[0.12] transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-white/40 group-hover:text-purple-400/60 transition-colors duration-500"
        />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Headline */}
      <div>
        <p className="text-2xl font-semibold text-white/90 leading-tight">{headline}</p>
        {subheadline && (
          <p className="text-xs text-white/40 mt-0.5">{subheadline}</p>
        )}
      </div>

      {/* Mini-preview */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Explore button */}
      <button
        type="button"
        onClick={onExplore}
        aria-label={`Explore ${label}`}
        className="text-xs text-purple-400/70 hover:text-purple-300 transition-colors duration-200 text-left"
      >
        Explore {'\u2192'}
      </button>
    </div>
  );
}
