# Ruler quirks × grades

Status: design only; nothing in this file is implemented. The user accepted the 20-trait table and plain-language names, confirmed complete replacement of the old leader content, delegated timing choices and automated balancing, and required the simplest possible effect application. The application scope below records that decision. Numbers are starting values for automated tuning, not measured balance results. Implementation is a separate task.

This replaces the earlier all-flaw Common / two-stat proposal. It completely replaces the built ruler pool described in CLAUDE.md when implemented; the built game's truth remains `content/` and the Almanac. This file is deleted only once the agreed replacement is built and documented.

## Agreed structure

A ruler has exactly **one trait**, at one of the five existing grades. A trait has **up to three effects total**: a main bonus, an additional thematic flat bonus from Rare onward, and one malus. Patience, Judgment and Thrift remain the existing temperaments, not extra traits.

| Grade | Main bonus | Additional flat bonus | Malus | Effect lines |
|---|---|---|---|---|
| Common | Small | None | Big | 2 |
| Uncommon | Medium | None | Medium | 2 |
| Rare | Medium | Small | Medium | 3 |
| Epic | Medium | Small | Small | 3 |
| Legendary | Big | Medium | Small | 3 |

- Every Common has a real upside. No blank strength and no all-penalty cards.
- The main bonus and malus keep their effect types through all grades. Rare introduces the additional bonus. That bonus normally scales in quantity; Legendary Flirt and Legendary Planner instead replace it with one bordering province. This occupies the same third effect line.
- Every additional bonus happens immediately at coronation: a fixed quantity of Gold, Army, factories, fortresses, an amnesty, equal rights, or a bordering province at Legendary. Its quantity is written in content, not scaled automatically to national size. Permanent acceptance is a lasting rule change granted once, rather than a recurring numerical modifier.
- **Main bonuses are a percentage, additional bonuses are a flat amount, on purpose.** A percentage is worth more to a big nation, a flat grant more to a small one, and every card from Rare up carries both. Nation size is part of the choice, not something to correct for.
- **No two traits share a main bonus** (the generator refuses it). Two traits may share a resource in their flat bonus or malus, but never the whole character.
- **The flat bonus is the one-time version of what the trait is about:** a Warmonger gets soldiers, a Tyrant seized Gold, a Flirt a dowry, a Religious king a free Reform. Gold is a flat bonus only where the character explains where it came from (hoard, seizure, dowry, prize money, cards).
- A higher grade of the same trait increases the stated reward or reduces its stated penalty. This is a progression of card effects, not a guarantee of a better simulated outcome: a larger Army still takes workers and costs upkeep. Geography, resource floors and other saturation can make a particular upgrade irrelevant. Different traits remain situational choices; the game never recommends an heir.
- Keep the current grade odds for now: Common 46%, Uncommon 30%, Rare 15%, Epic 8%, Legendary 1%. Every nation uses the same full pool and odds; AI nations still choose randomly. There are no trait eligibility filters. Tuning odds is a separate decision.
- A hand contains three different traits, never three grades of one trait. No stacking, levelling, evolutions, or managing between successions.

## Plain language

The trait name must make sense without knowing historical vocabulary. Retain flavour through character and consequences. Do not require a tooltip to translate the name.

| Earlier name | Draft name | Meaning kept in this draft |
|---|---|---|
| Miser | Stingy | Cuts bills and resists spending on construction |
| Spendthrift | Big Spender | Brings prosperity and leaves bills |
| Revanchist | Vengeful | Wants his nation's lost land back |
| Lecher | Flirt | Popular and well connected, with a disputed succession |
| Pious | Religious | Funds peaceful social measures at the Army's expense |
| Shrewd | Sharp | Reads military odds well, thinks less far ahead |
| Dynast | Planner | Invests in the future at a present cost |
| Chauvinist | Nationalist | Favours his own people at other peoples' expense |
| Iron | Strict | Crushes Uprisings and leaves resentment |
| Navigator | Sailor | Builds coastal wealth at a military cost |
| Drunkard | Drunk | Popular company with unreliable Judgment |

