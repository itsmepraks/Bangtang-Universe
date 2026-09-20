import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CATALOG_TABLES, type CatalogTable } from '../src/services/catalogSchema';

const base = (process.argv[2] ?? process.env.CATALOG_API_URL ?? 'https://bangtan-universe-catalog.personal-domains-680.workers.dev/api/catalog').replace(/\/$/, '');
const root = process.cwd();
let total = 0;

for (const table of Object.keys(CATALOG_TABLES) as CatalogTable[]) {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'public/data/catalog', `${table}.json`), 'utf8'));
  const response = await fetch(`${base}/${table}`);
  assert.equal(response.status, 200, `${table} returned ${response.status}`);
  assert.match(response.headers.get('cache-control') ?? '', /max-age=300/);
  const actual = await response.json();
  assert.deepEqual(actual, expected, `${table} differs from the prepared source snapshot`);
  total += expected.count;
  console.log(`${table}: ${expected.count} exact rows`);
}

const post = await fetch(`${base}/awards`, { method: 'POST' });
assert.equal(post.status, 405, 'write request was not rejected');
const missing = await fetch(`${base}/not_a_table`);
assert.equal(missing.status, 404, 'unknown table was not rejected');
console.log(`Verified ${total} rows across ${Object.keys(CATALOG_TABLES).length} tables; writes rejected.`);
