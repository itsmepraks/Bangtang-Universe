/**
 * Script 12: Scrape BTS chart performance from Wikipedia
 *
 * Parses the BTS discography Wikipedia page for chart tables
 * (Billboard Hot 100, Billboard 200, Oricon, Gaon/Circle).
 *
 * Usage:
 *   npx tsx scripts/scrape-12-chart-entries.ts           # cache only
 *   npx tsx scripts/scrape-12-chart-entries.ts --upsert   # cache + write to DB
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
    normalizeTitle,
    titlesMatch,
} from './scrape-utils.js';

const USER_AGENT = 'BangtanUniverse/1.0 (https://github.com/itsmepraks/BTS-universe)';
const WIKI_URL = 'https://en.wikipedia.org/wiki/BTS_discography';

// Chart name patterns we search for in table captions / headings
const CHART_PATTERNS: { pattern: RegExp; chart_name: string; region: string }[] = [
    { pattern: /Billboard\s+Hot\s+100/i, chart_name: 'Billboard Hot 100', region: 'US' },
    { pattern: /Billboard\s+200/i, chart_name: 'Billboard 200', region: 'US' },
    { pattern: /Billboard\s+Global\s+200/i, chart_name: 'Billboard Global 200', region: 'GLOBAL' },
    { pattern: /Oricon/i, chart_name: 'Oricon', region: 'JP' },
    { pattern: /(?:Gaon|Circle)\s+(?:Digital|Album)/i, chart_name: 'Circle Chart', region: 'KR' },
    { pattern: /UK\s+Albums/i, chart_name: 'UK Albums Chart', region: 'UK' },
];

interface ChartEntry {
    title: string;
    chart_name: string;
    peak_position: number;
    weeks_on_chart: number | null;
    certification: string | null;
    region: string;
    song_id: number | null;
    album_id: number | null;
}

/**
 * Clean Wikipedia cell text: remove footnotes, citation markers, whitespace
 */
function cleanCell(text: string): string {
    return text
        .replace(/\[.*?\]/g, '')        // footnotes like [a], [1], [note 1]
        .replace(/\s+/g, ' ')
        .replace(/^[""]|[""]$/g, '"')
        .trim();
}

/**
 * Parse a number from a cell, handling commas and dashes
 */
function parseNumber(text: string): number | null {
    const cleaned = cleanCell(text).replace(/,/g, '');
    if (!cleaned || cleaned === '\u2014' || cleaned === '-' || cleaned === '\u2013') return null;
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
}

/**
 * Fetch and parse the Wikipedia discography page
 */
