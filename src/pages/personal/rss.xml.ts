import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, categoryName } from '../../data/site';
import { getPersonalPosts } from '../../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPersonalPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    customData: `<copyright>© ${new Date().getFullYear()} Dongjun Park (plyegh). All rights reserved.</copyright>`,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description,
      link: p.url,
      categories: [categoryName(p.category), ...p.data.tags],
    })),
  });
}
