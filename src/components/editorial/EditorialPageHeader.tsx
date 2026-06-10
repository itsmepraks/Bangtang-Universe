import type { ReactNode } from 'react';

interface EditorialPageHeaderProps {
  eyebrow: string;
  title: string;
  note: string;
  meta?: ReactNode;
  aside?: ReactNode;
}

export default function EditorialPageHeader({
  eyebrow,
  title,
  note,
  meta,
  aside,
}: EditorialPageHeaderProps) {
  return (
    <header className="editorial-surface editorial-page-header">
      <div className="min-w-0">
        <p className="editorial-kicker">{eyebrow}</p>
        <h1 className="editorial-title">{title}</h1>
        <p className="editorial-note">{note}</p>
        {meta && (
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-[#9f968c]">
            {meta}
          </div>
        )}
      </div>
      {aside && <div className="editorial-header-aside">{aside}</div>}
    </header>
  );
}
