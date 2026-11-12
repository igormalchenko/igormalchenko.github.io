# Rule 2 implementation and review guide

This implements the four requested steps after `RULE2-AUDIT.md`. The audit remains a historical report against its original revision.

## Review order

1. `403cd88`: shared structural validation, data-selected fallback ambition, content-defined map cuts, and the lost newborn coronation grant.
2. `bd9b0b2`: uniform event schedules, selectors, operations and global modifiers; Almanac and map chips read the same records.
3. `4df46a7`: shared state mutations and nation birth, explicit season phases, current income leader, local forecast caches and current-season accounting.
4. The final schema commit: complete records and neutral values, uniform trait-strength records, explicit art references and rarity presentation, synthetic test worlds and content-juggle regressions.

Start with `tools/validate.js`, `src/sim.js`'s `birthNations`, `runEvents`, `resolveReigns` and `step`, then `tools/test-rule2.js`. `tools/fixtures.js` owns synthetic test geography; the war assertions no longer depend on shipping countries or map edges.

## Contracts

- An event has a phase, schedule, selector, effects, crisis parameters, choice strings and prose. Every record has every field. Operations implement mechanics (`apply`, `awaken`, `era`, `ultimatum`, `war`, `settle`, `message`), never entry IDs. Unused payloads must be neutral; unknown operations, fields and references fail validation. The terminal boundary requires one closing settlement event, identified by operation and phase.
- Timed economic changes live in one modifiers list. Nations carry their initial factory multiplier; emancipation is a persistent change to that nation rather than an event-ID lookup in income.
- `birthNations` installs all shells, assigns land through `transfer`, establishes diplomacy and ambitions, then crowns rulers. Initial setup uses the same batch transaction so every realm exists before any starting coronation. Restorations retain advances, their scheduled year, player identity and emancipation. An extinct realm does not generate a successor or apply ordinary succession maluses.
- Treasury writes go through `changeGold`; percentage changes and transfers are wrappers. `setUnrest` supplies common bounds. `setProvinceOwner` owns ownership/cache changes, `appointRuler` owns ruler assignment, and `closeWar` owns war removal. Initial object construction is distinct from a running-world mutation.
- Reign-ending requests are deduplicated per nation during a season and resolved after unification. The outgoing ruler remains the incumbent until that boundary. A player choice pauses there, before date advancement and final history. Resuming completes the boundary without repeating income or decisions. No successors are requested after the terminal season. A restored player's ruler choice cannot create a retrospective development award.
- A season ledger opens before income and records all treasury movements, including gifts, revolutions, reparations and ultimata. Final history is taken after armistice settlement.
- Every nation declares its name-pool source. Trait slots are arrays of the same `{fx,value,text,news}` record; the rarity selects an index. A neutral rarity `flat: null` deliberately means no coronation grant. Drawings remain authored in the registry, with traits pointing to explicit emblem IDs. New artwork is an accepted code/art task.

## Deliberate behavior changes

Newborn land/rights/factory grants now have eligible targets. Unrest is bounded immediately for every cause. Reigns end at one shared boundary rather than during unrelated loops; one nation cannot undergo several ordinary successions in the same season. A pending player transition no longer lets later steps use an ended reign. Interventions use a current leader snapshot local to a forecast. General wars resolve their sides before declaration and no longer roll and discard ordinary ally participation. Gold accounting includes all transactions and terminal history includes settlement.

These changes alter random-number consumption and world outcomes. No forecast coefficients, trait strengths, event odds or union thresholds were retuned. Percentage losses retain their existing signed-balance policies: panic/revolution scale debts too; losses defined as a share of available gold use positive balances only. Existing historical differences and the fixed age endpoint remain.

## Validation and limits

`npm run build` runs the content/prose/map checks, 34 synthetic mechanic and lifecycle tests, UI rendering checks and HTML assembly. `npm run juggle` runs full builds and seed-one Chronicles in disposable copies, including nation/union/trait/event additions and renames, an event deletion, and map regeneration for a renamed cut province. All 16 experiments passed: 12 valid edits built and ran, and four invalid edits had clear validation rejections. It keeps logs in the temporary results directory.

The source guard is a dependency-free lexical check for the protected writes and fixed table lookups used by this engine. It is not a JavaScript AST proof: reflective writes, arbitrary aliasing and dynamically constructed property names still need code review. Configuration sections are not forced into the schema of unrelated entry kinds; sparse keyed counters/caches remain maps. Adding a genuinely new mechanic still requires code and validation; composing another entry from supported mechanics does not.

See `MEASUREMENTS.md` for the paired forty-world results, two shipping-world player runs and full Chronicle/state comparisons. Browser visual inspection was blocked by the local-file preview policy; DOM rendering tests passed. Review the lifecycle/timing changes as behavior changes, not as balance-neutral cleanup.
