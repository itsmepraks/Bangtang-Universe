/**
 * Extract English text embedded in Korean lyrics.
 *
 * Many BTS songs have English choruses, phrases, or are fully English
 * (Dynamite, Butter, Permission to Dance, etc). This script parses
 * lyrics_korean for English-language content and writes it to
 * lyrics_english — no translation API needed.
 *
 * Also extracts themes + sentiment score and writes to lyrics + songs.
 *
 * Usage:
 *   npx tsx scripts/extract-english-from-korean.ts              # dry run
 *   npx tsx scripts/extract-english-from-korean.ts --commit     # write to DB
 */

import {
  createSupabaseAdmin,
  logStart,
  logSuccess,
  logError,
  logWarning,
  logDone,
} from './scrape-utils.js';
import {
  extractThemes,
  computeSentiment,
} from '../src/services/lyricsAnalysisService.js';

const supabase = createSupabaseAdmin();
const COMMIT = process.argv.includes('--commit');

// Sentiment label vocabulary (same as backfill-sentiment.ts)
const THEME_TO_LABEL: Record<string, string> = {
  Love: 'Love', 'Self-Love': 'Confidence', Youth: 'Joy', Dreams: 'Hope',
  Hardship: 'Pain', Hope: 'Hope', Loneliness: 'Longing', Anger: 'Rebellion',
  Freedom: 'Empowerment', Loss: 'Melancholy', Friendship: 'Comfort',
  Identity: 'Reflection', Night: 'Reflection', Resilience: 'Determination',
  Happiness: 'Joy', Nostalgia: 'Longing', Heartbreak: 'Pain',
  Desire: 'Longing', Society: 'Rebellion', Time: 'Reflection',
};

function pickLabel(themes: string[], score: number): string {
  if (themes.length === 0) {
    if (score > 0.3) return 'Joy';
    if (score > 0.05) return 'Hope';
    if (score < -0.3) return 'Pain';
    if (score < -0.05) return 'Melancholy';
    return 'Reflection';
  }
  const votes = new Map<string, number>();
  for (const t of themes) {
    const label = THEME_TO_LABEL[t];
    if (label) votes.set(label, (votes.get(label) ?? 0) + 1);
  }
  if (votes.size === 0) return 'Reflection';
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Extract English lines/words from mixed Korean+English text.
 * Returns the extracted English text, or null if too little English.
 */
function extractEnglish(text: string): string | null {
  const lines = text.split('\n');
  const englishLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Count ASCII letter characters vs total non-whitespace
    const nonSpace = trimmed.replace(/\s/g, '');
    const asciiLetters = (trimmed.match(/[a-zA-Z]/g) || []).length;
    const ratio = asciiLetters / nonSpace.length;

    // Line is mostly English if >60% ASCII letters
    if (ratio > 0.6 && asciiLetters >= 3) {
      // Clean up: remove Korean characters, keep English + punctuation
      const cleaned = trimmed
        .replace(/[\u3131-\u318E\uAC00-\uD7AF\u1100-\u11FF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleaned.length >= 3) {
        englishLines.push(cleaned);
      }
    }
  }

  const result = englishLines.join('\n').trim();
  // Need at least 20 chars of English to be useful for sentiment
  return result.length >= 20 ? result : null;
}

interface LyricRow {
  id: number;
  song_id: number;
  lyrics_korean: string;
  lyrics_english: string | null;
}

async function main() {
  logStart(`Extracting English from Korean lyrics ${COMMIT ? '(COMMIT)' : '(dry run)'}`);

  // Fetch lyrics with Korean text but no English text
  const rows: LyricRow[] = [];
  let from = 0;
  const PAGE = 500;
  while (true) {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, song_id, lyrics_korean, lyrics_english')
      .not('lyrics_korean', 'is', null)
      .is('lyrics_english', null)
      .range(from, from + PAGE - 1)
      .order('id');
    if (error) { logError(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    rows.push(...(data as LyricRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  logSuccess(`Found ${rows.length} Korean-only lyric rows`);

  let extracted = 0;
  let tooLittle = 0;
  let dbWritten = 0;
  let songsLabeled = 0;

  for (const row of rows) {
    const english = extractEnglish(row.lyrics_korean);
    if (!english) {
      tooLittle++;
      continue;
    }

    extracted++;
    const themes = extractThemes(english);
    const score = parseFloat(computeSentiment(english).toFixed(3));
    const label = pickLabel(themes, score);

    if (!COMMIT) {
      console.log(`   ✅ song ${row.song_id}: ${english.length} chars, ${themes.length} themes, score ${score} → ${label}`);
      continue;
    }

    // Write to lyrics
    const { error: lErr } = await supabase
      .from('lyrics')
      .update({
        lyrics_english: english,
        themes,
        sentiment_score: score,
      })
      .eq('id', row.id);

    if (lErr) {
      logError(`lyrics ${row.id}: ${lErr.message}`);
      continue;
    }
    dbWritten++;

    // Write to songs.sentiment if missing
    const { data: songRow } = await supabase
      .from('songs')
      .select('sentiment')
      .eq('id', row.song_id)
      .single();

    if (songRow && !songRow.sentiment) {
      const { error: sErr } = await supabase
        .from('songs')
        .update({ sentiment: label })
        .eq('id', row.song_id);
      if (!sErr) songsLabeled++;
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   Korean-only rows:      ${rows.length}`);
  console.log(`   English extracted:      ${extracted}`);
  console.log(`   Too little English:     ${tooLittle}`);
  if (COMMIT) {
    console.log(`   lyrics rows updated:    ${dbWritten}`);
    console.log(`   songs labeled:          ${songsLabeled}`);
  }
  if (!COMMIT) console.log(`\n   ⚠️  Dry run — re-run with --commit to write.`);

  logDone('English extraction complete');
}

main().catch((err) => { console.error(err); process.exit(1); });
