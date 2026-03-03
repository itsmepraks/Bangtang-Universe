/**
 * Generate / patch city coordinates in src/data/cityCoords.ts
 *
 * Reads the setlist.fm concert cache (concerts-merged.json or
 * concerts-setlistfm.json) and adds any cities that have lat/lng
 * but are missing from CITY_COORDS.  Also backfills missing countries
 * into COUNTRY_CENTROIDS.
 *
 * Usage:
 *   npx tsx scripts/generate-city-coords.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ==================== PATHS ====================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, 'scripts', 'cache');
const CITY_COORDS_PATH = path.join(ROOT, 'src', 'data', 'cityCoords.ts');

// ==================== TYPES ====================

/** Shape of a concert in concerts-merged.json (flat lat/lng) */
interface MergedConcert {
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

/** Shape of a raw setlist.fm API entry in concerts-setlistfm.json */
interface SfmSetlist {
  venue?: {
    city?: {
      name?: string;
      coords?: { lat: number; long: number };
      country?: { name?: string };
    };
  };
}

// ==================== HELPERS ====================

function loadJson<T>(filename: string): T | null {
  const filePath = path.join(CACHE_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Extract unique city entries with coordinates from the available cache.
 * Tries concerts-merged.json first (flat format), then falls back to
 * concerts-setlistfm.json (nested API format).
 *
 * Returns a Map keyed by "City, Country" with [lng, lat] values.
 */
function extractCityCoords(): Map<string, [number, number]> {
  const coords = new Map<string, [number, number]>();

  // ── Try concerts-merged.json first (flat lat/lng) ──
  const merged = loadJson<MergedConcert[]>('concerts-merged.json');
  if (merged && merged.length > 0) {
    console.log(`   Loaded concerts-merged.json (${merged.length} entries)`);
    for (const c of merged) {
      if (c.lat == null || c.lng == null) continue;
      if (!c.city || !c.country) continue;
      const key = `${c.city}, ${c.country}`;
      if (!coords.has(key)) {
        coords.set(key, [
          parseFloat(c.lng.toFixed(3)),
          parseFloat(c.lat.toFixed(3)),
        ]);
      }
    }
    return coords;
  }

  // ── Fall back to concerts-setlistfm.json (nested API format) ──
  const sfm = loadJson<SfmSetlist[]>('concerts-setlistfm.json');
  if (sfm && sfm.length > 0) {
    console.log(`   Loaded concerts-setlistfm.json (${sfm.length} entries)`);
    for (const s of sfm) {
      const city = s.venue?.city;
      if (!city?.name || !city?.country?.name) continue;
      const lat = city.coords?.lat;
      const lng = city.coords?.long;
      if (lat == null || lng == null) continue;
      const key = `${city.name}, ${city.country.name}`;
      if (!coords.has(key)) {
        coords.set(key, [
          parseFloat(lng.toFixed(3)),
          parseFloat(lat.toFixed(3)),
        ]);
      }
    }
    return coords;
  }

  console.error(
    '   No concert cache found. Run scrape-16-setlistfm.ts first to generate concert data.'
  );
  process.exit(1);
}

// ==================== MAIN ====================

function main() {
  console.log('\n── generate-city-coords ──\n');

  // 1. Read current cityCoords.ts as a string
  if (!fs.existsSync(CITY_COORDS_PATH)) {
    console.error(`   File not found: ${CITY_COORDS_PATH}`);
    process.exit(1);
  }
  let source = fs.readFileSync(CITY_COORDS_PATH, 'utf-8');

  // 2. Extract all cities with coords from cache
  const allCityCoords = extractCityCoords();
  console.log(`   Found ${allCityCoords.size} unique cities with coordinates in cache\n`);

  // 3. Determine which cities are already in CITY_COORDS
  const newCities = new Map<string, [number, number]>();
  for (const [key, value] of allCityCoords) {
    // Check if the key already exists in the source file
    // Escape special regex chars in the key for safe matching
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`"${escaped}"\\s*:`);
    if (!pattern.test(source)) {
      newCities.set(key, value);
    }
  }

  // 4. Determine which countries are already in COUNTRY_CENTROIDS
  const newCountries = new Map<string, [number, number]>();
  for (const [key, value] of allCityCoords) {
    const country = key.split(', ').slice(1).join(', ');
    if (!country) continue;

    // Check if this country already exists in COUNTRY_CENTROIDS
    const escaped = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`"${escaped}"\\s*:`);

    // Only look at the COUNTRY_CENTROIDS block
    const centroidBlockMatch = source.match(
      /export const COUNTRY_CENTROIDS[\s\S]*?=\s*\{([\s\S]*?)\};/
    );
    const centroidBlock = centroidBlockMatch ? centroidBlockMatch[1] : '';

    if (!pattern.test(centroidBlock) && !newCountries.has(country)) {
      // Use this city's coords as an approximate centroid
      newCountries.set(country, value);
    }
  }

  // 5. Patch CITY_COORDS — insert new entries before the closing `};`
  if (newCities.size > 0) {
    // Build the new lines
    const lines: string[] = [];
    // Group by country for readability
    const byCountry = new Map<string, [string, [number, number]][]>();
    for (const [key, value] of newCities) {
      const country = key.split(', ').slice(1).join(', ');
      if (!byCountry.has(country)) byCountry.set(country, []);
      byCountry.get(country)!.push([key, value]);
    }

    for (const [country, entries] of byCountry) {
      lines.push(`\n  // ${country} (auto-generated)`);
      for (const [key, [lng, lat]] of entries) {
        lines.push(`  "${key}": [${lng}, ${lat}],`);
      }
    }

    // Find the closing `};` of CITY_COORDS
    // Match the first `};` after `export const CITY_COORDS`
    const cityBlockRe = /(export const CITY_COORDS[\s\S]*?)(};)/;
    const cityMatch = source.match(cityBlockRe);
    if (cityMatch) {
      const insertPoint = cityMatch.index! + cityMatch[1].length;
      source =
        source.slice(0, insertPoint) +
        lines.join('\n') +
        '\n' +
        source.slice(insertPoint);
    }
  }

