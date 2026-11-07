# Concert of Europe

A grand strategy game that plays itself. Europe, 1836 to the armistice of 1918: twenty-five states, each run by the same small AI with its own ruler and temperament, compete to have the largest income when the Great War ends. You watch, one season per click.

## Why this exists

This started as a question, not a game design. Paradox's *Victoria 2* has one of the best settings in strategy gaming, but it asks the player to make too many decisions at once. The small studio Clarus Victoria (*Marble Age*, *Predynastic Egypt*) shows how much a historical strategy game can be simplified and still work. The idea was something in between: a Victoria-like world with far fewer moving parts, built entirely by prompting an AI coding assistant ("vibe coding") as a personal project.

The engine was never the worry. A turn-based simulation is a few hundred lines of state and arithmetic. The open question was the **AI**: is strategy-game AI a pile of easy scripts, or does it get hard before it gets interesting? The quickest way to find out was to build the AI first, with no player at all, and see whether watching it was worth anything.

So this is a zero-player prototype: a test bench for opponents. If a world full of AI nations is interesting to watch on its own, adding a player later is the easy part, because the AI already lists every option it has. A player is just a country whose options get shown instead of chosen.

## What we learned along the way

- **The AI code is small; the tuning is the work.** The decision loop is one function. Almost all of the effort went into running dozens of headless worlds, reading the chronicles, and adjusting.
- **Reflexes are not a strategy.** The first AI scored each option with a hand-tuned "urge" and felt aimless. It got readable once every nation shared one goal (income in 1918) and every decision became a forecast in gold: what this adds or protects over the years my ruler plans ahead, minus what it costs.
- **Rational actors in a deterrence system mostly don't fight.** Once the AI could see exactly what a war would cost, Europe went quiet. History's wars come from miscalculation and shocks, so the game adds them on purpose: rulers who misjudge their odds, quirks, succession crises, ultimatums, military revolutions, national awakenings.
- **Every number should be visible or hidden, never in between.** Stats that changed nothing you could see (prestige, colonies, great-power status) were cut. Plumbing the player shouldn't care about (infamy, relations maths) stays hidden. Everything else shows up on the map.
- **Counterweights stop snowballs.** The game works because growth costs something you can see: conquered land pays little while it integrates, big states are harder to run, soldiers are workers missing from the economy, seaports trade only in peace, and great powers gang up on whoever leads.

## How it plays

Each season, every country:

1. collects taxes, factory output and sea trade, minus army upkeep;
2. forecasts the value of every option (build a factory, fortify a border, recruit, reform, court an ally, unite by treaty, invade a neighbour) as gold over its ruler's planning horizon;
3. does every option that pays, best first.

Around that loop: wars are fought province by province (occupation, front lines, peace terms), unrest builds among subject peoples and factory workers until provinces revolt or break away, national dreams (German Empire, Greater Ukraine, United Scandinavia, and others) can be proclaimed, and a deck of dated and random events shakes things up. In summer 1914 the two most hostile powers go to war, the alliances drag everyone in, and in autumn 1918 the armistice ends the game. The richest nation wins.

Click any province or country to see its ruler, budget, forecasts and history.

You can watch, or rule one country. A ruling player makes no day-to-day decisions: the country's ministers (the same AI as everyone else) run the state, and the player chooses its sovereign from three very different heirs in 1836 and at every succession. The game pauses for each choice.

## Running it

The game is one self-contained HTML file. Open `index.html` in a browser (it is also what GitHub Pages serves); it needs no server and no install.

To work on it you need Node 18 or later:

```bash
npm install          # only needed for regenerating the map
npm run build        # assemble index.html from src/ and map/geo.json
npm run sweep -- 1 13    # play worlds 1..12 headlessly, one summary line each
npm run chronicle -- 7   # print the full history of world 7
npm run map          # regenerate map/geo.json from the coastline data, then build
```

`build`, `sweep` and `chronicle` use no dependencies. `map` needs the dev dependencies for coastline data and polygon clipping.

## Project layout

```
src/data.js            provinces, countries, cultures, breakaway nations, map anchors
src/sim.js             the whole simulation: economy, AI, wars, unrest, rulers, events, dreams
src/ui/registry.js     every concept once: name, description, icon, words to avoid
tools/check.js         consistency check run by npm run build
src/ui/map.js          map rendering: provinces, icons, markers, front lines, overlays
src/ui/panel.js        side panel: Chronicle, Powers, Nation and Province tabs, end screen
src/ui/main.js         controls, hover card, selection, map key
src/ui/index.template.html   page layout and styles; build.js fills in the scripts
map/build-map.js       generates map/geo.json (provinces, borders, coastlines, sea crossings)
map/geo.json           generated map data (committed so building needs no dependencies)
tools/                 build, sweep and chronicle scripts
index.html             the built game (generated; served by GitHub Pages)
```

## Where it stands (v0.6)

In a typical sweep of 10–12 worlds:

| | Typical |
|---|---|
| Wars per game | 15–40 |
| Uprisings per game | 20–40 |
| Ukraine alive in 1918 | about 7 in 10 worlds |
| Winners | mostly France and Britain, sometimes Russia or Germany |

Each world takes 10–25 seconds to play headlessly.

Known weak spots:

- France and Britain win most worlds: few restless minorities, while the multinational empires bleed from revolts.
- The Iberian union forms too easily once Spain takes Portugal.
- Map icons are small when zoomed out.
- Some forecast reasons are terse ("risk rises by 0").
- Scores have no sense of scale (is 78 a lot?).
- Each season takes about 30 ms to compute, so the fastest speed runs a little slow.

Ideas not built yet: armies shown at the fronts (split per border, without full movement AI), a playable country using the same option list, one visible national bonus per great power, and other settings or eras (the engine is generic; the data and events are not).
