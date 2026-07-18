import { z } from 'astro/zod';
import {
  CRUMBS,
  CRUSTS,
  EQUIPMENT,
  FAMILIES,
  FLAVORS,
  FLOURS,
  LEAVENS,
  PURPOSES,
  VESSELS,
} from './taxonomy';

const localized = z.object({
  en: z.string(),
  de: z.string(),
  es: z.string(),
  fr: z.string(),
});

const localizedName = localized.extend({ native: z.string().optional() });

const stepTitle = z
  .object({
    en: z.string().max(60),
    de: z.string().max(60).optional(),
    es: z.string().max(60).optional(),
    fr: z.string().max(60).optional(),
  })
  .strict();

const stepSummary = z
  .object({
    en: z.string().max(300),
    de: z.string().max(300).optional(),
    es: z.string().max(300).optional(),
    fr: z.string().max(300).optional(),
  })
  .strict();

export const recipeSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: localizedName,
    aliases: z.array(z.string()).max(8).default([]),
    description: localized,
    origin: z.object({
      country: z.string().regex(/^[A-Z]{2}$/),
      region: z.string().optional(),
      note: z.string().max(300).optional(),
    }),
    leaven: z.enum(LEAVENS),
    family: z.enum(FAMILIES),
    doughType: z.enum(['dough', 'batter', 'paste', 'stiff']).optional(),
    formula: z.object({
      hydrationPct: z.number().min(0).max(400),
      saltPct: z.number().min(0).max(8),
      sugarPct: z.number().min(0).optional(),
      fatPct: z.number().min(0).optional(),
      prefermentedFlourPct: z.number().min(0).max(100).optional(),
      yeastPct: z.number().min(0).optional(),
      flours: z.array(z.object({ type: z.enum(FLOURS), pct: z.number().min(0).max(100) })).min(1),
      confidence: z.enum(['from-source', 'estimated']).optional(),
    }),
    ingredients: z
      .array(
        z.object({
          key: z.string().optional(),
          label: localized.optional(),
          grams: z.number().min(0),
          note: z.string().max(120).optional(),
        }),
      )
      .min(2),
    yield: z.object({
      count: z.number().int().min(1),
      pieceGrams: z.number().min(10),
      shape: z.string().max(60).optional(),
    }),
    time: z.object({
      totalMin: z.number().min(5),
      activeMin: z.number().min(2),
      bulkMin: z.number().optional(),
      proofMin: z.number().optional(),
      bakeMin: z.number().min(1),
      overnight: z.boolean().default(false),
    }),
    bake: z.object({
      tempC: z.number().min(60).max(500),
      steam: z.boolean().default(false),
      vessel: z.enum(VESSELS),
    }),
    difficulty: z.number().int().min(1).max(5),
    crumb: z.enum(CRUMBS),
    crust: z.enum(CRUSTS),
    flavors: z.array(z.enum(FLAVORS)).min(1).max(5),
    purposes: z.array(z.enum(PURPOSES)).min(1).max(4),
    diet: z.object({
      vegan: z.boolean(),
      vegetarian: z.boolean(),
      containsGluten: z.boolean(),
      containsDairy: z.boolean().optional(),
      containsEgg: z.boolean().optional(),
      wholegrainPct: z.number().min(0).max(100).optional(),
    }),
    keeping: z.object({
      freshDays: z.number().min(0.25),
      freezes: z.boolean().optional(),
      note: z.string().max(200).optional(),
    }),
    equipment: z.array(z.enum(EQUIPMENT)).max(4).default([]),
    method: z
      .array(z.object({ title: stepTitle, summary: stepSummary }))
      .min(3)
      .max(9),
    source: z.object({
      url: z.string().url(),
      site: z.string(),
      author: z.string().optional(),
      license: z.string().optional(),
      retrieved: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      adaptation: z.string().max(200).optional(),
    }),
    tags: z.array(z.string()).max(6).default([]),
  })
  .strict();

export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeIngredient = Recipe['ingredients'][number];