  // 6. Patch COUNTRY_CENTROIDS — insert new entries before the closing `};`
  if (newCountries.size > 0) {
    const lines: string[] = [];
    lines.push(`\n  // Auto-generated`);
    for (const [country, [lng, lat]] of newCountries) {
      lines.push(`  "${country}": [${lng}, ${lat}],`);
    }

    // Find the closing `};` of COUNTRY_CENTROIDS
    const countryBlockRe = /(export const COUNTRY_CENTROIDS[\s\S]*?)(};)/;
    const countryMatch = source.match(countryBlockRe);
    if (countryMatch) {
      const insertPoint = countryMatch.index! + countryMatch[1].length;
      source =
        source.slice(0, insertPoint) +
        lines.join('\n') +
        '\n' +
        source.slice(insertPoint);
    }
  }

  // 7. Write back
  if (newCities.size > 0 || newCountries.size > 0) {
    fs.writeFileSync(CITY_COORDS_PATH, source, 'utf-8');
    console.log(`   Patched ${CITY_COORDS_PATH}\n`);
  }

  // 8. Report
  if (newCities.size > 0) {
    console.log(`   Added ${newCities.size} new city entries to CITY_COORDS:`);
    for (const [key, [lng, lat]] of newCities) {
      console.log(`     + "${key}": [${lng}, ${lat}]`);
    }
  } else {
    console.log('   No new cities to add — CITY_COORDS is up to date.');
  }

  if (newCountries.size > 0) {
    console.log(`\n   Added ${newCountries.size} new country entries to COUNTRY_CENTROIDS:`);
    for (const [country, [lng, lat]] of newCountries) {
      console.log(`     + "${country}": [${lng}, ${lat}]`);
    }
  } else {
    console.log('   No new countries to add — COUNTRY_CENTROIDS is up to date.');
  }

  console.log('\n── done ──\n');
}

main();
