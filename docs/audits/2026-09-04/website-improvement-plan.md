# Bangtan Universe — refinement plan

Reviewed 4 September 2026. Scope: the existing website, preserving its layout language, palette, typography families, artwork, and concert identity. This is an audit and implementation backlog; application code has not been changed.

The largest opportunity is to reduce repeated information and make navigation predictable. The underlying eight-section structure works. The interface repeatedly asks visitors to read an introduction, another introduction, summary cards, and explanatory captions before reaching the actual music or records.

## Evidence and limits

Two independent code assessments covered design and technical behavior. The parent review inspected the production build in the in-app browser at 1280×720 and the Overview at 390×844. Production build passed. Eleven screenshots from this run are below.

The configured backend was unavailable during this run. Songs/albums/members used bundled fallback data; awards, tours, and media were empty, and member portraits failed to load. These observations establish weaknesses in the fallback experience, not that production always has missing data. Populated award/tour/media views, complete live search, real-device performance, screen-reader behavior, and full accessibility compliance remain unverified.

The deterministic scan completed with four warnings. Two flags concern intentional purple branding, one a small animated LED strip, and one a chart card border. None justifies redesigning the site. No browser detector overlay was injected; browser evidence came from screenshots, DOM observations, and targeted interactions.

## Priority changes

| Priority | Change | Expected benefit | Relative effort |
|---|---|---|---|
| P1 | Remove duplicate Overview summaries | Much less scanning and mobile scrolling | Small–medium |
| P1 | Shorten shared page/section introductions | Bring actual content into the first screen | Small |
| P1 | Preserve filter, navigation, and browsing state | Predictable browsing and Back behavior | Medium |
| P1 | Complete search actions and feedback | Eliminate dead ends and misleading states | Medium |
| P1 | Distinguish unavailable data from zero | More trustworthy, useful failure states | Medium |
| P2 | Improve control legibility and navigation fit | Easier scanning and clicking | Small |
| P2 | Streamline returning visits and transitions | Faster-feeling movement through the site | Small–medium |
| P2 | Finish keyboard/touch interaction patterns | Consistent access across input methods | Medium |
| P2 | Fetch and cache only needed data | Less network work and repeated loading | Medium |
| P2 | Reduce map payload and defer optional media | Less download/parse work | Medium |

### 1. Give Overview one summary, then useful content

**Observed:** The header's CollectionIndex, five-card signal strip, era highlights, and shortcuts repeat catalog, credits, recognition, and touring information. At phone width the header measured 559px tall and the signal strip another 562px. The user passes over 1,100px of summaries before the era section, excluding surrounding spacing.

**Change:** Retain one compact row of 3–4 meaningful totals. Keep the latest release and era browsing as the main content. Remove the second summary strip and repeated award/tour highlights; retain unique information in the appropriate detail section. On mobile, use a compact two-column summary instead of nine stacked summary blocks.

**Accept when:** Each headline fact appears once above the era section; a phone user reaches meaningful browsing after a short introduction. Do not achieve this by making text smaller.

Evidence: `src/components/features/sections/HomeSection/index.tsx:214`, `:227`, `:257`, `:338`; `src/index.css:1910`, `:2498`, `:2518`. Screenshots 03 and 11.

### 2. Reduce the framing around every page

**Observed:** Discography has a page heading and paragraph, metadata badges, another numbered heading, another instructional paragraph, category chips, and dropdowns before the album artwork begins around y=583px in the desktop capture. Analytics similarly repeats the selected tab inside a second introductory panel. Members includes implementation-oriented copy about equal card footprints.

**Change:** Keep the existing visual components but make secondary introductions optional. Use one page title, one short purpose sentence, and a compact toolbar. On straightforward browse pages, remove the redundant “Filterable release records” / “Equal member records” heading layer. Move detailed chart methodology and sources into a disclosure beside the relevant chart, preserving access to them.

Copy examples: “Music objects” → “Songs”; “Artist labels” → “Members”; “Open the main archive drawers” → “Explore”; “The latest catalog object anchors the archive in present tense” → omit. Align onboarding's “Catalog” and “Research” with “Discography” and “Analytics.”

**Accept when:** Album art, member portraits, and the active chart enter view earlier without changing their design or reducing useful text size.

Evidence: shared `EditorialPageHeader.tsx`, `GallerySection.tsx`, `EvidencePanel.tsx`; screenshots 04–10.

### 3. Preserve context while browsing

**Reproduced:** Choosing “Studio,” then “Wings,” resets the type dropdown to “All Types” and shows both a studio album and a repackage. The controls look combinable but are mutually clearing.

