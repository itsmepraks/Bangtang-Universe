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
 *   2. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
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

// ==================== ALBUM DATA (15 albums) ====================
const ALBUMS = [
    { id: 1, title: 'Dark & Wild', title_korean: null, release_date: '2014-08-19', type: 'Studio', track_count: 14, description: "BTS's first studio album exploring themes of youth, rebellion, and intense emotion.", era: 'School Trilogy', cover_color: '#1F2937' },
    { id: 2, title: 'The Most Beautiful Moment in Life Pt.1', title_korean: '화양연화 pt.1', release_date: '2015-04-29', type: 'Mini', track_count: 9, description: 'The beginning of the HYYH era, capturing the beauty and pain of youth.', era: 'HYYH', cover_color: '#FEF3C7' },
    { id: 3, title: 'The Most Beautiful Moment in Life Pt.2', title_korean: '화양연화 pt.2', release_date: '2015-11-30', type: 'Mini', track_count: 9, description: 'Continuation of the HYYH narrative with "Run" and "Butterfly".', era: 'HYYH', cover_color: '#FDE68A' },
    { id: 4, title: 'The Most Beautiful Moment in Life: Young Forever', title_korean: '화양연화 Young Forever', release_date: '2016-05-02', type: 'Compilation', track_count: 23, description: 'Compilation album with new tracks "Fire" and "Save Me".', era: 'HYYH', cover_color: '#D1FAE5' },
    { id: 5, title: 'Wings', title_korean: null, release_date: '2016-10-10', type: 'Studio', track_count: 15, description: 'Inspired by Hermann Hesse\'s "Demian". Each member has a solo track.', era: 'Wings', cover_color: '#1E1B4B' },
    { id: 6, title: 'You Never Walk Alone', title_korean: null, release_date: '2017-02-13', type: 'Repackage', track_count: 18, description: 'Wings repackage with "Spring Day", one of the longest-charting K-pop songs.', era: 'Wings', cover_color: '#A7F3D0' },
    { id: 7, title: 'Love Yourself: Her', title_korean: null, release_date: '2017-09-18', type: 'Mini', track_count: 9, description: 'First Love Yourself album. "DNA" entered Billboard Hot 100.', era: 'Love Yourself', cover_color: '#F9A8D4' },
    { id: 8, title: 'Love Yourself: Tear', title_korean: null, release_date: '2018-05-18', type: 'Studio', track_count: 11, description: 'Explores the pain of love\'s end with "Fake Love".', era: 'Love Yourself', cover_color: '#4C1D95' },
    { id: 9, title: 'Love Yourself: Answer', title_korean: null, release_date: '2018-08-24', type: 'Compilation', track_count: 25, description: 'Self-love is the answer. Features "IDOL" and "Euphoria".', era: 'Love Yourself', cover_color: '#EC4899' },
    { id: 10, title: 'Map of the Soul: Persona', title_korean: null, release_date: '2019-04-12', type: 'Mini', track_count: 7, description: 'Based on Jungian psychology. "Boy With Luv" ft. Halsey.', era: 'Map of the Soul', cover_color: '#FDF4FF' },
    { id: 11, title: 'Map of the Soul: 7', title_korean: null, release_date: '2020-02-21', type: 'Studio', track_count: 20, description: 'Celebrates 7 years of BTS with shadow and ego explorations.', era: 'Map of the Soul', cover_color: '#C7D2FE' },
    { id: 12, title: 'BE', title_korean: null, release_date: '2020-11-20', type: 'Studio', track_count: 8, description: 'Created during the pandemic. "Life Goes On" offers comfort.', era: 'BE', cover_color: '#D1D5DB' },
    { id: 13, title: 'Butter', title_korean: null, release_date: '2021-07-09', type: 'Single', track_count: 3, description: 'Summer hits "Butter" and "Permission to Dance".', era: 'Butter', cover_color: '#FEF08A' },
    { id: 14, title: 'Proof', title_korean: null, release_date: '2022-06-10', type: 'Compilation', track_count: 48, description: 'Anthology for 9th anniversary before the hiatus.', era: 'Proof', cover_color: '#020617' },
    { id: 15, title: 'Take Two', title_korean: null, release_date: '2023-06-09', type: 'Single', track_count: 1, description: '10th anniversary FESTA single thanking ARMY.', era: 'Chapter 2', cover_color: '#A855F7' }
];

