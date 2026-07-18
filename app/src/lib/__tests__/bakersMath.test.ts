import { describe, expect, it } from 'vitest';
import {
  assessSpec,
  computeFormula,
  convertYeast,
  type DoughSpec,
  doughFromFlour,
  estimateTimeline,
  waterTempForDdt,
} from '../bakersMath';

const baseSpec: DoughSpec = {
  pieces: 2,
  pieceWeightG: 900,
  hydrationPct: 75,
  saltPct: 2,
  mode: 'levain',
  levainPct: 20,
  levainHydrationPct: 100,
  yeastType: 'instant',
  yeastPct: 0,
  sugarPct: 0,
  fatPct: 0,
  flourBlend: [
    { type: 'wheat-white', pct: 90 },
    { type: 'wheat-whole', pct: 10 },
  ],
  extras: [],
};

describe('computeFormula', () => {
  it('computes the classic 75% country loaf', () => {
    const r = computeFormula(baseSpec);
    // 1800 g dough / 1.77 = 1016.9 g flour
    expect(r.totalFlourG).toBe(1017);
    expect(r.totalWaterG).toBe(763);
    expect(r.levain?.weightG).toBe(203);
    // 100% hydration levain: half flour, half water
    expect(r.levain?.flourG).toBe(102);
    expect(r.prefermentedFlourPct).toBeCloseTo(10, 0);
    // final water = total − levain water
    const water = r.finalMix.find((l) => l.id === 'water');
    expect(water && Math.round(water.grams)).toBe(763 - 102);
  });

  it('conserves mass: final mix sums to total dough', () => {
    const r = computeFormula(baseSpec);
    const sum = r.finalMix.reduce((a, l) => a + l.grams, 0);
    expect(sum).toBeGreaterThan(r.totalDoughG * 0.995);
    expect(sum).toBeLessThan(r.totalDoughG * 1.005);
  });

  it('handles yeast mode with enrichment', () => {
    const r = computeFormula({
      ...baseSpec,
      mode: 'yeast',
      yeastPct: 1,
      sugarPct: 8,
      fatPct: 10,
      hydrationPct: 62,
    });
    expect(r.levain).toBeNull();
    const yeast = r.finalMix.find((l) => l.id === 'yeast:instant');
    expect(yeast?.bakerPct).toBe(1);
    const sum = r.finalMix.reduce((a, l) => a + l.grams, 0);
    expect(Math.abs(sum - r.totalDoughG)).toBeLessThan(r.totalDoughG * 0.005);
  });

  it('computes effective hydration with milky extras', () => {
    const r = computeFormula({
      ...baseSpec,
      mode: 'yeast',
      yeastPct: 1,
      levainPct: 0,
      hydrationPct: 30,
      extras: [{ id: 'milk', pct: 40, waterFraction: 0.88 }],
    });
    expect(r.effectiveHydrationPct).toBeCloseTo(30 + 40 * 0.88, 1);
  });

  it('inverse flour calculation round-trips', () => {
    const dough = doughFromFlour(baseSpec, 1000);
    expect(dough).toBeCloseTo(1770, 0);
  });
});

describe('waterTempForDdt', () => {
  it('uses factor 3 without preferment', () => {
    // 3×25 − (21 + 22 + 2) = 30
    expect(waterTempForDdt({ ddtC: 25, roomC: 21, flourC: 22, frictionC: 2 })).toBe(30);
  });
  it('uses factor 4 with preferment', () => {
    // 4×25 − (21 + 22 + 2 + 24) = 31
    expect(
      waterTempForDdt({ ddtC: 25, roomC: 21, flourC: 22, frictionC: 2, prefermentC: 24 }),
    ).toBe(31);
  });
});

describe('convertYeast', () => {
  it('converts instant to fresh at 3×', () => {
    expect(convertYeast(5, 'instant', 'fresh')).toBe(15);
  });
  it('converts fresh to instant at ÷3', () => {
    expect(convertYeast(15, 'fresh', 'instant')).toBe(5);
  });
  it('converts instant to active dry at 1.25×', () => {
    expect(convertYeast(4, 'instant', 'active-dry')).toBe(5);
  });
});

