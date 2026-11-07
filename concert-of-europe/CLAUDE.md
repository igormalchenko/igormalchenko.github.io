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

## Interface rules

- Every concept has one icon in `src/ui/icons.js`, used everywhere, with a hover name in `IC_NAME`. Add new concepts there, never ad hoc.
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
- Player: `createSim(seed, geo, { player })`; `heirCard` builds a choice of three heirs and parks it in `S.pending` (which halts `step()`), `chooseHeir(i)` resolves it. AI countries still get `newRuler` exactly as before, so watch-mode sweeps are unchanged.
- End: the armistice block at the end of `step()`.
