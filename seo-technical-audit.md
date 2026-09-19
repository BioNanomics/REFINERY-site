# Technical SEO Audit — The REFINERY (refineryrobotics.org)

**Site:** The REFINERY (nonprofit robotics makerspace, program of BioNanomics)
**Reviewed as:** Astro v7 static site, source in this repo, currently building to `dist/`
**Current deployment:** `https://bionanomics.github.io/REFINERY-site/` (GitHub Pages, **pre-launch review mode**)
**Eventual production domain:** `https://refineryrobotics.org` (DNS already pointed via Cloudflare; not yet armed)
**Pages audited:** Full site — 12 route templates, ~25 rendered URLs (see sitemap below), 100% coverage (small static site, no sampling needed)
**Audit date:** 2026-09-19
**Method:** Static analysis of source, `astro.config.mjs`, generated `dist/` output (sitemap, robots.txt, asset pipeline), and content-collection schemas. No live crawl was performed — the production domain isn't serving yet, and the review-mode domain is deliberately blocked from crawlers (see below), so tools like GSC/Lighthouse-on-a-live-URL aren't usable yet. This audit substitutes direct inspection of what the build actually emits.

---

## Executive summary

This is an unusually well-prepared static site from a technical SEO standpoint — canonical/noindex logic, JSON-LD, sitemap filtering, breadcrumbs, and image handling are already built with SEO correctness as an explicit design constraint, and the reasoning is documented in code comments throughout. There is no traffic at risk today: the site isn't indexed anywhere, and it's correctly kept that way on purpose.

The one item that looks like a P0 in a generic audit — **entire site returns `noindex` and `robots.txt` disallows everything** — is intentional pre-launch gating, not a defect. [`README.md`](README.md) already documents a specific, correctly-sequenced launch checklist for reverting this. The real value of this audit is: (1) confirm that checklist is complete and correctly ordered against a standard launch/migration playbook, (2) flag the handful of gaps it doesn't cover, and (3) score the layers underneath crawlability/indexability, which are otherwise ready to go.

**Biggest risk:** not a code defect but a *process* one — the launch checklist has ~10 sequenced steps across GitHub Pages, Cloudflare DNS, and Cloudflare header rules, executed by hand. The likeliest failure mode is a step skipped or done out of order (e.g., enabling Pages before creating `CNAME`, or setting HSTS before HTTPS is confirmed — both already called out in the README). Recommended next move: run the launch as a single tracked checklist pass in one sitting, verify each step with a `curl`/browser check before moving to the next, rather than treating it as "a few config flips." Estimated effort: under an hour of hands-on work, most of it DNS propagation wait time.

---

## 6-layer score

| Layer | Score | Notes |
|---|---|---|
| 1. Crawlability | **Blocked by design (pre-launch)** | `robots.txt` is `Disallow: /` deliberately. Sitemap, internal linking, and crawl-budget hygiene underneath it are all correct and ready. |
| 2. Indexability | **Blocked by design (pre-launch)** | `SITE_INDEXABLE = false` in one place ([`src/layouts/BaseHead.astro:36`](src/layouts/BaseHead.astro:36)) forces `noindex` site-wide. Canonical logic, redirect, and 404 handling underneath are correct. |
| 3. Rendering | **Excellent** | Fully static HTML per page (Astro, no client hydration needed for content). Nothing is JS-gated. |
| 4. Site architecture | **Excellent** | Flat structure, every page ≤2 clicks from home, no orphans, one redirect (no chains), fully consistent trailing-slash URLs. |
| 5. Structured data | **Excellent** | Organization, WebSite, Event, Article, Person, SportsTeam, BreadcrumbList — all sourced from visible page content with documented reasoning for every omission. |
| 6. Page experience & security | **Strong, partly deferred to launch** | Responsive, CLS-conscious, images auto-converted to WebP. HSTS/security headers can't be set by GitHub Pages and are correctly planned for Cloudflare — but only planned, not yet live. |

---

## Critical: launch-gating items (verify before/at cutover)

These aren't bugs to fix in code — they're the pre-launch → launch cutover itself, which this audit treats as the highest-risk event per standard migration practice, even though there's no existing indexed traffic to protect (this is a first launch, not a domain move).

