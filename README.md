# Panarium, the living atlas of bread 🍞

**280 breads · 70 countries · 4 languages · every one a formula.**

A multilingual bread atlas where every recipe is structured data, hydration,
leaven, flours, times, keeping, searchable by the questions bakers actually
ask, convertible between grams/cups/°F and en·de·es·fr, and computable in a
baker's-percentage dough lab. Every bread is drawn by a generative "crumb
portrait" derived from its own numbers, and every entry cites the source it
was distilled from.

| | |
|---|---|
| **Atlas** | faceted search: sourdough, time budget, hydration, flavor, origin, purpose, keeping, diet… |
| **Dough Lab** | style presets with researched ranges, formula ledger, DDT water temperature, fermentation forecast |
| **Bread School** | 5 craft articles ×4 languages + a 22-entry fault index, all from cited research |
| **Finder** | five questions → the bread you should bake today, with reasons |

## Run it

```bash
cd app
npm install
npm run dev # http://localhost:4321 (data syncs from ../data automatically)
```

Quality gates:

```bash
npm test # 32 vitest cases on the math core
npm run lint # Biome
npm run build # validates all 280 recipes + builds 1151 pages
npx tsx ../scripts/validate-seed.mjs # schema + math lints + corpus stats
```

## The data

- `data/seed/recipes/*.json`, one bread per file (280), validated against
 `data/schema/recipe.schema.json` / the zod schema in
 `app/src/lib/recipeSchema.ts`. Conventions in `data/schema/TAXONOMY.md`.
- `data/science/*`, researched, cited numeric data (style ranges, ingredient
 densities, fault index) that powers the Lab and converter.
- Corpus built by 10 parallel research agents with mandatory citation +
 paraphrase rules, see `docs/SCRAPING.md` and per-beat reports in
 `data/seed/reports/`.

## Backend (designed, compiling, not required yet)

The site is fully static today. When the corpus outgrows static builds:
ConnectRPC contract in `proto/bread/v1/bread.proto`, Postgres schema in
`backend/migrations/`, Go server + importer in `backend/` (`make generate
build db-migrate import serve`). The seed JSON is protojson-compatible with
the API types by design. Details: `docs/DESIGN.md` §2.

## Docs

- [docs/DESIGN.md](docs/DESIGN.md), product + architecture + data model
- [docs/SCRAPING.md](docs/SCRAPING.md), corpus pipeline, attribution & ethics
- [docs/ROADMAP.md](docs/ROADMAP.md), what's next

## License

- [LICENSE](LICENSE): the source code is MIT.
- [DATA-LICENSE.md](DATA-LICENSE.md): recipe facts are CC BY 4.0, the editorial
  writing is CC BY 4.0, and every entry keeps its `source.url` attribution.
