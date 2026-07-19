#!/usr/bin/env node
/**
 * Merge translated method steps into the seed recipes.
 *
 * Reads a directory of patch files, each a JSON array of
 *   { slug, steps: [ { i, title: {de,es,fr,ro}, summary: {de,es,fr,ro} } ] }
 * and writes the translations into data/seed/recipes/<slug>.json, leaving every
 * other field untouched. English is never overwritten.
 *
 * Everything is validated before anything is written, so a bad patch fails the
 * whole run instead of leaving the corpus half-translated.
 *
 *   node scripts/apply-method-translations.mjs <patch-dir> [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const recipeDir = join(root, 'data/seed/recipes');

const patchDir = process.argv[2];
const dry = process.argv.includes('--dry');
if (!patchDir) {
  console.error('usage: node scripts/apply-method-translations.mjs <patch-dir> [--dry]');
  process.exit(1);
}

const LANGS = ['de', 'es', 'fr', 'ro'];
const LIMITS = { title: 60, summary: 300 };
// Romanian takes comma-below, not cedilla. The cedilla forms render wrong and
// are the usual sign of a bad keyboard map or a lazy transliteration.
const CEDILLA = /[şţŞŢ]/;
const EM_DASH = /—/;
const numbersOf = (s) => (s.match(/\d+/g) ?? []).sort().join(',');

const errors = [];
const warnings = [];
const pending = new Map(); // slug -> recipe object

const patchFiles = readdirSync(patchDir)
  .filter((f) => f.endsWith('.json'))
  .sort();
if (patchFiles.length === 0) {
  console.error(`no .json patches in ${patchDir}`);
  process.exit(1);
}

let stepsSeen = 0;
for (const pf of patchFiles) {
  let patch;
  try {
    patch = JSON.parse(readFileSync(join(patchDir, pf), 'utf8'));
  } catch (e) {
    errors.push(`${pf}: unparseable (${e.message})`);
    continue;
  }
  if (!Array.isArray(patch)) {
    errors.push(`${pf}: expected an array`);
    continue;
  }

  for (const entry of patch) {
    const { slug, steps } = entry ?? {};
    if (!slug || !Array.isArray(steps)) {
      errors.push(`${pf}: entry missing slug or steps`);
      continue;
    }
    const file = join(recipeDir, `${slug}.json`);
    let recipe;
    try {
      recipe = pending.get(slug) ?? JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      errors.push(`${pf}: no recipe file for slug "${slug}"`);
      continue;
    }
    if (steps.length !== recipe.method.length) {
      errors.push(
        `${slug}: patch has ${steps.length} steps, recipe has ${recipe.method.length}`,
      );
      continue;
    }

    for (const s of steps) {
      const target = recipe.method[s.i];
      if (!target) {
        errors.push(`${slug}: step index ${s.i} out of range`);
        continue;
      }
      stepsSeen++;
      for (const field of ['title', 'summary']) {
        const src = target[field].en;
        for (const lang of LANGS) {
          const val = s[field]?.[lang];
          if (typeof val !== 'string' || val.trim() === '') {
            errors.push(`${slug}[${s.i}].${field}.${lang}: missing`);
            continue;
          }
          if (val.length > LIMITS[field]) {
            errors.push(
              `${slug}[${s.i}].${field}.${lang}: ${val.length} chars > ${LIMITS[field]}`,
            );
          }
          if (EM_DASH.test(val)) errors.push(`${slug}[${s.i}].${field}.${lang}: em dash`);
          if (lang === 'ro' && CEDILLA.test(val)) {
            errors.push(`${slug}[${s.i}].${field}.${lang}: cedilla ş/ţ, expected ș/ț`);
          }
          // Dropped temperatures and times are the failure that actually ruins a
          // bake, so compare the digits rather than trusting the prose.
          if (numbersOf(val) !== numbersOf(src)) {
            warnings.push(
              `${slug}[${s.i}].${field}.${lang}: numbers differ (en "${numbersOf(src)}" vs "${numbersOf(val)}")`,
            );
          }
          target[field][lang] = val;
        }
      }
    }
    pending.set(slug, recipe);
  }
}

for (const w of warnings.slice(0, 25)) console.log(`~ ${w}`);
if (warnings.length > 25) console.log(`~ ...and ${warnings.length - 25} more number warnings`);
for (const e of errors.slice(0, 40)) console.error(`✗ ${e}`);
if (errors.length > 40) console.error(`✗ ...and ${errors.length - 40} more errors`);

if (errors.length > 0) {
  console.error(`\n${errors.length} errors, nothing written.`);
  process.exit(1);
}

if (!dry) {
  for (const [slug, recipe] of pending) {
    writeFileSync(join(recipeDir, `${slug}.json`), `${JSON.stringify(recipe, null, 2)}\n`);
  }
}

console.log(
  `\n${dry ? 'would update' : 'updated'} ${pending.size} recipes, ${stepsSeen} steps, ` +
    `${LANGS.length} languages${warnings.length ? `, ${warnings.length} number warnings` : ''}`,
);
