-- BTS Wiki Expansion Migration
-- Run in Supabase SQL Editor

-- ==================== NEW TABLES ====================

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

-- ==================== NEW COLUMNS ON EXISTING TABLES ====================

-- songs: lyrics + solo/collab flags
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_ko TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_en TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics_romanized TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS music_video_url TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS is_solo BOOLEAN DEFAULT FALSE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS is_collab BOOLEAN DEFAULT FALSE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS featured_members TEXT[];

-- members: extended bio
ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_name_ko TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enlistment_start DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enlistment_end DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS solo_debut_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bio_long TEXT;

-- albums: cover art + sales
ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_art_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS total_sales BIGINT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS label TEXT;

-- ==================== INDEXES ====================

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

ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on awards" ON awards FOR SELECT USING (true);
CREATE POLICY "Allow public read on chart_entries" ON chart_entries FOR SELECT USING (true);
CREATE POLICY "Allow public read on concerts" ON concerts FOR SELECT USING (true);
CREATE POLICY "Allow public read on collaborations" ON collaborations FOR SELECT USING (true);
CREATE POLICY "Allow public read on member_events" ON member_events FOR SELECT USING (true);