**Code finding:** App writes navigation using `history.replaceState`, so section/album/song navigation does not add the expected Back trail. Filters are local to the album grid and disappear when it unmounts. The main scroll container has no explicit navigation restoration; resizing the current page also retained a scroll offset, initially hiding its heading during mobile inspection.

**Change:** Combine compatible filters; show active filters and one clear reset. Preserve query/filter state and list position when returning from details. Push deliberate navigation into history, reserve replace for canonicalization, and restore scroll/focus appropriately. Open valid deep links directly.

**Accept when:** Studio + Wings stays selected; Album → Song → browser Back returns to Album; returning to the grid retains filters and the selected album's position.

Evidence: `AlbumGrid.tsx:136`, `:146`; `src/App.tsx:108`, `:154`, `:485`.

### 4. Make search simpler and dependable

**Reproduced:** Typing “Dynamite” shows “No results found” before submission. The initial page presents mood chips, category chips, examples, instructional copy, a provider badge, and two Search entry points.

**Code findings:** Award/concert results render as buttons but have no navigation case. Palette mood commands open Search without applying the named mood. Mood result percentages are generated by list position (`100 - i * 5`), so they should not appear to be measured match confidence. Async searches lack a guard against stale responses replacing newer results.

**Change:** Give the input visual priority. Present a small set of examples initially; make mood exploration a secondary disclosure and show category filters with results. Remove the “Supabase” badge and unsupported confidence percentages. Link the palette to “Search all records,” retaining the query. Separate idle, searching, results, completed-empty, and error states. Complete result routing and guard async responses.

**Accept when:** Every result has a working destination or accessible detail disclosure; empty feedback follows a completed search; a selected mood actually applies; an older response cannot replace newer results.

Evidence: `SearchSection.tsx:69`, `:94`, `:105`, `:167`, `:255`, `:297`; `CommandPalette.tsx:112`. Screenshot 10.

### 5. Make failure and recovery states truthful

**Observed:** The global banner says saved data is shown, while awards/tours/media show zero totals or empty records. Awards and Tours instruct visitors to “Run the … scraper,” which is a developer task. Member cards show broken portrait icons.

**Change:** Give each resource separate loading, ready, fallback, and unavailable states. Show “Unavailable” or a dash for unknown totals. Offer a section-level Retry and a useful onward link. Clear stored errors after successful recovery. Use a branded initials/portrait fallback for failed images. Keep technical scraper instructions in development documentation.

**Accept when:** A backend outage never turns into a claim of zero awards or zero tours; successful Retry clears the warning; failed portraits retain a deliberate card presentation.

Evidence: `src/App.tsx:186`, `:196`; `src/hooks/useSongs.ts:64`; `useAwards.ts:35`; `src/components/ui/DataStatusBanner.tsx:26`. Screenshots 03, 05, 07–09.

### 6. Improve readability without changing typography families

**Observed:** At 1280px the desktop header truncates the brand to “Bangt…” while fitting eight numbered uppercase destinations plus another search control. Many labels are 9–11px and faint. Their hierarchy is consistent but effortful to read.

**Change:** Reduce decorative numbering/tracking in navigation, increase important control text to roughly 12–14px, raise muted-text contrast, and switch to the compact navigation before branding gets squeezed. Reserve tiny archival labels for nonessential metadata. Use spacing to separate groups and avoid giving every nested region another border.

**Accept when:** Branding and navigation remain readable at supported widths; essential text passes measured contrast checks; touch controls have generous targets.

Evidence: `src/App.tsx:414`; `src/index.css:1781`, `:1822`, `:1936`. Screenshots 03–11. Exact contrast ratios were not measured.

### 7. Make movement feel immediate and respect input preferences

Keep the concert landing as a signature experience. Return visitors and bookmarked records should enter the archive directly, with “Concert experience” available explicitly. Replace the current 200ms exit plus 400ms entrance sequence with a short, subtle transition; honor reduced motion in both Framer and canvas rendering.

Finish drawer focus containment/restoration, shared tab semantics, pressed filter states, and focus/tap previews. In the command palette, Tab focus and arrow-key highlight can diverge; Enter is intercepted using the highlighted result rather than necessarily the focused button. Use one consistent selection model.

Evidence: `App.tsx:93`, `:175`, `:212`, `:306`; `SectionTransition.tsx:3`; `CommandPalette.tsx:183`, `:264`; `SearchSection.tsx:259`; `StarFieldCanvas.tsx:87`; `ArmyBombCanvas.tsx:231`.

### 8. Optimize the work the browser actually does

The production build passed. Selected generated chunks:

| Chunk | Minified | Gzip |
|---|---:|---:|
| TourMap | 873.47 KB | 275.21 KB |
| Main index | 433.19 KB | 127.45 KB |
| Shared CategoricalChart | 243.16 KB | 78.79 KB |
| SectionTransition/shared motion | 123.03 KB | 40.65 KB |
| CSS | 139.11 KB | 21.16 KB |

These are build artifact sizes, not measured page downloads or Core Web Vitals. Shared dependencies can reside in a chunk named after a small component; the name does not mean that component alone accounts for all bytes. Sections already use lazy imports, which should be preserved.

- **Data:** App starts nine data hooks even while the landing is displayed. Load section-specific data on demand, share cached resources, and fetch lyrics by song ID. The current single-song lyrics helper fetches the entire table again.
- **Map:** `TourMap.tsx:10` statically imports `world-atlas/countries-50m.json`. Evaluate a lower-detail outline at the displayed scale, fetch geometry as a separate cacheable asset, and retain on-demand map loading. Compare the output visually before choosing a smaller dataset.
- **Optional audio:** `useConcertBeat.ts:350` prewarms YouTube at idle while sound is off; `:415` prefetches preview URLs. Consider initializing after “Tap for sound,” with immediate feedback during loading. This trades less startup work for possible first-play delay.
- **Animation:** Cap canvas pixel ratio and render a static frame for reduced motion. Profile before changing particle counts; the existing pre-rendered glow sprites are already a useful optimization.

**Validate with:** cold-load and repeat-visit network traces, bytes and request counts per section, interaction traces for navigation/search/map, and a real mobile device. No percentage speedup is claimed here.

## Suggested implementation order

1. Overview deduplication, shorter shared intros, plain labels, navigation fit.
2. Filter/history/search correctness, per-section loading and recovery, image fallbacks.
3. On-demand resources, map geometry, optional audio initialization, motion/input accessibility.

Preserve the existing color system, editorial typography, album and portrait treatment, section accents, eight destinations, and optional concert atmosphere throughout.

## Heuristic review

Provisional severity, 0 = no evident issue, 4 = critical blocker. Independent code assessment; these are review judgments, not user-study measurements.

| Heuristic | Severity / 4 |
|---|---:|
| System status | 2 |
| Familiar language | 2 |
| User control and freedom | 3 |
| Consistency | 3 |
| Error prevention | 2 |
| Recognition over recall | 2 |
| Efficiency | 2 |
| Minimalism | 3 |
| Error recovery | 2 |
| Help | 1 |

Total severity: 22/40. First recorded review for this target; no historical trend. First-time visitors face repeated framing and terminology changes; frequent users face broken Back/filter expectations; mobile and keyboard users face long summary stacks and incomplete focus/preview behavior.

## Captured flow

1. **Landing — distinctive; repeat-visit entry needs refinement.** Audio is opt-in. Preserve the atmosphere; defer optional media initialization and honor reduced motion.

![01 Landing](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/01-landing.jpg)

2. **Onboarding — clear but adds friction.** Skip exists; section names differ from navigation. Keep it optional and align labels.

![02 Onboarding](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/02-onboarding.jpg)

3. **Overview — high density; fallback totals misleading.** Repeated statistics and destinations dominate the first screen.

![03 Overview](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/03-overview.jpg)

4. **Discography — usable artwork grid; redundant framing and filter bug.** Studio then Wings resets type to All Types.

![04 Discography](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/04-discography.jpg)

5. **Members — consistent cards; portrait failure needs a fallback.** Comparison is available below; its empty controls can be revealed on request.

![05 Members](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/05-members.jpg)

6. **Analytics — useful tab structure; content starts too low.** Remove the repeated active-view introduction. Full analytical accuracy was outside scope.

![06 Analytics](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/06-analytics.jpg)

7. **Awards — data-blocked in this run.** Zero totals and scraper instructions do not explain recoverable unavailability to visitors. Populated view not validated.

![07 Awards](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/07-awards.jpg)

8. **Tours — data-blocked in this run.** Same unavailable/zero issue; populated map interactions not validated.

![08 Tours](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/08-tours.jpg)

9. **Media — data-blocked in this run.** “No media found” needs to distinguish filtering from failed loading. Populated records not validated.

![09 Media](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/09-media.jpg)

10. **Search — too many initial choices; premature empty feedback reproduced.** Live complete-dataset search was unavailable.

![10 Search](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/10-search.jpg)

11. **Mobile Overview — major vertical-density issue.** No document-width overflow at 390px; the nine summary blocks place core content well below the first screen.

![11 Mobile Overview](/Users/praks/.codex/worktrees/2f99/Bangtang-Universe/docs/audits/2026-09-04/11-mobile-overview.jpg)