async function fetchChartEntries(): Promise<ChartEntry[]> {
    logStart('Scraping BTS chart entries from Wikipedia');

    console.log('   Fetching BTS discography page...');
    const { data: html } = await axios.get(WIKI_URL, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 30000,
    });

    const $ = cheerio.load(html);
    const entries: ChartEntry[] = [];

    // Iterate through all tables on the page
    $('table.wikitable').each((_tableIdx, table) => {
        const $table = $(table);

        // Determine which chart this table represents
        // Check caption, preceding heading, or header row content
        const caption = $table.find('caption').text();
        const prevHeading = $table.prevAll('h2, h3, h4').first().text();
        const headerText = $table.find('th').map((_, th) => $(th).text()).get().join(' ');
        const contextText = `${caption} ${prevHeading} ${headerText}`;

        // Try to find column indices from header row
        const headers: string[] = [];
        $table.find('tr').first().find('th').each((_, th) => {
            headers.push(cleanCell($(th).text()).toLowerCase());
        });

        // Determine title column, peak position columns, weeks columns, certification column
        let titleIdx = headers.findIndex(h => /title|song|album|single|name/.test(h));
        if (titleIdx === -1) titleIdx = 0;

        // Find chart-specific peak position columns
        const chartColumns: { colIdx: number; chart_name: string; region: string }[] = [];

        for (let i = 0; i < headers.length; i++) {
            const h = headers[i];
            for (const cp of CHART_PATTERNS) {
                if (cp.pattern.test(h) || cp.pattern.test(contextText)) {
                    // Only add if the header itself matches a chart pattern or contains "peak"
                    if (cp.pattern.test(h) || /peak/i.test(h)) {
                        chartColumns.push({ colIdx: i, chart_name: cp.chart_name, region: cp.region });
                    }
                }
            }
        }

        // If no specific chart columns found, look for generic peak position columns
        // and try to determine the chart from the section heading
        if (chartColumns.length === 0) {
            let matchedChart: { chart_name: string; region: string } | null = null;
            for (const cp of CHART_PATTERNS) {
                if (cp.pattern.test(contextText)) {
                    matchedChart = { chart_name: cp.chart_name, region: cp.region };
                    break;
                }
            }

            if (matchedChart) {
                const peakIdx = headers.findIndex(h => /peak|position/i.test(h));
                if (peakIdx !== -1) {
                    chartColumns.push({ colIdx: peakIdx, ...matchedChart });
                }
            }
        }

        if (chartColumns.length === 0) return; // Skip tables without chart data

        const weeksIdx = headers.findIndex(h => /weeks/i.test(h));
        const certIdx = headers.findIndex(h => /cert/i.test(h));

        // Parse data rows (handle rowspan for merged cells)
        const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();

        $table.find('tr').each((rowIdx, row) => {
            if (rowIdx === 0) return; // Skip header

            const $row = $(row);
            const cells = $row.find('td, th');
            if (cells.length === 0) return;

            // Build the full row of cells including rowspan-carried values
            const rowCells: string[] = [];
            let cellIdx = 0;

            for (let colPos = 0; colPos < headers.length + 5; colPos++) {
                const span = rowspanTracker.get(colPos);
                if (span && span.remaining > 0) {
                    rowCells.push(span.value);
                    span.remaining--;
                    if (span.remaining === 0) rowspanTracker.delete(colPos);
                } else {
                    if (cellIdx < cells.length) {
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
            }

            // Extract title
            const rawTitle = rowCells[titleIdx] || '';
            const title = cleanCell(rawTitle).replace(/^[""]|[""]$/g, '').trim();
            if (!title || title === '\u2014' || title.length > 200) return;

            // Extract chart data for each chart column
            for (const cc of chartColumns) {
                const peakRaw = rowCells[cc.colIdx] || '';
                const peak = parseNumber(peakRaw);
                if (peak === null || peak <= 0) continue;

                const weeks = weeksIdx >= 0 ? parseNumber(rowCells[weeksIdx] || '') : null;
                const cert = certIdx >= 0 ? cleanCell(rowCells[certIdx] || '') : null;
                const certification = cert && cert !== '\u2014' && cert !== '-' ? cert : null;

                entries.push({
                    title,
                    chart_name: cc.chart_name,
                    peak_position: peak,
                    weeks_on_chart: weeks,
                    certification,
                    region: cc.region,
                    song_id: null,
                    album_id: null,
                });
            }
        });
    });

    logSuccess(`Parsed ${entries.length} chart entries from Wikipedia tables`);
    return entries;
}

/**
 * Match chart entries to existing songs/albums in the DB or cache
 */
async function matchEntriesToDb(entries: ChartEntry[]): Promise<ChartEntry[]> {
    console.log('   Matching entries to database songs/albums...');

    try {
        const supabase = createSupabaseAdmin();

        const { data: songs } = await supabase.from('songs').select('id, title');
        const { data: albums } = await supabase.from('albums').select('id, title');

        const songList = songs || [];
        const albumList = albums || [];

        let matchedSongs = 0;
        let matchedAlbums = 0;

        for (const entry of entries) {
            // Try to match as song
            const songMatch = songList.find(s => titlesMatch(s.title, entry.title));
            if (songMatch) {
                entry.song_id = songMatch.id;
                matchedSongs++;
                continue;
            }

            // Try to match as album
            const albumMatch = albumList.find(a => titlesMatch(a.title, entry.title));
            if (albumMatch) {
                entry.album_id = albumMatch.id;
                matchedAlbums++;
            }
        }

        logSuccess(`Matched ${matchedSongs} songs, ${matchedAlbums} albums out of ${entries.length} entries`);
    } catch (err: any) {
        logWarning(`DB matching skipped (${err.message}). Entries saved without song/album IDs.`);
    }

    return entries;
}

/**
 * Upsert chart entries into the database
 */
async function upsertEntries(entries: ChartEntry[]): Promise<void> {
    const supabase = createSupabaseAdmin();

    logStart('Upserting chart entries to Supabase');

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        logProgress(i + 1, entries.length, `${entry.title} - ${entry.chart_name}`);

        // Check for existing entry with same chart + title + peak
        const { data: existing } = await supabase
            .from('chart_entries')
            .select('id')
            .eq('chart_name', entry.chart_name)
            .eq('peak_position', entry.peak_position)
            .or(`song_id.eq.${entry.song_id},album_id.eq.${entry.album_id}`)
            .limit(1);

        if (existing && existing.length > 0) {
            skipped++;
            continue;
        }

        const row: Record<string, unknown> = {
            chart_name: entry.chart_name,
            peak_position: entry.peak_position,
            weeks_on_chart: entry.weeks_on_chart,
            certification: entry.certification,
            region: entry.region,
        };
        if (entry.song_id) row.song_id = entry.song_id;
        if (entry.album_id) row.album_id = entry.album_id;

        const { error } = await supabase.from('chart_entries').insert(row);

        if (error) {
            logWarning(`Failed to insert "${entry.title}" on ${entry.chart_name}: ${error.message}`);
        } else {
            inserted++;
        }
    }

    console.log(`\n   Summary: ${inserted} inserted, ${skipped} skipped (duplicates)`);
    logDone('Chart entries upserted!');
}

async function main() {
    const cached = loadCache<ChartEntry[]>('chart-entries');
    if (cached && !process.argv.includes('--upsert')) {
        console.log(`\n   Found cached chart data (${cached.length} entries). Delete scripts/cache/chart-entries.json to re-fetch.\n`);
        if (process.argv.includes('--upsert')) {
            await upsertEntries(cached);
        }
        return;
    }

    let entries: ChartEntry[];

    if (cached) {
        console.log(`\n   Using cached chart data (${cached.length} entries).\n`);
        entries = cached;
    } else {
        entries = await fetchChartEntries();
        entries = await matchEntriesToDb(entries);
        saveCache('chart-entries', entries);
    }

    // Summary
    const byChart = new Map<string, number>();
    for (const e of entries) {
        byChart.set(e.chart_name, (byChart.get(e.chart_name) || 0) + 1);
    }
    console.log(`\n   Chart entry breakdown:`);
    for (const [chart, count] of byChart) {
        console.log(`     ${chart}: ${count} entries`);
    }

    if (process.argv.includes('--upsert')) {
        await upsertEntries(entries);
    } else {
        console.log('\n   Dry run complete. Use --upsert to write to database.');
    }

    logDone('Chart entries scraping complete!');
}

main().catch(console.error);
