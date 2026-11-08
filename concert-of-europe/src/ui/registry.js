// ---------- the registry: every concept the player sees, once ----------
// Each concept is one thing in the game with one name, one line of description and one drawing.
// Names, descriptions and the words to avoid live in content/concepts.json; the drawings live here,
// under the same keys. The panel, the map, the map key, the Almanac and every tooltip draw from REG;
// `npm run build` refuses drawings made anywhere else and the avoided words in any visible text.
//   draw   SVG centred on 0,0
//   box    half the width of the square the drawing fills (panel icons are scaled to fit it)
//   map    scale when drawn on the map (only for things the map shows)
const INK = '#f3efe4', DARK = '#111';
const P = s => `<g transform="translate(-8 -8)">${s}</g>`; // drawings made on a 0..16 grid
const DRAW = {
  // ----- money -----
  gold: { draw: P('<circle cx="5.3" cy="6" r="2" fill="#e9c35a" stroke="#8a6a1c" stroke-width=".8"/><circle cx="10.7" cy="6" r="2" fill="#e9c35a" stroke="#8a6a1c" stroke-width=".8"/><circle cx="8" cy="4.6" r="2.1" fill="#e9c35a" stroke="#8a6a1c" stroke-width=".8"/><path d="M3.4 8c-1.3 1.1-1.8 2.6-1.4 4 .5 1.7 2.6 2.6 6 2.6s5.5-.9 6-2.6c.4-1.4-.1-2.9-1.4-4z" fill="#4b4038" stroke="#a8957a" stroke-linejoin="round"/><path d="M2.2 7.6h11.6" stroke="#a8957a" stroke-width="1.6" stroke-linecap="round"/>') },
  goldYear: { draw: P('<circle cx="8" cy="8" r="6" fill="#e9c35a" stroke="#8a6a1c" stroke-width="1.2"/><path d="M8 4.6v6.8M6.2 6.3h2.9a1.2 1.2 0 010 2.4H7a1.2 1.2 0 000 2.4h2.9" fill="none" stroke="#8a6a1c" stroke-width="1.1"/>') },
  taxes: { draw: P('<path d="M5.2 2.2h5.6L9.6 5c3 1 4.6 4 4.2 7-.2 1.6-1.6 2.5-3.2 2.5H5.4c-1.6 0-3-.9-3.2-2.5-.4-3 1.2-6 4.2-7z" fill="#c9a45c" stroke="#5c4320" stroke-linejoin="round"/><path d="M6.4 5h3.2" stroke="#5c4320" stroke-width="1.2"/><path d="M8 7.6v5M6.6 8.8h2.1a.9.9 0 010 1.8H7.3a.9.9 0 000 1.8h2.1" fill="none" stroke="#5c4320" stroke-width=".9"/>') },
  upkeep: { draw: P('<circle cx="7" cy="8" r="5.5" fill="#d98a6a" stroke="#7a3a22" stroke-width="1.1"/><path d="M4.5 8h5" stroke="#7a3a22" stroke-width="1.6"/>') },
  trade: { draw: P('<circle cx="8" cy="3.2" r="1.7" fill="none" stroke="#6fa8dc" stroke-width="1.3"/><path d="M8 5v9.5M5 7.5h6M2.5 10c0 2.6 2.5 4.5 5.5 4.5s5.5-1.9 5.5-4.5" fill="none" stroke="#6fa8dc" stroke-width="1.4" stroke-linecap="round"/>') },
  save: { draw: P('<path d="M2.5 6.5h11v7.5h-11z" fill="#b08a4a" stroke="#5c4320"/><path d="M2 6.5L8 2l6 4.5" fill="#c9a45c" stroke="#5c4320" stroke-linejoin="round"/><circle cx="8" cy="10" r="1.6" fill="#e9c35a" stroke="#5c4320" stroke-width=".8"/>') },

  // ----- land and people -----
  province: { draw: P('<path d="M2 4.5L6 2l4.5 1.5L14 2.5v9.5L10 14l-4.5-1.5L2 14z" fill="#8fb36b" stroke="#3d5a26" stroke-width="1" stroke-linejoin="round"/><path d="M6 2v10.5M10.5 3.5V14M2 8.5l4-1 4.5 1L14 7.5" fill="none" stroke="#3d5a26" stroke-width=".8"/>') },
  capital: { box: 4,
    draw: `<circle r="2.6" fill="${INK}" stroke="${DARK}" stroke-width="1.1"/>` },
  pop: { draw: P('<circle cx="8" cy="4.6" r="2.8" fill="#e8d3b3" stroke="#6b5537"/><path d="M2.8 14.5c0-3.6 2.3-6 5.2-6s5.2 2.4 5.2 6z" fill="#d7b98d" stroke="#6b5537"/>') },
  culture: { draw: P('<path d="M2 3h12v8H7l-3.5 3v-3H2z" fill="#a8c7a0" stroke="#3f5e3a" stroke-linejoin="round"/><path d="M4.5 6h7M4.5 8.5h5" stroke="#3f5e3a"/>') },
  settle: { draw: P('<circle cx="8" cy="8" r="6.3" fill="#3a4048" stroke="#a8c7a0" stroke-width="1.3"/><path d="M8 8V1.7A6.3 6.3 0 0114.1 9.6z" fill="#a8c7a0"/>') },
  occupied: { draw: P('<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#c96b5f"/><path d="M1.5 9L9 1.5M1.5 14.5L14.5 1.5M7 14.5L14.5 7" stroke="#5e221c" stroke-width="1.6"/>') },
  sea: { box: 9,
    draw: `<line x1="-9" y1="0" x2="9" y2="0" stroke="#9fb1c2" stroke-width="1.4" stroke-dasharray="2 3"/>` },
  claim: { draw: `<path d="M-4.5 7V-7" stroke="#c9ced6" stroke-width="1.6" stroke-linecap="round"/><path d="M-3.8 -6.6h9l-2.3 3.2 2.3 3.2h-9z" fill="#d65a4d" stroke="#5e221c" stroke-width=".9" stroke-linejoin="round"/>` },

  // ----- building -----
  factory: { box: 5.5, map: 1,
    draw: `<path d="M-4.5 3.5V-.5l2.6-1.6V-.5l2.6-1.6V-.5V-4.5h1.8v8z" fill="${INK}" stroke="${DARK}" stroke-width=".7" stroke-linejoin="round"/>` },
  fort: { box: 5.5, map: 1, avoid: ['forts', 'fort'],
    draw: `<path d="M-3.5 3.5V-1.5h-1v-3h2v1.2h1.5v-1.2h2v1.2h1.5v-1.2h2v3h-1v5z" fill="#2a2f36" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>` },
  buildFactory: { box: 5.5, map: 1,
    draw: `<path d="M-4.5 3.5V-.5l2.6-1.6V-.5l2.6-1.6V-.5V-4.5h1.8v8z" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="1.4 1"/>` },
  buildFort: { box: 5.5, map: 1,
    draw: `<path d="M-3.5 3.5V-1.5h-1v-3h2v1.2h1.5v-1.2h2v1.2h1.5v-1.2h2v3h-1v5z" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="1.4 1"/>` },
  build: { draw: P('<path d="M3 15V5M3 5h10M3 5l4 0M13 5v4" stroke="#e9c35a" stroke-width="1.5" fill="none"/><path d="M11.5 9h3v2.5h-3z" fill="#e9c35a"/><path d="M1.5 15h4" stroke="#e9c35a" stroke-width="1.5"/><path d="M3 5L7 1.5" stroke="#e9c35a" stroke-width="1.2"/>') },
  ruin: { box: 6, map: 1,
    draw: `<path d="M-5 4V0l2.6-1.5V0l1.8-1 1.2 3.5 1.6-3.8.8 1.2V-4.5h2V4z" fill="#8a8f99" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/><path d="M1 -5l1.4 1.8-1.6 1.2" stroke="#e0453a" stroke-width="1.1" fill="none"/>` },
  boom: { box: 7, map: 1,
    draw: `<path d="M0 -6L4 0L0 6L-4 0z" fill="#f2c94c" stroke="${DARK}" stroke-width=".8"/><path d="M0 -3.4L2.2 0L0 3.4L-2.2 0z" fill="#fff6c9"/>` },
  reform: { draw: P('<path d="M3 2.5h8.5a1.5 1.5 0 011.5 1.5v10H4.5A1.5 1.5 0 013 12.5z" fill="#efe2bf" stroke="#7a6a3c"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="#7a6a3c"/>') },

  // ----- unrest -----
  unrest: { map: .62, avoid: ['restlessness'],
    draw: `<g style="fill:var(--uc,#e0503f)" stroke="${DARK}" stroke-width="1" stroke-linejoin="round"><path d="M-2.6 1.8V7.2h5.2V1.8z"/><rect x="-4.8" y="-6.4" width="9.6" height="9" rx="2.6"/><path d="M-1.6 -6.4v3.2M1.6 -6.4v3.2" fill="none"/><path d="M-4.8 -1.4h5a1.5 1.5 0 0 1 0 3h-4.2"/></g>` },
  uprising: { map: .85, avoid: ['revolt', 'revolts', 'rebellion'],
    draw: `<path d="M0 -7.2C2.6 -4.2 5.2 -2 5.2 1.8A5.2 5.2 0 0 1 -5.2 1.8C-5.2 -1 -3.2 -2.6 -2.6 -4.8C-1.2 -3.2 -.6 -2.2 0 -7.2z" fill="#e0453a" stroke="${DARK}" stroke-width=".9" stroke-linejoin="round"/><path d="M0 -.8C1.4 .9 2.3 1.9 2.3 3.2A2.3 2.3 0 0 1 -2.3 3.2C-2.3 1.9 -1.1 .9 0 -.8z" fill="#f2c94c"/>` },

  // ----- war -----
  army: { map: .62, avoid: ['soldiers', 'troops'],
    draw: P('<g stroke-linecap="round"><path d="M2.5 13.5L12.5 3.5" stroke="#8a5a34" stroke-width="2.4"/><path d="M12.5 3.5l2-2" stroke="#c9ced6" stroke-width="1.1"/><path d="M13.5 13.5L3.5 3.5" stroke="#8a5a34" stroke-width="2.4"/><path d="M3.5 3.5l-2-2" stroke="#c9ced6" stroke-width="1.1"/><path d="M4.2 11.8l1.6 1.6M11.8 11.8l-1.6 1.6" stroke="#4a3018" stroke-width="1.6"/></g>') },
  war: { draw: P('<path d="M13.5 2.5L5 11" stroke="#e0e3e8" stroke-width="2.2" stroke-linecap="round"/><path d="M3 9.5l3.5 3.5M2 14l2.3-2.3" stroke="#d65a4d" stroke-width="2" stroke-linecap="round"/>') },
  battle: { box: 6.5, map: 1,
    draw: `<g stroke-linecap="round"><path d="M-5 -5L5 5M5 -5L-5 5" stroke="${DARK}" stroke-width="4"/><path d="M-5 -5L5 5M5 -5L-5 5" stroke="#fff" stroke-width="1.8"/></g>` },
  front: { box: 9,
    draw: `<path d="M-9 0H9" stroke="#ff5a48" stroke-width="3" stroke-dasharray="4 2"/>` },
  goal: { box: 9,
    draw: `<rect x="-8" y="-5.5" width="16" height="11" fill="none" stroke="#d65a4d" stroke-width="1.6" stroke-dasharray="4 2"/>` },
  peace: { draw: P('<path d="M2 9c2-4 6-5 9-3.5L14.5 4 13 7.5c.5 3-2 6-6 6-2 0-4-1.5-5-4.5z" fill="#f2f4f2" stroke="#4f7a4b" stroke-width="1"/><circle cx="11.8" cy="6.4" r=".7" fill="#4f7a4b"/>') },
  dead: { draw: P('<path d="M3 7a5 5 0 0110 0v3l-1.5 1v2.5h-7V11L3 10z" fill="#d9dbe0" stroke="#4a4e55"/><circle cx="6" cy="7.6" r="1.4" fill="#2a2d32"/><circle cx="10" cy="7.6" r="1.4" fill="#2a2d32"/><path d="M7 13.5v-1.5M9 13.5v-1.5" stroke="#4a4e55"/>') },

  // ----- diplomacy -----
  ally: { draw: P('<path d="M1 8.5l3-3 3 1.5 2-1.5 3 1.5 3 3-3.5 3.5-2-1-2 1z" fill="#8bb6e0" stroke="#2f557e" stroke-width="1" stroke-linejoin="round"/>') },
  rival: { draw: P('<circle cx="8" cy="8" r="6.3" fill="#f2ece6" stroke="#8a2a20" stroke-width="1"/><circle cx="8" cy="8" r="4.2" fill="#d65a4d"/><circle cx="8" cy="8" r="2.2" fill="#f2ece6"/><circle cx="8" cy="8" r=".9" fill="#8a2a20"/>') },
  proclaim: { map: .85,
    draw: P('<path d="M8 1.2l2 4.6 5 .4-3.8 3.2 1.2 4.9L8 11.7l-4.4 2.6 1.2-4.9L1 6.2l5-.4z" fill="#e9c35a" stroke="#8a6a1c" stroke-linejoin="round"/>') },
  ambition: { draw: P('<path d="M8 14.6C4.6 14.4 2.8 11.4 3.2 3.6M8 14.6c3.4-.2 5.2-3.2 4.8-11" fill="none" stroke="#3d5a26" stroke-width=".9"/><g fill="#7fae7a" stroke="#3d5a26" stroke-width=".6"><path d="M4.4 13c-1.7-.1-2.8-1.1-3-2.6 1.5 0 2.7.9 3 2.6z"/><path d="M3 9.6C1.5 9 .8 7.8 1 6.3c1.4.5 2.1 1.8 2 3.3z"/><path d="M2.8 6.2C1.9 5 2 3.6 2.8 2.4c.9 1.1 1 2.5 0 3.8z"/><path d="M11.6 13c1.7-.1 2.8-1.1 3-2.6-1.5 0-2.7.9-3 2.6z"/><path d="M13 9.6c1.5-.6 2.2-1.8 2-3.3-1.4.5-2.1 1.8-2 3.3z"/><path d="M13.2 6.2c.9-1.2.8-2.6 0-3.8-.9 1.1-1 2.5 0 3.8z"/></g><circle cx="8" cy="14.4" r="1.1" fill="#e9c35a" stroke="#8a6a1c" stroke-width=".5"/>') },
  leader: { box: 7.5, map: 1,
    draw: `<path d="M-6 3L-6.5 -3.5L-3 -.5L0 -5L3 -.5L6.5 -3.5L6 3z" fill="#c9a45c" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/>` },

  // ----- rulers -----
  ruler: { draw: `<ellipse rx="6.2" ry="7.3" fill="#b9a3d6" stroke="#4e3f66" stroke-width="1"/><path d="M-4.2 6.2C-4 3.2 -2.6 2 -1.1 1.5C-2.3 .6 -2.8 -.9 -2.6 -2.3C-2.3 -4.3 -.8 -5.2 .6 -5C2.1 -4.8 2.9 -3.5 2.8 -2.1L3.7 -.9 2.8 -.5C2.8 .5 2.2 1.1 1.3 1.5C2.8 2 4 3.2 4.2 6.2C2.9 6.9 1.5 7.3 0 7.3S-2.9 6.9 -4.2 6.2Z" fill="#4e3f66"/>` },
  patience: { draw: P('<path d="M4 1.5h8M4 14.5h8M5 1.5c0 4 6 4.5 6 6.5s-6 2.5-6 6.5M11 1.5c0 4-6 4.5-6 6.5s6 2.5 6 6.5" fill="none" stroke="#c9a45c" stroke-width="1.3"/><path d="M6.5 13.5c.5-1.5 2.5-1.5 3 0z" fill="#c9a45c"/>') },
  thrift: { draw: P('<path d="M2 7.2V5.6C2 3.6 4.7 2.4 8 2.4s6 1.2 6 3.2v1.6z" fill="#9a6a3c" stroke="#4e3420" stroke-width="1" stroke-linejoin="round"/><rect x="2" y="7.2" width="12" height="6.6" rx=".8" fill="#7d5430" stroke="#4e3420" stroke-width="1"/><path d="M2 7.2h12" stroke="#c9a45c" stroke-width="1.2"/><rect x="6.5" y="6.3" width="3" height="3.6" rx=".6" fill="#e9c35a" stroke="#8a6a1c" stroke-width=".7"/><circle cx="8" cy="8.4" r=".55" fill="#4e3420"/>') },
  judgment: { draw: P('<path d="M1 8Q8 1.5 15 8Q8 14.5 1 8z" fill="#e6eef6" stroke="#3f6a94" stroke-width="1.1"/><circle cx="8" cy="8" r="2.6" fill="#3f6a94"/><circle cx="8.8" cy="7.2" r=".8" fill="#fff"/>') },
  forecast: { draw: P('<path d="M2 13.5h12" stroke="#97a0aa" stroke-width="1.2"/><path d="M2.5 11l3.5-3.5 2.5 2 5-5.5" fill="none" stroke="#7fae7a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 3.5h3v3" fill="none" stroke="#7fae7a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>') },
  civilWar: { box: 7.5, map: 1,
    draw: `<path d="M-7 3L-7.4 -3.5L-4 -.5L-1.6 -4.6L-.4 -2.2L-1.4 -.4L-.4 1.2L-1 3z" fill="#b9a3d6" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/><path d="M1 3L1.6 1.2L.6 -.4L1.6 -2.2L2.4 -4.6L4.6 -.5L7.4 -3.5L7 3z" fill="#b9a3d6" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/>` },
  coup: { box: 7.5, map: 1,
    draw: `<path d="M-6 3L-6.5 -3.5L-3 -.5L0 -5L3 -.5L6.5 -3.5L6 3z" fill="#b9a3d6" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/><path d="M-7 4L7 -5" stroke="${DARK}" stroke-width="2.2"/><path d="M-7 4L7 -5" stroke="#e0453a" stroke-width="1.2"/>` },

  // ----- the chronicle and the interface -----
  event: { draw: P('<path d="M8 1.5l6.8 12.5H1.2z" fill="#9aa3ad" stroke="#3a4048" stroke-linejoin="round"/><path d="M8 6v4" stroke="#1a1d22" stroke-width="1.6"/><circle cx="8" cy="12" r=".9" fill="#1a1d22"/>') },
  panel: { draw: `<rect x="-6.5" y="-5.5" width="13" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="1.5" y="-5.5" width="5" height="11" fill="currentColor" opacity=".45"/><path d="M1.5 -5.5v11" stroke="currentColor" stroke-width="1.3"/>` },
  almanac: { draw: P('<path d="M2 3.2C4 2.4 6.2 2.5 8 3.6v10.2c-1.8-1.1-4-1.2-6-.4z" fill="#efe2bf" stroke="#7a6a3c" stroke-linejoin="round"/><path d="M14 3.2c-2-.8-4.2-.7-6 .4v10.2c1.8-1.1 4-1.2 6-.4z" fill="#e2d3a8" stroke="#7a6a3c" stroke-linejoin="round"/><path d="M3.6 6h2.8M3.6 8.2h2.8M9.6 6h2.8M9.6 8.2h2.8" stroke="#7a6a3c" stroke-width=".8"/>') },
};
// every concept: its name, description and avoided words from content/concepts.json (numbers in the
// descriptions filled in from content), with its drawing from DRAW. Concepts marked `word` have no icon.
const REG = {}, WORDS = {};
Object.entries(CONTENT.concepts).forEach(([k, c]) => { const e = Object.assign({}, c, { desc: say(c.desc) }, DRAW[k] || {}); (c.word ? WORDS : REG)[k] = e; });
// ruler rarity, white to gold (content/rarities.json; TIER[0] is Common)
const TIER = CONTENT.rarities;
// ruler quirk emblems, drawn inside a round badge (names and descriptions come from content/rulers.json)
const EMB = {
  warmonger: `<path d="M-2.6 2.6L2.8 -2.8M-2.4 -.2L.2 2.4M-3.2 3.2l1-1" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`,
  soldier: `<path d="M-3 -.4L0 -3L3 -.4M-3 2.8L0 .2L3 2.8" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`,
  bold: `<rect x="-2.8" y="-2.8" width="5.6" height="5.6" rx="1" fill="${INK}"/><circle cx="-1.2" cy="-1.2" r=".6" fill="#1a1f26"/><circle cx="1.2" cy="1.2" r=".6" fill="#1a1f26"/><circle r=".6" fill="#1a1f26"/>`,
  cautious: `<path d="M0 -3.4L3 -2.3V.2C3 2 1.6 3 0 3.6C-1.6 3 -3 2 -3 .2V-2.3z" fill="none" stroke="${INK}" stroke-width=".9"/>`,
  paranoid: `<path d="M-3.4 0Q0 -3 3.4 0Q0 3 -3.4 0z" fill="none" stroke="${INK}" stroke-width="1"/><circle r="1.1" fill="${INK}"/>`,
  builder: `<path d="M-2.6 2.8L.8 -.6" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/><path d="M-.6 -2.8l2.2 -.6 1.6 1.6-.6 2.2z" fill="${INK}"/>`,
  stingy: `<rect x="-2.6" y="-.6" width="5.2" height="4" rx=".6" fill="${INK}"/><path d="M-1.6 -.6V-1.8A1.6 1.6 0 011.6 -1.8V-.6" fill="none" stroke="${INK}" stroke-width=".9"/>`,
  spender: `<circle r="2.8" fill="none" stroke="#f2c94c" stroke-width="1"/><path d="M0 -1.6v3.2" stroke="#f2c94c" stroke-width="1"/>`,
  tyrant: `<path d="M-3 2L-3.4 -2.2L-1.4 -.6L0 -3L1.4 -.6L3.4 -2.2L3 2z" fill="${INK}"/>`,
  reformer: `<path d="M-2.4 -3h4.8v6h-4.8z" fill="none" stroke="${INK}" stroke-width=".9"/><path d="M-1.4 -1.2h2.8M-1.4 .4h2.8M-1.4 2h1.8" stroke="${INK}" stroke-width=".7"/>`,
  drunk: `<path d="M-2.4 -3H2.4C2.4 -.6 1.4 .6 0 .6C-1.4 .6 -2.4 -.6 -2.4 -3zM0 .6V3M-1.6 3H1.6" fill="none" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/><path d="M-2.2 -2H2.2C2 -.8 1 0 0 0C-1 0 -2 -.8 -2.2 -2z" fill="#a04060"/>`,
  vengeful: `<path d="M0 -3.4C1.7 -1.2 2.5 0 1.8 1.7C1.3 3 -1.3 3 -1.8 1.7C-2.4 .2 -.9 -.8 0 -3.4z" fill="#e3933c"/>`,
  flirt: `<path d="M-3 .4C-2 -1.4 -.8 -1.2 0 -.4C.8 -1.2 2 -1.4 3 .4C1.6 2.2 -1.6 2.2 -3 .4z" fill="#e0453a"/><path d="M-3 .4H3" stroke="#1a1f26" stroke-width=".5"/>`,
  religious: `<ellipse cy="-2.4" rx="2.6" ry=".9" fill="none" stroke="${INK}" stroke-width=".9"/><circle cy=".9" r="1.9" fill="${INK}"/>`,
  sharp: `<circle cx="-.7" cy="-.7" r="2" fill="none" stroke="${INK}" stroke-width=".9"/><path d="M.8 .8L3 3" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`,
  planner: `<path d="M0 3.4V-.4" stroke="${INK}" stroke-width="1"/><circle cy="-1.4" r="2.4" fill="${INK}"/>`,
  tolerant: `<circle cx="-1.2" r="2.2" fill="none" stroke="${INK}" stroke-width=".9"/><circle cx="1.2" r="2.2" fill="none" stroke="${INK}" stroke-width=".9"/>`,
  nationalist: `<path d="M-2.4 3.4V-3.4" stroke="${INK}" stroke-width=".9"/><path d="M-2.4 -3.2L3 -1.6L-2.4 0z" fill="${INK}"/>`,
  strict: `<path d="M-3.4 -1.6H2.2C3 -1.6 3.6 -1 3.4 -.4H1.2V.8L2 2.4H-2L-1.2 .8V-.4H-2.6C-3.2 -.4 -3.4 -1 -3.4 -1.6z" fill="${INK}"/>`,
  sailor: `<circle cy="-2.6" r=".8" fill="none" stroke="${INK}" stroke-width=".8"/><path d="M0 -1.8V3.2M-1.6 -.6H1.6M-3 .8C-2.6 2.6 -1.4 3.2 0 3.2C1.4 3.2 2.6 2.6 3 .8" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`,
};
// the round badge behind a quirk emblem, ringed in its rarity's colour
const embBadge = g => `<circle r="7" fill="#1a1f26" stroke="${(TIER[g] || TIER[0]).color}" stroke-width="${g >= 3 ? 1.4 : 1}"/>`;

