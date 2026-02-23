/**
 * Script 14: Scrape BTS collaboration data from Wikipedia
 *
 * Parses the BTS discography page for "Other charted songs" and "Featured" sections,
 * plus individual member Wikipedia pages for solo collaborations.
 *
 * Usage:
 *   npx tsx scripts/scrape-14-collaborations.ts           # cache only
 *   npx tsx scripts/scrape-14-collaborations.ts --upsert   # cache + write to DB
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
    MEMBER_NAME_MAP,
    normalizeTitle,
    titlesMatch,
} from './scrape-utils.js';

const USER_AGENT = 'BangtanUniverse/1.0 (https://github.com/itsmepraks/BTS-universe)';
const DISCOGRAPHY_URL = 'https://en.wikipedia.org/wiki/BTS_singles_discography';

// Individual member discography Wikipedia pages (preferred) with fallback to main pages
const MEMBER_PAGES: { name: string; member_id: string; urls: string[] }[] = [
    { name: 'RM', member_id: 'rm', urls: [
        'https://en.wikipedia.org/wiki/RM_discography',
        'https://en.wikipedia.org/wiki/RM_(rapper)',
    ]},
    { name: 'Jin', member_id: 'jin', urls: [
        'https://en.wikipedia.org/wiki/Jin_(singer)',  // No dedicated discography page; Jin_discography is a different artist
    ]},
    { name: 'Suga', member_id: 'suga', urls: [
        'https://en.wikipedia.org/wiki/Suga_discography',
        'https://en.wikipedia.org/wiki/Suga_(rapper)',
    ]},
    { name: 'J-Hope', member_id: 'jh', urls: [
        'https://en.wikipedia.org/wiki/J-Hope_discography',
        'https://en.wikipedia.org/wiki/J-Hope',
    ]},
    { name: 'Jimin', member_id: 'jm', urls: [
        'https://en.wikipedia.org/wiki/Jimin_discography',
        'https://en.wikipedia.org/wiki/Jimin_(singer)',
    ]},
    { name: 'V', member_id: 'v', urls: [
        'https://en.wikipedia.org/wiki/V_(singer)',  // V_discography is a disambiguation page
    ]},
    { name: 'Jungkook', member_id: 'jk', urls: [
        'https://en.wikipedia.org/wiki/Jung_Kook_discography',
        'https://en.wikipedia.org/wiki/Jungkook',
    ]},
];

interface Collaboration {
    title: string;
    artist: string;
    member_id: string | null;
    type: 'feature' | 'production' | 'remix' | 'ost';
    release_date: string | null; // YYYY-MM-DD
    song_id: number | null;
}

/**
 * Clean Wikipedia cell text
 */
