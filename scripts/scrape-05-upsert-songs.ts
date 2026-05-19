/**
 * Script 5: Upsert songs into Supabase
 *
 * Merges MusicBrainz (durations) + Wiki (Korean titles, members) + Genius (credits)
 * and writes to the songs table.
 *
 * For existing songs: updates duration, writers, producers, Korean titles.
 * Keeps existing audio features and sentiment.
 * For new songs: inserts with null audio features.
 *
 * Usage: npx tsx scripts/scrape-05-upsert-songs.ts
 */

import { createSupabaseAdmin, loadCache, logStart, logProgress, logSuccess, logError, logWarning, logDone, normalizeTitle, titlesMatch, extractMemberIds } from './scrape-utils.js';

const supabase = createSupabaseAdmin();

// MusicBrainz uses Korean/Japanese titles; DB uses English titles
// This map resolves the mismatches
const MB_TO_DB_ALBUM: Record<string, string> = {
    '화양연화 pt.1': 'The Most Beautiful Moment in Life Pt.1',
    '화양연화 pt.2': 'The Most Beautiful Moment in Life Pt.2',
    '화양연화 Young Forever': 'The Most Beautiful Moment in Life: Young Forever',
    'DARK&WILD': 'Dark & Wild',
    'WINGS': 'Wings',
    'LOVE YOURSELF 承 \'Her\'': 'Love Yourself: Her',
    'LOVE YOURSELF 轉 \'Tear\'': 'Love Yourself: Tear',
    'LOVE YOURSELF 結 \'Answer\'': 'Love Yourself: Answer',
    'MAP OF THE SOUL : PERSONA': 'Map of the Soul: Persona',
    'MAP OF THE SOUL : 7': 'Map of the Soul: 7',
};

interface MBAlbum {
    title: string;
    release_date: string;
    type: string;
    tracks: { title: string; position: number; duration_seconds: number | null; mb_recording_id: string }[];
}

interface WikiAlbum {
    title: string;
    tracks: { title: string; title_korean: string | null; is_title_track: boolean; has_mv: boolean; writers: string[]; member_credits: string[] }[];
}

interface GeniusSong {
    track_title: string;
    album_title: string;
    genius_id: number;
    genius_url: string;
    writers: string[];
    producers: string[];
}

