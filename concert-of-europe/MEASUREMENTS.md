# Measurements

Sweep results behind the design in CLAUDE.md. CLAUDE.md holds the rules; this file holds what was measured when they were made. Numbers here date from the change named in each heading and lag behind the code; rerun the sweep before relying on one.

## The ruler pool (at its replacement)

40 worlds, seeds 1–40, old pool → new: wars 42.1 → 33.1, uprisings 35.6 → 34.0, Ukraine alive 22 → 27, richest great power France 26 / Britain 10 / Russia 4 → France 24 / Britain 12 / Russia 4, Italy proclaimed 28 → 27, Survive nations alive 166/456 → 183/453. Wars fell because the old pool's hidden war "wants" (land worth more, revenge, legendary levies, isolated enemies) are gone.

A nation's share of Europe's gold a year over one reign, by rarity: Common ×0.97, Uncommon ×1.02, Rare ×1.03, Epic ×1.01, Legendary ×1.09. Per trait it swings about ±5% between runs, so only bigger gaps mean anything; the first tuning pass softened Tyrant, Stingy, Paranoid, Soldier, Bold, Reformer and Tolerant.

## Successions

A surviving great power sees about 6 heir cards a game, counting the opening one; small nations that die early see fewer.

## Thrift

Over 6 worlds: lavish rulers hold about 5 years of gold a year and spend about 4 times as much on building as thrifty ones, which hold about 10 years.

## Dreams merged into ambitions

40 worlds, seeds 1–40, before → after: wars 39.1 → 40.9, uprisings 35.2 → 33.8, Survive nations alive 170/464 → 176/460, Ukraine alive 22 → 27. Italy is proclaimed in 27 worlds instead of 37: before, the Papal States (ambition Survive) proclaimed Italy in about a quarter of the worlds where it formed; now they can't.

## Ambitions introduced

12 worlds, seeds 1–12, end year always autumn 1918. Before ambitions: 34.5 wars and 33.5 uprisings a world. With them: 37.3 and 35.4. The same scoring with the AI weights switched off (`ambitionW` back to 1.35, `surviveW` 1): 35.2 and 34.4, so the weights add about two wars a world.

| | Weights on | Weights off |
|---|---|---|
| Richest great power | France 7, Britain 4, Russia 1 | France 9, Britain 2, Russia 1 |
| Unions proclaimed (worlds out of 12) | German 12, Italy 11, Iberia 11, Bulgaria 6, Dacia 5, Poland 5, Hungary 2, Kalmar 2, Byzantine 2, Hetmanate 1, Illyria 0 | German 12, Italy 11, Iberia 9, Dacia 4, Poland 4, Bulgaria 2, Kalmar 2, Illyria 1, Hetmanate 1, Byzantine 0, Hungary 0 |
| Unions still held in 1918 | 34 (German 11, Italy 6, Iberia 6, Bulgaria 4, Dacia 4, Hungary, Byzantine, Poland 1 each) | 33 |
| Survive nations alive in 1918 | 48 of 134 (36%) | 57 of 140 (41%) |

The survive weight doesn't save small nations: they die slightly more often with it on, probably because the union weight makes the German Empire's nations swallow Hanover, Hesse, Saxony and Württemberg faster. Tune this together with union balance.


## Rule 2 shared events, state changes and complete records (12 November 2026)

Paired seeds 1–40, both run with six workers. Baseline: `b219ef2`. Implementation: the shared mutation/event implementation plus the uniform schema migration on `codex/rule2-refactor`. Every world on both sides reached **1918 Autumn**. Counts below mean actual simulation events or survival at the end, not forecasts.

| Metric | Baseline | Implementation |
|---|---:|---:|
| Wars per world | 43.0 | 43.5 |
| Uprisings per world | 34.2 | 33.1 |
| Ukraine alive at the armistice (worlds) | 29 | 22 |
| Richest great power: France (worlds) | 23 | 21 |
| Richest great power: Great Britain (worlds) | 15 | 17 |
| Richest great power: Russia (worlds) | 1 | 2 |
| Richest great power: Ottoman Empire (worlds) | 1 | 0 |
| Survive-ambition nations alive / all that existed | 131 / 434 | 137 / 416 |

