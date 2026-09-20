import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCatalogTable } from './catalogService';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('catalogService', () => {
  it('loads and validates a complete Worker response', async () => {
    vi.stubEnv('VITE_CATALOG_API_URL', 'https://catalog.example/api/catalog/');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      table: 'members',
      count: 1,
      rows: [{ id: 'rm', stage_name: 'RM' }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCatalogTable('members')).resolves.toEqual([{ id: 'rm', stage_name: 'RM' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://catalog.example/api/catalog/members',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('rejects a truncated response instead of silently showing partial data', async () => {
    vi.stubEnv('VITE_CATALOG_API_URL', 'https://catalog.example/api/catalog');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      table: 'awards',
      count: 2,
      rows: [{ id: 1 }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })));

    await expect(fetchCatalogTable('awards')).rejects.toThrow('Incomplete awards response');
  });
});
