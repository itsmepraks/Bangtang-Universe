/**
 * Database Verification Script
 *
 * Checks all Supabase tables for expected row counts and data integrity.
 *
 * Usage:
 *   npx tsx scripts/verify-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected counts
const EXPECTED = {
    albums: 15,
    members: 7,
    songs: 57,
    solo_albums: 15,
    lyrics: 0, // No lyrics data seeded
};

async function getCount(table: string): Promise<number> {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(`   ❌ Failed to query ${table}: ${error.message}`);
        return -1;
    }
    return count ?? 0;
}

async function verifyTableCounts() {
    console.log('📊 Table Row Counts\n');

    let allGood = true;

    for (const [table, expected] of Object.entries(EXPECTED)) {
        const actual = await getCount(table);
        const match = actual === expected;
        const icon = actual === -1 ? '❌' : match ? '✅' : '⚠️';
        const status = actual === -1 ? 'ERROR' : match ? 'OK' : `expected ${expected}`;

        console.log(`   ${icon} ${table}: ${actual} rows (${status})`);

        if (!match) allGood = false;
    }

    return allGood;
}

async function verifyMemberImages() {
    console.log('\n📸 Member Images\n');

    const { data: members, error } = await supabase
        .from('members')
        .select('id, stage_name, image_url')
        .order('komca_credits', { ascending: false });

    if (error) {
        console.error(`   ❌ Failed to query members: ${error.message}`);
        return;
    }

    let withImage = 0;
    for (const m of members || []) {
        const hasImage = !!m.image_url;
        const icon = hasImage ? '🖼️' : '⬜';
        console.log(`   ${icon} ${m.stage_name}: ${m.image_url || '(no image)'}`);
        if (hasImage) withImage++;
    }

    console.log(`\n   ${withImage}/${members?.length || 0} members have images`);
}

async function verifySoloAlbums() {
    console.log('\n💿 Solo Albums by Member\n');

    const { data: soloAlbums, error } = await supabase
        .from('solo_albums')
        .select('member_id, title, type')
        .order('member_id');

    if (error) {
        console.error(`   ❌ Failed to query solo_albums: ${error.message}`);
        return;
    }

    const grouped: Record<string, string[]> = {};
    for (const sa of soloAlbums || []) {
        if (!grouped[sa.member_id]) grouped[sa.member_id] = [];
        grouped[sa.member_id].push(`${sa.title} (${sa.type})`);
    }

    for (const [memberId, albums] of Object.entries(grouped)) {
        console.log(`   ${memberId}: ${albums.length} albums - ${albums.join(', ')}`);
    }
}

async function verifyForeignKeys() {
    console.log('\n🔗 Foreign Key Integrity\n');

    // Songs with null album_id
    const { data: orphanSongs } = await supabase
        .from('songs')
        .select('id, title')
        .is('album_id', null);

    if (orphanSongs && orphanSongs.length > 0) {
        console.log(`   ⚠️ ${orphanSongs.length} songs with no album:`);
        for (const s of orphanSongs) {
            console.log(`      - [${s.id}] ${s.title}`);
        }
    } else {
        console.log('   ✅ All songs have valid album references');
    }

    // Solo albums - check member_id references
    const { data: members } = await supabase.from('members').select('id');
    const memberIds = new Set((members || []).map(m => m.id));

    const { data: soloAlbums } = await supabase.from('solo_albums').select('id, title, member_id');
    const orphanAlbums = (soloAlbums || []).filter(sa => !memberIds.has(sa.member_id));

    if (orphanAlbums.length > 0) {
        console.log(`   ⚠️ ${orphanAlbums.length} solo albums with invalid member_id:`);
        for (const sa of orphanAlbums) {
            console.log(`      - [${sa.id}] ${sa.title} (member_id: ${sa.member_id})`);
        }
    } else {
        console.log('   ✅ All solo albums have valid member references');
    }
}

async function verify() {
    console.log('\n🔍 BTS Universe Database Verification\n');
    console.log('━'.repeat(50));

    const countsOk = await verifyTableCounts();
    await verifyMemberImages();
    await verifySoloAlbums();
    await verifyForeignKeys();

    console.log('\n' + '━'.repeat(50));

    if (countsOk) {
        console.log('\n✨ All tables populated correctly! 💜\n');
    } else {
        console.log('\n⚠️ Some tables have unexpected counts. Run db:migrate to fix.\n');
    }
}

verify().catch(console.error);
