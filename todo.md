# BTS Universe - Todo & Status Report

## Completed
- [x] **LandingRitual concert-stage redesign** (2025-03-02)
- [x] **LandingRitual dark/sleek refinement** (2025-03-02)
- [x] **Build fixes** (2025-03-02)
  - Added `description?: string | null` to `Song` in `types/database.ts` (SongDetail.tsx)
  - Created `src/types/react-simple-maps.d.ts` for TourMap types
  - Added explicit types to TourMap zoom/geographies callbacks

---

## In Progress
- (none)

---

## Pending / Yet to Do

### Visual
- [ ] **AESTHETIC_PLAN.md** - Phases 1–4 not fully implemented:
  - Phase 1: Whalien 52 constellation (swimming whale SVG), layered bokeh
  - Phase 2: Hands of Unity landing (7 stylized hand SVGs, central light source)
  - Phase 3: Glass-Dream HUDs (inner glow, nebula textures, breathing glows)
  - Phase 4: Warp effect enhancement, interactive stars parallax
- [ ] **Tour map refinements** (`docs/plans/2026-02-27-tour-map.md`)

### Data
- [ ] **Song descriptions** — `description` added to type but may not exist in DB; run scraper or add manually
- [ ] **Spotify** — `VITE_SPOTIFY_*` env vars not used

### Technical
- [ ] **Bundle size** — TourMap chunk ~870 kB; `CategoricalChart` ~243 kB; consider code-splitting
- [ ] **Migrate imports** — Gradually replace `../../` with `@/` path aliases

---

## Recently Completed (2025-03-02)
- [x] **Overview Bento redesign** — BentoCard grid in HomeSection
- [x] **Awards podium redesign** — AwardPodium with group/solo modes, collapsible tree
- [x] **Supabase docs** — `docs/SETUP_SUPABASE.md`; README link
- [x] **AI search wiring** — `aiSearchService.ts`, `searchAllAsync`, `VITE_AI_SEARCH_API_URL`; AI badge in SearchSection
- [x] **Path aliases** — `@` → `src` in vite and tsconfig
- [x] **Build optimizations** — manualChunks for react-vendor, charts
- [x] **Tests** — Vitest setup, `aiSearchService.test.ts`

---

## Broken / Fixed
| Issue | Status |
|-------|--------|
| SongDetail.tsx `song.description` | ✅ Fixed |
| TourMap.tsx react-simple-maps types | ✅ Fixed |
| Build | ✅ Passes |

---

## Build Status
- **TypeScript:** ✅ `tsc -b` passes
- **Vite build:** ✅ Succeeds
- **Lint:** Run `npm run lint` to verify

---

## Recommendations

### Visual
1. Implement AESTHETIC_PLAN phases incrementally (start with Phase 1 bokeh/Whalien).
2. Add subtle grain/noise overlay for painterly feel (Phase 2).
3. Enhance Warp transition (bokeh + stars flow) when moving from Landing → Dashboard.

### Data
1. Add `description` column to songs table if using Supabase; run `scrape:genius` or similar.
2. Wire AI search if RAG/API is available.
3. Add `.env.example` with all required vars documented.

### Technical
1. Add Vitest; write tests for hooks and services.
2. Split TourMap into lazy-loaded chunk; consider lighter map library.
3. Add `paths` in tsconfig for `@/components`, `@/hooks`, etc.
