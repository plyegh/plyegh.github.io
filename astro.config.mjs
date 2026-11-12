import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts, figureCaptions, youtubeEmbeds } from './src/lib/markdown-plugins.mjs';

// Two sites: /public (recruiter-facing) and /personal (everything). URLs from before the split
// redirect so shared links keep working: posts go to their /public page, or to /personal when
// the category is personal-only; pages that only exist on the personal site go there.
const P = '/personal';
const PUB = '/public';
const PERSONAL_ONLY = ['playground']; // keep in sync with `personalOnly` in src/data/site.ts
const postDirs = fs.readdirSync('src/content/posts', { withFileTypes: true }).filter((d) => d.isDirectory())
  .flatMap((cat) => fs.readdirSync(`src/content/posts/${cat.name}`, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => [cat.name, d.name]));
const siteOf = (category) => (PERSONAL_ONLY.includes(category) ? P : PUB);
const kolla = `${PUB}/posts/dev/kolla-ansible-openstack-single-node/`;
const redirects = {
  '/': `${PUB}/`,
  '/posts': `${PUB}/`,
  [`${PUB}/posts`]: `${PUB}/`,
  ...Object.fromEntries([...new Set(postDirs.map(([c]) => c))].map((c) => [`/posts/${c}`, `${siteOf(c)}/posts/${c}/`])),
  ...Object.fromEntries(postDirs.map(([c, s]) => [`/posts/${c}/${s}`, `${siteOf(c)}/posts/${c}/${s}/`])),
  '/about': `${PUB}/about/`,
  '/timeline': `${PUB}/activity/`,
  '/search': `${PUB}/search/`,
  '/license': `${PUB}/license/`,
  '/tags': `${P}/tags/`,
  '/tags/[tag]': `${P}/tags/[tag]`,
  // pre-renewal (Chirpy) URLs
  '/posts/kolla-ansible-통한-openstack-단일노드-구축': kolla,
  '/posts/blog-docs/kolla-ansible-openstack-single-node': kolla,
  '/posts/defcamp-2026': `${PUB}/posts/ctf-wargame/defcamp-2026-asicrimination/`,
};

export default defineConfig({
  site: 'https://plyegh.github.io',
  trailingSlash: 'ignore',
  redirects,
  integrations: [
    sitemap({
      // only real pages: redirect stubs and the standalone game stay out of the sitemap
      filter: (page) => !page.includes('/yu/') && [P, PUB].some((base) => new URL(page).pathname.startsWith(`${base}/`)) && !new URL(page).pathname.endsWith(`${PUB}/posts/`),
    }),
  ],
  // Content-Security-Policy as a <meta> tag on every page. Astro hashes its own inline
  // scripts/styles; the lists below add what the site loads from elsewhere.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        // Pretendard (the /public site's font) is served from jsDelivr
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "connect-src 'self'",
        "frame-src https://giscus.app https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      styleDirective: {
        resources: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
          'https://giscus.app',
          // Shiki colours code tokens with style="" attributes
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
      scriptDirective: {
        // giscus client, and WebAssembly for the Pagefind search index
        resources: ["'self'", 'https://giscus.app', "'wasm-unsafe-eval'"],
      },
    },
  },
  markdown: {
    processor: satteri({ hastPlugins: [callouts, figureCaptions, youtubeEmbeds] }),
    shikiConfig: {
      theme: 'tokyo-night',
      langAlias: { plain: 'text' },
    },
  },
});
