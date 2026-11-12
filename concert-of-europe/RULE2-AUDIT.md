# Rule 2 audit: the system stays dumb

The code is partway to Rule 2: ordinary traits, nations, claims and unions mostly share mechanisms, but events are still a list of individual programs, nation birth has a second ownership path, and gold and unrest have no single mutation function. Content can be juggled successfully in several places, but valid edits can also require code changes, crash after the consistency check passes, or produce an apparently successful world with broken text. The three changes with the broadest effect would be **a uniform event format and runner**, **shared state-change functions, including one complete nation-birth sequence**, and **uniform content schemas whose consumers never supply missing-field defaults**. These would remove substantially more special cases than rewriting individual historical exceptions.

Audited on 12 November 2026, at `0ebaf861cb77bf8d0411fc98aa8ca8e6f260c995`, on `codex/permanent-advances`. Read README.md and all of CLAUDE.md first. Scope: all the requested source, template, tools and JSON files, plus the content-dependent parts of the map builder. Paths below are relative to this directory; line numbers refer to that revision. No source, content, generated game, dependencies or tooling were changed in the checkout. All builds, mutations and probes ran under `/tmp/concert-rule2-audit/`.

Severity means:

- **Breaks the juggle test:** blocks a legitimate content-only edit, crashes instead of giving a clear consistency error, or accepts content and produces an incorrect result.
- **Adds an edge case:** duplicates a mechanism or requires callers to know an extra condition; a failing content experiment is not necessarily demonstrated.
- **Cosmetic:** affects presentation or the simplicity of presentation code.

Findings are grouped by mechanism. Cross-references identify the same problem under another rule rather than counting it again. Forecast tuning is excluded. Missing references, typed names/numbers, stale generated maps and other violations already covered by Rule 1 **and actually enforced by check.js** are not findings here. Some deliberately invalid scratch edits are included as controls to show that distinction. An event or emblem table being complete today does not remove its separate Rule 2 problem: adding another entry still requires editing code.

## 1. No code names an entry

### 1A. Every event is wired by its own identity — breaks the juggle test

**Locations:** `src/sim.js:186,238,240,557`; the handlers at `811` (springtime), `812` (famine), `813` (cholera), `814` (railway), `815` (panic), `816–817` (compromise), `818` (serfdom), `819` (incident), `820` (marriage), `821` (harvest), `823` (shevchenko), `824–825` (awakening), `827–829` (revolution), `831–832` (boom), `834–841` (ultimatum); `879` (greatWar), `979` (armistice), `995` (opening). Also `src/ui/map.js:120–122`; `src/ui/almanac.js:36,51,61`; `src/ui/index.template.html:352`; `tools/check.js:122–124,277,295`.

These are specific event lookups, not dispatch over a general event operation. The railway and panic events also supply ordinary economic modifiers; the serfdom event determines which nation starts with serfs. In particular, `tag === EV.serfdom.nation` is still a particular-nation comparison, even though the tag is obtained indirectly. The Almanac knows exactly which two events can awaken peoples. The checker has lists of the particular events with province, nation and people references, and exempts `opening` by ID from having an effect sentence.

The individual once-only flags at `src/sim.js:812,814–818,863–864` (`famine`, `rail`, `dep`, `ausg`, `serf`, `gw`) are a second identity table. Awakening uses a different once-only rule keyed by people at `823–825`.

**General replacement:** every event carries the same `schedule`, `chance`, `repeat`, `targets`, `conditions`, `changes` and `text` fields. Run the table, and key completion state by the entry's ID and declared repeat scope. Represent ongoing modifiers as ordinary active effects rather than reading a particular event in income, factory pricing and map overlays. Give every nation a `serfs` or initial `effects` field. Generate the Almanac and reference checks from those same selectors and operations. Preserve the deliberate historical outcomes; remove the hard wiring of their identities.

### 1B. The emblem table names every trait — breaks the juggle test

**Locations:** `src/ui/registry.js:130–151`: `warmonger`, `soldier`, `bold`, `cautious`, `paranoid`, `builder`, `stingy`, `spender`, `tyrant`, `reformer`, `drunk`, `vengeful`, `flirt`, `religious`, `sharp`, `planner`, `tolerant`, `nationalist`, `strict`, `sailor`; consumers `src/ui/panel.js:22`, `src/ui/almanac.js:26`; paired-table checks `tools/check.js:168,176`.

The simulation can draw a renamed or added trait, but the build requires the same ID to be added to JavaScript's `EMB`. A content-only rename of `flirt` failed solely on the missing new emblem and surplus old emblem after content references were updated.

**General replacement:** every trait carries an `emblem` reference to a reusable drawing, with the drawing registry retaining ownership of SVG. This does not require moving drawing code into JSON. New traits can reuse existing art; new art remains an intentional art/code task. The current rule that each trait must have its own code key is the extra dependency.

### 1C. The fallback ambition names one particular entry — adds an edge case

**Locations:** `src/sim.js:186,787,789,794`.

`'survive'` is used both as a mechanic kind and as an assumed ambition **entry ID**. `AMBITIONS.survive` and generated `{ id: 'survive', kind: 'survive' }` couple the fallback to one entry's spelling. Renaming just that entry and its nation references passes the build and seed-one chronicle, but the fallback paths still manufacture the old ID. This is distinct from intentionally implementing the three settled ambition kinds.

**General replacement:** give ambition entries a uniform `fallback` flag, or use a validated `rules.defaultAmbition` reference; derive both `id` and `kind` from that entry. Do not silently substitute an entry for an invalid reference. The rules for restored great powers and already-proclaimed unions can remain unchanged.

### 1D. Headless tools and build tests name the shipping world — breaks the juggle test

**Locations:** `tools/sweep.js:9,16,24,26,47,52` fixes its watched nation to `UKR`; `tools/measure-advances.js:28` defaults to `PRU`.

The war-test identity clusters are at `tools/test-war.js:16,32,53,58–60,72–76,83–86,93–96,102–108,112–116,122–129,135–161,168`. They name `GBR`, `RUS`, `FRA`, `TUR` and provinces `mos`, `lon`, `ire`, `par`, `vol`, `cri`, `cau`, `don`, `bes`, `kie`, `ana`, `bri`, including the default arguments and occupied-province list. The land/sea equivalence test depends on actual London–Paris and Brittany–Paris geography.

The nation/people clusters in `tools/test-advances.js` are at `20,24–25,30–33,44–45,65,68,80–81,107,114,131,134,144–159,165–170,176–194,199–201,212,215,222,225,241`. They name `FRA`, `SPA`, `SWI`, `PRU`, `GBR`, `RUS`, `POR` and `turkish`; the injected UI stub fixes selection to `FRA` as well. That file additionally binds its assertions to particular advance IDs at `81–109,118–122,135,150–159,185`, and exact catalogue sizes at `21–22`. These are the same structural problem for another content kind.

