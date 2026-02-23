-- ============================================================================
-- BTS Universe Database Schema
-- ============================================================================
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ALBUMS TABLE ====================
CREATE TABLE IF NOT EXISTS albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_korean VARCHAR(255),
    release_date DATE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Studio', 'Mini', 'Compilation', 'Single', 'Repackage')),
    track_count INTEGER,
    description TEXT,
    era VARCHAR(100),
    cover_color VARCHAR(20),
    spotify_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SONGS TABLE ====================
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_korean VARCHAR(255),
    album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
    release_date DATE,
    duration_seconds INTEGER,
    bpm INTEGER,
    energy DECIMAL(3,2),
    valence DECIMAL(3,2),
    danceability DECIMAL(3,2),
    acousticness DECIMAL(3,2),
    sentiment VARCHAR(50),
    keywords TEXT[],
    writers TEXT[],
    producers TEXT[],
    member_credits TEXT[],
    is_title_track BOOLEAN DEFAULT FALSE,
    has_mv BOOLEAN DEFAULT FALSE,
    spotify_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MEMBERS TABLE ====================
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(10) PRIMARY KEY,
    stage_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100),
    color VARCHAR(20),
    role TEXT,
    mic_color VARCHAR(50),
    komca_credits INTEGER DEFAULT 0,
    bio TEXT,
    birth_date DATE,
    birth_place VARCHAR(255),
    height VARCHAR(20),
    mbti VARCHAR(10),
    zodiac VARCHAR(50),
    instagram VARCHAR(100),
    image_url TEXT,
    solo_tracks TEXT[],
    achievements TEXT[],
    featured_tracks TEXT[],
    producer_credits INTEGER DEFAULT 0,
    writer_credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SOLO ALBUMS TABLE ====================
CREATE TABLE IF NOT EXISTS solo_albums (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    release_date DATE,
    type VARCHAR(50) CHECK (type IN ('Studio', 'Mixtape', 'EP', 'Single')),
    tracks TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== LYRICS TABLE (for AI analysis) ====================
CREATE TABLE IF NOT EXISTS lyrics (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE UNIQUE,
    lyrics_korean TEXT,
    lyrics_english TEXT,
    lyrics_romanized TEXT,
    genius_url TEXT,
    sentiment_score DECIMAL(3,2),
    themes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== AWARDS TABLE ====================
CREATE TABLE IF NOT EXISTS awards (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ceremony TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT,
    result TEXT CHECK (result IN ('won', 'nominated')) NOT NULL,
    scope TEXT CHECK (scope IN ('group', 'solo', 'unit')) DEFAULT 'group',
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE SET NULL,
    work_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CHART ENTRIES TABLE ====================
CREATE TABLE IF NOT EXISTS chart_entries (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL,
    album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
    chart_name TEXT NOT NULL,
    peak_position INTEGER NOT NULL,
    weeks_on_chart INTEGER,
    entry_date DATE,
    certification TEXT,
    region TEXT DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== CONCERTS TABLE ====================
CREATE TABLE IF NOT EXISTS concerts (
    id SERIAL PRIMARY KEY,
    tour_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    date DATE NOT NULL,
    attendance INTEGER,
    setlist JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COLLABORATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS collaborations (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('feature', 'production', 'remix', 'ost')) NOT NULL,
    release_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MEMBER EVENTS TABLE ====================
CREATE TABLE IF NOT EXISTS member_events (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(10) REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_songs_sentiment ON songs(sentiment);
CREATE INDEX IF NOT EXISTS idx_songs_era ON songs(release_date);
CREATE INDEX IF NOT EXISTS idx_albums_era ON albums(era);
CREATE INDEX IF NOT EXISTS idx_solo_albums_member ON solo_albums(member_id);
CREATE INDEX IF NOT EXISTS idx_awards_ceremony ON awards(ceremony);
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
CREATE INDEX IF NOT EXISTS idx_awards_member ON awards(member_id);
CREATE INDEX IF NOT EXISTS idx_chart_entries_chart ON chart_entries(chart_name);
CREATE INDEX IF NOT EXISTS idx_chart_entries_song ON chart_entries(song_id);
CREATE INDEX IF NOT EXISTS idx_concerts_tour ON concerts(tour_name);
CREATE INDEX IF NOT EXISTS idx_concerts_date ON concerts(date);
CREATE INDEX IF NOT EXISTS idx_collaborations_member ON collaborations(member_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_artist ON collaborations(artist);
CREATE INDEX IF NOT EXISTS idx_member_events_member ON member_events(member_id);
CREATE INDEX IF NOT EXISTS idx_member_events_type ON member_events(event_type);

-- ==================== ROW LEVEL SECURITY ====================
-- Enable RLS on all tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE solo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key can read)
CREATE POLICY "Allow public read access on albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Allow public read access on songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public read access on members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on solo_albums" ON solo_albums FOR SELECT USING (true);
CREATE POLICY "Allow public read access on lyrics" ON lyrics FOR SELECT USING (true);
CREATE POLICY "Allow public read on awards" ON awards FOR SELECT USING (true);
CREATE POLICY "Allow public read on chart_entries" ON chart_entries FOR SELECT USING (true);
CREATE POLICY "Allow public read on concerts" ON concerts FOR SELECT USING (true);
CREATE POLICY "Allow public read on collaborations" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Allow public read on member_events" ON member_events FOR SELECT USING (true);

-- ==================== UPDATED_AT TRIGGER ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- Schema created successfully! 💜
-- ============================================================================
