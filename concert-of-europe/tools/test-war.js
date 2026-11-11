// Behavioral war regressions. Run: node --test tools/test-war.js
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { simSource } = require('./load');

// Expose war internals only inside this test VM, leaving the game's public API unchanged.
const source = simSource(), end = '\n  return S;\n}';
assert.equal(source.split(end).length, 2);
const ctx = {};
vm.createContext(ctx);
vm.runInContext(source.replace(end, '\n  S.tickWarTest = tickWars; S.endWarTest = endWar; S.warEvalTest = warEval; S.geoNavalTest = geoNaval; S.invalidateTest = invalidate;' + end) + '\nthis.createSim = createSim; this.rules = RULES;', ctx);
const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json'), 'utf8'));
const WR = ctx.rules.war;

function fixture(att = ['GBR'], def = ['RUS'], goal = 'mos'){
  const S = ctx.createSim(1, geo);
  // Start with disconnected fronts; each test adds only the links its engagement needs.
  S.regions.forEach(r => { r.nb = []; r.fort = 0; r.occ = null; });
  Object.values(S.C).forEach(c => { c.ruler.fx = {}; c.army = 1; });
  S.C[att[0]].army = 100000;
  S.era.fort = 0;
  const w = { id: 0, name: 'Test war', att, def, goal, score: 0, quarters: 0, battles: 0, great: false };
  S.wars = [w];
  const join = (a, b) => { S.RB[a].nb.push(S.RB[b].i); S.RB[b].nb.push(S.RB[a].i); };
  const armies = () => att.concat(def).map(t => S.C[t].army);
  return { S, w, join, armies };
}

for (const strongSide of ['att', 'def']) test(`no front: stronger ${strongSide} gains no battle score and inflicts no combat losses`, () => {
  const { S, w, armies } = fixture();
  if (strongSide === 'def') { S.C.GBR.army = 1; S.C.RUS.army = 100000; }
  const before = armies();
  S.tickWarTest();
  assert.equal(w.battles, 0);
  assert.equal(w.score, 0);
  assert.deepEqual(armies(), before);
  assert.equal(S.stats.battles, 0);
  assert.equal(S.regions.filter(r => r.occ).length, 0);
  assert.equal(w.quarters, 1);
});

test('a disconnected war still times out, without manufacturing a victory', () => {
  const { S, w, armies } = fixture(), before = armies();
  // the stalemate roll may end it early; switch it off so the timeout itself is tested
  const chance = WR.stalemate.chance; WR.stalemate.chance = 0;
  try { for (let i = 0; i < WR.seasons; i++) S.tickWarTest(); } finally { WR.stalemate.chance = chance; }
  assert.equal(w.quarters, WR.seasons);
  assert.equal(S.wars.length, 0);
  assert.equal(w.battles, 0);
  assert.deepEqual(armies(), before);
  assert.match(S.log.at(-1).h, /white peace/);
  assert.equal(S.RB.mos.owner, 'RUS');
});

for (const stop of ['fort', 'ruler']) test(`an assault stopped by a ${stop} is still a battle`, () => {
  const { S, w, join, armies } = fixture();
  join('lon', 'mos');
  if (stop === 'fort') { S.RB.mos.fort = 1; S.era.fort = 1; }
  else S.C.RUS.ruler.fx.hold = 1;
  const before = armies(), pop = S.RB.mos.pop;
  S.tickWarTest();
  assert.equal(S.RB.mos.occ, null);
  assert.equal(w.battles, 1);
  assert.ok(S.stats.battles > 0);
  assert.ok(S.RB.mos.pop < pop);
  armies().forEach((n, i) => assert.ok(n < before[i]));
});

test('a liberation counts even when the breakthrough finds no second target', () => {
  const { S, w, join, armies } = fixture();
  join('ire', 'lon');
  S.RB.lon.occ = 'RUS';
  const before = armies();
  S.tickWarTest();
  assert.equal(S.RB.lon.occ, null);
  assert.equal(w.battles, 1);
  assert.equal(S.regions.filter(r => r.occ).length, 0);
  armies().forEach((n, i) => assert.ok(n < before[i]));
});

test('an invasion is credited to the adjacent ally and counts once per season', () => {
  const { S, w, join } = fixture(['GBR', 'FRA']);
  join('par', 'mos');
  S.tickWarTest();
  assert.equal(S.RB.mos.occ, 'FRA');
  assert.equal(w.battles, 1);
  assert.equal(S.stats.battles, 1);
});

