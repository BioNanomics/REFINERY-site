#!/usr/bin/env node
/**
 * Lists every photo in src/assets/press/photos/ that has no entry yet in
 * src/data/press-photos.ts and prints a ready-to-paste entry for each, with the caption
 * started from the date in the filename (`WHO_YYYY-MM-DD_NN.jpg`). Fill in `alt` and finish
 * the caption, paste the block into PRESS_PHOTOS, run `npm test`.
 *
 *   npm run press:stub
 */
import { readdirSync, readFileSync } from 'node:fs';

const DIR = 'src/assets/press/photos';
const MANIFEST = 'src/data/press-photos.ts';
// Comments stripped first: the manifest's own example entry names a real-looking file.
const manifest = readFileSync(MANIFEST, 'utf8').replace(/\/\/.*$/gm, '');
// Same rule as test/data/press.test.ts: lowercase .jpg or .jpeg only.
const files = readdirSync(DIR).filter((f) => /\.jpe?g$/.test(f)).sort();
// Keys may be written in single or double quotes.
const missing = files.filter((f) => !manifest.includes(`'${f}'`) && !manifest.includes(`"${f}"`));

if (missing.length === 0) {
  console.log(`All ${files.length} photo(s) in ${DIR} have manifest entries.`);
  process.exit(0);
}

const MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
for (const file of missing) {
  const m = file.match(/(\d{4})-(\d{2})-(\d{2})/);
  const when = m ? `, ${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : '';
  console.log(`  '${file}': {\n    alt: '',\n    caption: 'The REFINERY, Fort Wayne${when}',\n  },`);
}
console.error(`\n${missing.length} photo(s) need an entry. Paste the block above into PRESS_PHOTOS in ${MANIFEST} and fill in alt.`);
