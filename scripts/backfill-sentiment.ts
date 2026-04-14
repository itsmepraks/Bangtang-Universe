/**
 * Backfill sentiment + themes for every song that has English lyrics.
 *
 * Reads lyrics.lyrics_english, runs the in-repo lyricsAnalysisService
 * (no external API), and writes:
 *   - lyrics.sentiment_score    numeric -1..1
 *   - lyrics.themes             text[]
 *   - songs.sentiment           single label from the controlled vocabulary
 *
 * Existing songs.sentiment values are preserved unless --force is passed.
 *
 * Usage:
 *   npx tsx scripts/backfill-sentiment.ts            # dry run (no writes)
 *   npx tsx scripts/backfill-sentiment.ts --commit   # write to DB
 *   npx tsx scripts/backfill-sentiment.ts --commit --force  # also overwrite
 */

import {
  createSupabaseAdmin,
  logStart,
  logSuccess,
  logError,
  logDone,
} from './scrape-utils.js';
import {
  extractThemes,
  computeSentiment,
} from '../src/services/lyricsAnalysisService.js';

const supabase = createSupabaseAdmin();
const COMMIT = process.argv.includes('--commit');
const FORCE = process.argv.includes('--force');

// Theme name → controlled-vocab sentiment label
// Vocabulary derived from existing data:
//   Joy, Pain, Comfort, Determination, Gratitude, Love, Reflection,
//   Celebration, Confidence, Empowerment, Fear, Longing, Melancholy, Hope, Rebellion
const THEME_TO_LABEL: Record<string, string> = {
  Love: 'Love',
  'Self-Love': 'Confidence',
  Youth: 'Joy',
  Dreams: 'Hope',
  Hardship: 'Pain',
  Hope: 'Hope',
  Loneliness: 'Longing',
  Anger: 'Rebellion',
  Freedom: 'Empowerment',
  Loss: 'Melancholy',
  Friendship: 'Comfort',
  Identity: 'Reflection',
  Night: 'Reflection',
  Resilience: 'Determination',
  Happiness: 'Joy',
  Nostalgia: 'Longing',
  Heartbreak: 'Pain',
  Desire: 'Longing',
  Society: 'Rebellion',
  Time: 'Reflection',
};

/**
 * Pick a single label given the matched themes and the numeric score.
 * Strategy: vote across themes; tiebreak with sign of score.
 */
function pickLabel(themes: string[], score: number): string | null {
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
    if (!label) continue;
    votes.set(label, (votes.get(label) ?? 0) + 1);
  }
  if (votes.size === 0) return null;
  const sorted = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  // If clear winner, use it
  if (sorted.length === 1 || sorted[0][1] > sorted[1][1]) {
    return sorted[0][0];
  }
  // Tie — bias by score
  const positiveLabels = ['Joy', 'Hope', 'Love', 'Confidence', 'Empowerment', 'Comfort', 'Celebration', 'Gratitude'];
  const negativeLabels = ['Pain', 'Melancholy', 'Longing', 'Fear', 'Rebellion'];
  const tied = sorted.filter((x) => x[1] === sorted[0][1]).map((x) => x[0]);
  if (score >= 0) {
    const pos = tied.find((l) => positiveLabels.includes(l));
    if (pos) return pos;
  } else {
    const neg = tied.find((l) => negativeLabels.includes(l));
    if (neg) return neg;
  }
  return tied[0];
}

interface LyricRow {
  id: number;
  song_id: number;
  lyrics_english: string | null;
  sentiment_score: number | null;
  themes: string[] | null;
}

interface SongRow {
  id: number;
  title: string;
  sentiment: string | null;
}

async function main() {
  logStart(`Backfilling sentiment ${COMMIT ? '(COMMIT)' : '(dry run)'}${FORCE ? ' [force]' : ''}`);

  // Pull all lyrics with English text. Paginate to be safe.
  const lyricsRows: LyricRow[] = [];
  const PAGE = 500;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, song_id, lyrics_english, sentiment_score, themes')
      .not('lyrics_english', 'is', null)
      .range(from, from + PAGE - 1)
      .order('id');
    if (error) {
      logError(`fetch lyrics: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    lyricsRows.push(...(data as LyricRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  logSuccess(`Loaded ${lyricsRows.length} lyric rows with English text`);

  const songIds = [...new Set(lyricsRows.map((l) => l.song_id))];
  const { data: songsData, error: sErr } = await supabase
    .from('songs')
    .select('id, title, sentiment')
    .in('id', songIds);
  if (sErr) {
    logError(`fetch songs: ${sErr.message}`);
    process.exit(1);
  }
  const songMap = new Map<number, SongRow>();
  for (const s of (songsData as SongRow[]) ?? []) songMap.set(s.id, s);
  logSuccess(`Loaded ${songMap.size} matching songs`);

  let lyricsUpdated = 0;
  let songsUpdated = 0;
  let songsSkipped = 0;
  let labelCounts = new Map<string, number>();
  const errors: string[] = [];

  for (const lyric of lyricsRows) {
    const text = lyric.lyrics_english;
    if (!text || text.trim().length < 20) continue;

    const themes = extractThemes(text);
    const score = computeSentiment(text);
    const song = songMap.get(lyric.song_id);
    if (!song) continue;

    const label = pickLabel(themes, score);

    // Update lyrics row (always — these were never set before for new songs)
    if (COMMIT) {
      const { error } = await supabase
        .from('lyrics')
        .update({
          sentiment_score: parseFloat(score.toFixed(3)),
          themes,
        })
        .eq('id', lyric.id);
      if (error) {
        errors.push(`lyrics ${lyric.id}: ${error.message}`);
      } else {
        lyricsUpdated++;
      }
    } else {
      lyricsUpdated++;
    }

    // Update song sentiment if missing (or --force)
    if (label && (FORCE || !song.sentiment)) {
      labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
      if (COMMIT) {
        const { error } = await supabase
          .from('songs')
          .update({ sentiment: label })
          .eq('id', song.id);
        if (error) {
          errors.push(`song ${song.id} (${song.title}): ${error.message}`);
        } else {
          songsUpdated++;
        }
      } else {
        songsUpdated++;
      }
    } else if (song.sentiment) {
      songsSkipped++;
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   lyrics rows scored:      ${lyricsUpdated}`);
  console.log(`   songs labeled:           ${songsUpdated}`);
  console.log(`   songs skipped (had val): ${songsSkipped}`);
  if (errors.length) console.log(`   errors:                  ${errors.length}`);
  console.log(`\n   Label distribution:`);
  for (const [label, n] of [...labelCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${label.padEnd(16)} ${n}`);
  }
  if (errors.length) {
    console.log(`\n   First 5 errors:`);
    for (const e of errors.slice(0, 5)) console.log(`     - ${e}`);
  }
  if (!COMMIT) console.log(`\n   ⚠️  Dry run only — re-run with --commit to write.`);

  logDone('Sentiment backfill complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