// the name of a concept, for labels
const nm = k => REG[k].name;
// hover text for anything: its name, and a line of description under it. Shown at once by the
// instant tooltip in main.js; the browser's own title tooltips are never used (the build checks).
const tipAttr = (name, desc = '') => `data-tip="${name}"${desc ? ` data-desc="${desc.replace(/"/g, '&quot;')}"` : ''}`;
const tipOf = k => { const e = REG[k] || WORDS[k]; return tipAttr(e.name, e.desc); };
// a panel icon that names and explains itself on hover; `style` can set --uc for unrest colour
const ic = (k, cls = '', style = '') => { const e = REG[k], b = e.box || 8;
  return `<svg class="ic ${cls}" viewBox="${-b} ${-b} ${2 * b} ${2 * b}" role="img" aria-label="${e.name}" ${tipOf(k)}${style ? ` style="${style}"` : ''}>${e.draw}</svg>`; };
// the same drawing for the map, centred on 0,0 at the map's scale
const glyph = (k, style = '') => { const e = REG[k], s = e.map || .55;
  return `<g transform="scale(${s})"${style ? ` style="${style}"` : ''}>${e.draw}</g>`; };
// words in copy that get their concept's icon in front (see iconize)
const WORD_IC = { 'gold a year': 'goldYear', 'army upkeep': 'upkeep', 'sea trade': 'trade', 'civil war': 'civilWar', factories: 'factory', factory: 'factory',
  fortresses: 'fort', fortress: 'fort', unrest: 'unrest', uprisings: 'uprising', uprising: 'uprising', armies: 'army', army: 'army', alliances: 'ally', alliance: 'ally',
  reforms: 'reform', integrates: 'settle', integrated: 'settle', capital: 'capital', gold: 'gold', peace: 'peace', ruler: 'ruler', war: 'war' };
