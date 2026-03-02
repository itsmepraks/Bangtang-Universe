/**
 * Script 16: Enrich BTS concert data from setlist.fm API
 *
 * Fetches all BTS setlists from setlist.fm, merges with existing
 * Wikipedia concert data (scripts/cache/concerts.json) to produce
 * a unified concerts-merged.json with setlists, coordinates, and
 * attendance figures.
 *
 * Usage:
 *   npx tsx scripts/scrape-16-setlistfm.ts                  # cache only
 *   npx tsx scripts/scrape-16-setlistfm.ts --upsert          # cache + write to DB
 *   npx tsx scripts/scrape-16-setlistfm.ts --force            # re-fetch from API
 *   npx tsx scripts/scrape-16-setlistfm.ts --force --upsert   # re-fetch + write
 */

import axios from 'axios';
import {
    createSupabaseAdmin,
    delay,
    saveCache,
    loadCache,
    logStart,
    logProgress,
    logSuccess,
    logError,
    logWarning,
    logDone,
} from './scrape-utils.js';

// ==================== CONSTANTS ====================

const BTS_MBID = '0d79fe8e-ba27-4859-bb8c-2f255f346853';
const API_BASE = 'https://api.setlist.fm/rest/1.0';
const ITEMS_PER_PAGE = 20;
const PAGE_DELAY_MS = 200;

// ==================== setlist.fm API RESPONSE TYPES ====================

interface SfmCoords {
    lat: number;
    long: number;
}

interface SfmCountry {
    code: string;
    name: string;
}

interface SfmCity {
    id: string;
    name: string;
    state: string;
    stateCode: string;
    coords: SfmCoords;
    country: SfmCountry;
}

interface SfmVenue {
    id: string;
    name: string;
    url: string;
    city: SfmCity;
}

interface SfmTour {
    name: string;
}

interface SfmSong {
    name: string;
    info?: string;
    tape?: boolean;
    with?: { mbid: string; name: string };
    cover?: { mbid: string; name: string };
}

interface SfmSet {
    name?: string;
    encore?: number;
    song: SfmSong[];
}

interface SfmSetlist {
    id: string;
    versionId: string;
    eventDate: string; // DD-MM-YYYY
    lastUpdated: string;
    artist: { mbid: string; name: string; sortName: string; url: string };
    venue: SfmVenue;
    tour?: SfmTour;
    sets: { set: SfmSet[] };
    info?: string;
    url: string;
}

interface SfmSetlistsResponse {
    setlist: SfmSetlist[];
    total: number;
    page: number;
    itemsPerPage: number;
}

// ==================== MERGED CONCERT TYPE ====================

interface MergedConcert {
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string; // YYYY-MM-DD
    attendance: number | null;
    setlist: string[] | null;
    notes: string | null;
    lat: number | null;
    lng: number | null;
}

/** Shape of Wikipedia concert data from scripts/cache/concerts.json */
interface WikiConcert {
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string;
    attendance: number | null;
    notes: string | null;
}

// ==================== HELPERS ====================

/**
 * Get the setlist.fm API key from environment
 */
function getApiKey(): string {
    const key = process.env.SETLISTFM_API_KEY;
    if (!key) {
        logError('Missing SETLISTFM_API_KEY in .env');
        process.exit(1);
    }
    return key;
}

/**
 * Convert setlist.fm date (DD-MM-YYYY) to ISO date (YYYY-MM-DD)
 */
