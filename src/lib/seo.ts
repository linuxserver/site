/** SEO props shared by the Layout and <BaseHead>. */
import type { ImageMetadata } from 'astro';

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
  /** Rendered as BreadcrumbList JSON-LD and shown by <Breadcrumbs>. Do not include Home. */
  breadcrumbs?: Crumb[];
}
