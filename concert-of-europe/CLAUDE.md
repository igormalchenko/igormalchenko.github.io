# Working on Concert of Europe

Read README.md first for what this is and why. This file holds the design rules that were settled deliberately; do not undo them without asking.

## Design rules

1. **One goal for every nation.** The score is income per year (taxes + factory output + sea trade). Whoever has the most in autumn 1918 wins. Everything else (provinces, factories, soldiers, alliances) is a means to income.
2. **Every decision is a forecast in gold.** In `considerations(c)` each option gets `ev` = extra or protected income over the ruler's horizon (8–30 years) minus its cost. The country does every option with positive `ev`, best first, up to 4 a season. Do not reintroduce hand-tuned "urge" scores.
3. **Same rules for everyone.** No per-country stat bonuses. Countries differ only by starting data, ruler tendencies, a few historical special rules (unifiers, serfdom, accepted cultures, programmes) and luck.
4. **Visible or hidden, never in between.** Any stat shown to the player must visibly change something on the map or in the budget. Infamy and relations maths are hidden plumbing. Prestige, colonies and great-power status were removed on purpose.
5. **Rational core, chaotic inputs.** The forecasting AI stays rational. Variety comes from what it is fed: misjudgment (`ruler.bias`), quirks (`TRAITS`), crises, ultimatums, military eras, awakenings, coups. Add chaos as new inputs, not as irrational decisions.
6. **Counterweights over caps.** Growth must cost something visible: integration time for conquests, administration cost for big states, soldiers taken from the workforce, trade lost in war, great powers ganging up on the leader. Prefer these to hard limits.
7. **Reachable conquest only.** Peace deals transfer land only to a winner bordering it by land or a sea crossing; distant allies get gold. Occupation is credited to the ally actually adjacent.
8. **Unrest depends on nationality only.** A province is restless when its people are not an accepted culture of its owner. (A past bug also exempted original owners and silently removed most revolts for three versions.)
9. **The game ends in autumn 1918.** The Great War starts summer 1914; any war still running at the armistice is settled on the current lines.

## Player rules

**The line of kings.** The player's only decision is who rules next. Whenever the throne passes, the player picks one of three heirs; the ministers (the same AI as everyone else) then run the state the way that ruler sees the world, until he is gone. There are no other card types: no ministers, generals, favourites or councils beside the ruler.

- **One mandatory choice from three, at each succession.** The game pauses until the player picks. Aim for 6–10 successions a game (see "How a reign ends").
- **No managing between turns.** No policies, sliders or standing orders, and a choice can never be revisited or changed later.
- **Distinct and readable at once.** Three heirs should feel like three different characters (the lecher, the drunk, the butcher), never shades of one policy. One line of character plus one line of effect.
- **What you see is what you get.** Every heir is shown face up; no hidden or sealed heirs.
- **No suggested pick.** Don't mark what the ministers would choose.
- **Chill, not arcade.** No stacking, levelling or evolutions. A ruler should shape the nation's character (what its ministers value or how they see the world) more than raw power. Legendary rulers are the one exception, and they pay for it (below).
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

Each ruler changes what the forecast values, how it sees the odds, how far ahead it plans, or how the reign begins and ends. Never an irrational decision (rule 5).

Ordinary rulers:

- **Warmonger, Builder, Paranoid, Revanchist, Spendthrift, Reformer.** The originals.
- **The Soldier King.** Wins battles, loses many men.
- **The Cautious.** Rarely loses ground, rarely gains it.
- **The Arbiter.** Values alliances and treaties; brokers peace between others for gold.
- **The Shrewd.** Sees the odds of a war as they really are (no misjudgment).
- **The Admirer.** Close to one great power's court; joins every war it fights. (Absorbs the Puppet idea, which was the same character.)
- **The Tolerant.** Accepts one more culture; a restless province calms down.
- **The Chauvinist.** His own people's provinces pay 10% more; drops an accepted culture, whose provinces turn restless.
- **The Miser.** Values gold three times over, so the hoard grows and little gets built; the heir inherits it.
- **The Bold.** Plans 8 years ahead and fears no loss. (Absorbs the Impatient.)
- **The Dynast.** Plans 40 years ahead and borrows to build factories. (Replaces the old blank "prudent" heir.)
- **The Drunk.** His misjudgment is re-rolled every season.
- **The Mad.** Takes a new quirk every few years.
- **The Usurper.** Only from a coup, never on a card; unrest everywhere until he wins a war.
- **The Lecher.** Charms every neighbour; at his death a bastard claims the throne (a succession crisis).
- **The Child King.** A regent with a random quirk rules until he comes of age; then he takes his own, which can be any ordinary quirk or, rarely, Incompetent.
- **Incompetent.** Never on a card; only a Child King can grow up into one.

Legendary rulers, about 1 card in 8. A big upside paid for with an equally big visible downside, recognised by what they do (no colour tiers or rarity frames). The effect dies with them; only their landmark stays on the map.

- **The Conqueror.** Armies fight far better; every neighbour distrusts him; his death brings a succession crisis.
- **The Genius.** Factories boom; he has no heir, so a regency council follows.
- **The Great Builder.** Five years in, raises a landmark of the age that stays on the map: the Great Railway (two factories in the capital), the Fortress Line (a fortress in every border province) or the Grand Exhibition (a factory in each of the three richest provinces). Leaves no gold when he dies.
- **The Liberator.** Frees the serfs and accepts every culture at once, for good; the nobles plot a coup (2% a season).
- **The Saint.** No unrest while he lives; starts no wars, sends no ultimatums and joins no ally's war. He still defends himself.
- **The Iron King.** Crushes uprisings (triple garrison) and integrates conquests twice as fast; subject peoples rise when he dies.
- **The Navigator.** Sea trade pays half again and invading across the sea is easy, but the fleet doubles army upkeep.

Sweep check for legendary rulers: they should often help and rarely decide the winner (`npm run sweep -- 1 13`, spread of winners).

## Interface rules

- **The registry (`src/ui/registry.js`) is the single source for every concept the player sees**: one name, one line of description, one drawing, and the words to `avoid`. The map, panel, map key and tooltips all draw from it (`ic`, `glyph`, `nm`). Concepts with no icon (like Nation) live in `WORDS`. Add new concepts there, never ad hoc.
- One icon means one thing. Two different concepts never share an icon, and a label beside an icon uses the icon's own name.
- **Icons in copy.** When a sentence names a registry concept (Gold, Factories, Fortress, Unrest, Army…), its icon goes in front of the word, on its first mention in that text. Don't place them by hand: run the text through `iconize` (`registry.js`), which reads the word list `WORD_IC`; add new words there. Hover text (`data-desc`) stays plain, because it can't hold icons. Done so far for the heir cards and the start screen; the chronicle and older copy don't follow it yet.
- `npm run build` runs `tools/check.js` first and fails on an unknown icon, a shape drawn outside the registry, or an avoided word in visible text (UI strings, the HTML template and chronicle lines in `sim.js`). Fix the text, or change the registry on purpose; never weaken the check to get a build through.
- Settled words: Gold (money held), Gold a year (the score), Army, Fortress, Uprising, Integrated, Nation, Ruler.
- Plain, short labels. If a label needs explaining, rename it (for example "Gold a year", not "Yields").
- The map stays mostly clean: ruler quirks belong in the panel, not on country labels.
- Clicking the sea or pressing Escape clears the selection.

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
