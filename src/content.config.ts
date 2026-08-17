import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { NEWS_CATEGORY_SLUGS } from './utils/news-categories';

// NOTE: Starlight generates routes purely from this collection's file paths.
// Every doc must live under src/content/docs/resources/** so that all
// Starlight-rendered routes stay scoped to /resources/* — never add a file
// directly under src/content/docs/ (outside resources/) or it will leak a
// route elsewhere on the site.

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
      pubDate: z.coerce.date(),
      author: z.string().default('The REFINERY'),
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
      location: z.string(),
      audience: z.array(audienceEnum).default([]),
      featured: z.boolean().default(false),
      registrationUrl: z.string().url().optional(),
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
      linkedin: z.string().url().optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const apps = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/apps' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string(),
      icon: image().optional(),
      externalUrl: z.string().url(),
      status: z.enum(['live', 'beta', 'coming-soon']).default('live'),
      order: z.number().default(0),
    }),
});

const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

export const collections = { news, teams, programs, events, partners, people, apps, docs };
