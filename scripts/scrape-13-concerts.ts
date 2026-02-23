/**
 * Script 13: Scrape BTS concert/tour data from Wikipedia
 *
 * Parses the "List of BTS concert tours" Wikipedia page for
 * tour names, dates, venues, cities, countries, and attendance.
 *
 * Usage:
 *   npx tsx scripts/scrape-13-concerts.ts           # cache only
 *   npx tsx scripts/scrape-13-concerts.ts --upsert   # cache + write to DB
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
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

const USER_AGENT = 'BangtanUniverse/1.0 (https://github.com/itsmepraks/BTS-universe)';
const WIKI_URL = 'https://en.wikipedia.org/wiki/List_of_BTS_concert_tours';

interface Concert {
    tour_name: string;
    venue: string;
    city: string;
    country: string;
    date: string; // YYYY-MM-DD
    attendance: number | null;
    notes: string | null;
}

/**
 * Clean Wikipedia cell text: remove footnotes, citation markers, whitespace
 */
function cleanCell(text: string): string {
    return text
        .replace(/\[.*?\]/g, '')        // footnotes [a], [1], etc.
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse attendance numbers from various formats:
 *   "40,000" -> 40000
 *   "40,000/night" -> 40000
 *   "40,000 (2 nights)" -> 40000
 *   "Sold out" -> null
 *   "—" -> null
 */
function parseAttendance(text: string): number | null {
    const cleaned = cleanCell(text);
    if (!cleaned || cleaned === '\u2014' || cleaned === '-' || cleaned === '\u2013' || /sold\s*out/i.test(cleaned)) {
        return null;
    }

    // Extract the first number (with commas)
    const match = cleaned.match(/([\d,]+)/);
    if (!match) return null;

    const num = parseInt(match[1].replace(/,/g, ''), 10);
    return isNaN(num) ? null : num;
}

/**
 * Parse a date string from various Wikipedia formats into YYYY-MM-DD
 *   "June 13, 2015" -> "2015-06-13"
 *   "2015-06-13" -> "2015-06-13"
 *   "13 June 2015" -> "2015-06-13"
 *   "June 13-14, 2015" -> "2015-06-13" (take first date)
 */
function parseDate(text: string): string | null {
    const cleaned = cleanCell(text);
    if (!cleaned || cleaned === '\u2014' || cleaned === '-') return null;

    // Already in YYYY-MM-DD format
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];

    const MONTHS: Record<string, string> = {
        january: '01', february: '02', march: '03', april: '04',
        may: '05', june: '06', july: '07', august: '08',
        september: '09', october: '10', november: '11', december: '12',
    };

    // "Month Day, Year" (possibly with day range "13-14" or "13 & 14")
    const usMatch = cleaned.match(/(\w+)\s+(\d{1,2})(?:\s*[-&,]\s*\d{1,2})*,?\s*(\d{4})/);
    if (usMatch) {
        const month = MONTHS[usMatch[1].toLowerCase()];
        if (month) {
            const day = usMatch[2].padStart(2, '0');
            return `${usMatch[3]}-${month}-${day}`;
        }
    }

    // "Day Month Year" (European format)
    const euMatch = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (euMatch) {
        const month = MONTHS[euMatch[2].toLowerCase()];
        if (month) {
            const day = euMatch[1].padStart(2, '0');
            return `${euMatch[3]}-${month}-${day}`;
        }
    }

    // Try basic Date parse as fallback
    try {
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    } catch {
        // Ignore parse failures
    }

    return null;
}

/**
 * Fetch and parse the Wikipedia concert tours page
 */