A complete content rename `FRA → XFR` passed check.js and the actual chronicle but broke the build's fixtures with TypeErrors. `UKR → XUK` passed both requested commands, but loading the sweep then threw while reading the absent watched nation's name.

**General replacement:** run mechanic regressions against small synthetic worlds with fixture-local IDs and explicit geography; select shipping-world smoke-test subjects by capabilities. Accept a watch tag as a validated argument, or report all nations uniformly. Derive catalogue-wide assertions from content rather than keeping per-entry lists and counts in step. A deliberately named historical scenario can exist separately from the build's generic compatibility gate.

### 1E. The map builder names two provinces in a special geometry operation — breaks the juggle test

**Locations:** `map/build-map.js:100–110`, especially `103` (`ana`, `cau`); the resulting special border is also emitted at `193`.

The Ottoman-south correction searches for two exact province IDs, then applies a bespoke cut and union. Renaming `ana` consistently in content makes map regeneration crash at `109`, even though it is the same province in the same place. This correction is outside the source files scanned for content identities.

**General replacement:** a general geometry-adjustment list in `content/map.json`, with uniform `from`, `to` and clipping-shape fields, interpreted by one operation. Validate all references before doing geometry. The ordinary `land` and `sea` fix loops at `249–253` already show the preferable pattern.

### 1F. Rarity presentation identifies tiers by array position — cosmetic

**Locations:** `src/ui/registry.js:153` (`TIER[0]`, `g >= 3`); `src/ui/almanac.js:26` (`embBadge(0)`); `src/ui/panel.js:34,65` (position-derived tier classes); `src/ui/index.template.html:248–250,252,255–257` (tier3, tier4, tier5 selectors). Tests also choose particular rarity positions: `tools/test-advances.js:16` defaults grants to grade 2; `72,82,92,98,118,122,135,150,152,185` use fixed grades, five-position loops or grade-specific expected strengths. Those fixture assumptions are part of 1D/3B rather than a separate gameplay defect.

Badges and card effects know which positions are special. Reordering rarity entries moves the appearance with the position rather than with the rarity definition. The five-tier gameplay design itself is settled; this is about locating its presentation metadata.

**General replacement:** uniform rarity fields such as `badgeWidth`, `glow`, `sheen` and a representative-display flag, passed through CSS variables or generic classes.

No additional literal checks for a particular living nation, people or union were found in the production simulation beyond 1A and 1C. Accepted peoples and union membership are generally read from data. The Papal States' Survive ambition is already an ordinary `ambition` field and is not a violation.

## 2. Every entry of a kind has the same shape

Tests of a **value** in a required field, such as `starts`, are not missing-field tests. Table validation that rejects an absent required field is also not a violation. The findings below concern optional fields, their defaults, and derived records that preserve the same optionality.

### 2A. Nations have different fields, and consumers repeatedly fill the gaps — adds an edge case

**Content locations and complete field differences:** `content/nations.json:2–471`.

| Field | Entries carrying it | Locations defining the pattern |
|---|---|---|
| `accepts` | GBR, TUR, SWE only | `8,76,150` |
| `allies` | GBR, FRA, AUS only | `15,29,55` |
| `relations` | GBR, FRA, AUS, RUS, DEN, GRE, SER only | `14,28,54,68,142,281,294` |
| `army` | all 24 starting nations; none of the 16 uprising nations | `13–293`; contrast `296–471` |
| `pre` | all except HAN, HES, SAX, BAV, WUR, SWI, TUS, PAP, SIC | first example `5`; missing examples `157–222,235–269` |
| `noAnnex` | PAP only | `256` |
| `rulerNames` | PAP only | `257` |

**Consumer locations:** `src/data.js:8–9` carries missing `accepts` into `acc`; `src/sim.js:61,182,184,186,204,206,382`; `src/ui/almanac.js:42–50`. Specifically: name-pool `||`; prefix `||`; accepted-peoples `|| []`; optional `gold != null` in the constructor; `!!noAnnex`; optional name/ambition defaults; relations `|| {}` and allies `|| []`; optional war prefix; and the Almanac's tests of `accepts`, `army`, `allies`, `relations`, `rulerNames`, `pre`, `noAnnex`. `tools/check.js:103–109,287` permits this partial shape and actually forbids neutral `army`, `allies` and `relations` fields on uprising entries.

**General replacement:** require every nation's full field set, including empty `accepts`, `allies`, `relations`, a boolean `noAnnex`, and an explicit name-pool policy. Resolve names and war-name prefixes once when loading data. Keep starting and uprising resource policies explicit, with all fields present, rather than using absence to select the policy. Preserve the special starting data and Papal refusal to join unions.

### 2B. Events have a different schema for almost every entry — breaks the juggle test

**Locations:** `content/events.json:2–174`; runtime consumers in 1A; `src/ui/almanac.js:83–88`; the checker mirrors this at `tools/check.js:122–124,266–279,295`.

Only `name` and `text` occur in every event. The uneven fields are: `awake`, `backDown`, `before`, `calm`, `chance`, `cost`, `earns`, `effect`, `every`, `factories`, `finds`, `from`, `gold`, `lasts`, `margin`, `nation`, `nations`, `newAdj`, `newName`, `pay`, `people`, `peoples`, `pop`, `pretexts`, `province`, `provinces`, `rattle`, `rattleText`, `relations`, `season`, `seasons`, `unrest`, `warText`, `year`, `years`. `opening` alone lacks `effect`.

The Almanac checks `year`, `years`, `from`, `every`, `season`, all three text fields, `province`, `people`, `peoples`, `finds`, `pretexts`, `nation`, `effect` and `chance`. It also branches on whether `nations` is numeric. These are schema-dependent branches, not simply hiding an empty list. The event checker reconstructs each event's field usage from its bespoke handler instead of validating one event language.

**General replacement:** the uniform schedule/selector/change records in 1A. A zero-effect event has `changes: []`; absent choices have empty arrays; always-valid conditions use an empty condition list. Separate schedule semantics from effect payloads so swapping event records cannot change what their IDs mean.

### 2C. Ambitions and ambition kinds use optional feature fields — adds an edge case

**Locations:** `content/ambitions.json:2–120`; `content/ambitionKinds.json:2–24`; `src/sim.js:753,761,796,800`; `src/ui/almanac.js:10,56,68,71`; permissive validation at `tools/check.js:117–120,290`.

The two non-union ambitions carry only `kind`; union entries add `title`, `adj`, `pre`, `peoples`, `need`, `from`, `provinces`. Within the unions, only Dacia has `art` (`ambitions.json:49`), and only sca, ukr, rom, gre, yug and hun have `note` (`33,44,56,77,88,119`). The code tests `a.provinces`, defaults `art` in three places, defaults `title`, tests `x.peoples`, and conditionally renders `note`. Among ambition kinds, only unite has `worth`, `proclaimText`, `joinText`; only survive has `losses`, `aside`. The Almanac tests `worth` and `losses` for presence.

