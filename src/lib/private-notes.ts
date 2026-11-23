// Client for the private notes page: reads markdown notes from a private GitHub repository with
// a token the owner pastes in, and renders them in the browser. Nothing from that repository is
// ever part of the built site — without a token the page has nothing to show.
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import x86asm from 'highlight.js/lib/languages/x86asm';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

for (const [name, lang] of Object.entries({ bash, c, cpp, javascript, json, python, sql, x86asm, xml, yaml })) hljs.registerLanguage(name, lang);
hljs.registerAliases(['sh', 'shell', 'zsh', 'console'], { languageName: 'bash' });
hljs.registerAliases(['py'], { languageName: 'python' });
hljs.registerAliases(['js', 'ts', 'typescript'], { languageName: 'javascript' });
hljs.registerAliases(['asm', 'nasm'], { languageName: 'x86asm' });
hljs.registerAliases(['html', 'php'], { languageName: 'xml' });

export interface Repo { owner: string; repo: string; branch: string }
export interface Note { path: string; sha: string; folder: string; name: string; title: string; date?: string; tags: string[] }
type TreeEntry = { path: string; type: string; sha: string };

export class NotesError extends Error {
  constructor(public kind: 'token' | 'repo' | 'rate' | 'network', message: string) { super(message); }
}

const KEY = 'private-notes-token';
/** The token lives in this tab only, unless the owner asks to keep it on this device. */
export const tokenStore = {
  get: () => { try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || ''; } catch { return ''; } },
  set: (token: string, remember: boolean) => {
    try { sessionStorage.setItem(KEY, token); if (remember) localStorage.setItem(KEY, token); else localStorage.removeItem(KEY); } catch {}
  },
  clear: () => { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch {} },
};

export class Notes {
  private tree: TreeEntry[] = [];
  private urls = new Map<string, string>(); // image path → object URL
  constructor(private repo: Repo, private token: string) {}

