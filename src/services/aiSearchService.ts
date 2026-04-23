// RAG/semantic search endpoint. Enabled when VITE_ENABLE_AI_SEARCH=true and
// VITE_AI_SEARCH_API_URL is set; callers fall back to Fuse.js otherwise.

import type { SearchResult } from './searchService';

const AI_SEARCH_ENABLED = import.meta.env.VITE_ENABLE_AI_SEARCH === 'true';
const AI_SEARCH_API_URL = import.meta.env.VITE_AI_SEARCH_API_URL as string | undefined;

export function isAiSearchConfigured(): boolean {
  return Boolean(AI_SEARCH_ENABLED && AI_SEARCH_API_URL?.trim());
}

export interface AiSearchApiResult {
  id: number | string;
  type: 'song' | 'member' | 'album' | 'award' | 'concert' | 'collaboration';
  title: string;
  subtitle?: string;
  score?: number;
  context?: string;
  item?: unknown;
}

export interface AiSearchApiResponse {
  results: AiSearchApiResult[];
  query?: string;
}

export async function searchWithAi(query: string, limit = 15): Promise<SearchResult[]> {
  if (!isAiSearchConfigured()) {
    return [];
  }

  const url = new URL(AI_SEARCH_API_URL!);
  url.searchParams.set('q', query.trim());
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`AI search failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as AiSearchApiResponse;
  const raw = data.results ?? [];

  return raw.slice(0, limit).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    subtitle: r.subtitle ?? '',
    score: typeof r.score === 'number' ? r.score : 85,
    context: r.context ?? r.subtitle ?? '',
    item: (r.item ?? { id: r.id, title: r.title }) as SearchResult['item'],
  }));
}