These are player-facing renames, not claims that the words are exact synonyms. In particular, Flirt is a milder character than Lecher; Nationalist's description must explicitly show unequal treatment rather than rely on the label. The table describes the replacement effects; old mechanics do not carry over through a name.

**Ruler identity is rarity + trait:** Common Builder, Rare Soldier, Legendary Flirt. Use that same label on cards, in the panel, the Almanac and the chronicle. Add the nation when context requires it, such as “France's Rare Builder”. There are no separate personal names, regnal numbers or grade-specific titles. Remove the naming machinery and its ruler-only data during implementation. Twenty trait labels and five rarity labels describe all 100 combinations; do not author 100 additional names. Keep the one character line per trait.

## Reading the full matrix

The row supplies the trait and the column supplies its rarity. Each cell lists the main bonus (▲), additional bonus if present (◆), and malus (▼). These marks are document notation; the game uses each concept's registered icon and a timing label. There is no separate game resource called a bonus or a malus. A situational bonus is allowed to have no effect; the card does not promise an alternative reward.

Except where a line names coronation, an ending, Reforms, or a kind of War, its effect applies throughout this ruler's reign and stops when that reign ends. An additional factory is an actual factory that remains after the reign; a grant of Gold or Army is spent, lost or retained under the ordinary rules. They are not removed automatically on succession.

The values are a first tuning proposal, chosen to expose all 100 cards concretely. Small/medium/big are relative within one effect; they do not claim equal value across resources or traits. Values will live once in content tables when implemented; the matrix will then be generated from those tables, never become a second runtime source of content.

## Full matrix: 20 traits × 5 grades

