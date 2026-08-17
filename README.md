# REFINERY Website

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

1. Create `public/CNAME` containing `refineryrobotics.org`, and merge to `main`.
2. Settings → Pages → Source: **GitHub Actions**. Not "Deploy from a branch" — that runs
   Jekyll against the repo root, which has no built HTML (`dist/` is gitignored), and it
   doesn't satisfy `actions/deploy-pages`, so the workflow keeps failing. This is an easy trap
   to fall into; it has already caught us once.
3. Confirm the custom domain registered, then enable **Enforce HTTPS**.
4. In Cloudflare, 301 `www.refineryrobotics.org` → the apex (both currently resolve).
5. In Cloudflare, add security response headers via Transform Rules → Modify Response Header.
   GitHub Pages can't set these, so Cloudflare is the only place they can come from. Do this
   **after** step 3 — HSTS before a working certificate locks visitors out:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` — start with a short
     `max-age` and raise it once you're confident HTTPS is stable, since the value is cached
     by browsers and hard to walk back.
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
6. Verify `/robots.txt`, `/llms.txt`, and `/sitemap-index.xml` serve 200 at the domain root,
   and that a few canonical URLs resolve 200. Cloudflare appends its own content-signals block
   to `robots.txt`, so confirm the `Sitemap:` line survives the merge.
7. Verify `refineryrobotics.org` as a **domain property** in Search Console, and submit the
   sitemap.
8. Run the [Rich Results Test](https://search.google.com/test/rich-results) against the
   homepage, `/news/re-blitz-summer-build-kickoff/`, and `/programs-events/monster-match/` to
   validate the Organization, Article, and Event structured data. This needs a live URL, so it
   is the one check that can't be done before launch.

`site` in `astro.config.mjs` and `public/CNAME` must always agree.
