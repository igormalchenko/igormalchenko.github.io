# Ruler quirks × grades (proposed, not agreed)

Status: a proposal for the user to approve before anything is built. It replaces the ruler pool described in CLAUDE.md ("The ruler pool") and changes one settled player rule (see "Settled rules this changes"). Once built, this file is deleted, CLAUDE.md describes the result, and `content/` and the Almanac are the truth (Rule 1).

## The idea

Every ruler is a **quirk** (what he is: Drunkard, Builder, Warmonger…) at a **grade** (how well his nature serves him: the five rarities that already exist). Every quirk exists at every grade: 20 quirks × 5 grades, 100 cards.

Every quirk is **a coin with two sides**: one strength and one flaw, both drawn from the nature of the man. The grade sets the balance:

- A **common** ruler is all flaw. A common Drunkard is a sot who misreads every war. A common Builder works his people into revolt and builds nothing special.
- A **legendary** ruler has turned his flaw into his strength. A legendary Drunkard is the Beloved, the king who drinks with his people; his judgment is barely worse than anyone's.

## Card rules

- **Two stats per card, never more**: ▲ one strength, ▼ one flaw. A common card shows only its flaw (its strength is "—"). No paragraphs, no conditions, no special mechanics: each line is an icon, a number and a short label, so three cards can be compared by eye.
- **One shared list of stats** (below). Every strength and every flaw is one of them, and each is a registry concept with its own icon (Interface rules). A player who has learned 12 icons can read every card in the game.
- **No hidden wants.** Today's "values conquered land 1.5×", "sees every threat 1.8×" and the like are gone: the player can't see them (rule 4). A ruler's behaviour comes from the rational forecast reading his stats (rule 5): a Warmonger with a bigger army sees better war odds and goes to war; a Builder with cheap factories builds.
- **No two quirks share both stats.** Each quirk is a different pair, so three cards are always three different characters, and a hand never holds one quirk twice.
- Each card keeps a name and one line of character: "Ludwig II the Merry", with his quirk's `vibe`.

## The stats

Each stat has one largest strength (E) and one largest flaw (W), written once. Every number in the matrix is derived from these and the grade curve; nothing is typed per card.

| Stat | Concept (icon) | Largest strength | Largest flaw | Used by |
|---|---|---|---|---|
| Army strength | new | +100% | −30% | 4 |
| Army size | Army | +60% | −30% | 3 |
| Defence | Fortress or Battle | 60% of battles on his land change nothing | — | 2 |
| Gold a year | Gold a year | +50% | −20% | 5 |
| Factory cost | Factories | −60% | +60% | 2 |
| Sea trade | Sea trade | +100% | — | 1 |
| Unrest | Unrest | −20 | +20 | 6 |
| Neighbours' trust | new (see question 3) | +40 | −40 | 5 |
| Judgment | Judgment | reads his war odds exactly | misreads by 40% (too high, or swinging each season) | 3 |
| Patience | Patience | plans 20 years further ahead | plans 15 years less ahead | 2 |
| Integration | Integrated | conquests integrate 3× as fast | other peoples integrate at half speed | 3 |
| At his death | Civil war, Gold, Uprising | leaves 3 years of gold a year | 4 years of gold a year in debt; or certain civil war; or +40 unrest in his conquests | 4 |

## The grade curve

The share of the largest strength and the largest flaw a card gets at each grade:

| | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| ▲ Strength | none | 25% | 50% | 75% | 100% |
| ▼ Flaw | 100% | 100% | 60% | 30% | 15% |

The odds of each grade stay as they are (`content/rarities.json`).

## The matrix

All 100 cards, generated from the two tables above. Each cell: the epithet, ▲ the strength, ▼ the flaw.

