// National development regressions. Test-only exports keep the shipping API small.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs'), vm = require('node:vm');
const { simSource } = require('./load');
const source = simSource(), end = '\n  return S;\n}';
function engine(){
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(source.replace(end, '\n  Object.assign(S, { fxTest: fx, drawTest: drawAdvances, offerTest: offerAdvances, tickWarTest: tickWars, warEvalTest: warEval, foesTest: forecastFoes, settleTest: settleYears, provincesTest: tickProvinces, actTest: act, reformTest: reform, reignTest: endReign });' + end) + '\nthis.createSim=createSim;this.CONTENT=CONTENT;', ctx);
  const geo = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '../map/geo.json')));
  return { ctx, create: (seed = 7, opts) => ctx.createSim(seed, geo, opts) };
}
const json = x => JSON.stringify(x, (k, v) => Object.prototype.toString.call(v) === '[object Set]' ? [...v] : v);
const plain = x => JSON.parse(json(x));
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const grant = (c, id, grade = 2, target) => c.advances.push({ id, grade, ...(target ? { target } : {}) });
const blank = s => Object.values(s.C).forEach(c => { c.advances = []; c.ruler.fx = {}; });

test('all canonical effects use their explicit five strengths, independent of ruler rarity slots', () => {
  const { ctx, create } = engine(), s = create(); blank(s); const c = s.C.FRA, cards = ctx.CONTENT.advances.cards;
  assert.equal(Object.keys(cards).length, 30);
  assert.equal(Object.values(cards).reduce((n, a) => n + a.effects.length, 0), 52);
  for (const [id, d] of Object.entries(cards)) for (let grade = 0; grade < ctx.CONTENT.rarities.length; grade++) {
    c.advances = []; grant(c, id, grade, 'SPA');
    for (const e of d.effects) close(s.fxTest(c, e.fx, 'SPA'), e.values[grade]);
  }
});

test('all nations get opening offers; opening ruler precedes player development; invalid choices are inert', () => {
  const { create } = engine(), watch = create(), s = create(7, { player: 'FRA' });
  assert.ok(watch.alive().every(c => c.advances.length === 1 && c.advanceYear === 1836));
  assert.equal(s.pending.type, 'heir'); assert.equal(s.C.FRA.advances.length, 0);
  assert.ok(s.alive().filter(c => !c.player).every(c => c.advances.length === 1));
  s.chooseHeir(0); assert.equal(s.pending.type, 'advance');
  const before = json(s); s.step(); assert.equal(json(s), before);
  for (const i of [-1, 3, NaN, 0.5]) assert.equal(s.chooseAdvance(i), false);
  assert.equal(json(s), before); assert.equal(s.rerollHeirs(), false);
  assert.equal(s.chooseAdvance(1), true); assert.equal(s.nextAdvanceYear(), 1848);
  assert.equal(s.chooseAdvance(0), false); assert.equal(s.t, 0);
});

test('identical offer path for player and AI; categories, independent rarity odds, target IDs and eligibility', () => {
  const { ctx, create } = engine(), s = create(); blank(s);
  const c = s.C.SWI; assert.ok(!s.regionsOf(c).some(r => r.coast));
  c.rival = 'FRA'; c.allies.clear();
  const counts = Array(5).fill(0), names = new Set(); let matchingGrades = 0;
  for (let i = 0; i < 3000; i++) {
    const draw = s.drawTest(c); assert.equal(draw.length, 3);
    assert.equal(new Set(draw.map(a => a.id)).size, 3);
    if (new Set(draw.map(a => a.grade)).size === 1) matchingGrades++;
    assert.equal(new Set(draw.map(a => ctx.CONTENT.advances.cards[a.id].category)).size, 3);
    for (const a of draw) {
      counts[a.grade]++; names.add(a.id);
      assert.notEqual(ctx.CONTENT.advances.cards[a.id].requires, 'coast');
      assert.deepEqual(Object.keys(a).sort(), a.target ? ['grade', 'id', 'target'] : ['grade', 'id']);
      if (a.target) assert.equal(a.target, c.rival);
    }
  }
  counts.forEach((n, g) => { const p = ctx.CONTENT.rarities[g].odds;
    assert.ok(Math.abs(n - 9000 * p) <= 5 * Math.sqrt(9000 * p * (1 - p)) + 1);
  });
  const matchingChance = ctx.CONTENT.rarities.reduce((n, r) => n + r.odds ** 3, 0);
  assert.ok(Math.abs(matchingGrades / 3000 - matchingChance) < 0.035, 'card rarities must roll independently');
  assert.ok(names.size > 20);
  c.allies.add('FRA');
  let targeted;
  for (let i = 0; i < 100 && !targeted; i++) targeted = s.drawTest(c).find(a => a.target);
  assert.ok(targeted); assert.notEqual(targeted.target, 'FRA');
  const neighbours = [...new Set(s.regionsOf(c).flatMap(r => r.nb.map(i => s.regions[i].owner)))].filter(t => t !== c.tag && !c.allies.has(t));
  const strongest = neighbours.sort((a, b) => s.strength(s.C[b]) - s.strength(s.C[a]))[0];
  assert.equal(targeted.target, strongest);
  c.advances = Object.entries(ctx.CONTENT.advances.cards).filter(([, d]) => d.category === 'military').map(([id]) => ({ id, grade: 0 }));
  const draw = s.drawTest(c); assert.equal(draw.length, 3); assert.equal(new Set(draw.map(a => a.id)).size, 3);
  assert.ok(draw.every(a => !c.advances.some(b => b.id === a.id)));
  s.regionsOf(c).forEach(r => r.nb = []);
  assert.ok(s.drawTest(c).every(a => ['any'].includes(ctx.CONTENT.advances.cards[a.id].requires)));
});

