// ===================== SIMULATION DATA =====================
// The world of 1836, read from content/ (CONTENT, built by tools/content.js). Nothing here is typed by hand:
// change the content files and every part of the game follows. The shapes below are what sim.js reads.

// provinces: id, name, lon, lat, owner, people, pop (millions), industry
const REGIONS = Object.entries(CONTENT.provinces).map(([id, p]) => [id, p.name, p.lon, p.lat, p.owner, p.people, p.pop, p.industry]);
// every nation (content/nations.json): those that start are on the map in 1836, the rest can only be born in an uprising
const NATIONS = Object.fromEntries(Object.entries(CONTENT.nations).map(([tag, n]) => [tag, Object.assign({}, n,
  { culture: n.people, acc: n.accepts, p: [n.hawk, n.patience] })]));
const COUNTRIES = Object.fromEntries(Object.entries(NATIONS).filter(([, n]) => n.starts));
// the nation a people rises as when its uprising wins (unless the province's own fallen nation comes back):
// its nation that was not on the map at the start, else its only nation, else none
function risesAs(people){
  const of = Object.keys(NATIONS).filter(t => NATIONS[t].culture === people);
  return of.find(t => !NATIONS[t].starts) || (of.length === 1 ? of[0] : null);
}

function proj(lon, lat){ return [(lon + 10.5) * 18.7, (62.5 - lat) * 25.5]; }
const MAP_W = 1000, MAP_H = 720;

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
