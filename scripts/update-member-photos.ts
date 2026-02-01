/**
 * Update Member Photos Script
 * 
 * Updates member image_url fields in Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/update-member-photos.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== MEMBER PHOTOS ====================
// Using local photos from public/assets/members/
const MEMBER_PHOTOS: Record<string, string> = {
    'rm': '/assets/members/rm.jpg',
    'jin': '/assets/members/jin.jpg',
    'suga': '/assets/members/suga.jpg',
    'jh': '/assets/members/jh.jpg',
    'jm': '/assets/members/jm.jpg',
    'v': '/assets/members/v.jpg',
    'jk': '/assets/members/jk.jpg',
};

async function updateMemberPhotos() {
    console.log('\n📸 Updating Member Photos\n');
    console.log('━'.repeat(50));

    let updated = 0;
    let skipped = 0;

    for (const [memberId, imageUrl] of Object.entries(MEMBER_PHOTOS)) {
        if (!imageUrl) {
            console.log(`⏭️  Skipping ${memberId} (no URL provided)`);
            skipped++;
            continue;
        }

        const { error } = await supabase
            .from('members')
            .update({ image_url: imageUrl })
            .eq('id', memberId);

        if (error) {
            console.error(`❌ Failed to update ${memberId}:`, error.message);
        } else {
            console.log(`✅ Updated ${memberId}`);
            updated++;
        }
    }

    console.log('━'.repeat(50));
    console.log(`\n📊 Results: ${updated} updated, ${skipped} skipped\n`);
}

updateMemberPhotos().catch(console.error);