**General replacement:** full union records with `art: 'the '` and `note: ''` as ordinary defaults in every entry; uniform ambition records with neutral arrays/values, and kind records with neutral `worth: 1`, `losses: 1` and empty text fields. Alternatively, explicitly treat union definitions and non-union ambition definitions as different kinds with separately enforced schemas. Do not infer a kind from a field's existence.

### 2D. Two traits use a second, optional flat-grant shape — adds an edge case

**Locations:** `content/rulers.json:90–100,121–131` versus every other `flat` record; `src/sim.js:14–16,116`; `src/ui/almanac.js:102`; `tools/check.js:170–173,177,298–301`.

Flirt and Planner alone have `flat.big`. That record has scalar `value` and `news`; ordinary effects have `values` arrays and no `news`. Their normal flat-value arrays also have one element instead of two. `traitEffects` branches on `T.flat.big`, then uses two different representations; the checker and Almanac repeat those tests. The Legendary substitution is deliberate, but the optional representation is not needed to implement it.

**General replacement:** every slot resolves through the same per-strength array of change records, each with `fx`, `value`, `text`, `news` (empty when unused). No bonus means an empty change list. Preserve the settled percentage main bonus, coronation-only flat bonus and Legendary province gifts. The rarity records themselves already have the same keys; their explicit `flat: null` is a value choice, not a missing field.

### 2E. Small metadata flags are omitted rather than neutral — adds an edge case / cosmetic

**Locations:** `content/effects.json:2–42` (`targeted` only at `42`); `content/eras.json:2–6` (`start` only at `2`); `content/concepts.json:2–157` (`avoid` on 12 entries, `word` on five). Consumers: `src/sim.js:44,52,64,828`; `src/ui/registry.js:126`; `src/ui/almanac.js:90`; `tools/check.js:72,126–128,202,211,291`. Drawing defaults add another optional shape at `src/ui/registry.js:11–121,126,162,165` (`box`, `map`, and optional registry join).

**General replacement:** every effect has `targeted: false`, every era `start: false`, and every concept `avoid: []`, `word: false`; drawings have explicit neutral size and map scale. The checker currently rejects `targeted: false` (`291`), so its schema must change along with the data. Ordinary boolean feature tests then remain, but they read guaranteed fields. Iconless concepts are intentional; see Judgement calls.

### 2F. Derived state keeps missing fields alive after content loading — adds an edge case

**Locations:** `src/sim.js:39,44,50–52,61,82–83,87,91,100–114,148–155,173,186–187,219,271,703,713,732–734,753,756,759,765,794,798,910,963`; `src/ui/panel.js:22,48,56,146,159–166,189,218,220,275–276`; `src/ui/map.js:23`; `src/ui/almanac.js:26,38,48,59,80`.

The important content-derived subset is sparse ruler `fx` values (`50`, all the coronation `v(...)` tests and `|| 0` loops at `102–114`), sparse targeted acquisitions (`910`, tested at `sim.js:21` and `panel.js:56`), and missing name/lean/thrift/effect fallbacks. The runtime also grows `reigns`, `player`, `restored`, `crisis`, `ambition`, awake values and union `done` only when needed; callers then supply defaults or test existence. The budget starts with a null ledger and an empty spending map, which produces another family of defaults in the panel. Generated geography is read through `navalPts[k] || ...` and `navalPaths?.[k] || ...`, despite coming from one builder.

**General replacement:** construct a complete runtime nation, ruler, union-progress, acquisition and ledger record once; give each effect its registered neutral value, each spending category zero, flags false, targets an explicit neutral value, and no-crisis an expired record. Keep absence of an entire country in `S.C`, invalid UI input and a legitimately empty selection distinct from an optional field. Sparse maps are a reasonable exception to discuss, not proof that every listed guard is a bug.

The entry keys in `peoples.json`, `provinces.json`, `rarities.json`, `temperaments.json`, and the advance-card/effect records are otherwise uniform today. Configuration sections in rules/map/advances and rulebook topic arrays are not multiple entries of one kind merely because they share a JSON file. `src/text.js:60–74` validates template lookup and formatting; that is not an optional-content-field mechanism requiring removal.

## 3. Adding content never needs code

### 3A. Events, trait art and map corrections have mandatory code companions — breaks the juggle test

**Locations:** all locations in 1A, 1B and 1E; especially `src/sim.js:810–845`, `src/ui/registry.js:130–151`, `tools/check.js:122–124,168,176,246–247,256,266–279,295`, `map/build-map.js:100–110`.

A new event needs its own handler, any new reference checks, repeat flags and possibly UI chips. Even a new event identical to harvest is rejected as never run. A trait using existing mechanics still needs a code emblem key. A new bespoke geometry correction needs another builder operation because only land/sea links are currently general. The checker detects the first two mismatches, but currently demands the special-case architecture rather than allowing a content-only addition.

**General replacement:** the event runner, trait `emblem` reference and geometry-adjustment records described above. New *mechanics* can still require implementation; another entry composed of existing mechanics must not.

### 3B. The shipping content doubles as the test fixture — breaks the juggle test

**Locations:** 1D; additionally `tools/test-advances.js:21–22,46,48,51,64,72,79–109,221,235,257–258`; `tools/measure-advances.js:29`.

Beyond explicit IDs, the tests assume an exact advance catalogue, exactly three categories, five rarity indices, particular dates and a particular country's geography. Some are deliberate design invariants, but others make adding or rearranging data require rewriting unrelated tests. The measurement tool's category list is separately fixed to military/economy.

**General replacement:** distinguish tests of settled global rules from tests of a catalogue snapshot. Derive offer/category/date expectations from content; test a selected mechanic against a fixture made for that mechanic. Keep named balance comparisons as explicitly versioned scenarios. Do not make ordinary content editing update mechanical test scaffolding.

### 3C. Advance identities repeat across card, concept, drawing and test tables — adds an edge case

**Locations:** `content/advances.json:20–352`; `content/concepts.json:128–157`; `src/ui/registry.js:12–41`; `tools/test-advances.js:21–22,81–109,118–122,135,150–159,185`.

Although advances were not among the five examples in the question's third rule, they are in scope and exhibit the same dependency: each identity has a separate concept and code drawing, and tests have fixed card lists/counts. The engine's effects iteration itself is generic. The explicit requirement for distinct registered advance icons at `tools/check.js:196–198` is a design choice rather than a missing-reference bug.

**General replacement:** permit reusable art references or a data-described icon composition, and generate catalogue assertions. Keep unique artwork if desired, but acknowledge that art requirement as the reason adding content needs a code/art edit.

Nations, peoples and individual unions have no production per-entry switch or handler. The treaty/unification guards read fields and membership, rather than listing eligible historical nations. Scratch additions of a born nation and a union succeeded. `act`'s switch at `src/sim.js:651–665` dispatches **mechanic operations**, not content entries; replacing it with a dynamic dispatch table would not by itself improve Rule 2.

## 4. One way to make each kind of change

The inventory below includes initialization and the existing shared paths, so a shared call is distinguishable from a second implementation.