| Quirk | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|
| **Warmonger**<br>Army size / Neighbours' trust | *the Brute*<br>▲ —<br>▼ −40 trust with neighbours | *the Warlike*<br>▲ +15% army<br>▼ −40 trust with neighbours | *the Marshal*<br>▲ +30% army<br>▼ −24 trust with neighbours | *the Conqueror*<br>▲ +45% army<br>▼ −12 trust with neighbours | *the Terrible*<br>▲ +60% army<br>▼ −6 trust with neighbours |
| **Soldier**<br>Army strength / Army size | *the Butcher*<br>▲ —<br>▼ −30% army | *the Soldier*<br>▲ +25% army strength<br>▼ −30% army | *the Drillmaster*<br>▲ +50% army strength<br>▼ −18% army | *the Victor*<br>▲ +75% army strength<br>▼ −9% army | *the Invincible*<br>▲ +100% army strength<br>▼ −5% army |
| **Bold**<br>Army strength / Judgment | *the Rash*<br>▲ —<br>▼ thinks his war odds 40% better than they are | *the Bold*<br>▲ +25% army strength<br>▼ thinks his war odds 40% better than they are | *the Daring*<br>▲ +50% army strength<br>▼ thinks his war odds 24% better than they are | *the Fearless*<br>▲ +75% army strength<br>▼ thinks his war odds 12% better than they are | *the Lion*<br>▲ +100% army strength<br>▼ thinks his war odds 6% better than they are |
| **Cautious**<br>Defence / Army strength | *the Timid*<br>▲ —<br>▼ −30% army strength | *the Careful*<br>▲ 15% of battles on his land change nothing<br>▼ −30% army strength | *the Steady*<br>▲ 30% of battles on his land change nothing<br>▼ −18% army strength | *the Unbreakable*<br>▲ 45% of battles on his land change nothing<br>▼ −9% army strength | *the Rock*<br>▲ 60% of battles on his land change nothing<br>▼ −5% army strength |
| **Paranoid**<br>Defence / Neighbours' trust | *the Paranoid*<br>▲ —<br>▼ −40 trust with neighbours | *the Suspicious*<br>▲ 15% of battles on his land change nothing<br>▼ −40 trust with neighbours | *the Watchful*<br>▲ 30% of battles on his land change nothing<br>▼ −24 trust with neighbours | *the Vigilant*<br>▲ 45% of battles on his land change nothing<br>▼ −12 trust with neighbours | *the Unassailable*<br>▲ 60% of battles on his land change nothing<br>▼ −6 trust with neighbours |
| **Builder**<br>Factory cost / Unrest | *the Taskmaster*<br>▲ —<br>▼ +20 unrest | *the Builder*<br>▲ factories −15% cost<br>▼ +20 unrest | *the Engineer*<br>▲ factories −30% cost<br>▼ +12 unrest | *the Architect*<br>▲ factories −45% cost<br>▼ +6 unrest | *the Great*<br>▲ factories −60% cost<br>▼ +3 unrest |
| **Miser**<br>At his death / Factory cost | *the Skinflint*<br>▲ —<br>▼ factories +60% cost | *the Thrifty*<br>▲ leaves 0.8 years of gold a year in the treasury<br>▼ factories +60% cost | *the Prudent*<br>▲ leaves 1.5 years of gold a year in the treasury<br>▼ factories +36% cost | *the Treasurer*<br>▲ leaves 2.3 years of gold a year in the treasury<br>▼ factories +18% cost | *the Golden*<br>▲ leaves 3 years of gold a year in the treasury<br>▼ factories +9% cost |
| **Spendthrift**<br>Gold a year / At his death | *the Wastrel*<br>▲ —<br>▼ at his death, 4 years of gold a year turn to debt | *the Magnificent*<br>▲ +13% gold a year<br>▼ at his death, 4 years of gold a year turn to debt | *the Splendid*<br>▲ +25% gold a year<br>▼ at his death, 2.4 years of gold a year turn to debt | *the Glorious*<br>▲ +38% gold a year<br>▼ at his death, 1.2 years of gold a year turn to debt | *the Radiant*<br>▲ +50% gold a year<br>▼ at his death, 0.6 years of gold a year turn to debt |
| **Tyrant**<br>Gold a year / Unrest | *the Cruel*<br>▲ —<br>▼ +20 unrest | *the Greedy*<br>▲ +13% gold a year<br>▼ +20 unrest | *the Stern*<br>▲ +25% gold a year<br>▼ +12 unrest | *the Mighty*<br>▲ +38% gold a year<br>▼ +6 unrest | *the Absolute*<br>▲ +50% gold a year<br>▼ +3 unrest |
| **Reformer**<br>Unrest / Gold a year | *the Meddler*<br>▲ —<br>▼ −20% gold a year | *the Liberal*<br>▲ −5 unrest<br>▼ −20% gold a year | *the Reformer*<br>▲ −10 unrest<br>▼ −12% gold a year | *the Liberator*<br>▲ −15 unrest<br>▼ −6% gold a year | *the Enlightened*<br>▲ −20 unrest<br>▼ −3% gold a year |
| **Drunkard**<br>Unrest / Judgment | *the Sot*<br>▲ —<br>▼ misjudges his war odds by up to 40%, new each season | *the Tippler*<br>▲ −5 unrest<br>▼ misjudges his war odds by up to 40%, new each season | *the Jolly*<br>▲ −10 unrest<br>▼ misjudges his war odds by up to 24%, new each season | *the Merry*<br>▲ −15 unrest<br>▼ misjudges his war odds by up to 12%, new each season | *the Beloved*<br>▲ −20 unrest<br>▼ misjudges his war odds by up to 6%, new each season |
| **Revanchist**<br>Unrest / Neighbours' trust | *the Bitter*<br>▲ —<br>▼ −40 trust with neighbours | *the Avenger*<br>▲ −5 unrest<br>▼ −40 trust with neighbours | *the Unforgiving*<br>▲ −10 unrest<br>▼ −24 trust with neighbours | *the Restorer*<br>▲ −15 unrest<br>▼ −12 trust with neighbours | *the Redeemer*<br>▲ −20 unrest<br>▼ −6 trust with neighbours |
| **Lecher**<br>Neighbours' trust / At his death | *the Lecher*<br>▲ —<br>▼ at his death, 100% chance of civil war | *the Rake*<br>▲ +10 trust with neighbours<br>▼ at his death, 100% chance of civil war | *the Gallant*<br>▲ +20 trust with neighbours<br>▼ at his death, 60% chance of civil war | *the Charming*<br>▲ +30 trust with neighbours<br>▼ at his death, 30% chance of civil war | *the Irresistible*<br>▲ +40 trust with neighbours<br>▼ at his death, 15% chance of civil war |
| **Pious**<br>Neighbours' trust / Army strength | *the Meek*<br>▲ —<br>▼ −30% army strength | *the Pious*<br>▲ +10 trust with neighbours<br>▼ −30% army strength | *the Devout*<br>▲ +20 trust with neighbours<br>▼ −18% army strength | *the Peacemaker*<br>▲ +30 trust with neighbours<br>▼ −9% army strength | *the Saint*<br>▲ +40 trust with neighbours<br>▼ −5% army strength |
| **Shrewd**<br>Judgment / Patience | *the Schemer*<br>▲ —<br>▼ plans 15 years less ahead | *the Sly*<br>▲ misjudges his war odds 25% less<br>▼ plans 15 years less ahead | *the Shrewd*<br>▲ misjudges his war odds 50% less<br>▼ plans 9 years less ahead | *the Calculating*<br>▲ misjudges his war odds 75% less<br>▼ plans 5 years less ahead | *the Unifier*<br>▲ reads his war odds exactly<br>▼ plans 2 years less ahead |
| **Dynast**<br>Patience / Gold a year | *the Dreamer*<br>▲ —<br>▼ −20% gold a year | *the Planner*<br>▲ plans 5 years further ahead<br>▼ −20% gold a year | *the Dynast*<br>▲ plans 10 years further ahead<br>▼ −12% gold a year | *the Wise*<br>▲ plans 15 years further ahead<br>▼ −6% gold a year | *the Founder*<br>▲ plans 20 years further ahead<br>▼ −3% gold a year |
| **Tolerant**<br>Integration / Unrest | *the Soft*<br>▲ —<br>▼ +20 unrest | *the Tolerant*<br>▲ conquests integrate +50% faster<br>▼ +20 unrest | *the Just*<br>▲ conquests integrate +100% faster<br>▼ +12 unrest | *the Father of Peoples*<br>▲ conquests integrate +150% faster<br>▼ +6 unrest | *the Prophet*<br>▲ conquests integrate +200% faster<br>▼ +3 unrest |
| **Chauvinist**<br>Gold a year / Integration | *the Bigot*<br>▲ —<br>▼ other peoples integrate 50% slower | *the Proud*<br>▲ +13% gold a year<br>▼ other peoples integrate 50% slower | *the Patriot*<br>▲ +25% gold a year<br>▼ other peoples integrate 30% slower | *the Zealous*<br>▲ +38% gold a year<br>▼ other peoples integrate 15% slower | *the Father of the Nation*<br>▲ +50% gold a year<br>▼ other peoples integrate 8% slower |
| **Iron**<br>Integration / At his death | *the Jailer*<br>▲ —<br>▼ at his death, +40 unrest in conquered provinces | *the Hard*<br>▲ conquests integrate +50% faster<br>▼ at his death, +40 unrest in conquered provinces | *the Iron*<br>▲ conquests integrate +100% faster<br>▼ at his death, +24 unrest in conquered provinces | *the Unyielding*<br>▲ conquests integrate +150% faster<br>▼ at his death, +12 unrest in conquered provinces | *the Hammer*<br>▲ conquests integrate +200% faster<br>▼ at his death, +6 unrest in conquered provinces |
| **Navigator**<br>Sea trade / Army size | *the Absent*<br>▲ —<br>▼ −30% army | *the Sailor*<br>▲ +25% sea trade<br>▼ −30% army | *the Navigator*<br>▲ +50% sea trade<br>▼ −18% army | *the Admiral*<br>▲ +75% sea trade<br>▼ −9% army | *the Lord of the Seas*<br>▲ +100% sea trade<br>▼ −5% army |

