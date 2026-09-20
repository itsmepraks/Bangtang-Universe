import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

type Member = { id: string; image_url: string | null };
type Export = { tables: { members: Member[] } };
const root = process.cwd();
const exportDir = path.join(root, 'exports');
const source = fs.readdirSync(exportDir).filter(name => /^catalog-.*\.json$/.test(name)).sort().at(-1);
if (!source) throw new Error('No catalog export found');
const catalog = JSON.parse(fs.readFileSync(path.join(exportDir, source), 'utf8')) as Export;
const targetDir = path.join(root, 'public/member-photos');
fs.mkdirSync(targetDir, { recursive: true });

for (const member of catalog.tables.members) {
  if (!member.image_url) throw new Error(`Missing source portrait for ${member.id}`);
  const response = await fetch(member.image_url);
  if (!response.ok) throw new Error(`Portrait download failed for ${member.id}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1_000) throw new Error(`Portrait for ${member.id} is unexpectedly small`);
  const file = path.join(targetDir, `${member.id}.jpg`);
  fs.writeFileSync(file, bytes);
  console.log(`${member.id}: ${bytes.length} bytes ${createHash('sha256').update(bytes).digest('hex')}`);
}
