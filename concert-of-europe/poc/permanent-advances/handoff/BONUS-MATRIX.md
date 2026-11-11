# Approved starting bonus matrix

User-approved starting values, 11 November 2026. This is the human-readable companion to approved-values.json. Values have been arithmetically checked; balance simulation remains required.

All thirty advances retain their proposed identities and eligibility. Every card has one or two effects. War Ministry is reduced to fighting strength and army upkeep; its planning and integration bonuses are removed. The proposed values are smaller to account for permanent stacking and shared access by all nations. Rarity strengthens the same effects. No extra effects, penalties, one-time grants, upgrades or duplicates are introduced by rarity. Rarity never increases a card’s effect count.

## Agreed rarity rules

Reuse the existing names and colours. The following draw odds reuse the ruler odds and have been agreed.

| Rarity | Chance per offered card | Strength relative to Rare |
|---|---:|---:|
| Common | 46% | 0.5× |
| Uncommon | 30% | 0.75× |
| Rare | 15% | 1× |
| Epic | 8% | 1.25× |
| Legendary | 1% | 1.5× |

Each of the three offered cards draws its rarity independently. The same odds apply to every nation. Card identity is chosen from the eligible pool separately from rarity. A nation can acquire each advance once, regardless of rarity; it cannot upgrade an owned advance by drawing a rarer copy. The player chooses one offered card; AI nations choose randomly. These draw details have been agreed; offers contain one Military, one Economy and one Government advance.

## How to read the matrix

A plus percentage means more strength, earnings, reform effectiveness or integration speed. A minus percentage means lower costs or casualties. Years are added to the planning horizon. For example, +48% integration speed means a ×1.48 speed multiplier, not 48% less time. Combat bonuses change effectiveness, not army headcount. All earnings means taxes, factory output and sea trade, before subtracting upkeep.

Percent modifiers multiply with other advances and the ruler. Planning years add. Conditional effects apply only in the named circumstances; they must not be displayed as global bonuses.

## Military

| Advance | Effect | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---:|---:|---:|---:|---:|
| General Staff | Fighting strength | +10% | +15% | +20% | +25% | +30% |
| ↳ | Battle casualties | −8% | −12% | −16% | −20% | −24% |
| Rifled Artillery | Fighting strength | +16% | +24% | +32% | +40% | +48% |
| Army Medical Corps | Fighting strength | +4% | +6% | +8% | +10% | +12% |
| ↳ | Battle casualties | −16% | −24% | −32% | −40% | −48% |
| Campaign Administration | Fighting strength | +6% | +9% | +12% | +15% | +18% |
| ↳ | Conquest integration speed | +16% | +24% | +32% | +40% | +48% |
| Border War College | Fighting strength vs named neighbour only | +24% | +36% | +48% | +60% | +72% |
| ↳ | Battle casualties | −4% | −6% | −8% | −10% | −12% |
| National Defence | Fighting strength in wars over national land | +24% | +36% | +48% | +60% | +72% |
| ↳ | Fortress construction cost | −12% | −18% | −24% | −30% | −36% |
| Frontier Engineers | Fortress construction cost | −20% | −30% | −40% | −50% | −60% |
| ↳ | Fighting strength | +4% | +6% | +8% | +10% | +12% |
| Staff Colleges | Planning horizon | +2 yr | +3 yr | +4 yr | +5 yr | +6 yr |
| ↳ | Fighting strength | +8% | +12% | +16% | +20% | +24% |
| Expeditionary Service | Fighting strength | +10% | +15% | +20% | +25% | +30% |
| ↳ | Integration speed for other peoples’ provinces | +24% | +36% | +48% | +60% | +72% |
| War Ministry | Fighting strength | +6% | +9% | +12% | +15% | +18% |
| ↳ | Army upkeep | −12% | −18% | −24% | −30% | −36% |

## Economy

| Advance | Effect | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---:|---:|---:|---:|---:|
| Machine Tools | Factory construction cost | −14% | −21% | −28% | −35% | −42% |
| Steam Shipping | Sea trade earnings | +24% | +36% | +48% | +60% | +72% |
| Industrial Credit | Factory construction cost | −8% | −12% | −16% | −20% | −24% |
| ↳ | Planning horizon | +2 yr | +3 yr | +4 yr | +5 yr | +6 yr |
| Railway Procurement | Factory construction cost | −8% | −12% | −16% | −20% | −24% |
| ↳ | Fortress construction cost | −12% | −18% | −24% | −30% | −36% |
| Merchant Banks | Sea trade earnings | +12% | +18% | +24% | +30% | +36% |
| ↳ | Taxes | +8% | +12% | +16% | +20% | +24% |
| Industrial Standards | All earnings | +4% | +6% | +8% | +10% | +12% |
| ↳ | Factory construction cost | −6% | −9% | −12% | −15% | −18% |
| Export Houses | Sea trade earnings | +12% | +18% | +24% | +30% | +36% |
| ↳ | Conquest integration speed | +8% | +12% | +16% | +20% | +24% |
| Land Survey | Taxes | +20% | +30% | +40% | +50% | +60% |
| Domestic Markets | Accepted peoples’ taxes | +24% | +36% | +48% | +60% | +72% |
| ↳ | Factory construction cost | −4% | −6% | −8% | −10% | −12% |
| Precision Engineering | Factory construction cost | −8% | −12% | −16% | −20% | −24% |
| ↳ | Fighting strength | +6% | +9% | +12% | +15% | +18% |

