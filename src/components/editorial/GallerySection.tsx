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
}

export default function GallerySection({
  number,
  label,
  title,
  claim,
  caption,
  source,
  children,
  className = '',
}: GallerySectionProps) {
  return (
    <section className={`editorial-surface gallery-section ${className}`}>
      <div className="gallery-section__intro">
        <p className="editorial-kicker">{number} / {label}</p>
        <h2 className="gallery-section__title">{title}</h2>
        <p className="gallery-section__claim">{claim}</p>
      </div>
      <div className="gallery-section__body">{children}</div>
      {(caption || source) && (
        <footer className="gallery-section__footer">
          {caption && <p>{caption}</p>}
          {source && <p className="gallery-section__source">{source}</p>}
        </footer>
      )}
    </section>
  );
}
