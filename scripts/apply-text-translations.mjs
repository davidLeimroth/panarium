#!/usr/bin/env node
/**
 * Merge translated names, descriptions and ingredient labels into the seed recipes.
 *
 * Reads a directory of patch files, each a JSON array of
 *   { slug, name, description, ingredient_labels: [{ idx, ro }] }
 * and writes them into data/seed/recipes/<slug>.json under the given language,
 * leaving every other field untouched. English is never overwritten.
 *
 * Everything is validated before anything is written, so a bad patch fails the
 * whole run instead of leaving the corpus half-translated.
 *
 *   node scripts/apply-text-translations.mjs <patch-dir> <lang> [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const recipeDir = join(root, 'data/seed/recipes');

const [patchDir, lang] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
if (!patchDir || !lang) {
  console.error('usage: node scripts/apply-text-translations.mjs <patch-dir> <lang> [--dry]');
  process.exit(1);
}

const DESC_MAX = 280;
// Romanian takes comma-below, not cedilla; the cedilla forms render wrong.
const CEDILLA = /[şţŞŢ]/;
const EM_DASH = /—/;

const errors = [];
const pending = new Map();
let names = 0;
let descs = 0;
let labels = 0;

const check = (val, where, { max } = {}) => {
  if (typeof val !== 'string' || val.trim() === '') {
    errors.push(`${where}: missing or empty`);
    return false;
  }
  if (max && val.length > max) errors.push(`${where}: ${val.length} chars > ${max}`);
  if (EM_DASH.test(val)) errors.push(`${where}: em dash`);
  if (lang === 'ro' && CEDILLA.test(val)) errors.push(`${where}: cedilla ş/ţ, expected ș/ț`);
  return true;
};

for (const pf of readdirSync(patchDir).filter((f) => f.endsWith('.json')).sort()) {
  let patch;
  try {
    patch = JSON.parse(readFileSync(join(patchDir, pf), 'utf8'));
  } catch (e) {
    errors.push(`${pf}: unparseable (${e.message})`);
    continue;
  }
  for (const entry of patch) {
    const slug = entry?.slug;
    let recipe;
    try {
      recipe = pending.get(slug) ?? JSON.parse(readFileSync(join(recipeDir, `${slug}.json`), 'utf8'));
    } catch {
      errors.push(`${pf}: no recipe file for slug "${slug}"`);
      continue;
    }

    if (check(entry.name, `${slug}.name`)) {
      recipe.name[lang] = entry.name;
      names++;
    }
    if (check(entry.description, `${slug}.description`, { max: DESC_MAX })) {
      recipe.description[lang] = entry.description;
      descs++;
    }

    for (const l of entry.ingredient_labels ?? []) {
      const target = recipe.ingredients?.[l.idx];
      if (!target) {
        errors.push(`${slug}.ingredients[${l.idx}]: index out of range`);
        continue;
      }
      if (!target.label) {
        errors.push(`${slug}.ingredients[${l.idx}]: has no label object to extend`);
        continue;
      }
      if (check(l[lang], `${slug}.ingredients[${l.idx}].label`)) {
        target.label[lang] = l[lang];
        labels++;
      }
    }
    pending.set(slug, recipe);
  }
}

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
  `${dry ? 'would update' : 'updated'} ${pending.size} recipes for "${lang}": ` +
    `${names} names, ${descs} descriptions, ${labels} ingredient labels`,
);
