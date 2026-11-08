// ===================== SIMULATION DATA =====================
// The world of 1836, read from content/ (CONTENT, built by tools/content.js). Nothing here is typed by hand:
// change the content files and every part of the game follows. The shapes below are what sim.js reads.

// provinces: id, name, lon, lat, owner, people, pop (millions), industry
const REGIONS = Object.entries(CONTENT.provinces).map(([id, p]) => [id, p.name, p.lon, p.lat, p.owner, p.people, p.pop, p.industry]);
// sea anchor points shape the coastline of the map; sea crossings join two coasts across the water
const SEA = CONTENT.map.seaPoints;
const NAVAL = CONTENT.map.seaCrossings;
// the nations of 1836
const COUNTRIES = Object.fromEntries(Object.entries(CONTENT.nations).map(([tag, n]) => [tag, Object.assign({}, n,
  { culture: n.people, acc: n.accepts, p: [n.hawk, n.patience] })]));
// nations that can appear through an uprising, by the people that rises; some restore a nation of 1836
const TEMPLATES = Object.fromEntries(Object.entries(CONTENT.breakaways).map(([people, b]) => {
  const n = b.restores && CONTENT.nations[b.restores];
  return [people, n ? { tag: b.restores, name: n.name, adj: n.adj, pre: n.pre, color: n.color, programme: b.programme } : b];
}));

function proj(lon, lat){ return [(lon + 10.5) * 18.7, (62.5 - lat) * 25.5]; }
const MAP_W = 1000, MAP_H = 720;

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