### 4A. Land transfer has one bypass at nation birth — adds an edge case

| Locations in `src/sim.js` | Path | Shared function? |
|---|---|---|
| `66–68` | initial province owner/core | Initialization only. |
| `418–424` | ordinary owner change, occupation/build cleanup, integration, conquest unrest, ownership-cache invalidation, extinction | `transfer` is the shared implementation. |
| `115`, `468`, `474`, `663`, `722`, `780` | coronation gift; peace goal/extras; armistice; treaty annexation; joining kin after an uprising; union vote | All call `transfer`. Peace callers at `478,484` reach it through `give`. |
| `737–738` | uprising creates/restores a nation and assigns a whole group directly | **By hand.** Writes owner/core/unrest/build/flash/integration, invalidates the cache separately and calls extinction separately. |

The uprising-joining-kin route uses `transfer` and then overrides core/unrest at `722`; newborn independence implements a different transfer at `737`. These distinctions can be policy, but cleanup should not depend on callers remembering which version they are using. The direct birth path does not explicitly clear `occ`, relying on the selection guards at `709,736` to guarantee it is already empty.

**General replacement:** one `transferProvince(r, to, reason)` with data-defined settlement policies for war, treaty, kin uprising and independence. Batch transfers, then run nation cleanup once for the transaction.

### 4B. Normal succession is shared; opening and nation removal bypass reign ending — adds an edge case

**Locations:** shared `endReign` at `src/sim.js:147–168`; callers `504` (defeat), `719` (revolution), `844` (coup), `848–849` (death/murder). All these use the shared end-of-reign maluses. All real crowns use `crown` at `94`; its callers are `132–133,157,167,179`, reached from `188,289` for birth/setup.

The opening player's stand-in is assigned directly at `289` and overwritten by `132`; that is deliberate and should not receive end-of-reign effects. Nation extinction at `409–417`, however, sets `alive = false` without any explicit reign-ending policy. Restoration subsequently overwrites the old country at `735`. There is no recorded lifecycle distinction between a ruler ceasing to rule because the nation ceased to exist and an ordinary throne transition. Calling today's `endReign` there would incorrectly create a successor, so it cannot simply be added to the caller.

**General replacement:** separate `finishReign(c, cause, successorPolicy)` from selecting/crowning a successor. Define extinction and opening stand-ins explicitly as lifecycle policies, including whether a terminal reign has effects. Keep the settled coup exception (army chooses) in that policy.

### 4C. Gold changes in nine mechanisms; only minister spending has a helper — adds an edge case

| Locations in `src/sim.js` | Gold mutation | Shared function? |
|---|---|---|
| `184`; override `731` | starting treasury / uprising birth grant | Constructor, with separate caller override. |
| `103` | coronation gold | Direct addition. |
| `151` | end-of-reign spending | Direct multiplication, positive balances only. |
| `486,489` | reparations debit and distribution | Direct debit/additions. |
| `650–656` | factories, forts, recruitment, reform | Local `spend` helper only. It also records spending. |
| `718` | revolution treasury loss | Direct multiplication. |
| `727` | failed independent revolt loss | Direct multiplication, positive balances only. |
| `815` | panic treasury loss | Direct multiplication, including debts. |
| `839` | ultimatum payment | Direct debit and credit. |
| `949` | income minus upkeep | Direct addition. |

There is no common rule for recording transactions or for whether a percentage loss can reduce debt. Revolution and panic multiply a negative balance toward zero, whereas the end-of-reign and isolated-rebel losses explicitly spare debts. Those differences may be intended, but are currently properties of separate lines of code. Only `spend` updates the expenditure record, so the budget cannot explain the other treasury changes through the same mechanism.

**General replacement:** `changeGold(c, amount, cause)` and `transferGold(from, payees, amount, cause)`, plus an explicit reusable policy for taking a share of positive gold versus changing a signed balance. Record all mutations through the same transaction path.

### 4D. Nation birth is split across setup, constructor and revolt code — breaks the juggle test

**Locations:** `src/sim.js:181–193,203–206,285–289,729–745,791`; sole ordinary death writer `409–417`, reached from `423,738`.

`makeCountry` builds a shell and, when `S.ready` is true, crowns it immediately. Setup installs the nation and establishes geography/relations before crowning. Uprising birth crowns at `731`, but installs `S.C[tag]` at `735`, transfers land at `737`, and sets relations/truces/guarantee at `739–743`. Thus the newborn's coronation runs in an empty realm. A scratch probe forced Builder at Rare, triggered the actual Albanian uprising, and observed a ruler advertising one capital factory, one owned province after birth, and **zero factories added**. Army/gold grants can land; grants needing provinces, neighbours or peoples cannot. The stated rule that a grant with no target is wasted does not require crowning a landed newborn before giving it its land.

Restoration adds another manual copy list (`player`, `advances`, `advanceYear` at `729,732–734`), resets other country state, and can restore a player nation with a random ruler instead of the ordinary heir-choice path.

**General replacement:** one `birthNation(tag, provinces, cause)` transaction: create/restore shell and retained state, install it, assign land, establish diplomacy, set ambition, then crown or offer a player successor. Setup and restoration use that same sequence with explicit policies. Keep `killIfEmpty` as the single death route, but make its guarantees part of that transaction.

### 4E. War declaration is shared; war removal has four implementations — adds an edge case

**Locations:** `src/sim.js:386–408` is the shared declaration; callers `664,841,879`. Great War creation then overwrites the sides at `880`, after ordinary declaration has already rolled ally participation, changed relations, and logged the war (`389–406`).

`endWar` (`461–505`) is the ordinary settlement/cleanup path, called by `tickWars` (`533–536`) and armistice (`980`). Other removals are extinction filtering (`414–416`), empty-side cleanup in `tickWars` (`508–509`), and Great War abandonment (`870–871`). The last clears occupations by occupier and drops the entire list without `endWar`'s truce/settlement path. Extinction and empty-side cleanup differ from both. These are intentional outcomes implemented as different teardown mechanisms.

**General replacement:** `startWar(spec)` receives already-resolved sides; `closeWar(w, settlementPolicy)` always performs the same structural cleanup, with explicit policies for victory, white peace, armistice, abandonment and an empty side. Great War remains a distinct scenario, not a second implementation of war lifecycle.

### 4F. Every unrest change is a direct write with its own bounds — adds an edge case

**All mutation locations in `src/sim.js`:** initialization `67`; coronation calm `100` (used by `107–109`); civil war `143`; end-of-reign malus `152`; conquest `421`; occupation `450`; ordinary drift `704`; crushed uprising `716`; revolution `718`; spreading unrest `721`; joining kin `722`; failed independence `727`; successful independence `737`; union proclamation `776`; springtime `811`; famine `812`; cholera `813`; panic `815`; compromise `817`; harvest `821`; ultimatum `839`; reform `859`.

