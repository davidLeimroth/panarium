import type { Flour } from './taxonomy';

/**
 * Baker's math engine. All percentages are baker's percentages:
 * total flour (including flour inside the levain) = 100%.
 */

export type LeavenMode = 'levain' | 'yeast' | 'hybrid' | 'none';
export type YeastType = 'instant' | 'active-dry' | 'fresh';

export interface BlendPart {
  type: Flour;
  pct: number;
}

export interface ExtraPart {
  /** free id, e.g. 'sunflower-seeds' */
  id: string;
  pct: number;
  /** fraction of its weight that behaves as water (milk 0.88, egg 0.75, butter 0.16) */
  waterFraction: number;
}

export interface DoughSpec {
  pieces: number;
  pieceWeightG: number;
  hydrationPct: number;
  saltPct: number;
  mode: LeavenMode;
  /** levain weight as % of total flour (levain & hybrid modes) */
  levainPct: number;
  /** hydration of the levain itself */
  levainHydrationPct: number;
  yeastType: YeastType;
  /** yeast as % of total flour, in the chosen yeast type's own weight */
  yeastPct: number;
  sugarPct: number;
  fatPct: number;
  flourBlend: BlendPart[];
  extras: ExtraPart[];
}

export interface FormulaLine {
  id: string;
  grams: number;
  bakerPct: number;
  group: 'flour' | 'liquid' | 'leaven' | 'seasoning' | 'enrichment' | 'extra';
}

