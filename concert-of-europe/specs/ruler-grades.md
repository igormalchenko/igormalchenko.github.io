# Ruler quirks × grades

Status: design only; nothing in this file is implemented. The user agreed the grade structure below on 8 November 2026 and requested a full table and plain-language names. The 20 traits, their titles, effect pairings and tuning numbers below are the complete next draft for discussion, not measured balance results or approval to implement.

This replaces the earlier all-flaw Common / two-stat proposal. It proposes changes to the built ruler pool described in CLAUDE.md; the built game's truth remains `content/` and the Almanac. This file is deleted only once the agreed replacement is built and documented.

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
- The additional bonus is a one-time, fixed quantity: Gold, Army, factories, fortresses, an amnesty, or accepted peoples. Its quantity is written in content, not scaled automatically to national size. Permanent acceptance is a lasting rule change granted once, rather than a recurring numerical modifier.
- Two traits may use the same resource; their complete effects must make them different characters. No two traits may have identical active effects at any grade. Do not use unique pairs as a substitute for checking actual cards.
- A higher grade of the same trait increases the stated reward or reduces its stated penalty. This is a progression of card effects, not a guarantee of a better simulated outcome: a larger Army still takes workers and costs upkeep. Geography, resource floors and other saturation can make a particular upgrade irrelevant. Different traits remain situational choices; the game never recommends an heir.
- Keep the current grade odds for now: Common 46%, Uncommon 30%, Rare 15%, Epic 8%, Legendary 1%. AI nations use the same eligible pool and odds and still choose randomly. Tuning odds is a separate decision.
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

These are player-facing renames, not claims that the words are exact synonyms. In particular, Flirt is a milder character than Lecher; Nationalist's description must explicitly show unequal treatment rather than rely on the label. Effect redesigns are recorded below.

Remove old titles such as the Sot, the Tippler, the Wastrel, the Skinflint, the Rake, the Gallant, the Devout and the Unassailable. The full matrix supplies readable replacements. Ordinary titles such as the Builder, the Soldier, the Saint and the Lion can stay. Titles describe the character; the grade label conveys rarity. The stable trait name stays visible beside the ruler's title so players do not have to learn 100 unrelated characters.

## Reading the full matrix

Each cell is one complete card: title, main bonus (▲), additional bonus if present (◆), malus (▼). These marks are document notation; the game uses each concept's registered icon and a timing label. There is no separate game resource called a bonus or a malus.

Except where a line names coronation, an ending, Reforms, or a kind of War, its effect applies throughout this ruler's reign and stops when that reign ends. An additional factory is an actual factory that remains after the reign; a grant of Gold or Army is spent, lost or retained under the ordinary rules. They are not removed automatically on succession.

The values are a first tuning proposal, chosen to expose all 100 cards concretely. Small/medium/big are relative within one effect; they do not claim equal value across resources or traits. Values will live once in content tables when implemented; the matrix will then be generated from those tables, never become a second runtime source of content.

## Full matrix: 20 traits × 5 grades

