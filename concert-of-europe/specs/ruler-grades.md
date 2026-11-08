# Ruler grades (proposed, not agreed)

Status: a proposal for the user to approve. It reshapes the built ruler pool described in CLAUDE.md ("The ruler pool"), so nothing here is built until it is agreed. Once it is built, this file is deleted and CLAUDE.md describes the result; `content/` and the Almanac stay the truth (Rule 1).

## The idea

Today a ruler's rarity says *which character* he is: the Conqueror is always epic, the Drunkard always common. This splits the two:

- **His line** is what he wants: Warmonger, Builder, Spendthrift… (one entry in `content/rulers.json`).
- **His grade** is how able he is at it: Common to Legendary, the rarities that already exist (`content/rarities.json`, the concept `rarity`).

A common Warmonger wants war. A rare one wants war and fights harder for it. A legendary one is a Man of Destiny. The pull gets a second dimension ("I got a *legendary* Warmonger"), the deck gets wider without more hand-made rulers, and today's named rulers survive as the top rungs of their lines.

## What does not change

Everything in CLAUDE.md "Player rules" still holds. The parts this touches:

- One choice from three at each succession, face up, no suggested pick, three rerolls.
- **Three different characters.** A hand never holds two rungs of one line. A common and a legendary Warmonger side by side would be two shades of one policy.
- **No levelling.** A ruler's grade is fixed when he is drawn and never changes in his reign. The Child King is a new draw when he comes of age, not a promotion.
- **The rarer, the bigger the price.** A higher grade scales the price as well as the upside (see "How a grade scales"). A grade that only adds strength would make every card a solved choice: always take the rarest.
- **Same odds for everyone** (rule 3). AI nations draw from the same deck by the same odds and pick at random.
- **Rational core** (rule 5). A grade changes the inputs to the forecast (army strength, factory cost, what land is worth). It never changes how the forecast decides.

## Content

All of it lives in `content/` (Rule 1). No grade number is typed into the engine or into text.

### rulers.json: lines and rungs

Each entry becomes a **line**. `tier` is replaced by `grades`, the list of grades the line can be drawn at. Gaps are allowed: Spendthrift is common, or legendary as the Sun King, and nothing in between.

The line's own `label`, `epi`, `vibe`, `desc`, `fx` and `temper` describe it at its **lowest** grade. Every higher grade is a **rung** that comes in one of two kinds:

- **Scaled** (the default). The same character, with his `fx` scaled by the grade (see below). The card shows the line's own label in the grade's colour. His `desc` template fills in the scaled numbers, so "his armies fight {fx.fight|harder}" reads true at every grade without any new text.
- **Titled**: an entry in `titles`, keyed by grade, that gives the rung its own `label`, `epi`, `vibe`, `desc` and emblem, and adds or overrides `fx` and `temper`. Today's epic and legendary rulers become titled rungs.

