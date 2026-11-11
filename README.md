# plyegh.github.io

## URL
```bash
https://plyegh.github.io/
```

Personal security study log — built with [Astro](https://astro.build), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Writing a post

```bash
npm install        # first time only
npm run new        # pick a category, slug and title → creates the post folder
npm run dev        # http://localhost:4321 — drafts are visible here only
```

Each post is a folder: `src/content/posts/<category>/<slug>/index.md`. Put images in the same folder and use `![alt](./fig1.png)`; a line of `_italic text_` right under an image becomes its caption.

When it's ready, set `draft: false`, then commit and push. The site updates about a minute later.

Front matter:

```yaml
title: "Post title"
date: 2026-10-27T13:00:00+09:00
tags: [CTF, Web]                 # each tag gets a page at /tags/<tag>/
description: "One line shown in lists"
series: "Heap study"             # optional — posts with the same name are linked in date order
pinned: false                    # optional — true puts the post at the top of lists
draft: false
```

Callouts:

```md
> [!TIP]
> Text — also [!NOTE], [!WARNING], [!DANGER]
```

Documents (PDF viewer + downloads): put the files in the post folder and list them in front matter.
PDFs are shown page by page above the post body; every listed file gets a download button.
HWP / DOCX can't be previewed in a browser — save a PDF copy from 한글 / Word and list both.

```yaml
docs:
  - file: review.pdf
    title: "AI Oops 논문 리뷰"   # optional label for the viewer
  - file: review.hwp
```

Page images are generated at build time into `public/docs/` (gitignored) with pdf.js and
`@napi-rs/canvas` (npm dev dependencies, so nothing extra to install).

## Search

`npm run build` runs [Pagefind](https://pagefind.app) after Astro, so search (the `/search/` page and the terminal's `grep`) only works on a build: `npm run build && npm run preview`.

## Comments (giscus)

Comments use GitHub Discussions of a separate **public** repo, so this repo can go private later without losing them.

1. Create a public repo (e.g. `plyegh/blog-comments`) and turn on Discussions in its settings.
2. Install the giscus app for that repo: https://github.com/apps/giscus
3. On https://giscus.app enter the repo, pick the `Announcements` category, and copy `data-repo-id` and `data-category-id`.
4. Put them in `GISCUS` in `src/data/site.ts`. Comments appear under every post once all fields are filled.

## Security headers

Every page carries a Content-Security-Policy `<meta>` (configured in `astro.config.mjs`). If you embed something from another site, add its origin there or the browser will block it.

## Categories

| Folder / URL | Name |
| --- | --- |
| `dev` | Development |
| `ctf-wargame` | CTF / Wargame |
| `bug-bounty` | Bug Bounty |
| `blog-docs` | Blog / Tech Docs |
| `paper-conf` | Papers / Conferences |
| `contest-cert` | Contests / Certifications |
| `playground` | Playground |

The list lives in `src/data/site.ts` (with the profile and links). A post in any other folder fails the build.

## Layout

```
src/content/posts/   posts (folder = category)
src/data/site.ts     profile, links, categories
src/components/      terminal, header, side panel, lists
src/pages/           routes: /, /posts/, /posts/<category>/, /posts/<category>/<slug>/, /tags/, /search/
public/              copied as-is (profile image, favicon, /yu/seon/ho/game/play/)
```

The pre-renewal Chirpy site is kept on the `legacy-chirpy` branch.

## License

All rights reserved — posts, images, documents, profile information and code may not be copied or reused without permission. See [LICENSE](LICENSE) and <https://plyegh.github.io/license/>.
