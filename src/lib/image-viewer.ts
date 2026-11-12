// Click a post image to see it large: a full-screen viewer with previous / next across the
// post's images. Uses the same dialog styles as the timeline's proof viewer (content.css).
const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

export function enableImageZoom(prose: HTMLElement, labels = { open: 'View larger', prev: 'Previous', next: 'Next', close: 'Close' }) {
  // post images only: not the PDF viewer's pages (it has its own fullscreen), not images that are links
  const imgs = [...prose.querySelectorAll<HTMLImageElement>('img')].filter((i) => !i.closest('.docs, a'));
  if (!imgs.length) return;

  const dlg = document.createElement('dialog');
  dlg.className = 'proof-dlg';
  dlg.setAttribute('aria-label', labels.open);
  const button = (cls: string, label: string, icon: string) =>
    `<button type="button" class="pd-btn ${cls}" aria-label="${label}">${icon}</button>`;
  dlg.innerHTML = '<figure><img alt=""><figcaption><span class="cap"></span><span class="idx"></span></figcaption></figure>' +
    button('pd-prev', labels.prev, CHEV) + button('pd-next', labels.next, CHEV) + button('pd-close', labels.close, CLOSE);
  document.body.appendChild(dlg);
  const big = dlg.querySelector('img')!;
  const cap = dlg.querySelector('.cap')!;
  const idx = dlg.querySelector('.idx')!;
  dlg.classList.toggle('single', imgs.length < 2);

  let cur = 0;
  function render() {
    const src = imgs[cur];
    big.src = src.currentSrc || src.src;
    big.alt = src.alt;
    cap.textContent = src.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || src.alt;
    idx.textContent = imgs.length > 1 ? `${cur + 1} / ${imgs.length}` : '';
  }
  const step = (d: number) => { cur = (cur + d + imgs.length) % imgs.length; render(); };

  imgs.forEach((img, i) => {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || labels.open} — ${labels.open}`);
    const open = () => { cur = i; render(); dlg.showModal(); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(); } });
  });
  dlg.querySelector('.pd-prev')!.addEventListener('click', () => step(-1));
  dlg.querySelector('.pd-next')!.addEventListener('click', () => step(1));
  dlg.querySelector('.pd-close')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (ev) => { if (ev.target === dlg || ev.target === dlg.querySelector('figure')) dlg.close(); }); // backdrop
  dlg.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft') step(-1);
    if (ev.key === 'ArrowRight') step(1);
  });
}