async function main() {
    const mbData = loadCache<MBAlbum[]>('musicbrainz-discography');
    const wikiData = loadCache<WikiAlbum[]>('wiki-metadata');
    const geniusData = loadCache<GeniusSong[]>('genius-songs');

    if (!mbData) {
        console.error('❌ No MusicBrainz cache. Run scrape-01 first.');
        process.exit(1);
    }

    logStart('Upserting Songs into Supabase');

    // Load album ID mapping from DB
    const { data: albums } = await supabase
        .from('albums')
        .select('id, title')
        .order('id');

    if (!albums || albums.length === 0) {
        logError('No albums in DB. Run scrape-04 first.');
        process.exit(1);
    }

    const albumIdMap = new Map<string, number>();
    for (const a of albums) {
        albumIdMap.set(normalizeTitle(a.title), a.id);
    }
    logSuccess(`Loaded ${albums.length} album ID mappings`);

    // Load existing songs from DB
    const { data: existingSongs } = await supabase
        .from('songs')
        .select('*')
        .order('id');

    const existingMap = new Map<string, any>();
    for (const s of existingSongs || []) {
        // Key by normalized title + album_id
        existingMap.set(`${normalizeTitle(s.title)}_${s.album_id}`, s);
    }
    logSuccess(`Found ${existingSongs?.length || 0} existing songs`);

    // Build wiki lookup: albumTitle -> { trackTitle -> WikiTrack }
    const wikiLookup = new Map<string, Map<string, any>>();
    for (const wa of wikiData || []) {
        const trackMap = new Map<string, any>();
        for (const t of wa.tracks) {
            trackMap.set(normalizeTitle(t.title), t);
        }
        wikiLookup.set(normalizeTitle(wa.title), trackMap);
    }

    // Build genius lookup: normalizedTitle -> GeniusSong
    const geniusLookup = new Map<string, GeniusSong>();
    for (const gs of geniusData || []) {
        geniusLookup.set(normalizeTitle(gs.track_title), gs);
    }

    let updated = 0;
    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const mbAlbum of mbData) {
        // Try direct match, then alias match
        let albumId = albumIdMap.get(normalizeTitle(mbAlbum.title));
        if (!albumId) {
            const aliasTitle = MB_TO_DB_ALBUM[mbAlbum.title];
            if (aliasTitle) {
                albumId = albumIdMap.get(normalizeTitle(aliasTitle));
            }
        }
        if (!albumId) {
            logWarning(`No album ID found for "${mbAlbum.title}" - skipping tracks`);
            skipped += mbAlbum.tracks.length;
            continue;
        }

        const wikiTracks = wikiLookup.get(normalizeTitle(mbAlbum.title));

        for (const track of mbAlbum.tracks) {
            const normTitle = normalizeTitle(track.title);
            const existingKey = `${normTitle}_${albumId}`;
            const existing = existingMap.get(existingKey);

            // Find matching wiki and genius data
            // Wiki track shape is dynamic (from web scraping); fields accessed: title, title_korean, is_title_track, has_mv
            type WikiTrack = { title: string; title_korean?: string | null; is_title_track?: boolean; has_mv?: boolean };
            let wikiTrack: WikiTrack | null = wikiTracks?.get(normTitle) || null;
            // Try fuzzy match on wiki
            if (!wikiTrack && wikiTracks) {
                for (const [wNorm, wt] of wikiTracks) {
                    if (titlesMatch(track.title, wt.title)) {
                        wikiTrack = wt;
                        break;
                    }
                }
            }

            const geniusSong = geniusLookup.get(normTitle);

            if (existing) {
                // UPDATE existing song - enrich with scraped data
                const updates: Record<string, unknown> = {};

                // Duration from MusicBrainz (authoritative)
                if (track.duration_seconds && track.duration_seconds !== existing.duration_seconds) {
                    updates.duration_seconds = track.duration_seconds;
                }

                // Korean title from wiki
                if (wikiTrack?.title_korean && !existing.title_korean) {
                    updates.title_korean = wikiTrack.title_korean;
                }

                // Writers from Genius (authoritative - replace existing)
                if (geniusSong?.writers && geniusSong.writers.length > 0) {
                    updates.writers = geniusSong.writers;
                    // Also extract member credits from writers
                    const memberIds = extractMemberIds(geniusSong.writers);
                    if (memberIds.length > 0) {
                        updates.member_credits = memberIds;
                    }
                }

                // Producers from Genius (authoritative - replace existing)
                if (geniusSong?.producers && geniusSong.producers.length > 0) {
                    updates.producers = geniusSong.producers;
                }

                // Title track and MV flags from wiki
                if (wikiTrack?.is_title_track) {
                    updates.is_title_track = true;
                }
                if (wikiTrack?.has_mv) {
                    updates.has_mv = true;
                }

                // KEEP existing: bpm, energy, valence, danceability, acousticness, sentiment, keywords

                if (Object.keys(updates).length > 0) {
                    const { error } = await supabase
                        .from('songs')
                        .update(updates)
                        .eq('id', existing.id);

                    if (error) {
                        errors.push(`Update "${track.title}": ${error.message}`);
                    } else {
                        updated++;
                    }
                }
            } else {
                // INSERT new song
                // Validate date format
                let releaseDate = mbAlbum.release_date;
                if (releaseDate && /^\d{4}$/.test(releaseDate)) {
                    releaseDate = `${releaseDate}-01-01`;
                } else if (releaseDate && /^\d{4}-\d{2}$/.test(releaseDate)) {
                    releaseDate = `${releaseDate}-01`;
                }

                const newSong: Record<string, unknown> = {
                    title: track.title,
                    title_korean: wikiTrack?.title_korean || null,
                    album_id: albumId,
                    release_date: releaseDate || null,
                    duration_seconds: track.duration_seconds,
                    // Audio features: null (honest about missing data)
                    bpm: null,
                    energy: null,
                    valence: null,
                    danceability: null,
                    acousticness: null,
                    // Metadata
                    sentiment: null,
                    keywords: [],
                    writers: geniusSong?.writers || [],
                    producers: geniusSong?.producers || [],
                    member_credits: geniusSong ? extractMemberIds(geniusSong.writers) : [],
                    is_title_track: wikiTrack?.is_title_track || false,
                    has_mv: wikiTrack?.has_mv || false,
                };

                const { error } = await supabase
                    .from('songs')
                    .insert(newSong);

                if (error) {
                    // May be a duplicate - skip silently
                    if (error.message.includes('duplicate') || error.message.includes('unique')) {
                        skipped++;
                    } else {
                        errors.push(`Insert "${track.title}": ${error.message}`);
                    }
                } else {
                    inserted++;
                }
            }
        }
    }

    // Print errors if any
    if (errors.length > 0) {
        console.log(`\n   Errors (${errors.length}):`);
        for (const e of errors.slice(0, 10)) {
            logError(e);
        }
        if (errors.length > 10) logWarning(`...and ${errors.length - 10} more`);
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors.length}`);

    // Final count
    const { count } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });
    console.log(`   Total songs in DB: ${count}`);

    logDone('Songs upserted!');
}

main().catch(console.error);
