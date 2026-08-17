import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { NEWS_CATEGORY_SLUGS } from './utils/news-categories';

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
          tumblr: z.string().url().optional(),
          website: z.string().url().optional(),
        })
        .optional(),
      featured: z.boolean().default(false),
      newTeam: z.boolean().default(false),
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
