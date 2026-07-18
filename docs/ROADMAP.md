# Roadmap

## Soon (still static)

- **Method-step translation**, the one localization gap: recipe `method[]`
 and a few free-text fields (region names, notes) are English-authored.
 Pipeline: batch-translate automatically into `method.{en,de,es,fr}`, schema v2.
- **Full-corpus dedupe/merge pass**, a few near-duplicates by design
 (e.g. two milk-bread traditions); decide merge vs. cross-link.
- **Formula linter v2**, reconcile declared hydration with per-ingredient
 water fractions (milk/egg/butter) instead of plain water only; tighten the
 DACH "preferment water" pattern flagged in the beat report.
- **Pagefind or MiniSearch** for fuzzy text search once the corpus passes ~500.
- **OG images**, render each bread's crumb portrait to a social card at build.
- **Saved formulas**, localStorage "my doughs" shelf in the Lab.
- **Bread of the day**, deterministic daily feature on home.

## When the backend turns on

- Point the Atlas at `RecipeService.SearchRecipes` (the filter model already
 mirrors the request message); keep the static index as offline fallback.
- Accounts + saved formulas/collections (new proto services).
- **Scrape-at-scale pipeline** per docs/SCRAPING.md §phase-2, with the review
 queue and provenance ledger.
- Collaborative signals: "I baked this" counts, per-bread notes → better
 recommendations (co-bake matrix on top of attribute similarity).
- Nutrition estimation per 100 g from ingredient lines.

## Content wishlist (from beat reports)

- Gaps the agents explicitly left: gâche vendéenne, épi, craquelin picard,
 Salzstangerl, Franzbrötchen, Kletzenbrot, Basler Brot, bammy, yufka,
 näkkileipä, lompe, Belarusian daily rye, khachapuri/kubaneh/manakish
 (need a "filled/stuffed" family decision), dosa (crepe-or-bread decision).
- Fault index → link faults ↔ School articles ↔ Lab feedback codes.
- A "compare two breads" view (the data model makes this nearly free).
