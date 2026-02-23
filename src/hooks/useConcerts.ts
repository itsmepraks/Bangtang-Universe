/**
 * useConcerts Hook
 *
 * Fetches concert data from Supabase database
 * Falls back to empty array if database is unavailable
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Concert } from '../types/database';

interface UseConcertsResult {
    concerts: Concert[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useConcerts(): UseConcertsResult {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchConcerts = async () => {
        if (!isSupabaseConfigured()) {
            setConcerts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('concerts')
                .select('*')
                .order('date', { ascending: false });

            if (dbError) throw dbError;

            setConcerts(data || []);
        } catch (err) {
            console.error('Failed to fetch concerts:', err);
            setError(err as Error);
            setConcerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConcerts();
    }, []);

    return { concerts, loading, error, refetch: fetchConcerts };
}

// Get concerts by tour name
export function useConcertsByTour(tourName: string) {
    const { concerts, loading, error } = useConcerts();
    const filtered = useMemo(
        () => concerts.filter(c => c.tour_name === tourName),
        [concerts, tourName]
    );
    return { concerts: filtered, loading, error };
}

// Get concerts by country
export function useConcertsByCountry(country: string) {
    const { concerts, loading, error } = useConcerts();
    const filtered = useMemo(
        () => concerts.filter(c => c.country === country),
        [concerts, country]
    );
    return { concerts: filtered, loading, error };
}

export default useConcerts;
