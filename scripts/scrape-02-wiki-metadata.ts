/**
 * Script 2: Scrape Wikipedia for BTS album metadata
 *
 * Gets Korean titles, era assignments, track listings, and title track flags
 * using the Wikipedia MediaWiki API (replaces blocked bts.fandom.com scraper).
 *
 * Usage: npx tsx scripts/scrape-02-wiki-metadata.ts
 */

import axios from 'axios';
import { delay, saveCache, loadCache, logStart, logProgress, logSuccess, logWarning, logDone, errorMessage } from './scrape-utils.js';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

interface WikiTrack {
    title: string;
    title_korean: string | null;
    is_title_track: boolean;
    has_mv: boolean;
    writers: string[];
    member_credits: string[];
}

interface WikiAlbum {
    title: string;
    title_korean: string | null;
    era: string;
    wiki_url: string;
    tracks: WikiTrack[];
}

// Known album eras
const ERA_MAP: Record<string, string> = {
    '2 Cool 4 Skool': 'School Trilogy',
    'O!RUL8,2?': 'School Trilogy',
    'Skool Luv Affair': 'School Trilogy',
    'Skool Luv Affair Special Addition': 'School Trilogy',
    'Dark & Wild': 'School Trilogy',
    'The Most Beautiful Moment in Life Pt.1': 'HYYH',
    'The Most Beautiful Moment in Life Pt.2': 'HYYH',
    'The Most Beautiful Moment in Life: Young Forever': 'HYYH',
    'Wings': 'Wings',
    'You Never Walk Alone': 'Wings',
    'Love Yourself: Her': 'Love Yourself',
    'Love Yourself: Tear': 'Love Yourself',
    'Love Yourself: Answer': 'Love Yourself',
    'Map of the Soul: Persona': 'Map of the Soul',
    'Map of the Soul: 7': 'Map of the Soul',
    'BE': 'BE',
    'Butter': 'Butter',
    'Proof': 'Proof',
    'Take Two': 'Chapter 2',
};

// Album title -> Wikipedia page title (plain text, axios handles URL encoding)
const ALBUM_PAGES: Record<string, string> = {
    '2 Cool 4 Skool': '2 Cool 4 Skool',
    'O!RUL8,2?': 'O!RUL8,2?',
    'Skool Luv Affair': 'Skool Luv Affair',
    'Dark & Wild': 'Dark & Wild',
    'The Most Beautiful Moment in Life Pt.1': 'The Most Beautiful Moment in Life, Part 1',
    'The Most Beautiful Moment in Life Pt.2': 'The Most Beautiful Moment in Life, Part 2',
    'The Most Beautiful Moment in Life: Young Forever': 'The Most Beautiful Moment in Life: Young Forever',
    'Wings': 'Wings (BTS album)',
    'You Never Walk Alone': 'You Never Walk Alone (album)',
    'Love Yourself: Her': 'Love Yourself: Her',
    'Love Yourself: Tear': 'Love Yourself: Tear',
    'Love Yourself: Answer': 'Love Yourself: Answer',
    'Map of the Soul: Persona': 'Map of the Soul: Persona',
    'Map of the Soul: 7': 'Map of the Soul: 7',
    'BE': 'Be (BTS album)',
    'Butter': 'Butter (song)',
    'Proof': 'Proof (BTS album)',
    'Take Two': 'Take Two (BTS song)',
};