// ==================== MEMBER DATA (7 members) ====================
const MEMBERS = [
    { id: 'rm', stage_name: 'RM', full_name: 'Kim Namjoon', color: '#2563EB', role: 'Leader / Main Rapper / Producer', mic_color: 'Blue', komca_credits: 227, bio: 'The philosophical leader and main rapper of BTS.', birth_date: '1994-09-12', birth_place: 'Ilsan, Goyang, South Korea', height: '181 cm', mbti: 'ENFP', zodiac: 'Virgo', instagram: '@rkive', solo_tracks: ['Wild Flower', 'Still Life', 'Yun'], achievements: ['UN General Assembly Speaker'], featured_tracks: ['Seoul Town Road with Lil Nas X'], producer_credits: 175, writer_credits: 218 },
    { id: 'jin', stage_name: 'JIN', full_name: 'Kim Seokjin', color: '#EC4899', role: 'Sub Vocalist / Visual', mic_color: 'Pink', komca_credits: 35, bio: 'Known as "Worldwide Handsome," Jin has powerful tenor vocals.', birth_date: '1992-12-04', birth_place: 'Gwacheon, Gyeonggi-do, South Korea', height: '179 cm', mbti: 'INTP', zodiac: 'Sagittarius', instagram: '@jin', solo_tracks: ['The Astronaut', 'Epiphany', 'Awake'], achievements: ['Order of Cultural Merit (2018)'], featured_tracks: ['Yours (Jirisan OST)'], producer_credits: 5, writer_credits: 35 },
    { id: 'suga', stage_name: 'SUGA', full_name: 'Min Yoongi', color: '#64748B', role: 'Lead Rapper / Producer', mic_color: 'Black', komca_credits: 177, bio: 'A prolific producer who goes by Agust D for solo work.', birth_date: '1993-03-09', birth_place: 'Daegu, South Korea', height: '174 cm', mbti: 'ISTP', zodiac: 'Pisces', instagram: '@agaboramyeonguhjji', solo_tracks: ['Daechwita', 'Haegeum', 'People'], achievements: ['D-DAY #1 on Billboard 200'], featured_tracks: ['Eight (IU)', 'That That (PSY)'], producer_credits: 150, writer_credits: 175 },
    { id: 'jh', stage_name: 'J-HOPE', full_name: 'Jung Hoseok', color: '#EF4444', role: 'Main Dancer / Sub Rapper', mic_color: 'Silver', komca_credits: 150, bio: 'Known as the group\'s "sunshine," J-Hope is the main dancer.', birth_date: '1994-02-18', birth_place: 'Gwangju, South Korea', height: '177 cm', mbti: 'INFJ', zodiac: 'Aquarius', instagram: '@uarmyhope', solo_tracks: ['Arson', 'MORE', 'Chicken Noodle Soup'], achievements: ['First Korean artist to headline Lollapalooza'], featured_tracks: ['On the Street (with J. Cole)'], producer_credits: 95, writer_credits: 145 },
    { id: 'jm', stage_name: 'JIMIN', full_name: 'Park Jimin', color: '#F59E0B', role: 'Lead Vocalist / Main Dancer', mic_color: 'Gold', komca_credits: 27, bio: 'Contemporary dancer who graduated top of his class.', birth_date: '1995-10-13', birth_place: 'Busan, South Korea', height: '174 cm', mbti: 'ESTP', zodiac: 'Libra', instagram: '@j.m', solo_tracks: ['Like Crazy', 'Set Me Free Pt.2', 'Who'], achievements: ['Billboard Hot 100 #1 (Like Crazy)'], featured_tracks: ['With You (Our Blues OST)'], producer_credits: 8, writer_credits: 25 },
    { id: 'v', stage_name: 'V', full_name: 'Kim Taehyung', color: '#22C55E', role: 'Sub Vocalist / Visual', mic_color: 'Green', komca_credits: 25, bio: 'Known for his deep baritone and artistic vision.', birth_date: '1995-12-30', birth_place: 'Daegu, South Korea', height: '179 cm', mbti: 'INFP', zodiac: 'Capricorn', instagram: '@thv', solo_tracks: ['Slow Dancing', 'Rainy Days', 'Love Me Again'], achievements: ['Sweet Night #1 in 117 countries'], featured_tracks: ['Christmas Tree (Our Beloved Summer OST)'], producer_credits: 5, writer_credits: 24 },
    { id: 'jk', stage_name: 'JK', full_name: 'Jeon Jungkook', color: '#8B5CF6', role: 'Main Vocalist / Lead Dancer / Center / Maknae', mic_color: 'Purple', komca_credits: 30, bio: 'The "Golden Maknae" with exceptional talent.', birth_date: '1997-09-01', birth_place: 'Busan, South Korea', height: '179 cm', mbti: 'INTP', zodiac: 'Virgo', instagram: '@jungkook.97', solo_tracks: ['Standing Next to You', 'Seven', '3D'], achievements: ['Seven - Most weeks at #1 on Billboard Global 200'], featured_tracks: ['Dreamers (FIFA World Cup 2022)'], producer_credits: 10, writer_credits: 28 }
];

