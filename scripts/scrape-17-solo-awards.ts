/**
 * Script 17: Scrape solo/unit member awards from Wikipedia
 *
 * Fetches award tables from each BTS member's Wikipedia page,
 * parses them, and extracts ceremony, year, category, result, and work title.
 *
 * For bio pages (all except Jungkook), only tables appearing after an
 * "Awards" or "Awards and nominations" heading are parsed — discography,
 * filmography, and other non-award tables are skipped.
 *
 * Usage: npx tsx scripts/scrape-17-solo-awards.ts
 *        npx tsx scripts/scrape-17-solo-awards.ts --dry-run
 *        npx tsx scripts/scrape-17-solo-awards.ts --upsert
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createSupabaseAdmin, delay, saveCache, loadCache, logStart, logSuccess, logError, logWarning, logDone, errorMessage } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');
const UPSERT = process.argv.includes('--upsert');

const USER_AGENT = 'BangtanUniverse/0.1.0 (hello@praks.me)';

interface SoloAwardEntry {
    year: string;
    ceremony: string;
    category: string;
    work_title: string;
    result: 'won' | 'nominated';
    scope: 'solo';
    member_id: string;
}

/** Member pages to scrape */
const MEMBER_PAGES = [
    {
        member_id: 'jk',
        name: 'Jungkook',
        url: 'https://en.wikipedia.org/wiki/List_of_awards_and_nominations_received_by_Jung_Kook',
        isDedicatedAwardsPage: true,
    },
    {
        member_id: 'rm',
        name: 'RM',
        url: 'https://en.wikipedia.org/wiki/RM_(musician)',
        isDedicatedAwardsPage: false,
    },
    {
        member_id: 'jin',
        name: 'Jin',
        url: 'https://en.wikipedia.org/wiki/Jin_(singer)',
        isDedicatedAwardsPage: false,
    },
    {
        member_id: 'suga',
        name: 'SUGA',
        url: 'https://en.wikipedia.org/wiki/Suga_(musician)',
        isDedicatedAwardsPage: false,
    },
    {
        member_id: 'jh',
        name: 'j-hope',
        url: 'https://en.wikipedia.org/wiki/J-Hope',
        isDedicatedAwardsPage: false,
    },
    {
        member_id: 'jm',
        name: 'Jimin',
        url: 'https://en.wikipedia.org/wiki/Jimin',
        isDedicatedAwardsPage: false,
    },
    {
        member_id: 'v',
        name: 'V',
        url: 'https://en.wikipedia.org/wiki/V_(singer)',
        isDedicatedAwardsPage: false,
    },
] as const;

/**
 * Remove citation brackets like [1], [2], [a], etc.
 */
function cleanText(s: string): string {
    return s.replace(/\[\d+\]/g, '').replace(/\[.*?\]/g, '').trim();
}

/**
 * Parse a single wikitable as an award table, handling rowspan merged cells.
 *
 * Wikipedia tables for awards typically have columns:
 * Year | Ceremony | Category | Nominated work | Result
 *
 * Some cells span multiple rows (rowspan), so we need to track
 * which cells carry over into subsequent rows.
 */
function parseSingleAwardTable(
    $: cheerio.CheerioAPI,
    $table: cheerio.Cheerio<cheerio.Element>,
    memberId: string,
): SoloAwardEntry[] {
    const awards: SoloAwardEntry[] = [];

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
        h.includes('nominated work') || h.includes('work') || h.includes('nominee') || h.includes('nominated')
    );
    const resultCol = headers.findIndex(h =>
        h.includes('result') || h.includes('outcome')
    );

    // Skip tables that don't look like award tables
    if (yearCol === -1 && ceremonyCol === -1) return awards;

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

        awards.push({
            year: cleanYear,
            ceremony: cleanText(ceremony),
            category: cleanText(category),
            work_title: cleanText(workTitle),
            result,
            scope: 'solo',
            member_id: memberId,
        });
    });

    return awards;
}

/**
 * For dedicated award pages (like Jungkook's), parse ALL wikitables on the page.
 */
function parseAllAwardTables(
    $: cheerio.CheerioAPI,
    memberId: string,
): SoloAwardEntry[] {
    const awards: SoloAwardEntry[] = [];

    $('table.wikitable').each((_, table) => {
        const results = parseSingleAwardTable($, $(table), memberId);
        awards.push(...results);
    });

    return awards;
}

/**
 * For bio pages, only parse wikitables that appear AFTER an "Awards" or
 * "Awards and nominations" heading (h2/h3). Bio pages contain discography,
 * filmography, and other non-award tables that must be skipped.
 *
 * Strategy: walk through all children of `.mw-parser-output`, track when
 * we enter an awards section (h2/h3 with "award" in the text), and collect
 * wikitables until we hit the next h2 that is NOT an awards heading.
 */
