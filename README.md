# plyegh.github.io

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
tags: [CTF, Web]
description: "One line shown in lists"
draft: false
```

Callouts:

```md
> [!TIP]
> Text — also [!NOTE], [!WARNING], [!DANGER]
```

## Categories

| Folder / URL | Name |
| --- | --- |
| `dev` | Development |
| `ctf-wargame` | CTF / Wargame |
| `bug-bounty` | Bug Bounty |
| `blog-docs` | Blog / Tech Docs |
| `paper-conf` | Papers / Conferences |
| `contest-cert` | Contests / Certifications |

The list lives in `src/data/site.ts` (with the profile and links). A post in any other folder fails the build.

## Layout

```
src/content/posts/   posts (folder = category)
src/data/site.ts     profile, links, categories
src/components/      terminal, header, side panel, lists
src/pages/           routes: /, /posts/, /posts/<category>/, /posts/<category>/<slug>/
public/              copied as-is (profile image, favicon, /yu/seon/ho/game/play/)
```

The pre-renewal Chirpy site is kept on the `legacy-chirpy` branch.
