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
