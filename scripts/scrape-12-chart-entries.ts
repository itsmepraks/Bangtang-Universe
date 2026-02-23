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
const WIKI_URL = 'https://en.wikipedia.org/wiki/BTS_singles_discography';

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
 * Map abbreviated chart column headers from Wikipedia to chart info.
 * Wikipedia uses short abbreviations like "KOR", "US", "UK", "AUS", etc.
 * in the second header row under "Peak chart positions".
 */
const CHART_ABBREV_MAP: Record<string, { chart_name: string; region: string }> = {
    'us':       { chart_name: 'Billboard Hot 100', region: 'US' },
    'usworld':  { chart_name: 'Billboard Global 200', region: 'US' },
    'uk':       { chart_name: 'UK Singles Chart', region: 'UK' },
    'aus':      { chart_name: 'ARIA Charts', region: 'AU' },
    'can':      { chart_name: 'Canadian Hot 100', region: 'CA' },
    'jpn':      { chart_name: 'Oricon Singles Chart', region: 'JP' },
    'jpnhot':   { chart_name: 'Japan Hot 100', region: 'JP' },
    'jpndig':   { chart_name: 'Oricon Digital Singles', region: 'JP' },
    'jpndig.':  { chart_name: 'Oricon Digital Singles', region: 'JP' },
    'kor':      { chart_name: 'Gaon/Circle Chart', region: 'KR' },
    'korbillb.':{ chart_name: 'Billboard Korea', region: 'KR' },
    'korhot':   { chart_name: 'Circle Chart (Hot)', region: 'KR' },
    'nz':       { chart_name: 'NZ Singles Chart', region: 'NZ' },
    'nzhot':    { chart_name: 'NZ Hot Singles', region: 'NZ' },
    'nzheat.':  { chart_name: 'NZ Heatseekers', region: 'NZ' },
    'ger':      { chart_name: 'German Singles Chart', region: 'DE' },
    'ire':      { chart_name: 'Irish Singles Chart', region: 'IE' },
    'sco':      { chart_name: 'Scottish Singles Chart', region: 'UK' },
    'ww':       { chart_name: 'Billboard Global 200', region: 'GLOBAL' },
};

/**
 * Build a flattened column map from a multi-row header structure.
 *
 * Wikipedia discography tables often have:
 *   Row 0: Title (rowspan=2), Year (rowspan=2), "Peak chart positions" (colspan=N), Sales, Certifications, Album
 *   Row 1: KOR, US, UK, AUS, ... (individual chart abbreviations)
 *
 * This function resolves the header rows into a flat list of column definitions.
 */
function buildColumnMap($: cheerio.CheerioAPI, $table: cheerio.Cheerio<cheerio.Element>): {
    columns: string[];
    headerRowCount: number;
} {
    const rows = $table.find('tr');
    const firstRowCells = rows.eq(0).find('th');

    // Check if this is a multi-row header (any th has rowspan=2 or colspan>1)
    let hasMultiRowHeader = false;
    firstRowCells.each((_, th) => {
        const rs = parseInt($(th).attr('rowspan') || '1', 10);
        const cs = parseInt($(th).attr('colspan') || '1', 10);
        if (rs > 1 || cs > 1) hasMultiRowHeader = true;
    });

    if (!hasMultiRowHeader) {
        // Simple single-row header
        const cols: string[] = [];
        firstRowCells.each((_, th) => {
            cols.push(cleanCell($(th).text()).toLowerCase());
        });
        return { columns: cols, headerRowCount: 1 };
    }

    // Multi-row header: resolve rowspan/colspan across first 2 rows
    const grid: string[][] = [[], []];

    // Pass 1: place row 0 cells
    let colPos = 0;
    firstRowCells.each((_, th) => {
        const text = cleanCell($(th).text()).toLowerCase();
        const rs = parseInt($(th).attr('rowspan') || '1', 10);
        const cs = parseInt($(th).attr('colspan') || '1', 10);

        for (let c = 0; c < cs; c++) {
            grid[0][colPos + c] = text;
            if (rs > 1) {
                // This cell spans into row 1 too - place a placeholder
                grid[1][colPos + c] = text;
            }
        }
        colPos += cs;
    });

    // Pass 2: fill row 1 cells into empty slots
    const row1Cells = rows.eq(1).find('th');
    let r1CellIdx = 0;
    for (let c = 0; c < grid[0].length; c++) {
        if (grid[1][c] === undefined && r1CellIdx < row1Cells.length) {
            grid[1][c] = cleanCell($(row1Cells[r1CellIdx]).text()).toLowerCase();
            r1CellIdx++;
        }
    }

    // Build final column names: prefer row 1 (specific) over row 0 (general)
    const columns: string[] = [];
    for (let c = 0; c < grid[0].length; c++) {
        const r0 = grid[0][c] || '';
        const r1 = grid[1][c] || '';
        // If row 0 and row 1 are the same (rowspan=2 cell), use that
        // If different (e.g. "peak chart positions" -> "us"), use the row 1 value
        columns.push(r0 === r1 ? r0 : r1);
    }

    return { columns, headerRowCount: 2 };
}

