import type { ReactNode } from 'react';

interface EvidencePanelProps {
  title: string;
  eyebrow?: string;
  caption: string;
  source?: string;
  children: ReactNode;
  className?: string;
}

export default function EvidencePanel({
  title,
  eyebrow,
  caption,
  source,
  children,
  className = '',
}: EvidencePanelProps) {
  return (
    <article className={`evidence-panel ${className}`}>
      <div className="evidence-panel__header">
        {eyebrow && <p className="editorial-kicker">{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      <div className="evidence-panel__body">{children}</div>
      <div className="evidence-panel__caption">
        <p>{caption}</p>
        {source && <p className="gallery-section__source">{source}</p>}
      </div>
    </article>
  );
}
