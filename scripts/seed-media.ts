/**
 * Seed BTS media data: documentaries, concert films, variety shows.
 *
 * Usage:
 *   npx tsx scripts/seed-media.ts --dry-run
 *   npx tsx scripts/seed-media.ts
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');

interface MediaEntry {
    title: string;
    type: 'documentary' | 'concert_film' | 'variety' | 'docu_series' | 'reality';
    release_date: string;
    platform: string;
    seasons: number;
    episodes: number | null;
    scope: 'group' | 'solo' | 'unit';
    member_ids: string[] | null;
    description: string;
}

const MEDIA: MediaEntry[] = [
    // ═══ GROUP DOCUMENTARIES & FILMS ═══
    {
        title: 'Burn the Stage: The Movie',
        type: 'documentary',
        release_date: '2018-11-15',
        platform: 'Cinema / YouTube Premium',
        seasons: 1, episodes: 1, scope: 'group', member_ids: null,
        description: 'Behind-the-scenes of the 2017 BTS Wings Tour',
    },
    {
        title: 'Bring the Soul: The Movie',
        type: 'concert_film',
        release_date: '2019-08-07',
        platform: 'Cinema / Weverse',
        seasons: 1, episodes: 1, scope: 'group', member_ids: null,
        description: 'Love Yourself Tour documentary film',
    },
    {
        title: 'Bring the Soul: Docu-Series',
        type: 'docu_series',
        release_date: '2019-08-27',
        platform: 'Weverse',
        seasons: 1, episodes: 6, scope: 'group', member_ids: null,
        description: 'Companion docu-series to Bring the Soul: The Movie',
    },
    {
        title: 'Break the Silence: Docu-Series',
        type: 'docu_series',
        release_date: '2020-05-12',
        platform: 'Weverse',
        seasons: 1, episodes: 7, scope: 'group', member_ids: null,
        description: 'Love Yourself: Speak Yourself Tour docu-series',
    },
    {
        title: 'Break the Silence: The Movie',
        type: 'concert_film',
        release_date: '2020-09-10',
        platform: 'Cinema',
        seasons: 1, episodes: 1, scope: 'group', member_ids: null,
        description: 'Love Yourself: Speak Yourself world tour concert film',
    },
    {
        title: 'BTS: Yet To Come',
        type: 'concert_film',
        release_date: '2023-02-01',
        platform: 'Cinema / Disney+',
        seasons: 1, episodes: 1, scope: 'group', member_ids: null,
        description: 'Proof era — Yet To Come in Busan concert film',
    },
    {
        title: 'BTS ARMY: Forever We Are Young',
        type: 'documentary',
        release_date: '2025-07-30',
        platform: 'Cinema',
        seasons: 1, episodes: 1, scope: 'group', member_ids: null,
        description: 'Documentary about ARMY — the global BTS fan community',
    },
    {
        title: 'BTS: THE RETURN',
        type: 'documentary',
        release_date: '2026-03-27',
        platform: 'Netflix',
        seasons: 1, episodes: null, scope: 'group', member_ids: null,
        description: 'Netflix documentary about the making of ARIRANG and BTS reunion',
    },

    // ═══ SOLO DOCUMENTARIES ═══
    {
        title: 'j-hope IN THE BOX',
        type: 'documentary',
        release_date: '2023-02-17',
        platform: 'Disney+',
        seasons: 1, episodes: 1, scope: 'solo', member_ids: ['jh'],
        description: 'Jack In The Box album journey + Lollapalooza headline performance',
    },
    {
        title: 'SUGA: Road to D-DAY',
        type: 'documentary',
        release_date: '2023-04-21',
        platform: 'Disney+',
        seasons: 1, episodes: 1, scope: 'solo', member_ids: ['suga'],
        description: 'D-DAY album creation journey — Seoul to Tokyo to Las Vegas',
    },
    {
        title: "Jimin's Production Diary",
        type: 'documentary',
        release_date: '2023-09-01',
        platform: 'Weverse',
        seasons: 1, episodes: null, scope: 'solo', member_ids: ['jm'],
        description: 'Behind the scenes of FACE album production',
    },
    {
        title: 'JUNG KOOK: I AM STILL',
        type: 'documentary',
        release_date: '2024-09-18',
        platform: 'Disney+',
        seasons: 1, episodes: 1, scope: 'solo', member_ids: ['jk'],
        description: 'GOLDEN album + "Seven" journey to Billboard #1',
    },
    {
        title: 'RM: Right People, Wrong Place',
        type: 'documentary',
        release_date: '2024-11-29',
        platform: 'Cinema',
        seasons: 1, episodes: 1, scope: 'solo', member_ids: ['rm'],
        description: 'RPWP album documentary — Busan International Film Festival selection',
    },

    // ═══ VARIETY SHOWS ═══
    {
        title: 'Rookie King: Channel Bangtan',
        type: 'variety',
        release_date: '2013-09-03',
        platform: 'SBS MTV',
        seasons: 1, episodes: 8, scope: 'group', member_ids: null,
        description: 'BTS debut-era variety show',
    },
    {
        title: 'American Hustle Life',
        type: 'reality',
        release_date: '2014-07-24',
        platform: 'Mnet',
        seasons: 1, episodes: 8, scope: 'group', member_ids: null,
        description: 'BTS reality show in Los Angeles learning about hip-hop culture',
    },
    {
        title: 'BTS GAYO',
        type: 'variety',
        release_date: '2015-11-17',
        platform: 'V LIVE',
        seasons: 3, episodes: null, scope: 'group', member_ids: null,
        description: 'BTS mini-variety show series (2015-2017)',
    },
    {
        title: 'Run BTS!',
        type: 'variety',
        release_date: '2015-08-01',
        platform: 'VLive / Weverse',
        seasons: 1, episodes: 156, scope: 'group', member_ids: null,
        description: 'Long-running BTS variety show (2015-2022, 156 episodes)',
    },
    {
        title: 'Bon Voyage',
        type: 'reality',
        release_date: '2016-07-05',
        platform: 'VLive / Weverse',
        seasons: 4, episodes: null, scope: 'group', member_ids: null,
        description: 'BTS travel reality show — Northern Europe, Hawaii, Malta, New Zealand (2016-2019)',
    },
    {
        title: 'Burn the Stage: Behind the Scenes',
        type: 'docu_series',
        release_date: '2018-03-28',
        platform: 'YouTube Premium',
        seasons: 1, episodes: 8, scope: 'group', member_ids: null,
        description: 'Wings Tour behind-the-scenes series',
    },
    {
        title: 'In the SOOP BTS ver.',
        type: 'reality',
        release_date: '2020-08-19',
        platform: 'Weverse',
        seasons: 2, episodes: null, scope: 'group', member_ids: null,
        description: 'BTS countryside retreat reality show (2020-2021)',
    },
    {
        title: 'Are You Sure?!',
        type: 'reality',
        release_date: '2024-08-08',
        platform: 'Disney+',
        seasons: 1, episodes: 8, scope: 'unit', member_ids: ['jm', 'jk'],
        description: 'Jimin & Jungkook travel reality show',
    },
    {
        title: "Jinny's Kitchen",
        type: 'variety',
        release_date: '2023-02-24',
        platform: 'tvN / Amazon Prime',
        seasons: 3, episodes: null, scope: 'solo', member_ids: ['v'],
        description: "V as cast member on restaurant variety show (2023-2025)",
    },
] as const;

async function main() {
    logStart(`Seeding BTS Media${DRY_RUN ? ' (DRY RUN)' : ''}`);
    console.log(`   ${MEDIA.length} media entries to seed\n`);

    // Clear existing
    if (!DRY_RUN) {
        const { error } = await supabase.from('media').delete().neq('id', 0);
        if (error) {
            logError(`Failed to clear table: ${error.message}`);
            process.exit(1);
        }
        logSuccess('Cleared existing media entries');
    }

    let inserted = 0;
    let failed = 0;

    for (const entry of MEDIA) {
        if (DRY_RUN) {
            console.log(`   [DRY RUN] "${entry.title}" (${entry.type}, ${entry.scope})`);
            inserted++;
            continue;
        }

        const { error } = await supabase.from('media').insert(entry);
        if (error) {
            logError(`Failed: "${entry.title}": ${error.message}`);
            failed++;
        } else {
            logSuccess(`"${entry.title}"`);
            inserted++;
        }
    }

    console.log(`\n   Inserted: ${inserted}, Failed: ${failed}`);
    if (DRY_RUN) logWarning('DRY RUN — no changes written.');
    else logDone(`${inserted} media entries seeded!`);
}

main().catch(console.error);
