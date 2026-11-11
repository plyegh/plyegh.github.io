// Markdown extensions for posts (Astro 7 / Sätteri hast plugins).
import { defineHastPlugin } from 'satteri';

const CALLOUT = /^\s*\[!(NOTE|TIP|WARNING|DANGER)\]\s*/i;

/**
 * GitHub-style callouts:
 *   > [!TIP]
 *   > text…
 * Renders <blockquote class="callout callout-tip"> with a small label.
 */
export const callouts = defineHastPlugin({
  name: 'plyegh-callouts',
  text(node, ctx) {
    const m = node.value.match(CALLOUT);
    if (!m) return;
    const p = ctx.parent(node);
    const quote = p && ctx.parent(p);
    if (!p || p.tagName !== 'p' || !quote || quote.tagName !== 'blockquote' || ctx.indexOf(p) !== firstElementIndex(quote)) return;
    if (ctx.indexOf(node) !== 0) return;
    const kind = m[1].toLowerCase();
    ctx.setProperty(quote, 'className', ['callout', `callout-${kind}`]);
    ctx.replaceNode(node, [
      { type: 'element', tagName: 'span', properties: { className: ['callout-label'] }, children: [{ type: 'text', value: kind }] },
      { type: 'text', value: node.value.slice(m[0].length) },
    ]);
  },
});

function firstElementIndex(parent) {
  return parent.children.findIndex((c) => c.type === 'element');
}

/**
 * Image captions (same convention as the old Chirpy posts):
 *   ![alt](./fig1.png)
 *   _Figure 1. caption_
 * A paragraph holding only an image followed by an emphasis becomes <figure><img><figcaption>.
 */
export const figureCaptions = defineHastPlugin({
  name: 'plyegh-figure-captions',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 2) return;
      const [img, em] = kids;
      if (img.type !== 'element' || img.tagName !== 'img' || em.type !== 'element' || em.tagName !== 'em') return;
      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [img, { type: 'element', tagName: 'figcaption', properties: {}, children: em.children }],
      });
    },
  },
});

/**
 * YouTube embeds: a YouTube link alone on its own line becomes an embedded player.
 *   <https://www.youtube.com/watch?v=YzhgxadNNls>
 * Uses youtube-nocookie.com (allowed in the CSP frame-src). Anything else stays a normal link.
 */
const YT = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([\w-]{11})/;
export const youtubeEmbeds = defineHastPlugin({
  name: 'plyegh-youtube',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 1) return;
      const a = kids[0];
      if (a.type !== 'element' || a.tagName !== 'a') return;
      const href = String(a.properties?.href ?? '');
      const m = href.match(YT);
      const text = a.children.map((c) => c.value ?? '').join('');
      if (!m || text.trim() !== href) return;
      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['video-embed'] },
        children: [{
          type: 'element',
          tagName: 'iframe',
          properties: {
            src: `https://www.youtube-nocookie.com/embed/${m[1]}`,
            title: 'YouTube video',
            loading: 'lazy',
            allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
            referrerPolicy: 'strict-origin-when-cross-origin',
          },
          children: [],
        }],
      });
    },
  },
});
