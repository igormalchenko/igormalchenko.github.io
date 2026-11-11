# Development cards: production implementation handoff

## Read order and scope

Read the current main game's `README.md` and `CLAUDE.md`, this spec, then `handoff/approved-values.json` and `handoff/BONUS-MATRIX.md`. Paths in this spec are relative to this POC folder unless explicitly described as main-game paths.

Implement the agreed feature in the **current main game**. The POC demonstrates interactions; its copied engine, geography, content and UI are older and must not replace main-game files. The approved attachments supersede the POC's overtuned `content/advances.json`, card text and presentation. Neither the attachments nor this spec are runtime content. Once implementing, migrate the approved definitions into the main game's canonical `content/` and derive all runtime presentation from there.

This handoff records the user's completed design decisions. Routine implementation choices should follow current project conventions without reopening the design discussion. Keep the system simple and maintainable. No new framework, general-purpose event scheduler, research economy, or catalogue of political edge-case rules.

## Agreed game rules

- Development cards are permanent national advances. Players influence the existing governor through modifiers, not orders or new AI objectives. Keep the governor's gold forecasts and existing counterweights.
- Every living nation has the same scheduled opportunities: **1836, 1848, 1860, 1872, 1884, 1896, 1908**. Use game seasons, not elapsed real time. No science resource. The player's opening advance follows their opening ruler selection.
- Each opportunity offers three distinct, eligible, unowned advances: one **Military**, one **Economy**, one **Government**. Choose card identities randomly within their categories. Fill an unavailable category from the remaining eligible pool without duplicates.
- The player must select one face-up card; the game pauses until resolved. AI nations receive equivalent offers and select randomly, without interrupting play. No advance purchase cost or new reroll control.
- Each offered card independently rolls the existing rarity odds: Common 46%, Uncommon 30%, Rare 15%, Epic 8%, Legendary 1%. Use the existing rarity names and colours, not duplicate definitions. Advances have five explicit strength levels; do not reuse the ruler-specific main/flat/malus value-index mapping.
- Each advance has **one or two effects at every rarity**. Rarity improves those effects only. No added grants, maluses, levels, upgrades, replacements or repeated acquisition of an owned advance at another rarity.
- Advances survive ruler changes. Percentage modifiers multiply with each other and the reigning ruler's applicable effects; planning-year additions add. Costs remain positive through the arithmetic, not new hard floors or caps. Conditional effects retain their conditions.
- Store acquisitions in ordinary nation state and follow its existing lifecycle. Do not invent separate inheritance, transfer, restoration or catch-up systems. The regular schedule applies to living nations; no retrospective award machinery.

## Approved content and effects

`handoff/approved-values.json` contains all **30 advances, 52 effect rows and 260 tier values**, including categories and eligibility. Its `values` arrays are the approved engine values in the stated rarity order: e.g. a reduction is a multiplier below one, increased effectiveness a multiplier above one, and planning years an additive number. `handoff/BONUS-MATRIX.md` is the human-readable view, not a second runtime source. War Ministry has only fighting strength and upkeep; its POC planning and integration effects are removed.

Retain the existing POC eligibility and scope represented in the attachments. Coast cards require a coast; border cards require a neighbouring nation. Border War College names a living neighbouring non-ally when offered, preferring a neighbouring rival, otherwise the strongest eligible neighbour. Store its target ID, not a copied name. Its strength bonus is target-specific; its casualty bonus applies to all battles. National Defence affects wars over the nation's core land. Foreign-province integration and general integration combine only where both actually apply. Use current main-game geography and combat behaviour.

Approved starting values are not proof of balance. Preserve them for the first measured implementation. Report evidence before proposing material numerical changes; do not silently restore POC strengths or guarantee aggression by changing the governor.

## Rule one is an acceptance requirement

Use the main game's `CONTENT` pipeline. Advance definitions, categories, schedules, eligibility, strength arrays, concept names and descriptions, effect wording and rulebook explanations belong in `content/*.json`. References use IDs. Rarity metadata remains canonical in the existing content. Runtime nation state stores advance ID, rarity and necessary runtime parameters, rather than cloned definitions, prose or effect arrays.

