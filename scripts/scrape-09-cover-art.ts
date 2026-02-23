/**
 * Script 9: Fetch album cover art from Cover Art Archive
 *
 * Uses MusicBrainz release group IDs from the discography cache to fetch
 * front cover art URLs from the Cover Art Archive API.
 *
 * Usage: npx tsx scripts/scrape-09-cover-art.ts
 *        npx tsx scripts/scrape-09-cover-art.ts --dry-run
 *        npx tsx scripts/scrape-09-cover-art.ts --upsert
 */

import axios from 'axios';
import { createSupabaseAdmin, delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPSERT = process.argv.includes('--upsert');

interface MBAlbum {
    title: string;
    release_date: string;
    type: string;
    track_count: number;
    mb_release_group_id: string;
    mb_release_id: string;
}

interface CoverArtResult {
    album_title: string;
    mb_release_group_id: string;
    cover_art_url: string | null;
    thumbnail_url: string | null;
}

async function fetchCoverArt(mbReleaseGroupId: string): Promise<{ front: string | null; thumbnail: string | null }> {
    const url = `https://coverartarchive.org/release-group/${mbReleaseGroupId}`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'BangtanUniverse/0.1.0 (hello@praks.me)',
                'Accept': 'application/json',
            },
            timeout: 15000,
        });

        // Find the front image
        const images = data.images || [];
        const frontImage = images.find((img: any) => img.front === true) || images[0];

        if (frontImage) {
            return {
                front: frontImage.image || null,
                thumbnail: frontImage.thumbnails?.large || frontImage.thumbnails?.small || null,
            };
        }

        return { front: null, thumbnail: null };
    } catch (err: any) {
        if (err.response?.status === 404) {
            // No cover art available - this is normal
            return { front: null, thumbnail: null };
        }
        throw err;
    }
}

async function upsertToSupabase(results: CoverArtResult[]) {
    const supabase = createSupabaseAdmin();

    logStart('Updating cover art URLs in Supabase');

    let updated = 0;
    let skipped = 0;

    for (const result of results) {
        if (!result.cover_art_url) {
            skipped++;
            continue;
        }

        if (DRY_RUN) {
            logSuccess(`[DRY RUN] Would update "${result.album_title}" cover art`);
            updated++;
            continue;
        }

        // Try to find the album by title in the DB
        const { data: albums, error: fetchErr } = await supabase
            .from('albums')
            .select('id, title')
            .ilike('title', result.album_title);

        if (fetchErr) {
            logError(`Failed to find album "${result.album_title}": ${fetchErr.message}`);
            continue;
        }

        if (!albums || albums.length === 0) {
            logWarning(`Album "${result.album_title}" not found in DB - skipping`);
            skipped++;
            continue;
        }

        const albumId = albums[0].id;

        const { error } = await supabase
            .from('albums')
            .update({
                cover_art_url: result.cover_art_url,
            })
            .eq('id', albumId);

        if (error) {
            logError(`Failed to update "${result.album_title}": ${error.message}`);
        } else {
            logSuccess(`Updated cover art for "${result.album_title}"`);
            updated++;
        }
    }

    console.log(`\n   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
}

async function main() {
    // Check for cached data
    const cached = loadCache<CoverArtResult[]>('cover-art');
    if (cached) {
        console.log(`\n   Found cached cover art data (${cached.length} albums). Delete scripts/cache/cover-art.json to re-fetch.\n`);

        if (UPSERT) {
            await upsertToSupabase(cached);
        }
        return;
    }

    // Load discography cache
    const discography = loadCache<MBAlbum[]>('musicbrainz-discography');
    if (!discography) {
        logError('No MusicBrainz discography cache found. Run scrape-01 first.');
        process.exit(1);
    }

    logStart('Fetching Cover Art from Cover Art Archive');

    if (DRY_RUN) {
        logWarning('DRY RUN mode - no data will be written to Supabase');
    }

    const results: CoverArtResult[] = [];
    let found = 0;
    let notFound = 0;

    for (let i = 0; i < discography.length; i++) {
        const album = discography[i];
        logProgress(i + 1, discography.length, album.title);

        try {
            const coverArt = await fetchCoverArt(album.mb_release_group_id);

            results.push({
                album_title: album.title,
                mb_release_group_id: album.mb_release_group_id,
                cover_art_url: coverArt.front,
                thumbnail_url: coverArt.thumbnail,
            });

            if (coverArt.front) {
                logSuccess(`${album.title}: cover art found`);
                found++;
            } else {
                logWarning(`${album.title}: no cover art available`);
                notFound++;
            }
        } catch (err: any) {
            logWarning(`${album.title}: error fetching cover art - ${err.message}`);
            results.push({
                album_title: album.title,
                mb_release_group_id: album.mb_release_group_id,
                cover_art_url: null,
                thumbnail_url: null,
            });
            notFound++;
        }

        // Rate limit: Cover Art Archive asks for polite usage
        await delay(1200);
    }

    // Summary
    console.log(`\n   Summary:`);
    console.log(`   Albums processed: ${discography.length}`);
    console.log(`   Cover art found: ${found}`);
    console.log(`   No cover art: ${notFound}`);

    saveCache('cover-art', results);

    if (UPSERT) {
        await upsertToSupabase(results);
    }

    logDone('Cover art fetched!');
}

main().catch(console.error);
