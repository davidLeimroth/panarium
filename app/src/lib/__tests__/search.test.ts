import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  EMPTY_FILTERS,
  filtersToParams,
  hydrationBucket,
  paramsToFilters,
  type RecipeIndexEntry,
  sortEntries,
} from '../search';

const mk = (over: Partial<RecipeIndexEntry>): RecipeIndexEntry => ({
  slug: 'x',
  name: 'X',
  desc: '',
  country: 'DE',
  family: 'hearth-loaf',
  leaven: 'sourdough',
  hydration: 75,
  salt: 2,
  wholegrain: 10,
  rye: 0,
  totalMin: 1200,
  activeMin: 40,
  overnight: true,
  difficulty: 3,
  crumb: 'open',
  crust: 'crackly',
  flavors: ['tangy'],
  purposes: ['everyday'],
  flours: ['wheat-white'],
  vegan: true,
  glutenFree: false,
  keepsDays: 3,
  equipment: ['dutch-oven'],
  searchText: 'x',
  ...over,
});

const entries: RecipeIndexEntry[] = [
  mk({ slug: 'a', name: 'Alpha', hydration: 85, totalMin: 90, leaven: 'yeast', country: 'FR' }),
  mk({ slug: 'b', name: 'Beta', hydration: 58, keepsDays: 7, flavors: ['sour', 'earthy'] }),
  mk({ slug: 'c', name: 'Gamma', family: 'flatbread', equipment: [], activeMin: 20 }),
];

describe('applyFilters', () => {
  it('filters by leaven', () => {
    const r = applyFilters(entries, { ...EMPTY_FILTERS, leavens: ['sourdough'] });
    expect(r.map((e) => e.slug)).toEqual(['b', 'c']);
  });
  it('filters by ready-in threshold', () => {
    const r = applyFilters(entries, { ...EMPTY_FILTERS, readyIn: '2h' });
    expect(r.map((e) => e.slug)).toEqual(['a']);
  });
  it('filters by keeps-at-least', () => {
    const r = applyFilters(entries, { ...EMPTY_FILTERS, keepsAtLeast: 4 });
    expect(r.map((e) => e.slug)).toEqual(['b']);
  });
  it('filters by no-special-kit', () => {
    const r = applyFilters(entries, { ...EMPTY_FILTERS, noSpecialKit: true });
    expect(r.map((e) => e.slug)).toEqual(['c']);
  });
  it('combines facets with AND', () => {
    const r = applyFilters(entries, {
      ...EMPTY_FILTERS,
      leavens: ['sourdough'],
      flavors: ['earthy'],
    });
    expect(r.map((e) => e.slug)).toEqual(['b']);
  });
});

describe('hydrationBucket', () => {
  it('buckets hydration', () => {
    expect(hydrationBucket(55)).toBe('dry');
    expect(hydrationBucket(65)).toBe('moderate');
    expect(hydrationBucket(75)).toBe('high');
    expect(hydrationBucket(90)).toBe('very-high');
  });
});

describe('sortEntries', () => {
  it('sorts by hydration descending', () => {
    expect(sortEntries(entries, 'hydration-desc')[0]?.slug).toBe('a');
  });
  it('sorts by total time', () => {
    expect(sortEntries(entries, 'time')[0]?.slug).toBe('a');
  });
});

describe('URL round-trip', () => {
  it('serializes and restores filters', () => {
    const f = {
      ...EMPTY_FILTERS,
      q: 'rye',
      leavens: ['sourdough' as const],
      readyIn: '8h' as const,
      vegan: true,
      difficultyMax: 3,
    };
    const params = filtersToParams(f, 'keeps');
    const { filters, sort } = paramsToFilters(params);
    expect(filters).toEqual(f);
    expect(sort).toBe('keeps');
  });
});
