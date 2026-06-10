import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ObjectLabelProps {
  classification: string;
  title: string;
  detail?: string;
  value: string | number;
  valueLabel: string;
  description: string;
  accent?: string;
  actionLabel?: string;
  onClick?: () => void;
  media?: ReactNode;
}

export default function ObjectLabel({
  classification,
  title,
  detail,
  value,
  valueLabel,
  description,
  accent = '#A855F7',
  actionLabel,
  onClick,
  media,
}: ObjectLabelProps) {
  const content = (
    <>
      {media && <div className="object-label__media">{media}</div>}
      <div className="object-label__content">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="object-label__classification">{classification}</p>
            <h3 className="object-label__title">{title}</h3>
            {detail && <p className="object-label__detail">{detail}</p>}
          </div>
          <div className="object-label__value" style={{ color: accent }}>
            <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
            <small>{valueLabel}</small>
          </div>
        </div>
        <p className="object-label__description">{description}</p>
        {actionLabel && (
          <span className="object-label__action">
            {actionLabel}
            <ArrowUpRight size={13} aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="object-label object-label--button"
        style={{ '--object-accent': accent } as React.CSSProperties}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="object-label" style={{ '--object-accent': accent } as React.CSSProperties}>
      {content}
    </article>
  );
}
