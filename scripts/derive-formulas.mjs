#!/usr/bin/env node
/**
 * Extract empirical relationships from the recipe corpus and write
 * data/science/derived-formulas.json. These are mathematical formulas fitted
 * from the breads we actually hold, not hand-set constants: per-family
 * hydration and salt ranges, and least-squares fits (e.g. how hydration rises
 * with wholegrain share, how bake time scales with piece weight).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'data/seed/recipes');
const recipes = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));

const median = (xs) => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
// robust percentile (linear interpolation), so single outliers do not dominate
const pct = (xs, p) => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
};
const round1 = (n) => Math.round(n * 10) / 10;

const wholegrainShare = (r) =>
  (r.formula?.flours ?? [])
    .filter((f) => String(f.type).includes('whole'))
    .reduce((a, f) => a + f.pct, 0);

// least squares y = a + b x, with r^2
function fit(points) {
  const n = points.length;
  if (n < 4) return null;
  const sx = points.reduce((a, [x]) => a + x, 0);
  const sy = points.reduce((a, [, y]) => a + y, 0);
  const mx = sx / n;
  const my = sy / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  const b = sxy / sxx;
  const a = my - b * mx;
  const r2 = (sxy * sxy) / (sxx * syy);
  return {
    a: Number(a.toFixed(1)),
    b: Number(b.toFixed(3)),
    r2: Number(r2.toFixed(2)),
    n,
  };
}

// per-family aggregates
const families = {};
for (const r of recipes) {
  const fam = r.family;
  (families[fam] ??= []).push(r);
}
const byFamily = Object.entries(families)
  .map(([family, rs]) => {
    const hyd = rs.map((r) => r.formula?.hydrationPct).filter((x) => typeof x === 'number');
    const salt = rs.map((r) => r.formula?.saltPct).filter((x) => typeof x === 'number');
    const temp = rs.map((r) => r.bake?.tempC).filter((x) => typeof x === 'number');
    // report a robust 10th / median / 90th percentile band, not raw min/max
    return {
      family,
      n: rs.length,
      hydration: {
        min: Math.round(pct(hyd, 0.1)),
        median: round1(median(hyd)),
        max: Math.round(pct(hyd, 0.9)),
      },
      salt: { median: round1(median(salt)) },
      bakeTempC: { median: Math.round(median(temp)) },
    };
  })
  .sort((a, b) => b.n - a.n);

// fit 1: hydration vs wholegrain share (wheat-family breads, rye excluded)
const hydVsWhole = recipes
  .filter((r) => {
    const rye = (r.formula?.flours ?? [])
      .filter((f) => f.type === 'rye' || f.type === 'rye-whole')
      .reduce((a, f) => a + f.pct, 0);
    return rye < 20 && typeof r.formula?.hydrationPct === 'number';
  })
  .map((r) => [wholegrainShare(r), r.formula.hydrationPct]);
const f1 = fit(hydVsWhole);

// fit 2: bake time vs piece weight (oven-baked lean-ish breads)
const bakeVsWeight = recipes
  .filter((r) => typeof r.time?.bakeMin === 'number' && typeof r.yield?.pieceGrams === 'number' && r.yield.pieceGrams < 2000)
  .map((r) => [r.yield.pieceGrams, r.time.bakeMin]);
const f2 = fit(bakeVsWeight);

// overall salt distribution
const allSalt = recipes.map((r) => r.formula?.saltPct).filter((x) => typeof x === 'number');

const fits = [];
if (f1 && f1.r2 >= 0.05)
  fits.push({
    id: 'hydration-vs-wholegrain',
    label: {
      en: 'Hydration rises with wholegrain share',
      de: 'Hydration steigt mit dem Vollkornanteil',
      es: 'La hidratación sube con la proporción integral',
      fr: 'L’hydratation monte avec la part de complet',
    },
    expression: `hydration% ≈ ${f1.a} + ${f1.b} × wholegrain%`,
    r2: f1.r2,
    n: f1.n,
  });
if (f2 && f2.r2 >= 0.05)
  fits.push({
    id: 'bake-vs-weight',
    label: {
      en: 'Bake time scales with piece weight',
      de: 'Backzeit wächst mit dem Stückgewicht',
      es: 'El tiempo de horno crece con el peso de la pieza',
      fr: 'Le temps de cuisson croît avec le poids de la pièce',
    },
    expression: `bake_min ≈ ${f2.a} + ${f2.b} × piece_g`,
    r2: f2.r2,
    n: f2.n,
  });
fits.push({
  id: 'salt-constant',
  label: {
    en: 'Salt is nearly constant across styles',
    de: 'Salz ist über die Stile fast konstant',
    es: 'La sal es casi constante entre estilos',
    fr: 'Le sel est presque constant selon les styles',
  },
  expression: `salt% ≈ ${round1(median(allSalt))} (median across ${allSalt.length} breads)`,
  n: allSalt.length,
});

const out = { generatedFrom: recipes.length, byFamily, fits };
writeFileSync(join(root, 'data/science/derived-formulas.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `derive-formulas: ${recipes.length} recipes, ${byFamily.length} families, ${fits.length} fits`,
);
for (const f of fits) console.log(`  ${f.expression}${f.r2 !== undefined ? ` (r2=${f.r2}, n=${f.n})` : ''}`);
