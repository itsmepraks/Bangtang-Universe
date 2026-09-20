import type { Album, Award, ChartEntry, Collaboration, Concert, Lyrics, Media, Member, MemberEvent, SoloAlbum, Song } from '../types/database';
import type { CatalogTable } from './catalogSchema';

export interface CatalogRows {
  albums: Album[];
  songs: Song[];
  members: Member[];
  solo_albums: SoloAlbum[];
  lyrics: Lyrics[];
  awards: Award[];
  chart_entries: ChartEntry[];
  concerts: Concert[];
  collaborations: Collaboration[];
  member_events: MemberEvent[];
  media: Media[];
}

const inflight = new Map<CatalogTable, Promise<unknown[]>>();

function parsePayload<T>(table: CatalogTable, payload: unknown): T[] {
  if (!payload || typeof payload !== 'object') throw new Error(`Invalid ${table} response`);
  const candidate = payload as { table?: unknown; count?: unknown; rows?: unknown };
  if (candidate.table !== table || !Array.isArray(candidate.rows) || candidate.count !== candidate.rows.length) {
    throw new Error(`Incomplete ${table} response`);
  }
  return candidate.rows as T[];
}

async function requestTable<T>(url: string, table: CatalogTable): Promise<T[]> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${table} request failed (${response.status})`);
  return parsePayload<T>(table, await response.json());
}

export function fetchCatalogTable<K extends CatalogTable>(table: K): Promise<CatalogRows[K]> {
  const existing = inflight.get(table);
  if (existing) return existing as Promise<CatalogRows[K]>;
  const base = import.meta.env.VITE_CATALOG_API_URL?.replace(/\/$/, '');
  if (!base) return Promise.reject(new Error('Live catalog data is not configured'));
  const request = requestTable<CatalogRows[K][number]>(`${base}/${table}`, table)
    .finally(() => inflight.delete(table));
  inflight.set(table, request as Promise<unknown[]>);
  return request as Promise<CatalogRows[K]>;
}

export async function fetchCatalogSnapshot<K extends CatalogTable>(table: K): Promise<CatalogRows[K]> {
  return requestTable<CatalogRows[K][number]>(`${import.meta.env.BASE_URL}data/catalog/${table}.json`, table) as Promise<CatalogRows[K]>;
}
