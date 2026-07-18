# Panarium, Design Document

*The living atlas of bread. A recipe corpus that is data first, prose second, searchable by the questions bakers actually ask, convertible between units and
languages, and computable in a dough calculator that understands what good
bread is.*

---

## 1. Product

Panarium is four rooms under one roof:

| Room | What it does |
|---|---|
| **The Atlas** (`/{lang}/breads/`) | Faceted search over the whole corpus: leaven, family, hydration, time budget, hands-on time, flavor, purpose, origin country, flour, difficulty, keeping time, diet, equipment, free-text search on top. Filter state lives in the URL, so every search is shareable. |
| **The Dough Lab** (`/{lang}/lab/`) | A baker's-percentage calculator. Style presets carry researched hydration/salt/preferment ranges; output is a levain build + final-mix ledger, a composition bar, "doughness" feedback against the style's range, a DDT water-temperature calculator and a fermentation forecast. Formulas serialize into the URL for sharing. |
| **Bread School** (`/{lang}/school/`) | Five multilingual craft articles distilled from cited research, plus a fault index (symptom → causes → fixes) generated from researched data. |
| **The Finder** (`/{lang}/finder/`) | Five questions (time, skill, craving, occasion, equipment) → scored recommendations with human-readable reasons. |

Recommendations appear in two places: the Finder, and "kindred breads" on every
recipe page (weighted attribute similarity: family, leaven, hydration distance,
flavor/purpose overlap, origin, time class).

### The signature: crumb portraits

Every bread is illustrated by a **generative SVG cross-section** computed from
its own data ([crumb.ts](../app/src/lib/crumb.ts)): the silhouette follows its
`family` (boule, bâtard, baguette, flat, ring, tin…), hole count/size follow
`crumb` class and hydration, crumb color follows wholegrain/rye share (and
cocoa), crust color follows bake temperature and enrichment. Seeded by the
slug, so every bread has a stable, unique portrait. The artwork *is* the data.

## 2. Architecture, static-first, backend-ready

**Decision: no server for now.** The corpus (~280 recipes) compiles into a
fully static Astro site: content collections validate every recipe at build
time against a strict zod schema, recipe pages are pre-rendered ×4 languages,
and search/calculator/finder run entirely client-side on a compact JSON index
(≈ tens of KB gzipped). At this scale a database would add operational cost
and subtract nothing.

**The backend exists as a fully specced, compiling design** for the moment the
corpus outgrows static builds (thousands of recipes, user accounts, saved
formulas, server-side search):

- **Contract:** [proto/bread/v1/bread.proto](../proto/bread/v1/bread.proto), `RecipeService` (SearchRecipes, GetRecipe, ListFacets, SimilarRecipes) and
 `ImportService` (UpsertRecipes) over **ConnectRPC** (works with gRPC,
 gRPC-Web and plain JSON/HTTP from the browser via connect-web).
- **Storage:** Postgres ([backend/migrations/0001_init.sql](../backend/migrations/0001_init.sql)).
 The recipe document is canonical JSONB, the *same* shape as the seed files, with generated columns for hot filters (leaven, family, country, hydration,
 times, difficulty, keeps, vegan), GIN jsonb containment for tag facets,
 per-language tsvectors (english/german/spanish/french configs) and pg_trgm
 for fuzzy name lookup.
- **Server:** Go ([backend/cmd/server](../backend/cmd/server)) with pgx; the
 seed JSON is deliberately **protojson-compatible** with `bread.v1.Recipe`,
 so documents unmarshal into API types with zero mapping code.
- **Importer:** [backend/cmd/importer](../backend/cmd/importer) upserts the
 seed corpus idempotently (`make db-migrate` / `make import`).

Migration path: point the Atlas island at `SearchRecipes` instead of the local
index and delete nothing, the filter model in
[search.ts](../app/src/lib/search.ts) mirrors `SearchRecipesRequest` field for
field.

## 3. Data model

One recipe = one JSON file in [data/seed/recipes/](../data/seed/recipes/)
(filename = slug). The schema lives three times, deliberately synchronized:

1. [data/schema/recipe.schema.json](../data/schema/recipe.schema.json), JSON
 Schema; the contract given to research agents.
2. [app/src/lib/recipeSchema.ts](../app/src/lib/recipeSchema.ts), zod; the
 build-time gate (a bad file fails `astro build`) and the source of TS types.
3. [proto/bread/v1/bread.proto](../proto/bread/v1/bread.proto), the wire form.

Key conventions (full reference: [data/schema/TAXONOMY.md](../data/schema/TAXONOMY.md)):

- **Baker's percentages everywhere.** Total flour = 100%, *including* flour
 inside levain/preferments. `hydrationPct` counts levain water; enriched
 doughs count milk×0.88, egg×0.75, butter×0.16.
- **Names and descriptions in all four languages** (en/de/es/fr) plus optional
 native script; ingredients use translatable keys (~70 translated per
 language) with free-form 4-language labels as fallback; taxonomy enums are
 translated once in the UI dictionaries.
- **Attribution is mandatory**: every entry carries `source.url` of a page the
 researcher actually fetched, with an `adaptation` note when the entry
 deviates. Methods are paraphrased summaries (facts are not copyrightable;
 prose is, see [SCRAPING.md](SCRAPING.md)).