test('seven-card stacks compound with rulers at all five rarities; succession preserves acquisitions', () => {
  const { ctx, create } = engine(), s = create(7, { player: 'FRA' }); s.chooseHeir(0); s.chooseAdvance(0); blank(s);
  const c = s.C.FRA, ids = ['generalStaff', 'rifling', 'medicine', 'siegeTrain', 'engineering', 'staffColleges', 'expeditionary'];
  for (let grade = 0; grade < 5; grade++) {
    c.advances = []; c.ruler.fx = { fight: 1.5, factoryCost: 0.7, horizon: 4 };
    for (const id of ids) grant(c, id, grade);
    const expected = ids.reduce((n, id) => n * (ctx.CONTENT.advances.cards[id].effects.find(e => e.fx === 'fight')?.values[grade] || 1), 1.5);
    close(s.fxTest(c, 'fight'), expected);
    close(s.fxTest(c, 'horizon'), 4 + ctx.CONTENT.advances.cards.staffColleges.effects[0].values[grade]);
    const owned = json(c.advances);
    s.pending = { type: 'heir', tag: c.tag, options: [{ ...c.ruler, fx: { fight: 1.1 } }] }; s.chooseHeir(0);
    assert.equal(json(c.advances), owned); close(s.fxTest(c, 'fight'), expected / 1.5 * 1.1);
  }
  for (let grade = 0; grade < 5; grade++) {
    c.advances = []; c.ruler.fx = { factoryCost: 0.6 };
    for (const id of ['industry', 'industrialCredit', 'railwayProcurement', 'industrialStandards', 'domesticMarkets', 'precisionEngineering', 'landSurvey']) grant(c, id, grade);
    assert.ok(s.fxTest(c, 'factoryCost') > 0 && s.fxTest(c, 'factoryCost') < 0.6);
  }

  for (let grade = 0; grade < 5; grade++) {
    c.advances = []; c.ruler.fx = { horizon: 4, integrate: 1.3, integrateOther: 1.2 };
    const planning = ['staffColleges', 'industrialCredit', 'nationalSchools', 'technicalUniversities', 'warMinistry', 'industry', 'landSurvey'];
    for (const id of planning) grant(c, id, grade);
    const added = planning.reduce((n, id) => n + (ctx.CONTENT.advances.cards[id].effects.find(e => e.fx === 'horizon')?.values[grade] || 0), 0);
    close(s.horizon(c), Math.round(ctx.CONTENT.rules.horizon.min + c.ruler.pat * ctx.CONTENT.rules.horizon.span + 4 + added));
    c.advances = [];
    for (const id of ['siegeTrain', 'expeditionary', 'integration', 'provincialRights', 'consularService', 'exportHouses', 'technicalUniversities']) grant(c, id, grade);
    const multiplier = key => c.advances.reduce((n, a) => n * (ctx.CONTENT.advances.cards[a.id].effects.find(e => e.fx === key)?.values[grade] || 1), c.ruler.fx[key]);
    const r = s.regionsOf(c)[0]; r.culture = 'turkish'; r.core = 'RUS';
    close(s.settleTest(r, c), 9 / multiplier('integrate') / multiplier('integrateOther'));
    r.core = c.tag; close(s.settleTest(r, c), 4 / multiplier('integrate'));
  }
});