/**
 * Fetch and parse the Wikipedia discography page
 */
async function fetchChartEntries(): Promise<ChartEntry[]> {
    logStart('Scraping BTS chart entries from Wikipedia');

    console.log('   Fetching BTS singles discography page...');
    const { data: html } = await axios.get(WIKI_URL, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 30000,
    });

    const $ = cheerio.load(html);
    const entries: ChartEntry[] = [];

    // Wikipedia now wraps headings in <div class="mw-heading"> instead of bare <h2>/<h3>
    // Track the current section name from these heading divs
    let currentSection = '';

    const contentElements = $('#mw-content-text > .mw-parser-output').children();

    contentElements.each((_, el) => {
        const $el = $(el);
        const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';
        const classes = $el.attr('class') || '';

        // Track headings (now wrapped in div.mw-heading)
        if (classes.includes('mw-heading') || tagName === 'h2' || tagName === 'h3') {
            // Extract text from either the inner h2/h3 or the div itself
            const headingText = cleanCell(
                $el.find('h2, h3, h4').first().text() || $el.find('.mw-headline').text() || $el.text()
            ).replace(/\[edit\]/gi, '').trim();
            if (!/notes|references|external|see also/i.test(headingText)) {
                currentSection = headingText;
            }
            return;
        }

        // Only process wikitables
        if (tagName !== 'table') return;
        if (!$el.hasClass('wikitable')) return;

        const $table = $el;
        const caption = cleanCell($table.find('caption').text());

        // Build the column map handling multi-row headers
        const { columns, headerRowCount } = buildColumnMap($, $table);

        if (columns.length < 3) return; // Need at least title + year + one chart

        // Identify column indices
        const titleIdx = columns.findIndex(h => /title|song|single|name/.test(h));
        if (titleIdx === -1) return; // Need a title column

        const yearIdx = columns.findIndex(h => /^year$/.test(h));
        const salesIdx = columns.findIndex(h => /sales/i.test(h));
        const certIdx = columns.findIndex(h => /cert/i.test(h));
        const albumIdx = columns.findIndex(h => /album/i.test(h));

        // Find chart columns by matching abbreviations
        const chartColumns: { colIdx: number; chart_name: string; region: string }[] = [];
        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const mapped = CHART_ABBREV_MAP[col];
            if (mapped) {
                chartColumns.push({ colIdx: i, ...mapped });
            }
        }

        if (chartColumns.length === 0) return; // No chart columns found

        console.log(`   Processing table: "${caption || currentSection}" with ${chartColumns.length} chart columns`);

        // Parse data rows (skip header rows), handle rowspan
        const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();

        $table.find('tr').each((rowIdx, row) => {
            if (rowIdx < headerRowCount) return; // Skip header rows

            const $row = $(row);
            const cells = $row.find('td, th');
            if (cells.length === 0) return;

            // Build the full row of cells including rowspan-carried values
            const rowCells: string[] = [];
            let cellIdx = 0;

            for (let colPos = 0; colPos < columns.length + 5; colPos++) {
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
                        const colspan = parseInt($cell.attr('colspan') || '1', 10);
                        if (rowspan > 1) {
                            rowspanTracker.set(colPos, { value: text, remaining: rowspan - 1 });
                        }
                        rowCells.push(text);
                        // Handle colspan in data cells (rare but possible)
                        for (let c = 1; c < colspan; c++) {
                            rowCells.push(text);
                        }
                        cellIdx++;
                    } else {
                        rowCells.push('');
                    }
                }
            }

            // Extract title - remove quotes and footnotes
            const rawTitle = rowCells[titleIdx] || '';
            const title = cleanCell(rawTitle).replace(/^[""\u201c]|[""\u201d]$/g, '').trim();
            if (!title || title === '\u2014' || title.length > 200) return;

            // Extract certification
            const cert = certIdx >= 0 ? cleanCell(rowCells[certIdx] || '') : null;
            const certification = cert && cert !== '\u2014' && cert !== '-' && cert !== '\u2013'
                ? cert.replace(/\.mw-parser-output.*$/s, '').trim() // Clean CSS artifacts
                : null;

            // Extract chart data for each chart column
            for (const cc of chartColumns) {
                const peakRaw = rowCells[cc.colIdx] || '';
                const peak = parseNumber(peakRaw);
                if (peak === null || peak <= 0) continue;

                entries.push({
                    title,
                    chart_name: cc.chart_name,
                    peak_position: peak,
                    weeks_on_chart: null, // Wikipedia singles tables don't have weeks column
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
