/**
 * Content checks that run before every build (`npm run build`, or `npm run check` on its own).
 * They fail the build, with the file and line, on mistakes in Markdown/MDX bodies that the
 * content schemas can't see:
 *
 * 1. An image with no alt text: `![](…)` in Markdown, or an <img> / <Image> without `alt`.
 *    (Frontmatter images are covered by the schemas: `heroImage` needs `heroImageAlt`, etc.)
 * 2. An <iframe> (an embedded video or map) with no `title`, which leaves it unnamed for
 *    screen readers.
 * 3. A relative internal link ("../../news/"). Write links from the site root ("/news/");
 *    src/plugins/rehype-base-links.mjs adds the base path if the site ever moves to a subpath.
 * 4. A link to this site written with the domain ("https://refineryrobotics.org/news/"). It
 *    would open in a new tab with the ↗ marker, since src/plugins/rehype-external-links.mjs
 *    treats every http(s) link in content as off-site.
 *
 * Ported from the docs site (BioNanomics/REFINERY-docs-site, scripts/check-content.mjs). Its
 * other checks don't carry over: FRC/FTC in frontmatter is expanded here by firstPlain(), and
 * this site has no revision-history author field to check names against. Names in a page's text
 * are up to authors; see "Naming students" in CONTRIBUTING.md.
 *
 * Nothing here needs a dependency. Code blocks are skipped, so a page can show these mistakes
 * as examples.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src/content';
const SITE_LINK = /^https?:\/\/(?:www\.)?refineryrobotics\.org(?:[/?#]|$)/i;
const problems = [];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.mdx?$/.test(name) && !name.startsWith('_')) yield path;
  }
}

const report = (path, line, message) => problems.push(`${relative('.', path)}:${line}  ${message}`);

for (const path of files(ROOT)) {
  const lines = readFileSync(path, 'utf8').split('\n');

  // Frontmatter is the block between the first two `---` lines; the schemas check it.
  let bodyStart = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) bodyStart = end + 1;
  }

  // Body: drop fenced code, and inline code, before looking for markup. Frontmatter lines are
  // kept as blanks so line numbers stay right.
  let inFence = false;
  let body = '';
  for (let i = 0; i < lines.length; i++) {
    if (i < bodyStart) { body += '\n'; continue; }
    if (/^\s*(```|~~~)/.test(lines[i])) { inFence = !inFence; body += '\n'; continue; }
    body += (inFence ? '' : lines[i].replace(/`[^`]*`/g, '')) + '\n';
  }
  const lineOf = (index) => body.slice(0, index).split('\n').length;

  for (const m of body.matchAll(/!\[\s*\]\(/g)) report(path, lineOf(m.index), 'Image with empty alt text. Describe what it shows.');
  for (const m of body.matchAll(/<(img|Image)\b[^>]*>/g)) {
    if (!/\balt\s*=/.test(m[0])) report(path, lineOf(m.index), `<${m[1]}> with no alt attribute.`);
  }
  for (const m of body.matchAll(/<iframe\b[^>]*>/g)) {
    if (!/\btitle\s*=/.test(m[0])) report(path, lineOf(m.index), '<iframe> with no title. Name what it shows, for example "Video: 2026 kickoff recap".');
  }

  // Links: Markdown `[text](href)` (not images, which may use relative paths) and `href="…"`.
  const links = [
    ...[...body.matchAll(/(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)/g)].map((m) => [m.index, m[1]]),
    ...[...body.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)].map((m) => [m.index, m[1]]),
  ];
  for (const [index, href] of links) {
    if (/^\.\.?\//.test(href)) {
      report(path, lineOf(index), `Relative link "${href}". Link from the site root instead, like "/news/".`);
    } else if (SITE_LINK.test(href)) {
      report(path, lineOf(index), `"${href}" links to this site with the domain. Drop it and link from the site root, like "/news/".`);
    }
  }
}

if (problems.length) {
  console.error(`\nContent check failed (${problems.length}):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nSee CONTRIBUTING.md.\n');
  process.exit(1);
}
console.log('Content check passed.');
