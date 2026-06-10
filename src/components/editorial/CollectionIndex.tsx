import type { DashboardSection } from '../../types';

interface CollectionIndexItem {
  label: string;
  value: string | number;
  section: DashboardSection;
  note: string;
  accent?: string;
}

interface CollectionIndexProps {
  items: CollectionIndexItem[];
  onNavigate: (section: DashboardSection) => void;
}

export default function CollectionIndex({ items, onNavigate }: CollectionIndexProps) {
  return (
    <nav className="collection-index" aria-label="Collection index">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onNavigate(item.section)}
          className="collection-index__item"
          style={{ '--index-accent': item.accent ?? '#A855F7' } as React.CSSProperties}
        >
          <span className="collection-index__value">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
          </span>
          <span className="collection-index__label">{item.label}</span>
          <span className="collection-index__note">{item.note}</span>
        </button>
      ))}
    </nav>
  );
}
