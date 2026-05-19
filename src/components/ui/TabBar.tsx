interface TabOption {
  value: string;
  label: string;
}

interface TabBarProps {
  tabs: TabOption[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TabBar({ tabs, active, onChange, className = '' }: TabBarProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-hide scroll-fade-x ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-[background-color,border-color,color] duration-300 flex-shrink-0 ${
            active === tab.value
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/[0.15]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
