// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';

// The site's public URL: canonical links, sitemap, RSS and robots.txt all derive from it.
// Custom domain (served by GitHub Pages; public/CNAME must match).
// To fall back to the github.io address, set https://jamesjosephb.github.io and delete public/CNAME.
const SITE_URL = 'https://jamesjburch.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  redirects: {
    '/ai-work': '/work/agent-toolkit/',
  },
  // Self-hosted at build time (downloaded from Fontsource, served from this site).
  fonts: [
    {
      // One variable file for headings and text; tokens.css maps --font-display and --font-text to it.
      provider: fontProviders.fontsource(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-sans',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'DM Mono',
      cssVariable: '--font-mono',
      weights: ['400', '500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  // expressiveCode must come before mdx.
  integrations: [expressiveCode(), mdx(), sitemap()],
});
