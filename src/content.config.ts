import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// NOTE: Starlight generates routes purely from this collection's file paths.
// Every doc must live under src/content/docs/resources/** so that all
// Starlight-rendered routes stay scoped to /resources/* — never add a file
// directly under src/content/docs/ (outside resources/) or it will leak a
// route elsewhere on the site.

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
      category: z.enum(['refinery', 'teams', 'regional', 'partnerships', 'first-community']),
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
      school: z.string(),
      community: z.string(),
      logo: image().optional(),
      description: z.string(),
      highlight: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
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
      linkedin: z.string().url().optional(),
      order: z.number().default(0),
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
