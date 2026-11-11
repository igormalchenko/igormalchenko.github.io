# Why military advances often fail to change governor behaviour

Historical investigation of the original twelve-card POC, before the subsequent thirty-card refresh. Investigated 11 November 2026. This is a diagnosis, not an implementation proposal. No game source or original project file was changed.

## Main finding

The governor values additional soldiers as protection against loss. It does not assign recruitment the value of a profitable conquest those additional soldiers might enable. Invasion is evaluated with the army already present. The two calculations therefore omit the connection between preparing an army and exploiting it offensively.

The POC discounts existing cost and combat formulas; it does not introduce offensive planning or change the governor's objectives. Cheaper recruitment is correctly applied, but often improves a negative recruitment score without making it positive.

## What was investigated

- Traced the actual recruitment, demobilisation, invasion, strength, income and advance code.
- Decomposed the next recruitment increments for France, Prussia and Portugal in worlds 7 and 41.
- At each identical state compared baseline, actual recruitment/upkeep/combat/casualty cards, a combination of actual military cards, hypothetical free recruitment, and hypothetical free recruitment plus free upkeep.
- Followed a no-advance France world to 1860, 1888 and 1900 and repeated the same-state checks.
- Asserted that the decomposed recruitment scores match the actual candidate scores where recruitment is affordable.
- Checked that recruitment/upkeep discounts leave the same-state invasion scores and estimated win probabilities unchanged in all six opening cases.

Instrumentation only changes an in-memory copy of the simulation. It exposes intermediate calculations and, for diagnosis only, permits inspecting wars below the usual odds threshold. Those otherwise rejected wars are not actual available actions. The game on disk is unchanged.

These are deterministic diagnostic cases, not a statistical balance study or a reconstruction of the user's individual games.

## Recruitment credits defence, not offensive opportunity

In `src/sim.js:531`, the recruitment score contains:

1. Reduction in expected losses to neighbours.
2. Reduction in anticipated general-war vulnerability (a separate date-based term that starts increasing after 1888).
3. Minus economic production lost when workers join the army.
4. Minus upkeep over the ruler's planning horizon.
5. Minus the recruitment price.
6. An additional recruitment incentive if already at war.

There is no term for gains from a conquest enabled by those recruits. The invasion calculation at `src/sim.js:332` uses the existing army. Performing up to four actions per season does not solve this: the governor chooses each action separately and rejects nonpositive actions, rather than valuing a recruit-then-invade sequence.

The horizon of 15–28 years in these opening cases is a duration over which individual action costs and benefits are estimated; it is not a search through that many years of possible actions.

## Discounts improve scores without crossing the decision threshold

Scores below are internal forecast values, not cash charges. They refer to the smaller of the two contemplated recruitment increments, at the same initial state. Some increments also fail the separate affordability gate.

| Nation / world | Normal recruitment | Actual recruitment discount | Hypothetical free recruitment | Hypothetical free recruitment and upkeep |
| --- | ---: | ---: | ---: | ---: |
| France / 7 | -117.9 | -97.5 | -66.8 | -10.1 |
| Prussia / 7 | -74.9 | -63.7 | -46.9 | -5.2 |
| Portugal / 7 | -68.8 | -56.3 | -37.5 | -0.8 |
| France / 41 | -99.1 | -84.7 | -63.0 | -9.1 |
| Prussia / 41 | -74.9 | -56.7 | -29.4 | +10.0 |
| Portugal / 41 | -54.3 | -42.4 | -24.5 | -0.5 |

All six smaller increments remain unattractive even with recruitment made completely free. Removing upkeep too still leaves five negative, because the workforce cost remains and little or no additional protection is needed. Prussia / 41 is the exception: there is enough defensive benefit for an army increase to become worthwhile when both monetary costs disappear.

For Prussia / 7, the approximately -74.9 baseline comprises no defensive benefit, about 5.2 of lost production, 41.7 of horizon-weighted upkeep, and 27.9 of recruitment expense. Discounting recruitment changes only the last component, to about 16.8. The result remains approximately -63.7.

