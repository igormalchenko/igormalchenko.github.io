# Permanent Advances — isolated playable POC

**Production handoff:** start with [PRODUCTION-SPEC.md](PRODUCTION-SPEC.md), then its `handoff/` attachments. The approved production rules, strengths and UI supersede this playable experiment. Implement against the current main game; do not copy the POC engine over it.

Open `index.html` in a browser. It is fully self-contained; no server, installation, parent files, or internet connection is needed for the game (web fonts are optional).

Choose a country and a ruler, then choose one of three permanent advances. More choices arrive in 1848, 1860, 1872, 1884, 1896 and 1908. Bonuses survive succession and feed into the same economic and military forecasts that drive the ministers. Each card previews its current influence on their plans. Chosen advances and the next choice date appear in the nation panel and the National advances button beside the speed controls.

This is an exploratory player-only advantage layer. Other nations retain their original rules. Offers mix military, economic and government directions, omit already chosen advances, and condition shipping and border cards on geography. A war-college card targets a living neighbouring non-ally and affects both forecasts and battles against that country. There is no direct order to attack, build or reform. No save system is added.

Everything needed to play, rebuild and test lives in this folder. Nothing reads or writes the parent game.

- `npm run build`: check and rebuild this folder’s `index.html`.
- `npm test`: advance lifecycle, permanence, forecast and combat checks, plus headless playthroughs.
- `content/advances.json`: the experimental card pool and offer years.

The original game files were copied into this folder and only these copies were changed.

## Card refresh

The pool now contains 30 cards: ten military/defence, ten industry/commerce, and ten government cards. Standalone recruitment and upkeep discounts were retired. Military offers instead use existing victory-odds, casualty, integration and planning calculations. Civilian offers include specialised and mixed benefits. Every bonus uses an existing effect; no governor or UI source was changed for this refresh. These are deliberately noticeable POC values, with balance left for playtesting. A card changes the calculation; circumstances can still leave the next action unchanged.

The dates, three-card offers, permanent stacking, previews, geography filters and seven choices remain the same. Start a new game to use the refreshed pool; a game already open in a browser keeps its loaded copy.