| Trait | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Warmonger** | ▲ Army recruitment costs 10% less<br>▼ Army upkeep +50% | ▲ Army recruitment costs 25% less<br>▼ Army upkeep +25% | ▲ Army recruitment costs 25% less<br>◆ +5k Army<br>▼ Army upkeep +25% | ▲ Army recruitment costs 25% less<br>◆ +5k Army<br>▼ Army upkeep +10% | ▲ Army recruitment costs 50% less<br>◆ +10k Army<br>▼ Army upkeep +10% |
| **Soldier** | ▲ Army fights 10% harder<br>▼ Army loses 60% more men in Battle | ▲ Army fights 25% harder<br>▼ Army loses 30% more men in Battle | ▲ Army fights 25% harder<br>◆ +5k Army<br>▼ Army loses 30% more men in Battle | ▲ Army fights 25% harder<br>◆ +5k Army<br>▼ Army loses 10% more men in Battle | ▲ Army fights 75% harder<br>◆ +10k Army<br>▼ Army loses 10% more men in Battle |
| **Bold** | ▲ Breaks through with 10% less advantage<br>▼ Believes his chance of winning a War is 25 points too high | ▲ Breaks through with 25% less advantage<br>▼ Believes his chance of winning a War is 15 points too high | ▲ Breaks through with 25% less advantage<br>◆ +30 Gold (won at cards)<br>▼ Believes his chance of winning a War is 15 points too high | ▲ Breaks through with 25% less advantage<br>◆ +30 Gold (won at cards)<br>▼ Believes his chance of winning a War is 5 points too high | ▲ Breaks through with 50% less advantage<br>◆ +60 Gold (won at cards)<br>▼ Believes his chance of winning a War is 5 points too high |
| **Cautious** | ▲ Stops 10% of enemy advances on his land<br>▼ Breaks through only with 50% more advantage | ▲ Stops 25% of enemy advances on his land<br>▼ Breaks through only with 25% more advantage | ▲ Stops 25% of enemy advances on his land<br>◆ Fortifies 1 random province<br>▼ Breaks through only with 25% more advantage | ▲ Stops 25% of enemy advances on his land<br>◆ Fortifies 1 random province<br>▼ Breaks through only with 10% more advantage | ▲ Stops 50% of enemy advances on his land<br>◆ Fortifies 2 random provinces<br>▼ Breaks through only with 10% more advantage |
| **Paranoid** | ▲ Fortresses cost 15% less<br>▼ Sea trade −40% | ▲ Fortresses cost 35% less<br>▼ Sea trade −20% | ▲ Fortresses cost 35% less<br>◆ Fortifies 1 random province<br>▼ Sea trade −20% | ▲ Fortresses cost 35% less<br>◆ Fortifies 1 random province<br>▼ Sea trade −10% | ▲ Fortresses cost 60% less<br>◆ Fortifies 2 random provinces<br>▼ Sea trade −10% |
| **Builder** | ▲ Factories cost 10% less<br>▼ Fortresses cost 60% more | ▲ Factories cost 25% less<br>▼ Fortresses cost 30% more | ▲ Factories cost 25% less<br>◆ +1 factory in the capital<br>▼ Fortresses cost 30% more | ▲ Factories cost 25% less<br>◆ +1 factory in the capital<br>▼ Fortresses cost 10% more | ▲ Factories cost 50% less<br>◆ +2 factory in the capital<br>▼ Fortresses cost 10% more |
| **Stingy** | ▲ Army upkeep −10%<br>▼ Factories cost 50% more | ▲ Army upkeep −25%<br>▼ Factories cost 25% more | ▲ Army upkeep −25%<br>◆ +30 Gold<br>▼ Factories cost 25% more | ▲ Army upkeep −25%<br>◆ +30 Gold<br>▼ Factories cost 10% more | ▲ Army upkeep −50%<br>◆ +60 Gold<br>▼ Factories cost 10% more |
| **Big Spender** | ▲ Gold a year +10%<br>▼ Loses 100% of his Gold when his reign ends | ▲ Gold a year +20%<br>▼ Loses 60% of his Gold when his reign ends | ▲ Gold a year +20%<br>◆ +1 factory in the capital<br>▼ Loses 60% of his Gold when his reign ends | ▲ Gold a year +20%<br>◆ +1 factory in the capital<br>▼ Loses 30% of his Gold when his reign ends | ▲ Gold a year +40%<br>◆ +2 factory in the capital<br>▼ Loses 30% of his Gold when his reign ends |
| **Tyrant** | ▲ Taxes +20%<br>▼ Unrest +20 during his reign | ▲ Taxes +40%<br>▼ Unrest +12 during his reign | ▲ Taxes +40%<br>◆ +30 Gold (seized)<br>▼ Unrest +12 during his reign | ▲ Taxes +40%<br>◆ +30 Gold (seized)<br>▼ Unrest +5 during his reign | ▲ Taxes +80%<br>◆ +60 Gold (seized)<br>▼ Unrest +5 during his reign |
| **Reformer** | ▲ Reforms remove 25% more Unrest<br>▼ Taxes −20% | ▲ Reforms remove 50% more Unrest<br>▼ Taxes −10% | ▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 everywhere<br>▼ Taxes −10% | ▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 everywhere<br>▼ Taxes −5% | ▲ Reforms remove 100% more Unrest<br>◆ Unrest −20 everywhere<br>▼ Taxes −5% |
| **Drunk** | ▲ Unrest −5 in his own people's provinces<br>▼ Believed chance of winning a War swings by up to 30 points each season | ▲ Unrest −10 in his own people's provinces<br>▼ Believed chance of winning a War swings by up to 20 points each season | ▲ Unrest −10 in his own people's provinces<br>◆ Unrest −10 in his own people's provinces (a feast)<br>▼ Believed chance of winning a War swings by up to 20 points each season | ▲ Unrest −10 in his own people's provinces<br>◆ Unrest −10 in his own people's provinces (a feast)<br>▼ Believed chance of winning a War swings by up to 5 points each season | ▲ Unrest −20 in his own people's provinces<br>◆ Unrest −20 in his own people's provinces (a feast)<br>▼ Believed chance of winning a War swings by up to 5 points each season |
| **Vengeful** | ▲ Army fights 10% harder in Wars over a home province<br>▼ Army upkeep +40% | ▲ Army fights 25% harder in Wars over a home province<br>▼ Army upkeep +20% | ▲ Army fights 25% harder in Wars over a home province<br>◆ +5k Army<br>▼ Army upkeep +20% | ▲ Army fights 25% harder in Wars over a home province<br>◆ +5k Army<br>▼ Army upkeep +10% | ▲ Army fights 75% harder in Wars over a home province<br>◆ +10k Army<br>▼ Army upkeep +10% |
| **Flirt** | ▲ Unrest −5 in other peoples' provinces<br>▼ Civil war when his reign ends, +40 Unrest | ▲ Unrest −10 in other peoples' provinces<br>▼ Civil war when his reign ends, +25 Unrest | ▲ Unrest −10 in other peoples' provinces<br>◆ +30 Gold (a dowry)<br>▼ Civil war when his reign ends, +25 Unrest | ▲ Unrest −10 in other peoples' provinces<br>◆ +30 Gold (a dowry)<br>▼ Civil war when his reign ends, +10 Unrest | ▲ Unrest −20 in other peoples' provinces<br>◆ Gains 1 random bordering province (a marriage)<br>▼ Civil war when his reign ends, +10 Unrest |
| **Religious** | ▲ Reforms cost 15% less<br>▼ Army fights 30% less hard | ▲ Reforms cost 35% less<br>▼ Army fights 15% less hard | ▲ Reforms cost 35% less<br>◆ 1 free Reform<br>▼ Army fights 15% less hard | ▲ Reforms cost 35% less<br>◆ 1 free Reform<br>▼ Army fights 5% less hard | ▲ Reforms cost 60% less<br>◆ 2 free Reforms<br>▼ Army fights 5% less hard |
| **Sharp** | ▲ Judgment error 25% smaller<br>▼ Plans 8 fewer years ahead | ▲ Judgment error 60% smaller<br>▼ Plans 4 fewer years ahead | ▲ Judgment error 60% smaller<br>◆ Truce with every neighbour for 5 years<br>▼ Plans 4 fewer years ahead | ▲ Judgment error 60% smaller<br>◆ Truce with every neighbour for 5 years<br>▼ Plans 2 fewer years ahead | ▲ Judgment error 100% smaller<br>◆ Truce with every neighbour for 10 years<br>▼ Plans 2 fewer years ahead |
| **Planner** | ▲ Plans 4 extra years ahead<br>▼ Gold a year −20% | ▲ Plans 10 extra years ahead<br>▼ Gold a year −10% | ▲ Plans 10 extra years ahead<br>◆ +1 factory in a random province<br>▼ Gold a year −10% | ▲ Plans 10 extra years ahead<br>◆ +1 factory in a random province<br>▼ Gold a year −5% | ▲ Plans 20 extra years ahead<br>◆ Gains 1 random bordering province (an inheritance)<br>▼ Gold a year −5% |
| **Tolerant** | ▲ Conquests become Integrated 25% faster<br>▼ Unrest +15 in his own people's provinces | ▲ Conquests become Integrated 75% faster<br>▼ Unrest +8 in his own people's provinces | ▲ Conquests become Integrated 75% faster<br>◆ Equal rights for 1 random people, permanently<br>▼ Unrest +8 in his own people's provinces | ▲ Conquests become Integrated 75% faster<br>◆ Equal rights for 1 random people, permanently<br>▼ Unrest +3 in his own people's provinces | ▲ Conquests become Integrated 200% faster<br>◆ Equal rights for 2 random peoples, permanently<br>▼ Unrest +3 in his own people's provinces |
| **Nationalist** | ▲ His own people's Taxes +20%<br>▼ Other peoples' provinces become Integrated 60% slower | ▲ His own people's Taxes +50%<br>▼ Other peoples' provinces become Integrated 35% slower | ▲ His own people's Taxes +50%<br>◆ +5k Army (volunteers)<br>▼ Other peoples' provinces become Integrated 35% slower | ▲ His own people's Taxes +50%<br>◆ +5k Army (volunteers)<br>▼ Other peoples' provinces become Integrated 10% slower | ▲ His own people's Taxes +100%<br>◆ +10k Army (volunteers)<br>▼ Other peoples' provinces become Integrated 10% slower |
| **Strict** | ▲ Army fights Uprisings 25% harder<br>▼ Other peoples' provinces gain 40 Unrest when his reign ends | ▲ Army fights Uprisings 75% harder<br>▼ Other peoples' provinces gain 25 Unrest when his reign ends | ▲ Army fights Uprisings 75% harder<br>◆ Unrest −10 in other peoples' provinces (a crackdown)<br>▼ Other peoples' provinces gain 25 Unrest when his reign ends | ▲ Army fights Uprisings 75% harder<br>◆ Unrest −10 in other peoples' provinces (a crackdown)<br>▼ Other peoples' provinces gain 10 Unrest when his reign ends | ▲ Army fights Uprisings 200% harder<br>◆ Unrest −20 in other peoples' provinces (a crackdown)<br>▼ Other peoples' provinces gain 10 Unrest when his reign ends |
| **Sailor** | ▲ Sea trade +25%<br>▼ Army recruitment costs 50% more | ▲ Sea trade +50%<br>▼ Army recruitment costs 25% more | ▲ Sea trade +50%<br>◆ +30 Gold (prize money)<br>▼ Army recruitment costs 25% more | ▲ Sea trade +50%<br>◆ +30 Gold (prize money)<br>▼ Army recruitment costs 10% more | ▲ Sea trade +100%<br>◆ +60 Gold (prize money)<br>▼ Army recruitment costs 10% more |

