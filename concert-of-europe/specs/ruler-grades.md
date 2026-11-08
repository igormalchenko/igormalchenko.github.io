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
- The three effect types stay the same through a trait's grades. Only their amounts change; Rare introduces the extra bonus.
- Every additional bonus happens immediately at coronation: a fixed quantity of Gold, Army, factories, fortresses, an amnesty, or equal rights. Its quantity is written in content, not scaled automatically to national size. Permanent acceptance is a lasting rule change granted once, rather than a recurring numerical modifier.
- Two traits may use the same resource; their complete effects must make them different characters. No two traits may have identical active effects at any grade. Do not use unique pairs as a substitute for checking actual cards.
- A higher grade of the same trait increases the stated reward or reduces its stated penalty. This is a progression of card effects, not a guarantee of a better simulated outcome: a larger Army still takes workers and costs upkeep. Geography, resource floors and other saturation can make a particular upgrade irrelevant. Different traits remain situational choices; the game never recommends an heir.
- Keep the current grade odds for now: Common 46%, Uncommon 30%, Rare 15%, Epic 8%, Legendary 1%. Every nation uses the same full pool and odds; AI nations still choose randomly. There are no trait eligibility filters. Tuning odds is a separate decision.
- A hand contains three different traits, never three grades of one trait. No stacking, levelling, evolutions, or managing between successions.

## Plain language

The trait and title must make sense without knowing historical vocabulary. Retain flavour through character and consequences. Do not require a tooltip to translate the name.

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

Remove old titles such as the Sot, the Tippler, the Wastrel, the Skinflint, the Rake, the Gallant, the Devout and the Unassailable. The full matrix supplies readable replacements. Ordinary titles such as the Builder, the Soldier, the Saint and the Lion can stay. Titles describe the character; the grade label conveys rarity. The stable trait name stays visible beside the ruler's title so players do not have to learn 100 unrelated characters.

## Reading the full matrix

Each cell is one complete card: title, main bonus (▲), additional bonus if present (◆), malus (▼). These marks are document notation; the game uses each concept's registered icon and a timing label. There is no separate game resource called a bonus or a malus. A situational bonus is allowed to have no effect; the card does not promise an alternative reward.

Except where a line names coronation, an ending, Reforms, or a kind of War, its effect applies throughout this ruler's reign and stops when that reign ends. An additional factory is an actual factory that remains after the reign; a grant of Gold or Army is spent, lost or retained under the ordinary rules. They are not removed automatically on succession.

The values are a first tuning proposal, chosen to expose all 100 cards concretely. Small/medium/big are relative within one effect; they do not claim equal value across resources or traits. Values will live once in content tables when implemented; the matrix will then be generated from those tables, never become a second runtime source of content.

## Full matrix: 20 traits × 5 grades

