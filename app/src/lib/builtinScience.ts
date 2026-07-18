import { DEFAULT_LIMITS, type PhysicalLimits, type Range, type StyleRange } from './bakersMath';
import type { DensityEntry } from './units';

/**
 * Built-in fallback science data. The live values in data/science/*.json
 * (researched + cited by agents) take precedence when present; these keep the
 * calculator and converter fully functional standalone.
 */

export interface StyleRangeFull extends StyleRange {
  label: { en: string; de: string; es: string; fr: string };
  bulkTempC?: { min: number; ideal: number; max: number };
  wholegrainTypicalPct?: number;
  note?: string;
  sources?: string[];
}

/** Outer bounds where a style can still be coaxed to work, wider than ideal. */
export const BUILTIN_FEASIBILITY: Record<
  string,
  { feasibleHydration: Range; feasibleSalt: Range }
> = {
  'country-sourdough': {
    feasibleHydration: { min: 60, max: 95 },
    feasibleSalt: { min: 1.4, max: 2.8 },
  },
  baguette: { feasibleHydration: { min: 58, max: 82 }, feasibleSalt: { min: 1.4, max: 2.6 } },
  ciabatta: { feasibleHydration: { min: 70, max: 100 }, feasibleSalt: { min: 1.5, max: 2.8 } },
  'pan-de-cristal': {
    feasibleHydration: { min: 80, max: 115 },
    feasibleSalt: { min: 1.5, max: 2.8 },
  },
  focaccia: { feasibleHydration: { min: 65, max: 100 }, feasibleSalt: { min: 1.5, max: 3 } },
  'pizza-napoletana': {
    feasibleHydration: { min: 55, max: 72 },
    feasibleSalt: { min: 1.8, max: 3.3 },
  },
  'sandwich-loaf': {
    feasibleHydration: { min: 55, max: 78 },
    feasibleSalt: { min: 1.4, max: 2.6 },
  },
  'whole-wheat': { feasibleHydration: { min: 65, max: 100 }, feasibleSalt: { min: 1.4, max: 2.6 } },
  'rye-mixed': { feasibleHydration: { min: 68, max: 100 }, feasibleSalt: { min: 1.4, max: 2.6 } },
  'rye-100': { feasibleHydration: { min: 70, max: 115 }, feasibleSalt: { min: 1.4, max: 2.6 } },
  brioche: { feasibleHydration: { min: 20, max: 55 }, feasibleSalt: { min: 1.2, max: 2.6 } },
  bagel: { feasibleHydration: { min: 45, max: 62 }, feasibleSalt: { min: 1.4, max: 2.6 } },
};

export const BUILTIN_LIMITS: PhysicalLimits = { ...DEFAULT_LIMITS };

