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
    <nav className="flex items-center gap-1.5">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-white/30" />}
            {isLast ? (
              <span className="text-sm text-white/95 font-semibold">{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