| Trait | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Warmonger** | *the Aggressor*<br>▲ Army recruitment costs 10% less<br>▼ Army upkeep +50% | *the Fighter*<br>▲ Army recruitment costs 25% less<br>▼ Army upkeep +25% | *the Commander*<br>▲ Army recruitment costs 25% less<br>◆ +5k Army at coronation<br>▼ Army upkeep +25% | *the Conqueror*<br>▲ Army recruitment costs 25% less<br>◆ +5k Army at coronation<br>▼ Army upkeep +10% | *the Unstoppable*<br>▲ Army recruitment costs 50% less<br>◆ +10k Army at coronation<br>▼ Army upkeep +10% |
| **Soldier** | *the Rough*<br>▲ Army fights 10% harder<br>▼ Army loses 60% more men in Battle | *the Soldier*<br>▲ Army fights 25% harder<br>▼ Army loses 30% more men in Battle | *the Veteran*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Army loses 30% more men in Battle | *the General*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Army loses 10% more men in Battle | *the Undefeated*<br>▲ Army fights 100% harder<br>◆ +10k Army at coronation<br>▼ Army loses 10% more men in Battle |
| **Bold** | *the Reckless*<br>▲ Army fights 10% harder<br>▼ Believes his chance of winning a War is 25 percentage points too high | *the Bold*<br>▲ Army fights 25% harder<br>▼ Believes his chance of winning a War is 15 percentage points too high | *the Daring*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Believes his chance of winning a War is 15 percentage points too high | *the Fearless*<br>▲ Army fights 25% harder<br>◆ +5k Army at coronation<br>▼ Believes his chance of winning a War is 5 percentage points too high | *the Lion*<br>▲ Army fights 100% harder<br>◆ +10k Army at coronation<br>▼ Believes his chance of winning a War is 5 percentage points too high |
| **Cautious** | *the Timid*<br>▲ Stops 10% of enemy advances on his land<br>▼ Army fights 30% less hard | *the Careful*<br>▲ Stops 25% of enemy advances on his land<br>▼ Army fights 15% less hard | *the Steady*<br>▲ Stops 25% of enemy advances on his land<br>◆ +1 Fortress at coronation<br>▼ Army fights 15% less hard | *the Unbreakable*<br>▲ Stops 25% of enemy advances on his land<br>◆ +1 Fortress at coronation<br>▼ Army fights 5% less hard | *the Rock*<br>▲ Stops 50% of enemy advances on his land<br>◆ +2 Fortresses at coronation<br>▼ Army fights 5% less hard |
| **Paranoid** | *the Nervous*<br>▲ Fortresses cost 15% less<br>▼ Factories cost 50% more | *the Suspicious*<br>▲ Fortresses cost 35% less<br>▼ Factories cost 25% more | *the Watchful*<br>▲ Fortresses cost 35% less<br>◆ +1 Fortress at coronation<br>▼ Factories cost 25% more | *the Prepared*<br>▲ Fortresses cost 35% less<br>◆ +1 Fortress at coronation<br>▼ Factories cost 10% more | *the Untouchable*<br>▲ Fortresses cost 60% less<br>◆ +2 Fortresses at coronation<br>▼ Factories cost 10% more |
| **Builder** | *the Demanding*<br>▲ Factories cost 10% less<br>▼ Unrest +20 during his reign | *the Builder*<br>▲ Factories cost 25% less<br>▼ Unrest +12 during his reign | *the Engineer*<br>▲ Factories cost 25% less<br>◆ +1 factory in the capital at coronation<br>▼ Unrest +12 during his reign | *the Architect*<br>▲ Factories cost 25% less<br>◆ +1 factory in the capital at coronation<br>▼ Unrest +5 during his reign | *the Great Builder*<br>▲ Factories cost 50% less<br>◆ +2 factories in the capital at coronation<br>▼ Unrest +5 during his reign |
| **Stingy** | *the Cheap*<br>▲ Army upkeep 10% less<br>▼ Factories cost 50% more | *the Stingy*<br>▲ Army upkeep 25% less<br>▼ Factories cost 25% more | *the Saver*<br>▲ Army upkeep 25% less<br>◆ +30 Gold at coronation<br>▼ Factories cost 25% more | *the Careful Spender*<br>▲ Army upkeep 25% less<br>◆ +30 Gold at coronation<br>▼ Factories cost 10% more | *the Golden*<br>▲ Army upkeep 50% less<br>◆ +60 Gold at coronation<br>▼ Factories cost 10% more |
| **Big Spender** | *the Wasteful*<br>▲ Gold a year +10%<br>▼ Bill of 3 years of Gold a year when his reign ends | *the Spender*<br>▲ Gold a year +25%<br>▼ Bill of 1.5 years of Gold a year when his reign ends | *the Generous*<br>▲ Gold a year +25%<br>◆ +1 factory in the capital at coronation<br>▼ Bill of 1.5 years of Gold a year when his reign ends | *the Grand*<br>▲ Gold a year +25%<br>◆ +1 factory in the capital at coronation<br>▼ Bill of 0.5 years of Gold a year when his reign ends | *the Sun King*<br>▲ Gold a year +60%<br>◆ +2 factories in the capital at coronation<br>▼ Bill of 0.5 years of Gold a year when his reign ends |
| **Tyrant** | *the Bully*<br>▲ Taxes +20%<br>▼ Unrest +20 during his reign | *the Harsh*<br>▲ Taxes +50%<br>▼ Unrest +12 during his reign | *the Ruthless*<br>▲ Taxes +50%<br>◆ +30 Gold at coronation<br>▼ Unrest +12 during his reign | *the Iron Fist*<br>▲ Taxes +50%<br>◆ +30 Gold at coronation<br>▼ Unrest +5 during his reign | *the Iron King*<br>▲ Taxes +100%<br>◆ +60 Gold at coronation<br>▼ Unrest +5 during his reign |
| **Reformer** | *the Restless*<br>▲ Reforms remove 25% more Unrest<br>▼ Taxes 20% less | *the Reformer*<br>▲ Reforms remove 50% more Unrest<br>▼ Taxes 10% less | *the Fair*<br>▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 at coronation<br>▼ Taxes 10% less | *the Free*<br>▲ Reforms remove 50% more Unrest<br>◆ Unrest −10 at coronation<br>▼ Taxes 5% less | *the Liberator*<br>▲ Reforms remove 100% more Unrest<br>◆ Unrest −20 at coronation<br>▼ Taxes 5% less |
| **Drunk** | *the Drunk*<br>▲ Unrest −5 during his reign<br>▼ Believed chance of winning a War swings by up to 30 percentage points each season | *the Party King*<br>▲ Unrest −10 during his reign<br>▼ Believed chance of winning a War swings by up to 20 percentage points each season | *the Merry*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 20 percentage points each season | *the Popular*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 5 percentage points each season | *the Beloved*<br>▲ Unrest −20 during his reign<br>◆ +60 Gold at coronation<br>▼ Believed chance of winning a War swings by up to 5 percentage points each season |
| **Vengeful** | *the Bitter*<br>▲ Army fights 10% harder in wars for lost land<br>▼ Spends 60 Gold at coronation | *the Vengeful*<br>▲ Army fights 25% harder in wars for lost land<br>▼ Spends 30 Gold at coronation | *the Avenger*<br>▲ Army fights 25% harder in wars for lost land<br>◆ +5k Army at coronation<br>▼ Spends 30 Gold at coronation | *the Restorer*<br>▲ Army fights 25% harder in wars for lost land<br>◆ +5k Army at coronation<br>▼ Spends 10 Gold at coronation | *the Unforgiving*<br>▲ Army fights 100% harder in wars for lost land<br>◆ +10k Army at coronation<br>▼ Spends 10 Gold at coronation |
| **Flirt** | *the Flirt*<br>▲ Unrest −5 during his reign<br>▼ 70% chance of Civil war when his reign ends | *the Charmer*<br>▲ Unrest −10 during his reign<br>▼ 40% chance of Civil war when his reign ends | *the Heartbreaker*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ 40% chance of Civil war when his reign ends | *the Irresistible*<br>▲ Unrest −10 during his reign<br>◆ +30 Gold at coronation<br>▼ 25% chance of Civil war when his reign ends | *the Heartthrob*<br>▲ Unrest −20 during his reign<br>◆ +60 Gold at coronation<br>▼ 25% chance of Civil war when his reign ends |
| **Religious** | *the Preacher*<br>▲ Reforms cost 15% less<br>▼ Army fights 30% less hard | *the Faithful*<br>▲ Reforms cost 35% less<br>▼ Army fights 15% less hard | *the Charitable*<br>▲ Reforms cost 35% less<br>◆ +30 Gold at coronation<br>▼ Army fights 15% less hard | *the Peaceful*<br>▲ Reforms cost 35% less<br>◆ +30 Gold at coronation<br>▼ Army fights 5% less hard | *the Saint*<br>▲ Reforms cost 60% less<br>◆ +60 Gold at coronation<br>▼ Army fights 5% less hard |
| **Sharp** | *the Cunning*<br>▲ Judgment error 25% smaller<br>▼ Plans 8 fewer years ahead | *the Sharp*<br>▲ Judgment error 60% smaller<br>▼ Plans 4 fewer years ahead | *the Clever*<br>▲ Judgment error 60% smaller<br>◆ +30 Gold at coronation<br>▼ Plans 4 fewer years ahead | *the Calculating*<br>▲ Judgment error 60% smaller<br>◆ +30 Gold at coronation<br>▼ Plans 2 fewer years ahead | *the Mastermind*<br>▲ Sees his chance of winning a War exactly<br>◆ +60 Gold at coronation<br>▼ Plans 2 fewer years ahead |
| **Planner** | *the Slow*<br>▲ Plans 4 extra years ahead<br>▼ Taxes 20% less | *the Planner*<br>▲ Plans 10 extra years ahead<br>▼ Taxes 10% less | *the Patient*<br>▲ Plans 10 extra years ahead<br>◆ +1 factory in the capital at coronation<br>▼ Taxes 10% less | *the Far-Sighted*<br>▲ Plans 10 extra years ahead<br>◆ +1 factory in the capital at coronation<br>▼ Taxes 5% less | *the Visionary*<br>▲ Plans 20 extra years ahead<br>◆ +2 factories in the capital at coronation<br>▼ Taxes 5% less |
| **Tolerant** | *the Welcoming*<br>▲ Conquests become Integrated 25% faster<br>▼ Pays 60 Gold at coronation | *the Tolerant*<br>▲ Conquests become Integrated 75% faster<br>▼ Pays 30 Gold at coronation | *the Open-Minded*<br>▲ Conquests become Integrated 75% faster<br>◆ Accepts 1 more people at coronation, permanently<br>▼ Pays 30 Gold at coronation | *the Bridge-Builder*<br>▲ Conquests become Integrated 75% faster<br>◆ Accepts 1 more people at coronation, permanently<br>▼ Pays 10 Gold at coronation | *the Uniter*<br>▲ Conquests become Integrated 200% faster<br>◆ Accepts 2 more peoples at coronation, permanently<br>▼ Pays 10 Gold at coronation |
| **Nationalist** | *the Divisive*<br>▲ His own people's Taxes +20%<br>▼ Foreign provinces become Integrated 60% slower | *the Biased*<br>▲ His own people's Taxes +50%<br>▼ Foreign provinces become Integrated 35% slower | *the Patriot*<br>▲ His own people's Taxes +50%<br>◆ +5k Army at coronation<br>▼ Foreign provinces become Integrated 35% slower | *the Flag-Bearer*<br>▲ His own people's Taxes +50%<br>◆ +5k Army at coronation<br>▼ Foreign provinces become Integrated 10% slower | *the National Hero*<br>▲ His own people's Taxes +100%<br>◆ +10k Army at coronation<br>▼ Foreign provinces become Integrated 10% slower |
| **Strict** | *the Hard*<br>▲ Army fights Uprisings 25% harder<br>▼ Foreign provinces gain 40 Unrest when his reign ends | *the Strict*<br>▲ Army fights Uprisings 75% harder<br>▼ Foreign provinces gain 25 Unrest when his reign ends | *the Enforcer*<br>▲ Army fights Uprisings 75% harder<br>◆ +1 Fortress at coronation<br>▼ Foreign provinces gain 25 Unrest when his reign ends | *the Iron-Willed*<br>▲ Army fights Uprisings 75% harder<br>◆ +1 Fortress at coronation<br>▼ Foreign provinces gain 10 Unrest when his reign ends | *the Steel King*<br>▲ Army fights Uprisings 200% harder<br>◆ +2 Fortresses at coronation<br>▼ Foreign provinces gain 10 Unrest when his reign ends |
| **Sailor** | *the Distracted*<br>▲ Sea trade +25%<br>▼ Army upkeep +50% | *the Sailor*<br>▲ Sea trade +50%<br>▼ Army upkeep +25% | *the Captain*<br>▲ Sea trade +50%<br>◆ +1 factory on the coast at coronation<br>▼ Army upkeep +25% | *the Admiral*<br>▲ Sea trade +50%<br>◆ +1 factory on the coast at coronation<br>▼ Army upkeep +10% | *the Sea King*<br>▲ Sea trade +100%<br>◆ +2 factories on the coast at coronation<br>▼ Army upkeep +10% |

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

