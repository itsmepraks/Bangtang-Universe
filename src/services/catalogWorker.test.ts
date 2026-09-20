import { describe, expect, it, vi } from 'vitest';
import worker from '../../workers/catalog/index';

function environment(rows: Record<string, unknown>[]) {
  const all = vi.fn().mockResolvedValue({ success: true, results: rows });
  const prepare = vi.fn().mockReturnValue({ all });
  return { env: { CATALOG_DB: { prepare } }, prepare };
}

describe('catalog Worker', () => {
  it('restores JSON arrays and booleans from D1 storage', async () => {
    const { env, prepare } = environment([{ id: 1, keywords: '["hope"]', is_title_track: 1 }]);
    const response = await worker.fetch(
      new Request('https://catalog.example/api/catalog/songs'),
      env as unknown as Parameters<typeof worker.fetch>[1],
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      table: 'songs',
      count: 1,
      rows: [{ keywords: ['hope'], is_title_track: true }],
    });
    expect(prepare).toHaveBeenCalledOnce();
  });

  it('keeps the public API read-only and allowlisted', async () => {
    const { env } = environment([]);
    const post = await worker.fetch(
      new Request('https://catalog.example/api/catalog/awards', { method: 'POST' }),
      env as unknown as Parameters<typeof worker.fetch>[1],
    );
    const unknown = await worker.fetch(
      new Request('https://catalog.example/api/catalog/users'),
      env as unknown as Parameters<typeof worker.fetch>[1],
    );

    expect(post.status).toBe(405);
    expect(unknown.status).toBe(404);
  });
});
