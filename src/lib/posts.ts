import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORY_SLUGS, PERSONAL, PUBLIC, isPublicCategory, type CategorySlug } from '../data/site';

/** `url` is the post's page: under /public, or under /personal for personal-only categories. */
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
      return {
        ...entry, category: category as CategorySlug, slug,
        url: `${isPublicCategory(category) ? PUBLIC : PERSONAL}/posts/${category}/${slug}/`,
      };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Posts of the /public site: everything except personal-only categories. */
export const getPublicPosts = async () => (await getPosts()).filter((p) => isPublicCategory(p.category));
/** Posts of the /personal site: personal-only categories (playground). */
export const getPersonalPosts = async () => (await getPosts()).filter((p) => !isPublicCategory(p.category));

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
/** Tag pages exist on the /personal site only. */
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
  posts
    .filter((p) => p.data.series === name)
    .sort((a, b) => (a.data.seriesOrder ?? Infinity) - (b.data.seriesOrder ?? Infinity) || a.data.date.getTime() - b.data.date.getTime());
/** Number the series list starts at: the first post's `seriesOrder` (0 for a "part 0"), else 1. */
export const seriesStart = (series: Post[]) => series[0]?.data.seriesOrder ?? 1;

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
/** 2026.06.20 (KST) */
export const formatDate = (d: Date) => fmt.format(d).replaceAll('-', '.');
const fmtKo = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' });
/** 2026년 6월 20일 (KST) */
export const formatDateKo = (d: Date) => fmtKo.format(d);
/** Rough reading time in minutes. */
export const readingMinutes = (post: Post) => Math.max(1, Math.round((post.body ?? '').length / 900));

/** /public lists show this many cards per page (the home's first page adds the large card on top). */
export const PAGE_SIZE = 9;
/** Split a list into pages; the first page may hold more (`firstSize`). Always at least one page. */
export function pagesOf<T>(items: T[], firstSize = PAGE_SIZE, size = PAGE_SIZE): T[][] {
  const pages = [items.slice(0, firstSize)];
  for (let i = firstSize; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}
