/** Site-wide settings. Everything that used to live in the Grav theme YAML. */

export const SITE = {
  name: 'LinuxServer.io',
  url: 'https://www.linuxserver.io',
  title: 'LinuxServer.io: community-built Docker images',
  description:
    'LinuxServer.io builds and maintains the largest collection of community Docker images: standardised, regularly updated and properly documented, for everyone.',
  tagline: 'Building and maintaining community images',
  locale: 'en_GB',
  lang: 'en-GB',
  postsPerPage: 12,
  feedItems: 20,
  fediverse: '@linuxserver@linuxserver.io',
  registry: 'lscr.io/linuxserver',
};

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
}

/** Primary navigation. Docs, Info and Status are separate sites. */
export const NAV: NavItem[] = [
  { label: 'Images', href: '/images/', description: 'Browse every container we maintain' },
  { label: 'Blog', href: '/blog/', description: 'News, guides and release notes' },
  { label: 'Docs', href: 'https://docs.linuxserver.io/', external: true, description: 'Setup guides for every image' },
  { label: 'Support', href: '/support/', description: 'Discord, forum and GitHub' },
  { label: 'About', href: '/about/', description: 'Who we are and how we work' },
];

export const NAV_SECONDARY: NavItem[] = [
  { label: 'Info', href: 'https://info.linuxserver.io', external: true, description: 'Fleet and build information' },
  { label: 'Status', href: 'https://status.linuxserver.io/', external: true, description: 'Service status' },
];

export const DONATE_URL = 'https://opencollective.com/linuxserver/donate';

export const LINKS = {
  github: 'https://github.com/linuxserver',
  discord: 'https://discord.gg/YWrKVTn',
  discussions: 'https://github.com/orgs/linuxserver/discussions',
  docs: 'https://docs.linuxserver.io/',
  info: 'https://info.linuxserver.io',
  status: 'https://status.linuxserver.io/',
  mastodon: 'https://mastodon.linuxserver.io/@linuxserver',
  bluesky: 'https://bsky.app/profile/linuxserver.io',
  opencollective: 'https://opencollective.com/linuxserver',
  team: 'https://github.com/orgs/linuxserver/people',
  /** Where posts are edited ("Edit on GitHub" links). */
  repo: 'https://github.com/linuxserver/site',
};

export interface Social {
  name: string;
  href: string;
  icon: 'github' | 'discord' | 'mastodon' | 'bluesky' | 'rss' | 'docs';
}

export const SOCIAL: Social[] = [
  { name: 'GitHub', href: LINKS.github, icon: 'github' },
  { name: 'Discord', href: LINKS.discord, icon: 'discord' },
  { name: 'Mastodon', href: LINKS.mastodon, icon: 'mastodon' },
  { name: 'Bluesky', href: LINKS.bluesky, icon: 'bluesky' },
  { name: 'RSS feed', href: '/blog/rss.xml', icon: 'rss' },
];

export interface SupportChannel {
  name: string;
  href: string;
  icon: 'docs' | 'discord' | 'discussions' | 'github';
  summary: string;
  bestFor: string;
}

/** From the Support page on the Grav site, in the order we want people to try them. */
export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    name: 'Documentation',
    href: LINKS.docs,
    icon: 'docs',
    summary: 'Setup guides, parameters and FAQs for every one of our images.',
    bestFor: 'Start here. Most questions are already answered.',
  },
  {
    name: 'Discord',
    href: LINKS.discord,
    icon: 'discord',
    summary: 'Real-time support and chat with the community and the team.',
    bestFor: 'Quick questions and troubleshooting together.',
  },
  {
    name: 'Discussions',
    href: LINKS.discussions,
    icon: 'discussions',
    summary: 'Our forum on GitHub. Searchable, threaded and asynchronous.',
    bestFor: 'Longer questions and ideas for new images.',
  },
  {
    name: 'GitHub',
    href: LINKS.github,
    icon: 'github',
    summary: 'The source for every image. Pull requests are welcome.',
    bestFor: 'Bugs that do not behave as documented.',
  },
];

export interface Supporter {
  name: string;
  href: string;
  contribution: string;
}

/** Organisations that have donated time, credit or hardware (Donate page on the Grav site). */
export const SUPPORTERS: Supporter[] = [
  { name: 'DigitalOcean', href: 'https://www.digitalocean.com/', contribution: 'Credit for their Droplet platform, and LSIO in their supporter programme.' },
  { name: 'Pine64', href: 'https://www.pine64.org/', contribution: 'Hardware that runs part of our aarch64 build system.' },
  { name: 'QNAP', href: 'https://www.qnap.com/', contribution: 'A test unit so we can support users on QNAP devices.' },
  { name: 'Synology', href: 'https://www.synology.com/', contribution: 'A test unit so we can support users on Synology devices.' },
  { name: 'Unraid', href: 'https://unraid.net/', contribution: 'Generous monetary donations and licence keys for their software.' },
];

/** The four principles from the Grav home page. */
export const PILLARS = [
  {
    id: 'standardised',
    title: 'Standardised images',
    body: 'Every image is built on the same curated base. With s6-overlay each one is highly extendable, and shared base layers save you bandwidth and storage.',
    link: { label: 'About s6-overlay', href: 'https://github.com/just-containers/s6-overlay' },
  },
  {
    id: 'updates',
    title: 'Regular updates',
    body: 'When an upstream application or its dependencies change, our pipeline rebuilds automatically. Version tags tell you exactly what each build contains.',
    link: { label: 'Fleet info', href: 'https://info.linuxserver.io' },
  },
  {
    id: 'docs',
    title: 'First-class documentation',
    body: 'Every image ships with a clear, thorough setup guide, on GitHub and in one dedicated documentation space.',
    link: { label: 'Read the docs', href: 'https://docs.linuxserver.io/' },
  },
  {
    id: 'support',
    title: 'Real support',
    body: 'Whether you are new or a veteran, someone from the team or the community is around on Discord and our forum to help.',
    link: { label: 'Get support', href: '/support/' },
  },
] as const;

export const MISSION =
  'We are a group of like-minded enthusiasts from across the world who build and maintain the largest collection of Docker images on the web. At our core are the principles behind Free and Open Source Software. Our goal is easy-to-use, streamlined images with clear and concise documentation.';
