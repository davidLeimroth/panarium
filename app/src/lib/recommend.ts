import type { RecipeIndexEntry } from './search';

/** Weighted attribute similarity between two breads. */
export function similarity(a: RecipeIndexEntry, b: RecipeIndexEntry): number {
  let s = 0;
  if (a.family === b.family) s += 2;
  if (a.leaven === b.leaven) s += 1.5;
  s += 1.5 * (1 - Math.min(Math.abs(a.hydration - b.hydration), 30) / 30);
  s += 1.2 * jaccard(a.flavors, b.flavors);
  s += 0.8 * jaccard(a.purposes, b.purposes);
  if (a.country === b.country) s += 1;
  s += 0.5 * (1 - Math.min(Math.abs(a.wholegrain - b.wholegrain), 100) / 100);
  s += 0.4 * (1 - Math.min(Math.abs(timeClass(a) - timeClass(b)), 4) / 4);
  s += 0.3 * (1 - Math.abs(a.difficulty - b.difficulty) / 4);
  return s;
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setB = new Set(b);
  const inter = a.filter((x) => setB.has(x)).length;
  return inter / (a.length + b.length - inter);
}

function timeClass(e: RecipeIndexEntry): number {
  if (e.totalMin <= 120) return 0;
  if (e.totalMin <= 240) return 1;
  if (e.totalMin <= 480) return 2;
  if (e.totalMin <= 1440) return 3;
  return 4;
}

export function topSimilar(
  target: RecipeIndexEntry,
  all: RecipeIndexEntry[],
  n = 4,
): RecipeIndexEntry[] {
  return all
    .filter((e) => e.slug !== target.slug)
    .map((e) => ({ e, s: similarity(target, e) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, n)
    .map((x) => x.e);
}

/* ---------------- Bread Finder quiz ---------------- */

export interface FinderAnswers {
  time: '2h' | 'today' | 'overnight' | 'project';
  skill: 1 | 2 | 3;
  flavor: 'mild' | 'hearty' | 'tangy' | 'sweet';
  goal: 'everyday' | 'dinner' | 'celebration' | 'breakfast' | 'snack';
  kit: 'none' | 'basic' | 'full';
}

export interface FinderMatch {
  entry: RecipeIndexEntry;
  score: number;
  reasons: string[];
}

const FLAVOR_MAP: Record<FinderAnswers['flavor'], string[]> = {
  mild: ['mild', 'wheaty', 'buttery', 'yeasty'],
  hearty: ['earthy', 'nutty', 'malty', 'toasty', 'savory', 'smoky'],
  tangy: ['tangy', 'sour', 'fermented'],
  sweet: ['sweet', 'honeyed', 'fruity', 'caramel', 'chocolate', 'spiced'],
};

const GOAL_MAP: Record<FinderAnswers['goal'], string[]> = {
  everyday: ['everyday', 'sandwich', 'toast'],
  dinner: ['table', 'soup-companion', 'side'],
  celebration: ['celebration', 'holiday'],
  breakfast: ['breakfast'],
  snack: ['snack', 'street-food', 'picnic'],
};

const TIME_LIMIT: Record<FinderAnswers['time'], number> = {
  '2h': 150,
  today: 600,
  overnight: 1600,
  project: 100000,
};

const SPECIAL_KIT = new Set([
  'dutch-oven',
  'baking-stone',
  'baking-steel',
  'tandoor',
  'steamer',
  'deep-fryer',
  'banneton',
  'couche',
  'stand-mixer',
  'pullman-pan',
]);

export function findBreads(all: RecipeIndexEntry[], a: FinderAnswers, n = 6): FinderMatch[] {
  const maxDifficulty = a.skill === 1 ? 2 : a.skill === 2 ? 3 : 5;
  const matches: FinderMatch[] = [];

  for (const e of all) {
    if (e.totalMin > TIME_LIMIT[a.time]) continue;
    if (e.difficulty > maxDifficulty) continue;
    if (a.kit === 'none' && e.equipment.some((eq) => SPECIAL_KIT.has(eq))) continue;

    let score = 0;
    const reasons: string[] = [];

    const flavorHits = e.flavors.filter((f) => FLAVOR_MAP[a.flavor].includes(f)).length;
    if (flavorHits > 0) {
      score += 2.5 * flavorHits;
      reasons.push('flavor');
    }
    const goalHits = e.purposes.filter((p) => GOAL_MAP[a.goal].includes(p)).length;
    if (goalHits > 0) {
      score += 3 * goalHits;
      reasons.push('goal');
    }
    if (e.totalMin <= TIME_LIMIT[a.time] * 0.6) {
      score += 1;
      reasons.push('time');
    }
    if (e.difficulty < maxDifficulty) {
      score += 0.8;
      if (e.difficulty <= 2) reasons.push('easy');
    }
    if (e.keepsDays >= 4) {
      score += 0.5;
      reasons.push('keeps');
    }
    if (a.time === 'project' && e.totalMin > 1440) {
      score += 1.5;
      reasons.push('project');
    }

    if (score > 0) matches.push({ entry: e, score, reasons: reasons.slice(0, 3) });
  }

  return matches.sort((x, y) => y.score - x.score).slice(0, n);
}