function parseAwardTablesFromBioPage(
    $: cheerio.CheerioAPI,
    memberId: string,
): SoloAwardEntry[] {
    const awards: SoloAwardEntry[] = [];
    let inAwardsSection = false;

    const content = $('.mw-parser-output').children();

    content.each((_, el) => {
        const $el = $(el);
        const tagName = el.type === 'tag' ? el.tagName.toLowerCase() : '';
        const classes = $el.attr('class') || '';

        // Wikipedia wraps headings in <div class="mw-heading mw-heading2">
        // containing <h2>. Check both bare h2/h3 tags and mw-heading divs.
        const isHeading = tagName === 'h2' || tagName === 'h3' || classes.includes('mw-heading');

        if (isHeading) {
            const headingText = $el.text().replace(/\[edit\]/gi, '').toLowerCase().trim();
            const isH2 = tagName === 'h2' || classes.includes('mw-heading2');

            if (isH2) {
                if (headingText.includes('award')) {
                    inAwardsSection = true;
                } else {
                    inAwardsSection = false;
                }
            } else {
                // h3 subsections can activate awards if text matches
                if (headingText.includes('award')) {
                    inAwardsSection = true;
                }
            }
            return;
        }

        // If we're in the awards section and this is a wikitable, parse it
        if (inAwardsSection && tagName === 'table' && $el.hasClass('wikitable')) {
            const results = parseSingleAwardTable($, $el, memberId);
            awards.push(...results);
        }
    });

    return awards;
}

/**
 * Fetch a single member's Wikipedia page and extract solo awards.
 */
async function scrapeMemberAwards(
    member: typeof MEMBER_PAGES[number],
): Promise<SoloAwardEntry[]> {
    console.log(`\n   Fetching: ${member.name} (${member.url})`);

    let html: string;
    try {
        const response = await axios.get(member.url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml',
            },
            timeout: 30000,
        });
        html = response.data;
    } catch (err: unknown) {
        logError(`Failed to fetch ${member.name}'s page: ${errorMessage(err)}`);
        return [];
    }

    logSuccess(`Fetched ${member.name}'s page`);

    const $ = cheerio.load(html);

    if (member.isDedicatedAwardsPage) {
        return parseAllAwardTables($, member.member_id);
    } else {
        return parseAwardTablesFromBioPage($, member.member_id);
    }
}

async function upsertToSupabase(awards: SoloAwardEntry[]) {
    const supabase = createSupabaseAdmin();

    logStart('Inserting solo awards into Supabase');

    let inserted = 0;
    let failed = 0;

    for (const award of awards) {
        if (DRY_RUN) {
            logSuccess(`[DRY RUN] Would insert: ${award.member_id} - ${award.ceremony} ${award.year} - ${award.category} (${award.result})`);
            inserted++;
            continue;
        }

        const { error } = await supabase
            .from('awards')
            .insert({
                name: award.category || award.work_title || 'Award',
                year: award.year,
                ceremony: award.ceremony,
                category: award.category,
                work_title: award.work_title,
                result: award.result,
                scope: award.scope,
                member_id: award.member_id,
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
    const cached = loadCache<SoloAwardEntry[]>('awards-solo');
    if (cached) {
        console.log(`\n   Found cached solo awards data (${cached.length} entries). Delete scripts/cache/awards-solo.json to re-fetch.\n`);

        if (UPSERT) {
            await upsertToSupabase(cached);
        }
        return;
    }

    logStart('Scraping Solo Member Awards from Wikipedia');

    if (DRY_RUN) {
        logWarning('DRY RUN mode - no data will be written to Supabase');
    }

    const allAwards: SoloAwardEntry[] = [];

    for (let i = 0; i < MEMBER_PAGES.length; i++) {
        const member = MEMBER_PAGES[i];

        const memberAwards = await scrapeMemberAwards(member);

        // Per-member summary
        const won = memberAwards.filter(a => a.result === 'won').length;
        const nominated = memberAwards.filter(a => a.result === 'nominated').length;
        console.log(`   ${member.name}: ${memberAwards.length} entries (${won} won, ${nominated} nominated)`);

        allAwards.push(...memberAwards);

        // Be polite: wait 2 seconds between page fetches
        if (i < MEMBER_PAGES.length - 1) {
            await delay(2000);
        }
    }

    // Deduplicate by (year, ceremony, category, member_id, result)
    const seen = new Set<string>();
    const uniqueAwards = allAwards.filter(a => {
        const key = `${a.year}|${a.ceremony}|${a.category}|${a.member_id}|${a.result}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Overall summary
    const wonCount = uniqueAwards.filter(a => a.result === 'won').length;
    const nominatedCount = uniqueAwards.filter(a => a.result === 'nominated').length;

    console.log(`\n   Summary:`);
    console.log(`   Total solo award entries: ${uniqueAwards.length}`);
    console.log(`   Won: ${wonCount}`);
    console.log(`   Nominated: ${nominatedCount}`);

    // Per-member breakdown
    console.log(`\n   Per-member breakdown:`);
    for (const member of MEMBER_PAGES) {
        const memberEntries = uniqueAwards.filter(a => a.member_id === member.member_id);
        const mWon = memberEntries.filter(a => a.result === 'won').length;
        const mNom = memberEntries.filter(a => a.result === 'nominated').length;
        console.log(`     ${member.name.padEnd(10)} ${String(memberEntries.length).padStart(4)} entries  (${mWon} won, ${mNom} nominated)`);
    }

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

    saveCache('awards-solo', uniqueAwards);

    if (UPSERT) {
        await upsertToSupabase(uniqueAwards);
    }

    logDone('Solo member awards scraped from Wikipedia!');
}

main().catch(console.error);