## One line of character per trait

This line stays the same at all grades. It must describe a person, not a forecast weight or a promise that the AI will take a particular action.

| Trait | Character line |
|---|---|
| **Warmonger** | Would rather recruit an army than host a dinner. |
| **Soldier** | Lives in uniform and expects everyone else to keep up. |
| **Bold** | Always bets on himself. |
| **Cautious** | Would rather hold his ground than bury his men. |
| **Paranoid** | Checks the locks before checking the budget. |
| **Builder** | Talks of nothing but coal, iron and railways. |
| **Stingy** | Cuts every bill and argues over every building contract. |
| **Big Spender** | Wants the whole world to see how rich his nation is. |
| **Tyrant** | Expects obedience, and expects it to pay. |
| **Reformer** | Thinks the old laws are the problem. |
| **Drunk** | Never seen before noon; everyone knows his favourite tavern. |
| **Vengeful** | Keeps a map of every province his nation has lost. |
| **Flirt** | Falls in love at every foreign court. |
| **Religious** | Would rather fund a charity than a military parade. |
| **Sharp** | Reads every dispatch twice and spots a bad bet. |
| **Planner** | Builds for a future he may never live to see. |
| **Tolerant** | Sees his subjects as neighbours, whatever language they speak. |
| **Nationalist** | Puts his own people first and makes sure everyone knows it. |
| **Strict** | Has never let an uprising go unanswered. |
| **Sailor** | Happier on a ship than a throne. |