## Exact effect meanings

### Timing and one-time changes

- **At coronation:** resolve once when the chosen ruler actually takes power. Drawing, previewing or rerolling cards changes no nation state. Opening rulers, AI rulers and player rulers all receive their applicable effects exactly once. Do not accidentally apply a stand-in player's opening ruler first. Re-entry to a UI view never repeats a grant.
- **During his reign:** ongoing modifiers end immediately when he leaves power. Permanent factories, fortresses and accepted peoples remain. A unit of Army granted at coronation still costs ordinary upkeep and takes workers from production; the ministers may demobilise it rationally. No invisible standing order protects it.
- **When his reign ends:** Big Spender's bill and Strict's Unrest shock apply once on death, assassination, abdication, revolution or coup, while the nation still exists. Elimination supplies no successor and gets no end-of-reign payment. The 1918 armistice does not manufacture a death or charge an unpaid future bill; the agreed end date stays unchanged.
- **Flirt's Civil war:** the stated probability replaces the ordinary succession probability; it is not another roll on top of it. It applies to death, assassination and abdication. Revolutions and coups keep the current exceptions and do not start a second succession Civil war. The draft's small 25% remains above today's ordinary 18%, so it is still a malus.
- **Bills and compensation:** subtract Gold even if it makes Gold negative. There is no new debt currency or interest system. The ordinary consequences of negative Gold still apply. Incoming coronation effects happen after the outgoing reign's ending effects.

