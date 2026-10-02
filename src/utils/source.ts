import { existsSync } from 'node:fs';

const REPO_URL = 'https://github.com/BioNanomics/REFINERY-site';
const BRANCH = 'main';

/** GitHub blob URL for a repo-relative path such as `src/content/news/foo.mdx`. */
export function githubSourceUrl(path: string): string {
  return `${REPO_URL}/blob/${BRANCH}/${path.replace(/^\.?\//, '')}`;
}

/** Maps `Astro.routePattern` ('/', '/news/[id]') back to the file in src/pages. Build-time only. */
export function pageSourcePath(routePattern: string): string | undefined {
  const base = `src/pages${routePattern === '/' ? '' : routePattern}`;
  return [`${base}.astro`, `${base}/index.astro`].find((path) => existsSync(path));
}
