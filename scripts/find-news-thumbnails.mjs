#!/usr/bin/env node
// Finds the publisher's own share thumbnail (og:image, falling back to twitter:image) for
// every curated external news story that doesn't have a `sourceImage` yet.
//
//   npm run news:thumbnails            report what each story's source page advertises
//   npm run news:thumbnails -- --write also add `sourceImage: "<url>"` to those entries
//
// The URL is stored in frontmatter, not fetched at build time: a build shouldn't depend on
// two dozen third-party sites being up, and an editor gets to look at the image before it
// ships (a publisher's og:image is sometimes just its logo, which is worth deleting).
// Nothing is downloaded — NewsCard.astro loads the image straight from the publisher.
//
// Some publishers (WANE, for one) refuse non-browser requests outright; those report an
// HTTP error here and can be filled in by hand from the page's og:image.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const NEWS_DIR = path.resolve(import.meta.dirname, '../src/content/news');
const WRITE = process.argv.includes('--write');
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

// Attribute order varies by CMS (property before content or after), so read each <meta>
// tag's attributes individually rather than matching one fixed shape.
function findShareImage(html, pageUrl) {
  const found = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
    if (!key || !content) continue;
    if (['og:image', 'og:image:secure_url', 'og:image:url', 'twitter:image'].includes(key)) {
      found[key] ??= content;
    }
  }
  const raw = found['og:image:secure_url'] ?? found['og:image'] ?? found['og:image:url'] ?? found['twitter:image'];
  if (!raw) return null;
  // Resolve a relative og:image against the page, and upgrade http: so a mixed-content
  // image never lands on the https site.
  const url = new URL(decodeEntities(raw.trim()), pageUrl);
  if (url.protocol === 'http:') url.protocol = 'https:';
  return url.href;
}

const frontmatterOf = (source) => source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
const fieldOf = (frontmatter, key) =>
  frontmatter.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1];

const files = (await readdir(NEWS_DIR)).filter((f) => /\.mdx?$/.test(f)).sort();
let missing = 0;

for (const file of files) {
  const filePath = path.join(NEWS_DIR, file);
  const source = await readFile(filePath, 'utf8');
  const frontmatter = frontmatterOf(source);
  const sourceUrl = fieldOf(frontmatter, 'sourceUrl');
  if (!sourceUrl || fieldOf(frontmatter, 'sourceImage')) continue;
  if (fieldOf(frontmatter, 'draft') === 'true') continue;

  let image = null;
  let problem = null;
  try {
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) problem = `HTTP ${response.status}`;
    else image = findShareImage(await response.text(), response.url);
    if (!problem && !image) problem = 'no og:image or twitter:image on the page';
  } catch (error) {
    problem = error.name === 'TimeoutError' ? 'timed out' : error.message;
  }

  if (!image) {
    missing += 1;
    console.log(`✗ ${file}\n    ${problem}`);
    continue;
  }

  console.log(`✓ ${file}\n    ${image}`);
  if (WRITE) {
    // Slot it in right after sourceName (or sourceUrl) so the source fields stay together.
    const anchor = /^sourceName:.*$/m.test(frontmatter) ? /^sourceName:.*$/m : /^sourceUrl:.*$/m;
    const updated = source.replace(anchor, (line) => `${line}\nsourceImage: ${JSON.stringify(image)}`);
    await writeFile(filePath, updated);
  }
}

console.log(`\n${missing} external ${missing === 1 ? 'story' : 'stories'} without a thumbnail found.`);
if (!WRITE) console.log('Re-run with --write to add the ones found to frontmatter.');
