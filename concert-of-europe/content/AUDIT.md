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
| Breakaway nations | 22 (16 new, 6 restorations) | `TEMPLATES`, data.js | six of them copy a 1836 nation's name, adjective, prefix and colour | `breakaways.json`, since folded into `nations.json` |
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
- A disputed succession was "Civil war" in the registry, on the map and on the Conqueror's card, but "Succession crisis" in the chronicle heading and CLAUDE.md. **Resolved:** it is "Civil war" everywhere, and the build now refuses "succession crisis" in visible text.
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

## Settled since

- **Civil war** is the one name for a disputed succession.
- **Dreams merged into ambitions.** A nation has exactly one ambition, named in its own entry; several nations can share one. "National dream" is gone as a concept and as a word, and the build refuses it. The one behaviour change: the Papal States (ambition Survive) can no longer proclaim Italy, which they did in about a quarter of the worlds where Italy formed.
- **The Papal States keep Survive** (decided): the Pope opposes unification, as he did historically, and Italy forming in 27 of 40 worlds is close to the target of a third to two thirds.

- **Programmes are gone.** Every programme but Lithuania's only repeated its union. A nation now claims its cores, the provinces of its own or accepted peoples, and the provinces of the union it works toward or has proclaimed; when a rival proclaims the union, those claims go with it. Belarus joined the Polish Commonwealth (the Grand Duchy of Lithuania held it). A union province of another people is no longer forecast to integrate quickly, and the chronicle says "to bring X into the Polish Commonwealth" instead of "whose people would integrate quickly". The "Programme" concept is deleted.
- **One table of nations.** `breakaways.json` is folded into `nations.json`: every nation has the same fields and `starts` says whether it is on the map in 1836. The six restorations are gone (Greece is just the one Greek nation), each nation born in an uprising has its own leanings instead of the shared default, and what any nation born in an uprising gets is `newNation` in `rules.json`. The nation an uprising rises as is derived from the data (`risesAs`). One new behaviour: a people with a single nation of 1836 (Swedes, French, English, Russians, Turks, Spaniards, Swiss) now restores it when it rises outside its old provinces, where before its rebels found no allies.

Measured for both together (40 worlds, seeds 1–40, before → after): wars 40.9 → 42.1, uprisings 33.8 → 35.6, nations born or restored in uprisings 12.7 → 12.9 a world, Ukraine alive in 1918 27 → 22, Survive nations alive 176/460 → 166/456. Unions proclaimed: German 40 → 40, Iberian 37 → 35, Italy 27 → 28, Polish 19 → 18, Dacia 17 → 18, Bulgaria 11 → 12, Hetmanate 5 → 12, Kalmar 5 → 6, Byzantine 3 → 6, Illyria 5 → 2, Hungary 2 → 2. Unions held in 1918: 106 → 117 (Polish 5 → 12, Iberian 25 → 29, Italy 19 → 25, Bulgaria 9 → 4). The chronicle's "would integrate quickly" fell from 605 lines to 405; the other 200 or so now read "to bring X into" a union (152 lines).

## Open drifts, to settle one at a time

- **A nation's "hawk" is a ruler's judgment.** Nations carry `hawk`, shown as "Leans to war", but the engine only uses it to tilt each new ruler's judgment (over- or underconfident). The player sees Judgment on the ruler and "leans to war" on the nation for the same number.
- **Ultimatums never become wars** (see above).
- **The chronicle puts the cause after the effect.** "X has ceased to exist" is written before the peace treaty that ended it.

(The Admirer drift is gone with the Admirer: the ruler pool was replaced.)

# Second audit (November 2026): what is left of Rule 1

The goal: every piece of content is a one-place change in `content/`, and the Almanac can answer every question a player could ask. Changing how the simulation itself works (the forecast maths) is out of scope.

