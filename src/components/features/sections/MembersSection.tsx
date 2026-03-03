import { useState, useMemo } from 'react';
import { ChevronLeft, PenTool, Disc, Award, Music, ExternalLink, User, GitCompare, Trophy, GitMerge, Calendar, Shield } from 'lucide-react';
import type { Song, Member } from '../../../types/database';
import { GlassHUD } from '../../layout/GlassHUD';
import { useSoloAlbumsByMember, useAwardsByMember, useCollaborationsByMember, useMemberEventsByMember } from '../../../hooks';
import MemberTimeline from './Members/MemberTimeline';
import Badge from '../../ui/Badge';
import MemberComparison from '../comparison/MemberComparison';
import SectionIntro from '../../ui/SectionIntro';
import GlossaryTip from '../../ui/GlossaryTip';

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

type ProfileTab = 'overview' | 'career' | 'music' | 'awards';

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'career', label: 'Career', icon: Calendar },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'awards', label: 'Awards', icon: Trophy },
];

function MemberProfile({ member, songs, onBack, onOpenFullProfile }: {
  member: Member; songs: Song[];
  onBack: () => void; onOpenFullProfile: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
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

  const awardsWon = useMemo(() => memberAwards.filter(a => a.result === 'won').length, [memberAwards]);

  // Military service status
  const militaryStatus = useMemo(() => {
    if (!member.enlistment_start) return null;
    const now = new Date();
    const start = new Date(member.enlistment_start);
    const end = member.enlistment_end ? new Date(member.enlistment_end) : null;
    if (end && now > end) return 'discharged';
    if (now >= start) return 'serving';
    return 'upcoming';
  }, [member.enlistment_start, member.enlistment_end]);

  return (
    <div className="space-y-0">
      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-wide uppercase transition-colors">
          <ChevronLeft size={16} /> All Members
        </button>
        <button onClick={onOpenFullProfile} className="text-xs text-purple-400/60 hover:text-purple-300 tracking-wide uppercase transition-colors">
          Full Profile View
        </button>
      </div>

      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] mb-6">
        {/* Background gradient with member color */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${member.color}18 0%, transparent 50%, ${member.color}08 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/90 via-[#0a0a12]/60 to-[#0a0a12]/80" />

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-8">
          {/* Photo */}
          <div className="w-32 h-40 md:w-44 md:h-56 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08] shadow-2xl">
            {member.image_url ? (
              <img src={member.image_url} alt={member.stage_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#111118]">
                <User size={48} className="text-white/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="text-3xl md:text-4xl font-bold text-white/95 tracking-tight"
                style={{ textShadow: `0 0 40px ${member.color}40` }}
              >
                {member.stage_name}
              </h2>
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: member.color || '#A855F7', boxShadow: `0 0 12px ${member.color}60` }}
              />
            </div>
            {member.full_name && <p className="text-sm text-white/50 mb-3">{member.full_name}</p>}

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="purple" size="md">{member.role}</Badge>
              {militaryStatus === 'discharged' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">
                  <Shield size={10} /> Discharged
                </span>
              )}
              {member.instagram && (
                <a href={`https://instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-purple-300 transition-colors">
                  <ExternalLink size={10} /> @{member.instagram}
                </a>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 mt-auto">
              {[
                { label: 'KOMCA', value: member.komca_credits, accent: true },
                { label: 'Writer', value: member.writer_credits || 0 },
                { label: 'Producer', value: member.producer_credits || 0 },
                { label: 'Solo Albums', value: soloAlbums.length },
                { label: 'Awards Won', value: awardsWon },
                { label: 'Songs', value: memberSongs.length },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-xl md:text-2xl font-semibold tabular-nums"
                    style={{ color: stat.accent ? (member.color || '#A855F7') : 'rgba(255,255,255,0.85)' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          {(member.bio_long || member.bio) && (
            <GlassHUD title="Biography" icon={User} className="md:col-span-2">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                {member.bio_long || member.bio}
              </p>
            </GlassHUD>
          )}

          {/* Personal Info */}
          <GlassHUD title="Personal Info" icon={User}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Birth Date', value: member.birth_date },
                { label: 'Birth Place', value: member.birth_place },
                { label: 'Height', value: member.height },
                { label: 'MBTI', value: member.mbti },
                { label: 'Zodiac', value: member.zodiac },
                ...(member.enlistment_start ? [{ label: 'Enlistment', value: member.enlistment_start }] : []),
                ...(member.enlistment_end ? [{ label: 'Discharged', value: member.enlistment_end }] : []),
                ...(member.solo_debut_date ? [{ label: 'Solo Debut', value: member.solo_debut_date }] : []),
              ].filter(p => p.value).map(p => (
                <div key={p.label}>
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider block mb-1">{p.label}</span>
                  <span className="text-sm text-white/80">{p.value}</span>
                </div>
              ))}
            </div>
          </GlassHUD>

          {/* Achievements */}
          {member.achievements && member.achievements.length > 0 && (
            <GlassHUD title={`Achievements (${member.achievements.length})`} icon={Award}>
              <div className="space-y-2.5">
                {member.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/65 group">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${member.color}15`, border: `1px solid ${member.color}25` }}
                    >
                      <Award size={11} style={{ color: member.color || '#A855F7' }} />
                    </div>
                    <span className="group-hover:text-white/80 transition-colors">{a}</span>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}
        </div>
      )}

      {/* Career Timeline Tab */}
      {activeTab === 'career' && (
        <div className="space-y-6">
          {memberEvents.length > 0 ? (
            <GlassHUD title={`Career Timeline (${memberEvents.length} events)`} icon={Calendar}>
              <MemberTimeline events={memberEvents} />
            </GlassHUD>
          ) : (
            <div className="py-12 text-center">
              <Calendar size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">No career events available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solo Discography */}
          {soloAlbums.length > 0 && (
            <GlassHUD title="Solo Discography" icon={Disc} className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {soloAlbums.map(sa => (
                  <div key={sa.id} className="p-5 bg-[#111118] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors">{sa.title}</div>
                      <Badge variant="default" size="sm">{sa.type}</Badge>
                    </div>
                    {sa.release_date && (
                      <div className="text-xs text-white/40 mb-3">{sa.release_date}</div>
                    )}
                    {sa.tracks && sa.tracks.length > 0 && (
                      <div className="space-y-1 border-t border-white/[0.06] pt-3 mt-2">
                        {sa.tracks.slice(0, 6).map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/45">
                            <span className="text-white/25 tabular-nums w-4 text-right">{i + 1}</span>
                            <span>{t}</span>
                          </div>
                        ))}
                        {sa.tracks.length > 6 && (
                          <div className="text-xs text-white/30 pl-6">+{sa.tracks.length - 6} more</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {/* Songs they contributed to */}
          {memberSongs.length > 0 && (
            <GlassHUD title={`Songs by ${member.stage_name} (${memberSongs.length})`} icon={Music} className="md:col-span-2">
              <div className="max-h-[400px] overflow-y-auto pretty-scrollbar space-y-1">
                {memberSongs.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <span className="text-sm text-white/70">{s.title}</span>
                      {s.title_korean && <span className="text-xs text-white/35 ml-2">{s.title_korean}</span>}
                    </div>
                    <span className="text-xs text-white/35 tabular-nums">{s.release_date?.slice(0, 4)}</span>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {/* Collaborations */}
          {memberCollabs.length > 0 && (
            <GlassHUD title={`Collaborations (${memberCollabs.length})`} icon={GitMerge} className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {memberCollabs.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#111118] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                    <div>
                      <span className="text-sm text-white/75">{c.title}</span>
                      <span className="text-xs text-white/35 ml-2">with {c.artist}</span>
                    </div>
                    <Badge variant="default" size="sm">{c.type}</Badge>
                  </div>
                ))}
              </div>
            </GlassHUD>
          )}

          {soloAlbums.length === 0 && memberSongs.length === 0 && memberCollabs.length === 0 && (
            <div className="py-12 text-center md:col-span-2">
              <Music size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">No music data available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Awards Tab */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          {memberAwards.length > 0 ? (
            <>
              {/* Awards summary bar */}
              <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Trophy size={14} style={{ color: member.color || '#A855F7' }} />
                  <span className="text-sm font-semibold text-white/80">{memberAwards.length}</span>
                  <span className="text-xs text-white/40">total</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-400/80">{awardsWon}</span>
                  <span className="text-xs text-white/40">won</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/50">{memberAwards.length - awardsWon}</span>
                  <span className="text-xs text-white/40">nominated</span>
                </div>
              </div>

              <GlassHUD title="Awards & Nominations" icon={Trophy}>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pretty-scrollbar">
                  {memberAwards.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <div className="min-w-0 flex-1 mr-3">
                        <span className="text-sm text-white/75 block truncate">{a.name || a.category}</span>
                        <span className="text-xs text-white/35">{a.ceremony} ({a.year})</span>
                      </div>
                      <Badge variant={a.result === 'won' ? 'purple' : 'default'} size="sm">
                        {a.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </GlassHUD>
            </>
          ) : (
            <div className="py-12 text-center">
              <Trophy size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">No awards data available yet</p>
            </div>
          )}
        </div>
      )}
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
      <SectionIntro
        description={
          <>
            The seven members of BTS — their profiles, solo careers, and <GlossaryTip term="KOMCA" /> songwriting credits.
            Click a member to explore their full profile, discography, and awards.
          </>
        }
      />
      <MemberGrid members={members} onSelect={onSelectMember} />
      <GlassHUD title="Compare Members" icon={GitCompare}>
        <MemberComparison members={members} songs={songs} />
      </GlassHUD>
    </div>
  );
}
