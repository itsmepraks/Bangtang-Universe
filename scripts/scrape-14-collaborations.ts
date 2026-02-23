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
const DISCOGRAPHY_URL = 'https://en.wikipedia.org/wiki/BTS_discography';

// Individual member Wikipedia URLs
const MEMBER_PAGES: { name: string; member_id: string; url: string }[] = [
    { name: 'RM', member_id: 'rm', url: 'https://en.wikipedia.org/wiki/RM_(rapper)' },
    { name: 'Jin', member_id: 'jin', url: 'https://en.wikipedia.org/wiki/Jin_(singer)' },
    { name: 'Suga', member_id: 'suga', url: 'https://en.wikipedia.org/wiki/Suga_(rapper)' },
    { name: 'J-Hope', member_id: 'jh', url: 'https://en.wikipedia.org/wiki/J-Hope' },
    { name: 'Jimin', member_id: 'jm', url: 'https://en.wikipedia.org/wiki/Jimin_(singer)' },
    { name: 'V', member_id: 'v', url: 'https://en.wikipedia.org/wiki/V_(singer)' },
    { name: 'Jungkook', member_id: 'jk', url: 'https://en.wikipedia.org/wiki/Jungkook' },
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
 * Scrape the BTS discography page for collaborations
 */
async function scrapeDiscographyPage(): Promise<Collaboration[]> {
    console.log('   Fetching BTS discography page for collaborations...');
    const { data: html } = await axios.get(DISCOGRAPHY_URL, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 30000,
    });

    const $ = cheerio.load(html);
    const collabs: Collaboration[] = [];

    // Look for sections with "Other charted songs", "Featured in", "Collaborations", "Guest appearances"
    const targetSections = /other\s+chart|featured|collaboration|guest\s+appear|promotional\s+single/i;

    let inTargetSection = false;
    const contentElements = $('#mw-content-text > .mw-parser-output').children();

    contentElements.each((_, el) => {
        const $el = $(el);
        const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';

        if (tagName === 'h2' || tagName === 'h3') {
            const headingText = cleanCell($el.find('.mw-headline').text() || $el.text());
            inTargetSection = targetSections.test(headingText);
            return;
        }

        if (!inTargetSection || tagName !== 'table') return;

        // Parse table headers
        const headers: string[] = [];
        $el.find('tr').first().find('th').each((_, th) => {
            headers.push(cleanCell($(th).text()).toLowerCase());
        });

        const titleIdx = headers.findIndex(h => /title|song|single/i.test(h));
        const artistIdx = headers.findIndex(h => /artist|with|featuring/i.test(h));
        const yearIdx = headers.findIndex(h => /year|date|released/i.test(h));

        if (titleIdx === -1) return;

        // Parse rows with rowspan handling
        const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();

        $el.find('tr').each((rowIdx, row) => {
            if (rowIdx === 0) return;

            const cells = $(row).find('td, th');
            if (cells.length === 0) return;

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

            const rawTitle = cleanCell(rowCells[titleIdx] || '').replace(/^[""\u201c]|["""\u201d]$/g, '');
            if (!rawTitle || rawTitle === '\u2014' || rawTitle.length > 200) return;

            const rawArtist = artistIdx >= 0 ? cleanCell(rowCells[artistIdx]) : '';
            const releaseDate = yearIdx >= 0 ? parseReleaseDate(rowCells[yearIdx]) : null;

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
                title: rawTitle,
                artist,
                member_id: memberId,
                type,
                release_date: releaseDate,
                song_id: null,
            });
        });
    });

    logSuccess(`Found ${collabs.length} collaborations from discography page`);
    return collabs;
}

/**
 * Scrape individual member Wikipedia pages for solo collaborations
 */
async function scrapeMemberPages(): Promise<Collaboration[]> {
    const collabs: Collaboration[] = [];

    for (let i = 0; i < MEMBER_PAGES.length; i++) {
        const member = MEMBER_PAGES[i];
        logProgress(i + 1, MEMBER_PAGES.length, `Fetching ${member.name}'s Wikipedia page`);

        await delay(2000); // Rate limit

        let html: string;
        try {
            const resp = await axios.get(member.url, {
                headers: { 'User-Agent': USER_AGENT },
                timeout: 30000,
            });
            html = resp.data;
        } catch (err: any) {
            logWarning(`Failed to fetch ${member.name}'s page: ${err.message}`);
            continue;
        }

        const $ = cheerio.load(html);

        // Look for discography/collaboration tables in member pages
        const targetSections = /discography|collaboration|featured|guest|other\s+song|single|charted/i;
        let inTargetSection = false;

        const contentElements = $('#mw-content-text > .mw-parser-output').children();

        contentElements.each((_, el) => {
            const $el = $(el);
            const tagName = el.type === 'tag' ? (el as cheerio.TagElement).tagName : '';

            if (tagName === 'h2' || tagName === 'h3') {
                const headingText = cleanCell($el.find('.mw-headline').text() || $el.text());
                inTargetSection = targetSections.test(headingText);
                return;
            }

            if (!inTargetSection || tagName !== 'table') return;

            // Parse table headers
            const headers: string[] = [];
            $el.find('tr').first().find('th').each((_, th) => {
                headers.push(cleanCell($(th).text()).toLowerCase());
            });

            const titleIdx = headers.findIndex(h => /title|song|single/i.test(h));
            const artistIdx = headers.findIndex(h => /artist|with|featuring/i.test(h));
            const yearIdx = headers.findIndex(h => /year|date|released/i.test(h));

            if (titleIdx === -1) return;

            // Parse rows with rowspan handling
            const rowspanTracker: Map<number, { value: string; remaining: number }> = new Map();

            $el.find('tr').each((rowIdx, row) => {
                if (rowIdx === 0) return;

                const cells = $(row).find('td, th');
                if (cells.length === 0) return;

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

                const rawTitle = cleanCell(rowCells[titleIdx] || '').replace(/^[""\u201c]|["""\u201d]$/g, '');
                if (!rawTitle || rawTitle === '\u2014' || rawTitle.length > 200) return;

                const rawArtist = artistIdx >= 0 ? cleanCell(rowCells[artistIdx]) : '';
                const releaseDate = yearIdx >= 0 ? parseReleaseDate(rowCells[yearIdx]) : null;

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
                    title: rawTitle,
                    artist,
                    member_id: member.member_id,
                    type,
                    release_date: releaseDate,
                    song_id: null,
                });
            });
        });

        logSuccess(`${member.name}: found collaborations from page`);
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
