"""
Genius API scraper for fetching BTS lyrics.
Fetches both original Korean lyrics and English translations.
"""
import time
import requests
from typing import Optional, Dict, Tuple
from bs4 import BeautifulSoup
from loguru import logger

from backend.config import config


class GeniusScraper:
    """Scraper for Genius.com lyrics."""
    
    def __init__(self):
        """Initialize Genius scraper with API credentials."""
        self.api_key = config.genius.api_key or config.genius.access_token
        self.base_url = "https://api.genius.com"
        self.headers = {}
        
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def search_song(self, song_title: str, artist_name: str = "BTS") -> Optional[Dict]:
        """
        Search for a song on Genius.
        
        Args:
            song_title: Title of the song
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            Song data dictionary or None if not found
        """
        if not self.api_key:
            logger.warning("Genius API key not configured. Using web scraping fallback.")
            return None
        
        try:
            search_url = f"{self.base_url}/search"
            params = {
                "q": f"{artist_name} {song_title}"
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "response" in data and "hits" in data["response"]:
                hits = data["response"]["hits"]
                if hits:
                    # Return the first result
                    return hits[0].get("result")
            
            logger.warning(f"Song not found: {song_title}")
            return None
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching Genius API: {e}")
            return None
    
    def get_lyrics_from_url(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Scrape lyrics from a Genius URL.
        Attempts to get both Korean and English versions.
        
        Args:
            url: Genius song URL
        
        Returns:
            Tuple of (original_lyrics, translated_lyrics)
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            response.encoding = "utf-8"
            
            soup = BeautifulSoup(response.text, "lxml")
            
            # Find the lyrics container
            lyrics_container = soup.find("div", {"data-lyrics-container": "true"})
            if not lyrics_container:
                # Try alternative selectors
                lyrics_container = soup.find("div", class_="lyrics")
                if not lyrics_container:
                    lyrics_container = soup.find("div", {"class": "Lyrics__Container-sc-1ynbvzw-1"})
            
            if not lyrics_container:
                logger.warning(f"Could not find lyrics container in {url}")
                return None, None
            
            # Extract text
            lyrics_text = lyrics_container.get_text(separator="\n", strip=True)
            
            # Try to find English translation
            # Genius often has translations in separate sections
            translation_container = soup.find("div", class_="translation")
            if not translation_container:
                # Look for any div with "translation" or "english" in class/id
                translation_container = soup.find("div", {"class": lambda x: x and "translation" in x.lower()})
            
            translation_text = None
            if translation_container:
                translation_text = translation_container.get_text(separator="\n", strip=True)
            
            # If no separate translation found, assume the main lyrics might be mixed
            # For now, we'll use the main lyrics as original and try to detect language
            original_lyrics = lyrics_text
            
            # If translation is not found separately, we'll need to handle it differently
            # For Phase 1, we'll store the same text in both fields if translation not available
            # This can be improved in later phases with better parsing
            
            return original_lyrics, translation_text or original_lyrics
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching lyrics from URL {url}: {e}")
            return None, None
        except Exception as e:
            logger.error(f"Error parsing lyrics from {url}: {e}")
            return None, None
    
    def get_song_lyrics(self, song_title: str, artist_name: str = "BTS") -> Tuple[Optional[str], Optional[str], Optional[Dict]]:
        """
        Get lyrics for a song by title.
        
        Args:
            song_title: Title of the song
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            Tuple of (original_lyrics, translated_lyrics, song_metadata)
        """
        # Search for the song
        song_data = self.search_song(song_title, artist_name)
        
        if not song_data:
            logger.warning(f"Could not find song data for: {song_title}")
            return None, None, None
        
        # Get lyrics from the song URL
        song_url = song_data.get("url")
        if not song_url:
            logger.warning(f"No URL found for song: {song_title}")
            return None, None, None
        
        original_lyrics, translated_lyrics = self.get_lyrics_from_url(song_url)
        
        # Extract metadata
        metadata = {
            "title": song_data.get("title"),
            "full_title": song_data.get("full_title"),
            "release_date": song_data.get("release_date_for_display"),
            "url": song_url,
            "genius_id": song_data.get("id")
        }
        
        # Add rate limiting to avoid being blocked
        time.sleep(0.5)
        
        return original_lyrics, translated_lyrics, metadata
    
    def get_lyrics_fallback(self, song_title: str, artist_name: str = "BTS") -> Tuple[Optional[str], Optional[str]]:
        """
        Fallback method using direct web scraping without API.
        This is used when API key is not available or API fails.
        
        Args:
            song_title: Title of the song
            artist_name: Name of the artist (default: BTS)
        
        Returns:
            Tuple of (original_lyrics, translated_lyrics)
        """
        try:
            # Construct search URL
            search_query = f"{artist_name} {song_title} site:genius.com"
            search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
            
            # This is a simplified fallback - in production, you'd want a more robust solution
            logger.warning("Using fallback scraping method. Results may be limited.")
            
            # For now, return None - this can be enhanced with more sophisticated scraping
            return None, None
        
        except Exception as e:
            logger.error(f"Error in fallback scraping: {e}")
            return None, None


