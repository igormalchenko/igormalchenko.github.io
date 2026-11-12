// Structural/lifecycle regressions select subjects by capability, never by shipping content ID.
const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { load } = require('./content'), { validateContent } = require('./validate'), { simSource } = require('./load');
const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json')));
function engine(data = load(), forced = null, options = {}, geometry = geo){
  let source = simSource(data);
  if (forced) source = source.replace('want || drawHeir()', `want || ${JSON.stringify(forced)}`);
  source = source.replace('\n  return S;\n}', '\n  Object.assign(S, { revoltsTest: revolts, ambitionTest: setAmbition, eventsTest: runEvents, transferGoldTest: transferGold, unrestTest: setUnrest, reignTest: endReign, reignsTest: resolveReigns, successionsTest: successions, fxTest: fx });\n  return S;\n}');
  const ctx = {}; vm.createContext(ctx); vm.runInContext(source + '\nthis.createSim = createSim;', ctx);
  return ctx.createSim(1, geometry, options);
}
test('invalid ruler overrides, initial diplomacy and era pools have content diagnostics', () => {
  let C = load(), tag = Object.keys(C.nations).find(t => C.nations[t].starts);
  C.nations[tag].namePool = 'nation'; C.nations[tag].rulerNames = [];
  assert.ok(validateContent(C).some(e => e.includes(`nations.json ${tag}`) && e.includes('ruler names')));
  C = load(); C.nations[tag].allies = [Object.keys(C.nations).find(t => !C.nations[t].starts)];
  assert.ok(validateContent(C).some(e => e.includes('opening diplomacy')));
  C = load(); C.eras = C.eras.slice(0, 2);
  assert.ok(validateContent(C).some(e => e.includes('eras.json') && e.includes('candidate')));
  C = load(); Object.values(C.events)[0].target.nations = null;
  assert.ok(validateContent(C).some(e => e.includes('target.nations') && e.includes('array')));
  C = load(); C.map.cuts[0] = null;
  assert.ok(validateContent(C).some(e => e.includes('map.json cuts.0') && e.includes('object')));
});
test('fallback ambition identity comes from content when a restored richest nation needs it', () => {
  const C = load(), old = Object.keys(C.ambitions).find(k => C.ambitions[k].fallback);
  let id = 'alternateFallback'; while (Object.hasOwn(C.ambitions,id)) id += 'Next';
  C.ambitions[id] = C.ambitions[old]; delete C.ambitions[old];
  for (const n of Object.values(C.nations)) if (n.ambition === old) n.ambition = id;
  const s = engine(C), c = s.alive().find(c => c.ambition.kind === 'richest');
  c.born++; s.ambitionTest(c);
  assert.equal(c.ambition.id, id);
});
test('independence installs land and diplomacy before applying a capital coronation grant', () => {
  const C = load(), trait = Object.keys(C.rulers).find(t => C.rulers[t].flat[0].fx === 'factoryCapital');
  const grade = C.rarities.findIndex(r => r.flat === 0), s = engine(C, { trait, grade });
  const tag = Object.keys(C.nations).find(t => !C.nations[t].starts &&
    !s.alive().some(c => c.culture === C.nations[t].people) && s.regions.some(r => r.culture === C.nations[t].people));
  const r = s.regions.find(r => r.culture === C.nations[tag].people), from = s.C[r.owner];
  from.army = 0;
  const before = new Map(s.regions.map(r => [r.id, r.fac]));
  for (let i = 0; i < 5000 && !s.C[tag]; i++) { r.unrest = 100; s.revoltsTest(); }
  assert.ok(s.C[tag]?.alive, 'the fixture must actually create the nation');
  const mine = s.regionsOf(s.C[tag]);
  assert.equal(mine.reduce((n, r) => n + r.fac - before.get(r.id), 0), C.rulers[trait].flat[0].value);
  assert.ok(s.C[tag].truce[from.tag] > s.year);
});

