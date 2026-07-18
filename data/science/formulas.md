# Panarium baking formulas, the math behind the calculator

Source material for the dough calculator and unit converter. Every number below is
sourced from a live page; where sources disagreed, both figures are given rather than
silently picking one.

## 1. Desired Dough Temperature (DDT)

The standard trick: multiply DDT by the number of temperature factors you're summing,
then subtract the ones you can't control to solve for the one you can (water). For a
straight (non-preferment) dough with three factors, room, flour, friction, water temp
= (DDT x 3) - room temp - flour temp - friction factor. With a preferment, add a fourth
factor (the preferment's own temperature) and multiply by 4 instead of 3. The formula is
scale-agnostic (works in C or F) since it's just solving a linear average. Friction
factor, the temperature rise from mechanical mixing, is roughly 3-4C (6-8F) for hand
kneading, 12-13C (22-24F) for a home stand mixer (KitchenAid: 3 min on stir + 4 min on
speed 2), and 13-16C (24-28F) for spiral/commercial mixers per Hamelman. Worked example
(King Arthur): target DDT 78F, room 72F, flour 71F, stand-mixer friction 22F -> water
temp = 78x3 - 72 - 71 - 22 = 69F. Target DDT for most wheat yeast breads is 24-26C
(75-78F); sourdough bakers often target slightly warmer, 24-28C.

Sources:
- [King Arthur Baking: Desired dough temperature](https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature)
- [King Arthur Baking: Determining the friction factor in baking](https://www.kingarthurbaking.com/blog/2018/08/27/determining-the-friction-factor-in-baking)
- [King Arthur Baking: Dough Temperature (pro reference)](https://www.kingarthurbaking.com/pro/reference/dough-temperature)

## 2. Yeast conversions

Sources disagree on the exact fresh:active-dry:instant ratio. King Arthur's professional
chart uses fresh x0.4 = active dry, fresh x0.33 = instant (fresh:ADY:instant approx
3:1.2:1; e.g. 30g fresh = 12g active dry = 10g instant). A commonly quoted simplified
home rule instead halves and thirds fresh yeast (fresh/2 = active dry, fresh/3 =
instant), giving a slightly richer active-dry figure (3:1.5:1). Instant yeast is
generally considered about 25% more potent by weight than active dry, but Red Star's own
chart treats the two as interchangeable 1:1, in practice the gap is inside normal
recipe tolerance. Typical yeastPct by style (instant, room-temp bulk): lean hearth bread
1-1.5%, sandwich loaf 1.2-2%, enriched sweet dough 1.5-2% baseline but brioche formulas
run as high as 6-7% because sugar and fat suppress yeast activity, and long-ferment
Neapolitan pizza uses under 0.2% for an 8-24h room-temperature rise. For a retarded
(overnight cold) dough, cut instant yeast roughly to a third to a half of the direct-dough
amount, one cited example drops from 0.7% to 0.2-0.4%, though controlling dough and
retarder temperature matters more than the exact yeast cut.

Sources:
- [Red Star Yeast: Yeast Conversion Chart](https://redstaryeast.com/yeast-conversion-chart/)
- [King Arthur Baking: Active dry vs. instant yeast](https://www.kingarthurbaking.com/blog/2022/08/15/active-dry-versus-instant-yeast)
- [King Arthur Baking: Yeast (pro reference)](https://www.kingarthurbaking.com/pro/reference/yeast)
- [The Fresh Loaf: Rules of thumb for retarding](https://www.thefreshloaf.com/node/18165/rules-thumb-retarding)

## 3. Time-temperature scaling

The rule of thumb bakers actually use is a Q10-style doubling: fermentation rate roughly
doubles for every 8-10C (15F) of warming and halves for the same drop, in the normal
20-30C working range, the same dough that peaks in 4h at summer room temp can take
10-12h in a cool winter kitchen. Below about 4C, cold retard essentially suspends yeast
activity (bacteria keep working slowly, building flavor) while dough placed straight
from a warm kitchen into the fridge can take up to 8 hours just to reach 5C, so the
effective slow-down is gradual, not instant. Hamelman's Vermont Sourdough recommends
retarding up to 8h at 10C or up to 18h at 4.5C. Shaped, refrigerated dough is often
described as fermenting "about 10x slower" than at room temperature.

Sources:
- [The Sourdough Journey: FAQ - Bulk Fermentation Timing](https://thesourdoughjourney.com/faq-bulk-fermentation-timing/)
- [Weekend Bakery: The Temperature Equation](https://www.weekendbakery.com/posts/the-temperature-equation-timing-your-fermentation/)
- [The Fresh Loaf: Retarded Bulk Ferment Temperature](https://www.thefreshloaf.com/node/71881/retarded-bulk-ferment-temperature)
- [The Perfect Loaf: Build Your Own Dough Retarder](https://www.theperfectloaf.com/build-your-own-dough-retarder/)

## 4. Levain math

Common build ratios (starter:flour:water) run from 1:1:1 (100% inoculation, fastest,
most acidic) through 1:2:2, 1:3:3, 1:4:4, 1:5:5 to 1:10:10 (10% inoculation, slowest,
mildest). Rough peak-time guide: 5-10% inoculation for a very slow 16h+ build, 20% for
12-14h, 50% for 5-6h, 100% for a fast 3-4h, always adjust for temperature, since a
levain that peaks in 6h at 28C may need 10-12h at 20C. Hydration defines stiff (50-65%)
vs liquid (100%+) levain: liquid levain, fermented with more available oxygen and often
at warmer temperature, favors lactic-acid bacteria and gives a milder, rounder sourness;
stiff levain favors acetic-acid production, and because acetic acid is more volatile and
aromatic (not necessarily "more sour" chemically), stiff-levain bread reads as noticeably
tangier. Bakers commonly tighten their feeding ratio in winter (e.g. 1:2:2) to keep the
starter lively and loosen it in summer (e.g. 1:5:5) to slow it down and avoid over-ripening.

Sources:
- [The Perfect Loaf: Starter & Levain Calculator](https://www.theperfectloaf.com/starter-and-levain-calculator/)
- [EpicBaker: Levain Build Basics](https://epicbaker.com/bread-sourdough/levain-build-ratios/)
- [Wordloaf: Stiffed](https://newsletter.wordloaf.org/stiffed/)
- [King Arthur Baking: Testing different sourdough feeding ratios](https://www.kingarthurbaking.com/blog/2025/03/13/sourdough-feeding-ratios)

## 5. Salt, sugar and fat as numbers

Salt: the working range across professional formulas is 1.8-2.2% (Hamelman 1.8-2%,
Robertson 2%, Forkish 2.1-2.2%); below about 1.5% dough ferments faster and tastes flat,
above about 2.5% yeast activity and gluten strength both suffer. Sugar: up to about 3%
gives yeast a mild boost; above roughly 6-10% sugar starts pulling water out of yeast
cells by osmosis and measurably slows fermentation, which is why enriched sweet doughs
(brioche, panettone-style) often use osmotolerant yeast strains (used at 1-3% of flour)
that retain 10-20% more activity in high-sugar doughs. Fat: up to about 10% can be mixed
in from the start; above that, fat should be added after gluten has developed, since fat
coats gluten strands and prevents them from cross-linking, this is what gives enriched
crumb its softness and fine grain, at the cost of dough strength, so higher-fat doughs
need longer mixing, cooler ingredients and more yeast to compensate.

Sources:
- [The Fresh Loaf: Salt & Baker's Percentages](https://www.thefreshloaf.com/node/49600/salt-bakers-percentages)
- [Lallemand Baking: Osmotolerant Yeast](https://www.lallemandbaking.com/en/canada/industrial-bakers/bakers-yeast/osmotolerant-yeast/)
- [PMC: Sugar Levels Determine Fermentation Dynamics in Yeast Pastry Making](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9140867/)
- [The Perfect Loaf: What Does Butter Do to Bread Dough?](https://www.theperfectloaf.com/what-does-butter-do-to-bread-dough/)
- [ChainBaker: How Much Fat Should You Add to Bread Dough?](https://www.chainbaker.com/fat-percentage/)

## 6. Prefermented flour by style

Poolish for baguette commonly runs 20-40% of total flour, with 30% cited as the
professional standard. Levain for pain au levain / country sourdough typically runs
15-25% of total flour in home formulas, occasionally as low as 10% or as high as 50% for
more sour, more open styles. Ciabatta's biga (King Arthur's formula) sits at 30% of
flour, fermented about 16 hours before mixing into the final dough. Rye styles skew much
higher because rye needs acid to bake well, not just gluten development that isn't
there: mixed rye (60-80% rye) formulas often run 30-50% prefermented flour, and 100% rye
loaves are frequently raised almost entirely on sourdough. Enriched styles vary by
tradition rather than a hard rule; straight (non-preferment) doughs remain common for
sandwich loaves, brioche and challah.

Sources:
- [The Dough Formula: Preferments 101](https://thedoughformula.com/fundamentals/preferments-101/)
- [King Arthur Baking: Ciabatta (pro formula)](https://www.kingarthurbaking.com/pro/formulas/ciabatta)
- [EpicBaker: Levain Build Basics](https://epicbaker.com/bread-sourdough/levain-build-ratios/)
- [SourdoughRatio: Rye Sourdough Hydration](https://sourdoughratio.com/blog/rye-sourdough-hydration)

## 7. Scaling and pan math

For a lidded pan with a normal crumb, a workable rule is about 245g of dough per liter
of pan volume (260g/L for an open, unlidded pan; 275g/L for a denser crumb), equivalent
to filling a standard loaf pan to roughly 40-45% of its volume for sandwich bread, or
50-55% for a taller, richer loaf. Common round-number free-form dough weights line up
with standard banneton sizes: 500g and 750g for a small boule, 900g-1000g for a
9-10 inch/23-25cm boule or batard, and 1500g+ for a large bakery-style boule. Because
baker's percentage scales linearly, any formula can be rescaled to a target dough weight
by summing all percentages (including 100 for flour) to get "total formula %," dividing
the target dough weight by that sum to get the flour weight, then multiplying every
ingredient's percentage by that flour weight.

Sources:
- [The Pantry Mama: Dough Weights for Common Bread Shapes](https://pantrymama.com/dough-weights-for-common-bread-shapes/)
- [Whole Grain 100: How to Calculate Bread Dough to Fit Your Pan](http://www.wholegrain100.com/shaping--scoring-techniques-blog/calculate-bread-dough-to-fit-your-pan)
- [The Fresh Loaf: TIPS - dough ball sizes and weights for common bread shapes](https://www.thefreshloaf.com/node/23352/dough-ball-sizes-common-bread-shapes)
- [The Perfect Loaf: Introduction to Baker's Percentages](https://www.theperfectloaf.com/reference/introduction-to-bakers-percentages/)

## 8. Oven: temperature, steam, doneness, altitude

Typical oven temps: baguette and other lean hearth bread 220-250C (often started hot and
dropped partway through); sandwich and enriched loaves 175-190C (350-375F) for a gentler
rise before the crust sets; Neapolitan pizza 430C+ in a wood-fired oven (60-90 second
bake) versus 250-260C for a home-oven approximation. Steam matters only for the first
15-20 minutes of a lean-dough bake, while the loaf is still expanding, it delays crust
formation for maximum oven spring, gloss and blistering; once oven spring is done,
venting and finishing dry gives a properly hardened, browned crust. Internal doneness:
lean hearth bread 96-99C (205-210F, KA notes 190F/88C is the general "most breads are
done" floor); enriched, buttery/eggy loaves 82-88C (180-190F), pulled cooler because the
extra fat and sugar already tenderize the crumb and over-baking dries it out faster.
Altitude above roughly 900-1050m (3000-3500ft): cut yeast by about 25% to counter faster
proofing, add 1-2 extra tablespoons of water at 3000ft plus about 1.5 tsp per additional
1000ft (lower air pressure means faster evaporation), and raise oven temperature by
15-25F (8-14C) to set structure before the loaf over-expands.

Sources:
- [ThermoWorks: Cakes, Breads, Custards, and More - Doneness Temperatures](https://blog.thermoworks.com/baked-good-doneness-temps/)
- [The Perfect Loaf: How To Bake Bread with Steam in Your Home Oven](https://www.theperfectloaf.com/baking-with-steam-in-your-home-oven/)
- [AVPN: Disciplinare 2024](https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ENG.pdf)
- [King Arthur Baking: High-Altitude Baking](https://www.kingarthurbaking.com/learn/resources/high-altitude-baking)