// ==================== SONGS DATA (All 57 songs) ====================
const SONGS = [
    // Dark & Wild (2014)
    { id: 1, title: 'Danger', title_korean: '위험', album_id: 1, release_date: '2014-08-19', duration_seconds: 232, bpm: 184, energy: 0.89, valence: 0.45, danceability: 0.75, acousticness: 0.05, sentiment: 'Pain', keywords: ['danger', 'obsession', 'heart'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 2, title: 'War of Hormone', title_korean: '호르몬 전쟁', album_id: 1, release_date: '2014-08-19', duration_seconds: 229, bpm: 128, energy: 0.91, valence: 0.72, danceability: 0.82, acousticness: 0.02, sentiment: 'Celebration', keywords: ['hormones', 'youth', 'attraction'], writers: ['Pdogg', 'Supreme Boi', 'RM', 'SUGA'], producers: ['Pdogg'], member_credits: ['rm', 'suga'], is_title_track: false, has_mv: true },

    // HYYH Pt.1 (2015)
    { id: 3, title: 'I Need U', title_korean: null, album_id: 2, release_date: '2015-04-29', duration_seconds: 209, bpm: 128, energy: 0.73, valence: 0.35, danceability: 0.70, acousticness: 0.08, sentiment: 'Pain', keywords: ['need', 'pain', 'love'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 4, title: 'Dope', title_korean: '쩔어', album_id: 2, release_date: '2015-06-23', duration_seconds: 225, bpm: 168, energy: 0.95, valence: 0.75, danceability: 0.88, acousticness: 0.01, sentiment: 'Empowerment', keywords: ['success', 'hardwork', 'confidence'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 5, title: 'Hold Me Tight', title_korean: '잡아줘', album_id: 2, release_date: '2015-04-29', duration_seconds: 209, bpm: 96, energy: 0.52, valence: 0.42, danceability: 0.55, acousticness: 0.35, sentiment: 'Longing', keywords: ['hold', 'together', 'longing'], writers: ['RM', 'SUGA', 'j-hope', 'Pdogg'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },

    // HYYH Pt.2 (2015)
    { id: 6, title: 'Run', title_korean: null, album_id: 3, release_date: '2015-11-30', duration_seconds: 221, bpm: 127, energy: 0.85, valence: 0.55, danceability: 0.75, acousticness: 0.05, sentiment: 'Determination', keywords: ['run', 'youth', 'dreams'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 7, title: 'Butterfly', title_korean: null, album_id: 3, release_date: '2015-11-30', duration_seconds: 243, bpm: 81, energy: 0.45, valence: 0.28, danceability: 0.50, acousticness: 0.25, sentiment: 'Melancholy', keywords: ['butterfly', 'fragile', 'beautiful'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 8, title: 'Silver Spoon', title_korean: '뱁새', album_id: 3, release_date: '2015-11-30', duration_seconds: 216, bpm: 93, energy: 0.88, valence: 0.68, danceability: 0.85, acousticness: 0.02, sentiment: 'Rebellion', keywords: ['silver spoon', 'effort', 'society'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },

    // Young Forever (2016)
    { id: 9, title: 'Fire', title_korean: '불타오르네', album_id: 4, release_date: '2016-05-02', duration_seconds: 199, bpm: 107, energy: 0.96, valence: 0.80, danceability: 0.90, acousticness: 0.01, sentiment: 'Celebration', keywords: ['fire', 'burning', 'energy'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 10, title: 'Save Me', title_korean: null, album_id: 4, release_date: '2016-05-02', duration_seconds: 196, bpm: 110, energy: 0.72, valence: 0.42, danceability: 0.68, acousticness: 0.10, sentiment: 'Longing', keywords: ['save', 'darkness', 'help'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 11, title: 'Young Forever', title_korean: null, album_id: 4, release_date: '2016-05-02', duration_seconds: 276, bpm: 75, energy: 0.55, valence: 0.45, danceability: 0.45, acousticness: 0.40, sentiment: 'Hope', keywords: ['dreams', 'forever', 'youth'], writers: ['RM', 'SUGA', 'j-hope', 'Slow Rabbit'], producers: ['Slow Rabbit'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },

    // Wings (2016)
    { id: 12, title: 'Blood Sweat & Tears', title_korean: '피 땀 눈물', album_id: 5, release_date: '2016-10-10', duration_seconds: 217, bpm: 100, energy: 0.78, valence: 0.50, danceability: 0.72, acousticness: 0.08, sentiment: 'Pain', keywords: ['temptation', 'sin', 'desire'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 13, title: 'Boy Meets Evil', title_korean: null, album_id: 5, release_date: '2016-10-10', duration_seconds: 183, bpm: 132, energy: 0.82, valence: 0.35, danceability: 0.65, acousticness: 0.03, sentiment: 'Fear', keywords: ['evil', 'temptation', 'darkness'], writers: ['j-hope', 'Pdogg'], producers: ['Pdogg'], member_credits: ['jh'], is_title_track: false, has_mv: false },
    { id: 14, title: 'Stigma', title_korean: null, album_id: 5, release_date: '2016-10-10', duration_seconds: 224, bpm: 66, energy: 0.40, valence: 0.25, danceability: 0.45, acousticness: 0.55, sentiment: 'Pain', keywords: ['stigma', 'sin', 'forgiveness'], writers: ['V', 'Slow Rabbit', 'RM', 'SUGA', 'j-hope'], producers: ['Slow Rabbit'], member_credits: ['v', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 15, title: 'First Love', title_korean: null, album_id: 5, release_date: '2016-10-10', duration_seconds: 242, bpm: 80, energy: 0.52, valence: 0.35, danceability: 0.40, acousticness: 0.70, sentiment: 'Reflection', keywords: ['piano', 'mother', 'music'], writers: ['SUGA', 'Pdogg'], producers: ['SUGA', 'Pdogg'], member_credits: ['suga'], is_title_track: false, has_mv: false },

    // You Never Walk Alone (2017)
    { id: 16, title: 'Spring Day', title_korean: '봄날', album_id: 6, release_date: '2017-02-13', duration_seconds: 261, bpm: 107, energy: 0.50, valence: 0.35, danceability: 0.48, acousticness: 0.22, sentiment: 'Longing', keywords: ['spring', 'missing', 'friends'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 17, title: 'Not Today', title_korean: null, album_id: 6, release_date: '2017-02-13', duration_seconds: 223, bpm: 116, energy: 0.92, valence: 0.70, danceability: 0.80, acousticness: 0.02, sentiment: 'Determination', keywords: ['fight', 'today', 'together'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 18, title: 'A Supplementary Story: You Never Walk Alone', title_korean: null, album_id: 6, release_date: '2017-02-13', duration_seconds: 224, bpm: 85, energy: 0.55, valence: 0.60, danceability: 0.50, acousticness: 0.45, sentiment: 'Comfort', keywords: ['walk', 'together', 'ARMY'], writers: ['RM', 'SUGA', 'j-hope', 'Slow Rabbit'], producers: ['Slow Rabbit'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },

    // Love Yourself: Her (2017)
    { id: 19, title: 'DNA', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 223, bpm: 130, energy: 0.80, valence: 0.65, danceability: 0.78, acousticness: 0.05, sentiment: 'Love', keywords: ['DNA', 'destiny', 'fate'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 20, title: 'Best of Me', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 220, bpm: 100, energy: 0.75, valence: 0.72, danceability: 0.70, acousticness: 0.08, sentiment: 'Love', keywords: ['best', 'love', 'heart'], writers: ['The Chainsmokers', 'Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['The Chainsmokers', 'Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 21, title: 'MIC Drop', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 225, bpm: 130, energy: 0.88, valence: 0.58, danceability: 0.82, acousticness: 0.02, sentiment: 'Confidence', keywords: ['mic drop', 'success', 'swagger'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 22, title: 'Serendipity', title_korean: null, album_id: 7, release_date: '2017-09-18', duration_seconds: 215, bpm: 90, energy: 0.55, valence: 0.75, danceability: 0.65, acousticness: 0.35, sentiment: 'Love', keywords: ['serendipity', 'destiny', 'love'], writers: ['Slow Rabbit', 'RM', 'SUGA', 'j-hope', 'Jimin'], producers: ['Slow Rabbit'], member_credits: ['rm', 'suga', 'jh', 'jm'], is_title_track: false, has_mv: true },

    // Love Yourself: Tear (2018)
    { id: 23, title: 'Fake Love', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 243, bpm: 78, energy: 0.72, valence: 0.28, danceability: 0.68, acousticness: 0.12, sentiment: 'Pain', keywords: ['fake', 'love', 'lies'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 24, title: 'Singularity', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 208, bpm: 67, energy: 0.42, valence: 0.30, danceability: 0.55, acousticness: 0.45, sentiment: 'Melancholy', keywords: ['singularity', 'mask', 'voice'], writers: ['Charlie J. Perry', 'Slow Rabbit', 'RM', 'SUGA', 'j-hope', 'V'], producers: ['Slow Rabbit'], member_credits: ['rm', 'suga', 'jh', 'v'], is_title_track: false, has_mv: true },
    { id: 25, title: 'The Truth Untold', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 273, bpm: 71, energy: 0.35, valence: 0.20, danceability: 0.40, acousticness: 0.60, sentiment: 'Pain', keywords: ['truth', 'smeraldo', 'hide'], writers: ['Steve Aoki', 'Annika Wells', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 26, title: 'Anpanman', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 216, bpm: 130, energy: 0.92, valence: 0.82, danceability: 0.85, acousticness: 0.02, sentiment: 'Joy', keywords: ['hero', 'anpanman', 'together'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 27, title: 'Magic Shop', title_korean: null, album_id: 8, release_date: '2018-05-18', duration_seconds: 254, bpm: 78, energy: 0.62, valence: 0.55, danceability: 0.52, acousticness: 0.25, sentiment: 'Comfort', keywords: ['magic shop', 'healing', 'comfort'], writers: ['Jungkook', 'RM', 'SUGA', 'j-hope'], producers: ['Hiss noise', 'Pdogg'], member_credits: ['jk', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },

    // Love Yourself: Answer (2018)
    { id: 28, title: 'IDOL', title_korean: null, album_id: 9, release_date: '2018-08-24', duration_seconds: 220, bpm: 126, energy: 0.92, valence: 0.80, danceability: 0.88, acousticness: 0.01, sentiment: 'Celebration', keywords: ['idol', 'self-love', 'identity'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 29, title: 'Euphoria', title_korean: null, album_id: 9, release_date: '2018-08-24', duration_seconds: 223, bpm: 135, energy: 0.78, valence: 0.85, danceability: 0.72, acousticness: 0.08, sentiment: 'Joy', keywords: ['euphoria', 'dream', 'happiness'], writers: ['DJ Swivel', 'Supreme Boi', 'RM', 'SUGA', 'j-hope'], producers: ['DJ Swivel'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 30, title: 'Epiphany', title_korean: null, album_id: 9, release_date: '2018-08-24', duration_seconds: 239, bpm: 95, energy: 0.60, valence: 0.62, danceability: 0.50, acousticness: 0.40, sentiment: 'Empowerment', keywords: ['epiphany', 'self-love', 'realization'], writers: ['Slow Rabbit', 'RM', 'SUGA', 'j-hope', 'Adora'], producers: ['Slow Rabbit'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 31, title: 'Answer: Love Myself', title_korean: null, album_id: 9, release_date: '2018-08-24', duration_seconds: 253, bpm: 88, energy: 0.65, valence: 0.70, danceability: 0.55, acousticness: 0.30, sentiment: 'Empowerment', keywords: ['love myself', 'answer', 'embrace'], writers: ['RM', 'SUGA', 'j-hope', 'Pdogg'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },

    // Map of the Soul: Persona (2019)
    { id: 32, title: 'Boy With Luv', title_korean: '작은 것들을 위한 시', album_id: 10, release_date: '2019-04-12', duration_seconds: 229, bpm: 127, energy: 0.82, valence: 0.85, danceability: 0.80, acousticness: 0.05, sentiment: 'Love', keywords: ['boy with luv', 'small things', 'joy'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 33, title: 'Mikrokosmos', title_korean: null, album_id: 10, release_date: '2019-04-12', duration_seconds: 244, bpm: 120, energy: 0.75, valence: 0.68, danceability: 0.60, acousticness: 0.15, sentiment: 'Comfort', keywords: ['mikrokosmos', 'stars', 'universe'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 34, title: 'HOME', title_korean: null, album_id: 10, release_date: '2019-04-12', duration_seconds: 242, bpm: 95, energy: 0.70, valence: 0.72, danceability: 0.68, acousticness: 0.20, sentiment: 'Comfort', keywords: ['home', 'ARMY', 'belong'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 35, title: 'Persona', title_korean: null, album_id: 10, release_date: '2019-04-12', duration_seconds: 206, bpm: 130, energy: 0.90, valence: 0.62, danceability: 0.78, acousticness: 0.02, sentiment: 'Reflection', keywords: ['persona', 'identity', 'who am I'], writers: ['RM', 'Pdogg', 'Hiss noise'], producers: ['Pdogg'], member_credits: ['rm'], is_title_track: false, has_mv: true },

    // Map of the Soul: 7 (2020)
    { id: 36, title: 'ON', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 253, bpm: 106, energy: 0.88, valence: 0.55, danceability: 0.72, acousticness: 0.05, sentiment: 'Determination', keywords: ['on', 'bring the pain', 'fight'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 37, title: 'Black Swan', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 196, bpm: 93, energy: 0.65, valence: 0.22, danceability: 0.65, acousticness: 0.15, sentiment: 'Fear', keywords: ['black swan', 'death', 'art'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },
    { id: 38, title: 'Filter', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 206, bpm: 95, energy: 0.75, valence: 0.78, danceability: 0.82, acousticness: 0.08, sentiment: 'Confidence', keywords: ['filter', 'change', 'persona'], writers: ['SUGA', 'Slow Rabbit', 'RM', 'j-hope'], producers: ['Slow Rabbit', 'SUGA'], member_credits: ['suga', 'rm', 'jh'], is_title_track: false, has_mv: false },
    { id: 39, title: 'My Time', title_korean: '시차', album_id: 11, release_date: '2020-02-21', duration_seconds: 223, bpm: 98, energy: 0.68, valence: 0.55, danceability: 0.72, acousticness: 0.12, sentiment: 'Reflection', keywords: ['time', 'growing up', 'past'], writers: ['Jungkook', 'Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['jk', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 40, title: 'Louder than bombs', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 200, bpm: 128, energy: 0.70, valence: 0.40, danceability: 0.55, acousticness: 0.10, sentiment: 'Hope', keywords: ['louder', 'bombs', 'love'], writers: ['Troye Sivan', 'Leland', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 41, title: 'Inner Child', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 230, bpm: 90, energy: 0.55, valence: 0.65, danceability: 0.50, acousticness: 0.40, sentiment: 'Comfort', keywords: ['inner child', 'past', 'heal'], writers: ['V', 'Slow Rabbit', 'RM', 'SUGA', 'j-hope'], producers: ['Slow Rabbit'], member_credits: ['v', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 42, title: 'Friends', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 199, bpm: 100, energy: 0.75, valence: 0.82, danceability: 0.70, acousticness: 0.18, sentiment: 'Joy', keywords: ['friends', 'soulmate', '95 line'], writers: ['Jimin', 'V', 'Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['jm', 'v', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 43, title: 'Shadow', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 195, bpm: 140, energy: 0.82, valence: 0.35, danceability: 0.70, acousticness: 0.05, sentiment: 'Fear', keywords: ['shadow', 'fame', 'price'], writers: ['SUGA', 'Pdogg', 'RM', 'j-hope'], producers: ['SUGA', 'Pdogg'], member_credits: ['suga', 'rm', 'jh'], is_title_track: false, has_mv: true },
    { id: 44, title: 'Ego', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 193, bpm: 170, energy: 0.90, valence: 0.88, danceability: 0.85, acousticness: 0.02, sentiment: 'Joy', keywords: ['ego', 'trust', 'path'], writers: ['j-hope', 'Pdogg', 'RM', 'SUGA'], producers: ['Pdogg'], member_credits: ['jh', 'rm', 'suga'], is_title_track: false, has_mv: true },
    { id: 45, title: 'We are Bulletproof: the Eternal', title_korean: null, album_id: 11, release_date: '2020-02-21', duration_seconds: 245, bpm: 82, energy: 0.55, valence: 0.65, danceability: 0.45, acousticness: 0.35, sentiment: 'Gratitude', keywords: ['bulletproof', 'ARMY', 'eternal'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: true },

    // BE (2020)
    { id: 46, title: 'Life Goes On', title_korean: null, album_id: 12, release_date: '2020-11-20', duration_seconds: 207, bpm: 82, energy: 0.52, valence: 0.62, danceability: 0.55, acousticness: 0.45, sentiment: 'Comfort', keywords: ['life goes on', 'hope', 'tomorrow'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 47, title: 'Dynamite', title_korean: null, album_id: 12, release_date: '2020-08-21', duration_seconds: 199, bpm: 114, energy: 0.85, valence: 0.82, danceability: 0.80, acousticness: 0.05, sentiment: 'Joy', keywords: ['dynamite', 'disco', 'dance'], writers: ['David Stewart', 'Jessica Agombar'], producers: ['David Stewart'], member_credits: [], is_title_track: true, has_mv: true },
    { id: 48, title: 'Blue & Grey', title_korean: null, album_id: 12, release_date: '2020-11-20', duration_seconds: 254, bpm: 92, energy: 0.42, valence: 0.25, danceability: 0.45, acousticness: 0.55, sentiment: 'Melancholy', keywords: ['blue', 'grey', 'sadness'], writers: ['V', 'Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg', 'Hiss noise'], member_credits: ['v', 'rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 49, title: 'Stay', title_korean: null, album_id: 12, release_date: '2020-11-20', duration_seconds: 208, bpm: 105, energy: 0.78, valence: 0.70, danceability: 0.75, acousticness: 0.08, sentiment: 'Comfort', keywords: ['stay', 'together', 'ARMY'], writers: ['RM', 'Jungkook', 'Pdogg', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'jk', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 50, title: 'Telepathy', title_korean: '잠시', album_id: 12, release_date: '2020-11-20', duration_seconds: 202, bpm: 125, energy: 0.85, valence: 0.78, danceability: 0.82, acousticness: 0.05, sentiment: 'Joy', keywords: ['telepathy', 'retro', 'disco'], writers: ['SUGA', 'Pdogg', 'RM', 'j-hope'], producers: ['SUGA', 'Pdogg'], member_credits: ['suga', 'rm', 'jh'], is_title_track: false, has_mv: false },
    { id: 51, title: 'Dis-ease', title_korean: null, album_id: 12, release_date: '2020-11-20', duration_seconds: 218, bpm: 93, energy: 0.80, valence: 0.68, danceability: 0.75, acousticness: 0.08, sentiment: 'Reflection', keywords: ['disease', 'rest', 'work'], writers: ['j-hope', 'Pdogg', 'RM', 'SUGA'], producers: ['Pdogg'], member_credits: ['jh', 'rm', 'suga'], is_title_track: false, has_mv: false },

    // Butter (2021)
    { id: 52, title: 'Butter', title_korean: null, album_id: 13, release_date: '2021-05-21', duration_seconds: 165, bpm: 110, energy: 0.85, valence: 0.75, danceability: 0.82, acousticness: 0.03, sentiment: 'Confidence', keywords: ['butter', 'smooth', 'summer'], writers: ['Rob Grimaldi', 'Stephen Kirk', 'RM'], producers: ['Rob Grimaldi'], member_credits: ['rm'], is_title_track: true, has_mv: true },
    { id: 53, title: 'Permission to Dance', title_korean: null, album_id: 13, release_date: '2021-07-09', duration_seconds: 187, bpm: 125, energy: 0.82, valence: 0.88, danceability: 0.78, acousticness: 0.08, sentiment: 'Joy', keywords: ['permission', 'dance', 'freedom'], writers: ['Ed Sheeran', 'Steve Mac'], producers: ['Steve Mac'], member_credits: [], is_title_track: true, has_mv: true },

    // Proof (2022)
    { id: 54, title: 'Yet To Come', title_korean: null, album_id: 14, release_date: '2022-06-10', duration_seconds: 221, bpm: 80, energy: 0.55, valence: 0.60, danceability: 0.50, acousticness: 0.30, sentiment: 'Gratitude', keywords: ['yet to come', 'best', 'future'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: true },
    { id: 55, title: 'Run BTS', title_korean: null, album_id: 14, release_date: '2022-06-10', duration_seconds: 193, bpm: 145, energy: 0.95, valence: 0.65, danceability: 0.85, acousticness: 0.02, sentiment: 'Determination', keywords: ['run', 'BTS', 'bulletproof'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: false, has_mv: false },
    { id: 56, title: 'For Youth', title_korean: null, album_id: 14, release_date: '2022-06-10', duration_seconds: 286, bpm: 75, energy: 0.48, valence: 0.55, danceability: 0.42, acousticness: 0.45, sentiment: 'Gratitude', keywords: ['youth', 'ARMY', 'thank you'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope', 'Jungkook'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh', 'jk'], is_title_track: false, has_mv: false },

    // Take Two (2023)
    { id: 57, title: 'Take Two', title_korean: null, album_id: 15, release_date: '2023-06-09', duration_seconds: 212, bpm: 120, energy: 0.78, valence: 0.72, danceability: 0.68, acousticness: 0.15, sentiment: 'Gratitude', keywords: ['take two', 'new chapter', 'ARMY'], writers: ['Pdogg', 'RM', 'SUGA', 'j-hope'], producers: ['Pdogg'], member_credits: ['rm', 'suga', 'jh'], is_title_track: true, has_mv: false }
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