test('an added event is executed by its record and an unknown operation is a content error', () => {
  const C = load(), example = Object.values(C.events).find(e => e.operation === 'apply' && e.target.kind === 'nation' && e.effects.unrest > 0);
  const e = structuredClone(example); e.name = 'Fixture disturbance'; e.schedule = { ...e.schedule, from:C.rules.start,to:C.rules.end.year,season:-1,period:0,chance:1,once:true,beforeRoll:false };
  e.target = { ...e.target, mode:'fixed',count:0,nations:[Object.keys(C.nations).find(t => C.nations[t].starts)] };
  e.effects.pop=1; e.text='{name} affects {nation}.'; e.effect='Adds {effects.unrest} unrest to the selected provinces.';
  const closing = Object.entries(C.events).find(([, e]) => e.phase === 'closing');
  C.events = { fixtureEvent:e, [closing[0]]:closing[1] };
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

test('source checks reject bypass writes and fixed content lookups, and ignore comments', () => {
  const { checkSource } = require('./check-rule2');
  assert.ok(checkSource('function bypass(c){ c.treasury += 1; }', 'src/sim.js').some(e => e.includes('protected state')));
  assert.ok(checkSource('const x = S.C.fixtureNation;', 'src/data.js').some(e => e.includes('names a content entry')));
  assert.deepEqual(checkSource('// const x = S.C.fixtureNation;\nfunction changeGold(c,n){c.treasury+=n;}', 'src/sim.js'), []);
});

test('choosing a restoration ruler at closing cannot award a retrospective development', () => {
  const C = load(), tag = Object.keys(C.nations).find(t => C.nations[t].starts), s = engine(C, null, { player:tag });
  while (s.pending) (s.pending.type === 'heir' ? s.chooseHeir : s.chooseAdvance)(0);
  const c = s.C[tag], year = C.advances.years[1], count = c.advances.length;
  s.year = year; s.q = C.advances.season; s.phase = 'closing'; c.advanceYear = null;
  s.pending = { type:'heir',tag,opening:true,year,options:[{...c.ruler}],why:'',crisis:false };
  s.chooseHeir(0);
  assert.equal(s.pending, null); assert.equal(c.advances.length,count);
  assert.equal(s.nextAdvanceYear(), C.advances.years[2]);
});

test('mandatory civil-war effects are captured before ending a reign for every succession cause', () => {
  const C=load(), trait=Object.keys(C.rulers).find(t=>C.rulers[t].malus[0].fx==='civilWar'), grade=C.rarities.findIndex(r=>r.malus===0&&r.flat===null);
  for (const cause of ['death','coup','revolution','abdicate']) {
    const s=engine(C,{trait,grade}),c=s.alive()[0],value=C.rulers[trait].malus[0].value;
    for (const r of s.regionsOf(c)) s.unrestTest(r,0);
    s.reignTest(c,cause);
    assert.ok(c.crisis.until>s.t, cause);
    for (const r of s.regionsOf(c)) assert.equal(r.unrest,value,cause);
  }
});

test('a player eliminated by an opening gift has its real ambition and no impossible heir choice', () => {
  const { C,geo }=require('./fixtures').fixtureData();
  C.provinces.p10.owner='B'; C.provinces.p10.people=C.nations.B.people;
  geo.regions.forEach(r=>r.nb=[]);geo.regions[1].nb=[2];geo.regions[2].nb=[1];
  const trait=Object.keys(C.rulers).find(t=>C.rulers[t].flat[1].fx==='province'),grade=C.rarities.findIndex(r=>r.flat===1);
  const s=engine(C,{trait,grade},{player:'C'},geo);
  assert.equal(s.C.C.alive,false);assert.equal(s.C.C.ambition.id,'earning');assert.equal(s.pending,null);
});

test('stale or malformed geometry has a diagnostic before headless state creation', () => {
  const C=load(),copy=structuredClone(geo),{validateGeometry}=require('./validate');
  assert.deepEqual(validateGeometry(C,copy),[]);
  copy.navalPaths[0]=null;assert.ok(validateGeometry(C,copy).some(e=>e.includes('sea drawing')));
  copy.regions.pop();assert.ok(validateGeometry(C,copy).some(e=>e.includes('shape count')));
});

test('a reign that runs out ends at the boundary only if nothing ended it sooner that season', () => {
  const s = engine(), c = s.alive()[0], old = c.ruler;
  old.until = s.t; s.inSeason = true; s.successionsTest(); s.reignTest(c, 'revolution', 'the capital'); s.inSeason = false;
  const from = s.log.length; s.reignsTest();
  const lines = s.log.slice(from).map(l => l.h).join(' ');
  assert.equal(old.ended, true); assert.equal(old.cause, 'revolution');
  assert.ok(lines.includes('Revolution in the capital'), lines); assert.ok(!lines.includes(' dies.'), lines);
  assert.ok(c.ruler !== old && c.ruler.until > s.t);
});
test('the player stand-in never reigns: neutral effects until a ruler is chosen from the card', () => {
  const C = load(), tag = Object.keys(C.nations).find(t => C.nations[t].starts), s = engine(C, null, { player:tag });
  const c = s.C[tag]; assert.equal(s.pending.type, 'heir'); assert.equal(c.ruler.ended, true);
  for (const [k, e] of Object.entries(C.effects)) assert.equal(s.fxTest(c, k), e.none, k);
});
test('the interface leader is always the living top earner, apart from the forecast snapshot', () => {
  const s = engine(); let stale = 0;
  while (!s.over) {
    s.step();
    const best = s.alive().reduce((b, c) => !b || s.score(c) > s.score(b) ? c : b, null);
    assert.equal(s.leaderNow(), best.tag, `${s.year} ${s.q}`); assert.ok(s.C[s.leaderNow()].alive);
    if (s.forecastLeader !== best.tag) stale++;
  }
  assert.ok(stale > 0, 'the forecast snapshot is fixed for the season, so it lags the live leader somewhere');
});
