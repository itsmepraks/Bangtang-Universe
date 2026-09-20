export const CATALOG_TABLES = {
  albums: {
    columns: ['id', 'title', 'title_korean', 'release_date', 'type', 'track_count', 'description', 'era', 'cover_color', 'spotify_id', 'created_at', 'updated_at', 'cover_art_url', 'total_sales', 'label'],
    orderBy: 'release_date ASC NULLS LAST, id ASC',
    jsonColumns: [], booleanColumns: [],
  },
  songs: {
    columns: ['id', 'title', 'title_korean', 'album_id', 'release_date', 'duration_seconds', 'bpm', 'energy', 'valence', 'danceability', 'acousticness', 'sentiment', 'keywords', 'writers', 'producers', 'member_credits', 'is_title_track', 'has_mv', 'spotify_id', 'created_at', 'lyrics_ko', 'lyrics_en', 'lyrics_romanized', 'music_video_url', 'is_solo', 'is_collab', 'featured_members'],
    orderBy: 'release_date ASC NULLS LAST, id ASC',
    jsonColumns: ['keywords', 'writers', 'producers', 'member_credits', 'featured_members'],
    booleanColumns: ['is_title_track', 'has_mv', 'is_solo', 'is_collab'],
  },
  members: {
    columns: ['id', 'stage_name', 'full_name', 'color', 'role', 'mic_color', 'komca_credits', 'bio', 'birth_date', 'birth_place', 'height', 'mbti', 'zodiac', 'instagram', 'image_url', 'solo_tracks', 'achievements', 'featured_tracks', 'producer_credits', 'writer_credits', 'created_at', 'birth_name_ko', 'education', 'enlistment_start', 'enlistment_end', 'solo_debut_date', 'instagram_handle', 'bio_long'],
    orderBy: 'komca_credits DESC NULLS FIRST, id ASC',
    jsonColumns: ['solo_tracks', 'achievements', 'featured_tracks'], booleanColumns: [],
  },
  solo_albums: {
    columns: ['id', 'member_id', 'title', 'release_date', 'type', 'tracks', 'created_at'],
    orderBy: 'release_date ASC NULLS LAST, id ASC', jsonColumns: ['tracks'], booleanColumns: [],
  },
  lyrics: {
    columns: ['id', 'song_id', 'lyrics_korean', 'lyrics_english', 'lyrics_romanized', 'genius_url', 'sentiment_score', 'themes', 'created_at'],
    orderBy: 'song_id ASC NULLS LAST, id ASC', jsonColumns: ['themes'], booleanColumns: [],
  },
  awards: {
    columns: ['id', 'name', 'ceremony', 'year', 'category', 'result', 'scope', 'member_id', 'work_title', 'created_at'],
    orderBy: 'year DESC NULLS FIRST, id ASC', jsonColumns: [], booleanColumns: [],
  },
  chart_entries: {
    columns: ['id', 'song_id', 'album_id', 'chart_name', 'peak_position', 'weeks_on_chart', 'entry_date', 'certification', 'region', 'created_at'],
    orderBy: 'peak_position ASC NULLS LAST, id ASC', jsonColumns: [], booleanColumns: [],
  },
  concerts: {
    columns: ['id', 'tour_name', 'venue', 'city', 'country', 'date', 'attendance', 'setlist', 'notes', 'created_at'],
    orderBy: 'date DESC NULLS FIRST, id ASC', jsonColumns: ['setlist'], booleanColumns: [],
  },
  collaborations: {
    columns: ['id', 'song_id', 'title', 'artist', 'member_id', 'type', 'release_date', 'created_at'],
    orderBy: 'release_date DESC NULLS FIRST, id ASC', jsonColumns: [], booleanColumns: [],
  },
  member_events: {
    columns: ['id', 'member_id', 'event_type', 'title', 'date', 'description', 'source_url', 'created_at'],
    orderBy: 'date DESC NULLS FIRST, id ASC', jsonColumns: [], booleanColumns: [],
  },
  media: {
    columns: ['id', 'title', 'type', 'release_date', 'platform', 'seasons', 'episodes', 'scope', 'member_ids', 'description', 'created_at'],
    orderBy: 'release_date DESC NULLS FIRST, id ASC', jsonColumns: ['member_ids'], booleanColumns: [],
  },
} as const;

export type CatalogTable = keyof typeof CATALOG_TABLES;

export function isCatalogTable(value: string): value is CatalogTable {
  return Object.prototype.hasOwnProperty.call(CATALOG_TABLES, value);
}
