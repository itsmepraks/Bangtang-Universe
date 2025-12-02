"""
Spotify Web API scraper for fetching audio features.
Extracts danceability, energy, valence, tempo, and acousticness.
"""
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from typing import Optional, Dict, List
from loguru import logger

from backend.config import config


class SpotifyScraper:
    """Scraper for Spotify audio features."""
    
    def __init__(self):
        """Initialize Spotify scraper with API credentials."""
        self.client_id = config.spotify.client_id
        self.client_secret = config.spotify.client_secret
        
        if not self.client_id or not self.client_secret:
            logger.warning("Spotify API credentials not configured.")
            self.sp = None
        else:
            try:
                client_credentials_manager = SpotifyClientCredentials(
                    client_id=self.client_id,
                    client_secret=self.client_secret
                )
                self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
                logger.info("Spotify API client initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Spotify client: {e}")
                self.sp = None
    
    def search_track(self, track_name: str, artist_name: str = "BTS") -> Optional[Dict]:
        """
        Search for a track on Spotify.
        
        Args:
            track_name: Name of the track
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            Track data dictionary or None if not found
        """
        if not self.sp:
            logger.warning("Spotify client not initialized.")
            return None
        
        try:
            query = f"track:{track_name} artist:{artist_name}"
            results = self.sp.search(q=query, type="track", limit=1)
            
            if results["tracks"]["items"]:
                return results["tracks"]["items"][0]
            
            logger.warning(f"Track not found: {track_name} by {artist_name}")
            return None
        
        except Exception as e:
            logger.error(f"Error searching Spotify: {e}")
            return None
    
    def get_audio_features(self, track_id: str) -> Optional[Dict]:
        """
        Get audio features for a track by Spotify ID.
        
        Args:
            track_id: Spotify track ID
        
        Returns:
            Audio features dictionary or None if error
        """
        if not self.sp:
            logger.warning("Spotify client not initialized.")
            return None
        
        try:
            features = self.sp.audio_features([track_id])
            if features and features[0]:
                return features[0]
            
            logger.warning(f"No audio features found for track ID: {track_id}")
            return None
        
        except Exception as e:
            logger.error(f"Error fetching audio features: {e}")
            return None
    
    def get_track_audio_features(self, track_name: str, artist_name: str = "BTS") -> Optional[Dict]:
        """
        Get audio features for a track by name.
        
        Args:
            track_name: Name of the track
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            Dictionary with audio features:
            - danceability (float)
            - energy (float)
            - valence (float)
            - tempo (float)
            - acousticness (float)
            - track_id (str)
            - track_name (str)
            - album_name (str)
            - release_date (str)
        """
        # Search for the track
        track_data = self.search_track(track_name, artist_name)
        
        if not track_data:
            return None
        
        track_id = track_data["id"]
        
        # Get audio features
        audio_features = self.get_audio_features(track_id)
        
        if not audio_features:
            return None
        
        # Extract album and release date info
        album = track_data.get("album", {})
        album_name = album.get("name", "Unknown")
        release_date = album.get("release_date", "Unknown")
        
        # Return structured data
        return {
            "track_id": track_id,
            "track_name": track_data.get("name"),
            "album_name": album_name,
            "release_date": release_date,
            "danceability": audio_features.get("danceability", 0.0),
            "energy": audio_features.get("energy", 0.0),
            "valence": audio_features.get("valence", 0.0),
            "tempo": audio_features.get("tempo", 0.0),
            "acousticness": audio_features.get("acousticness", 0.0),
        }
    
    def get_album_tracks(self, album_name: str, artist_name: str = "BTS") -> List[Dict]:
        """
        Get all tracks from an album.
        
        Args:
            album_name: Name of the album
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            List of track dictionaries
        """
        if not self.sp:
            logger.warning("Spotify client not initialized.")
            return []
        
        try:
            query = f"album:{album_name} artist:{artist_name}"
            results = self.sp.search(q=query, type="album", limit=1)
            
            if not results["albums"]["items"]:
                logger.warning(f"Album not found: {album_name}")
                return []
            
            album_id = results["albums"]["items"][0]["id"]
            album_tracks = self.sp.album_tracks(album_id)
            
            tracks = []
            for item in album_tracks["items"]:
                tracks.append({
                    "track_id": item["id"],
                    "track_name": item["name"],
                    "album_name": album_name,
                })
            
            return tracks
        
        except Exception as e:
            logger.error(f"Error fetching album tracks: {e}")
            return []


