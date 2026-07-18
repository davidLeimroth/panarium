import type { Crumb, Crust, Family, Flavor, Flour, Leaven, Purpose } from './taxonomy';

/** Compact per-recipe entry shipped to the search island. */
export interface RecipeIndexEntry {
  slug: string;
  name: string;
  native?: string;
  desc: string;
  country: string;
  region?: string;
  family: Family;
  leaven: Leaven;
  hydration: number;
  salt: number;
  wholegrain: number;
  rye: number;
  totalMin: number;
  activeMin: number;
  overnight: boolean;
  difficulty: number;
  crumb: Crumb;
  crust: Crust;
  flavors: Flavor[];
  purposes: Purpose[];
  flours: Flour[];
  vegan: boolean;
  glutenFree: boolean;
  keepsDays: number;
  equipment: string[];
  sourced: boolean;
  /** lowercase haystack: all names + aliases + tags */
  searchText: string;
}

export type HydrationBucket = 'dry' | 'moderate' | 'high' | 'very-high';
export type ReadyIn = '2h' | '4h' | '8h' | '24h' | '3d';

export const READY_IN_MINUTES: Record<ReadyIn, number> = {
  '2h': 120,
  '4h': 240,
  '8h': 480,
  '24h': 1440,
  '3d': 4320,
};

export function hydrationBucket(h: number): HydrationBucket {
  if (h < 60) return 'dry';
  if (h < 70) return 'moderate';
  if (h < 80) return 'high';
  return 'very-high';
}

export interface SearchFilters {
  q: string;
  leavens: Leaven[];
  families: Family[];
  flavors: Flavor[];
  purposes: Purpose[];
  countries: string[];
  flours: Flour[];
  hydration: HydrationBucket[];
  readyIn: ReadyIn | null;
  activeUnder: 30 | 60 | null;
  difficultyMax: number | null;
  keepsAtLeast: number | null;
  vegan: boolean;
  glutenFree: boolean;
  wholegrain: boolean;
  noSpecialKit: boolean;
  sourcedOnly: boolean;
}

export const EMPTY_FILTERS: SearchFilters = {
  q: '',
  leavens: [],
  families: [],
  flavors: [],
  purposes: [],
  countries: [],
  flours: [],
  hydration: [],
  readyIn: null,
  activeUnder: null,
  difficultyMax: null,
  keepsAtLeast: null,
  vegan: false,
  glutenFree: false,
  wholegrain: false,
  noSpecialKit: false,
  sourcedOnly: false,
};

const BASIC_KIT = new Set(['loaf-pan', 'sheet-pan', 'skillet', 'griddle']);

function matchesGroup<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

function matchesAny<T>(selected: T[], values: T[]): boolean {
  return selected.length === 0 || values.some((v) => selected.includes(v));
}

export function matches(e: RecipeIndexEntry, f: SearchFilters): boolean {
  if (f.q) {
    const q = f.q.toLowerCase().trim();
    if (q && !e.searchText.includes(q)) return false;
  }
  if (!matchesGroup(f.leavens, e.leaven)) return false;
  if (!matchesGroup(f.families, e.family)) return false;
  if (!matchesAny(f.flavors, e.flavors)) return false;
  if (!matchesAny(f.purposes, e.purposes)) return false;
  if (!matchesGroup(f.countries, e.country)) return false;
  if (!matchesAny(f.flours, e.flours)) return false;
  if (f.hydration.length > 0 && !f.hydration.includes(hydrationBucket(e.hydration))) return false;
  if (f.readyIn && e.totalMin > READY_IN_MINUTES[f.readyIn]) return false;
  if (f.activeUnder && e.activeMin > f.activeUnder) return false;
  if (f.difficultyMax && e.difficulty > f.difficultyMax) return false;
  if (f.keepsAtLeast && e.keepsDays < f.keepsAtLeast) return false;
  if (f.vegan && !e.vegan) return false;
  if (f.glutenFree && !e.glutenFree) return false;
  if (f.wholegrain && e.wholegrain < 50) return false;
  if (f.noSpecialKit && e.equipment.some((eq) => !BASIC_KIT.has(eq))) return false;
  if (f.sourcedOnly && !e.sourced) return false;
  return true;
}

export function applyFilters(entries: RecipeIndexEntry[], f: SearchFilters): RecipeIndexEntry[] {
  return entries.filter((e) => matches(e, f));
}

