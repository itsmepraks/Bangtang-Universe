PRAGMA foreign_keys = ON;

CREATE TABLE albums (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, title_korean TEXT, release_date TEXT NOT NULL,
  type TEXT, track_count INTEGER, description TEXT, era TEXT, cover_color TEXT, spotify_id TEXT UNIQUE,
  created_at TEXT, updated_at TEXT, cover_art_url TEXT, total_sales INTEGER, label TEXT
);
CREATE TABLE members (
  id TEXT PRIMARY KEY, stage_name TEXT NOT NULL, full_name TEXT, color TEXT, role TEXT, mic_color TEXT,
  komca_credits INTEGER, bio TEXT, birth_date TEXT, birth_place TEXT, height TEXT, mbti TEXT, zodiac TEXT,
  instagram TEXT, image_url TEXT, solo_tracks TEXT, achievements TEXT, featured_tracks TEXT,
  producer_credits INTEGER, writer_credits INTEGER, created_at TEXT, birth_name_ko TEXT, education TEXT,
  enlistment_start TEXT, enlistment_end TEXT, solo_debut_date TEXT, instagram_handle TEXT, bio_long TEXT
);
CREATE TABLE songs (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, title_korean TEXT, album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
  release_date TEXT, duration_seconds INTEGER, bpm INTEGER, energy REAL, valence REAL, danceability REAL,
  acousticness REAL, sentiment TEXT, keywords TEXT, writers TEXT, producers TEXT, member_credits TEXT,
  is_title_track INTEGER NOT NULL DEFAULT 0, has_mv INTEGER NOT NULL DEFAULT 0, spotify_id TEXT UNIQUE,
  created_at TEXT, lyrics_ko TEXT, lyrics_en TEXT, lyrics_romanized TEXT, music_video_url TEXT,
  is_solo INTEGER DEFAULT 0, is_collab INTEGER DEFAULT 0, featured_members TEXT
);
CREATE TABLE solo_albums (
  id INTEGER PRIMARY KEY, member_id TEXT REFERENCES members(id) ON DELETE CASCADE, title TEXT NOT NULL,
  release_date TEXT, type TEXT, tracks TEXT, created_at TEXT
);
CREATE TABLE lyrics (
  id INTEGER PRIMARY KEY, song_id INTEGER UNIQUE REFERENCES songs(id) ON DELETE CASCADE,
  lyrics_korean TEXT, lyrics_english TEXT, lyrics_romanized TEXT, genius_url TEXT,
  sentiment_score REAL, themes TEXT, created_at TEXT
);
CREATE TABLE awards (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, ceremony TEXT NOT NULL, year INTEGER NOT NULL,
  category TEXT, result TEXT NOT NULL, scope TEXT DEFAULT 'group', member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  work_title TEXT, created_at TEXT
);
CREATE TABLE chart_entries (
  id INTEGER PRIMARY KEY, song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL,
  album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL, chart_name TEXT NOT NULL,
  peak_position INTEGER NOT NULL, weeks_on_chart INTEGER, entry_date TEXT, certification TEXT,
  region TEXT DEFAULT 'US', created_at TEXT
);
CREATE TABLE concerts (
  id INTEGER PRIMARY KEY, tour_name TEXT NOT NULL, venue TEXT NOT NULL, city TEXT NOT NULL,
  country TEXT NOT NULL, date TEXT NOT NULL, attendance INTEGER, setlist TEXT, notes TEXT, created_at TEXT
);
CREATE TABLE collaborations (
  id INTEGER PRIMARY KEY, song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL, title TEXT NOT NULL,
  artist TEXT NOT NULL, member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  type TEXT NOT NULL, release_date TEXT, created_at TEXT
);
CREATE TABLE member_events (
  id INTEGER PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, title TEXT NOT NULL, date TEXT NOT NULL, description TEXT, source_url TEXT, created_at TEXT
);
CREATE TABLE media (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, release_date TEXT, platform TEXT,
  seasons INTEGER DEFAULT 1, episodes INTEGER, scope TEXT DEFAULT 'group', member_ids TEXT, description TEXT, created_at TEXT
);

CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX idx_albums_release_date ON albums(release_date);
CREATE INDEX idx_songs_release_date ON songs(release_date);
CREATE INDEX idx_solo_albums_member ON solo_albums(member_id);
CREATE INDEX idx_lyrics_song ON lyrics(song_id);
CREATE INDEX idx_awards_year ON awards(year);
CREATE INDEX idx_awards_member ON awards(member_id);
CREATE INDEX idx_chart_entries_peak ON chart_entries(peak_position);
CREATE INDEX idx_concerts_date ON concerts(date);
CREATE INDEX idx_collaborations_member ON collaborations(member_id);
CREATE INDEX idx_member_events_member ON member_events(member_id);
CREATE INDEX idx_media_release ON media(release_date);
