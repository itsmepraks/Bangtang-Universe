/**
 * Script 10: Scrape lyrics translations from ColorCodedLyrics
 *
 * Searches for BTS songs on ColorCodedLyrics and extracts Korean,
 * English, and Romanized lyrics from the song pages.
 *
 * Usage: npx tsx scripts/scrape-10-lyrics-translations.ts
 *        npx tsx scripts/scrape-10-lyrics-translations.ts --dry-run
 *        npx tsx scripts/scrape-10-lyrics-translations.ts --upsert
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createSupabaseAdmin, delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPSERT = process.argv.includes('--upsert');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface SongInput {
    id: number;
    title: string;
    album_id: number | null;
}

interface LyricsTranslation {
    song_id: number;
    song_title: string;
    source_url: string | null;
    lyrics_ko: string | null;
    lyrics_en: string | null;
    lyrics_romanized: string | null;
}

async function searchSong(title: string): Promise<string | null> {
    const searchQuery = encodeURIComponent(`${title} BTS`);
    const searchUrl = `https://colorcodedlyrics.com/?s=${searchQuery}`;

    try {
        const { data: html } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(html);

        // Search results are typically article links
        // Look for the first relevant result that mentions BTS
        let songPageUrl: string | null = null;

        $('article a, .entry-title a, h2 a, h3 a').each((_, el) => {
            if (songPageUrl) return; // Already found

            const href = $(el).attr('href') || '';
            const text = $(el).text().toLowerCase();

            // Check if the link is to a lyrics page and mentions BTS
            if (href.includes('colorcodedlyrics.com') && (text.includes('bts') || text.includes('bangtan'))) {
                songPageUrl = href;
            }
        });

        // Fallback: just get the first search result link
        if (!songPageUrl) {
            const firstResult = $('article a, .entry-title a').first().attr('href');
            if (firstResult && firstResult.includes('colorcodedlyrics.com')) {
                songPageUrl = firstResult;
            }
        }

        return songPageUrl;
    } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 429) {
            logWarning(`Search blocked (${err.response.status}) - may need to wait`);
            return null;
        }
        logWarning(`Search failed for "${title}": ${err.message}`);
        return null;
    }
}

async function scrapeLyricsPage(url: string): Promise<{ ko: string | null; en: string | null; romanized: string | null }> {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(html);

        // ColorCodedLyrics typically has a table with 3 columns:
        // Korean | Romanization | English
        // Or it may use divs with specific classes

        let koreanLines: string[] = [];
        let romanizedLines: string[] = [];
        let englishLines: string[] = [];

        // Strategy 1: Look for a lyrics table with 3 columns
        const lyricsTable = $('table').filter((_, table) => {
            const cols = $(table).find('tr:first-child td, tr:first-child th').length;
            return cols >= 3;
        }).first();

        if (lyricsTable.length) {
            lyricsTable.find('tr').each((_, row) => {
                const cells = $(row).find('td');
                if (cells.length >= 3) {
                    // Replace <br> with newlines for proper line breaks
                    cells.eq(0).find('br').replaceWith('\n');
                    cells.eq(1).find('br').replaceWith('\n');
                    cells.eq(2).find('br').replaceWith('\n');

                    const ko = cells.eq(0).text().trim();
                    const rom = cells.eq(1).text().trim();
                    const en = cells.eq(2).text().trim();

                    if (ko) koreanLines.push(ko);
                    if (rom) romanizedLines.push(rom);
                    if (en) englishLines.push(en);
                }
            });
        }

        // Strategy 2: Look for div-based layout with language sections
        if (koreanLines.length === 0) {
            // Some pages use <p> or <div> blocks with specific patterns
            const content = $('.entry-content, .post-content, article').first();

            if (content.length) {
                // Try to find Korean text blocks (contains Hangul)
                content.find('p, div').each((_, el) => {
                    const text = $(el).text().trim();
                    if (!text) return;

                    // Check for Hangul characters
                    if (/[가-힣]/.test(text) && !/[a-zA-Z]{10,}/.test(text)) {
                        koreanLines.push(text);
                    }
                });

                // Try to find Romanized blocks (Latin characters, likely Korean romanization)
                content.find('p, div').each((_, el) => {
                    const text = $(el).text().trim();
                    if (!text) return;

                    // Romanized text is Latin but has Korean romanization patterns
                    if (/[a-zA-Z]/.test(text) && !/[가-힣]/.test(text) && text.length > 20) {
                        // Distinguish from English by checking for common romanization patterns
                        if (/\b(neul|geol|eul|uri|neon|neun|geos|mwo|wae|jeo)\b/i.test(text)) {
                            romanizedLines.push(text);
                        }
                    }
                });
            }
        }

        // Strategy 3: ColorCodedLyrics often has spans with language attributes
        if (koreanLines.length === 0) {
            $('span[class*="korean"], span[class*="hangul"], span[lang="ko"]').each((_, el) => {
                $(el).find('br').replaceWith('\n');
                const text = $(el).text().trim();
                if (text) koreanLines.push(text);
            });

            $('span[class*="roman"], span[class*="romaniz"]').each((_, el) => {
                $(el).find('br').replaceWith('\n');
                const text = $(el).text().trim();
                if (text) romanizedLines.push(text);
            });

            $('span[class*="english"], span[class*="translat"], span[lang="en"]').each((_, el) => {
                $(el).find('br').replaceWith('\n');
                const text = $(el).text().trim();
                if (text) englishLines.push(text);
            });
        }

        return {
            ko: koreanLines.length > 0 ? koreanLines.join('\n\n') : null,
            en: englishLines.length > 0 ? englishLines.join('\n\n') : null,
            romanized: romanizedLines.length > 0 ? romanizedLines.join('\n\n') : null,
        };
    } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 429) {
            logWarning(`Page blocked (${err.response.status}): ${url}`);
            return { ko: null, en: null, romanized: null };
        }
        logWarning(`Failed to scrape lyrics page ${url}: ${err.message}`);
        return { ko: null, en: null, romanized: null };
    }
}

async function loadSongsList(): Promise<SongInput[]> {
    // Try loading from Supabase first
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase
            .from('songs')
            .select('id, title, album_id')
            .order('id');

        if (!error && data && data.length > 0) {
            logSuccess(`Loaded ${data.length} songs from Supabase`);
            return data;
        }
    } catch {
        // Fall through to cache
    }

    // Fallback: construct from MusicBrainz cache
    const mbCache = loadCache<any[]>('musicbrainz-discography');
    if (mbCache) {
        const songs: SongInput[] = [];
        let id = 1;
        for (const album of mbCache) {
            for (const track of album.tracks || []) {
                songs.push({ id: id++, title: track.title, album_id: null });
            }
        }
        logSuccess(`Loaded ${songs.length} songs from MusicBrainz cache`);
        return songs;
    }

    return [];
}

async function upsertToSupabase(results: LyricsTranslation[]) {
    const supabase = createSupabaseAdmin();

    logStart('Upserting lyrics translations into Supabase');

    let upserted = 0;
    let skipped = 0;

    for (const result of results) {
        // Skip songs with no lyrics found
        if (!result.lyrics_ko && !result.lyrics_en && !result.lyrics_romanized) {
            skipped++;
            continue;
        }

        if (DRY_RUN) {
            logSuccess(`[DRY RUN] Would upsert lyrics for "${result.song_title}"`);
            upserted++;
            continue;
        }

        // Upsert into lyrics table
        const { error: lyricsErr } = await supabase
            .from('lyrics')
            .upsert({
                song_id: result.song_id,
                lyrics_korean: result.lyrics_ko,
                lyrics_english: result.lyrics_en,
                lyrics_romanized: result.lyrics_romanized,
                genius_url: result.source_url,
            }, { onConflict: 'song_id' });

        if (lyricsErr) {
            logError(`Failed to upsert lyrics for "${result.song_title}": ${lyricsErr.message}`);
            continue;
        }

        // Also update the songs table with inline lyrics columns
        const songUpdates: Record<string, string | null> = {};
        if (result.lyrics_ko) songUpdates.lyrics_ko = result.lyrics_ko;
        if (result.lyrics_en) songUpdates.lyrics_en = result.lyrics_en;
        if (result.lyrics_romanized) songUpdates.lyrics_romanized = result.lyrics_romanized;

        if (Object.keys(songUpdates).length > 0) {
            const { error: songErr } = await supabase
                .from('songs')
                .update(songUpdates)
                .eq('id', result.song_id);

            if (songErr) {
                logWarning(`Failed to update songs table for "${result.song_title}": ${songErr.message}`);
            }
        }

        upserted++;
    }

    console.log(`\n   Upserted: ${upserted}`);
    console.log(`   Skipped (no lyrics): ${skipped}`);
}

async function main() {
    // Check for cached data
    const cached = loadCache<LyricsTranslation[]>('lyrics-translations');
    if (cached) {
        console.log(`\n   Found cached lyrics translations (${cached.length} songs). Delete scripts/cache/lyrics-translations.json to re-fetch.\n`);

        if (UPSERT) {
            await upsertToSupabase(cached);
        }
        return;
    }

    logStart('Scraping Lyrics Translations from ColorCodedLyrics');

    if (DRY_RUN) {
        logWarning('DRY RUN mode - no data will be written to Supabase');
    }

    const songs = await loadSongsList();
    if (songs.length === 0) {
        logError('No songs found. Run scrape-05 or scrape-01 first.');
        process.exit(1);
    }

    // Load progress cache for resume support
    const progressCache = loadCache<LyricsTranslation[]>('lyrics-translations-progress') || [];
    const processedIds = new Set(progressCache.map(r => r.song_id));

    console.log(`   ${songs.length} songs to process (${processedIds.size} already processed)\n`);

    const results: LyricsTranslation[] = [...progressCache];
    let found = 0;
    let notFound = 0;
    let errors = 0;

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];

        if (processedIds.has(song.id)) continue; // Already done

        logProgress(i + 1, songs.length, `"${song.title}"`);

        try {
            // Step 1: Search for the song
            const songPageUrl = await searchSong(song.title);
            await delay(2000);

            if (!songPageUrl) {
                logWarning(`No search results for "${song.title}"`);
                results.push({
                    song_id: song.id,
                    song_title: song.title,
                    source_url: null,
                    lyrics_ko: null,
                    lyrics_en: null,
                    lyrics_romanized: null,
                });
                notFound++;
                continue;
            }

            // Step 2: Scrape the lyrics page
            const lyrics = await scrapeLyricsPage(songPageUrl);
            await delay(2000);

            const hasLyrics = lyrics.ko || lyrics.en || lyrics.romanized;

            results.push({
                song_id: song.id,
                song_title: song.title,
                source_url: songPageUrl,
                lyrics_ko: lyrics.ko,
                lyrics_en: lyrics.en,
                lyrics_romanized: lyrics.romanized,
            });

            if (hasLyrics) {
                const parts = [];
                if (lyrics.ko) parts.push('KO');
                if (lyrics.en) parts.push('EN');
                if (lyrics.romanized) parts.push('ROM');
                logSuccess(`Found lyrics: ${parts.join(', ')}`);
                found++;
            } else {
                logWarning(`Page found but no lyrics extracted`);
                notFound++;
            }
        } catch (err: any) {
            logWarning(`Error processing "${song.title}": ${err.message}`);
            results.push({
                song_id: song.id,
                song_title: song.title,
                source_url: null,
                lyrics_ko: null,
                lyrics_en: null,
                lyrics_romanized: null,
            });
            errors++;
        }

        // Save progress every 10 songs
        if ((i + 1) % 10 === 0) {
            saveCache('lyrics-translations-progress', results);
        }
    }

    // Summary
    console.log(`\n   Summary:`);
    console.log(`   Songs processed: ${songs.length}`);
    console.log(`   Lyrics found: ${found}`);
    console.log(`   No lyrics: ${notFound}`);
    console.log(`   Errors: ${errors}`);

    saveCache('lyrics-translations', results);

    if (UPSERT) {
        await upsertToSupabase(results);
    }

    logDone('Lyrics translations scraped!');
}

main().catch(console.error);
