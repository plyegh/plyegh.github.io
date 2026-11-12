// Site-wide settings. Edit here — every page, the terminal and the RSS feed read from this file.

export const SITE = {
  title: 'plyegh',
  description: 'Security study log — network, cloud and web.',
  url: 'https://plyegh.github.io',
  lang: 'en',
};

// Two sites share the posts: /personal (the terminal-style blog, everything) and
// /public (clean, recruiter-facing — activities and results only).
export const PERSONAL = '/personal';
export const PUBLIC = '/public';

// Shown on the /public site.
export const PUBLIC_PROFILE = {
  title: 'plyegh 블로그',
  kicker: 'Security Study Log',
  tagline: '네트워크 · 클라우드 · 웹 보안을 공부하며 배운 것을 기록합니다.',
  name: '박동준',
  nameEn: 'Dongjun Park',
  line: '우석대학교 정보보안학과 · APS · KUCIS 호남권 대표 · HSPACE Knights Frontier 3기',
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
  { id: 'dreamhack', href: 'https://dreamhack.io/users/28296' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/%EC%A4%80-%EB%B0%95%EB%8F%99-648450432' },
  { id: 'instagram', href: 'https://www.instagram.com/d_zun0210/' },
  { id: 'discord', href: 'https://discord.com/users/373615449117556736' },
] as const;

// Shown on the About pages.
export const CONTACT_EMAIL = 'bdongjun343@gmail.com';
// friendly handle shown instead of the raw URL
export const LINK_HANDLE: Record<string, string> = {
  github: '@plyegh',
  dreamhack: 'plyegh',
  linkedin: '박동준',
  instagram: '@d_zun0210',
  discord: '@plyegh',
};

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
// ko: the name shown on the /public site.
// hideOnHome: leave it off the home page's category cards (still in the menu, tree and terminal).
// personalOnly: posts in it never appear on /public (things made for fun).
export const CATEGORIES = [
  { slug: 'dev', label: 'dev', name: 'Development', ko: '개발' },
  { slug: 'ctf-wargame', label: 'ctf&wargame', name: 'CTF / Wargame', ko: 'CTF · 워게임' },
  { slug: 'bug-bounty', label: 'bug-bounty', name: 'Bug Bounty', ko: '버그바운티' },
  { slug: 'blog-docs', label: 'blog&docs', name: 'Blog / Tech Docs', ko: '기술 문서' },
  { slug: 'paper-conf', label: 'paper&conf', name: 'Papers / Conferences', ko: '논문 · 컨퍼런스' },
  { slug: 'contest-cert', label: 'contest&cert', name: 'Contests / Certifications', ko: '공모전 · 자격증' },
  { slug: 'playground', label: 'playground', name: 'Playground', ko: 'Playground', hideOnHome: true, personalOnly: true },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as CategorySlug[];
export const categoryKo = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.ko ?? slug;
export const isPublicCategory = (slug: string) => !CATEGORIES.some((c) => c.slug === slug && 'personalOnly' in c && c.personalOnly);
export const categoryLabel = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
