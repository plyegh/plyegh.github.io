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
    // place in the series list when date order is not the reading order: 0 puts a "part 0" first
    // and makes the list count from 0. Posts without it follow in date order.
    seriesOrder: z.number().int().min(0).optional(),
    pinned: z.boolean().default(false), // shown first in lists
    best: z.boolean().default(false), // /public home: adds a slide to the banner at the top
    draft: z.boolean().default(false),
    // card thumbnail on /public: a file in the post folder (./cover.jpg) or a site path (/assets/…).
    // Default: the first ./image in the post, else page 1 of the first PDF in `docs`.
    cover: z.string().optional(),
    // path of this post's private note in the private notes repository (folder or .md file).
    // /public shows a locked box linking to it; only the owner's token can open the note.
    privateNote: z.string().regex(/^[^\s#?]+$/).optional(),
    // files in the post folder: PDFs get a page viewer, everything (hwp, docx …) a download button
    // cap inline image width for this post, in px (e.g. 480 for small proof photos)
    imageWidth: z.number().optional(),
    docs: z.array(z.object({ file: z.string(), title: z.string().optional() })).default([]),
  }),
});

export const collections = { posts };
