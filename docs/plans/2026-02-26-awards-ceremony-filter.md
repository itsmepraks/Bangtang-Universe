# Awards Ceremony Filter — Prestige Categories Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat 69-ceremony pill list with a 2-tier prestige filter (5 category pills + scoped ceremony dropdown).

**Architecture:** Single component change in `AwardGrid.tsx`. Add a `CEREMONY_CATEGORY_MAP` lookup, swap `ceremonyFilter` state for `categoryFilter` + `specificCeremonyFilter`, re-render the filter row, update the `filtered` memo.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4

---

### Task 1: Add the ceremony category map and update state

**Files:**
- Modify: `src/components/features/sections/AwardsSection/AwardGrid.tsx`

**Step 1: Add `CEREMONY_CATEGORY_MAP` constant above the component**

Add this before `export default function AwardGrid`:

```typescript
type CeremonyCategory = 'global' | 'regional' | 'fan' | 'specialty';

const CEREMONY_CATEGORY_MAP: Record<string, CeremonyCategory> = {
  // Global
  'Grammy Awards': 'global',
  'Billboard Music Awards': 'global',
  'MAMA Awards': 'global',
  'Golden Disc Awards': 'global',
  'MTV Video Music Awards': 'global',
  'MTV Europe Music Awards': 'global',
  'American Music Awards': 'global',
  'Brit Awards': 'global',
  'NME Awards': 'global',
  'IFPI Awards': 'global',
  "E! People's Choice Awards": 'global',
  'iHeartRadio Music Awards': 'global',
  'The WSJ Innovator Awards': 'global',
  'Webby Awards': 'global',
  'iF Product Design Awards': 'global',
  'The Asian Awards': 'global',
  'Global Awards': 'global',
  // Regional
  'Melon Music Awards': 'regional',
  'Seoul Music Awards': 'regional',
  'Circle Chart Music Awards': 'regional',
  'Japan Gold Disc Awards': 'regional',
  'Genie Music Awards': 'regional',
  'Korean Music Awards': 'regional',
  'APAN Music Awards': 'regional',
  'Hanteo Music Awards': 'regional',
  'Korea Broadcasting Awards': 'regional',
  'Korea Popular Music Awards': 'regional',
  'Soribada Best K-Music Awards': 'regional',
  'V Chart Awards': 'regional',
  'Korean PD Awards': 'regional',
  'Edaily Culture Awards': 'regional',
  'Music Awards Japan': 'regional',
  'Space Shower Music Awards': 'regional',
  'MTV Video Music Awards Japan': 'regional',
  'NRJ Music Awards': 'regional',
  'LOS40 Music Awards': 'regional',
  'Rockbjörnen': 'regional',
  'Gaffa-Prisen': 'regional',
  'BBC Radio1 Teen Awards': 'regional',
  'Swiss Music Awards': 'regional',
  'Telehit Awards': 'regional',
  'Planeta Awards': 'regional',
  'Proud Korean Awards': 'regional',
  // Fan
  'Soompi Awards': 'fan',
  'iHeartRadio MMVAs': 'fan',
  'Teen Choice Awards': 'fan',
  "Nickelodeon Kids' Choice Awards": 'fan',
  "Nickelodeon Mexico Kids' Choice Awards": 'fan',
  "Nickelodeon Argentina Kids' Choice Awards": 'fan',
  "Nickelodeon Colombia Kids' Choice Awards": 'fan',
  'Myx Music Awards': 'fan',
  'Radio Disney Music Awards': 'fan',
  'MTV Millennial Awards': 'fan',
  'MTV Millennial Awards Brazil': 'fan',
  'BraVo Music Awards': 'fan',
  'Anugerah Bintang Popular Berita Harian': 'fan',
  'Shorty Awards': 'fan',
  'UK Music Video Awards': 'fan',
  // Specialty
  'KOMCA Awards': 'specialty',
  'Korea First Brand Awards': 'specialty',
  'V Live Awards': 'specialty',
  'The Fact Music Awards': 'specialty',
};

const CATEGORY_LABELS: Record<CeremonyCategory, string> = {
  global: 'Global',
  regional: 'Regional',
  fan: 'Fan',
  specialty: 'Specialty',
};

function getCeremonyCategory(ceremony: string): CeremonyCategory {
  return CEREMONY_CATEGORY_MAP[ceremony] ?? 'regional';
}
```

**Step 2: Replace `ceremonyFilter` state with two new states**

Remove:
```typescript
const [ceremonyFilter, setCeremonyFilter] = useState<string | null>(null);
```

Add:
```typescript
const [categoryFilter, setCategoryFilter] = useState<CeremonyCategory | null>(null);
const [specificCeremonyFilter, setSpecificCeremonyFilter] = useState<string | null>(null);
```

**Step 3: Update the `filtered` memo to use new states**

Replace the old filter logic:
```typescript
if (ceremonyFilter && a.ceremony !== ceremonyFilter) return false;
```

With:
```typescript
if (categoryFilter && getCeremonyCategory(a.ceremony) !== categoryFilter) return false;
if (specificCeremonyFilter && a.ceremony !== specificCeremonyFilter) return false;
```

**Step 4: Add `ceremoniesInCategory` derived value (for scoped dropdown)**

After the `ceremonies` useMemo, add:
```typescript
const ceremoniesInCategory = useMemo(() => {
  if (!categoryFilter) return [];
  return ceremonies.filter(c => getCeremonyCategory(c.value) === categoryFilter);
}, [ceremonies, categoryFilter]);
```

**Step 5: Replace the Ceremony filter JSX**

Replace the entire ceremony filter block:
```tsx
<div className="space-y-1.5">
  <span className="text-xs text-white/40 uppercase tracking-wide">Ceremony</span>
  <div className="flex flex-wrap items-center gap-2">
    {/* Category pills */}
    {([null, 'global', 'regional', 'fan', 'specialty'] as (CeremonyCategory | null)[]).map((cat) => (
      <button
        key={cat ?? 'all'}
        onClick={() => { setCategoryFilter(cat); setSpecificCeremonyFilter(null); }}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
          categoryFilter === cat
            ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
            : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15'
        }`}
      >
        {cat ? CATEGORY_LABELS[cat] : 'All'}
      </button>
    ))}

    {/* Scoped ceremony dropdown — only when a category is active */}
    {categoryFilter && ceremoniesInCategory.length > 0 && (
      <select
        value={specificCeremonyFilter ?? ''}
        onChange={(e) => setSpecificCeremonyFilter(e.target.value || null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 bg-[#111118] cursor-pointer outline-none ${
          specificCeremonyFilter
            ? 'border-purple-500/30 text-purple-300'
            : 'border-white/[0.08] text-white/50 hover:text-white/70 hover:border-white/15'
        }`}
      >
        <option value="">All {CATEGORY_LABELS[categoryFilter]}</option>
        {ceremoniesInCategory.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label} ({c.count})
          </option>
        ))}
      </select>
    )}
  </div>
</div>
```

**Step 6: Type-check**

Run: `npm run type-check`
Expected: No errors

**Step 7: Commit**

```bash
git add src/components/features/sections/AwardsSection/AwardGrid.tsx
git commit -m "feat: replace flat ceremony filter with 2-tier prestige categories"
```
