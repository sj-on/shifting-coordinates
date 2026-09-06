# shifting coordinates

geography that refuses to sit still. an 11ty site: a table-of-contents
homepage, one page per chapter, prev/next navigation, and a one-click
"download the whole thing as a pdf" button.

the whole site — including this readme's sibling pages, chapter titles, and
body copy — is written in lowercase on purpose. it's a style choice, not a
bug: keep new chapters lowercase too, since the design (fonts, spacing,
the postcard/stamp motifs) was built assuming no capital letters anywhere.
acronyms like "upsc" and "pdf" are lowercased as well, for consistency —
if that ever reads oddly in a specific sentence, that's a judgment call you
can override per-chapter.

## running it

```bash
npm install
npm run dev      # local dev server with live reload, http://localhost:8080
npm run build    # builds the static site into _site/
```

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

## project structure

```
src/
  _data/site.json          site title, tagline, description
  _includes/layouts/
    base.njk                shared html shell
    chapter.njk              chapter layout + prev/next logic
  css/
    style.css                the goofy on-site look
    print.css                plain, readable book typesetting for the pdf
  chapters/                  one markdown file per chapter
  index.njk                  homepage / table of contents
  print.njk                  hidden page that concatenates all chapters
                              for the pdf export (not linked in the nav)
scripts/
  generate-pdf.js             serves _site locally + drives puppeteer
```
