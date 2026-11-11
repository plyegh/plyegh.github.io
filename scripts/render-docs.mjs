// Copies document attachments next to each post and renders PDF pages to images.
//
//   src/content/posts/<category>/<slug>/review.pdf  →  public/docs/<category>/<slug>/review.pdf
//                                                    →  public/docs/<category>/<slug>/review/p-1.jpg …
//   src/content/posts/<category>/<slug>/review.hwp  →  public/docs/<category>/<slug>/review.hwp (download only)
//
// public/docs/ is generated (gitignored). Runs before `astro dev` / `astro build`.
// Pages are rendered with pdf.js + @napi-rs/canvas (both from npm, no system packages needed).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const SRC = 'src/content/posts';
const OUT = 'public/docs';
const DOC_EXT = new Set(['.pdf', '.hwp', '.hwpx', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.zip']);
const PAGE_WIDTH = 1400; // px; long enough to read body text when zoomed
const QUALITY = 80;

const RENDERER = 'pdfjs-1'; // bump to force re-rendering cached pages
const PDFJS = path.dirname(path.dirname(path.dirname(new URL(import.meta.resolve('pdfjs-dist/legacy/build/pdf.mjs')).pathname)));

async function renderPdf(src, outDir) {
  const pdf = await getDocument({
    data: new Uint8Array(fs.readFileSync(src)),
    cMapUrl: path.join(PDFJS, 'cmaps') + '/',
    cMapPacked: true,
    standardFontDataUrl: path.join(PDFJS, 'standard_fonts') + '/',
    isEvalSupported: false,
    verbosity: 0,
  }).promise;
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: PAGE_WIDTH / page.getViewport({ scale: 1 }).width });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    fs.writeFileSync(path.join(outDir, `p-${n}.jpg`), await canvas.encode('jpeg', QUALITY));
    page.cleanup();
  }
  const pages = pdf.numPages;
  await pdf.destroy();
  return pages;
}

const sha1 = (file) => createHash('sha1').update(fs.readFileSync(file)).digest('hex');
const keep = new Set(); // every path under OUT that should exist after this run
let copied = 0, rendered = 0;

for (const category of fs.existsSync(SRC) ? fs.readdirSync(SRC) : []) {
  const catDir = path.join(SRC, category);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const slug of fs.readdirSync(catDir)) {
    const postDir = path.join(catDir, slug);
    if (!fs.statSync(postDir).isDirectory()) continue;
    for (const name of fs.readdirSync(postDir)) {
      const ext = path.extname(name).toLowerCase();
      if (!DOC_EXT.has(ext)) continue;
      const src = path.join(postDir, name);
      const outDir = path.join(OUT, category, slug);
      const dest = path.join(outDir, name);
      fs.mkdirSync(outDir, { recursive: true });
      keep.add(dest);
      const hash = sha1(src);
      if (!fs.existsSync(dest) || sha1(dest) !== hash) { fs.copyFileSync(src, dest); copied++; }

      if (ext !== '.pdf') continue;
      const pagesDir = path.join(outDir, path.basename(name, ext));
      const metaFile = path.join(pagesDir, 'meta.json');
      keep.add(pagesDir);
      const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null;
      if (meta?.hash === hash && meta?.width === PAGE_WIDTH && meta?.renderer === RENDERER) continue; // up to date
      fs.rmSync(pagesDir, { recursive: true, force: true });
      fs.mkdirSync(pagesDir, { recursive: true });
      const pages = await renderPdf(src, pagesDir);
      fs.writeFileSync(metaFile, JSON.stringify({ hash, width: PAGE_WIDTH, pages, renderer: RENDERER }));
      rendered++;
      console.log(`[docs] ${category}/${slug}/${name}: ${pages} pages`);
    }
  }
}

// drop outputs whose source file was removed
function prune(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (keep.has(p)) continue;
    if (fs.statSync(p).isDirectory() && [...keep].some((k) => k.startsWith(p + path.sep))) prune(p);
    else fs.rmSync(p, { recursive: true, force: true });
  }
}
prune(OUT);
console.log(`[docs] ${keep.size ? `${copied} copied, ${rendered} rendered` : 'no documents'}`);
