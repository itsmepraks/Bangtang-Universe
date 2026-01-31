/**
 * Database Migration Script
 * 
 * Migrates hardcoded data from TypeScript files to Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 * 
 * Prerequisites:
 *   1. Run schema.sql in Supabase SQL Editor first
 *   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service_role key for migrations (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('   Get the service_role key from: Supabase Dashboard → Settings → API');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== ALBUM DATA ====================
const ALBUMS = [
    { id: 1, title: 'Dark & Wild', title_korean: null, release_date: '2014-08-19', type: 'Studio', track_count: 14, description: "BTS's first studio album exploring themes of youth, rebellion, and intense emotion. Features \"Danger\" and \"War of Hormone\".", era: 'School Trilogy', cover_color: '#1F2937' },
    { id: 2, title: 'The Most Beautiful Moment in Life Pt.1', title_korean: '화양연화 pt.1', release_date: '2015-04-29', type: 'Mini', track_count: 9, description: 'The beginning of the HYYH era, capturing the beauty and pain of youth. Features breakthrough hits "I Need U" and "Dope".', era: 'HYYH', cover_color: '#FEF3C7' },
    { id: 3, title: 'The Most Beautiful Moment in Life Pt.2', title_korean: '화양연화 pt.2', release_date: '2015-11-30', type: 'Mini', track_count: 9, description: 'Continuation of the HYYH narrative with "Run" exploring the recklessness of youth and "Butterfly" its fragility.', era: 'HYYH', cover_color: '#FDE68A' },
    { id: 4, title: 'The Most Beautiful Moment in Life: Young Forever', title_korean: '화양연화 Young Forever', release_date: '2016-05-02', type: 'Compilation', track_count: 23, description: 'Special compilation album concluding the HYYH trilogy with new tracks "Fire" and "Save Me".', era: 'HYYH', cover_color: '#D1FAE5' },
    { id: 5, title: 'Wings', title_korean: null, release_date: '2016-10-10', type: 'Studio', track_count: 15, description: 'Second studio album inspired by Hermann Hesse\'s "Demian". Each member has a solo track exploring personal growth and temptation.', era: 'Wings', cover_color: '#1E1B4B' },
    { id: 6, title: 'You Never Walk Alone', title_korean: null, release_date: '2017-02-13', type: 'Repackage', track_count: 18, description: 'Wings repackage with new tracks including the iconic "Spring Day", one of the longest-charting songs in Korean history.', era: 'Wings', cover_color: '#A7F3D0' },
    { id: 7, title: 'Love Yourself: Her', title_korean: null, release_date: '2017-09-18', type: 'Mini', track_count: 9, description: "First installment of the Love Yourself series. \"DNA\" became BTS's first song to enter Billboard Hot 100.", era: 'Love Yourself', cover_color: '#F9A8D4' },
    { id: 8, title: 'Love Yourself: Tear', title_korean: null, release_date: '2018-05-18', type: 'Studio', track_count: 11, description: 'Third studio album exploring the pain of love\'s end. "Fake Love" captures the masks we wear in relationships.', era: 'Love Yourself', cover_color: '#4C1D95' },
    { id: 9, title: 'Love Yourself: Answer', title_korean: null, release_date: '2018-08-24', type: 'Compilation', track_count: 25, description: 'Conclusion of the Love Yourself series with the message that self-love is the answer. Features "IDOL" and "Euphoria".', era: 'Love Yourself', cover_color: '#EC4899' },
    { id: 10, title: 'Map of the Soul: Persona', title_korean: null, release_date: '2019-04-12', type: 'Mini', track_count: 7, description: 'Beginning of the Map of the Soul series based on Jungian psychology. "Boy With Luv" ft. Halsey celebrates joy in small things.', era: 'Map of the Soul', cover_color: '#FDF4FF' },
    { id: 11, title: 'Map of the Soul: 7', title_korean: null, release_date: '2020-02-21', type: 'Studio', track_count: 20, description: 'Fourth studio album celebrating 7 years of BTS. Each member contributes solo tracks exploring their shadow and ego.', era: 'Map of the Soul', cover_color: '#C7D2FE' },
    { id: 12, title: 'BE', title_korean: null, release_date: '2020-11-20', type: 'Studio', track_count: 8, description: 'Created during the pandemic, this self-produced album captures life in 2020 with "Life Goes On" offering comfort.', era: 'BE', cover_color: '#D1D5DB' },
    { id: 13, title: 'Butter', title_korean: null, release_date: '2021-07-09', type: 'Single', track_count: 3, description: 'Summer single album with the mega-hit "Butter" and Ed Sheeran-co-written "Permission to Dance".', era: 'Butter', cover_color: '#FEF08A' },
    { id: 14, title: 'Proof', title_korean: null, release_date: '2022-06-10', type: 'Compilation', track_count: 48, description: "Anthology album for BTS's 9th anniversary, featuring hits from 2013-2022 plus new tracks before hiatus.", era: 'Proof', cover_color: '#020617' },
    { id: 15, title: 'Take Two', title_korean: null, release_date: '2023-06-09', type: 'Single', track_count: 1, description: "Digital single released for BTS's 10th anniversary FESTA, expressing gratitude to ARMY.", era: 'Chapter 2', cover_color: '#A855F7' }
];

// ==================== MEMBER DATA ====================
const MEMBERS = [
    { id: 'rm', stage_name: 'RM', full_name: 'Kim Namjoon', color: '#2563EB', role: 'Leader / Main Rapper / Producer', mic_color: 'Blue', komca_credits: 227, bio: "The philosophical leader and main rapper of BTS. A self-taught English speaker with an IQ of 148, RM is the primary songwriter of the group.", birth_date: '1994-09-12', birth_place: 'Ilsan, Goyang, South Korea', height: '181 cm', mbti: 'ENFP', zodiac: 'Virgo', instagram: '@rkive', solo_tracks: ['Wild Flower', 'Still Life', 'Yun', 'Come back to me'], achievements: ['UN General Assembly Speaker', 'Billboard 200 #1 (Indigo)'], featured_tracks: ['Seoul Town Road with Lil Nas X'], producer_credits: 175, writer_credits: 218 },
    { id: 'jin', stage_name: 'JIN', full_name: 'Kim Seokjin', color: '#EC4899', role: 'Sub Vocalist / Visual', mic_color: 'Pink', komca_credits: 35, bio: 'Known as "Worldwide Handsome," Jin possesses a powerful tenor voice and is celebrated for his emotional ballads.', birth_date: '1992-12-04', birth_place: 'Gwacheon, Gyeonggi-do, South Korea', height: '179 cm', mbti: 'INTP', zodiac: 'Sagittarius', instagram: '@jin', solo_tracks: ['The Astronaut', 'Epiphany', 'Awake', 'Running Wild'], achievements: ['Order of Cultural Merit (2018)', 'Military service completed (2024)'], featured_tracks: ['Yours (Jirisan OST)'], producer_credits: 5, writer_credits: 35 },
    { id: 'suga', stage_name: 'SUGA', full_name: 'Min Yoongi', color: '#64748B', role: 'Lead Rapper / Producer', mic_color: 'Black', komca_credits: 177, bio: 'A prolific producer and rapper who goes by the alias Agust D for his solo work.', birth_date: '1993-03-09', birth_place: 'Daegu, South Korea', height: '174 cm', mbti: 'ISTP', zodiac: 'Pisces', instagram: '@agaboramyeonguhjji', solo_tracks: ['Daechwita', 'Haegeum', 'People', 'Amygdala'], achievements: ['D-DAY #1 on Billboard 200', 'First K-pop soloist to headline US stadium tour'], featured_tracks: ['Eight (IU)', 'That That (PSY)'], producer_credits: 150, writer_credits: 175 },
    { id: 'jh', stage_name: 'J-HOPE', full_name: 'Jung Hoseok', color: '#EF4444', role: 'Main Dancer / Sub Rapper', mic_color: 'Silver', komca_credits: 150, bio: "Known as the group's \"sunshine,\" J-Hope is the main dancer and a skilled rapper.", birth_date: '1994-02-18', birth_place: 'Gwangju, South Korea', height: '177 cm', mbti: 'INFJ', zodiac: 'Aquarius', instagram: '@uarmyhope', solo_tracks: ['Arson', 'MORE', 'Chicken Noodle Soup', 'NEURON'], achievements: ['First Korean artist to headline Lollapalooza'], featured_tracks: ['On the Street (with J. Cole)'], producer_credits: 95, writer_credits: 145 },
    { id: 'jm', stage_name: 'JIMIN', full_name: 'Park Jimin', color: '#F59E0B', role: 'Lead Vocalist / Main Dancer', mic_color: 'Gold', komca_credits: 27, bio: 'A classically trained contemporary dancer who graduated top of his class at Busan High School of Arts.', birth_date: '1995-10-13', birth_place: 'Busan, South Korea', height: '174 cm', mbti: 'ESTP', zodiac: 'Libra', instagram: '@j.m', solo_tracks: ['Like Crazy', 'Set Me Free Pt.2', 'Who', 'Serendipity'], achievements: ['Billboard Hot 100 #1 (Like Crazy)', 'FACE #1 on Billboard 200'], featured_tracks: ['With You (Our Blues OST)'], producer_credits: 8, writer_credits: 25 },
    { id: 'v', stage_name: 'V', full_name: 'Kim Taehyung', color: '#22C55E', role: 'Sub Vocalist / Visual', mic_color: 'Green', komca_credits: 25, bio: 'Known for his deep, soulful baritone and artistic vision, V brings jazz and R&B influences to his music.', birth_date: '1995-12-30', birth_place: 'Daegu, South Korea', height: '179 cm', mbti: 'INFP', zodiac: 'Capricorn', instagram: '@thv', solo_tracks: ['Slow Dancing', 'Rainy Days', 'Love Me Again', 'Sweet Night'], achievements: ['Sweet Night #1 in 117 countries', 'Layover highest first-week sales (2023)'], featured_tracks: ['Christmas Tree (Our Beloved Summer OST)'], producer_credits: 5, writer_credits: 24 },
    { id: 'jk', stage_name: 'JK', full_name: 'Jeon Jungkook', color: '#8B5CF6', role: 'Main Vocalist / Lead Dancer / Center / Maknae', mic_color: 'Purple', komca_credits: 30, bio: 'The youngest member, known as the "Golden Maknae" for his exceptional talent in vocals, dance, and various other skills.', birth_date: '1997-09-01', birth_place: 'Busan, South Korea', height: '179 cm', mbti: 'INTP', zodiac: 'Virgo', instagram: '@jungkook.97', solo_tracks: ['Standing Next to You', 'Seven', '3D', 'Euphoria'], achievements: ['Seven - Most weeks at #1 on Billboard Global 200', 'GOLDEN - Highest-selling solo album'], featured_tracks: ['Dreamers (FIFA World Cup 2022)', 'Left and Right (Charlie Puth)'], producer_credits: 10, writer_credits: 28 }
];

// ==================== SONGS DATA (sample - first 20) ====================
const SONGS = [
    { id: 1, title: 'Danger', title_korean: '위험', album_id: 1, release_date: '2014-08-19', duration_seconds: 232, bpm: 184, energy: 0.89, valence: 0.45, danceability: 0.75, acousticness: 0.05, sentiment: 'Pain', keywords: ['danger', 'obsession', 'heart'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 2, title: 'War of Hormone', title_korean: '호르몬 전쟁', album_id: 1, release_date: '2014-08-19', duration_seconds: 229, bpm: 128, energy: 0.91, valence: 0.72, danceability: 0.82, acousticness: 0.02, sentiment: 'Celebration', keywords: ['hormones', 'youth', 'attraction'], writers: ['Pdogg', 'Supreme Boi', 'RM', 'SUGA'], producers: ['Pdogg'], member_credits: ['rm', 'suga'], is_title_track: false, has_mv: true },
    { id: 3, title: 'I Need U', title_korean: null, album_id: 2, release_date: '2015-04-29', duration_seconds: 209, bpm: 128, energy: 0.73, valence: 0.35, danceability: 0.70, acousticness: 0.08, sentiment: 'Pain', keywords: ['need', 'pain', 'love'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 4, title: 'Dope', title_korean: '쩔어', album_id: 2, release_date: '2015-06-23', duration_seconds: 225, bpm: 168, energy: 0.95, valence: 0.75, danceability: 0.88, acousticness: 0.01, sentiment: 'Empowerment', keywords: ['success', 'hardwork', 'confidence'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 5, title: 'Run', title_korean: null, album_id: 3, release_date: '2015-11-30', duration_seconds: 221, bpm: 127, energy: 0.85, valence: 0.55, danceability: 0.75, acousticness: 0.05, sentiment: 'Determination', keywords: ['run', 'youth', 'dreams'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 6, title: 'Butterfly', title_korean: null, album_id: 3, release_date: '2015-11-30', duration_seconds: 243, bpm: 81, energy: 0.45, valence: 0.28, danceability: 0.50, acousticness: 0.25, sentiment: 'Melancholy', keywords: ['butterfly', 'fragile', 'beautiful'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 7, title: 'Fire', title_korean: '불타오르네', album_id: 4, release_date: '2016-05-02', duration_seconds: 199, bpm: 107, energy: 0.96, valence: 0.80, danceability: 0.90, acousticness: 0.01, sentiment: 'Celebration', keywords: ['fire', 'burning', 'energy'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 8, title: 'Save Me', title_korean: null, album_id: 4, release_date: '2016-05-02', duration_seconds: 196, bpm: 110, energy: 0.72, valence: 0.42, danceability: 0.68, acousticness: 0.10, sentiment: 'Longing', keywords: ['save', 'darkness', 'help'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 9, title: 'Blood Sweat & Tears', title_korean: '피 땀 눈물', album_id: 5, release_date: '2016-10-10', duration_seconds: 217, bpm: 100, energy: 0.78, valence: 0.50, danceability: 0.72, acousticness: 0.08, sentiment: 'Pain', keywords: ['temptation', 'sin', 'desire'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 10, title: 'Spring Day', title_korean: '봄날', album_id: 6, release_date: '2017-02-13', duration_seconds: 261, bpm: 107, energy: 0.50, valence: 0.35, danceability: 0.48, acousticness: 0.22, sentiment: 'Longing', keywords: ['spring', 'missing', 'reunion'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 11, title: 'DNA', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 223, bpm: 130, energy: 0.80, valence: 0.65, danceability: 0.78, acousticness: 0.05, sentiment: 'Love', keywords: ['DNA', 'destiny', 'fate'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 12, title: 'MIC Drop', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 225, bpm: 130, energy: 0.88, valence: 0.58, danceability: 0.82, acousticness: 0.02, sentiment: 'Confidence', keywords: ['mic drop', 'success', 'swagger'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 13, title: 'Fake Love', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 243, bpm: 78, energy: 0.72, valence: 0.28, danceability: 0.68, acousticness: 0.12, sentiment: 'Pain', keywords: ['fake', 'love', 'pretend'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 14, title: 'IDOL', title_korean: null, album_id: 9, release_date: '2018-08-24', duration_seconds: 220, bpm: 126, energy: 0.92, valence: 0.80, danceability: 0.88, acousticness: 0.01, sentiment: 'Celebration', keywords: ['idol', 'self-love', 'identity'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 15, title: 'Boy With Luv', title_korean: '작은 것들을 위한 시', album_id: 10, release_date: '2019-04-12', duration_seconds: 229, bpm: 127, energy: 0.82, valence: 0.85, danceability: 0.80, acousticness: 0.05, sentiment: 'Love', keywords: ['boy with luv', 'small things', 'joy'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 16, title: 'ON', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 253, bpm: 106, energy: 0.88, valence: 0.55, danceability: 0.72, acousticness: 0.05, sentiment: 'Determination', keywords: ['on', 'bring the pain', 'fight'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 17, title: 'Black Swan', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 196, bpm: 93, energy: 0.65, valence: 0.22, danceability: 0.65, acousticness: 0.15, sentiment: 'Fear', keywords: ['black swan', 'death', 'art'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 18, title: 'Life Goes On', title_korean: null, album_id: 12, release_date: '2020-11-20', duration_seconds: 207, bpm: 82, energy: 0.52, valence: 0.62, danceability: 0.55, acousticness: 0.45, sentiment: 'Comfort', keywords: ['life goes on', 'hope', 'tomorrow'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 19, title: 'Dynamite', title_korean: null, album_id: 12, release_date: '2020-08-21', duration_seconds: 199, bpm: 114, energy: 0.85, valence: 0.82, danceability: 0.80, acousticness: 0.05, sentiment: 'Joy', keywords: ['dynamite', 'disco', 'dance'], writers: ['David Stewart', 'Jessica Agombar'], producers: ['David Stewart'], member_credits: [], is_title_track: true, has_mv: true },
    { id: 20, title: 'Butter', title_korean: null, album_id: 13, release_date: '2021-05-21', duration_seconds: 165, bpm: 110, energy: 0.85, valence: 0.75, danceability: 0.82, acousticness: 0.03, sentiment: 'Confidence', keywords: ['butter', 'smooth', 'summer'], writers: ['Rob Grimaldi', 'Stephen Kirk', 'RM'], producers: ['Rob Grimaldi'], member_credits: ['rm'], is_title_track: true, has_mv: true },
    { id: 21, title: 'Permission to Dance', title_korean: null, album_id: 13, release_date: '2021-07-09', duration_seconds: 187, bpm: 125, energy: 0.82, valence: 0.88, danceability: 0.78, acousticness: 0.08, sentiment: 'Joy', keywords: ['permission', 'dance', 'freedom'], writers: ['Ed Sheeran', 'Steve Mac'], producers: ['Steve Mac'], member_credits: [], is_title_track: true, has_mv: true },
    { id: 22, title: 'Yet To Come', title_korean: null, album_id: 14, release_date: '2022-06-10', duration_seconds: 221, bpm: 80, energy: 0.55, valence: 0.60, danceability: 0.50, acousticness: 0.30, sentiment: 'Gratitude', keywords: ['yet to come', 'best', 'future'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 23, title: 'Take Two', title_korean: null, album_id: 15, release_date: '2023-06-09', duration_seconds: 212, bpm: 120, energy: 0.78, valence: 0.72, danceability: 0.68, acousticness: 0.15, sentiment: 'Gratitude', keywords: ['take two', 'ARMY', 'anniversary'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: false }
];

// ==================== MIGRATION FUNCTIONS ====================

async function migrateAlbums() {
    console.log('📀 Migrating albums...');

    const { data, error } = await supabase
        .from('albums')
        .upsert(ALBUMS, { onConflict: 'id' })
        .select();

    if (error) {
        console.error('❌ Albums migration failed:', error.message);
        return false;
    }

    console.log(`✅ Migrated ${data.length} albums`);
    return true;
}

async function migrateMembers() {
    console.log('👥 Migrating members...');

    const { data, error } = await supabase
        .from('members')
        .upsert(MEMBERS, { onConflict: 'id' })
        .select();

    if (error) {
        console.error('❌ Members migration failed:', error.message);
        return false;
    }

    console.log(`✅ Migrated ${data.length} members`);
    return true;
}

async function migrateSongs() {
    console.log('🎵 Migrating songs...');

    const { data, error } = await supabase
        .from('songs')
        .upsert(SONGS, { onConflict: 'id' })
        .select();

    if (error) {
        console.error('❌ Songs migration failed:', error.message);
        return false;
    }

    console.log(`✅ Migrated ${data.length} songs`);
    return true;
}

async function runMigration() {
    console.log('\n🚀 Starting BTS Universe Database Migration\n');
    console.log('━'.repeat(50));

    const albumsOk = await migrateAlbums();
    const membersOk = await migrateMembers();
    const songsOk = await migrateSongs();

    console.log('━'.repeat(50));

    if (albumsOk && membersOk && songsOk) {
        console.log('\n✨ Migration completed successfully! 💜\n');
    } else {
        console.log('\n⚠️ Migration completed with errors. Check above for details.\n');
    }
}

// Run the migration
runMigration().catch(console.error);
