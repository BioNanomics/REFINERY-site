# REFINERY Website
[![Deploy to GitHub Pages](https://github.com/BioNanomics/REFINERY-site/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/BioNanomics/REFINERY-site/actions/workflows/deploy.yml)

The public site for **The REFINERY**, a nonprofit robotics makerspace affiliated with
BioNanomics. Built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com); content lives in Markdown/MDX.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a news story, team, program, or event.
[`plan.md`](./plan.md) and [`rewrite.md`](./rewrite.md) are the original project brief and the
later content proposal; they are kept for history, and the site has since moved on (for
example, it does not use Starlight). [`docs/placeholder-images.md`](./docs/placeholder-images.md)
covers image sourcing and licensing.

## Development

Requires Node 24 (`.nvmrc` pins the version).

```sh
npm install
npm run dev       # http://localhost:4321
```

## Commands

| Command             | Action                                              |
| :------------------ | :--------------------------------------------------- |
| `npm install`        | Install dependencies                                  |
| `npm run dev`         | Start the local dev server                            |
| `npm test`            | Run the vitest suite (also the first job in the deploy workflow) |
| `npm run build`       | Run the content check, then build the production site to `./dist/` |
| `npm run check`       | Run the content check on its own (see CONTRIBUTING.md) |
| `npm run preview`     | Preview the production build locally                  |
| `npm run astro check` | Type-check the project                                |
| `npm run check:seo`   | After a build: confirm `robots.txt` and `noindex` agree, then smoke-check the live site |
| `npm run news:thumbnails` | Find publisher thumbnails for external news stories (see `CONTRIBUTING.md`) |

## Environment variables

Copy `.env.example` to `.env` for local development:

```sh
cp .env.example .env
```

| Variable | Required for | Notes |
| :--- | :--- | :--- |
| `PUBLIC_CARTO_API_KEY` | The service-area map on `/about/` (`src/components/marketing/ServiceAreaMap.astro`) | CARTO now watermarks its basemap tiles ("API KEY REQUIRED") without one. Free, no CARTO account needed, 5M tiles/month — request one at <https://carto.com/basemaps/apikey>. Without it, the map still renders (county outlines, pins, popups all still work) — only the basemap tiles underneath carry the watermark. |

`PUBLIC_CARTO_API_KEY` also has to be set as a **repository secret** (Settings → Secrets and
variables → Actions → New repository secret, named exactly `PUBLIC_CARTO_API_KEY`) for the
deployed site — `.env` is local-only and gitignored, so the GitHub Actions build in
`.github/workflows/deploy.yml` reads the value from that secret instead.

## Updating the impact stats

The impact numbers shown on the homepage and in the About page's Impact section live in **one
place**: `src/data/impact.ts`. Both pages render `<ImpactStats />`, which reads that file, so
editing it updates both and they can't drift apart.

Edit the `value` of the clause you want to change and redeploy — no other code changes needed.
The numbers are also repeated in prose in `public/llms.txt`, which is not generated from
`impact.ts`, so update that too if a figure changes.

## Deployment

**Launched.** The site is live at `https://refineryrobotics.org`. Merging to `main` deploys it
to GitHub Pages (Source: GitHub Actions) through `.github/workflows/deploy.yml`, which also
rebuilds nightly so past events drop off the listing. `seo-monitor.yml` runs
`npm run check:seo` against the live site every day.

The launch switches in the repo are all in their live state, and must always move together:

- `public/CNAME` contains `refineryrobotics.org`; `site` in `astro.config.mjs` is the same
  domain with no `base`. These two must always agree.
- `SITE_INDEXABLE` in `src/layouts/BaseHead.astro` is `true`.
- `public/robots.txt` is `Allow: /` plus the `Sitemap:` line.

`npm run check:seo` fails if `SITE_INDEXABLE` and `robots.txt` disagree. If review needs to
pause (for example, to take the site out of search), flip all of them back together. The
earlier review-mode setup was `site: https://bionanomics.github.io` with
`base: '/REFINERY-site'`, `Disallow: /` in `robots.txt`, `SITE_INDEXABLE = false`, and no
`CNAME`; commit `ed6a84f` shows it.

The checklist below is the original launch order. The repo side (step 1) is done. Steps 2–8
live in GitHub and Cloudflare settings, which nothing in this repo can verify, so treat them
as a checklist to confirm rather than a record of what was done. The scheduled SEO check
covers only part of step 6.

Step 1 is the arming step: GitHub Pages reads `CNAME` from the deployed artifact and claims
the custom domain from it.

1. `public/CNAME` containing `refineryrobotics.org` is merged to `main` (done).
2. Settings → Pages → Source: **GitHub Actions**. Not "Deploy from a branch" — that runs
   Jekyll against the repo root, which has no built HTML (`dist/` is gitignored), and it
   doesn't satisfy `actions/deploy-pages`, so the workflow keeps failing. This is an easy trap
   to fall into; it has already caught us once.
3. Confirm the custom domain registered, then enable **Enforce HTTPS**.
4. In Cloudflare, handle both redirects. Without the `www` redirect, both hostnames serve
   identical pages with identical canonical tags, and canonicals are hints rather than
   directives.
   - 301 `www.refineryrobotics.org/*` → `https://refineryrobotics.org/$1`, preserving path and
     query.
   - SSL/TLS → Edge Certificates → enable **Always Use HTTPS**. HSTS in step 5 only protects
     repeat visitors; this is what covers first contact.
   - Verify both: `curl -I http://www.refineryrobotics.org` should 301 to the apex, and
     `curl -I http://refineryrobotics.org` should 301 to `https://`.
5. Add security response headers. GitHub Pages can't set these, so Cloudflare is the only
   place they can come from — but which Cloudflare feature depends on the plan: Transform
   Rules → Modify Response Header if the zone has it, otherwise a Cloudflare Worker (Free
   plan; Workers & Pages → Create Worker) bound to a route on `refineryrobotics.org/*` (added
   under the worker's Settings → Domains & Routes), since Free-plan zones don't get Transform
   Rules. A Worker runs on every request either way, so functionally identical to a visitor.
   Set:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
   - `Strict-Transport-Security` — add this one **after** step 3, not with the others. HSTS
     before a working certificate locks visitors out. Start at
     `max-age=86400; includeSubDomains`; raise it toward `31536000` once you're confident
     HTTPS is stable (the value is cached by browsers, so a long `max-age` set too early is
     hard to walk back). Leave `preload` off entirely — getting off the preload list is much
     harder still.
   - Verify: `curl -sI https://refineryrobotics.org | grep -Ei "x-content-type-options|referrer-policy|permissions-policy|strict-transport-security"` — a page can render perfectly in a
     browser with any of these silently missing.
6. Verify `/robots.txt`, `/llms.txt`, and `/sitemap-index.xml` serve 200 at the domain root,
   and that a few canonical URLs resolve 200. Cloudflare appends its own content-signals block
   to `robots.txt`, so confirm the `Sitemap:` line survives the merge. Also confirm
   `SITE_INDEXABLE` and `robots.txt` agree — view-source a page for `noindex` and diff it
   against what `robots.txt` allows; they're independent switches and a mismatch in either
   direction (indexable but disallowed, or allowed but noindexed) is easy to miss because the
   page still looks live.
7. Verify `refineryrobotics.org` as a **domain property** in Search Console, and submit the
   sitemap.
8. Run the [Rich Results Test](https://search.google.com/test/rich-results) against every page
   that emits structured data. This needs a live URL, so it is the one check that can't be done
   before launch.
   - `/`: Organization, WebSite
   - `/about/`: Organization with the facility Place, plus one Person per bio
   - `/about/teams/`: BreadcrumbList
   - `/news/re-blitz-summer-build-kickoff/`: Article, BreadcrumbList
   - `/programs-events/monster-match/`: Event, BreadcrumbList

`site` in `astro.config.mjs` and `public/CNAME` must always agree.

**Contact form**, separately from the domain cutover above: `src/config/forms.ts` relays
through Web3Forms, and its actual spam/delivery protections live entirely in Web3Forms' own
dashboard — invisible to `npm test`, `astro check`, or `npm run build`, all of which only see
the config object, not whether Web3Forms is honoring it. Check these once, ideally before
launch:

- `info@refineryrobotics.org` still shows as a **verified** destination inbox in the Web3Forms
  dashboard. Verification is what makes the access key deliver at all; there's no local way to
  tell it's slipped.
- This form's **preferred captcha** is set to `hCaptcha` in the Web3Forms dashboard, not left
  on `None`. The hCaptcha widget renders in the popup either way, so a wrong setting fails
  silently — visitors see a captcha that isn't actually blocking anything.
- Once the real domain is live, submit the form for real (not a local dev build) and confirm
  the email actually arrives at `info@refineryrobotics.org` before assuming it works.

If something is visibly wrong on the live domain (broken build, bad redirect, wrong content),
fix forward on `main` and let the next deploy overwrite it. Reverting `public/CNAME` leaves
`refineryrobotics.org` pointed at Cloudflare with nothing behind it, which is worse than a
broken-but-live site. Only go back to review mode (see above) if the site needs to pause for
more than a few minutes.

`seo-monitor.yml` checks daily that `robots.txt`, the sitemap, `llms.txt`, and a sample of pages
still resolve, and that the indexing switches agree. It is not an uptime monitor and does not
replace Search Console. Decide who owns a recurring look at Search Console's coverage report
and at the monitor's workflow runs.