1. **The review-mode → launch flip touches three independent files that must move together.** `astro.config.mjs` (`site`/`base`), `src/layouts/BaseHead.astro` (`SITE_INDEXABLE`), and `public/robots.txt` all currently reflect review mode. README's launch order gets the sequencing right (create `CNAME` first since that's what "arms" the domain on GitHub Pages), but nothing enforces the other three flip together in one commit. Do this as a single PR, not staged changes — an in-between state (e.g., `robots.txt` allowing crawling while `SITE_INDEXABLE` is still `false`) isn't harmful, but an unreviewed partial flip is exactly the kind of thing that ships silently wrong on a Friday.
2. **Cloudflare's auto-appended `robots.txt` content-signals block is a real, specific risk to the `Sitemap:` line.** README already flags this (step 6) — make sure it's an actual verification step at launch (`curl https://refineryrobotics.org/robots.txt`), not just a note that gets skipped because "it's probably fine."
3. **The `/teams` → `/about/teams/` redirect is a client-side meta-refresh, not a server 301** — a GitHub Pages platform limitation, correctly identified in `astro.config.mjs`'s own comment, not a config mistake. Meta-refresh passes weaker signal than a 301 and is slower for crawlers to process. Impact is low today (no external links point at `/teams` yet, since the site isn't indexed), but once Cloudflare is in front of the domain for the `www` redirect anyway (README step 4), consider moving this one redirect to a Cloudflare Redirect Rule instead — same infrastructure, gets a real 301 for free.
4. **HTTPS-first ordering matters and README has it right** — Cloudflare's "Always Use HTTPS" (step 4) before HSTS (step 5) before a long `max-age` (explicitly flagged as hard to walk back). No change needed; flagging only because this is the one step where doing it out of order has a multi-week consequence (a cached HSTS header on a broken cert).
5. **Verify `SITE_INDEXABLE: true` and `Disallow: /` don't end up disagreeing.** They're independent switches; a mistake in either one reintroduces a partial-block state that's easy to miss (page renders fine, looks live, but one of the two signals still says "don't index").

None of these require touching application logic — the code already does the right thing once the three flags/files agree. This is a checklist-execution risk, not a technical debt item.

---

## Important (address soon after launch, non-blocking)

1. **`telephone` and `geo` coordinates are absent from the Organization/Place JSON-LD**, deliberately — [`src/utils/schema.ts`](src/utils/schema.ts:9-14) documents this as "no source exists in the repo" rather than an oversight. Once a public phone number exists, add a `ContactPoint`; adding lat/lng to the Facility `Place` node would additionally make it eligible for map-style rich results. Not urgent — nothing is wrong today, there's just headroom once the underlying facts exist.
2. **Security response headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) exist only as a documented plan for Cloudflare Transform Rules, not as anything enforced yet.** GitHub Pages genuinely cannot set these, so Cloudflare is the right place — just make sure "verify `/robots.txt`, `/llms.txt`, and sitemap serve 200" (README step 6) also includes an explicit `curl -I` header check, since a page can look completely fine in a browser with these silently missing.
3. **`WebSite` schema has no `potentialAction`/`SearchAction`** — correct today, since there's no site search to advertise (declaring one that doesn't exist is a promise Google tests and fails). Revisit only if on-site search is ever added.

---

## Nice-to-have polish

1. No FAQ-style content exists yet on `/get-involved/` or `/donate/`, so there's nothing to mark up with `FAQPage` schema today — worth a second look if either page grows a real Q&A section later (e.g. "how do I start a team," "where does my donation go").
2. `public/llms.txt` already hard-codes the eventual production URLs and reach numbers (from `src/data/impact.ts`) even while the site itself is on the review-mode domain — sensible forward planning, just note that the next time `impact.ts` changes, `llms.txt`'s prose numbers need a manual update too (already flagged in README's "Updating the impact stats" section; repeating it here because it's the one place content and technical SEO overlap).

---

## What's already correct and doesn't need action

Calling these out explicitly so they aren't mistaken for gaps in a future audit:

