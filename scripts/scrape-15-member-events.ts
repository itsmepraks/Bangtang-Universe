/**
 * Script 15: Scrape member milestone events from Wikipedia
 *
 * Parses each BTS member's Wikipedia page for:
 *   - Birth date, birth name (Korean) from infobox
 *   - Military enlistment/discharge dates
 *   - Solo debut info
 *   - Key career milestones
 *
 * Usage:
 *   npx tsx scripts/scrape-15-member-events.ts           # cache only
 *   npx tsx scripts/scrape-15-member-events.ts --upsert   # cache + write to DB
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

type CheerioRoot = ReturnType<typeof cheerio.load>;

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
    errorMessage,
} from './scrape-utils.js';

const USER_AGENT = 'BangtanUniverse/1.0 (https://github.com/itsmepraks/BTS-universe)';

// Member Wikipedia URLs
const MEMBERS: {
    name: string;
    member_id: string;
    url: string;
}[] = [
    { name: 'RM', member_id: 'rm', url: 'https://en.wikipedia.org/wiki/RM_(rapper)' },
    { name: 'Jin', member_id: 'jin', url: 'https://en.wikipedia.org/wiki/Jin_(singer)' },
    { name: 'Suga', member_id: 'suga', url: 'https://en.wikipedia.org/wiki/Suga_(rapper)' },
    { name: 'J-Hope', member_id: 'jh', url: 'https://en.wikipedia.org/wiki/J-Hope' },
    { name: 'Jimin', member_id: 'jm', url: 'https://en.wikipedia.org/wiki/Jimin' },
    { name: 'V', member_id: 'v', url: 'https://en.wikipedia.org/wiki/V_(singer)' },
    { name: 'Jungkook', member_id: 'jk', url: 'https://en.wikipedia.org/wiki/Jungkook' },
];

interface MemberEvent {
    member_id: string;
    event_type: 'enlistment_start' | 'enlistment_end' | 'solo_debut' | 'milestone';
    title: string;
    date: string; // YYYY-MM-DD
    description: string | null;
    source_url: string;
}

interface MemberInfo {
    member_id: string;
    birth_name_ko: string | null;
    birth_date: string | null; // YYYY-MM-DD
    enlistment_start: string | null;
    enlistment_end: string | null;
    solo_debut_date: string | null;
    bio_long: string | null;
    events: MemberEvent[];
}

// Month name to number mapping
const MONTHS: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
};

/**
 * Clean Wikipedia text
 */
