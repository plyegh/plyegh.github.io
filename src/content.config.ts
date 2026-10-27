import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One post = one folder: src/content/posts/<category>/<slug>/index.md
// Images go in the same folder and are referenced as ./image.png
const posts = defineCollection({
  loader: glob({ pattern: '*/*/index.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
    series: z.string().optional(), // posts sharing this name are linked in reading order
    pinned: z.boolean().default(false), // shown first in lists
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