function sfmDateToIso(sfmDate: string): string {
    const [dd, mm, yyyy] = sfmDate.split('-');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Extract song names from setlist.fm sets structure.
 * Flattens all sets (main + encores) into a single ordered list.
 * Skips tape-only entries (pre-recorded interludes).
 */
function extractSongNames(sets: { set: SfmSet[] }): string[] | null {
    if (!sets?.set || sets.set.length === 0) return null;

    const songs: string[] = [];
    for (const set of sets.set) {
        if (!set.song) continue;
        for (const song of set.song) {
            if (song.tape) continue; // skip pre-recorded interludes
            if (song.name) songs.push(song.name);
        }
    }

    return songs.length > 0 ? songs : null;
}

/**
 * Build a merge key from (date, city_lowercase) for matching
 * Wikipedia concerts with setlist.fm concerts
 */
function mergeKey(date: string, city: string): string {
    return `${date}|${city.toLowerCase().trim()}`;
}

/**
 * Build a dedup key from (date, venue) for database deduplication
 */
function dedupKey(date: string, venue: string): string {
    return `${date}|${venue.toLowerCase().trim()}`;
}

// ==================== API FETCHING ====================

/**
 * Fetch all BTS setlists from setlist.fm with pagination
 */
async function fetchAllSetlists(): Promise<SfmSetlist[]> {
    const apiKey = getApiKey();
    logStart('Fetching BTS setlists from setlist.fm API');

    const allSetlists: SfmSetlist[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const url = `${API_BASE}/artist/${BTS_MBID}/setlists?p=${page}`;

        try {
            const { data } = await axios.get<SfmSetlistsResponse>(url, {
                headers: {
                    'Accept': 'application/json',
                    'x-api-key': apiKey,
                },
                timeout: 15000,
            });

            // Calculate total pages on first request
            if (page === 1) {
                totalPages = Math.ceil(data.total / data.itemsPerPage);
                console.log(`   Total setlists: ${data.total} across ${totalPages} pages`);
            }

            const setlists = data.setlist || [];
            allSetlists.push(...setlists);
            logProgress(page, totalPages, `Page ${page} — ${setlists.length} setlists`);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            logWarning(`Failed to fetch page ${page}: ${msg}`);
            // Continue to next page — partial data is still useful
        }

        page++;

        // Respect rate limits
        if (page <= totalPages) {
            await delay(PAGE_DELAY_MS);
        }
    }

    logSuccess(`Fetched ${allSetlists.length} setlists from setlist.fm`);
    return allSetlists;
}

// ==================== TRANSFORM ====================

/**
 * Convert raw setlist.fm data into our MergedConcert format
 */
function transformSetlists(setlists: SfmSetlist[]): MergedConcert[] {
    return setlists.map(sl => ({
        tour_name: sl.tour?.name || 'Unknown Tour',
        venue: sl.venue?.name || 'Unknown',
        city: sl.venue?.city?.name || 'Unknown',
        country: sl.venue?.city?.country?.name || 'Unknown',
        date: sfmDateToIso(sl.eventDate),
        attendance: null, // setlist.fm doesn't provide attendance
        setlist: extractSongNames(sl.sets),
        notes: sl.info || null,
        lat: sl.venue?.city?.coords?.lat ?? null,
        lng: sl.venue?.city?.coords?.long ?? null,
    }));
}

// ==================== MERGE ====================

/**
 * Merge setlist.fm concerts with Wikipedia concerts.
 *
 * Strategy:
 *   - Use setlist.fm as the primary source (setlists, coordinates)
 *   - Match Wikipedia entries by (date, city_lowercase) tuple
 *   - Pull in attendance numbers from Wikipedia where available
 *   - Append any Wikipedia-only concerts to the merged result
 */
function mergeConcerts(sfmConcerts: MergedConcert[], wikiConcerts: WikiConcert[]): MergedConcert[] {
    logStart('Merging setlist.fm and Wikipedia concert data');

    // Index Wikipedia concerts by merge key
    const wikiByKey = new Map<string, WikiConcert>();
    for (const wc of wikiConcerts) {
        const key = mergeKey(wc.date, wc.city);
        wikiByKey.set(key, wc);
    }

    let matchCount = 0;
    let sfmOnlyCount = 0;
    let wikiOnlyCount = 0;

    // Start with setlist.fm concerts, enriching from Wikipedia
    const merged: MergedConcert[] = [];
    const usedWikiKeys = new Set<string>();

    for (const sfm of sfmConcerts) {
        const key = mergeKey(sfm.date, sfm.city);
        const wiki = wikiByKey.get(key);

        if (wiki) {
            matchCount++;
            usedWikiKeys.add(key);

            merged.push({
                ...sfm,
                // Prefer Wikipedia tour name if setlist.fm says "Unknown Tour"
                tour_name: sfm.tour_name === 'Unknown Tour' && wiki.tour_name
                    ? wiki.tour_name
                    : sfm.tour_name,
                // Take attendance from Wikipedia (setlist.fm doesn't have it)
                attendance: sfm.attendance ?? wiki.attendance,
                // Prefer setlist.fm venue name but keep Wikipedia notes
                notes: sfm.notes || wiki.notes,
            });
        } else {
            sfmOnlyCount++;
            merged.push(sfm);
        }
    }

    // Add Wikipedia-only concerts (not found in setlist.fm)
    for (const wc of wikiConcerts) {
        const key = mergeKey(wc.date, wc.city);
        if (!usedWikiKeys.has(key)) {
            wikiOnlyCount++;
            merged.push({
                tour_name: wc.tour_name,
                venue: wc.venue,
                city: wc.city,
                country: wc.country,
                date: wc.date,
                attendance: wc.attendance,
                setlist: null,
                notes: wc.notes,
                lat: null,
                lng: null,
            });
        }
    }

    // Sort by date ascending
    merged.sort((a, b) => a.date.localeCompare(b.date));

    logSuccess(`Merge complete:`);
    console.log(`     Matched (both sources): ${matchCount}`);
    console.log(`     setlist.fm only:        ${sfmOnlyCount}`);
    console.log(`     Wikipedia only:         ${wikiOnlyCount}`);
    console.log(`     Total merged:           ${merged.length}`);

    return merged;
}

// ==================== DATABASE ====================

/**
 * Upsert merged concerts into the database.
 *
 * - Inserts new concerts (by date + venue dedup key)
 * - Updates existing concerts: adds setlist/attendance where missing
 */
async function upsertConcerts(concerts: MergedConcert[]): Promise<void> {
    const supabase = createSupabaseAdmin();

    logStart('Upserting merged concerts to Supabase');

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < concerts.length; i++) {
        const concert = concerts[i];
        logProgress(i + 1, concerts.length, `${concert.tour_name} — ${concert.city} (${concert.date})`);

        // Check for existing entry by (date, venue)
        const { data: existing } = await supabase
            .from('concerts')
            .select('id, setlist, attendance, lat, lng')
            .eq('date', concert.date)
            .eq('venue', concert.venue)
            .limit(1);

        if (existing && existing.length > 0) {
            const row = existing[0];
            const updates: Record<string, unknown> = {};

            // Add setlist if the existing row doesn't have one
            if (!row.setlist && concert.setlist) {
                updates.setlist = concert.setlist;
            }
            // Add attendance if the existing row doesn't have one
            if (row.attendance == null && concert.attendance != null) {
                updates.attendance = concert.attendance;
            }
            // Add coordinates if the existing row doesn't have them
            if (row.lat == null && concert.lat != null) {
                updates.lat = concert.lat;
            }
            if (row.lng == null && concert.lng != null) {
                updates.lng = concert.lng;
            }

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase
                    .from('concerts')
                    .update(updates)
                    .eq('id', row.id);

                if (error) {
                    logWarning(`Failed to update ${concert.city} (${concert.date}): ${error.message}`);
                } else {
                    updated++;
                }
            } else {
                skipped++;
            }

            continue;
        }

        // Insert new concert
        const { error } = await supabase.from('concerts').insert({
            tour_name: concert.tour_name,
            venue: concert.venue,
            city: concert.city,
            country: concert.country,
            date: concert.date,
            attendance: concert.attendance,
            setlist: concert.setlist,
            notes: concert.notes,
            lat: concert.lat,
            lng: concert.lng,
        });

        if (error) {
            logWarning(`Failed to insert ${concert.city} (${concert.date}): ${error.message}`);
        } else {
            inserted++;
        }
    }

    console.log(`\n   Summary: ${inserted} inserted, ${updated} updated, ${skipped} unchanged`);
    logDone('Concerts upserted!');
}

