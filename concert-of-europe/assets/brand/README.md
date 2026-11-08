# Concert of Europe branding

The approved congress-table identity has two levels of detail:

- `congress-table.png`: transparent source of the title emblem, extracted with built-in ImageGen from the approved v2 proof. Five different chair backs surround the map. The prompt is in `production-prompt.txt`.
- `congress-table.webp`: the shipping title image, 960 × 640, encoded from that source with `cwebp -q 88 -alpha_q 100 -m 6 -metadata none -resize 960 640 congress-table.png -o congress-table.webp`.
- `congress-table-small.svg`: the menu mark, with the same simple chair-back outline repeated five times.
- `favicon.svg`: the small mark on a square charcoal background.
- `favicon-16.png`, `favicon-32.png`, `favicon-96.png`: raster proofs rendered from the SVG at actual size. The 32-pixel version is embedded as a fallback icon alongside the SVG.

`tools/build.js` embeds the shipping assets as data URLs in the generated game, so branding needs no extra requests and the game remains a single HTML file. The title and menu words remain accessible native text in the existing display font.

Original concept proofs and their prompts are preserved in `design/logo-drafts/`.