Use the existing effect catalogue and one explicit resolution path for ruler plus advance contributions. Register any genuinely new targeted effect properly; do not identify a behaviour by card name or hide a modifier outside the catalogue. The same resolved modifiers and conditions must reach economic costs/returns, recruitment, forecasts, integration and actual combat as applicable. Percentage points, speed changes, prices and headcount must not be conflated. Do not add unrelated ruler refactors.

Generate each advance's exact effect lines through the existing content formatting conventions, using placeholders for content names and numbers and `iconize` for concept mentions. Reuse those lines in the chooser, acquired-card hovers and existing Almanac generation. No independently authored Almanac catalogue or copied values. Register the content family so the Almanac exposes all entries, all rarities, eligibility and complete timing/accumulation rules from the same definitions.

Extend `tools/check.js` to cover advance structure, IDs, categories, eligibility/targets, effect use, five valid strength levels, one/two-effect limit, rarity odds, referenced icons, complete rule explanations and rendered Almanac output. Adapt ruler-only assumptions narrowly to recognise the additional approved content family. Preserve existing guarantees; never weaken checks to permit a mismatch. A rename or number change must propagate everywhere through one content edit.

Update the specific superseded statements in `CLAUDE.md`: leader-only player choices and ruler-only ownership of effects now admit the agreed permanent advances. Preserve the remaining design rules.

## Minimal UI, already agreed

- Add a small progress indicator **in the top bar**, showing progression toward the next scheduled choice and its date/time remaining. Derive it from the actual calendar. After the last opportunity, do not imply another scheduled award.
- Reuse the leader chooser's interaction and rarity styling, with a clearly different advance-choice heading and registered feature icon. Clean card identity: name, icon, category, rarity and at most two exact effect lines. Keep number-key selection/instructions consistent with leaders. No ruler name or portrait, flavour sentence, strategy paragraph or forecast preview.
- Show acquired advances as a **compact icon row in the inspected nation's existing left panel**, for player or AI. Use rarity colours and ordinary hover text containing the name and exact effects. No accordion, acquisition-date list, counter, combined totals or explanatory paragraphs.
- Add one short Chronicle acquisition line naming the nation and advance, with normal rarity colouring. Do not repeat bonuses or include forecast commentary.
- Use the existing Almanac, registry and tooltip conventions. Distinct concepts require distinct registered icons; do not reuse Reforms as the advance concept. Do not invent misleading names for underlying effects.
- Make only a tiny amendment to the original start/help sentence to mention advances. No promotional paragraph or POC branding.
- No dedicated advances toolbar button, second history popup, map overlays or province markers. Detailed combined-bonus/stat-hover visibility remains deferred.

## Implementation discipline and verification

Use the current checkout and preserve unrelated changes. Capture a baseline before editing. Build on the existing simulation, deterministic RNG and pending-choice mechanisms. Keep drawing/rendering side-effect free. Serialize heir and advance choices through the existing pause flow without lost choices, skipped seasons or duplicate awards. Do not build a generic queue framework for hypothetical future card types.

Run the current main game's build and regression checks, plus meaningful advance tests: all-nation schedule/draw parity, categories/eligibility/unique acquisition, five rarities, permanence and compounding with leaders, matching forecasts and actual effects, targeted combat, pending-choice progression, and deterministic redraw-free rendering. Exercise complete player and watch games to the armistice. Verify the top bar, chooser, nation hovers, Chronicle and all generated Almanac content visually through supported preview tooling. Respect current local workflow instructions; report any preview limitation rather than bypassing browser restrictions.

For pure content/effect refactors, compare full chronicles and final states, not just aggregate results. With no advances applied, existing mechanics should reproduce the captured baseline. Enabling the shared feature intentionally changes worlds. Run the required **40 matching seeds** before/after (`npm run sweep -- 1 41`) and compare the metrics required by `CLAUDE.md`; inspect at least one chronicle. Include paired player-choice trials to establish actual governor behaviour, not merely changed forecast scores. Check full seven-choice combinations, including leaders. POC research results concern the old, stronger player-only cards and do not validate this shared rarity matrix.

Deliver the playable main-game build, verification/balance results and any remaining limitations. Follow current repository commit/push rules when implementation is requested. Do not claim validated balance from approval of the matrix or successful functional tests.

## Parked work

Bonus development-card offers outside the timer are a future discussion, with no approved triggers or rewards. Do not implement them now. Combined-modifier displays are likewise deferred. Do not ask speculative design questions when ordinary nation-state behaviour suffices.
