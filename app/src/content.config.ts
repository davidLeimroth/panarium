import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { recipeSchema } from './lib/recipeSchema';

const recipes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/recipes' }),
  schema: recipeSchema,
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/school' }),
  schema: z.object({
    lang: z.enum(['en', 'de', 'es', 'fr', 'ro']),
    slug: z.string(),
    title: z.string(),
    teaser: z.string(),
    order: z.number(),
    readMinutes: z.number().default(4),
  }),
});

export const collections = { recipes, articles };
