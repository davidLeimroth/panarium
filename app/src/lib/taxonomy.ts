/** Canonical enums — mirror of data/schema/TAXONOMY.md and recipe.schema.json. */

export const LANGS = ['en', 'de', 'es', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

export const LEAVENS = ['sourdough', 'yeast', 'hybrid', 'chemical', 'none'] as const;
export type Leaven = (typeof LEAVENS)[number];

export const FAMILIES = [
  'hearth-loaf',
  'pan-loaf',
  'baguette',
  'flatbread',
  'roll',
  'braid',
  'ring',
  'crispbread',
  'steamed',
  'fried',
  'quick',
  'sweet-loaf',
] as const;
export type Family = (typeof FAMILIES)[number];

export const FLOURS = [
  'wheat-white',
  'wheat-whole',
  'durum',
  'rye',
  'rye-whole',
  'spelt',
  'spelt-whole',
  'einkorn',
  'emmer',
  'khorasan',
  'barley',
  'oat',
  'corn',
  'rice',
  'buckwheat',
  'teff',
  'millet',
  'sorghum',
  'chickpea',
  'potato',
  'cassava',
  'other',
] as const;
export type Flour = (typeof FLOURS)[number];

/** Flours that contain gluten (for derived gluten-free checks). */
export const GLUTEN_FLOURS: readonly Flour[] = [
  'wheat-white',
  'wheat-whole',
  'durum',
  'rye',
  'rye-whole',
  'spelt',
  'spelt-whole',
  'einkorn',
  'emmer',
  'khorasan',
  'barley',
];

export const CRUMBS = ['open', 'medium', 'tight'] as const;
export type Crumb = (typeof CRUMBS)[number];

export const CRUSTS = ['crackly', 'crisp', 'chewy', 'soft', 'blistered', 'floury'] as const;
export type Crust = (typeof CRUSTS)[number];

export const FLAVORS = [
  'mild',
  'wheaty',
  'yeasty',
  'tangy',
  'sour',
  'sweet',
  'nutty',
  'earthy',
  'buttery',
  'rich',
  'malty',
  'toasty',
  'smoky',
  'herbal',
  'olive',
  'spiced',
  'fruity',
  'chocolate',
  'cheesy',
  'savory',
  'caramel',
  'honeyed',
] as const;
export type Flavor = (typeof FLAVORS)[number];

export const PURPOSES = [
  'everyday',
  'sandwich',
  'toast',
  'table',
  'soup-companion',
  'breakfast',
  'snack',
  'celebration',
  'holiday',
  'street-food',
  'burger',
  'picnic',
  'dessert',
  'side',
] as const;
export type Purpose = (typeof PURPOSES)[number];

export const EQUIPMENT = [
  'dutch-oven',
  'baking-stone',
  'baking-steel',
  'loaf-pan',
  'sheet-pan',
  'skillet',
  'griddle',
  'tandoor',
  'steamer',
  'deep-fryer',
  'banneton',
  'couche',
  'stand-mixer',
  'pullman-pan',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const VESSELS = [
  'dutch-oven',
  'stone',
  'steel',
  'loaf-pan',
  'sheet',
  'skillet',
  'griddle',
  'tandoor',
  'steamer',
  'fryer',
  'pot',
  'none',
] as const;
export type Vessel = (typeof VESSELS)[number];
