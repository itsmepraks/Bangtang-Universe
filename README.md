# Bangtan Universe

A data-driven React dashboard for BTS discography, tours, awards, member profiles, media, and analytics.

## Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Catalog API:** Cloudflare Worker at `/api/catalog/:table`
- **Database:** Cloudflare D1 (SQLite)
- **Offline fallback:** versioned JSON snapshots in `public/data/catalog`
- **Search:** client-side Fuse.js over the loaded catalog

The Worker exposes read-only `GET` endpoints for the 11 catalog tables. Scraper and seed scripts write directly to D1 through Cloudflare's authenticated API. If the Worker cannot be reached, the app loads the complete static snapshot and displays a saved-data warning.

## Local development

```bash
npm install
cp .env.example .env
npm run catalog:migrate:local
npm run catalog:dev
```

In another terminal:

```bash
npm run dev
```

The default `.env.example` points the app at the local Worker on port 8787. To use the deployed catalog, set:

```dotenv
VITE_CATALOG_API_URL=https://bangtan-universe-catalog.personal-domains-680.workers.dev/api/catalog
```

## Catalog operations

| Command | Purpose |
| --- | --- |
| `npm run catalog:prepare` | Generate D1 imports and complete fallback snapshots from an export |
| `npm run catalog:photos` | Copy member portraits into static local assets |
| `npm run catalog:migrate:local` | Apply the schema to local D1 |
| `npm run catalog:migrate:cloud` | Apply the schema to the configured remote D1 database |
| `npm run catalog:deploy` | Deploy the read-only Worker |
| `npm run catalog:verify` | Compare every cloud row and field with the prepared source snapshot |
| `npm run catalog:export` | Export all catalog tables through the Worker API |

Scraper and seed scripts require `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_D1_DATABASE_ID`. Keep the API token only in an ignored local environment file.

## Data pipeline

The numbered scripts gather discography, lyrics, chart, award, tour, collaboration, and member data. Their shared admin client writes parameterized SQL to D1. Cached source responses remain under `scripts/cache`.

## Verification

```bash
npm test
npm run lint
npm run build
npm run catalog:typecheck
npm run catalog:verify
```

## Project structure

```text
src/hooks/                 Catalog resource hooks with snapshot fallback
src/services/              Catalog schema and Worker client
workers/catalog/           Worker source, D1 schema, and Wrangler configs
public/data/catalog/       Complete offline catalog snapshots
public/member-photos/      Migrated member portraits
scripts/                   Scrapers, migration, export, and verification tools
```

Personal portfolio project. All BTS-related content belongs to BigHit Music / HYBE.
