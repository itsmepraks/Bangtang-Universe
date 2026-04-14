/**
 * Song Recommendation Engine
 *
 * Computes song similarity using a 5-dimensional audio feature vector
 * and cosine similarity, with bonuses for matching sentiment and era.
 */

import type { Song, Album } from '../types/database';

// ==================== TYPES ====================

export interface SongRecommendation {
  song: Song;
  similarity: number; // 0-1
  reasons: string[];
  albumTitle: string;
}

// ==================== FEATURE EXTRACTION ====================

/**
 * Default value used when an audio feature is null.
 * 0.5 sits at the midpoint of the 0-1 normalized range,
 * so missing features have a neutral effect on similarity.
 */
const DEFAULT_FEATURE = 0.5;

/**
 * Normalizes BPM into the 0-1 range.
 * Assumes a practical range of 60-200 BPM.
 */
function normalizeBPM(bpm: number | null): number {
  if (bpm === null) return DEFAULT_FEATURE;
  return (bpm - 60) / 140;
}

/**
 * Builds a 5-dimensional feature vector for a song:
 *   [energy, valence, danceability, acousticness, normalizedBPM]
 *
 * Null features fall back to DEFAULT_FEATURE (0.5).
 */
function buildFeatureVector(song: Song): number[] {
  return [
    song.energy ?? DEFAULT_FEATURE,
    song.valence ?? DEFAULT_FEATURE,
    song.danceability ?? DEFAULT_FEATURE,
    song.acousticness ?? DEFAULT_FEATURE,
    normalizeBPM(song.bpm),
  ];
}

// ==================== SIMILARITY ====================

/**
 * Computes cosine similarity between two equal-length numeric vectors.
 *
 * Returns a value between 0 and 1 (clamped).
 * If either vector has zero magnitude the result is 0.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/** Count how many of the 5 audio features are non-null for a song. */
function featureCoverage(song: Song): number {
  let count = 0;
  if (song.energy != null) count++;
  if (song.valence != null) count++;
  if (song.danceability != null) count++;
  if (song.acousticness != null) count++;
  if (song.bpm != null) count++;
  return count;
}

/**
 * Text-based similarity when audio features are missing.
 * Uses sentiment match, era match, and shared writer overlap.
 */
function textSimilarity(
  target: Song,
  candidate: Song,
  targetEra: string | null,
  candidateEra: string | null,
): number {
  let score = 0;

  // Sentiment match (worth 0.35)
  if (target.sentiment && candidate.sentiment && target.sentiment === candidate.sentiment) {
    score += 0.35;
  }

  // Era match (worth 0.25)
  if (targetEra && candidateEra && targetEra === candidateEra) {
    score += 0.25;
  }

  // Shared writers (worth up to 0.25)
  const tw = new Set((target.writers ?? []).map(w => w.toLowerCase()));
  const cw = new Set((candidate.writers ?? []).map(w => w.toLowerCase()));
  if (tw.size > 0 && cw.size > 0) {
    let shared = 0;
    for (const w of tw) { if (cw.has(w)) shared++; }
    score += (shared / Math.max(tw.size, cw.size)) * 0.25;
  }

  // Same member credits (worth 0.15)
  const tm = new Set((target.member_credits ?? []).map(m => m.toLowerCase()));
  const cm = new Set((candidate.member_credits ?? []).map(m => m.toLowerCase()));
  if (tm.size > 0 && cm.size > 0) {
    let shared = 0;
    for (const m of tm) { if (cm.has(m)) shared++; }
    score += (shared / Math.max(tm.size, cm.size)) * 0.15;
  }

  return score;
}

// ==================== HELPERS ====================

/**
 * Looks up an album's era by album_id.
 * Returns null if no matching album is found or the album has no era.
 */
function getEra(albumId: number | null, albums: Album[]): string | null {
  if (albumId === null) return null;
  const album = albums.find((a) => a.id === albumId);
  return album?.era ?? null;
}

/**
 * Looks up an album's title by album_id.
 * Returns "Unknown Album" if not found.
 */
function getAlbumTitle(albumId: number | null, albums: Album[]): string {
  if (albumId === null) return 'Unknown Album';
  const album = albums.find((a) => a.id === albumId);
  return album?.title ?? 'Unknown Album';
}

/**
 * Generates human-readable reasons explaining why two songs are similar.
 */
