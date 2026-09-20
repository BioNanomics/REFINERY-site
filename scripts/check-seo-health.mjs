#!/usr/bin/env node
/**
 * SEO regression guard — see .github/workflows/seo-monitor.yml, which runs this on a schedule.
 *
 * Two independent checks, both raised by seo-technical-audit.md:
 *
 *   1. Build consistency. SITE_INDEXABLE (src/layouts/BaseHead.astro) and public/robots.txt
 *      are two independent switches that are meant to always move together — one controls the
 *      per-page noindex meta tag, the other controls crawling wholesale. Nothing in the code
 *      enforces that they agree, so a launch-day mistake (flip one, forget the other) would
 *      currently ship silently. This reads the actual build output and fails if they disagree.
 *
 *   2. Live smoke check. Hits whatever origin astro.config.mjs's `site`/`base` currently
 *      declare — so this keeps working unmodified through the review-mode -> launch transition
 *      — and confirms robots.txt, the sitemap, llms.txt, the homepage, and a sample of
 *      sitemap-listed pages actually resolve. This automates the manual spot-check README.md's
 *      launch checklist already asks for ("verify /robots.txt, /llms.txt, and
 *      /sitemap-index.xml serve 200 ... and that a few canonical URLs resolve 200").
 *
 * Run via `npm run check:seo` after `npm run build`. Exits non-zero on any failure.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`✗ ${message}`);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

// --- 1. Build consistency ---------------------------------------------------

async function collectHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

async function checkBuildConsistency() {
  const distDir = path.join(process.cwd(), 'dist');
  const robotsTxt = await readFile(path.join(distDir, 'robots.txt'), 'utf8').catch(() => null);
  if (robotsTxt === null) {
    fail('dist/robots.txt is missing — run `npm run build` first.');
    return;
  }

  const htmlFiles = await collectHtmlFiles(distDir);
  if (htmlFiles.length === 0) {
    fail('No built HTML pages found under dist/ — run `npm run build` first.');
    return;
  }

  // 404.html is deliberately noindex regardless of the site-wide switch (src/pages/404.astro
  // hardcodes index={false}), so it's excluded from the site-wide agreement check below.
  const pages = htmlFiles.filter((file) => path.basename(file) !== '404.html');

  let noindexCount = 0;
  for (const file of pages) {
    const html = await readFile(file, 'utf8');
    if (/<meta\s+name="robots"\s+content="noindex"/.test(html)) noindexCount++;
  }

  const allNoindex = noindexCount === pages.length;
  const noneNoindex = noindexCount === 0;

  if (!allNoindex && !noneNoindex) {
    fail(
      `Inconsistent indexing state: ${noindexCount}/${pages.length} built pages carry noindex. ` +
        'SITE_INDEXABLE is a single site-wide switch — every page should agree.',
    );
  } else {
    ok(`Site-wide indexing state is consistent (${allNoindex ? 'all pages noindex' : 'all pages indexable'}).`);
  }

  const robotsBlocksAll = /^Disallow:\s*\/\s*$/m.test(robotsTxt);

  if (allNoindex && !robotsBlocksAll) {
    fail(
      'Pages are noindex but public/robots.txt does not disallow crawling — SITE_INDEXABLE ' +
        'and robots.txt have drifted out of agreement.',
    );
  } else if (noneNoindex && robotsBlocksAll) {
    fail(
      'Pages are indexable but public/robots.txt still disallows all crawling — SITE_INDEXABLE ' +
        'and robots.txt have drifted out of agreement.',
    );
  } else {
    ok('robots.txt agrees with the site-wide indexing state.');
  }
}

// --- 2. Live smoke check -----------------------------------------------------

function originFor(site, base) {
  const trimmedBase = (base ?? '/').replace(/\/$/, '');
  return `${site.replace(/\/$/, '')}${trimmedBase}`;
}

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return res;
  } catch (err) {
    return { ok: false, status: err.message };
  }
}

async function checkLive() {
  const { default: config } = await import(new URL('../astro.config.mjs', import.meta.url));
  const origin = originFor(config.site, config.base);
  console.log(`\nLive smoke check against ${origin}`);

  for (const p of ['/robots.txt', '/sitemap-index.xml', '/llms.txt', '/']) {
    const url = `${origin}${p}`;
    const res = await fetchStatus(url);
    if (res.ok) ok(`${url} -> ${res.status}`);
    else fail(`${url} -> ${res.status}`);
  }

  // Sample canonical URLs straight from the sitemap, matching README's launch-checklist
  // wording ("a few canonical URLs resolve 200") rather than guessing paths by hand.
  const indexRes = await fetchStatus(`${origin}/sitemap-index.xml`);
  if (!indexRes.ok) {
    fail('Could not read sitemap-index.xml — skipping canonical URL sampling.');
    return;
  }

  const indexXml = await indexRes.text();
  const sitemapUrl = indexXml.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!sitemapUrl) {
    fail('sitemap-index.xml has no <loc> entries to follow.');
    return;
  }

  const sitemapRes = await fetchStatus(sitemapUrl);
  if (!sitemapRes.ok) {
    fail(`${sitemapUrl} -> ${sitemapRes.status}`);
    return;
  }

  const sitemapXml = await sitemapRes.text();
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  if (locs.length === 0) {
    fail('Sitemap contains no URLs.');
    return;
  }

  if (locs.every((loc) => loc.startsWith(origin))) {
    ok(`All ${locs.length} sitemap URLs match the configured origin.`);
  } else {
    fail(`Sitemap contains a URL outside ${origin} — check astro.config.mjs's \`site\`/\`base\`.`);
  }

  for (const loc of locs.slice(0, 5)) {
    const res = await fetchStatus(loc);
    if (res.ok) ok(`${loc} -> ${res.status}`);
    else fail(`${loc} -> ${res.status}`);
  }
}

// --- run ----------------------------------------------------------------------

await checkBuildConsistency();
await checkLive();

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll SEO health checks passed.');
