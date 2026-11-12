import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORY_SLUGS, PERSONAL, PUBLIC, isPublicCategory, type CategorySlug } from '../data/site';

/** `url` is the /personal page; `publicUrl` the /public one (absent for personal-only posts). */
export type Post = CollectionEntry<'posts'> & { category: CategorySlug; slug: string; url: string; publicUrl?: string };

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
      return {
        ...entry, category: category as CategorySlug, slug,
        url: `${PERSONAL}/posts/${category}/${slug}/`,
        publicUrl: isPublicCategory(category) ? `${PUBLIC}/posts/${category}/${slug}/` : undefined,
      };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Posts shown on /public: everything except personal-only categories. */
export const getPublicPosts = async () => (await getPosts()).filter((p) => p.publicUrl);

/** Same order, but `pinned: true` posts first — used by the lists people browse. */
export const pinnedFirst = (posts: Post[]) => [...posts.filter((p) => p.data.pinned), ...posts.filter((p) => !p.data.pinned)];

export function countByCategory(posts: Post[]) {
  const counts = Object.fromEntries(CATEGORY_SLUGS.map((c) => [c, 0])) as Record<CategorySlug, number>;
  for (const p of posts) counts[p.category]++;
  return counts;
}

/** "DefCamp 2026" → "defcamp-2026", "단일 노드" → "단일-노드" */
export const tagSlug = (tag: string) =>
  tag.trim().toLowerCase().replace(/[\s/?#%&]+/g, '-').replace(/^-+|-+$/g, '');
export const tagUrl = (tag: string) => `${PERSONAL}/tags/${tagSlug(tag)}/`;

/** Tags across all posts: one entry per slug (first spelling wins), most used first. */
export function getTags(posts: Post[]) {
  const map = new Map<string, { name: string; slug: string; posts: Post[] }>();
  for (const p of posts) {
    for (const name of p.data.tags) {
      const slug = tagSlug(name);
      if (!slug) continue;
      const t = map.get(slug) ?? { name, slug, posts: [] };
      if (!t.posts.includes(p)) t.posts.push(p);
      map.set(slug, t);
    }
  }
  return [...map.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}

/** Posts of a series, oldest first (reading order). */
export const seriesOf = (posts: Post[], name: string) =>
  posts.filter((p) => p.data.series === name).sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
/** 2026.06.20 (KST) */
export const formatDate = (d: Date) => fmt.format(d).replaceAll('-', '.');
const fmtKo = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' });
/** 2026년 6월 20일 (KST) */
export const formatDateKo = (d: Date) => fmtKo.format(d);
/** Rough reading time in minutes. */
export const readingMinutes = (post: Post) => Math.max(1, Math.round((post.body ?? '').length / 900));
