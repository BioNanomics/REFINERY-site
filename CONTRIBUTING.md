# Contributing to The REFINERY website

This site is built with [Astro](https://astro.build), [Starlight](https://starlight.astro.build)
(for `/resources`), and [Tailwind CSS](https://tailwindcss.com). Content lives in Markdown/MDX
files under `src/content/`, so most updates don't require touching any code.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build      # production build to ./dist, catches base-path/type errors dev doesn't
npm run preview    # serve the production build locally
npm run astro check  # type-check
```

## Adding content

Every content type below is a folder of Markdown/MDX files under `src/content/`. Add a new
file, fill in the frontmatter fields (schemas enforced in `src/content.config.ts`), and it
appears on the site automatically — no code changes needed.

### Blog post — `src/content/blog/*.mdx`

```md
---
title: "Post title"
summary: "One or two sentences, shown on the blog index card."
pubDate: 2026-08-01
author: "The REFINERY"        # optional, defaults to "The REFINERY"
heroImage: ../../assets/blog/my-post.svg   # optional
heroImageAlt: "Alt text"                    # required if heroImage is set
tags: [event, announcement, deep-dive, github-repo, update]
draft: false                  # set true to hide from the live site until ready
---

Body content in Markdown/MDX.
```

### Project — `src/content/projects/*.mdx`

```md
---
title: "Project title"
summary: "One or two sentences, shown on the projects index card."
pubDate: 2026-08-01
image: ../../assets/projects/my-project.svg   # required
imageAlt: "Alt text"                          # required
tags: [FRC, manufacturing]
status: completed   # completed | in-progress | archived
featured: false      # featured projects sort first
links:
  - label: "GitHub repo"
    url: "https://github.com/..."
draft: false
---

Body content in Markdown/MDX.
```

### App — `src/content/apps/*.mdx`

```md
---
name: "App name"
summary: "One sentence describing what it does."
icon: ../../assets/apps/my-app-icon.svg   # optional
externalUrl: "https://example.com"
status: live   # live | beta | coming-soon
order: 2        # lower numbers sort first
---
```

The Apps page body content isn't rendered — only the frontmatter is used on the card. Leave
the body empty or use it for your own notes.

### Mentor guide / technical deep-dive — `src/content/docs/resources/mentor-guides/*.mdx` or `.../technical/*.mdx`

```md
---
title: "Guide title"
description: "One sentence, used for the page's meta description and search."
---

Body content in Markdown/MDX. Starlight adds the sidebar, search, and prev/next nav
automatically based on the file's location.
```

**Important:** every file under `src/content/docs/` must stay inside the `resources/`
subfolder (either `resources/mentor-guides/` or `resources/technical/`, or add a new
subfolder and register it in the `sidebar` array in `astro.config.mjs`). Adding a file
directly under `src/content/docs/` (outside `resources/`) will leak a Starlight route outside
`/resources/*`.

## Images

Don't hotlink or reuse other organizations' photography without confirmed permission — see
`public/images/placeholders/README.md` for the current placeholder policy. Real photos should
be added under `src/assets/{blog,projects,apps}/` and referenced by relative path in
frontmatter, so Astro can optimize them.

## Internal links inside Markdown/MDX body content

Because the site is deployed under a base path (`/refinery-website`, or your configured
domain), **internal links inside Markdown/MDX body text must be relative**, not root-absolute.
Write `../../projects/` rather than `/projects/`. Links inside `.astro` component files should
use the `withBase()` helper from `src/utils/base.ts` instead.

## Draft content

Set `draft: true` on a blog post or project to keep it out of production listings while you
work on it. It stays fully accessible if you know the direct URL, so it's safe to preview
before flipping `draft` to `false`.
