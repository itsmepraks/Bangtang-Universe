import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Song, Album, Member, Award, Concert } from '../../../../types/database';
import type { DashboardSection } from '../../../../types/index';
import {
  CollectionIndex,
  EditorialPageHeader,
  EvidencePanel,
  GallerySection,
  ObjectLabel,
} from '../../../editorial';
import { computeEraEvolution, computeMemberContributions } from '../../../../services/analyticsService';
import { BORAHAE_COLORS, CHART_STYLES, SECTION_ACCENTS } from '../../../../constants/colors';

interface HomeSectionProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards: Award[];
  concerts: Concert[];
  onNavigate: (section: DashboardSection, payload?: string | number) => void;
}

function formatYear(date?: string | null): string {
  return date ? date.slice(0, 4) : 'Undated';
}

function abbreviateEra(era: string): string {
  if (era.includes(':')) {
    const [main, sub] = era.split(':').map((s) => s.trim());
    const initials = main.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? '').join('');
    return `${initials}:${sub.split(/\s+/)[0].slice(0, 3)}`;
  }
  const words = era.split(/\s+/);
  if (words.length === 1) return era.slice(0, 7);
  return words.map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function formatReleaseDate(date?: string | null): string {
  if (!date) return 'Unknown date';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(date));
}

