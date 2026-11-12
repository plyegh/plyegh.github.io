// Browser-side touches for a rendered post body: scrollable tables, code-block labels and
// copy buttons, reading progress and the active table-of-contents entry.
export function enhancePost(prose: HTMLElement, labels = { copy: 'copy', copied: 'copied' }) {
  prose.querySelectorAll('table').forEach((t) => {
    const w = document.createElement('div');
    w.className = 'table-wrap';
    t.replaceWith(w);
    w.appendChild(t);
  });

  prose.querySelectorAll('pre').forEach((pre) => {
    const box = document.createElement('div');
    box.className = 'code';
    pre.replaceWith(box);
    box.appendChild(pre);
    const lang = pre.dataset.language;
    if (lang && !['text', 'plain', 'plaintext', 'txt'].includes(lang)) {
      const tag = document.createElement('span');
      tag.className = 'code-lang';
      tag.textContent = lang;
      box.appendChild(tag);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = labels.copy;
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')); } catch {}
      btn.textContent = labels.copied; btn.classList.add('done');
      setTimeout(() => { btn.textContent = labels.copy; btn.classList.remove('done'); }, 1600);
    });
    box.appendChild(btn);
  });

  const bar = document.querySelector<HTMLElement>('.progress span');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')];
  const heads = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean) as HTMLElement[];
  function onScroll() {
    const r = prose.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * 0.6)));
    if (bar) bar.style.transform = `scaleX(${p})`;
    let idx = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) idx = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
