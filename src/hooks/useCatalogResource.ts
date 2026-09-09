import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCatalogSnapshot, fetchCatalogTable, type CatalogRows } from '../services/catalogService';
import type { CatalogTable } from '../services/catalogSchema';
import type { AsyncResource } from './types';

export function useCatalogResource<K extends CatalogTable>(table: K, enabled = true): AsyncResource & { data: CatalogRows[K] } {
  const [data, setData] = useState<CatalogRows[K]>([] as unknown as CatalogRows[K]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchCatalogTable(table));
      setError(null);
    } catch (cause) {
      const liveError = cause instanceof Error ? cause : new Error(`Could not load ${table}`);
      setError(liveError);
      try {
        setData(await fetchCatalogSnapshot(table));
      } catch (snapshotCause) {
        console.error(`Failed to load ${table} snapshot:`, snapshotCause);
      }
    } finally {
      setLoading(false);
    }
  }, [table]);

  const started = useRef(false);
  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    void refetch();
  }, [enabled, refetch]);
  return { data, loading, error, refetch };
}
