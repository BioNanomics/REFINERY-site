# REFINERY Website

The public site for **The REFINERY**, a nonprofit robotics makerspace affiliated with
BioNanomics. Built with [Astro](https://astro.build),
[Starlight](https://starlight.astro.build) (for `/resources`), and
[Tailwind CSS](https://tailwindcss.com); content lives in Markdown/MDX.

See [`plan.md`](./plan.md) for the original project brief and
[`CONTRIBUTING.md`](./CONTRIBUTING.md) for how to add a blog post, project, app, or mentor
resource.

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
| `npm run build:docs`  | Build the `/resources` docs for a separate subdomain deploy — see [`docs/SUBDOMAIN-SETUP.md`](./docs/SUBDOMAIN-SETUP.md) |

## Deployment

Deploys to GitHub Pages automatically via `.github/workflows/deploy.yml` on every push to
`main`. Before the first deploy, confirm in the repo's Settings → Pages that the source is set
to "GitHub Actions", and check the `site`/`base` values in `astro.config.mjs` match the actual
GitHub org/repo (or custom domain) this is hosted under.

Moving `/resources` to its own subdomain (e.g. `docs.therefinery.org`) is prepared but not yet
wired up — see [`docs/SUBDOMAIN-SETUP.md`](./docs/SUBDOMAIN-SETUP.md) for the full runbook.
