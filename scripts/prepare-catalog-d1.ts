import fs from 'node:fs';
import path from 'node:path';
import { CATALOG_TABLES, type CatalogTable } from '../src/services/catalogSchema';

type Row = Record<string, unknown>;
type Export = { tables: Record<string, Row[]> };

const root = process.cwd();
const exportDir = path.join(root, 'exports');
const explicit = process.argv[2];
const source = explicit ?? fs.readdirSync(exportDir)
  .filter(name => /^catalog-.*\.json$/.test(name))
  .sort().at(-1);
if (!source) throw new Error('No catalog export found');
const sourcePath = path.isAbsolute(source) ? source : path.join(exportDir, source);
const catalog = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as Export;
const snapshotDir = path.join(root, 'public/data/catalog');
const importDir = path.join(exportDir, 'catalog-import');
fs.mkdirSync(snapshotDir, { recursive: true });
fs.mkdirSync(importDir, { recursive: true });

function sql(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number: ${value}`);
    return String(value);
  }
  if (typeof value === 'boolean') return value ? '1' : '0';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `'${text.replaceAll("'", "''")}'`;
}

function migrateRow(table: CatalogTable, row: Row): Row {
  if (table === 'members') return { ...row, image_url: `/member-photos/${row.id}.jpg` };
  return row;
}

function sortRows(rows: Row[], orderBy: string): Row[] {
  const [primaryClause] = orderBy.split(',');
  const [column, direction = 'ASC'] = primaryClause.trim().split(/\s+/);
  const multiplier = direction === 'DESC' ? -1 : 1;
  return [...rows].sort((left, right) => {
    const idOrder = typeof left.id === 'number' && typeof right.id === 'number'
      ? left.id - right.id
      : String(left.id).localeCompare(String(right.id));
    const a = left[column];
    const b = right[column];
    if (a == null && b == null) return idOrder;
    if (a == null) return direction === 'DESC' ? -1 : 1;
    if (b == null) return direction === 'DESC' ? 1 : -1;
    const primary = String(a).localeCompare(String(b), 'en', { numeric: true }) * multiplier;
    return primary || idOrder;
  });
}

const manifest: Record<string, number> = {};
for (const table of Object.keys(CATALOG_TABLES) as CatalogTable[]) {
  const config = CATALOG_TABLES[table];
  const rawRows = catalog.tables[table];
  if (!Array.isArray(rawRows) || rawRows.length === 0) throw new Error(`Missing or empty table: ${table}`);
  const rows = sortRows(rawRows.map(row => migrateRow(table, row)), config.orderBy);
  const ids = new Set(rows.map(row => String(row.id)));
  if (ids.size !== rows.length) throw new Error(`Duplicate ids in ${table}`);
  for (const row of rows) {
    const missing = config.columns.filter(column => !(column in row));
    if (missing.length) throw new Error(`${table} row ${row.id} missing ${missing.join(', ')}`);
  }
  manifest[table] = rows.length;
  fs.writeFileSync(path.join(snapshotDir, `${table}.json`), JSON.stringify({ table, count: rows.length, rows }));
  const statements = rows.map(row => {
    const values = config.columns.map(column => sql(row[column]));
    return `INSERT INTO ${table} (${config.columns.join(', ')}) VALUES (${values.join(', ')});`;
  });
  fs.writeFileSync(path.join(importDir, `${table}.sql`), `${statements.join('\n')}\n`);
}
fs.writeFileSync(path.join(snapshotDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ source: path.relative(root, sourcePath), manifest }, null, 2));