// Known Korean titles for albums (fallback when Wikipedia parsing misses them)
const KNOWN_KOREAN_TITLES: Record<string, string> = {
    '2 Cool 4 Skool': '2 쿨 4 스쿨',
    'O!RUL8,2?': '오! 알유엘8,2?',
    'Skool Luv Affair': '스쿨 러브 어페어',
    'Dark & Wild': '다크 앤 와일드',
    'The Most Beautiful Moment in Life Pt.1': '화양연화 pt.1',
    'The Most Beautiful Moment in Life Pt.2': '화양연화 pt.2',
    'The Most Beautiful Moment in Life: Young Forever': '화양연화 Young Forever',
    'Wings': '윙스',
    'You Never Walk Alone': '윙스 외전',
    'Love Yourself: Her': '러브 유어셀프 承 Her',
    'Love Yourself: Tear': '러브 유어셀프 轉 Tear',
    'Love Yourself: Answer': '러브 유어셀프 結 Answer',
    'Map of the Soul: Persona': '맵 오브 더 솔 : 페르소나',
    'Map of the Soul: 7': '맵 오브 더 솔 : 7',
    'BE': '비',
    'Proof': '프루프',
};

// Known title tracks per album (fallback for reliable marking)
const KNOWN_TITLE_TRACKS: Record<string, string[]> = {
    '2 Cool 4 Skool': ['No More Dream'],
    'O!RUL8,2?': ['N.O'],
    'Skool Luv Affair': ['Boy in Luv'],
    'Dark & Wild': ['Danger'],
    'The Most Beautiful Moment in Life Pt.1': ['I Need U'],
    'The Most Beautiful Moment in Life Pt.2': ['Run'],
    'The Most Beautiful Moment in Life: Young Forever': ['Fire', 'Save Me', 'Epilogue: Young Forever'],
    'Wings': ['Blood Sweat & Tears'],
    'You Never Walk Alone': ['Spring Day', 'Not Today'],
    'Love Yourself: Her': ['DNA'],
    'Love Yourself: Tear': ['Fake Love'],
    'Love Yourself: Answer': ['IDOL'],
    'Map of the Soul: Persona': ['Boy with Luv'],
    'Map of the Soul: 7': ['ON', 'Black Swan'],
    'BE': ['Life Goes On', 'Dynamite'],
    'Proof': ['Yet To Come'],
};

/**
 * Fetch parsed wikitext for a Wikipedia page via the MediaWiki API.
 */
async function fetchWikitext(pageTitle: string): Promise<string | null> {
    try {
        const { data } = await axios.get(WIKI_API, {
            params: {
                action: 'parse',
                page: pageTitle,
                prop: 'wikitext',
                format: 'json',
                redirects: 1,
            },
            headers: { 'User-Agent': 'BangtanUniverse/0.2.0 (hello@praks.me)' },
            timeout: 15000,
        });
        return data?.parse?.wikitext?.['*'] || null;
    } catch (err: unknown) {
        logWarning(`Failed to fetch Wikipedia page "${pageTitle}": ${errorMessage(err)}`);
        return null;
    }
}

/**
 * Extract Korean title from Wikipedia album infobox wikitext.
 * Looks for patterns like:
 *   | name = 화양연화
 *   | korean_name = ...
 *   | hangul = ...
 *   or Korean text near the top of the article / infobox
 */
function extractKoreanTitle(wikitext: string, albumTitle: string): string | null {
    // Check hardcoded fallback first
    if (KNOWN_KOREAN_TITLES[albumTitle]) {
        return KNOWN_KOREAN_TITLES[albumTitle];
    }

    // Try infobox fields: | Korean_name = ... or | hangul = ... or | name = <Korean>
    const koreanFieldMatch = wikitext.match(/\|\s*(?:Korean_name|hangul|korean|native_name)\s*=\s*(.+)/i);
    if (koreanFieldMatch) {
        const value = cleanWikitext(koreanFieldMatch[1]).trim();
        if (/[가-힣]/.test(value)) {
            return value;
        }
    }

    // Try to find Korean text in the first few lines or intro
    const introLines = wikitext.slice(0, 2000);
    // Pattern: {{lang|ko|한글텍스트}} or {{Korean|한글}}
    const langKoMatch = introLines.match(/\{\{(?:lang|Korean)\|ko\|([^}]+)\}\}/i)
        || introLines.match(/\{\{(?:lang|Korean)\|([^}|]+)\}\}/i);
    if (langKoMatch) {
        const value = cleanWikitext(langKoMatch[1]).trim();
        if (/[가-힣]/.test(value)) {
            return value;
        }
    }

    // Look for Korean in parentheses in the lead: "Album Title (한글; ...)"
    const koreanParenMatch = introLines.match(/\(([^)]*[가-힣][^)]*)\)/);
    if (koreanParenMatch) {
        let korean = koreanParenMatch[1];
        // If it contains a semicolon, take the Korean part
        if (korean.includes(';')) {
            const parts = korean.split(';');
            for (const p of parts) {
                if (/[가-힣]/.test(p)) {
                    korean = p.trim();
                    break;
                }
            }
        }
        korean = cleanWikitext(korean).trim();
        if (/[가-힣]/.test(korean)) {
            return korean;
        }
    }

    return null;
}

