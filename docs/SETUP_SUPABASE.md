# Supabase Setup Guide

The BTS Neural Archive uses Supabase as an optional backend. When configured, all data (songs, albums, members, awards, concerts, etc.) is loaded from Supabase. When not configured, the app falls back to local JSON data.

## Quick Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).

2. **Add environment variables** to `.env` (copy from `.env.example`):

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

3. **Get credentials** from Supabase Dashboard → Settings → API:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

4. **Run migrations** (if you have a migration script):
   ```bash
   # Uses SUPABASE_SERVICE_ROLE_KEY for write access
   npm run db:migrate
   ```

## Data Flow

- **Hooks** (`useSongs`, `useAlbums`, `useMembers`, etc.) call `isSupabaseConfigured()`.
- If configured: fetch from Supabase tables.
- If not: load from `src/data/*.ts` (local JSON).

## Tables

The app expects tables matching the `Database` type in `src/types/database.ts`:

- `songs`, `albums`, `members`, `awards`, `concerts`
- `chart_entries`, `collaborations`, `member_events`, `lyrics`, `solo_albums`

See migration scripts in `scripts/` or Supabase SQL editor for schema.

## Troubleshooting

- **"Supabase credentials not found"** in console → Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.
- **Empty data** → Ensure tables exist and RLS policies allow read access for anon key.
- **CORS errors** → Supabase handles CORS; check project URL is correct.
