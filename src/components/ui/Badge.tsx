interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'blue' | 'sentiment';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const variantClasses = {
  default: 'bg-white/[0.06] border border-white/[0.08] text-white/60',
  purple: 'bg-purple-500/15 border border-purple-500/25 text-purple-300',
  blue: 'bg-blue-500/15 border border-blue-500/25 text-blue-300',
  sentiment: '',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export default function Badge({ children, variant = 'default', size = 'sm', color, className = '' }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full';
  const sizeClass = sizeClasses[size];

  if (variant === 'sentiment' && color) {
    return (
      <span
        className={`${base} ${sizeClass} border ${className}`}
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}40`,
          color: `${color}cc`,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`${base} ${sizeClass} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
