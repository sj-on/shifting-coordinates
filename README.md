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
or offline environment). on ubuntu/debian, chromium also needs its host
libraries installed once:

```bash
sudo apt-get update
sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libasound2t64 libgbm1 libnss3
```

after that it's fully local, with no external services involved.

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
  check-lowercase.js           house-style lint (see "keeping it lowercase")
.editorconfig                  shared whitespace/indent rules across editors
```