## Smallest application scope

**Three places apply effects: coronation, ordinary simulation formulas, and the existing end-of-reign function.** All additional bonuses happen at coronation; there are no delayed rewards. One-time changes mutate ordinary state. Reign modifiers are read from the current ruler and disappear with him. No separate effect engine, scheduler, grant ledger, stored bill, target preview, historical War flag or migration layer is needed.

**A wasted effect stays wasted.** No compensation, replacement reward, search for a better target, eligibility reroll or requirement that every pick be useful. Situational value is part of choosing a ruler.

| Effect | Entire application rule |
|---|---|
| Gold or Army grant/payment | Add or subtract the listed amount. Use existing Gold/Army rules afterward. |
| Factory grant | Add the listed factories to the existing capital (Builder, Big Spender), or to one random owned province (Planner). Leave construction alone. |
| Truce grant (Sharp) | Set the existing truce with every neighbour, both ways, to the listed number of years from now. |
| Free Reform (Religious) | Apply the existing Reform effect the listed number of times, without its cost or wait. |
| Breakthrough (Bold, Cautious) | Multiply the existing advantage needed for a second front move in one battle (`ratio > 2.2` in `tickWars`, moved to content) by the ruler's modifier: lower for Bold attacking, higher for Cautious attacking. |
| Territory grant (Legendary Flirt/Planner) | Pick one random foreign-owned province adjacent to an owned province, and use the existing non-war province transfer. No bordering province means no change. |
| Fortress grant | Choose up to the listed number of distinct owned provinces at random and set their Fortress to present. Already present means no change. Leave construction alone. |
| Equal rights | Choose up to the listed number of distinct peoples living in owned provinces at random and add them to the accepted set. Already accepted means no change. |
| One-time Unrest | Add/subtract it in the stated owned provinces (all, his own people's, or other peoples'), using the ordinary 0–100 bounds. |
| Share of Gold at the end (Big Spender) | When his reign ends, if the treasury is positive, remove the listed share of it. A treasury in debt is left alone. |
| Cost, upkeep, output, casualties, strength or integration | Multiply the existing value by the ruler's modifier. Use the same modifier in the matching forecast. |
| Unrest during a reign | Add the modifier to the existing seasonal Unrest target, in all provinces or only those of the stated people. Keep the normal gradual adjustment. |
| Patience | Add/subtract years from the ordinary horizon; keep the existing minimum. |
| Judgment | Apply the listed change to ordinary believed win chance; leave true chance alone. |
| Civil war (Flirt) | No roll: a Flirt's reign always ends in the existing Civil war. The grade sets only the Unrest it adds (today a fixed +25 in `successionLog`, which becomes the Flirt's number). Keep the ordinary succession flow. |

