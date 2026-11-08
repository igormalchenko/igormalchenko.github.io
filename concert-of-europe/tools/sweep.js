// Plays many worlds headlessly and prints one line per world. Run: npm run sweep -- 1 13   (seeds 1..12)
const load = require('./load');
const { createSim } = load();
const from = +(process.argv[2] || 1), to = +(process.argv[3] || from + 10);
const agg = { wars: 0, revolts: 0, ua: 0, winners: {}, rich: {}, held: {}, proclaimed: {}, surv: 0, survOf: 0 };
for (let seed = from; seed < to; seed++) {
  const t0 = Date.now();
  const S = createSim(seed); while (!S.over) S.step();
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const ua = S.C.UKR, uaAlive = ua && ua.alive;
  const dreams = S.UNIONS.filter(d => d.done).map(d => d.id);
  // ambitions: the richest great power, unions still held at the armistice, survivors of those who only had to survive
  const all = Object.values(S.C), amb = c => S.ambitionOf(c);
  const rich = cs.find(c => amb(c).kind === 'richest');
  const held = all.filter(c => amb(c).kind === 'unite' && amb(c).state === 'met').map(c => amb(c).id);
  const survK = all.filter(c => amb(c).kind === 'survive'), surv = survK.filter(c => c.alive);
  agg.wars += S.stats.wars; agg.revolts += S.stats.revolts; if (uaAlive) agg.ua++; agg.winners[cs[0].name] = (agg.winners[cs[0].name] || 0) + 1;
  if (rich) agg.rich[rich.name] = (agg.rich[rich.name] || 0) + 1;
  dreams.forEach(d => agg.proclaimed[d] = (agg.proclaimed[d] || 0) + 1); held.forEach(d => agg.held[d] = (agg.held[d] || 0) + 1);
  agg.surv += surv.length; agg.survOf += survK.length;
  console.log(`seed ${seed}  ${S.year} ${S.SEASONS[S.q]}  wars ${S.stats.wars}  revolts ${S.stats.revolts}  dead ${Math.round(S.stats.dead || 0)}m  ` +
    `Ukraine ${ua ? (uaAlive ? 'alive' : 'died') : 'never'}  unions ${dreams.join(',') || '-'} (held ${held.join(',') || '-'})  survived ${surv.length}/${survK.length}  ` +
    `richest power ${rich ? rich.name : '-'}  top ${cs[0].name} (${Math.round(S.score(cs[0]))})  ${Date.now() - t0}ms`);
}
const n = to - from;
console.log(`\n${n} worlds: avg wars ${(agg.wars / n).toFixed(1)}, avg revolts ${(agg.revolts / n).toFixed(1)}, Ukraine alive in ${agg.ua}, top ${JSON.stringify(agg.winners)}`);
console.log(`ambitions: richest power ${JSON.stringify(agg.rich)}; unions proclaimed ${JSON.stringify(agg.proclaimed)}, held in 1918 ${JSON.stringify(agg.held)}; survive-ambition nations alive ${agg.surv} of ${agg.survOf}`);
