#!/usr/bin/env node
// npm run new — creates src/content/posts/<category>/<slug>/index.md with front matter filled in.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';

const CATEGORIES = ['dev', 'ctf-wargame', 'bug-bounty', 'blog-docs', 'paper-conf', 'contest-cert'];

const rl = createInterface({ input: stdin });
const lines = rl[Symbol.asyncIterator]();
const ask = async (q, check, hint) => {
  for (;;) {
    stdout.write(q);
    const { value, done } = await lines.next();
    if (done) { console.error('\ncancelled'); process.exit(1); }
    const a = value.trim();
    if (check(a)) return a;
    console.log(`  ✗ ${hint}`);
  }
};

console.log('\nCategories:');
CATEGORIES.forEach((c, i) => console.log(`  ${i + 1}) ${c}`));
const n = await ask('Category number: ', (a) => /^[1-6]$/.test(a), 'enter 1–6');
const category = CATEGORIES[Number(n) - 1];
const slug = await ask('Slug (english, e.g. pwnable-kr-fd): ', (a) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(a), 'lowercase letters, numbers and dashes only');
const title = await ask('Title: ', (a) => a.length > 0, 'title is required');
rl.close();

const dir = `src/content/posts/${category}/${slug}`;
if (existsSync(dir)) {
  console.error(`\n✗ ${dir} already exists`);
  process.exit(1);
}

// today in KST, with offset, so the date never slips a day
const kst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 19) + '+09:00';

mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/index.md`, `---
title: ${JSON.stringify(title)}
date: ${kst}
tags: []
description: ""
draft: true
---

Write here. Put images in this folder and link them as \`![alt](./image.png)\`.

> [!TIP]
> Callouts: [!NOTE], [!TIP], [!WARNING], [!DANGER]
`);

console.log(`\n✓ created ${dir}/index.md`);
console.log('  preview: npm run dev  →  set draft: false when it is ready, then commit & push');