### Gold and the budget

- **Gold** means a one-time change to money held. **Gold a year** means gross annual Taxes + factory output + Sea trade, before Army upkeep or other spending. They never share a name or icon.
- Big Spender's percentage multiplies those three production components, not Gold held. Tyrant's percentage multiplies Taxes only. Nationalist multiplies Taxes only in provinces of his own people; accepted peoples do not count as his own for this effect. This narrows the current Chauvinist's whole-province multiplier deliberately.
- A Big Spender's bill is fixed when the card is created: the listed years times the nation's annual production without any outgoing or incoming ruler modifiers, at that offer's current geography, industry, workforce, Unrest and war state. The amount never recalculates at his exit. Show the exact Gold on the card, for example “Pays 45 Gold when his reign ends”; explain its benchmark in the Almanac. This avoids a bill changing because the dying ruler lost a War or a successor has another multiplier. AI rulers use the same calculation when drawn.
- Army recruitment discounts affect the Gold paid per recruit, not Army size, upkeep or workers. Army upkeep discounts and surcharges affect the existing upkeep budget line. Factory/Fortress costs affect the actual construction payment and the matching forecast. Reforms discounts affect both eligibility and payment; retaining today's undiscounted affordability gate would break the benefit.
- One-time Gold changes need a named entry in the budget and a chronicle line. Reconcile them separately from recurring production so a coronation grant does not appear to increase Gold a year.