Shape (the values shown are today's, copied here only to show the format; they move, they are not duplicated):

```json
"warmonger": {
  "grades": [2, 3, 4, 5],
  "label": "Warmonger", "epi": "the Warlike", "vibe": "…", "desc": "…",
  "fx": {"land": 1.5, "distrust": 0.5},
  "price": [],
  "titles": {
    "3": "soldier",
    "4": "conqueror",
    "5": "destiny"
  }
}
```

A title points at an entry under a new top-level `rungs` object in `rulers.json`, keyed by today's ids (`soldier`, `conqueror`, `destiny`…). Today's ids stay the ids of the drawings (`EMB` in `src/ui/registry.js`), the regnal stats and the chronicle, so nothing that names them needs renaming. A titled rung inherits the line's `fx` (scaled to its grade) and adds its own on top.

`price` lists the line's `fx` keys that are a cost to him (the Soldier King's `bleed`, the Spendthrift's `waste`). Every other numeric key is upside.

`card: false` (Usurper, Incompetent) stays as it is: those are lines with `grades: [1]` that are never dealt.

### rarities.json: what a grade does

Each rarity gains two numbers:

- `edge`: how strongly upside keys scale at this grade.
- `price`: how strongly price keys scale at this grade.

A scaled rung at grade `g` of a line whose lowest grade is `g0` uses the ratio `edge[g] / edge[g0]` (or `price[g] / price[g0]`). The first values are chosen so that every ruler that exists today keeps today's numbers at today's tier. Tuning starts from there.

The odds stay where they are: one roll for the grade, then a line that has that grade.

### effects.json: how each effect scales

Each effect key gains a `scales` kind, so the scaling rule is written once per effect instead of once per ruler:

- `mult`: a multiplier; the grade scales its distance from 1 (fight 1.25 → 1.5, factory cost 0.7 → 0.4). Clamped so a cost multiplier never reaches 0.
- `amount`: a count or a sum; the grade scales it directly (charm, calm, broker fee).
- `chance`: a probability; scaled like `amount`, clamped below 1.
- `fixed`: never scales (flags such as `levy`, `keepsAll`, `crisis`; timings such as `ofAge`, `changeEvery`, `works`).

Every key a rung reads has a `scales` kind; the build checks it.

### rulebook.json and concepts.json

- `concepts.json` `rarity`: the description changes from "how rare" to "how able he is at what he wants". The name stays Rarity: it is the word on the card, and the player already knows it. No new concept, no new icon (Interface rules: one icon, one thing).
- `rulebook.json`: one sentence on grades and one on how a grade scales the price. The numbers come from `rarities.json` through placeholders.

## The lines

Today's 31 dealt rulers fold into the lines below. This table is the proposal to agree on; once built, `rulers.json` is the truth and this table is deleted.

| Line | Grades | Titled rungs |
|---|---|---|
| Warmonger | uncommon–legendary | rare **Soldier King**, epic **Conqueror**, legendary **Man of Destiny** |
| Shrewd | rare, legendary | legendary **Iron Chancellor** |
| Tolerant | rare–legendary | legendary **Prophet** |
| Spendthrift | common, legendary | legendary **Sun King** |
| Builder | uncommon–legendary | epic **Great Builder**, legendary **Genius** |
| Reformer | uncommon–epic | epic **Liberator** |
| Paranoid | common–epic | epic **Iron King** |
| Arbiter | uncommon–epic | epic **Saint** |
| Navigator | uncommon–epic | none (scaled all the way) |
| Revanchist | uncommon–epic | none |
| Dynast | rare–epic | none |
| Cautious | common–rare | none |
| Lecher | common–uncommon | none |
| Chauvinist, Admirer, Bold | uncommon | none |
| Miser, Drunkard, Mad, Child King | common | none |

The Warmonger line is the user's own example: the common rung wants war, every rung above is better at it, and every rung above pays more for it (the Soldier King's losses, the Conqueror's distrust and civil war, the Man of Destiny's collapse).

Two results to note:

- **Genius moves to legendary.** It is the top of the Builder line; the Great Builder is its epic rung.
- **Fewer cards, wider deck.** 20 dealt lines instead of 31 rulers, but about 45 distinct cards counting rungs.

### Mad kings, regents and the Child King

- A Mad king's passing mood and a regent's are drawn as today: any line that can be common or uncommon, at grade common or uncommon. The mood's grade is drawn with the same odds, capped at uncommon.
- The Child King, coming of age, draws a line and a grade as any heir, with the grade capped at rare, and Incompetent at its existing odds.

## Engine

### Reading a ruler

