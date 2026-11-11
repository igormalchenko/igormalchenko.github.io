// Prints one world's full chronicle as plain text. Run: npm run chronicle -- 7   (add "econ" to include construction)
const load = require('./load');
const { createSim } = load();
const seed = +(process.argv[2] || 1), econ = process.argv[3] === 'econ';
const S = createSim(seed); while (!S.over) S.step();
S.log.forEach(l => { if (econ || l.t !== 'econ') console.log(`${l.y} ${S.SEASONS[l.q].slice(0, 3)}  [${l.t}]  ${l.h.replace(/<[^>]+>/g, '')}`); });
const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
console.log('\nFinal:', cs.slice(0, 8).map(c => `${c.name} ${Math.round(S.score(c))}`).join(' | '));