There is no shared setter. Some additions cap at 100, some subtractions floor at zero, revolution uses its own floor, and cholera/panic/harvest/ultimatum use unbounded `+=`. Later `tickUnrest` clamps, but events and rulers run before it, so other steps can consume the out-of-range value first. Joining kin and independence also override transfer unrest differently.

**General replacement:** `changeUnrest(r, delta, cause)` and `setUnrest(r, target, cause)` sharing bounds and explicit floor policies. Event, war, ruler and revolt steps issue changes through those functions; target calculations remain in the unrest step.

### 4G. Test fixtures also mutate protected state directly — adds an edge case

**Locations:** `tools/test-war.js:24,73,113,149,154,157`; `tools/test-advances.js:114,120,144,157,168,170,190`. These directly replace wars, set occupations/owners, and assign gold/unrest. The owner fixture at `test-war.js:149` also remembers to invalidate the ownership cache manually.

**General replacement:** a synthetic-world fixture builder that constructs a complete initial snapshot, plus shared mutation functions when a test is exercising a transition. Direct setup remains reasonable; do not mistake those fixture writes for additional shipping mechanics, or mechanically ban legitimate test construction.

## 5. One job per step of the season

`S.step()` currently does the following, in this exact order:

| Order | Location in `src/sim.js` | Work |
|---|---|---|
| 1 | `942` | Return if finished or a choice was already pending. |
| 2 | `943–955` | Snapshot living nations; record income and previous spending; collect gold; announce civil-war victory; grow population; reduce infamy; apply debt army loss and army floor. |
| 3 | `956–964` | Drift relations and lapse alliances. |
| 4 | `965` | In winter, periodically recompute majors and choose rivals. |
| 5 | `966` | Store the current income leader on state. |
| 6 | `967` | Run every event handler, including coups. |
| 7 | `968–969` | Death/assassination succession; refresh ruler judgment swings. |
| 8 | `970` | Start the Great War if due, abandoning existing wars. |
| 9 | `971` | Province animations, integration and construction completion. |
| 10 | `972` | Shuffle living nations and execute minister decisions. |
| 11 | `973` | Battles, peace, land transfers and possible abdications. |
| 12 | `974–975` | Unrest drift, then uprisings/revolutions/independence. |
| 13 | `976` | Proclaim unions and absorb joining nations. |
| 14 | `977` | Record autumn income history. |
| 15 | `978–986` | At the ending date, settle every war, set game-over and announce ambitions. |
| 16 | `988–990` | Advance the date, discard a dead player's pending choice, offer scheduled advances for the newly entered season. |

### 5A. The income step also performs demography, diplomacy, military and ruler work — adds an edge case

**Locations:** `src/sim.js:948–954`.

Civil-war victory logging, population growth, infamy decay and army attrition/floors are embedded in tax collection. That makes the economic loop the owner of several unrelated lifecycles and fixes their timing implicitly.

**General replacement:** named economy, population, diplomacy and ruler/military-maintenance steps, each with one documented input snapshot and place in the season. This is a boundary change, not a request to retune any formula.

### 5B. Events are also ruler, war, economic and unrest steps — adds an edge case

**Locations:** `src/sim.js:811–844`, especially coup `843–844`, ultimatum `834–841`; consequences at `endReign:151–167`, `coronation:100–116`, `civilWar:140–144`. Wars also end reigns at `504`; revolts do so at `719`; union proclamation writes unrest at `776`.

An event can start a war before decisions; a coup can end a reign just before the normal ruler step examines the replacement ruler. Reign endings can crown immediately, pass reforms, change land and end nations. Wars and revolts can therefore run substantial parts of the ruler/economy/ownership steps inline. `reform` itself is shared, but its call timing depends on which caller reached coronation.

**General replacement:** steps produce typed changes or lifecycle requests, then apply them at explicit boundaries through the shared mutation functions. Document whether a scheduled event affects this season's income, decisions or next season. Keep genuinely immediate effects only as explicit transaction semantics.

### 5C. A pending player succession stops the next call, not the current season — adds an edge case

**Locations:** `src/sim.js:149,166,942,967–976,988–990`; `chooseHeir:130–133`; `offerAdvances:919–925`; UI wrappers `src/ui/map.js:148–150`, `src/ui/main.js:22`.

When any in-season step creates `S.pending`, the rest of that season continues. The old ruler remains attached until the user chooses, so later decisions and formulas can still read him after his reign-ending maluses were applied. A second attempt to end his reign is simply ignored at `149`. The date advances before the UI sees the pause. This is different from the immediate AI crown, and is not a necessary consequence of the deliberate rule that the player chooses heirs.

**General replacement:** a resumable season cursor, or a boundary that completes the reign transition before later steps consume the ruler. Pause at that boundary, resolve the choice, then resume the same season. One pending-choice mechanism can serve both heirs and advances.

### 5D. Temporary snapshots and caches have implicit lifetimes — adds an edge case

**Locations:** `src/sim.js:210–212,324–342,347–350,671,914,943,966`; consumers of leader at `src/ui/map.js:109`, `src/ui/panel.js:146,193`.

`S.leader` is refreshed before events, construction, decisions, combat and revolts change income or existence, then retained for intervention rules and UI. It is initially absent until the first step. If its value is meant to be the opening-of-season leader, that snapshot meaning is unstated in the field. `RISK` is keyed only by tag/rounded extra army/extra ally; it is reset by `decide` and advance acquisition, but not by the other mutations on which forecasts depend. Calling the exposed `S.considerations` or `S.riskOf` outside that reset discipline can reuse old results. `OWN` depends on every ownership writer remembering a separate invalidation; 4A shows that obligation in the birth path.

**General replacement:** pass a named season snapshot to steps that deliberately use it, use a decision-local forecast cache, and make ownership mutation own its invalidation. Derive the UI leader from current state, or explicitly label/use a completed-season snapshot. Do not rely on the last caller leaving a useful cache behind.

### 5E. Budget and end-of-age history straddle different boundaries — adds an edge case

**Locations:** `src/sim.js:948–949,650,977–980`; `src/ui/panel.js:159–168,227–229`.

The ledger captures `c.spent` from the previous decisions and resets it before current decisions; the panel combines that ledger with current `didThisSeason`. Other gold transactions are absent (4C). At the end of the age, autumn history is captured before armistice transfers, while the final score/ambitions are computed after them. The last history sample can therefore describe a different world from the closing results.

**General replacement:** open a season ledger before its transactions and finalize it after them; store dated income/action records together. Settle terminal changes before recording the final history/score snapshot, or explicitly keep separate pre-armistice and post-armistice snapshots.

### 5F. Nation creation and advance delivery use different calendar boundaries — adds an edge case

**Locations:** birth ordering in 4D; `src/sim.js:132–133,188,287–289,919–925,988–1001`.

Advances are offered on entering a date, during initialization, and after resolving an heir. Nations born later in that scheduled season do not pass through the same offer call. The content says no retrospective offers; whether birth within the still-current scheduled season counts is a boundary choice the caller arrangement currently decides. `S.ready` also controls whether the constructor crowns immediately, creating the broken birth ordering in 4D.

