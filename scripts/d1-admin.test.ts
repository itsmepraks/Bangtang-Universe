import { afterEach, describe, expect, it, vi } from 'vitest';
import { D1Admin } from './d1-admin';

afterEach(() => vi.unstubAllGlobals());

describe('D1Admin', () => {
  it('sends parameterized writes and restores stored JSON and booleans', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      result: [{ success: true, results: [{ id: 1, keywords: '["hope"]', is_title_track: 1 }] }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new D1Admin('secret-token', 'account-id', 'database-id');

    const result = await client.from('songs').upsert({
      id: 1,
      title: 'Hope World',
      keywords: ['hope'],
      is_title_track: true,
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual([{ id: 1, keywords: ['hope'], is_title_track: true }]);
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body)) as { sql: string; params: unknown[] };
    expect(body.sql).toContain('ON CONFLICT (id) DO UPDATE');
    expect(body.sql).not.toContain('Hope World');
    expect(body.params).toContain('Hope World');
    expect(body.params).toContain('["hope"]');
    expect(body.params).toContain(1);
  });

  it('rejects tables outside the catalog allowlist', () => {
    const client = new D1Admin('secret-token', 'account-id', 'database-id');
    expect(() => client.from('users')).toThrow('Unknown catalog table');
  });
});
