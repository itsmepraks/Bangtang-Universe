"""
Database models for the BTS Universe application.
Defines the Songs and AudioFeatures tables.
"""
import uuid
from datetime import date
from sqlalchemy import Column, String, Text, Date, Float, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Song(Base):
    """
    Songs table - stores BTS song information including lyrics.
    
    Fields:
        id: UUID primary key
        title_en: English title
        title_kr: Korean title (original)
        release_date: Song release date
        album_name: Name of the album
        lyrics_original: Original Korean lyrics
        lyrics_translation: English translation of lyrics
        primary_topic: Topic assigned by NLP analysis (added in Phase 2)
        sonic_cluster_id: Audio cluster ID (added in Phase 2)
        sonic_cluster_label: Human-readable cluster label (added in Phase 2)
    """
    __tablename__ = "songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    title_en = Column(String(255), nullable=False, index=True)
    title_kr = Column(String(255), nullable=False)
    release_date = Column(Date, nullable=False, index=True)
    album_name = Column(String(255), nullable=False, index=True)
    lyrics_original = Column(Text, nullable=False)
    lyrics_translation = Column(Text, nullable=False)
    
    # These will be added in Phase 2
    primary_topic = Column(String(100), nullable=True, index=True)
    sonic_cluster_id = Column(String(50), nullable=True, index=True)
    sonic_cluster_label = Column(String(100), nullable=True)
    
    # Relationship
    audio_features = relationship("AudioFeature", back_populates="song", cascade="all, delete-orphan")
    
    # Indexes for common queries
    __table_args__ = (
        Index("idx_songs_album_date", "album_name", "release_date"),
        Index("idx_songs_topic", "primary_topic"),
    )
    
    def __repr__(self):
        return f"<Song(id={self.id}, title_en='{self.title_en}', album='{self.album_name}')>"


class AudioFeature(Base):
    """
    AudioFeatures table - stores Spotify audio analysis features for each song.
    
    Fields:
        song_id: Foreign key to Songs table
        danceability: How suitable a track is for dancing (0.0 to 1.0)
        energy: Perceptual measure of intensity and power (0.0 to 1.0)
        valence: Musical positiveness conveyed (0.0 to 1.0)
        tempo: Overall estimated tempo in beats per minute (BPM)
        acousticness: Confidence measure of whether track is acoustic (0.0 to 1.0)
    """
    __tablename__ = "audio_features"
    
    song_id = Column(UUID(as_uuid=True), ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True, nullable=False)
    danceability = Column(Float, nullable=False)
    energy = Column(Float, nullable=False)
    valence = Column(Float, nullable=False)
    tempo = Column(Float, nullable=False)
    acousticness = Column(Float, nullable=False)
    
    # Relationship
    song = relationship("Song", back_populates="audio_features")
    
    def __repr__(self):
        return f"<AudioFeature(song_id={self.song_id}, energy={self.energy}, valence={self.valence})>"


