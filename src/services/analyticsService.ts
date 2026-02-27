/**
 * Analytics Engine for Bangtan Universe
 *
 * Pure TypeScript service — no React imports.
 * Provides statistical analysis of BTS discography data including
 * era evolution, writing networks, audio feature histograms,
 * sentiment analysis, correlations, and auto-generated insights.
 */

import type { Song, Album, Member, Award, Concert } from '../types/database';

// ==================== CONSTANTS ====================

const ERA_ORDER: string[] = [
  'School Trilogy',
  'HYYH',
  'Wings',
  'Love Yourself',
  'Map of the Soul',
  'BE',
  'Butter',
  'Proof',
  'Chapter 2',
];

// ==================== EXPORTED TYPES ====================

export interface EraStats {
  era: string;
  songCount: number;
  avgBpm: number;
  avgEnergy: number;
  avgValence: number;
  avgDanceability: number;
  avgAcousticness: number;
  albums: string[];
}

export interface WriterStats {
  name: string;
  songCount: number;
}

export interface WritingPair {
  writerA: string;
  writerB: string;
  coOccurrences: number;
}

export interface MemberContribution {
  memberId: string;
  stageName: string;
  color: string;
  komcaCredits: number;
  writerCredits: number;
  producerCredits: number;
  songCredits: number;
}