- Facets cover the brief: sourdough (`leaven`), preparation time
 (`time.totalMin/activeMin/overnight`), ingredients (`formula.flours`,
 `ingredients`), flavor (`flavors`), keeping time (`keeping.freshDays`),
 hydration, origin country, purpose, difficulty, crumb/crust, diet,
 equipment.

Validation: `npx tsx scripts/validate-seed.mjs` (same zod schema + lints the
schema can't express: flour percentages summing to 100, implied-hydration
cross-checks, yield-vs-ingredient-mass sanity). Currently
**280/280 valid · 70 countries · 0 hard failures**.

## 4. Science data pipeline

Two research agents produced cited numeric data that powers the tools:

- [data/science/style-ranges.json](../data/science/style-ranges.json), 18
 styles with hydration/salt min-ideal-max, typical sugar/fat/preferment/yeast,
 bulk temperatures. Drives Lab presets and doughness feedback.
- [data/science/densities.json](../data/science/densities.json), 35
 ingredient densities (g per cup/tbsp/tsp) anchored to King Arthur, with
 their known water-quirk corrected (water = 237 g/cup, not the chart's 227).
 Drives volume conversion.
- [data/science/faults.json](../data/science/faults.json), 22 faults with
 localized names, signs, causes, fixes. Drives the School fault index.
- [data/science/craft-notes.md](../data/science/craft-notes.md) +
 [formulas.md](../data/science/formulas.md), cited source material behind
 the School articles and the Lab's formulas (DDT ×3/×4 with friction factors,
 yeast conversions 1 : 1.25 : 3, time≈×2 per 8 °C, doneness temperatures).

The app merges these files over built-in fallbacks at build time
([scienceData.ts](../app/src/lib/scienceData.ts)), the site works with zero
science files and upgrades itself when they exist (the Lab shows a
"researched & cited" badge).

## 5. i18n & units

- Manual, fully typed dictionaries ([app/src/i18n/](../app/src/i18n/)):
 `en.ts` defines the shape, `de/es/fr` must conform to `Dict`, so a missing
 key is a type error. ~350 keys each, including all taxonomy labels and
 ingredient names.
- Routing `/{en|de|es|fr}/…`, hreflang alternates on every page, language
 switcher preserves the current path. Root `/` redirects by
 `navigator.language`.
- Country names via `Intl.DisplayNames` (no dictionary needed), numbers via
 `Intl.NumberFormat`.
- Units ([units.ts](../app/src/lib/units.ts)): g/kg ⇄ oz/lb, °C ⇄ °F, and
 per-ingredient volume (cups/tbsp/tsp with unicode fractions) via the
 researched densities. Preference persists in localStorage.
- v1 limitation, by design: recipe *method steps* and School article bodies
 are English-authored except the four-language articles; recipe names,
 descriptions, ingredients, facets and all UI chrome are fully localized.
 (Articles are written natively in all four languages; method-step
 translation is on the roadmap.)

## 6. Design language

"A baker's ledger crossed with a natural-history atlas."

- **Type:** Fraunces (display, SOFT/WONK axes), Source Serif 4 (body), IBM
 Plex Mono (numbers, labels, chips), all self-hosted via Fontsource.
- **Color:** flour-paper surfaces, rye-brown ink, terracotta crust accent,
 olive levain + egg-wash gold as secondaries; true dark mode ("the charred
 loaf") with the same semantics. Chart/viz colors are a six-entity fixed
 palette (flour/water/levain/salt/enrichment/extras) validated for lightness,
 chroma, CVD separation and contrast on both surfaces.
- **Texture & detail:** SVG grain over the paper, ledger tables with dashed
 rules and double-rule totals, wheat-stalk difficulty glyphs, water-drop
 hydration chips, print stylesheet for recipe pages.
- **Motion:** staggered rise on section entries, hover lift on cards; honors
 `prefers-reduced-motion`.

## 7. Quality gates

- `npm test`, 32 vitest cases over the math core (formula computation, mass
 conservation, DDT, yeast conversion, unit formatting, filters, URL round-trip).
- `npm run build`, zod-validates all 180 recipes; fails loudly per file.
- `npm run lint`, Biome (config at repo root).
- `npx tsx scripts/validate-seed.mjs`, schema + cross-checks + corpus stats.
- `cd backend && go build ./... && go vet ./...`.

## 8. File map

```
bread/
├── app/ # Astro + React frontend (static-first)
│ ├── src/lib/ # bakersMath, units, crumb, search, recommend, science
│ ├── src/i18n/ # en/de/es/fr typed dictionaries
│ ├── src/components/ # Astro components + React islands
│ ├── src/content/school/ # multilingual craft articles
│ └── src/pages/[lang]/ # routes ×4 languages
├── data/
│ ├── schema/ # recipe.schema.json, TAXONOMY.md (agent contract)
│ ├── seed/recipes/ # the corpus: one JSON per bread (180)
│ ├── seed/reports/ # research-agent beat reports
│ └── science/ # researched, cited numeric data
├── proto/bread/v1/ # ConnectRPC contract
├── backend/ # Go server, importer, migrations (compiles; not required to run the site)
├── scripts/ # sync-data, validate-seed, seed-stats
└── docs/ # this document, SCRAPING.md, ROADMAP.md
```
