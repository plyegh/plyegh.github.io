// Site-wide settings. Edit here — every page, the terminal and the RSS feed read from this file.

export const SITE = {
  title: 'plyegh',
  description: 'Security study log — network, cloud and web.',
  url: 'https://plyegh.github.io',
  lang: 'en',
};

export const PROFILE = {
  user: 'plyegh',
  name: 'Dongjun Park',
  role: 'Information security student',
  school: 'Woosuk University, Information Security',
  focus: 'Network / Cloud / Web',
  club: 'APS / Kucis / Hspace',
  status: 'learning in public',
  tags: ['network', 'cloud', 'web'],
  avatar: '/assets/img/profile.webp',
  avatarAlt: 'APS — Actively Protect Security',
};

// Leave href empty until the link exists — it renders as a dimmed label and the
// terminal's `open` command skips it.
export const LINKS = [
  { id: 'github', href: 'https://github.com/plyegh' },
  { id: 'instagram', href: '' },
  { id: 'discord', href: '' },
] as const;

// Folder name under src/content/posts/ = URL path = category id.
export const CATEGORIES = [
  { slug: 'dev', name: 'Development' },
  { slug: 'ctf-wargame', name: 'CTF / Wargame' },
  { slug: 'bug-bounty', name: 'Bug Bounty' },
  { slug: 'blog-docs', name: 'Blog / Tech Docs' },
  { slug: 'paper-conf', name: 'Papers / Conferences' },
  { slug: 'contest-cert', name: 'Contests / Certifications' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as CategorySlug[];
export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