### Grant locations and eligibility

- **Capital factories:** grant all listed factories to the capital determined at coronation. The card names the projected province; recompute and report the actual destination if the map changed before crowning. These special grants may exceed the AI's ordinary construction threshold, as existing great works already can. They do not delete, replace or complete an existing construction job.
- **Coastal factories:** all listed factories go to the owned, unoccupied coastal province with the largest population. Break ties by province id. The card names it. Sailor is eligible only with such a province; the sea-crossing graph and coastal flags come from map data, never guessed geography. The factory remains useful during a War even though ordinary Sea trade is blockaded.
- **Fortresses:** grant to unoccupied owned provinces without a Fortress. Prioritise provinces bordering another nation (including a sea crossing), then larger population, then province id. One Fortress per province. Keep existing factory construction; finish a Fortress construction job if the grant supplies that Fortress, so completion cannot produce a duplicate.
- A Fortress grant means up to the listed quantity. The card shows the actual available count and province names, never promises two where only one fits. For a Rare-or-higher trait whose additional slot grants Fortresses, require at least one eligible site. Do not silently convert overflow into Gold or invent another effect. Report saturation explicitly in comparisons; Legendary may deliver only one in a one-province nation.
- **Accepted peoples:** choose from currently unaccepted peoples living in owned provinces, highest total population first, then name. Accept up to the stated quantity, permanently, under existing acceptance rules. Show names and the actual count on the card. Require at least one eligible people for Tolerant at every grade because its additional bonus must have an eligible people. The amount available may make the Legendary acceptance grant equal the Rare grant. This acceptance does not by itself free serfs, instantly integrate provinces, or directly subtract Unrest: ordinary acceptance rules determine those consequences.
- **Vengeful:** eligible only if another living nation holds at least one of this nation's original-core provinces reachable across an existing border or sea crossing. List that lost land on the card. A distant, inaccessible former province does not qualify it.
- Apply identical eligibility rules to player and AI rulers. Roll grade first, then choose uniformly among eligible traits of that grade, excluding traits already in the player's hand. A reroll recomputes the available choices. This preserves grade odds but does not promise equal trait frequency where geography or peoples differ. Every grade has several unconditional traits, so eligibility must not silently reroll the grade or fall back to another grade.

