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
    <div className="space-y-6">
      <EditorialPageHeader
        eyebrow="Collection Catalog / Discography"
        title="The eras are the structure."
        note="Albums, singles, solo records, and collaborations read best as collection objects grouped by era: each release carries a date, format, sonic position, and a path into the larger archive."
        meta={
          <>
            <span>{albums.length.toLocaleString()} releases</span>
            <span>{songs.length.toLocaleString()} songs</span>
            <span>{new Set(albums.map((album) => album.era).filter(Boolean)).size} eras</span>
          </>
        }
      />
      <GallerySection
        number="01"
        label="Era Catalog"
        title="A release grid becomes an archive shelf."
        claim="Filter by type, era, group work, solo records, and collaborations while keeping each album anchored as an object in the collection."
        caption="Select an object to open its album record, tracklist, and linked song detail."
      >
        <AlbumGrid
          albums={albums}
          songs={songs}
          eraFilter={eraFilter || null}
          onSelectAlbum={(id) => onSetDiscographyState({ selectedAlbumId: id, selectedSongId: null, view: 'album' })}
        />
      </GallerySection>
    </div>
  );
}
