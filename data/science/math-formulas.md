# Panarium math formulas, explained

Companion prose for `math-formulas.json`. Each section explains what the formula is,
when a baker or the calculator should reach for it, walks through the worked example
from the JSON, and lists the sources actually fetched for it.

## 1. Baker's percentage

Baker's percentage is the accounting system behind every other formula here: every
ingredient is expressed as a percentage of total flour weight, and flour itself is
always fixed at 100%, even though the other percentages will add up to well over 100%.
Use it any time you need to scale a formula up or down, compare two recipes on equal
footing, or feed numbers into a calculator, since weights alone don't compare across
batch sizes. Worked example: with 10 kg flour and 3.5 kg water, water_pct =
(3.5/10)*100 = 35%. Reversed, at 35% water and 10 kg flour, water_weight =
10*(35/100) = 3.5 kg. Both King Arthur and Wikipedia state the identical formula.

Sources:
- [King Arthur Baking: Baker's Percentage](https://www.kingarthurbaking.com/pro/reference/bakers-percentage)
- [Wikipedia: Baker percentage](https://en.wikipedia.org/wiki/Baker_percentage)

## 2. Hydration from ingredients

Plain hydration is just water divided by flour, but enriched doughs (milk, egg,
butter, cream) carry hidden water that a simple water-to-flour ratio misses entirely.
Use the fuller formula whenever a formula includes anything besides flour, water,
salt and yeast, especially for comparing an enriched dough's real hydration against a
lean one. Convert each enrichment to its water-equivalent (milk 87%, egg 75%, butter
16%, since butter is about 83% fat) before dividing by flour. Worked example (Bread,
Cakes and Ale's Santa Lucia crown, 500g flour): 125g milk contributes 108.75g water,
plus 125g plain water, plus 110g egg at 82.5g water, plus 50g butter at 8g water,
totals 324.25g effective water, or 64.85% hydration, matching the source's own 64.9%.

Sources:
- [Bread, Cakes And Ale: The hydration of enriched doughs](https://breadcakesandale.com/2021/12/14/the-hydration-of-enriched-doughs/)
- [King Arthur Baking: Hydration in bread dough, explained](https://www.kingarthurbaking.com/blog/2023/01/11/bread-hydration)

## 3. Hydration ceiling from flour protein

Higher-protein flour holds more water, so swapping flours without adjusting hydration
either leaves a shaggy, underhydrated dough or an overhydrated, slack one. Busby's
Bakery gives a specific rule of thumb: for every 1 percentage point of protein gained,
raise hydration by about 2.5 percentage points. Use it when substituting all-purpose
for bread flour or vice versa, or when switching brands entirely. Worked example:
moving from King Arthur all-purpose (11.7% protein) to King Arthur bread flour (12.7%
protein) in a 65%-hydration formula suggests 65 + 2.5*(12.7-11.7) = 67.5% hydration. A
peer-reviewed mixograph study confirms absorption rises linearly with protein, but
cautions the slope depends on wheat variety, so treat 2.5 as a starting estimate, not
a constant.

Sources:
- [Busby's Bakery: How To Master Dough Hydration](https://www.busbysbakery.com/dough-hydration/)
- [King Arthur Baking: Protein percentage in flour, why it matters](https://www.kingarthurbaking.com/blog/2023/09/25/protein-percentage)
- [J-Stage: Measurement of Water Absorption in Wheat Flour by Mixograph Test](https://www.jstage.jst.go.jp/article/fstr/22/6/22_841/_html/-char/en)

## 4. Fat and sugar thresholds in enriched dough

Fat coats gluten-forming proteins and shortens gluten strands, which is exactly what
gives enriched crumb its softness, at a cost to dough strength. The traditional rule
holds fat back until after gluten development once it passes about 10% of flour
weight, mixing it in from the start below that. Use this when building a brioche or
milk-bread formula and deciding on a mixing method. Worked example: a 500g-flour dough
at 10% fat (50g) mixes fine from the start; a 40% brioche traditionally waits, though
ChainBaker's own newer testing mixed 40% fat in from the beginning without problems,
an active disagreement worth flagging. Sugar's effect is not a single cutoff either: a
fermentation trial found CO2 output peaking at 7% sucrose (203.7 mL after 3h, versus
107.9 mL unsweetened), only dropping below the unsweetened baseline at 21% (94.3 mL).

Sources:
- [The Perfect Loaf: What Does Butter Do to Bread Dough?](https://www.theperfectloaf.com/what-does-butter-do-to-bread-dough/)
- [ChainBaker: How Much Fat Should You Add to Bread Dough?](https://www.chainbaker.com/fat-percentage/)
- [PMC: Sugar Levels Determine Fermentation Dynamics in Yeast Pastry Making](https://pmc.ncbi.nlm.nih.gov/articles/PMC9140867/)

## 5. Desired dough temperature (3-factor)

This is the standard trick for hitting a target dough temperature by solving for the
one variable a baker fully controls: water temperature. Multiply the desired dough
temperature (DDT) by the number of factors being summed (three, for a straight dough:
room, flour, friction), then subtract the three known temperatures. Use it every time
you mix a straight dough and want consistent, repeatable results regardless of season.
Worked example straight from King Arthur: target DDT 78F, flour 71F, room 72F,
stand-mixer friction factor 22F, so water_temp = 78*3 - 72 - 71 - 22 = 69F. Busby's
Bakery states an identical formula independently in Celsius, confirming it is a
general convention, not one publisher's house method.

Sources:
- [King Arthur Baking: Desired dough temperature](https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature)
- [Busby's Bakery: Desired Dough Temperature](https://www.busbysbakery.com/desired-dough-temperature/)

## 6. Desired dough temperature with preferment (4-factor)

When a preferment (levain, poolish, biga) joins the mix, its own temperature becomes a
fourth factor pulling the average, so the formula multiplies DDT by 4 instead of 3 and
subtracts one more term. Use it for any bread built on a preferment rather than a
straight dough. Worked example: target DDT 78F, flour 71F, room 72F, stand-mixer
friction 22F, ripe levain 76F, so water_temp = 78*4 - 72 - 71 - 22 - 76 = 71F. Both
King Arthur and Busby's Bakery state this extension identically. Worth noting: Andrew
Janjigian at Wordloaf argues for a refinement where the preferment's term is weighted
by its percentage of the total formula, reasoning that a small levain should sway the
average less than a large one, an alternative worth testing against the classic form.

Sources:
- [King Arthur Baking: Desired dough temperature](https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature)
- [Busby's Bakery: Desired Dough Temperature](https://www.busbysbakery.com/desired-dough-temperature/)
- [Wordloaf: Class Time, Desired Dough Temperature 101](https://newsletter.wordloaf.org/class-time-desired-dough-temperature/)

## 7. Friction factor calibration

Friction factor is the temperature rise mixing itself imparts to dough, and every
source agrees it should be measured for your own equipment rather than assumed. King
Arthur's own worked correction shows how: after a batch comes out off-target, adjust
the assumed friction factor by exactly the shortfall for next time. Use it after your
first few DDT calculations with a given mixer to dial the estimate in. Worked example:
assuming friction_factor=24F yields a dough that measures 75F against a 77F target (2F
short), so friction_factor_next = 24 - (77-75) = 22F going forward. Starting points
before calibration: hand kneading 6-8F, home stand mixer 22-24F, spiral or commercial
mixer 24-28F per Hamelman, all in Fahrenheit in the source material.

Sources:
- [King Arthur Baking: Determining the friction factor in baking](https://www.kingarthurbaking.com/blog/2018/08/27/determining-the-friction-factor-in-baking)
- [King Arthur Baking: Desired dough temperature](https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature)

## 8. Yeast conversion (fresh, active dry, instant)

Recipes list whichever yeast the author had on hand, so converting between fresh,
active dry and instant is a routine calculator task. King Arthur's professional chart
gives fresh times 0.4 for active dry and times 0.33 for instant, while a simpler home
rule (halve, then third) is close but slightly richer. Use whichever matches your
source recipe's own convention rather than mixing them. Worked example: 30g fresh
yeast converts to 12g active dry or 9.9g instant on King Arthur's professional ratio,
versus 15g active dry or 10g instant on the simplified home rule. Many calculator
sites separately claim instant yeast is 25% more potent by weight than active dry, but
King Arthur's own blog and Red Star's chart both treat the two as interchangeable 1:1
in practice, a real disagreement between casual and manufacturer sources.

Sources:
- [King Arthur Baking: Yeast (pro reference)](https://www.kingarthurbaking.com/pro/reference/yeast)
- [King Arthur Baking: Active dry vs. instant yeast](https://www.kingarthurbaking.com/blog/2022/08/15/active-dry-versus-instant-yeast)
- [Red Star Yeast: Yeast Conversion Chart](https://redstaryeast.com/yeast-conversion-chart/)

## 9. Fermentation time-temperature scaling

Fermentation rate is highly sensitive to dough temperature, and bakers lean on a
doubling rule to replan timing across seasons: pick a reference time and temperature,
then double or halve the time for every step of the doubling interval you move away
from it. Use it to replan a bulk ferment when your kitchen runs warmer or cooler than
a recipe assumed. The catch: sources disagree on the interval itself. The Sourdough
Journey states fermentation time doubles or halves every 15F/8C; Weekend Bakery states
it roughly doubles every 5C, a materially tighter interval. Worked example: a 4h bulk
at 24C becomes about 8h at 16C under the 8C rule, but the same doubling would already
happen by 19C under the 5C rule. Below about 4C, cold retard is described as nearly
suspending yeast activity while acid bacteria keep working.

Sources:
- [The Sourdough Journey: FAQ, Bulk Fermentation Timing](https://thesourdoughjourney.com/faq-bulk-fermentation-timing/)
- [Weekend Bakery: The Temperature Equation](https://www.weekendbakery.com/posts/the-temperature-equation-timing-your-fermentation/)
- [The Perfect Loaf: Build Your Own Dough Retarder](https://www.theperfectloaf.com/build-your-own-dough-retarder/)

## 10. Levain build ratio and inoculation

A levain build ratio (starter:flour:water) sets both hydration and, more importantly,
inoculation percentage, the share of the total build that is already-fermented
starter, which drives how fast it peaks. Use a small inoculation (5-10%) for a slow
overnight build with more sour development, and a large one (50-100%) when you need a
levain ready in a few hours. Worked example: a 1:5:5 build (20g starter, 100g flour,
100g water) gives inoculation_pct = 20/220*100 = 9.1%, expected to peak in 16 or more
hours at room temperature, versus 3-4 hours for a 1:1:1, 100%-inoculation build.
Hydration also shapes flavor: stiff levain (50-65%) favors tangier acetic acid, liquid
levain (100%+) favors milder lactic acid.

Sources:
- [The Perfect Loaf: Starter & Levain Calculator](https://www.theperfectloaf.com/starter-and-levain-calculator/)
- [EpicBaker: Levain Build Basics](https://epicbaker.com/bread-sourdough/levain-build-ratios/)

## 11. Prefermented flour percentage

This is the share of total flour that ferments in a preferment (poolish, biga,
levain) before final mixing, and it is one of the biggest levers over a bread's flavor
and crumb, independent of hydration. Use it to characterize or compare formulas across
styles, or to build a new preferment-based bread from scratch. Worked example: King
Arthur's professional ciabatta uses 3kg biga flour against 7kg final-dough flour, 10kg
total, so prefermented_flour_pct = 3/10*100 = 30%, with the biga fermented about 16
hours first. Typical ranges by style: poolish for baguette 20-40% of flour, levain for
country sourdough 15-25% (occasionally 10-50%), and mixed rye formulas 30-50% or more,
since rye needs acid to bake well rather than gluten development.

Sources:
- [King Arthur Baking: Ciabatta (pro formula)](https://www.kingarthurbaking.com/pro/formulas/ciabatta)
- [The Dough Formula: Preferments 101](https://thedoughformula.com/fundamentals/preferments-101/)

## 12. Salt by flour weight

Salt is one of the most consistent numbers in all of bread baking: nearly every
professional formula lands within a narrow 1.8-2.2% of flour weight, regardless of
style. Use the plain baker's-percentage formula to convert a target salt percentage
into grams for any batch size. Worked example: at 1000g total flour and 2% salt,
salt_weight = 1000*(2/100) = 20g. Named formulas cluster tightly around that range:
Hamelman runs 1.8-2%, Robertson about 2%, Forkish 2.1-2.2%. Below roughly 1.5% the
dough ferments noticeably faster and tastes flat; above roughly 2.5%, both yeast
activity and gluten strength start to suffer, which is why the range is so narrow
across otherwise very different bread styles.

Sources:
- [JayArr Bread: Baker's Percentages Explained (With Examples)](https://jayarrbread.com/blog/bakers-percentages-explained/)
- [The Lakehouse Bakery: Knead to Know #3, Baker's Percentages](https://www.thelakehousebakery.com/post/knead-to-know-3-baker-s-percentages-the-language-of-bread)

## 13. Dough weight from pan volume

Fitting a formula to a specific pan means converting pan volume into a target dough
weight, and this is the formula with the widest disagreement in this whole set. Use it
when scaling a recipe to a pan of unfamiliar size. Two rival models exist: a
low-density model (about 0.25 g/cm3, i.e. pan_volume divided by 4) and a
"magic-number" model that divides pan volume by a bread-type-specific constant (white
bread 1.78, half-wholemeal 1.71, wholemeal 1.66, giving 0.56-0.60 g/cm3). Worked
example: a 2400 cm3 pan needs about 600g dough under the low-density model (matching
one baker's actual 580g loaf) but about 1349g under the magic-number model, over twice
as much for the identical pan, so pick a model and stay consistent with it.

Sources:
- [Princess Bamboo: How To Calculate Bread Dough To Fit Your Pan](https://princessbamboo.com/how-to-calculate-bread-dough-to-fit-your-pan/)
- [Bake With Jack: How much Bread Dough fits my Tin?](https://www.bakewithjack.co.uk/blog-1/loaf-tin-volume)
- [The Pantry Mama: Dough Weights for Common Bread Shapes](https://pantrymama.com/dough-weights-for-common-bread-shapes/)

## 14. Total dough weight from piece count

Working backward from how many finished loaves or rolls you need to a total dough
weight, and then to a flour weight, is the everyday scaling task behind any multi-item
bake. Add a small bench allowance to the raw sum of piece weights to cover
rounding and trim loss, then divide by the formula's total percentage to find flour
weight. Use it whenever you're baking a mixed batch (one loaf plus several rolls, say)
rather than a single uniform piece count. Worked example: 1 loaf (950g) plus 4 rolls
(80g each) totals 1270g, plus a 10g bench allowance is 1280g target dough; if a base
recipe yields 961g dough from 570g flour, the scale factor is 1280/961 = 1.33, so new
flour weight is 570*1.33 = 758g, with every other ingredient scaled the same way.

Sources:
- [Busby's Bakery: Bakers Percentages & Bakers Formula](https://www.busbysbakery.com/bakers-percentages-bakers-formula/)
- [The Perfect Loaf: Introduction to Baker's Percentages](https://www.theperfectloaf.com/reference/introduction-to-bakers-percentages/)

## 15. Scaling weight from bake loss

A loaf loses weight to evaporation during proofing, baking and cooling, so hitting a
specific finished weight means scaling the raw dough heavier than the target by that
loss percentage. Use it in a production setting where a specific finished product
weight matters (for pricing or packaging), rather than home baking where a bit of
variance is fine. Worked example: a finished 800g sandwich loaf losing 10-12% of its
weight needs scaling_weight = 800/(1-0.10) = 889g to 800/(1-0.12) = 909g, matching the
commonly cited practical range of 890-900g almost exactly. This lines up neatly with
the plain algebraic rearrangement of baking-loss percentage, so the two sources
corroborate each other closely rather than conflicting.

Sources:
- [IREKS Compendium: Scaling weight, Baking loss, Baked goods yield](https://www.ireks-kompendium.com/en/the-baking-process/135-scaling-weight/baking-loss/baked-goods-yield)
- [SG Systems Global: Dough Scaling glossary](https://sgsystemsglobal.com/glossary/dough-scaling/)