### Army, defence and actual War odds

- Soldier/Bold strength multiplies Army fighting strength both in the forecast and in actual Wars. Soldier's extra battle losses multiply the seasonal percentage of Army lost for winners and losers. They do not directly multiply civilian population loss. Keep the Army strength and casualty concepts separate.
- Cautious supplies an additional stop chance against an enemy advance into his owned province. Apply it after the existing Fortress stop check; the combined probability is `1 − (1 − fortressChance) × (1 − rulerChance)`, not the sum. A stopped advance can still cause the casualties and damage that precede that check today; it is not an invulnerable province or a guaranteed battle win. It does not stop his own advances into enemy land. His Army strength malus applies in every War. The forecast must value the same defensive effect.
- Vengeful's strength bonus applies only to his Army in a War whose declared War goal is a province carrying his nation's core claim and was enemy-owned at declaration. This covers a reconquest he starts, not every War against a former owner or every ally's unrelated War. Use the existing province `core` field at declaration, rather than creating another historical-claims system. Keep the qualification on the War record; it cannot turn off merely because the goal has been occupied or transferred. Show the bonus in the reconquest forecast and use it in combat. Peace still transfers only reachable land (Rule 7).
- Strict multiplies only the Army's resistance to Uprisings, not strength against other nations. Fortresses retain their existing help against Uprisings. His exit shock affects currently owned provinces whose peoples are unaccepted at that moment, regardless of who conquered them or when. “Foreign” always means unaccepted, not simply conquered.
- Nationalist slows the integration rate of currently foreign provinces. Tolerant speeds the rate of all his incompletely Integrated provinces, multiplying whichever accepted/foreign base rate currently applies. Accepting a people therefore retains his main bonus rather than switching it off. +200% faster means rate ×3; 60% slower means rate ×0.4. No effect changes a fully Integrated province's rate into a new reward.

### Unrest, Reforms and temperaments

- **Unrest ±N during his reign** is a modifier to the existing seasonal Unrest target, not a coronation shock and not N points added or removed every season. Continue the existing gradual movement toward that target and noise; clamp actual Unrest to 0–100. The card tooltip says “changes the level Unrest tends toward”; it must not promise immediate relief. Once the ruler leaves, ordinary targets return and Unrest adjusts gradually. Show the active ruler contribution in the province explanation.
- **Unrest −N at coronation** is one immediate subtraction in every owned province, clamped at zero, with no permanent target change. Reformer therefore has a recurring improvement to Reforms and a separate one-time amnesty. Their timing makes them different effects even though both touch Unrest.
- **Reforms remove X% more** multiplies their existing Unrest reduction, not reform frequency, duration or all future Unrest. Reformer keeps the ordinary reform waiting period. Preserve the rational forecast: it must use the actual reduction, affordability and cost of the ruler's version.
- Compute ordinary believed chance of winning a War from the existing Judgment temperament first. Bold then adds the listed percentage points. Drunk instead adds a season's random offset from `−N` to `+N` percentage points to that ordinary believed chance; draw one offset per season and reuse it across his decisions that season. Sharp reduces the gap between ordinary believed and true chance by the listed share; at Legendary the gap is zero. Clamp final believed chance to 0–100%; Legendary Sharp must still equal the true chance exactly, including near either extreme. True chance is never altered by a Judgment effect. Both War forecasting and ultimatum responses use the same interpretation. Thus “25 percentage points” really moves 50% to 75%; it does not multiply the old `ruler.bias` value by 1.25.
- Planner adds the stated years to the ordinary Patience horizon; Sharp subtracts them, with the existing minimum of 8 years. The upper end may exceed the ordinary temperament range, as the current Dynast already does. Show the resulting years on the card, including any minimum that makes a penalty smaller than its nominal amount.
- The existing Patience, Judgment and Thrift remain. Do not add another risk temperament, hidden desired Army size, conquest appetite, or arbitrary decision score. Do not attach extra fixed temperaments to these traits: that would be an unlisted fourth effect. Any trait change to a temperament is already one of its listed effects.

