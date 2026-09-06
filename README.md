# shifting coordinates

geography that refuses to sit still. an 11ty site: a table-of-contents
homepage, one page per chapter, prev/next navigation, and a one-click
"download the whole thing as a pdf" button.

the whole site — including this readme's sibling pages, chapter titles, and
body copy — is written in lowercase on purpose. it's a style choice, not a
bug: keep new chapters lowercase too, since the design (fonts, spacing,
the postcard/stamp motifs) was built assuming no capital letters anywhere.
acronyms like "upsc" and "pdf" are lowercased as well, for consistency.

a `npm run lint` command checks this automatically — see "keeping it
lowercase" below.

## repo name

`shifting-coordinates` — already used as the folder name and in
`package.json`. worth using the same name if you push this to github/gitlab
so the url matches the project everywhere (`github.com/you/shifting-coordinates`).

## before you deploy: set your real url

`src/_data/site.json` has a placeholder `"url": "https://example.com"`.
canonical links, open graph/twitter tags, `sitemap.xml`, and `robots.txt` all
build off this value — update it to your actual domain before deploying, or
search engines and social previews will point at `example.com`.

## seo & favicons

what's already wired up, so you don't have to think about it per chapter:

- **favicons** — `src/icons/favicon.svg` (vector, modern browsers),
  `favicon.ico` (16/32/48px, older browsers), `apple-touch-icon.png` (180px,
  ios home screen), `icon-192.png`/`icon-512.png` (android/pwa), and
  `site.webmanifest`. all generated from one source svg — see "updating the
  favicon" below if you want to change the mark.
- **per-page title & description** — every page gets `"<page title> —
  shifting coordinates"` automatically (the homepage just gets the site
  title, no double-up). each chapter's meta description is pulled straight
  from its `summary` front matter field — no separate seo field to fill in.
- **canonical urls, open graph, twitter cards** — all built from `site.url`
  + the page's own url, so no per-page work needed. chapters get
  `og:type: article`, the homepage gets `website`.
- **social share image** — `src/icons/og-image.png` (1200×630), shown when
  a link to the site is shared on twitter/slack/imessage/etc. one shared
  image for the whole site for now; if you want a distinct image per
  chapter later, that'd mean generating one per chapter and overriding
  `pageImage` in `base.njk` from a front-matter field.
- **sitemap.xml / robots.txt** — generated automatically from the chapters
  collection (`src/sitemap.njk`, `src/robots.njk`). the hidden `/print/`
  page is excluded from both and carries its own `noindex` tag, since it's
  pdf-export plumbing, not a real page.

### updating the favicon

edit `src/icons/favicon.svg`, then regenerate the raster sizes:

```bash
cd src/icons
for size in 16 32 48 180 192 512; do
  rsvg-convert -w $size -h $size favicon.svg -o "tmp-$size.png"
done
convert tmp-16.png tmp-32.png tmp-48.png favicon.ico
mv tmp-180.png apple-touch-icon.png
mv tmp-192.png icon-192.png
mv tmp-512.png icon-512.png
rm -f tmp-*.png
```

needs `librsvg2-bin` (for `rsvg-convert`) and `imagemagick` (for `convert`)
installed locally — on debian/ubuntu: `apt install librsvg2-bin imagemagick`.
on macos: `brew install librsvg imagemagick`.

## running it

```bash
npm install
npm run dev      # local dev server with live reload, http://localhost:8080
npm run build    # builds the static site into _site/
```

## starting fresh

`_site/` isn't cleared automatically between runs, so stale output (an old
`book.pdf`, a chapter you deleted, etc.) can hang around otherwise. two
scripts wipe `_site/` first and then do a normal run:

```bash
npm run restart:dev     # clean, then npm run dev
npm run restart:build   # clean, then npm run build:all (lint + build + pdf)
```

`npm run clean` on its own just deletes `_site/`, if you want that without
immediately rebuilding.

## generating the pdf

the homepage's "grab the whole book" stamp links to `/book.pdf`. that file
isn't checked in — it's generated at build time from a dedicated print
stylesheet (`src/print.njk` + `src/css/print.css`), rendered to pdf with
puppeteer (headless chrome), so the export looks like an actual typeset book
rather than a browser print-out.

```bash
npm run build:all   # eleventy build, then generates _site/book.pdf
# or, separately:
npm run build
npm run pdf
```

the first time you install, puppeteer downloads its own bundled chromium —
that needs a normal internet connection (this step can't run in a sandboxed
or offline environment). after that it's fully local, no external services
involved.

if you deploy the site (netlify, github pages, vercel, etc.), run
`npm run build:all` as your build command so `book.pdf` ends up in `_site/`
alongside everything else.

## adding a chapter

drop a new markdown file into `src/chapters/`, e.g.:

```markdown
---
title: "your chapter title"
subtitle: "an optional one-line subtitle"
order: 4
summary: "one sentence for the table-of-contents card."
tags: chapter
layout: layouts/chapter.njk
permalink: /chapters/your-slug/
---

your content here, in markdown. lowercase, per house style.
```

`order` controls where it sits in the table of contents and in the prev/next
chain — it doesn't need to match the filename. first and last chapters
automatically drop their "previous"/"next" button; you don't need to manage
that by hand.

## keeping it lowercase

`scripts/check-lowercase.js` scans every chapter's markdown (front matter and
body) plus `src/_data/site.json` for stray capital letters. it skips fenced
code blocks and inline code spans, since real code can legitimately have caps.

```bash
npm run lint          # exits with an error and lists every violation
node scripts/check-lowercase.js --warn   # same check, never fails the build
```

it also runs automatically (in warn-only mode) on every `npm run dev` /
`npm run build`, so you'll see a note in the terminal the moment a capital
letter sneaks in — without that alone blocking your local dev server.
`npm run build:all` (the one you'd actually deploy with) runs the strict
version first and refuses to build the pdf if anything's flagged.

if a capital letter is genuinely intentional — a proper noun you want
preserved, say — add this to the end of that specific line and it'll be
skipped:

```
some line with a Deliberate Capital <!-- lint: allow-caps -->
```

note this only checks `src/chapters/*.md` and `site.json` — the prose you'll
actually be writing per chapter. it deliberately doesn't scan `.njk`/`.css`
files, since those contain SVG path data and hex colors (`#FF4FA3`) where
capital letters are normal and not a style violation.

## project structure

```
src/
  _data/site.json          site title, tagline, description, url
  _includes/layouts/
    base.njk                shared html shell + all seo/meta tags
    chapter.njk              chapter layout + prev/next logic
  css/
    style.css                the goofy on-site look
    print.css                plain, readable book typesetting for the pdf
  icons/                      favicons, og-image.png, site.webmanifest
                              (passthrough-copied to the site root)
  chapters/                  one markdown file per chapter
    chapters.11tydata.js      shared defaults (tags, layout, computed permalink)
  index.njk                  homepage / table of contents
  print.njk                  hidden page that concatenates all chapters
                              for the pdf export (not linked in the nav)
  robots.njk                  generates /robots.txt
  sitemap.njk                 generates /sitemap.xml from the chapters collection
scripts/
  generate-pdf.js             serves _site locally + drives puppeteer
  check-lowercase.js           house-style lint (see "keeping it lowercase")
  clean.js                     removes _site/ (used by restart:dev / restart:build)
.editorconfig                  shared whitespace/indent rules across editors
```
