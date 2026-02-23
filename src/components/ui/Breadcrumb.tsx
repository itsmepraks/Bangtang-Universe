import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
      <ol className="flex items-center gap-1.5 list-none m-0 p-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="text-white/30" aria-hidden="true" />}
              {isLast ? (
                <span className="text-sm text-white/95 font-semibold" aria-current="page">{item.label}</span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
