// Behavioral checks for this standalone experiment. No dependency on the parent game.
const assert = require('node:assert/strict');
const { createSim, CONTENT, say } = require('./load')();
const card = id => CONTENT.advances.cards.find(a => a.id === id);
const setup = (tag = 'FRA', seed = 1848) => { const s = createSim(seed, { player: tag }); s.chooseHeir(0); assert.equal(s.pending.type, 'advance'); return s; };
const grant = (s, id, extra = {}) => {
  const a = { ...card(id), ...extra }; a.effect = say(a.effect, { ...a, nation: extra.target ? CONTENT.nations[extra.target].name : '' });
  s.pending = { type: 'advance', tag: s.player, options: [a] }; assert.equal(s.chooseAdvance(0), true);
};
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const clean = s => JSON.stringify(s, (k, v) => Object.prototype.toString.call(v) === '[object Set]' ? [...v] : v);

// Initial offers pause time, contain three distinct applicable cards, and reject invalid input.
{
  const s = setup('POR'); const t = s.t;
  assert.equal(s.pending.options.length, 3);
  assert.equal(new Set(s.pending.options.map(a => a.id)).size, 3);
  assert.ok(s.pending.options.every(a => !a.effect.includes('{')));
  s.step(); assert.equal(s.t, t);
  for (const i of [-1, 3, 0.5, NaN]) assert.equal(s.chooseAdvance(i), false);
  s.chooseAdvance(0); assert.equal(s.C.POR.advances.length, 1); assert.equal(s.nextAdvanceYear(), 1848);
  assert.equal(s.chooseAdvance(0), false);
}

// Reading any number of previews changes neither state nor the future simulation.
{
  const a = setup(), b = setup(); const before = clean(a);
  for (let i = 0; i < 3; i++) { a.previewAdvance(i); a.previewAdvance(i); }
  assert.ok(clean(a) === before, 'Preview mutated simulation state');
  a.chooseAdvance(1); b.chooseAdvance(1);
  for (let i = 0; i < 12; i++) { a.step(); b.step(); }
  assert.ok(clean(a) === clean(b), 'Preview changed future simulation');
}

// Factory bonuses affect both the forecast cost and the money actually spent by ministers.
{
  const s = setup(); const c = s.C.FRA; c.treasury = 1000;
  const before = s.considerations(c).filter(a => a.type === 'factory'); assert.ok(before.length);
  grant(s, 'industry');
  const after = s.considerations(c).filter(a => a.type === 'factory');
  for (const a of after) { const b = before.find(b => b.r.i === a.r.i); close(a.cost, b.cost * card('industry').fx.factoryCost); assert.ok(a.ev >= b.ev); }
  s.step();
  const builds = c.didThisSeason.filter(a => a.type === 'factory'); assert.ok(builds.length, 'Ministers should build at least one factory');
  const costs = builds.reduce((n, a) => n + after.find(b => b.r.i === a.r).cost, 0);
  // Population grows before ministers act, very slightly changing the catch-up price.
  assert.ok(Math.abs(c.spent.build - costs) < costs * 0.001, 'Actual factory spending must reflect the discount');
}

// Combat advantages affect real strength, compound, and survive succession.
{
  const s = setup(); const c = s.C.FRA, other = s.C.SPA;
  const base = s.strength(c), otherBase = s.strength(other);
  grant(s, 'rifling'); close(s.strength(c), base * card('rifling').fx.fight); close(s.strength(other), otherBase);
  grant(s, 'medicine');
  const combined = card('rifling').fx.fight * card('medicine').fx.fight;
  close(s.strength(c), base * combined);
  const saved = JSON.stringify(c.advances);
  s.pending = { type: 'heir', tag: c.tag, options: [{ ...c.ruler, name: 'Test successor', fx: { fight: 1.3, upkeep: 1 } }], why: 'Test succession' };
  s.chooseHeir(0); assert.equal(JSON.stringify(c.advances), saved);
  const augmented = s.strength(c); const a = c.advances; c.advances = []; const plain = s.strength(c); c.advances = a;
  close(augmented / plain, combined);
}

