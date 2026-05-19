/**
 * Script 3: Search Genius for BTS songs to get credits and URLs
 *
 * Gets verified writers, producers, and Genius page URLs.
 * Requires GENIUS_ACCESS_TOKEN in .env
 *
 * Usage: npx tsx scripts/scrape-03-genius-songs.ts
 */

import axios from 'axios';
import { delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone, normalizeTitle } from './scrape-utils.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

if (!GENIUS_TOKEN) {
    console.error('❌ Missing GENIUS_ACCESS_TOKEN in .env');
    console.error('   Get one at: https://genius.com/api-clients');
    process.exit(1);
}

const geniusApi = axios.create({
    baseURL: 'https://api.genius.com',
    headers: { Authorization: `Bearer ${GENIUS_TOKEN}` },
    timeout: 15000,
});

interface GeniusSong {
    track_title: string;
    album_title: string;
    genius_id: number;
    genius_url: string;
    writers: string[];
    producers: string[];
    featured_artists: string[];
    release_date: string | null;
}

interface MBAlbum {
    title: string;
    tracks: { title: string; position: number }[];
}

async function searchGeniusSong(trackTitle: string, albumTitle: string): Promise<GeniusSong | null> {
    // Try different search queries for best results
    const queries = [
        `BTS ${trackTitle}`,
        `방탄소년단 ${trackTitle}`,
        `${trackTitle} BTS`,
    ];

    for (const query of queries) {
        try {
            const { data } = await geniusApi.get('/search', {
                params: { q: query },
            });

            const hits = data.response?.hits || [];

            // Find best match - must be by BTS/Bangtan
            for (const hit of hits) {
                const song = hit.result;
                const artist = (song.primary_artist?.name || '').toLowerCase();

                if (!artist.includes('bts') && !artist.includes('bangtan') && !artist.includes('방탄')) {
                    continue;
                }

                // Check title similarity
                const geniusTitle = normalizeTitle(song.title || '');
                const searchTitle = normalizeTitle(trackTitle);

                if (geniusTitle === searchTitle || geniusTitle.includes(searchTitle) || searchTitle.includes(geniusTitle)) {
                    // Found a match - now get full song details for credits
                    return await fetchSongDetails(song.id, trackTitle, albumTitle);
                }
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } }).response?.status;
            if (status === 429) {
                logWarning('Rate limited, waiting 5s...');
                await delay(5000);
                continue;
            }
            // Try next query
        }
    }

    return null;
}

async function fetchSongDetails(geniusId: number, trackTitle: string, albumTitle: string): Promise<GeniusSong> {
    await delay(500); // Brief delay before detail request

    const { data } = await geniusApi.get(`/songs/${geniusId}`);
    const song = data.response?.song;

    type NamedArtist = { name: string };
    const writers: string[] = (song?.writer_artists || []).map((w: NamedArtist) => w.name);
    const producers: string[] = (song?.producer_artists || []).map((p: NamedArtist) => p.name);
    const featured: string[] = (song?.featured_artists || []).map((f: NamedArtist) => f.name);

    return {
        track_title: trackTitle,
        album_title: albumTitle,
        genius_id: geniusId,
        genius_url: song?.url || '',
        writers,
        producers,
        featured_artists: featured,
        release_date: song?.release_date_for_display || null,
    };
}

async function main() {
    const cached = loadCache<GeniusSong[]>('genius-songs');
    if (cached) {
        console.log(`\n📦 Found cached Genius data (${cached.length} songs). Delete scripts/cache/genius-songs.json to re-fetch.\n`);
        return;
    }

    // Load MusicBrainz discography for the full track list
    const mbData = loadCache<MBAlbum[]>('musicbrainz-discography');
    if (!mbData) {
        console.error('❌ No MusicBrainz cache found. Run scrape-01 first.');
        process.exit(1);
    }

    logStart('Searching Genius for BTS Song Credits');

    // Build a deduplicated list of tracks (by normalized title)
    const seen = new Set<string>();
    const allTracks: { title: string; album: string }[] = [];

    for (const album of mbData) {
        for (const track of album.tracks) {
            const norm = normalizeTitle(track.title);
            if (!seen.has(norm)) {
                seen.add(norm);
                allTracks.push({ title: track.title, album: album.title });
            }
        }
    }

    // Resume from progress cache if available
    const progressCache = loadCache<GeniusSong[]>('genius-songs-progress') || [];
    const processedTitles = new Set(progressCache.map(r => normalizeTitle(r.track_title)));

    console.log(`   📋 ${allTracks.length} unique tracks to search (${processedTitles.size} already done)\n`);

    const results: GeniusSong[] = [...progressCache];
    let found = processedTitles.size;
    let notFound = 0;

    for (let i = 0; i < allTracks.length; i++) {
        const { title, album } = allTracks[i];

        // Skip already processed
        if (processedTitles.has(normalizeTitle(title))) continue;

        logProgress(i + 1, allTracks.length, `"${title}" (${album})`);

        const result = await searchGeniusSong(title, album);

        if (result) {
            results.push(result);
            found++;
            logSuccess(`Found: ${result.writers.length} writers, ${result.producers.length} producers`);
        } else {
            notFound++;
            logWarning(`Not found on Genius`);
        }

        // Save progress every 25 songs
        if ((i + 1) % 25 === 0) {
            saveCache('genius-songs-progress', results);
        }

        await delay(1000); // Respect rate limits
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Found on Genius: ${found}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Match rate: ${Math.round((found / allTracks.length) * 100)}%`);

    saveCache('genius-songs', results);
    logDone('Genius song search complete!');
}

main().catch(console.error);
