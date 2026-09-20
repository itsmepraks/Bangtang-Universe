import { useState } from 'react';
import { Disc3 } from 'lucide-react';
import type { Album } from '../../types/database';

export default function AlbumArtwork({ album, className = '', eager = false }: { album: Album; className?: string; eager?: boolean }) {
  const source = album.cover_art_url?.replace(/^http:/, 'https:');
  const [failed, setFailed] = useState<string>();
  return source && failed !== source
    ? <img src={source} alt="" className={className} width={500} height={500} decoding="async" loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(source)} />
    : <div className={`album-artwork-fallback ${className}`} aria-hidden="true"><Disc3 size={54} /><span>{album.title}</span></div>;
}