/**
 * Clean wikitext markup: remove [[ ]], {{ }}, '' (bold/italic), HTML tags.
 */
function cleanWikitext(text: string): string {
    return text
        .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')  // [[Link|Display]] -> Display
        .replace(/\{\{[^}]*\}\}/g, '')                       // {{templates}}
        .replace(/''+/g, '')                                  // bold/italic
        .replace(/<[^>]+>/g, '')                              // HTML tags
        .replace(/&nbsp;/g, ' ')
        .trim();
}

/**
 * Parse the track listing section from Wikipedia album wikitext.
 *
 * Wikipedia uses the {{Track listing}} template:
 *   {{Track listing
 *   | title1 = No More Dream
 *   | note1  = 노 모어 드림
 *   | title2 = We Are Bulletproof Pt.2
 *   ...
 *   }}
 *
 * Or sometimes a plain wikitext list:
 *   # "Song Title"
 */
function parseTrackListing(wikitext: string, albumTitle: string): WikiTrack[] {
    const tracks: WikiTrack[] = [];
    const knownTitleTracks = KNOWN_TITLE_TRACKS[albumTitle] || [];

    // Strategy 1: Find {{Track listing ...}} templates
    const trackListingBlocks = findTrackListingTemplates(wikitext);

    if (trackListingBlocks.length > 0) {
        // Use the first (or longest) track listing block -- typically the standard edition
        const bestBlock = trackListingBlocks.reduce((a, b) => {
            const countA = (a.match(/\|\s*title\d+\s*=/gi) || []).length;
            const countB = (b.match(/\|\s*title\d+\s*=/gi) || []).length;
            return countA >= countB ? a : b;
        });

        // Extract numbered title fields
        const titlePattern = /\|\s*title(\d+)\s*=\s*(.+)/gi;
        const notePattern = /\|\s*note(\d+)\s*=\s*(.+)/gi;

        const titles = new Map<number, string>();
        const notes = new Map<number, string>();

        let match: RegExpExecArray | null;
        while ((match = titlePattern.exec(bestBlock)) !== null) {
            titles.set(parseInt(match[1]), cleanWikitext(match[2]).trim());
        }
        while ((match = notePattern.exec(bestBlock)) !== null) {
            notes.set(parseInt(match[1]), cleanWikitext(match[2]).trim());
        }

        const sortedNums = [...titles.keys()].sort((a, b) => a - b);
        for (const num of sortedNums) {
            const title = titles.get(num)!;
            const note = notes.get(num) || '';

            // Skip if it looks like junk
            if (!title || title.length > 200) continue;

            // Extract Korean from note or title
            let trackKorean: string | null = null;
            if (/[가-힣]/.test(note)) {
                trackKorean = note.replace(/;.*$/, '').trim();
            }
            if (!trackKorean && /[가-힣]/.test(title)) {
                trackKorean = title;
            }

            const isTitleTrack = knownTitleTracks.some(
                tt => title.toLowerCase().includes(tt.toLowerCase())
            );

            tracks.push({
                title: title.replace(/^[""](.*)[""]$/, '$1'),
                title_korean: trackKorean,
                is_title_track: isTitleTrack,
                has_mv: isTitleTrack,
                writers: [],
                member_credits: [],
            });
        }
    }

    // Strategy 2: Fallback to numbered wikitext lists (# "Song Title" – duration)
    if (tracks.length === 0) {
        const listPattern = /^#\s*"([^"]+)"/gm;
        let match: RegExpExecArray | null;
        const seenTitles = new Set<string>();
        while ((match = listPattern.exec(wikitext)) !== null) {
            const title = cleanWikitext(match[1]).trim();
            if (!title || title.length > 200) continue;
            // Skip duplicate titles (e.g. same song in different editions)
            if (seenTitles.has(title.toLowerCase())) continue;
            seenTitles.add(title.toLowerCase());

            let trackKorean: string | null = null;
            if (/[가-힣]/.test(title)) {
                trackKorean = title;
            }

            const isTitleTrack = knownTitleTracks.some(
                tt => title.toLowerCase().includes(tt.toLowerCase())
            );

            tracks.push({
                title,
                title_korean: trackKorean,
                is_title_track: isTitleTrack,
                has_mv: isTitleTrack,
                writers: [],
                member_credits: [],
            });
        }
    }

    return tracks;
}

