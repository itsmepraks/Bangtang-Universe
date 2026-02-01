/**
 * Upload Member Photos to Supabase Storage
 * 
 * Uploads local member images to Supabase Storage bucket
 * and updates the member records with public URLs.
 * 
 * Prerequisites:
 *   1. Create a storage bucket called "member-photos" in Supabase
 *      Dashboard → Storage → New Bucket → Name: "member-photos" → Public: ON
 * 
 * Usage:
 *   npx tsx scripts/upload-member-photos.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Member photo files (in public/assets/members/)
const MEMBER_PHOTOS = [
    { id: 'rm', file: 'rm.jpg' },
    { id: 'jin', file: 'jin.jpg' },
    { id: 'suga', file: 'suga.jpg' },
    { id: 'jh', file: 'jh.jpg' },
    { id: 'jm', file: 'jm.jpg' },
    { id: 'v', file: 'v.jpg' },
    { id: 'jk', file: 'jk.jpg' },
];

const BUCKET_NAME = 'member-photos';
const LOCAL_PHOTOS_DIR = path.resolve(process.cwd(), 'public/assets/members');

async function uploadMemberPhotos() {
    console.log('\n📸 Uploading Member Photos to Supabase Storage\n');
    console.log('━'.repeat(50));

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
        console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        });
        if (createError) {
            console.error('❌ Failed to create bucket:', createError.message);
            console.log('\n💡 TIP: Create the bucket manually in Supabase Dashboard:');
            console.log('   Storage → New Bucket → Name: "member-photos" → Public: ON\n');
            return;
        }
        console.log('✅ Bucket created');
    } else {
        console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
    }

    let uploaded = 0;
    let failed = 0;

    for (const member of MEMBER_PHOTOS) {
        const localPath = path.join(LOCAL_PHOTOS_DIR, member.file);

        // Check if file exists
        if (!fs.existsSync(localPath)) {
            console.log(`⏭️  Skipping ${member.id} (file not found: ${member.file})`);
            failed++;
            continue;
        }

        // Read file
        const fileBuffer = fs.readFileSync(localPath);
        const fileName = `${member.id}.jpg`;

        // Upload to Supabase Storage
        console.log(`📤 Uploading ${member.id}...`);
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileBuffer, {
                contentType: 'image/jpeg',
                upsert: true, // Overwrite if exists
            });

        if (uploadError) {
            console.error(`   ❌ Upload failed: ${uploadError.message}`);
            failed++;
            continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        console.log(`   📍 URL: ${publicUrl}`);

        // Update member record in database
        const { error: updateError } = await supabase
            .from('members')
            .update({ image_url: publicUrl })
            .eq('id', member.id);

        if (updateError) {
            console.error(`   ⚠️  DB update failed: ${updateError.message}`);
        } else {
            console.log(`   ✅ Updated ${member.id} in database`);
            uploaded++;
        }
    }

    console.log('━'.repeat(50));
    console.log(`\n📊 Results: ${uploaded} uploaded, ${failed} failed\n`);

    if (uploaded > 0) {
        console.log('✨ Member photos uploaded to Supabase Storage! 💜\n');
    }
}

uploadMemberPhotos().catch(console.error);
