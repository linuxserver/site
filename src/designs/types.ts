/**
 * The props contract between routes and the design. Routes in src/pages build these props from the data
 * layer and render `@design/pages/<Name>.astro`; `@design` points at src/designs/raft (astro.config.mjs).
 * Keeping presentation behind this contract means the look can change without touching data logic.
 *
 * A design folder contains:
 *   Layout.astro                   <html>, <BaseHead>, header, footer. Props: LayoutProps
 *   theme.css                      tokens (:root / .dark), fonts, design-only CSS. Imported by Layout
 *   pages/Home.astro               HomeProps
 *   pages/Images.astro             ImagesProps
 *   pages/Image.astro              ImageProps
 *   pages/BlogList.astro           BlogListProps (blog index, pages 2+, tag and author listings)
 *   pages/Post.astro               PostProps
 *   pages/Tags.astro               TagsProps
 *   pages/Search.astro             SearchProps
 *   pages/Donate.astro             DonateProps
 *   pages/Support.astro            SupportProps
 *   pages/About.astro              AboutProps
 *   pages/NotFound.astro           NotFoundProps
 */
import type { ImageMetadata, MarkdownHeading } from 'astro';
import type { Category, Image, ImageCard, Spotlight } from '@/lib/images';
import type { Page, TagInfo } from '@/lib/posts';
import type { stat } from '@/lib/stats';
import type { Supporter, SupportChannel } from '@/lib/site';
import type { PostView } from '@/lib/views';

export type Stats = typeof stat;

export type Section = 'home' | 'images' | 'blog' | 'support' | 'about' | 'donate' | 'search' | 'none';

export interface Crumb {
  name: string;
  href: string;
}

export interface SeoProps {
  /** Page title without the site suffix. Omit on the home page. */
  title?: string;
  description?: string;
  /** Social card image. Defaults to /og-default.png. */
  image?: ImageMetadata | string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  tags?: string[];
  noindex?: boolean;
  /** Extra JSON-LD objects for this page (Organization/WebSite are added on the home page automatically). */
  jsonLd?: Record<string, unknown>[];
  /** Rendered as BreadcrumbList JSON-LD; designs may also show them. Do not include Home. */
  breadcrumbs?: Crumb[];
}

export interface LayoutProps extends SeoProps {
  section?: Section;
}

export interface HomeProps {
  stats: Stats;
  spotlight: Spotlight;
  mostStarred: Image[];
  mostPulled: Image[];
  newest: Image[];
  recentlyUpdated: Image[];
  posts: PostView[];
  categories: Category[];
  /** When the image data was fetched; use for "rebuilt 2 hours ago" style text. */
  snapshotDate: Date;
}

export interface ImagesProps {
  cards: ImageCard[];
  categories: Category[];
  stats: Stats;
  snapshotDate: Date;
}

export interface ImageProps {
  image: Image;
  related: Image[];
  posts: PostView[];
  snippets: { compose: string; composeRequired: string; run: string; runRequired: string };
  snapshotDate: Date;
}

export interface AuthorView {
  id: string;
  name: string;
  github?: string;
  bio?: string;
  role: 'team' | 'alumni' | 'guest';
  initials: string;
  count: number;
  url: string;
}

export interface BlogListProps {
  kind: 'all' | 'tag' | 'author';
  /** "Blog", "Tagged: docker", "Posts by aptalca" */
  heading: string;
  description: string;
  page: Page<PostView>;
  /** Most used tags, for filter chips. */
  topTags: TagInfo[];
  tag?: TagInfo;
  author?: AuthorView;
}

export interface PostProps {
  post: PostView;
  /** The rendered Markdown body. Render it inside <PostBody>. */
  Content: any;
  headings: MarkdownHeading[];
  newer?: PostView;
  older?: PostView;
  related: PostView[];
  /** Images the post is about (front matter `images:` or tags that match an image name). */
  images: Image[];
  editUrl: string;
}

export interface TagsProps {
  tags: TagInfo[];
  authors: AuthorView[];
  totalPosts: number;
}

export interface SearchProps {
  /** Popular images to suggest before the visitor types. */
  suggestions: Image[];
}

export interface DonateProps {
  stats: Stats;
  supporters: Supporter[];
  backers: { backers: number; yearly_income: number; currency: string };
}

export interface SupportProps {
  channels: SupportChannel[];
  stats: Stats;
}

export type { Member as TeamMember } from '@/lib/team';
import type { Member as TeamMember } from '@/lib/team';

export interface AboutProps {
  stats: Stats;
  team: TeamMember[];
  supporters: Supporter[];
  /** Year-by-year count of new images, from first-build dates, for a growth chart. */
  growth: { year: number; added: number; total: number }[];
  categories: Category[];
}

export interface NotFoundProps {
  popular: Image[];
}
