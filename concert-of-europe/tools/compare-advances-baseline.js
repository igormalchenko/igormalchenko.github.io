// Full-state and full-Chronicle parity with scheduled advances disabled in this test VM only.
// node tools/compare-advances-baseline.js /path/to/baseline/game [seed ...]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const baseline = path.resolve(process.argv[2]);
const old = require(path.join(baseline, 'tools/load'))();
const ctx = {}; vm.createContext(ctx);
vm.runInContext(require('./load').simSource() + '\nCONTENT.advances.years=[];this.createSim=createSim;', ctx);
const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json')));
const serialize = s => JSON.stringify(s, (k, v) => ['advances', 'advanceYear'].includes(k) ? undefined :
  Object.prototype.toString.call(v) === '[object Set]' ? [...v] : v);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
for (const seed of (process.argv.slice(3).length ? process.argv.slice(3).map(Number) : [7])) {
  const before = old.createSim(seed), after = ctx.createSim(seed, geo);
  while (!before.over) before.step(); while (!after.over) after.step();
  assert.equal(JSON.stringify(after.log), JSON.stringify(before.log), `seed ${seed}: Chronicle changed`);
  assert.equal(serialize(after), serialize(before), `seed ${seed}: final state changed`);
  console.log(`seed ${seed}: full Chronicle and final state match; SHA-256 ${hash(serialize(after))}`);
}