  private async api(path: string, raw = false): Promise<Response> {
    let res: Response;
    try {
      res = await fetch(`https://api.github.com/repos/${this.repo.owner}/${this.repo.repo}/${path}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    } catch { throw new NotesError('network', 'Could not reach GitHub.'); }
    if (res.status === 401) throw new NotesError('token', 'GitHub rejected this token. It may be mistyped, expired or revoked.');
    if (res.status === 403 || res.status === 429) throw new NotesError('rate', 'GitHub refused the request (rate limit or missing permission).');
    if (res.status === 404) throw new NotesError('repo', 'This token cannot read the notes repository.');
    if (!res.ok) throw new NotesError('network', `GitHub answered ${res.status}.`);
    return res;
  }

  /** Every markdown file in the repository, newest-looking first within its folder. */
  async list(): Promise<Note[]> {
    const data = await (await this.api(`git/trees/${encodeURIComponent(this.repo.branch)}?recursive=1`)).json();
    this.tree = (data.tree as TreeEntry[]).filter((e) => e.type === 'blob');
    return this.tree
      .filter((e) => /\.md$/i.test(e.path) && !/(^|\/)readme\.md$/i.test(e.path))
      .map((e) => {
        const parts = e.path.split('/');
        const file = parts.pop()!;
        // dreamhack/basic_rop/index.md → folder "dreamhack", name "basic_rop"
        const name = /^index\.md$/i.test(file) && parts.length ? parts.pop()! : file.replace(/\.md$/i, '');
        return { path: e.path, sha: e.sha, folder: parts.join('/') || '/', name, title: name, tags: [] };
      })
      .sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
  }

  async text(note: Pick<Note, 'sha'>): Promise<string> {
    return (await this.api(`git/blobs/${note.sha}`, true)).text();
  }

  /** Title, date and tags from the note's front matter (cached per file version). */
  async describe(note: Note): Promise<Note> {
    const cacheKey = `private-notes-meta:${note.sha}`;
    try {
      const hit = sessionStorage.getItem(cacheKey);
      if (hit) return { ...note, ...JSON.parse(hit) };
    } catch {}
    const { meta, body } = splitFrontMatter(await this.text(note));
    const info = {
      title: meta.title || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || note.name,
      date: meta.date?.slice(0, 10),
      tags: meta.tags ? meta.tags.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : [],
    };
    try { sessionStorage.setItem(cacheKey, JSON.stringify(info)); } catch {}
    return { ...note, ...info };
  }

  /** An image stored next to a note, fetched with the token and handed back as a local URL. */
  private async imageUrl(path: string): Promise<string | undefined> {
    if (this.urls.has(path)) return this.urls.get(path);
    const entry = this.tree.find((e) => e.path === path);
    if (!entry) return undefined;
    const blob = await (await this.api(`git/blobs/${entry.sha}`, true)).blob();
    const type = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: '' }[path.split('.').pop()!.toLowerCase()];
    if (!type) return undefined; // unknown types and SVG (can carry scripts) are not shown
    const url = URL.createObjectURL(new Blob([blob], { type }));
    this.urls.set(path, url);
    return url;
  }

  /** Render a note into `target`. Returns its front matter. */
  async render(note: Note, target: HTMLElement, linkFor: (path: string) => string) {
    const { meta, body } = splitFrontMatter(await this.text(note));
    const html = await marked.parse(body, { gfm: true });
    // notes are the owner's own, but they are still treated as untrusted HTML
    target.innerHTML = DOMPurify.sanitize(html, { FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'], FORBID_ATTR: ['style'] });

    const dir = note.path.split('/').slice(0, -1);
    const resolve = (rel: string) => {
      const out = rel.startsWith('/') ? [] : [...dir];
      for (const seg of decodeURIComponent(rel.split(/[?#]/)[0]).split('/')) {
        if (seg === '..') out.pop(); else if (seg && seg !== '.') out.push(seg);
      }
      return out.join('/');
    };
    const external = (u: string) => /^(https?:)?\/\//i.test(u) || /^(mailto|data|blob):/i.test(u);

    await Promise.all([...target.querySelectorAll('img')].map(async (img) => {
      const src = img.getAttribute('src') || '';
      if (/^https?:\/\//i.test(src)) { img.removeAttribute('src'); img.alt = `[remote image not loaded] ${img.alt}`; return; } // CSP would block it anyway
      if (external(src)) return;
      const url = await this.imageUrl(resolve(src)).catch(() => undefined);
      if (url) { img.src = url; img.loading = 'lazy'; } else { img.removeAttribute('src'); img.alt = `[missing image: ${src}] ${img.alt}`; }
    }));
    for (const a of target.querySelectorAll('a')) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#')) continue; // no target (or one the sanitizer removed), or an in-page anchor
      if (external(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; continue; }
      const path = resolve(href);
      const md = this.tree.find((e) => e.path === path || e.path === `${path}/index.md`);
      if (md) a.setAttribute('href', linkFor(md.path)); else a.removeAttribute('href');
    }
    // > [!TIP] … callouts, as on the rest of the site
    for (const quote of target.querySelectorAll('blockquote')) {
      const first = quote.querySelector('p');
      const m = first?.innerHTML.match(/^\s*\[!(TIP|NOTE|WARNING|DANGER)\]\s*(<br>)?\s*/i);
      if (!first || !m) continue;
      const kind = m[1].toLowerCase();
      first.innerHTML = first.innerHTML.slice(m[0].length);
      if (!first.innerHTML.trim()) first.remove();
      quote.classList.add('callout', `callout-${kind}`);
      const label = document.createElement('span');
      label.className = 'callout-label';
      label.textContent = kind;
      quote.prepend(label);
    }
    for (const code of target.querySelectorAll<HTMLElement>('pre > code')) {
      const lang = [...code.classList].find((cl) => cl.startsWith('language-'))?.slice(9) ?? '';
      if (lang) code.parentElement!.dataset.language = lang;
      if (lang && hljs.getLanguage(lang)) code.innerHTML = hljs.highlight(code.textContent ?? '', { language: lang }).value;
    }
    if (!meta.title) meta.title = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? '';
    return meta;
  }

  /** Forget everything fetched (called when the page is locked again). */
  dispose() {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
    this.tree = [];
    try { for (const k of Object.keys(sessionStorage)) if (k.startsWith('private-notes-meta:')) sessionStorage.removeItem(k); } catch {}
  }
}

/** Minimal front matter reader: `key: value` lines between --- fences. */
export function splitFrontMatter(text: string): { meta: Record<string, string>; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: text };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(m[0].length) };
}