**General replacement:** one season-entry delivery boundary with an explicit eligibility snapshot, and one complete birth transaction. Express the no-catch-up rule in that boundary instead of retrying delivery from unrelated choice handlers.

## 6. Fix the rule, not the case

These are conditions that warrant examination, not claims about how a past bug was fixed. Git history was not used to infer authors' motives. Ordinary guards for an empty selection, invalid player input or a genuinely absent neighbour are not automatically patches.

### 6A. Initialization and restoration have accumulated separate repair conditions — breaks the juggle test

**Locations:** `src/sim.js:188,287–289,729–738,997–1000`; see 4D and 5F.

`S.ready` selects a different constructor lifecycle; the opening player gets a stand-in; restoration manually preserves three fields; a player opening also burns a tag-dependent number of random draws. The first of these already causes lost newborn grants. The others make extending persistent country state or player restoration require remembering another exception.

**General replacement:** complete nation birth/restore policies, explicit retained state, and separate deterministic random streams for world setup and player offer generation. Preserve the deliberate player choice and country-dependent offers without altering a shared world RNG through a tag checksum.

### 6B. Succession guards compensate for the absence of a transition boundary — adds an edge case

**Locations:** `src/sim.js:148–149,165–167,503–504,932,937–938,989`; see 4B and 5C.

The old-ruler/dead-country guard, pending-player early return, no-random-crisis-after-revolution condition, and last-season abdication suppression are scattered across callers. Advance choice and progress separately guard dead players; the end of `step` clears their pending choice. Some represent real design rules, but the lifecycle contract is spread over the simulation rather than stated once.

**General replacement:** a transition table for reign causes and a central pending-choice lifecycle, including terminal-date and nation-extinction outcomes. Apply “no new ruler choice after the age ends” at the terminal boundary instead of inside war settlement alone. Keep the revolution/coup rules explicit if desired.

### 6C. Great War is constructed as a special war and then repaired — adds an edge case

**Locations:** `src/sim.js:394,503,530,863–884`; especially `864,868,878–880`.

The scenario marks itself fired before finding a pair, falls back to a non-border goal when necessary, calls ordinary declaration (including ordinary ally rolls/logs), then replaces its participant lists. Great-war-specific victory thresholds and limits are legitimate policy values; rebuilding sides and bypassing teardown are additional paths. If no suitable pair exists, the flag has already consumed the opportunity. The later-year date test also compares year and quarter separately rather than comparing a single season index.

**General replacement:** resolve a scenario specification first, validate it, then call one war constructor/closer with explicit side and settlement policies. Mark the scenario complete only under its declared success/no-target policy. Compare due dates as one season index. The fixed summer-1914 scenario and autumn-1918 endpoint remain settled design.

### 6D. Ruler gifts need local empty-realm guards because birth is incomplete — adds an edge case

**Locations:** `src/sim.js:104–105,114–115`; cause at `188,731–737`.

Capital/random-factory grants test `mine.length`; province grants break when there is no border. Those are necessary for genuinely targetless grants, which the design explicitly wastes, but they also mask the newborn-ordering error. Adding more “unless this nation is new” guards would preserve the wrong lifecycle.

**General replacement:** fix the birth transaction first; have all grants select targets through the same selector and return a declared no-target result. Keep wasted grants where there truly is no eligible target.

### 6E. Rebellion restoration and peace have structural guards that should belong to shared policies — adds an edge case

**Locations:** `src/sim.js:468,471,474,488,498,508–509,720,724–727,736,765,771,779`.

Peace repeatedly checks whether participants remain alive after transfers; revolt code distinguishes fallen home, living kin, an already-live uprising nation, and a new/restored group; unification rechecks `done` inside a loop whose earlier iteration may set it. These are understandable responses to mutating collections while traversing them. They become extra caller obligations when the same operations have several implementations.

**General replacement:** resolve eligible actors and land in a transaction plan, apply it, then reconcile nation/war/union lifecycle once. Put the settled uprising precedence and treaty eligibility in named policies. A branch implementing “restore the fallen nation of the same people” is not itself an unwanted historical exception.

### 6F. The Papal refusal is a one-entry optional flag, although the behavior is deliberate — adds an edge case

**Locations:** `content/nations.json:246–257`; `src/sim.js:186,625,779`; `src/ui/almanac.js:50`.

`noAnnex` is only present for PAP, rather than a field every nation carries. The engine already reads the field generically, which is good. The remaining issue is the optional representation, not a reason to let the Papal States unite Italy or join a union.

**General replacement:** require a boolean `noAnnex` or `joinsUnions` on every nation and validate it. Keep the chosen historical refusal.

## 7. The juggle test

Every experiment started from a fresh scratch copy of the audited checkout's `src`, `tools`, `content`, `map`, `assets` and package files. Each ran **both** `npm run build` and `npm run chronicle -- 1`, independently of whether the build succeeded. Node was `v24.22.2`. No map was silently regenerated to make a build pass. The separate map-builder probe below used the installed dependencies read through a scratch symlink and wrote only in the scratch directory. Builds include check.js, the two existing test files, and HTML assembly; a test-runner failure is explicitly distinguished from a clear check.js error.

The unmodified control passed all **24 tests**, built the HTML, and finished at **1918 Autumn**. Its final leaders were France 249, Kingdom of Italy 165, Russia 142 and Great Britain 97 gold a year (rounded by the tool). Successful completion is not evidence that every mutation was exercised; the result column states those limits.

