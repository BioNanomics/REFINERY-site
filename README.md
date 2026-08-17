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

The "Teams supported / Students reached / New teams launched / Funding provided" numbers shown
on the homepage and on the About page's Impact & Reports section aren't pulled from anywhere —
they're plain numbers typed directly into the page code, so update both places by hand when the
figures change:

- **Homepage**: `src/pages/index.astro`, the `impactMetrics` array near the top of the file.
- **About page**: `src/pages/about.astro`, the stat tiles inside the `id="impact"` section.

Just edit the `value` (or the number in each stat tile on About) and redeploy — no other code
changes needed.

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
5. Verify `/robots.txt` and `/sitemap-index.xml` serve 200 at the domain root, and that a few
   canonical URLs resolve 200.
6. Verify `refineryrobotics.org` as a **domain property** in Search Console, and submit the
   sitemap.

`site` in `astro.config.mjs` and `public/CNAME` must always agree.
