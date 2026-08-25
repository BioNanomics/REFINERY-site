import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { NEWS_CATEGORY_SLUGS } from './utils/news-categories';
import { AWARD_TYPE_KEYS, EVENT_LEVELS } from './utils/awards';

// A story can belong to more than one category. Frontmatter accepts any of:
//   category: teams
//   category: partnerships, teams        (bare YAML scalar, split on commas)
//   category: [partnerships, teams]      (explicit YAML list)
// All three normalize to an array, deduped, with order preserved — the first
// entry is the story's primary category.
//
// The allowed values come from src/utils/news-categories.ts — add new categories
// there, not here.
const newsCategory = z.enum(NEWS_CATEGORY_SLUGS);
const newsCategories = z.preprocess(
  (value) => {
    const list = typeof value === 'string' ? value.split(',') : value;
    if (!Array.isArray(list)) return list;
    const trimmed = list.map((entry) => (typeof entry === 'string' ? entry.trim() : entry));
    return [...new Set(trimmed)];
  },
  z.array(newsCategory).nonempty(),
);

const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(280),
      // Overrides `summary` for the <meta name="description"> and the Article schema on a
      // detail page. `summary` is sized for a news card (280 is a comfortable blurb), but
      // search results cut off near 160 — so a summary long enough to read well on the grid
      // gets visibly truncated in the SERP. Optional: entries whose summary is already short
      // need nothing, and the 25 curated external entries have no detail page at all.
      metaDescription: z.string().max(160).optional(),
      pubDate: z.coerce.date(),
      author: z.string().default('The REFINERY'),
      // Only meaningful for a first-party post (no sourceUrl): its Article JSON-LD types
      // `author` from this, since "The REFINERY" and a staffer's byline aren't the same
      // schema.org type. Curated external entries never reach that builder, so this is a
      // no-op for them regardless of what's set. Defaults to 'organization' to match the
      // one first-party entry that exists today without needing a frontmatter change.
      authorType: z.enum(['organization', 'person']).default('organization'),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      category: newsCategories,
      teamRefs: z.array(z.string()).default([]),
      // External curated stories link straight to the original publisher
      // instead of getting an internal detail page.
      sourceUrl: z.string().url().optional(),
      sourceName: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const teams = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/teams' }),
  schema: ({ image }) =>
    z.object({
      number: z.string(),
      name: z.string(),
      program: z.enum(['FRC', 'FTC']),
      // The team's parent organization — a school for most teams, but also 4-H clubs,
      // nonprofits, libraries, and other community groups.
      organization: z.string(),
      community: z.string(),
      logo: image().optional(),
      description: z.string(),
      highlight: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
      socials: z
        .object({
          instagram: z.string().url().optional(),
          facebook: z.string().url().optional(),
          twitter: z.string().url().optional(),
          tiktok: z.string().url().optional(),
          youtube: z.string().url().optional(),
          flickr: z.string().url().optional(),
          github: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          tumblr: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .optional(),
      featured: z.boolean().default(false),
      newTeam: z.boolean().default(false),

      // Search-facing copy. `description` is sized for a card blurb and several entries run
      // past the ~160 characters a search result shows, so a long one gets visibly cut off.
      // Optional: an entry whose description is already short needs nothing. Mirrors the
      // same field on the news collection above.
      metaDescription: z.string().max(160).optional(),

      // A single optional GROUP rather than three loose optional keys, so zod can make
      // `alt` and `credit` mandatory GIVEN an image — which a flat optional set cannot
      // express. The news collection's heroImage/heroImageAlt pair has exactly that hole,
      // and a masthead this large silently shipping alt="" is worse than a card thumbnail
      // doing it. Same shape argument as `venueAddress` on the events collection below.
      //
      // `credit` is required, not optional: The REFINERY's permission to use FIRST Indiana's
      // photography is conditional on attribution near the image (see
      // docs/placeholder-images.md), and a team- or REFINERY-shot photo should say so too.
      // Download into src/assets/teams/ — never hotlink Flickr.
      banner: z
        .object({
          image: image(),
          alt: z.string(),
          credit: z.object({ text: z.string(), url: z.string().url().optional() }),
        })
        .optional(),

      // FIRST's own term, and the field The Blue Alliance / FTC Events / FTCScout publish —
      // which is where these values come from. Deliberately not "foundingYear": a 4-H club
      // or a school may predate its robotics team by decades, so rookie year is the only
      // claim the sources actually support. The upper bound floats with the clock so next
      // season's rookies validate without a code change.
      rookieYear: z
        .number()
        .int()
        .gte(1992)
        .lte(new Date().getFullYear() + 1)
        .optional(),

      // An award is a public factual claim about someone else's team, so `source` is
      // REQUIRED — the same standard as the sourcing comments already in every team body,
      // and the same instinct as src/utils/schema.ts's "absent beats wrong".
      //
      // `typeKey` and `eventLevel` come from src/utils/awards.ts, which is the source of
      // truth for both vocabularies — add an award type there, not here. That file also
      // explains why classification never reads `name`: FIRST renamed the Chairman's Award
      // to the FIRST Impact Award for 2023, and both wordings appear in real records.
      //
      // `banner` is an explicit override of src/utils/banners.ts, not the normal path. It
      // requires `bannerNote` saying where the correction came from, so an unsourced banner
      // claim can never reach a page.
      awards: z
        .array(
          z.object({
            name: z.string(),
            typeKey: z.enum(AWARD_TYPE_KEYS),
            year: z.number().int().gte(1992),
            event: z.string(),
            eventLevel: z.enum(EVENT_LEVELS),
            // For a judged award this is a rank (1st/2nd/3rd). For Winner/Finalist it is the
            // team's SEAT on the alliance and has no display meaning. Recording which one it
            // means is what stops "3rd place Winner" ever reaching a page.
            placement: z.number().int().positive().optional(),
            placementMeaning: z.enum(['rank', 'alliance-seat']).optional(),
            source: z.string().url(),
            banner: z.boolean().optional(),
            bannerNote: z.string().optional(),
          })
          .superRefine((award, ctx) => {
            if (award.banner !== undefined && !award.bannerNote) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['bannerNote'],
                message:
                  'Overriding banner eligibility requires bannerNote explaining the source of the correction.',
              });
            }
            if (award.placement !== undefined && !award.placementMeaning) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['placementMeaning'],
                message:
                  "placement is ambiguous on its own: set placementMeaning to 'rank' for a judged award or 'alliance-seat' for Winner/Finalist.",
              });
            }
          }),
        )
        .default([]),

      // Entry ids via reference(), NOT team numbers. Astro resolves these at build, so a
      // typo fails the build instead of rendering a dead link — and a number would reopen
      // the cross-program ambiguity the URL slug closed. (news.teamRefs stays on numbers for
      // a different reason: a story may name a team with no entry at all, which is harmless
      // there and unacceptable here.)
      //
      // Authoring one side is enough — relatedTeamsFor() in src/utils/teams.ts unions a
      // team's list with everyone who lists it, so a half-declared pairing is impossible.
      relatedTeams: z.array(reference('teams')).default([]),

      // One entry per season the team has a robot worth naming. `year` rather than a
      // free-text season so the list sorts; `game` carries the season name verbatim when
      // published. Note FIRST game names are marks in their own right but are NOT in
      // FIRST_TOKENS, so they render exactly as authored rather than picking up a ®.
      robots: z
        .array(
          z.object({
            name: z.string(),
            year: z.number().int().gte(1992),
            game: z.string().optional(),
            description: z.string().max(280).optional(),
            image: image().optional(),
            imageAlt: z.string().optional(),
          }),
        )
        .default([]),

      // One entry per season with event participation on record — separate from `awards`
      // and `robots` because it's a different claim: not "the team won X" or "the team named
      // its robot Y" but "the team showed up and played." `events` is every event attended
      // that year, award-winning or not, so a season with only a district win in the awards
      // array can still show the two events that produced no award. `record` is this site's
      // own sum of that season's QUALIFICATION match results across every event in `events`
      // — deliberately not a per-event figure, since TBA/FTCScout already show those, and not
      // scoped to say so in the type: playoff results are wins/losses on their own alliance,
      // which is what `awards`' WINNER/FINALIST entries already represent, so folding them in
      // here would double-count the same result two different ways.
      seasons: z
        .array(
          z.object({
            year: z.number().int().gte(1992),
            events: z
              .array(
                z.object({
                  name: z.string(),
                  eventLevel: z.enum(EVENT_LEVELS),
                  source: z.string().url(),
                }),
              )
              .default([]),
            record: z
              .object({
                wins: z.number().int().nonnegative(),
                losses: z.number().int().nonnegative(),
                ties: z.number().int().nonnegative(),
              })
              .optional(),
          }),
        )
        .default([]),

      draft: z.boolean().default(false),
    }),
});