export type SortKey =
  | 'name'
  | 'time'
  | 'active'
  | 'hydration-desc'
  | 'hydration-asc'
  | 'keeps'
  | 'difficulty';

export function sortEntries(entries: RecipeIndexEntry[], key: SortKey): RecipeIndexEntry[] {
  const s = [...entries];
  const by = {
    name: (a: RecipeIndexEntry, b: RecipeIndexEntry) => a.name.localeCompare(b.name),
    time: (a: RecipeIndexEntry, b: RecipeIndexEntry) => a.totalMin - b.totalMin,
    active: (a: RecipeIndexEntry, b: RecipeIndexEntry) => a.activeMin - b.activeMin,
    'hydration-desc': (a: RecipeIndexEntry, b: RecipeIndexEntry) => b.hydration - a.hydration,
    'hydration-asc': (a: RecipeIndexEntry, b: RecipeIndexEntry) => a.hydration - b.hydration,
    keeps: (a: RecipeIndexEntry, b: RecipeIndexEntry) => b.keepsDays - a.keepsDays,
    difficulty: (a: RecipeIndexEntry, b: RecipeIndexEntry) => a.difficulty - b.difficulty,
  }[key];
  return s.sort(by);
}

/** How many results each candidate facet value would yield, ignoring its own dimension. */
export function facetCounts<T extends string>(
  entries: RecipeIndexEntry[],
  f: SearchFilters,
  dim: keyof SearchFilters,
  values: readonly T[],
  getter: (e: RecipeIndexEntry) => T | T[],
): Record<string, number> {
  const relaxed: SearchFilters = { ...f, [dim]: [] };
  const pool = applyFilters(entries, relaxed);
  const counts: Record<string, number> = {};
  for (const v of values) counts[v] = 0;
  for (const e of pool) {
    const got = getter(e);
    const arr = Array.isArray(got) ? got : [got];
    for (const v of arr) if (v in counts) counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

/* ---------------- URL state ---------------- */

export function filtersToParams(f: SearchFilters, sort: SortKey): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  const setList = (k: string, v: string[]) => {
    if (v.length) p.set(k, v.join(','));
  };
  setList('leaven', f.leavens);
  setList('family', f.families);
  setList('flavor', f.flavors);
  setList('purpose', f.purposes);
  setList('country', f.countries);
  setList('flour', f.flours);
  setList('hydration', f.hydration);
  if (f.readyIn) p.set('ready', f.readyIn);
  if (f.activeUnder) p.set('active', String(f.activeUnder));
  if (f.difficultyMax) p.set('difficulty', String(f.difficultyMax));
  if (f.keepsAtLeast) p.set('keeps', String(f.keepsAtLeast));
  if (f.vegan) p.set('vegan', '1');
  if (f.glutenFree) p.set('gf', '1');
  if (f.wholegrain) p.set('wholegrain', '1');
  if (f.noSpecialKit) p.set('nokit', '1');
  if (f.sourcedOnly) p.set('sourced', '1');
  if (sort !== 'name') p.set('sort', sort);
  return p;
}

export function paramsToFilters(p: URLSearchParams): { filters: SearchFilters; sort: SortKey } {
  const list = (k: string) => (p.get(k) ? (p.get(k) as string).split(',') : []);
  const filters: SearchFilters = {
    ...EMPTY_FILTERS,
    q: p.get('q') ?? '',
    leavens: list('leaven') as Leaven[],
    families: list('family') as Family[],
    flavors: list('flavor') as Flavor[],
    purposes: list('purpose') as Purpose[],
    countries: list('country'),
    flours: list('flour') as Flour[],
    hydration: list('hydration') as HydrationBucket[],
    readyIn: (p.get('ready') as ReadyIn) || null,
    activeUnder: p.get('active') === '30' ? 30 : p.get('active') === '60' ? 60 : null,
    difficultyMax: p.get('difficulty') ? Number(p.get('difficulty')) : null,
    keepsAtLeast: p.get('keeps') ? Number(p.get('keeps')) : null,
    vegan: p.get('vegan') === '1',
    glutenFree: p.get('gf') === '1',
    wholegrain: p.get('wholegrain') === '1',
    noSpecialKit: p.get('nokit') === '1',
    sourcedOnly: p.get('sourced') === '1',
  };
  const sort = (p.get('sort') as SortKey) || 'name';
  return { filters, sort };
}
