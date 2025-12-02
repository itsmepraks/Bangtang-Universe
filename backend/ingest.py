"""
Main data ingestion script for BTS Universe.
Fetches lyrics from Genius and audio features from Spotify,
then stores them in PostgreSQL database.
"""
import sys
import argparse
from typing import List, Dict, Optional
from loguru import logger
from datetime import date

# Add parent directory to path for imports
sys.path.insert(0, '.')

from backend.database.connection import get_db_session, init_db, test_connection
from backend.database.models import Song, AudioFeature
from backend.scrapers.genius_scraper import GeniusScraper
from backend.scrapers.spotify_scraper import SpotifyScraper
from backend.scrapers.data_validator import (
    validate_song_data,
    validate_audio_features,
    clean_text,
    parse_release_date,
    normalize_audio_features
)
from backend.config import config


# Configure logging
logger.add(
    "logs/ingest_{time}.log",
    rotation="100 MB",
    retention="10 days",
    level="INFO",
    encoding="utf-8"
)


class DataIngestionPipeline:
    """Main pipeline for ingesting BTS song data."""
    
    def __init__(self):
        """Initialize the ingestion pipeline."""
        self.genius_scraper = GeniusScraper()
        self.spotify_scraper = SpotifyScraper()
        self.stats = {
            "total_processed": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0
        }
    
    def ingest_song(
        self,
        song_title: str,
        album_name: str,
        release_date: Optional[str] = None,
        artist_name: str = "BTS"
    ) -> bool:
        """
        Ingest a single song into the database.
        
        Args:
            song_title: Title of the song
            album_name: Name of the album
            release_date: Release date (optional, will be fetched if not provided)
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            True if successful, False otherwise
        """
        self.stats["total_processed"] += 1
        
        logger.info(f"Processing: {song_title} from {album_name}")
        
        try:
            # Check if song already exists
            with get_db_session() as session:
                existing = session.query(Song).filter(
                    Song.title_en.ilike(f"%{song_title}%"),
                    Song.album_name == album_name
                ).first()
                
                if existing:
                    logger.info(f"Song already exists: {song_title}. Skipping.")
                    self.stats["skipped"] += 1
                    return True
            
            # Fetch lyrics from Genius
            logger.info(f"Fetching lyrics for: {song_title}")
            original_lyrics, translated_lyrics, genius_metadata = self.genius_scraper.get_song_lyrics(
                song_title, artist_name
            )
            
            if not original_lyrics or not translated_lyrics:
                logger.warning(f"Could not fetch lyrics for: {song_title}")
                self.stats["failed"] += 1
                return False
            
            # Use release date from Genius metadata if not provided
            if not release_date and genius_metadata:
                release_date = genius_metadata.get("release_date")
            
            # Fetch audio features from Spotify
            logger.info(f"Fetching audio features for: {song_title}")
            audio_features_data = self.spotify_scraper.get_track_audio_features(
                song_title, artist_name
            )
            
            if not audio_features_data:
                logger.warning(f"Could not fetch audio features for: {song_title}")
                # Continue without audio features - we can add them later
                audio_features_data = None
            
            # Use album name from Spotify if available and not provided
            if not album_name and audio_features_data:
                album_name = audio_features_data.get("album_name", "Unknown")
            
            # Use release date from Spotify if not available from Genius
            if not release_date and audio_features_data:
                release_date = audio_features_data.get("release_date")
            
            # Clean and validate data
            title_en = clean_text(song_title)
            title_kr = clean_text(genius_metadata.get("title", song_title) if genius_metadata else song_title)
            
            # Validate song data
            is_valid, error_msg = validate_song_data(
                title_en=title_en,
                title_kr=title_kr,
                lyrics_original=original_lyrics,
                lyrics_translation=translated_lyrics,
                release_date=release_date,
                album_name=album_name or "Unknown"
            )
            
            if not is_valid:
                logger.error(f"Validation failed for {song_title}: {error_msg}")
                self.stats["failed"] += 1
                return False
            
            # Parse release date
            parsed_date = parse_release_date(release_date)
            if not parsed_date:
                logger.warning(f"Could not parse release date for {song_title}, using today's date")
                parsed_date = date.today()
            
            # Insert into database
            with get_db_session() as session:
                # Create song record
                song = Song(
                    title_en=title_en,
                    title_kr=title_kr,
                    release_date=parsed_date,
                    album_name=album_name or "Unknown",
                    lyrics_original=original_lyrics,
                    lyrics_translation=translated_lyrics
                )
                
                session.add(song)
                session.flush()  # Get the song ID
                
                # Add audio features if available
                if audio_features_data:
                    normalized_features = normalize_audio_features(audio_features_data)
                    
                    is_valid_features, error_msg = validate_audio_features(
                        danceability=normalized_features["danceability"],
                        energy=normalized_features["energy"],
                        valence=normalized_features["valence"],
                        tempo=normalized_features["tempo"],
                        acousticness=normalized_features["acousticness"]
                    )
                    
                    if is_valid_features:
                        audio_feature = AudioFeature(
                            song_id=song.id,
                            danceability=normalized_features["danceability"],
                            energy=normalized_features["energy"],
                            valence=normalized_features["valence"],
                            tempo=normalized_features["tempo"],
                            acousticness=normalized_features["acousticness"]
                        )
                        session.add(audio_feature)
                    else:
                        logger.warning(f"Invalid audio features for {song_title}: {error_msg}")
                
                session.commit()
                logger.info(f"Successfully ingested: {song_title}")
                self.stats["successful"] += 1
                return True
        
        except Exception as e:
            logger.error(f"Error ingesting {song_title}: {e}", exc_info=True)
            self.stats["failed"] += 1
            return False
    
    def ingest_from_list(self, songs: List[Dict[str, str]]) -> None:
        """
        Ingest multiple songs from a list.
        
        Args:
            songs: List of song dictionaries with keys: title, album, release_date (optional)
        """
        logger.info(f"Starting batch ingestion of {len(songs)} songs")
        
        for i, song_data in enumerate(songs, 1):
            logger.info(f"Processing song {i}/{len(songs)}")
            self.ingest_song(
                song_title=song_data.get("title", ""),
                album_name=song_data.get("album", ""),
                release_date=song_data.get("release_date"),
                artist_name=song_data.get("artist", "BTS")
            )
        
        # Print statistics
        self.print_stats()
    
    def print_stats(self) -> None:
        """Print ingestion statistics."""
        logger.info("=" * 50)
        logger.info("Ingestion Statistics:")
        logger.info(f"  Total processed: {self.stats['total_processed']}")
        logger.info(f"  Successful: {self.stats['successful']}")
        logger.info(f"  Failed: {self.stats['failed']}")
        logger.info(f"  Skipped: {self.stats['skipped']}")
        logger.info("=" * 50)


