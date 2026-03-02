/**
 * Supabase Full-Text Search Service
 *
 * Uses Postgres ilike for server-side search across songs, albums, members,
 * awards, and concerts. No extra API keys needed — uses your existing Supabase.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Song, Member, Album, Award, Concert } from '../types/database';
import type { SearchResult } from './searchService';
import { mapSongResult, mapAlbumResult, mapMemberResult, mapAwardResult, mapConcertResult } from './searchService';
import type { FuseResult } from 'fuse.js';

/** Build ilike pattern for partial match (PostgREST uses * as % alias) */
function ilikePattern(term: string): string {
  return `*${term.trim()}*`;
}

/**
 * Search all tables in Supabase using ilike.
 * Returns combined, ranked results in SearchResult format.
 */
export async function searchWithSupabase(query: string, limit = 15): Promise<SearchResult[]> {
  if (!isSupabaseConfigured() || !query.trim()) return [];

  const pattern = ilikePattern(query.trim());
  const results: SearchResult[] = [];

  try {
    const [songsRes, albumsRes, membersRes, awardsRes, concertsRes] = await Promise.all([
      supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.${pattern},title_korean.ilike.${pattern},sentiment.ilike.${pattern}`)
        .limit(limit),
      supabase
        .from('albums')
        .select('*')
        .or(`title.ilike.${pattern},title_korean.ilike.${pattern},description.ilike.${pattern},era.ilike.${pattern}`)
        .limit(limit),
      supabase
        .from('members')
        .select('*')
        .or(`stage_name.ilike.${pattern},full_name.ilike.${pattern},role.ilike.${pattern},bio.ilike.${pattern}`)
        .limit(limit),
      supabase
        .from('awards')
        .select('*')
        .or(`name.ilike.${pattern},ceremony.ilike.${pattern},category.ilike.${pattern},work_title.ilike.${pattern}`)
        .limit(limit),
      supabase
        .from('concerts')
        .select('*')
        .or(`tour_name.ilike.${pattern},venue.ilike.${pattern},city.ilike.${pattern},country.ilike.${pattern}`)
        .limit(limit),
    ]);

    const songs = (songsRes.data ?? []) as Song[];
    const albums = (albumsRes.data ?? []) as Album[];
    const members = (membersRes.data ?? []) as Member[];
    const awards = (awardsRes.data ?? []) as Award[];
    const concerts = (concertsRes.data ?? []) as Concert[];

    songs.forEach((s) => results.push(mapSongResult({ item: s, score: 0.3, refIndex: 0 } as FuseResult<Song>)));
    members.forEach((m) => results.push(mapMemberResult({ item: m, score: 0.3, refIndex: 0 } as FuseResult<Member>)));
    albums.forEach((a) => results.push(mapAlbumResult({ item: a, score: 0.3, refIndex: 0 } as FuseResult<Album>)));
    awards.forEach((a) => results.push(mapAwardResult({ item: a, score: 0.3, refIndex: 0 } as FuseResult<Award>)));
    concerts.forEach((c) => results.push(mapConcertResult({ item: c, score: 0.3, refIndex: 0 } as FuseResult<Concert>)));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch {
    return [];
  }
}
