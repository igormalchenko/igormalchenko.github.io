// Structural/lifecycle regressions select subjects by capability, never by shipping content ID.
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { load } = require('./content'), { validateContent } = require('./validate'), { simSource } = require('./load');
const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json')));
function engine(data = load(), forced = null, options = {}){
  let source = simSource(data);
  if (forced) source = source.replace('want || drawHeir()', `want || ${JSON.stringify(forced)}`);
  source = source.replace('\n  return S;\n}', '\n  Object.assign(S, { revoltsTest: revolts, ambitionTest: setAmbition, eventsTest: runEvents, transferGoldTest: transferGold, unrestTest: setUnrest });\n  return S;\n}');
  const ctx = {}; vm.createContext(ctx); vm.runInContext(source + '\nthis.createSim = createSim;', ctx);
  return ctx.createSim(1, geo, options);
}
test('invalid ruler overrides, initial diplomacy and era pools have content diagnostics', () => {
  let C = load(), tag = Object.keys(C.nations).find(t => C.nations[t].starts);
  C.nations[tag].rulerNames = [];
  assert.ok(validateContent(C).some(e => e.includes(`nations.json ${tag}`) && e.includes('ruler names')));
  C = load(); C.nations[tag].allies = [Object.keys(C.nations).find(t => !C.nations[t].starts)];
  assert.ok(validateContent(C).some(e => e.includes('opening diplomacy')));
  C = load(); C.eras = C.eras.slice(0, 2);
  assert.ok(validateContent(C).some(e => e.includes('eras.json') && e.includes('candidate')));
});
test('fallback ambition identity comes from content when a restored richest nation needs it', () => {
  const C = load(), old = Object.keys(C.ambitions).find(k => C.ambitions[k].fallback), id = 'fixtureFallback';
  C.ambitions[id] = C.ambitions[old]; delete C.ambitions[old];
  for (const n of Object.values(C.nations)) if (n.ambition === old) n.ambition = id;
  const s = engine(C), c = s.alive().find(c => c.ambition.kind === 'richest');
  c.born++; s.ambitionTest(c);
  assert.equal(c.ambition.id, id);
});
test('independence installs land and diplomacy before applying a capital coronation grant', () => {
  const C = load(), trait = Object.keys(C.rulers).find(t => C.rulers[t].flat.fx === 'factoryCapital');
  const grade = C.rarities.findIndex(r => r.flat === 0), s = engine(C, { trait, grade });
  const tag = Object.keys(C.nations).find(t => !C.nations[t].starts &&
    !s.alive().some(c => c.culture === C.nations[t].people) && s.regions.some(r => r.culture === C.nations[t].people));
  const r = s.regions.find(r => r.culture === C.nations[tag].people), from = s.C[r.owner];
  from.army = 0;
  const before = new Map(s.regions.map(r => [r.id, r.fac]));
  for (let i = 0; i < 5000 && !s.C[tag]; i++) { r.unrest = 100; s.revoltsTest(); }
  assert.ok(s.C[tag]?.alive, 'the fixture must actually create the nation');
  const mine = s.regionsOf(s.C[tag]);
  assert.equal(mine.reduce((n, r) => n + r.fac - before.get(r.id), 0), C.rulers[trait].flat.values[0]);
  assert.ok(s.C[tag].truce[from.tag] > s.year);
});

test('an added event is executed by its record and an unknown operation is a content error', () => {
  const C = load(), example = Object.values(C.events).find(e => e.operation === 'apply' && e.target.kind === 'nation' && e.effects.unrest > 0);
  const e = structuredClone(example); e.name = 'Fixture disturbance'; e.schedule = { ...e.schedule, from:C.rules.start,to:C.rules.end.year,season:-1,period:0,once:true,beforeRoll:false };
  e.target = { ...e.target, mode:'fixed', nations:[Object.keys(C.nations).find(t => C.nations[t].starts)] };
  C.events = { fixtureEvent:e };
  assert.deepEqual(validateContent(C), []);
  const s = engine(C), c = s.C[e.target.nations[0]], r = s.regionsOf(c)[0], before = r.unrest;
  s.eventsTest('events'); assert.equal(r.unrest, before + e.effects.unrest);
  s.eventsTest('events'); assert.equal(r.unrest, before + e.effects.unrest, 'once is keyed by the added identity');
  e.operation = 'missingOperation';
  assert.ok(validateContent(C).some(x => x.includes('fixtureEvent') && x.includes('unknown operation')));
});

test('gold transactions balance and all unrest writes apply the same bounds', () => {
  const s = engine(), [a,b] = s.alive(), before = a.treasury + b.treasury;
  s.transferGoldTest(a, [b], 5, 'fixture');
  assert.equal(a.treasury + b.treasury, before);
  for (const c of [a,b]) {
    const l = c.ledger, spent = Object.values(l.spent).reduce((n,v) => n+v, 0);
    assert.ok(Math.abs(l.closing - l.opening - (l.tax+l.fac+l.trade-l.upkeep-spent+l.other)) < 1e-8);
  }
  const r = s.regions[0]; s.unrestTest(r, 150); assert.equal(r.unrest, 100); s.unrestTest(r, -20); assert.equal(r.unrest, 0);
});
test('player succession pauses at the closing boundary and resuming never collects income twice', () => {
  const C = load(), tag = Object.keys(C.nations).find(t => C.nations[t].starts), s = engine(C, null, { player:tag });
  while(s.pending) (s.pending.type === 'heir' ? s.chooseHeir : s.chooseAdvance)(0);
  for(const c of s.alive()) c.ruler.until = Infinity;
  const c = s.C[tag], old = c.ruler, t = s.t; old.until = t;
  s.step();
  assert.equal(s.phase, 'closing'); assert.equal(s.t, t); assert.equal(s.pending.type, 'heir'); assert.equal(old.ended, true);
  const before = JSON.stringify(s); s.step(); assert.equal(JSON.stringify(s), before);
  s.chooseHeir(0); const gold = c.treasury; s.step();
  assert.equal(s.t, t+1); assert.equal(c.treasury, gold); assert.equal(s.phase, 'season');
});
