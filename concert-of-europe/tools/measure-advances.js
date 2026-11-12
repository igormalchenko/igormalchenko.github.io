// Paired full player games: prefer Military vs Economy offers, always choose the first heir.
// Policies select only from real offers. Reports actual minister actions, never forecast scores.
// node tools/measure-advances.js [seed] [nation]
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
if (!isMainThread) {
  const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
  const ctx = {}; vm.createContext(ctx);
  const source = require('./load').simSource().replace('function act(c, a){',
    'function act(c, a){ if (c.player) { S.trialActions ||= {}; S.trialActions[a.type] = (S.trialActions[a.type] || 0) + 1; }');
  vm.runInContext(source + '\nthis.createSim=createSim;this.CONTENT=CONTENT;', ctx);
  const { createSim, CONTENT } = ctx, geo = JSON.parse(fs.readFileSync(path.join(__dirname, '../map/geo.json')));
  const { seed, player, category } = workerData, s = createSim(seed, geo, { player });
  const choices = []; let heirs = 0;
  while (!s.over) {
    if (s.pending) {
      if (s.pending.type === 'heir') { heirs++; s.chooseHeir(0); }
      else {
        const p = s.pending, i = p.options.findIndex(a => CONTENT.advances.cards[a.id].category === category);
        const a = p.options[Math.max(0, i)]; choices.push({ year: s.year, ...a }); s.chooseAdvance(Math.max(0, i));
      }
    } else {
      s.step();
    }
  }
  parentPort.postMessage({ seed, player, category, choices, heirs, actions: s.trialActions, alive: s.C[player].alive,
    end: [s.year, s.SEASONS[s.q]], goldPerYear: +s.score(s.C[player]).toFixed(2), provinces: s.regionsOf(s.C[player]).length, wars: s.stats.wars });
} else {
  const data = require('./content').load();
  const seed = +(process.argv[2] || 7), player = process.argv[3] || Object.keys(data.nations).find(t => data.nations[t].starts);
  Promise.all(['military', 'economy'].map(category => new Promise((resolve, reject) => {
    const w = new Worker(__filename, { workerData: { seed, player, category } }); w.on('message', resolve); w.on('error', reject);
  }))).then(results => console.log(JSON.stringify(results, null, 2))).catch(e => { console.error(e); process.exitCode = 1; });
}
