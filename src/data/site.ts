// Site-wide settings. Edit here — every page, the terminal and the RSS feed read from this file.

export const SITE = {
  title: 'plyegh',
  description: 'Security study log — network, cloud and web.',
  url: 'https://plyegh.github.io',
  lang: 'en',
};

// The existing blog lives under /personal; the recruiter-facing one will live under /public.
export const PERSONAL = '/personal';

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
  { id: 'dreamhack', href: 'https://dreamhack.io/users/28296' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/%EC%A4%80-%EB%B0%95%EB%8F%99-648450432' },
  { id: 'instagram', href: 'https://www.instagram.com/d_zun0210/' },
  { id: 'discord', href: 'https://discord.com/users/373615449117556736' },
] as const;

// Comments (giscus, backed by GitHub Discussions of a PUBLIC repo).
// Fill these from https://giscus.app after creating the repo; comments stay hidden while any is empty.
export const GISCUS = {
  repo: '', // e.g. 'plyegh/blog-comments'
  repoId: '',
  category: 'Announcements',
  categoryId: '',
};

// slug: folder name under src/content/posts/ = URL path = category id (keep it URL-safe).
// label: how the category is shown on cards, the /posts menu, the tree and breadcrumbs.
// hideOnHome: leave it off the home page's category cards (still in the menu, tree and terminal).
export const CATEGORIES = [
  { slug: 'dev', label: 'dev', name: 'Development' },
  { slug: 'ctf-wargame', label: 'ctf&wargame', name: 'CTF / Wargame' },
  { slug: 'bug-bounty', label: 'bug-bounty', name: 'Bug Bounty' },
  { slug: 'blog-docs', label: 'blog&docs', name: 'Blog / Tech Docs' },
  { slug: 'paper-conf', label: 'paper&conf', name: 'Papers / Conferences' },
  { slug: 'contest-cert', label: 'contest&cert', name: 'Contests / Certifications' },
  { slug: 'playground', label: 'playground', name: 'Playground', hideOnHome: true }, // not on the home cards
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as CategorySlug[];
export const categoryLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
