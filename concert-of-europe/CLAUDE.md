# Working on Concert of Europe

Read README.md first for what this is and why. This file holds the design rules that were settled deliberately; do not undo them without asking.

## Rule 0: commit and push every time

When a change is done, commit it and push it to `master` without asking for confirmation, every time. Commit everything in the working tree, including changes another chat left behind. The only exception is when the user explicitly says not to commit or not to push.

## Design rules

1. **One goal for every nation.** The score is income per year (taxes + factory output + sea trade). Whoever has the most in autumn 1918 wins. Everything else (provinces, factories, soldiers, alliances) is a means to income.
2. **Every decision is a forecast in gold.** In `considerations(c)` each option gets `ev` = extra or protected income over the ruler's horizon (8–30 years) minus its cost. The country does every option with positive `ev`, best first, up to 4 a season. Do not reintroduce hand-tuned "urge" scores.
3. **Same rules for everyone.** No per-country stat bonuses. Countries differ only by starting data, ruler tendencies, a few historical special rules (unifiers, serfdom, accepted cultures, programmes) and luck.
4. **Visible or hidden, never in between.** Any stat shown to the player must visibly change something on the map or in the budget. Infamy and relations maths are hidden plumbing. Prestige, colonies and great-power status were removed on purpose.
5. **Rational core, chaotic inputs.** The forecasting AI stays rational. Variety comes from what it is fed: misjudgment (`ruler.bias`), quirks (`TRAITS`), crises, ultimatums, military eras, awakenings, coups. Add chaos as new inputs, not as irrational decisions.
6. **Counterweights over caps.** Growth must cost something visible: integration time for conquests, administration cost for big states, soldiers taken from the workforce, trade lost in war, great powers ganging up on the leader. Prefer these to hard limits.
7. **Reachable conquest only.** Peace deals transfer land only to a winner bordering it by land or a sea crossing; distant allies get gold. Occupation is credited to the ally actually adjacent.
8. **The game ends in autumn 1918.** The Great War starts summer 1914; any war still running at the armistice is settled on the current lines.

## Player rules

**The line of kings.** The player's only decision is who rules next. Whenever the throne passes, the player picks one of three heirs; the ministers (the same AI as everyone else) then run the state the way that ruler sees the world, until he is gone. There are no other card types: no ministers, generals, favourites or councils beside the ruler.

