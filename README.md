# jamesjosephburch-site

James Burch's personal site: [jamesjburch.com](https://jamesjburch.com) (also [jamesjosephb.github.io](https://jamesjosephb.github.io), which redirects there).
Static site built with [Astro](https://astro.build) and TypeScript, deployed to GitHub Pages by GitHub Actions.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321 (draft posts are visible here)
npm run build    # type-check + build to dist/ (drafts excluded)
npm run preview  # serve dist/
```

## Layout

| Path | What it is |
| --- | --- |
| `src/pages/index.astro` | Home |
| `src/pages/work/index.astro` | Work index: professional work (featured entry first), then personal projects |
| `src/pages/work/[slug].astro`, `src/content/work/*.mdx` | Work pages: `/work/agent-toolkit/` (case study), `/work/trailhead/` and `/work/finance-sync/` (personal projects) |
| `src/lib/work.ts` | Reads the `work` collection in display order (drafts only in dev); feeds `/work/`, the home rows and each page's "Next" link |
| `src/data/trailhead.ts`, `src/assets/work/trailhead/` | Trailhead captions, features and technologies; its screenshots (WebP sources, resized by Astro at build) |
| `src/data/finance-sync.ts`, `src/assets/work/finance-sync/` | finance-sync captions; its screenshots, light and dark (lossless WebP, all from made-up demo data) |
| `src/pages/about.astro` | About, experience, skills, education |
| `src/pages/resume.astro` | Résumé page + PDF download |
| `src/pages/writing/` | Writing index and post pages |
| `src/content/writing/*.md` | Posts (content collection, schema in `src/content.config.ts`) |
| `src/site.ts` | Name, headline, links, nav |
| `src/styles/global.css` | Design tokens (light/dark) and shared styles |
| `public/James-Burch-Resume.pdf` | Web copy of the résumé (no phone number) |
| `resume-src/resume-web.html` | Source for that PDF |

## Writing a post

Add `src/content/writing/<slug>.md`:

```md
---
title: 'Post title'
description: 'One-sentence summary.'
pubDate: 2026-12-01
draft: true
tags: ['ai-agents']
---
```

`draft: true` posts show only in `npm run dev`. Set `draft: false` to publish.

## Adding a work entry

Add `src/content/work/<slug>.mdx` (schema in `src/content.config.ts`). Set `kind` (`professional` or `personal`), `order`, and `cardSummary` for the row on `/work/` and the home page. Keep `draft: true` until the wording is approved: drafts render only in `npm run dev`, never in the build, the sitemap or any link. This repo is public, though, so a draft's text is visible on GitHub once pushed; keep unapproved employer copy out of the repo entirely.

Screenshots go in `src/assets/work/<slug>/` as WebP (about 1920 px wide) and are shown with `<Shot>` or `<Gallery>`, which serve AVIF/WebP at several widths, lazy-load, and enlarge in a dialog. For UI screenshots with small text, use `aspect="auto"` (no cropping) and a higher `quality`, and pass a `dark` variant if there is one: each theme then shows its own (`coverDark` and `coverQuality` do the same for the cover). Set `home: false` to list an entry on `/work/` only, not on the home page.

## Updating the résumé PDF

Edit `resume-src/resume-web.html`, then print it with headless Chrome (PowerShell):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer --print-to-pdf="$PWD\public\James-Burch-Resume.pdf" "file:///$($PWD -replace '\\','/')/resume-src/resume-web.html"
```

Keep it to one page and never add the phone number.

## Custom domain: jamesjburch.com

Registered at Cloudflare (DNS on Cloudflare). `public/CNAME` and `SITE_URL` in `astro.config.mjs` are set to it.

**Cloudflare DNS** (dashboard → jamesjburch.com → DNS → Records). Set every record to **DNS only** (grey cloud), not Proxied, so GitHub can issue the HTTPS certificate:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `jamesjosephb.github.io` |

Then:

1. Repo Settings → Pages → Custom domain `jamesjburch.com` (the CNAME file sets this on deploy), wait for the DNS check, then tick **Enforce HTTPS**.
2. Recommended: verify the domain under GitHub account Settings → Pages → Add a domain (adds a `_github-pages-challenge-jamesjosephb` TXT record) to prevent takeover.

**jamesjburch.dev** (when registered): add it to Cloudflare and create a Redirect Rule (Rules → Redirect Rules) matching all incoming requests, type **Dynamic**, expression `concat("https://jamesjburch.com", http.request.uri.path)`, status 301, preserve query string. The redirect needs a proxied record to run on, e.g. an `A` record `@` → `192.0.2.1` and a `CNAME` `www` → `jamesjburch.dev`, both **Proxied** (orange cloud). `.dev` requires HTTPS; Cloudflare's certificate covers it.

## Social card

`public/og/home.png` (1200×630) is rendered from `og-src/home.html` with headless Chrome (PowerShell; it loads Hanken Grotesk and DM Mono from Google Fonts, so it needs network). The map behind it is the site's own topo tile from `public/topo/`, used as CSS masks, which is why the command allows file access; re-render the card after regenerating the tile:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=5000 --screenshot="$PWD\public\og\home.png" "file:///$($PWD -replace '\\','/')/og-src/home.html"
```

Then shrink it (about 550 KB down to about 210 KB, visually the same): `node -e "require('sharp')('public/og/home.png').png({compressionLevel:9,effort:10,palette:true,quality:92,dither:0.6}).toBuffer().then(b=>require('fs').writeFileSync('public/og/home.png',b))"`

The icons come from `public/favicon.svg` the same way: `og-src/icon-180.html` → `public/apple-touch-icon.png` (`--window-size=180,180`), `og-src/icon-512.html` → `public/icon-512.png` (add `--default-background-color=00000000`). `public/favicon.ico` wraps a 32 px render of `og-src/icon-32.html`.

## Design: "Contour"

Palette from James's 2022 banner photo (tokens in `src/styles/tokens.css`), Hanken Grotesk + DM Mono (Astro Fonts API).

Dark is the default theme, whatever the visitor's system setting: the inline script in `Base.astro` sets `data-theme` before first paint from the visitor's saved choice (the toggle stores it), otherwise `dark`. The CSS treats anything not explicitly light as dark, so a visitor without JS also gets dark, and the dark tokens apply to screens only, so printing stays light.

The topographic map behind the pages is one seamlessly tileable 1600×1600 tile in `public/topo/` (minor contours, index contours with elevation labels and spot heights, streams, hillshade), drawn by `src/components/contour/Topo.astro` as CSS masks painted with theme tokens, so it repeats for any page length. It is generated offline and deterministically from a procedural heightfield (periodic eroded fBm with a dominant summit at 1120, 470 for the portrait):

```powershell
node scripts/topo-gen.mjs public/topo
```

Don't generate it at runtime. Text over the full-strength parts of the map sits in `.on-map` blocks, which give it a page-coloured halo (as map labels have); elsewhere the map is faded to 35–40% so body text keeps AA contrast.
