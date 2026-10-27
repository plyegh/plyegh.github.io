import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, categoryName } from '../data/site';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description,
      link: p.url,
      categories: [categoryName(p.category), ...p.data.tags],
    })),
  });
}