Random choices use the existing seeded RNG, once at coronation. Fortress and equal-rights grants select from all owned provinces or all distinct resident peoples, without filtering for usefulness, occupation, an existing Fortress or existing acceptance. Fewer available means fewer affected. Cards say “random”; there is no destination prediction UI. Factories use the existing capital directly. A Fortress already being built can finish normally and set the same present flag again. Nothing needs to reconcile the grant with construction.

Legendary Flirt gains the province through marriage; Legendary Planner inherits it. Both flavours perform exactly the same instant transfer. Use the existing map adjacency, including sea crossings, and the ordinary transfer consequences. Any bordering province can be chosen, including an ally's province or a nation's last province. There are no additional diplomatic conditions, protected targets, negotiations or targeting UI. The transfer replaces the additional bonus, never becomes a fourth effect. Its actual value is measured during automated balancing.

### Short definitions for the existing formulas

- Taxes affect Taxes only; Nationalist affects Taxes of his own people only. Gold a year affects Taxes, factory output and Sea trade. Ordinary blockades and other game rules still apply.
- Soldier's loss modifier affects Army battle losses. Cautious adds a stop check when an enemy advances into his owned province; ordinary Fortress checks remain. Strict's strength applies against Uprisings only.
- Vengeful's strength applies when the current War goal's existing `core` belongs to his nation, whether defending it or reclaiming it. This is what the card calls a home province. Forecast the same condition for a proposed War. No saved reconquest flag or additional history is created.
- "His own people" means provinces of accepted peoples (his culture and any he has accepted); "other peoples" means every other owned province. Drunk, Tolerant and Nationalist read the first, Flirt, Strict and Nationalist's malus the second, from present state.
- Tolerant multiplies the ordinary integration rate. Nationalist slows only unaccepted peoples' provinces. Strict's exit shock affects currently unaccepted peoples' provinces. Read present state; never remember which ruler conquered or accepted whom.
- Bold adds the listed percentage points to ordinary believed win chance. Drunk adds one random offset within the listed range, redrawn each season. Sharp reduces the ordinary believed-versus-true gap by the listed share. Keep chances within 0–100%; Legendary Sharp reads the true chance. The same calculation serves War forecasts and ultimatums.

Big Spender's end bill is a **share of the Gold he leaves**, so it bites a rich nation as hard as a poor one without any benchmark or snapshot. Sailor's additional bonus is **Gold**, removing coastal factory targeting. Fortresses and equal rights use the same simple random-selection rule above. These are deliberate simplifications to the reviewed table. Extra Army still costs upkeep and workers and can be demobilised. Permanent state changes survive succession naturally; no extra persistence system is introduced. The end-of-reign hook applies listed exit changes, then ordinary succession continues. Drawing, viewing and rerolling cards apply nothing.

## Complete replacement