function cleanCell(text: string): string {
    return text
        .replace(/\[.*?\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse a year or full date from text
 */
function parseReleaseDate(text: string): string | null {
    const cleaned = cleanCell(text);
    if (!cleaned || cleaned === '\u2014') return null;

    // Full date: YYYY-MM-DD
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];

    // Just a year
    const yearMatch = cleaned.match(/\b(20\d{2})\b/);
    if (yearMatch) return `${yearMatch[1]}-01-01`;

    return null;
}

/**
 * Determine collaboration type from context text
 */
function inferCollabType(text: string): 'feature' | 'production' | 'remix' | 'ost' {
    const lower = text.toLowerCase();
    if (/remix/i.test(lower)) return 'remix';
    if (/prod(?:uced|uction)?/i.test(lower)) return 'production';
    if (/ost|soundtrack/i.test(lower)) return 'ost';
    return 'feature';
}

/**
 * Try to identify which BTS member is involved from text
 */
function findMemberId(text: string): string | null {
    for (const [name, id] of Object.entries(MEMBER_NAME_MAP)) {
        // Use word boundary matching to avoid false positives
        const escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(text)) return id;
    }
    return null;
}

/**
 * Extract heading text from a Wikipedia element, handling both old (<h2>) and new (<div class="mw-heading">) structures
 */
function getHeadingText($el: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): string | null {
    const tagName = $el.prop('tagName')?.toLowerCase() || '';
    const classes = $el.attr('class') || '';

    if (tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || classes.includes('mw-heading')) {
        return cleanCell(
            $el.find('h2, h3, h4').first().text() || $el.find('.mw-headline').text() || $el.text()
        ).replace(/\[edit\]/gi, '').trim();
    }
    return null;
}

/**
 * Extract artist name from a featured-artist title string.
 * Wikipedia formats these as: "Title"(Artist featuring Member) or "Title" (Artist feat. Member)
 */
function extractArtistFromTitle(rawTitle: string): { title: string; artist: string } {
    // Pattern: "Song Title"(Artist featuring someone)  or  "Song Title" (Artist feat. someone)
    const match = rawTitle.match(/^[""\u201c]?(.+?)[""\u201d]?\s*\((.+?)\)\s*$/);
    if (match) {
        return { title: match[1].trim(), artist: match[2].trim() };
    }
    // Pattern: "Song Title" Artist featuring someone (no parens)
    const match2 = rawTitle.match(/^[""\u201c]?(.+?)[""\u201d]?\s+(.+?(?:featuring|feat\.?|ft\.?).+)$/i);
    if (match2) {
        return { title: match2[1].trim(), artist: match2[2].trim() };
    }
    return { title: rawTitle, artist: '' };
}

/**
 * Parse table rows into an array of cell arrays, handling rowspan/colspan and multi-row headers.
 * Returns { headerRowCount, columns, dataRows } where columns is a flat list of column names.
 */
function parseWikiTable(
    $: cheerio.CheerioAPI,
    $table: cheerio.Cheerio<cheerio.Element>
): { columns: string[]; headerRowCount: number; dataRows: string[][] } {
    const rows = $table.find('tr');
    const firstRowCells = rows.eq(0).find('th');

    // Check if multi-row header
    let hasMultiRowHeader = false;
    firstRowCells.each((_, th) => {
        const rs = parseInt($(th).attr('rowspan') || '1', 10);
        const cs = parseInt($(th).attr('colspan') || '1', 10);
        if (rs > 1 || cs > 1) hasMultiRowHeader = true;
    });

    let columns: string[];
    let headerRowCount: number;

    if (!hasMultiRowHeader) {
        columns = [];
        firstRowCells.each((_, th) => {
            columns.push(cleanCell($(th).text()).toLowerCase());
        });
        headerRowCount = 1;
    } else {
        // Multi-row header: resolve rowspan/colspan across first 2 rows
        const grid: (string | undefined)[][] = [[], []];

        let colPos = 0;
        firstRowCells.each((_, th) => {
            const text = cleanCell($(th).text()).toLowerCase();
            const rs = parseInt($(th).attr('rowspan') || '1', 10);
            const cs = parseInt($(th).attr('colspan') || '1', 10);
            for (let c = 0; c < cs; c++) {
                grid[0][colPos + c] = text;
                if (rs > 1) grid[1][colPos + c] = text;
            }
            colPos += cs;
        });

        const row1Cells = rows.eq(1).find('th');
        let r1Idx = 0;
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[1][c] === undefined && r1Idx < row1Cells.length) {
                grid[1][c] = cleanCell($(row1Cells[r1Idx]).text()).toLowerCase();
                r1Idx++;
            }
        }

        columns = [];
        for (let c = 0; c < grid[0].length; c++) {
            const r0 = grid[0][c] || '';
            const r1 = grid[1]?.[c] || '';
            columns.push(r0 === r1 ? r0 : r1);
        }
        headerRowCount = 2;
    }

    // Parse data rows
    const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();
    const dataRows: string[][] = [];

    rows.each((rowIdx, row) => {
        if (rowIdx < headerRowCount) return;
        const cells = $(row).find('td, th');
        if (cells.length === 0) return;

        const rowCells: string[] = [];
        let cellIdx = 0;

        for (let colPos = 0; colPos < columns.length + 5; colPos++) {
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

        dataRows.push(rowCells);
    });

    return { columns, headerRowCount, dataRows };
}

/**
 * Scrape the BTS singles discography page for collaborations
 */
