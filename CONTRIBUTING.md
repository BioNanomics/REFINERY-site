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
summary: "One or two sentences, shown on the news index card."   # max 280 characters
pubDate: 2026-08-01
author: "The REFINERY"        # optional, defaults to "The REFINERY"
heroImage: ../../assets/news/my-post.svg   # optional
heroImageAlt: "Alt text"                    # set whenever heroImage is set — see note below
category: refinery   # refinery | teams | regional | partnerships | events | first-community
                      # one or more — see "Categories" below
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

#### Categories

The allowed slugs live in `src/utils/news-categories.ts` — that one list drives the schema's
allowed values, the badge on each news card, and the filter chips on the news index. Add a
category there, not in `src/content.config.ts`.

A story can carry more than one. Write `category` in any one of these three forms — they all
normalize to the same deduped list, and **the first entry is the story's primary category**
(the one shown as the card badge):

```md
category: teams                    # a single slug
category: partnerships, teams      # bare scalar, split on commas
category: [partnerships, teams]    # explicit YAML list
```

Use one of them per file, not all three.

#### Hero image alt text

`heroImageAlt` isn't schema-enforced, but write one whenever you set `heroImage`. With it
missing, `NewsCard.astro` and `ArticleLayout.astro` both fall back to `alt=""`, which tells a
screen reader the image is decorative — fine for a gradient placeholder, wrong for a photo of
a team.

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
category: regional   # refinery | teams | regional | partnerships | events | first-community
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
links:                        # optional, defaults to none
  - label: "Team Website"
    url: "https://..."
socials:                      # optional, all keys optional — see note below
  instagram: "https://instagram.com/..."
  facebook: "https://facebook.com/..."
  twitter: "https://x.com/..."
  tiktok: "https://tiktok.com/@..."
  youtube: "https://youtube.com/@..."
  tumblr: "https://teamname.tumblr.com"
  github: "https://github.com/..."
  website: "https://..."
featured: false               # narrow effect — see note below
newTeam: false                # set true to put a "New!" badge on the team card
draft: false
---
```

`socials` renders a row of platform icons on the team card, in the fixed order above
(`TeamCard.astro`) — the key order you write in frontmatter doesn't matter. Include only the
platforms a team actually uses; every key must be a full `https://` URL. Use `links` instead
for anything that needs its own label, like a sponsor page or a build blog.

`featured` does less than the name suggests: the "Meet the Teams" teaser on the About page
picks its teams at random in the browser on every visit, so `featured` only decides the
server-rendered default set that a visitor without JavaScript sees (`RandomTeamsTeaser.astro`).
It has no effect on the full teams list at `/about/teams/`, which sorts by program and number.

### Program — `src/content/programs/*.mdx`

```md
---
title: "Program name"
summary: "One or two sentences."
audience: [students, mentors]   # optional; students | mentors | teams | volunteers | public
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
location: "Venue name"          # display name, shown on the card and detail page
venueAddress:                   # optional, but see note below
  streetAddress: "9100 Winchester Rd"
  addressLocality: "Fort Wayne"
  addressRegion: "IN"
  postalCode: "46819"
audience: [students, teams]     # optional; students | mentors | teams | volunteers | public
featured: false                 # set true to give this event its own detail page
registrationUrl: "https://..."  # optional, renders a Register button on featured event pages
isFree: true                    # optional — see note below
draft: false
---

Body content in Markdown/MDX — only used if `featured: true`.
```

**Fill in `venueAddress` for any public event.** Google won't consider an event for rich
results (the date/venue card in search results) without a complete street address, so a
featured event that omits it gets no `Event` structured data at all — see
`src/utils/schema.ts`. Don't repeat the venue name inside `venueAddress`; `location` above is
the single source for it.

**`isFree` is deliberately three-state.** Set `true` for a free event and the detail page says
"Free to attend" and the `Event` schema gets a zero-price `offers`. **Leave it out entirely**
when you don't know the admission terms — the page then says nothing about cost and `offers` is
omitted, rather than guessing. Setting `false` claims the event is paid without saying a price,
so prefer omitting it until you know.

Two things worth knowing when you add an event: dates are published date-only, because
frontmatter carries no time of day and inventing one would tell search engines the wrong start
time. And there's no `image` field on events yet, so nothing event-specific appears in the
structured data or the social card.

### Partner — `src/content/partners/*.mdx`

```md
---
name: "Partner name"
logo: ../../assets/partners/example.svg   # required
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
bio: "One or two sentences."             # optional
quote: "A sentence in their own words."  # optional, rendered as a pull quote
linkedin: "https://linkedin.com/in/..."  # optional — see note below
order: 1        # optional, defaults to 0; lower numbers sort first
featured: false # optional, gives this person a larger bracketed card
draft: false
---
```

`bio` and `quote` are both optional, but an entry with neither gets a plain photo-and-name
card with no body — `PeopleBios.astro` only builds the card body when at least one is present.

`linkedin` takes either form. A bare URL for one person:

```md
linkedin: "https://linkedin.com/in/example"
```

Or one `{name, url}` pair per person when a single entry covers more than one — a founding
couple sharing a card, say:

```md
linkedin:
  - name: "First Person"
    url: "https://linkedin.com/in/first"
  - name: "Second Person"
    url: "https://linkedin.com/in/second"
```

Both normalize to a list internally, so existing single-URL entries need no change.

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
`../../news/` rather than `/news/`. The site currently sits at a domain root, so a
root-absolute link would happen to work today, but relative links stay correct if it ever moves
to a subpath, and this is the invariant `src/plugins/rehype-external-links.mjs` relies on to
treat an absolute `http(s)` href as off-site. Links inside `.astro` component files should use
the `withBase()` helper from `src/utils/base.ts` instead.

## Draft content

Set `draft: true` on any content entry to keep it out of listings **and out of the build**. A
draft entry gets no detail page at all, so there is no URL for a search engine to index or for
anyone to stumble onto — the `getStaticPaths` filters in `src/pages/news/[id]/index.astro` and
`src/pages/programs-events/[id].astro` exclude drafts outright. To preview a draft, flip
`draft: false` locally while you work on it.