| Trait | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Warmonger** | *the Aggressor*<br>▲ Army recruitment costs 10% less<br>▼ Army upkeep +50% | *the Fighter*<br>▲ Army recruitment costs 25% less<br>▼ Army upkeep +25% | *the Commander*<br>▲ Army recruitment costs 25% less<br>◆ +5k Army at coronation<br>▼ Army upkeep +25% | *the Conqueror*<br>▲ Army recruitment costs 25% less<br>◆ +5k Army at coronation<br>▼ Army upkeep +10% | *the Unstoppable*<br>▲ Army recruitment costs 50% less<br>◆ +10k Army at coronation<br>▼ Army upkeep +10% |
| **Soldier** | *the Rough*<br>▲ Army fights 10% harder<br>▼ Army loses 60% more men in Battle | *the Soldier*<br>▲ Army fights 25% harder<br>▼ Army loses 30% more men in Battle | *the Veteran*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Army loses 30% more men in Battle | *the General*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Army loses 10% more men in Battle | *the Undefeated*<br>▲ Army fights 100% harder<br>◆ +10k Army at coronation<br>▼ Army loses 10% more men in Battle |
| **Bold** | *the Reckless*<br>▲ Army fights 10% harder<br>▼ Believes his chance of winning a War is 25 percentage points too high | *the Bold*<br>▲ Army fights 25% harder<br>▼ Believes his chance of winning a War is 15 percentage points too high | *the Daring*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Believes his chance of winning a War is 15 percentage points too high | *the Fearless*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Believes his chance of winning a War is 5 percentage points too high | *the Lion*<br>▲ Army fights 100% harder<br>◆ +10k Army at coronation<br>▼ Believes his chance of winning a War is 5 percentage points too high |
| **Cautious** | *the Timid*<br>▲ Stops 10% of enemy advances on his land<br>▼ Army fights 30% less hard | *the Careful*<br>▲ Stops 25% of enemy advances on his land<br>▼ Army fights 15% less hard | *the Steady*<br>▲ Stops 25% of enemy advances on his land<br>◆ Fortifies 1 random province at coronation<br>▼ Army fights 15% less hard | *the Unbreakable*<br>▲ Stops 25% of enemy advances on his land<br>◆ Fortifies 1 random province at coronation<br>▼ Army fights 5% less hard | *the Rock*<br>▲ Stops 50% of enemy advances on his land<br>◆ Fortifies up to 2 random provinces at coronation<br>▼ Army fights 5% less hard |
| **Paranoid** | *the Nervous*<br>▲ Fortresses cost 15% less<br>▼ Factories cost 50% more | *the Suspicious*<br>▲ Fortresses cost 35% less<br>▼ Factories cost 25% more | *the Watchful*<br>▲ Fortresses cost 35% less<br>◆ Fortifies 1 random province at coronation<br>▼ Factories cost 25% more | *the Prepared*<br>▲ Fortresses cost 35% less<br>◆ Fortifies 1 random province at coronation<br>▼ Factories cost 10% more | *the Untouchable*<br>▲ Fortresses cost 60% less<br>◆ Fortifies up to 2 random provinces at coronation<br>▼ Factories cost 10% more |
| **Builder** | *the Demanding*<br>▲ Factories cost 10% less<br>▼ Unrest +20 during his reign | *the Builder*<br>▲ Factories cost 25% less<br>▼ Unrest +12 during his reign | *the Engineer*<br>▲ Factories cost 25% less<br>◆ +1 factory in the capital at coronation<br>▼ Unrest +12 during his reign | *the Architect*<br>▲ Factories cost 25% less<br>◆ +1 factory in the capital at coronation<br>▼ Unrest +5 during his reign | *the Great Builder*<br>▲ Factories cost 50% less<br>◆ +2 factories in the capital at coronation<br>▼ Unrest +5 during his reign |
| **Stingy** | *the Cheap*<br>▲ Army upkeep 10% less<br>▼ Factories cost 50% more | *the Stingy*<br>▲ Army upkeep 25% less<br>▼ Factories cost 25% more | *the Saver*<br>▲ Army upkeep 25% less<br>◆ +30 Gold at coronation<br>▼ Factories cost 25% more | *the Careful Spender*<br>▲ Army upkeep 25% less<br>◆ +30 Gold at coronation<br>▼ Factories cost 10% more | *the Golden*<br>▲ Army upkeep 50% less<br>◆ +60 Gold at coronation<br>▼ Factories cost 10% more |
| **Big Spender** | *the Wasteful*<br>▲ Gold a year +10%<br>▼ Pays 60 Gold when his reign ends | *the Spender*<br>▲ Gold a year +25%<br>▼ Pays 30 Gold when his reign ends | *the Generous*<br>▲ Gold a year +25%<br>◆ +1 factory in the capital at coronation<br>▼ Pays 30 Gold when his reign ends | *the Grand*<br>▲ Gold a year +25%<br>◆ +1 factory in the capital at coronation<br>▼ Pays 10 Gold when his reign ends | *the Sun King*<br>▲ Gold a year +60%<br>◆ +2 factories in the capital at coronation<br>▼ Pays 10 Gold when his reign ends |
| **Tyrant** | *the Bully*<br>▲ Taxes +20%<br>▼ Unrest +20 during his reign | *the Harsh*<br>▲ Taxes +50%<br>▼ Unrest +12 during his reign | *the Ruthless*<br>▲ Taxes +50%<br>◆ +30 Gold at coronation<br>▼ Unrest +12 during his reign | *the Iron Fist*<br>▲ Taxes +50%<br>◆ +30 Gold at coronation<br>▼ Unrest +5 during his reign | *the Iron King*<br>▲ Taxes +100%<br>◆ +60 Gold at coronation<br>▼ Unrest +5 during his reign |
| **Reformer** | *the Restless*<br>▲ Reforms remove 25% more Unrest<br>▼ Taxes 20% less | *the Reformer*<br>▲ Reforms remove 50% more Unrest<br>▼ Taxes 10% less | *the Fair*<br>▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 at coronation<br>▼ Taxes 10% less | *the Free*<br>▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 at coronation<br>▼ Taxes 5% less | *the Liberator*<br>▲ Reforms remove 100% more Unrest<br>◆ Unrest −20 at coronation<br>▼ Taxes 5% less |
| **Drunk** | *the Drunk*<br>▲ Unrest −5 during his reign<br>▼ Believed chance of winning a War swings by up to 30 percentage points each season | *the Party King*<br>▲ Unrest −10 during his reign<br>▼ Believed chance of winning a War swings by up to 20 percentage points each season | *the Merry*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 20 percentage points each season | *the Popular*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 5 percentage points each season | *the Beloved*<br>▲ Unrest −20 during his reign<br>◆ +60 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 5 percentage points each season |
| **Vengeful** | *the Bitter*<br>▲ Army fights 10% harder in Wars over a home province<br>▼ Spends 60 Gold at coronation | *the Vengeful*<br>▲ Army fights 25% harder in Wars over a home province<br>▼ Spends 30 Gold at coronation | *the Avenger*<br>▲ Army fights 25% harder in Wars over a home province<br>◆ +5k Army at coronation<br>▼ Spends 30 Gold at coronation | *the Restorer*<br>▲ Army fights 25% harder in Wars over a home province<br>◆ +5k Army at coronation<br>▼ Spends 10 Gold at coronation | *the Unforgiving*<br>▲ Army fights 100% harder in Wars over a home province<br>◆ +10k Army at coronation<br>▼ Spends 10 Gold at coronation |
| **Flirt** | *the Flirt*<br>▲ Unrest −5 during his reign<br>▼ 70% chance of Civil war when his reign ends | *the Charmer*<br>▲ Unrest −10 during his reign<br>▼ 40% chance of Civil war when his reign ends | *the Heartbreaker*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ 40% chance of Civil war when his reign ends | *the Irresistible*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ 25% chance of Civil war when his reign ends | *the Heartthrob*<br>▲ Unrest −20 during his reign<br>◆ +60 Gold at coronation<br>▼ 25% chance of Civil war when his reign ends |
| **Religious** | *the Preacher*<br>▲ Reforms cost 15% less<br>▼ Army fights 30% less hard | *the Faithful*<br>▲ Reforms cost 35% less<br>▼ Army fights 15% less hard | *the Charitable*<br>▲ Reforms cost 35% less<br>◆ +30 Gold at coronation<br>▼ Army fights 15% less hard | *the Peaceful*<br>▲ Reforms cost 35% less<br>◆ +30 Gold at coronation<br>▼ Army fights 5% less hard | *the Saint*<br>▲ Reforms cost 60% less<br>◆ +60 Gold at coronation<br>▼ Army fights 5% less hard |
| **Sharp** | *the Cunning*<br>▲ Judgment error 25% smaller<br>▼ Plans 8 fewer years ahead | *the Sharp*<br>▲ Judgment error 60% smaller<br>▼ Plans 4 fewer years ahead | *the Clever*<br>▲ Judgment error 60% smaller<br>◆ +30 Gold at coronation<br>▼ Plans 4 fewer years ahead | *the Calculating*<br>▲ Judgment error 60% smaller<br>◆ +30 Gold at coronation<br>▼ Plans 2 fewer years ahead | *the Mastermind*<br>▲ Sees his chance of winning a War exactly<br>◆ +60 Gold at coronation<br>▼ Plans 2 fewer years ahead |
| **Planner** | *the Slow*<br>▲ Plans 4 extra years ahead<br>▼ Taxes 20% less | *the Planner*<br>▲ Plans 10 extra years ahead<br>▼ Taxes 10% less | *the Patient*<br>▲ Plans 10 extra years ahead<br>◆ +1 factory in the capital at coronation<br>▼ Taxes 10% less | *the Far-Sighted*<br>▲ Plans 10 extra years ahead<br>◆ +1 factory in the capital at coronation<br>▼ Taxes 5% less | *the Visionary*<br>▲ Plans 20 extra years ahead<br>◆ +2 factories in the capital at coronation<br>▼ Taxes 5% less |
| **Tolerant** | *the Welcoming*<br>▲ Conquests become Integrated 25% faster<br>▼ Pays 60 Gold at coronation | *the Tolerant*<br>▲ Conquests become Integrated 75% faster<br>▼ Pays 30 Gold at coronation | *the Open-Minded*<br>▲ Conquests become Integrated 75% faster<br>◆ Gives equal rights to 1 random people at coronation, permanently<br>▼ Pays 30 Gold at coronation | *the Bridge-Builder*<br>▲ Conquests become Integrated 75% faster<br>◆ Gives equal rights to 1 random people at coronation, permanently<br>▼ Pays 10 Gold at coronation | *the Uniter*<br>▲ Conquests become Integrated 200% faster<br>◆ Gives equal rights to up to 2 random peoples at coronation, permanently<br>▼ Pays 10 Gold at coronation |
| **Nationalist** | *the Divisive*<br>▲ His own people's Taxes +20%<br>▼ Foreign provinces become Integrated 60% slower | *the Biased*<br>▲ His own people's Taxes +50%<br>▼ Foreign provinces become Integrated 35% slower | *the Patriot*<br>▲ His own people's Taxes +50%<br>◆ +5k Army at coronation<br>▼ Foreign provinces become Integrated 35% slower | *the Flag-Bearer*<br>▲ His own people's Taxes +50%<br>◆ +5k Army at coronation<br>▼ Foreign provinces become Integrated 10% slower | *the National Hero*<br>▲ His own people's Taxes +100%<br>◆ +10k Army at coronation<br>▼ Foreign provinces become Integrated 10% slower |
| **Strict** | *the Hard*<br>▲ Army fights Uprisings 25% harder<br>▼ Foreign provinces gain 40 Unrest when his reign ends | *the Strict*<br>▲ Army fights Uprisings 75% harder<br>▼ Foreign provinces gain 25 Unrest when his reign ends | *the Enforcer*<br>▲ Army fights Uprisings 75% harder<br>◆ Fortifies 1 random province at coronation<br>▼ Foreign provinces gain 25 Unrest when his reign ends | *the Iron-Willed*<br>▲ Army fights Uprisings 75% harder<br>◆ Fortifies 1 random province at coronation<br>▼ Foreign provinces gain 10 Unrest when his reign ends | *the Steel King*<br>▲ Army fights Uprisings 200% harder<br>◆ Fortifies up to 2 random provinces at coronation<br>▼ Foreign provinces gain 10 Unrest when his reign ends |
| **Sailor** | *the Distracted*<br>▲ Sea trade +25%<br>▼ Army upkeep +50% | *the Sailor*<br>▲ Sea trade +50%<br>▼ Army upkeep +25% | *the Captain*<br>▲ Sea trade +50%<br>◆ +30 Gold at coronation<br>▼ Army upkeep +25% | *the Admiral*<br>▲ Sea trade +50%<br>◆ +30 Gold at coronation<br>▼ Army upkeep +10% | *the Sea King*<br>▲ Sea trade +100%<br>◆ +60 Gold at coronation<br>▼ Army upkeep +10% |

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
| Factory grant | Add the listed factories to the existing capital. Leave construction alone. |
| Fortress grant | Choose up to the listed number of distinct owned provinces at random and set their Fortress to present. Already present means no change. Leave construction alone. |
| Equal rights | Choose up to the listed number of distinct peoples living in owned provinces at random and add them to the accepted set. Already accepted means no change. |
| One-time Unrest | Add/subtract it in the stated owned provinces, using the ordinary 0–100 bounds. |
| Cost, upkeep, output, casualties, strength or integration | Multiply the existing value by the ruler's modifier. Use the same modifier in the matching forecast. |
| Unrest during a reign | Add the modifier to the existing seasonal Unrest target. Keep the normal gradual adjustment. |
| Patience | Add/subtract years from the ordinary horizon; keep the existing minimum. |
| Judgment | Apply the listed change to ordinary believed win chance; leave true chance alone. |
| Civil war | Flirt supplies the probability to the existing succession Civil war roll. Keep the ordinary succession flow. |