export interface SentimentDistribution {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface HistogramBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface AudioFeatureHistogram {
  feature: string;
  buckets: HistogramBucket[];
}

export interface SongRanking {
  category: string;
  songs: Array<{ id: number; title: string; value: number; album?: string }>;
}

export interface AlbumStats {
  albumId: number;
  title: string;
  era: string;
  songCount: number;
  avgBpm: number;
  avgEnergy: number;
  avgValence: number;
  avgDanceability: number;
  avgAcousticness: number;
}

export interface CorrelationResult {
  points: Array<{ x: number; y: number; title: string }>;
  coefficient: number;
}

export interface Insight {
  id: string;
  text: string;
  value?: string;
  category: 'era' | 'audio' | 'writing' | 'sentiment' | 'general';
}

// ==================== INTERNAL HELPERS ====================

/** Safely compute the arithmetic mean of an array of numbers. Returns 0 when empty. */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Round a number to a fixed number of decimal places. */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Extract non-null numeric values from a song array for a given feature. */
function extractNumeric(songs: Song[], key: keyof Song): number[] {
  return songs
    .map((s) => s[key])
    .filter((v): v is number => typeof v === 'number' && v !== null);
}

/** Build an album lookup map keyed by album id. */
function buildAlbumMap(albums: Album[]): Map<number, Album> {
  const map = new Map<number, Album>();
  for (const album of albums) {
    map.set(album.id, album);
  }
  return map;
}

/** Generate a deterministic pair key so (A,B) and (B,A) map to the same entry. */
function pairKey(a: string, b: string): string {
  return a < b ? `${a}|||${b}` : `${b}|||${a}`;
}

// ==================== EXPORTED FUNCTIONS ====================

/**
 * Group songs by their album's era and compute average audio features per era.
 * Results are sorted chronologically according to ERA_ORDER.
 */
export function computeEraEvolution(songs: Song[], albums: Album[]): EraStats[] {
  const albumMap = buildAlbumMap(albums);

  // Accumulate songs per era
  const eraMap = new Map<
    string,
    { songs: Song[]; albumTitles: Set<string> }
  >();

  for (const song of songs) {
    if (song.album_id === null) continue;
    const album = albumMap.get(song.album_id);
    if (!album || album.era === null) continue;

    const era = album.era;
    if (!eraMap.has(era)) {
      eraMap.set(era, { songs: [], albumTitles: new Set() });
    }
    const entry = eraMap.get(era)!;
    entry.songs.push(song);
    entry.albumTitles.add(album.title);
  }

  // Build stats and sort by ERA_ORDER
  const results: EraStats[] = [];

  for (const era of ERA_ORDER) {
    const entry = eraMap.get(era);
    if (!entry) continue;

    const eraSongs = entry.songs;
    results.push({
      era,
      songCount: eraSongs.length,
      avgBpm: round(mean(extractNumeric(eraSongs, 'bpm'))),
      avgEnergy: round(mean(extractNumeric(eraSongs, 'energy'))),
      avgValence: round(mean(extractNumeric(eraSongs, 'valence'))),
      avgDanceability: round(mean(extractNumeric(eraSongs, 'danceability'))),
      avgAcousticness: round(mean(extractNumeric(eraSongs, 'acousticness'))),
      albums: Array.from(entry.albumTitles),
    });
  }

  // Append any eras not in ERA_ORDER (future-proofing)
  for (const [era, entry] of eraMap.entries()) {
    if (ERA_ORDER.includes(era)) continue;
    const eraSongs = entry.songs;
    results.push({
      era,
      songCount: eraSongs.length,
      avgBpm: round(mean(extractNumeric(eraSongs, 'bpm'))),
      avgEnergy: round(mean(extractNumeric(eraSongs, 'energy'))),
      avgValence: round(mean(extractNumeric(eraSongs, 'valence'))),
      avgDanceability: round(mean(extractNumeric(eraSongs, 'danceability'))),
      avgAcousticness: round(mean(extractNumeric(eraSongs, 'acousticness'))),
      albums: Array.from(entry.albumTitles),
    });
  }

  return results;
}

/**
 * Analyse the writing network: per-writer song counts and co-occurrence pairs.
 * Returns the full writer list, all pairs, and the top 10 pairs by co-occurrences.
 */
export function computeWritingNetwork(songs: Song[]): {
  writers: WriterStats[];
  pairs: WritingPair[];
  topPairs: WritingPair[];
} {
  const writerCounts = new Map<string, number>();
  const pairCounts = new Map<string, { writerA: string; writerB: string; count: number }>();

  for (const song of songs) {
    const writers = song.writers;
    if (!writers || writers.length === 0) continue;

    // Deduplicate writers within a single song
    const unique = Array.from(new Set(writers));

    for (const writer of unique) {
      writerCounts.set(writer, (writerCounts.get(writer) ?? 0) + 1);
    }

    // Generate all unordered pairs
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const key = pairKey(unique[i], unique[j]);
        if (!pairCounts.has(key)) {
          const [a, b] = unique[i] < unique[j]
            ? [unique[i], unique[j]]
            : [unique[j], unique[i]];
          pairCounts.set(key, { writerA: a, writerB: b, count: 0 });
        }
        pairCounts.get(key)!.count += 1;
      }
    }
  }

  const writerStats: WriterStats[] = Array.from(writerCounts.entries())
    .map(([name, songCount]) => ({ name, songCount }))
    .sort((a, b) => b.songCount - a.songCount);

  const allPairs: WritingPair[] = Array.from(pairCounts.values())
    .map((p) => ({ writerA: p.writerA, writerB: p.writerB, coOccurrences: p.count }))
    .sort((a, b) => b.coOccurrences - a.coOccurrences);

  const topPairs = allPairs.slice(0, 10);

  return { writers: writerStats, pairs: allPairs, topPairs };
}

/**
 * Compute per-member contribution statistics.
 * Uses Member table data for KOMCA / writer / producer credits and scans
 * Song.member_credits arrays for song-level credit counts.
 * Sorted by komcaCredits descending.
 */
export function computeMemberContributions(
  members: Member[],
  songs: Song[],
): MemberContribution[] {
  // Pre-compute song credit counts per stage name
  const songCreditCounts = new Map<string, number>();
  for (const song of songs) {
    if (!song.member_credits) continue;
    const unique = new Set(song.member_credits);
    for (const name of unique) {
      songCreditCounts.set(name, (songCreditCounts.get(name) ?? 0) + 1);
    }
  }

  const contributions: MemberContribution[] = members.map((m) => ({
    memberId: m.id,
    stageName: m.stage_name,
    color: m.color ?? '#888888',
    komcaCredits: m.komca_credits,
    writerCredits: m.writer_credits,
    producerCredits: m.producer_credits,
    songCredits: songCreditCounts.get(m.stage_name) ?? 0,
  }));

  contributions.sort((a, b) => b.komcaCredits - a.komcaCredits);
  return contributions;
}

