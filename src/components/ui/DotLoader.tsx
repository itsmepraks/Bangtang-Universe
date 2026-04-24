interface DotLoaderProps {
  /** 'mono' = three white dots (in-app section spinner). 'gradient' = purple/pink/blue (app-level boot fallback). */
  tone?: 'mono' | 'gradient';
  /** Dot size. 'sm' for nested sections, 'md' for page-level loaders. */
  size?: 'sm' | 'md';
  className?: string;
}

export default function DotLoader({ tone = 'mono', size = 'sm', className = '' }: DotLoaderProps) {
  const dotSize = size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const colors =
    tone === 'gradient'
      ? ['bg-purple-400/60', 'bg-pink-400/60', 'bg-blue-400/60']
      : ['bg-white/40', 'bg-white/40', 'bg-white/40'];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {colors.map((c, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${c} animate-pulse`}
          style={i === 0 ? undefined : { animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
