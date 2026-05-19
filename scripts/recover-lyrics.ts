/**
 * Recover missing lyrics for BTS songs.
 *
 * Phase 1: Copy lyrics from original versions to remixes/alternate versions
 * Phase 2: Search Genius API + scrape for remaining songs
 * Phase 3: Clean any newly scraped data
 *
 * Usage:
 *   npx tsx scripts/recover-lyrics.ts --dry-run
 *   npx tsx scripts/recover-lyrics.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createSupabaseAdmin, delay, normalizeTitle, logStart, logSuccess, logError, logWarning, logDone, errorMessage } from './scrape-utils.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');
const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

// ─── Variant title patterns ───────────────────────────────────────────────────
const VARIANT_SUFFIXES = [
    /\s*[\-–]\s*Japanese\s*ver\.?\s*[\-–]?\s*/gi,
    /\s*\(Japanese\s*ver\.?\)/gi,
    /\s*\(.*?remix\)/gi,
    /\s*\(.*?mix\)/gi,
    /\s*\(.*?ver\.?\)/gi,
    /\s*\(.*?version\)/gi,
    /\s*\(feat\.?[^)]*\)/gi,
    /\s*\(ft\.?[^)]*\)/gi,
    /\s*\(acoustic\)/gi,
    /\s*\(full\s*length\s*edition\)/gi,
    /\s*\(instrumental\)/gi,
    /\s*[\-–]\s*Japanese\s*ver\.?\s*/gi,
];

function getBaseTitle(title: string): string {
    let base = title;
    for (const pattern of VARIANT_SUFFIXES) {
        base = base.replace(pattern, '');
    }
    return base.trim();
}

function isInstrumental(title: string): boolean {
    return /instrumental/i.test(title);
}

// ─── Genius API ───────────────────────────────────────────────────────────────
const geniusApi = GENIUS_TOKEN ? axios.create({
    baseURL: 'https://api.genius.com',
    headers: { Authorization: `Bearer ${GENIUS_TOKEN}` },
    timeout: 15000,
}) : null;

async function searchGenius(title: string): Promise<{ url: string; id: number } | null> {
    if (!geniusApi) return null;

    const queries = [`BTS ${title}`, `방탄소년단 ${title}`];

    for (const query of queries) {
        try {
            const { data } = await geniusApi.get('/search', { params: { q: query } });
            const hits = data.response?.hits || [];

            for (const hit of hits) {
                const song = hit.result;
                const artist = (song.primary_artist?.name || '').toLowerCase();
                if (!artist.includes('bts') && !artist.includes('bangtan') && !artist.includes('방탄')) continue;

                const gTitle = normalizeTitle(song.title || '');
                const sTitle = normalizeTitle(title);
                if (gTitle === sTitle || gTitle.includes(sTitle) || sTitle.includes(gTitle)) {
                    return { url: song.url, id: song.id };
                }
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } }).response?.status;
            if (status === 429) {
                logWarning('Rate limited, waiting 10s...');
                await delay(10000);
            }
        }
    }
    return null;
}

async function scrapeLyricsFromGenius(url: string): Promise<string | null> {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(html);
        let lyrics = '';
        $('[data-lyrics-container="true"]').each((_, el) => {
            $(el).find('br').replaceWith('\n');
            lyrics += $(el).text() + '\n';
        });
        lyrics = lyrics.trim();

        if (!lyrics) {
            const lyricsDiv = $('.lyrics');
            if (lyricsDiv.length) {
                lyricsDiv.find('br').replaceWith('\n');
                lyrics = lyricsDiv.text().trim();
            }
        }

        return lyrics || null;
    } catch {
        return null;
    }
}

