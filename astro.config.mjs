import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts, figureCaptions, youtubeEmbeds } from './src/lib/markdown-plugins.mjs';

// The blog moved under /personal. Everything that used to live at the root redirects there,
// including the pre-renewal Chirpy post URLs, so links shared earlier keep working.
const P = '/personal';
const redirects = {
  '/': `${P}/`,
  '/about': `${P}/about/`,
  '/timeline': `${P}/timeline/`,
  '/search': `${P}/search/`,
  '/license': `${P}/license/`,
  '/tags': `${P}/tags/`,
  '/tags/[tag]': `${P}/tags/[tag]`,
  '/posts': `${P}/posts/`,
  '/posts/[category]': `${P}/posts/[category]`,
  '/posts/[category]/[slug]': `${P}/posts/[category]/[slug]`,
  '/posts/kolla-ansible-통한-openstack-단일노드-구축': `${P}/posts/dev/kolla-ansible-openstack-single-node/`,
  '/posts/blog-docs/kolla-ansible-openstack-single-node': `${P}/posts/dev/kolla-ansible-openstack-single-node/`,
  '/posts/defcamp-2026': `${P}/posts/ctf-wargame/defcamp-2026-asicrimination/`,
};

export default defineConfig({
  site: 'https://plyegh.github.io',
  trailingSlash: 'ignore',
  redirects,
  integrations: [
    sitemap({
      // only real pages: redirect stubs and the standalone game stay out of the sitemap
      filter: (page) => !page.includes('/yu/') && new URL(page).pathname.startsWith(`${P}/`),
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
        "font-src 'self' https://fonts.gstatic.com",
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
