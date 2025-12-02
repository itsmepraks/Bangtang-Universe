"""
Data validation and cleaning functions for ingested data.
Ensures data quality and UTF-8 encoding compliance.
"""
import re
from typing import Optional, Dict, Tuple
from datetime import datetime, date
from loguru import logger


def clean_text(text: Optional[str]) -> Optional[str]:
    """
    Clean and normalize text data.
    Ensures UTF-8 encoding and removes problematic characters.
    
    Args:
        text: Raw text to clean
    
    Returns:
        Cleaned text or None if invalid
    """
    if not text:
        return None
    
    # Ensure it's a string
    if not isinstance(text, str):
        text = str(text)
    
    # Remove null bytes and other control characters (except newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F]', '', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    # Ensure UTF-8 encoding
    try:
        text.encode('utf-8')
    except UnicodeEncodeError as e:
        logger.warning(f"UTF-8 encoding error: {e}")
        # Try to fix by removing problematic characters
        text = text.encode('utf-8', errors='ignore').decode('utf-8')
    
    return text if text else None


def validate_song_data(
    title_en: Optional[str],
    title_kr: Optional[str],
    lyrics_original: Optional[str],
    lyrics_translation: Optional[str],
    release_date: Optional[str],
    album_name: Optional[str]
) -> Tuple[bool, Optional[str]]:
    """
    Validate song data before database insertion.
    
    Args:
        title_en: English title
        title_kr: Korean title
        lyrics_original: Original lyrics
        lyrics_translation: Translated lyrics
        release_date: Release date string
        album_name: Album name
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check required fields
    if not title_en:
        return False, "English title is required"
    
    if not title_kr:
        return False, "Korean title is required"
    
    if not lyrics_original:
        return False, "Original lyrics are required"
    
    if not lyrics_translation:
        return False, "Translated lyrics are required"
    
    if not album_name:
        return False, "Album name is required"
    
    # Validate and parse release date
    if release_date:
        try:
            # Try various date formats
            date_formats = ["%Y-%m-%d", "%Y-%m", "%Y", "%d/%m/%Y", "%m/%d/%Y"]
            parsed_date = None
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(release_date, fmt).date()
                    break
                except ValueError:
                    continue
            
            if not parsed_date:
                return False, f"Invalid release date format: {release_date}"
        except Exception as e:
            return False, f"Error parsing release date: {e}"
    
    # Clean and validate text fields
    title_en = clean_text(title_en)
    title_kr = clean_text(title_kr)
    lyrics_original = clean_text(lyrics_original)
    lyrics_translation = clean_text(lyrics_translation)
    album_name = clean_text(album_name)
    
    if not all([title_en, title_kr, lyrics_original, lyrics_translation, album_name]):
        return False, "Text cleaning resulted in empty required fields"
    
    return True, None


def parse_release_date(date_str: Optional[str]) -> Optional[date]:
    """
    Parse release date string into date object.
    
    Args:
        date_str: Date string in various formats
    
    Returns:
        Date object or None if parsing fails
    """
    if not date_str:
        return None
    
    date_formats = [
        "%Y-%m-%d",
        "%Y-%m",
        "%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%B %d, %Y",
        "%b %d, %Y",
    ]
    
    for fmt in date_formats:
        try:
            parsed = datetime.strptime(date_str.strip(), fmt).date()
            return parsed
        except ValueError:
            continue
    
    logger.warning(f"Could not parse date: {date_str}")
    return None


def validate_audio_features(
    danceability: Optional[float],
    energy: Optional[float],
    valence: Optional[float],
    tempo: Optional[float],
    acousticness: Optional[float]
) -> Tuple[bool, Optional[str]]:
    """
    Validate audio features data.
    
    Args:
        danceability: Danceability score (0.0-1.0)
        energy: Energy score (0.0-1.0)
        valence: Valence score (0.0-1.0)
        tempo: Tempo in BPM
        acousticness: Acousticness score (0.0-1.0)
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check if all features are present
    if any(x is None for x in [danceability, energy, valence, tempo, acousticness]):
        return False, "All audio features are required"
    
    # Validate ranges for 0.0-1.0 features
    for name, value in [("danceability", danceability), ("energy", energy), 
                        ("valence", valence), ("acousticness", acousticness)]:
        if not (0.0 <= value <= 1.0):
            return False, f"{name} must be between 0.0 and 1.0, got {value}"
    
    # Validate tempo (reasonable range: 20-300 BPM)
    if not (20.0 <= tempo <= 300.0):
        return False, f"tempo must be between 20.0 and 300.0 BPM, got {tempo}"
    
    return True, None


def normalize_audio_features(features: Dict) -> Dict:
    """
    Normalize and clean audio features dictionary.
    
    Args:
        features: Raw audio features dictionary
    
    Returns:
        Normalized features dictionary
    """
    normalized = {
        "danceability": float(features.get("danceability", 0.0)),
        "energy": float(features.get("energy", 0.0)),
        "valence": float(features.get("valence", 0.0)),
        "tempo": float(features.get("tempo", 0.0)),
        "acousticness": float(features.get("acousticness", 0.0)),
    }
    
    # Clamp values to valid ranges
    for key in ["danceability", "energy", "valence", "acousticness"]:
        normalized[key] = max(0.0, min(1.0, normalized[key]))
    
    normalized["tempo"] = max(20.0, min(300.0, normalized["tempo"]))
    
    return normalized


