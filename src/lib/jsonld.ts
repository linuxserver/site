/**
 * Structured data builders for schema.org markup.
 * Pass the result to <Layout jsonLd={[...]}>. Organization and WebSite are added on the home page by BaseHead.
 */
import type { Image } from './images';
import type { PostView } from './views';
import { withBase } from './base';
import { SITE } from './site';

const abs = (path: string, site: URL | undefined) => new URL(withBase(path), site ?? SITE.url).toString();
const orgRef = (site: URL | undefined) => ({ '@id': `${abs('/', site)}#organization` });

export function imageJsonLd(image: Image, site: URL | undefined): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    name: image.name,
    description: image.summary,
    url: abs(image.url, site),
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: image.categories.join(', ') || undefined,
    operatingSystem: 'Linux (Docker)',
    softwareVersion: image.version,
    dateModified: image.version_timestamp.replace(' ', 'T'),
    datePublished: image.initial_date,
    downloadUrl: `https://${SITE.registry}/${image.name}`,
    codeRepository: image.github_url,
    sameAs: [image.github_url, image.docsUrl],
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    publisher: orgRef(site),
  };
}

export function postJsonLd(post: PostView, heroUrl: string | undefined, site: URL | undefined): Record<string, unknown> {
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: abs(post.url.replace(withBase('/'), '/'), site),
    datePublished: post.date.toISOString(),
    dateModified: (post.updated ?? post.date).toISOString(),
    author: post.byline
      ? { '@type': 'Person', name: post.byline.name, ...(post.byline.github ? { url: `https://github.com/${post.byline.github}` } : {}) }
      : orgRef(site),
    publisher: orgRef(site),
    keywords: post.tags.map((t) => t.name).join(', '),
    image: heroUrl,
    mainEntityOfPage: abs(post.url.replace(withBase('/'), '/'), site),
  };
}

export function itemListJsonLd(name: string, items: { name: string; url: string }[], site: URL | undefined): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.url, site) })),
  };
}
