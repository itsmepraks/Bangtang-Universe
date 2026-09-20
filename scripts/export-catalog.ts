import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import { CATALOG_TABLES, type CatalogTable } from '../src/services/catalogSchema';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });
const base = (process.env.VITE_CATALOG_API_URL ?? '').replace(/\/$/, '');
if (!base) throw new Error('VITE_CATALOG_API_URL is required');

const tables: Record<string, Record<string, unknown>[]> = {};
for (const table of Object.keys(CATALOG_TABLES) as CatalogTable[]) {
  const response = await fetch(`${base}/${table}`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Export failed for ${table} (${response.status}); no completed export written`);
  const payload = await response.json() as { table?: unknown; count?: unknown; rows?: unknown };
  if (payload.table !== table || !Array.isArray(payload.rows) || payload.count !== payload.rows.length) {
    throw new Error(`Incomplete export for ${table}`);
  }
  const rows = payload.rows as Record<string, unknown>[];
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error(`Export ID mismatch for ${table}`);
  tables[table] = rows;
  console.log(`${table}: ${rows.length} records verified`);
}
const exportedAt = new Date().toISOString();
const destination = `exports/catalog-${exportedAt.replaceAll(':', '-')}.json`;
await mkdir('exports', { recursive: true });
await writeFile(destination, JSON.stringify({ version: 2, provider: 'cloudflare-d1', exportedAt, tables }, null, 2) + '\n', {
  flag: 'wx', mode: 0o600,
});
console.log(`Cloudflare D1 catalog export saved to ${destination}`);
