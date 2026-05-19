import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ChartEntry } from '../types/database';
import type { AsyncResource } from './types';

interface UseChartEntriesResult extends AsyncResource {
    chartEntries: ChartEntry[];
}

export function useChartEntries(): UseChartEntriesResult {
    const [chartEntries, setChartEntries] = useState<ChartEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchChartEntries = async () => {
        if (!isSupabaseConfigured()) {
            setChartEntries([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('chart_entries')
                .select('*')
                .order('peak_position', { ascending: true });

            if (dbError) throw dbError;

            setChartEntries(data || []);
        } catch (err) {
            console.error('Failed to fetch chart entries:', err);
            setError(err as Error);
            setChartEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartEntries();
    }, []);

    return { chartEntries, loading, error, refetch: fetchChartEntries };
}

export function useChartEntriesBySong(songId: number) {
    const { chartEntries, loading, error } = useChartEntries();
    const filtered = useMemo(
        () => chartEntries.filter(c => c.song_id === songId),
        [chartEntries, songId]
    );
    return { chartEntries: filtered, loading, error };
}

export function useChartEntriesByChart(chartName: string) {
    const { chartEntries, loading, error } = useChartEntries();
    const filtered = useMemo(
        () => chartEntries.filter(c => c.chart_name === chartName),
        [chartEntries, chartName]
    );
    return { chartEntries: filtered, loading, error };
}

export default useChartEntries;
