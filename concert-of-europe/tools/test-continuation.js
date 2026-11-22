const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { fixtureEngine } = require('./fixtures');
const json = value => JSON.stringify(value, (key, v) => Object.prototype.toString.call(v) === '[object Set]' ? [...v] : v);
function engine(){
  const f = fixtureEngine({ historyLimits: 'CONTINUATION_HISTORY' });
  // The mechanic fixture moves historical events beyond the ending. Keep them expired here too.
  for (const e of Object.values(f.C.events)) if (!['opening', 'closing'].includes(e.phase))
    e.schedule.from = e.schedule.to = f.C.rules.start - 1;
  return f;
}
function resolve(s){
  while (s.pending) {
    assert.ok(s.pending.options.length);
    assert.equal((s.pending.type === 'heir' ? s.chooseHeir : s.chooseAdvance)(0), true);
  }
}
function finish(s){
  for (let n = 0; !s.over; n++) { assert.ok(n < 1000); resolve(s); s.step(); }
}

test('continuation preserves the completed armistice and advances its boundary exactly once', () => {
  const { create, C } = engine(), s = create(7);
  let before = json(s); assert.equal(s.continueGame(), false); assert.equal(json(s), before);
  finish(s);
  assert.equal(s.year, C.rules.end.year); assert.equal(s.q, C.rules.end.season);
  assert.equal(s.continued, false); assert.equal(s.wars.length, 0);
  before = json(s); s.step(); assert.equal(json(s), before);
  const t = s.t, countries = json(s.C), regions = json(s.regions), stats = json(s.stats);
  const log = json(s.log), history = json(s.history);
  s.modifiers.push({ fx: 'earns', value: 0.8, until: t + 1 });
  assert.equal(s.continueGame(), true);
  assert.equal(s.over, false); assert.equal(s.continued, true); assert.equal(s.phase, 'season');
  assert.equal(s.t, t + 1); assert.equal(s.year, C.rules.start + Math.floor((t + 1) / 4));
  assert.equal(s.q, (t + 1) % 4); assert.equal(s.nextAdvanceYear(), null);
  assert.equal(json(s.C), countries); assert.equal(json(s.regions), regions); assert.equal(json(s.stats), stats);
  assert.equal(json(s.log), log); assert.equal(json(s.history), history); assert.equal(s.modifiers.length, 0);
  before = json(s); assert.equal(s.continueGame(), false); assert.equal(json(s), before);
  s.step(); assert.equal(s.t, t + 2); assert.equal(s.over, false);
});

test('continued player successions pause and resume without collecting income twice', () => {
  const { create } = engine(), s = create(7, { player: 'D' }); finish(s);
  s.continueGame(); const c = s.C.D; assert.equal(c.alive, true);
  c.ruler.until = s.t; c.crisis.until = -1; s.regionsOf(c).forEach(r => r.unrest = 0);
  s.rerolls.heir = 0;
  const t = s.t; s.step();
  assert.equal(s.pending.type, 'heir'); assert.equal(s.phase, 'closing'); assert.equal(s.t, t);
  const before = json(s); s.step(); assert.equal(json(s), before);
  assert.equal(s.reroll(), false); assert.equal(s.chooseHeir(0), true);
  const gold = c.treasury; s.step();
  assert.equal(s.t, t + 1); assert.equal(c.treasury, gold); assert.equal(s.pending, null);
});

test('continuation bounds display history before rendering and retains the newest records', () => {
  const { create, ctx } = engine(), s = create(); finish(s);
  const limits = s.historyLimits, t = s.t;
  s.log = Array.from({ length: limits.log + 20 }, (_, i) => ({ y: s.year, q: s.q, t: 'event', h: `Record ${i}` }));
  s.history = Array.from({ length: 200000 }, (_, i) => ({ y: s.year - 199999 + i, p: { A: i + 1 } }));
  s.marks = [10, 4, 3, 0].map(age => ({ i: 0, type: 'revolt', t: t - age }));
  const newestLog = s.log.at(-1), newestYear = s.history.at(-1);
  s.continueGame();
  assert.equal(s.log.length, limits.log); assert.equal(s.log.at(-1), newestLog);
  assert.equal(s.history.length, limits.years); assert.equal(s.history.at(-1), newestYear);
  assert.deepEqual(Array.from(s.marks, m => s.t - m.t), [4, 1]);
  ctx.S = s;
  const els = {}; ctx.$ = id => els[id] ||= { innerHTML: '', style: {} };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/ui/registry.js'), 'utf8') +
    '\nlet selected="A"; const fmt=v=>Math.round(v).toLocaleString("en"); const nameSpan=t=>S.C[t].name;\n' +
    fs.readFileSync(path.join(__dirname, '../src/ui/panel.js'), 'utf8'), ctx);
  assert.doesNotThrow(() => vm.runInContext('renderNation(); renderPowers();', ctx));
  assert.doesNotMatch(els.side.innerHTML + els.powers.innerHTML, /NaN|undefined/);
  // Cross another annual boundary to exercise ongoing pruning, not just the Continue action.
  s.log.push(...Array.from({ length: 20 }, () => newestLog));
  s.t += 3; s.q = 3; s.step();
  assert.equal(s.history.length, limits.years); assert.equal(s.history.at(-1).y, s.year - 1);
  assert.ok(s.log.length <= limits.log); assert.ok(s.marks.every(m => s.t - m.t <= limits.marks));
});

test('ordinary worlds retain their full display history', () => {
  const { create } = engine(), s = create(), limits = s.historyLimits;
  const oldestLog = s.log[0], oldestYear = s.history[0], oldMark = { i: 0, type: 'revolt', t: -100 };
  s.log.push(...Array.from({ length: limits.log }, () => oldestLog));
  s.history.push(...Array.from({ length: limits.years }, () => oldestYear)); s.marks.push(oldMark);
  s.step();
  assert.equal(s.continued, false); assert.ok(s.log.length > limits.log); assert.equal(s.log[0], oldestLog);
  assert.ok(s.history.length > limits.years); assert.equal(s.history[0], oldestYear); assert.ok(s.marks.includes(oldMark));
});

test('watch and player worlds continue to year 5000 with finite state and bounded history', () => {
  for (const player of [null, 'D']) {
    const { create } = engine(), s = create(7, player ? { player } : {}); finish(s); s.continueGame();
    let calls = 0;
    while (s.year < 5000) {
      assert.ok(calls++ < 16000); resolve(s);
      const t = s.t; s.step(); assert.equal(s.over, false);
      assert.ok(s.t === t + 1 || (s.t === t && s.pending && s.phase === 'closing'));
      if (calls % 100 === 0) for (const c of s.alive()) {
        assert.ok(Number.isFinite(c.treasury)); assert.ok(Number.isFinite(s.score(c))); assert.ok(Number.isFinite(s.strength(c)));
      }
    }
    assert.ok(s.log.length <= s.historyLimits.log); assert.equal(s.history.length, s.historyLimits.years);
    assert.equal(s.nextAdvanceYear(), null);
  }
});
