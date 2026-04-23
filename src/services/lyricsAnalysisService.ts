import type { Lyrics, Song, Album } from '../types/database';

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

// Abstraction so the local analyzer can be swapped for an AI-backed provider.
export interface LyricsAnalysisProvider {
  analyzeThemes(lyrics: Lyrics[]): ThemeFrequency[];
  getWordFrequency(lyrics: Lyrics[], topN?: number): WordFrequency[];
  analyzeSentimentArc(
    lyrics: Lyrics[],
    songs: Song[],
    albums: Album[],
  ): SentimentArcPoint[];
}

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

const THEME_KEYWORDS: Record<string, string[]> = {
  'Love': ['love', 'heart', 'kiss', 'darling', 'baby', 'sweetheart', 'romance', 'loved', 'loving', 'lover', 'adore'],
  'Self-Love': ['myself', 'self', 'own way', 'who i am', 'love myself', 'my own', 'worth', 'enough', 'accept'],
  'Youth': ['young', 'youth', 'teenage', 'school', 'grow', 'growing', 'young forever', 'adolescent', 'twenties'],
  'Dreams': ['dream', 'dreams', 'dreaming', 'ambition', 'goal', 'wish', 'aspire', 'achieve', 'success', 'make it'],
  'Hardship': ['hard', 'pain', 'struggle', 'suffer', 'difficult', 'tough', 'burden', 'weight', 'pressure', 'stress', 'exhausted', 'tired'],
  'Hope': ['hope', 'hopeful', 'tomorrow', 'future', 'bright', 'light', 'believe', 'faith', 'forward', 'someday'],
  'Loneliness': ['alone', 'lonely', 'loneliness', 'empty', 'isolated', 'solitude', 'nobody', 'by myself', 'without you'],
  'Anger': ['angry', 'anger', 'mad', 'rage', 'hate', 'fire', 'burn', 'furious', 'fight', 'war', 'destroy'],
  'Freedom': ['free', 'freedom', 'fly', 'flying', 'wings', 'escape', 'break free', 'let go', 'liberate', 'run'],
  'Loss': ['lost', 'lose', 'gone', 'miss', 'missing', 'farewell', 'goodbye', 'left', 'apart', 'separation', 'away'],
  'Friendship': ['friend', 'friends', 'together', 'us', 'bond', 'brothers', 'side by side', 'crew', 'family'],
  'Identity': ['who am i', 'identity', 'name', 'face', 'mask', 'real', 'fake', 'persona', 'true self', 'mirror'],
  'Night': ['night', 'midnight', 'dark', 'darkness', 'moon', 'moonlight', 'stars', 'shadow', 'dawn'],
  'Resilience': ['strong', 'strength', 'overcome', 'rise', 'stand up', 'keep going', 'never give up', 'survive', 'endure', 'persist'],
  'Happiness': ['happy', 'happiness', 'joy', 'smile', 'laugh', 'fun', 'paradise', 'heaven', 'euphoria', 'bliss'],
  'Nostalgia': ['remember', 'memory', 'memories', 'past', 'old days', 'used to', 'back then', 'childhood', 'those days'],
  'Heartbreak': ['break', 'broken', 'cry', 'crying', 'tears', 'hurt', 'wound', 'scar', 'shatter', 'torn'],
  'Desire': ['want', 'need', 'desire', 'crave', 'hunger', 'thirst', 'temptation', 'obsess', 'addicted'],
  'Society': ['society', 'world', 'system', 'money', 'rich', 'poor', 'class', 'judge', 'standard', 'generation'],
  'Time': ['time', 'moment', 'forever', 'eternal', 'clock', 'season', 'year', 'day', 'hour', 'wait', 'passing'],
};

const POSITIVE_WORDS = new Set([
  'love', 'happy', 'happiness', 'joy', 'beautiful', 'smile', 'laugh', 'hope',
  'dream', 'light', 'bright', 'shine', 'wonderful', 'amazing', 'paradise',
  'heaven', 'free', 'freedom', 'fly', 'wings', 'together', 'forever',
  'warm', 'sweet', 'magic', 'star', 'sun', 'sunrise', 'golden',
  'celebrate', 'dance', 'party', 'fun', 'best', 'perfect', 'blessing',
  'trust', 'faith', 'believe', 'peace', 'calm', 'gentle', 'kind',
  'strong', 'brave', 'courage', 'inspire', 'alive', 'good', 'great',
  'thank', 'grateful', 'proud', 'rise', 'bloom', 'blossom', 'spring',
  'euphoria', 'bliss', 'treasure', 'precious', 'dear', 'adore',
]);

const NEGATIVE_WORDS = new Set([
  'hate', 'pain', 'hurt', 'cry', 'tears', 'sad', 'lonely', 'alone',
  'dark', 'darkness', 'shadow', 'lost', 'lose', 'broken', 'break',
  'angry', 'anger', 'rage', 'fear', 'scared', 'afraid', 'die', 'death',
  'kill', 'destroy', 'war', 'fight', 'blood', 'wound', 'scar',
  'empty', 'nothing', 'never', 'gone', 'goodbye', 'farewell', 'end',
  'fall', 'falling', 'drown', 'suffocate', 'trapped', 'prison', 'cage',
  'cold', 'frozen', 'burn', 'fire', 'hell', 'devil', 'fake', 'lie',
  'betray', 'abandon', 'forget', 'blame', 'guilt', 'regret', 'sorry',
  'exhausted', 'tired', 'weak', 'helpless', 'hopeless', 'desperate',
  'nightmare', 'suffer', 'misery', 'cruel', 'bitter', 'toxic', 'sick',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w));
}

export function extractThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        matched.push(theme);
        break;
      }
    }
  }
  return matched;
}

// Returns a value roughly in [-1, 1].
export function computeSentiment(text: string): number {
  const words = text.toLowerCase().replace(/[^a-z'\s-]/g, ' ').split(/\s+/);
  let positive = 0;
  let negative = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) positive++;
    if (NEGATIVE_WORDS.has(w)) negative++;
  }
  const total = positive + negative;
  if (total === 0) return 0;
  return (positive - negative) / total;
}

export class LocalLyricsAnalyzer implements LyricsAnalysisProvider {
  analyzeThemes(lyrics: Lyrics[]): ThemeFrequency[] {
    const counts = new Map<string, number>();
    let total = 0;

    for (const entry of lyrics) {
      const themes = entry.themes && entry.themes.length > 0
        ? entry.themes
        : entry.lyrics_english
          ? extractThemes(entry.lyrics_english)
          : null;

      if (!themes) continue;
      for (const theme of themes) {
        const normalized = theme.trim();
        if (normalized.length === 0) continue;
        const display = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        counts.set(display, (counts.get(display) ?? 0) + 1);
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

  // Points are ordered by album release_date, so the arc is chronological.
  // Entries without a resolvable song or album are skipped.
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
      const score = entry.sentiment_score ?? (
        entry.lyrics_english ? computeSentiment(entry.lyrics_english) : null
      );
      if (score == null) continue;

      const song = songMap.get(entry.song_id);
      if (!song || song.album_id == null) continue;

      const album = albumMap.get(song.album_id);
      if (!album) continue;

      points.push({
        songTitle: song.title,
        songId: song.id,
        sentimentScore: score,
        albumTitle: album.title,
        era: album.era ?? 'Unknown',
        releaseDate: album.release_date,
      });
    }

    points.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

    return points.map(({ releaseDate: _, ...point }) => point);
  }
}

export const lyricsAnalyzer = new LocalLyricsAnalyzer();
