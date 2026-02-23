/**
 * Script 11: Scrape BTS awards from Wikipedia
 *
 * Fetches the list of awards and nominations received by BTS from Wikipedia,
 * parses HTML tables, and extracts ceremony, year, category, result, and work title.
 *
 * Usage: npx tsx scripts/scrape-11-awards.ts
 *        npx tsx scripts/scrape-11-awards.ts --dry-run
 *        npx tsx scripts/scrape-11-awards.ts --upsert
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createSupabaseAdmin, delay, saveCache, loadCache, logStart, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPSERT = process.argv.includes('--upsert');

const WIKI_URL = 'https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_BTS';
const USER_AGENT = 'BangtanUniverse/0.1.0 (hello@praks.me)';

interface AwardEntry {
    year: string;
    ceremony: string;
    category: string;
    nominated_work: string;
    result: 'won' | 'nominated';
    scope: 'group';
}

/**
 * Parse Wikipedia award tables handling rowspan merged cells.
 *
 * Wikipedia tables for awards typically have columns:
 * Year | Ceremony | Category | Nominated work | Result
 *
 * Some cells span multiple rows (rowspan), so we need to track
 * which cells carry over into subsequent rows.
 */
function parseAwardTables($: cheerio.CheerioAPI): AwardEntry[] {
    const awards: AwardEntry[] = [];

    // Find all wikitables on the page
    $('table.wikitable').each((_, table) => {
        const $table = $(table);

        // Read header row to determine column mapping
        const headers: string[] = [];
        $table.find('tr').first().find('th, td').each((_, cell) => {
            headers.push($(cell).text().trim().toLowerCase());
        });

        // Determine column indices
        const yearCol = headers.findIndex(h => h.includes('year'));
        const ceremonyCol = headers.findIndex(h =>
            h.includes('ceremony') || h.includes('award') || h.includes('organization')
        );
        const categoryCol = headers.findIndex(h =>
            h.includes('category') || h.includes('prize')
        );
        const workCol = headers.findIndex(h =>
            h.includes('nominated work') || h.includes('work') || h.includes('nominee')
        );
        const resultCol = headers.findIndex(h =>
            h.includes('result') || h.includes('outcome')
        );

        // Skip tables that don't look like award tables
        if (yearCol === -1 && ceremonyCol === -1) return;

        // Track rowspan carry-overs: for each column, store { value, remainingRows }
        const carryOver: Map<number, { value: string; remaining: number }> = new Map();

        // Process data rows (skip header)
        const rows = $table.find('tr').slice(1);

        rows.each((_, row) => {
            const cells = $(row).find('td, th');
            if (cells.length === 0) return;

            // Build the full row data accounting for rowspans
            const rowData: string[] = [];
            let cellIdx = 0;

            for (let colIdx = 0; colIdx <= Math.max(headers.length - 1, 10); colIdx++) {
                // Check if there's a carry-over for this column
                const carry = carryOver.get(colIdx);
                if (carry && carry.remaining > 0) {
                    rowData.push(carry.value);
                    carry.remaining--;
                    if (carry.remaining === 0) {
                        carryOver.delete(colIdx);
                    }
                    continue;
                }

                // Read the next actual cell
                if (cellIdx < cells.length) {
                    const cell = cells.eq(cellIdx);
                    const text = cell.text().trim();
                    const rowspan = parseInt(cell.attr('rowspan') || '1', 10);

                    rowData.push(text);

                    // Set up carry-over if rowspan > 1
                    if (rowspan > 1) {
                        carryOver.set(colIdx, { value: text, remaining: rowspan - 1 });
                    }

                    cellIdx++;
                } else {
                    rowData.push('');
                }
            }

            // Extract fields from the row
            const year = (yearCol >= 0 && yearCol < rowData.length) ? rowData[yearCol] : '';
            const ceremony = (ceremonyCol >= 0 && ceremonyCol < rowData.length) ? rowData[ceremonyCol] : '';
            const category = (categoryCol >= 0 && categoryCol < rowData.length) ? rowData[categoryCol] : '';
            const workTitle = (workCol >= 0 && workCol < rowData.length) ? rowData[workCol] : '';
            const resultRaw = (resultCol >= 0 && resultCol < rowData.length) ? rowData[resultCol] : '';

            // Normalize result
            const resultLower = resultRaw.toLowerCase().trim();
            let result: 'won' | 'nominated' | null = null;
            if (resultLower.includes('won') || resultLower === 'award' || resultLower === 'yes') {
                result = 'won';
            } else if (resultLower.includes('nominated') || resultLower.includes('nom') ||
                       resultLower.includes('pending') || resultLower.includes('shortlist') ||
                       resultLower === 'no') {
                result = 'nominated';
            }

            // Skip rows without a valid result or without meaningful data
            if (!result) return;
            if (!ceremony && !category) return;

            // Clean up year - extract just the 4-digit year
            const yearMatch = year.match(/\d{4}/);
            const cleanYear = yearMatch ? yearMatch[0] : year;

            // Clean up text: remove citation brackets like [1], [2], etc.
            const cleanText = (s: string) => s.replace(/\[\d+\]/g, '').replace(/\[.*?\]/g, '').trim();

            awards.push({
                year: cleanYear,
                ceremony: cleanText(ceremony),
                category: cleanText(category),
                nominated_work: cleanText(workTitle),
                result,
                scope: 'group',
            });
        });
    });

    return awards;
}

