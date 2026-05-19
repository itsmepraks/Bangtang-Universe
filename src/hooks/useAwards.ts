import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Award } from '../types/database';
import type { AsyncResource } from './types';

interface UseAwardsResult extends AsyncResource {
    awards: Award[];
}

export function useAwards(): UseAwardsResult {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAwards = async () => {
        if (!isSupabaseConfigured()) {
            setAwards([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('awards')
                .select('*')
                .order('year', { ascending: false });

            if (dbError) throw dbError;

            setAwards(data || []);
        } catch (err) {
            console.error('Failed to fetch awards:', err);
            setError(err as Error);
            setAwards([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAwards();
    }, []);

    return { awards, loading, error, refetch: fetchAwards };
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
