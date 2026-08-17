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

The "Teams supported / Students reached / New teams launched / Funding provided" numbers shown
on the homepage and on the About page's Impact & Reports section aren't pulled from anywhere —
they're plain numbers typed directly into the page code, so update both places by hand when the
figures change:

- **Homepage**: `src/pages/index.astro`, the `impactMetrics` array near the top of the file.
- **About page**: `src/pages/about.astro`, the stat tiles inside the `id="impact"` section.

Just edit the `value` (or the number in each stat tile on About) and redeploy — no other code
changes needed.

## Deployment

Deploys to GitHub Pages automatically via `.github/workflows/deploy.yml` on every push to
`main`. Before the first deploy, confirm in the repo's Settings → Pages that the source is set
to "GitHub Actions", and check the `site`/`base` values in `astro.config.mjs` match the actual
GitHub org/repo (or custom domain) this is hosted under.
