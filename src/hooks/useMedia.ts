import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Media } from '../types/database';
import type { AsyncResource } from './types';

interface UseMediaResult extends AsyncResource {
    media: Media[];
}

export function useMedia(): UseMediaResult {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMedia = async () => {
        if (!isSupabaseConfigured()) {
            setMedia([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('media')
                .select('*')
                .order('release_date', { ascending: false });

            if (dbError) throw dbError;
            setMedia(data || []);
        } catch (err) {
            console.error('Failed to fetch media:', err);
            setError(err as Error);
            setMedia([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    return { media, loading, error, refetch: fetchMedia };
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