## Why each additional bonus belongs to the character

- Warmonger, Soldier, Bold and Vengeful bring volunteers or personal followers. Those are ordinary Army after coronation, with ordinary costs and losses.
- Cautious, Paranoid and Strict bring prepared defences. Fortress placement is visible and finite.
- Builder brings completed works; Planner brings investment already arranged for the future; Big Spender brings an opening industrial project; Sailor brings coastal industry.
- Stingy brings personal savings; Sharp brings money saved through careful deals; Tyrant brings a one-time collection; Religious brings a donation; Flirt brings marriage money; Drunk brings a collection from his wealthy drinking companions. These are narrative explanations of the same transparent Gold grant, not new funding systems or extra political effects.
- Reformer begins with an amnesty. Tolerant grants named peoples lasting equal treatment.

## Scope and the existing special rulers

This draft keeps 20 trait families as a reviewable starting count; it does not claim that the engine has only 20 possible personalities. Additional one-time gains/losses, recruitment, casualties, reform cost/effectiveness and permanent acceptance are all available design material. The count can grow after these families have been reviewed.

The matrix deliberately redesigns several old families: Warmonger now changes real recruitment costs rather than hidden land values; Vengeful gains a concrete reconquest benefit; Flirt loses the hidden relations bonus; Tolerant keeps permanent acceptance as its additional effect; Nationalist changes Taxes and foreign integration rather than removing rights at every coronation; Religious is not an absolute pacifist. Strict retains suppression and an end-of-reign shock; Big Spender retains prosperity and a bill. Old labels alone must not imply omitted mechanics.

The prior blanket “cut everything that cannot be said in two stats” decision is withdrawn. Three effect lines can describe concrete special mechanics, including delayed great works, named alliances, conversion, wider peace terms or restricted War entry. They are not forbidden by this format, but they are not silently bundled into any row above.

- Usurper and Incompetent remain outside ordinary heir cards for now, as in the built game. Their existing effects must be audited separately if the three-effect ceiling is extended to every exceptional ruler.
- Mad, Child King, Admirer, Arbiter, Genius and the separate legendary conquerors are not additional rows in this 20-family draft. Their final placement is open. Do not remove their live mechanics while implementing another part of this proposal without a decision on each.
- Landmarks, the Genius's regency, the Liberator's special coup, the legendary levy with fewer lost workers and ignored truces, one-enemy Wars, keep-all-reachable-land and the Prophet's temporary acceptance are not provided by an epithet. “The Conqueror”, “the Liberator” and “the Saint” in this matrix do exactly their listed effects. A crown title must never secretly import the older ruler's effect package.
- Landmarks can survive as a trait's one-time additional effect after a stated delay, if that trait's row is changed to say so. This draft uses immediate grants; it neither deletes landmarks nor assigns an unlisted future landmark to Builder.
- No visible trust stat is proposed. Relations and infamy stay hidden plumbing. Concrete alliances or guarantees remain possible future effects, but cannot be worded as a numerical trust bonus under Rule 4.

## Content and implementation boundary

Only this spec and CLAUDE.md's future-work pointer change now. No live ruler names, odds, numbers, engine code, icons or generated HTML change in this task.

When implementation is approved:

