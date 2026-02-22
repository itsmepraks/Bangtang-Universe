/**
 * Script 1: Fetch BTS discography from MusicBrainz
 *
 * Gets all albums and tracks with accurate durations.
 * Free API, no auth needed, 1 req/sec rate limit.
 *
 * Usage: npx tsx scripts/scrape-01-musicbrainz-discography.ts
 */

import { MusicBrainzApi } from 'musicbrainz-api';
import { delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const BTS_MBID = '0d79fe8e-ba27-4859-bb8c-2f255f346853';

const mbApi = new MusicBrainzApi({
    appName: 'BangtanUniverse',
    appVersion: '0.1.0',
    appContactInfo: 'hello@praks.me',
});

// Album types we want (skip compilations with 40+ re-released tracks)
const ALBUM_TYPE_FILTER = ['Studio', 'Mini', 'Single', 'Repackage', 'Compilation'];

// Map MusicBrainz secondary types to our DB type enum
function mapAlbumType(primaryType: string, secondaryTypes: string[]): string {
    if (secondaryTypes.includes('Compilation')) return 'Compilation';
    if (secondaryTypes.includes('Remix')) return 'Single';
    switch (primaryType) {
        case 'Album': return 'Studio';
        case 'EP': return 'Mini';
        case 'Single': return 'Single';
        default: return 'Studio';
    }
}

interface MBTrack {
    title: string;
    position: number;
    duration_ms: number | null;
    duration_seconds: number | null;
    mb_recording_id: string;
}

interface MBAlbum {
    title: string;
    release_date: string;
    type: string;
    track_count: number;
    tracks: MBTrack[];
    mb_release_group_id: string;
    mb_release_id: string;
}

async function fetchDiscography(): Promise<MBAlbum[]> {
    logStart('Fetching BTS Discography from MusicBrainz');

    // Step 1: Get all release groups (albums)
    console.log('   📡 Fetching release groups...');
    const releaseGroups: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const result = await mbApi.browse('release-group', {
            artist: BTS_MBID,
            limit,
            offset,
        });

        releaseGroups.push(...(result['release-groups'] || []));

        if (releaseGroups.length >= (result['release-group-count'] || 0)) break;
        offset += limit;
        await delay(1200);
    }

    logSuccess(`Found ${releaseGroups.length} release groups`);

    // Step 2: Filter to Korean studio/mini/single albums
    const albums: MBAlbum[] = [];

    for (let i = 0; i < releaseGroups.length; i++) {
        const rg = releaseGroups[i];
        const primaryType = rg['primary-type'] || '';
        const secondaryTypes: string[] = rg['secondary-types'] || [];

        // Skip non-album types (like DJ-mix, live, etc.)
        if (!['Album', 'EP', 'Single'].includes(primaryType)) continue;
        // Skip live albums
        if (secondaryTypes.includes('Live')) continue;

        logProgress(i + 1, releaseGroups.length, `${rg.title} (${primaryType})`);

        await delay(1200);

        // Step 3: Get releases for this release group
        let rgDetail: any;
        try {
            rgDetail = await mbApi.lookup('release-group', rg.id, ['releases']);
        } catch (err: any) {
            logWarning(`Failed to fetch release group ${rg.title}: ${err.message}`);
            continue;
        }

        const releases = rgDetail.releases || [];

        // Prefer Korean release, fall back to first available
        let bestRelease = releases.find((r: any) => {
            const country = r.country || '';
            return country === 'KR' || country === 'XW'; // KR = Korea, XW = Worldwide
        }) || releases[0];

        if (!bestRelease) {
            logWarning(`No releases found for ${rg.title}`);
            continue;
        }

        await delay(1200);

        // Step 4: Get track listing
        let releaseDetail: any;
        try {
            releaseDetail = await mbApi.lookup('release', bestRelease.id, ['recordings']);
        } catch (err: any) {
            logWarning(`Failed to fetch release ${rg.title}: ${err.message}`);
            continue;
        }

        const media = releaseDetail.media || [];
        const tracks: MBTrack[] = [];

        for (const medium of media) {
            for (const track of medium.tracks || []) {
                const durationMs = track.recording?.length || track.length || null;
                tracks.push({
                    title: track.title || track.recording?.title || 'Unknown',
                    position: track.position,
                    duration_ms: durationMs,
                    duration_seconds: durationMs ? Math.round(durationMs / 1000) : null,
                    mb_recording_id: track.recording?.id || '',
                });
            }
        }

        const dbType = mapAlbumType(primaryType, secondaryTypes);

        albums.push({
            title: rg.title,
            release_date: bestRelease.date || rg['first-release-date'] || '',
            type: dbType,
            track_count: tracks.length,
            tracks,
            mb_release_group_id: rg.id,
            mb_release_id: bestRelease.id,
        });

        logSuccess(`${rg.title}: ${tracks.length} tracks`);
    }

    // Sort by release date
    albums.sort((a, b) => a.release_date.localeCompare(b.release_date));

    return albums;
}

async function main() {
    // Check for cached data
    const cached = loadCache<MBAlbum[]>('musicbrainz-discography');
    if (cached) {
        console.log(`\n📦 Found cached MusicBrainz data (${cached.length} albums). Delete scripts/cache/musicbrainz-discography.json to re-fetch.\n`);
        return;
    }

    const albums = await fetchDiscography();

    // Summary
    const totalTracks = albums.reduce((sum, a) => sum + a.tracks.length, 0);
    console.log(`\n📊 Summary:`);
    console.log(`   Albums: ${albums.length}`);
    console.log(`   Total tracks: ${totalTracks}`);
    console.log(`   Albums found:`);
    for (const a of albums) {
        console.log(`     - ${a.title} (${a.release_date}) [${a.type}] - ${a.track_count} tracks`);
    }

    saveCache('musicbrainz-discography', albums);
    logDone('MusicBrainz discography fetched!');
}

main().catch(console.error);
