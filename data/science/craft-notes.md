# Panarium craft notes, the science and technique behind good bread

Source material for the "Bread School" and fault-diagnosis features. Dense and factual,
written to be paraphrased, not published as-is. Where live sources disagreed on a
number, that's flagged inline rather than silently picking one.

## 1. Flour & gluten

Wheat's baking behavior comes from two storage proteins, glutenin and gliadin, which
combine with water into gluten. Protein % is the standard proxy for gluten potential:
pastry flour ~8%, all-purpose ~11.7%, bread flour ~12.7%, high-gluten ~14.2%, whole wheat
~13.2% (though bran physically shreds gluten strands, so whole wheat behaves weaker than
its number suggests). Extraction rate, how much of the wheat berry survives milling, drives this: white flour is low-extraction endosperm only; whole wheat is ~100%
extraction, keeping bran, germ, enzymes and color. Rye is structurally different: it has
little gluten-forming protein and is instead dominated by pentosans (arabinoxylans),
which absorb roughly 10–16× their weight in water (sources vary) and form the viscous
gel that does rye's structural work, hence rye breads lean on starch gelatinization and
acidification, not kneaded gluten. Ancient grains vary by ploidy: einkorn (diploid) has
the weakest, most extensible gluten and the highest gliadin:glutenin ratio (mean ~6.5,
vs ~1.5–3.1 for modern wheat), good for flatbread/pasta, poor for bread; spelt
(hexaploid, same ploidy as bread wheat) handles much more like modern wheat but its
gluten is fragile and breaks down if overmixed. Flour "strength" is measured by the
Chopin alveograph as W (deformation energy) and P/L (tenacity:extensibility balance);
rough consensus bands are W<150 weak (pastry), 150–250 medium (everyday bread,
baguette), 250–330 strong (long-fermented sourdough, sandwich bread), 330+ very strong
(panettone, enriched, long cold retard), exact cutoffs differ by source.

