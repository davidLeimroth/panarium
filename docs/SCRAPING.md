# The Corpus Pipeline, how recipes get into Panarium

## How the seed corpus was built

The initial 180-recipe corpus was researched by **10 parallel research agents**
(8 regional/stylistic "beats" + 2 bread-science agents), each briefed with the
same contract: [data/schema/TAXONOMY.md](../data/schema/TAXONOMY.md) +
[recipe.schema.json](../data/schema/recipe.schema.json) + one gold-standard
example. Beats were partitioned with explicit anchor slugs and exclusion lists
so agents didn't collide:

1. Modern artisan sourdough · 2. DACH · 3. France · 4. Italy/Iberia/Greece ·
5. Enriched & holiday (worldwide) · 6. Flatbreads (worldwide) ·
7. Nordic/Baltic/Eastern Europe · 8. Americas/UK/Asia-Pacific

Per-beat reports (sources, judgment calls, skips, ambiguities) live in
[data/seed/reports/](../data/seed/reports/).

## Rules every entry follows

1. **Real sources only.** Every entry cites `source.url` for a page the
 researcher actually fetched during the session. Fabricating a citation is
 grounds for dropping the entry; failed fetches (403/404/paywall) were
 swapped for fetchable alternates, never invented.
2. **Facts, not prose.** Ingredient lists, quantities, times and temperatures
 are facts and not copyrightable. Method text is a *paraphrased 4–8 step
 summary in our own words*, never copied sentences. Descriptions are our
 own editorial writing.
3. **Attribution outward.** Each recipe page links its source prominently.
 The atlas is an index that points outward, not a replacement for the
 bakers who wrote the originals. `source.adaptation` discloses every
 deviation (recomputed hydration, corrected salt, composite ratios…).
4. **Numbers are recomputed, not trusted.** Agents converted all volumes to
 grams and derived baker's percentages from the ingredients themselves;
 `formula.confidence` records `from-source` vs `estimated`.
5. **Politeness.** No hammering a single site; skip paywalled content; respect
 robots exclusions; nothing is fetched at scale beyond what a human reader
 would load.

## Validation & merge

Everything an agent writes must survive:

- **Schema gate:** `npx tsx scripts/validate-seed.mjs`, zod validation
 (identical to the site's build gate), slug/filename identity, plus lints:
 flour percentages ≈ 100, implied water/flour vs declared hydration,
 yield-vs-ingredient-mass sanity.
- **Build gate:** `astro build` re-validates every file; one bad file fails
 the build with a per-field error.
- **Spot audits:** cross-checked entries against their cited sources; agents
 additionally re-derived formula percentages from ingredient grams during
 the run (several caught and fixed their own math or their sources' errors, e.g. King Arthur's 227 g "cup of water" shortcut, corrected to 237 g).

## Growing the corpus ("scrape the internet", phase 2)

The same contract scales beyond agent sessions:

1. **Candidate discovery**, sitemap/category crawls of recipe sites that
 permit indexing, recipe aggregator APIs where licensed, and structured-data
 harvesting (schema.org/Recipe JSON-LD gives ingredients + times for free).
2. **Extraction**, automated extraction pass converts a fetched page into the recipe schema
 (the agent prompt in this repo is the spec); deterministic post-processing
 recomputes all percentages from grams.
3. **Gate**, the validator + a dedupe pass (slug, trigram name similarity,
 same-source URL) before anything merges.
4. **Ingest**, `backend/cmd/importer` upserts into Postgres;
 `ImportService.UpsertRecipes` does the same over the wire. `import_runs`
 records provenance per batch.
5. **Review queue** (roadmap), low-confidence entries (`estimated`, lint
 warnings, unusual numbers) flagged for human review before publication.

Robots/ToS review happens at step 1 per site; sites that forbid reuse are
indexed as *links only* (name + facets + link, no formula) or skipped.
