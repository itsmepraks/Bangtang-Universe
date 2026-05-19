/**
 * Script 6: Scrape lyrics from Genius pages
 *
 * Fetches lyrics HTML from each Genius URL and extracts text.
 * Writes to the lyrics table in Supabase.
 *
 * Usage: npx tsx scripts/scrape-06-genius-lyrics.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createSupabaseAdmin, delay, loadCache, saveCache, logStart, logProgress, logSuccess, logError, logWarning, logDone, errorMessage, normalizeTitle } from './scrape-utils.js';

const supabase = createSupabaseAdmin();

interface GeniusSong {
    track_title: string;
    album_title: string;
    genius_id: number;
    genius_url: string;
    writers: string[];
    producers: string[];
}

interface LyricsResult {
    track_title: string;
    genius_url: string;
    lyrics_text: string;
    song_id: number | null;
}

async function scrapeLyrics(url: string): Promise<string | null> {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(html);

        // Genius stores lyrics in containers with data-lyrics-container attribute
        let lyrics = '';
        $('[data-lyrics-container="true"]').each((_, el) => {
            // Replace <br> with newlines
            $(el).find('br').replaceWith('\n');
            lyrics += $(el).text() + '\n';
        });

        lyrics = lyrics.trim();

        if (!lyrics) {
            // Fallback: try older Genius HTML structure
            const lyricsDiv = $('.lyrics');
            if (lyricsDiv.length) {
                lyricsDiv.find('br').replaceWith('\n');
                lyrics = lyricsDiv.text().trim();
            }
        }

        return lyrics || null;
    } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 403) {
            return null; // Page not accessible
        }
        throw err;
    }
}

async function main() {
    const geniusData = loadCache<GeniusSong[]>('genius-songs');
    if (!geniusData || geniusData.length === 0) {
        console.error('❌ No Genius cache. Run scrape-03 first.');
        process.exit(1);
    }

    logStart('Scraping Lyrics from Genius');

    // Load songs from DB for ID mapping
    const { data: dbSongs } = await supabase
        .from('songs')
        .select('id, title, album_id');

    if (!dbSongs || dbSongs.length === 0) {
        logError('No songs in DB. Run scrape-05 first.');
        process.exit(1);
    }

    // Build title -> song_id lookup
    const songIdMap = new Map<string, number>();
    for (const s of dbSongs) {
        songIdMap.set(normalizeTitle(s.title), s.id);
    }
    logSuccess(`Loaded ${dbSongs.length} song ID mappings`);

    // Check for progress cache (resume support)
    const progressCache = loadCache<LyricsResult[]>('genius-lyrics-progress') || [];
    const processedUrls = new Set(progressCache.map(r => r.genius_url));

    const songsWithUrl = geniusData.filter(g => g.genius_url);
    console.log(`   📋 ${songsWithUrl.length} songs with Genius URLs (${processedUrls.size} already processed)\n`);

    const results: LyricsResult[] = [...progressCache];
    let scraped = 0;
    let failed = 0;

    for (let i = 0; i < songsWithUrl.length; i++) {
        const song = songsWithUrl[i];

        if (processedUrls.has(song.genius_url)) continue; // Already done

        logProgress(i + 1, songsWithUrl.length, `"${song.track_title}"`);

        try {
            const lyrics = await scrapeLyrics(song.genius_url);

            if (lyrics) {
                const songId = songIdMap.get(normalizeTitle(song.track_title)) || null;
                results.push({
                    track_title: song.track_title,
                    genius_url: song.genius_url,
                    lyrics_text: lyrics,
                    song_id: songId,
                });
                scraped++;
                logSuccess(`${lyrics.length} chars`);
            } else {
                failed++;
                logWarning('No lyrics found on page');
            }
        } catch (err: unknown) {
            failed++;
            logWarning(`Error: ${errorMessage(err)}`);
        }

        // Save progress every 20 songs
        if ((i + 1) % 20 === 0) {
            saveCache('genius-lyrics-progress', results);
        }

        await delay(2000); // Be polite when scraping HTML
    }

    saveCache('genius-lyrics', results);

    // Now upsert into the lyrics table
    console.log(`\n   📥 Writing lyrics to database...\n`);

    let written = 0;
    let skipped = 0;

    for (const result of results) {
        if (!result.song_id) {
            logWarning(`No song_id for "${result.track_title}" - skipping DB write`);
            skipped++;
            continue;
        }

        const { error } = await supabase
            .from('lyrics')
            .upsert({
                song_id: result.song_id,
                lyrics_korean: result.lyrics_text,
                genius_url: result.genius_url,
                // Leave these null for future enrichment:
                // lyrics_english, lyrics_romanized, sentiment_score, themes
            }, { onConflict: 'song_id' });

        if (error) {
            logError(`Failed to write lyrics for "${result.track_title}": ${error.message}`);
        } else {
            written++;
        }
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Scraped: ${scraped} new`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Written to DB: ${written}`);
    console.log(`   Skipped (no song_id): ${skipped}`);

    const { count } = await supabase
        .from('lyrics')
        .select('*', { count: 'exact', head: true });
    console.log(`   Total lyrics in DB: ${count}`);

    logDone('Lyrics scraped and stored!');
}

main().catch(console.error);
