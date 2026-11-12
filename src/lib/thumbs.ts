// Card thumbnails for the /public site.
import fs from 'node:fs';
import type { ImageMetadata } from 'astro';
import type { Post } from './posts';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/content/posts/*/*/*.{png,jpg,jpeg,webp,gif,avif}', { eager: true });
const local = (post: Post, file: string) => images[`/src/content/posts/${post.category}/${post.slug}/${file.replace(/^\.\//, '')}`]?.default;

/** An optimisable image from the post folder, a plain site URL, or nothing (→ text card). */
export function thumbOf(post: Post): { image?: ImageMetadata; src?: string } {
  const cover = post.data.cover;
  if (cover) return cover.startsWith('/') ? { src: cover } : { image: local(post, cover) };
  const first = (post.body ?? '').match(/!\[[^\]]*\]\(\.\/([^)\s]+)/)?.[1];
  if (first && local(post, first)) return { image: local(post, first) };
  const pdf = post.data.docs.find((d) => d.file.toLowerCase().endsWith('.pdf'));
  if (pdf) {
    const page = `/docs/${post.category}/${post.slug}/${pdf.file.replace(/\.pdf$/i, '')}/p-1.jpg`;
    if (fs.existsSync(`public${page}`)) return { src: page.split('/').map(encodeURIComponent).join('/') };
  }
  return {};
}