function cleanText(text: string): string {
    return text
        .replace(/\[.*?\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Parse a date from text in various formats
 */
function parseDate(text: string): string | null {
    const cleaned = cleanText(text);
    if (!cleaned) return null;

    // ISO format: YYYY-MM-DD
    const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];

    // "Month Day, Year"
    const usMatch = cleaned.match(/(\w+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (usMatch) {
        const month = MONTHS[usMatch[1].toLowerCase()];
        if (month) return `${usMatch[3]}-${month}-${usMatch[2].padStart(2, '0')}`;
    }

    // "Day Month Year"
    const euMatch = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (euMatch) {
        const month = MONTHS[euMatch[2].toLowerCase()];
        if (month) return `${euMatch[3]}-${month}-${euMatch[1].padStart(2, '0')}`;
    }

    // Just year-month
    const ymMatch = cleaned.match(/(\w+)\s+(\d{4})/);
    if (ymMatch) {
        const month = MONTHS[ymMatch[1].toLowerCase()];
        if (month) return `${ymMatch[2]}-${month}-01`;
    }

    return null;
}

/**
 * Extract birth date from Wikipedia infobox bday span
 */
function extractBirthDate($: CheerioRoot): string | null {
    // Wikipedia uses <span class="bday">1993-09-12</span>
    const bday = $('.bday').first().text().trim();
    if (bday && /^\d{4}-\d{2}-\d{2}$/.test(bday)) return bday;

    // Fallback: look in infobox for "Born" row
    const infobox = $('.infobox, .vcard');
    let birthDate: string | null = null;

    infobox.find('tr').each((_, row) => {
        const label = $(row).find('th').text().trim().toLowerCase();
        if (label.includes('born')) {
            const value = $(row).find('td').text();
            birthDate = parseDate(value);
        }
    });

    return birthDate;
}

/**
 * Extract Korean birth name from infobox
 */
function extractBirthNameKo($: CheerioRoot): string | null {
    const infobox = $('.infobox, .vcard');
    let birthNameKo: string | null = null;

    // Look for "Born" or "Birth name" row in infobox
    infobox.find('tr').each((_, row) => {
        const label = $(row).find('th').text().trim().toLowerCase();
        if (label.includes('born') || label.includes('birth name') || label.includes('native name')) {
            const value = $(row).find('td').text();
            // Extract Korean characters (Hangul)
            const koreanMatch = value.match(/([가-힣]{2,})/);
            if (koreanMatch) {
                birthNameKo = koreanMatch[1];
            }
        }
    });

    // Also check for Korean name in the opening paragraph
    if (!birthNameKo) {
        const firstPara = $('#mw-content-text > .mw-parser-output > p').first().text();
        const koreanMatch = firstPara.match(/(?:Korean|Hangul|hangul)[:\s]*([가-힣]{2,})/i);
        if (koreanMatch) birthNameKo = koreanMatch[1];

        // Try: born Kim Nam-joon (Korean: 김남준)
        if (!birthNameKo) {
            const altMatch = firstPara.match(/([가-힣]{2,})/);
            if (altMatch) birthNameKo = altMatch[1];
        }
    }

    return birthNameKo;
}

/**
 * Search article text for military enlistment dates
 */
function extractEnlistmentDates($: CheerioRoot, sourceUrl: string, memberId: string): MemberEvent[] {
    const events: MemberEvent[] = [];
    const fullText = $('#mw-content-text').text();

    // Patterns for enlistment start
    const enlistPatterns = [
        /enlisted\s+(?:in|on|for)\s+(?:his\s+)?(?:mandatory\s+)?military\s+service\s+(?:on\s+)?(.+?\d{4})/gi,
        /began\s+(?:his\s+)?military\s+service\s+(?:on\s+)?(.+?\d{4})/gi,
        /entered\s+(?:the\s+)?military\s+(?:on\s+)?(.+?\d{4})/gi,
        /reported\s+to\s+(?:a\s+)?military\s+(?:training\s+)?(?:center|camp|base)\s+(?:on\s+)?(.+?\d{4})/gi,
        /enlisted\s+(?:on\s+)?(\w+\s+\d{1,2},?\s+\d{4})/gi,
        /military\s+enlistment\s+(?:on\s+)?(.+?\d{4})/gi,
    ];

    for (const pattern of enlistPatterns) {
        let match;
        while ((match = pattern.exec(fullText)) !== null) {
            const date = parseDate(match[1]);
            if (date) {
                // Avoid duplicate dates
                if (!events.find(e => e.event_type === 'enlistment_start' && e.date === date)) {
                    events.push({
                        member_id: memberId,
                        event_type: 'enlistment_start',
                        title: 'Military enlistment',
                        date,
                        description: cleanText(match[0]),
                        source_url: sourceUrl,
                    });
                }
            }
        }
    }

    // Patterns for discharge
    const dischargePatterns = [
        /discharged?\s+(?:from\s+)?(?:the\s+)?(?:military|army|service)\s+(?:on\s+)?(.+?\d{4})/gi,
        /completed\s+(?:his\s+)?military\s+service\s+(?:on\s+)?(.+?\d{4})/gi,
        /released\s+from\s+(?:the\s+)?(?:military|army|service)\s+(?:on\s+)?(.+?\d{4})/gi,
        /discharged?\s+(?:on\s+)?(\w+\s+\d{1,2},?\s+\d{4})/gi,
        /military\s+discharge\s+(?:on\s+)?(.+?\d{4})/gi,
    ];

    for (const pattern of dischargePatterns) {
        let match;
        while ((match = pattern.exec(fullText)) !== null) {
            const date = parseDate(match[1]);
            if (date) {
                if (!events.find(e => e.event_type === 'enlistment_end' && e.date === date)) {
                    events.push({
                        member_id: memberId,
                        event_type: 'enlistment_end',
                        title: 'Military discharge',
                        date,
                        description: cleanText(match[0]),
                        source_url: sourceUrl,
                    });
                }
            }
        }
    }

    return events;
}

/**
 * Search article text for solo debut information
 */
function extractSoloDebut($: CheerioRoot, sourceUrl: string, memberId: string): MemberEvent[] {
    const events: MemberEvent[] = [];
    const fullText = $('#mw-content-text').text();

    // Patterns for solo debuts
    const soloPatterns = [
        /solo\s+(?:studio\s+)?album\s+(.+?)\s+(?:was\s+)?released\s+(?:on\s+)?(.+?\d{4})/gi,
        /released\s+(?:his\s+)?(?:debut\s+)?(?:solo\s+)?(?:studio\s+)?album\s+(.+?)\s+(?:on\s+)?(.+?\d{4})/gi,
        /(?:first|debut)\s+(?:solo\s+)?mixtape\s+(.+?)\s+(?:was\s+)?released\s+(?:on\s+)?(.+?\d{4})/gi,
        /released\s+(?:his\s+)?(?:debut\s+)?(?:solo\s+)?mixtape\s+(.+?)\s+(?:on\s+)?(.+?\d{4})/gi,
        /solo\s+debut\s+(?:single\s+)?(.+?)\s+(?:on\s+)?(.+?\d{4})/gi,
    ];

    for (const pattern of soloPatterns) {
        let match;
        while ((match = pattern.exec(fullText)) !== null) {
            const title = cleanText(match[1]).replace(/^[""\u201c]|["""\u201d]$/g, '').trim();
            const date = parseDate(match[2]);
            if (date && title.length < 100) {
                if (!events.find(e => e.event_type === 'solo_debut')) {
                    events.push({
                        member_id: memberId,
                        event_type: 'solo_debut',
                        title: `Solo debut: ${title}`,
                        date,
                        description: cleanText(match[0]),
                        source_url: sourceUrl,
                    });
                }
            }
        }
    }

    return events;
}

/**
 * Extract key career milestones from article text
 */
function extractMilestones($: CheerioRoot, sourceUrl: string, memberId: string, memberName: string): MemberEvent[] {
    const events: MemberEvent[] = [];
    const fullText = $('#mw-content-text').text();

    // Patterns for milestones: records, firsts, ambassadorships
    const milestonePatterns: { pattern: RegExp; titlePrefix: string }[] = [
        { pattern: /became\s+(?:a\s+)?(?:global\s+)?ambassador\s+(?:for|of)\s+(.+?)(?:\s+(?:on|in)\s+(.+?\d{4}))?[.,]/gi, titlePrefix: 'Brand ambassador' },
        { pattern: /appointed\s+(?:as\s+)?(?:a\s+)?(?:special\s+)?(?:presidential\s+)?envoy\s+(.+?)(?:\s+(?:on|in)\s+(.+?\d{4}))?[.,]/gi, titlePrefix: 'Special envoy' },
        { pattern: /(?:first|1st)\s+(?:Korean|K-pop|South Korean)\s+(?:solo\s+)?(?:artist|act|idol)\s+to\s+(.+?)(?:\s+(?:on|in)\s+(.+?\d{4}))?[.,]/gi, titlePrefix: 'Record' },
        { pattern: /broke\s+(?:the\s+)?(?:Guinness\s+)?(?:World\s+)?Record\s+(?:for\s+)?(.+?)(?:\s+(?:on|in)\s+(.+?\d{4}))?[.,]/gi, titlePrefix: 'World record' },
    ];

    for (const { pattern, titlePrefix } of milestonePatterns) {
        let match;
        while ((match = pattern.exec(fullText)) !== null) {
            const detail = cleanText(match[1]).substring(0, 150);
            const dateStr = match[2] ? match[2] : null;
            const date = dateStr ? parseDate(dateStr) : null;

            if (date) {
                events.push({
                    member_id: memberId,
                    event_type: 'milestone',
                    title: `${titlePrefix}: ${detail}`,
                    date,
                    description: cleanText(match[0]).substring(0, 500),
                    source_url: sourceUrl,
                });
            }
        }
    }

    return events;
}

/**
 * Extract a longer bio from the article's opening paragraphs
 */
function extractBioLong($: CheerioRoot): string | null {
    const paragraphs: string[] = [];

    $('#mw-content-text > .mw-parser-output > p').each((i, p) => {
        if (i >= 3) return false; // First 3 paragraphs
        const text = cleanText($(p).text());
        if (text.length > 50) {
            paragraphs.push(text);
        }
    });

    if (paragraphs.length === 0) return null;
    return paragraphs.join('\n\n').substring(0, 2000);
}

/**
 * Scrape a single member's Wikipedia page
 */
async function scrapeMember(member: typeof MEMBERS[0]): Promise<MemberInfo> {
    let html: string;
    try {
        const resp = await axios.get(member.url, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 30000,
        });
        html = resp.data;
    } catch (err: unknown) {
        logWarning(`Failed to fetch ${member.name}'s page: ${errorMessage(err)}`);
        return {
            member_id: member.member_id,
            birth_name_ko: null,
            birth_date: null,
            enlistment_start: null,
            enlistment_end: null,
            solo_debut_date: null,
            bio_long: null,
            events: [],
        };
    }

    const $ = cheerio.load(html);

    // Extract infobox data
    const birthDate = extractBirthDate($);
    const birthNameKo = extractBirthNameKo($);
    const bioLong = extractBioLong($);

    // Extract events
    const enlistmentEvents = extractEnlistmentDates($, member.url, member.member_id);
    const soloEvents = extractSoloDebut($, member.url, member.member_id);
    const milestones = extractMilestones($, member.url, member.member_id, member.name);

    const allEvents = [...enlistmentEvents, ...soloEvents, ...milestones];

    // Derive convenience fields
    const enlistStart = enlistmentEvents.find(e => e.event_type === 'enlistment_start')?.date || null;
    const enlistEnd = enlistmentEvents.find(e => e.event_type === 'enlistment_end')?.date || null;
    const soloDebutDate = soloEvents.length > 0 ? soloEvents[0].date : null;

    logSuccess(`${member.name}: birth_ko=${birthNameKo || 'N/A'}, enlist=${enlistStart || 'N/A'}, discharge=${enlistEnd || 'N/A'}, solo=${soloDebutDate || 'N/A'}, events=${allEvents.length}`);

    return {
        member_id: member.member_id,
        birth_name_ko: birthNameKo,
        birth_date: birthDate,
        enlistment_start: enlistStart,
        enlistment_end: enlistEnd,
        solo_debut_date: soloDebutDate,
        bio_long: bioLong,
        events: allEvents,
    };
}

/**
 * Upsert member events and update members table
 */
async function upsertMemberData(memberInfos: MemberInfo[]): Promise<void> {
    const supabase = createSupabaseAdmin();

    logStart('Upserting member events to Supabase');

    let eventsInserted = 0;
    let membersUpdated = 0;

    for (const info of memberInfos) {
        // Update members table with new columns
        const memberUpdates: Record<string, unknown> = {};
        if (info.birth_name_ko) memberUpdates.birth_name_ko = info.birth_name_ko;
        if (info.enlistment_start) memberUpdates.enlistment_start = info.enlistment_start;
        if (info.enlistment_end) memberUpdates.enlistment_end = info.enlistment_end;
        if (info.solo_debut_date) memberUpdates.solo_debut_date = info.solo_debut_date;
        if (info.bio_long) memberUpdates.bio_long = info.bio_long;

        if (Object.keys(memberUpdates).length > 0) {
            const { error } = await supabase
                .from('members')
                .update(memberUpdates)
                .eq('id', info.member_id);

            if (error) {
                logWarning(`Failed to update member ${info.member_id}: ${error.message}`);
            } else {
                logSuccess(`Updated member ${info.member_id} (${Object.keys(memberUpdates).join(', ')})`);
                membersUpdated++;
            }
        }

        // Insert member events
        for (const event of info.events) {
            // Check for existing event
            const { data: existing } = await supabase
                .from('member_events')
                .select('id')
                .eq('member_id', event.member_id)
                .eq('event_type', event.event_type)
                .eq('date', event.date)
                .limit(1);

            if (existing && existing.length > 0) continue;

            const { error } = await supabase.from('member_events').insert({
                member_id: event.member_id,
                event_type: event.event_type,
                title: event.title,
                date: event.date,
                description: event.description,
                source_url: event.source_url,
            });

            if (error) {
                logWarning(`Failed to insert event "${event.title}": ${error.message}`);
            } else {
                eventsInserted++;
            }
        }
    }

    console.log(`\n   Summary: ${membersUpdated} members updated, ${eventsInserted} events inserted`);
    logDone('Member events upserted!');
}

async function main() {
    const cached = loadCache<MemberInfo[]>('member-events');

    let memberInfos: MemberInfo[];

    if (cached && !process.argv.includes('--force')) {
        console.log(`\n   Using cached member events data (${cached.length} members).\n`);
        memberInfos = cached;
    } else {
        logStart('Scraping BTS member events from Wikipedia');

        memberInfos = [];

        for (let i = 0; i < MEMBERS.length; i++) {
            logProgress(i + 1, MEMBERS.length, `Scraping ${MEMBERS[i].name}`);
            const info = await scrapeMember(MEMBERS[i]);
            memberInfos.push(info);
            await delay(2000); // Rate limit
        }

        saveCache('member-events', memberInfos);
    }

    // Summary
    const totalEvents = memberInfos.reduce((sum, m) => sum + m.events.length, 0);
    console.log(`\n   Summary:`);
    console.log(`     Members processed: ${memberInfos.length}`);
    console.log(`     Total events found: ${totalEvents}`);
    console.log(`     With Korean names: ${memberInfos.filter(m => m.birth_name_ko).length}`);
    console.log(`     With enlistment data: ${memberInfos.filter(m => m.enlistment_start).length}`);
    console.log(`     With solo debuts: ${memberInfos.filter(m => m.solo_debut_date).length}`);

    for (const info of memberInfos) {
        const member = MEMBERS.find(m => m.member_id === info.member_id);
        console.log(`\n     ${member?.name || info.member_id}:`);
        console.log(`       Birth name (KO): ${info.birth_name_ko || 'N/A'}`);
        console.log(`       Enlistment: ${info.enlistment_start || 'N/A'} -> ${info.enlistment_end || 'N/A'}`);
        console.log(`       Solo debut: ${info.solo_debut_date || 'N/A'}`);
        console.log(`       Events: ${info.events.length}`);
    }

    if (process.argv.includes('--upsert')) {
        await upsertMemberData(memberInfos);
    } else {
        console.log('\n   Dry run complete. Use --upsert to write to database.');
    }

    logDone('Member events scraping complete!');
}

main().catch(console.error);