| Scratch change | `npm run build` | `npm run chronicle -- 1` | Classification and source |
|---|---|---|---|
| Delete trait `flirt` without repairing its references | Clear consistency errors: its rulebook reference, leftover emblem and unused effects | Finishes | **Expected rejection**, not a new finding: existing Rule 1 controls. `tools/check.js:162,176,178,223`. |
| Rename `flirt → charmer` throughout content, including placeholders | Clear consistency errors: new emblem missing, old emblem surplus | Finishes | **Content-only rename still needs code** (1B). Engine trait selection is generic. |
| Add `inventor`, copying Builder but using the already-implemented `integrateOther` main effect with values `[1.1,1.2,1.3]` and corresponding wording | One clear error: `inventor` has no emblem | Finishes | **Content-only addition still needs code** (1B/3A). An exploratory version using `targetFight` instead also hit only the emblem gate; the non-targeted version removes that ambiguity. |
| Add `secondHarvest`, a harvest copy named “Lean season” | Clear errors: event never run; its season/chance/unrest ignored | Finishes with the **same full dated chronicle and final line as the control** | **Quietly ignored if run directly; safely rejected by build**, but requires code to add an ordinary existing mechanic (1A/3A). The headless loader does not invoke the check. |
| Delete `railway` | Clear missing-`EV.railway` errors | Crashes reading absent event's `from` | **Expected build rejection**. Demonstrates that direct chronicle is not a validated build, not an additional unchecked-build finding. |
| Swap the complete springtime and harvest payloads, keeping their keys | Clear missing/read-nowhere `year` and `chance` errors | Finishes; neither handler performs the moved schedule/effect as the record intends | **Safely rejected by build**, but confirms behavior belongs to the ID's code, not the moved record (1A/2B). |
| Rename starting nation `FRA → XFR` throughout content | check.js passes; regression tests fail with undefined-country TypeErrors | Finishes | **Breaks the juggle test in tooling**, not the shipping engine (1D). |
| Exchange BEL and ALB's starting roles: BEL becomes nonstarting without an army; ALB starts with army 8 and receives BEL's province | Passes all tests and builds | Finishes | **Successful juggle**. The generic starting-nation path handles these entries. It changes the world as intended. |
| Rename uprising nation `UKR → XUK` throughout content | Passes all tests and builds | Finishes; full dated chronicle/final line match control | **Successful engine juggle**; separately loading `tools/sweep.js` throws reading the missing `UKR` name (1D). |
| Delete nonstarting `ALB` | Passes all tests and builds | Finishes | **Successful removal**. Seed one does not prove every Albanian-uprising outcome, but no stale code reference blocks deletion. |
| Add nonstarting `NEW`, based on ALB with the existing `swiss` people, Survive ambition and a new name/adjective | Passes all tests and builds | Finishes | **Successful addition**. No claim is made that NEW actually arose in this seed. An initial exploratory variant used nonexistent `belarusian`: build correctly reported the missing people reference; its direct chronicle still completed. That variant is an ordinary invalid-reference control. |
| Rename union `ger → germany` and update content references | Passes all tests and builds | Finishes; full dated chronicle/final line match control | **Successful union rename**. No production code names `ger`. |
| Add union `alb`, based on the Hungarian definition but with Albanian people, province `alb`, need 1, new title/adjective/prefix; give ALB that ambition | Passes all tests and builds | Finishes | **Successful union addition**. This seed does not prove proclamation of the added union. |
| Rename only ambition entry `survive → persist`, updating nation ambition references but leaving mechanic kind `survive` intact | Passes all tests and builds | Finishes | **Unexercised fallback dependency** (1C): the seed-one final state contains no missing ambition IDs, but the code still emits `id: 'survive'` on the fallback paths. Do not count this run as an observed wrong world. |
| Broader exploratory text substitution `survive → survival` across all JSON, also changing the mechanic kind and prose | Clear consistency rejection on the required “survive ruler” wording | Crashes later reading an absent ambition's `pset` | **Invalid control**, not evidence that merely renaming an entry causes that crash. |
| Exchange the positions of `mos` and `por` entries without rebuilding geometry | Clear stale-map error | Finishes | **Expected build rejection**. Direct execution attaches Moscow to Portugal's coast/neighbours and vice versa because `src/sim.js:66–68` joins by position. Already covered by Rule 1/map fingerprint; not a new finding. |
| Add province `new`, copied from Paris with a new name and coordinates `(3,48)` | Clear stale-map and 76-shapes-for-77-provinces errors | Crashes reading absent geometry's `coast` | **Expected build rejection**, not a new finding. |
| Rename province `ana → anatolia` throughout content | Clear stale-map error | Finishes using the unchanged positional map | Ordinary build guard works. **Additionally**, running the scratch map builder crashes at `map/build-map.js:109` on absent `regions[-1].mp`: this is the unhandled content identity in 1E. |
| Give FRA `rulerNames: []` | Passes all 24 tests and builds | Finishes, but seven log lines contain `undefined` rulers; the first is “undefined I the Reformer” in 1859 Autumn | **Accepted, quietly broken output** (7A below). |
| Keep only the starting way of war | check.js passes; full-game regression crashes reading `nx.name` | Same runtime TypeError | **No clear check for an empty candidate pool** (7B below). |
| Keep the starting way of war and one alternative | check.js passes; full-game regression crashes reading `nx.name` after a later revolution | Same runtime TypeError | **No clear check for the next empty candidate pool** (7B). |
| Add nonstarting ALB to FRA's initial `allies` | check.js passes; regression tests crash reading an undefined country's `allies` | Same initialization crash | **Valid reference, invalid lifecycle state not checked** (7C below). |

### 7A. Empty override lists defeat the ruler-name guarantee — breaks the juggle test

**Locations:** `tools/check.js:287`; `src/sim.js:61,82,87`; `content/nations.json:257` is the existing override example.

The checker accepts any truthy `rulerNames`, including an empty array. `namesOf` also chooses that array over a valid people's names; drawing a name produces `undefined`. This is not a request for another FRA-specific guard.

**General replacement:** an explicit uniform name-pool policy and one resolved, nonempty `names` list. Validate arrays as arrays of nonempty strings and validate the resolved pool before simulation creation.

### 7B. Ways of war can leave the revolution selector empty — breaks the juggle test

**Locations:** `tools/check.js:128`; `src/sim.js:31,827–829`; `content/eras.json:2–6`.

The check requires exactly one starting era but no viable transition set. Revolution excludes both the starting era and the current era. One era fails on the first revolution; two eras fail on the next. Neither produces a clear content diagnostic, although the existing full-game test happens to catch them by crashing.

**General replacement:** a general `nextEra` policy over validated candidates, with a declared empty-pool result. If the policy must retain those exclusions and always transition, validate at least two nonstarting candidates (three eras total). Alternatively, allow the starting era to return and define a one-era revolution as a no-op. The historical/chronological choice belongs in data/policy, not a special era-ID exception.

### 7C. Starting diplomatic references need starting participants, not merely existing entries — breaks the juggle test

**Locations:** `tools/check.js:107`; `src/sim.js:191,204–206`.

Nation-reference validation only checks that an ally exists in the content table. Setup installs only starting nations in `S.C`; `ally` immediately dereferences both participants. A nonstarting ally is therefore accepted content that crashes before a world exists. Initial `relations` to an unborn nation are likewise accepted but stored before the nation exists, then replaced when it is born (`739`); their meaning is unstated rather than executed consistently.

**General replacement:** validate initial diplomacy against the initial living set, or define a uniform deferred-diplomacy policy for all nations. Report the precise entry and field before creating state. This is a lifecycle-reference check missing from the existing Rule 1 reference check, not another missing-tag report.

The separate forced-coronation probe in 4D used the real `revolts` path, with deterministic Builder/Rare rulers and a deliberately weak garrison. It is a targeted lifecycle reproduction, not a naturally occurring seed-one result. No claim about its frequency is made. The scratch experiments do not establish balance or prove every possible content permutation safe.

## What check.js could enforce

These checks would add Rule 2 guarantees rather than repeat the existing prose/reference/map checks:

