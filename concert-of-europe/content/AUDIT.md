# Content audit (November 2026)

Every kind of thing the player can meet in the game, where it was defined before the move to `content/`, every other place its words or numbers were repeated, and what was wrong. The "Now" column says where it lives after the move.

## Inventory

| Kind | Count | Was defined in | Also repeated in | Now |
|---|---|---|---|---|
| Rulers (quirks) | 33 | `TRAITS`, sim.js | Effect numbers typed again across sim.js (≈60 places); emblems in registry.js; CLAUDE.md "ruler pool" | `rulers.json` |
| Rarities | 5 | names and colours `TIER` in registry.js, odds `TIER_ODDS` in sim.js | CLAUDE.md percentages | `rarities.json` |
| Temperaments | 3 (9 tags) | tag words and thresholds in panel.js | CLAUDE.md | `temperaments.json` |
| How a reign ends | 6 ways | `endReign`, `successions`, the coup event, `endWar` (sim.js) | CLAUDE.md "How a reign ends" | `rules.json` (`reign`) |
| Nations of 1836 | 24 | `COUNTRIES`, data.js | starting relations and alliances in sim.js; papal names twice in sim.js; Switzerland's council special-cased by tag in six places | `nations.json` |
| Breakaway nations | 22 (16 new, 6 restorations) | `TEMPLATES`, data.js | six of them copy a 1836 nation's name, adjective, prefix and colour | `breakaways.json` |
| Peoples | 30 | nowhere: bare strings in provinces, nations, dreams, `NAMES`, the awakening event | | `peoples.json` |
| Provinces | 76 | `REGIONS`, data.js (positional arrays) | `COASTAL` list in sim.js (dead: the map decides) | `provinces.json` |
| Sea crossings, sea points | 11, 54 | `NAVAL`, `SEA`, data.js | | `map.json` |
| National dreams | 11 | `DREAMS`, inside `createSim` | CLAUDE.md table | `dreams.json` |
| Ambitions | 3 | `setAmbition`, `ambitionW`, `surviveW` (sim.js) | labels and descriptions in panel.js (three places), help text, opening chronicle line, CLAUDE.md | `ambitions.json` |
| Events | 18 | `EVENTS`, sim.js (numbers in code and again in the text) | help text | `events.json` |
| Military eras | 5 | the first in `S`, the other four inside an event | | `eras.json` |
| Landmarks | 3 | `LANDMARKS`, sim.js; their effects matched by name string | CLAUDE.md | `landmarks.json` |
| Concepts (Gold, Army…) | 51 + 3 words | `REG`, `WORDS`, registry.js | numbers in their descriptions (build times, unrest thresholds, reroll count) typed by hand | `concepts.json` (drawings stay in registry.js) |
| Game rules shown to the player | ≈25 numbers | scattered through sim.js, panel.js, main.js | help text, registry descriptions, map key | `rules.json` |

## How the move was proven

Before anything moved, 12 worlds (seeds 1–12) and 5 player games (with heir picks and rerolls) were recorded in full:
- every chronicle line, construction included
- every heir card's text
- every province's and nation's final state, to six decimals

After the move, the same runs match character for character, and so does `npm run sweep -- 1 13`.

## Findings

**The same number in two or three places (the main problem).** Every ruler's effect was written once as prose in `desc` and once as a literal in the engine, with CLAUDE.md a third copy. Nothing linked them. Examples: Conqueror "40% harder" vs `1.4` in `quality`; Builder "30% less" vs `0.7` in `considerations`; Sun King "three years" vs `* 4 * 3` in `endReign`; Genius "twice as fast" vs `left: 2` vs `4` in `act`. The same goes for:
- the registry ("Takes four seasons", "at 65 or more")
- the reroll text ("Three free rerolls")
- the help text ("worth twice its gold a year", "half again")
- events ("one in twenty dies" vs `pop *= 0.95`)

Now every number lives in `content/` and the text is filled in from it.

**Two names for one thing.**
- A disputed succession is "Civil war" in the registry, on the map and in the Conqueror's card, but "Succession crisis" in the chronicle heading and CLAUDE.md. Kept as-is in the text for now, since the chronicle shows both (crisis → civil war). Flagged for a decision.
- "Kingdom of Italy" (the dream) and "Italian Republic" (the breakaway) are both Italian nations. That's intended, not a bug.

**Text that says more than the engine does.**
- Admirer: "joins every war it fights". The engine joins 90% of the time (`chance(0.9)`).
- Lecher's crisis is said to be certain, and is.
- Chauvinist: "stops accepting the {culture}, for good". True only until a Tolerant or Liberator heir accepts them again. Wording kept; noted.

**Copies of data.**
- Six breakaways (Greece, Serbia, Belgium, Denmark, the Netherlands, Portugal) repeated their 1836 nation's name, adjective, prefix and colour. They now point at the nation (`restores`).
- Greece and Serbia's breakaway versions have no programme, while the 1836 ones do. Kept as it was (same behaviour) and noted.
- Papal names were typed twice in sim.js. They now live once in `nations.json`.

**Concepts with no entity.** Peoples (cultures) were bare strings in four files; a typo would silently create a new people. They now come from `peoples.json`, and the build fails on a people that isn't listed there.

**Dead code and dead data.**
- `COASTAL` in sim.js and `buildGeometry` in data.js were unused: the map builder decides coasts and neighbours. Removed.
- Nations carried `col` and `coastal` (left over from the removed colonies) and four leaning numbers of which the engine read two. Now each nation has `hawk` and `patience` only.

**A war that never starts.** In the ultimatum event, the branch where the rival refuses and war begins never fired in 17 test games (12 worlds plus 5 player games). Had it fired, the chronicle would have printed one war name while the engine filed the war under the next one ("Second …"). The name is fixed. Why the branch never fires is still open: the rival nearly always backs down, because the attacker only sends an ultimatum when it already believes it will win.

**Words the interface avoids, used as data keys.** The `income` effect is now `earns`, since the Almanac shows effect names and the registry avoids "income".

**Hand-counted text.** The opening chronicle line said "Twenty-four nations" as a typed word. It now counts the nations.

**Not moved on purpose.**
- The forecasting maths (tax rates, the win-chance curve, the AI's weights): these are the engine, not content.
- Chronicle sentences about wars, peace, diplomacy and uprisings: their numbers are live state (gold paid, odds), not constants.
- Drawings: they stay in `registry.js` and `EMB`, keyed by the same ids as the content.
