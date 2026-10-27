import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORY_SLUGS, type CategorySlug } from '../data/site';

export type Post = CollectionEntry<'posts'> & { category: CategorySlug; slug: string; url: string };

/** All posts, newest first. Drafts show up in `npm run dev` only. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries
    .map((entry) => {
      const [category, slug] = entry.id.split('/');
      if (!CATEGORY_SLUGS.includes(category as CategorySlug)) {
        throw new Error(
          `Unknown category folder "${category}" (post: ${entry.id}). Use one of: ${CATEGORY_SLUGS.join(', ')}`,
        );
      }
      return { ...entry, category: category as CategorySlug, slug, url: `/posts/${category}/${slug}/` };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function countByCategory(posts: Post[]) {
  const counts = Object.fromEntries(CATEGORY_SLUGS.map((c) => [c, 0])) as Record<CategorySlug, number>;
  for (const p of posts) counts[p.category]++;
  return counts;
}

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
/** 2026.06.20 (KST) */
export const formatDate = (d: Date) => fmt.format(d).replaceAll('-', '.');
