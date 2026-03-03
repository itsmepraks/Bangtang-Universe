-- Media table for documentaries, concert films, variety shows, and reality shows
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('documentary', 'concert_film', 'variety', 'docu_series', 'reality')) NOT NULL,
    release_date DATE,
    platform TEXT,
    seasons INTEGER DEFAULT 1,
    episodes INTEGER,
    scope TEXT CHECK (scope IN ('group', 'solo', 'unit')) DEFAULT 'group',
    member_ids TEXT[],
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_scope ON media(scope);
CREATE INDEX IF NOT EXISTS idx_media_release ON media(release_date);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on media" ON media FOR SELECT USING (true);
