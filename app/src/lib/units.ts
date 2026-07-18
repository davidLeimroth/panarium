/** Unit conversion: grams ⇄ oz/lb, grams → US volume via ingredient densities, °C ⇄ °F. */

export type UnitSystem = 'metric' | 'us';

export interface DensityEntry {
  key: string;
  gramsPerCup: number;
  gramsPerTbsp: number;
  gramsPerTsp: number;
  source?: string;
}

const G_PER_OZ = 28.349523125;

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(c: number, sys: UnitSystem): string {
  return sys === 'metric' ? `${Math.round(c)} °C` : `${cToF(c)} °F`;
}

export function formatMass(grams: number, sys: UnitSystem): string {
  if (sys === 'metric') {
    if (grams >= 1000) return `${trimNum(grams / 1000, 2)} kg`;
    return grams < 10 ? `${trimNum(grams, 1)} g` : `${Math.round(grams)} g`;
  }
  const oz = grams / G_PER_OZ;
  if (oz >= 32) return `${trimNum(oz / 16, 2)} lb`;
  if (oz >= 16) {
    const lb = Math.floor(oz / 16);
    const rest = oz - lb * 16;
    return rest < 0.25 ? `${lb} lb` : `${lb} lb ${trimNum(rest, 1)} oz`;
  }
  return `${trimNum(oz, oz < 1 ? 2 : 1)} oz`;
}

function trimNum(n: number, decimals: number): string {
  return Number(n.toFixed(decimals)).toString();
}

/* ---------------- volume ---------------- */

const FRACTIONS: Array<[number, string]> = [
  [0, ''],
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.375, '⅜'],
  [0.5, '½'],
  [0.625, '⅝'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
  [0.875, '⅞'],
  [1, ''],
];

export function formatFraction(x: number): string {
  const whole = Math.floor(x + 1e-9);
  const frac = x - whole;
  let best: [number, string] = [0, ''];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [v, glyph] of FRACTIONS) {
    const d = Math.abs(frac - v);
    if (d < bestDist) {
      bestDist = d;
      best = [v, glyph];
    }
  }
  const [v, glyph] = best;
  const w = v === 1 ? whole + 1 : whole;
  if (w === 0 && glyph === '') return '0';
  if (glyph === '') return String(w);
  return w === 0 ? glyph : `${w} ${glyph}`;
}

export interface VolumeAmount {
  qty: string;
  unit: 'cup' | 'tbsp' | 'tsp';
}

/**
 * Convert grams of an ingredient to a friendly US volume, if a density is known.
 * Flour fallbacks: any unknown `flour:*` key falls back to white wheat density.
 */
export function gramsToVolume(
  ingredientKey: string,
  grams: number,
  densities: DensityEntry[],
): VolumeAmount | null {
  let d = densities.find((e) => e.key === ingredientKey);
  if (!d && ingredientKey.startsWith('flour:')) {
    d = densities.find((e) => e.key === 'flour:wheat-white');
  }
  if (!d || grams <= 0) return null;

  const cups = grams / d.gramsPerCup;
  if (cups >= 0.245) {
    const rounded = Math.round(cups * 8) / 8; // nearest ⅛ cup
    return { qty: formatFraction(rounded), unit: 'cup' };
  }
  const tbsp = grams / d.gramsPerTbsp;
  if (tbsp >= 0.95) {
    const rounded = Math.round(tbsp * 2) / 2;
    return { qty: formatFraction(rounded), unit: 'tbsp' };
  }
  const tsp = grams / d.gramsPerTsp;
  const rounded = Math.round(tsp * 4) / 4;
  if (rounded <= 0) return null;
  return { qty: formatFraction(rounded), unit: 'tsp' };
}

/** Scale every gram amount in a recipe by target/base yield. */
export function scaleFactor(basePieces: number, basePieceG: number, targetTotalG: number): number {
  const base = basePieces * basePieceG;
  return base > 0 ? targetTotalG / base : 1;
}
