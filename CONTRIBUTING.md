# Writing for the LinuxServer.io blog

Posts are Markdown files. You don't need to run anything locally: you can write a post entirely in the
GitHub web editor, and every pull request gets a preview link.

## The quick way

```bash
npm install
npm run new-post        # asks for a title, your GitHub handle and tags
npm run dev             # http://localhost:4321/blog/<your-post>/ (drafts are visible locally)
```

`new-post` creates `src/content/posts/<slug>/index.md` as a draft, adds you to the authors list if
you're new, and prints the URL. When it's ready, remove `draft: true` and open a pull request.

## The no-install way (GitHub web editor)

1. On GitHub, open `src/content/posts/`, choose **Add file → Create new file**.
2. Name it `your-post-title/index.md`. The folder name is the URL: `/blog/your-post-title/`.
   Lower-case, hyphens, no dates.
3. Paste the template below, write, then **Commit changes → Create a new branch → Propose changes**.
4. Drag images into the same folder (**Add file → Upload files**).
5. The pull request builds a preview. A reviewer merges it, and it's live a couple of minutes later.

## Front matter

```markdown
---
title: "Webtop 6.0: now with more otters"
date: 2026-10-22T09:00:00Z
author: thelamer
tags:
  - Webtop
  - announcement
description: One or two sentences for the blog card, search engines and social previews.
hero: ./banner.jpg
heroAlt: An otter sitting at a Linux desktop
images: [webtop]
draft: true
---
```

| Field | | What it does |
| --- | --- | --- |
| `title` | required | Quote it if it contains a colon. |
| `date` | required | Publish date. A future date keeps the post hidden until then. |
| `author` | recommended | Your GitHub handle. Links to your author page if you're in `src/content/authors/`. |
| `tags` | recommended | 3–8 tags. Reuse existing ones (see `/blog/tags/`). Product names keep their casing. |
| `description` | recommended | Shown on cards and in search results. Without it the first paragraph is used. |
| `hero` | optional | A landscape image in your folder (about 1600×900), always `./file.jpg`. |
| `heroAlt` | optional | One sentence describing the hero for screen readers. |
| `images` | optional | Image names the post is about. The post then appears on those image pages, and they appear under the post. |
| `featured` | optional | `true` pins the post to the top of the blog and the home page. |
| `draft` | optional | `true` while you work on it. Remove it to publish. |
| `updated` | optional | Set when you materially revise a post. |

The build checks all of this, so a typo in the front matter fails the pull request with a message
that names the file and field. You'll know before anything goes live.

## Writing

- Don't repeat the title as a `# Heading`; the page already shows it. Start with a paragraph or an `## H2`.
- Images: `![What the image shows](./screenshot.png)`. Always write alt text. Add `?link` to make a
  screenshot open full size on click: `![Settings](./settings.png?link)`. Images are resized and converted
  to WebP automatically, so upload originals.
- Code: fenced blocks with a language, e.g. ` ```yaml `. Use `bash`, `yaml`, `nginx`, `json`, `dockerfile`, `ini`, `text`.
- Callouts:

  ```markdown
  > [!WARNING]
  > This deletes your config folder. Back it up first.
  ```

  Also `NOTE`, `TIP`, `IMPORTANT` and `CAUTION`.
- Videos go in `public/media/<your-slug>/` and are embedded with
  `<video controls playsinline preload="metadata" src="/media/<your-slug>/clip.mp4"></video>`.
- Link to other posts as `/blog/<slug>/` and to images as `/images/<name>/`.
- Refer to images as `lscr.io/linuxserver/<name>:latest`.

## The weekly spotlight

The home page features one image each week. The images listed in `src/content/spotlight.yaml` take
turns in file order, changing every Monday. Add, remove or reorder entries to change the rotation, and
give an entry a `note` to say why it's worth a look:

```yaml
- id: swag
  note: A sentence or two on why it's worth a look.
  by: thespad
```

Newly added images aren't part of the rotation; they have their own section on the home page.
