import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Unified empty-state panel for zero-data, pre-selection, and "nothing yet" panels.
 * Provides an icon, title, short explainer, and an optional CTA — per Nielsen #1/#9
 * (visibility of system status, error recovery guidance).
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-purple-300/80" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-white/80">{title}</p>
      {description && (
        <p className="text-xs text-white/45 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