async function upsertToSupabase(awards: AwardEntry[]) {
    const supabase = createSupabaseAdmin();

    logStart('Inserting awards into Supabase');

    let inserted = 0;
    let failed = 0;

    for (const award of awards) {
        if (DRY_RUN) {
            logSuccess(`[DRY RUN] Would insert: ${award.ceremony} ${award.year} - ${award.category} (${award.result})`);
            inserted++;
            continue;
        }

        const { error } = await supabase
            .from('awards')
            .insert({
                year: award.year,
                ceremony: award.ceremony,
                category: award.category,
                nominated_work: award.nominated_work,
                result: award.result,
                scope: award.scope,
            });

        if (error) {
            if (error.message.includes('duplicate') || error.message.includes('unique')) {
                // Already exists - skip silently
            } else {
                logError(`Failed to insert award: ${error.message}`);
                failed++;
            }
        } else {
            inserted++;
        }
    }

    console.log(`\n   Inserted: ${inserted}`);
    console.log(`   Failed: ${failed}`);
}

async function main() {
    // Check for cached data
    const cached = loadCache<AwardEntry[]>('awards');
    if (cached) {
        console.log(`\n   Found cached awards data (${cached.length} entries). Delete scripts/cache/awards.json to re-fetch.\n`);

        if (UPSERT) {
            await upsertToSupabase(cached);
        }
        return;
    }

    logStart('Scraping BTS Awards from Wikipedia');

    if (DRY_RUN) {
        logWarning('DRY RUN mode - no data will be written to Supabase');
    }

    // Fetch the Wikipedia page
    console.log(`   Fetching: ${WIKI_URL}`);

    let html: string;
    try {
        const response = await axios.get(WIKI_URL, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml',
            },
            timeout: 30000,
        });
        html = response.data;
    } catch (err: any) {
        logError(`Failed to fetch Wikipedia page: ${err.message}`);
        process.exit(1);
    }

    logSuccess('Wikipedia page fetched');

    await delay(2000); // Be polite

    // Parse the page
    const $ = cheerio.load(html);
    const awards = parseAwardTables($);

    // Deduplicate (some tables may overlap)
    const seen = new Set<string>();
    const uniqueAwards = awards.filter(a => {
        const key = `${a.year}|${a.ceremony}|${a.category}|${a.result}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Summary
    const wonCount = uniqueAwards.filter(a => a.result === 'won').length;
    const nominatedCount = uniqueAwards.filter(a => a.result === 'nominated').length;

    console.log(`\n   Summary:`);
    console.log(`   Total award entries: ${uniqueAwards.length}`);
    console.log(`   Won: ${wonCount}`);
    console.log(`   Nominated: ${nominatedCount}`);

    // Group by ceremony for a nice overview
    const byCeremony = new Map<string, number>();
    for (const a of uniqueAwards) {
        byCeremony.set(a.ceremony, (byCeremony.get(a.ceremony) || 0) + 1);
    }

    console.log(`\n   Top ceremonies:`);
    const sorted = [...byCeremony.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
    for (const [ceremony, count] of sorted) {
        console.log(`     ${ceremony}: ${count} entries`);
    }

    saveCache('awards', uniqueAwards);

    if (UPSERT) {
        await upsertToSupabase(uniqueAwards);
    }

    logDone('Awards scraped from Wikipedia!');
}

main().catch(console.error);
