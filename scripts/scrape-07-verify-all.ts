/**
 * Script 7: Verify all scraped data in Supabase
 *
 * Prints a dashboard showing data quality and coverage.
 *
 * Usage: npx tsx scripts/scrape-07-verify-all.ts
 */

import { createSupabaseAdmin, logStart, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();

async function getCount(table: string): Promise<number> {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    if (error) return -1;
    return count ?? 0;
}

async function main() {
    logStart('BTS Universe Data Pipeline - Verification');

    // Table counts
    const albumCount = await getCount('albums');
    const songCount = await getCount('songs');
    const lyricsCount = await getCount('lyrics');
    const memberCount = await getCount('members');
    const soloCount = await getCount('solo_albums');

    console.log('   📊 Table Row Counts\n');
    console.log(`   📀 Albums:      ${albumCount}`);
    console.log(`   🎵 Songs:       ${songCount}`);
    console.log(`   📝 Lyrics:      ${lyricsCount}`);
    console.log(`   👥 Members:     ${memberCount}`);
    console.log(`   💿 Solo Albums: ${soloCount}`);

    // Song data quality
    console.log('\n   🔍 Song Data Quality\n');

    // Songs with writers
    const { count: withWriters } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('writers', 'eq', '{}');
    console.log(`   ✏️  With writers:      ${withWriters}/${songCount} (${pct(withWriters || 0, songCount)}%)`);

    // Songs with producers
    const { count: withProducers } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('producers', 'eq', '{}');
    console.log(`   🎛️  With producers:    ${withProducers}/${songCount} (${pct(withProducers || 0, songCount)}%)`);

    // Songs with Korean titles
    const { count: withKorean } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('title_korean', 'is', null);
    console.log(`   🇰🇷 Korean titles:    ${withKorean}/${songCount} (${pct(withKorean || 0, songCount)}%)`);

    // Songs with duration
    const { count: withDuration } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('duration_seconds', 'is', null);
    console.log(`   ⏱️  With duration:     ${withDuration}/${songCount} (${pct(withDuration || 0, songCount)}%)`);

    // Songs with audio features (bpm not null)
    const { count: withAudio } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('bpm', 'is', null);
    console.log(`   🎹 Audio features:    ${withAudio}/${songCount} (${pct(withAudio || 0, songCount)}%)`);

    // Songs with sentiment
    const { count: withSentiment } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .not('sentiment', 'is', null);
    console.log(`   💜 With sentiment:    ${withSentiment}/${songCount} (${pct(withSentiment || 0, songCount)}%)`);

    // Lyrics coverage
    console.log(`\n   📝 Lyrics coverage:   ${lyricsCount}/${songCount} (${pct(lyricsCount, songCount)}%)`);

    // Albums by era
    console.log('\n   🗂️  Albums by Era\n');
    const { data: albumsByEra } = await supabase
        .from('albums')
        .select('title, era, track_count')
        .order('release_date');

    const eras = new Map<string, string[]>();
    for (const a of albumsByEra || []) {
        const era = a.era || 'Unknown';
        if (!eras.has(era)) eras.set(era, []);
        eras.get(era)!.push(`${a.title} (${a.track_count})`);
    }

    for (const [era, albums] of eras) {
        console.log(`   ${era}: ${albums.join(', ')}`);
    }

    // Member images check
    console.log('\n   📸 Member Images\n');
    const { data: members } = await supabase
        .from('members')
        .select('stage_name, image_url');

    for (const m of members || []) {
        const icon = m.image_url ? '🖼️' : '⬜';
        console.log(`   ${icon} ${m.stage_name}: ${m.image_url ? 'OK' : '(missing)'}`);
    }

    logDone('Verification complete!');
}

function pct(a: number, b: number): string {
    if (b === 0) return '0';
    return Math.round((a / b) * 100).toString();
}

main().catch(console.error);
