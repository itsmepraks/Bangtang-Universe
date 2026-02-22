import { useMemo } from 'react';
import type { Song, Album } from '../../../../types/database';
import type { DiscographyState } from '../../../../types/index';
import AlbumGrid from './AlbumGrid';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';

interface DiscographySectionProps {
  songs: Song[];
  albums: Album[];
  discographyState: DiscographyState;
  onSetDiscographyState: (s: DiscographyState) => void;
  eraFilter?: string | null;
}

export default function DiscographySection({ songs, albums, discographyState, onSetDiscographyState, eraFilter }: DiscographySectionProps) {
  const selectedAlbum = useMemo(
    () => albums.find(a => a.id === discographyState.selectedAlbumId) || null,
    [albums, discographyState.selectedAlbumId]
  );
  const selectedSong = useMemo(
    () => songs.find(s => s.id === discographyState.selectedSongId) || null,
    [songs, discographyState.selectedSongId]
  );

  if (discographyState.view === 'song' && selectedSong) {
    return (
      <SongDetail
        song={selectedSong}
        songs={songs}
        albums={albums}
        onBack={() => onSetDiscographyState({ ...discographyState, view: selectedAlbum ? 'album' : 'grid', selectedSongId: null })}
        onSelectSong={(id) => onSetDiscographyState({ ...discographyState, selectedSongId: id, view: 'song' })}
      />
    );
  }

  if (discographyState.view === 'album' && selectedAlbum) {
    return (
      <AlbumDetail
        album={selectedAlbum}
        songs={songs}
        onSelectSong={(id) => onSetDiscographyState({ ...discographyState, selectedSongId: id, view: 'song' })}
        onBack={() => onSetDiscographyState({ selectedAlbumId: null, selectedSongId: null, view: 'grid' })}
      />
    );
  }

  return (
    <AlbumGrid
      albums={albums}
      songs={songs}
      eraFilter={eraFilter || null}
      onSelectAlbum={(id) => onSetDiscographyState({ selectedAlbumId: id, selectedSongId: null, view: 'album' })}
    />
  );
}