async function scrapeDiscographyPage(): Promise<Collaboration[]> {
    console.log('   Fetching BTS singles discography page for collaborations...');
    const { data: html } = await axios.get(DISCOGRAPHY_URL, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 30000,
    });

    const $ = cheerio.load(html);
    const collabs: Collaboration[] = [];

    // Target sections: "As featured artist", "Other collaborations", "Promotional singles"
    const targetSections = /featured\s+artist|other\s+collaborat|promotional\s+single/i;

    let inTargetSection = false;
    let currentSection = '';
    const contentElements = $('#mw-content-text > .mw-parser-output').children();

    contentElements.each((_, el) => {
        const $el = $(el);
        const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';

        // Handle Wikipedia's new heading structure (div.mw-heading wrapping h2/h3)
        const headingText = getHeadingText($el, $);
        if (headingText !== null) {
            inTargetSection = targetSections.test(headingText);
            currentSection = headingText;
            return;
        }

        if (!inTargetSection || tagName !== 'table') return;
        if (!$el.hasClass('wikitable')) return;

        console.log(`   Parsing discography table under "${currentSection}"...`);

        const { columns, dataRows } = parseWikiTable($, $el);

        const titleIdx = columns.findIndex(h => /title|song|single/i.test(h));
        const artistIdx = columns.findIndex(h => /other\s+artist|artist|with|featuring|members/i.test(h));
        const yearIdx = columns.findIndex(h => /year|date|released/i.test(h));
        const albumIdx = columns.findIndex(h => /album/i.test(h));

        if (titleIdx === -1) return;

        for (const rowCells of dataRows) {
            let rawTitle = cleanCell(rowCells[titleIdx] || '').replace(/^[""\u201c]|[""\u201d]$/g, '');
            if (!rawTitle || rawTitle === '\u2014' || rawTitle.length > 200) continue;

            let rawArtist = artistIdx >= 0 ? cleanCell(rowCells[artistIdx]) : '';
            const releaseDate = yearIdx >= 0 ? parseReleaseDate(rowCells[yearIdx]) : null;

            // For "As featured artist" tables, the artist info is often embedded in the title
            // e.g. '"Ashes" (재)(Lim Jeong-hee featuring BTS)'
            if (/featured/i.test(currentSection) && !rawArtist) {
                const extracted = extractArtistFromTitle(rawTitle);
                if (extracted.artist) {
                    rawTitle = extracted.title;
                    rawArtist = extracted.artist;
                }
            }

            // Determine collaborating artist (remove "BTS" from the artist field)
            let artist = rawArtist
                .replace(/\bBTS\b/gi, '')
                .replace(/\bfeat(?:uring)?\.?\s*/gi, '')
                .replace(/\bft\.?\s*/gi, '')
                .replace(/[()]/g, '')
                .replace(/^\s*,\s*|\s*,\s*$/g, '')
                .trim();

            if (!artist) artist = 'Various';

            // Detect type from full row text
            const fullRowText = rowCells.join(' ');
            const type = inferCollabType(fullRowText);

            // Detect member from artist or title context
            const memberId = findMemberId(fullRowText);

            collabs.push({
                title: rawTitle.replace(/^[""\u201c]|[""\u201d]$/g, '').trim(),
                artist,
                member_id: memberId,
                type,
                release_date: releaseDate,
                song_id: null,
            });
        }
    });

    logSuccess(`Found ${collabs.length} collaborations from discography page`);
    return collabs;
}

/**
 * Scrape individual member Wikipedia pages for solo collaborations.
 * Uses dedicated discography pages (e.g., RM_discography) which have
 * "As featured artist", "Other songs", "Other appearances" tables.
 */
