// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [
    sanity({
      projectId: 'cxmg0qil',
      dataset: 'production',
      useCdn: false,
    }),
  ],
});
