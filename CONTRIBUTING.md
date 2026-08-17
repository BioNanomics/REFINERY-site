# Contributing to The REFINERY website

This site is built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
Content lives in Markdown/MDX files under `src/content/`, so most updates don't require
touching any code.

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

### News post — `src/content/news/*.mdx`

```md
---
title: "Post title"
summary: "One or two sentences, shown on the news index card."
pubDate: 2026-08-01
author: "The REFINERY"        # optional, defaults to "The REFINERY"
heroImage: ../../assets/news/my-post.svg   # optional
heroImageAlt: "Alt text"                    # required if heroImage is set
category: refinery   # refinery | teams | regional | partnerships | first-community
teamRefs: ["1501"]            # optional, team numbers this story is about
sourceUrl: "https://..."      # optional — if set, the card links straight to this URL
                               # instead of getting an internal detail page (use for
                               # curated external/regional coverage)
sourceName: "The Example Gazette"  # optional, shown on the card as "via {sourceName}"
                                     # when sourceUrl is set
draft: false                  # set true to hide from the live site until ready
---

Body content in Markdown/MDX. Omit the body entirely for sourceUrl entries.
```

#### Featuring an external story

To feature a story from somewhere else (local press, FIRST Indiana, a partner's blog, etc.)
without writing your own write-up, create a news entry with `sourceUrl` set and no body. The
card automatically becomes an outbound link — clicking it sends readers straight to the
original article in a new tab instead of an internal REFINERY page, and it never generates its
own `/news/<slug>/` page. This is the minimal version:

```md
---
title: "Headline as it should appear on the card"
summary: "One or two sentences describing the story."
pubDate: 2026-08-01
category: regional   # refinery | teams | regional | partnerships | first-community
sourceUrl: "https://example.com/the-actual-article"
sourceName: "Publisher Name"   # shown on the card as "via Publisher Name"
draft: false
---
```

See `src/content/news/example-external-story.mdx` for a working (draft) example.

### Team — `src/content/teams/*.mdx`

```md
---
number: "1501"
name: "Team name"
program: FRC          # FRC | FTC
organization: "Parent organization — school, 4-H club, nonprofit, etc."
community: "City, State"
logo: ../../assets/teams/1501.svg   # optional
description: "One or two sentences about the team."
highlight: "2026 Regional Finalist"  # optional recent highlight
links:
  - label: "Team Website"
    url: "https://..."
draft: false
---
```

### Program — `src/content/programs/*.mdx`

```md
---
title: "Program name"
summary: "One or two sentences."
audience: [students, mentors]   # students | mentors | teams | volunteers | public
draft: false
---
```

### Event — `src/content/events/*.mdx`

```md
---
title: "Event name"
summary: "One or two sentences."
dateStart: 2026-09-12
dateEnd: 2026-09-13             # optional
location: "The REFINERY, Fort Wayne, IN"
audience: [students, teams]
featured: false                 # set true to give this event its own detail page
registrationUrl: "https://..."  # optional, only shown on featured event pages
draft: false
---

Body content in Markdown/MDX — only used if `featured: true`.
```

### Partner — `src/content/partners/*.mdx`

```md
---
name: "Partner name"
logo: ../../assets/partners/example.svg
url: "https://..."       # optional
description: "One sentence."  # optional
draft: false
---
```

### Person (staff/leadership) — `src/content/people/*.mdx`

```md
---
name: "Full name"
role: "Title"
photo: ../../assets/people/example.jpg   # optional
bio: "One or two sentences."
order: 1        # lower numbers sort first
draft: false
---
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

## Images

Don't hotlink or reuse other organizations' photography without confirmed permission — see
`docs/placeholder-images.md` for the current placeholder policy. Real photos should
be added under `src/assets/{news,teams,people,partners}/` and referenced by relative path in
frontmatter, so Astro can optimize them.

## Writing FIRST and program names

*FIRST* licenses its trademarks to registered teams on the condition that we follow the
[*FIRST* Branding & Design Guidelines](https://www.firstinspires.org/brand). Three rules
cover everything you'll write:

1. **Type `FIRST` in capitals.** Styling is automatic — the site italicizes the mark and
   adds the superscript ® on first use, in both Markdown/MDX bodies and `.astro` files.
   Lowercase "first" in ordinary prose ("our first season") is never touched.
2. **Never use a possessive or plural.** Not `FIRST's`, not `FIRSTs`, not `LEGOs`. Rewrite
   instead: "the mission of FIRST", "LEGO bricks".
3. **Spell out a program the first time it appears on a page** — `FIRST Robotics
   Competition`, `FIRST Tech Challenge`, `FIRST LEGO League`. `FRC`/`FTC` are acceptable
   after that first mention, but the guidelines define no official acronyms, so prefer the
   full name where it reads naturally.

Mechanics, if you need them: `src/utils/first.ts` holds the term table,
`src/plugins/rehype-first-marks.mjs` styles Markdown/MDX bodies, and
`src/components/brand/` has `<First />` for inline use in `.astro` templates and
`<FirstText text={...} />` for strings that arrive as props. Plain-text contexts that can't
hold markup (`<title>`, meta descriptions, `alt`) go through `firstPlain()` in
`src/layouts/BaseHead.astro`, which yields `FIRST®` without italics.

## Internal links inside Markdown/MDX body content

**Internal links inside Markdown/MDX body text must be relative**, not root-absolute — write
`../../projects/` rather than `/projects/`. The site currently sits at a domain root, so a
root-absolute link would happen to work today, but relative links stay correct if it ever moves
to a subpath, and this is the invariant `src/plugins/rehype-external-links.mjs` relies on to
treat an absolute `http(s)` href as off-site. Links inside `.astro` component files should use
the `withBase()` helper from `src/utils/base.ts` instead.

## Draft content

Set `draft: true` on any content entry to keep it out of production listings while you work on
it. Entries with their own detail page (news, featured events, projects) stay fully accessible
if you know the direct URL, so it's safe to preview before flipping `draft` to `false`. This
site currently ships with several example entries (a team, a partner, staff bios, programs,
events) marked `draft: true` as placeholders — replace them with real content and un-draft
when ready, or delete them if not needed.
