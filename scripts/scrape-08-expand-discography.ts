/**
 * Script 8: Expand discography with solo & collaboration releases
 *
 * Fetches solo and collaboration releases for each BTS member from MusicBrainz.
 * Marks songs as is_solo: true and links them to the performing member.
 *
 * Usage: npx tsx scripts/scrape-08-expand-discography.ts
 *        npx tsx scripts/scrape-08-expand-discography.ts --dry-run
 *        npx tsx scripts/scrape-08-expand-discography.ts --upsert
 */

import { MusicBrainzApi } from 'musicbrainz-api';
import { createSupabaseAdmin, delay, saveCache, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPSERT = process.argv.includes('--upsert');

// MusicBrainz Artist IDs for each BTS member
const MEMBER_MBIDS: Record<string, { name: string; mbid: string; slug: string }> = {
    rm: {
        name: 'RM',
        mbid: '24a19e3e-e461-49e7-9bac-315efce6f0a8',
        slug: 'rm',
    },
    jin: {
        name: 'Jin',
        mbid: '2c8b7b5c-3039-4c3e-85d3-be45c7562f2e',
        slug: 'jin',
    },
    suga: {
        name: 'SUGA / Agust D',
        mbid: '0b9dc95c-1314-4760-b641-8791ac7601c8',
        slug: 'suga',
    },
    jhope: {
        name: 'j-hope',
        mbid: '909b5263-1ba3-4573-92e8-af03fc510424',
        slug: 'jh',
    },
    jimin: {
        name: 'Jimin',
        mbid: 'eb4c5d0c-2e4b-48b8-8a29-27264fa30920',
        slug: 'jm',
    },
    v: {
        name: 'V',
        mbid: '2c2c5cd4-1c57-4291-bc09-47ee397b48ba',
        slug: 'v',
    },
    jungkook: {
        name: 'Jungkook',
        mbid: '1f7f2e2e-cdae-4a4c-8c2e-b38e56e2e2a9',
        slug: 'jk',
    },
};

const mbApi = new MusicBrainzApi({
    appName: 'BangtanUniverse',
    appVersion: '0.1.0',
    appContactInfo: 'hello@praks.me',
});

// Release group types we want
const WANTED_TYPES = new Set(['Album', 'EP', 'Single']);
const SKIP_SECONDARY = new Set(['Live', 'Compilation']);

interface SoloTrack {
    title: string;
    position: number;
    duration_ms: number | null;
    duration_seconds: number | null;
    mb_recording_id: string;
}

interface SoloRelease {
    member_slug: string;
    member_name: string;
    title: string;
    release_date: string;
    type: string;
    track_count: number;
    tracks: SoloTrack[];
    mb_release_group_id: string;
    mb_release_id: string;
    is_solo: boolean;
}

function mapAlbumType(primaryType: string, secondaryTypes: string[]): string {
    if (secondaryTypes.includes('Remix')) return 'Single';
    switch (primaryType) {
        case 'Album': return 'Studio';
        case 'EP': return 'Mini';
        case 'Single': return 'Single';
        default: return 'Studio';
    }
}

async function fetchMemberReleases(memberKey: string): Promise<SoloRelease[]> {
    const member = MEMBER_MBIDS[memberKey];
    console.log(`\n   --- Fetching releases for ${member.name} (${member.mbid}) ---`);

    const releaseGroups: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        try {
            const result = await mbApi.browse('release-group', {
                artist: member.mbid,
                limit,
                offset,
            });

            releaseGroups.push(...(result['release-groups'] || []));

            if (releaseGroups.length >= (result['release-group-count'] || 0)) break;
            offset += limit;
            await delay(1200);
        } catch (err: any) {
            logWarning(`Failed to browse release groups for ${member.name}: ${err.message}`);
            break;
        }
    }

    logSuccess(`${member.name}: found ${releaseGroups.length} release groups`);

    const releases: SoloRelease[] = [];

    for (let i = 0; i < releaseGroups.length; i++) {
        const rg = releaseGroups[i];
        const primaryType = rg['primary-type'] || '';
        const secondaryTypes: string[] = rg['secondary-types'] || [];

        // Filter: only Album, EP, Single; skip Live, Compilation
        if (!WANTED_TYPES.has(primaryType)) continue;
        if (secondaryTypes.some(t => SKIP_SECONDARY.has(t))) continue;

        logProgress(i + 1, releaseGroups.length, `${member.name} - ${rg.title} (${primaryType})`);
        await delay(1200);

        // Lookup release group to get releases
        let rgDetail: any;
        try {
            rgDetail = await mbApi.lookup('release-group', rg.id, ['releases']);
        } catch (err: any) {
            logWarning(`Failed to fetch release group ${rg.title}: ${err.message}`);
            continue;
        }

        const rgReleases = rgDetail.releases || [];

        // Prefer Korean or Worldwide release
        const bestRelease = rgReleases.find((r: any) => {
            const country = r.country || '';
            return country === 'KR' || country === 'XW';
        }) || rgReleases[0];

        if (!bestRelease) {
            logWarning(`No releases found for ${rg.title}`);
            continue;
        }

        await delay(1200);

        // Fetch track listing
        let releaseDetail: any;
        try {
            releaseDetail = await mbApi.lookup('release', bestRelease.id, ['recordings']);
        } catch (err: any) {
            logWarning(`Failed to fetch release ${rg.title}: ${err.message}`);
            continue;
        }

        const media = releaseDetail.media || [];
        const tracks: SoloTrack[] = [];

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

        releases.push({
            member_slug: member.slug,
            member_name: member.name,
            title: rg.title,
            release_date: bestRelease.date || rg['first-release-date'] || '',
            type: dbType,
            track_count: tracks.length,
            tracks,
            mb_release_group_id: rg.id,
            mb_release_id: bestRelease.id,
            is_solo: true,
        });

        logSuccess(`${rg.title}: ${tracks.length} tracks`);
    }

    return releases;
}

