/**
 * Script 2: Scrape BTS Fandom Wiki for metadata
 *
 * Gets Korean titles, member credits, title track/MV flags, era assignments.
 *
 * Usage: npx tsx scripts/scrape-02-wiki-metadata.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { delay, saveCache, loadCache, logStart, logProgress, logSuccess, logWarning, logDone, normalizeTitle } from './scrape-utils.js';

const WIKI_BASE = 'https://bts.fandom.com';

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

// Known album wiki pages
const ALBUM_PAGES: Record<string, string> = {
    '2 Cool 4 Skool': '/wiki/2_Cool_4_Skool',
    'O!RUL8,2?': '/wiki/O!RUL8,2%3F',
    'Skool Luv Affair': '/wiki/Skool_Luv_Affair',
    'Dark & Wild': '/wiki/Dark_%26_Wild',
    'The Most Beautiful Moment in Life Pt.1': '/wiki/The_Most_Beautiful_Moment_in_Life_Pt.1',
    'The Most Beautiful Moment in Life Pt.2': '/wiki/The_Most_Beautiful_Moment_in_Life_Pt.2',
    'The Most Beautiful Moment in Life: Young Forever': '/wiki/The_Most_Beautiful_Moment_in_Life:_Young_Forever',
    'Wings': '/wiki/Wings',
    'You Never Walk Alone': '/wiki/You_Never_Walk_Alone',
    'Love Yourself: Her': '/wiki/Love_Yourself:_Her',
    'Love Yourself: Tear': '/wiki/Love_Yourself:_Tear',
    'Love Yourself: Answer': '/wiki/Love_Yourself:_Answer',
    'Map of the Soul: Persona': '/wiki/Map_of_the_Soul:_Persona',
    'Map of the Soul: 7': '/wiki/Map_of_the_Soul:_7',
    'BE': '/wiki/BE',
    'Butter': '/wiki/Butter_(album)',
    'Proof': '/wiki/Proof',
    'Take Two': '/wiki/Take_Two',
};

async function fetchPage(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'BangtanUniverse/0.1.0 (hello@praks.me)' },
            timeout: 15000,
        });
        return cheerio.load(data);
    } catch (err: any) {
        logWarning(`Failed to fetch ${url}: ${err.message}`);
        return null;
    }
}

async function scrapeAlbumPage(albumTitle: string, wikiPath: string): Promise<WikiAlbum | null> {
    const url = `${WIKI_BASE}${wikiPath}`;
    const $ = await fetchPage(url);
    if (!$) return null;

    const tracks: WikiTrack[] = [];

    // Look for Korean title in the page title or first heading
    // BTS wiki pages often embed Korean/Hanja in the title itself (e.g. "LOVE YOURSELF 轉 'Tear'")
    let titleKorean: string | null = null;

    // Try the portable infobox data values
    $('.pi-data-value, .pi-title').each((_, el) => {
        const text = $(el).text().trim();
        if (/[가-힣]/.test(text) && !titleKorean) {
            titleKorean = text;
        }
    });

    // Also check the page title/heading for embedded Korean/Hanja
    if (!titleKorean) {
        const pageTitle = $('h1, .page-header__title, .mw-page-title-main').first().text().trim();
        if (/[가-힣]/.test(pageTitle)) {
            titleKorean = pageTitle;
        }
    }

    // Parse tracklists from ordered lists (primary format on BTS Fandom Wiki)
    // Strategy: find ALL <ol> lists near tracklist headings, parse each, keep the longest one
    // (first version = Regular Edition is usually the one we want)
    const allTracklists: WikiTrack[][] = [];

    $('ol').each((_, list) => {
        // Check if this list follows a relevant heading
        // Walk up through siblings to find the nearest heading
        const prevHeading = $(list).prevAll('h2, h3, h4').first().text().toLowerCase();

        // Accept lists under tracklist headings, or under version headers (Regular, Standard)
        const isTracklist = prevHeading.includes('track') ||
            prevHeading.includes('regular') ||
            prevHeading.includes('standard') ||
            prevHeading.includes('edition');

        // Also accept if no heading found (some pages have tracklist as first content)
        // but only if the list has multiple items (to skip navigation lists)
        const listItems = $(list).find('> li');
        const isLikelyTracklist = listItems.length >= 3;

        if (!isTracklist && !isLikelyTracklist) return;

        const currentTracks: WikiTrack[] = [];

        $(list).find('> li').each((_, li) => {
            const $li = $(li);

            // Get the track title from the FIRST <a> link (not annotations)
            const firstLink = $li.find('a').first();
            let trackTitle = firstLink.text().trim();

            // If no link, fall back to raw text but clean it
            if (!trackTitle) {
                trackTitle = $li.text().trim();
            }

            // Remove quotes
            trackTitle = trackTitle.replace(/^[""](.*)[""]$/, '$1').replace(/^「(.*)」$/, '$1').trim();

            // Skip navigation junk (arrows, single chars, empty)
            if (!trackTitle || trackTitle.length > 200) return;
            if (/^[↑↓←→►▶▷▼△▲•·\-–—]+$/.test(trackTitle)) return;
            if (trackTitle.length <= 1) return;

            // Check for title track / single / follow-up flags
            // These can appear as bold text or as plain text after the track title
            const fullLiText = $li.text().trim();
            const afterTitle = fullLiText.replace(trackTitle, '').trim().toLowerCase();
            const boldTexts: string[] = [];
            $li.find('b, strong').each((_, b) => {
                boldTexts.push($(b).text().trim().toLowerCase());
            });

            const flagText = afterTitle + ' ' + boldTexts.join(' ');
            const isTitleTrack = /\btitle\b/.test(flagText) && !/\btitle track\b/.test(trackTitle.toLowerCase());
            const hasMv = isTitleTrack || /\bsingle\b/.test(flagText) || /\bfollow[-\s]?up\b/.test(flagText);

            // Extract Korean title from parentheses like "좋아요 (Like)" or "(좋아요)"
            let trackKorean: string | null = null;
            const fullText = $li.text().trim();

            // Pattern: "English (Korean)" or "Korean (English)"
            const koreanParenMatch = fullText.match(/\(([가-힣\s·]+)\)/);
            if (koreanParenMatch) {
                trackKorean = koreanParenMatch[1].trim();
            }

            // If the title itself is all Korean, mark it
            if (/^[가-힣\s·]+$/.test(trackTitle)) {
                trackKorean = trackTitle;
            }

            // Extract member credits from parenthetical notes like "(solo by RM)"
            const memberCredits: string[] = [];
            const soloMatch = fullText.match(/\((?:solo|song)\s+by\s+(.+?)\)/i);
            if (soloMatch) {
                // Get member names from links within the parenthetical
                $li.find('a').each((_, a) => {
                    const linkText = $(a).text().trim();
                    if (linkText !== trackTitle && linkText.length < 30) {
                        memberCredits.push(linkText);
                    }
                });
            }

            currentTracks.push({
                title: trackTitle,
                title_korean: trackKorean,
                is_title_track: isTitleTrack,
                has_mv: hasMv,
                writers: [],
                member_credits: memberCredits,
            });
        });

        if (currentTracks.length > 0) {
            allTracklists.push(currentTracks);
        }
    });

    // Pick the best tracklist:
    // 1. Filter out lists that seem like navigation (very short titles, no links)
    // 2. Prefer lists with actual song content
    // 3. Among valid lists, pick the longest (regular edition)
    if (allTracklists.length > 0) {
        // Filter to lists where most entries look like real song titles (length > 2)
        const validLists = allTracklists.filter(list =>
            list.filter(t => t.title.length > 2).length >= list.length * 0.5
        );
        const candidates = validLists.length > 0 ? validLists : allTracklists;
        const best = candidates.reduce((a, b) => a.length >= b.length ? a : b);
        tracks.push(...best);
    }

    // Fallback: try tables if no ordered list tracks found
    if (tracks.length === 0) {
        $('table').each((_, table) => {
            if (tracks.length > 0) return;
            $(table).find('tr').each((_, row) => {
                const cells = $(row).find('td');
                if (cells.length >= 2) {
                    const titleCell = cells.eq(1);
                    const linkText = titleCell.find('a').first().text().trim();
                    const rawText = titleCell.text().trim();
                    const trackTitle = linkText || rawText;

                    if (trackTitle && trackTitle.length > 0 && trackTitle.length < 200) {
                        let trackKorean: string | null = null;
                        const koreanMatch = rawText.match(/\(([가-힣\s·]+)\)/);
                        if (koreanMatch) trackKorean = koreanMatch[1].trim();

                        tracks.push({
                            title: trackTitle,
                            title_korean: trackKorean,
                            is_title_track: false,
                            has_mv: false,
                            writers: [],
                            member_credits: [],
                        });
                    }
                }
            });
        });
    }

    const era = ERA_MAP[albumTitle] || 'Unknown';

    return {
        title: albumTitle,
        title_korean: titleKorean,
        era,
        wiki_url: url,
        tracks,
    };
}

async function main() {
    const cached = loadCache<WikiAlbum[]>('wiki-metadata');
    if (cached) {
        console.log(`\n📦 Found cached Wiki data (${cached.length} albums). Delete scripts/cache/wiki-metadata.json to re-fetch.\n`);
        return;
    }

    logStart('Scraping BTS Fandom Wiki');

    const albums: WikiAlbum[] = [];
    const entries = Object.entries(ALBUM_PAGES);

    for (let i = 0; i < entries.length; i++) {
        const [title, path] = entries[i];
        logProgress(i + 1, entries.length, title);

        const album = await scrapeAlbumPage(title, path);
        if (album) {
            albums.push(album);
            logSuccess(`${title}: ${album.tracks.length} tracks, Korean: ${album.title_korean || 'none'}`);
        }

        await delay(2000); // Be polite to Fandom
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
