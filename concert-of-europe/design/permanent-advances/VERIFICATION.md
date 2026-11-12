# Production development cards: verification and review handoff

Implemented against main-game commit `5622784`, following `poc/permanent-advances/PRODUCTION-SPEC.md`. The POC engine, map and UI have not replaced production files. All 30 definitions, 52 effect rows and 260 tier values were compared with the approved attachment and match exactly. No balance values or governor objectives were changed.

## Review entry points

- `content/advances.json`: canonical definitions, categories, eligibility, calendar and presentation templates. `content/rarities.json` remains the sole rarity source. Nation acquisitions contain only `{ id, grade, target? }`; `advanceYear` prevents duplicate opportunities.
- `src/sim.js`: `advanceEffects` supplies all effect text; `fx` combines ruler and advance contributions. `drawAdvances`, `offerAdvances` and `chooseAdvance` share the offer path across AI/player nations. Scheduled offers run at initialization and calendar boundaries; a pending heir defers the player's offer until resolved, before another season can run. The normal nation creation/restoration lifecycle applies without inheritance or catch-up additions.
- `quality`, military-side forecasts and actual front strength pass opponent IDs to the registered `targetFight` effect. Existing `homeFight` goal/core conditions remain in place. Existing cost, recruitment, returns, casualty and integration paths consume the combined resolver.
- `src/ui/panel.js`, `map.js`, `main.js`: shared mandatory chooser, calendar progress and a single compact icon row in the inspected nation's panel. Each advance has a distinct registered icon. Advance rerolls and ruler-only card details are absent from development choices.
- `src/ui/almanac.js` and `tools/check.js`: definitions generate every rarity's effects and eligibility, with timing and accumulation explanations from the rulebook. Checks retain existing ruler guarantees and also validate advance references, five strengths, limits, targeting, icons and complete rendered effects.

## Functional verification

`npm run build` passes consistency checks and all 24 war/development regressions, then generates the playable root `index.html`. The new tests exercise all canonical effect strengths at all rarities; all-nation opening opportunities; category fallback, odds and eligibility; unique acquisition; seven-card stacks with rulers; succession permanence; forecasts versus actual prices, reform effectiveness, recruitment, integration and combat; fixed neighbour targets; core-land conditions; pending-choice serialization; and rendering without changing simulation state. Complete watch, France-player and Prussia-player games reach the autumn 1918 armistice.

Full no-advance equivalence was checked for seed 7, comparing the entire Chronicle (including HTML) and serialized final state. Only the newly introduced nation metadata is omitted; advances are disabled in the test VM by emptying the calendar. The results match byte for byte. The SHA-256 is recorded in `results/no-advance-parity.txt`.

Reproduce against a baseline checkout with:

```sh
node tools/compare-advances-baseline.js /path/to/baseline/concert-of-europe 7
npm run sweep -- 1 41
npm run chronicle -- 7 econ
node tools/measure-advances.js 7 PRU
node tools/measure-advances.js 7 FRA
```

The supported browser rejected the repository's required `file://` preview under its URL security policy. No server, alternate browser surface or indirect browser mechanism was used to bypass that restriction. Chooser, nation panels/hovers, progress and all Almanac output have headless rendering checks, but visual screenshots, layout, hover placement and interactive keyboard/focus behaviour still need review in an allowed local browser.

## Matching 40-world sweep

Both runs use seeds 1–40 (`npm run sweep -- 1 41`). All 80 worlds end in autumn 1918. The raw per-seed output and aggregates are in `results/baseline-sweep.txt` and `results/production-sweep.txt`.

| Metric | Baseline | Shared advances |
|---|---:|---:|
| Wars per world | 39.5 | 45.4 |
| Uprisings per world | 32.8 | 34.1 |
| Ukraine alive at armistice | 23/40 | 32/40 |
| Richest great power: France / Britain / Russia | 26 / 11 / 3 | 23 / 15 / 2 |
| Survive-ambition nations alive | 176/453 (38.9%) | 153/442 (34.6%) |

Counts below are worlds where a union is proclaimed / still held at the armistice. These distinguish occurrence from survival.

| Union ID | Baseline proclaimed / held | Shared advances proclaimed / held |
|---|---:|---:|
| ger | 40 / 28 | 40 / 23 |
| ita | 28 / 26 | 28 / 22 |
| ibe | 30 / 16 | 33 / 22 |
| pol | 12 / 4 | 11 / 5 |
| rom | 12 / 4 | 11 / 6 |
| bul | 7 / 3 | 8 / 4 |
| gre | 5 / 2 | 2 / 0 |
| sca | 5 / 3 | 6 / 4 |
| ukr | 3 / 2 | 5 / 0 |
| hun | 3 / 2 | 3 / 1 |
| yug | 1 / 1 | 1 / 0 |

The enabled feature intentionally changes RNG consumption and world trajectories; this is a paired seed comparison, not an isolated causal estimate of individual cards. The starting matrix is not validated as balanced: France remains dominant, small-nation survival falls, and the German union is still universal. No numbers have been retuned in response.

Seed 7's complete economic Chronicle was inspected. Acquisitions occur in the seven scheduled winters, with short nation/advance lines; new nations participate in subsequent opportunities. The 1914 summer war and 1918 autumn ending remain intact. This world ends with Britain richest and the German union held, while Spain, Switzerland and the Papal States meet Survive ambitions.

## Paired player-choice trials

Each pair uses seed 7, always chooses the first offered heir, and chooses the offered Military or Economy advance at every opportunity. All four games complete all seven choices and survive to autumn 1918. Counts below come from actual calls to the governor's action execution function, instrumented only in the measurement tool. Full acquisition sequences and rarity/target IDs are saved in the two player-trial JSON files.

| Nation / policy | Heir choices | Wars started | Factories built | Recruit actions | Reform actions | Fortress builds | Final provinces | Final gold/year |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Prussia / Military | 11 | 8 | 20 | 16 | 3 | 6 | 2 | 9.36 |
| Prussia / Economy | 6 | 3 | 42 | 19 | 17 | 20 | 14 | 76.98 |
| France / Military | 6 | 0 | 39 | 21 | 18 | 2 | 11 | 186.26 |
| France / Economy | 5 | 0 | 46 | 20 | 17 | 8 | 8 | 231.92 |

These are behavioural examples, not a claim that Military guarantees aggression or that one category is optimal. Neither France policy starts a war. Prussia's Military policy starts more wars but ends with much less land and gold; extra strength does not guarantee a profitable strategy. In each case, planning, economic forecasts, ruler changes and the existing counterweights still determine action. Later offers and successions can diverge after the first different choice. The arithmetic regressions also check seven-card strength and construction-cost combinations through all five tiers, including reigning-ruler multipliers and planning additions.
