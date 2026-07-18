#!/usr/bin/env node
/**
 * Validate every recipe in data/seed/recipes against the canonical zod schema
 * (the same one the site build uses), plus consistency lints the schema can't
 * express. Exits 1 on hard failures.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recipeSchema } from '../app/src/lib/recipeSchema.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'data/seed/recipes');
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

let hard = 0;
let soft = 0;
const stats = { count: 0, countries: new Set(), leavens: {} };

for (const f of files) {
  const path = join(dir, f);
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.log(`✗ ${f}: invalid JSON — ${e.message}`);
    hard++;
    continue;
  }
  const res = recipeSchema.safeParse(raw);
  if (!res.success) {
    hard++;
    const issues = res.error.issues.slice(0, 6);
    console.log(`✗ ${f}:`);
    for (const i of issues) console.log(`    ${i.path.join('.')} — ${i.message}`);
    continue;
  }
  const r = res.data;
  if (r.slug !== basename(f, '.json')) {
    console.log(`✗ ${f}: slug "${r.slug}" ≠ filename`);
    hard++;
    continue;
  }
  // lints (warnings only)
  const flourSum = r.formula.flours.reduce((a, x) => a + x.pct, 0);
  if (Math.abs(flourSum - 100) > 1.5) {
    console.log(`~ ${f}: flours sum to ${flourSum.toFixed(1)}%`);
    soft++;
  }
  const gFlour = r.ingredients
    .filter((i) => i.key?.startsWith('flour:'))
    .reduce((a, i) => a + i.grams, 0);
  const gWater = r.ingredients
    .filter((i) => i.key === 'water')
    .reduce((a, i) => a + i.grams, 0);
  if (gFlour > 0 && gWater > 0) {
    const impliedHydration = (gWater / gFlour) * 100;
    // levain/soaker water hides in other lines, so only flag wild mismatches
    if (impliedHydration > r.formula.hydrationPct + 25) {
      console.log(
        `~ ${f}: plain water/flour = ${impliedHydration.toFixed(0)}% vs formula ${r.formula.hydrationPct}%`,
      );
      soft++;
    }
  }
  const totalG = r.ingredients.reduce((a, i) => a + i.grams, 0);
  const yieldG = r.yield.count * r.yield.pieceGrams;
  if (totalG > 0 && (yieldG > totalG * 1.25 || yieldG < totalG * 0.55)) {
    console.log(`~ ${f}: yield ${yieldG} g vs ingredients ${Math.round(totalG)} g`);
    soft++;
  }
  stats.count++;
  stats.countries.add(r.origin.country);
  stats.leavens[r.leaven] = (stats.leavens[r.leaven] ?? 0) + 1;
}

console.log(
  `\n${stats.count}/${files.length} valid · ${stats.countries.size} countries · leavens: ${JSON.stringify(stats.leavens)} · ${hard} hard failures · ${soft} lints`,
);
process.exit(hard > 0 ? 1 : 0);