Mirrors worth noting: Tolerant and Chauvinist, Spendthrift and Miser, Reformer and Tyrant swap the same two stats.

## What goes

Everything a card can't say in two stats:

- **Cut as quirks:** Admirer, Arbiter (paid to broker peace), Mad (changes quirk), Child King (regent, then grows up), the Great Builder's landmarks, the Genius's regency, the Liberator's coup, the Prophet's conversions, the Iron Chancellor's one-enemy-at-a-time wars, the conquerors' levy and "keeps all the land", the Sun King's +60%.
- Most survive as **epithets**: the Conqueror, the Liberator, the Saint, the Prophet, the Unifier, the Radiant are now the epic or legendary rungs of a quirk, made of two stats.
- **Usurper and Incompetent** were never on a card. They stay as what a coup and a failed regency produce, outside the matrix.
- **Mad king and Child King** could come back later as succession events (the heir is a child; the king goes mad), not as quirks.
- Landmarks (`content/landmarks.json`) lose their only builder: cut them, or keep them as an event.

Watch mode gets plainer: these mechanisms colour the chronicle. The epithets, and the chronicle naming the ruler's strength or flaw when it decides something ("the Bold's misjudged war"), are what carry the colour now.

## Content

All of it in `content/` (Rule 1):

- `rulers.json`: each quirk is `{label, vibe, edge, flaw, epi: [five epithets]}`, with `edge` and `flaw` naming a stat (and, for Judgment and At his death, which side of it: `over`, `swing`, `debt`, `war`, `rise`, `hoard`).
- A new `stats.json`: each stat's concept, largest strength and largest flaw, and the words for each side as templates with placeholders (`"+{v|pct} army strength"`), so no number is typed into text.
- `rarities.json`: each grade gains its `edge` and `flaw` share from the curve.
- `concepts.json`: the new concepts (Army strength, and trust if it becomes visible) with drawings in `DRAW`; `rarity`'s description changes to "how well his nature serves him".
- `rulebook.json`: one sentence for the grade curve, numbers by placeholder.