Two independent audits were run on the same code (Claude and Codex, neither shown the other's findings) and merged here. Every finding below was checked against the code. Line numbers drift, so each one names the function. `npm run build` passes with all of them in place: the check doesn't catch them yet.

**What already works:** renaming a province (`"name"` in `provinces.json`) reaches the map, panel, chronicle and Almanac. No nation tag or province id is typed into `src/`.

## 1. Wrong now: the content promises what the engine doesn't do

Fixing several of these changes the simulation (marked *sim*): each needs a before/after sweep.

| | Promise | What the engine does | Where |
|---|---|---|---|
| 1.1 | `map.json` `seaCrossings` (11) are the sea crossings; the Almanac lists them | The map builder ignores them and works out its own 23, which the engine uses. Five listed ones don't exist (London–Flanders, Jutland–Gotland, Constantinople–Anatolia, Crimea–Ukraine, St Petersburg–Finland); 17 real ones aren't listed. `seaPoints` (54) are read by nothing | `build-map.js`, almanac Provinces |
| 1.2 | Vengeful: his army fights harder for its own land *(sim)* | `homeFight` is read only in `warEval` (what he expects), never in battle (`strength`, `tickWars`) | `warEval` |
| 1.3 | Coronation grants apply to every new ruler *(sim)* | A nation born in an uprising is crowned in `makeCountry`, then `revolts` overwrites its gold with `newNation.gold`, so a dowry or hoard is lost | `revolts` |
| 1.4 | A Flirt's reign always ends in civil war *(sim)* | A coup returns before the civil war; a revolution sets it to false | `endReign` |
| 1.5 | 45k soldiers per million people "would empty the fields and factories" | `workforce` never falls below 55% | `workforce`, `rulebook.json` Armies |
| 1.6 | Failed harvest: 32% a year (Almanac) *(sim or text)* | Rolled with `Q` (a yearly chance split over four seasons) in summer only: 8% a year | `EVENTS` harvest |
| 1.7 | An uprising restores the province's fallen nation first *(sim or text)* | It first joins a living neighbour of its people (formerly Prussian Rhineland joins Hesse while Prussia is gone) | `revolts` |
| 1.8 | The armistice makes "peace on the lines as they stand" *(sim or text)* | It runs an ordinary `endWar`: an attacker ahead on score gets its war goal even if it never occupied it | armistice block, `endWar` |
| 1.9 | Alliance: "bound to join each other's defensive wars" | Allies join 85% of the time (attackers' allies 60%) | `declareWar`, `concepts.json` ally |
| 1.10 | Reform and fortress costs come from content and the ruler | Affordability is checked against typed prices (`T >= 20`, `T >= 25`): a Religious ruler with 15 gold can't consider an 8-gold reform *(sim)* | `considerations` |
| 1.11 | The army forecast quotes its upkeep | `st * 0.16` ignores the ruler's `upkeep` effect | `considerations` |
| 1.12 | — | The Almanac shows the opening event as "three nations nations" (the sample word is a phrase, the template wants a count) | almanac `SAMPLE` |
| 1.13 | A province starts with the industry in `provinces.json` | Capped at 3 by `Math.min(3, …)`; the Almanac shows the uncapped number | `createSim` |
| 1.14 | Uprising threshold | 65 to rise, but the chance counts from a hidden 60 (also above) | `revolts` |

### Section 1: fixed

- **1.1** `map.json` now holds only the geography the shapes get wrong (`land` and `sea` pairs, moved out of `build-map.js`); the dead `seaCrossings` and `seaPoints` are gone. The Almanac lists the crossings from the map itself. `npm run map` rebuilds `geo.json` byte for byte.
- **1.2** The leader of a war fought over his own land fights harder in battle by his `homeFight`, as the forecast already assumed.
- **1.3** A nation born in an uprising starts with `newNation.gold` *before* its ruler is crowned, so his coronation gold adds to it.
- **1.4** A Flirt's reign ends in civil war after a coup or a revolution too.
- **1.5** The floor is `rules.workersMin`, and the rulebook says so.
- **1.6** A seasonal event's chance is its chance in that season: the harvest's is 0.08, rolled each summer (the same odds as before, now shown truthfully).
- **1.7** The rulebook gives the engine's order: a neighbouring nation of the same people first.
- **1.8** At the armistice every occupier keeps what it holds ("ends on the lines as they stand"); no war goal, reparations or abdication. The treaty is written before any nation it ends ceases to exist.
- **1.9** Allies join by `rules.allies` (defend, attack), stated in a new rulebook group; the Alliance concept says "usually".
- **1.10** Reforms and fortresses are affordable at their real, trait-adjusted price; a fortress's price is `rules.price.fort`.
- **1.11** The army forecast quotes upkeep with the ruler's effect.
- **1.12** The opening event takes `{count}`; the Almanac's samples follow `cholera.nations` and count the nations of 1836.
- **1.13** The cap was dead (no province starts above 3) and is removed.
- **1.14** The uprising chance counts from `rules.unrest.uprising`.

Measured (40 worlds, seeds 1–40, before → after; every world ends in autumn 1918): wars 34.7 → 31.3, uprisings 34.5 → 30.5, Ukraine alive in 1918 27 → 23, richest great power France 24 / Britain 14 / Russia 2 → 26 / 9 / 5, Survive nations alive in 1918 164/444 → 164/441. Unions proclaimed: German 40 → 39, Iberian 36 → 35, Italy 24 → 26, Polish 19 → 16, Dacia 11 → 10, Hetmanate 7 → 10, Bulgaria 7 → 2, Kalmar 8 → 6, Hungary 3 → 6, Illyria 3 → 2, Byzantine 0 → 1; held in 1918: 105 → 104.

Almost all of it is 1.14. The same sweep with every fix but the old uprising curve: wars 38.1, uprisings 36.6, Britain richest 16, Survive alive 181/457. The armistice fix (1.8) on its own changes almost nothing: with the old armistice, Britain is richest in 10 worlds instead of 9 and the German Empire is held in 24 instead of 25.

## 2. Breaks on change: one edit doesn't reach everything

**Joined by position or display text instead of an id**
- **Province shapes are joined by order.** `geo.json` has no province ids: province *i* gets shape *i*. Reordering `provinces.json` (tested in memory) gives Serbia Scotland's shape and neighbours; adding a province or moving its coordinates without `npm run map` does the same silently.
- **Peoples use their display name as id** ("Ukrainian", "Croat"). Renaming one means editing provinces, nations, ambitions, events and peoples, and the one word must serve as noun, adjective and language ("Croat-speaking").
- **The Flirt is found by its label** (`label === 'Flirt'` in `coronation` picks "marries into" over "inherits").
- **Eras are compared by name** in the military revolution event.
- **Province history** in the panel searches the chronicle for `<i>name</i>`: two provinces with one name share a history.
- **"German" is the fallback for ruler names**, typed in `sim.js` (`namesOf`) and `almanac.js`. Switzerland has no names, so its rulers are Friedrich and Wilhelm.

**Names copied into text instead of read from content**
- Event prose: serfdom names "Moscow and St Petersburg", compromise "Hungary", the Ukrainian awakening "Ukrainian" (its id is `shevchenko`), and most events repeat their own name in their text.
- `ambitions.json` notes name provinces (Constantinople); the rulebook and concepts name rarities and the Flirt.
- `say()` only exposes `rules` globally, so a sentence can't refer to a province, nation or people by id today.
- UI: the map chips type "Railway mania" and "The Panic" (`globalChips`); help names "Russia"; the Great War's runtime name is typed in `greatWar`, and "Great War" appears in four places.
- Concept names in prose: renaming "Fortress" means editing chronicle sentences in `sim.js`, the `WORD_IC` word list in `registry.js` and the map key. The check only refuses *avoided* words, not a stale old name. Labels with no concept: Allies, Budget, Factory output, Recruiting, Net, seaport, "Independence guaranteed by".
- "Great power" means two things: the top 6 by power, recounted every 5 years (`computeMajors`: interveners, guarantors, the Great War), and the four nations whose ambition is Richest. Neither is a concept.
- Other authored copy outside content: the start screen text (`showStart`), the help text in the template, the heir-odds line in the Almanac, the $1.99 reroll price (`showHeir`).
- `tools/sweep.js` picks `UKR` and prints "Ukraine" and "held in 1918".

**Numbers copied instead of read**
- Map chips: "Factories 30% cheaper", "Gold a year down 20%" copy `events.railway.cost` and `events.panic.earns`.
- The treaty-union threshold: `r >= 70`, `r < 75` and the text "70 needed".
- Integration: 4 or 9 years in the forecast (`settleYears`), 0.08 or 0.028 a season in `tickProvinces`, and the panel's "pays X%" formula copied a third time.
- `rules.heirs` deals the cards, but the keys 1–3 and the help text are fixed.
- The end season: "autumn" typed in `ambitionKinds.json` and `concepts.json` instead of `{rules.end.season|season}`.
- Season names exist four times (`SEASONS` in `sim.js`, the `season` format in `text.js`, twice in `almanac.js`).
- Legendary Flirt and Planner say "a random bordering province" whatever their `province` value.
- Cholera's Almanac sample always says "three nations".

**Two sources for one fact**
- Serfdom: `nations.RUS.serfs` and `events.serfdom.nation`. Give serfs to another nation and nothing frees them.

**Geography outside content**
- `build-map.js` has five hand corrections (`con–bul`, `con–mac` by land; `lon–hol`, `sco–nor`, `nth–jut` by sea) and the Anatolia/Caucasus cut.

## 3. Not in the Almanac

- **Temperaments:** `temperaments.json` (the nine words and their thresholds) appears nowhere.
- **Nations:** `serfs` and `noAnnex` aren't shown; nor are war-name prefixes.
- **Provinces:** land neighbours aren't shown, and sea crossings are wrong (1.1).
- **Great powers:** who they are and what being one does.
- **Events:** the Almanac shows the text, timing and chance, not the numbers the text leaves out: unrest added by Springtime, Famine, Cholera, Panic and Harvest; the Compromise's conditions, calm, accepted people and new name; serfdom's factories and the half-speed factories before it; the awakenings' permanent unrest; a boom's 10% people; the ultimatum's payment, unrest and thresholds; every boom find and ultimatum pretext but the first. Nor when an event can actually happen (once only, who must own what, which eras can follow).
- **Rules of the world still typed into `sim.js`** (what happens, not what the AI forecasts). Each should move to `rules.json` with a rulebook sentence:

| Family | Typed in the engine |
|---|---|
| Dates | assassins become anarchists in 1870; swallowing a whole nation gets cheaper in 1860; nations expect a general war from 1888; factory workers grow restless from 1848; nationalism grows over 70 years; the chart starts in 1835 |
| Start | 10 unrest; 30–50 gold; army ±10%; how temperaments are drawn |
| Economy | factory 22 × 1.55ⁿ gold, at most 10 a province; fortress 25 gold; recruits 3 gold per thousand; upkeep 0.04 per thousand a season; every province beyond 6 costs 3% of all yield, down to 55%; 1 build at a time plus 1 per 3 provinces; 4 actions a season; population growth; the army shrinks below −40 gold |
| War | ends at score 60 (75 in the Great War), after 18 seasons (40), never before 4; the loser pays 30% of its gold; 1 extra province (3 in the Great War); 10-year truce after a war; allies join 85%/60%; a battle kills 1.5% of a province and wrecks a factory 22% of the time; army losses per season; occupation +12 unrest; a conquest starts at 0.4/0.1 integrated and 25/45 unrest; no war above 50 unrest; industry and unrest change army strength |
| Unrest and uprisings | unrest targets and smoothing; rebels and garrison sizes; what a crushed, won or lone uprising costs; neighbouring provinces that break away with it |
| Diplomacy and unions | at most 3 allies; uniting by treaty needs relations 70 and twice the power; a proclamation takes away 25 unrest and integrates its people; who votes to join |
| Great War | 6 great powers, recounted every 5 years; how the two sides are picked; running wars abandoned; alliances pulled in |

## 4. Gaps in tools/check.js

- **Read somewhere isn't used.** Event fields (`e.unrest`, `e.pop`…) are never checked: deleting `springtime.unrest` passes. A rule counts as used if only its rulebook sentence mentions it. An unused new content file passes.
- **Schemas are loose.** Probes that passed: a starting nation with no army; negative rarity odds summing to one; 21 heirs from 20 traits; a duplicated union province; serfdom aimed at a nation that doesn't start; an effect with no neutral value; a misspelled temperament threshold; a coronation slot using an ongoing effect.
- **Templates are checked only in a shallow list of fields**, and numbers only as digits. A malformed placeholder is left in the text silently (`{pop|does-not-exist}` and `{missingAuditPath}` passed), and UI strings aren't checked for typed numbers ("99% cheaper" in a chip passed).
- **Never checked:** the map against the provinces, the Almanac's sea crossings against the playable ones, and whether every Almanac section renders.

### Section 4: done, except the Almanac

`tools/check.js` now refuses each of the cases above. Proven by breaking a copy of the project once per case: all 18 (Codex's probes, plus typing a province, nation or trait name into content, the help text or code) fail the build with a message that names the file and what to write instead. What's new:
- `geo.json` records the province ids, coordinates and map fixes it was built from (`built`).
- Every piece of prose in the content is a template, checked wherever it sits; `say()` refuses anything left in braces, and any text can name any entry (`{provinces.kie.name}`).
- No content name typed into content prose, the HTML template or a string in the code; no number typed into the interface's strings.
- Every field an event handler reads exists, and every event field is read by code. A rule only a rulebook sentence mentions counts as unread.
- Shapes: odds, hawk and patience from 0 to 1, a starting army, whole-number industry, unique union provinces, a neutral value for every effect, temperament thresholds, heirs no more than traits, the two special events aimed at nations of 1836, a flat bonus that is a coronation grant (and a main bonus and malus that aren't), ruler names for every nation.

Fixing what it found took care of most of section 2's copied names and numbers: event prose names its own event and its provinces through placeholders, the map chips read the railway and panic events, the help text names the serfdom event's nation, the rulebook and Rarity concept name rarities and the Flirt by path, the Great War's name is its event's, the reroll price and the treaty-union threshold are rules, the heir keys follow `rules.heirs`, the Flirt's and Planner's province grant carries its own chronicle line (`news`) instead of the engine checking the label, and the Swiss have ruler names (eight, like the German list they borrowed, so the draw is unchanged), so the German fallback is gone. The opening event is now called "The age begins" ("Europe" was a name in every sentence) and the serfdom event "Emancipation of the serfs". The simulation is unchanged: full chronicles and final states of eight worlds match the code before, apart from these sentences.

Still to do from the list: every event field *stated* in the Almanac, and rendering every Almanac section in the check (both with step 6).

## Plan, in order

1. **Fix section 1.** Several fixes change the simulation: sweep before and after.
2. **Make the check enforce the rule**, so it can't drift back:
   - `geo.json` records the province ids and coordinates it was built from; the build fails if they differ.
   - The Almanac's sea crossings come from the map.
   - Every event field must be read by the engine and stated by its text or the Almanac.
   - Malformed placeholders fail.
   - No typed numbers in UI strings.
   - No province, nation, people or union name typed into any text: it must come from a placeholder.
   - Strict schemas for every content file.
   - Every Almanac section renders.
3. **Ids instead of display names:** peoples (with a name and an adjective), eras, the Flirt's grant wording, province history.
4. **Names and numbers read from content:** event prose, map chips, help and start text, seasons, the Great War, the reroll price, serfdom in one place.
5. **Rules of the world into `rules.json`** with rulebook sentences (the table in section 3). The forecast maths stays in code.
6. **Fill the Almanac:** temperaments, great powers, neighbours, full event effects and when each event can happen.
