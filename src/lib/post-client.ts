// Browser-side touches for a rendered post body: scrollable tables, code-block labels and
// copy buttons, reading progress and the active table-of-contents entry.
export function enhancePost(prose: HTMLElement, labels = { copy: 'copy', copied: 'copied' }) {
  // Lazy images take no space until they load, so the page grows while you read and in-page
  // links (table of contents, #anchors) land in the wrong place. Give each image its final
  // size up front: natural size, scaled down to fit the column, the post's image cap and 80vh.
  const sized = [...prose.querySelectorAll<HTMLImageElement>('img[width][height]')].filter((i) => !i.closest('.docs'));
  const fitImages = () => {
    const cap = parseFloat(getComputedStyle(prose).getPropertyValue('--img-max')) || Infinity;
    for (const img of sized) {
      const w = Number(img.getAttribute('width'));
      const h = Number(img.getAttribute('height'));
      if (!w || !h) continue;
      const box = (img.parentElement ?? prose).clientWidth || prose.clientWidth;
      const scale = Math.min(1, box / w, cap / w, (innerHeight * 0.8) / h);
      img.style.width = `${Math.floor(w * scale)}px`;
    }
  };
  if (sized.length) {
    fitImages();
    addEventListener('resize', fitImages);
  }

  wrapTables(prose);
  decorateCode(prose, labels);

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

/** Wide tables scroll sideways inside their own box. */
export function wrapTables(prose: HTMLElement) {
  prose.querySelectorAll('table').forEach((t) => {
    const w = document.createElement('div');
    w.className = 'table-wrap';
    t.replaceWith(w);
    w.appendChild(t);
  });
}

/** Code blocks get a language label (from `data-language`) and a copy button. */
export function decorateCode(prose: HTMLElement, labels = { copy: 'copy', copied: 'copied' }) {
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
}
