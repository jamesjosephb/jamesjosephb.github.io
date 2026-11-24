import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

/** Case studies at /work/<id>/. */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Eyebrow above the title, e.g. "Case study · 2026". */
      eyebrow: z.string().default('Case study'),
      /** One-sentence outcome under the title; also the meta description. */
      summary: z.string(),
      role: z.string(),
      /** When it ran, e.g. "Sep 2026 – present". Optional: personal projects leave it out. */
      period: z.string().optional(),
      stack: z.array(z.string()).default([]),
      setting: z.string().optional(),
      /** Which group it sits in on /work/. */
      kind: z.enum(['professional', 'personal']).default('professional'),
      /** One or two sentences for cards and rows: what it is, then James's part. Falls back to `summary`. */
      cardSummary: z.string().optional(),
      /** Short status line, e.g. "Playable prototype, not released". */
      status: z.string().optional(),
      /** The one large card on /work/ and the home page. */
      featured: z.boolean().default(false),
      /** "At a glance" lines under the header: [{ k: 'Problem', v: '…' }]. */
      glance: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
      /** Lead image, shown under the header and as the row thumbnail. */
      cover: image().optional(),
      /** Dark-theme variant of the cover (a UI screenshot in both themes). */
      coverDark: image().optional(),
      coverAlt: z.string().optional(),
      coverCaption: z.string().optional(),
      /** Cover encoding quality; raise it for UI screenshots with small text. */
      coverQuality: z.number().optional(),
      /** List it in "More work" on the home page as well as on /work/. */
      home: z.boolean().default(true),
      /** Show the "On this page" contents. Short pages turn it off. */
      toc: z.boolean().default(true),
      /** 1200×630 social card (path under public/). */
      ogImage: z.string().optional(),
      ogImageAlt: z.string().optional(),
      /** Shared view-transition name with the card that links here. */
      transitionName: z.string().optional(),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
});

export const collections = { writing, work };