The new pool is exactly the 20 traits above at five grades. Replace all old ruler content and remove old ruler-only machinery, including Mad/Child King moods, Admirer and Arbiter behaviour, the Genius's regency, Great Builder landmarks, Liberator-specific coups, special legendary levies, fewer lost workers, ignored truces, isolated enemies, keep-all peace terms, temporary conversions and automatic legendary collapses. Delete their unused content, code, copy, icons and Almanac entries. A trait label carries only the effects listed in the new table.

Usurper and Incompetent are removed too. A coup still exists as a normal game event, but installs a random ruler from the new pool without a player choice. It does not install a separate trait or give legacy Usurper effects. All rulers, including rotating councils, use the new pool; existing government names need no new institution or card type. National starting data, ordinary temperaments, ordinary Wars, Uprisings and Civil wars stay. Ruler personal-name pools and regnal numbering are removed with the old naming system. Remove dependencies exclusive to the old leader content, not the shared game systems the new traits use. There is no compatibility pool or save migration in scope.

Expanding the pool is a separate future discussion. No extra traits or preserved special rulers are added during replacement.

## Implementation boundary

This task edits the spec and CLAUDE.md's future-work summary only. Keep live content, engine and generated HTML unchanged until implementation.

Implementation should use the existing crowning, seasonal and succession paths, with small reads of effect values in the existing formulas. Define trait slots and grade amounts once in `content/`; generate descriptions through placeholders. Retain concept icons and the Almanac as the shared presentation. Show two effect lines at Common/Uncommon and three at Rare/Epic/Legendary, under the rarity + trait label and its character line. Compose that label from the existing rarity and trait names; store no per-grade names. A hand excludes duplicate traits, with no other draw filters. Keep current grade odds and random AI picks.

Do not create a general rules framework, target ranking, overflow conversion, guaranteed-usefulness checks, per-ruler audit history or a second forecast simulator. Verify real effects and forecasts use the same values. Remove old branches as part of the replacement rather than wrapping them for compatibility.

## Automated balance and validation

The agent owns tuning. The user is not expected to adjust numbers by hand or decide whether each percentage is balanced. Start with the table, run the required 40-world before/after sweeps, read chronicles, identify material failures and tune content values in bounded iterations. Preserve the grade structure and odds. Report measured results and remaining tradeoffs; do not claim equal balance or ask the user to tune individual cards. Do not build an optimiser or a permanent new balancing subsystem.

Compare the existing measures: Wars, Uprisings, Ukraine surviving in 1918, richest great power, unions proclaimed and held, Survive nations alive, and the 1918 Autumn ending. Check small and large nations, one-time application, unchanged state on draw/reroll, the full replacement pool, and player/AI parity. No sweep is needed for this documentation-only change.

## Decisions settled

1. The 20-trait review and plain-language names are accepted; the simplified applications above are the scoped revision.
2. Numerical tuning is delegated to the agent using automated simulations.
3. All old leader content and its exclusive systems go. This is replacement, not addition.
4. All additional bonuses happen immediately at coronation. Existing listed exit penalties use the ordinary end-of-reign path.
5. Grade odds stay unchanged for the first measured version.
6. Application prioritises simple state changes and existing formulas. Useless or already-satisfied effects are allowed to do nothing.
7. Rulers are labelled only by rarity + trait; no personal names, regnal numbering or separate titles.
8. Legendary Flirt and Legendary Planner replace their additional bonus with immediate ownership of one random bordering province through the ordinary transfer rules. Taking a nation's last province, and so ending it, is intended.
9. Main bonuses are percentages and additional bonuses flat amounts, on purpose: nation size is part of the choice. No two traits share a main bonus, and additional bonuses are thematic.
10. A Flirt's reign always ends in Civil war; no rolls.
11. Balance, Big Spender's numbers and the grade steps are the agent's to tune.

When implemented, this replaces the old “rarer means bigger price” rule with a better reward/penalty balance at higher grades, and the one-effect-line rule with two or three lines. Same rules for everyone, rational forecasts in Gold, hidden relations, no management between successions, reachable conquest and the 1918 ending remain settled.