/**
 * Find all {{Track listing}} template blocks in wikitext.
 * Handles nested templates by counting brace depth.
 */
function findTrackListingTemplates(wikitext: string): string[] {
    const results: string[] = [];
    const pattern = /\{\{\s*Track listing/gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(wikitext)) !== null) {
        let depth = 0;
        const start = match.index;
        let i = start;

        while (i < wikitext.length) {
            if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
                depth++;
                i += 2;
            } else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
                depth--;
                i += 2;
                if (depth === 0) {
                    results.push(wikitext.slice(start, i));
                    break;
                }
            } else {
                i++;
            }
        }
    }

    return results;
}

/**
 * Scrape a single album page from Wikipedia.
 */
async function scrapeAlbumPage(albumTitle: string, wikiPageTitle: string): Promise<WikiAlbum | null> {
    const wikitext = await fetchWikitext(wikiPageTitle);
    if (!wikitext) return null;

    const titleKorean = extractKoreanTitle(wikitext, albumTitle);
    const tracks = parseTrackListing(wikitext, albumTitle);
    const era = ERA_MAP[albumTitle] || 'Unknown';
    const encodedPageTitle = encodeURIComponent(wikiPageTitle).replace(/%20/g, '_');

    return {
        title: albumTitle,
        title_korean: titleKorean,
        era,
        wiki_url: `https://en.wikipedia.org/wiki/${encodedPageTitle}`,
        tracks,
    };
}

async function main() {
    const cached = loadCache<WikiAlbum[]>('wiki-metadata');
    if (cached) {
        console.log(`\n📦 Found cached Wiki data (${cached.length} albums). Delete scripts/cache/wiki-metadata.json to re-fetch.\n`);
        return;
    }

    logStart('Scraping Wikipedia for BTS album metadata');

    const albums: WikiAlbum[] = [];
    const entries = Object.entries(ALBUM_PAGES);

    for (let i = 0; i < entries.length; i++) {
        const [title, pageTitle] = entries[i];
        logProgress(i + 1, entries.length, title);

        const album = await scrapeAlbumPage(title, pageTitle);
        if (album) {
            albums.push(album);
            logSuccess(`${title}: ${album.tracks.length} tracks, Korean: ${album.title_korean || 'none'}`);
        }

        // Rate limit: 1 request per second (Wikipedia API etiquette)
        await delay(1000);
    }

    // Summary
    const totalTracks = albums.reduce((sum, a) => sum + a.tracks.length, 0);
    console.log(`\n📊 Summary:`);
    console.log(`   Albums scraped: ${albums.length}`);
    console.log(`   Total tracks found: ${totalTracks}`);
    console.log(`   Albums with Korean titles: ${albums.filter(a => a.title_korean).length}`);

    saveCache('wiki-metadata', albums);
    logDone('Wiki metadata scraped!');
}

main().catch(console.error);