test('factory/reform/recruit forecasts and execution share price, earnings and headcount effects', () => {
  const { ctx, create } = engine(), s = create(); blank(s); const c = s.C.FRA; c.treasury = 10000;
  const base = s.considerations(c).find(a => a.type === 'factory'); assert.ok(base);
  grant(c, 'industry'); grant(c, 'landSurvey'); grant(c, 'parliament'); grant(c, 'welfare');
  const next = s.considerations(c).find(a => a.type === 'factory' && a.r.id === base.r.id);
  close(next.cost / base.cost, ctx.CONTENT.advances.cards.industry.effects[0].values[2]); assert.ok(next.ev >= base.ev);
  let gold = c.treasury; s.actTest(c, next); close(gold - c.treasury, next.cost);
  const r = s.regionsOf(c)[0]; r.unrest = 80; const unrest = r.unrest;
  gold = c.treasury; s.actTest(c, { type: 'reform' }); close(gold - c.treasury, ctx.CONTENT.rules.reform.cost * ctx.CONTENT.advances.cards.parliament.effects[0].values[2]);
  close(r.unrest, Math.max(0, unrest - ctx.CONTENT.rules.reform.calm * ctx.CONTENT.advances.cards.welfare.effects[0].values[2]));
  const army = c.army; gold = c.treasury; s.actTest(c, { type: 'army', amt: 10 });
  close(c.army, army + 10); close(gold - c.treasury, ctx.CONTENT.rules.price.recruit * 10);
  const before = s.regionIncome(r, c).tax; grant(c, 'domesticMarkets');
  close(s.regionIncome(r, c).tax / before, ctx.CONTENT.advances.cards.domesticMarkets.effects[0].values[2]);
  r.culture = 'turkish'; close(s.regionIncome(r, c).tax / before, 1);
});

test('general and foreign speed combine only on foreign non-core land, in forecast and actual progress', () => {
  const { ctx, create } = engine(), s = create(); blank(s); const c = s.C.FRA, r = s.regionsOf(c)[0];
  grant(c, 'integration'); grant(c, 'provincialRights');
  for (const [foreign, core] of [[true, false], [true, true], [false, false]]) {
    r.culture = foreign ? 'turkish' : c.culture; r.core = core ? c.tag : 'RUS'; r.integ = 0.1;
    const speed = ctx.CONTENT.advances.cards.integration.effects[0].values[2] * (foreign && !core ? ctx.CONTENT.advances.cards.provincialRights.effects[0].values[2] : 1);
    close(s.settleTest(r, c), (foreign && !core ? 9 : 4) / speed);
    s.provincesTest(); close(r.integ - 0.1, (foreign && !core ? ctx.CONTENT.rules.integrate.other : ctx.CONTENT.rules.integrate.kin) * speed);
  }
});

test('named-neighbour strength reaches forecasts and actual combat; casualty bonus remains global', () => {
  const { ctx, create } = engine(), a = create(6), b = create(6); blank(a); blank(b);
  function setup(s){
    s.wars = []; s.C.FRA.allies.clear(); s.C.SPA.allies.clear(); s.C.FRA.truce = {}; s.C.SPA.truce = {};
    s.C.FRA.army = 60; s.C.SPA.army = 50; s.majors = [];
    s.regions.forEach(r => { r.fort = 0; r.nb = []; });
    const x = s.regionsOf(s.C.FRA)[0], y = s.regionsOf(s.C.SPA)[0]; x.nb = [y.i]; y.nb = [x.i];
    return y;
  }
  const goal = setup(a); setup(b); grant(b.C.FRA, 'warCollege', 2, 'SPA');
  close(b.strength(b.C.FRA) / a.strength(a.C.FRA), 1);
  close(b.strength(b.C.FRA, b.C.SPA) / a.strength(a.C.FRA, a.C.SPA), ctx.CONTENT.advances.cards.warCollege.effects[0].values[2]);
  close(b.strength(b.C.FRA, ['SPA', 'RUS']) / a.strength(a.C.FRA), ctx.CONTENT.advances.cards.warCollege.effects[0].values[2]);
  close(b.fxTest(b.C.FRA, 'bleed'), ctx.CONTENT.advances.cards.warCollege.effects[1].values[2]);
  const ea = a.warEvalTest(a.C.FRA, a.C.SPA, goal), eb = b.warEvalTest(b.C.FRA, b.C.SPA, b.RB[goal.id]);
  assert.ok(eb.pTrue > ea.pTrue);
  for (const s of [a, b]) s.wars = [{ id: 1, name: 'test', att: ['FRA'], def: ['SPA'], goal: goal.id, quarters: 0, score: 0, battles: 0 }];
  a.tickWarTest(); b.tickWarTest();
  assert.ok(b.C.FRA.army >= a.C.FRA.army);
  assert.ok(b.wars[0].battles > a.wars[0].battles);
});