describe('estimateTimeline', () => {
  it('slows fermentation when colder', () => {
    const warm = estimateTimeline('levain', 26, 20);
    const cold = estimateTimeline('levain', 18, 20);
    expect(cold.bulkHours).toBeGreaterThan(warm.bulkHours);
  });
  it('doubles roughly per 8°C drop', () => {
    const a = estimateTimeline('yeast', 24, 1);
    const b = estimateTimeline('yeast', 16, 1);
    expect(b.bulkHours / a.bulkHours).toBeCloseTo(2, 1);
  });
});

describe('assessSpec', () => {
  it('flags hydration outside style range', () => {
    const fb = assessSpec(
      { ...baseSpec, hydrationPct: 55 },
      {
        key: 'ciabatta',
        hydration: { min: 75, ideal: 82, max: 95 },
        salt: { min: 1.8, ideal: 2.1, max: 2.4 },
      },
    );
    expect(fb.some((f) => f.code === 'hydration-low-for-style' && f.level === 'warn')).toBe(true);
  });
  it('praises in-range values', () => {
    const fb = assessSpec(baseSpec, {
      key: 'country-sourdough',
      hydration: { min: 68, ideal: 75, max: 85 },
      salt: { min: 1.8, ideal: 2, max: 2.3 },
    });
    expect(fb.some((f) => f.code === 'hydration-in-style' && f.level === 'good')).toBe(true);
    expect(fb.some((f) => f.code === 'salt-in-style')).toBe(true);
  });
  it('notes thirsty wholegrain doughs', () => {
    const fb = assessSpec({
      ...baseSpec,
      hydrationPct: 62,
      flourBlend: [
        { type: 'wheat-whole', pct: 60 },
        { type: 'wheat-white', pct: 40 },
      ],
    });
    expect(fb.some((f) => f.code === 'wholegrain-thirsty')).toBe(true);
  });

  it('warns that very wet wheat dough is a batter, not a dough', () => {
    const fb = assessSpec({
      ...baseSpec,
      hydrationPct: 110,
      flourBlend: [{ type: 'wheat-white', pct: 100 }],
    });
    expect(fb.some((f) => f.code === 'wheat-batter' && f.level === 'warn')).toBe(true);
  });

  it('warns when salt is high enough to stall fermentation', () => {
    const fb = assessSpec({ ...baseSpec, saltPct: 4 });
    expect(fb.some((f) => f.code === 'salt-stall' && f.level === 'warn')).toBe(true);
  });

  it('flags hydration beyond a style feasible ceiling', () => {
    const fb = assessSpec(
      { ...baseSpec, hydrationPct: 99 },
      {
        key: 'bagel',
        hydration: { min: 50, ideal: 55, max: 60 },
        salt: { min: 1.8, ideal: 2, max: 2.3 },
        feasibleHydration: { min: 45, max: 62 },
        feasibleSalt: { min: 1.4, max: 2.6 },
      },
    );
    expect(fb.some((f) => f.code === 'hydration-unfeasible-high' && f.level === 'warn')).toBe(true);
  });

  it('treats outside-ideal-but-feasible as a note, not a warning', () => {
    const fb = assessSpec(
      { ...baseSpec, hydrationPct: 88 },
      {
        key: 'country-sourdough',
        hydration: { min: 68, ideal: 75, max: 85 },
        salt: { min: 1.8, ideal: 2, max: 2.3 },
        feasibleHydration: { min: 60, max: 95 },
        feasibleSalt: { min: 1.4, max: 2.8 },
      },
    );
    expect(fb.some((f) => f.code === 'hydration-workable' && f.level === 'note')).toBe(true);
    expect(fb.some((f) => f.code === 'hydration-unfeasible-high')).toBe(false);
  });
});