## Recruitment discounts do not enter the invasion forecast

The invasion forecast uses combat odds, expected territorial revenue, integration delay, possible loot, casualty costs, trade disruption, defeat costs and an infamy penalty.

Its casualty estimate is `army * 0.05 * years * 2 * bleed * goldValue`. It does not use the recruitment price multiplier or `RULES.price.recruit`. Thus cheaper recruits do not lower the forecast casualty/replacement expense. This is a separate modelling disconnect; whether the fixed factor was intended as an abstract casualty cost would need a design decision.

Lower upkeep also leaves the invasion forecast unchanged at a fixed army size. That is not necessarily an error, because the same standing army incurs upkeep in peace too. Its potential influence is through the desirability of having more soldiers in the first place.

All same-state invasion scores and win probabilities were identical for the baseline, recruitment-discount and upkeep-discount variants in the six opening cases. Combat-strength and casualty bonuses do enter invasion evaluation.

## Winning is not enough to make conquest attractive

France / 7 estimated a 95.5% chance of beating Belgium for Flanders. The invasion score was still -76.4. Its forecast gross gain was about 108.5; the infamy penalty alone was 125, followed by casualty, disruption and defeat-risk costs. These are internal values rather than literal payments.

Other barriers visible in the code include:

- Lost trade during war, especially significant for a wealthy trading power.
- Delayed returns from integration and unrest in conquered provinces.
- Administration penalties that can reduce revenue from all existing territory when another province is acquired.
- Expected intervention by other great powers and enemy alliances.
- Elevated penalties for eliminating a one-province nation, especially before 1860.
- Different ambition weights: unification territory is worth more; survival-oriented nations penalise losses more.
- Hard eligibility gates: alliances and truces block a war; the governor also requires sufficient confidence, acceptable unrest, adequate finances, and no current war before proposing an invasion.

More soldiers address some combat and deterrence terms, but do not remove most of those barriers. At France's later states, the best inspected foreign province could even have negative marginal annual revenue after the administration penalty.

## Better soldiers can reduce the desire to recruit

In Prussia / 41, the next recruitment increment normally prevented about 13.6 of expected losses. With the artillery advantage, that marginal defensive benefit fell to zero: the existing army already deterred the relevant threat. The recruitment score therefore became worse, from roughly -74.9 to -88.5.

This is consistent with the previous actual-action comparison in which artillery caused an additional demobilisation action in a different Prussia starting world. A governor buying security can use stronger soldiers to maintain the same security with fewer men.

## Late-game pressure is defensive too

The separate anticipated general-war term starts increasing after 1888. In the France / 7 state reached in 1900, it credited the next army increase with about 25.1 of protection, but production, upkeep and recruitment still outweighed that benefit: the score was -35.7 normally and -32.3 with cheaper recruitment. This term encourages preparation for the expected general war rather than an independent conquest programme.

## Interpretation

The bonuses are connected to actual arithmetic. The missing connection is chiefly between offensive preparation and its downstream reward. Safe nations can rationally prefer saving, building and demobilising under the current scoring rules, even after military discounts. Stronger countries may deter wars; richer countries may find war increasingly disruptive.

The evidence does not show that military advances can never change behaviour. They can matter during war, under a real threat, or when an already feasible invasion is near profitability. It does show why simply reducing recruitment prices cannot be expected to create a large conquering army under the current governor.

The relevant research distinction is between evaluating individual actions and planning prerequisite actions toward a later goal. Chan et al.'s [Online Planning for Resource Production in Real-Time Strategy Games](https://cdn.aaai.org/ICAPS/2007/ICAPS07-009.pdf) explicitly constructs action sequences toward production goals. That provides a conceptual comparison, not evidence about this game's behaviour; the game-specific conclusions above come from its source and diagnostic runs.

## Reproduction

Run `node research/investigate-military.js` from this POC folder. It writes `research/military-diagnostics.json`. The diagnostic script reads only this folder's engine, data and map, and modifies only its in-memory loaded source. The output includes all cost components, invasion terms, conditional future army sizes and later snapshots.
