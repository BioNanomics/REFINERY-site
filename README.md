# REFINERY Website
[![Deploy to GitHub Pages](https://github.com/BioNanomics/REFINERY-site/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/BioNanomics/REFINERY-site/actions/workflows/deploy.yml)

The public site for **The REFINERY**, a nonprofit robotics makerspace affiliated with
BioNanomics. Built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com); content lives in Markdown/MDX.

See [`plan.md`](./plan.md) for the original project brief and
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a news story, team, program, or event.

## Development

```sh
npm install
npm run dev       # http://localhost:4321
```

## Commands

| Command             | Action                                              |
| :------------------ | :--------------------------------------------------- |
| `npm install`        | Install dependencies                                  |
| `npm run dev`         | Start the local dev server                            |
| `npm run build`       | Build the production site to `./dist/`                |
| `npm run preview`     | Preview the production build locally                  |
| `npm run astro check` | Type-check the project                                |

## Updating the impact stats

The impact numbers shown on the homepage and in the About page's Impact section live in **one
place**: `src/data/impact.ts`. Both pages render `<ImpactStats />`, which reads that file, so
editing it updates both and they can't drift apart.

Edit the `value` of the clause you want to change and redeploy — no other code changes needed.
The numbers are also repeated in prose in `public/llms.txt`, which is not generated from
`impact.ts`, so update that too if a figure changes.

## Deployment

**Not deployed yet, on purpose.** GitHub Pages should be set to Source: **None** until launch.
`site` in `astro.config.mjs` is `https://refineryrobotics.org` and DNS already points there via
Cloudflare, but `public/CNAME` is deliberately absent, so nothing claims the domain. Pushes to
`main` will fail `.github/workflows/deploy.yml` while Pages is off — expected, not a regression.

Launch order, when ready. Step 1 is the arming step: GitHub Pages reads `CNAME` from the
deployed artifact and claims the custom domain from it, so don't enable Pages before it.

Because step 1 arms launch, keep it out of any branch carrying unrelated work. Merging such a
branch would go live early, before the redirect and headers below are in place. Commit `CNAME`
on its own, when you are ready to work through steps 2–8 in one sitting.

Step 4 is the one step worth doing **before** step 1 rather than after. `www` and the apex both
resolve today, so the moment the site serves content both hostnames serve identical pages with
identical canonical tags, and canonicals are hints rather than directives. Redirecting first
means Google never sees two live hostnames; redirecting after means a possible change-of-address
and weeks of recovery. Nothing breaks if the redirect exists before there is a site to redirect
to.

1. Create `public/CNAME` containing `refineryrobotics.org`, and merge to `main`.
2. Settings → Pages → Source: **GitHub Actions**. Not "Deploy from a branch" — that runs
   Jekyll against the repo root, which has no built HTML (`dist/` is gitignored), and it
   doesn't satisfy `actions/deploy-pages`, so the workflow keeps failing. This is an easy trap
   to fall into; it has already caught us once.
3. Confirm the custom domain registered, then enable **Enforce HTTPS**.
4. In Cloudflare, handle both redirects. Safe to do before step 1; see the note above.
   - 301 `www.refineryrobotics.org/*` → `https://refineryrobotics.org/$1`, preserving path and
     query (both hostnames currently resolve, and neither redirects).
   - SSL/TLS → Edge Certificates → enable **Always Use HTTPS**. Plain `http://` currently
     answers directly with no redirect. HSTS in step 5 only protects repeat visitors; this is
     what covers first contact.
5. In Cloudflare, add security response headers via Transform Rules → Modify Response Header.
   GitHub Pages can't set these, so Cloudflare is the only place they can come from. Do this
   **after** step 3 — HSTS before a working certificate locks visitors out:
   - `Strict-Transport-Security: max-age=86400; includeSubDomains` to begin with. Raise it
     toward `31536000` once you're confident HTTPS is stable: the value is cached by browsers,
     so a long `max-age` set too early is hard to walk back. Leave `preload` off entirely;
     getting off the preload list is much harder still.
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
6. Verify `/robots.txt`, `/llms.txt`, and `/sitemap-index.xml` serve 200 at the domain root,
   and that a few canonical URLs resolve 200. Cloudflare appends its own content-signals block
   to `robots.txt`, so confirm the `Sitemap:` line survives the merge.
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