async function scrapeMemberPages(): Promise<Collaboration[]> {
    const collabs: Collaboration[] = [];

    for (let i = 0; i < MEMBER_PAGES.length; i++) {
        const member = MEMBER_PAGES[i];
        logProgress(i + 1, MEMBER_PAGES.length, `Fetching ${member.name}'s discography page`);

        await delay(2000); // Rate limit

        // Try each URL in order (prefer discography page, fall back to main page)
        let html: string | null = null;
        let usedUrl = '';
        for (const url of member.urls) {
            try {
                const resp = await axios.get(url, {
                    headers: { 'User-Agent': USER_AGENT },
                    timeout: 30000,
                });
                // Verify we got a page with wikitables (not a disambiguation/redirect to empty)
                const testLoad = cheerio.load(resp.data);
                if (testLoad('table.wikitable').length > 0) {
                    html = resp.data;
                    usedUrl = url;
                    break;
                }
            } catch (err: any) {
                // Try next URL
            }
            await delay(1000);
        }

        if (!html) {
            logWarning(`Failed to fetch any working page for ${member.name}`);
            continue;
        }

        const $ = cheerio.load(html);
        let memberCollabCount = 0;

        // Target sections with collaboration data
        const targetSections = /as\s+featured|other\s+song|other\s+appear|other\s+collaborat|as\s+lead\s+artist|^singles$/i;
        // Skip sections that aren't useful for collaboration detection
        const skipSections = /studio\s+album|extended\s+play|mixtape|music\s+video|writing\s+credit|production\s+credit|filmograph|television|award|note|reference|see\s+also|videograph/i;

        let inTargetSection = false;
        let currentSection = '';

        const contentElements = $('#mw-content-text > .mw-parser-output').children();

        contentElements.each((_, el) => {
            const $el = $(el);
            const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';

            // Handle heading detection (new div.mw-heading and old h2/h3)
            const headingText = getHeadingText($el, $);
            if (headingText !== null) {
                if (skipSections.test(headingText)) {
                    inTargetSection = false;
                } else if (targetSections.test(headingText)) {
                    inTargetSection = true;
                    currentSection = headingText;
                } else {
                    // Reset for unknown sections
                    inTargetSection = false;
                }
                return;
            }

            if (!inTargetSection || tagName !== 'table') return;
            if (!$el.hasClass('wikitable')) return;

            const { columns, dataRows } = parseWikiTable($, $el);

            const titleIdx = columns.findIndex(h => /title|song|single/i.test(h));
            const artistIdx = columns.findIndex(h => /other\s+artist|artist|with|featuring/i.test(h));
            const yearIdx = columns.findIndex(h => /year|date|released/i.test(h));
            const albumIdx = columns.findIndex(h => /album/i.test(h));

            if (titleIdx === -1) return;

            for (const rowCells of dataRows) {
                let rawTitle = cleanCell(rowCells[titleIdx] || '').replace(/^[""\u201c]|[""\u201d]$/g, '');
                if (!rawTitle || rawTitle === '\u2014' || rawTitle.length > 200) continue;

                let rawArtist = artistIdx >= 0 ? cleanCell(rowCells[artistIdx]) : '';
                const releaseDate = yearIdx >= 0 ? parseReleaseDate(rowCells[yearIdx]) : null;

                // For "As featured artist" and "As lead artist" tables, artist info is often in the title
                // e.g. '"BuckuBucku" MFBTY featuring EE, RM' or '"Perfect Christmas"(with Jo Kwon, ...)'
                if (/featured|lead\s+artist/i.test(currentSection) && !rawArtist) {
                    const extracted = extractArtistFromTitle(rawTitle);
                    if (extracted.artist) {
                        rawTitle = extracted.title;
                        rawArtist = extracted.artist;
                    }
                }

                // Skip entries with "None" as artist (solo non-collab tracks)
                if (/^none$/i.test(rawArtist)) continue;

                let artist = rawArtist
                    .replace(/\bBTS\b/gi, '')
                    .replace(/\bfeat(?:uring)?\.?\s*/gi, '')
                    .replace(/\bft\.?\s*/gi, '')
                    .replace(/[()]/g, '')
                    .replace(/^\s*,\s*|\s*,\s*$/g, '')
                    .trim();

                if (!artist) artist = 'Various';

                const fullRowText = rowCells.join(' ');
                const type = inferCollabType(fullRowText);

                collabs.push({
                    title: rawTitle.replace(/^[""\u201c]|[""\u201d]$/g, '').trim(),
                    artist,
                    member_id: member.member_id,
                    type,
                    release_date: releaseDate,
                    song_id: null,
                });
                memberCollabCount++;
            }
        });

        logSuccess(`${member.name}: found ${memberCollabCount} collaborations from ${usedUrl.split('/').pop()}`);
    }

    return collabs;
}

/**
 * Deduplicate collaborations by normalized title + artist
 */
