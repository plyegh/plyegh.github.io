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
  markdown: {
    processor: satteri({ hastPlugins: [callouts, figureCaptions] }),
    shikiConfig: {
      theme: 'tokyo-night',
      langAlias: { plain: 'text' },
    },
  },
});
