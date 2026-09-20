# Catalog database

The catalog runs on Cloudflare D1. The canonical schema is
[`workers/catalog/migrations/0001_catalog.sql`](../workers/catalog/migrations/0001_catalog.sql).

Use `npm run catalog:migrate:local` for a local database or
`npm run catalog:migrate:cloud` for the configured remote D1 database.
