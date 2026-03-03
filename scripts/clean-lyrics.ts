/**
 * Clean junk data from lyrics in Supabase.
 *
 * Problems found:
 * 1. Full junk: entire discography pages (Tracklist:...) stored as lyrics (~32k chars)
 * 2. "N/A" placeholders stored as lyrics (3 chars)
 * 3. Genius nav prefix: "22 ContributorsTranslationsRomanization...Song Title Lyrics[actual lyrics]"
 * 4. Genius artifacts embedded in lyrics: "You might also like", "NNEmbed", "See X Live"
 * 5. Song description text before actual lyrics start
 *
 * Cleans both the `lyrics` table and inline lyrics fields on `songs` table.
 *
 * Usage:
 *   npx tsx scripts/clean-lyrics.ts --dry-run   # preview changes
 *   npx tsx scripts/clean-lyrics.ts              # apply changes
 */

import { createSupabaseAdmin, logStart, logSuccess, logWarning, logError, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Cleaning functions
// ---------------------------------------------------------------------------

/** Returns true if the text is entirely junk (not lyrics at all) */
function isFullJunk(text: string): boolean {
    const t = text.trim();

    // "N/A" or similar placeholder
    if (t.length <= 5 && /^N\/?A$/i.test(t)) return true;

    // Discography/tracklist dump (starts with member names or contains Tracklist: early)
    if (/Tracklist:/i.test(t) && t.length > 5000) return true;

    // Starts with artist member listing then tracklist
    if (/^(Jin|Jihyo|Nayeon)\s*\(/.test(t) && /Tracklist:/i.test(t)) return true;

    // Release Date metadata page
    if (/^Release Date:/im.test(t) && /Tracklist:/i.test(t)) return true;

    return false;
}

/** Strip Genius navigation prefix and artifacts from lyrics text */
function cleanLyricsText(text: string): string {
    let cleaned = text.trim();

    // 1. Strip Genius contributor/translation prefix
    //    Pattern: "NN Contributors[Translations[LanguageNames]*]Song Title Lyrics[description]"
    //    This appears before the first section marker [Intro:...] or [Verse 1:...] or [가사]
    //    OR before actual lyrics lines
    const contributorMatch = cleaned.match(/^\d+\s*Contributors?/);
    if (contributorMatch) {
        // Find where actual lyrics begin — look for first [ section marker
        const bracketIdx = cleaned.indexOf('[');
        if (bracketIdx > 0) {
            // Check if there's a "Lyrics" keyword before the bracket (Genius pattern)
            const beforeBracket = cleaned.slice(0, bracketIdx);
            const lyricsKeyword = beforeBracket.lastIndexOf('Lyrics');
            if (lyricsKeyword > 0) {
                // Strip everything up to and including "Lyrics" + any whitespace
                cleaned = cleaned.slice(lyricsKeyword + 'Lyrics'.length).trim();
            } else {
                // Just strip to the bracket
                cleaned = cleaned.slice(bracketIdx).trim();
            }
        } else {
            // No bracket — look for the "Lyrics" keyword or first newline after nav
            const lyricsIdx = cleaned.indexOf('Lyrics');
            if (lyricsIdx > 0 && lyricsIdx < 500) {
                cleaned = cleaned.slice(lyricsIdx + 'Lyrics'.length).trim();
            }
        }
    }

    // 2. Strip song description text that appears before lyrics
    //    Pattern: Long paragraph about the song ending with actual lyrics starting on a new line with [
    //    Only strip if no newlines in the text before the first [
    const firstBracket = cleaned.indexOf('[');
    if (firstBracket > 0) {
        const before = cleaned.slice(0, firstBracket);
        if (!before.includes('\n') && before.length > 20) {
            cleaned = cleaned.slice(firstBracket).trim();
        }
    }

    // 3. Remove "You might also like" artifacts (Genius inserts these between verses)
    cleaned = cleaned.replace(/You might also like/gi, '');

    // 4. Remove "NNEmbed" at end of lyrics
    cleaned = cleaned.replace(/\d*Embed\s*$/gm, '');

    // 5. Remove "See X Live" ads
    cleaned = cleaned.replace(/See [A-Z][\w\s]+ Live\s*Get tickets as low as \$\d+/g, '');

    // 6. Remove Pyong counter
    cleaned = cleaned.replace(/\d+\s*Pyong/g, '');

    // 7. Remove "Hangul" header that sometimes appears at the start
    cleaned = cleaned.replace(/^Hangul\s*\n+/i, '');

    // 8. Clean up excessive blank lines (3+ → 2)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

/** Clean a single lyrics field. Returns null if junk, cleaned text otherwise. */
function cleanField(text: string | null): string | null {
    if (!text) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (isFullJunk(trimmed)) return null;
    const cleaned = cleanLyricsText(trimmed);
    if (!cleaned || cleaned.length < 10) return null;
    return cleaned;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    logStart(`Cleaning Lyrics Data${DRY_RUN ? ' (DRY RUN)' : ''}`);

    // ── Clean lyrics table ──────────────────────────────────────────────
    const { data: lyricsRows, error: lErr } = await supabase
        .from('lyrics')
        .select('id, song_id, lyrics_korean, lyrics_english, lyrics_romanized')
        .order('id');

    if (lErr || !lyricsRows) { logError(`Failed to fetch lyrics: ${lErr?.message}`); process.exit(1); }

    // Fetch song titles for logging
    const { data: songs } = await supabase.from('songs').select('id, title');
    const songMap = new Map((songs || []).map(s => [s.id, s.title]));

    console.log(`\n   Lyrics table: ${lyricsRows.length} rows\n`);

    let lyricsNulled = 0;
    let lyricsCleaned = 0;
    let lyricsUnchanged = 0;

    for (const row of lyricsRows) {
        const updates: Record<string, string | null> = {};
        let changed = false;
        const songTitle = songMap.get(row.song_id) || `song_id:${row.song_id}`;

        for (const field of ['lyrics_korean', 'lyrics_english', 'lyrics_romanized'] as const) {
            const original = row[field];
            if (!original) continue;

            const cleaned = cleanField(original);

            if (cleaned === null && original) {
                // Was junk → null it out
                updates[field] = null as any;
                changed = true;
                lyricsNulled++;
                console.log(`   ✗ [${row.id}] "${songTitle}" ${field} → NULL (was ${original.length} chars)`);
            } else if (cleaned !== null && cleaned !== original.trim()) {
                // Was dirty → cleaned
                updates[field] = cleaned;
                changed = true;
                lyricsCleaned++;
                const diff = original.length - cleaned.length;
                console.log(`   ✓ [${row.id}] "${songTitle}" ${field} → cleaned (removed ${diff} chars)`);
            } else {
                lyricsUnchanged++;
            }
        }

        if (changed && !DRY_RUN) {
            const { error } = await supabase.from('lyrics').update(updates).eq('id', row.id);
            if (error) logError(`  Failed to update lyrics ${row.id}: ${error.message}`);
        }
    }

    console.log(`\n   Lyrics table summary:`);
    console.log(`     Nulled (full junk): ${lyricsNulled}`);
    console.log(`     Cleaned (artifacts removed): ${lyricsCleaned}`);
    console.log(`     Unchanged: ${lyricsUnchanged}`);

    // ── Clean songs table inline lyrics ─────────────────────────────────
    const { data: songsWithLyrics, error: sErr } = await supabase
        .from('songs')
        .select('id, title, lyrics_ko, lyrics_en, lyrics_romanized')
        .order('id');

    if (sErr || !songsWithLyrics) { logError(`Failed to fetch songs: ${sErr?.message}`); process.exit(1); }

    const songsWithAnyLyrics = songsWithLyrics.filter(
        s => s.lyrics_ko || s.lyrics_en || s.lyrics_romanized
    );
    console.log(`\n   Songs table: ${songsWithAnyLyrics.length} rows with inline lyrics\n`);

    let songsNulled = 0;
    let songsCleaned = 0;
    let songsUnchanged = 0;

    for (const row of songsWithAnyLyrics) {
        const updates: Record<string, string | null> = {};
        let changed = false;

        for (const [field, dbField] of [
            ['lyrics_ko', 'lyrics_ko'],
            ['lyrics_en', 'lyrics_en'],
            ['lyrics_romanized', 'lyrics_romanized'],
        ] as const) {
            const original = (row as any)[field];
            if (!original) continue;

            const cleaned = cleanField(original);

            if (cleaned === null && original) {
                updates[dbField] = null as any;
                changed = true;
                songsNulled++;
                console.log(`   ✗ [${row.id}] "${row.title}" ${dbField} → NULL (was ${original.length} chars)`);
            } else if (cleaned !== null && cleaned !== original.trim()) {
                updates[dbField] = cleaned;
                changed = true;
                songsCleaned++;
                const diff = original.length - cleaned.length;
                console.log(`   ✓ [${row.id}] "${row.title}" ${dbField} → cleaned (removed ${diff} chars)`);
            } else {
                songsUnchanged++;
            }
        }

        if (changed && !DRY_RUN) {
            const { error } = await supabase.from('songs').update(updates).eq('id', row.id);
            if (error) logError(`  Failed to update song ${row.id}: ${error.message}`);
        }
    }

    console.log(`\n   Songs table summary:`);
    console.log(`     Nulled (full junk): ${songsNulled}`);
    console.log(`     Cleaned (artifacts removed): ${songsCleaned}`);
    console.log(`     Unchanged: ${songsUnchanged}`);

    // ── Grand total ─────────────────────────────────────────────────────
    console.log(`\n   ═══════════════════════════════════`);
    console.log(`   Total nulled:    ${lyricsNulled + songsNulled}`);
    console.log(`   Total cleaned:   ${lyricsCleaned + songsCleaned}`);
    console.log(`   Total unchanged: ${lyricsUnchanged + songsUnchanged}`);

    if (DRY_RUN) {
        logWarning('DRY RUN — no changes written. Run without --dry-run to apply.');
    } else {
        logDone('Lyrics cleaned!');
    }
}

main().catch(console.error);
