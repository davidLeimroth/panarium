import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllRecipes, toIndexEntry } from '../../lib/recipes';
import { LANGS, type Lang } from '../../lib/taxonomy';

export const getStaticPaths = (async () => {
  return LANGS.map((lang) => ({ params: { lang } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const recipes = await getAllRecipes();
  const entries = recipes.map((r) => toIndexEntry(r.data, lang));
  return new Response(JSON.stringify(entries), {
    headers: { 'content-type': 'application/json' },
  });
};
