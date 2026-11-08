# Working on Concert of Europe

Read README.md first for what this is and why. This file holds the design rules that were settled deliberately; do not undo them without asking.

## Rule 0: commit and push every time

When a change is done, commit it and push it to `master` without asking for confirmation, every time. Commit everything in the working tree, including changes another chat left behind. The only exception is when the user explicitly says not to commit or not to push.

## Rule 1: content lives in content/, and only there

Every piece of content (rulers, rarities, temperaments, nations (those of 1836 and those born in uprisings, in one table), peoples, provinces, sea crossings, ambitions, events, ways of war, concepts, and the rules of the age the player is told about) lives in `content/*.json`. The engine (`src/sim.js`), the interface and the Almanac read it from `CONTENT`; nothing else may hold a copy.

- **To change content, change the content file.** A ruler's strength, an event's odds, a union's provinces, a concept's name: edit the JSON, run `npm run build`, and the engine, the cards, the chronicle, the help text and the Almanac all follow.
- **Never type a number into text.** A sentence that states a number takes it from the data with a placeholder: `"His army fights {v|up} harder"`, `"Takes {rules.build.factory|word} seasons."`. The formats (`word`, `pct`, `up`, `down`, `frac`, `times`, `harder`, `x`, `xs`, `span`, `years`, `inv`, `thrift`, `horizon`, `points`, `signed`, `abs`, `s`, `ies`, `place`, `nation`) are in `src/text.js`; add one there if a phrase needs it. In the HTML template use `{{path|format}}`.
- **Never type a name into text either.** A sentence that names a province, nation, people, union, event, way of war, trait or rarity takes it from its entry: `{provinces.kie.name}`, `{events.greatWar.name}`, `{rarities.0.name}`, an event's own `{name}`, a list of province ids with `{provinces|place}`, a nation's tag with `{nation|nation}`, a people's id with `{people|people}` (in code, `peopleName(id)`: peoples are referred to by id everywhere and shown by their `name`). Any path into the content works anywhere; an entry's own field wins over the content file of the same name. Code compares ids, never names.
- **Never type a content number into the engine.** The engine reads the reigning ruler's effects with `fx(c, 'key')` (and `hasFx`), rules with `RULES.x`, events with `EV.id`. A new effect gets a line in `content/effects.json` (what it does, and the value that changes nothing) and a place in a trait in `content/rulers.json`. The tuning of the forecast itself (tax rates, the win-chance curve) is engine, not content.
- **The build enforces it** (`tools/check.js`): every reference in the content points at something that exists; every piece of prose in the content fills in, states no typed number and types no content name; anything left in braces is an error; the HTML template and every string in the code type no content name, and the interface's strings no number; every `fx(...)`, `hasFx`, `RULES.`, `EV.` and event field `e.x` the code reads exists, and every rule and event field is read by code (a rulebook sentence alone doesn't count); `map/geo.json` was built from the provinces and map fixes as they are now (else run `npm run map`); and the content has the right shape (odds, ranges, unique union provinces, a trait's flat bonus is a coronation grant and its main bonus and malus are not, every nation can name its rulers). A failing check means the data and the engine disagree: fix one of them, never the check.
- **The Almanac is the proof.** Press A in the game (or the book button) to see every entry exactly as the engine has it, in plain words: no file names, keys or raw data. Every rule gets a sentence in `content/rulebook.json` (the build checks). If something looks wrong there, it is wrong in the game.
- **After moving or reshaping content,** compare full chronicles and final states before and after (the sweep alone can hide a change). Keep the files tidy with `npm run content`.
- The numbers quoted in this file (the ruler pool, the ambitions) describe the design and can lag behind; `content/` and the Almanac are the truth.

## Design rules

1. **One ambition for every nation, judged in autumn 1918.** Each nation is born with one of three (`setAmbition`, see "Ambitions" below): the great powers of 1836 want the most income per year (taxes + factory output + sea trade) among themselves; a nation whose people are divided wants to unite them and still hold them together; every other nation wants to survive. The forecast still counts everything in gold (rule 2); the ambition only changes what some provinces and losses are worth.
2. **Every decision is a forecast in gold.** In `considerations(c)` each option gets `ev` = extra or protected income over the ruler's horizon (8–30 years) minus its cost. The country does every option with positive `ev`, best first, up to 4 a season. Do not reintroduce hand-tuned "urge" scores.
3. **Same rules for everyone.** No per-country stat bonuses. Countries differ only by starting data, ruler tendencies, a few historical special rules (unifiers, serfdom, accepted cultures) and luck.
4. **Visible or hidden, never in between.** Any stat shown to the player must visibly change something on the map or in the budget. Infamy and relations maths are hidden plumbing. Prestige, colonies and great-power status were removed on purpose.
5. **Rational core, chaotic inputs.** The forecasting AI stays rational. Variety comes from what it is fed: misjudgment (`ruler.bias`), traits (`TRAITS`), crises, ultimatums, military eras, awakenings, coups. Add chaos as new inputs, not as irrational decisions.
6. **Counterweights over caps.** Growth must cost something visible: integration time for conquests, administration cost for big states, soldiers taken from the workforce, trade lost in war, great powers ganging up on the leader. Prefer these to hard limits.
7. **Reachable conquest only.** Peace deals transfer land only to a winner bordering it by land or a sea crossing; distant allies get gold. Occupation is credited to the ally actually adjacent.
8. **The game ends in autumn 1918.** The Great War starts summer 1914; any war still running at the armistice is settled on the current lines.

## Player rules

**The line of kings.** The player's only decision is who rules next. Whenever the throne passes, the player picks one of three heirs; the ministers (the same AI as everyone else) then run the state the way that ruler sees the world, until he is gone. There are no other card types: no ministers, generals, favourites or councils beside the ruler.

- **One mandatory choice from three, at each succession.** The game pauses until the player picks. Aim for 6–10 successions a game (see "How a reign ends").
- **No managing between turns.** No policies, sliders or standing orders, and a choice can never be revisited or changed later.
- **Distinct and readable at once.** Three heirs should feel like three different characters (the flirt, the drunk, the tyrant), never shades of one policy: a card never shows one trait twice. One line of character, then two or three short effect lines.
- **What you see is what you get.** Every heir is shown face up; no hidden or sealed heirs.
- **No suggested pick.** Don't mark what the ministers would choose.
- **Rerolls.** The player may deal a heir card again three times a game, the opening card included (`rerollHeirs`). The fourth reroll is meant to be sold for $1.99; there is no payment yet, so its button only says "Coming soon". Player only: AI nations pick at random, so they have nothing to reroll for. Rerolls only change which cards are shown, so watch-mode sweeps are unaffected.
- **A deck with rarities.** The same trait comes at five rarities: the rarer, the bigger the bonus and the smaller the malus, and from Rare on a one-time bonus at coronation. No stacking, levelling or evolutions: the thrill is the pull, not progression. A higher rarity improves the card, not the outcome: which trait suits the nation stays the real choice.
- **AI countries draw from the same pool by the same odds, and pick at random.** No forecast for heirs: a random pick gives more variety than an AI that always takes the best ruler, and the rules stay the same for everyone (rule 3). (`drawHeir` gives one heir the odds of a random pick from a card.)
- **Every ruler has a trait.** No blank rulers and no exceptions: Switzerland is a monarchy like everyone else (its federal council was removed to keep one rule for all).
- **Every ruler visibly changes something** on the map or in the budget (rule 4), and the chronicle names him ("Ludwig II the Drunk"), coloured by his rarity.

### How a reign ends

Reigns last 8–24 years if nothing ends them sooner. A reign also ends by (`endReign` in `sim.js`):

- **Abdication after a lost war.** Half the time, when the beaten side's leader lost land or started the war.
- **Revolution.** An uprising of the ruler's own people topples him.
- **Assassination.** 1% a year.
- **Coup.** The army installs a random ruler from the pool. This is the one succession with no card: the army doesn't ask.

This gives the choice stakes: pick the Bold, and if he loses his war he loses his throne. Measured: a surviving great power sees about 6 cards a game counting the opening one; small nations that die early see fewer.

### The ruler pool (built)

Every ruler is **one trait at one rarity**, named "Ludwig II the Builder": a name from his people's list (`peoples.json` `names`, or a nation's own `rulerNames`; every nation must have one or the other), a regnal number, and his trait's label as is (no separate epithets). His rarity is the colour of his name in the panel, the hover card and the chronicle, and the word above his emblem on the card. No titles per rarity. 20 traits × 5 rarities = 100 cards, all generated from `content/rulers.json` (each trait's three effects and their values) and `content/rarities.json` (the odds, and which value of each effect a rarity gets). Never author a card by hand.