def get_sample_bts_songs() -> List[Dict[str, str]]:
    """
    Get a sample list of BTS songs for testing.
    This is a curated list of popular BTS songs.
    
    Returns:
        List of song dictionaries
    """
    return [
        {"title": "Dynamite", "album": "BE", "release_date": "2020-08-21"},
        {"title": "Butter", "album": "Butter", "release_date": "2021-05-21"},
        {"title": "Spring Day", "album": "You Never Walk Alone", "release_date": "2017-02-13"},
        {"title": "DNA", "album": "Love Yourself: Her", "release_date": "2017-09-18"},
        {"title": "Fake Love", "album": "Love Yourself: Tear", "release_date": "2018-05-18"},
        {"title": "Idol", "album": "Love Yourself: Answer", "release_date": "2018-08-24"},
        {"title": "Boy With Luv", "album": "Map of the Soul: Persona", "release_date": "2019-04-12"},
        {"title": "ON", "album": "Map of the Soul: 7", "release_date": "2020-02-21"},
        {"title": "Life Goes On", "album": "BE", "release_date": "2020-11-20"},
        {"title": "Permission to Dance", "album": "Butter", "release_date": "2021-07-09"},
    ]


def main():
    """Main entry point for the ingestion script."""
    parser = argparse.ArgumentParser(description="Ingest BTS song data into database")
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Initialize database tables (create if not exist)"
    )
    parser.add_argument(
        "--test-connection",
        action="store_true",
        help="Test database connection"
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Ingest sample BTS songs for testing"
    )
    parser.add_argument(
        "--song",
        type=str,
        help="Ingest a single song by title"
    )
    parser.add_argument(
        "--album",
        type=str,
        help="Album name (required with --song)"
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Release date (optional, format: YYYY-MM-DD)"
    )
    
    args = parser.parse_args()
    
    # Initialize database if requested
    if args.init_db:
        logger.info("Initializing database...")
        try:
            init_db()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            sys.exit(1)
        return
    
    # Test connection if requested
    if args.test_connection:
        logger.info("Testing database connection...")
        if test_connection():
            logger.info("Database connection successful")
            sys.exit(0)
        else:
            logger.error("Database connection failed")
            sys.exit(1)
    
    # Check database connection before proceeding
    if not test_connection():
        logger.error("Database connection failed. Please check your configuration.")
        sys.exit(1)
    
    # Initialize pipeline
    pipeline = DataIngestionPipeline()
    
    # Ingest sample songs
    if args.sample:
        logger.info("Ingesting sample BTS songs...")
        sample_songs = get_sample_bts_songs()
        pipeline.ingest_from_list(sample_songs)
    
    # Ingest single song
    elif args.song:
        if not args.album:
            logger.error("--album is required when using --song")
            sys.exit(1)
        
        logger.info(f"Ingesting single song: {args.song}")
        success = pipeline.ingest_song(
            song_title=args.song,
            album_name=args.album,
            release_date=args.date
        )
        
        if success:
            logger.info("Song ingested successfully")
            sys.exit(0)
        else:
            logger.error("Failed to ingest song")
            sys.exit(1)
    
    else:
        parser.print_help()
        logger.info("\nExample usage:")
        logger.info("  python backend/ingest.py --init-db")
        logger.info("  python backend/ingest.py --sample")
        logger.info("  python backend/ingest.py --song 'Dynamite' --album 'BE'")
        sys.exit(0)


if __name__ == "__main__":
    main()


