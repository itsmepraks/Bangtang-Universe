import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Collaboration } from '../types/database';
import type { AsyncResource } from './types';

interface UseCollaborationsResult extends AsyncResource {
    collaborations: Collaboration[];
}

export function useCollaborations(): UseCollaborationsResult {
    const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCollaborations = async () => {
        if (!isSupabaseConfigured()) {
            setCollaborations([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('collaborations')
                .select('*')
                .order('release_date', { ascending: false });

            if (dbError) throw dbError;

            setCollaborations(data || []);
        } catch (err) {
            console.error('Failed to fetch collaborations:', err);
            setError(err as Error);
            setCollaborations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollaborations();
    }, []);

    return { collaborations, loading, error, refetch: fetchCollaborations };
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
