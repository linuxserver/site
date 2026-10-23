import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Blog posts: one folder per post, src/content/posts/<slug>/index.md, images alongside.
 * The folder name is the URL: /blog/<slug>/. See CONTRIBUTING.md for the author guide.
 */
const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      /** Handle or name. Matched against src/content/authors/ (file name or aliases); unknown names still display. */
      author: z.string().optional(),
      /** One or two sentences for cards, search engines and feeds. Falls back to the first paragraph. */
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Relative path to the hero image, e.g. ./banner.png. Used for the hero, the card and og:image. */
      hero: image().optional(),
      heroAlt: z.string().optional(),
      /** Image names this post is about, e.g. [webtop, swag]. The post is listed on those image pages. */
      images: z.array(z.string()).default([]),
      /** Pin to the top of the blog and the home page. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      /** Hide the post after this date (Grav's unpublish_date). */
      expires: z.coerce.date().optional(),
    }),
});

/** One YAML file per author, src/content/authors/<id>.yaml. Author pages live at /blog/authors/<id>/. */
const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '*.yaml' }),
  schema: z.object({
    name: z.string(),
    github: z.string().optional(),
    role: z.enum(['team', 'alumni', 'guest']).default('team'),
    bio: z.string().optional(),
    /** Other spellings used in post front matter, e.g. [Spad, spad]. */
    aliases: z.array(z.string()).default([]),
  }),
});

/**
 * Optional hand-written spotlights, keyed by ISO week ("2026-W44"). Weeks without an entry fall back
 * to the automatic rotation through recently added images (src/lib/images.ts).
 */
const spotlights = defineCollection({
  loader: file('./src/content/spotlights.yaml'),
  schema: z.object({
    image: z.string(),
    /** A sentence or two from the team about why this image is worth a look. */
    note: z.string().optional(),
    by: z.string().optional(),
  }),
});

export const collections = { posts, authors, spotlights };
