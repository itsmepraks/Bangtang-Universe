import { useMemo } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Song, Album, Member, Award, Concert } from '../../../../types/database';
import type { DashboardSection } from '../../../../types/index';
import AlbumArtwork from '../../../ui/AlbumArtwork';
import MemberPortrait from '../../../ui/MemberPortrait';
import { computeEraEvolution } from '../../../../services/analyticsService';
import { BORAHAE_COLORS, CHART_STYLES } from '../../../../constants/colors';

interface HomeSectionProps {
  songs: Song[]; albums: Album[]; members: Member[]; awards: Award[]; concerts: Concert[];
  awardsAvailable?: boolean; concertsAvailable?: boolean;
  onNavigate: (section: DashboardSection, payload?: string | number) => void;
}
const YEAR = (date: string) => date?.slice(0, 4) || 'Undated';
const MEMBER_ORDER = ['rm', 'jin', 'suga', 'jh', 'jm', 'v', 'jk'];

export default function HomeSection({ songs, albums, members, awards, concerts, onNavigate,
  awardsAvailable = true, concertsAvailable = true }: HomeSectionProps) {
  const featured = useMemo(() => albums.find(album => album.title === 'Love Yourself: Answer') ?? albums.find(album => album.cover_art_url) ?? albums[0], [albums]);
  const eras = useMemo(() => {
    const groups = new Map<string, Album[]>();
    [...albums].sort((a, b) => a.release_date.localeCompare(b.release_date)).forEach(album => {
      if (album.era) groups.set(album.era, [...(groups.get(album.era) ?? []), album]);
    });
    return [...groups].map(([name, releases]) => ({ name, releases, cover: releases.find(a => a.cover_art_url) ?? releases[0] }));
  }, [albums]);
  const lineup = useMemo(() => [...members].sort((a, b) => MEMBER_ORDER.indexOf(a.id) - MEMBER_ORDER.indexOf(b.id)), [members]);
  const soundProfile = useMemo(() => computeEraEvolution(songs, albums).map(era => ({
    era: era.era, label: era.era === 'The Most Beautiful Moment in Life' ? 'HYYH' : era.era.replace('Map of the Soul', 'MOTS'),
    energy: era.avgEnergy, valence: era.avgValence,
  })), [songs, albums]);
  const wins = awards.filter(a => a.result === 'won').length;

  return <div className="universe-home">
    <section className="universe-welcome" aria-labelledby="universe-heading">
      <div className="universe-welcome__copy">
        <h1 id="universe-heading">The music stays<br /><span>with you.</span></h1>
        <p>Seven artists. Every era. A universe of music and moments to find your way through.</p>
        <div className="universe-welcome__actions">
          <button type="button" className="universe-button" onClick={() => onNavigate('discography')}>Explore the music <ArrowRight size={17} /></button>
          <button type="button" className="universe-text-link" onClick={() => onNavigate('members')}>Meet the members <ArrowUpRight size={16} /></button>
        </div>
      </div>
      {featured && <button type="button" className="universe-feature" onClick={() => onNavigate('discography', featured.id)} aria-label={`Explore ${featured.title}`}>
        <div className="universe-feature__art"><AlbumArtwork album={featured} eager /></div>
        <div className="universe-feature__caption">
          <div><span>{featured.era || 'Featured release'} · {YEAR(featured.release_date)}</span><h2>{featured.title}</h2></div>
          <ArrowUpRight size={22} aria-hidden="true" />
        </div>
      </button>}
    </section>

    <section className="universe-chapter" aria-labelledby="lineup-heading">
      <div className="universe-section-heading"><div><h2 id="lineup-heading">Seven voices. One BTS.</h2><p>Get to know the people behind the music.</p></div>
        <button type="button" className="universe-text-link" onClick={() => onNavigate('members')}>Meet BTS <ArrowUpRight size={16} /></button></div>
      <div className="universe-lineup">
        {lineup.map(member => <button type="button" key={member.id} className="universe-member" onClick={() => onNavigate('members', member.id)} aria-label={`Explore ${member.stage_name}`}>
          <div className="universe-member__image"><MemberPortrait member={member} decorative /></div>
          <span>{member.stage_name}<ArrowUpRight size={13} aria-hidden="true" /></span>
        </button>)}
      </div>
      {!lineup.length && <p className="universe-empty">Member profiles aren’t available yet.</p>}
    </section>

    <section className="universe-chapter" aria-labelledby="eras-heading">
      <div className="universe-section-heading"><div><h2 id="eras-heading">Find your era.</h2><p>Revisit a favorite. Discover the chapter you missed.</p></div>
        <button type="button" className="universe-text-link" onClick={() => onNavigate('discography')}>All releases <ArrowUpRight size={16} /></button></div>
      <div className="universe-era-grid">
        {eras.map(era => <button type="button" className="universe-era" key={era.name} onClick={() => onNavigate('discography', era.name)}>
          <div className="universe-era__art"><AlbumArtwork album={era.cover} /></div>
          <div className="universe-era__caption"><span>{YEAR(era.cover.release_date)} · {era.releases.length} {era.releases.length === 1 ? 'release' : 'releases'}</span><h3>{era.name}</h3></div>
        </button>)}
      </div>
      {!eras.length && <p className="universe-empty">No era information is available yet. <button type="button" onClick={() => onNavigate('discography')}>Browse the music</button></p>}
    </section>

    <section className="universe-deeper universe-chapter" aria-labelledby="deeper-heading">
      <div className="universe-deeper__intro"><h2 id="deeper-heading">There’s more<br /> to every song.</h2><p>Explore the sound, the stages, and the milestones behind each chapter.</p>
        <button type="button" className="universe-text-link" onClick={() => onNavigate('analytics')}>Explore the music data <ArrowUpRight size={16} /></button>
        <div className="universe-counts"><button type="button" onClick={() => onNavigate('discography')}><strong>{albums.length}</strong><span>releases</span></button><button type="button" onClick={() => onNavigate('discography')}><strong>{songs.length}</strong><span>songs in the archive</span></button></div>
      </div>
      <div className="universe-sound"><h3>The sound across eras</h3>
        <div className="universe-sound__chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={soundProfile} margin={{ top: 16, right: 12, left: -26, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#b8aacb' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#b8aacb' }} tickLine={false} axisLine={false} tickCount={3} />
          <Tooltip {...CHART_STYLES.TOOLTIP} labelFormatter={(_, payload) => payload?.[0]?.payload?.era ?? ''} />
          <Area type="monotone" dataKey="energy" name="Energy" stroke={BORAHAE_COLORS.LIGHT} fill={BORAHAE_COLORS.PRIMARY} fillOpacity={.14} strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="valence" name="Valence" stroke="#9aabff" fill="#818cf8" fillOpacity={.05} strokeWidth={2} isAnimationActive={false} />
        </AreaChart></ResponsiveContainer></div>
        <p className="universe-sound__legend"><span>Energy</span><span>Valence</span><small>Normalized scores · 0–1</small></p>
      </div>
    </section>
    <nav className="universe-explore-links" aria-label="More of the universe">
      <button type="button" onClick={() => onNavigate('tours')}><span><strong>On stage</strong><small>{concertsAvailable ? `${concerts.length} shows in the archive` : 'Explore tours and performances'}</small></span><ArrowUpRight size={22} /></button>
      <button type="button" onClick={() => onNavigate('media')}><span><strong>In the moment</strong><small>Videos, appearances, and memories</small></span><ArrowUpRight size={22} /></button>
      <button type="button" onClick={() => onNavigate('awards')}><span><strong>The milestones</strong><small>{awardsAvailable ? `${wins} recorded wins` : 'Explore awards and recognition'}</small></span><ArrowUpRight size={22} /></button>
    </nav>
    <footer className="universe-footer">BANGTAN UNIVERSE <span>The music. The moments. The data.</span></footer>
  </div>;
}
