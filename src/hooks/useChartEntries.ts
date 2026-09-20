import { useMemo } from 'react';
import type { ChartEntry } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseChartEntriesResult extends AsyncResource {
    chartEntries: ChartEntry[];
}

export function useChartEntries(): UseChartEntriesResult {
    const { data: chartEntries, loading, error, refetch } = useCatalogResource('chart_entries');
    return { chartEntries, loading, error, refetch };
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
