// Browser-side search over the Pagefind index that `npm run build` writes to dist/pagefind/.
// Shared by the /search page and the terminal's `grep` command.

export type Hit = { url: string; title: string; date: string; cat: string; excerpt: string };

type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string) => Promise<{ results: { data: () => Promise<any> }[] } | null>;
};
let pagefind: Promise<Pagefind> | null = null;

function load() {
  if (!pagefind) {
    const url = '/pagefind/pagefind.js'; // generated at build time, so keep Vite from resolving it
    pagefind = import(/* @vite-ignore */ url).then(async (pf: Pagefind) => {
      await pf.options({ excerptLength: 22 });
      return pf;
    });
    pagefind.catch(() => { pagefind = null; });
  }
  return pagefind;
}

/** Throws if the index isn't there (e.g. `npm run dev`, which doesn't run Pagefind). */
export async function searchPosts(query: string, limit = 20): Promise<{ total: number; hits: Hit[] }> {
  const q = query.trim();
  if (!q) return { total: 0, hits: [] };
  const pf = await load();
  const res = await pf.search(q);
  if (!res) return { total: 0, hits: [] };
  const data = await Promise.all(res.results.slice(0, limit).map((r) => r.data()));
  return {
    total: res.results.length,
    hits: data.map((d) => ({
      url: d.url,
      title: d.meta?.title ?? d.url,
      date: d.meta?.date ?? '',
      cat: d.filters?.category?.[0] ?? '',
      excerpt: d.excerpt ?? '',
    })),
  };
}