export const BUILTIN_STYLE_RANGES: StyleRangeFull[] = [
  {
    key: 'country-sourdough',
    label: {
      en: 'Country sourdough',
      de: 'Landbrot (Sauerteig)',
      es: 'Hogaza de masa madre',
      fr: 'Pain de campagne au levain',
    },
    hydration: { min: 68, ideal: 75, max: 85 },
    salt: { min: 1.8, ideal: 2, max: 2.3 },
    prefermentedFlourTypical: 10,
    bulkTempC: { min: 22, ideal: 25, max: 28 },
    wholegrainTypicalPct: 15,
  },
  {
    key: 'baguette',
    label: { en: 'Baguette', de: 'Baguette', es: 'Baguette', fr: 'Baguette' },
    hydration: { min: 65, ideal: 70, max: 76 },
    salt: { min: 1.7, ideal: 1.8, max: 2.2 },
    prefermentedFlourTypical: 15,
    yeastPctTypical: 0.4,
  },
  {
    key: 'ciabatta',
    label: { en: 'Ciabatta', de: 'Ciabatta', es: 'Chapata', fr: 'Ciabatta' },
    hydration: { min: 75, ideal: 82, max: 95 },
    salt: { min: 1.8, ideal: 2.1, max: 2.4 },
    prefermentedFlourTypical: 30,
    yeastPctTypical: 0.5,
  },
  {
    key: 'focaccia',
    label: { en: 'Focaccia', de: 'Focaccia', es: 'Focaccia', fr: 'Focaccia' },
    hydration: { min: 70, ideal: 80, max: 90 },
    salt: { min: 1.8, ideal: 2.2, max: 2.5 },
    fatPctTypical: 6,
    yeastPctTypical: 0.7,
  },
  {
    key: 'pizza-napoletana',
    label: {
      en: 'Neapolitan pizza',
      de: 'Neapolitanische Pizza',
      es: 'Pizza napolitana',
      fr: 'Pizza napolitaine',
    },
    hydration: { min: 58, ideal: 62, max: 68 },
    salt: { min: 2.2, ideal: 2.6, max: 3 },
    yeastPctTypical: 0.1,
  },
  {
    key: 'sandwich-loaf',
    label: {
      en: 'Sandwich loaf',
      de: 'Kastenweißbrot',
      es: 'Pan de molde',
      fr: 'Pain de mie',
    },
    hydration: { min: 60, ideal: 65, max: 72 },
    salt: { min: 1.8, ideal: 2, max: 2.2 },
    sugarPctTypical: 5,
    fatPctTypical: 6,
    yeastPctTypical: 1.2,
  },
  {
    key: 'whole-wheat',
    label: {
      en: 'Whole wheat',
      de: 'Weizenvollkornbrot',
      es: 'Pan integral',
      fr: 'Pain complet',
    },
    hydration: { min: 72, ideal: 80, max: 92 },
    salt: { min: 1.8, ideal: 2, max: 2.3 },
    wholegrainTypicalPct: 100,
  },
  {
    key: 'rye-mixed',
    label: {
      en: 'Mixed rye (60–80%)',
      de: 'Roggenmischbrot',
      es: 'Pan de centeno mixto',
      fr: 'Pain de seigle mixte',
    },
    hydration: { min: 75, ideal: 82, max: 90 },
    salt: { min: 1.8, ideal: 2, max: 2.2 },
    prefermentedFlourTypical: 35,
    wholegrainTypicalPct: 40,
  },
  {
    key: 'rye-100',
    label: {
      en: '100% rye',
      de: 'Reines Roggenbrot',
      es: 'Pan de centeno 100%',
      fr: 'Pain de seigle pur',
    },
    hydration: { min: 80, ideal: 90, max: 105 },
    salt: { min: 1.8, ideal: 2, max: 2.2 },
    prefermentedFlourTypical: 40,
    wholegrainTypicalPct: 90,
  },
  {
    key: 'brioche',
    label: { en: 'Brioche', de: 'Brioche', es: 'Brioche', fr: 'Brioche' },
    hydration: { min: 25, ideal: 32, max: 45 },
    salt: { min: 1.8, ideal: 2, max: 2.2 },
    sugarPctTypical: 12,
    fatPctTypical: 50,
    yeastPctTypical: 1.5,
  },
  {
    key: 'bagel',
    label: { en: 'Bagel', de: 'Bagel', es: 'Bagel', fr: 'Bagel' },
    hydration: { min: 50, ideal: 55, max: 60 },
    salt: { min: 1.8, ideal: 2, max: 2.3 },
    sugarPctTypical: 4,
    yeastPctTypical: 0.8,
  },
];

export const BUILTIN_DENSITIES: DensityEntry[] = [
  { key: 'flour:wheat-white', gramsPerCup: 120, gramsPerTbsp: 7.5, gramsPerTsp: 2.5 },
  { key: 'flour:wheat-whole', gramsPerCup: 113, gramsPerTbsp: 7.1, gramsPerTsp: 2.4 },
  { key: 'flour:rye', gramsPerCup: 103, gramsPerTbsp: 6.4, gramsPerTsp: 2.1 },
  { key: 'flour:rye-whole', gramsPerCup: 106, gramsPerTbsp: 6.6, gramsPerTsp: 2.2 },
  { key: 'flour:spelt', gramsPerCup: 99, gramsPerTbsp: 6.2, gramsPerTsp: 2.1 },
  { key: 'flour:durum', gramsPerCup: 163, gramsPerTbsp: 10.2, gramsPerTsp: 3.4 },
  { key: 'water', gramsPerCup: 237, gramsPerTbsp: 14.8, gramsPerTsp: 4.9 },
  { key: 'milk', gramsPerCup: 240, gramsPerTbsp: 15, gramsPerTsp: 5 },
  { key: 'salt', gramsPerCup: 288, gramsPerTbsp: 18, gramsPerTsp: 6 },
  { key: 'sugar', gramsPerCup: 200, gramsPerTbsp: 12.5, gramsPerTsp: 4.2 },
  { key: 'honey', gramsPerCup: 340, gramsPerTbsp: 21, gramsPerTsp: 7 },
  { key: 'butter', gramsPerCup: 227, gramsPerTbsp: 14.2, gramsPerTsp: 4.7 },
  { key: 'olive-oil', gramsPerCup: 216, gramsPerTbsp: 13.5, gramsPerTsp: 4.5 },
  { key: 'instant-yeast', gramsPerCup: 149, gramsPerTbsp: 9.3, gramsPerTsp: 3.1 },
  { key: 'active-dry-yeast', gramsPerCup: 144, gramsPerTbsp: 9, gramsPerTsp: 3 },
  { key: 'rolled-oats', gramsPerCup: 89, gramsPerTbsp: 5.6, gramsPerTsp: 1.9 },
  { key: 'cornmeal', gramsPerCup: 138, gramsPerTbsp: 8.6, gramsPerTsp: 2.9 },
];
