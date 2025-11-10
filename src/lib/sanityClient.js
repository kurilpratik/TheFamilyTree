// src/lib/sanityClient.js
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'cxmg0qil', // from astro.config.mjs
  dataset: 'production',
  apiVersion: '2025-11-10', // YYYY-MM-DD; keep it current
  useCdn: true, // false if you need the freshest data
});
