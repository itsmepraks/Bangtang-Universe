import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface DataStatusBannerProps {
  hasError: boolean;
  onRetry: () => void;
  retrying?: boolean;
}

// Non-blocking banner — shown when live fetches fail and we've fallen back to
// the bundled cache. Users keep browsing; one clear recovery action.
export default function DataStatusBanner({ hasError, onRetry, retrying = false }: DataStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!hasError || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-100/90"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-xs">
        <span className="font-medium">Can't reach the server.</span>{' '}
        <span className="text-amber-100/60">Showing saved data. Newest releases may not be here yet.</span>
      </div>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-amber-200/60 hover:text-amber-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