function generateReasons(target: Song, candidate: Song, targetEra: string | null, candidateEra: string | null): string[] {
  const reasons: string[] = [];

  // Energy comparison
  const targetEnergy = target.energy ?? DEFAULT_FEATURE;
  const candidateEnergy = candidate.energy ?? DEFAULT_FEATURE;
  if (Math.abs(targetEnergy - candidateEnergy) <= 0.1) {
    reasons.push('Similar energy levels');
  }

  // Valence (emotional tone) comparison
  const targetValence = target.valence ?? DEFAULT_FEATURE;
  const candidateValence = candidate.valence ?? DEFAULT_FEATURE;
  if (Math.abs(targetValence - candidateValence) <= 0.1) {
    reasons.push('Similar emotional tone');
  }

  // Sentiment comparison
  if (
    target.sentiment !== null &&
    candidate.sentiment !== null &&
    target.sentiment === candidate.sentiment
  ) {
    reasons.push(`Shares ${target.sentiment} sentiment`);
  }

  // Era comparison
  if (
    targetEra !== null &&
    candidateEra !== null &&
    targetEra === candidateEra
  ) {
    reasons.push(`From the same era (${targetEra})`);
  }

  // BPM comparison
  if (target.bpm !== null && candidate.bpm !== null) {
    if (Math.abs(target.bpm - candidate.bpm) <= 10) {
      reasons.push('Similar tempo');
    }
  }

  // Danceability comparison
  const targetDance = target.danceability ?? DEFAULT_FEATURE;
  const candidateDance = candidate.danceability ?? DEFAULT_FEATURE;
  if (Math.abs(targetDance - candidateDance) <= 0.1) {
    reasons.push('Similar danceability');
  }

  // Shared writers
  const targetWriters = new Set((target.writers ?? []).map(w => w.toLowerCase()));
  const sharedWriters = (candidate.writers ?? []).filter(w => targetWriters.has(w.toLowerCase()));
  if (sharedWriters.length > 0) {
    reasons.push(`Shared writer: ${sharedWriters[0]}`);
  }

  if (reasons.length === 0) {
    reasons.push('Similar profile');
  }

  return reasons;
}

// ==================== MAIN EXPORT ====================

/**
 * Generates song recommendations based on audio feature similarity.
 *
 * Algorithm:
 * 1. Build a 5-dimensional feature vector for each song.
 * 2. Compute cosine similarity between the target and every other song.
 * 3. Apply bonuses for matching sentiment (+0.05) and era (+0.03).
 * 4. Cap similarity at 1.0.
 * 5. Sort descending by similarity and return the top `count` results.
 *
 * @param targetSong  The song to find recommendations for.
 * @param allSongs    The full catalogue of songs to search.
 * @param albums      Album data used for era lookups and titles.
 * @param count       Number of recommendations to return (default 8).
 */
export function getRecommendations(
  targetSong: Song,
  allSongs: Song[],
  albums: Album[],
  count: number = 8,
): SongRecommendation[] {
  const targetVector = buildFeatureVector(targetSong);
  const targetEra = getEra(targetSong.album_id, albums);

  const scored: SongRecommendation[] = [];

  const targetFeatures = featureCoverage(targetSong);
  const useAudio = targetFeatures >= 3;

  for (const candidate of allSongs) {
    if (candidate.id === targetSong.id) continue;

    const candidateEra = getEra(candidate.album_id, albums);
    let similarity: number;

    if (useAudio && featureCoverage(candidate) >= 3) {
      // Both have enough audio — use cosine similarity
      const candidateVector = buildFeatureVector(candidate);
      similarity = cosineSimilarity(targetVector, candidateVector);
      // Bonuses
      if (targetSong.sentiment && candidate.sentiment && targetSong.sentiment === candidate.sentiment) {
        similarity += 0.05;
      }
      if (targetEra && candidateEra && targetEra === candidateEra) {
        similarity += 0.03;
      }
    } else {
      // Fallback: text-based similarity
      similarity = textSimilarity(targetSong, candidate, targetEra, candidateEra);
    }

    similarity = Math.min(similarity, 1.0);
    const reasons = generateReasons(targetSong, candidate, targetEra, candidateEra);
    const albumTitle = getAlbumTitle(candidate.album_id, albums);

    scored.push({ song: candidate, similarity, reasons, albumTitle });
  }

  // Sort descending by similarity, then return the top `count`
  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, count);
}