- **One mandatory choice from three, at each succession.** The game pauses until the player picks. Aim for 6–10 successions a game (see "How a reign ends").
- **No managing between turns.** No policies, sliders or standing orders, and a choice can never be revisited or changed later.
- **Distinct and readable at once.** Three heirs should feel like three different characters (the lecher, the drunk, the butcher), never shades of one policy. One line of character plus one line of effect.
- **What you see is what you get.** Every heir is shown face up; no hidden or sealed heirs.
- **No suggested pick.** Don't mark what the ministers would choose.
- **Rerolls.** The player may deal a heir card again three times a game, the opening card included (`rerollHeirs`). The fourth reroll is meant to be sold for $1.99; there is no payment yet, so its button only says "Coming soon". Player only: AI nations pick at random, so they have nothing to reroll for. Rerolls only change which cards are shown, so watch-mode sweeps are unaffected.
- **A deck with rarities.** Most heirs are flavour; a few are strong; a very few can swallow Europe. No stacking, levelling or evolutions: the thrill is the pull, not progression. The rarer the ruler, the bigger his upside and the bigger the visible price (usually paid when he dies).
- **AI countries draw from the same pool by the same odds, and pick at random.** No forecast for heirs: a random pick gives more variety than an AI that always takes the best ruler, and the rules stay the same for everyone (rule 3). (`drawQuirk` gives one heir the odds of a random pick from a card.)
- **Every ruler has a quirk.** No blank rulers: patience and nerve still vary per heir, but the quirk is what the card is about. The only rulers without one are councils (Switzerland's, and the regency after a Genius).
- **Every ruler visibly changes something** on the map or in the budget (rule 4), and the chronicle should echo him later ("the Butcher's war", "the Miser's hoard").

### How a reign ends

Reigns last 8–24 years if nothing ends them sooner. A reign also ends by (`endReign` in `sim.js`):

- **Abdication after a lost war.** Half the time, when the beaten side's leader lost land or started the war.
- **Revolution.** An uprising of the ruler's own people topples him.
- **Assassination.** 1% a year, three times that for the Chauvinist, Iron King, Conqueror, Liberator and Usurper.
- **Coup.** The army installs a Usurper. This is the one succession with no card: the army doesn't ask.

This gives the choice stakes: pick the Conqueror, and if he loses his war he loses his throne. Measured: a surviving great power sees about 6 cards a game counting the opening one; small nations that die early see fewer.

### The ruler pool (built)

Each ruler changes what the forecast values, how it sees the odds, how far ahead it plans, or how the reign begins and ends. Never an irrational decision (rule 5). Every heir in Europe is rolled the same way (`TIER_ODDS` in `sim.js`): first his rarity, then a ruler of that rarity. The card shows the rarity's colour and name, and the emblem badge is ringed in it (`TIER` in `registry.js`); epic and legendary cards glow gently, the legendary one with a slow sheen.

**Common (white, 46%).** Flavour, mostly sideways or a mixed blessing.
- **Drunkard.** His misjudgment is re-rolled every season.
- **Lecher.** Charms every neighbour; at his death a bastard claims the throne (a succession crisis).
- **Spendthrift.** Wastes 15% of all gold on the court, and is lavish with the rest.
- **Paranoid.** The original.
- **Cautious.** Loses ground less often in war, and gains it less often.
- **Mad.** Takes a new common or uncommon quirk every few years.
- **Child King.** A regent with a random quirk rules until he comes of age; then he takes his own, which can be anything up to rare or, 15% of the time, Incompetent.
- **Miser.** Values gold three times over (the top of Thrift), so the hoard grows and little gets built.
- Never on a card: **Usurper** (only from a coup; unrest everywhere until he wins a war) and **Incompetent** (only a Child King grows up into one).

**Uncommon (green, 30%).** A clear lean.
- **Builder, Reformer, Revanchist, Warmonger.** The originals.
- **Bold.** Plans 8 years ahead and thinks he will win every war (overconfident).
- **Admirer.** Close to one great power's court; joins every war it fights.
- **Chauvinist.** His own people's provinces pay 10% more; drops an accepted culture, whose provinces turn restless.
- **Arbiter.** Values alliances double; is paid to broker peace between his neighbours.

**Rare (blue, 15%).** Good rulers.
- **Dynast.** Plans 40 years ahead and borrows to build factories.
- **Shrewd.** Sees his odds in war exactly as they are.
- **Soldier King.** His armies fight 25% harder but lose half again as many men.
- **Tolerant.** Accepts one more people, for good.

**Epic (purple, 8%).** A big upside paid for with a big downside.
- **Conqueror.** Armies fight 40% harder; every neighbour distrusts him; his death brings a succession crisis.
- **Genius.** Factories cost half and go up twice as fast; no heir, so a regency council follows.
- **Great Builder.** Five years in, raises a landmark that stays on the map: the Great Railway (two factories in the capital), the Fortress Line (a fortress in every border province) or the Grand Exhibition (a factory in each of the three richest provinces). Lavish, and leaves no gold when he dies.
- **Liberator.** Frees the serfs and accepts every culture at once, for good; the nobles plot a coup (2% a season).
- **Saint.** No unrest while he lives; starts no wars, sends no ultimatums and joins no ally's war. He still defends himself.
- **Iron King.** Crushes uprisings (triple garrison) and integrates conquests twice as fast; subject peoples rise when he dies.
- **Navigator.** Sea trade pays half again and invading across the sea is easy, but the fleet doubles army upkeep.

**Legendary (gold, 1%).** The jackpot: can swallow Europe while he lives, and his empire pays for it when he dies (a succession crisis every time). About one heir in a hundred, so roughly one player game in six offers one, and most watch-mode games crown one somewhere.
- **Iron Chancellor (the Unifier).** Armies fight twice as hard; he fights one enemy at a time (no one comes to its aid, no great power intervenes); every victory keeps all the occupied land he can reach. When he dies, every province won in his reign rises (+40 unrest, integration back to 30%).
- **Man of Destiny (the Lion).** Armies fight three times as hard and keep all the land they win; believes in his star (overconfident). Same collapse at his death.
- **Prophet.** Armies fight two and a half times as hard; every people he conquers counts as his own at once. When he dies, they are foreigners again.
- **Sun King (the Radiant).** The nation earns 60% more while he lives; when he dies, three years of gold a year turn into debt.
- All three conquerors raise a great army when crowned (at least 8k men per million people, or half again what he inherits), take half as many workers into it, and ignore old truces. Without the levy, a legendary ruler of a poor nation never dared a war.

Measured (12 worlds, and forced into Sardinia, Bavaria and Spain): about half of legendary conquerors go on a run, typically 1 → 10–16 provinces, and most empires crumble within a decade of their death. One legendary Spain won its world. Small one-province nations often fizzle or are swallowed first; that's the gamble.

Rule 7 still holds for legendary conquerors: they keep only land they can reach.

## Interface rules

- **The registry (`src/ui/registry.js`) is the single source for every concept the player sees**: one name, one line of description, one drawing, and the words to `avoid`. The map, panel, map key and tooltips all draw from it (`ic`, `glyph`, `nm`). Concepts with no icon (like Nation) live in `WORDS`. Add new concepts there, never ad hoc.
- One icon means one thing. Two different concepts never share an icon, and a label beside an icon uses the icon's own name.
- **Icons in copy.** When a sentence names a registry concept (Gold, Factories, Fortress, Unrest, Army…), its icon goes in front of the word, on its first mention in that text. Don't place them by hand: run the text through `iconize` (`registry.js`), which reads the word list `WORD_IC`; add new words there. Hover text (`data-desc`) stays plain, because it can't hold icons. Done so far for the heir cards and the start screen; the chronicle and older copy don't follow it yet.
- `npm run build` runs `tools/check.js` first and fails on an unknown icon, a shape drawn outside the registry, or an avoided word in visible text (UI strings, the HTML template and chronicle lines in `sim.js`). Fix the text, or change the registry on purpose; never weaken the check to get a build through.
- Settled words: Gold (money held), Gold a year (the score), Army, Fortress, Uprising, Integrated, Nation, Ruler.
- Plain, short labels. If a label needs explaining, rename it (for example "Gold a year", not "Yields").
- The map stays mostly clean: ruler quirks belong in the panel, not on country labels.
- Clicking the sea or pressing Escape clears the selection.

## Ruler temperament (settled)

Besides his quirk, every ruler has three temperaments, shown as tags in the panel. Each is an input to the same rational forecast (rule 5), and each acts on a different part of it:

- **Patience** (`ruler.pat`): far-sighted / steady / short-sighted. The horizon of every forecast, 8 to 30 years.
- **Judgment** (`ruler.bias`): overconfident / clear-eyed / underconfident. Skews the odds he believes in war (`warEval`) and whether he backs down to an ultimatum. Seen in the forecast line "believes X% (truly Y%)" and the chronicle's "his generals privately think N%". It leans the way his nation does (`lean.hawk`, from `data.js` `p[0]`).
- **Thrift** (`ruler.thrift`, read through `thriftOf`): thrifty / balanced / lavish. Multiplies `goldValue`, so it touches every cost in every forecast, from about a third (lavish) to three times (the Miser). Measured over 6 worlds: lavish rulers hold about 5 years of gold a year and spend about 4 times as much on building as thrifty ones, which hold about 10 years.

Risk (`ruler.risk`, `lossW`) was removed on purpose: it was a second copy of Judgment that no player could tell apart. In its place the loss term of `warEval` carries a fixed weight of 1.25 (a beaten ruler may lose his throne), and the neighbour-threat formulas use the old average. Don't bring back a second war temperament; a new one must act on something other than war.

Quirks that fix a temperament do it through `temper` in `TRAITS`, also for a regent's or a madman's mood: Bold (patience 0.02, overconfident), Dynast (patience 0.95, a little underconfident), Shrewd and the Iron Chancellor (judgment exactly right), Man of Destiny and Prophet (overconfident), Miser (thrift ×3), Spendthrift and Great Builder (lavish).

The heir cards don't show temperaments yet; only the panel does, once he reigns. Undecided.

## Future work (agreed, not built)

### A goal for every nation

Each nation gets one goal for the armistice of autumn 1918, instead of everyone racing for the most Gold a year. Great powers keep today's goal; secondary powers either build their national dream or survive. The nation's AI acts on its goal, but the core logic stays the same: one forecast in gold, the same rules for everyone. When this is built, rule 1 changes from "most income wins" to "meet your goal".

The three goals:

- **Richest.** Most Gold a year in autumn 1918, ranked against the other great powers.
- **Dream.** Proclaim the national dream (`DREAMS`) and still hold it at the armistice.
- **Survive.** Still exist at the armistice.

Every nation that can exist. There are 24 at the start (the README says 25; `COUNTRIES` has 24) and 16 more can break away (`TEMPLATES`):

| Nation | At start | Great power in 1836 | Dream it qualifies for | Proposed goal |
|---|---|---|---|---|
| Great Britain | yes | yes | none | Richest |
| France | yes | yes | none | Richest |
| Russia | yes | yes | none | Richest |
| Ottoman Empire | yes | yes | none | Richest |
| Prussia | yes | yes | German Empire (leader) | Richest or Dream: decide |
| Austria | yes | yes | German Empire (leader) | Richest or Dream: decide |
| Bavaria | yes | | German Empire (leader) | Dream |
| Hanover | yes | | none (German, but not a leader) | Survive |
| Hesse | yes | | none (German, but not a leader) | Survive |
| Saxony | yes | | none (German, but not a leader) | Survive |
| Württemberg | yes | | none (German, but not a leader) | Survive |
| Sardinia | yes | | Kingdom of Italy | Dream |
| Two Sicilies | yes | | Kingdom of Italy | Dream |
| Tuscany | yes | | Kingdom of Italy | Dream |
| Papal States | yes | | Kingdom of Italy (Italian culture) | Survive? A pope unifying Italy is odd: decide |
| Spain | yes | | Iberian Union (from 1860) | Dream |
| Portugal | yes | | Iberian Union | Dream or Survive: decide |
| Sweden | yes | | United Scandinavia | Dream |
| Denmark | yes | | United Scandinavia | Dream |
| Greece | yes | | Greater Greece | Dream |
| Serbia | yes | | Yugoslavia (from 1850) | Dream |
| Switzerland | yes | | none | Survive |
| Belgium | yes | | none | Survive |
| Netherlands | yes | | none | Survive |
| Poland | breakaway | | Polish Commonwealth | Dream |
| Lithuania | breakaway | | Polish Commonwealth | Dream |
| Ukraine | breakaway | | Greater Ukraine | Dream |
| Romania | breakaway | | Greater Romania | Dream |
| Bulgaria | breakaway | | Greater Bulgaria | Dream |
| Croatia | breakaway | | Yugoslavia | Dream |
| Bosnia | breakaway | | Yugoslavia | Dream |
| Norway | breakaway | | United Scandinavia | Dream |
| Italian Republic | breakaway | | Kingdom of Italy | Dream |
| Hungary | breakaway | | none (its `programme` points at Transylvania and Croatia) | Survive, or add a Greater Hungary dream |
| Bohemia | breakaway | | none | Survive |
| Ireland | breakaway | | none | Survive |
| Finland | breakaway | | none (Finland is in the Scandinavian dream, but Finns are not a Scandinavian culture) | Survive |
| Baltic Republic | breakaway | | none | Survive |
| Albania | breakaway | | none | Survive |
| Scotland | breakaway | | none | Survive |

Restored states (Greece, Serbia, Belgium, Denmark, Netherlands, Portugal, or any start nation reborn from its own provinces) keep their row's goal.

Still to decide:

- **How the AI acts on its goal while staying a forecast in gold** (rule 2). For example, provinces in its dream are valued at a multiple of their income, and a Survive nation counts losing its last province as losing everything. No hand-tuned urges.
- **Prussia and Austria** qualify both as great powers and as leaders of the German dream.
- **Whether a goal is fixed at birth** (in 1836, or at independence) or changes. Great powers are recomputed every 5 years (`computeMajors`). A nation that proclaims its dream may become a great power; does its goal switch to Richest?
- **Shared dreams.** Only one nation can win each: Italy has five candidates; Germany, Scandinavia and Yugoslavia have three; the Polish Commonwealth and Iberia have two.
- **Overlapping provinces.** Bessarabia (Ukraine, Romania), Galicia (Ukraine, Poland), Macedonia and Thessaly (Greece, Bulgaria).
- **Poland and Ukraine have no state in 1836,** so they can't be played from the start.
- **The end screen.** It has to compare goals that differ: who met theirs, with Gold a year to break ties.
- **Measure first.** Before committing, sweep how often each dream is proclaimed today, and how often it is still held in 1918. A dream that never happens is just a slower loss.

### Metaprogression

The "no stacking, levelling or evolutions" rule stays within a game. Across games:

- **Yes: nations to play.** New nations unlock as you play, for example by proclaiming a dream.
- **Yes: new rulers in the deck.** AI nations draw from the same pool, so an unlock changes the world for everyone (rule 3 still holds). Sweeps should run with a fixed pool so they stay comparable.
- **No:** start dates other than 1836, a ruler book, or permanent stat bonuses.

### Crisis cards

A second kind of decision besides heirs. When history turns for the player's nation, the game pauses and the player picks one of two or three options, face up and irreversible, with no suggested pick. The ruler shapes which options appear (a Saint gets no war option, a Conqueror at the peace table may only see "take everything"). AI nations keep deciding these moments by forecast, so watch mode is unchanged. Aim for about 10–15 crises a game beside about 6 successions. When this is built, the player rule "There are no other card types" changes.

Moments that already exist in the code:

- **Ultimatum received** (`oFears`). Back down, fight, or give up a province.
- **Peace table after a win** (`endWar`). Take the land (restless, slow to integrate), take the gold, or leave him as an ally. Rule 7 still limits what land can be offered. The strongest first candidate.
- **Uprising in your provinces** (`revolts`). Crush it at a cost in men, grant autonomy, or let it go.
- **Summer 1914** (the Great War block). Join your allies, stay out, or switch sides.
- **Dream within reach** (`unification`). Proclaim now or wait for a better border.
- **Royal marriage** (the marriage event). Choose the court; the next heirs carry a claim there.

## Workflow

- Edit `src/` or `map/`, then `npm run build`. Never hand-edit the root `index.html`; it is generated.
- After any simulation change run `npm run sweep -- 1 13` and compare: wars, revolts, Ukraine survival, spread of winners, end year (always 1918 Autumn). Read at least one `npm run chronicle` for oddities; the chronicle is the best bug detector.
- After any map change run `npm run map` and read the audit table it prints (coastal flags, land neighbours, sea crossings) before trusting it. Coastlines and adjacency come from the shapes; do not hand-type geography from memory.
- Sweeps are deterministic per seed, so before/after comparisons are fair.
- Report test results precisely: say whether a number counts an event happening or surviving to the end.

## Map of the code (src/sim.js)

- `createSim(seed, geo)` builds state `S`; `S.step()` advances one season.
- Economy: `regionIncome`, `income`, `score`, `workforce`, `admin`.
- AI: `considerations`, `act`, `decide`; military forecasts `warEval`, `riskOf`, `interveners`.
- War: `declareWar`, `frontMove`, `warScore`, `endWar`, `tickWars`.
- Provinces: `tickProvinces` (construction, integration), `tickUnrest`, `revolts`.
- Rulers and chaos: `newRuler`, `TRAITS`, `successions`, `EVENTS`.
- Dreams: `DREAMS`, `dreamsOf`, `unification`.
- Player: `createSim(seed, geo, { player })`; `heirCard` builds a choice of three heirs and parks it in `S.pending` (which halts `step()`), `chooseHeir(i)` resolves it. Every reign ends through `endReign`; AI countries get a random heir from `drawQuirk`. `tickRulers` runs what changes during a reign (the Drunk, the Mad, the Child King growing up, the Great Builder's landmark, the Arbiter's peace deals). `tools/load.js` passes `{ player }` through for headless tests.
- End: the armistice block at the end of `step()`.
