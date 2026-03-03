/**
 * Seed Arirang World Tour concert dates (82+ dates, April 2026 - March 2027).
 *
 * Usage:
 *   npx tsx scripts/seed-arirang-tour.ts --dry-run
 *   npx tsx scripts/seed-arirang-tour.ts
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logWarning, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');

const TOUR = 'Arirang World Tour';

const TOUR_DATES = [
    // ═══ SOUTH KOREA — Goyang (April) ═══
    { city: 'Goyang', country: 'South Korea', date: '2026-04-09', venue: 'KINTEX' },
    { city: 'Goyang', country: 'South Korea', date: '2026-04-11', venue: 'KINTEX' },
    { city: 'Goyang', country: 'South Korea', date: '2026-04-12', venue: 'KINTEX' },

    // ═══ JAPAN — Tokyo (April) ═══
    { city: 'Tokyo', country: 'Japan', date: '2026-04-17', venue: 'Tokyo Dome' },
    { city: 'Tokyo', country: 'Japan', date: '2026-04-18', venue: 'Tokyo Dome' },

    // ═══ NORTH AMERICA — Leg 1 (April–May) ═══
    { city: 'Tampa', country: 'United States', date: '2026-04-25', venue: 'Raymond James Stadium' },
    { city: 'Tampa', country: 'United States', date: '2026-04-26', venue: 'Raymond James Stadium' },
    { city: 'El Paso', country: 'United States', date: '2026-05-02', venue: 'Sun Bowl Stadium' },
    { city: 'El Paso', country: 'United States', date: '2026-05-03', venue: 'Sun Bowl Stadium' },
    { city: 'Mexico City', country: 'Mexico', date: '2026-05-07', venue: 'Estadio GNP Seguros' },
    { city: 'Mexico City', country: 'Mexico', date: '2026-05-09', venue: 'Estadio GNP Seguros' },
    { city: 'Mexico City', country: 'Mexico', date: '2026-05-10', venue: 'Estadio GNP Seguros' },
    { city: 'Stanford', country: 'United States', date: '2026-05-16', venue: 'Stanford Stadium' },
    { city: 'Stanford', country: 'United States', date: '2026-05-17', venue: 'Stanford Stadium' },
    { city: 'Las Vegas', country: 'United States', date: '2026-05-23', venue: 'Allegiant Stadium' },
    { city: 'Las Vegas', country: 'United States', date: '2026-05-24', venue: 'Allegiant Stadium' },
    { city: 'Las Vegas', country: 'United States', date: '2026-05-27', venue: 'Allegiant Stadium' },

    // ═══ SOUTH KOREA — Busan (June) ═══
    { city: 'Busan', country: 'South Korea', date: '2026-06-12', venue: 'Busan Asiad Main Stadium' },
    { city: 'Busan', country: 'South Korea', date: '2026-06-13', venue: 'Busan Asiad Main Stadium' },

    // ═══ EUROPE (June–July) ═══
    { city: 'Madrid', country: 'Spain', date: '2026-06-26', venue: 'Estadio Cívitas Metropolitano' },
    { city: 'Madrid', country: 'Spain', date: '2026-06-27', venue: 'Estadio Cívitas Metropolitano' },
    { city: 'Brussels', country: 'Belgium', date: '2026-07-01', venue: 'King Baudouin Stadium' },
    { city: 'Brussels', country: 'Belgium', date: '2026-07-02', venue: 'King Baudouin Stadium' },
    { city: 'London', country: 'United Kingdom', date: '2026-07-06', venue: 'Wembley Stadium' },
    { city: 'London', country: 'United Kingdom', date: '2026-07-07', venue: 'Wembley Stadium' },
    { city: 'Munich', country: 'Germany', date: '2026-07-11', venue: 'Olympiastadion' },
    { city: 'Munich', country: 'Germany', date: '2026-07-12', venue: 'Olympiastadion' },
    { city: 'Paris', country: 'France', date: '2026-07-17', venue: 'Stade de France' },
    { city: 'Paris', country: 'France', date: '2026-07-18', venue: 'Stade de France' },

    // ═══ NORTH AMERICA — Leg 2 (August–September) ═══
    { city: 'East Rutherford', country: 'United States', date: '2026-08-01', venue: 'MetLife Stadium' },
    { city: 'East Rutherford', country: 'United States', date: '2026-08-02', venue: 'MetLife Stadium' },
    { city: 'Foxborough', country: 'United States', date: '2026-08-05', venue: 'Gillette Stadium' },
    { city: 'Foxborough', country: 'United States', date: '2026-08-06', venue: 'Gillette Stadium' },
    { city: 'Baltimore', country: 'United States', date: '2026-08-10', venue: 'M&T Bank Stadium' },
    { city: 'Baltimore', country: 'United States', date: '2026-08-11', venue: 'M&T Bank Stadium' },
    { city: 'Arlington', country: 'United States', date: '2026-08-15', venue: 'AT&T Stadium' },
    { city: 'Arlington', country: 'United States', date: '2026-08-16', venue: 'AT&T Stadium' },
    { city: 'Toronto', country: 'Canada', date: '2026-08-22', venue: 'Rogers Centre' },
    { city: 'Toronto', country: 'Canada', date: '2026-08-23', venue: 'Rogers Centre' },
    { city: 'Chicago', country: 'United States', date: '2026-08-27', venue: 'Soldier Field' },
    { city: 'Chicago', country: 'United States', date: '2026-08-28', venue: 'Soldier Field' },
    { city: 'Los Angeles', country: 'United States', date: '2026-09-01', venue: 'SoFi Stadium' },
    { city: 'Los Angeles', country: 'United States', date: '2026-09-02', venue: 'SoFi Stadium' },
    { city: 'Los Angeles', country: 'United States', date: '2026-09-05', venue: 'SoFi Stadium' },
    { city: 'Los Angeles', country: 'United States', date: '2026-09-06', venue: 'SoFi Stadium' },

    // ═══ SOUTH AMERICA (October) ═══
    { city: 'Bogotá', country: 'Colombia', date: '2026-10-02', venue: 'Estadio El Campín' },
    { city: 'Bogotá', country: 'Colombia', date: '2026-10-03', venue: 'Estadio El Campín' },
    { city: 'Lima', country: 'Peru', date: '2026-10-09', venue: 'Estadio Nacional' },
    { city: 'Lima', country: 'Peru', date: '2026-10-10', venue: 'Estadio Nacional' },
    { city: 'Santiago', country: 'Chile', date: '2026-10-16', venue: 'Estadio Nacional' },
    { city: 'Santiago', country: 'Chile', date: '2026-10-17', venue: 'Estadio Nacional' },
    { city: 'Buenos Aires', country: 'Argentina', date: '2026-10-23', venue: 'Estadio River Plate' },
    { city: 'Buenos Aires', country: 'Argentina', date: '2026-10-24', venue: 'Estadio River Plate' },
    { city: 'São Paulo', country: 'Brazil', date: '2026-10-28', venue: 'Estádio MorumBIS' },
    { city: 'São Paulo', country: 'Brazil', date: '2026-10-30', venue: 'Estádio MorumBIS' },
    { city: 'São Paulo', country: 'Brazil', date: '2026-10-31', venue: 'Estádio MorumBIS' },

    // ═══ ASIA — Leg 2 (November–December) ═══
    { city: 'Kaohsiung', country: 'Taiwan', date: '2026-11-19', venue: 'National Stadium' },
    { city: 'Kaohsiung', country: 'Taiwan', date: '2026-11-21', venue: 'National Stadium' },
    { city: 'Kaohsiung', country: 'Taiwan', date: '2026-11-22', venue: 'National Stadium' },
    { city: 'Bangkok', country: 'Thailand', date: '2026-12-03', venue: 'Rajamangala National Stadium' },
    { city: 'Bangkok', country: 'Thailand', date: '2026-12-05', venue: 'Rajamangala National Stadium' },
    { city: 'Bangkok', country: 'Thailand', date: '2026-12-06', venue: 'Rajamangala National Stadium' },
    { city: 'Kuala Lumpur', country: 'Malaysia', date: '2026-12-12', venue: 'Bukit Jalil National Stadium' },
    { city: 'Kuala Lumpur', country: 'Malaysia', date: '2026-12-13', venue: 'Bukit Jalil National Stadium' },
    { city: 'Singapore', country: 'Singapore', date: '2026-12-17', venue: 'National Stadium' },
    { city: 'Singapore', country: 'Singapore', date: '2026-12-19', venue: 'National Stadium' },
    { city: 'Singapore', country: 'Singapore', date: '2026-12-20', venue: 'National Stadium' },
    { city: 'Jakarta', country: 'Indonesia', date: '2026-12-26', venue: 'Gelora Bung Karno Stadium' },
    { city: 'Jakarta', country: 'Indonesia', date: '2026-12-27', venue: 'Gelora Bung Karno Stadium' },

    // ═══ OCEANIA + ASIA 2027 (February–March) ═══
    { city: 'Melbourne', country: 'Australia', date: '2027-02-12', venue: 'Melbourne Cricket Ground' },
    { city: 'Melbourne', country: 'Australia', date: '2027-02-13', venue: 'Melbourne Cricket Ground' },
    { city: 'Sydney', country: 'Australia', date: '2027-02-20', venue: 'Accor Stadium' },
    { city: 'Sydney', country: 'Australia', date: '2027-02-21', venue: 'Accor Stadium' },
    { city: 'Hong Kong', country: 'China', date: '2027-03-04', venue: 'Hong Kong Stadium' },
    { city: 'Hong Kong', country: 'China', date: '2027-03-06', venue: 'Hong Kong Stadium' },
    { city: 'Hong Kong', country: 'China', date: '2027-03-07', venue: 'Hong Kong Stadium' },
    { city: 'Manila', country: 'Philippines', date: '2027-03-13', venue: 'Philippine Arena' },
    { city: 'Manila', country: 'Philippines', date: '2027-03-14', venue: 'Philippine Arena' },
] as const;

async function main() {
    logStart(`Seeding ${TOUR}${DRY_RUN ? ' (DRY RUN)' : ''}`);

    // Check existing dates for this tour
    const { data: existing } = await supabase
        .from('concerts')
        .select('id, date, city')
        .eq('tour_name', TOUR);

    const existingDates = new Set((existing || []).map(c => `${c.date}|${c.city}`));
    console.log(`   Existing dates for "${TOUR}": ${existingDates.size}`);
    console.log(`   Total dates to seed: ${TOUR_DATES.length}\n`);

    let inserted = 0;
    let skipped = 0;

    for (const td of TOUR_DATES) {
        const key = `${td.date}|${td.city}`;
        if (existingDates.has(key)) {
            skipped++;
            continue;
        }

        const row = {
            tour_name: TOUR,
            city: td.city,
            country: td.country,
            date: td.date,
            venue: td.venue,
            attendance: null,
            setlist: null,
            notes: null,
        };

        if (DRY_RUN) {
            console.log(`   [DRY RUN] ${td.date} — ${td.city}, ${td.country} (${td.venue})`);
        } else {
            const { error } = await supabase.from('concerts').insert(row);
            if (error) {
                logError(`Failed: ${td.date} ${td.city}: ${error.message}`);
            } else {
                logSuccess(`${td.date} — ${td.city}, ${td.country}`);
            }
        }
        inserted++;
    }

    console.log(`\n   Inserted: ${inserted}, Skipped (existing): ${skipped}`);
    if (DRY_RUN) logWarning('DRY RUN — no changes written.');
    else logDone(`${TOUR} seeded with ${inserted} dates!`);
}

main().catch(console.error);
