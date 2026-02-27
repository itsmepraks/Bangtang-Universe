# Awards Ceremony Filter — Prestige Category Design

**Date:** 2026-02-26
**Status:** Approved
**Scope:** `src/components/features/sections/AwardsSection/AwardGrid.tsx`

---

## Problem

The ceremony filter currently renders all 69 ceremony names as individual pills, creating an overwhelming wall of text that is unusable.

## Solution

Replace the flat ceremony list with a **2-tier prestige filter**:

1. **Category pills** (5 options): All | Global | Regional | Fan | Specialty
2. **Specific ceremony dropdown** — appears only when a category is active, scoped to ceremonies within that bucket

---

## Category Mapping

### Global
Grammy Awards, Billboard Music Awards, MAMA Awards, Golden Disc Awards, MTV Video Music Awards, MTV Europe Music Awards, American Music Awards, Brit Awards, NME Awards, IFPI Awards, E! People's Choice Awards, iHeartRadio Music Awards, The WSJ Innovator Awards, Webby Awards, iF Product Design Awards, The Asian Awards, Global Awards

### Regional
Melon Music Awards, Seoul Music Awards, Circle Chart Music Awards, Japan Gold Disc Awards, Genie Music Awards, Korean Music Awards, APAN Music Awards, Hanteo Music Awards, Korea Broadcasting Awards, Korea Popular Music Awards, Soribada Best K-Music Awards, V Chart Awards, Korean PD Awards, Edaily Culture Awards, Music Awards Japan, Space Shower Music Awards, MTV Video Music Awards Japan, NRJ Music Awards, LOS40 Music Awards, Rockbjörnen, Gaffa-Prisen, BBC Radio1 Teen Awards, Swiss Music Awards, Telehit Awards, Planeta Awards, Proud Korean Awards

### Fan
Soompi Awards, iHeartRadio MMVAs, Teen Choice Awards, Nickelodeon Kids' Choice Awards, Nickelodeon Mexico Kids' Choice Awards, Nickelodeon Argentina Kids' Choice Awards, Nickelodeon Colombia Kids' Choice Awards, Myx Music Awards, Radio Disney Music Awards, MTV Millennial Awards, MTV Millennial Awards Brazil, BraVo Music Awards, Anugerah Bintang Popular Berita Harian, Shorty Awards, UK Music Video Awards

### Specialty
KOMCA Awards, Korea First Brand Awards, V Live Awards, The Fact Music Awards

---

## UI Behaviour

- Selecting a category filters award cards to that group
- A compact `<select>` dropdown appears below the pills scoped to ceremonies in the active category
- Selecting a specific ceremony narrows further (category + ceremony both active)
- Switching category clears the specific ceremony selection
- Year / Scope / Result filters are unchanged
- Unmapped ceremonies fall through to "Regional" as a safe default

---

## Implementation

Single file change: `AwardGrid.tsx`
- Add `CEREMONY_CATEGORY_MAP` constant (ceremony name → category)
- Add `categoryFilter` + `specificCeremonyFilter` state (replaces `ceremonyFilter`)
- Render 5 category pills + conditional scoped dropdown
- Update `filtered` memo to use both new states
