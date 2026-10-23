import type { DesignMeta } from '../types';

export default {
  id: 'current',
  name: 'Current',
  tagline: 'Catalogue-first: a registry you enjoy using',
  intent:
    'Most people arrive at LinuxServer.io to find an image and get it running. Current puts the search box first, so typing on the home page filters all 200+ images on the spot. Browsing works like an app store: categories, ranked lists, a weekly spotlight and a page for every image with a ready-to-copy compose file. The type is clean and Swiss in feel, and the brand gradient appears only as a signature.',
  traits: [
    'Search-led home: instant inline results, suggestion chips and ⌘K from anywhere',
    'App-store browsing: categories, “highest rated” and “most pulled” charts, new arrivals, a weekly spotlight',
    'Information-dense image pages: stats row, compose / docker run, parameter tables, tags, changelog',
    'Schibsted Grotesk with Inter and JetBrains Mono; hairline borders. AAA text contrast in light and dark',
  ],
  swatch: ['#ffffff', '#0f172a', '#9d174d', '#d93b92', '#1e4fb8', '#0b1120'],
} satisfies DesignMeta;