async function fetchConcerts(): Promise<Concert[]> {
    logStart('Scraping BTS concert tours from Wikipedia');

    console.log('   Fetching concert tours page...');
    const { data: html } = await axios.get(WIKI_URL, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 30000,
    });

    const $ = cheerio.load(html);
    const concerts: Concert[] = [];

    // Each tour usually has its own section (h2 or h3) followed by a table
    // We need to track the current tour name from the heading
    let currentTourName = '';

    // Walk through all elements in content order
    const contentElements = $('#mw-content-text > .mw-parser-output').children();

    contentElements.each((_, el) => {
        const $el = $(el);
        const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';

        // Track headings for tour names
        // Wikipedia now wraps headings in <div class="mw-heading mw-heading2"> instead of bare <h2>/<h3>
        const classes = $el.attr('class') || '';
        if (tagName === 'h2' || tagName === 'h3' || classes.includes('mw-heading')) {
            const headingText = cleanCell(
                $el.find('h2, h3, h4').first().text() || $el.find('.mw-headline').text() || $el.text()
            ).replace(/\[edit\]/gi, '').trim();
            // Skip non-tour headings like "See also", "References", etc.
            if (!/see also|references|notes|external|further/i.test(headingText)) {
                currentTourName = headingText;
            }
            return;
        }

        // Parse tables under tour headings
        if (tagName !== 'table') return;
        if (!currentTourName) return;

        // Parse table headers to find column indices
        const headers: string[] = [];
        $el.find('tr').first().find('th').each((_, th) => {
            headers.push(cleanCell($(th).text()).toLowerCase());
        });

        if (headers.length < 2) return;

        // Find relevant column indices
        const titleIdx = headers.findIndex(h => /^title$|^event$|^showcase$/i.test(h));
        const dateIdx = headers.findIndex(h => /date/i.test(h));
        const cityIdx = headers.findIndex(h => /city|location/i.test(h));
        const countryIdx = headers.findIndex(h => /country|region/i.test(h));
        const venueIdx = headers.findIndex(h => /venue|arena|stadium/i.test(h));
        const attendanceIdx = headers.findIndex(h => /attendance|capacity/i.test(h));

        // Need at least date and city/venue to be useful
        if (dateIdx === -1 && cityIdx === -1 && venueIdx === -1) return;

        // Parse data rows with rowspan handling
        const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();

        $el.find('tr').each((rowIdx, row) => {
            if (rowIdx === 0) return; // Skip header row

            const cells = $(row).find('td, th');
            if (cells.length === 0) return;

            // Build full row with rowspan values carried forward
            const rowCells: string[] = [];
            let cellIdx = 0;

            for (let colPos = 0; colPos <= headers.length + 3; colPos++) {
                const span = rowspanTracker.get(colPos);
                if (span && span.remaining > 0) {
                    rowCells.push(span.value);
                    span.remaining--;
                    if (span.remaining === 0) rowspanTracker.delete(colPos);
                } else if (cellIdx < cells.length) {
                    const $cell = $(cells[cellIdx]);
                    const text = $cell.text().trim();
                    const rowspan = parseInt($cell.attr('rowspan') || '1', 10);
                    if (rowspan > 1) {
                        rowspanTracker.set(colPos, { value: text, remaining: rowspan - 1 });
                    }
                    rowCells.push(text);
                    cellIdx++;
                } else {
                    rowCells.push('');
                }
            }

            // Extract concert data
            const rawDate = dateIdx >= 0 ? rowCells[dateIdx] : '';
            const date = parseDate(rawDate);
            if (!date) return; // Skip rows without valid dates

            const rawCity = cityIdx >= 0 ? cleanCell(rowCells[cityIdx]) : '';
            const rawCountry = countryIdx >= 0 ? cleanCell(rowCells[countryIdx]) : '';
            const rawVenue = venueIdx >= 0 ? cleanCell(rowCells[venueIdx]) : '';
            const attendance = attendanceIdx >= 0 ? parseAttendance(rowCells[attendanceIdx]) : null;

            // Skip if essential info is missing
            if (!rawVenue && !rawCity) return;

            // Try to infer country from city if no country column
            let city = rawCity || 'Unknown';
            let country = rawCountry || '';

            // If city contains comma, split into city/country
            if (!country && city.includes(',')) {
                const parts = city.split(',').map(s => s.trim());
                city = parts[0];
                country = parts.slice(1).join(', ');
            }

            if (!country) country = 'Unknown';

            // Use the row's own Title/Event column if available, otherwise the section heading
            const rowTitle = titleIdx >= 0 ? cleanCell(rowCells[titleIdx]) : '';
            const tourName = rowTitle || currentTourName;

            concerts.push({
                tour_name: tourName,
                venue: rawVenue || 'Unknown',
                city,
                country,
                date,
                attendance,
                notes: null,
            });
        });
    });

    logSuccess(`Parsed ${concerts.length} concert entries across tours`);

    // Summary by tour
    const tourCounts = new Map<string, number>();
    for (const c of concerts) {
        tourCounts.set(c.tour_name, (tourCounts.get(c.tour_name) || 0) + 1);
    }
    console.log('\n   Concerts by tour:');
    for (const [tour, count] of tourCounts) {
        console.log(`     ${tour}: ${count} shows`);
    }

    return concerts;
}

/**
 * Upsert concerts into the database
 */
async function upsertConcerts(concerts: Concert[]): Promise<void> {
    const supabase = createSupabaseAdmin();

    logStart('Upserting concerts to Supabase');

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < concerts.length; i++) {
        const concert = concerts[i];
        logProgress(i + 1, concerts.length, `${concert.tour_name} - ${concert.city} (${concert.date})`);

        // Check for existing entry with same tour + date + venue
        const { data: existing } = await supabase
            .from('concerts')
            .select('id')
            .eq('tour_name', concert.tour_name)
            .eq('date', concert.date)
            .eq('venue', concert.venue)
            .limit(1);

        if (existing && existing.length > 0) {
            skipped++;
            continue;
        }

        const { error } = await supabase.from('concerts').insert({
            tour_name: concert.tour_name,
            venue: concert.venue,
            city: concert.city,
            country: concert.country,
            date: concert.date,
            attendance: concert.attendance,
            notes: concert.notes,
        });

        if (error) {
            logWarning(`Failed to insert ${concert.city} (${concert.date}): ${error.message}`);
        } else {
            inserted++;
        }
    }

    console.log(`\n   Summary: ${inserted} inserted, ${skipped} skipped (duplicates)`);
    logDone('Concerts upserted!');
}

async function main() {
    const cached = loadCache<Concert[]>('concerts');

    let concerts: Concert[];

    if (cached && !process.argv.includes('--force')) {
        console.log(`\n   Using cached concert data (${cached.length} entries).\n`);
        concerts = cached;
    } else {
        concerts = await fetchConcerts();
        saveCache('concerts', concerts);
    }

    if (process.argv.includes('--upsert')) {
        await upsertConcerts(concerts);
    } else {
        console.log('\n   Dry run complete. Use --upsert to write to database.');
    }

    logDone('Concert scraping complete!');
}

main().catch(console.error);
