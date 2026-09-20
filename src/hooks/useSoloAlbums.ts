import { useMemo } from 'react';
import type { SoloAlbum } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseSoloAlbumsResult extends AsyncResource {
    soloAlbums: SoloAlbum[];
}

export function useSoloAlbums(): UseSoloAlbumsResult {
    const { data: soloAlbums, loading, error, refetch } = useCatalogResource('solo_albums');
    return { soloAlbums, loading, error, refetch };
}

export function useSoloAlbumsByMember(memberId: string) {
    const { soloAlbums, loading, error } = useSoloAlbums();
    const filtered = useMemo(
        () => soloAlbums.filter(a => a.member_id === memberId),
        [soloAlbums, memberId]
    );
    return { soloAlbums: filtered, loading, error };
}

export default useSoloAlbums;
