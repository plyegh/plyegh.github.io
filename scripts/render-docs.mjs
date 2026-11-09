// Copies document attachments next to each post and renders PDF pages to images.
//
//   src/content/posts/<category>/<slug>/review.pdf  →  public/docs/<category>/<slug>/review.pdf
//                                                    →  public/docs/<category>/<slug>/review/p-1.jpg …
//   src/content/posts/<category>/<slug>/review.hwp  →  public/docs/<category>/<slug>/review.hwp (download only)
//
// public/docs/ is generated (gitignored). Runs before `astro dev` / `astro build`.
// Needs `pdftoppm` (poppler-utils) for page images; without it PDFs are still copied and linked.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src/content/posts';
const OUT = 'public/docs';
const DOC_EXT = new Set(['.pdf', '.hwp', '.hwpx', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.zip']);
const PAGE_WIDTH = 1400; // px; long enough to read body text when zoomed
const QUALITY = 80;

const hasPoppler = (() => {
  try { execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' }); return true; } catch { return false; }
})();
if (!hasPoppler) console.warn('[docs] pdftoppm not found — PDFs are copied but page images are skipped (install poppler-utils).');

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

      if (ext !== '.pdf' || !hasPoppler) continue;
      const pagesDir = path.join(outDir, path.basename(name, ext));
      const metaFile = path.join(pagesDir, 'meta.json');
      keep.add(pagesDir);
      const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null;
      if (meta?.hash === hash && meta?.width === PAGE_WIDTH) continue; // up to date
      fs.rmSync(pagesDir, { recursive: true, force: true });
      fs.mkdirSync(pagesDir, { recursive: true });
      execFileSync('pdftoppm', ['-jpeg', '-jpegopt', `quality=${QUALITY},optimize=y`, '-scale-to-x', String(PAGE_WIDTH), '-scale-to-y', '-1', src, path.join(pagesDir, 'p')]);
      // pdftoppm pads numbers by page count (p-01, p-001); normalise to p-1.jpg, p-2.jpg …
      const pages = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.jpg'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      pages.forEach((f, i) => fs.renameSync(path.join(pagesDir, f), path.join(pagesDir, `p-${i + 1}.jpg`)));
      fs.writeFileSync(metaFile, JSON.stringify({ hash, width: PAGE_WIDTH, pages: pages.length }));
      rendered++;
      console.log(`[docs] ${category}/${slug}/${name}: ${pages.length} pages`);
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
