# Panarium feasibility science references

Backing material for `feasibility.json`: the outer physical bounds within which a
dough of a given style can still plausibly work, as distinct from the narrower
"ideal" windows in `style-ranges.json`. Numbers below are drawn from peer-reviewed
food-science literature, extension/industry technical pages, and the same baking
sources used elsewhere in this repo. Disagreements between sources are flagged
rather than silently resolved.

## 1. Hydration limits and flour water absorption vs protein/damaged starch

Baker's-percentage hydration (water ÷ flour × 100) is capped by how much water
flour can physically bind, which comes from two components, not one. Protein
(gluten-forming glutenin and gliadin, 7-17% of flour dry matter) can absorb
roughly twice its own weight in water. Separately, starch granules damaged
during milling absorb far more water than intact ones: native starch takes up
only about 0.3× its weight, while damaged starch can take up 0.3-3× its weight.
Farinograph testing shows starch damage is actually the stronger predictor of
water absorption of the two, with protein exerting a more moderate influence.
This is why flour is graded by absorption band (medium strength ~54-60%,
strong >58%, very strong >63%) rather than by protein alone. At the extremes,
wheat flour below roughly 38% hydration cannot fully hydrate into a cohesive,
kneadable gluten network and stays crumbly (compare deliberately low-hydration
pasta dough at 30-42%, a different, unleavened product); above roughly 140%,
even very strong bread flour's gluten can no longer entrain and hold gas
against gravity, so the mix behaves as a batter and needs a mold rather than
free shaping.

