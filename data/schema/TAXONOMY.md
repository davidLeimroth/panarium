# Panarium recipe taxonomy — the classification bible

Every recipe JSON must use **exactly** these enum values (lowercase, kebab-case).
The zod validator in the app rejects anything else at build time.

## leaven (single value)
`sourdough` | `yeast` | `hybrid` (sourdough + commercial yeast) | `chemical` (baking powder/soda) | `none`

## family (single value — the physical/structural class)
| value | meaning |
|---|---|
| `hearth-loaf` | free-standing loaf baked on stone/steel/dutch oven (boule, bâtard, miche) |
| `pan-loaf` | baked in a tin/pullman (sandwich loaf, Vollkornbrot) |
| `baguette` | long thin hearth stick (baguette, ficelle, épi) |
| `flatbread` | flat, griddled or flash-baked (pita, naan, tortilla, injera) |
| `roll` | individual small breads (Brötchen, bolillo, bagel, English muffin) |
| `braid` | braided/plaited (challah, Zopf, tsoureki) |
| `ring` | ring/loop shaped (bagel counts as `roll`; use ring for obwarzanek, taralli, rosca) |
| `crispbread` | dry, cracker-like keeper (knäckebröd, grissini, matzo) |
| `steamed` | steamed not baked (mantou, baozi) |
| `fried` | fried breads (msemen counts as flatbread; use fried for puri, frybread) |
| `quick` | chemically leavened batter/dough (cornbread, soda bread) |
| `sweet-loaf` | enriched sweet celebration breads (panettone, babka, stollen) |

## doughType (optional — the physical class of the unbaked mass)
| value | meaning |
|---|---|
| `dough` | kneadable, shapeable mass (default; the overwhelming majority of breads) |
| `batter` | pourable, not shapeable (injera, crumpet, farinata, appam, roti-jala, johnnycake, mofo-gasy, kisra, pikelet) |
| `paste` | mixed not kneaded, high-rye or starch (100% rye panary loaves, cassava-bread) |
| `stiff` | very low hydration, below 50% (bagel, hardtack, pan-candeal, tortillas) |

Omit the field when `dough` is the right label; the build treats a missing
`doughType` as `dough`. Excluded from per-family hydration statistics and from
the fitted relationships in `data/science/derived-formulas.json`.

## kitchenTested (optional, baked by the maintainer)

An optional top-level object that marks a bread the maintainer has **genuinely
baked** himself. Its **presence** is the whole claim: an empty object
`"kitchenTested": {}` simply means "baked", there is no redundant boolean.

```json
"kitchenTested": {
  "date": "2026-07",
  "note": "Needed 10 minutes longer"
}
```

- `date`: optional, `YYYY-MM` or `YYYY-MM-DD`.
- `note`: optional, free text up to 300 characters, what was learned in that bake.

This is a stronger claim than a cited source, and it must only ever be set **by
hand** for a bread that was actually baked. Never infer, generate, or copy this
field from another recipe; the corpus is shipped unmarked until a real bake
happens. To add or remove it, use the keeper script:

```
node scripts/mark-baked.mjs <slug> [--date YYYY-MM] [--note "..."] [--remove]
```

The script edits `data/seed/recipes/<slug>.json` in place, validates the slug
exists, rejects a malformed date, enforces the 300-character note limit, and
prints what it changed.

## flours[].type (multi, with pct summing to 100)
`wheat-white` `wheat-whole` `durum` `rye` `rye-whole` `spelt` `spelt-whole`
`einkorn` `emmer` `khorasan` `barley` `oat` `corn` `rice` `buckwheat` `teff`
`millet` `sorghum` `chickpea` `potato` `cassava` `other`

(Use `wheat-white` for AP/bread/high-gluten/T55/T65/Tipo 00; `rye` for light/medium rye
T997–T1150; `rye-whole` for wholegrain rye T1800/pumpernickel meal.)

## crumb (single)
`open` | `medium` | `tight`

## crust (single)
`crackly` | `crisp` | `chewy` | `soft` | `blistered` | `floury`

## flavors (1–5 values)
`mild` `wheaty` `yeasty` `tangy` `sour` `sweet` `nutty` `earthy` `buttery` `rich`
`malty` `toasty` `smoky` `herbal` `olive` `spiced` `fruity` `chocolate` `cheesy`
`savory` `caramel` `honeyed`

## purposes (1–4 values)
`everyday` `sandwich` `toast` `table` `soup-companion` `breakfast` `snack`
`celebration` `holiday` `street-food` `burger` `picnic` `dessert` `side`

## equipment (0–4 values, only what's essential)
`dutch-oven` `baking-stone` `baking-steel` `loaf-pan` `sheet-pan` `skillet`
`griddle` `tandoor` `steamer` `deep-fryer` `banneton` `couche` `stand-mixer` `pullman-pan`

## bake.vessel (single)
`dutch-oven` | `stone` | `steel` | `loaf-pan` | `sheet` | `skillet` | `griddle` |
`tandoor` | `steamer` | `fryer` | `pot` | `none`

## origin.country
ISO 3166-1 alpha-2, uppercase (`DE`, `FR`, `US`, `ET`, …). Pick the best-known origin;
add `origin.region` (free text) and `origin.note` for contested histories.

## difficulty
Integer 1–5. 1 = first bake ever, 3 = comfortable home baker, 5 = precision/lamination/long multi-day levain work.

## Ingredient keys (use `key` when it fits, else `label` with all 4 languages)
Flours: `flour:wheat-white`, `flour:rye-whole`, … (`flour:` + any flour enum value)
Others: `water` `salt` `instant-yeast` `active-dry-yeast` `fresh-yeast`
`sourdough-starter` `levain` `butter` `sugar` `brown-sugar` `honey` `molasses`
`malt-syrup` `olive-oil` `vegetable-oil` `lard` `milk` `buttermilk` `yogurt`
`egg` `egg-yolk` `sesame-seeds` `poppy-seeds` `sunflower-seeds` `pumpkin-seeds`
`flax-seeds` `rolled-oats` `caraway` `coriander-seed` `fennel-seed` `anise`
`cardamom` `cinnamon` `raisins` `walnuts` `almonds` `candied-citrus` `cheese`
`mashed-potato` `cornmeal` `semolina` `baking-powder` `baking-soda` `vanilla`
`orange-zest` `lemon-zest` `cocoa`

## Baker's math conventions
- All percentages are **baker's percentages**: relative to TOTAL flour = 100%,
  including flour inside levain/preferments/soakers.
- `formula.hydrationPct` = total water (incl. levain water, milk counts ~88% water,
  egg ~75%, butter ~16%) ÷ total flour × 100. For simple breads just water/flour.
- `formula.prefermentedFlourPct` = flour in the levain/preferment ÷ total flour × 100.
- Volume→weight when sources use cups: water 237 g/cup, wheat flour ≈ 125 g/cup,
  rye ≈ 102 g/cup, fine salt ≈ 6 g/tsp, instant yeast ≈ 3 g/tsp, sugar 200 g/cup,
  butter 227 g/cup, milk 240 g/cup, honey 340 g/cup, olive oil 216 g/cup.

## Copyright & attribution rules (non-negotiable)
- Ingredient lists, quantities, temperatures, times = facts. Fine to record.
- Method text must be **paraphrased in your own words**, 4–8 compact steps.
  Never copy sentences or distinctive phrasing from a source.
- Every recipe carries `source.url` of a page you actually fetched. Never invent URLs.
- `description` is your own editorial writing, not the source's marketing copy.
