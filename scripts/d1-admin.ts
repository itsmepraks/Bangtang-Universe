import { CATALOG_TABLES, isCatalogTable, type CatalogTable } from '../src/services/catalogSchema.js';

type Row = Record<string, unknown>;
type Result = { data: any; error: Error | null; count: number | null };
type Operation = 'select' | 'insert' | 'upsert' | 'update' | 'delete';

function identifier(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return value;
}

function normalizeValue(table: CatalogTable, column: string, value: unknown): unknown {
  if (CATALOG_TABLES[table].jsonColumns.includes(column as never) && value !== null && value !== undefined) {
    return JSON.stringify(value);
  }
  if (CATALOG_TABLES[table].booleanColumns.includes(column as never) && typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value === '{}' ? '[]' : value;
}

function decodeRows(table: CatalogTable, rows: Row[]): Row[] {
  const config = CATALOG_TABLES[table];
  return rows.map(row => {
    const decoded = { ...row };
    for (const column of config.jsonColumns) {
      if (typeof decoded[column] === 'string') decoded[column] = JSON.parse(decoded[column] as string);
    }
    for (const column of config.booleanColumns) {
      if (decoded[column] !== null && decoded[column] !== undefined) decoded[column] = decoded[column] === 1;
    }
    return decoded;
  });
}

class D1Query implements PromiseLike<Result> {
  private operation: Operation = 'select';
  private selected = '*';
  private values: Row[] = [];
  private filters: { sql: string; params: unknown[] }[] = [];
  private orders: string[] = [];
  private countRequested = false;
  private head = false;
  private rowLimit: number | null = null;
  private offset = 0;
  private one = false;
  private conflict = '';

  constructor(private client: D1Admin, private table: CatalogTable) {}

  select(columns = '*', options: { count?: string; head?: boolean } = {}) {
    if (this.operation === 'select') {
      this.selected = columns;
      this.countRequested = options.count === 'exact';
      this.head = options.head === true;
    } else {
      this.selected = columns;
    }
    return this;
  }
  insert(value: Row | Row[]) { this.operation = 'insert'; this.values = Array.isArray(value) ? value : [value]; return this; }
  upsert(value: Row | Row[], options: { onConflict?: string } = {}) {
    this.operation = 'upsert'; this.values = Array.isArray(value) ? value : [value]; this.conflict = options.onConflict ?? 'id'; return this;
  }
  update(value: Row) { this.operation = 'update'; this.values = [value]; return this; }
  delete() { this.operation = 'delete'; return this; }
  eq(column: string, value: unknown) { return this.where(`${identifier(column)} = ?`, [normalizeValue(this.table, column, value)]); }
  neq(column: string, value: unknown) { return this.where(`${identifier(column)} <> ?`, [normalizeValue(this.table, column, value)]); }
  is(column: string, value: null) { if (value !== null) throw new Error('D1 is() only supports null'); return this.where(`${identifier(column)} IS NULL`, []); }
  not(column: string, operator: string, value: unknown) {
    if (operator === 'is' && value === null) return this.where(`${identifier(column)} IS NOT NULL`, []);
    if (operator === 'eq') return this.where(`${identifier(column)} <> ?`, [normalizeValue(this.table, column, value)]);
    throw new Error(`Unsupported not operator: ${operator}`);
  }
  ilike(column: string, pattern: string) { return this.where(`LOWER(${identifier(column)}) LIKE LOWER(?)`, [pattern]); }
  in(column: string, values: unknown[]) {
    if (!values.length) return this.where('1 = 0', []);
    return this.where(`${identifier(column)} IN (${values.map(() => '?').join(', ')})`, values.map(value => normalizeValue(this.table, column, value)));
  }
  or(expression: string) {
    const clauses = expression.split(',').map(part => {
      const [column, operator, ...raw] = part.split('.');
      const value = raw.join('.');
      if (operator === 'eq') return { sql: `${identifier(column)} = ?`, params: [normalizeValue(this.table, column, value)] };
      if (operator === 'ilike') return { sql: `LOWER(${identifier(column)}) LIKE LOWER(?)`, params: [value] };
      throw new Error(`Unsupported or operator: ${operator}`);
    });
    return this.where(`(${clauses.map(clause => clause.sql).join(' OR ')})`, clauses.flatMap(clause => clause.params));
  }
  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC';
    const nulls = options.nullsFirst === undefined ? '' : options.nullsFirst ? ' NULLS FIRST' : ' NULLS LAST';
    this.orders.push(`${identifier(column)} ${direction}${nulls}`); return this;
  }
  limit(value: number) { this.rowLimit = value; return this; }
  range(from: number, to: number) { this.offset = from; this.rowLimit = to - from + 1; return this; }
  single() { this.one = true; this.rowLimit = 2; return this; }

  then<TResult1 = Result, TResult2 = never>(onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private where(sql: string, params: unknown[]) { this.filters.push({ sql, params }); return this; }
  private whereSql() { return this.filters.length ? ` WHERE ${this.filters.map(filter => filter.sql).join(' AND ')}` : ''; }
  private filterParams() { return this.filters.flatMap(filter => filter.params); }

  private async execute(): Promise<Result> {
    try {
      if (this.operation === 'select') return await this.executeSelect();
      const { sql, params } = this.mutationSql();
      const rows = decodeRows(this.table, await this.client.query(sql, params));
      const data = this.one ? rows[0] ?? null : rows;
      if (this.one && rows.length !== 1) return { data: null, error: new Error(`Expected one ${this.table} row, received ${rows.length}`), count: null };
      return { data, error: null, count: null };
    } catch (cause) {
      return { data: null, error: cause instanceof Error ? cause : new Error(String(cause)), count: null };
    }
  }

  private async executeSelect(): Promise<Result> {
    const columns = this.selected === '*' ? '*' : this.selected.split(',').map(value => identifier(value.trim())).join(', ');
    const where = this.whereSql();
    const params = this.filterParams();
    let count: number | null = null;
    if (this.countRequested) {
      const countRows = await this.client.query(`SELECT COUNT(*) AS count FROM ${this.table}${where}`, params);
      count = Number(countRows[0]?.count ?? 0);
    }
    if (this.head) return { data: null, error: null, count };
    const order = this.orders.length ? ` ORDER BY ${this.orders.join(', ')}` : '';
    const limit = this.rowLimit === null ? '' : ` LIMIT ${this.rowLimit} OFFSET ${this.offset}`;
    const rows = decodeRows(this.table, await this.client.query(`SELECT ${columns} FROM ${this.table}${where}${order}${limit}`, params));
    const data = this.one ? rows[0] ?? null : rows;
    if (this.one && rows.length !== 1) return { data: null, error: new Error(`Expected one ${this.table} row, received ${rows.length}`), count };
    return { data, error: null, count };
  }

  private mutationSql(): { sql: string; params: unknown[] } {
    const where = this.whereSql();
    const filterParams = this.filterParams();
    if (this.operation === 'delete') return { sql: `DELETE FROM ${this.table}${where} RETURNING *`, params: filterParams };
    if (this.operation === 'update') {
      const row = this.withTimestamps(this.values[0]);
      const columns = Object.keys(row).map(identifier);
      return { sql: `UPDATE ${this.table} SET ${columns.map(column => `${column} = ?`).join(', ')}${where} RETURNING ${this.selected}`, params: [...columns.map(column => normalizeValue(this.table, column, row[column])), ...filterParams] };
    }
    const rows = this.values.map(row => this.withTimestamps(row));
    if (!rows.length) throw new Error('Cannot write an empty row set');
    const columns = [...new Set(rows.flatMap(row => Object.keys(row)))].map(identifier);
    const params = rows.flatMap(row => columns.map(column => normalizeValue(this.table, column, row[column] ?? null)));
    const placeholders = rows.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    let conflict = '';
    if (this.operation === 'upsert') {
      const keys = this.conflict.split(',').map(value => identifier(value.trim()));
      const updates = columns.filter(column => !keys.includes(column)).map(column => `${column} = excluded.${column}`).join(', ');
      conflict = ` ON CONFLICT (${keys.join(', ')}) DO UPDATE SET ${updates}`;
    }
    return { sql: `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES ${placeholders}${conflict} RETURNING ${this.selected}`, params };
  }

  private withTimestamps(row: Row): Row {
    const now = new Date().toISOString();
    const result = { ...row };
    if ('created_at' in Object.fromEntries(CATALOG_TABLES[this.table].columns.map(column => [column, true])) && result.created_at === undefined) result.created_at = now;
    if (this.table === 'albums' && result.updated_at === undefined) result.updated_at = now;
    return result;
  }
}

export class D1Admin {
  private endpoint: string;
  constructor(private token: string, accountId: string, databaseId: string) {
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
  }
  from(table: string) {
    if (!isCatalogTable(table)) throw new Error(`Unknown catalog table: ${table}`);
    return new D1Query(this, table);
  }
  async query(sql: string, params: unknown[]): Promise<Row[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    });
    const payload = await response.json() as { success?: boolean; errors?: { message?: string }[]; result?: { success?: boolean; results?: Row[]; error?: string }[] };
    const result = payload.result?.[0];
    if (!response.ok || !payload.success || !result?.success) {
      throw new Error(result?.error ?? payload.errors?.[0]?.message ?? `Cloudflare D1 request failed (${response.status})`);
    }
    return result.results ?? [];
  }
}

export function createD1Admin(): D1Admin {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  if (!token || !accountId || !databaseId) {
    throw new Error('Missing CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, or CLOUDFLARE_D1_DATABASE_ID');
  }
  return new D1Admin(token, accountId, databaseId);
}