## Government

| Advance | Effect | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---:|---:|---:|---:|---:|
| Professional Civil Service | All earnings | +6% | +9% | +12% | +15% | +18% |
| Parliamentary Procedure | Reform cost | −18% | −27% | −36% | −45% | −54% |
| Public Institutions | Unrest removed by reforms | +32% | +48% | +64% | +80% | +96% |
| Regional Administration | Conquest integration speed | +24% | +36% | +48% | +60% | +72% |
| Provincial Rights | Integration speed for other peoples’ provinces | +32% | +48% | +64% | +80% | +96% |
| ↳ | Unrest removed by reforms | +8% | +12% | +16% | +20% | +24% |
| Public Accounts | Taxes | +8% | +12% | +16% | +20% | +24% |
| ↳ | Reform cost | −10% | −15% | −20% | −25% | −30% |
| National Schools | Planning horizon | +2 yr | +3 yr | +4 yr | +5 yr | +6 yr |
| ↳ | Accepted peoples’ taxes | +10% | +15% | +20% | +25% | +30% |
| Technical Universities | Planning horizon | +2 yr | +3 yr | +4 yr | +5 yr | +6 yr |
| ↳ | All earnings | +2% | +3% | +4% | +5% | +6% |
| Civic Mediation | Reform cost | −10% | −15% | −20% | −25% | −30% |
| ↳ | Unrest removed by reforms | +16% | +24% | +32% | +40% | +48% |
| Consular Service | Conquest integration speed | +12% | +18% | +24% | +30% | +36% |
| ↳ | Sea trade earnings | +8% | +12% | +16% | +20% | +24% |

## Eligibility and targeting

The POC's existing filters are retained for this proposal:

- A coast is required for Steam Shipping, Merchant Banks, Export Houses and Consular Service.
- A neighbouring nation is required for Campaign Administration, National Defence, Frontier Engineers, Expeditionary Service, Regional Administration and Provincial Rights.
- Border War College requires a living neighbouring non-ally. Its target is fixed when offered and named on the card. The existing choice prefers a neighbouring rival, otherwise the strongest neighbouring non-ally. Its fighting bonus applies against that target; its casualty reduction applies in all wars.
- National Defence's fighting bonus applies in wars whose goal is a province belonging to the nation's core land. It can help defend or recover such land; it is not a general bonus against every opponent.
- General and foreign-province integration multipliers both apply when a conquered province belongs to an unaccepted people and is not the nation's core land. Existing accepted/core handling remains unchanged.

## Combination stress checks

These are arithmetic upper bounds for up to seven different advances of one rarity. They ignore offer probability, timing and the competing benefits sacrificed by taking those combinations. They exclude ruler bonuses and are not claims about typical play or balance.

| Modifier | Seven-choice Common extreme | Seven-choice Rare extreme | Seven-choice Legendary extreme |
|---|---:|---:|---:|
| General fighting strength | 1.805× | 3.098× | 5.096× |
| Factory construction price | 0.604× | 0.345× | 0.184× |
| Additional planning years | +8 years | +16 years | +24 years |
| Foreign-province integration speed | 2.848× | 6.821× | 14.472× |

The highest planning stack and specialised fighting/integration stacks deserve particular scrutiny during balance validation. A permanent planning modifier also changes civilian investment forecasts and how many years of army costs are counted. This draft does not establish that its military cards still create enough visible decisions after reducing POC strengths.

## Review and implementation boundary

The matrix values and rarity/draw rules have been accepted. Behavioural trials and the required forty-world comparisons remain necessary under the agreed rules. The approved implementation scope is recorded in ../PRODUCTION-SPEC.md; this matrix alone is not a gameplay implementation. Detailed combined-bonus visibility remains deferred.

## Sources

- Card identities originate from the POC pool; the approved numerical source for implementation is sibling `approved-values.json`, which supersedes the POC strengths.
- Existing rarity names, colours and odds: main-game `content/rarities.json`.
- Agreed discussion: permanent unique advances, shared access, multiplicative percentage modifiers and additive planning years.
