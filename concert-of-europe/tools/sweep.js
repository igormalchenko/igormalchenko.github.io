// Plays many worlds headlessly and prints one line per world. Run: npm run sweep -- 1 13   (seeds 1..12)
const load = require('./load');
const { createSim } = load();
const from = +(process.argv[2] || 1), to = +(process.argv[3] || from + 10);
const agg = { wars: 0, revolts: 0, ua: 0, winners: {} };
for (let seed = from; seed < to; seed++) {
  const t0 = Date.now();
  const S = createSim(seed); while (!S.over) S.step();
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const ua = S.C.UKR, uaAlive = ua && ua.alive;
  const dreams = S.DREAMS.filter(d => d.done).map(d => d.id).join(',') || '-';
  agg.wars += S.stats.wars; agg.revolts += S.stats.revolts; if (uaAlive) agg.ua++; agg.winners[cs[0].name] = (agg.winners[cs[0].name] || 0) + 1;
  console.log(`seed ${seed}  ${S.year} ${S.SEASONS[S.q]}  wars ${S.stats.wars}  revolts ${S.stats.revolts}  dead ${Math.round(S.stats.dead || 0)}m  ` +
    `Ukraine ${ua ? (uaAlive ? 'alive' : 'died') : 'never'}  dreams ${dreams}  winner ${cs[0].name} (${Math.round(S.score(cs[0]))})  ${Date.now() - t0}ms`);
}
const n = to - from;
console.log(`\n${n} worlds: avg wars ${(agg.wars / n).toFixed(1)}, avg revolts ${(agg.revolts / n).toFixed(1)}, Ukraine alive in ${agg.ua}, winners ${JSON.stringify(agg.winners)}`);