test('targeted forecasts exclude unavailable allies and include a prospective defender', () => {
  const { create } = engine(), s = create(); blank(s);
  const a = s.C.FRA, d = s.C.SPA, ally = s.C.GBR;
  a.allies.clear(); d.allies.clear(); d.allies.add(ally.tag);
  assert.ok(s.foesTest(d, a).includes(ally.tag));
  s.wars = [{ att: ['GBR'], def: ['RUS'] }];
  assert.ok(!s.foesTest(d, a).includes(ally.tag));
  s.wars = []; d.allies.clear(); assert.ok(s.foesTest(d, a, ally).includes(ally.tag));
  a.allies.add(ally.tag); assert.ok(!s.foesTest(d, a, ally).includes(ally.tag));
});

test('core-land fighting is conditional in forecasts and combat, including recovery wars', () => {
  const { create } = engine();
  for (const core of ['SPA', 'FRA', 'POR']) {
    const a = create(6), b = create(6); blank(a); blank(b);
    let goal;
    for (const s of [a, b]) {
      const x = s.regionsOf(s.C.FRA)[0], y = s.regionsOf(s.C.SPA)[0]; goal = y.id;
      s.C.FRA.army = 60; s.C.SPA.army = 50; s.C.FRA.allies.clear(); s.C.SPA.allies.clear();
      s.C.FRA.truce = {}; s.C.SPA.truce = {}; s.majors = [];
      s.regions.forEach(r => { r.nb = []; r.fort = 0; }); x.nb = [y.i]; y.nb = [x.i]; y.core = core;
    }
    const owner = core === 'SPA' ? 'SPA' : 'FRA'; grant(b.C[owner], 'homeGuard');
    const before = a.warEvalTest(a.C.FRA, a.C.SPA, a.RB[goal]), after = b.warEvalTest(b.C.FRA, b.C.SPA, b.RB[goal]);
    if (core === 'POR') close(before.pTrue, after.pTrue);
    else if (core === 'FRA') assert.ok(after.pTrue > before.pTrue);
    else assert.ok(!after || after.pTrue < before.pTrue);
    for (const s of [a, b]) s.wars = [{ id: 1, name: 'test', att: ['FRA'], def: ['SPA'], goal, quarters: 0, score: 0, battles: 0 }];
    a.tickWarTest(); b.tickWarTest();
    if (core === 'POR') assert.equal(json(a.wars), json(b.wars));
    else if (core === 'FRA') assert.ok(b.C.FRA.army >= a.C.FRA.army);
    else assert.ok(b.C.SPA.army >= a.C.SPA.army);
  }
});

test('scheduled opportunities are delivered once to living nations, no catch-up; pending succession is preserved', () => {
  const { create } = engine(), s = create(3, { player: 'FRA' }); s.chooseHeir(0); s.chooseAdvance(0);
  s.t = 48; s.year = 1848; s.q = 0;
  s.pending = { type: 'heir', tag: 'FRA', options: [{ ...s.C.FRA.ruler }], why: '' };
  s.offerTest(); assert.equal(s.pending.type, 'heir');
  assert.ok(s.alive().filter(c => !c.player).every(c => c.advances.length === 2));
  s.chooseHeir(0); assert.equal(s.pending.type, 'advance'); assert.equal(s.pending.year, 1848); s.chooseAdvance(0);
  s.offerTest(); assert.ok(s.alive().every(c => c.advances.length === 2));
  s.year = 1861; s.q = 0; s.offerTest(); assert.ok(s.alive().every(c => c.advances.length === 2));
  s.year = 1908; s.offerTest(); s.chooseAdvance(0); assert.equal(s.nextAdvanceYear(), null);
});

