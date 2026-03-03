/**
 * Fix member data in Supabase
 *
 * Updates achievements (currently only 1 per member, should be 5-6),
 * fixes Jimin's wrong bio_long, and fills missing enlistment/solo dates.
 *
 * Usage: npx tsx scripts/fix-member-data.ts
 *        npx tsx scripts/fix-member-data.ts --dry-run
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');

interface MemberFix {
    id: string;
    updates: Record<string, unknown>;
}

const MEMBER_FIXES: MemberFix[] = [
    {
        id: 'rm',
        updates: {
            achievements: [
                'UN General Assembly Speaker (2018, 2021)',
                'Youngest Korean to receive Order of Cultural Merit',
                'Billboard 200 #3 (Indigo)',
                'Billboard 200 #5 (Right Place, Wrong Person)',
                'Over 200 KOMCA registered songs',
                'Bottega Veneta Global Ambassador',
            ],
            enlistment_start: '2023-12-11',
            enlistment_end: '2025-06-10',
            solo_debut_date: '2022-12-02',
        },
    },
    {
        id: 'jin',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'First BTS member to enlist and discharge from military',
                'The Astronaut #1 in 102 countries on iTunes',
                'First BTS member to release official OST (Yours)',
                'Fred Global Ambassador',
            ],
            enlistment_start: '2022-12-13',
            enlistment_end: '2024-06-12',
            solo_debut_date: '2022-10-28',
        },
    },
    {
        id: 'suga',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'First K-pop soloist to headline US stadium tour (D-Day Tour)',
                'D-DAY #2 on Billboard 200',
                'Produced for IU, PSY, Halsey, MAX, Juice WRLD, Suran',
                'Samsung Galaxy Global Ambassador',
                'NBA Korea Ambassador',
            ],
            enlistment_start: '2023-09-22',
            enlistment_end: '2025-06-21',
            solo_debut_date: '2023-04-21',
        },
    },
    {
        id: 'jh',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'First Korean artist to headline Lollapalooza (2022)',
                'Jack In The Box #1 in 49 countries',
                'First BTS soloist on Billboard Hot 100 (Chicken Noodle Soup, 2019)',
                'Louis Vuitton Global Ambassador',
                'Dior Global Ambassador',
            ],
            enlistment_start: '2023-04-18',
            enlistment_end: '2024-10-17',
            solo_debut_date: '2022-07-15',
        },
    },
    {
        id: 'jm',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'Billboard Hot 100 #1 (Like Crazy) — First Korean solo artist',
                'Billboard Hot 100 #1 (Who) — First Korean soloist with two #1 hits',
                'FACE #1 on Billboard 200',
                'Most days at #1 on Billboard Artist 100 (Korean soloist)',
                'Dior Global Ambassador',
                'Tiffany & Co. Ambassador',
            ],
            bio_long: `Park Ji-min (Korean: 박지민; born October 13, 1995), known mononymously as Jimin (지민), is a South Korean singer, songwriter, and dancer. A member of the South Korean boy band BTS since 2013, Jimin has released three solo songs under BTS's discography — "Lie" in 2016, "Serendipity" in 2017, and "Filter" in 2020 — all charting on South Korea's Gaon Digital Chart.

Jimin made his official solo debut in March 2023 with the studio album "FACE", which debuted at number one on the Billboard 200. Its lead single "Like Crazy" debuted at number one on the Billboard Hot 100, making Jimin the first Korean solo artist to top the chart. He released his second studio album "MUSE" in July 2024, with its lead single "Who" also debuting at number one on the Hot 100, making him the first Korean soloist to achieve two number-one hits on the chart.

A classically trained contemporary dancer, Jimin graduated top of his class at Busan High School of Arts before transferring to Korea Arts High School. He is known for his powerful yet emotive vocals, elegant dance skills, and emotional expressiveness on stage.`,
            birth_date: '1995-10-13',
            enlistment_start: '2023-12-12',
            enlistment_end: '2025-06-11',
            solo_debut_date: '2023-03-24',
        },
    },
    {
        id: 'v',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'Sweet Night #1 in 117 countries (Most #1s for Korean OST)',
                'Layover — highest first-week sales for Korean solo album (2023)',
                'Acting debut in Hwarang: The Poet Warrior Youth (2016)',
                'CELINE Global Ambassador',
                'Cartier Global Ambassador',
            ],
            enlistment_start: '2023-12-11',
            enlistment_end: '2025-06-10',
            solo_debut_date: '2023-09-08',
        },
    },
    {
        id: 'jk',
        updates: {
            achievements: [
                'Order of Cultural Merit (2018)',
                'FIFA World Cup 2022 Official Soundtrack (Dreamers)',
                'Seven — #1 on Billboard Hot 100, first Korean solo artist',
                'Seven — Fastest song to 1 billion Spotify streams',
                'GOLDEN — Highest-selling solo album in Hanteo history',
                'First Korean solo artist to perform at VMAs (2023)',
                'Calvin Klein Global Ambassador',
            ],
            enlistment_start: '2023-12-12',
            enlistment_end: '2025-06-11',
            solo_debut_date: '2023-07-14',
        },
    },
];

async function main() {
    logStart('Fixing member data in Supabase');

    if (DRY_RUN) {
        console.log('\n   [DRY RUN] Would update:\n');
        for (const fix of MEMBER_FIXES) {
            console.log(`   ${fix.id}:`);
            for (const [key, value] of Object.entries(fix.updates)) {
                if (Array.isArray(value)) {
                    console.log(`     ${key}: ${value.length} items`);
                    value.forEach(v => console.log(`       - ${v}`));
                } else if (typeof value === 'string' && value.length > 80) {
                    console.log(`     ${key}: ${value.substring(0, 80)}...`);
                } else {
                    console.log(`     ${key}: ${value}`);
                }
            }
            console.log();
        }
        return;
    }

    const supabase = createSupabaseAdmin();

    for (const fix of MEMBER_FIXES) {
        const { error } = await supabase
            .from('members')
            .update(fix.updates)
            .eq('id', fix.id);

        if (error) {
            logError(`Failed to update ${fix.id}: ${error.message}`);
        } else {
            logSuccess(`Updated ${fix.id} (${Object.keys(fix.updates).join(', ')})`);
        }
    }

    logDone('Member data fixed!');
}

main().catch(console.error);
