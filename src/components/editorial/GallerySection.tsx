import type { ReactNode } from 'react';

interface GallerySectionProps {
  number: string;
  label: string;
  title: string;
  claim: string;
  caption?: string;
  source?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export default function GallerySection({
  title,
  claim,
  caption,
  source,
  children,
  className = '',
  compact = false,
}: GallerySectionProps) {
  return (
    <section className={`editorial-surface gallery-section ${className}`}>
      {!compact && <div className="gallery-section__intro">
        <h2 className="gallery-section__title">{title}</h2>
        <p className="gallery-section__claim">{claim}</p>
      </div>}
      <div className="gallery-section__body">{children}</div>
      {(!compact && (caption || source)) && (
        <footer className="gallery-section__footer">
          {caption && <p>{caption}</p>}
          {source && <p className="gallery-section__source">{source}</p>}
        </footer>
      )}
    </section>
  );
}
