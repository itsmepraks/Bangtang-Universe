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

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', { notation: value >= 10000 ? 'compact' : 'standard' }).format(value);
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
  const musicVideosCount = useMemo(() => songs.filter((s) => s.has_mv).length, [songs]);
  const soloSongsCount = useMemo(() => songs.filter((s) => s.is_solo).length, [songs]);
  const releaseYears = useMemo(
    () =>
      albums
        .map((album) => Number(formatYear(album.release_date)))
        .filter((year) => Number.isFinite(year))
        .sort((a, b) => a - b),
    [albums],
  );
  const archiveSpan = releaseYears.length > 1
    ? `${releaseYears[0]}-${releaseYears[releaseYears.length - 1]}`
    : formatYear(albums[0]?.release_date);

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
  const namedEraStory = useMemo(
    () => eraStory.filter((era) => era.era.toLowerCase() !== 'unknown' && era.year !== 'Undated'),
    [eraStory],
  );

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
  const mostDenseEra = useMemo(
    () => namedEraStory.reduce((best, era) => (era.songs > (best?.songs ?? -1) ? era : best), namedEraStory[0]),
    [namedEraStory],
  );
  const highestEnergyEra = useMemo(
    () => namedEraStory.reduce((best, era) => (era.energy > (best?.energy ?? -1) ? era : best), namedEraStory[0]),
    [namedEraStory],
  );
  const peakRecognitionYear = useMemo(
    () => winsByYear.reduce((best, year) => (year.count > best.count ? year : best), winsByYear[0] ?? { year: '--', count: 0 }),
    [winsByYear],
  );
  const topCeremony = useMemo(() => {
    const counts = new Map<string, number>();
    awards.filter((award) => award.result === 'won').forEach((award) => {
      counts.set(award.ceremony, (counts.get(award.ceremony) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [awards]);
  const topTour = useMemo(() => {
    const counts = new Map<string, number>();
    concerts.forEach((concert) => counts.set(concert.tour_name, (counts.get(concert.tour_name) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [concerts]);
  const topCountry = useMemo(() => {
    const counts = new Map<string, number>();
    concerts.forEach((concert) => counts.set(concert.country, (counts.get(concert.country) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [concerts]);
  const focusSignals = [
    {
      label: 'Catalog span',
      value: archiveSpan,
      detail: `${eras.length} eras in the catalog`,
      accent: SECTION_ACCENTS.discography,
    },
    {
      label: 'Music objects',
      value: formatNumber(songs.length),
      detail: `${titleTracksCount} title tracks · ${musicVideosCount} MVs`,
      accent: SECTION_ACCENTS.discography,
    },
    {
      label: 'Authorship',
      value: formatNumber(totalKomca),
      detail: `${members.length} artist labels · ${soloSongsCount} solo tracks`,
      accent: SECTION_ACCENTS.members,
    },
    {
      label: 'Recognition peak',
      value: `${peakRecognitionYear.count}`,
      detail: `${peakRecognitionYear.year.replace("'", '20')} wins in one year`,
      accent: SECTION_ACCENTS.awards,
    },
    {
      label: 'Tour footprint',
      value: formatNumber(concerts.length),
      detail: `${uniqueCountries} countries · ${topCountry?.[0] ?? 'global'} leads`,
      accent: SECTION_ACCENTS.tours,
    },
  ];

  return (
    <main className="space-y-4">
      <EditorialPageHeader
        eyebrow="Bangtan Universe / Permanent Collection"
        title="Overview"
        note="Scan the collection by catalog span, sound, member credits, recognition, and tour reach. Use the summary rows to jump into the detailed pages."
        meta={
          <>
            <span>{archiveSpan}</span>
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

      <section className="overview-signal-strip editorial-surface" aria-label="Archive summary">
        {focusSignals.map((signal) => (
          <button
            type="button"
            key={signal.label}
            className="overview-signal"
            style={{ '--signal-accent': signal.accent } as React.CSSProperties}
            onClick={() => {
              if (signal.label.includes('Music') || signal.label.includes('Catalog')) onNavigate('discography');
              if (signal.label.includes('Authorship')) onNavigate('members');
              if (signal.label.includes('Recognition')) onNavigate('awards');
              if (signal.label.includes('Tour')) onNavigate('tours');
            }}
          >
            <span className="overview-signal__label">{signal.label}</span>
            <span className="overview-signal__value">{signal.value}</span>
            <span className="overview-signal__detail">{signal.detail}</span>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <GallerySection
          number="01"
          label="Era Index"
          title="Release chronology with sound markers"
          claim="Each era shows its date range, anchor release, song count, and average sound profile."
          caption="Use the timeline for sequence and the chart for energy and valence movement."
          source="Source: local song and album records."
          className="gallery-section--wide"
        >
          <div className="overview-insight-strip" aria-label="Era highlights">
            <div>
              <span>Catalog-dense era</span>
              <strong>{mostDenseEra?.era ?? 'No era data'}</strong>
              <small>{mostDenseEra?.songs ?? 0} songs across {mostDenseEra?.releases ?? 0} releases</small>
            </div>
            <div>
              <span>Highest energy era</span>
              <strong>{highestEnergyEra?.era ?? 'No era data'}</strong>
              <small>{Math.round((highestEnergyEra?.energy ?? 0) * 100)} average energy score</small>
            </div>
            <div>
              <span>Recognition crest</span>
              <strong>{peakRecognitionYear.year.replace("'", '20')}</strong>
              <small>{peakRecognitionYear.count} wins recorded</small>
            </div>
            <div>
              <span>Largest route</span>
              <strong>{topTour?.[0] ?? 'No tour data'}</strong>
              <small>{topTour?.[1] ?? 0} shows in the archive</small>
            </div>
          </div>
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
              title="Energy and valence"
              eyebrow="Sound profile"
              caption="Scores are normalized from 0 to 1. Read the curve between eras before reading any single value."
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
              <div className="overview-chart-summary" aria-label="Chart reading notes">
                <div>
                  <span className="overview-chart-summary__key overview-chart-summary__key--energy" />
                  <strong>Energy</strong>
                  <small>movement, tempo, production intensity</small>
                </div>
                <div>
                  <span className="overview-chart-summary__key overview-chart-summary__key--valence" />
                  <strong>Valence</strong>
                  <small>emotional brightness across releases</small>
                </div>
              </div>
            </EvidencePanel>
          </div>
        </GallerySection>

        <GallerySection
          number="02"
          label="Shortcuts"
          title="Open the main archive drawers"
          claim="Jump to release records, member credits, tour routes, or award history from the current collection totals."
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
              description="Member records show authorship, solo work, collaborations, and linked catalog credits."
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
              actionLabel="Open awards"
              onClick={() => onNavigate('awards')}
            />
          </div>
        </GallerySection>
      </div>

      <GallerySection
        number="03"
        label="Recognition"
        title="Wins by year and ceremony"
        claim="Track the peak years, repeat ceremonies, and the total nomination-to-win record."
        caption="Open the awards page for category, scope, member, and ceremony filters."
      >
        <div className="overview-recognition-grid">
          <EvidencePanel
            title="Wins by year"
            eyebrow="Recognition timeline"
            caption="Counts include records marked as won in the local awards table."
            source="Source: awards dataset."
          >
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winsByYear} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'rgba(250,249,245,0.5)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(250,249,245,0.38)' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_STYLES.TOOLTIP} cursor={{ fill: 'rgba(217,119,87,0.08)' }} />
                  <Bar dataKey="count" fill="#d97757" fillOpacity={0.9} radius={[2, 2, 0, 0]} name="Wins" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EvidencePanel>
          <aside className="overview-ledger" aria-label="Recognition ledger">
            <div className="overview-ledger__row">
              <span>Peak year</span>
              <strong>{peakRecognitionYear.year.replace("'", '20')}</strong>
              <small>{peakRecognitionYear.count} wins recorded</small>
            </div>
            <div className="overview-ledger__row">
              <span>Most repeated ceremony</span>
              <strong>{topCeremony?.[0] ?? 'No ceremony data'}</strong>
              <small>{topCeremony?.[1] ?? 0} wins in local records</small>
            </div>
            <div className="overview-ledger__row">
              <span>Total nominations</span>
              <strong>{formatNumber(awards.length)}</strong>
              <small>{awardsWon} marked as won</small>
            </div>
            <button type="button" className="overview-ledger__action" onClick={() => onNavigate('awards')}>
              Open awards chronology
            </button>
          </aside>
        </div>
      </GallerySection>
    </main>
  );
}
