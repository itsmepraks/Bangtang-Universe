# Editorial Museum Dashboard Design

## Purpose

The current dashboard has useful data, but the presentation feels generic: dark cards, repeated metric tiles, purple glow, and charts without a strong point of view. The redesign should make Bangtan Universe feel authored, specific, and curated.

The target direction is **Editorial Atlas + Museum Exhibition**: a data publication with the structure of a research essay and the object-level care of a museum collection.

## Design Thesis

Bangtan Universe should not introduce itself as a stats dashboard. It should introduce itself as a curated archive of a cultural system:

> Seven artists, one moving archive.

The product should help a visitor understand how BTS changed over time across music, members, touring, awards, media, and solo/group transitions. Each page should make an argument, then support it with evidence.

## Design Principles

### 1. Lead With Claims

Every major page opens with a thesis and a short curatorial note. Page titles should not be generic labels like "Overview" or "Analytics" alone. They should make a readable claim.

Examples:

- Overview: "Seven artists, one moving archive."
- Discography: "The eras are the structure."
- Members: "Seven careers, one shared origin."
- Analytics: "Sound, authorship, and recognition moved together."
- Tours: "The archive became geographic."
- Awards: "Recognition arrived in waves."

### 2. Turn Pages Into Galleries

Sections should feel like numbered galleries or chapters rather than equal dashboard widgets.

Each gallery block should include:

- A small section number or collection label
- A clear claim
- One primary chart, table, map, or object group
- A caption explaining what to notice
- A source or data note where useful

### 3. Replace Generic Cards With Object Labels

Metric cards should become museum-style labels. A label should include context, classification, and one meaningful number instead of a large number floating on a tile.

Object label pattern:

- Classification: "Release", "Tour footprint", "Authorship", "Recognition"
- Title: the record or concept
- Date or range
- One key number
- One sentence of context
- Link to the deeper section

### 4. Restrain The Visual System

The current purple/glass/cosmic styling should be reduced inside the dashboard. The landing experience can remain more theatrical, but the dashboard should feel editorial and archival.

Preferred materials:

- Off-black ink and warm near-black backgrounds
- Paper-like surfaces or quiet panels
- Hairline borders and dividers
- Serif or editorial display typography for claims if added safely
- Compact sans typography for labels, data, and navigation
- BTS purple as annotation ink, not a full-page atmosphere
- Sparse use of glow, blur, gradients, and rounded bento cards

Cards should use smaller radii and more deliberate spacing. Charts should feel embedded in a page, not dropped into a widget.

### 5. Make The Structure BTS-Specific

The information architecture should use BTS-specific concepts, not generic dashboard categories.

Useful frames:

- Eras and comeback arcs
- Group-to-solo transitions
- Member authorship and creative roles
- Tour geography and scale
- Awards recognition over time
- Media appearances as cultural memory
- Songs and albums as collection objects

## Page Direction

### Overview

The overview becomes the entrance to the permanent collection.

First screen:

- Thesis heading: "Seven artists, one moving archive."
- Curatorial note explaining the archive as music, movement, recognition, and memory
- Collection index summarizing releases, members, awards, tours, and media as labeled records
- One primary era timeline or "system map" chart
- A small set of featured object labels, such as latest release, authorship peak, tour footprint, and recognition milestone

The overview should not show every dataset at once. It should create orientation and taste.

### Discography

Discography becomes an era catalog.

The album grid should be reframed as collection objects grouped by era. Album detail pages should include release context, tracklist, title-track emphasis, related songs, and where the record sits in the larger era story.

### Members

Members becomes a career gallery.

Each member card should feel less like a profile tile and more like an artist label: stage name, role, creative markers, solo catalog, awards, writing credits, and a short arc. Member detail should emphasize chronology and creative contribution.

### Analytics

Analytics becomes the research wing.

Tabs can remain, but each tab should open with a claim and behave like a chapter. Charts need captions and stronger hierarchy. The goal is not more charts; it is better explanations.

