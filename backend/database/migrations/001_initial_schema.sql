-- Initial database schema migration
-- Creates Songs and AudioFeatures tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Songs table
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_kr VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    album_name VARCHAR(255) NOT NULL,
    lyrics_original TEXT NOT NULL,
    lyrics_translation TEXT NOT NULL,
    primary_topic VARCHAR(100),
    sonic_cluster_id VARCHAR(50),
    sonic_cluster_label VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AudioFeatures table
CREATE TABLE IF NOT EXISTS audio_features (
    song_id UUID PRIMARY KEY,
    danceability FLOAT NOT NULL,
    energy FLOAT NOT NULL,
    valence FLOAT NOT NULL,
    tempo FLOAT NOT NULL,
    acousticness FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_title_en ON songs(title_en);
CREATE INDEX IF NOT EXISTS idx_songs_release_date ON songs(release_date);
CREATE INDEX IF NOT EXISTS idx_songs_album_name ON songs(album_name);
CREATE INDEX IF NOT EXISTS idx_songs_album_date ON songs(album_name, release_date);
CREATE INDEX IF NOT EXISTS idx_songs_primary_topic ON songs(primary_topic);
CREATE INDEX IF NOT EXISTS idx_songs_sonic_cluster_id ON songs(sonic_cluster_id);

-- Add comments for documentation
COMMENT ON TABLE songs IS 'Stores BTS song information including lyrics in Korean and English';
COMMENT ON TABLE audio_features IS 'Stores Spotify audio analysis features for each song';
COMMENT ON COLUMN songs.primary_topic IS 'Topic assigned by NLP analysis (Phase 2)';
COMMENT ON COLUMN songs.sonic_cluster_id IS 'Audio cluster ID from K-Means clustering (Phase 2)';
COMMENT ON COLUMN songs.sonic_cluster_label IS 'Human-readable label for audio cluster (Phase 2)';