- Put every label, title, character line, effect amount and grade progression in `content/`. Keep existing `rulers.json`, `effects.json`, `rarities.json`, `concepts.json` and `rulebook.json` responsibilities. An additional content table may hold reusable effect definitions and amount profiles; do not assume every effect has the same mathematical curve.
- Resolve each card from its trait's three effect slots plus grade. Profiles such as `small/medium/big`, flat `none/small/medium`, and malus `big/medium/small` hold numbers once. The grade maps to profile entries as shown above. Different effects may have different profiles; quantities such as one accepted people never become fractional through a universal multiplier.
- Render card wording from those numbers using placeholders and `src/text.js`; no hand-typed tuning numbers in runtime descriptions or engine code. The 100-cell documentation table should be generated from content after implementation so tuning cannot leave a stale second copy.
- Each effect needs a type, amount, timing and scope/target rule. The main bonus and malus are not required to be continuous; a one-time payment or a Civil war probability is equally valid. An effect must not hide multiple independent benefits behind one name.
- Add genuinely new visible concepts and drawings through the existing concept registry. Army strength, Army battle losses and a defensive stop chance must be named distinctly; do not reuse an unrelated icon merely to avoid registry work. Gold grants and Gold a year remain distinct concepts. Use existing Army, Gold, Factories, Fortress and Unrest icons when those are what the line actually changes.
- Make forecasts and execution read the same effect values and conditions. Update affordability, workforce, military losses, integration and Unrest forecasts where relevant, not just `act` or the displayed card. Never force the ministers to take a negative-value decision to imitate the trait's flavour.
- Keep a per-ruler record of once-only grants and payments, their actual targets and amounts, so saves, reloads, crown transitions and headless play cannot repeat them. Preserve deterministic RNG and avoid consuming random numbers just to inspect a card.
- Extend the build checks to validate effect references, grades, effect counts, timing, target rules, five titles per trait, absence of blank Common bonuses, identical-card collisions and all runtime content references. Compare upgrades under a fixed state; eligibility and saturation must be explicit rather than covered by a false universal arithmetic check.
- Cards show stable trait, grade, title, one character line, then two or three effect lines. Never hide the malus or the third line in hover text. Show named one-time destinations and resolved quantities before the player picks. The Almanac shows each family across all five grades from the same content.

## Changes to settled rules

The user agreed this replacement structure; it deliberately supersedes two parts of the earlier design when implemented:

- “The rarer the ruler, the bigger his upside and the bigger the visible price” becomes **rarer rulers have a better balance of benefit and cost**. Legendary retains a small malus. Stronger grades of the same trait are intended upgrades, not equally balanced alternatives. The rare pull remains the thrill.
- “One line of effect” becomes **two effect lines for Common/Uncommon and three for Rare/Epic/Legendary**, beside the character line. One ruler still has only one trait.

All other settled rules stand, including same rules for everyone, rational forecasts in Gold, hidden relations, visible map/budget consequences, no managing between successions, reachable conquest and the 1918 ending. Do not rewrite the built-pool sections of CLAUDE.md as though this proposal were already live.

## Validation when implemented

This documentation-only change needs no simulation sweep. No balance result is claimed.

For implementation, first separate any pure refactor from balance changes and prove the refactor with matching full chronicles and final states. Then run the required 40-world before/after sweep (`npm run sweep -- 1 41`) and read at least one full chronicle. Compare Wars, Uprisings, Ukraine alive in 1918, richest great power, unions proclaimed and still held, Survive nations alive, and the 1918 Autumn ending. Also track trait/grade draws, eligibility rejections, starting grants, bills, Civil wars, reign lengths and the persistence of permanent grants. Keep player/AI parity and reroll side effects in the checks. Assess small and large nations separately; a flat Army or factory is not equally valuable to both.

## Decisions still open

1. Review this complete set of 20 families and the plain-language names. The structure is agreed; these individual choices are a draft.
2. Tune the concrete amounts after implementation is authorised and measured, especially Army/factory grants in small nations and the common one-time Gold bills.
3. Decide the placement of the existing special rulers and landmarks before replacing the live pool. This is unresolved scope, not permission to delete them by default.
4. Review whether some additional bonuses should arrive after a delay or at the reign's end. The present matrix specifies immediate coronation grants throughout.
5. Keep the existing grade odds initially; review them once mixed-blessing Commons can be measured. Do not change odds just because the previous draft made Commons all flaw.