async function upsertToSupabase(releases: SoloRelease[]) {
    const supabase = createSupabaseAdmin();

    logStart('Upserting solo releases into Supabase');

    let songsInserted = 0;
    let songsFailed = 0;

    for (const release of releases) {
        for (const track of release.tracks) {
            // Validate date format
            let releaseDate = release.release_date;
            if (releaseDate && /^\d{4}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01-01`;
            } else if (releaseDate && /^\d{4}-\d{2}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01`;
            }

            const songData = {
                title: track.title,
                duration_seconds: track.duration_seconds,
                is_solo: true,
                member_slug: release.member_slug,
                release_date: releaseDate || null,
                mb_recording_id: track.mb_recording_id || null,
            };

            if (DRY_RUN) {
                logSuccess(`[DRY RUN] Would upsert song: "${track.title}" by ${release.member_name}`);
                songsInserted++;
                continue;
            }

            const { error } = await supabase
                .from('songs')
                .upsert(songData, { onConflict: 'mb_recording_id' });

            if (error) {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    logWarning(`"${track.title}" - skipped (already exists)`);
                } else {
                    logError(`Failed to upsert "${track.title}": ${error.message}`);
                    songsFailed++;
                }
            } else {
                songsInserted++;
            }
        }
    }

    console.log(`\n   Songs inserted: ${songsInserted}`);
    console.log(`   Songs failed: ${songsFailed}`);
}

async function main() {
    // Check for cached data
    const cached = loadCache<SoloRelease[]>('expanded-discography');
    if (cached) {
        console.log(`\n   Found cached expanded discography (${cached.length} releases). Delete scripts/cache/expanded-discography.json to re-fetch.\n`);

        if (UPSERT) {
            await upsertToSupabase(cached);
        }
        return;
    }

    logStart('Expanding BTS Discography - Solo & Collaboration Releases');

    if (DRY_RUN) {
        logWarning('DRY RUN mode - no data will be written to Supabase');
    }

    const allReleases: SoloRelease[] = [];
    const memberKeys = Object.keys(MEMBER_MBIDS);

    for (let i = 0; i < memberKeys.length; i++) {
        const key = memberKeys[i];
        logProgress(i + 1, memberKeys.length, MEMBER_MBIDS[key].name);

        const releases = await fetchMemberReleases(key);
        allReleases.push(...releases);

        // Extra delay between members to be polite
        if (i < memberKeys.length - 1) {
            await delay(2000);
        }
    }

    // Sort by release date
    allReleases.sort((a, b) => a.release_date.localeCompare(b.release_date));

    // Summary
    const totalTracks = allReleases.reduce((sum, r) => sum + r.tracks.length, 0);
    console.log(`\n   Summary:`);
    console.log(`   Solo releases found: ${allReleases.length}`);
    console.log(`   Total solo tracks: ${totalTracks}`);
    console.log(`   By member:`);
    for (const key of memberKeys) {
        const member = MEMBER_MBIDS[key];
        const memberReleases = allReleases.filter(r => r.member_slug === member.slug);
        const memberTracks = memberReleases.reduce((sum, r) => sum + r.tracks.length, 0);
        console.log(`     ${member.name}: ${memberReleases.length} releases, ${memberTracks} tracks`);
    }

    saveCache('expanded-discography', allReleases);

    if (UPSERT) {
        await upsertToSupabase(allReleases);
    }

    logDone('Expanded discography fetched!');
}

main().catch(console.error);
