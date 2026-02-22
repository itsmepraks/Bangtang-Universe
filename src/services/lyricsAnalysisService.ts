/**
 * Lyrics Analysis Engine
 *
 * Pure TypeScript service for analyzing BTS lyrics data:
 * theme frequency, word frequency, and sentiment arcs.
 *
 * Implements the LyricsAnalysisProvider interface so the local
 * implementation can be swapped for an AI-backed provider later.
 */

import type { Lyrics, Song, Album } from '../types/database';

// ==================== Public Types ====================

export interface ThemeFrequency {
  theme: string;
  count: number;
  percentage: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface SentimentArcPoint {
  songTitle: string;
  songId: number;
  sentimentScore: number;
  albumTitle: string;
  era: string;
}

/** Interface for future AI swap */
export interface LyricsAnalysisProvider {
  analyzeThemes(lyrics: Lyrics[]): ThemeFrequency[];
  getWordFrequency(lyrics: Lyrics[], topN?: number): WordFrequency[];
  analyzeSentimentArc(
    lyrics: Lyrics[],
    songs: Song[],
    albums: Album[],
  ): SentimentArcPoint[];
}

// ==================== Constants ====================

const STOP_WORDS = new Set<string>([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'can', 'could', 'i', 'me', 'my', 'mine',
  'we', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his',
  'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs',
  'that', 'this', 'these', 'those', 'what', 'which', 'who', 'whom',
  'and', 'or', 'but', 'if', 'then', 'than', 'so', 'as', 'at', 'by',
  'for', 'from', 'in', 'into', 'of', 'on', 'to', 'up', 'with',
  'not', 'no', 'nor', 'too', 'very', 'just', 'about', 'above', 'after',
  'again', 'all', 'also', 'am', 'an', 'any', 'because', 'before',
  'between', 'both', 'each', 'few', 'here', 'how', 'more', 'most',
  'other', 'out', 'over', 'own', 'same', 'some', 'such', 'there',
  'through', 'under', 'until', 'when', 'where', 'while', 'why',
  "don't", "doesn't", "didn't", "won't", "wouldn't",
  "can't", "couldn't", "shouldn't", "isn't", "aren't",
  "wasn't", "weren't", "hasn't", "haven't", "hadn't",
]);

const MIN_WORD_LENGTH = 3;

// ==================== Helpers ====================

/**
 * Tokenize a block of English text into lowercase words
 * with punctuation stripped.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w));
}

// ==================== Implementation ====================

export class LocalLyricsAnalyzer implements LyricsAnalysisProvider {
  /**
   * Aggregate every `themes` array across all lyrics entries,
   * count occurrences of each theme, and compute the percentage
   * share of total theme mentions. Results are sorted by count
   * descending.
   */
  analyzeThemes(lyrics: Lyrics[]): ThemeFrequency[] {
    const counts = new Map<string, number>();
    let total = 0;

    for (const entry of lyrics) {
      if (!entry.themes) continue;
      for (const theme of entry.themes) {
        const normalized = theme.trim().toLowerCase();
        if (normalized.length === 0) continue;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
        total += 1;
      }
    }

    if (total === 0) return [];

    return Array.from(counts.entries())
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: parseFloat(((count / total) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Build a word-frequency list from English lyrics text.
   *
   * Processing pipeline:
   *   1. Split into words, lowercase, strip punctuation.
   *   2. Remove stop words.
   *   3. Remove words shorter than 3 characters.
   *   4. Count, sort descending, return top N.
   */
  getWordFrequency(lyrics: Lyrics[], topN: number = 100): WordFrequency[] {
    const counts = new Map<string, number>();

    for (const entry of lyrics) {
      if (!entry.lyrics_english) continue;
      const words = tokenize(entry.lyrics_english);
      for (const word of words) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }

  /**
   * Build a sentiment arc across the discography.
   *
   * For every lyric entry that has a `sentiment_score`, look up the
   * matching song and its album. The returned points are ordered by
   * album `release_date` (chronological), giving a timeline of
   * emotional tone across eras.
   *
   * Entries whose song or album cannot be resolved are silently
   * skipped so the arc remains clean.
   */
  analyzeSentimentArc(
    lyrics: Lyrics[],
    songs: Song[],
    albums: Album[],
  ): SentimentArcPoint[] {
    const songMap = new Map<number, Song>();
    for (const song of songs) {
      songMap.set(song.id, song);
    }

    const albumMap = new Map<number, Album>();
    for (const album of albums) {
      albumMap.set(album.id, album);
    }

    const points: (SentimentArcPoint & { releaseDate: string })[] = [];

    for (const entry of lyrics) {
      if (entry.sentiment_score == null) continue;

      const song = songMap.get(entry.song_id);
      if (!song || song.album_id == null) continue;

      const album = albumMap.get(song.album_id);
      if (!album) continue;

      points.push({
        songTitle: song.title,
        songId: song.id,
        sentimentScore: entry.sentiment_score,
        albumTitle: album.title,
        era: album.era ?? 'Unknown',
        releaseDate: album.release_date,
      });
    }

    // Sort chronologically by album release date
    points.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

    // Strip the internal releaseDate field before returning
    return points.map(({ releaseDate: _, ...point }) => point);
  }
}

// ==================== Singleton Export ====================

export const lyricsAnalyzer = new LocalLyricsAnalyzer();
