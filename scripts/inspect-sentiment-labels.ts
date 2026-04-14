import { createSupabaseAdmin } from './scrape-utils.js';

const supabase = createSupabaseAdmin();

const { data, error } = await supabase
  .from('songs')
  .select('sentiment')
  .not('sentiment', 'is', null);

if (error) {
  console.error(error);
  process.exit(1);
}

const counts = new Map<string, number>();
for (const row of data ?? []) {
  const v = row.sentiment as string;
  counts.set(v, (counts.get(v) ?? 0) + 1);
}

console.log('Existing sentiment labels in songs.sentiment:');
for (const [label, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${label.padEnd(20)} ${n}`);
}
console.log(`Total: ${data?.length ?? 0}`);