- **Sitemap** excludes `/404` by filter, contains only canonical directory-style URLs, no `changefreq`/`priority` (Google ignores both), and no fabricated `lastmod` — all deliberate, documented choices in `astro.config.mjs`.
- **Canonicalization** is airtight: every indexable page self-canonicalizes to `Astro.site` + pathname; a `noindex` page gets no canonical at all (avoids inviting a blocked URL to be treated as real); trailing slashes are consistent everywhere via `withBase()`, so there's no `/page` vs `/page/` duplicate-content risk.
- **404 handling** is a genuine 404 status (GitHub Pages serves `404.html` with a real 404), not a soft-404, and it also carries `noindex` + no canonical as belt-and-braces.
- **Structured data** is unusually disciplined — every optional property traces to something visibly rendered on the page, with an explicit "absent beats wrong" policy; several tempting-but-incorrect claims (e.g. typing The REFINERY itself as a 501(c)(3), or claiming `memberOf`/`sponsor` over teams it only supports) are deliberately avoided and, in one case, enforced by a test.
- **Rendering** needs no JavaScript for any content — every page is fully static HTML, so there's no rendering-risk layer to worry about at all (no client-fetched titles, meta, or canonical tags).
- **Images** run through Astro's asset pipeline and are auto-converted to WebP (confirmed in `dist/_astro/` — 137 of ~155 processed images are `.webp`); above-the-fold images (hero, nav logo, team mastheads) are explicitly `loading="eager"`, everything else defers.
- **Accessibility-adjacent page-experience items** (skip link, reduced-motion-aware animation, keyboard-operable map markers, new-tab link announcements) were already addressed in a recent audit pass (see `accessibility-audit.md` and the `fix-accessibility-audit-findings` branch this review sits on).
- **No redirect map is needed for this launch** — this is a first public launch, not a URL migration off an already-indexed site, so there's no legacy URL inventory or backlink-preservation work to do. The one internal redirect (`/teams`) is already correctly scoped.

---

## Recommendations

### Now (before/at launch)
| # | Recommendation | Effort |
|---|---|---|
| 1 | Execute README's launch order as one PR + one sitting, verifying each step (esp. `robots.txt`, `SITE_INDEXABLE`, `site`/`base`) before moving to the next | ~1 hour + DNS wait |
| 2 | After step 6, explicitly `curl -I` the production domain to confirm HSTS/security headers landed, not just that pages render | 5 min |
| 3 | Run the Rich Results Test on the 5 URLs README already lists (step 8) — this is correctly the one check that needs a live URL | 15 min |

### Next (first month post-launch)
| # | Recommendation | Effort |
|---|---|---|
| 1 | Verify Search Console domain property + sitemap submission shows "Success," not just "submitted" | 10 min |
| 2 | Consider migrating the `/teams` meta-refresh to a Cloudflare Redirect Rule now that Cloudflare fronts the domain anyway | ~15 min |

### Later (as content grows)
| # | Recommendation | Effort |
|---|---|---|
| 1 | Add `telephone`/`geo` to Organization/Place schema once those facts are publishable | Low |
| 2 | Add `FAQPage` schema if/when `/get-involved/` or `/donate/` grow real Q&A content | Low |

---

## Open questions

- Is there a target date for launch, and should the checklist execution be scheduled/assigned to a specific person rather than left as documentation?
- Once live, who owns the recurring Search Console health check (coverage report, crawl stats) — this audit found no monitoring/alerting set up yet, which is expected pre-launch but worth assigning before traffic exists to monitor.

---

## Appendix: methodology

- **Analyzed:** `astro.config.mjs`, `src/layouts/BaseHead.astro`, `src/layouts/MarketingLayout.astro`, `src/layouts/ArticleLayout.astro`, `src/utils/schema.ts`, `src/utils/base.ts`, `src/utils/breadcrumbs.ts`, `src/content.config.ts`, all files under `src/pages/`, `public/robots.txt`, `public/llms.txt`, `README.md`, `.github/workflows/deploy.yml`, and the locally generated `dist/` output (sitemap, robots.txt, asset formats).
- **Not performed:** live crawl, Lighthouse/CWV field data, Search Console review, Rich Results Test — none are possible yet since production isn't serving and the review-mode domain is deliberately disallowed for crawlers. These are called out explicitly in the "Now" recommendations above as the first things to run once the domain is live.
- **Caveat:** this audit trusts the repo's own documented reasoning (e.g., for deliberate schema omissions) rather than re-deriving it independently, since the reasoning is unusually explicit and traceable to real site content in every case checked.
