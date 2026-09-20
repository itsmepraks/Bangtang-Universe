import { useMemo } from 'react';
import type { Concert } from '../types/database';
import type { AsyncResource } from './types';
import { useCatalogResource } from './useCatalogResource';

interface UseConcertsResult extends AsyncResource {
    concerts: Concert[];
}

export function useConcerts(): UseConcertsResult {
    const { data: concerts, loading, error, refetch } = useCatalogResource('concerts');
    return { concerts, loading, error, refetch };
}

export function useConcertsByTour(tourName: string) {
    const { concerts, loading, error } = useConcerts();
    const filtered = useMemo(
        () => concerts.filter(c => c.tour_name === tourName),
        [concerts, tourName]
    );
    return { concerts: filtered, loading, error };
}

export function useConcertsByCountry(country: string) {
    const { concerts, loading, error } = useConcerts();
    const filtered = useMemo(
        () => concerts.filter(c => c.country === country),
        [concerts, country]
    );
    return { concerts: filtered, loading, error };
}

export default useConcerts;