Suggested chapters:

- The Sound: energy, valence, era movement
- Mood & Lyrics: lyrical and emotional patterns
- Who Writes: member authorship and contribution
- Milestones: releases, awards, charts, touring moments
- Discover: exploratory tools, search, and recommendations

### Tours

Tours becomes a geographic exhibition.

The map should be supported by route context, tour scale, city/country counts, and "what changed" captions. It should feel like the archive moving across the world.

### Awards

Awards becomes a recognition chronology.

The page should emphasize waves, turning points, ceremonies, categories, and group/solo distinction. Avoid treating every award as an equal tile.

### Media and Search

Media and Search can stay more tool-like, but should inherit the restrained visual language. Media should feel like a viewing room or archive index. Search should feel like a research desk.

## Component Implications

Create or refactor toward these shared UI patterns:

- `EditorialPageHeader`: section label, thesis heading, curatorial note, optional metadata
- `GallerySection`: numbered chapter block with title, claim, content, caption, and source note
- `ObjectLabel`: museum label replacement for generic stat cards
- `EvidencePanel`: chart/table wrapper with caption and source note
- `CollectionIndex`: compact navigation and counts for overview

Existing components such as `StatCard`, `BentoCard`, and `ChartPanel` should either be replaced or adapted so they support the editorial museum language.

## Interaction Rules

- Navigation stays efficient and recognizable.
- The app remains a dashboard, not a static article.
- Object labels and charts should link into deeper pages.
- Search and command palette remain useful entry points.
- Mobile layouts should preserve the thesis-first reading order.

## Navigation Direction

The persistent desktop sidebar should be removed. Its current shape reads as generic SaaS dashboard chrome: large app brand block, vertical icon list, purple active pill, utility links, and data-count footer. That pattern conflicts with the editorial museum direction.

Primary navigation should become **Top Collection Navigation**:

- A restrained top bar that behaves like a museum/publication site header
- Global destinations expressed as collection rooms: Overview, Catalog, Members, Research, Tours, Awards, Media, Search
- Search and command palette remain available in the top bar
- The active state should be quiet: text weight, underline, or hairline marker rather than a large filled pill
- The bar should use the editorial material system: ink, hairlines, small caps, and selective purple annotation

Long pages should also get **Page-Level Wayfinding**:

- Use an "On this page" or chapter index for long editorial sections
- Link to galleries such as Artist Labels, Comparison Table, Era Catalog, Recognition Chronology, and Viewing Index
- Keep local wayfinding contextual to the page rather than repeating global navigation

Mobile and narrow screens should use a **Collection Drawer**:

- A menu button opens the collection index
- The drawer contains the global destinations and secondary project actions
- The drawer should feel like an archive index, not a collapsed admin sidebar

Utility actions should move out of primary navigation:

- Concert mode belongs in a small Project or Settings menu
- About this project belongs in the same secondary menu
- Data counts should not live in persistent navigation; they belong in Overview or page-level metadata

The existing sidebar should not be restyled in place. The structural pattern is the mismatch.

## Accessibility And Responsiveness

- Maintain semantic headings and landmarks.
- Keep captions readable and associated with the chart or object they explain.
- Avoid text overlays on busy visuals.
- Ensure object labels and chart captions reflow cleanly on mobile.
- Preserve keyboard access for tabs, navigation, and object links.
- Honor reduced motion.

## Success Criteria

The redesign succeeds when:

- The dashboard no longer reads as a generic AI-generated dark UI.
- The first screen has a clear thesis and memorable point of view.
- Each major page feels curated and specific to BTS.
- Metrics are contextualized instead of merely displayed.
- Charts explain a pattern with captions and hierarchy.
- The visual system is quieter, more editorial, and more museum-like.
- Existing data remains navigable and useful.

## Out Of Scope

- Rebuilding the data pipeline
- Changing Supabase schema
- Adding new external data sources
- Reworking the landing experience except where dashboard transition styling needs alignment
- Replacing all charts with new chart libraries
