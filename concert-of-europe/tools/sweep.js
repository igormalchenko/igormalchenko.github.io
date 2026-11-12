// Plays many worlds headlessly and prints one line per world, then the averages.
//   npm run sweep -- 1 13            seeds 1..12, on every core
//   npm run sweep -- 1 13 --jobs 1   one world at a time
// Each world depends only on its seed, so the worlds run in parallel (one worker thread per core) and the output,
// printed in seed order, is the same whatever the number of jobs.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
// Tracking is an optional, validated command argument; no shipping nation is part of the tool.
const CONTENT = require('./content').load(), args = process.argv.slice(2), wi = args.indexOf('--watch');
require('./validate').assertContent(CONTENT);
const WATCH = isMainThread ? (wi < 0 ? null : args.splice(wi,2)[1]) : workerData.watch;
if (isMainThread && wi >= 0 && !WATCH) throw new Error('--watch requires a nation ID');
if (WATCH && !Object.hasOwn(CONTENT.nations,WATCH)) throw new Error(`Unknown --watch nation: ${WATCH}`);
const WATCHED = WATCH ? CONTENT.nations[WATCH].name : 'Watched nation', END = CONTENT.rules.end.year;

// one world, start to armistice: its line and what the averages need
function playWorld(createSim, seed){
  const t0 = Date.now();
  const S = createSim(seed); while (!S.over) S.step();
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const ua = S.C[WATCH], uaAlive = !!(ua && ua.alive);
  const unions = S.UNIONS.filter(d => d.done).map(d => d.id);
  // ambitions: the richest great power, unions still held at the armistice, survivors of those who only had to survive
  const all = Object.values(S.C), amb = c => S.ambitionOf(c);
  const rich = cs.find(c => amb(c).kind === 'richest');
  const held = all.filter(c => amb(c).kind === 'unite' && amb(c).state === 'met').map(c => amb(c).id);
  const survK = all.filter(c => amb(c).kind === 'survive'), surv = survK.filter(c => c.alive);
  const line = `seed ${seed}  ${S.year} ${S.SEASONS[S.q]}  wars ${S.stats.wars}  revolts ${S.stats.revolts}  dead ${Math.round(S.stats.dead || 0)}m  ` +
    `${WATCH ? WATCHED + ' ' + (ua ? (uaAlive ? 'alive' : 'died') : 'never') + '  ' : ''}unions ${unions.join(',') || '-'} (held ${held.join(',') || '-'})  survived ${surv.length}/${survK.length}  ` +
    `richest power ${rich ? rich.name : '-'}  top ${cs[0].name} (${Math.round(S.score(cs[0]))})  ${Date.now() - t0}ms`;
  return { seed, line, wars: S.stats.wars, revolts: S.stats.revolts, uaAlive, top: cs[0].name, rich: rich ? rich.name : null,
    unions, held, surv: surv.length, survOf: survK.length };
}

if (!isMainThread) {
  const { createSim } = require('./load')();
  parentPort.on('message', seed => parentPort.postMessage(playWorld(createSim, seed)));
} else {
  const ji = args.indexOf('--jobs');
  const jobsArg = ji >= 0 ? +args.splice(ji, 2)[1] : 0;
  const from = +(args[0] || 1), to = +(args[1] || from + 10), n = to - from;
  const jobs = Math.max(1, Math.min(n, jobsArg || os.cpus().length));
  const results = new Array(n);
  let next = from, printed = 0;

  // print every finished world in seed order, then the averages once all are in
  function flush(){
    while (printed < n && results[printed]) console.log(results[printed++].line);
    if (printed < n) return;
    const agg = { wars: 0, revolts: 0, ua: 0, winners: {}, rich: {}, held: {}, proclaimed: {}, surv: 0, survOf: 0 };
    results.forEach(r => {
      agg.wars += r.wars; agg.revolts += r.revolts; if (r.uaAlive) agg.ua++; agg.winners[r.top] = (agg.winners[r.top] || 0) + 1;
      if (r.rich) agg.rich[r.rich] = (agg.rich[r.rich] || 0) + 1;
      r.unions.forEach(d => agg.proclaimed[d] = (agg.proclaimed[d] || 0) + 1); r.held.forEach(d => agg.held[d] = (agg.held[d] || 0) + 1);
      agg.surv += r.surv; agg.survOf += r.survOf;
    });
    console.log(`\n${n} worlds: avg wars ${(agg.wars / n).toFixed(1)}, avg revolts ${(agg.revolts / n).toFixed(1)}, ${WATCH ? WATCHED + ' alive in ' + agg.ua + ', ' : ''}top ${JSON.stringify(agg.winners)}`);
    console.log(`ambitions: richest power ${JSON.stringify(agg.rich)}; unions proclaimed ${JSON.stringify(agg.proclaimed)}, held in ${END} ${JSON.stringify(agg.held)}; survive-ambition nations alive ${agg.surv} of ${agg.survOf}`);
  }
  for (let k = 0; k < jobs; k++) {
    const w = new Worker(__filename, { workerData: { watch: WATCH } });
    const feed = () => { if (next < to) w.postMessage(next++); else w.terminate(); };
    w.on('message', r => { results[r.seed - from] = r; flush(); feed(); });
    w.on('error', e => { console.error(e); process.exit(1); });
    feed();
  }
}
