import { RefreshCw } from 'lucide-react';
import { EditorialPageHeader } from '../editorial';
import DotLoader from './DotLoader';

export default function ResourceState({ title, loading, onRetry }: { title: string; loading: boolean; onRetry: () => void }) {
  return <div className="space-y-5">
    <EditorialPageHeader eyebrow="" title={title} note={loading ? `Loading ${title.toLowerCase()}…` : `These records are temporarily unavailable.`} />
    <div role="status" className="editorial-surface p-8 text-center text-sm text-white/70">
      {loading ? <DotLoader /> : <>
        <p>We couldn’t load these records. You can try again or explore another section.</p>
        <button onClick={onRetry} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-purple-400/40 px-4 py-2 text-purple-200 hover:bg-purple-400/10"><RefreshCw size={16} />Try again</button>
      </>}
    </div>
  </div>;
}
