import type { PhysicalLimits, Range } from './bakersMath';
import type { StyleRangeFull } from './builtinScience';
import {
  BUILTIN_DENSITIES,
  BUILTIN_FEASIBILITY,
  BUILTIN_LIMITS,
  BUILTIN_STYLE_RANGES,
} from './builtinScience';
import type { DensityEntry } from './units';

/**
 * Loads researched science data from data/science/*.json when present,
 * falling back to built-ins. import.meta.glob returns {} when nothing
 * matches, so a missing file can never break the build.
 */

const files = import.meta.glob('../data/science/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

function fileByName(name: string): unknown | null {
  for (const [path, mod] of Object.entries(files)) {
    if (path.endsWith(`/${name}`)) return mod.default;
  }
  return null;
}

function isRange(v: unknown): v is { min: number; ideal: number; max: number } {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.min === 'number' && typeof o.ideal === 'number' && typeof o.max === 'number';
}

function validStyleRange(v: unknown): v is StyleRangeFull {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.key === 'string' && isRange(o.hydration) && isRange(o.salt);
}

function validDensity(v: unknown): v is DensityEntry {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.key === 'string' &&
    typeof o.gramsPerCup === 'number' &&
    typeof o.gramsPerTbsp === 'number' &&
    typeof o.gramsPerTsp === 'number'
  );
}

/** Science data is translated per language; `ro` trails the others, so it is optional
 * and callers fall back to English through pick(). */
export type LocalizedSci = { en: string; de: string; es: string; fr: string; ro?: string };

export interface FaultEntry {
  id: string;
  stage: 'mixing' | 'fermentation' | 'shaping' | 'baking' | 'storage';
  fault: LocalizedSci;
  signs?: string[];
  causes: string[];
  fixes: string[];
  article?: string;
}

function validFault(v: unknown): v is FaultEntry {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.stage === 'string' &&
    typeof o.fault === 'object' &&
    Array.isArray(o.causes) &&
    Array.isArray(o.fixes)
  );
}

function mergeByKey<T extends { key: string }>(builtin: T[], loaded: T[]): T[] {
  const map = new Map<string, T>();
  for (const b of builtin) map.set(b.key, b);
  for (const l of loaded) map.set(l.key, l);
  return [...map.values()];
}

const loadedRanges = (() => {
  const raw = fileByName('style-ranges.json');
  return Array.isArray(raw) ? raw.filter(validStyleRange) : [];
})();

const loadedDensities = (() => {
  const raw = fileByName('densities.json');
  return Array.isArray(raw) ? raw.filter(validDensity) : [];
})();

const loadedFaults = (() => {
  const raw = fileByName('faults.json');
  return Array.isArray(raw) ? raw.filter(validFault) : [];
})();

/* ---------------- feasibility (where a bread can still work) ---------------- */

function validFeasRange(v: unknown): v is Range {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.min === 'number' && typeof o.max === 'number';
}

const loadedFeasibility = (() => {
  const raw = fileByName('feasibility.json');
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
})();

/** merge built-in feasibility, then any researched rows, into a key->bounds map */
const feasibilityByKey: Record<string, { feasibleHydration?: Range; feasibleSalt?: Range }> = {
  ...BUILTIN_FEASIBILITY,
};
for (const row of loadedFeasibility) {
  if (typeof row.key !== 'string' || row.key === '_global') continue;
  const entry = feasibilityByKey[row.key] ?? {};
  if (validFeasRange(row.feasibleHydration)) entry.feasibleHydration = row.feasibleHydration;
  if (validFeasRange(row.feasibleSalt)) entry.feasibleSalt = row.feasibleSalt;
  feasibilityByKey[row.key] = entry;
}

/** researched global physical limits, merged over the built-in defaults */
export const LIMITS: PhysicalLimits = (() => {
  const g = loadedFeasibility.find((r) => r.key === '_global') as
    | Record<string, unknown>
    | undefined;
  const num = (k: keyof PhysicalLimits): number =>
    g && typeof g[k] === 'number' ? (g[k] as number) : BUILTIN_LIMITS[k];
  return {
    minWheatDoughHydration: num('minWheatDoughHydration'),
    maxWheatDoughHydration: num('maxWheatDoughHydration'),
    maxSaltPctBeforeStall: num('maxSaltPctBeforeStall'),
    maxSugarPctForNormalYeast: num('maxSugarPctForNormalYeast'),
  };
})();

const mergedRanges = mergeByKey<StyleRangeFull>(
  BUILTIN_STYLE_RANGES,
  loadedRanges as StyleRangeFull[],
);
for (const s of mergedRanges) {
  const f = feasibilityByKey[s.key];
  if (f?.feasibleHydration) s.feasibleHydration = f.feasibleHydration;
  if (f?.feasibleSalt) s.feasibleSalt = f.feasibleSalt;
}

export const STYLE_RANGES: StyleRangeFull[] = mergedRanges;
export const DENSITIES: DensityEntry[] = mergeByKey(BUILTIN_DENSITIES, loadedDensities);
export const FAULTS: FaultEntry[] = loadedFaults;

export function styleByKey(key: string): StyleRangeFull | undefined {
  return STYLE_RANGES.find((s) => s.key === key);
}

/* ---------------- researched math formulas + corpus-derived numbers -------- */

export interface MathFormula {
  id: string;
  name: LocalizedSci;
  category?: string;
  expression: string;
  variables?: Array<{ sym: string; meaning: LocalizedSci }>;
  example?: string;
  sources?: string[];
}

function validMathFormula(v: unknown): v is MathFormula {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.expression === 'string' && typeof o.name === 'object';
}

export const MATH_FORMULAS: MathFormula[] = (() => {
  const raw = fileByName('math-formulas.json');
  return Array.isArray(raw) ? raw.filter(validMathFormula) : [];
})();

/** Empirical relationships mined from the recipe corpus (scripts/derive-formulas.mjs). */
export interface DerivedStat {
  family?: string;
  n: number;
  hydration?: { min: number; median: number; max: number };
  salt?: { median: number };
  bakeTempC?: { median: number };
}
export interface DerivedFormulas {
  generatedFrom: number;
  byFamily: DerivedStat[];
  fits?: Array<{
    id: string;
    label: LocalizedSci;
    expression: string;
    r2?: number;
    n: number;
  }>;
}

export const DERIVED_FORMULAS: DerivedFormulas | null = (() => {
  const raw = fileByName('derived-formulas.json');
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.byFamily)) return null;
  return raw as DerivedFormulas;
})();

/** True when the researched (agent-collected) data is loaded, not just built-ins. */
export const SCIENCE_LOADED = {
  ranges: loadedRanges.length > 0,
  densities: loadedDensities.length > 0,
  faults: loadedFaults.length > 0,
  feasibility: loadedFeasibility.length > 0,
  formulas: MATH_FORMULAS.length > 0,
};
