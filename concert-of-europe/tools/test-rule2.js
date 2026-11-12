// Structural/lifecycle regressions select subjects by capability, never by shipping content ID.
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { load } = require('./content'), { validateContent } = require('./validate'), { simSource } = require('./load');
const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json')));
function engine(data = load(), forced = null){
  let source = simSource(data);
  if (forced) source = source.replace('want || drawHeir()', `want || ${JSON.stringify(forced)}`);
  source = source.replace('\n  return S;\n}', '\n  Object.assign(S, { revoltsTest: revolts, ambitionTest: setAmbition });\n  return S;\n}');
  const ctx = {}; vm.createContext(ctx); vm.runInContext(source + '\nthis.createSim = createSim;', ctx);
  return ctx.createSim(1, geo);
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