| Findings | Enforceable build error | Detection |
|---|---|---|
| 1A–1E, 3A–3C | Code names a content entry or has an untracked per-entry table | Parse JavaScript and match literal comparisons, member lookups, map/list keys, regex literals and default arguments against content IDs **and aliases**. Include tools and the content-touching map builder. A narrow explicit allowance for synthetic fixtures/art definitions is preferable to pretending all strings are prose. For added-then-renamed IDs, also run a rename metamorphic check so an old, now-absent ID cannot disappear from detection. |
| 2A–2F | Entries differ in required shape or use forbidden optional defaults | Define full schemas for each real kind, recursively validate exact keys/types, and require neutral fields. Check JavaScript content reads for optional chaining and existence-default expressions where the schema promises a field. Do not ban validation of input or true boolean feature tests. Replace the current prohibition on neutral fields for nonstarting nations (`109`) and on `targeted: false` (`291`) when adopting those schemas. |
| 1A, 2B, 3A | Event contains an unknown operation, invalid selector or unexecutable schedule | Validate operation names/arguments against one general operation registry, then validate target reference types and repeat scope. Enumerate/run the event table rather than requiring a hand-written handler for each ID. An event ID must not select its implementation. |
| 1C | Missing or ambiguous fallback ambition | Require exactly one declared fallback or validate `rules.defaultAmbition`; derive runtime fallback IDs from it. Construct a restored richest nation and a newborn whose union was already proclaimed in a small smoke fixture. Assert every produced ambition ID exists. |
| 1B, 3C | Art reference missing | Validate the entry's art reference; allow reuse if that is the chosen policy. No requirement for an additional trait-ID key in JavaScript. Existing checks already catch today's missing/extra emblems; the new guarantee is independence of identity. |
| 4A–4G | State mutation outside its owner | AST-check assignments/updates to owner, alive, ruler, treasury, unrest and the wars collection. Permit only the shared mutation functions and clearly designated initial-fixture constructors. A source regex alone will miss aliases and nested writes. |
| 4D, 5C, 6A–6B | Birth or succession runs in an incomplete world | Build a tiny synthetic world; apply setup, independent birth, restoration, terminal death and pending player succession. Assert land/registry/diplomacy exist before coronation, grants happen once, and no later season phase executes with an unresolved reign transition. These probes can be invoked from the build check without depending on France or Albania. |
| 5A–5F | Step performs a forbidden mutation, stale cache escapes, or snapshots straddle settlement | In a debug simulation, label each step and instrument shared mutation functions with allowed phase/cause sets. Keep forecast caches local or versioned. Assert completed ledgers balance treasury changes and the final history snapshot matches the post-settlement world. Timing policy still needs a human decision first. |
| 7A | Empty/invalid effective ruler-name pool | Validate array type, nonempty strings and the resolved override/inheritance result, not truthiness. This closes a demonstrated hole in an existing check. |
| 7B | No viable military-era successor | Compute the candidate set for every reachable era under the declared transition policy. Reject an empty set with an entry-specific message, unless the policy explicitly permits a no-op. |
| 7C | Opening diplomacy points to a nation not yet alive | Check `allies` and opening `relations` against `starts`, or validate a declared deferred policy. Do this before `createSim`. |
| All seven rules | A valid content permutation crashes or silently changes its meaning | In temporary directories, add/delete/rename/reorder representative entries, update legitimate references, and run the full build and a bounded deterministic game. Compare renamed worlds after translating IDs back; assert finite state, valid owners/ambitions, nonempty ruler names and no `undefined`/`NaN` in actual chronicles and live UI. Distinguish deliberate world changes from rename-only equivalence. Preserve a clear diagnostic for invalid edits. |

The existing `check.js:344–365` renders Almanac pages with `S = null`; it does not validate every live nation, actual ruler name or possible event target. The existing build tests catch some gaps as TypeErrors, but that is less useful than the promised content-file/entry diagnostic. `tools/chronicle.js:2–5` and `tools/load.js:8–12` also load/run content without invoking the check; a shared validation entry point would make headless tools fail clearly too, without duplicating checks or writing generated files.

## Judgement calls

- **Historical differences should survive the cleanup.** Unifiers, accepted peoples, serfdom and Papal refusal are explicitly allowed design inputs. Unifiers and accepted peoples are already mostly data-driven. The findings concern optional shape and the event-based nation comparison, not whether these histories should exist. A required flag or policy on every relevant entry satisfies Rule 2 without changing the chosen world.
- **The three ambition kinds are settled mechanics.** Checks for `richest`, `unite` and `survive` in `src/sim.js:269–271,754–803,982–985`, `src/ui/panel.js:91–110,140,281–287`, `src/ui/almanac.js:69`, `tools/sweep.js:20–22`, and `tools/check.js:117` implement that design. They are not per-union exceptions. Requiring a fourth mechanic to need no code would conflict with the settled scope; requiring another *union entry* to need no code is appropriate. The fallback entry ID in 1C is a different issue.
- **Art may remain authored code.** The interface rules explicitly centralize drawings in the registry. Moving SVG into content is not necessary. Decide whether distinct art for each trait/advance is worth an acknowledged content-addition exception, or whether reusable art references are acceptable. The latter removes most compulsory code edits while preserving the registry.
- **Five rarities and three heirs are deliberate.** `tools/check.js:179–187` and the card design constrain the game on purpose. The audit does not recommend adding arbitrary rarity tiers, changing the strength mapping or removing required three-way choices. The cosmetic position coupling in 1F and fixed content fixture dependencies are separable issues.
- **Different kinds need not be forced into a giant record.** Union and non-union ambition schemas, iconless words and drawn concepts, and different operation kinds can reasonably have distinct validated shapes. What should disappear is consumers guessing the kind by absent fields. Sparse collections of effect contributions may also be preferable to storing every neutral value on every ruler; keeping that exception inside one resolver is substantially better than testing it throughout consumers.
- **Immediate effects can be a policy.** Wars ending reigns, coups preceding decisions, uprisings transferring land and coronation gifts ending nations are part of the design. A change queue is one possible step boundary, not a demand to delay every effect. The required improvement is an explicit, shared transaction/boundary, particularly when a player choice interrupts it.
- **A grant with no target really is wasted.** Keep that rule. The newborn factory probe is about a target that exists after the birth transaction but is absent when the premature coronation runs. Fixing that order does not require inventing refunds or deferred grants.
- **Some guards express rules, not patches.** Empty-side wars, fallen-nation restoration, limits on reachable conquest, refusal to annex majors, and the special army-chosen coup successor have real meanings. Decide their policies, then centralize them. Removing every `if` would not make the system plainer. The extinction policy for end-of-reign effects and player restoration choices deserves a decision rather than an accidental call to `endReign`.
- **Named historical regression scenarios can be useful.** Keep them if their role is to preserve a particular scenario. They should not make an identity-only rename fail the generic build. Synthetic tests and separate balance scenarios can coexist.
- **Terminal history and scheduled-season births need declared timing.** Decide whether the final chart should show pre- or post-armistice income, and whether a nation born during an advance season is eligible for that season's offer. The current answer follows call order. These are policy choices; neither should be silently changed as a “trivial” refactor.
