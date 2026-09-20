import type { D1Database } from '@cloudflare/workers-types';
import { CATALOG_TABLES, isCatalogTable } from '../../src/services/catalogSchema';

type Row = Record<string, unknown>;

function decodeRow(row: Row, jsonColumns: readonly string[], booleanColumns: readonly string[]): Row {
  const decoded = { ...row };
  for (const column of jsonColumns) {
    const value = decoded[column];
    if (typeof value === 'string') decoded[column] = JSON.parse(value);
  }
  for (const column of booleanColumns) {
    const value = decoded[column];
    if (value !== null && value !== undefined) decoded[column] = value === 1 || value === true;
  }
  return decoded;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};
export default {
  async fetch(request: Request, env: { CATALOG_DB: D1Database }): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: { ...cors, Allow: 'GET, OPTIONS' } });
    }

    const match = url.pathname.match(/^\/api\/catalog\/([a-z_]+)$/);
    if (!match || !isCatalogTable(match[1])) return new Response('Not found', { status: 404, headers: cors });
    const table = match[1];
    const config = CATALOG_TABLES[table];
    try {
      const result = await env.CATALOG_DB.prepare(
        `SELECT ${config.columns.join(', ')} FROM ${table} ORDER BY ${config.orderBy}`,
      ).all<Row>();
      if (!result.success) throw new Error('Database query failed');
      const rows = result.results.map(row => decodeRow(row, config.jsonColumns, config.booleanColumns));
      return Response.json({ table, count: rows.length, rows }, {
        headers: { ...cors, 'Cache-Control': 'public, max-age=300' },
      });
    } catch {
      return Response.json({ error: `${table} is temporarily unavailable` }, {
        status: 503,
        headers: { ...cors, 'Cache-Control': 'no-store' },
      });
    }
  },
};
