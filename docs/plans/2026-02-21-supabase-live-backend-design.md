# Supabase Live Backend Integration

**Date:** 2026-02-21
**Goal:** Make Supabase the primary source of truth for all data, so the app can be updated without redeploying.

## Context

The app has a fully configured Supabase project with 5 tables (`albums`, `songs`, `members`, `solo_albums`, `lyrics`), and the first 3 tables have working React hooks with local fallback. However, two services (`searchService`, `exportService`) bypass Supabase entirely and read from static local data. Two tables (`solo_albums`, `lyrics`) have no hooks or UI integration.

## Approach: Hook-Driven Services

Services accept data as parameters instead of importing static data. React hooks handle all Supabase fetching and fallback logic. Components pass hook data into services.

## Changes

### 1. New Hooks

**`src/hooks/useSoloAlbums.ts`**
- Fetches from `solo_albums` table, ordered by `release_date`
- Fallback to new `src/data/soloAlbums.ts` hardcoded data
- Helper: `useSoloAlbumsByMember(memberId)`

**`src/hooks/useLyrics.ts`**
- Fetches from `lyrics` table joined with `songs` via `song_id`
- Empty array fallback (lyrics data is too large to hardcode)
- Helper: `useLyricsBySongId(songId)`

### 2. New Fallback Data

**`src/data/soloAlbums.ts`**
- Hardcoded solo album data for all 7 members
- Follows the same pattern as existing `data/albums.ts`

### 3. Search Service Refactor

**Current:** `searchService.ts` creates Fuse.js instances at module load from static imports.

**New:** Create `src/hooks/useSearch.ts` that:
- Accepts data from `useSongs`, `useMembers`, `useAlbums` hooks
- Creates Fuse.js instances via `useMemo`, re-initialized when data changes
- Exposes: `searchSongs`, `searchMembers`, `searchAlbums`, `searchAll`, `getSuggestions`, `searchByMood`
- Same `SearchResult[]` return types

`searchService.ts` retains Fuse config and result mapping utilities.

### 4. Export Service Refactor

**Current:** `exportService.ts` imports static data directly.

**New:** Functions accept data as parameters:
- `exportSongsJSON(songs)`, `exportSongsCSV(songs)`
- `exportMembersJSON(members)`, `exportMembersCSV(members)`
- `exportAlbumsJSON(albums)`, `exportAlbumsCSV(albums)`
- `exportFullArchive(songs, members, albums)`

`toCSV` utility and `saveAs` logic unchanged.

### 5. Component Updates

- `RAGNetwork.tsx` uses `useSearch` hook instead of static service
- `DataHub.tsx` passes hook data to export functions

### 6. Hook Barrel Export

- `src/hooks/index.ts` exports new hooks: `useSoloAlbums`, `useLyrics`, `useSearch`

## Files Changed

| File | Action |
|------|--------|
| `src/data/soloAlbums.ts` | New |
| `src/hooks/useSoloAlbums.ts` | New |
| `src/hooks/useLyrics.ts` | New |
| `src/hooks/useSearch.ts` | New |
| `src/hooks/index.ts` | Modified |
| `src/services/searchService.ts` | Refactored |
| `src/services/exportService.ts` | Refactored |
| `src/components/features/RAGNetwork.tsx` | Modified |
| `src/components/features/DataHub.tsx` | Modified |
| `src/types/database.ts` | Verified (types already exist) |

## Not in Scope

- Member photos (directory is empty, separate task)
- Admin panel / CMS for editing data
- User auth / favorites
- Spotify / Genius API integration
- Feature flags implementation
