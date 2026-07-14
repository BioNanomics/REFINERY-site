# Moving /resources to a docs subdomain

Goal: serve the Starlight `/resources` section at `docs.<yourdomain>` instead
of `<yourdomain>/resources/`, while keeping the marketing site on the main
domain — all still authored from this one repo.

**Why this needs two deploys:** GitHub Pages only supports one custom domain
per repo. A single Astro build can't serve two different domains at once
(canonical URLs and the `base` path are set once, site-wide), so this repo
produces two separate builds — `npm run build` (main site) and
`npm run build:docs` (docs, via `astro.config.docs.mjs`) — and each gets
deployed to its own GitHub Pages target.

## What's already in place

- `astro.config.docs.mjs` — docs-only build config. Same content/pages as the
  main build, but `site` points at the docs subdomain. Routes keep their
  `/resources/` prefix (e.g. `docs.example.com/resources/mentor-guides/...`)
  since that's how `src/content/docs/resources/**` is structured — dropping
  the prefix would mean restructuring that content collection, which isn't
  required to ship this.
- `npm run build:docs` — builds via that config into `dist-docs/`.
- `.github/workflows/deploy-docs.yml` — deploy job template, currently
  **manual-only** (`workflow_dispatch`) so it doesn't fail CI before it's
  configured.

## Steps to actually go live

1. **Pick the domain.** Update `site` in `astro.config.docs.mjs` (currently
   `https://docs.example.com`) and in `astro.config.mjs` (currently a
   placeholder GitHub Pages URL — see the `TODO` comment there) to the real
   root domain.
2. **Create the docs repo.** A second GitHub repo (e.g. `refinery-docs`) with
   GitHub Pages enabled, source set to the `gh-pages` branch.
3. **DNS.** Add a `CNAME` record: `docs.<yourdomain>` → `<github-org>.github.io`.
   In the docs repo's Pages settings, set the custom domain to
   `docs.<yourdomain>` (GitHub will create the `CNAME` file in that repo
   automatically, or the deploy workflow does it via the `cname:` input).
4. **Deploy token.** Create a GitHub personal access token with write access
   to the docs repo's contents, then add it as a secret named
   `DOCS_DEPLOY_TOKEN` on **this** repo (Settings → Secrets and variables →
   Actions).
5. **Wire up the workflow.** In `.github/workflows/deploy-docs.yml`:
   - Replace `external_repository: your-org/refinery-docs` with the real repo.
   - Replace `cname: docs.example.com` with the real subdomain.
   - Add a `push: branches: [main]` trigger (see the comment at the top of
     the file) once you're ready for it to deploy automatically.
6. **Update cross-links.** `src/components/nav/SiteFooter.astro` and
   `src/pages/blog/index.astro` currently link to Mentor Resources via
   `withBase('resources/')` (same-site relative). Once resources move to the
   subdomain, change those to the absolute URL
   (`https://docs.<yourdomain>/resources/`) so they still work from the main
   site.
7. **Run it.** Trigger `Deploy Docs Subdomain` manually from the Actions tab
   to confirm it works before switching on the automatic trigger.
