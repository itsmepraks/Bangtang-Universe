/**
 * Korean → English machine translation for lyrics rows that have
 * Korean text but no English text. Uses the unofficial Google
 * Translate endpoint (no API key needed).
 *
 * After translation, automatically re-runs the sentiment backfill
 * via direct DB writes — no separate step needed.
 *
 * Idempotent and resumable: progress is cached to
 * scripts/cache/translation-progress.json so a mid-run failure
 * (rate limit, network blip) can be re-run safely.
 *
 * Usage:
 *   npx tsx scripts/translate-korean-lyrics.ts --dry-run     # show what would happen
 *   npx tsx scripts/translate-korean-lyrics.ts --commit      # write to DB
 *   npx tsx scripts/translate-korean-lyrics.ts --commit --limit 10
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {
  createSupabaseAdmin,
  delay,
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

/**
 * Translate Korean → English using MyMemory free API.
 * With an email param, you get 50,000 chars/day (vs 5,000 anonymous).
 * Falls back to anonymous if no email is set.
 */
async function translateKoEn(text: string): Promise<string> {
  // MyMemory has a 500-char limit per request — split into chunks
  const CHUNK_SIZE = 500;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  const email = process.env.MYMEMORY_EMAIL || '';
  const results: string[] = [];

  for (const chunk of chunks) {
    const params: Record<string, string> = {
      q: chunk,
      langpair: 'ko|en',
    };
    if (email) params.de = email;

    const { data } = await axios.get('https://api.mymemory.translated.net/get', {
      params,
      timeout: 15000,
    });

    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      results.push(data.responseData.translatedText);
    } else {
      // Fallback — return chunk as-is if translation fails
      results.push(chunk);
    }
    // Polite delay between chunks
    if (chunks.length > 1) await delay(300);
  }

  return results.join(' ');
}

const supabase = createSupabaseAdmin();
const COMMIT = process.argv.includes('--commit');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg >= 0 ? parseInt(process.argv[limitArg + 1] ?? '0', 10) : Infinity;

const CACHE_PATH = path.resolve(process.cwd(), 'scripts/cache/translation-progress.json');

interface CacheEntry {
  song_id: number;
  lyrics_english: string;
  themes: string[];
  sentiment_score: number;
}
type Cache = Record<string, CacheEntry>; // key = song_id

function loadCache(): Cache {
  try {
    const raw = fs.readFileSync(CACHE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

interface LyricRow {
  id: number;
  song_id: number;
  lyrics_korean: string;
}

// Vocabulary derived from existing songs.sentiment values
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
  return sorted[0][0];
}

async function main() {
  logStart(`K→EN lyrics translation ${COMMIT ? '(COMMIT)' : '(dry run)'}${isFinite(LIMIT) ? ` [limit=${LIMIT}]` : ''}`);

  // Find lyric rows with Korean but no English text
  const rows: LyricRow[] = [];
  let from = 0;
  const PAGE = 500;
  while (true) {
    const { data, error } = await supabase
      .from('lyrics')
      .select('id, song_id, lyrics_korean')
      .not('lyrics_korean', 'is', null)
      .is('lyrics_english', null)
      .range(from, from + PAGE - 1)
      .order('id');
    if (error) {
      logError(`fetch lyrics: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    rows.push(...(data as LyricRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  logSuccess(`Found ${rows.length} Korean-only lyric rows`);

  const cache = loadCache();
  const cachedCount = Object.keys(cache).length;
  if (cachedCount > 0) {
    logSuccess(`Loaded ${cachedCount} previously translated rows from cache`);
  }

  let translated = 0;
  let cached = 0;
  let failed = 0;
  let dbWritten = 0;
  const errors: string[] = [];

  const work = rows.slice(0, isFinite(LIMIT) ? LIMIT : undefined);
  for (let i = 0; i < work.length; i++) {
    const row = work[i];
    const idStr = String(row.song_id);
    const progress = `[${i + 1}/${work.length}]`;

    let entry: CacheEntry | null = cache[idStr] ?? null;

    if (entry) {
      cached++;
      console.log(`   📦 ${progress} song ${row.song_id} — from cache`);
    } else {
      try {
        // Truncate huge lyrics to 5000 chars
        const text = row.lyrics_korean.slice(0, 5000);
        const english = await translateKoEn(text);

        const themes = extractThemes(english);
        const score = parseFloat(computeSentiment(english).toFixed(3));

        entry = {
          song_id: row.song_id,
          lyrics_english: english,
          themes,
          sentiment_score: score,
        };
        cache[idStr] = entry;
        translated++;
        console.log(`   ✅ ${progress} song ${row.song_id} — ${english.length} chars, ${themes.length} themes, score ${score}`);

        // Persist cache every 10 rows
        if (translated % 10 === 0) saveCache(cache);

        // Polite delay so we don't get throttled (2s to avoid Google 429s)
        await delay(2000);
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`song ${row.song_id}: ${msg}`);
        logError(`${progress} song ${row.song_id}: ${msg}`);
        // If we hit a rate limit, back off harder
        if (msg.toLowerCase().includes('too many requests') || msg.includes('429') || msg.includes('MYMEMORY')) {
          logWarning('Rate limited — sleeping 60s');
          await delay(60000);
        }
        continue;
      }
    }

    if (COMMIT && entry) {
      // Update lyrics row with English text + themes + score
      const { error: lyrErr } = await supabase
        .from('lyrics')
        .update({
          lyrics_english: entry.lyrics_english,
          themes: entry.themes,
          sentiment_score: entry.sentiment_score,
        })
        .eq('id', row.id);
      if (lyrErr) {
        errors.push(`lyrics ${row.id}: ${lyrErr.message}`);
        continue;
      }

      // Update songs.sentiment if it's missing
      const label = pickLabel(entry.themes, entry.sentiment_score);
      if (label) {
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
          if (sErr) errors.push(`song ${row.song_id}: ${sErr.message}`);
        }
      }
      dbWritten++;
    }
  }

  saveCache(cache);

  console.log(`\n📊 Summary`);
  console.log(`   newly translated:  ${translated}`);
  console.log(`   from cache:        ${cached}`);
  console.log(`   failed:            ${failed}`);
  console.log(`   written to DB:     ${dbWritten}`);
  if (errors.length) {
    console.log(`\n   First 5 errors:`);
    for (const e of errors.slice(0, 5)) console.log(`     - ${e}`);
  }
  if (!COMMIT) console.log(`\n   ⚠️  Dry run only — re-run with --commit to write.`);

  logDone('Translation pass complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
