import { useState } from 'react';
import { User } from 'lucide-react';
import type { Member } from '../../types/database';

const MEMBER_IDS = new Set(['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk']);

export default function MemberPortrait({ member, className = '', decorative = false }: {
  member: Member; className?: string; decorative?: boolean;
}) {
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const localPhoto = MEMBER_IDS.has(member.id) ? `/assets/members/${member.id}.jpg` : undefined;
  const photo = [member.image_url, localPhoto].find(source => source && !failedPhotos.includes(source));
  if (photo) return <img src={photo} alt={decorative ? '' : member.stage_name} className={className}
    loading="lazy" decoding="async" width={640} height={800}
    style={{ objectPosition: member.id === 'rm' ? '60% center' : 'center' }}
    onError={() => setFailedPhotos(previous => [...previous, photo])} />;
  return <div className={`member-portrait ${className}`} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${member.stage_name} photo unavailable`} aria-hidden={decorative || undefined}>
    <User className="member-portrait__placeholder" size={40} />
  </div>;
}
