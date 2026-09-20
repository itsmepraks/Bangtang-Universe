import { useMemo } from 'react';
import type { Media } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseMediaResult extends AsyncResource {
    media: Media[];
}

export function useMedia(): UseMediaResult {
    const { data: media, loading, error, refetch } = useCatalogResource('media');
    return { media, loading, error, refetch };
}

export function useMediaByType(type: string) {
    const { media, loading, error } = useMedia();
    const filtered = useMemo(
        () => media.filter(m => m.type === type),
        [media, type]
    );
    return { media: filtered, loading, error };
}

export function useMediaByMember(memberId: string) {
    const { media, loading, error } = useMedia();
    const filtered = useMemo(
        () => media.filter(m => m.member_ids?.includes(memberId)),
        [media, memberId]
    );
    return { media: filtered, loading, error };
}

export default useMedia;