Random choices use the existing seeded RNG, once at coronation. Select from all owned provinces or all distinct resident peoples, without filtering for usefulness, occupation, an existing Fortress or existing acceptance. Fewer available means fewer affected. Cards say “random”; there is no destination prediction UI. Factories use the existing capital directly. A Fortress already being built can finish normally and set the same present flag again. Nothing needs to reconcile the grant with construction.

### Short definitions for the existing formulas

- Taxes affect Taxes only; Nationalist affects Taxes of his own people only. Gold a year affects Taxes, factory output and Sea trade. Ordinary blockades and other game rules still apply.
- Soldier's loss modifier affects Army battle losses. Cautious adds a stop check when an enemy advances into his owned province; ordinary Fortress checks remain. Strict's strength applies against Uprisings only.
- Vengeful's strength applies when the current War goal's existing `core` belongs to his nation, whether defending it or reclaiming it. This is what the card calls a home province. Forecast the same condition for a proposed War. No saved reconquest flag or additional history is created.
- Tolerant multiplies the ordinary integration rate. Nationalist slows only unaccepted peoples' provinces. Strict's exit shock affects currently unaccepted peoples' provinces. Read present state; never remember which ruler conquered or accepted whom.
- Bold adds the listed percentage points to ordinary believed win chance. Drunk adds one random offset within the listed range, redrawn each season. Sharp reduces the ordinary believed-versus-true gap by the listed share. Keep chances within 0–100%; Legendary Sharp reads the true chance. The same calculation serves War forecasts and ultimatums.