// ==================== STATS ====================

/**
 * Print summary statistics for the merged concert data
 */
function printStats(concerts: MergedConcert[]): void {
    console.log('\n   ── Summary Statistics ──');

    // Total concerts
    console.log(`   Total concerts:        ${concerts.length}`);

    // With setlists
    const withSetlist = concerts.filter(c => c.setlist && c.setlist.length > 0).length;
    console.log(`   With setlists:         ${withSetlist} (${pct(withSetlist, concerts.length)})`);

    // With attendance
    const withAttendance = concerts.filter(c => c.attendance != null).length;
    console.log(`   With attendance:       ${withAttendance} (${pct(withAttendance, concerts.length)})`);

    // With coordinates
    const withCoords = concerts.filter(c => c.lat != null && c.lng != null).length;
    console.log(`   With coordinates:      ${withCoords} (${pct(withCoords, concerts.length)})`);

    // Date range
    const dates = concerts.map(c => c.date).sort();
    if (dates.length > 0) {
        console.log(`   Date range:            ${dates[0]} → ${dates[dates.length - 1]}`);
    }

    // By tour
    const tourCounts = new Map<string, number>();
    for (const c of concerts) {
        tourCounts.set(c.tour_name, (tourCounts.get(c.tour_name) || 0) + 1);
    }
    console.log('\n   Concerts by tour:');
    const sortedTours = [...tourCounts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [tour, count] of sortedTours) {
        console.log(`     ${tour}: ${count} shows`);
    }

    // Unique countries
    const countries = new Set(concerts.map(c => c.country));
    console.log(`\n   Unique countries:      ${countries.size}`);

    // Unique cities
    const cities = new Set(concerts.map(c => c.city));
    console.log(`   Unique cities:         ${cities.size}`);
}