// Targeted advantages only alter strength against the chosen nation, including coalition contexts.
{
  const s = setup('POR'); const c = s.C.POR, base = s.strength(c);
  grant(s, 'warCollege', { target: 'SPA' });
  close(s.strength(c), base); close(s.strength(c, s.C.SPA), base * card('warCollege').targetFight);
  close(s.strength(c, ['SPA', 'FRA']), base * card('warCollege').targetFight); close(s.strength(c, s.C.FRA), base);
}

// A planning card changes the actual horizon and the forecast return on industrial investment.
{
  const s = setup(); const c = s.C.FRA; c.treasury = 1000;
  const horizon = s.horizon(c), before = s.considerations(c).find(a => a.type === 'factory'); assert.ok(before);
  grant(s, 'industrialCredit');
  assert.equal(s.horizon(c), horizon + card('industrialCredit').fx.horizon);
  const after = s.considerations(c).find(a => a.type === 'factory' && a.r.i === before.r.i);
  assert.ok(after.ev > before.ev, 'The longer horizon and cheaper construction must affect investment forecasts');
}
// No unimplemented or coronation-only bonuses can enter the refreshed pool.
{
  const supported = new Set(['fight', 'upkeep', 'bleed', 'homeFight', 'fortCost', 'factoryCost', 'trade', 'earns', 'taxes', 'ownTaxes', 'reformCost', 'reformCalm', 'integrate', 'integrateOther', 'horizon']);
  assert.equal(CONTENT.advances.cards.length, 30);
  assert.equal(new Set(CONTENT.advances.cards.map(a => a.id)).size, 30);
  for (const a of CONTENT.advances.cards) {
    assert.ok(Object.keys(a.fx).every(k => supported.has(k)), `${a.id} has an unsupported bonus`);
    assert.ok(Object.keys(a.fx).length || a.targetFight, `${a.id} has no effect`);
  }
}
// A redesigned military card must change an actual governor action, not only a displayed score.
{
  const control = setup('PRU', 7), campaign = setup('PRU', 7);
  control.pending.options = [{ id: 'control', name: 'Control', effect: 'No bonus', fx: {} }]; control.chooseAdvance(0);
  grant(campaign, 'warMinistry');
  control.step(); campaign.step();
  assert.ok(!control.C.PRU.didThisSeason.some(a => a.type === 'war'), 'Control unexpectedly invaded');
  assert.ok(campaign.C.PRU.didThisSeason.some(a => a.type === 'war'), 'War Ministry should unlock an actual invasion in this scenario');
}
console.log('Advance lifecycle, preview purity, real costs, combat, targeting, planning, card coverage and succession checks passed.');

// Complete games exercise simultaneous succession/advance scheduling, elimination, and all seven offers.
for (const [tag, seed] of [['FRA', 7], ['PRU', 41], ['POR', 1848]]) {
  const s = createSim(seed, { player: tag }); const years = []; let turns = 0, successions = 0;
  while (!s.over) {
    assert.ok(turns++ < 500, 'Game stalled');
    if (s.pending) {
      if (s.pending.type === 'heir') { successions++; s.chooseHeir(0); }
      else {
        assert.equal(s.pending.type, 'advance'); assert.equal(s.pending.year, CONTENT.advances.years[years.length]);
        assert.ok(s.pending.options.every(a => !s.C[tag].advances.some(b => a.id === b.id)));
        assert.equal(s.pending.options.length, 3);
        if (!s.regionsOf(s.C[tag]).some(r => r.coast)) assert.ok(s.pending.options.every(a => a.id !== 'shipping'));
        for (let i = 0; i < 3; i++) assert.ok(s.previewAdvance(i));
        years.push(s.year); s.chooseAdvance(seed % 3);
      }
    } else s.step();
    for (const c of s.alive()) assert.ok(Number.isFinite(c.treasury) && Number.isFinite(s.strength(c)), `${c.tag} became nonfinite`);
  }
  assert.equal(s.year, CONTENT.rules.end.year);
  if (s.C[tag].alive) assert.deepEqual(years, Array.from(CONTENT.advances.years));
  console.log(`${tag}, world ${seed}: finished in ${s.year}, ${years.length} advances, ${successions} ruler choices, ${s.C[tag].alive ? 'survived' : 'eliminated'}.`);
}