/**
 * Compute the distribution of sentiment labels across songs.
 * Null sentiments are skipped. Results sorted by count descending.
 */
export function computeSentimentDistribution(songs: Song[]): SentimentDistribution[] {
  const counts = new Map<string, number>();
  let total = 0;

  for (const song of songs) {
    if (song.sentiment === null || song.sentiment === undefined) continue;
    counts.set(song.sentiment, (counts.get(song.sentiment) ?? 0) + 1);
    total += 1;
  }

  const distribution: SentimentDistribution[] = Array.from(counts.entries())
    .map(([sentiment, count]) => ({
      sentiment,
      count,
      percentage: total > 0 ? round((count / total) * 100, 1) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return distribution;
}

/**
 * Compute sentiment distribution broken down by era.
 * Keys are era names; values are SentimentDistribution arrays.
 */
export function computeSentimentByEra(
  songs: Song[],
  albums: Album[],
): Record<string, SentimentDistribution[]> {
  const albumMap = buildAlbumMap(albums);

  // Group songs by era
  const eraSongs = new Map<string, Song[]>();
  for (const song of songs) {
    if (song.album_id === null) continue;
    const album = albumMap.get(song.album_id);
    if (!album || album.era === null) continue;
    if (!eraSongs.has(album.era)) {
      eraSongs.set(album.era, []);
    }
    eraSongs.get(album.era)!.push(song);
  }

  const result: Record<string, SentimentDistribution[]> = {};

  // Iterate in ERA_ORDER for consistent key ordering
  for (const era of ERA_ORDER) {
    const songs = eraSongs.get(era);
    if (!songs) continue;
    result[era] = computeSentimentDistribution(songs);
  }

  // Append eras not in ERA_ORDER
  for (const [era, songs] of eraSongs.entries()) {
    if (ERA_ORDER.includes(era)) continue;
    result[era] = computeSentimentDistribution(songs);
  }

  return result;
}

/**
 * Create 10-bucket histograms for key audio features.
 * BPM uses range 60-200; energy, valence, danceability, acousticness use 0-1.
 */
export function computeAudioHistograms(songs: Song[]): AudioFeatureHistogram[] {
  const features: Array<{ key: keyof Song; label: string; min: number; max: number }> = [
    { key: 'bpm', label: 'BPM', min: 60, max: 200 },
    { key: 'energy', label: 'Energy', min: 0, max: 1 },
    { key: 'valence', label: 'Valence', min: 0, max: 1 },
    { key: 'danceability', label: 'Danceability', min: 0, max: 1 },
    { key: 'acousticness', label: 'Acousticness', min: 0, max: 1 },
  ];

  return features.map(({ key, label, min, max }) => {
    const values = extractNumeric(songs, key);
    const bucketCount = 10;
    const step = (max - min) / bucketCount;

    const buckets: HistogramBucket[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketMin = round(min + i * step, 1);
      const bucketMax = round(min + (i + 1) * step, 1);
      const rangeLabel =
        label === 'BPM'
          ? `${Math.round(bucketMin)}-${Math.round(bucketMax)}`
          : `${bucketMin.toFixed(1)}-${bucketMax.toFixed(1)}`;

      buckets.push({
        range: rangeLabel,
        min: bucketMin,
        max: bucketMax,
        count: 0,
      });
    }

    for (const v of values) {
      // Clamp value to [min, max) then assign to bucket
      const clamped = Math.min(Math.max(v, min), max);
      let idx = Math.floor((clamped - min) / step);
      // Values exactly equal to max go into the last bucket
      if (idx >= bucketCount) idx = bucketCount - 1;
      buckets[idx].count += 1;
    }

    return { feature: label, buckets };
  });
}

/**
 * Compute top-10 song rankings across multiple audio feature categories.
 * Each ranking includes the album title when available.
 */
export function computeRankings(songs: Song[], albums: Album[]): SongRanking[] {
  const albumMap = buildAlbumMap(albums);

  function albumTitle(song: Song): string | undefined {
    if (song.album_id === null) return undefined;
    return albumMap.get(song.album_id)?.title;
  }

  type RankingDef = {
    category: string;
    key: keyof Song;
    order: 'asc' | 'desc';
  };

  const definitions: RankingDef[] = [
    { category: 'Highest Energy', key: 'energy', order: 'desc' },
    { category: 'Lowest Energy', key: 'energy', order: 'asc' },
    { category: 'Highest Valence', key: 'valence', order: 'desc' },
    { category: 'Lowest Valence', key: 'valence', order: 'asc' },
    { category: 'Fastest BPM', key: 'bpm', order: 'desc' },
    { category: 'Slowest BPM', key: 'bpm', order: 'asc' },
    { category: 'Most Danceable', key: 'danceability', order: 'desc' },
    { category: 'Most Acoustic', key: 'acousticness', order: 'desc' },
  ];

  return definitions.map(({ category, key, order }) => {
    const filtered = songs.filter(
      (s) => s[key] !== null && s[key] !== undefined && typeof s[key] === 'number',
    );

    const sorted = [...filtered].sort((a, b) => {
      const va = a[key] as number;
      const vb = b[key] as number;
      return order === 'desc' ? vb - va : va - vb;
    });

    const top10 = sorted.slice(0, 10).map((s) => ({
      id: s.id,
      title: s.title,
      value: round(s[key] as number, 3),
      album: albumTitle(s),
    }));

    return { category, songs: top10 };
  });
}

/**
 * Compute per-album audio feature averages.
 * Sorted by album release_date ascending.
 */
export function computeAlbumStats(songs: Song[], albums: Album[]): AlbumStats[] {
  const albumMap = buildAlbumMap(albums);

  // Group songs by album_id
  const songsByAlbum = new Map<number, Song[]>();
  for (const song of songs) {
    if (song.album_id === null) continue;
    if (!songsByAlbum.has(song.album_id)) {
      songsByAlbum.set(song.album_id, []);
    }
    songsByAlbum.get(song.album_id)!.push(song);
  }

  const stats: AlbumStats[] = [];

  for (const [albumId, albumSongs] of songsByAlbum.entries()) {
    const album = albumMap.get(albumId);
    if (!album) continue;

    stats.push({
      albumId: album.id,
      title: album.title,
      era: album.era ?? 'Unknown',
      songCount: albumSongs.length,
      avgBpm: round(mean(extractNumeric(albumSongs, 'bpm'))),
      avgEnergy: round(mean(extractNumeric(albumSongs, 'energy'))),
      avgValence: round(mean(extractNumeric(albumSongs, 'valence'))),
      avgDanceability: round(mean(extractNumeric(albumSongs, 'danceability'))),
      avgAcousticness: round(mean(extractNumeric(albumSongs, 'acousticness'))),
    });
  }

  stats.sort((a, b) => {
    const albumA = albumMap.get(a.albumId);
    const albumB = albumMap.get(b.albumId);
    const dateA = albumA?.release_date ?? '';
    const dateB = albumB?.release_date ?? '';
    return dateA.localeCompare(dateB);
  });

  return stats;
}

/**
 * Compute the Pearson correlation coefficient between two numeric song features.
 * Returns the scatter-plot points and the coefficient.
 * Songs with null values for either feature are excluded.
 */
export function computeCorrelation(
  songs: Song[],
  featureX: keyof Song,
  featureY: keyof Song,
): CorrelationResult {
  const points: Array<{ x: number; y: number; title: string }> = [];

  for (const song of songs) {
    const x = song[featureX];
    const y = song[featureY];
    if (typeof x !== 'number' || x === null || typeof y !== 'number' || y === null) {
      continue;
    }
    points.push({ x, y, title: song.title });
  }

  if (points.length < 2) {
    return { points, coefficient: 0 };
  }

  // Pearson correlation
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  const coefficient = denominator === 0 ? 0 : round(numerator / denominator, 3);

  return { points, coefficient };
}

/**
 * Auto-generate 8-12 textual insights from the full dataset.
 * Each insight has a unique id, descriptive text, an optional highlighted value,
 * and a category tag.
 */
export function generateInsights(
  songs: Song[],
  albums: Album[],
  members: Member[],
  awards?: Award[],
  concerts?: Concert[],
): Insight[] {
  const insights: Insight[] = [];

  // --- Era insights ---
  const eras = computeEraEvolution(songs, albums);

  if (eras.length > 0) {
    // Most energetic era
    const mostEnergetic = [...eras].sort((a, b) => b.avgEnergy - a.avgEnergy)[0];
    insights.push({
      id: 'era-most-energetic',
      text: `The most energetic era is ${mostEnergetic.era} with an average energy of ${mostEnergetic.avgEnergy}`,
      value: String(mostEnergetic.avgEnergy),
      category: 'era',
    });

    // BPM trend across eras
    if (eras.length >= 2) {
      const first = eras[0];
      const last = eras[eras.length - 1];
      const direction = last.avgBpm > first.avgBpm ? 'increased' : 'decreased';
      insights.push({
        id: 'era-bpm-trend',
        text: `Average BPM has ${direction} from ${first.avgBpm} (${first.era}) to ${last.avgBpm} (${last.era}) across eras`,
        value: `${first.avgBpm} -> ${last.avgBpm}`,
        category: 'era',
      });
    }

    // Largest era by song count
    const largestEra = [...eras].sort((a, b) => b.songCount - a.songCount)[0];
    insights.push({
      id: 'era-largest',
      text: `${largestEra.era} is the largest era with ${largestEra.songCount} songs across ${largestEra.albums.length} album(s)`,
      value: String(largestEra.songCount),
      category: 'era',
    });
  }

  // --- Writing insights ---
  const memberContributions = computeMemberContributions(members, songs);

  if (memberContributions.length > 0) {
    const topWriter = memberContributions[0]; // sorted by komcaCredits desc
    insights.push({
      id: 'writing-top-komca',
      text: `${topWriter.stageName} leads songwriting with ${topWriter.komcaCredits} KOMCA credits`,
      value: String(topWriter.komcaCredits),
      category: 'writing',
    });
  }

  const writingNetwork = computeWritingNetwork(songs);
  if (writingNetwork.topPairs.length > 0) {
    const topPair = writingNetwork.topPairs[0];
    insights.push({
      id: 'writing-top-pair',
      text: `${topPair.writerA} and ${topPair.writerB} are the most frequent writing duo with ${topPair.coOccurrences} co-written songs`,
      value: String(topPair.coOccurrences),
      category: 'writing',
    });
  }

  // --- Sentiment insights ---
  const sentiments = computeSentimentDistribution(songs);

  if (sentiments.length > 0) {
    const topSentiment = sentiments[0];
    insights.push({
      id: 'sentiment-most-common',
      text: `${topSentiment.sentiment} is the most common sentiment (${topSentiment.count} songs, ${topSentiment.percentage}%)`,
      value: `${topSentiment.count}`,
      category: 'sentiment',
    });

    if (sentiments.length >= 2) {
      const leastSentiment = sentiments[sentiments.length - 1];
      insights.push({
        id: 'sentiment-least-common',
        text: `${leastSentiment.sentiment} is the least common sentiment with only ${leastSentiment.count} song(s)`,
        value: String(leastSentiment.count),
        category: 'sentiment',
      });
    }
  }

  // --- Audio feature insights ---
  const bpmValues = extractNumeric(songs, 'bpm');
  if (bpmValues.length > 0) {
    const above120 = bpmValues.filter((v) => v > 120).length;
    const pct = round((above120 / bpmValues.length) * 100, 1);
    insights.push({
      id: 'audio-bpm-above-120',
      text: `${pct}% of songs have a BPM above 120`,
      value: `${pct}%`,
      category: 'audio',
    });
  }

  // Energy-Valence correlation
  const evCorrelation = computeCorrelation(songs, 'energy', 'valence');
  if (evCorrelation.points.length >= 2) {
    const strength =
      Math.abs(evCorrelation.coefficient) > 0.5
        ? 'strong'
        : Math.abs(evCorrelation.coefficient) > 0.3
          ? 'moderate'
          : 'weak';
    insights.push({
      id: 'audio-energy-valence-corr',
      text: `Energy and valence have a ${strength} correlation of ${evCorrelation.coefficient}`,
      value: String(evCorrelation.coefficient),
      category: 'audio',
    });
  }

  // --- General insights ---
  const titleTracks = songs.filter((s) => s.is_title_track);
  insights.push({
    id: 'general-title-tracks',
    text: `${titleTracks.length} out of ${songs.length} songs are title tracks`,
    value: String(titleTracks.length),
    category: 'general',
  });

  const mvCount = songs.filter((s) => s.has_mv).length;
  insights.push({
    id: 'general-mv-count',
    text: `${mvCount} songs have official music videos`,
    value: String(mvCount),
    category: 'general',
  });

  const uniqueWriters = writingNetwork.writers.length;
  insights.push({
    id: 'general-unique-writers',
    text: `${uniqueWriters} unique writers have contributed to the discography`,
    value: String(uniqueWriters),
    category: 'writing',
  });

  // --- Awards insights ---
  if (awards && awards.length > 0) {
    const awardsWon = awards.filter(a => a.result === 'won').length;
    const ceremonies = new Set(awards.map(a => a.ceremony));
    const ceremonyCounts = new Map<string, number>();
    for (const award of awards.filter(a => a.result === 'won')) {
      ceremonyCounts.set(award.ceremony, (ceremonyCounts.get(award.ceremony) ?? 0) + 1);
    }
    const topCeremony = [...ceremonyCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: 'awards-overview',
      text: `BTS has won ${awardsWon} awards across ${ceremonies.size} ceremonies${topCeremony ? `, with most wins at ${topCeremony[0]}` : ''}`,
      value: String(awardsWon),
      category: 'general',
    });
  }

  // --- Concert insights ---
  if (concerts && concerts.length > 0) {
    const countries = new Set(concerts.map(c => c.country));
    const tours = new Set(concerts.map(c => c.tour_name));
    insights.push({
      id: 'concerts-overview',
      text: `BTS has performed ${concerts.length} concerts across ${countries.size} countries, with ${tours.size} different tours`,
      value: String(concerts.length),
      category: 'general',
    });
  }

  // --- Chart-friendly era insight ---
  if (eras.length > 0) {
    const eraTitleTrackCounts = eras.map(era => {
      const albumMap = buildAlbumMap(albums);
      const eraTitleTracks = songs.filter(s => {
        if (!s.is_title_track || s.album_id === null) return false;
        const album = albumMap.get(s.album_id);
        return album?.era === era.era;
      });
      return { era: era.era, count: eraTitleTracks.length };
    }).sort((a, b) => b.count - a.count);

    if (eraTitleTrackCounts.length > 0 && eraTitleTrackCounts[0].count > 0) {
      insights.push({
        id: 'era-most-title-tracks',
        text: `The era with the most title tracks is ${eraTitleTrackCounts[0].era} with ${eraTitleTrackCounts[0].count} title tracks`,
        value: String(eraTitleTrackCounts[0].count),
        category: 'era',
      });
    }
  }

  return insights;
}
