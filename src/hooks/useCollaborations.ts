import { useMemo } from 'react';
import type { Collaboration } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseCollaborationsResult extends AsyncResource {
    collaborations: Collaboration[];
}

export function useCollaborations(): UseCollaborationsResult {
    const { data: collaborations, loading, error, refetch } = useCatalogResource('collaborations');
    return { collaborations, loading, error, refetch };
}

export function useCollaborationsByMember(memberId: string) {
    const { collaborations, loading, error } = useCollaborations();
    const filtered = useMemo(
        () => collaborations.filter(c => c.member_id === memberId),
        [collaborations, memberId]
    );
    return { collaborations: filtered, loading, error };
}

export function useCollaborationsByArtist(artist: string) {
    const { collaborations, loading, error } = useCollaborations();
    const filtered = useMemo(
        () => collaborations.filter(c => c.artist === artist),
        [collaborations, artist]
    );
    return { collaborations: filtered, loading, error };
}

export default useCollaborations;