const audienceEnum = z.enum(['students', 'mentors', 'teams', 'volunteers', 'public']);

const programs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/programs' }),
  schema: () =>
    z.object({
      title: z.string(),
      summary: z.string(),
      audience: z.array(audienceEnum).default([]),
      draft: z.boolean().default(false),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: () =>
    z.object({
      title: z.string(),
      summary: z.string(),
      dateStart: z.coerce.date(),
      dateEnd: z.coerce.date().optional(),
      // Display name of the venue, shown on the card and the detail page.
      location: z.string(),
      // Structured street address for the venue. Optional, but Google requires a full
      // address under Event.location before it will consider an event for rich results, so
      // an event without this gets no Event schema at all — see src/utils/schema.ts.
      // `location` above supplies the venue name, so it is deliberately not repeated here.
      venueAddress: z
        .object({
          streetAddress: z.string(),
          addressLocality: z.string(),
          addressRegion: z.string(),
          postalCode: z.string(),
        })
        .optional(),
      audience: z.array(audienceEnum).default([]),
      featured: z.boolean().default(false),
      registrationUrl: z.string().url().optional(),
      // Set true for a free event. Left undefined when admission terms aren't known — the
      // detail page then says nothing about cost and the Event schema omits `offers`, rather
      // than either of them guessing. See src/utils/schema.ts.
      isFree: z.boolean().optional(),
      draft: z.boolean().default(false),
    }),
});

const partners = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/partners' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      url: z.string().url().optional(),
      description: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image().optional(),
      bio: z.string().optional(),
      quote: z.string().optional(),
      // A bare URL for one person, or one {name, url} per person when a single entry
      // covers more than one (a founding couple sharing a card). PeopleBios normalizes
      // both to an array, so existing single-URL entries need no change.
      linkedin: z
        .union([
          z.string().url(),
          z.array(z.object({ name: z.string(), url: z.string().url() })).nonempty(),
        ])
        .optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
      // Marks an entry as a founder of The REFINERY, which the homepage's Organization schema
      // reads to fill its `founder` property. Deliberately explicit rather than inferred from
      // `role` or `order`: role is display copy that can be reworded, and order is display
      // position, so neither is a safe stand-in for "this person founded the organization".
      founder: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { news, teams, programs, events, partners, people };
