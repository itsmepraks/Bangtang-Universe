/**
 * One-shot: tag the ARIRANG / SWIM 2026 releases with the "ARIRANG" era and
 * a coordinated cover color, since the Wikipedia/Fandom scraper couldn't reach
 * the wiki (HTTP 403) and they all landed under era="Unknown".
 *
 * Run: npx tsx scripts/update-arirang-era.ts [--dry-run]
 */

import { createSupabaseAdmin, logStart, logSuccess, logError, logDone } from './scrape-utils.js';

const supabase = createSupabaseAdmin();
const DRY_RUN = process.argv.includes('--dry-run');

const ARIRANG_TITLES = [
  'ARIRANG',
  'SWIM',
  'KEEP SWIMMING',
  'SWIMSIDE: A Message from BTS',
  'SWIM with Jimin (slow jam R&B remix)',
  'SWIM with RM (chill hip hop remix)',
  'SWIM with V (electronic remix)',
  'SWIM with Jung Kook (acoustic lofi remix)',
  'SWIM with Jin (alternative rock remix)',
  'SWIM with j‐hope (afrobeat remix)',
  'SWIM with SUGA (melodic techno remix)',
];

const UPDATE = {
  era: 'ARIRANG',
  cover_color: '#0EA5E9', // sky blue — water/swim theme
};

async function main() {
  logStart(`Tagging ARIRANG-era releases${DRY_RUN ? ' (DRY RUN)' : ''}`);

  for (const title of ARIRANG_TITLES) {
    if (DRY_RUN) {
      logSuccess(`Would update: ${title}`);
      continue;
    }
    const { data, error } = await supabase
      .from('albums')
      .update(UPDATE)
      .eq('title', title)
      .select('id, title');

    if (error) {
      logError(`${title}: ${error.message}`);
    } else if (!data || data.length === 0) {
      logError(`${title}: no row matched`);
    } else {
      logSuccess(`Updated [${data[0].id}] ${data[0].title}`);
    }
  }

  logDone('Era tags applied');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
