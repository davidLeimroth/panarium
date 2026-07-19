import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { recipeSchema } from './lib/recipeSchema';

const recipes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/recipes' }),
  schema: recipeSchema,
});

const articles = defineCollection({
  // The loader would otherwise take the id from the `slug` frontmatter, and every
  // language uses the same slug, so the five translations of an article collided
  // and only the last one loaded won. Key on the filename instead, which already
  // carries the language: en-fermentation, ro-fermentation.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/school',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
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