/** Strip Genius nav artifacts from freshly scraped text */
function cleanScrapedLyrics(text: string): string {
    let cleaned = text.trim();
    // Strip "NN Contributors..." prefix
    const m = cleaned.match(/^\d+\s*Contributors?/);
    if (m) {
        const bracketIdx = cleaned.indexOf('[');
        if (bracketIdx > 0) {
            const before = cleaned.slice(0, bracketIdx);
            const lyricsKw = before.lastIndexOf('Lyrics');
            cleaned = lyricsKw > 0
                ? cleaned.slice(lyricsKw + 'Lyrics'.length).trim()
                : cleaned.slice(bracketIdx).trim();
        }
    }
    // Strip non-newline prefix before first [
    const fb = cleaned.indexOf('[');
    if (fb > 0 && !cleaned.slice(0, fb).includes('\n') && cleaned.slice(0, fb).length > 20) {
        cleaned = cleaned.slice(fb).trim();
    }
    // Remove artifacts
    cleaned = cleaned.replace(/You might also like/gi, '');
    cleaned = cleaned.replace(/\d*Embed\s*$/gm, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned.trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    logStart(`Recovering Missing Lyrics${DRY_RUN ? ' (DRY RUN)' : ''}`);

    // Load all songs
    const { data: allSongs } = await supabase.from('songs').select('id, title, lyrics_ko, lyrics_en, lyrics_romanized, album_id').order('id');
    const { data: allLyrics } = await supabase.from('lyrics').select('id, song_id, lyrics_korean, lyrics_english, lyrics_romanized, genius_url').order('id');
    if (!allSongs || !allLyrics) { logError('Failed to fetch data'); process.exit(1); }

    const lyricsMap = new Map(allLyrics.map(l => [l.song_id, l]));

    // Find songs with no lyrics
    const missing = allSongs.filter(s => {
        const lr = lyricsMap.get(s.id);
        const hasInline = s.lyrics_ko || s.lyrics_en || s.lyrics_romanized;
        const hasTable = lr && (lr.lyrics_korean || lr.lyrics_english || lr.lyrics_romanized);
        return !hasInline && !hasTable;
    });

    // Build a lookup of songs that DO have lyrics (by normalized title)
    const lyricsLookup = new Map<string, { lyrics_ko: string | null; lyrics_en: string | null; lyrics_rom: string | null }>();
    for (const s of allSongs) {
        const lr = lyricsMap.get(s.id);
        const ko = s.lyrics_ko || lr?.lyrics_korean || null;
        const en = s.lyrics_en || lr?.lyrics_english || null;
        const rom = s.lyrics_romanized || lr?.lyrics_romanized || null;
        if (ko || en || rom) {
            const key = normalizeTitle(s.title);
            if (!lyricsLookup.has(key)) {
                lyricsLookup.set(key, { lyrics_ko: ko, lyrics_en: en, lyrics_rom: rom });
            }
        }
    }

    const instrumentals = missing.filter(s => isInstrumental(s.title));
    const recoverable = missing.filter(s => !isInstrumental(s.title));

    console.log(`\n   Total songs: ${allSongs.length}`);
    console.log(`   Missing lyrics: ${missing.length}`);
    console.log(`   Instrumentals (skip): ${instrumentals.length}`);
    console.log(`   Recoverable: ${recoverable.length}\n`);

    // ═══ PHASE 1: Copy from originals ═══════════════════════════════════════
    console.log('═══ PHASE 1: Copy from originals ═══\n');
    let copiedCount = 0;
    const stillMissing: typeof recoverable = [];

    for (const song of recoverable) {
        const baseTitle = getBaseTitle(song.title);
        const baseNorm = normalizeTitle(baseTitle);
        const existing = lyricsLookup.get(baseNorm);

        if (existing && baseNorm !== normalizeTitle(song.title)) {
            // Found original — copy lyrics
            if (DRY_RUN) {
                console.log(`   ✓ [${song.id}] "${song.title}" ← copy from "${baseTitle}"`);
            } else {
                // Update songs table
                const songUpdate: Record<string, string | null> = {};
                if (existing.lyrics_ko) songUpdate.lyrics_ko = existing.lyrics_ko;
                if (existing.lyrics_en) songUpdate.lyrics_en = existing.lyrics_en;
                if (existing.lyrics_rom) songUpdate.lyrics_romanized = existing.lyrics_rom;

                if (Object.keys(songUpdate).length > 0) {
                    await supabase.from('songs').update(songUpdate).eq('id', song.id);
                }

                // Upsert lyrics table
                const lyricsRow = lyricsMap.get(song.id);
                if (lyricsRow) {
                    const lUpdate: Record<string, string | null> = {};
                    if (existing.lyrics_ko) lUpdate.lyrics_korean = existing.lyrics_ko;
                    if (existing.lyrics_en) lUpdate.lyrics_english = existing.lyrics_en;
                    if (existing.lyrics_rom) lUpdate.lyrics_romanized = existing.lyrics_rom;
                    await supabase.from('lyrics').update(lUpdate).eq('id', lyricsRow.id);
                } else {
                    await supabase.from('lyrics').insert({
                        song_id: song.id,
                        lyrics_korean: existing.lyrics_ko,
                        lyrics_english: existing.lyrics_en,
                        lyrics_romanized: existing.lyrics_rom,
                    });
                }
                logSuccess(`[${song.id}] "${song.title}" ← "${baseTitle}"`);
            }
            copiedCount++;
        } else {
            stillMissing.push(song);
        }
    }

    console.log(`\n   Phase 1 result: ${copiedCount} copied from originals`);
    console.log(`   Still missing: ${stillMissing.length}\n`);

    // ═══ PHASE 2: Genius API search + scrape ════════════════════════════════
    if (!GENIUS_TOKEN) {
        logWarning('No GENIUS_ACCESS_TOKEN — skipping Phase 2 (Genius search)');
    } else {
        console.log('═══ PHASE 2: Genius API search + scrape ═══\n');

        // First, null out bad colorcodedlyrics URLs
        const badUrls = allLyrics.filter(l => l.genius_url?.includes('colorcodedlyrics.com'));
        if (badUrls.length > 0) {
            console.log(`   Nulling ${badUrls.length} bad colorcodedlyrics URLs...\n`);
            if (!DRY_RUN) {
                for (const lr of badUrls) {
                    await supabase.from('lyrics').update({ genius_url: null }).eq('id', lr.id);
                }
            }
        }

        let geniusFound = 0;
        let geniusFailed = 0;

        for (let i = 0; i < stillMissing.length; i++) {
            const song = stillMissing[i];
            console.log(`   [${i + 1}/${stillMissing.length}] Searching: "${song.title}"...`);

            const result = await searchGenius(song.title);

            if (result) {
                await delay(1500);
                const rawLyrics = await scrapeLyricsFromGenius(result.url);

                if (rawLyrics && rawLyrics.length > 50) {
                    const cleaned = cleanScrapedLyrics(rawLyrics);

                    if (DRY_RUN) {
                        logSuccess(`Found! ${cleaned.length} chars from ${result.url}`);
                    } else {
                        // Update songs table
                        await supabase.from('songs').update({ lyrics_ko: cleaned }).eq('id', song.id);

                        // Upsert lyrics table
                        const lyricsRow = lyricsMap.get(song.id);
                        if (lyricsRow) {
                            await supabase.from('lyrics').update({
                                lyrics_korean: cleaned,
                                genius_url: result.url,
                            }).eq('id', lyricsRow.id);
                        } else {
                            await supabase.from('lyrics').insert({
                                song_id: song.id,
                                lyrics_korean: cleaned,
                                genius_url: result.url,
                            });
                        }
                        logSuccess(`Found! ${cleaned.length} chars`);
                    }
                    geniusFound++;
                } else {
                    logWarning('Page found but no lyrics extracted');
                    geniusFailed++;
                }
            } else {
                logWarning('Not found on Genius');
                geniusFailed++;
            }

            await delay(2000); // Rate limit
        }

        console.log(`\n   Phase 2 result: ${geniusFound} found on Genius, ${geniusFailed} not found`);
    }

    // ═══ SUMMARY ════════════════════════════════════════════════════════════
    console.log(`\n   ═══════════════════════════════════`);
    console.log(`   Copied from originals: ${copiedCount}`);
    console.log(`   Instrumentals skipped: ${instrumentals.length}`);

    if (DRY_RUN) logWarning('DRY RUN — no changes written.');
    else logDone('Lyrics recovery complete!');
}

main().catch(console.error);
