/**
 * Backfill is_solo and is_collab flags on songs.
 *
 * Logic:
 * - is_solo = true if:
 *   - Album title contains a single member name pattern (e.g. "SWIM with Jimin")
 *   - OR song.featured_members has exactly 1 member
 *   - OR album is in the solo_albums table
 * - is_collab = true if:
 *   - Song title or album title contains "feat." / "with" + external artist
 *   - OR song.featured_members contains non-BTS names
 *
 * Usage:
 *   npx tsx scripts/backfill-solo-collab.ts          # dry run
 *   npx tsx scripts/backfill-solo-collab.ts --commit  # write to DB
 */

import { createSupabaseAdmin, logStart, logSuccess, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const COMMIT = process.argv.includes('--commit');

const BTS_MEMBERS = ['RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jung Kook', 'Jungkook', 'Agust D', 'j‐hope'];

// Known external collaborators (not BTS members)
const COLLAB_PATTERNS = [
  'Steve Aoki', 'Halsey', 'Nicki Minaj', 'Sia', 'Lauv', 'Zara Larsson',
  'Juice WRLD', 'Charli XCX', 'Coldplay', 'Megan Thee Stallion',
  'Ed Sheeran', 'Snoop Dogg', 'Anderson .Paak', 'benny blanco',
  'David Guetta', 'Galantis', 'Slushii', 'W+W', 'Cheat Codes',
];

// Solo album title patterns
const SOLO_ALBUM_PATTERNS = BTS_MEMBERS.map(m => `with ${m}`);

async function main() {
  logStart(`Backfilling solo/collab flags ${COMMIT ? '(COMMIT)' : '(dry run)'}`);

  // Get all songs with their album titles
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, album_id, featured_members, is_solo, is_collab');
  if (error || !songs) { console.error(error); process.exit(1); }

  const { data: albums } = await supabase.from('albums').select('id, title');
  const albumMap = new Map((albums ?? []).map(a => [a.id, a.title as string]));

  // Also get solo_albums table
  const { data: soloAlbums } = await supabase.from('solo_albums').select('id, title, member_id');
  const soloAlbumTitles = new Set((soloAlbums ?? []).map(a => (a.title as string).toLowerCase()));

  let soloCount = 0;
  let collabCount = 0;

  for (const song of songs) {
    const albumTitle = song.album_id ? (albumMap.get(song.album_id) ?? '') : '';
    const combined = `${song.title} ${albumTitle}`.toLowerCase();
    let isSolo = false;
    let isCollab = false;

    // Check if album is a solo album
    if (soloAlbumTitles.has(albumTitle.toLowerCase())) {
      isSolo = true;
    }

    // Check for "with <member>" pattern in album title (e.g. "SWIM with Jimin")
    for (const pattern of SOLO_ALBUM_PATTERNS) {
      if (albumTitle.toLowerCase().includes(pattern.toLowerCase())) {
        isSolo = true;
        break;
      }
    }

    // Check for single featured member
    if (song.featured_members?.length === 1) {
      const member = song.featured_members[0];
      if (BTS_MEMBERS.some(m => member.toLowerCase().includes(m.toLowerCase()))) {
        isSolo = true;
      }
    }

    // Check for collab patterns
    for (const artist of COLLAB_PATTERNS) {
      if (combined.includes(artist.toLowerCase())) {
        isCollab = true;
        break;
      }
    }

    // Skip if no change needed
    if (!isSolo && !isCollab) continue;
    if (song.is_solo === isSolo && song.is_collab === isCollab) continue;

    const updates: Record<string, boolean> = {};
    if (isSolo && !song.is_solo) updates.is_solo = true;
    if (isCollab && !song.is_collab) updates.is_collab = true;
    if (Object.keys(updates).length === 0) continue;

    if (isSolo) soloCount++;
    if (isCollab) collabCount++;

    const flags = [isSolo && 'solo', isCollab && 'collab'].filter(Boolean).join('+');
    console.log(`   ${flags.padEnd(12)} ${song.title} (${albumTitle})`);

    if (COMMIT) {
      await supabase.from('songs').update(updates).eq('id', song.id);
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   Solo:   ${soloCount}`);
  console.log(`   Collab: ${collabCount}`);
  if (!COMMIT) console.log(`\n   ⚠️  Dry run — re-run with --commit to write.`);
  logDone('Solo/collab flags set');
}

main().catch(console.error);