Each trait has three effects, each read through `fx(c, key)` from `content/effects.json`:

| Rarity (odds) | Main bonus | Flat bonus, at his coronation | Malus | Lines on the card |
|---|---|---|---|---|
| Common (46%) | small | none | big | 2 |
| Uncommon (30%) | medium | none | medium | 2 |
| Rare (15%) | medium | small | medium | 3 |
| Epic (8%) | medium | small | small | 3 |
| Legendary (1%) | big | medium | small | 3 |

- **The main bonus is always a percentage, the flat bonus always a fixed amount, on purpose.** A percentage is worth more to a big nation, a fixed grant more to a small one, so nation size is part of the choice. Don't scale grants to the nation.
- **No two traits share a main bonus** (the build refuses it). Flat bonuses and maluses may share a resource, never the whole character.
- **The flat bonus is the one-time version of what the trait is about**: soldiers for the Warmonger, a dowry for the Flirt, a free reform for the Religious, a truce with every neighbour for the Sharp. Gold only where the character says where it came from (hoard, seizure, dowry, prize money, cards).
- **Legendary Flirt and Planner** take a random bordering province (sea crossings count) at coronation instead of their medium flat bonus, by the ordinary non-war transfer. It can be an ally's, or a nation's last province: ending a nation that way is intended.
- **A Flirt's reign always ends in civil war**, no roll; his rarity sets only how much unrest it adds.
- **Effects apply in three places only**: at coronation (`coronation`, grants that change ordinary state once), in the ordinary formulas while he reigns (`fx` reads, the same value in the matching forecast), and in `endReign` (Big Spender's spent gold, Strict's restless subject peoples, Flirt's civil war). No ledger, no scheduler, no targeting: a grant that lands on nothing is wasted.
- Coronation grants also apply to the rulers of 1836. Drawing, showing and rerolling cards change nothing.

The traits (character line in the content): Warmonger, Soldier, Bold, Cautious, Paranoid, Builder, Stingy, Big Spender, Tyrant, Reformer, Drunk, Vengeful, Flirt, Religious, Sharp, Planner, Tolerant, Nationalist, Strict, Sailor. Mirrors on purpose: Bold breaks through the enemy's lines with less advantage, Cautious only with more; the Drunk calms his own people, the Flirt other peoples.

Measured at replacement (40 worlds, seeds 1–40, old pool → new): wars 42.1 → 33.1, uprisings 35.6 → 34.0, Ukraine alive 22 → 27, richest great power France 26 / Britain 10 / Russia 4 → France 24 / Britain 12 / Russia 4, Italy proclaimed 28 → 27, Survive nations alive 166/456 → 183/453. Wars fell because the old pool's hidden war "wants" (land worth more, revenge, legendary levies, isolated enemies) are gone. A nation's share of Europe's gold a year over one reign, by rarity: Common ×0.97, Uncommon ×1.02, Rare ×1.03, Epic ×1.01, Legendary ×1.09. Per trait it swings about ±5% between runs, so only bigger gaps mean anything; the first tuning pass softened Tyrant, Stingy, Paranoid, Soldier, Bold, Reformer and Tolerant.

## Interface rules

- **Every concept the player sees is one entry in `content/concepts.json`** (one name, one line of description, the words to `avoid`) with its drawing under the same key in `DRAW` in `src/ui/registry.js`. `REG` joins the two; the map, panel, map key, Almanac and tooltips all draw from it (`ic`, `glyph`, `nm`). Concepts with no icon (like Nation) are marked `word` and live in `WORDS`. Add new concepts there, never ad hoc.
- One icon means one thing. Two different concepts never share an icon, and a label beside an icon uses the icon's own name.
- **Icons in copy.** When a sentence names a registry concept (Gold, Factories, Fortress, Unrest, Army…), its icon goes in front of the word, on its first mention in that text. Don't place them by hand: run the text through `iconize` (`registry.js`), which reads the word list `WORD_IC`; add new words there. Hover text (`data-desc`) stays plain, because it can't hold icons. Done so far for the heir cards, the Almanac's rulers and the start screen; the chronicle and older copy don't follow it yet.
- `npm run build` runs `tools/check.js` first and fails on an unknown icon, a shape drawn outside the registry, or an avoided word in visible text (UI strings, the HTML template and chronicle lines in `sim.js`). Fix the text, or change the registry on purpose; never weaken the check to get a build through.
- Settled words: Gold (money held), Gold a year (the score), Army, Fortress, Uprising, Integrated, Nation, Ruler.
- Plain, short labels. If a label needs explaining, rename it (for example "Gold a year", not "Yields").
- The map stays mostly clean: ruler traits belong in the panel, not on country labels.
- Clicking the sea or pressing Escape clears the selection.

## Ruler temperament (settled)

Besides his trait, every ruler has three temperaments, shown as tags in the panel. Each is an input to the same rational forecast (rule 5), and each acts on a different part of it:

- **Patience** (`ruler.pat`): far-sighted / steady / short-sighted. The horizon of every forecast, 8 to 30 years.
- **Judgment** (`ruler.bias`): overconfident / clear-eyed / underconfident. Skews the odds he believes in war (`warEval`) and whether he backs down to an ultimatum. Seen in the chronicle's "his generals privately think N%" (the panel shows only what the ministers did, never the forecasts). It leans the way his nation does (`lean.hawk`, from `data.js` `p[0]`).
- **Thrift** (`ruler.thrift`, read through `thriftOf`): thrifty / balanced / lavish. Multiplies `goldValue`, so it touches every cost in every forecast, from about a third (lavish) to three times (thrifty). Measured over 6 worlds: lavish rulers hold about 5 years of gold a year and spend about 4 times as much on building as thrifty ones, which hold about 10 years.

Risk (`ruler.risk`, `lossW`) was removed on purpose: it was a second copy of Judgment that no player could tell apart. In its place the loss term of `warEval` carries a fixed weight of 1.25 (a beaten ruler may lose his throne), and the neighbour-threat formulas use the old average. Don't bring back a second war temperament; a new one must act on something other than war.

Traits never fix a temperament: Sharp, Bold, Drunk and Planner act on judgment and patience through their own effects (`believe`, `horizon`), on top of the temperament.

The heir cards don't show temperaments yet; only the panel does, once he reigns. Undecided.

## Ambitions (built)

Every nation has exactly one ambition for the armistice of autumn 1918 (shown as **Ambition** in the panel, the start screen and the end screen), and several nations can share one. There are no "national dreams" any more: a people to unite is simply an ambition, and the build refuses the word "dream" in visible text. Each nation names its ambition in its own entry (`ambition` in `content/nations.json`). The ambitions are in `content/ambitions.json`, and what each kind means, its wording and its weights in `content/ambitionKinds.json`. `setAmbition` fixes it at birth and `ambitionOf` says how it stands (`open`, `met` or `lost`):

- **Richest great power** (kind `richest`). Great Britain, France, Russia and the Ottoman Empire race for it; the one with the most Gold a year meets it. Only a nation that existed in 1836 can hold it (a restored one gets Survive).
- **Unite a people** (kind `unite`, one ambition per union: the German Empire, the Iberian Union…). Its nations race to hold `need` of its provinces from the year `from`; the first proclaims it, takes its name, and the smaller nations of its `peoples` vote to join. It is met if the proclaimer still holds `need` of them at the armistice; for everyone else who held it, it is lost. A union someone already proclaimed gives a newborn nation Survive. Prussia and Austria (great powers) race for the German Empire on purpose.
- **Survive** (kind `survive`). Still be on the map.

A nation only works toward its own ambition. Since the merge, a nation whose people have a union but whose ambition is something else (only the Papal States, which are Italian) doesn't claim that union's provinces or value them more, and can't proclaim it.

**Claims.** A nation claims a province it doesn't own if it once held it (a core), if its people or an accepted people live there, or if it lies in the union the nation works toward or has proclaimed. When a rival proclaims the union, those claims go with it. A claim makes a war for the province cheaper in distrust; only a core or an accepted people makes it quick to integrate (4 years in the forecast instead of 9). There are no programmes any more: Lithuania's one extra province, Belarus, is now part of the Polish Commonwealth.

Measured when dreams merged into ambitions (40 worlds, seeds 1–40, before → after): wars 39.1 → 40.9, uprisings 35.2 → 33.8, Survive nations alive 170/464 → 176/460, Ukraine alive 22 → 27. Italy is proclaimed in 27 worlds instead of 37: before, the Papal States (ambition Survive) proclaimed Italy in about a quarter of the worlds where it formed; now they can't. The Papal States keep Survive on purpose: the Pope opposes unification, and Italy forming in two worlds of three is close to the union-balance target.

The AI acts on it in gold (rule 2): a province of the union a nation works toward is worth `worth` (2) times its gold a year to it, to win and to keep (`ambitionW`), and a Survive nation counts every expected loss and the loss term of its own wars `losses` (1.5) times (`surviveW`). Great powers are unchanged.

Every nation that can exist is one entry in `content/nations.json`, with the same fields for all and `starts` saying whether it is on the map in 1836: 24 start, 16 can only be born in an uprising. What a nation born in an uprising gets (gold, an army sized by its people, hostility and a truce with the nation it broke from, perhaps a guarantor) is `newNation` in `content/rules.json`. When an uprising wins, the engine picks the nation to rise as (`risesAs` in `src/data.js`): the province's own fallen nation if it was of the same people; else that people's nation that doesn't start on the map (the Italians rise as the Italian Republic); else that people's only nation (the Greeks restore Greece); else none (German rebels outside a fallen German state find no allies). The build refuses two nations of one people that don't start.

| Ambition | At the start | Born in an uprising |
|---|---|---|
| Richest great power | Great Britain, France, Russia, Ottoman Empire | none |
| German Empire | Prussia, Austria, Bavaria | |
| Kingdom of Italy | Sardinia, Two Sicilies, Tuscany | Italian Republic |
| Iberian Union | Spain, Portugal | |
| Kalmar Union | Sweden, Denmark | Norway |
| Byzantine Empire | Greece | |
| Kingdom of Illyria | Serbia | Croatia, Bosnia |
| Polish Commonwealth | | Poland, Lithuania |
| Cossack Hetmanate | | Ukraine |
| Dacia | | Romania |
| Tsardom of Bulgaria | | Bulgaria |
| Crown of St Stephen | | Hungary |
| Survive | Hanover, Hesse, Saxony, Württemberg, Switzerland, Belgium, Netherlands, Papal States | Bohemia, Ireland, Finland, Baltic Republic, Albania, Scotland |

Union names follow historical precedent (the Kalmar Union of the northern crowns, the Cossack Hetmanate, Dacia of the Romanian nationalists, the Byzantine Empire of the Greek Great Idea, the Illyrian movement, the Crown of St Stephen). Dacia takes no article (`art: ''`).

Not done yet: **union balance.** Some unions are proclaimed in nearly every world and some in none (measured below); tune `need` and `from` per union so each forms in roughly a third to two thirds of worlds.

Measured (12 worlds, seeds 1–12, end year always autumn 1918). Before ambitions: 34.5 wars and 33.5 uprisings a world. With them: 37.3 and 35.4. The same scoring with the AI weights switched off (`ambitionW` back to 1.35, `surviveW` 1): 35.2 and 34.4, so the weights add about two wars a world.

| | Weights on | Weights off |
|---|---|---|
| Richest great power | France 7, Britain 4, Russia 1 | France 9, Britain 2, Russia 1 |
| Unions proclaimed (worlds out of 12) | German 12, Italy 11, Iberia 11, Bulgaria 6, Dacia 5, Poland 5, Hungary 2, Kalmar 2, Byzantine 2, Hetmanate 1, Illyria 0 | German 12, Italy 11, Iberia 9, Dacia 4, Poland 4, Bulgaria 2, Kalmar 2, Illyria 1, Hetmanate 1, Byzantine 0, Hungary 0 |
| Unions still held in 1918 | 34 (German 11, Italy 6, Iberia 6, Bulgaria 4, Dacia 4, Hungary, Byzantine, Poland 1 each) | 33 |
| Survive nations alive in 1918 | 48 of 134 (36%) | 57 of 140 (41%) |

The survive weight doesn't save small nations: they die slightly more often with it on, probably because the union weight makes the German Empire's nations swallow Hanover, Hesse, Saxony and Württemberg faster. Tune this together with dream balance.

## Future work (agreed, not built)

### Metaprogression

The "no stacking, levelling or evolutions" rule stays within a game. Across games:

- **Yes: nations to play.** New nations unlock as you play, for example by uniting a people.
- **Yes: new traits in the deck.** AI nations draw from the same pool, so an unlock changes the world for everyone (rule 3 still holds). Sweeps should run with a fixed pool so they stay comparable.
- **No:** start dates other than 1836, a ruler book, or permanent stat bonuses.

### Crisis cards

A second kind of decision besides heirs. When history turns for the player's nation, the game pauses and the player picks one of two or three options, face up and irreversible, with no suggested pick. The ruler shapes which options appear (a Saint gets no war option, a Conqueror at the peace table may only see "take everything"). AI nations keep deciding these moments by forecast, so watch mode is unchanged. Aim for about 10–15 crises a game beside about 6 successions. When this is built, the player rule "There are no other card types" changes.

Moments that already exist in the code:

- **Ultimatum received** (`oFears`). Back down, fight, or give up a province.
- **Peace table after a win** (`endWar`). Take the land (restless, slow to integrate), take the gold, or leave him as an ally. Rule 7 still limits what land can be offered. The strongest first candidate.
- **Uprising in your provinces** (`revolts`). Crush it at a cost in men, grant autonomy, or let it go.
- **Summer 1914** (the Great War block). Join your allies, stay out, or switch sides.
- **Union within reach** (`unification`). Proclaim now or wait for a better border.
- **Royal marriage** (the marriage event). Choose the court; the next heirs carry a claim there.

## Workflow

- **"Locally" means edit and build only.** When the user asks for a change "locally", edit the files and run `npm run build`; don't start a web server. Before handing over, open the built `index.html` straight from disk (`file://`) in the browser pane and screenshot it yourself; the user then reviews it. Don't commit or push until the user says so.
- Content changes go in `content/*.json` (Rule 1), then `npm run build`.

- Edit `content/`, `src/` or `map/`, then `npm run build`. Never hand-edit the root `index.html`; it is generated.
- After any simulation change run `npm run sweep -- 1 41` (40 worlds, in parallel on every core: about two minutes) and compare against the same sweep of the old code (a `git worktree` of HEAD). Fewer worlds mislead: wars per world range from about 15 to 85, so 12 worlds can't show a change smaller than about 8 wars, 40 worlds about 4. A pure refactor is proven differently: compare full chronicles and final states, which must match to the character. Compare: wars, revolts, Ukraine survival, richest great power, unions proclaimed and held, Survive nations alive, end year (always 1918 Autumn). Read at least one `npm run chronicle` for oddities; the chronicle is the best bug detector.
- After any map change run `npm run map` and read the audit table it prints (coastal flags, land neighbours, sea crossings) before trusting it. Coastlines, neighbours and sea crossings come from the shapes; do not hand-type geography from memory. Where the shapes get it wrong, the fix is a pair in `content/map.json` (`land`: joined by land, `sea`: joined by a sea crossing), never a line in the builder.
- Sweeps are deterministic per seed, so before/after comparisons are fair.
- Report test results precisely: say whether a number counts an event happening or surviving to the end.

## Map of the code (src/sim.js)

- Content: `CONTENT` (all of `content/`), `RULES`, `EV` (events), `TRAITS` (rulers), `RARITY`, `EFFECTS`, `traitEffects(t, g)` (a card's effects and text), `fx(c, k)` (the reigning ruler's value for an effect), `hasFx(c, k)`, `say` (any template, `src/text.js`).

- `createSim(seed, geo)` builds state `S`; `S.step()` advances one season.
- Economy: `regionIncome`, `income`, `score`, `workforce`, `admin`.
- AI: `considerations`, `act`, `decide`; military forecasts `warEval`, `riskOf`, `interveners`.
- War: `declareWar`, `frontMove`, `warScore`, `endWar`, `tickWars`.
- Provinces: `tickProvinces` (construction, integration), `tickUnrest`, `revolts`.
- Rulers and chaos: `drawHeir`, `makeRuler`, `crown` and `coronation` (flat bonuses), `endReign` (end-of-reign maluses), `believe` (judgment), `successions`, `EVENTS`.
- Ambitions: `AMBITIONS`, `UNIONS`, `unionOf` (the union a nation works toward), `unification`.
- Ambitions: `setAmbition` (at birth), `ambitionOf` (how it stands), `ambitionW` and `surviveW` (what they add to the forecast), the closing line of the armistice block.
- Player: `createSim(seed, geo, { player })`; `heirCard` builds a choice of three heirs and parks it in `S.pending` (which halts `step()`), `chooseHeir(i)` resolves it. Every reign ends through `endReign`; AI countries get a random heir from `drawHeir`. `tickRulers` redraws a Drunk's misjudgment every season. `tools/load.js` passes `{ player }` through for headless tests.
- End: the armistice block at the end of `step()`.
