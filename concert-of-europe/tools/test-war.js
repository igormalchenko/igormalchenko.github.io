// War behavior against synthetic participants, provinces and land/sea fronts.
const assert = require('node:assert/strict'), { test } = require('node:test');
const { fixtureEngine, neutralFx } = require('./fixtures');
const engine = fixtureEngine({tickWarTest:'tickWars',endWarTest:'endWar',warEvalTest:'warEval',geoNavalTest:'geoNaval',invalidateTest:'invalidate'});
const ctx = {createSim:engine.create}, geo = engine.geo, WR = engine.C.rules.war;


function fixture(att = ['A'], def = ['B'], goal = 'p0'){
  const S = ctx.createSim(1);
  // Start with disconnected fronts; each test adds only the links its engagement needs.
  S.regions.forEach(r => { r.nb = []; r.fort = 0; r.occ = null; });
  Object.values(S.C).forEach(c => { c.ruler.fx = { ...neutralFx(),}; c.army = 1; });
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
  if (strongSide === 'def') { S.C.A.army = 1; S.C.B.army = 100000; }
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
  assert.equal(S.RB.p0.owner, 'B');
});

for (const stop of ['fort', 'ruler']) test(`an assault stopped by a ${stop} is still a battle`, () => {
  const { S, w, join, armies } = fixture();
  join('p1', 'p0');
  if (stop === 'fort') { S.RB.p0.fort = 1; S.era.fort = 1; }
  else S.C.B.ruler.fx.hold = 1;
  const before = armies(), pop = S.RB.p0.pop;
  S.tickWarTest();
  assert.equal(S.RB.p0.occ, null);
  assert.equal(w.battles, 1);
  assert.ok(S.stats.battles > 0);
  assert.ok(S.RB.p0.pop < pop);
  armies().forEach((n, i) => assert.ok(n < before[i]));
});

test('a liberation counts even when the breakthrough finds no second target', () => {
  const { S, w, join, armies } = fixture();
  join('p11', 'p1');
  S.RB.p1.occ = 'B';
  const before = armies();
  S.tickWarTest();
  assert.equal(S.RB.p1.occ, null);
  assert.equal(w.battles, 1);
  assert.equal(S.regions.filter(r => r.occ).length, 0);
  armies().forEach((n, i) => assert.ok(n < before[i]));
});

test('an invasion is credited to the adjacent ally and counts once per season', () => {
  const { S, w, join } = fixture(['A', 'C']); S.C.C.army = 100000;
  join('p2', 'p0');
  S.tickWarTest();
  assert.equal(S.RB.p0.occ, 'C');
  assert.equal(w.battles, 1);
  assert.equal(S.stats.battles, 1);
});

test('a breakthrough can take two provinces while adding one battle-tally point', () => {
  const { S, w, join } = fixture();
  join('p1', 'p0'); join('p0', 'p3');
  S.tickWarTest();
  assert.equal(S.RB.p0.occ, 'A');
  assert.equal(S.RB.p3.occ, 'A');
  assert.equal(w.battles, 1);
  assert.equal(S.stats.battles, 2);
});

test('an ordinary victory still returns occupied land that does not qualify for annexation', () => {
  const { S, w, join } = fixture(['D'], ['B'], 'p4');
  const occupied = ['p4', 'p5', 'p6', 'p7', 'p8'];
  occupied.forEach(id => { join('p9', id); S.RB[id].occ = 'D'; });
  w.score = WR.win;
  S.endWarTest(w, 'att');
  assert.equal(S.RB.p4.owner, 'D');
  occupied.filter(id => id !== 'p4').forEach(id => { assert.equal(S.RB[id].owner, 'B'); assert.equal(S.RB[id].occ, null); });
});

test('the armistice still settles both sides on the current occupation lines', () => {
  const { S, w } = fixture();
  S.RB.p0.occ = 'A'; S.RB.p1.occ = 'B';
  S.endWarTest(w, 'lines');
  assert.equal(S.RB.p0.owner, 'A');
  assert.equal(S.RB.p1.owner, 'B');
  assert.equal(S.regions.filter(r => r.occ).length, 0);
  assert.equal(S.wars.length, 0);
});

test('an ally with no reachable front neither decides the battle nor bleeds', () => {
  const { S, w, join } = fixture(['A'], ['B', 'D']);
  join('p1', 'p0');
  S.C.A.army = 50; S.C.D.army = 100000;
  S.tickWarTest();
  assert.equal(S.RB.p0.occ, 'A');
  assert.equal(S.RB.p1.occ, null);
  assert.equal(w.battles, 1);
  assert.equal(S.C.D.army, 100000);
  assert.ok(S.C.B.army < 1);
});

test('equivalent land and sea fronts have the same forecast odds and combat outcome', () => {
  function engagement(sea){
    const { S, w } = fixture(['A'], ['C'], 'p2');
    // The fixture has a sea edge and a land edge into the same target.
    const from = S.RB[sea ? 'p1' : 'p10'], target = S.RB.p2;
    const a = from.i, b = target.i;
    assert.ok(geo.regions[a].nb.includes(b));
    assert.ok(geo.regions[b].nb.includes(a));
    assert.equal(S.geoNavalTest(a, b), sea);
    assert.equal(S.geoNavalTest(b, a), sea);
    // Isolate that fixture front.
    from.nb = geo.regions[a].nb.filter(j => j === b);
    target.nb = geo.regions[b].nb.filter(j => j === a);
    // Swap the foothold for the land case, preserving each nation's
    // province count, population, industry and income in both engagements.
    for (const key of ['pop', 'fac', 'culture', 'coast', 'unrest', 'integ']) S.RB.p10[key] = S.RB.p1[key];
    if (!sea) { S.RB.p10.owner = 'A'; S.RB.p1.owner = 'C'; S.invalidateTest(); }
    S.majors = [];
    Object.values(S.C).forEach(c => { c.allies.clear(); c.truce = {}; c.ruler.bias = 1; });
    S.C.A.army = 300; S.C.C.army = 100;
    // Forecast before declaration, then fight with exactly those armies and that front.
    S.wars = [];
    const forecast = S.warEvalTest(S.C.A, S.C.C, S.RB.p2);
    assert.ok(forecast, 'the invasion must be a viable option');
    S.wars = [w];
    S.tickWarTest();
    return { forecast, result: {
      occupier: S.RB.p2.occ, battles: w.battles, score: w.score,
      attackers: S.C.A.army, defenders: S.C.C.army, population: S.RB.p2.pop
    } };
  }
  const land = engagement(false), sea = engagement(true);
  assert.equal(sea.forecast.pTrue, land.forecast.pTrue);
  assert.equal(sea.forecast.p, land.forecast.p);
  assert.equal(sea.forecast.cost, land.forecast.cost);
  assert.equal(sea.result.occupier, 'A');
  assert.deepEqual(sea.result, land.result);
});