// Exercise actual UI formatters repeatedly in a DOM stub, without a browser or randomness.
test('chooser, nation hovers, top bar and generated Almanac render without changing simulation state', () => {
  const { ctx, create } = engine(); const s = create(7, { player: 'FRA' }); s.chooseHeir(0); ctx.S = s;
  const els = {}, element = () => ({ innerHTML: '', textContent: '', style: {}, dataset: {}, classList: { add(){}, remove(){}, contains(){return false;} }, querySelector(){return {focus(){}};}, querySelectorAll(){return [];}, addEventListener(){}, focus(){} });
  ctx.$ = id => els[id] ||= element(); ctx.document = { querySelectorAll: () => [] };
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../src/ui/registry.js'), 'utf8') + '\nlet selected="FRA"; const fmt=v=>Math.round(v).toLocaleString("en"); const nameSpan=t=>S.C[t].name;\n' + fs.readFileSync(require('node:path').join(__dirname, '../src/ui/panel.js'), 'utf8') + fs.readFileSync(require('node:path').join(__dirname, '../src/ui/almanac.js'), 'utf8'), ctx);
  const before = json(s);
  for (let i = 0; i < 3; i++) vm.runInContext('showAdvance(); renderAdvanceProgress(); SECTIONS.advances.render();', ctx);
  assert.equal(json(s), before); assert.match(els.heirTitle.innerHTML, /Choose a development/);
  assert.equal((els.heirCards.innerHTML.match(/class="fx /g) || []).length <= 6, true);
  assert.equal(els.rerolls.hidden, true);
  assert.match(els.advanceProgress.innerHTML, /1836/);
  s.chooseAdvance(0); const hover = vm.runInContext('advanceLines(S.C.FRA.advances[0]).join(". ")', ctx);
  assert.ok(hover.length); assert.doesNotMatch(hover, /undefined|NaN|\{/);
  const acquired = json(s);
  for (const tag of ['FRA', 'PRU']) {
    vm.runInContext(`selected='${tag}'; renderNation(); renderNation();`, ctx);
    assert.equal((els.side.innerHTML.match(/class="advance-row"/g) || []).length, 1);
    assert.equal((els.side.innerHTML.match(/class="advance-badge"/g) || []).length, s.C[tag].advances.length);
    for (const a of s.C[tag].advances) {
      assert.ok(els.side.innerHTML.includes(ctx.CONTENT.advances.cards[a.id].name));
      assert.ok(els.side.innerHTML.includes(ctx.CONTENT.rarities[a.grade].color));
    }
  }
  assert.equal(json(s), acquired);
  vm.runInContext('renderAdvanceProgress()', ctx); assert.match(els.advanceProgress.innerHTML, /1848/);
  assert.ok(s.log.at(-1).h.includes(ctx.CONTENT.advances.cards[s.C.FRA.advances[0].id].name));
});

test('complete watch and player games reach autumn armistice without lost, duplicate or retrospective choices', () => {
  const { ctx, create } = engine();
  for (const player of [null, 'FRA', 'PRU']) {
    const s = create(7, player ? { player } : {}), awards = [], opportunities = new Map(); let n = 0;
    while (!s.over) {
      assert.ok(n++ < 600);
      if (s.pending) {
        if (s.pending.type === 'heir') s.chooseHeir(0);
        else { awards.push(s.pending.year); s.chooseAdvance(0); }
      } else {
        if (s.q === ctx.CONTENT.advances.season && ctx.CONTENT.advances.years.includes(s.year)) for (const c of s.alive()) {
          assert.equal(c.advanceYear, s.year, `${c.tag} missed a scheduled opportunity`);
          opportunities.set(c, c.advances.length);
        }
        s.step();
      }
      for (const c of s.alive()) { assert.ok(Number.isFinite(c.treasury) && Number.isFinite(s.strength(c))); assert.equal(new Set(c.advances.map(a => a.id)).size, c.advances.length); }
    }
    assert.equal(s.year, 1918); assert.equal(s.q, ctx.CONTENT.rules.end.season); assert.equal(s.nextAdvanceYear(), null);
    if (player && s.C[player].alive) assert.deepEqual(awards, plain(ctx.CONTENT.advances.years));
    for (const [c, count] of opportunities) assert.ok(c.advances.length >= count);
  }
});