Big Spender's end bill is now a **flat Gold payment**, removing all annual-production benchmarks and snapshots. Sailor's additional bonus is **Gold**, removing coastal factory targeting. Fortresses and equal rights use the same simple random-selection rule above. These are deliberate simplifications to the reviewed table. Extra Army still costs upkeep and workers and can be demobilised. Permanent state changes survive succession naturally; no extra persistence system is introduced. The end-of-reign hook applies listed exit changes, then ordinary succession continues. Drawing, viewing and rerolling cards apply nothing.

## Complete replacement

The new pool is exactly the 20 traits above at five grades. Replace all old ruler content and remove old ruler-only machinery, including Mad/Child King moods, Admirer and Arbiter behaviour, the Genius's regency, Great Builder landmarks, Liberator-specific coups, special legendary levies, fewer lost workers, ignored truces, isolated enemies, keep-all peace terms, temporary conversions and automatic legendary collapses. Delete their unused content, code, copy, icons and Almanac entries. Old titles grant no old abilities.

Usurper and Incompetent are removed too. A coup still exists as a normal game event, but installs a random ruler from the new pool without a player choice. It does not install a separate trait or give legacy Usurper effects. All rulers, including rotating councils, use the new pool; existing government names need no new institution or card type. Historical given names, national starting data, ordinary temperaments, ordinary Wars, Uprisings and Civil wars stay. Remove dependencies exclusive to the old leader content, not the shared game systems the new traits use. There is no compatibility pool or save migration in scope.

Expanding the pool is a separate future discussion. No extra traits or preserved special rulers are added during replacement.

## Implementation boundary

This task edits the spec and CLAUDE.md's future-work summary only. Keep live content, engine and generated HTML unchanged until implementation.

Implementation should use the existing crowning, seasonal and succession paths, with small reads of effect values in the existing formulas. Define trait slots and grade amounts once in `content/`; generate descriptions through placeholders. Retain concept icons and the Almanac as the shared presentation. Show two effect lines at Common/Uncommon and three at Rare/Epic/Legendary, plus trait, grade, title and character line. A hand excludes duplicate traits, with no other draw filters. Keep current grade odds and random AI picks.

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

When implemented, this replaces the old “rarer means bigger price” rule with a better reward/penalty balance at higher grades, and the one-effect-line rule with two or three lines. Same rules for everyone, rational forecasts in Gold, hidden relations, no management between successions, reachable conquest and the 1918 ending remain settled.