const WORD_RE = new RegExp(`\\b(${Object.keys(WORD_IC).sort((a, b) => b.length - a.length).join('|')})\\b`, 'gi');
// copy with an icon in front of the first mention of each concept it names
const iconize = text => { const seen = new Set();
  return text.replace(WORD_RE, w => { const k = WORD_IC[w.toLowerCase()]; if (seen.has(k)) return w; seen.add(k); return `<span class="iw">${ic(k)}${w}</span>`; }); };
// the unrest at which a province shows as restless, and at which it can rise (content/rules.json)
const UNREST = CONTENT.rules.unrest;
const UNREST_HOT = '--uc:#e0453a', UNREST_WARM = '--uc:#e3933c';
const TYPE_IC = { war: 'war', peace: 'peace', diplo: 'ally', revolt: 'uprising', unify: 'proclaim', ruler: 'ruler', event: 'event', econ: 'build' };
const OPT_IC = { save: 'save', factory: 'factory', army: 'army', demob: 'army', fort: 'fort', reform: 'reform', court: 'ally', ally: 'ally', annex: 'ambition', war: 'war' };
// map markers left by the simulation, by its own type names
const MARK_IC = { revolt: 'uprising', boom: 'boom', ruin: 'ruin', crown: 'proclaim', coup: 'coup', crisis: 'civilWar' };
