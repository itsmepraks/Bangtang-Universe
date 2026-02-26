import { useMemo } from 'react';
import { ChevronLeft, PenTool, Disc, Award, Music, ExternalLink, User, GitCompare, Trophy, GitMerge, Calendar } from 'lucide-react';
import type { Song, Member } from '../../../types/database';
import { GlassHUD } from '../../layout/GlassHUD';
import { useSoloAlbumsByMember, useAwardsByMember, useCollaborationsByMember, useMemberEventsByMember } from '../../../hooks';
import MemberTimeline from './Members/MemberTimeline';
import Badge from '../../ui/Badge';
import MetricCard from '../../ui/MetricCard';
import MemberComparison from '../comparison/MemberComparison';

interface MembersSectionProps {
  members: Member[];
  songs: Song[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
  onOpenFullProfile: (id: string) => void;
}

function MemberGrid({ members, onSelect }: { members: Member[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="text-left group rounded-2xl border border-white/[0.06] bg-[#111118] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
        >
          {/* Photo */}
          <div className="aspect-[3/4] relative overflow-hidden rounded-t-2xl">
            {m.image_url ? (
              <img src={m.image_url} alt={m.stage_name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${m.color || '#A855F7'}30, transparent)` }}>
                <User size={48} className="text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-semibold text-white/95" style={{ textShadow: `0 0 20px ${m.color}80` }}>{m.stage_name}</h3>
              {m.full_name && <p className="text-xs text-white/60 mt-1">{m.full_name}</p>}
            </div>
          </div>
          {/* Info */}
          <div className="p-5 space-y-3">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide">{m.role}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool size={12} className="text-white/40" />
                <span className="text-xs text-white/60">{m.komca_credits} KOMCA</span>
              </div>
              <div
                className="w-3 h-3 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_12px_var(--glow)]"
                style={{
                  backgroundColor: m.color || '#A855F7',
                  '--glow': `${m.color}80`,
                } as React.CSSProperties}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function MemberProfile({ member, songs, onBack, onOpenFullProfile }: {
  member: Member; songs: Song[];
  onBack: () => void; onOpenFullProfile: () => void;
}) {
  const { soloAlbums } = useSoloAlbumsByMember(member.id);
  const { awards: memberAwards } = useAwardsByMember(member.id);
  const { collaborations: memberCollabs } = useCollaborationsByMember(member.id);
  const { memberEvents } = useMemberEventsByMember(member.id);

  const memberSongs = useMemo(() => {
    const name = member.stage_name.toLowerCase();
    return songs.filter(s =>
      (s.member_credits || []).some(c => c.toLowerCase().includes(name)) ||
      (s.writers || []).some(w => w.toLowerCase().includes(name))
    );
  }, [songs, member.stage_name]);

  const personalInfo: { label: string; value: string | null | undefined }[] = [
    { label: 'Birth Date', value: member.birth_date },
    { label: 'Birth Place', value: member.birth_place },
    { label: 'Height', value: member.height },
    { label: 'MBTI', value: member.mbti },
    { label: 'Zodiac', value: member.zodiac },
  ];
  if (member.enlistment_start) {
    personalInfo.push({ label: 'Enlistment', value: member.enlistment_start });
  }
  if (member.enlistment_end) {
    personalInfo.push({ label: 'Discharged', value: member.enlistment_end });
  }
  const filteredPersonalInfo = personalInfo.filter(p => p.value);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-wide uppercase transition-colors">
          <ChevronLeft size={16} /> All Members
        </button>
        <button onClick={onOpenFullProfile} className="text-xs text-purple-400/60 hover:text-purple-300 tracking-wide uppercase transition-colors">
          Full Profile View
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="w-36 h-44 md:w-52 md:h-64 rounded-2xl overflow-hidden flex-shrink-0 relative">
          {member.image_url ? (
            <img src={member.image_url} alt={member.stage_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${member.color}30, transparent)` }}>
              <User size={56} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-transparent" />
        </div>
        <div className="flex flex-col justify-center space-y-3">
          <h2 className="text-3xl font-semibold text-white/95" style={{ textShadow: `0 0 30px ${member.color}60` }}>
            {member.stage_name}
          </h2>
          {member.full_name && <p className="text-sm text-white/60">{member.full_name}</p>}
          <Badge variant="purple" size="md">{member.role}</Badge>
          {member.instagram && (
            <a href={`https://instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-purple-400/70 hover:text-purple-300 transition-colors">
              <ExternalLink size={12} /> @{member.instagram}
            </a>
          )}
          {/* Stats */}
          <div className="flex gap-4 mt-2">
            <MetricCard label="KOMCA" value={member.komca_credits} size="sm" accent={member.color || undefined} />
            <MetricCard label="Writer" value={member.writer_credits || 0} size="sm" />
            <MetricCard label="Producer" value={member.producer_credits || 0} size="sm" />
            <MetricCard label="Songs" value={memberSongs.length} size="sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left */}
        <div className="md:col-span-5 space-y-6">
          {/* Personal Info */}
          {filteredPersonalInfo.length > 0 && (
            <GlassHUD title="Personal Info" icon={User}>
              <div className="grid grid-cols-2 gap-4">
                {filteredPersonalInfo.map(p => (
                  <div key={p.label}>
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wide block mb-1">{p.label}</span>
                    <span className="text-sm text-white/80">{p.value}</span>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {/* Bio */}
          {(member.bio_long || member.bio) && (
            <GlassHUD title="Biography" icon={User}>
              <p className="text-sm text-white/70 leading-relaxed">{member.bio_long || member.bio}</p>
            </GlassHUD>
          )}

          {/* Achievements */}
          {member.achievements && member.achievements.length > 0 && (
            <GlassHUD title="Achievements" icon={Award}>
              <div className="space-y-2.5">
                {member.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Award size={14} className="text-purple-400/50 mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}
        </div>

        {/* Right */}
        <div className="md:col-span-7 space-y-6">
          {/* Solo Discography */}
          {soloAlbums.length > 0 && (
            <GlassHUD title="Solo Discography" icon={Disc}>
              <div className="grid grid-cols-2 gap-3">
                {soloAlbums.map(sa => (
                  <div key={sa.id} className="p-4 bg-[#111118] border border-white/[0.06] rounded-xl">
                    <div className="text-sm font-semibold text-white/80">{sa.title}</div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                      <Badge variant="default" size="sm">{sa.type}</Badge>
                      {sa.release_date && <span>{sa.release_date.slice(0, 4)}</span>}
                    </div>
                    {sa.tracks && sa.tracks.length > 0 && (
                      <div className="mt-2 text-xs text-white/40">{sa.tracks.length} tracks</div>
                    )}
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {/* Songs they contributed to */}
          {memberSongs.length > 0 && (
            <GlassHUD title={`Songs by ${member.stage_name}`} icon={Music}>
              <div className="max-h-[300px] overflow-y-auto pretty-scrollbar space-y-1">
                {memberSongs.slice(0, 30).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <span className="text-sm text-white/70">{s.title}</span>
                      {s.title_korean && <span className="text-xs text-white/40 ml-2">{s.title_korean}</span>}
                    </div>
                    <span className="text-xs text-white/40">{s.release_date?.slice(0, 4)}</span>
                  </div>
                ))}
                {memberSongs.length > 30 && (
                  <p className="text-xs text-white/40 text-center py-2">+{memberSongs.length - 30} more</p>
                )}
              </div>
            </GlassHUD>
          )}

          {/* Career Timeline */}
          {memberEvents.length > 0 && (
            <GlassHUD title="Career Timeline" icon={Calendar}>
              <MemberTimeline events={memberEvents} />
            </GlassHUD>
          )}

          {/* Awards */}
          {memberAwards.length > 0 && (
            <GlassHUD title={`Awards (${memberAwards.filter(a => a.result === 'won').length} won)`} icon={Trophy}>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pretty-scrollbar">
                {memberAwards.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <span className="text-sm text-white/70">{a.name || a.category}</span>
                      <span className="text-xs text-white/40 ml-2">{a.ceremony} ({a.year})</span>
                    </div>
                    <Badge variant={a.result === 'won' ? 'purple' : 'default'} size="sm">
                      {a.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {/* Collaborations */}
          {memberCollabs.length > 0 && (
            <GlassHUD title="Collaborations" icon={GitMerge}>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pretty-scrollbar">
                {memberCollabs.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <span className="text-sm text-white/70">{c.title}</span>
                      <span className="text-xs text-white/40 ml-2">with {c.artist}</span>
                    </div>
                    <Badge variant="default" size="sm">{c.type}</Badge>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembersSection({ members, songs, selectedMemberId, onSelectMember, onOpenFullProfile }: MembersSectionProps) {
  const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId) || null, [members, selectedMemberId]);

  if (selectedMember) {
    return (
      <MemberProfile
        member={selectedMember}
        songs={songs}
        onBack={() => onSelectMember(null)}
        onOpenFullProfile={() => onOpenFullProfile(selectedMember.id)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <MemberGrid members={members} onSelect={onSelectMember} />
      <GlassHUD title="Compare Members" icon={GitCompare}>
        <MemberComparison members={members} songs={songs} />
      </GlassHUD>
    </div>
  );
}