- A ruler stores `trait` (his line) and `grade`. `makeRuler` resolves the rung once, when he is drawn: `rung = RUNG(trait, grade)`, built at load from the content (the line's `fx` scaled to the grade, plus the title's own). The ruler carries `rung` (the id of the titled rung, or the line's id).
- `F(t, k)` keeps working on rung ids and returns the value at that rung's grade. A new `Fr(c, k)` reads the reigning ruler's own value (`c.ruler`'s rung, or his mood's). Every `F('builder', 'factoryCost')` chain in the engine becomes one `Fr(c, 'factoryCost')`.
- **The engine stops branching on ruler names.** Today it does so about 40 times (`has(c, 'genius') ? F('genius', …) : has(c, 'builder') ? F('builder', …)`, `old.trait === 'sun'`…). Each branch becomes an effect key read with `Fr` or `hasFx`. That's what makes a Builder of any grade, or a future line, work without new code.
- Numbers the engine still types are moved into content on the way: the Spendthrift's waste share (`sim.js` types 0.15 instead of reading `fx.waste`), and any others the refactor turns up.

### Drawing a hand

`drawQuirk` becomes `drawHeir(c, not)`: roll a grade by the existing odds, pick a line that has that grade, skip any line already in the hand (`not` holds lines, not rungs), and return `{ trait, grade }`. AI successions call the same function (rule 3).

### Death and crises

What happens when a ruler dies (civil war, uprisings, debt, the regency) reads `fx` flags on his rung, as it reads `crisis` today. A rung inherits nothing from the rungs below it except the line's scaled `fx`: the Conqueror's civil war comes from his own `crisis` key, so a rare Warmonger dies quietly.

## Interface

- **The heir card** shows the rung's label (the title if there is one) and its emblem, ringed and coloured by its grade, as today. One line of character (`vibe`), one line of effect (`desc`, with that grade's numbers filled in). Nothing else is added to the card.
- **The panel** shows the same rung, and its grade in the hover text.
- **The Almanac** shows each line as a ladder: one card per grade, with the scaled numbers, titled rungs under their own names, and the chance per heir of every rung, as today's "Chance per heir".
- **The chronicle** names the rung ("the Conqueror's war"), as today.

## The build check (`tools/check.js`)

New refusals, none of which may be weakened to get a build through:

- A line's `grades` are valid rarities; every `titles` key is one of the line's grades, and every title points at an entry in `rungs`.
- Every rung at every grade fills in its `desc` and states no typed number.
- Every key in a line's `price` is one of its numeric `fx` keys.
- Every `fx` key has a `scales` kind in `effects.json`.
- Every rarity has `edge` and `price`; every number is read.
- Every titled rung has a drawing in `EMB`.
- No grade's scaling sends a `mult` cost key to 0 or below, or a `chance` key to 1 or above.

## How it gets built

Four steps. Each is committed and pushed on its own (Rule 0).

1. **Name branches become effects.** Every `has(c, 'x')` and `trait === 'x'` in `sim.js` becomes an `fx` key read with `Fr`/`hasFx`, and the typed numbers move to content. A pure refactor: full chronicles and final states must match the old code to the character (Workflow).
2. **Lines with one rung each.** Introduce `grades`, `rungs`, `edge`, `price` and `scales`, with every ruler as its own line at its own tier. The deck is unchanged, so chronicles must again match to the character.
3. **Fold the lines.** Merge them as in the table above and turn on scaled rungs. This changes the game: run `npm run sweep -- 1 41` against the old code and compare wars, uprisings, Ukraine alive, the richest great power, unions proclaimed and held, Survive nations alive, the end year, and how often a legendary ruler appears and how often he goes on a run. Read at least one `npm run chronicle`.
4. **Interface and Almanac**, then update CLAUDE.md ("The ruler pool") and delete this file.

## Open questions for the user

1. **The fold.** Is the table of lines right? The least obvious calls: the Iron Chancellor under Shrewd, the Prophet under Tolerant, the Saint under Arbiter, and the Genius moved to legendary.
2. **Flavour lines.** Do the Drunkard, Mad, Child King and Miser stay common only, or does each get a scaled rung (a "brilliant drunk")?
3. **Grade on a scaled card.** Is the colour enough ("Builder" in blue), or should a scaled rung's name carry its grade ("Builder" → "Master Builder")? Names cost content but read better.
4. **Odds.** Keep today's odds per grade, or rethink them now that a grade means ability rather than character?