export default function HomeSection({
  songs,
  albums,
  members,
  awards,
  concerts,
  onNavigate,
}: HomeSectionProps) {
  const eras = useMemo(() => [...new Set(albums.map((a) => a.era).filter(Boolean))], [albums]);
  const latestAlbum = useMemo(
    () => [...albums].sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))[0] ?? null,
    [albums],
  );
  const awardsWon = useMemo(() => awards.filter((a) => a.result === 'won').length, [awards]);
  const uniqueTours = useMemo(() => new Set(concerts.map((c) => c.tour_name)).size, [concerts]);
  const uniqueCountries = useMemo(() => new Set(concerts.map((c) => c.country)).size, [concerts]);
  const totalKomca = useMemo(() => members.reduce((sum, m) => sum + (m.komca_credits || 0), 0), [members]);
  const titleTracksCount = useMemo(() => songs.filter((s) => s.is_title_track).length, [songs]);

  const eraEvolution = useMemo(() => computeEraEvolution(songs, albums), [songs, albums]);
  const eraStory = useMemo(() => {
    return eraEvolution.slice(0, 8).map((era, index) => {
      const eraAlbums = albums
        .filter((album) => album.era === era.era)
        .sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''));
      const eraSongs = songs.filter((song) => {
        if (!song.album_id) return false;
        return eraAlbums.some((album) => album.id === song.album_id);
      });
      const firstAlbum = eraAlbums[0];
      const lastAlbum = eraAlbums[eraAlbums.length - 1];
      return {
        id: era.era,
        index,
        era: era.era,
        short: abbreviateEra(era.era),
        year: formatYear(firstAlbum?.release_date),
        range: firstAlbum && lastAlbum
          ? `${formatReleaseDate(firstAlbum.release_date)} - ${formatReleaseDate(lastAlbum.release_date)}`
          : 'Undated',
        releases: eraAlbums.length,
        songs: eraSongs.length,
        energy: era.avgEnergy,
        valence: era.avgValence,
        anchor: firstAlbum?.title ?? era.era,
        color: firstAlbum?.cover_color || (index % 2 === 0 ? BORAHAE_COLORS.LIGHT : '#e8d8ad'),
      };
    });
  }, [albums, songs, eraEvolution]);
  const eraChartData = useMemo(
    () =>
      eraEvolution.map((era) => ({
        era: abbreviateEra(era.era),
        energy: era.avgEnergy,
        valence: era.avgValence,
      })),
    [eraEvolution],
  );

  const contributions = useMemo(() => computeMemberContributions(members, songs), [members, songs]);
  const topContributor = contributions[0];

  const winsByYear = useMemo(() => {
    const map: Record<number, number> = {};
    awards
      .filter((award) => award.result === 'won')
      .forEach((award) => {
        map[award.year] = (map[award.year] || 0) + 1;
      });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({ year: `'${year.slice(2)}`, count }));
  }, [awards]);

  return (
    <main className="space-y-6">
      <EditorialPageHeader
        eyebrow="Bangtan Universe / Permanent Collection"
        title="Seven artists, one moving archive."
        note="From debut releases to solo authorship and stadium-scale tours, the BTS archive is best read as a system of eras: music, movement, recognition, and memory changing together."
        meta={
          <>
            <span>{formatYear(albums[0]?.release_date)}-{formatYear(latestAlbum?.release_date)}</span>
            <span>{eras.length} eras</span>
            <span>{songs.length.toLocaleString()} catalog records</span>
          </>
        }
        aside={
          <CollectionIndex
            onNavigate={(section) => onNavigate(section)}
            items={[
              { label: 'Songs', value: songs.length, section: 'discography', note: `${titleTracksCount} title tracks`, accent: SECTION_ACCENTS.discography },
              { label: 'Members', value: members.length, section: 'members', note: `${totalKomca.toLocaleString()} KOMCA credits`, accent: SECTION_ACCENTS.members },
              { label: 'Awards', value: awardsWon, section: 'awards', note: `${awards.length.toLocaleString()} nominations tracked`, accent: SECTION_ACCENTS.awards },
              { label: 'Tours', value: uniqueTours, section: 'tours', note: `${uniqueCountries} countries in the archive`, accent: SECTION_ACCENTS.tours },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <GallerySection
          number="01"
          label="Era Spine"
          title="The archive moves through eras, not just releases."
          claim="Chronology becomes the first visual path: each era is a room with releases, songs, sound, and one anchor object."
          caption="Read top to bottom as an exhibition wall. The chart sits beside the spine as supporting evidence."
          source="Source: local song and album records."
          className="gallery-section--wide"
        >
          <div className="story-wall">
            <div className="era-spine" aria-label="Era timeline">
              {eraStory.map((era) => (
                <button
                  type="button"
                  key={era.id}
                  onClick={() => onNavigate('discography', era.era)}
                  className="era-spine__item"
                  style={{ '--era-color': era.color } as React.CSSProperties}
                >
                  <span className="era-spine__year">{era.year}</span>
                  <span className="era-spine__marker" aria-hidden="true" />
                  <span className="era-spine__content">
                    <span className="era-spine__kicker">Gallery {String(era.index + 1).padStart(2, '0')} / {era.short}</span>
                    <span className="era-spine__title">{era.era}</span>
                    <span className="era-spine__range">{era.range}</span>
                    <span className="era-spine__anchor">{era.anchor}</span>
                    <span className="era-spine__metrics">
                      <span>{era.releases} releases</span>
                      <span>{era.songs} songs</span>
                      <span>{Math.round(era.energy * 100)} energy</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <EvidencePanel
              title="Sound profile as evidence"
              eyebrow="Evidence wall"
              caption="Energy and valence are normalized from 0 to 1. The useful reading is the shape between eras, not a single score."
              className="story-wall__evidence"
            >
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eraChartData} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
                    <XAxis dataKey="era" tick={{ fontSize: 11, fill: 'rgba(242,234,223,0.45)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 1]} tick={false} axisLine={false} tickLine={false} />
                    <Tooltip {...CHART_STYLES.TOOLTIP} cursor={{ stroke: 'rgba(242,234,223,0.12)' }} />
                    <Area type="monotone" dataKey="energy" stroke={BORAHAE_COLORS.LIGHT} fill={BORAHAE_COLORS.PRIMARY} fillOpacity={0.16} strokeWidth={2} dot={false} name="Energy" isAnimationActive={false} />
                    <Area type="monotone" dataKey="valence" stroke="#e8d8ad" fill="#e8d8ad" fillOpacity={0.08} strokeWidth={1.8} dot={false} name="Valence" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </EvidencePanel>
          </div>
        </GallerySection>

        <GallerySection
          number="02"
          label="Featured Labels"
          title="Four objects explain the collection."
          claim="A museum entrance does not show everything; it chooses the labels that orient the room."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <ObjectLabel
              classification="Release"
              title={latestAlbum?.title ?? 'Latest release unavailable'}
              detail={latestAlbum ? `${formatYear(latestAlbum.release_date)} · ${latestAlbum.era ?? latestAlbum.type}` : undefined}
              value={latestAlbum?.track_count ?? '—'}
              valueLabel="tracks"
              description="The latest catalog object anchors the archive in present tense."
              accent={SECTION_ACCENTS.discography}
              actionLabel="Open catalog"
              onClick={() => latestAlbum && onNavigate('discography', latestAlbum.id)}
              media={latestAlbum?.cover_art_url ? (
                <img src={latestAlbum.cover_art_url} alt={latestAlbum.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              ) : undefined}
            />
            <ObjectLabel
              classification="Authorship"
              title={topContributor?.stageName ?? 'Member credits'}
              detail="KOMCA writing and production record"
              value={topContributor?.komcaCredits ?? totalKomca}
              valueLabel="credits"
              description="The member archive is also a record of creative labor and authorship."
              accent={SECTION_ACCENTS.members}
              actionLabel="View members"
              onClick={() => onNavigate('members')}
            />
            <ObjectLabel
              classification="Movement"
              title="Tour footprint"
              detail={`${uniqueTours} tours · ${uniqueCountries} countries`}
              value={concerts.length}
              valueLabel="shows"
              description="The archive becomes geographic through venues, routes, and repeat cities."
              accent={SECTION_ACCENTS.tours}
              actionLabel="Open map"
              onClick={() => onNavigate('tours')}
            />
            <ObjectLabel
              classification="Recognition"
              title="Awards chronology"
              detail={`${awards.length.toLocaleString()} tracked nominations`}
              value={awardsWon}
              valueLabel="wins"
              description="Recognition arrives in waves, across ceremonies, categories, group work, and solo work."
              accent={SECTION_ACCENTS.awards}
              actionLabel="Enter room"
              onClick={() => onNavigate('awards')}
            />
          </div>
        </GallerySection>
      </div>

      <GallerySection
        number="03"
        label="Recognition"
        title="Awards are a chronology, not a trophy pile."
        claim="The useful view is the rhythm of recognition over time: dense years, quiet years, and the institutions that repeat."
        caption="This compact view keeps the overview restrained while pointing to the full awards room."
      >
        <EvidencePanel
          title="Wins by year"
          eyebrow="Recognition timeline"
          caption="Counts include records marked as won in the local awards table."
          source="Source: awards dataset."
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winsByYear} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(242,234,223,0.45)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(242,234,223,0.38)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...CHART_STYLES.TOOLTIP} cursor={{ fill: 'rgba(232,216,173,0.05)' }} />
                <Bar dataKey="count" fill="#e8d8ad" fillOpacity={0.82} radius={[2, 2, 0, 0]} name="Wins" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </EvidencePanel>
      </GallerySection>
    </main>
  );
}