| Union | Proclaimed before | Proclaimed after | Held at armistice before | Held at armistice after |
|---|---:|---:|---:|---:|
| German | 40 | 40 | 23 | 25 |
| Italian | 29 | 20 | 22 | 17 |
| Iberian | 32 | 26 | 20 | 13 |
| Romanian | 11 | 7 | 5 | 4 |
| Polish | 9 | 14 | 4 | 5 |
| Bulgarian | 5 | 10 | 1 | 5 |
| Greek | 2 | 6 | 1 | 5 |
| Ukrainian | 6 | 3 | 1 | 2 |
| Scandinavian | 4 | 7 | 1 | 3 |
| Hungarian | 2 | 2 | 0 | 1 |
| South Slav | 1 | 0 | 1 | 0 |

No coefficients, event odds, ruler strengths or union thresholds were tuned. The newborn grants, immediate unrest bounds, succession boundary, current leader and general-war construction intentionally change behavior and random-number consumption. The Ukraine-survival drop and union differences should be reviewed explicitly rather than dismissed as proof of equivalence.

The event-only step matched the pre-event version's entire seed-one Chronicle (794 lines) and core final state. Seed seven first differed in unrest in winter 1899 with the same RNG count: the new common bound removed excess unrest before drift (Bohemia 90.30370020344574 → 82.86370020344575; Lombardy 88.90399070319337 → 83.0315279137548). Its Chronicle first diverged in autumn 1907. This is the explicit unrest-bound fix, not a claim of event-refactor parity for all seeds.

The map-cut migration was checked against the baseline: geometry, adjacency, coastal flags and all 29 sea crossings were identical; only provenance metadata changed.

The schema-only step was compared with the third-step implementation on seeds one and seven: the entire Chronicles matched (947 and 804 lines), and the full final serialized states matched after explicitly migrating neutral fields and excluding the reshaped static trait catalogue and the old immutable naval-edge cache (now local rather than stored on state). Regions, countries, wars, history, statistics and the full Chronicle remained in that comparison. The seed-one normalized state SHA-256 was `cf5b4f52a16996e7225e63a52de290cd221890acc626df340c2301a56f30d7ed`; seed seven was `1426f73016fac44dedb1902a4d8558b43eeb308626ce36ce9f3d65d3928ba6f2`. This comparison caught and fixed a transient mandatory-civil-war regression before the reported sweep was rerun.

Generated sea paths now store their existing straight-line drawing explicitly instead of null; geometry/adjacency/coastlines are unchanged.

Final validation: the build passed all 34 tests; all 16 disposable juggle experiments passed (12 valid edits built and completed seed one, four invalid edits were rejected clearly by both commands). Shipping-world player runs for the first two starting nations, seeds one and seven, reached the armistice with finite strengths/gold, bounded unrest, balanced ledgers, unique acquisitions and exactly the development years for which the player was eligible. Their Chronicles had 892 and 738 lines. The final watch-mode seed-one Chronicle had no unfilled placeholders, `undefined` or `NaN`.

Browser visual inspection was unavailable because the preview tool blocked local file URLs. The build's Almanac rendering checks and the DOM-stub chooser/panel/Almanac regression passed; these do not establish visual layout quality.

## Review fixes: Great War window, player stand-in, leader snapshot, natural deaths at the boundary

Seeds 1–40, PR branch before and after. The Great War may only start in the summer of 1914 (as before the refactor); the player's stand-in ruler has neutral effects and is not named in the chronicle; the leader is fixed once a season again; a reign whose years run out ends at the closing boundary, so a revolution, abdication or coup in the same season is what ends it.

| | before | after |
|---|---|---|
| wars per world | 43.5 | 41.7 |
| uprisings per world | 33.1 | 33.8 |
| worlds ending 1918 Autumn | 40 | 40 |
| richest power (GBR/FRA/RUS) | 17/21/2 | 17/20/3 |
| unions proclaimed | ger 40, ibe 26, ita 20, pol 14, bul 10, rom 7, sca 7, gre 6, ukr 3, hun 2 | ger 39, ita 28, ibe 27, pol 13, sca 7, bul 6, rom 6, hun 4, ukr 2, gre 1, yug 1 |
| unions held in 1918 | ger 25, ita 17, ibe 13, bul 5, gre 5, pol 5, rom 4, sca 3, ukr 2, hun 1 | ger 30, ita 19, ibe 14, bul 5, pol 4, sca 4, hun 2, rom 1, ukr 1, yug 1 |
| Survive nations alive at the end | 137 of 416 | 138 of 430 |

Every count is of events happening, except "held" and "alive", which count what survives to the armistice. The differences are within the spread of 40 worlds and come mostly from changed RNG order.
