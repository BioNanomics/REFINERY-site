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
metaDescription: "Shorter copy for search results."  # optional, max 160 chars
highlight: "2026 Regional Finalist"  # optional recent highlight
rookieYear: 2005              # optional; the team's first competition season
banner:                       # optional photo across the top of the team page
  image: ../../assets/teams/1501-banner.jpg
  alt: "Describe what is happening in the photo"
  credit:
    text: "Photo: FIRST Indiana Robotics"
    url: "https://www.flickr.com/photos/indianafirst/"   # optional
awards: []                    # optional — see "Team awards" below
robots: []                    # optional — see "Robots" below
relatedTeams: []              # optional — see "Related teams" below
links:                        # optional, defaults to none
  - label: "Team Website"
    url: "https://..."
socials:                      # optional, all keys optional — see note below
  instagram: "https://instagram.com/..."
  facebook: "https://facebook.com/..."
  twitter: "https://x.com/..."
  tiktok: "https://tiktok.com/@..."
  youtube: "https://youtube.com/@..."
  flickr: "https://flickr.com/photos/..."
  tumblr: "https://teamname.tumblr.com"
  github: "https://github.com/..."
  linkedin: "https://linkedin.com/company/..."
  website: "https://..."
featured: false               # narrow effect — see note below
newTeam: false                # set true to put a "New!" badge on the team card
draft: false
---
```

Only `number`, `name`, `program`, `organization`, `community` and `description` are required.
Everything else is optional or defaults to empty, so an entry that sets none of the newer
fields renders exactly as it always did.

Where each field surfaces:

| Field | Card | Team page |
|---|---|---|
| `number`, `name`, `program` | yes | yes (eyebrow + `<h1>`) |
| `organization`, `community` | yes (one line) | yes (facts list) |
| `description` | yes | **no** — see below |
| `metaDescription` | no | `<meta name="description">` only |
| `logo` | yes | yes (plaque over the banner) |
| `banner` | no | yes |
| `rookieYear` | no | yes (facts list) + `foundingDate` in JSON-LD |
| `highlight` | yes | yes |
| `awards` | no | yes (banners + award history) |
| `robots` | no | yes |
| `relatedTeams` | no | yes |
| `links`, `socials` | yes | yes |

`description` is deliberately **not** rendered on the team page. It is the card blurb, and a
visitor arriving from a card has just read it. It still feeds the page's meta description and
its JSON-LD, so write it as a standalone summary. Put anything longer in the MDX body, which
renders as the team's bio — every entry's body is currently just a sourcing comment, and the
bio section stays hidden until one has real prose in it.

`socials` renders a row of platform icons on the team card, in the fixed order above
(`TeamCard.astro`) — the key order you write in frontmatter doesn't matter. Include only the
platforms a team actually uses; every key must be a full `https://` URL. Use `links` instead
for anything that needs its own label, like a sponsor page or a build blog.

Every team gets a page at `/teams/<program><number>/` — `/teams/frc1501/`, `/teams/ftc25638/`
— linked from its card. The program prefix is not cosmetic: FRC and FTC number teams
independently, so a bare number is not a unique key (`src/utils/teams.ts`). Drafts get no page.

**Notify a team before publishing its page.** These are profiles of other people's
organizations on The REFINERY's indexed domain, carrying `SportsTeam` structured data and, in
time, their award record — which is a different thing from a directory listing. The fifteen
teams in the collection at launch were notified and offered the chance to opt out or supply
their own bio; the same courtesy applies to every team added afterwards. Use `draft: true`
while that conversation is outstanding — a draft gets no page and no URL to index.

`banner` is all-or-nothing: supplying a photo requires `alt` and a visible `credit`. That is
enforced by the schema because The REFINERY's permission to use FIRST Indiana's photography
depends on attribution the reader can see — `docs/placeholder-images.md` has the full terms
and the download-not-hotlink rule.

The masthead is a band with the logo plaque overlapping its lower edge. The band is the
`banner` photo when there is one and a brand-navy panel otherwise, which is a designed state
rather than a placeholder — a team needs no photo for its page to look finished. A team with
no `logo` gets the band alone and is identified by the eyebrow and heading instead.

#### Team awards

```yaml
awards:
  - name: "Winning Alliance"        # verbatim, as FIRST worded it that season
    typeKey: WINNER                 # normalized key — see src/utils/awards.ts
    year: 2024
    event: "Indiana State Championship"
    eventLevel: district-championship
    placementMeaning: alliance-seat # required whenever `placement` is set
    placement: 2                    # optional
    source: "https://..."           # REQUIRED
```

Four things to know before adding one:

**`source` is required.** An award is a public factual claim about someone else's team,
published on The REFINERY's domain. Every entry cites where it came from, and the citation
renders as a link beside the award.

**`typeKey` carries the logic; `name` is only display.** FIRST renamed the Chairman's Award to
the FIRST Impact Award for the 2023 season, so a 2016 entry reads `name: "Chairman's Award"`
with `typeKey: IMPACT` and classifies identically to a modern one. Add new keys to
`src/utils/awards.ts`, not to the schema.

**`placement` means two different things,** which is why `placementMeaning` is mandatory
alongside it. For a judged award it is a rank (`rank` → "3rd place Think Award"). For
Winner/Finalist it is the team's seat on the alliance (`alliance-seat` → "Winning Alliance",
seat number dropped). Getting this wrong produces "3rd place Winner", which is nonsense —
every team on that alliance won. The build fails if you set `placement` without saying which
it is.

**No blanket data-source notice.** Awards are typed in by hand from public sources, and each
one renders its own citation as a link — that is the attribution. The site deliberately does
NOT carry a standing "Event data provided by *FIRST*" or "Powered by The Blue Alliance" line,
because it does not consume either API and claiming a data-feed relationship it doesn't have
would be its own small untruth. If a sync script is ever added that does call those APIs,
their terms require that attribution and it goes back in then — FIRST's on every page
carrying the data, The Blue Alliance's with a link back and their name kept out of any
REFINERY branding.

**Banners are derived, not declared.** `src/utils/banners.ts` decides:

- **FRC — blue**, for a winning alliance, the Impact Award, or the Woodie Flowers Award, at
  **any** event level including offseason.
- **FTC — orange**, for a premier-event winning alliance or a 1st place Inspire Award. The
  premier requirement is also what keeps FTC offseason results out, so the two programs
  deliberately do not behave the same way about event level.

Two things that catch people out. The Impact Award was the **Chairman's Award** before 2023 —
both wordings hang, which is why `typeKey` carries the logic and `name` is only display. And
**Woodie Flowers** goes to an individual mentor, not the team, so "hangs a banner" and "is a
team award" are separate questions.

This is close to The Blue Alliance's widely-copied `BLUE_BANNER_AWARDS` list but not
identical — TBA also counts Chairman's Finalist. If you go looking for a canonical set you
will find theirs; this one is the site's. To override the derivation for a single award, set
`banner: true|false` **and** `bannerNote` explaining the correction; the build rejects one
without the other.

#### Robots

```yaml
robots:
  - name: "Wave Ryder"
    year: 2025
    game: "Reefscape"                      # optional, the season's name
    description: "One or two sentences."   # optional, max 280 chars
    image: ../../assets/teams/1501-wave-ryder.jpg   # optional
    imageAlt: "Describe the robot"                  # optional, but supply it with an image
```

Newest season first — the list is sorted for you, so frontmatter order doesn't matter. `year`
rather than a free-text season is what makes that sort possible.

Two things worth knowing. FIRST **game** names are trademarks in their own right, but they are
not in `FIRST_TOKENS` (`src/utils/first.ts`), so `game` renders exactly as you type it and
never picks up a ® — that is correct, not a gap. And `imageAlt` is optional in the schema but
should always accompany an `image`: without it the photo is treated as decorative, which is
the right default for a missing value but the wrong outcome for a real robot photo.

#### Related teams

```yaml
relatedTeams:
  - frc-8742-argyll-attack     # entry ids (the filename without .mdx), not team numbers
```

Entry ids rather than numbers, via Astro's `reference()`, so a typo **fails the build** instead
of rendering a dead link — and a number would reopen the FRC/FTC ambiguity the URL slug closed.
(`news.teamRefs` stays on numbers for a different reason: a story may name a team that has no
entry here at all, which is harmless there and unacceptable here.)

**Declare it on one side only.** `relatedTeamsFor()` in `src/utils/teams.ts` unions a team's own
list with every team that lists *it*, so the pairing appears on both pages either way and a
half-declared relationship is impossible. Declaring both sides is harmless but redundant.

Drafts and self-references are dropped automatically.

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

**Past events hide themselves.** Once `dateEnd` (or `dateStart`, if there's no `dateEnd`) is
behind us in Fort Wayne time, the event stops appearing on `/programs-events/` — no need to
delete it or set `draft: true`. Its detail page stays live, so old links and indexed URLs
don't turn into 404s. Because the site is static, this takes effect at the next build; the
nightly schedule in `.github/workflows/deploy.yml` is there so that happens on its own.

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

This is different from how a past event drops off the listing: that one keeps its detail page
on purpose, because the page was already published and linked. See the Event section above.