Sources:
- [King Arthur Baking: Protein percentage in flour](https://www.kingarthurbaking.com/blog/2023/09/25/protein-percentage)
- [American Society of Baking: Alveograph](https://asbe.org/article/alveograph/)
- [Somebody Feed Seb: W Index flour strength](https://somebodyfeedseb.com/w-index-flour-strength-sourdough/)
- [The Perfect Loaf: The Whys of Ryes](https://www.theperfectloaf.com/the-whys-of-ryes/)
- [PMC: Comparative gluten protein composition of ancient and modern wheat](https://pmc.ncbi.nlm.nih.gov/articles/PMC6769531/)
- [King Arthur Baking: A visit to the Bread Lab](https://www.kingarthurbaking.com/blog/2014/02/10/the-bread-lab)

## 2. Water & hydration

Hydration (water ÷ flour × 100, baker's percentage) is the biggest single lever on
handling and crumb. At 60–65%, dough is stiff and easy to shape, gives a thick crust,
strong oven spring and a tight, sliceable crumb, bagels, pretzels, pan loaves, pizza.
At 68–75%, dough is smooth and extensible, forgiving for beginners, and gives the
"classic" hearth loaf: thinner crust, tender-but-structured crumb, country loaves,
baguettes. Above 75%, dough turns slack and sticky, needs wet-hand/Rubaud handling
instead of kneading, and bakes into a squatter loaf with a thin brittle crust and an
open, irregular, almost custardy crumb (ciabatta, focaccia); past ~85% it risks becoming
genuinely unworkable if fermentation and gluten strength can't keep pace. Hydration is
flour-relative, not absolute, higher-protein and whole-grain flours drink more water for
the same feel, so a printed percentage is a starting guideline, not a guarantee; bakers
adjust to the dough in front of them. Rye inverts the usual logic entirely: because
pentosans, not gluten, hold the water and provide structure, rye dough at a nominal
"70% hydration" behaves nothing like wheat at 70%, it's deliberately mixed to a dense,
mud-like paste rather than a kneadable dough, and more water generally means better
keeping quality, not more open crumb.

Sources:
- [The Perfect Loaf: What Is Dough Hydration?](https://www.theperfectloaf.com/dough-hydration/)
- [King Arthur Baking: Hydration in bread dough, explained](https://www.kingarthurbaking.com/blog/2023/01/11/bread-hydration)
- [King Arthur Baking: Baker's Percentage](https://www.kingarthurbaking.com/pro/reference/bakers-percentage)
- [King Arthur Baking: Is wetter better? High-hydration dough](https://www.kingarthurbaking.com/blog/2021/08/16/with-bread-is-wetter-better-high-hydration-dough)
- [The Perfect Loaf: The Whys of Ryes](https://www.theperfectloaf.com/the-whys-of-ryes/)

## 3. Salt

Salt sits at 1.8–2.2% of flour weight in most formulas and does three unrelated jobs.
First, it's a fermentation brake: salt draws water from yeast cells by osmosis and
directly restrains yeast activity, keeping gas production controllable instead of racing, unsalted dough over-ferments fast, over-produces alcohol/acetone notes, and is harder
to time. Second, it tightens gluten: salt strengthens the network's ionic bonds, making
dough less slack and better able to hold CO2, unsalted dough at the same hydration feels
noticeably stickier and slacker. Third, it's flavor, plain and simple, and it indirectly
boosts crust color, since slower, more controlled fermentation leaves more residual sugar
for Maillard/caramelization at bake time. The standing exception is Tuscan pane sciocco
(pane toscano), salted at zero. The leading explanation, undocumented but persistent, ties it to a medieval salt-supply/tax dispute with Pisa; other theories point to
affordability (salt reserved for preserving meat) or to deliberate blandness as a foil to
Tuscany's intensely salty cured meats and cheeses. No written record confirms any single
theory. The bread has held EU Protected Designation of Origin status since 2016.

Sources:
- [King Arthur Baking: Why is salt important in yeast bread?](https://www.kingarthurbaking.com/blog/2020/07/29/why-is-salt-important-in-yeast-bread)
- [Wikipedia: Pane sciocco](https://en.wikipedia.org/wiki/Pane_sciocco)
- [Great Italian Chefs: Pane Sciocco, Tuscany's Bread](https://www.greatitalianchefs.com/features/pane-sciocco-tuscan-bread)

## 4. Fermentation

Commercial-yeast bread runs a single selected *Saccharomyces cerevisiae* strain bred for
fast, consistent CO2 (done in 1–4 hours). Sourdough runs a mixed culture of wild yeasts
plus lactic acid bacteria (LAB) over 12–48 hours, producing far more complex flavor and a
measurably lower pH (roughly 3.8–4.6 vs 5.3–5.8 for yeasted dough). Within sourdough, LAB
split into homofermentative strains (mostly lactic acid, milder/milkier) and
heterofermentative strains such as *L. sanfranciscensis* (lactic + acetic + CO2 +
ethanol, sharper); ~80:20 lactic:acetic is the commonly cited target for balance.
Temperature governs which dominate: homofermentative bacteria favor roughly 30–35°C,
heterofermentative (acetic-leaning) bacteria 20–27°C, yeast ~25–26°C, warmer
starters/doughs trend milder, cooler ones trend sharper. For overall fermentation
*speed*, the commonly repeated rule of thumb is that each ~8°C (15°F) change in dough
temperature roughly doubles (warmer) or halves (cooler) the time required; one source
frames the same behavior around a smaller ~5°C step, so treat this as an approximation,
not a physical constant. Underproofed dough is stiff, tears rather than stretching,
springs back fast, and bakes dense with tight crumb, uncontrolled tearing, and a
pyramid-like rise. Overproofed dough is slack, flattens when turned out, smells
alcoholic, doesn't spring back, and bakes pale, flat, and gummy or dense with a
thinning, separating crust.

Sources:
- [Bakery Academy: How temperature influences bacteria growth in sourdough](https://www.bakeryacademy.com/bakery-blogs/baking-processes/how-temperature-influences-the-growth-of-different-bacteria-in-sourdough)
- [Plötzblog (Baeckerlatein): Sauerteig](https://www.ploetzblog.de/baeckerlatein/sauerteig/id=612609cec30e586ffcd80abd)
- [Serious Eats: Sourdough Starter Science](https://www.seriouseats.com/sourdough-starter-science)
- [The Perfect Loaf: The Ultimate Guide to Bulk Fermentation](https://www.theperfectloaf.com/guides/the-ultimate-guide-to-bread-dough-bulk-fermentation/)
- [The Sourdough Journey: Over- or Under-Proofed FAQ](https://thesourdoughjourney.com/faq-over-under-proofed/)
- [Challenger Breadware: Identifying Proofing Levels](https://challengerbreadware.com/bread-techniques/identifying-proofing-levels-in-baked-bread/)

## 5. Preferments

All four preferments pull a portion of the final dough's flour and water into an early,
separate slow ferment, but they diverge sharply. Poolish is a 100%-hydration batter
(equal flour and water) with a trace of commercial yeast, fermented 8–16 hours at room
temperature; it gives sweet, mild, wheaty complexity and helps extensibility/open crumb
without sourdough tang. Biga is Italian and stiff, roughly 50–60% hydration, fermented
longer (12–24 hours, often part-refrigerated) because low water slows yeast's access to
starch; it gives a more rounded, subtly tangy depth from time alone (not bacteria), and
characteristic chew, classic in ciabatta. Levain is the sourdough preferment, built from
a mature starter: liquid levain (100–125% hydration) favors lactic-dominant, milder,
creamy sourness; stiff levain (~60% hydration) favors acetic-dominant, sharper tang, bakers pick consistency partly to steer flavor. Pâte fermentée ("old dough") is unique in
already containing salt: it's simply a piece of yesterday's fully-formed dough, at the
new dough's own hydration (commonly ~60%), added to jump-start the batch with
pre-developed gluten and mild fermented flavor, no separate build required. All four are
quantified in a formula as "prefermented flour %" of the total.

Sources:
- [The Dough Formula: Preferments 101, Poolish, Biga, and Levain Compared](https://thedoughformula.com/fundamentals/preferments-101/)
- [Bread By The Hour: Levain, Poolish, Biga, Pâte Fermentée](https://breadbythehour.com/beginning-baking-definitions-levain-poolish-biga-sponge-and-pate-fermentee/)

## 6. Autolyse, mixing & gluten development

Autolyse, resting flour and water alone (no salt, no leaven) for 20–60 minutes before
final mixing, lets flour fully hydrate and starts gluten bonding passively, with zero
mechanical work. The payoff: less kneading needed, more extensible dough, better oven
spring, more open crumb, cleaner scoring, and it's especially valuable with whole grain,
since bran gets time to soften instead of shredding gluten during kneading. Mixing proper
(by hand, slap-and-fold, Rubaud, or by machine) does what autolyse can't: physically
aligning glutenin/gliadin into a stretchy, gas-holding sheet. The windowpane test is the
standard readiness check: stretch a golf-ball piece of dough gently in all directions, if it thins to a translucent, light-passing film before tearing, gluten is developed.
How much development is wanted depends on schedule: dough for a short bulk rise wants
gluten nearly fully developed before shaping; dough for a long (often refrigerated) bulk
is deliberately left under-developed at mixing, because time and folds finish the job.
The Rubaud method (gentle scoop-lift-stretch-drop by hand, after baker Gérard Rubaud)
builds strength in doughs too wet for slap-and-fold, typically 2–8 minutes with rests;
stretch-and-fold sets (4–6 rounds, ~30 minutes apart) replace kneading entirely in
no-knead-style doughs, building strength gradually across bulk fermentation instead of
upfront.

Sources:
- [King Arthur Baking: Using the autolyse method](https://www.kingarthurbaking.com/blog/2017/09/29/autolyse-sourdough)
- [King Arthur Baking: What is the windowpane test?](https://www.kingarthurbaking.com/blog/2022/10/14/what-is-the-windowpane-test-for-bread-dough)
- [My Daily Sourdough Bread: Rubaud Method](https://www.mydailysourdoughbread.com/rubaud-method/)
- [The Perfect Loaf: The Ultimate Guide to Mixing Bread Dough](https://www.theperfectloaf.com/guides/mixing-bread-dough/)

## 7. Shaping & tension

Shaping's real job is building a tight outer skin under surface tension, not just forming
a shape: that taut membrane holds the loaf's form through final proof and into the oven
instead of the dough spreading, and it directly governs final crust and crumb quality by
keeping structure intact until oven spring locks it in. Tension comes from friction, not
flour, dragging the smooth top of the dough against an unfloured (or barely floured)
counter tightens the skin; excess bench flour kills the friction and the tension with it.
The three classic hearth shapes escalate in difficulty: boule (round) gathers the dough's
corners to the center and suits stronger, tighter-crumb doughs (whole grain, porridge
breads); bâtard (oval) uses a stitching or cinching motion to build structure while
easing out excess gas, better for preserving open crumb; baguette is hardest, needing
enough tension to hold a long thin cylinder while staying gentle enough not to degas an
open structure, then proofed seam-down on a floured linen couche. Bannetons (proofing
baskets) exist because high-hydration shaped dough has no self-support: the basket walls
force rise upward instead of outward, wick a little surface moisture for a crisper
crust, let wet dough be moved without tearing, and stamp the ridged spiral pattern
bakers prize visually.

Sources:
- [The Perfect Loaf: The Ultimate Guide to Shaping Bread Dough](https://www.theperfectloaf.com/guides/shaping-bread-dough/)
- [Breadtopia: How to Shape Dough](https://breadtopia.com/how-to-shape-dough/)
- [King Arthur Baking: Bannetons, brotforms, and proofing baskets](https://www.kingarthurbaking.com/blog/2023/01/25/bannetons-brotforms-proofing-baskets)

## 8. Scoring

Scoring controls *where* a loaf ruptures under oven-spring pressure: an unscored loaf
still bursts, but unpredictably, along whatever seam or thin spot gives way first, often
tearing the crust or distorting the shape. A deliberate cut pre-selects that failure
point. Ear formation, the crisp, lifted flap along a score, depends on blade angle:
holding the lame at a shallow ~30° to the surface (rather than 90°, straight down)
creates an overhanging flap that escaping gas and steam push up and curl back during
baking; a perpendicular cut just splays open with no ear. Depth matters too: roughly
1/4"–1/2" is the usual range, shallow enough that the cut doesn't fuse shut before oven
spring finishes, but not so deep the loaf caves in around an oversized opening. Technique
favors speed and confidence: one fast, fluid pass with a genuinely sharp blade gives a
clean release; slow "sawing" compresses and drags the dough, producing a ragged cut and
a dull ear even with correct angle and depth. A blade that drags rather than glides is
also a sign the dough itself is over-proofed, not just a knife problem.

Sources:
- [King Arthur Baking: How to score bread dough](https://www.kingarthurbaking.com/blog/2017/08/04/scoring-bread-dough)

## 9. Steam & oven spring

Oven spring, the burst of rise in the first 10–15 minutes of baking, comes from
trapped CO2 and alcohol vapor expanding under heat, plus a final push of yeast activity
before core temperature kills it (around 60°C); all of it depends on the crust staying
flexible long enough to keep expanding instead of setting like a shell early. That's
steam's job: a moist oven surface keeps the dough's exterior below roughly 100°C while
liquid water is present (evaporative cooling), delaying crust-set. Without steam, the
surface can exceed 120°C within minutes, capping volume, blunting the ear, and leaving a
dull, thick skin instead of a glossy one, steam also gelatinizes surface starch
directly, which produces the shine and the eventual shatter. A Dutch oven (or cloche) is
simply a cheap way to trap a loaf's own steam in a small, superheated, high-thermal-mass
chamber, rather than steaming an entire home oven. Timing is everything: keep steam in
for the first ~15–20 minutes while the loaf is still expanding and just starting to
color, then vent it, lift the lid, or open a steam-oven's vent, so the back half of
the bake dries and hardens the crust. Steam held too long produces a pale, soft, rubbery
crust instead of a crisp one.

Sources:
- [King Arthur Baking: A guide to baking bread with steam at home](https://www.kingarthurbaking.com/blog/2024/04/26/baking-bread-with-steam-at-home)
- [The Perfect Loaf: How To Bake Bread in a Dutch Oven](https://www.theperfectloaf.com/how-to-bake-bread-in-a-dutch-oven/)
- [Wordloaf: Pass the Dutchie](https://newsletter.wordloaf.org/dutchovenbaking/)

## 10. Crust & Maillard

Crust and crumb diverge because of water: as long as free moisture is present, a surface
can't exceed about 100°C (it's busy evaporating), which is why interior crumb never
browns. Once the crust's surface moisture drops low enough (roughly 5–10% residual), its
temperature climbs past 100°C toward oven temperature, and caramelization and, more
important for flavor, the Maillard reaction between reducing sugars and amino acids
take over, starting around 120°C (250°F) and running hardest around 140–165°C
(285–330°F). Fermentation stocks both reactions before baking even starts: proteases
release amino acids from gluten, amylases release sugars from damaged starch, so longer,
more active fermentation banks more Maillard/caramelization substrate, the mechanistic
case for the "bold bake" school (King Arthur and others), pushing color hard rather than
pulling loaves at a timid golden-tan, since deep color reads as flavor once you know
where it comes from. Enriched doughs (sugar, milk, egg, brioche, challah) brown faster
at a given temperature and are typically baked cooler to compensate. Crust style tracks
the moisture regime: heavily-steamed hearth loaves get thin, crackly, blistered, glassy
crusts; drier bakes or enriched pan loaves get soft, matte crusts; long, hot, dry bakes
(some rye, pain de campagne) push toward thick, deeply colored, almost bitter-edged
crusts prized in German and rustic French traditions.

Sources:
- [JayArr Bread: The Maillard Reaction, Why Bread Crust Tastes Good](https://jayarrbread.com/blog/maillard-reaction-bread/)
- [PMC: Maillard Reaction in Flour Product Processing](https://pmc.ncbi.nlm.nih.gov/articles/PMC12345924/)
- [King Arthur Baking: A guide to baking bread with steam at home](https://www.kingarthurbaking.com/blog/2024/04/26/baking-bread-with-steam-at-home)

## 11. Staling & keeping

Staling is widely misunderstood as drying out; it mostly isn't. The dominant mechanism
is starch retrogradation: during baking, starch gelatinizes (granules absorb water,
swell, lose crystalline order); after baking, as the loaf cools, amylose recrystallizes
within hours and amylopectin recrystallizes much more slowly over days, and this
re-ordering, not moisture loss per se, is what makes crumb feel firm and stale even in
a well-sealed loaf. Temperature accelerates it sharply: refrigeration is close to the
worst place to store bread, since fridge temperature sits in retrogradation's fast range,
staling bread faster than room temperature; freezing works precisely because it drops far
enough below that range to arrest molecular movement almost entirely, pausing staling for
a couple of months. Ingredients that hold water, fat, oil, egg, sugar, honey, milk, slow staling by keeping crumb moisture more available to starch, which is why enriched
breads and honey-sweetened loaves stay soft far longer than lean baguette-style bread.
Rye is a special case again: its pentosans bind large amounts of water and appear to
physically interfere with starch recrystallization, which combined with sourdough
acidity (also slowing retrogradation and inhibiting mold) is why dense rye and
scalded-grain breads keep a week or more, improving after a day or two rather than
degrading. Practical rule: room temperature, cut-side down or wrapped, never fridge;
slice and freeze for anything longer.

Sources:
- [ScienceDirect: Starch Retrogradation (overview)](https://www.sciencedirect.com/topics/food-science/starch-retrogradation)
- [Wiley/Starch–Stärke: Effect of storage temperature on starch retrogradation](https://onlinelibrary.wiley.com/doi/abs/10.1002/star.201100023)
- [ScienceDirect: Effect of soluble pentosans from rye on staling](https://www.sciencedirect.com/science/article/abs/pii/0308814687900100)
- [Red Star Yeast: Staling in Bread](https://redstaryeast.com/blog/staling-in-bread/)

## 12. What "good bread" means

Formal judging converges on the same handful of axes across very different traditions.
The Concours de la meilleure baguette de Paris (est. 1994; eligibility: 55–65cm,
250–300g, ~18g salt/kg flour) scores five criteria, baking/doneness, smell, taste,
crumb, and appearance, each 0–4 points, with disqualification for out-of-spec size or
salt. Germany's DLG applies its general-purpose DLG-5-Punkte-Schema (a 0–5 scale per
characteristic, confirmed directly from DLG's own site) to bread through six
outside-to-inside characteristics: form/appearance; surface & crust properties; crumb
structure/aeration; crumb texture & elasticity; smell; taste, evaluators press the crumb
to check elastic recovery before tasting. Note: some secondary sources describe DLG
bread scoring on a 100-point scale (90+ = "good"); this wasn't confirmed against DLG's
own materials, which state the 5-point scheme, so treat the 100-point figure as
unverified until checked against a current DLG bread-specific test protocol. Informal
artisan "crumb reading" (Fresh Loaf, Sourdough Journey and similar) judges less formally
but consistently: even, varied alveoli without giant tunnels or collapse; thin, slightly
glossy cell walls (real gluten development, not holes for their own sake); moist-not-gummy
texture; confirmed by taste. Distilled into 8 judgeable qualities for reuse across
cultures: **(1)** crust color/depth (real Maillard, not just tan-vs-pale), **(2)** crust
texture proper to style (shatter/crackle vs soft, not accidentally tough or gummy),
**(3)** oven spring / volume-for-weight, **(4)** scoring execution / ear, **(5)** crumb
aeration (even, open-appropriate-to-style, no tunnels or gumminess), **(6)** crumb
elasticity and moistness on the press-and-taste test, **(7)** aroma, **(8)** flavor
balance (acidity, salt, sweetness, no off-notes).

Sources:
- [Wikipedia: Concours de la meilleure baguette de Paris](https://en.wikipedia.org/wiki/Concours_de_la_meilleure_baguette_de_Paris)
- [The World of Baking: Brotprüfungen, mehr als nur Medaillen](https://theworldofbaking.com/de_de/brotpruefungen-mehr-als-nur-medaillen)
- [DLG: What does "DLG awarded" mean?](https://www.dlg.org/en/tests/food/what-does-dlg-awarded-mean)
- [Pastry Arts Magazine: Crumb Clues, How to Read and Debug Your Bread](https://pastryartsmag.com/general/crumb-clues-how-to-read-and-debug-your-bread/)
