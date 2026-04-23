/**
 * Script 4: Upsert albums into Supabase
 *
 * Merges MusicBrainz + Wiki data and writes to the albums table.
 * Preserves existing cover_color and description for known albums.
 *
 * Usage: npx tsx scripts/scrape-04-upsert-albums.ts
 */

import { createSupabaseAdmin, loadCache, logStart, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();

interface MBAlbum {
    title: string;
    release_date: string;
    type: string;
    track_count: number;
    tracks: { title: string; position: number; duration_seconds: number | null }[];
    mb_release_group_id: string;
    mb_release_id: string;
}

interface WikiAlbum {
    title: string;
    title_korean: string | null;
    era: string;
    wiki_url: string;
}

// Default values for new albums we discover
const NEW_ALBUM_DEFAULTS: Record<string, { cover_color: string; description: string; era: string }> = {
    '2 Cool 4 Skool': {
        cover_color: '#1a1a2e',
        description: "BTS's debut single album featuring 'No More Dream' and 'We Are Bulletproof Pt.2'.",
        era: 'School Trilogy',
    },
    'O!RUL8,2?': {
        cover_color: '#16213e',
        description: "Second extended play exploring the pressures of youth and society with 'N.O' as the lead single.",
        era: 'School Trilogy',
    },
    'Skool Luv Affair': {
        cover_color: '#0f3460',
        description: "Third EP blending hip-hop with school themes. Features 'Boy In Luv' and 'Just One Day'.",
        era: 'School Trilogy',
    },
    'Skool Luv Affair Special Addition': {
        cover_color: '#533483',
        description: "Repackage of Skool Luv Affair with additional tracks including 'Miss Right'.",
        era: 'School Trilogy',
    },
};

function normalizeForMatch(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// MusicBrainz uses Korean/Japanese titles; DB uses English titles
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

async function main() {
    const mbData = loadCache<MBAlbum[]>('musicbrainz-discography');
    const wikiData = loadCache<WikiAlbum[]>('wiki-metadata');

    if (!mbData) {
        console.error('❌ No MusicBrainz cache. Run scrape-01 first.');
        process.exit(1);
    }

    logStart('Upserting Albums into Supabase');

    // Load existing albums from DB
    const { data: existingAlbums, error: fetchErr } = await supabase
        .from('albums')
        .select('*')
        .order('id');

    if (fetchErr) {
        logError(`Failed to fetch existing albums: ${fetchErr.message}`);
        process.exit(1);
    }

    logSuccess(`Found ${existingAlbums?.length || 0} existing albums in DB`);

    // Build lookup map for existing albums
    const existingMap = new Map<string, any>();
    for (const album of existingAlbums || []) {
        existingMap.set(normalizeForMatch(album.title), album);
    }

    // Build wiki lookup
    const wikiMap = new Map<string, WikiAlbum>();
    for (const wa of wikiData || []) {
        wikiMap.set(normalizeForMatch(wa.title), wa);
    }

    let updated = 0;
    let inserted = 0;

    for (const mbAlbum of mbData) {
        const normTitle = normalizeForMatch(mbAlbum.title);
        // Try direct match, then alias match
        let existing = existingMap.get(normTitle);
        if (!existing) {
            const aliasTitle = MB_TO_DB_ALBUM[mbAlbum.title];
            if (aliasTitle) existing = existingMap.get(normalizeForMatch(aliasTitle));
        }
        const wiki = wikiMap.get(normTitle);

        if (existing) {
            // UPDATE existing album with enriched data
            const updates: Record<string, unknown> = {};

            // Only update fields where we have better data
            if (wiki?.title_korean && !existing.title_korean) {
                updates.title_korean = wiki.title_korean;
            }
            if (mbAlbum.track_count > 0 && mbAlbum.track_count !== existing.track_count) {
                updates.track_count = mbAlbum.track_count;
            }
            if (wiki?.era && !existing.era) {
                updates.era = wiki.era;
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase
                    .from('albums')
                    .update(updates)
                    .eq('id', existing.id);

                if (error) {
                    logError(`Failed to update "${mbAlbum.title}": ${error.message}`);
                } else {
                    logSuccess(`Updated "${mbAlbum.title}" (${Object.keys(updates).join(', ')})`);
                    updated++;
                }
            } else {
                logSuccess(`"${mbAlbum.title}" - no updates needed`);
            }
        } else {
            // INSERT new album
            const defaults = NEW_ALBUM_DEFAULTS[mbAlbum.title] || {
                cover_color: '#6B21A8',
                description: `BTS album: ${mbAlbum.title}`,
                era: wiki?.era || 'Unknown',
            };

            // Validate date format (Postgres needs YYYY-MM-DD, not just YYYY)
            let releaseDate = mbAlbum.release_date;
            if (releaseDate && /^\d{4}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01-01`; // Default to Jan 1
            } else if (releaseDate && /^\d{4}-\d{2}$/.test(releaseDate)) {
                releaseDate = `${releaseDate}-01`; // Default to 1st of month
            }

            // Truncate Korean title to 255 chars
            let titleKorean = wiki?.title_korean || null;
            if (titleKorean && titleKorean.length > 255) titleKorean = null;

            const newAlbum = {
                title: mbAlbum.title,
                title_korean: titleKorean,
                release_date: releaseDate || null,
                type: mbAlbum.type,
                track_count: mbAlbum.track_count,
                description: defaults.description,
                era: defaults.era,
                cover_color: defaults.cover_color,
            };

            const { error } = await supabase
                .from('albums')
                .insert(newAlbum);

            if (error) {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    // Sequence conflict - skip silently, album already exists
                    logWarning(`"${mbAlbum.title}" - skipped (already exists)`);
                } else {
                    logError(`Failed to insert "${mbAlbum.title}": ${error.message}`);
                }
            } else {
                logSuccess(`Inserted NEW album: "${mbAlbum.title}" (${mbAlbum.type}, ${mbAlbum.track_count} tracks)`);
                inserted++;
            }
        }
    }

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Inserted: ${inserted}`);

    // Print final album list
    const { data: finalAlbums } = await supabase
        .from('albums')
        .select('id, title, track_count, era')
        .order('release_date');

    console.log(`\n   Final album list (${finalAlbums?.length || 0} total):`);
    for (const a of finalAlbums || []) {
        console.log(`     [${a.id}] ${a.title} (${a.track_count} tracks, ${a.era})`);
    }

    logDone('Albums upserted!');
}

main().catch(console.error);
