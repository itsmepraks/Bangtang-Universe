interface BtsLogoProps {
  size?: number;
  className?: string;
}

/**
 * BTS "Beyond The Scene" door logo.
 * Two trapezoid halves forming an opening door / bulletproof shield.
 */
export default function BtsLogo({ size = 48, className = '' }: BtsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left door panel */}
      <path
        d="M28 8L10 8L18 56L28 56Z"
        fill="currentColor"
      />
      {/* Right door panel */}
      <path
        d="M36 8L54 8L46 56L36 56Z"
        fill="currentColor"
      />
    </svg>
  );
}
