import { useState, type ImgHTMLAttributes } from 'react';
import { User } from 'lucide-react';
export default function ArchiveImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!src || failedSrc === src) return <div role="img" aria-label={alt} className={`flex items-center justify-center bg-white/[0.04] ${props.className ?? ''}`}><User size={48} aria-hidden="true" className="text-white/30" /></div>;
  return <img {...props} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
}
