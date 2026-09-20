import { useMemo } from 'react';
import type { Award } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseAwardsResult extends AsyncResource {
    awards: Award[];
}

export function useAwards(): UseAwardsResult {
    const { data: awards, loading, error, refetch } = useCatalogResource('awards');
    return { awards, loading, error, refetch };
}

export function useAwardsByMember(memberId: string) {
    const { awards, loading, error } = useAwards();
    const filtered = useMemo(
        () => awards.filter(a => a.member_id === memberId),
        [awards, memberId]
    );
    return { awards: filtered, loading, error };
}

export function useAwardsByCeremony(ceremony: string) {
    const { awards, loading, error } = useAwards();
    const filtered = useMemo(
        () => awards.filter(a => a.ceremony === ceremony),
        [awards, ceremony]
    );
    return { awards: filtered, loading, error };
}

export default useAwards;
