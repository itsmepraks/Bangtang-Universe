/**
 * Seed curated member career events into Supabase
 *
 * Replaces the regex-scraped events (which had garbled titles, duplicates,
 * and missing data) with accurate, well-formatted career timeline events.
 *
 * Usage: npx tsx scripts/seed-member-events.ts
 *        npx tsx scripts/seed-member-events.ts --dry-run
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logDone } from './scrape-utils.js';

const DRY_RUN = process.argv.includes('--dry-run');

interface CuratedEvent {
    member_id: string;
    event_type: 'enlistment_start' | 'enlistment_end' | 'solo_debut' | 'milestone' | 'ambassador' | 'variety_show';
    title: string;
    date: string; // YYYY-MM-DD
    description: string | null;
}

/**
 * Curated career timeline events for all 7 BTS members.
 * Sources: Wikipedia, official announcements, Billboard, HYBE.
 */
const CURATED_EVENTS: CuratedEvent[] = [
    // ═══════════════════════════════════════════
    // RM (Kim Namjoon)
    // ═══════════════════════════════════════════
    { member_id: 'rm', event_type: 'milestone', title: 'RM mixtape released', date: '2015-03-20', description: 'Released first solo mixtape "RM" with tracks like Do You, Joke, and God Rap' },
    { member_id: 'rm', event_type: 'milestone', title: 'UN General Assembly speech', date: '2018-09-24', description: 'Delivered "Speak Yourself" speech at the 73rd UN General Assembly, becoming the youngest Korean to address the UN' },
    { member_id: 'rm', event_type: 'milestone', title: 'mono. mixtape released', date: '2018-10-23', description: 'Released second mixtape "mono." — peaked at #26 on Billboard 200, highest-charting Korean solo album at the time' },
    { member_id: 'rm', event_type: 'milestone', title: 'UN General Assembly speech (2nd)', date: '2021-09-20', description: 'Delivered speech at the 76th UN General Assembly as Special Presidential Envoy' },
    { member_id: 'rm', event_type: 'solo_debut', title: 'Indigo album released', date: '2022-12-02', description: 'Official solo debut album "Indigo" featuring Erykah Badu, Anderson .Paak — peaked at #3 on Billboard 200' },
    { member_id: 'rm', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-12-11', description: 'Enlisted for mandatory military service' },
    { member_id: 'rm', event_type: 'milestone', title: 'Right Place, Wrong Person released', date: '2024-05-24', description: 'Released sophomore album "Right Place, Wrong Person" — peaked at #5 on Billboard 200' },
    { member_id: 'rm', event_type: 'enlistment_end', title: 'Military discharge', date: '2025-06-10', description: 'Discharged from military service' },
    { member_id: 'rm', event_type: 'ambassador', title: 'Bottega Veneta Global Ambassador', date: '2023-02-01', description: 'Appointed as global ambassador for Bottega Veneta' },

    // ═══════════════════════════════════════════
    // JIN (Kim Seokjin)
    // ═══════════════════════════════════════════
    { member_id: 'jin', event_type: 'milestone', title: 'Yours (Jirisan OST) released', date: '2021-10-24', description: 'Released OST single "Yours" for tvN drama Jirisan — first BTS member to release an official drama OST' },
    { member_id: 'jin', event_type: 'solo_debut', title: 'The Astronaut single released', date: '2022-10-28', description: 'Official solo debut single "The Astronaut" co-written with Coldplay — #1 in 102 countries on iTunes' },
    { member_id: 'jin', event_type: 'enlistment_start', title: 'Military enlistment', date: '2022-12-13', description: 'First BTS member to enlist for mandatory military service' },
    { member_id: 'jin', event_type: 'enlistment_end', title: 'Military discharge', date: '2024-06-12', description: 'First BTS member to be discharged from military service' },
    { member_id: 'jin', event_type: 'milestone', title: 'Happy album released', date: '2024-11-15', description: 'Released debut studio album "Happy" with title track "Running Wild"' },
    { member_id: 'jin', event_type: 'ambassador', title: 'Fred Global Ambassador', date: '2024-09-01', description: 'Appointed as global ambassador for French jewelry brand Fred' },

    // ═══════════════════════════════════════════
    // SUGA (Min Yoongi / Agust D)
    // ═══════════════════════════════════════════
    { member_id: 'suga', event_type: 'milestone', title: 'Agust D mixtape released', date: '2016-08-15', description: 'Released first solo mixtape "Agust D" under alias Agust D, featuring The Last and Give It To Me' },
    { member_id: 'suga', event_type: 'milestone', title: 'Produced "Wine" for Suran', date: '2017-06-22', description: 'Produced Suran\'s "Wine" which won Best R&B at 2017 Melon Music Awards' },
    { member_id: 'suga', event_type: 'milestone', title: 'D-2 mixtape released', date: '2020-05-22', description: 'Released second mixtape "D-2" — peaked at #11 on Billboard 200, featuring Daechwita' },
    { member_id: 'suga', event_type: 'milestone', title: 'Produced "That That" for PSY', date: '2022-04-29', description: 'Produced and featured on PSY\'s "That That" — #1 on Billboard Global 200' },
    { member_id: 'suga', event_type: 'solo_debut', title: 'D-DAY album released', date: '2023-04-21', description: 'Debut studio album "D-DAY" as Agust D — debuted at #2 on Billboard 200' },
    { member_id: 'suga', event_type: 'milestone', title: 'D-Day World Tour launched', date: '2023-04-26', description: 'First solo world tour — first K-pop soloist to headline US stadium tour' },
    { member_id: 'suga', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-09-22', description: 'Enlisted as social service agent for military service' },
    { member_id: 'suga', event_type: 'enlistment_end', title: 'Military discharge', date: '2025-06-21', description: 'Discharged from military service' },
    { member_id: 'suga', event_type: 'ambassador', title: 'Samsung Galaxy Global Ambassador', date: '2023-01-01', description: 'Appointed as global ambassador for Samsung Galaxy' },
    { member_id: 'suga', event_type: 'ambassador', title: 'NBA Korea Ambassador', date: '2023-02-01', description: 'Appointed as NBA Korea global ambassador' },
    { member_id: 'suga', event_type: 'milestone', title: 'Produced "Eight" for IU', date: '2020-05-06', description: 'Produced and featured on IU\'s "Eight" — massive commercial success across Asia' },

    // ═══════════════════════════════════════════
    // J-HOPE (Jung Hoseok)
    // ═══════════════════════════════════════════
    { member_id: 'jh', event_type: 'milestone', title: 'Hope World mixtape released', date: '2018-03-02', description: 'Released solo mixtape "Hope World" — peaked at #38 on Billboard 200, highest-charting Korean solo album at the time' },
    { member_id: 'jh', event_type: 'milestone', title: 'Chicken Noodle Soup released', date: '2019-09-27', description: 'Released "Chicken Noodle Soup" featuring Becky G — first BTS solo entry on Billboard Hot 100 (#81)' },
    { member_id: 'jh', event_type: 'solo_debut', title: 'Jack in the Box album released', date: '2022-07-15', description: 'Debut studio album "Jack in the Box" with singles MORE and Arson' },
    { member_id: 'jh', event_type: 'milestone', title: 'Headlined Lollapalooza', date: '2022-07-31', description: 'First Korean artist to headline a major US music festival (Lollapalooza Chicago)' },
    { member_id: 'jh', event_type: 'milestone', title: 'On the Street released', date: '2023-03-03', description: 'Released "On the Street" featuring J. Cole' },
    { member_id: 'jh', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-04-18', description: 'Enlisted for mandatory military service as active duty soldier' },
    { member_id: 'jh', event_type: 'milestone', title: 'HOPE ON THE STREET VOL.1 released', date: '2024-03-29', description: 'Released EP "HOPE ON THE STREET VOL.1" alongside dance documentary series' },
    { member_id: 'jh', event_type: 'enlistment_end', title: 'Military discharge', date: '2024-10-17', description: 'Discharged from military service' },
    { member_id: 'jh', event_type: 'ambassador', title: 'Louis Vuitton Global Ambassador', date: '2023-02-01', description: 'Appointed as global ambassador for Louis Vuitton' },
    { member_id: 'jh', event_type: 'ambassador', title: 'Dior Global Ambassador', date: '2023-01-01', description: 'Appointed as global ambassador for Dior' },

    // ═══════════════════════════════════════════
    // JIMIN (Park Jimin)
    // ═══════════════════════════════════════════
    { member_id: 'jm', event_type: 'milestone', title: 'Promise self-released', date: '2018-12-31', description: 'Released self-composed song "Promise" on SoundCloud — broke SoundCloud\'s record for most streams in 24 hours' },
    { member_id: 'jm', event_type: 'milestone', title: 'With You (Our Blues OST) released', date: '2022-04-24', description: 'Released OST "With You" with Ha Sung-woon for tvN drama Our Blues' },
    { member_id: 'jm', event_type: 'solo_debut', title: 'FACE album released', date: '2023-03-24', description: 'Debut solo album "FACE" — debuted at #1 on Billboard 200' },
    { member_id: 'jm', event_type: 'milestone', title: 'Like Crazy #1 on Billboard Hot 100', date: '2023-03-27', description: 'First Korean solo artist to reach #1 on Billboard Hot 100 with "Like Crazy"' },
    { member_id: 'jm', event_type: 'milestone', title: 'MUSE album released', date: '2024-07-19', description: 'Released second studio album "MUSE" featuring "Who" — #2 on Billboard 200' },
    { member_id: 'jm', event_type: 'milestone', title: 'Who #1 on Billboard Hot 100', date: '2024-08-05', description: '"Who" debuted at #1 on Billboard Hot 100, making Jimin the first Korean soloist with two #1 hits' },
    { member_id: 'jm', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-12-12', description: 'Enlisted for mandatory military service alongside Jungkook' },
    { member_id: 'jm', event_type: 'enlistment_end', title: 'Military discharge', date: '2025-06-11', description: 'Discharged from military service' },
    { member_id: 'jm', event_type: 'ambassador', title: 'Dior Global Ambassador', date: '2023-01-18', description: 'Appointed as global ambassador for Dior' },
    { member_id: 'jm', event_type: 'ambassador', title: 'Tiffany & Co. Ambassador', date: '2023-03-01', description: 'Appointed as brand ambassador for Tiffany & Co.' },
    { member_id: 'jm', event_type: 'milestone', title: 'Most days at #1 on Billboard Artist 100', date: '2023-04-10', description: 'Set record for most days at #1 on Billboard Artist 100 among Korean soloists' },

    // ═══════════════════════════════════════════
    // V (Kim Taehyung)
    // ═══════════════════════════════════════════
    { member_id: 'v', event_type: 'milestone', title: 'Hwarang: The Poet Warrior Youth', date: '2016-12-19', description: 'Acting debut in KBS2 drama Hwarang alongside Park Seo-joon and Park Hyung-sik' },
    { member_id: 'v', event_type: 'milestone', title: 'Scenery self-released', date: '2019-01-30', description: 'Released self-composed song "Scenery" on SoundCloud' },
    { member_id: 'v', event_type: 'milestone', title: 'Sweet Night (Itaewon Class OST)', date: '2020-03-13', description: 'Released "Sweet Night" for JTBC drama Itaewon Class — #1 in 117 countries on iTunes' },
    { member_id: 'v', event_type: 'milestone', title: 'Christmas Tree (Our Beloved Summer OST)', date: '2021-12-24', description: 'Released "Christmas Tree" for SBS drama Our Beloved Summer' },
    { member_id: 'v', event_type: 'solo_debut', title: 'Layover EP released', date: '2023-09-08', description: 'Debut solo EP "Layover" — highest first-week sales for Korean solo album (2023), featuring Slow Dancing' },
    { member_id: 'v', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-12-11', description: 'Enlisted for mandatory military service alongside RM' },
    { member_id: 'v', event_type: 'enlistment_end', title: 'Military discharge', date: '2025-06-10', description: 'Discharged from military service' },
    { member_id: 'v', event_type: 'ambassador', title: 'CELINE Global Ambassador', date: '2023-07-01', description: 'Appointed as global ambassador for CELINE' },
    { member_id: 'v', event_type: 'ambassador', title: 'Cartier Global Ambassador', date: '2023-10-01', description: 'Appointed as global ambassador for Cartier' },
    { member_id: 'v', event_type: 'variety_show', title: 'Jinny\'s Kitchen cast member', date: '2023-02-24', description: 'Cast member on tvN variety show Jinny\'s Kitchen with Park Seo-joon and Choi Woo-shik' },

    // ═══════════════════════════════════════════
    // JUNGKOOK (Jeon Jeongguk)
    // ═══════════════════════════════════════════
    { member_id: 'jk', event_type: 'milestone', title: 'Left and Right with Charlie Puth', date: '2022-06-24', description: 'Released "Left and Right" with Charlie Puth — peaked at #22 on Billboard Hot 100' },
    { member_id: 'jk', event_type: 'milestone', title: 'FIFA World Cup opening ceremony', date: '2022-11-20', description: 'Performed "Dreamers" at the 2022 FIFA World Cup opening ceremony in Qatar — first Korean solo artist to perform at FIFA World Cup' },
    { member_id: 'jk', event_type: 'solo_debut', title: 'Seven single released', date: '2023-07-14', description: '"Seven" featuring Latto debuted at #1 on Billboard Hot 100 — first Korean solo artist to do so. Fastest song to reach 1 billion Spotify streams' },
    { member_id: 'jk', event_type: 'milestone', title: '3D single released', date: '2023-10-06', description: '"3D" featuring Jack Harlow debuted at #5 on Billboard Hot 100 — first Korean soloist with two top-5 entries on UK Singles Chart' },
    { member_id: 'jk', event_type: 'milestone', title: 'GOLDEN album released', date: '2023-11-03', description: 'Debut studio album "GOLDEN" — highest-selling solo album in Hanteo history' },
    { member_id: 'jk', event_type: 'milestone', title: 'First Korean soloist to perform at VMAs', date: '2023-09-12', description: 'Performed "Standing Next to You" at the 2023 MTV Video Music Awards' },
    { member_id: 'jk', event_type: 'enlistment_start', title: 'Military enlistment', date: '2023-12-12', description: 'Enlisted for mandatory military service alongside Jimin' },
    { member_id: 'jk', event_type: 'enlistment_end', title: 'Military discharge', date: '2025-06-11', description: 'Discharged from military service' },
    { member_id: 'jk', event_type: 'ambassador', title: 'Calvin Klein Global Ambassador', date: '2023-03-01', description: 'Appointed as global ambassador for Calvin Klein' },
];

async function main() {
    logStart('Seeding curated member career events');

    if (DRY_RUN) {
        console.log('\n   [DRY RUN] Would seed the following events:\n');
        const byMember = new Map<string, CuratedEvent[]>();
        for (const e of CURATED_EVENTS) {
            if (!byMember.has(e.member_id)) byMember.set(e.member_id, []);
            byMember.get(e.member_id)!.push(e);
        }
        for (const [mid, events] of byMember) {
            console.log(`   ${mid.toUpperCase()} (${events.length} events):`);
            for (const e of events.sort((a, b) => a.date.localeCompare(b.date))) {
                console.log(`     ${e.date}  [${e.event_type}]  ${e.title}`);
            }
            console.log();
        }
        console.log(`   Total: ${CURATED_EVENTS.length} events`);
        return;
    }

    const supabase = createSupabaseAdmin();

    // Step 1: Delete existing member_events to start fresh
    console.log('\n   Clearing existing member_events...');
    const { error: delError } = await supabase.from('member_events').delete().neq('id', -1); // delete all
    if (delError) {
        logError(`Failed to clear member_events: ${delError.message}`);
        return;
    }
    logSuccess('Cleared existing member_events');

    // Step 2: Insert curated events
    let inserted = 0;
    let failed = 0;

    for (const event of CURATED_EVENTS) {
        const { error } = await supabase.from('member_events').insert({
            member_id: event.member_id,
            event_type: event.event_type,
            title: event.title,
            date: event.date,
            description: event.description,
            source_url: null,
        });

        if (error) {
            logError(`Failed: ${event.title} — ${error.message}`);
            failed++;
        } else {
            inserted++;
        }
    }

    console.log(`\n   Inserted: ${inserted}`);
    console.log(`   Failed: ${failed}`);
    logDone(`Seeded ${inserted} curated member events!`);
}

main().catch(console.error);
