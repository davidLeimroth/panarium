#!/usr/bin/env node
/**
 * Mark a recipe as kitchen-tested, or remove the mark. Edits
 * data/seed/recipes/<slug>.json in place, preserving the two-space formatting
 * and trailing newline the corpus uses. Presence of `kitchenTested` alone means
 * "baked by the maintainer"; date and note are optional extras.
 *
 * Usage:
 *   node scripts/mark-baked.mjs <slug> [--date YYYY-MM|YYYY-MM-DD] [--note "..."] [--remove]
 *
 * Never infer or generate this field: run this only for a bread actually baked.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATE_RE = /^\d{4}-\d{2}(-\d{2})?$/;
const NOTE_MAX = 300;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  console.log(
    `Usage: node scripts/mark-baked.mjs <slug> [--date YYYY-MM|YYYY-MM-DD] [--note "..."] [--remove]`,
  );
}

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

// Format check (mirrors the schema regex) plus a semantic check so impossible
// months/days are rejected even though they match the shape.
function isValidDate(s) {
  if (!DATE_RE.test(s)) return false;
  const parts = s.split('-');
  const month = Number(parts[1]);
  if (month < 1 || month > 12) return false;
  if (parts.length === 3) {
    const day = Number(parts[2]);
    if (day < 1 || day > 31) return false;
  }
  return true;
}

function parseArgs(argv) {
  const out = { slug: null, date: null, note: null, remove: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--remove') out.remove = true;
    else if (a === '--date') out.date = argv[++i];
    else if (a === '--note') out.note = argv[++i];
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    } else if (a.startsWith('--')) {
      fail(`unknown flag ${a}`);
    } else rest.push(a);
  }
  out.slug = rest[0] ?? null;
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.slug) {
  usage();
  fail('missing slug');
}

const file = join(root, 'data/seed/recipes', `${args.slug}.json`);
if (!existsSync(file)) {
  fail(`no recipe for slug "${args.slug}" (looked for ${file})`);
}

if (!args.remove) {
  if (args.date !== null && !isValidDate(args.date)) {
    fail(`--date must be YYYY-MM or YYYY-MM-DD (real calendar values), got "${args.date}"`);
  }
  if (args.note !== null && args.note.length > NOTE_MAX) {
    fail(`--note is ${args.note.length} chars, max is ${NOTE_MAX}`);
  }
}

const raw = readFileSync(file, 'utf8');
let recipe;
try {
  recipe = JSON.parse(raw);
} catch (e) {
  fail(`${file} is not valid JSON: ${e.message}`);
}

const endsWithNewline = raw.endsWith('\n');
const before = recipe.kitchenTested;

if (args.remove) {
  if (before === undefined) {
    console.log(`nothing to do: ${args.slug} is not marked kitchen-tested`);
    process.exit(0);
  }
  delete recipe.kitchenTested;
  const out = `${JSON.stringify(recipe, null, 2)}\n`;
  writeFileSync(file, out.endsWith('\n') ? out : `${out}\n`);
  console.log(`removed kitchenTested from ${args.slug}`);
  process.exit(0);
}

const next = {};
if (args.date) next.date = args.date;
if (args.note) next.note = args.note;
recipe.kitchenTested = next;

const serialized = JSON.stringify(recipe, null, 2);
const out = endsWithNewline ? `${serialized}\n` : serialized;
writeFileSync(file, out);

console.log(`marked ${args.slug} as kitchen-tested:`);
console.log(`  kitchenTested = ${JSON.stringify(next)}`);
if (before !== undefined) {
  console.log(`  (was ${JSON.stringify(before)})`);
}
