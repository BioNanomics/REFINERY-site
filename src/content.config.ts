import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// NOTE: Starlight generates routes purely from this collection's file paths.
// Every doc must live under src/content/docs/resources/** so that all
// Starlight-rendered routes stay scoped to /resources/* — never add a file
// directly under src/content/docs/ (outside resources/) or it will leak a
// route elsewhere on the site.

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(280),
      pubDate: z.coerce.date(),
      author: z.string().default('The REFINERY'),
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),
      tags: z
        .array(z.enum(['event', 'announcement', 'deep-dive', 'github-repo', 'update']))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(280),
      pubDate: z.coerce.date(),
      image: image(),
      imageAlt: z.string(),
      tags: z.array(z.string()).default([]),
      status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
      featured: z.boolean().default(false),
      links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
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

export const collections = { blog, projects, apps, docs };
