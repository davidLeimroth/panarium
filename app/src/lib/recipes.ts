import { type CollectionEntry, getCollection } from 'astro:content';
import { pick } from '../i18n';
import type { Recipe } from './recipeSchema';
import type { RecipeIndexEntry } from './search';
import { GLUTEN_FLOURS, type Lang } from './taxonomy';

export type RecipeEntry = CollectionEntry<'recipes'>;

export async function getAllRecipes(): Promise<RecipeEntry[]> {
  const entries = await getCollection('recipes');
  return entries.sort((a, b) => a.data.name.en.localeCompare(b.data.name.en));
}

export function ryePct(r: Recipe): number {
  return r.formula.flours
    .filter((f) => f.type === 'rye' || f.type === 'rye-whole')
    .reduce((a, f) => a + f.pct, 0);
}

export function wholegrainPct(r: Recipe): number {
  if (r.diet.wholegrainPct !== undefined) return r.diet.wholegrainPct;
  return r.formula.flours.filter((f) => f.type.includes('whole')).reduce((a, f) => a + f.pct, 0);
}

export function isGlutenFree(r: Recipe): boolean {
  if (r.diet.containsGluten) return false;
  return !r.formula.flours.some((f) => GLUTEN_FLOURS.includes(f.type));
}

export function toIndexEntry(r: Recipe, lang: Lang): RecipeIndexEntry {
  const names = [r.name.en, r.name.de, r.name.es, r.name.fr, r.name.native ?? ''];
  const region = r.origin.region;
  // search across every language's region text, not just the displayed one
  const regionAll = region ? [region.en, region.de, region.es, region.fr, region.ro] : [];
  const haystack = [...names, ...r.aliases, ...r.tags, ...regionAll.filter(Boolean)]
    .join(' ')
    .toLowerCase();
  return {
    slug: r.slug,
    name: pick(r.name, lang),
    native: r.name.native,
    desc: pick(r.description, lang),
    country: r.origin.country,
    region: region ? pick(region, lang) : undefined,
    family: r.family,
    leaven: r.leaven,
    hydration: r.formula.hydrationPct,
    salt: r.formula.saltPct,
    wholegrain: wholegrainPct(r),
    rye: ryePct(r),
    totalMin: r.time.totalMin,
    activeMin: r.time.activeMin,
    overnight: r.time.overnight,
    difficulty: r.difficulty,
    crumb: r.crumb,
    crust: r.crust,
    flavors: r.flavors,
    purposes: r.purposes,
    flours: [...new Set(r.formula.flours.map((f) => f.type))],
    vegan: r.diet.vegan,
    glutenFree: isGlutenFree(r),
    keepsDays: r.keeping.freshDays,
    equipment: r.equipment,
    sourced: r.formula.confidence === 'from-source',
    kitchenTested: r.kitchenTested !== undefined,
    searchText: haystack,
  };
}

export interface AtlasStats {
  recipes: number;
  countries: number;
  sourdoughs: number;
  medianHydration: number;
}

export function computeStats(recipes: Recipe[]): AtlasStats {
  const hydrations = recipes.map((r) => r.formula.hydrationPct).sort((a, b) => a - b);
  return {
    recipes: recipes.length,
    countries: new Set(recipes.map((r) => r.origin.country)).size,
    sourdoughs: recipes.filter((r) => r.leaven === 'sourdough' || r.leaven === 'hybrid').length,
    medianHydration: hydrations[Math.floor(hydrations.length / 2)] ?? 0,
  };
}
