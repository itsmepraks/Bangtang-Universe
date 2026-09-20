import { useLayoutEffect, useRef } from 'react';
export default function SectionTransition({ children, sectionKey, restoreScroll }: { children: React.ReactNode; sectionKey: string; restoreScroll: () => void }) {
  const restoreRef = useRef(restoreScroll);
  useLayoutEffect(() => { restoreRef.current = restoreScroll; });
  useLayoutEffect(() => { restoreRef.current(); }, [sectionKey]);
  return <div key={sectionKey} className="archive-section-enter h-full">{children}</div>;
}
