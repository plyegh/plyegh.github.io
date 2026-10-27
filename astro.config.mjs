import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts, figureCaptions } from './src/lib/markdown-plugins.mjs';

// Old Chirpy post URLs → new category paths, so links shared before the renewal keep working.
const redirects = {
  '/posts/kolla-ansible-통한-openstack-단일노드-구축': '/posts/blog-docs/kolla-ansible-openstack-single-node/',
  '/posts/defcamp-2026': '/posts/ctf-wargame/defcamp-2026-asicrimination/',
};

export default defineConfig({
  site: 'https://plyegh.github.io',
  trailingSlash: 'ignore',
  redirects,
  integrations: [
    sitemap({
      // keep redirect stubs and the standalone game out of the sitemap
      filter: (page) => !page.includes('/yu/') && !Object.keys(redirects).some((r) => decodeURI(page).endsWith(`${r}/`)),
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
        "frame-src https://giscus.app",
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
    processor: satteri({ hastPlugins: [callouts, figureCaptions] }),
    shikiConfig: {
      theme: 'tokyo-night',
      langAlias: { plain: 'text' },
    },
  },
});
