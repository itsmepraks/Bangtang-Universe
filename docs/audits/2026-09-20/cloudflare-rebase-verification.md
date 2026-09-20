# Cloudflare rebase verification — 2026-09-20

Rebased `codex/concert-experience` onto `origin/main` migration commit `9a63801`.

## Data preservation

- The 11 catalog snapshots, manifest, seven migrated portraits, Worker, schema, and catalog service match main byte for byte.
- `npm run catalog:verify` compared every deployed Worker response field for field with the snapshots: 3,377 rows matched. The verifier also confirmed writes are rejected and unknown tables return 404.
- Checked unique IDs in all tables and album/song, lyric/song, solo-album/member, and event/member references; no duplicates or orphan references were found in those checks.

| Table | Exact rows |
| --- | ---: |
| albums | 100 |
| songs | 620 |
| members | 7 |
| solo_albums | 15 |
| lyrics | 460 |
| awards | 1020 |
| chart_entries | 584 |
| concerts | 351 |
| collaborations | 132 |
| member_events | 66 |
| media | 22 |

## Integration

- Kept the Cloudflare hooks and local Fuse search from main; removed the concert branch’s remaining Supabase client/configuration checks.
- Preserved deferred loading for lyrics, media, chart entries, and member events through the shared catalog hook.
- Saved snapshots remain visible when the live catalog is unavailable, including overview award/show counts.
- Member cards and profiles use migrated `/member-photos/` assets, including their fallback. Earlier approved portrait assets remain preserved in the branch.
- Album cards and detail pages now reuse the existing HTTPS artwork component and its failure placeholder.
- The concert scene, artwork, audio rhythm, and landing component are unchanged from the pre-rebase backup.

## Verification

- Production build, ESLint, Worker typecheck, and 40 tests passed.
- Real browser with live Cloudflare data: overview counts, all seven portraits, featured album with 25 tracks, IDOL lyrics, awards, tours, media, analytics, members, search, and concert entrance.
- Separate preview with no live endpoint: overview, awards, tours, media, and analytics loaded the full saved catalog with a warning.
- New regression tests cover deferred catalog reads, outage fallback and recovery, and failed external artwork.

## Image audit and existing follow-ups

- All seven migrated member photos returned HTTP 200 with image content and decoded in the browser.
- Of 73 stored external album cover URLs, 49 returned image content in the direct HTTP check; 24 returned HTTP 500 or timed out. These are observations of external availability, not confirmed missing images: NO MORE DREAM subsequently displayed correctly in the browser.
- 27 albums already have no stored cover URL on main. Existing title lookup and placeholder behavior remain available. No album records or URLs were rewritten or discarded.
- 58 albums already have era `Unknown`; this remains visible and filterable rather than silently losing those records.
- Separate existing UI issue: Awards header labels all 1,020 records as “nominations,” while the result breakdown correctly shows 640 wins and 380 nominations. Left unchanged in this migration.

### Unsuccessful direct image requests

| Album | Result |
| --- | --- |
| NO MORE DREAM | 500 |
| THE BEST OF 防彈少年團 | 500 |
| MIC Drop (Steve Aoki remix) | 500 |
| MIC Drop / DNA / Crystal Snow | 500 |
| FAKE LOVE / Airplane pt.2 | 500 |
| Waste It on Me | 500 |
| FAKE LOVE (Rocking Vibe mix) | 500 |
| Waste It on Me (Cheat Codes remix) | 500 |
| BTS WORLD: Original Soundtrack | unreachable |
| Euphoria (JUSEVA! Remix) | unreachable |
| Make It Right (EDM remix) | unreachable |
| Make It Right (acoustic remix) | unreachable |
| MAP OF THE SOUL : 7 〜 THE JOURNEY 〜 | 500 |
| Black Swan | unreachable |
| Stay Gold | 500 |
| Butter (Hotter, Sweeter, Cooler) | 500 |
| BTS, THE BEST | 500 |
| Butter (Hotter remix) | unreachable |
| My Universe | 500 |
| My Universe (SUGA’s remix) | 500 |
| Bad Decisions (Acoustic) | 500 |
| ARIRANG | unreachable |
| SWIM with RM (chill hip hop remix) | unreachable |
| SWIM with Jung Kook (acoustic lofi remix) | unreachable |

## Scope

No production data writes, migrations, or deployments were performed. A local backup branch, `codex/backup-concert-before-cloudflare-rebase`, retains the pre-rebase state.