Sources:
- [KPM Analytics: Water Absorption Capacity of Flour](https://www.kpmanalytics.com/blog/water-absorption-capacity-of-flour)
- [American Society of Baking: Water Absorption](https://asbe.org/article/water-absorption/)
- [King Arthur Baking: Hydration in bread dough, explained](https://www.kingarthurbaking.com/blog/2023/01/11/bread-hydration)
- [King Arthur Baking: Is wetter better? High-hydration dough](https://www.kingarthurbaking.com/blog/2021/08/16/with-bread-is-wetter-better-high-hydration-dough)

## 2. Salt's osmotic effect on yeast and gluten, quantified

Salt sits at 1.8-2.2% of flour weight in most formulas and does two physically
separate jobs. On yeast, salt raises the osmotic pressure of the surrounding
water, drawing water out of the cell and restricting sugar uptake, which slows
but does not kill the population at normal levels. Quantified: one classic
study found gas production retarded by only about 9% at 1.5% salt, and most
food scientists agree 2% or less does not meaningfully alter gassing power;
the drop is much more pronounced by 3%, where a comparative dough trial
measured total fermentation gas falling from 1518 mL (unsalted) to 1272 mL,
around a 16% reduction. Direct, concentrated contact (dry granules against a
small clump of cells, not dissolved through a batch) can locally kill yeast by
osmotic shock, the real basis of the "don't let salt touch yeast" kitchen
rule, even though the same salt at 2% dissolved through a full batch is
harmless. On gluten, salt tightens the network through ionic screening of
protein-protein bonds: one study measured Alveograph W (dough strength)
rising from an average of 147 unsalted to 201 at 1.5% salt (up to 86% higher
in some cultivars), with development time extending from 5.6 to 8.0 minutes
and water absorption dropping slightly.

Sources:
- [Cargill: Salt in Bread Dough](https://www.cargill.com/salt-in-perspective/salt-in-bread-dough)
- [King Arthur Baking: Does salt kill yeast?](https://www.kingarthurbaking.com/blog/2023/07/05/does-salt-kill-yeast)
- [King Arthur Baking: Salt (pro reference)](https://www.kingarthurbaking.com/pro/reference/salt)
- [PMC: A Comprehensive Study on the Influence of Sodium Chloride on the Technological Quality Parameters of Soft Wheat Dough](https://pmc.ncbi.nlm.nih.gov/articles/PMC7404662/)

## 3. Fermentation kinetics and temperature (Q10 / time-temperature)

The most-repeated rule of thumb in baking sources is that roughly every 8°C
(about 15°F) change in dough temperature doubles (warmer) or halves (cooler)
fermentation time; at least one source frames a similar effect around a
smaller ~5°C step, so this should be treated as a practical approximation
rather than a fixed physical constant, since actual Q10-style behavior varies
by dough system and study. More formal kinetic work models dough expansion
during proofing with first-order or Gompertz-type equations, fitting
parameters such as maximum specific volume growth rate and a time lag before
expansion begins. Temperature does not just change fermentation speed, it also
selects which organisms dominate in sourdough: homofermentative lactic acid
bacteria favor roughly 30-35°C, heterofermentative (acetic-leaning) bacteria
favor 20-27°C, and wild yeast favors about 25-26°C, so warmer doughs trend
milder and cooler ones trend more acidic. At the top end, yeast's own thermal
ceiling is a hard limit: a controlled bun-dough study measured decimal
reduction times (time for a 90% population drop) of 18.7 minutes at 52°C,
5.7 minutes at 55°C, and 1.0 minute at 58°C, with a z-value of 4.74°C.

Sources:
- [Bakery Academy: How temperature influences bacteria growth in sourdough](https://www.bakeryacademy.com/bakery-blogs/baking-processes/how-temperature-influences-the-growth-of-different-bacteria-in-sourdough)
- [The Perfect Loaf: The Ultimate Guide to Bulk Fermentation](https://www.theperfectloaf.com/guides/the-ultimate-guide-to-bread-dough-bulk-fermentation/)
- [PubMed: Validation of Baking To Control Salmonella Serovars in Hamburger Bun Manufacturing (J. Food Prot. 2016;79(4):544-552)](https://pubmed.ncbi.nlm.nih.gov/27052857/)

## 4. Sugar's osmotic inhibition thresholds

At low levels, roughly up to 3% of flour weight, sugar speeds fermentation
slightly by supplying yeast easily available food. Past that point the same
molecule works against yeast: dissolved sugar raises the osmotic pressure of
the surrounding water, pulling water out of cells, the mirror image of salt's
mechanism. Sources converge loosely on 5-10% sugar as where standard baker's
yeast activity starts being measurably impeded, with pronounced slowing across
the 10-25% range used in sweet doughs. One frequently cited classical
experiment found no visible yeast cell damage up to about 13% sugar
concentration, partial cell collapse around 17-19%, and immediate plasmolysis
at 20% and above, though tolerance is strongly strain-dependent, so treat these
cutoffs as illustrative rather than universal. This is why panettone (commonly
20-25% sugar relative to flour) and similarly sweet enriched doughs call for
osmotolerant yeast strains, selectively bred with lower invertase activity and
stronger internal glycerol-based osmotic defenses, reported to provide
roughly 10-20% more activity than standard yeast in high-sugar dough. Standard
yeast can still be pushed into this range, but needs a larger dose, warmer
proofing, or a longer rise to compensate.

Sources:
- [PubMed: Hyperosmotic stress response by strains of bakers' yeasts in high sugar concentration medium](https://pubmed.ncbi.nlm.nih.gov/11068916/)
- [King Arthur Baking: How to master brioche and unlock a whole world of baking](https://www.kingarthurbaking.com/blog/2022/09/01/how-to-make-brioche-maritozzi)
- [Modernist Cuisine: All about Brioche](https://modernistcuisine.com/mb/all-about-brioche/)

## 5. Fat's effect on gas retention and crumb

Fat's primary mechanical action is coating flour proteins and lubricating the
forming gluten network, which softens and extends dough but also limits
protein-to-protein cross-linking if added before gluten has developed. Staged
addition follows the amount used: fat at or below about 5% of flour weight can
be mixed in from the start; between roughly 5-15% it should wait until gluten
is about half developed; above 15% it should wait until gluten is nearly fully
developed (about 80%), since a fully formed network can tolerate the lubricating
load that would have prevented an under-developed one from forming at all.
This staged, "delayed butter" logic is how brioche formulas routinely reach
20-80%+ butter without collapsing. One apparent disagreement is worth
flagging: a controlled proving study using only trace fat (0%, 0.04%, 0.2% of
flour) found no significant effect on time to lose gas retention or on final
dough expansion capacity, seemingly at odds with the "fat weakens structure"
narrative. The likely resolution is scale: that study tested amounts far below
the roughly 3-5% threshold where fat's coating effect turns rheologically
significant, and says nothing about enriched doughs at 20%+. Separately, in a
lean-bread context, shortening above about 3% reduced acceptability in one
study, reflecting texture preference more than a hard structural limit.

Sources:
- [ChainBaker: How Much Fat Should You Add to Bread Dough?](https://www.chainbaker.com/fat-percentage/)
- [JayArr Bread: Butter in Bread Dough, What It Does and When to Add It](https://jayarrbread.com/blog/butter-in-bread-dough/)
- [ScienceDirect: Effect of fat level, mixing pressure and temperature on dough expansion capacity during proving](https://www.sciencedirect.com/science/article/abs/pii/S0733521007000215)

## 6. What makes rye behave differently (pentosans, water binding)

Rye grain is low in gluten-forming protein, so rye dough's structure is not
built from a stretchy protein network the way wheat dough's is. The
load-bearing job instead falls to pentosans (arabinoxylans), non-starch
polysaccharides that form a viscous, water-trapping gel. Rye flour carries
roughly double to triple the pentosan content of wheat flour (about 2.40%
water-soluble and 3.15% total pentosans in rye versus roughly 0.7-0.83%
soluble and 1.5-2.12% total in wheat). Sources disagree on exactly how much
water these polymers hold: one baking-science reference puts water-unextractable
pentosan capacity at 6-10× its own weight, other sources cite 8× or "up to
15×," and a broader hemicellulose reference claims as high as 100×, so the
6-15× range is the more credible working figure and any single multiplier
should be treated as approximate. Because pentosans, not gluten, hold rye's
water, a nominal "70% hydration" rye dough behaves nothing like 70% wheat
dough: it is deliberately mixed to a dense, mud-like paste, not a kneadable
dough. Rye also needs acidification for a separate reason: its naturally high
amylase activity will otherwise degrade starch into a gummy "starch attack"
crumb during a dense loaf's slow bake-through, and sourdough acidity
suppresses that enzyme before heat does.

Sources:
- [American Society of Baking: Pentosan](https://asbe.org/article/pentosan/)
- [The Perfect Loaf: The Whys of Ryes](https://www.theperfectloaf.com/the-whys-of-ryes/)
- [Sourdoughratio: Rye Sourdough Hydration](https://sourdoughratio.com/blog/rye-sourdough-hydration)

## 7. Staling/retrogradation kinetics and what slows it

Staling is overwhelmingly a starch recrystallization (retrogradation) process,
not simple drying. During baking, starch gelatinizes: granules absorb water,
swell, and lose crystalline order. After baking, as the loaf cools, amylose
recrystallizes within hours, while amylopectin recrystallizes far more slowly,
over days, and it is this slow amylopectin reordering, not moisture loss per
se, that produces the firm, stale texture even in a well-sealed loaf.
Temperature strongly gates the rate: retrogradation is fastest around 0-4°C,
exactly refrigerator temperature, so fridge storage measurably accelerates
staling relative to room temperature; freezing works precisely because it
drops far enough below that window to arrest molecular mobility, pausing
staling for weeks to months. Kinetic studies commonly fit a first-order model
to firmness increase over time and note that storage near -18°C allows only
growth of existing crystals, while the 4-25°C band allows both growth and new
crystal formation, i.e. more active retrogradation. Anything that keeps water
available to starch slows the process: fat, oil, egg, sugar and honey all
measurably extend softness, and rye pentosans do the same by binding large
amounts of water and interfering with amylopectin's ability to recrystallize,
which combined with sourdough acidity's mold-inhibiting effect is why dense
sourdough ryes keep for a week or more.

Sources:
- [ScienceDirect Topics: Starch Retrogradation](https://www.sciencedirect.com/topics/food-science/starch-retrogradation)
- [Starch/Stärke (Wiley): Effect of storage temperature on starch retrogradation of bread staling](https://onlinelibrary.wiley.com/doi/abs/10.1002/star.201100023)
- [Red Star Yeast: Staling in Bread](https://redstaryeast.com/blog/staling-in-bread/)
