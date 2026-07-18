#!/usr/bin/env node
/**
 * Snapshot the canonical data/ tree into app/src/data so Astro's content layer
 * and Vite globs (which stay inside the project root) can read it.
 * Runs automatically via the app's pre-dev/pre-build hooks.
 */
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  { from: join(root, 'data/seed/recipes'), to: join(root, 'app/src/data/recipes'), ext: '.json' },
  { from: join(root, 'data/science'), to: join(root, 'app/src/data/science'), ext: '.json' },
];

let total = 0;
for (const t of targets) {
  rmSync(t.to, { recursive: true, force: true });
  mkdirSync(t.to, { recursive: true });
  let files = [];
  try {
    files = readdirSync(t.from).filter((f) => f.endsWith(t.ext));
  } catch {
    continue;
  }
  for (const f of files) {
    cpSync(join(t.from, f), join(t.to, f));
    total++;
  }
  console.log(`synced ${files.length} ${t.ext} files → ${t.to.replace(root, '.')}`);
}
console.log(`sync-data: ${total} files`);
