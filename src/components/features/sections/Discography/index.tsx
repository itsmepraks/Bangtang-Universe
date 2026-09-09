import type { DiscographyFilters } from '../../../../hooks/useArchiveNavigation';
import { useMemo } from 'react';
import type { Song, Album } from '../../../../types/database';
import type { DiscographyState } from '../../../../types/index';
import AlbumGrid from './AlbumGrid';
import AlbumDetail from './AlbumDetail';
import SongDetail from './SongDetail';
import { EditorialPageHeader, GallerySection } from '../../../editorial';

interface DiscographySectionProps {
  songs: Song[];
  albums: Album[];
  discographyState: DiscographyState;
  onSetDiscographyState: (s: DiscographyState) => void;
  filters: DiscographyFilters;
  onFiltersChange: (filters: DiscographyFilters) => void;
}

export default function DiscographySection({ songs, albums, discographyState, onSetDiscographyState, filters, onFiltersChange }: DiscographySectionProps) {
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
    <div className="space-y-4">
      <EditorialPageHeader
        eyebrow="Collection Catalog / Discography"
        title="Discography"
        note="Find a release by era or format, then explore its songs."
        meta={
          <>
            <span>{albums.length.toLocaleString()} releases</span>
            <span>{songs.length.toLocaleString()} songs</span>
            <span>{new Set(albums.map((album) => album.era).filter(Boolean)).size} eras</span>
          </>
        }
      />
      <GallerySection
        compact
        number="01"
        label="Release Shelf"
        title="Filterable release records"
        claim="Use type and era filters to narrow albums, singles, solo records, and collaborations."
        caption="Select a release to open its album record, tracklist, and linked song detail."
      >
        <AlbumGrid
          albums={albums}
          songs={songs}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onSelectSong={(song) => onSetDiscographyState({ selectedAlbumId: song.album_id, selectedSongId: song.id, view: 'song' })}
          onSelectAlbum={(id) => onSetDiscographyState({ selectedAlbumId: id, selectedSongId: null, view: 'album' })}
        />
      </GallerySection>
    </div>
  );
}