export interface FormulaResult {
  totalDoughG: number;
  totalFlourG: number;
  totalWaterG: number;
  levain: { weightG: number; flourG: number; waterG: number; hydrationPct: number } | null;
  prefermentedFlourPct: number;
  /** hydration counting water carried by liquid-ish extras (milk, egg, butter…) */
  effectiveHydrationPct: number;
  /** the full formula: every flour at its total percentage, levain listed as builder info */
  totals: FormulaLine[];
  /** what you actually add at mix time (levain deducted from flour & water) */
  finalMix: FormulaLine[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const roundG = (n: number) => (n >= 100 ? Math.round(n) : round1(n));

export function normalizeBlend(blend: BlendPart[]): BlendPart[] {
  const sum = blend.reduce((a, b) => a + b.pct, 0);
  if (sum <= 0) return [{ type: 'wheat-white', pct: 100 }];
  return blend.map((b) => ({ type: b.type, pct: (b.pct / sum) * 100 }));
}

export function computeFormula(spec: DoughSpec): FormulaResult {
  const blend = normalizeBlend(spec.flourBlend);
  const useLevain = (spec.mode === 'levain' || spec.mode === 'hybrid') && spec.levainPct > 0;
  const useYeast = (spec.mode === 'yeast' || spec.mode === 'hybrid') && spec.yeastPct > 0;

  const extrasSum = spec.extras.reduce((a, e) => a + e.pct, 0);
  const pctSum =
    100 +
    spec.hydrationPct +
    spec.saltPct +
    spec.sugarPct +
    spec.fatPct +
    extrasSum +
    (useYeast ? spec.yeastPct : 0);

  const totalDoughG = spec.pieces * spec.pieceWeightG;
  const F = (totalDoughG * 100) / pctSum;
  const totalWaterG = (F * spec.hydrationPct) / 100;

  let levain: FormulaResult['levain'] = null;
  if (useLevain) {
    const weightG = (F * spec.levainPct) / 100;
    const flourG = weightG / (1 + spec.levainHydrationPct / 100);
    levain = {
      weightG,
      flourG,
      waterG: weightG - flourG,
      hydrationPct: spec.levainHydrationPct,
    };
  }

  const levainFlourG = levain?.flourG ?? 0;
  const levainWaterG = levain?.waterG ?? 0;
  const prefermentedFlourPct = (levainFlourG / F) * 100;

  const extraWaterG = spec.extras.reduce((a, e) => a + ((F * e.pct) / 100) * e.waterFraction, 0);
  const effectiveHydrationPct = ((totalWaterG + extraWaterG) / F) * 100;

  const totals: FormulaLine[] = [];
  const finalMix: FormulaLine[] = [];

  for (const part of blend) {
    const grams = (F * part.pct) / 100;
    totals.push({ id: `flour:${part.type}`, grams, bakerPct: part.pct, group: 'flour' });
    // levain flour is deducted proportionally across the blend
    const finalG = grams - levainFlourG * (part.pct / 100);
    finalMix.push({
      id: `flour:${part.type}`,
      grams: Math.max(0, finalG),
      bakerPct: (Math.max(0, finalG) / F) * 100,
      group: 'flour',
    });
  }

  totals.push({ id: 'water', grams: totalWaterG, bakerPct: spec.hydrationPct, group: 'liquid' });
  finalMix.push({
    id: 'water',
    grams: Math.max(0, totalWaterG - levainWaterG),
    bakerPct: ((totalWaterG - levainWaterG) / F) * 100,
    group: 'liquid',
  });

  if (levain) {
    finalMix.push({
      id: 'levain',
      grams: levain.weightG,
      bakerPct: spec.levainPct,
      group: 'leaven',
    });
  }
  if (useYeast) {
    const grams = (F * spec.yeastPct) / 100;
    const line: FormulaLine = {
      id: `yeast:${spec.yeastType}`,
      grams,
      bakerPct: spec.yeastPct,
      group: 'leaven',
    };
    totals.push(line);
    finalMix.push(line);
  }

  const salt: FormulaLine = {
    id: 'salt',
    grams: (F * spec.saltPct) / 100,
    bakerPct: spec.saltPct,
    group: 'seasoning',
  };
  totals.push(salt);
  finalMix.push(salt);

  if (spec.sugarPct > 0) {
    const line: FormulaLine = {
      id: 'sugar',
      grams: (F * spec.sugarPct) / 100,
      bakerPct: spec.sugarPct,
      group: 'enrichment',
    };
    totals.push(line);
    finalMix.push(line);
  }
  if (spec.fatPct > 0) {
    const line: FormulaLine = {
      id: 'fat',
      grams: (F * spec.fatPct) / 100,
      bakerPct: spec.fatPct,
      group: 'enrichment',
    };
    totals.push(line);
    finalMix.push(line);
  }
  for (const e of spec.extras) {
    const line: FormulaLine = {
      id: e.id,
      grams: (F * e.pct) / 100,
      bakerPct: e.pct,
      group: 'extra',
    };
    totals.push(line);
    finalMix.push(line);
  }

  const roundLines = (lines: FormulaLine[]) =>
    lines.map((l) => ({ ...l, grams: roundG(l.grams), bakerPct: round1(l.bakerPct) }));

  return {
    totalDoughG: Math.round(totalDoughG),
    totalFlourG: Math.round(F),
    totalWaterG: Math.round(totalWaterG),
    levain: levain
      ? {
          weightG: Math.round(levain.weightG),
          flourG: Math.round(levain.flourG),
          waterG: Math.round(levain.waterG),
          hydrationPct: levain.hydrationPct,
        }
      : null,
    prefermentedFlourPct: round1(prefermentedFlourPct),
    effectiveHydrationPct: round1(effectiveHydrationPct),
    totals: roundLines(totals),
    finalMix: roundLines(finalMix),
  };
}

/** Inverse: given available flour, how much dough does the spec yield? */
export function doughFromFlour(spec: DoughSpec, flourG: number): number {
  const extrasSum = spec.extras.reduce((a, e) => a + e.pct, 0);
  const useYeast = (spec.mode === 'yeast' || spec.mode === 'hybrid') && spec.yeastPct > 0;
  const pctSum =
    100 +
    spec.hydrationPct +
    spec.saltPct +
    spec.sugarPct +
    spec.fatPct +
    extrasSum +
    (useYeast ? spec.yeastPct : 0);
  return (flourG * pctSum) / 100;
}

/* ------------------------------------------------------------------ */
/* Desired dough temperature                                           */
/* ------------------------------------------------------------------ */

export interface DdtInput {
  ddtC: number;
  roomC: number;
  flourC: number;
  frictionC: number;
  prefermentC?: number;
}

/** Classic DDT: water temp = DDT × n − (room + flour + friction [+ preferment]) */
export function waterTempForDdt(input: DdtInput): number {
  const n = input.prefermentC === undefined ? 3 : 4;
  const sum = input.roomC + input.flourC + input.frictionC + (input.prefermentC ?? 0);
  return round1(input.ddtC * n - sum);
}

/* ------------------------------------------------------------------ */
/* Yeast conversions                                                   */
/* ------------------------------------------------------------------ */

const TO_INSTANT: Record<YeastType, number> = {
  instant: 1,
  'active-dry': 1 / 1.25,
  fresh: 1 / 3,
};

export function convertYeast(grams: number, from: YeastType, to: YeastType): number {
  const instant = grams * TO_INSTANT[from];
  return round1(instant / TO_INSTANT[to]);
}

/* ------------------------------------------------------------------ */
/* Fermentation timeline (rule-of-thumb, labeled as estimate in UI)    */
/* ------------------------------------------------------------------ */

export interface TimelineEstimate {
  bulkHours: number;
  proofHours: number;
}

/**
 * Rough guide: levain bulk ≈ 5 h at 24 °C with 20% levain; yeast bulk ≈ 2.5 h
 * at 24 °C with 1% instant. Time roughly doubles per 8 °C drop.
 */
export function estimateTimeline(
  mode: LeavenMode,
  tempC: number,
  inoculationPct: number,
): TimelineEstimate {
  const tempFactor = 2 ** ((24 - tempC) / 8);
  if (mode === 'none') return { bulkHours: 0, proofHours: 0 };
  let base: number;
  let inoc: number;
  if (mode === 'yeast') {
    base = 2.5;
    inoc = clamp((1 / Math.max(0.05, inoculationPct)) ** 0.6, 0.4, 3);
  } else {
    base = 5;
    inoc = clamp((20 / Math.max(2, inoculationPct)) ** 0.6, 0.4, 3);
  }
  const bulk = base * tempFactor * inoc;
  const proof = bulk * (mode === 'yeast' ? 0.5 : 0.75);
  return { bulkHours: round1(clamp(bulk, 0.5, 48)), proofHours: round1(clamp(proof, 0.3, 24)) };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/* ------------------------------------------------------------------ */
/* Doughness feedback                                                  */
/* ------------------------------------------------------------------ */

export interface Range {
  min: number;
  max: number;
}

export interface StyleRange {
  key: string;
  /** the window a baker aims for */
  hydration: { min: number; ideal: number; max: number };
  salt: { min: number; ideal: number; max: number };
  /** outer bounds where the style can still be made to work; wider than ideal */
  feasibleHydration?: Range;
  feasibleSalt?: Range;
  sugarPctTypical?: number;
  fatPctTypical?: number;
  prefermentedFlourTypical?: number;
  yeastPctTypical?: number;
}

/** Universal physical limits, independent of style. Overridable by researched data. */
export interface PhysicalLimits {
  /** below this a wheat dough will not hydrate into a coherent mass */
  minWheatDoughHydration: number;
  /** above this a wheat dough behaves like a pourable batter, not a dough */
  maxWheatDoughHydration: number;
  /** above this, salt osmotically stalls the yeast */
  maxSaltPctBeforeStall: number;
  /** above this, sugar slows ordinary yeast enough to need osmotolerant yeast */
  maxSugarPctForNormalYeast: number;
}

export const DEFAULT_LIMITS: PhysicalLimits = {
  minWheatDoughHydration: 50,
  maxWheatDoughHydration: 100,
  maxSaltPctBeforeStall: 3.5,
  maxSugarPctForNormalYeast: 12,
};

export interface Feedback {
  level: 'good' | 'note' | 'warn';
  code: string;
  params?: Record<string, string | number>;
}

export function assessSpec(
  spec: DoughSpec,
  style?: StyleRange,
  limits: PhysicalLimits = DEFAULT_LIMITS,
): Feedback[] {
  const out: Feedback[] = [];
  const blend = normalizeBlend(spec.flourBlend);
  const ryePct = blend
    .filter((b) => b.type === 'rye' || b.type === 'rye-whole')
    .reduce((a, b) => a + b.pct, 0);
  const wholePct = blend
    .filter((b) => b.type.includes('whole') || b.type === 'rye-whole')
    .reduce((a, b) => a + b.pct, 0);
  const enriched = spec.sugarPct + spec.fatPct;

  if (style) {
    const h = spec.hydrationPct;
    const fh = style.feasibleHydration;
    if (h >= style.hydration.min && h <= style.hydration.max) {
      out.push({
        level: 'good',
        code: 'hydration-in-style',
        params: { ideal: style.hydration.ideal },
      });
    } else if (fh && h > fh.max) {
      out.push({ level: 'warn', code: 'hydration-unfeasible-high', params: { max: fh.max } });
    } else if (fh && h < fh.min) {
      out.push({ level: 'warn', code: 'hydration-unfeasible-low', params: { min: fh.min } });
    } else if (h > style.hydration.max) {
      out.push(
        fh
          ? { level: 'note', code: 'hydration-workable', params: { ideal: style.hydration.ideal } }
          : {
              level: 'warn',
              code: 'hydration-high-for-style',
              params: { max: style.hydration.max },
            },
      );
    } else {
      out.push(
        fh
          ? { level: 'note', code: 'hydration-workable', params: { ideal: style.hydration.ideal } }
          : {
              level: 'warn',
              code: 'hydration-low-for-style',
              params: { min: style.hydration.min },
            },
      );
    }
    const s = spec.saltPct;
    const fs = style.feasibleSalt;
    if (fs && s > fs.max)
      out.push({ level: 'warn', code: 'salt-unfeasible', params: { max: fs.max } });
    else if (s < style.salt.min)
      out.push({ level: 'warn', code: 'salt-low', params: { min: style.salt.min } });
    else if (s > style.salt.max)
      out.push({ level: 'warn', code: 'salt-high', params: { max: style.salt.max } });
    else out.push({ level: 'good', code: 'salt-in-style', params: { ideal: style.salt.ideal } });
  } else {
    if (spec.saltPct < 1.2) out.push({ level: 'warn', code: 'salt-low', params: { min: 1.8 } });
    if (spec.saltPct > 2.6) out.push({ level: 'warn', code: 'salt-high', params: { max: 2.2 } });
  }

  // universal physical feasibility, independent of style
  if (ryePct < 30 && enriched < 8) {
    if (spec.hydrationPct > limits.maxWheatDoughHydration)
      out.push({
        level: 'warn',
        code: 'wheat-batter',
        params: { max: limits.maxWheatDoughHydration },
      });
    else if (spec.hydrationPct < limits.minWheatDoughHydration)
      out.push({
        level: 'warn',
        code: 'too-dry',
        params: { min: limits.minWheatDoughHydration },
      });
  }
  if (spec.saltPct > limits.maxSaltPctBeforeStall)
    out.push({
      level: 'warn',
      code: 'salt-stall',
      params: { max: limits.maxSaltPctBeforeStall },
    });

  if (spec.sugarPct > limits.maxSugarPctForNormalYeast && spec.mode !== 'none')
    out.push({ level: 'note', code: 'sugar-osmotic' });
  if (spec.fatPct > 20) out.push({ level: 'note', code: 'fat-rich-crumb' });
  if (ryePct > 40) out.push({ level: 'note', code: 'rye-paste' });
  if (wholePct > 30 && spec.hydrationPct < 70)
    out.push({ level: 'note', code: 'wholegrain-thirsty' });
  if (spec.hydrationPct > 90 && spec.hydrationPct <= limits.maxWheatDoughHydration && ryePct < 30)
    out.push({ level: 'note', code: 'very-slack-dough' });
  if ((spec.mode === 'levain' || spec.mode === 'hybrid') && spec.levainPct === 0)
    out.push({ level: 'warn', code: 'levain-zero' });
  if (spec.mode === 'levain' && spec.levainPct > 40)
    out.push({ level: 'note', code: 'levain-fast', params: { pct: spec.levainPct } });
  return out;
}
