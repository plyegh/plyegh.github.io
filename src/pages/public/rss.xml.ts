import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { PUBLIC, PUBLIC_PROFILE, categoryKo } from '../../data/site';
import { getPublicPosts } from '../../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublicPosts();
  return rss({
    title: PUBLIC_PROFILE.title,
    description: PUBLIC_PROFILE.tagline,
    site: new URL(`${PUBLIC}/`, context.site!),
    customData: `<language>ko</language><copyright>© ${new Date().getFullYear()} Dongjun Park (plyegh). All rights reserved.</copyright>`,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description,
      link: new URL(p.publicUrl!, context.site!).href,
      categories: [categoryKo(p.category), ...p.data.tags],
    })),
  });
}
