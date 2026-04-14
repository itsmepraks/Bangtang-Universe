/**
 * Bridge solo_albums data into the main albums + songs tables.
 *
 * - Creates album entries in `albums` for each solo album (era = "Solo")
 * - Inserts tracks into `songs` with is_solo = true + featured_members
 * - Also flags group songs containing "feat." as is_collab = true
 *
 * Usage:
 *   npx tsx scripts/bridge-solo-albums.ts              # dry run
 *   npx tsx scripts/bridge-solo-albums.ts --commit      # write to DB
 */

import {
  createSupabaseAdmin,
  logStart,
  logSuccess,
  logError,
  logWarning,
  logDone,
} from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const COMMIT = process.argv.includes('--commit');

const MEMBER_MAP: Record<string, string> = {
  rm: 'RM',
  jin: 'Jin',
  suga: 'SUGA',
  jh: 'j-hope',
  jm: 'Jimin',
  v: 'V',
  jk: 'Jung Kook',
};

const MEMBER_COLORS: Record<string, string> = {
  rm: '#4A90D9',
  jin: '#F5A9B8',
  suga: '#1A1A2E',
  jh: '#FF6B35',
  jm: '#FFD700',
  v: '#228B22',
  jk: '#9B59B6',
};

async function main() {
  logStart(`Bridging solo albums ${COMMIT ? '(COMMIT)' : '(dry run)'}`);

  // Load solo albums
  const { data: soloAlbums, error: saErr } = await supabase
    .from('solo_albums')
    .select('*')
    .order('release_date');
  if (saErr || !soloAlbums) { logError(saErr?.message ?? 'no data'); process.exit(1); }
  logSuccess(`Found ${soloAlbums.length} solo albums`);

  // Load existing albums to avoid duplicates
  const { data: existingAlbums } = await supabase.from('albums').select('id, title').order('id');
  const existingTitles = new Set((existingAlbums ?? []).map(a => (a.title as string).toLowerCase()));

  // Load existing songs to avoid duplicates
  const { data: existingSongs } = await supabase.from('songs').select('id, title, album_id');
  const existingSongKeys = new Set(
    (existingSongs ?? []).map(s => `${s.title?.toLowerCase()}|${s.album_id}`)
  );

  let albumsInserted = 0;
  let songsInserted = 0;
  let skipped = 0;

  for (const sa of soloAlbums) {
    const memberName = MEMBER_MAP[sa.member_id] ?? sa.member_id;
    const albumTitle = `${sa.title} (${memberName})`;
    const tracks: string[] = Array.isArray(sa.tracks) ? sa.tracks : [];

    console.log(`\n   📀 ${albumTitle} — ${tracks.length} tracks`);

    // Skip if already in albums table
    if (existingTitles.has(albumTitle.toLowerCase()) || existingTitles.has(sa.title.toLowerCase())) {
      logWarning(`Album already exists, skipping`);
      skipped++;
      continue;
    }

    let albumId: number | null = null;

    if (COMMIT) {
      // Insert album
      const { data: insertedAlbum, error: aErr } = await supabase
        .from('albums')
        .insert({
          title: albumTitle,
          release_date: sa.release_date,
          type: sa.type === 'Mixtape' ? 'Studio' : (sa.type || 'Studio'),
          track_count: tracks.length,
          era: 'Solo',
          cover_color: MEMBER_COLORS[sa.member_id] || '#A855F7',
          description: `${memberName}'s solo ${(sa.type || 'album').toLowerCase()}: ${sa.title}`,
        })
        .select('id')
        .single();

      if (aErr) {
        logError(`Album insert: ${aErr.message}`);
        continue;
      }
      albumId = insertedAlbum.id;
      albumsInserted++;
      logSuccess(`Album inserted [${albumId}]`);
    } else {
      albumsInserted++;
      logSuccess(`Would insert album: ${albumTitle}`);
    }

    // Insert tracks
    for (const trackTitle of tracks) {
      const songKey = `${trackTitle.toLowerCase()}|${albumId}`;
      if (existingSongKeys.has(songKey)) {
        continue;
      }

      if (COMMIT && albumId) {
        const { error: sErr } = await supabase.from('songs').insert({
          title: trackTitle,
          album_id: albumId,
          release_date: sa.release_date,
          is_solo: true,
          is_title_track: false,
          has_mv: false,
          featured_members: [memberName],
          member_credits: [memberName],
        });
        if (sErr) {
          logError(`Song "${trackTitle}": ${sErr.message}`);
          continue;
        }
      }
      songsInserted++;
    }
    logSuccess(`${tracks.length} tracks processed`);
  }

  // ── Also flag "feat." songs in main catalog as collab ──
  console.log(`\n   🤝 Flagging "feat." songs as collaborations...`);
  const { data: featSongs } = await supabase
    .from('songs')
    .select('id, title, is_collab')
    .or('title.ilike.%feat.%,title.ilike.%feat %')
    .eq('is_collab', false);

  let collabFlagged = 0;
  for (const song of featSongs ?? []) {
    if (COMMIT) {
      await supabase.from('songs').update({ is_collab: true }).eq('id', song.id);
    }
    collabFlagged++;
    console.log(`   collab  ${song.title}`);
  }

  console.log(`\n📊 Summary`);
  console.log(`   Solo albums inserted:  ${albumsInserted}`);
  console.log(`   Solo songs inserted:   ${songsInserted}`);
  console.log(`   Skipped (existing):    ${skipped}`);
  console.log(`   Collab songs flagged:  ${collabFlagged}`);
  if (!COMMIT) console.log(`\n   ⚠️  Dry run — re-run with --commit to write.`);
  logDone('Solo albums bridged');
}

main().catch(console.error);
