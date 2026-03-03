/**
 * Seed BTS 5th Studio Album "ARIRANG" + 14 tracks into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-arirang.ts --dry-run
 *   npx tsx scripts/seed-arirang.ts
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');

const ARIRANG_ALBUM = {
    title: 'ARIRANG',
    title_korean: '아리랑',
    release_date: '2026-03-20',
    type: 'Studio',
    track_count: 14,
    description: "BTS's 5th studio album — the group's first since reuniting after military service. Lead single: SWIM.",
    era: 'ARIRANG',
} as const;

const ARIRANG_TRACKS = [
    { title: 'Body to Body', track_number: 1 },
    { title: 'Hooligan', track_number: 2 },
    { title: 'Aliens', track_number: 3 },
    { title: 'FYA', track_number: 4 },
    { title: '2.0', track_number: 5 },
    { title: 'No. 29', track_number: 6 },
    { title: 'SWIM', track_number: 7, is_title_track: true },
    { title: 'Merry Go Round', track_number: 8 },
    { title: 'NORMAL', track_number: 9 },
    { title: 'Like Animals', track_number: 10 },
    { title: "they don't know 'bout us", track_number: 11 },
    { title: 'One More Night', track_number: 12 },
    { title: 'Please', track_number: 13 },
    { title: 'Into the Sun', track_number: 14 },
] as const;

async function main() {
    logStart(`Seeding ARIRANG Album${DRY_RUN ? ' (DRY RUN)' : ''}`);

    // Check if album already exists
    const { data: existing } = await supabase
        .from('albums')
        .select('id')
        .eq('title', 'ARIRANG')
        .maybeSingle();

    if (existing) {
        logWarning(`ARIRANG album already exists (id: ${existing.id}). Skipping album insert.`);
        // Still check tracks
        const { data: existingTracks, error: te } = await supabase
            .from('songs')
            .select('id, title')
            .eq('album_id', existing.id);
        if (te) logError(te.message);
        console.log(`   Existing tracks: ${existingTracks?.length || 0}`);
        if ((existingTracks?.length || 0) >= 14) {
            logDone('All 14 tracks already exist. Nothing to do.');
            return;
        }
    }

    let albumId: number;

    if (existing) {
        albumId = existing.id;
    } else {
        console.log(`\n   Inserting album: ${ARIRANG_ALBUM.title} (${ARIRANG_ALBUM.release_date})`);
        if (!DRY_RUN) {
            const { data: album, error } = await supabase
                .from('albums')
                .insert(ARIRANG_ALBUM)
                .select('id')
                .single();
            if (error || !album) {
                logError(`Failed to insert album: ${error?.message}`);
                process.exit(1);
            }
            albumId = album.id;
            logSuccess(`Album inserted (id: ${albumId})`);
        } else {
            albumId = -1;
            logSuccess(`[DRY RUN] Would insert album`);
        }
    }

    // Insert tracks
    console.log(`\n   Inserting ${ARIRANG_TRACKS.length} tracks...\n`);
    let inserted = 0;
    let skipped = 0;

    for (const track of ARIRANG_TRACKS) {
        // Check if track already exists
        const { data: existingTrack } = await supabase
            .from('songs')
            .select('id')
            .eq('album_id', albumId)
            .eq('title', track.title)
            .maybeSingle();

        if (existingTrack) {
            skipped++;
            continue;
        }

        const songData = {
            title: track.title,
            album_id: albumId,
            track_number: track.track_number,
            is_title_track: 'is_title_track' in track ? track.is_title_track : false,
        };

        if (DRY_RUN) {
            console.log(`   [DRY RUN] Would insert: #${track.track_number} "${track.title}"`);
            inserted++;
        } else {
            const { error } = await supabase.from('songs').insert(songData);
            if (error) {
                logError(`Failed to insert "${track.title}": ${error.message}`);
            } else {
                logSuccess(`#${track.track_number} "${track.title}"`);
                inserted++;
            }
        }
    }

    console.log(`\n   Inserted: ${inserted}, Skipped (existing): ${skipped}`);
    if (DRY_RUN) logWarning('DRY RUN — no changes written.');
    else logDone('ARIRANG album seeded!');
}

main().catch(console.error);