function pct(n: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((n / total) * 100)}%`;
}

// ==================== MAIN ====================

async function main() {
    const forceRefresh = process.argv.includes('--force');

    // ── Step 1: Get setlist.fm data (cached or fresh) ──
    let sfmRaw: SfmSetlist[];
    const cachedSfm = loadCache<SfmSetlist[]>('concerts-setlistfm');

    if (cachedSfm && !forceRefresh) {
        console.log(`\n   Using cached setlist.fm data (${cachedSfm.length} entries).\n`);
        sfmRaw = cachedSfm;
    } else {
        sfmRaw = await fetchAllSetlists();
        saveCache('concerts-setlistfm', sfmRaw);
    }

    // ── Step 2: Transform setlist.fm data ──
    const sfmConcerts = transformSetlists(sfmRaw);
    logSuccess(`Transformed ${sfmConcerts.length} setlist.fm entries`);

    // ── Step 3: Load Wikipedia concert data ──
    const wikiConcerts = loadCache<WikiConcert[]>('concerts') || [];
    if (wikiConcerts.length > 0) {
        console.log(`   Loaded ${wikiConcerts.length} Wikipedia concert entries for merging.`);
    } else {
        logWarning('No Wikipedia concert cache found. Run scrape:concerts first for attendance data.');
    }

    // ── Step 4: Merge both sources ──
    const merged = mergeConcerts(sfmConcerts, wikiConcerts);
    saveCache('concerts-merged', merged);

    // ── Step 5: Print stats ──
    printStats(merged);

    // ── Step 6: Upsert to DB if requested ──
    if (process.argv.includes('--upsert')) {
        await upsertConcerts(merged);
    } else {
        console.log('\n   Dry run complete. Use --upsert to write to database.');
    }

    logDone('setlist.fm concert enrichment complete!');
}

main().catch(console.error);