The build check refuses: a quirk whose stat or side doesn't exist, two quirks with the same pair of stats, a quirk without five epithets, a grade without both shares, and any stat or curve number nothing reads.

## Engine

- A ruler stores `quirk` and `grade`. At crowning, his two stats resolve to two numbers; the engine reads them through one function (`stat(c, 'strength')` returns 1 for a ruler without that stat). The engine never branches on a quirk's name again (it does about 40 times today).
- `drawHeir` rolls a grade with today's odds, then a quirk not already in the hand. AI nations do the same and pick at random (rule 3).
- At his death, a death stat applies (debt, hoard, civil war chance, unrest in conquests); otherwise a reign ends as today (`endReign`).
- Temperaments (patience, judgment, thrift) stay as they are; a Judgment or Patience stat moves his temperament by its amount.

## How it gets built

1. **Name branches become stats.** Every `has(c, 'x')` and `trait === 'x'` in `sim.js` becomes a read of a stat or flag from content; the Spendthrift's typed 0.15 moves to content. Pure refactor: full chronicles and final states match to the character.
2. **The new pool.** `stats.json`, the curve, the 20 quirks; the cut mechanisms go. This changes the game a lot: `npm run sweep -- 1 41` against the old code, comparing wars, uprisings, Ukraine alive, the richest great power, unions proclaimed and held, Survive nations alive, the end year, and how many civil wars and debts the death stats cause. Read at least one `npm run chronicle`. Then tune E, W and the curve.
3. **Cards, panel and Almanac.** Two icon lines per card; the Almanac shows each quirk as a row of five.
4. Update CLAUDE.md, delete this file and the old sections it replaces.

## Settled rules this changes

- **"The rarer the ruler, the bigger his upside and the bigger the visible price."** Here the price shrinks as the grade rises. That's the point of the coin, but it means the rarest card will usually be the best pick. What keeps the choice alive is that flaws are situational: a Builder's unrest is cheap in a calm nation, a Navigator's small army cheap on an island, a Pious king's weak army cheap with strong allies.
- **"No blank rulers"** still holds, but a common card has only a flaw. With today's odds about half of all heirs are common, so a typical hand has one or two pure downgrades.

## Open questions

1. **Is 20 the right count, and the right 20?** Each stat is used 1–6 times; Unrest (6) is the most crowded, Sea trade (1) the least.
2. **The curve.** Should a legendary keep a sixth of its flaw, none of it, or pay it at his death (the old "price at death" rule)?
3. **Neighbours' trust** is hidden plumbing today (rule 4: relations maths stay hidden). Either show it (a visible trust stat) or reword it as something the map shows, such as how likely neighbours are to ally with him.
4. **Odds.** Keep today's (about half common), or make commons rarer now that they are all flaw?
5. **The cuts.** Is losing the special mechanisms (landmarks, Mad, Child King, the conquerors' levy) worth the readability?