test('a breakthrough can take two provinces while adding one battle-tally point', () => {
  const { S, w, join } = fixture();
  join('lon', 'mos'); join('mos', 'vol');
  S.tickWarTest();
  assert.equal(S.RB.mos.occ, 'GBR');
  assert.equal(S.RB.vol.occ, 'GBR');
  assert.equal(w.battles, 1);
  assert.equal(S.stats.battles, 2);
});

test('an ordinary victory still returns occupied land that does not qualify for annexation', () => {
  const { S, w, join } = fixture(['TUR'], ['RUS'], 'cri');
  const occupied = ['cri', 'cau', 'don', 'bes', 'kie'];
  occupied.forEach(id => { join('ana', id); S.RB[id].occ = 'TUR'; });
  w.score = WR.win;
  S.endWarTest(w, 'att');
  assert.equal(S.RB.cri.owner, 'TUR');
  occupied.filter(id => id !== 'cri').forEach(id => { assert.equal(S.RB[id].owner, 'RUS'); assert.equal(S.RB[id].occ, null); });
});

test('the armistice still settles both sides on the current occupation lines', () => {
  const { S, w } = fixture();
  S.RB.mos.occ = 'GBR'; S.RB.lon.occ = 'RUS';
  S.endWarTest(w, 'lines');
  assert.equal(S.RB.mos.owner, 'GBR');
  assert.equal(S.RB.lon.owner, 'RUS');
  assert.equal(S.regions.filter(r => r.occ).length, 0);
  assert.equal(S.wars.length, 0);
});

test('an ally with no reachable front neither decides the battle nor bleeds', () => {
  const { S, w, join } = fixture(['GBR'], ['RUS', 'TUR']);
  join('lon', 'mos');
  S.C.GBR.army = 50; S.C.TUR.army = 100000;
  S.tickWarTest();
  assert.equal(S.RB.mos.occ, 'GBR');
  assert.equal(S.RB.lon.occ, null);
  assert.equal(w.battles, 1);
  assert.equal(S.C.TUR.army, 100000);
  assert.ok(S.C.RUS.army < 1);
});

test('equivalent land and sea fronts have the same forecast odds and combat outcome', () => {
  function engagement(sea){
    const { S, w } = fixture(['GBR'], ['FRA'], 'par');
    // Use real map edges: London–Paris by sea, Brittany–Paris by land.
    const from = S.RB[sea ? 'lon' : 'bri'], target = S.RB.par;
    const a = from.i, b = target.i;
    assert.ok(geo.regions[a].nb.includes(b));
    assert.ok(geo.regions[b].nb.includes(a));
    assert.equal(S.geoNavalTest(a, b), sea);
    assert.equal(S.geoNavalTest(b, a), sea);
    // Isolate that real front, as in the other war fixtures.
    from.nb = geo.regions[a].nb.filter(j => j === b);
    target.nb = geo.regions[b].nb.filter(j => j === a);
    // Swap the British foothold for the land case, preserving each nation's
    // province count, population, industry and income in both engagements.
    for (const key of ['pop', 'fac', 'culture', 'coast', 'unrest', 'integ']) S.RB.bri[key] = S.RB.lon[key];
    if (!sea) { S.RB.bri.owner = 'GBR'; S.RB.lon.owner = 'FRA'; S.invalidateTest(); }
    S.majors = [];
    Object.values(S.C).forEach(c => { c.allies.clear(); c.truce = {}; c.ruler.bias = 1; });
    S.C.GBR.army = 300; S.C.FRA.army = 100;
    // Forecast before declaration, then fight with exactly those armies and that front.
    S.wars = [];
    const forecast = S.warEvalTest(S.C.GBR, S.C.FRA, S.RB.par);
    assert.ok(forecast, 'the invasion must be a viable option');
    S.wars = [w];
    S.tickWarTest();
    return { forecast, result: {
      occupier: S.RB.par.occ, battles: w.battles, score: w.score,
      attackers: S.C.GBR.army, defenders: S.C.FRA.army, population: S.RB.par.pop
    } };
  }
  const land = engagement(false), sea = engagement(true);
  assert.equal(sea.forecast.pTrue, land.forecast.pTrue);
  assert.equal(sea.forecast.p, land.forecast.p);
  assert.equal(sea.forecast.cost, land.forecast.cost);
  assert.equal(sea.result.occupier, 'GBR');
  assert.deepEqual(sea.result, land.result);
});
