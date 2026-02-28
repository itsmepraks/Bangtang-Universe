# Awards Podium (Collapsible Tree) Design

**Date:** 2026-02-27

## Goal

Replace the endless flat award card grid with a structured two-level collapsible tree that groups awards by geographic region (Group mode) or by member (Solo mode), making 731 awards scannable without endless scrolling.

## Architecture

- New `AwardPodium` component added as a fourth tab ("Podium") in `AwardsSection/index.tsx`
- Existing Trophy Room / Timeline / Statistics tabs remain untouched
- No new data fetching — uses the same `Award[]` + `Member[]` props already passed to `AwardsSection`

## Mode Toggle

Two pills at the top of the component:

```
[ Group ]  [ Solo ]
```

### Group mode
Groups awards by geographic region:
- 🇰🇷 Korea — ceremonies: Melon Music Awards, Seoul Music Awards, MAMA Awards, Golden Disc Awards, Circle Chart, Genie, APAN, Hanteo, Korean Music Awards, etc.
- 🇺🇸 USA — Billboard, iHeartRadio, American Music Awards, MTV VMAs, Grammy, Teen Choice, Nickelodeon KCAs, etc.
- 🌐 Global — IFPI, MTV EMAs, NME, The Asian Awards, Global Awards, etc.
- 🇯🇵 Japan — Japan Gold Disc, Music Awards Japan, Space Shower, MTV VMAs Japan, etc.
- 🌍 Other — everything else

Top-level row = region. Second-level row = ceremony within that region. Leaf = individual award card.

### Solo mode
Groups by member using `member_id` — only shows awards where `scope !== 'group'` and `member_id` is set.
Members in order: RM · Jin · Suga · J-Hope · Jimin · V · Jungkook.
Top-level row = member. Leaf = individual award card (no second level).

## Tree Structure

### Top-level header row (both modes)
- Flag emoji / member name
- `🏆 N wins` badge + `◆ N nominated` count
- Chevron (▶ collapsed / ▼ expanded)
- Clicking toggles open/closed; multiple rows can be open simultaneously

### Second-level ceremony row (Group mode only)
- Ceremony name
- Win count + nomination count
- Chevron to expand/collapse individual awards

### Award leaf row (compact, single line)
- Ceremony name (Solo mode only, since Group mode already shows it in level 2)
- Year
- Award name — category (if set)
- Won / Nominated badge
- Member name tag (Group mode, if award is solo/unit)
- `for "work_title"` if set

## Filters

Kept from existing AwardGrid, displayed as compact pills above the tree:
- Year (All Years · 2013–2025)
- Result (All · Won · Nominated)

Ceremony/Scope filters are implicit in the mode toggle (Group = ceremony hierarchy, Solo = scope filter already applied).

## Visual Style

Consistent with existing dark theme (`#0c0c12`, `#111118`, purple accents). Headers use subtle left border accent (`border-l-2 border-purple-500/40`) when expanded. Leaves are slightly indented with a thin connector line. Compact enough that the whole Korea region with 300+ awards is browsable without feeling overwhelming.

## Files to Touch

- **Create:** `src/components/features/sections/AwardsSection/AwardPodium.tsx`
- **Modify:** `src/components/features/sections/AwardsSection/index.tsx` — add Podium tab + lazy import

## Region → Ceremony Mapping

Derived statically (same approach as `CEREMONY_CATEGORY_MAP` in AwardGrid). New `CEREMONY_REGION_MAP` constant maps each known ceremony name to `'korea' | 'usa' | 'global' | 'japan' | 'other'`.