function deduplicateCollabs(collabs: Collaboration[]): Collaboration[] {
    const seen = new Map<string, Collaboration>();

    for (const c of collabs) {
        const key = `${normalizeTitle(c.title)}_${normalizeTitle(c.artist)}`;
        if (!seen.has(key)) {
            seen.set(key, c);
        } else {
            // Merge: prefer the one with more info (member_id, release_date)
            const existing = seen.get(key)!;
            if (!existing.member_id && c.member_id) existing.member_id = c.member_id;
            if (!existing.release_date && c.release_date) existing.release_date = c.release_date;
        }
    }

    return [...seen.values()];
}

/**
 * Match collaborations to existing songs in the DB
 */
async function matchToDb(collabs: Collaboration[]): Promise<Collaboration[]> {
    console.log('   Matching collaborations to database songs...');

    try {
        const supabase = createSupabaseAdmin();
        const { data: songs } = await supabase.from('songs').select('id, title');
        const songList = songs || [];

        let matched = 0;
        for (const c of collabs) {
            const songMatch = songList.find(s => titlesMatch(s.title, c.title));
            if (songMatch) {
                c.song_id = songMatch.id;
                matched++;
            }
        }
        logSuccess(`Matched ${matched} collaborations to existing songs`);
    } catch (err: any) {
        logWarning(`DB matching skipped (${err.message}). Entries saved without song IDs.`);
    }

    return collabs;
}

/**
 * Upsert collaborations into the database
 */
async function upsertCollabs(collabs: Collaboration[]): Promise<void> {
    const supabase = createSupabaseAdmin();

    logStart('Upserting collaborations to Supabase');

    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < collabs.length; i++) {
        const collab = collabs[i];
        logProgress(i + 1, collabs.length, `${collab.title} (${collab.artist})`);

        // Check for existing
        const { data: existing } = await supabase
            .from('collaborations')
            .select('id')
            .eq('title', collab.title)
            .eq('artist', collab.artist)
            .limit(1);

        if (existing && existing.length > 0) {
            skipped++;
            continue;
        }

        const row: Record<string, unknown> = {
            title: collab.title,
            artist: collab.artist,
            type: collab.type,
        };
        if (collab.member_id) row.member_id = collab.member_id;
        if (collab.release_date) row.release_date = collab.release_date;
        if (collab.song_id) row.song_id = collab.song_id;

        const { error } = await supabase.from('collaborations').insert(row);

        if (error) {
            logWarning(`Failed to insert "${collab.title}": ${error.message}`);
        } else {
            inserted++;
        }
    }

    console.log(`\n   Summary: ${inserted} inserted, ${skipped} skipped (duplicates)`);
    logDone('Collaborations upserted!');
}

async function main() {
    const cached = loadCache<Collaboration[]>('collaborations');

    let collabs: Collaboration[];

    if (cached && !process.argv.includes('--force')) {
        console.log(`\n   Using cached collaboration data (${cached.length} entries).\n`);
        collabs = cached;
    } else {
        logStart('Scraping BTS collaborations');

        const discographyCollabs = await scrapeDiscographyPage();
        await delay(3000); // Pause between pages

        console.log('\n   Scraping individual member pages...');
        const memberCollabs = await scrapeMemberPages();

        // Merge and deduplicate
        const allCollabs = [...discographyCollabs, ...memberCollabs];
        collabs = deduplicateCollabs(allCollabs);

        logSuccess(`Total unique collaborations: ${collabs.length} (from ${allCollabs.length} raw entries)`);

        collabs = await matchToDb(collabs);
        saveCache('collaborations', collabs);
    }

    // Summary by type
    const byType = new Map<string, number>();
    for (const c of collabs) {
        byType.set(c.type, (byType.get(c.type) || 0) + 1);
    }
    console.log('\n   Collaborations by type:');
    for (const [type, count] of byType) {
        console.log(`     ${type}: ${count}`);
    }

    if (process.argv.includes('--upsert')) {
        await upsertCollabs(collabs);
    } else {
        console.log('\n   Dry run complete. Use --upsert to write to database.');
    }

    logDone('Collaboration scraping complete!');
}

main().catch(console.error);
