// ===================== SIMULATION CORE v3 =====================
// Every nation pursues one goal: the highest yearly income when the Great War ends.
// Each season it forecasts, in gold over its ruler's planning horizon, what every option is worth, and takes the best.

const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];
// the content the engine runs on (content/*.json)
const RULES = CONTENT.rules, EV = CONTENT.events, PEOPLES = CONTENT.peoples;
// rulers: one trait each (content/rulers.json), at one rarity (content/rarities.json, 0 = Common … 4 = Legendary).
// A trait has a main bonus, from Rare on a one-time flat bonus, and a malus; the rarity says which of each one's values applies.
const TRAITS = CONTENT.rulers, RARITY = CONTENT.rarities, EFFECTS = CONTENT.effects;
const TRAIT_KEYS = Object.keys(TRAITS);
// the effects one trait has at one rarity, in card order: [{slot, fx, value, text}]
function traitEffects(t, g){
  const T = TRAITS[t], R = RARITY[g], out = [];
  const one = (slot, e, value) => out.push({ slot, fx: e.fx, value, text: say(e.text, { v: value }) });
  one('main', T.main, T.main.values[R.main]);
  if (R.flat != null) { const big = R.flat === 1 && T.flat.big; if (big) one('flat', big, big.value); else one('flat', T.flat, T.flat.values[Math.min(R.flat, T.flat.values.length - 1)]); }
  one('malus', T.malus, T.malus.values[R.malus]);
  return out;
}
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

function createSim(seed, geo, opts = {}){
  const rng = mulberry32(seed);
  const rand = (a = 0, b = 1) => a + (b - a) * rng();
  const chance = p => rng() < p;
  const pick = a => a[Math.floor(rng() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sig = x => 1 / (1 + Math.exp(-x));
  // the reigning ruler's value for an effect (content/effects.json), or the value that changes nothing
  const fx = (c, k) => { const v = c && c.ruler && c.ruler.fx && c.ruler.fx[k]; return v == null ? EFFECTS[k].none : v; };
  const hasFx = (c, k) => !!(c && c.ruler && c.ruler.fx && c.ruler.fx[k] != null);
  // a people's ruler names (peoples.json); a people with none borrows the German ones
  const namesOf = c => c.rulerNames || (PEOPLES[c.culture] && PEOPLES[c.culture].names) || PEOPLES.German.names;

  const S = { seed, t: 0, year: RULES.start, q: 0, regions: [], C: {}, wars: [], log: [], history: [], flags: {}, over: false,
    marks: [], warNames: {}, railBoom: -1, era: (e => ({ name: e.name, def: e.def, fort: e.fort, since: RULES.start }))(CONTENT.eras.find(e => e.start)), awake: {}, depression: -1, majors: [], greatWar: null, stats: { wars: 0, revolts: 0, battles: 0, rulers: 0 } };

  REGIONS.forEach((r, i) => S.regions.push({ i, id: r[0], name: r[1], owner: r[4], core: r[4], culture: r[5], pop: r[6],
    fac: Math.min(3, r[7]), fort: 0, build: null, unrest: 10, occ: null, battle: 0, flash: 0, integ: 1,
    coast: geo.regions[i].coast, nb: geo.regions[i].nb, startOwner: r[4] }));
  const RB = {}; S.regions.forEach(r => RB[r.id] = r);

  // ---------- rulers ----------
  const regnal = {};   // how many rulers of each name a nation has had
  const reign = () => S.t + Math.floor(rand(RULES.reign.years[0] * 4, RULES.reign.years[1] * 4));   // unless something ends it sooner
  // the same odds for every heir in Europe: roll his rarity, then any trait not already on the card
  function drawHeir(not = []){
    let x = rng(), g = 0; while (g < RARITY.length - 1 && x >= RARITY[g].odds) { x -= RARITY[g].odds; g++; }
    return { trait: pick(TRAIT_KEYS.filter(t => !not.includes(t))), grade: g };
  }
  // a ruler, not yet crowned: his name, his trait and rarity (drawn, or fixed by an heir card) and his temperaments
  function makeRuler(c, want){
    const { trait, grade } = want || drawHeir();
    const nm = (want && want.nm) || pick(namesOf(c)), k = c.tag + nm, num = (regnal[k] || 0) + 1;
    const b = c.lean || { pat: 0.5, hawk: 0.5 };
    // patience and judgment lean the way his nation does; thrift is his own
    const pat = clamp(b.pat + rand(-0.35, 0.35), 0.05, 0.95), hawk = clamp(b.hawk + rand(-0.35, 0.35), 0.05, 0.95);
    const effects = traitEffects(trait, grade);
    return { name: `${nm} ${ROMAN[num] || num} the ${TRAITS[trait].label}`, given: `${nm} ${ROMAN[num] || num}`, k, trait, grade, effects, fx: Object.fromEntries(effects.map(e => [e.fx, e.value])),
      pat, bias: (hawk - 0.5) * 0.9 + rand(-0.3, 0.3), thrift: rand(0.1, 0.9), swing: 0, since: S.year, until: reign() };
  }
  // what the ruler does, in words
  const traitDesc = r => r && r.effects ? r.effects.map(e => e.text).join('. ') : '';
  // a ruler's name in the chronicle, in his rarity's colour
  const RN = r => `<b class="rn" style="color:${RARITY[r.grade].color}">${r.name}</b>`;
  function crown(c, r, quiet){ regnal[r.k] = (regnal[r.k] || 0) + 1; r.since = S.year; c.ruler = r; coronation(c, r, quiet); return r; }
  // the one-time bonus of a ruler from Rare up, the moment he is crowned
  function coronation(c, r, quiet){
    const say1 = h => { if (!quiet) L('ruler', h); };
    const mine = regionsOf(c), shuffled = () => mine.map(x => [rng(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    const own = x => isAccepted(c, x.culture);
    const calm = (v, f) => mine.forEach(x => { if (f(x)) x.unrest = clamp(x.unrest - v, 0, 100); });
    const v = k => r.fx[k];
    if (v('army')) c.army += v('army');
    if (v('gold')) c.treasury += v('gold');
    if (v('factoryCapital') && mine.length) capitalOf(c).fac += v('factoryCapital');
    if (v('factoryRandom') && mine.length) pick(mine).fac += v('factoryRandom');
    if (v('fortify')) shuffled().slice(0, v('fortify')).forEach(x => x.fort = 1);
    if (v('calmAll')) calm(v('calmAll'), () => true);
    if (v('calmOwn')) calm(v('calmOwn'), own);
    if (v('calmOther')) calm(v('calmOther'), x => !own(x));
    for (let k = 0; k < (v('reforms') || 0); k++) reform(c);
    if (v('truce')) neighborsOf(c).forEach(o => { c.truce[o.tag] = S.year + v('truce'); o.truce[c.tag] = S.year + v('truce'); });
    if (v('rights')) { const ps = [...new Set(mine.map(x => x.culture))].map(p => [rng(), p]).sort((p, q) => p[0] - q[0]).map(x => x[1]).slice(0, v('rights'));
      ps.forEach(p => c.acc.add(p)); if (ps.length) say1(`${RN(r)} of ${N(c)} declares the ${ps.join(' and ')} people equal subjects.`); }
    for (let k = 0; k < (v('province') || 0); k++) { const bs = borderRegions(c); if (!bs.length) break;
      const x = pick(bs), from = S.C[x.owner]; transfer(x, c, from, 'treaty');
      L('ruler', `${RN(r)} of ${N(c)} ${TRAITS[r.trait].label === 'Flirt' ? 'marries into' : 'inherits'} ${Rn(x)} from ${N(from)}.`); }
  }
  // the player's heir card: three different traits, each drawn with the same odds as any heir in Europe
  function heirCard(c, opening, why = '', crisis = false){
    const slots = []; for (let k = 0; k < RULES.heirs; k++) slots.push(drawHeir(slots.map(s => s.trait)));
    const names = namesOf(c).map(n => [rng(), n]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    return { type: 'heir', tag: c.tag, opening, options: slots.map((s, i) => makeRuler(c, { ...s, nm: names[i % names.length] })), old: c.ruler.name, why, crisis };
  }
  // the player may deal a card again, three times a game; AI nations pick at random and never need to
  function rerollHeirs(){
    const p = S.pending; if (!p || p.type !== 'heir' || !(S.rerolls > 0)) return false;
    S.rerolls--; S.pending = heirCard(S.C[p.tag], p.opening, p.why, p.crisis); return true;
  }
  function chooseHeir(i){
    const p = S.pending; if (!p || p.type !== 'heir') return;
    const c = S.C[p.tag], nr = p.options[i]; S.pending = null;
    if (p.opening) { crown(c, nr, false); L('ruler', `${RN(nr)} takes the throne of ${N(c)}. ${traitDesc(nr)}.`); return; }
    successionLog(c, p.why, crown(c, nr, false), p.crisis);
  }
  // a civil war follows some successions: rival claimants split the army and unrest soars (by `crisis` if it is a number)
  function successionLog(c, why, nr, crisis){
    if (crisis) {
      c.crisis = { until: S.t + Math.floor(rand(RULES.reign.crisisYears[0] * 4, RULES.reign.crisisYears[1] * 4)), winner: nr.name };
      const u = typeof crisis === 'number' ? crisis : RULES.reign.crisisUnrest;
      regionsOf(c).forEach(r => r.unrest = Math.min(100, r.unrest + u)); mark(capitalOf(c).i, 'crisis');
      L('ruler', `<strong>Civil war in ${N(c)}.</strong> ${why} Rival claimants raise armies against ${RN(nr)}. The army is split and unrest soars.`);
    } else L('ruler', `${why} ${RN(nr)} succeeds. ${traitDesc(nr)}.`);
  }
  // A reign ends: by death, defeat, revolution, a bullet or the army. The player picks the heir; everyone else gets one at random.
  function endReign(c, how, ctx = ''){
    const old = c.ruler; if (!old || !c.alive) return;
    if (c.player && S.pending) return;
    // what his reign leaves behind: a spent treasury, restless subject peoples
    if (fx(c, 'endGold') && c.treasury > 0) c.treasury *= 1 - fx(c, 'endGold');
    if (fx(c, 'endUnrestOther')) regionsOf(c).forEach(r => { if (!isAccepted(c, r.culture)) r.unrest = Math.min(100, r.unrest + fx(c, 'endUnrestOther')); });
    S.stats.rulers++; c.reigns = (c.reigns || 0) + 1;
    if (how === 'coup') {   // the army doesn't ask: no heir card
      const nr = crown(c, makeRuler(c), true); mark(capitalOf(c).i, 'coup');
      L('ruler', `Coup in ${N(c)}: ${RN(old)} is deposed by the army${ctx}; ${RN(nr)} takes power. ${traitDesc(nr)}.`); return;
    }
    const why = { death: `${RN(old)} of ${N(c)} dies.`,
      abdicate: `Beaten in the <em>${ctx}</em>, ${RN(old)} of ${N(c)} abdicates.`, revolution: `Revolution in ${ctx}! ${RN(old)} of ${N(c)} is overthrown.`,
      murder: `${RN(old)} of ${N(c)} is assassinated${S.year >= 1870 ? ' by an anarchist' : ' by a conspirator'}.` }[how];
    const crisis = how === 'revolution' ? false : fx(c, 'civilWar') || chance(RULES.reign.crisis);
    if (c.player) { S.pending = heirCard(c, false, why, crisis); return; }
    successionLog(c, why, crown(c, makeRuler(c), true), crisis);
  }
  // how far ahead he plans: by his patience, plus or minus what his trait adds, never below the minimum
  const horizon = c => Math.max(RULES.horizon.min, Math.round(RULES.horizon.min + c.ruler.pat * RULES.horizon.span + fx(c, 'horizon')));
  // Gold only matters for what it can buy: a country with a full treasury treats spending as cheap.
  // Thrift: how dear the ruler holds his gold, from a third (lavish) to three times (thrifty)
  const thriftOf = c => Math.pow(3, ((c.ruler.thrift ?? 0.5) - 0.5) * 2);
  const goldValue = c => clamp((80 + c.army * 0.5) / Math.max(1, c.treasury), 0.1, 1) * thriftOf(c);
  // what he believes his chance of winning is: his judgment, a Bold or Drunk ruler's misreading, a Sharp ruler seeing through it
  const believe = (c, ratio) => { const pTrue = pWin(ratio);
    const p = clamp(pWin(ratio * Math.exp(c.ruler.bias)) + fx(c, 'bias') + c.ruler.swing, 0, 1);
    return pTrue + (p - pTrue) * (1 - fx(c, 'sharp')); };
  const newRuler = (c, quiet) => crown(c, makeRuler(c), quiet);

  function makeCountry(tag, d){
    const c = { tag, name: d.name, adj: d.adj, pre: d.pre || null, color: d.color, culture: d.culture, acc: new Set(d.acc || []),
      lean: { pat: clamp(0.25 + d.p[1] * 0.6, 0.1, 0.9), hawk: clamp(d.p[0], 0.1, 0.9) },
      army: d.army * rand(0.9, 1.1), treasury: 30 + rand(0, 20), infamy: 0, allies: new Set(), rival: null, truce: {},
      guarantee: null,
      alive: true, noAnnex: !!d.noAnnex, rulerNames: d.rulerNames || null, serfs: !!d.serfs, ambitionId: d.ambition || 'survive', thoughts: [], born: S.year,
      startRegions: 0, reformCd: 0, ledger: null, spent: {}, lastWar: 1830 };
    if (S.ready) newRuler(c);   // the rulers of 1836 are crowned once the map and relations exist
    return c;
  }
  for (const t in COUNTRIES) S.C[t] = makeCountry(t, COUNTRIES[t]);
  const tags = Object.keys(S.C);
  tags.forEach(t => S.C[t].startRegions = S.regions.filter(r => r.owner === t).length);

  // ---------- relations ----------
  const REL = {};
  const rk = (a, b) => a < b ? a + b : b + a;
  const rel = (a, b) => REL[rk(a, b)] || 0;
  const setRel = (a, b, v) => { REL[rk(a, b)] = clamp(v, -100, 100); };
  const addRel = (a, b, d) => setRel(a, b, rel(a, b) + d);
  S.rel = rel;
  tags.forEach(a => tags.forEach(b => { if (a < b) setRel(a, b, rand(-10, 15)); }));
  // the feuds and friendships of 1836 (nations.json: relations, allies)
  tags.forEach(a => Object.entries(COUNTRIES[a].relations || {}).forEach(([b, v]) => setRel(a, b, v)));
  const ally = (a, b) => { S.C[a].allies.add(b); S.C[b].allies.add(a); };
  tags.forEach(a => (COUNTRIES[a].allies || []).forEach(b => ally(a, b)));

  // ---------- helpers ----------
  const alive = () => tags.filter(t => S.C[t].alive).map(t => S.C[t]);
  let OWN = null;
  const invalidate = () => { OWN = null; };
  const regionsOf = c => { if (!OWN) { OWN = {}; S.regions.forEach(r => (OWN[r.owner] || (OWN[r.owner] = [])).push(r)); } return OWN[c.tag] || []; };
  const popOf = c => regionsOf(c).reduce((s, r) => s + r.pop, 0);
  const facOf = c => regionsOf(c).reduce((s, r) => s + r.fac, 0);
  const facAvg = c => { const rs = regionsOf(c); const p = rs.reduce((s, r) => s + r.pop, 0) || 1; return rs.reduce((s, r) => s + r.fac * r.pop, 0) / p; };
  const unrestOf = c => { const rs = regionsOf(c); const p = rs.reduce((s, r) => s + r.pop, 0) || 1; return rs.reduce((s, r) => s + r.unrest * r.pop, 0) / p; };
  // how well the armies fight: industry, and a soldier or conqueror at their head
  const quality = c => (1 + 0.15 * facAvg(c)) * fx(c, 'fight');
  const inCrisis = c => c.crisis && S.t < c.crisis.until;
  const strength = c => c.army * quality(c) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? RULES.reign.crisisArmy : 1);
  const warOf = c => S.wars.find(w => w.att.includes(c.tag) || w.def.includes(c.tag));
  const isAccepted = (c, cul) => c.culture === cul || c.acc.has(cul);
  const neighborsOf = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag) s.add(o); })); return [...s].map(t => S.C[t]); };
  const borderRegions = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { if (S.regions[j].owner !== c.tag) s.add(j); })); return [...s].map(j => S.regions[j]); };
  const isNeighbor = (a, b) => neighborsOf(a).includes(b);
  const landNeighbors = c => { const s2 = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag && !geoNaval(r.i, j)) s2.add(o); })); return s2.size; };
  // Big states are harder to run: every province beyond six trims the yield of all of them.
  const admin = n => clamp(1 - 0.03 * Math.max(0, n - 6), 0.55, 1);
  const adminOf = c => admin(regionsOf(c).length);
  const workforce = (c, army = c.army) => clamp(1 - army / (Math.max(0.5, popOf(c)) * RULES.workers), 0.55, 1);
  // income of one province in a season, broken down
  function regionIncome(r, c = S.C[r.owner], opts = {}){
    if (r.occ && !opts.ignoreOcc) return { tax: 0, fac: 0, trade: 0 };
    const u = opts.unrest != null ? opts.unrest : r.unrest;
    const integ = opts.integ != null ? opts.integ : r.integ;
    const m = (1 - u / 200) * (0.1 + 0.9 * integ) * (opts.admin != null ? opts.admin : adminOf(c)) * fx(c, 'earns') * (S.depression > S.t ? EV.panic.earns : 1);
    const taxed = fx(c, 'taxes') * (isAccepted(c, r.culture) ? fx(c, 'ownTaxes') : 1);
    const serf = c.serfs && !S.flags.serf ? EV.serfdom.before : 1;
    const wf = opts.wf != null ? opts.wf : workforce(c);
    const atWar = opts.war != null ? opts.war : !!warOf(c);
    return { tax: r.pop * 0.06 * m * wf * taxed, fac: r.pop * 0.7 * (1 - Math.pow(0.8, opts.fac != null ? opts.fac : r.fac)) * m * wf * serf, trade: r.coast && !atWar ? (r.pop * 0.04 + r.fac * 0.25) * m * fx(c, 'trade') : 0 };
  }
  const sumInc = x => x.tax + x.fac + x.trade;
  const income = c => regionsOf(c).reduce((s, r) => s + sumInc(regionIncome(r, c)), 0);
  const score = c => income(c) * 4;
  const upkeep = c => c.army * 0.04 * fx(c, 'upkeep');
  const power = c => regionsOf(c).reduce((s, r) => s + r.pop * (1 + 0.5 * r.fac), 0) + c.army * 0.5;
  const isMajor = c => S.majors.includes(c.tag);
  const maxBuilds = c => 1 + Math.floor(regionsOf(c).length / 3);
  function claim(c, r){
    if (r.owner === c.tag) return 0;
    if (r.core === c.tag) return 3;
    if (isAccepted(c, r.culture) || inClaimedUnion(c, r)) return 2.5;
    return 0;
  }
  // what a province would be worth to c per year once settled
  function provYearly(r, c){
    const foreign = !isAccepted(c, r.culture);
    if (r.owner === c.tag) return sumInc(regionIncome(r, c, { ignoreOcc: true, war: false, integ: 1 })) * 4;
    const n = regionsOf(c).length, a0 = admin(n), a1 = admin(n + 1);
    const own = income(c) * 4;
    return sumInc(regionIncome(r, c, { ignoreOcc: true, unrest: foreign ? 25 + 36 * nationalism() : 10, integ: 1, war: false, admin: a1 })) * 4 - own * (a0 - a1) / a0;
  }
  // a province of the union a nation works toward (or has proclaimed) is worth more to it, to win and to keep (ambitionKinds.json)
  const ambitionW = (c, r) => inClaimedUnion(c, r) ? KINDS.unite.worth : 1;
  // a nation that only has to survive counts every loss half again as dear
  const surviveW = c => c.ambition && c.ambition.kind === 'survive' ? KINDS.survive.losses : 1;
  // years until a conquest is integrated, as his trait speeds or slows it
  const settleYears = (r, c) => (!isAccepted(c, r.culture) && r.core !== c.tag) ? 9 / fx(c, 'integrateOther') / fx(c, 'integrate') : 4 / fx(c, 'integrate');
  Object.assign(S, { adminOf, regionsOf, popOf, facOf, facAvg, unrestOf, power, income, score, upkeep, regionIncome, sumInc, strength, warOf, claim, RB, isAccepted, maxBuilds, workforce, horizon });

  const N = c => `<b class="cn" data-tag="${c.tag}" style="--c:${c.color}">${c.name}</b>`;
  const Rn = r => `<i>${r.name}</i>`;
  const list = cs => cs.length <= 1 ? cs.map(N).join('') : cs.slice(0, -1).map(N).join(', ') + ' and ' + N(cs[cs.length - 1]);
  const rlist = rs => rs.length <= 1 ? rs.map(Rn).join('') : rs.slice(0, -1).map(Rn).join(', ') + ' and ' + Rn(rs[rs.length - 1]);
  const L = (t, h) => S.log.push({ y: S.year, q: S.q, t, h });
  const mark = (i, type) => S.marks.push({ i, type, t: S.t });
  const capitalOf = c => regionsOf(c).slice().sort((a, b) => b.pop * (1 + b.fac) - a.pop * (1 + a.fac))[0];
  const g = v => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v))}`;

  function computeMajors(){ S.majors = alive().sort((a, b) => power(b) - power(a)).slice(0, 6).map(c => c.tag); }
  computeMajors();
  S.ready = true;
  // the player's nation gets a stand-in who never reigns: its real ruler of 1836 comes from the first heir card
  alive().forEach(c => { if (c.tag === opts.player) c.ruler = makeRuler(c); else newRuler(c, true); });

  function pickRival(c){ // the neighbour that most threatens c's income
    let best = null, bs = 0;
    neighborsOf(c).forEach(o => { if (!o.alive || c.allies.has(o.tag)) return;
      const s = threatOf(o, c).p * 100 + Math.max(0, -rel(c.tag, o.tag)) * 0.3; if (s > bs) { bs = s; best = o.tag; } });
    c.rival = bs > 4 ? best : null;
  }

  // ---------- military forecasting ----------
  const sideStr = ts => ts.reduce((s, t) => s + strength(S.C[t]), 0);
  function mySide(c, extraArmy = 0, extraAlly = null){
    let s = (c.army + extraArmy) * quality(c) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? RULES.reign.crisisArmy : 1);
    c.allies.forEach(t => { if (!warOf(S.C[t])) s += strength(S.C[t]) * 0.65; });
    if (extraAlly) s += strength(extraAlly) * 0.65;
    return s;
  }
  function theirSide(o, exclude){
    let s = strength(o);
    o.allies.forEach(t => { if (t !== exclude && !warOf(S.C[t])) s += strength(S.C[t]) * 0.8; });
    return s;
  }
  const pWin = ratio => sig(3.2 * Math.log(Math.max(0.05, ratio)));
  // yearly chance that o attacks c, and what c would lose
  function threatOf(o, c, extraArmy = 0, extraAlly = null){
    const ratio = theirSide(o, c.tag) / Math.max(1, mySide(c, extraArmy, extraAlly) * 1.15);
    const hostility = clamp((20 - rel(o.tag, c.tag)) / 60, 0.1, 1.6) * 0.82 * (1 + o.infamy / 40);
    const p = 0.2 * sig(4 * (ratio - 1.2)) * hostility;
    return { p, ratio };
  }
  // How much c expects to lose over its horizon: for each neighbour, run that neighbour's own war forecast against c.
  let RISK = {};
  function riskOf(c, extraArmy = 0, extraAlly = null){
    const key = c.tag + '|' + Math.round(extraArmy) + '|' + (extraAlly ? extraAlly.tag : '');
    if (RISK[key]) return RISK[key];
    const H = horizon(c);
    let total = 0, top = null, topV = 0;
    neighborsOf(c).forEach(o => {
      if (!o.alive || c.allies.has(o.tag) || (extraAlly && extraAlly === o)) return;
      let best = null;
      borderRegions(o).forEach(r => { if (r.owner !== c.tag) return;
        const e = warEval(o, c, r, extraArmy, extraAlly); if (e && (!best || e.ev > best.ev)) best = { ...e, r }; });
      if (!best) return;
      const chanceAttack = Math.min(1, sig((best.ev - 5) / 12) * 0.77);
      const loss = best.p * (provYearly(best.r, c) * ambitionW(c, best.r) * H + Math.max(0, c.treasury) * 0.3 + 20) + c.army * 0.1 * 3;
      const v = chanceAttack * loss;
      total += v; if (v > topV) { topV = v; top = o; }
    });
    total *= surviveW(c);
    return (RISK[key] = { total, top });
  }
  // a's forecast of attacking d for province r (gold over a's horizon)
  // Great powers that would step in to stop a from growing at d's expense, with the chance each joins.
  function interveners(a, d){
    const leader = S.leader === a.tag;
    return S.majors.map(t => S.C[t]).filter(m => m.alive && m !== a && m !== d && !a.allies.has(m.tag) && !d.allies.has(m.tag) && !warOf(m)
      && (leader || isNeighbor(m, a) || isNeighbor(m, d)) && (leader || rel(m.tag, a.tag) < 10 || m.rival === a.tag))
      .map(m => ({ m, q: Math.min(0.9, 0.25 + 0.35 * clamp(power(a) / Math.max(1, power(m)) - 0.4, 0, 1) + (regionsOf(d).length === 1 ? 0.2 : 0) + (leader ? 0.3 : 0)) }));
  }
  const bySeaOnly = (a, r) => !r.nb.some(j => S.regions[j].owner === a.tag && !geoNaval(j, r.i));
  function geoNaval(i, j){ return (S.navalSet || (S.navalSet = new Set((geo.naval || []).flatMap(([x, y]) => [x + '-' + y, y + '-' + x])))).has(i + '-' + j); }
  function warEval(a, d, r, dExtra = 0, dAlly = null){
    if (a.allies.has(d.tag) || (a.truce[d.tag] || 0) > S.year) return null;
    let their = theirSide(d, a.tag) + dExtra * quality(d);
    if (warOf(d)) their *= 0.5;   // its armies are busy elsewhere
    interveners(a, d).forEach(({ m, q }) => { their += strength(m) * q * 0.45; });
    if (bySeaOnly(a, r)) their *= 2;  // invading across the sea is hard
    if (r.core === d.tag) their *= fx(d, 'homeFight');   // a Vengeful defender fights harder for his own land
    if (dAlly && !d.allies.has(dAlly.tag)) their += strength(dAlly) * 0.8;
    const ratio = mySide(a) * (r.core === a.tag ? fx(a, 'homeFight') : 1) / Math.max(1, their * S.era.def);
    const pTrue = pWin(ratio), p = believe(a, ratio);   // what the ruler believes
    if (p < 0.5) return null;
    const H = horizon(a), T = a.treasury;
    const years = clamp(1 + 1.6 / (Math.abs(Math.log(ratio)) + 0.35), 1, 4.5);
    const yearly = provYearly(r, a) * ambitionW(a, r);
    const gv = goldValue(a);
    const gain = yearly * Math.max(0, H - years - settleYears(r, a) * RULES.settle) + Math.max(0, d.treasury) * 0.3 * gv;
    const losses = a.army * 0.05 * years * 2 * fx(a, 'bleed') * gv;
    const disruption = years * (regionsOf(a).reduce((s, x) => s + regionIncome(x, a, { war: false }).trade, 0) * 4 + income(a) * 4 * 0.05);
    const lose = Math.max(0, T) * 0.3 * gv + 0.3 * (borderRegions(d).filter(x => x.owner === a.tag).map(x => provYearly(x, a)).sort((x, y) => y - x)[0] || 0) * H;
    const swallow = regionsOf(d).length === 1 ? (S.year < 1860 ? 16 : 8) : 0;
    const infamyCost = ((claim(a, r) >= 2.5 ? 3 : 9) + swallow) * (1.5 + landNeighbors(a) * 0.5);
    // a lost war costs more than the gold: a beaten ruler may lose his throne
    const ev = p * gain - (1 - p) * lose * 1.25 * surviveW(a) - losses - disruption - infamyCost;
    return { ev, p, pTrue, yearly, cost: losses + disruption };
  }

  // ---------- war ----------
  function warName(a, d){
    const base = `${a.pre ? a.pre + '-' + d.adj : a.adj + '-' + d.adj} War`;
    const n = (S.warNames[base] || 0) + 1; S.warNames[base] = n;
    return `${['', 'Second ', 'Third ', 'Fourth ', 'Fifth '][n - 1] ?? n + 'th '}${base}`;
  }
  function declareWar(a, d, goal, opts = {}){
    const w = { id: S.stats.wars, name: opts.name || warName(a, d), att: [a.tag], def: [d.tag], goal: goal.id, score: 0, quarters: 0,
      battles: 0, start: S.year, great: !!opts.great };
    [...d.allies].forEach(t => { const o = S.C[t]; const sure = d.guarantee && d.guarantee.by === t && S.year < d.guarantee.until; if (o.alive && !warOf(o) && t !== a.tag && !a.allies.has(t) && (sure || chance(0.85))) w.def.push(t); });
    [...a.allies].forEach(t => { const o = S.C[t]; if (o.alive && !warOf(o) && !w.def.includes(t) && rel(a.tag, t) > 25 && chance(0.6)) w.att.push(t); });
    S.wars.push(w); S.stats.wars++; a.lastWar = S.year;
    const cl = claim(a, goal);
    a.infamy += (cl >= 2.5 ? 3 : 9) + (regionsOf(d).length === 1 ? 8 : 0);
    if (!opts.great) interveners(a, d).forEach(({ m, q }) => { if (!w.def.includes(m.tag) && !w.att.includes(m.tag) && chance(q)) w.def.push(m.tag); });
    w.att.forEach(t => w.def.forEach(u => addRel(t, u, -30)));
    let txt = opts.text;
    if (!txt) {
      const why = cl === 3 ? `to win back ${Rn(goal)}` : cl && isAccepted(a, goal.culture) ? `for ${Rn(goal)}, whose ${goal.culture}-speaking people would integrate quickly`
        : cl ? `to bring ${Rn(goal)} into ${theTitle(claimedUnion(a))}` : `for ${Rn(goal)} and its ${Math.round(provYearly(goal, a))} gold a year`;
      const mis = opts.pTrue != null && opts.p - opts.pTrue > 0.08 ? `, though his generals privately think ${Math.round(opts.pTrue * 100)}%` : '';
      txt = `${N(a)} invades ${N(d)} ${why}. ${RN(a.ruler)} rates the odds at ${Math.round(opts.p * 100)}%${mis}. The <em>${w.name}</em> begins.`;
    }
    const jd = w.def.slice(1).map(t => S.C[t]), ja = w.att.slice(1).map(t => S.C[t]);
    if (ja.length) txt += ` ${list(ja)} ${ja.length > 1 ? 'join' : 'joins'} the attack.`;
    if (jd.length) txt += ` ${list(jd)} ${jd.length > 1 ? 'come' : 'comes'} to ${N(d)}'s defence.`;
    L('war', txt);
    return w;
  }
  function killIfEmpty(c){
    if (regionsOf(c).length) return;
    c.alive = false;
    L('war', `${N(c)} has ceased to exist.`);
    tags.forEach(t => S.C[t].allies.delete(c.tag)); c.allies.clear();
    S.wars.forEach(w => { w.att = w.att.filter(x => x !== c.tag); w.def = w.def.filter(x => x !== c.tag); });
    S.regions.forEach(r => { if (r.occ === c.tag) r.occ = null; });
  }
  function transfer(r, to, from, how = 'war'){
    const kin = isAccepted(to, r.culture) || r.core === to.tag;
    r.owner = to.tag; r.occ = null; r.build = null; invalidate();
    if (how === 'war') { if (r.fac > 0) r.fac--; r.integ = kin ? 0.4 : 0.1; r.unrest = Math.max(r.unrest, kin ? 25 : 45); }
    else r.integ = Math.min(r.integ, 0.6);
    killIfEmpty(from);
  }
  const controlledBy = (r, side) => (side.includes(r.owner) && !r.occ) || side.includes(r.occ);
  function frontMove(win, lose, w, isAtt){
    const lib = S.regions.filter(r => win.includes(r.owner) && r.occ && lose.includes(r.occ) && r.nb.some(j => controlledBy(S.regions[j], win)));
    if (lib.length) { const r = pick(lib); r.occ = null; r.battle = 2; return; }
    const cands = S.regions.filter(r => lose.includes(r.owner) && !r.occ && r.nb.some(j => controlledBy(S.regions[j], win)));
    if (!cands.length) return;
    const goal = RB[w.goal];
    const r = isAtt && cands.includes(goal) ? goal : cands.sort((a, b) => b.pop - a.pop)[Math.floor(rng() * Math.min(3, cands.length))];
    r.battle = 2; S.stats.battles++;
    r.pop *= 0.985; S.stats.dead = (S.stats.dead || 0) + r.pop * 0.015;
    if (r.fac > 0 && chance(0.22)) { r.fac--; mark(r.i, 'ruin'); }
    if (r.fort && chance(S.era.fort)) return;
    // a Cautious ruler stops some advances into his land
    if (chance(fx(S.C[r.owner], 'hold'))) return;
    if (r.fort) { r.fort = 0; mark(r.i, 'ruin'); L('war', `The fortress of ${Rn(r)} falls and is razed.`); }
    // credit the ally whose land (or occupied land) actually borders it
    const counts = {};
    r.nb.forEach(j => { const x = S.regions[j]; const holder = x.occ && win.includes(x.occ) ? x.occ : (win.includes(x.owner) && !x.occ ? x.owner : null); if (holder) counts[holder] = (counts[holder] || 0) + 1; });
    r.occ = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (a === win[0] ? -1 : 1))[0] || win[0];
    r.unrest = Math.min(100, r.unrest + 12);
  }
  function warScore(w){
    const pops = side => S.regions.filter(r => side.includes(r.owner)).reduce((s, r) => s + r.pop, 0) || 1;
    const occBy = (side, other) => S.regions.filter(r => other.includes(r.owner) && side.includes(r.occ)).reduce((s, r) => s + r.pop, 0);
    let s = 110 * (occBy(w.att, w.def) / pops(w.def) - occBy(w.def, w.att) / pops(w.att)) + w.battles * 2.5;
    if (w.att.includes(RB[w.goal].occ)) s += 22;
    return clamp(s, -100, 100);
  }
  const reachable = (r, t) => r.nb.some(j => S.regions[j].owner === t);
  function endWar(w, outcome, whiteText){
    const A = S.C[w.att[0]], D = S.C[w.def[0]];
    const goal = RB[w.goal];
    const all = w.att.concat(w.def);
    const occupied = S.regions.filter(r => r.occ && all.includes(r.occ) && all.includes(r.owner));
    const [winners, losers] = outcome === 'att' ? [w.att, w.def] : [w.def, w.att];
    const taken = [];
    const give = (r, to) => { const from = S.C[r.owner]; if (!from.alive || !reachable(r, to)) return false; transfer(r, S.C[to], from); taken.push([r, to, from.tag]); return true; };
    if (outcome !== 'white') {
      const lead = S.C[winners[0]], loser = S.C[losers[0]];
      // the war goal goes to the attacker if it won and can reach it
      if (outcome === 'att' && w.def.includes(goal.owner)) { const holder = goal.occ && w.att.includes(goal.occ) ? goal.occ : A.tag; give(goal, reachable(goal, holder) ? holder : A.tag); }
      // occupied land the occupier can reach and has a reason to keep
      const most = w.great ? 3 : 1;
      let extra = 0;
      occupied.filter(r => r.owner && losers.includes(r.owner) && winners.includes(r.occ) && r !== goal)
        .sort((x, y) => (claim(S.C[y.occ], y) - claim(S.C[x.occ], x)) || y.pop - x.pop)
        .forEach(r => { if (extra >= most) return; const occ = r.occ; if ((claim(S.C[occ], r) > 0 || w.score >= 85 || w.score <= -85 || w.great) && give(r, occ)) extra++; });
      // reparations: a third of the loser's treasury, shared by winners who gained no land (or by all)
      const rep = Math.max(0, loser.treasury * 0.3); loser.treasury -= rep;
      const gainers = new Set(taken.map(x => x[1]));
      const payees = winners.filter(t => S.C[t].alive && !gainers.has(t));
      (payees.length ? payees : winners.filter(t => S.C[t].alive)).forEach((t, _, arr) => { S.C[t].treasury += rep / arr.length; });
      taken.forEach(([r, to]) => { S.C[to].infamy += claim(S.C[to], r) >= 2.5 ? 2 : 6; });
      const byTo = {}; taken.forEach(([r, to]) => (byTo[to] = byTo[to] || []).push(r));
      const landTxt = taken.length ? '. ' + Object.entries(byTo).map(([to, rs]) => `${N(S.C[to])} gains ${rlist(rs)}`).join('; ') : '';
      L('peace', outcome === 'att'
        ? `The <em>${w.name}</em> ends in victory for ${N(lead)}${landTxt}${rep > 5 ? `${taken.length ? ', and' : ';'} ${N(loser)} pays ${Math.round(rep)} gold` : ''}.`
        : `${N(lead)} holds out: the <em>${w.name}</em> ends in defeat for ${N(loser)}${landTxt}${rep > 5 ? `, who pays ${Math.round(rep)} gold` : ''}.`);
    } else L('peace', whiteText || `Exhausted after ${Math.round(w.quarters / 4 * 10) / 10} years, the sides of the <em>${w.name}</em> agree to a white peace.`);
    S.regions.forEach(r => { if (r.occ && all.includes(r.occ) && all.includes(r.owner)) r.occ = null; });
    all.forEach(t => all.forEach(u => { if (t !== u && S.C[t]) S.C[t].truce[u] = S.year + 10; }));
    S.wars = S.wars.filter(x => x !== w);
    if (outcome === 'white') return;
    // a ruler who led his nation into defeat may have to go (not at the armistice: the age is over)
    const beaten = S.C[losers[0]];
    if (beaten && beaten.alive && !(S.year === RULES.end.year && S.q === RULES.end.season) && (taken.some(x => x[2] === beaten.tag) || beaten.tag === w.att[0]) && chance(RULES.reign.abdicate))
      endReign(beaten, 'abdicate', w.name);
  }
  function tickWars(){
    S.wars.slice().forEach(w => {
      w.att = w.att.filter(t => S.C[t].alive); w.def = w.def.filter(t => S.C[t].alive);
      if (!w.att.length || !w.def.length) { S.wars = S.wars.filter(x => x !== w); return; }
      w.quarters++;
      const sA = sideStr(w.att) * rand(0.7, 1.3), sD = sideStr(w.def) * S.era.def * rand(0.7, 1.3);
      const aWin = sA > sD, ratio = aWin ? sA / sD : sD / sA;
      w.battles = clamp(w.battles + (aWin ? 1 : -1), -14, 14);
      const [win, lose] = aWin ? [w.att, w.def] : [w.def, w.att];
      frontMove(win, lose, w, aWin);
      // a crushing advantage breaks through twice; a Bold leader needs less of one, a Cautious one more
      if (ratio > RULES.breakthrough * fx(S.C[win[0]], 'breakthrough')) frontMove(win, lose, w, aWin);
      const bleed = t => fx(S.C[t], 'bleed');
      win.forEach(t => { S.C[t].army *= 1 - rand(0.01, 0.025) * bleed(t); });
      lose.forEach(t => { S.C[t].army *= 1 - rand(0.025, 0.045) * bleed(t); });
      w.score = warScore(w);
      const thr = w.great ? 75 : 60, maxQ = w.great ? 40 : 18;
      const allTaken = S.regions.filter(r => r.owner === w.def[0]).every(r => w.att.includes(r.occ));
      if (w.quarters < 4 && !allTaken) return;
      if (w.score >= thr || allTaken) endWar(w, 'att');
      else if (w.score <= -thr) endWar(w, 'def');
      else if (w.quarters >= maxQ) endWar(w, w.score > 20 ? 'att' : w.score < -20 ? 'def' : 'white');
      else if (w.quarters >= 8 && Math.abs(w.score) < 15 && chance(0.05)) endWar(w, 'white');
    });
  }

  // ---------- AI: forecast every option in gold over the ruler's horizon ----------
  function considerations(c){
    const out = [];
    const T = c.treasury, war = warOf(c), H = horizon(c);
    const mine = regionsOf(c);
    const building = mine.filter(r => r.build).length;
    const baseRisk = riskOf(c);
    const gv = goldValue(c);
    const add = o => { o.ev = Math.round(o.ev); out.push(o); };
    add({ type: 'save', ev: 0, label: 'Save gold', why: 'Nothing else is expected to pay off' });

    // factory: pays back over the horizon
    const leaderFac = Math.max(0.5, ...alive().map(facAvg));
    const catchup = 0.55 + 0.45 * Math.min(1, facAvg(c) / leaderFac);
    const maxFac = 10;
    if (building < maxBuilds(c)) {
      mine.filter(r => r.fac < maxFac && !r.build && !r.occ).forEach(r => {
        const cost = 22 * Math.pow(1.55, r.fac) * catchup * fx(c, 'factoryCost') * (S.railBoom > S.year ? EV.railway.cost : 1);
        if (cost > T) return;
        const gain = (sumInc(regionIncome(r, c, { fac: r.fac + 1, war: false, ignoreOcc: true })) - sumInc(regionIncome(r, c, { war: false, ignoreOcc: true }))) * 4;
        const ev = gain * (H - 1) - cost * gv;
        add({ type: 'factory', r, cost, ev, label: `Build a factory in ${r.name}`,
          why: `Costs ${Math.round(cost)}${catchup < 0.95 ? ' (cheap: copying richer nations)' : ''}, adds ${gain.toFixed(1)} a year; pays back in ${Math.max(1, Math.round(cost / Math.max(0.1, gain)) + 1)} years` });
      });
    }

    // army: compare the next level up and down
    const wf0 = workforce(c), inc0 = income(c) * 4;
    // after 1890 every chancellery expects a general war; a weak army then risks a share of everything
    const gwW = clamp((S.year - 1888) / 24, 0, 1);
    const gwRef = (() => { const ms = S.majors.filter(t => t !== c.tag).map(t => strength(S.C[t])); return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 1; })();
    const gwLoss = d => gwW * inc0 * 6 * (1 - mySide(c, d) / (mySide(c, d) + gwRef));
    const armyEV = delta => {
      const r1 = riskOf(c, delta).total + gwLoss(delta) - gwLoss(0);
      const incLoss = (inc0 / Math.max(0.01, wf0)) * (wf0 - workforce(c, c.army + delta)) * 0.85; // tax and factory part
      const upk = delta * 0.04 * 4 * fx(c, 'upkeep');
      return (baseRisk.total - r1) - (incLoss + upk * gv) * H - (delta > 0 ? delta * 3 * fx(c, 'recruit') * gv : 0);
    };
    const step = Math.max(5, c.army * 0.15, popOf(c) * 0.5);
    let bestA = null;
    [step, step * 2.5].forEach(st => { if (T < st * 3 * fx(c, 'recruit') + 5) return;
      const ev = armyEV(st) + (war ? 30 + st : 0);
      if (!bestA || ev > bestA.ev) bestA = { type: 'army', amt: st, ev, label: `Grow the army by ${Math.round(st)}k`,
        why: war ? 'At war: the army needs every man' : gwW > 0.3 && !baseRisk.top ? 'Preparing for the general war everyone expects' : baseRisk.top ? `Cuts expected losses to ${baseRisk.top.name} by ${Math.round(baseRisk.total - riskOf(c, st).total)}; costs ${(st * 0.16).toFixed(1)} a year in upkeep plus lost workers` : 'Little danger nearby' }; });
    if (bestA) add(bestA);
    if (!war && c.army - step >= popOf(c) * 0.8) {
      const ev = armyEV(-step);
      add({ type: 'demob', amt: step, ev, label: `Shrink the army by ${Math.round(step)}k`, why: `Workers back in factories and fields; expected losses rise by ${Math.round(riskOf(c, -step).total - baseRisk.total)}` });
    }

    // fortress facing the most dangerous neighbour
    if (baseRisk.top && building < maxBuilds(c) && T >= 25) {
      const o = baseRisk.top, t = threatOf(o, c);
      const fs = mine.filter(r => !r.fort && !r.build && !r.occ && r.nb.some(j => S.regions[j].owner === o.tag)).sort((a, b) => provYearly(b, c) - provYearly(a, c))[0];
      const fc = 25 * fx(c, 'fortCost');
      if (fs) add({ type: 'fort', r: fs, cost: fc, ev: Math.min(1.5, t.p * H) * pWin(t.ratio) * 0.45 * (provYearly(fs, c) * H * 0.6 + 25) - fc * gv,
        label: `Fortify ${fs.name}`, why: `Guards the richest border with ${o.name}` });
    }

    // reform: income recovered from unrest, plus revolts avoided
    if (T >= 20 && c.reformCd <= S.t) {
      let gain = 0;
      mine.forEach(r => { const now = sumInc(regionIncome(r, c)), calm = sumInc(regionIncome(r, c, { unrest: Math.max(0, r.unrest - RULES.reform.calm * fx(c, 'reformCalm')) }));
        gain += (calm - now) * 4 * 1.6; if (r.unrest > 55) gain += 0.35 * provYearly(r, c) * Math.min(H, 12); });
      if (gain > 1) add({ type: 'reform', ev: gain - RULES.reform.cost * fx(c, 'reformCost') * gv, label: 'Pass reforms to calm unrest', why: `Average unrest ${Math.round(unrestOf(c))}; recovers lost taxes and heads off uprisings` });
    }

    // diplomacy: alliances cut expected losses; courting makes them possible
    const allyPool = new Set(); neighborsOf(c).forEach(o => allyPool.add(o)); if (baseRisk.top) neighborsOf(baseRisk.top).forEach(o => allyPool.add(o)); S.majors.forEach(t => allyPool.add(S.C[t]));
    if (!war) [...allyPool].forEach(o => {
      if (!o.alive || o === c || c.allies.has(o.tag) || warOf(o) || c.allies.size >= 3 || o.allies.size >= 3) return;
      const mine2 = baseRisk.total - riskOf(c, 0, o).total;
      const theirs = riskOf(o).total - riskOf(o, 0, c).total;
      const drag = riskOf(o).total * 0.12;
      const ev = mine2 - drag;
      if (ev < 3) return;
      const r = rel(c.tag, o.tag);
      const guard = baseRisk.top ? baseRisk.top.name : 'trouble';
      if (r >= 30 && theirs - riskOf(c).total * 0.12 <= 0) return;
      if (r >= 30) add({ type: 'ally', o, ev, guard: baseRisk.top, theirs: theirs - riskOf(c).total * 0.12, label: `Ally with ${o.name}`, why: `Cuts expected losses to ${guard} by ${Math.round(mine2)}` });
      else add({ type: 'court', o, ev: ev * 0.25, label: `Court ${o.name}`, why: `A future ally against ${guard} (relations ${Math.round(r)})` });
    });
    // peaceful union of a fellow-national minor
    const union = unionOf(c);
    if (union && !war) neighborsOf(c).forEach(o => {
      if (isMajor(o) || o.noAnnex || warOf(o) || !union.peoples.includes(o.culture)) return;
      const val = regionsOf(o).reduce((s, r) => s + provYearly(r, c) * ambitionW(c, r), 0) * (H - 1.5);
      const r = rel(c.tag, o.tag);
      const ok = r >= 70 && power(c) > 2 * power(o) && ![...o.allies].some(t => t !== c.tag && isMajor(S.C[t]));
      if (ok) add({ type: 'annex', o, ev: val, label: `Unite with ${o.name} by treaty`, why: `Toward ${theTitle(union)}; adds ${Math.round(val / (H - 1.5))} a year with no war` });
      else if (r < 75) add({ type: 'court', o, ev: val * 0.08, label: `Court ${o.name}`, why: `Toward ${theTitle(union)} (relations ${Math.round(r)} of 70 needed)` });
    });

    // war: chance of winning x what the province pays once settled, minus the price of fighting and of losing
    if (!war && T > -10 && unrestOf(c) < 50) {
      let best = null;
      borderRegions(c).forEach(r => {
        const o = S.C[r.owner];
        if (!o.alive) return;
        const e = warEval(c, o, r); if (!e || e.p < 0.55) return;
        if (!best || e.ev > best.ev) best = { type: 'war', o, r, p: e.p, pTrue: e.pTrue, ev: e.ev, label: `Invade ${o.name} for ${r.name}`,
          why: `${Math.abs(e.p - e.pTrue) > 0.07 ? `believes ${Math.round(e.p * 100)}% to win (truly ${Math.round(e.pTrue * 100)}%)` : `${Math.round(e.p * 100)}% to win`}${warOf(o) ? ` while ${o.name} is busy fighting` : ''}${inUnion(c, r) ? `; toward ${theTitle(unionOf(c))}` : ''}; ${r.name} pays ${e.yearly.toFixed(0)} a year once integrated${o.treasury > 100 ? `, plus a share of ${o.name}'s ${Math.round(o.treasury)} gold` : ''}; war costs ~${Math.round(e.cost)}` };
      });
      if (best) add(best);
    }
    out.sort((a, b) => b.ev - a.ev);
    return out;
  }

  function act(c, a){
    const spend = (k, v) => { c.treasury -= v; c.spent[k] = (c.spent[k] || 0) + v; };
    switch (a.type) {
      case 'factory': spend('build', a.cost); a.r.build = { type: 'factory', left: RULES.build.factory }; return;
      case 'fort': spend('build', a.cost); a.r.build = { type: 'fort', left: RULES.build.fort }; return;
      case 'army': spend('army', a.amt * 3 * fx(c, 'recruit')); c.army += a.amt; return;
      case 'demob': c.army = Math.max(3, c.army - a.amt); return;
      case 'reform': spend('reform', RULES.reform.cost * fx(c, 'reformCost')); reform(c); return;
      case 'court': addRel(c.tag, a.o.tag, 6 + rand(0, 4)); return;
      case 'ally':
        if (a.theirs > 0 && rel(c.tag, a.o.tag) >= 30 && a.o.rival !== c.tag) { ally(c.tag, a.o.tag); addRel(c.tag, a.o.tag, 10);
          L('diplo', a.guard && a.guard !== a.o ? `${N(c)} and ${N(a.o)} sign an alliance against ${N(a.guard)}.` : `${N(c)} and ${N(a.o)} sign a defensive pact.`); }
        else addRel(c.tag, a.o.tag, 3);
        return;
      case 'annex': L('unify', `${N(a.o)} joins ${N(c)} by treaty: one people, one crown.`); regionsOf(a.o).forEach(r => transfer(r, c, a.o, 'treaty')); return;
      case 'war': declareWar(c, a.o, a.r, { p: a.p, pTrue: a.pTrue }); return;
    }
  }
  // Do every affordable option that is expected to pay off, best first (up to 4 a season).
  function decide(c){
    let first = null; const done = [];
    for (let k = 0; k < 4 && c.alive; k++) {
      RISK = {};
      const cands = considerations(c);
      const choice = cands[0];
      if (!first) first = cands;
      if (!choice || choice.type === 'save' || choice.ev <= 0) break;
      done.push(choice.label);
      act(c, choice);
      if (choice.type === 'war' || choice.type === 'annex' || choice.type === 'ally') break;
    }
    c.thoughts = first.slice(0, 8).map(x => ({ label: x.label, why: x.why, ev: x.ev, type: x.type, chosen: done.includes(x.label) || (!done.length && x.type === 'save') }));
    c.didThisSeason = done;
    c.thoughtsWhen = `${SEASONS[S.q]} ${S.year}`;
  }

  // ---------- construction, settling, unrest, revolts ----------
  function tickProvinces(){
    S.regions.forEach(r => {
      if (r.battle > 0) r.battle--;
      if (r.flash > 0) r.flash--;
      if (r.integ < 1 && !r.occ) { const o = S.C[r.owner]; r.integ = Math.min(1, r.integ + ((isAccepted(o, r.culture) || r.core === o.tag) ? 0.08 : 0.028 * fx(o, 'integrateOther')) * fx(o, 'integrate'));
        if (r.integ >= 1) L('econ', `${Rn(r)} is now fully integrated into ${N(o)}.`); }
      if (!r.build || r.occ) return;
      if (--r.build.left > 0) return;
      const o = S.C[r.owner];
      if (r.build.type === 'factory') { r.fac++; if (r.fac >= 3) L('econ', `A new factory opens in ${Rn(r)} (${N(o)}); it now has ${r.fac}.`); }
      else { r.fort = 1; L('econ', `${N(o)} completes a fortress in ${Rn(r)}.`); }
      r.build = null;
    });
  }
  function nationalism(){ return 0.3 + (S.year - RULES.start) / 70; }
  function tickUnrest(){
    S.regions.forEach(r => {
      const o = S.C[r.owner];
      const foreign = !isAccepted(o, r.culture);
      const target = 8 + (foreign ? 25 + 36 * nationalism() + (S.awake[r.culture] || 0) : 0) + (inCrisis(o) ? 12 : 0) + Math.min(18, r.fac * 3) * clamp((S.year - 1848) / 45, 0, 1) + (warOf(o) ? 10 : 0) + (r.occ ? 25 : 0) + (o.treasury < 0 ? 15 : 0) + 15 * (1 - r.integ) + fx(o, 'unrest') + (foreign ? fx(o, 'unrestOther') : fx(o, 'unrestOwn'));
      r.unrest = clamp(r.unrest + (target - r.unrest) * 0.07 + rand(-2, 2.5), 0, 100);
    });
  }
  function revolts(){
    S.regions.forEach(r => {
      if (r.unrest < RULES.unrest.uprising || r.occ) return;
      if (!chance(0.025 * (r.unrest - 60) / 40)) return;
      const o = S.C[r.owner];
      S.stats.revolts++; r.flash = 3; mark(r.i, 'revolt');
      const rebels = r.pop * 2.2 * rand(0.5, 1.6) * (1 + (S.year - RULES.start) / 80) * (1 + (S.awake[r.culture] || 0) / 10);
      const garrison = o.army * quality(o) * (warOf(o) ? 0.6 : 2.2) / Math.max(1, regionsOf(o).length) * (inCrisis(o) ? RULES.reign.crisisArmy : 1) * rand(0.6, 1.3) * (r.fort ? 1.6 : 1) * fx(o, 'garrison');
      if (rebels < garrison) { r.unrest = 35; o.army *= 0.96; L('revolt', `Riots in ${Rn(r)} are put down by the ${o.adj} army.`); return; }
      if (isAccepted(o, r.culture)) {
        o.treasury *= 0.5; regionsOf(o).forEach(x => x.unrest = Math.max(15, x.unrest - 30)); o.army *= 0.85;
        endReign(o, 'revolution', Rn(r)); return; }
      const kin = r.nb.map(j => S.C[S.regions[j].owner]).find(k => k.alive && k.culture === r.culture && k !== o && !warOf(k));
      const spread = () => regionsOf(o).forEach(x => { if (!isAccepted(o, x.culture) && x.core !== o.tag) x.unrest = Math.min(100, x.unrest + 15); });
      if (kin) { L('revolt', `${Rn(r)} rises against ${N(o)} and declares for ${N(kin)}.`); transfer(r, kin, o, 'treaty'); r.core = kin.tag; r.unrest = 20; spread(); return; }
      // who the rebels fight for: the province's own fallen nation if it was of their people, else the nation their people rises as
      const home = NATIONS[r.core] && NATIONS[r.core].culture === r.culture && !S.C[r.core].alive ? r.core : null;
      const tag = home || risesAs(r.culture);
      if (!tag || (S.C[tag] && S.C[tag].alive)) {
        r.unrest = 40; o.army *= 0.93; if (o.treasury > 0) o.treasury *= 0.85;
        L('revolt', `Rebels seize ${Rn(r)} but find no allies; ${N(o)} retakes it at a heavy cost in gold and men.`); return; }
      const restored = !!S.C[tag], wasPlayer = restored && S.C[tag].player;
      // what every nation born in an uprising gets (rules.json newNation): gold, an army sized by its people, an old enemy, perhaps a guarantor
      const nc = makeCountry(tag, Object.assign({}, NATIONS[tag], { army: r.pop * RULES.newNation.armyPerMillion }));
      nc.treasury = RULES.newNation.gold; nc.born = S.year; nc.restored = restored; if (wasPlayer) nc.player = true;
      setAmbition(nc); S.C[tag] = nc; if (!tags.includes(tag)) tags.push(tag);
      const group = [r].concat(r.nb.map(j => S.regions[j]).filter(x => x.owner === o.tag && x.culture === r.culture && !x.occ && (!home || x.core === home)));
      invalidate(); group.forEach(x => { x.owner = tag; x.core = tag; x.unrest = 15; x.build = null; x.flash = 3; x.integ = 1; });
      killIfEmpty(o);
      tags.forEach(u => u !== tag && setRel(tag, u, u === o.tag ? RULES.newNation.hostility : rand(-5, 20)));
      nc.truce[o.tag] = S.year + RULES.newNation.truce; o.truce[tag] = S.year + RULES.newNation.truce;
      spread();
      const guard = S.majors.map(t2 => S.C[t2]).filter(m => m.alive && m !== o && !warOf(m) && m.allies.size < 3 && (rel(m.tag, o.tag) < 0 || m.rival === o.tag)).sort((x, y) => strength(y) - strength(x))[0];
      if (guard) { ally(guard.tag, tag); setRel(guard.tag, tag, 70); nc.guarantee = { by: guard.tag, until: S.year + RULES.newNation.guarantee }; }
      L('revolt', `Independence! ${rlist(group)} break${group.length > 1 ? '' : 's'} away from ${N(o)} and ${restored ? 'restore' : 'form'}${group.length > 1 ? '' : 's'} ${N(nc)} under ${RN(nc.ruler)}.${guard ? ` ${N(guard)} guarantees its independence.` : ''}`);
      o.army *= 0.85;
    });
  }

  // ---------- ambitions (content/ambitions.json): what each nation must achieve by the armistice ----------
  // Every nation names its ambition in its own entry, and several can share one. The great powers race to be the richest;
  // the nations of a divided people race to unite it, and the first to proclaim it wins while the rest have lost.
  const KINDS = CONTENT.ambitionKinds;
  const AMBITIONS = Object.fromEntries(Object.entries(CONTENT.ambitions).map(([id, a]) => [id, Object.assign({ id }, a, a.provinces ? { pset: new Set(a.provinces) } : {})]));
  const UNIONS = Object.values(AMBITIONS).filter(a => a.kind === 'unite');
  // the union a nation is still working toward, if any
  const unionOf = c => { const a = c.ambition && AMBITIONS[c.ambition.id]; return a && a.kind === 'unite' && !a.done ? a : null; };
  const inUnion = (c, r) => { const u = unionOf(c); return !!u && u.pset.has(r.id); };
  // the union whose provinces a nation claims: the one it works toward, or has proclaimed; when a rival proclaims it, the claims go with it
  const claimedUnion = c => { const a = c.ambition && AMBITIONS[c.ambition.id]; return a && a.kind === 'unite' && (!a.done || a.done === c.tag) ? a : null; };
  const inClaimedUnion = (c, r) => { const u = claimedUnion(c); return !!u && u.pset.has(r.id); };
  const theTitle = u => `${u.art ?? 'the '}${u.title}`;
  S.UNIONS = UNIONS; S.unionOf = unionOf; S.claimedUnion = claimedUnion; S.theTitle = theTitle;
  S.unionProgress = () => UNIONS.map(d => {
    const lead = alive().filter(c => d.done ? c.tag === d.done : unionOf(c) === d).map(c => ({ c, n: regionsOf(c).filter(r => d.pset.has(r.id)).length })).sort((a, b) => b.n - a.n)[0];
    return { id: d.id, title: d.title, need: d.need, done: d.done && S.C[d.done].alive ? S.C[d.done] : null, lead: lead ? lead.c : null, n: lead ? lead.n : 0, peoples: d.peoples.join(', ') };
  });
  function unification(){
    UNIONS.forEach(d => {
      if (d.done || S.year < d.from) return;
      alive().filter(c => unionOf(c) === d).forEach(c => {
        if (d.done) return;
        const own = regionsOf(c).filter(r => d.pset.has(r.id)).length;
        if (own < d.need) return;
        d.done = c.tag; c.name = d.title; c.adj = d.adj; c.pre = d.pre;
        d.peoples.forEach(x => c.acc.add(x));
        regionsOf(c).forEach(r => { r.unrest = Math.max(0, r.unrest - 25); if (d.peoples.includes(r.culture)) r.integ = 1; });
        mark(capitalOf(c).i, 'crown');
        L('unify', say(KINDS.unite.proclaimText, { n: own, nation: N(c) }));
        alive().filter(o => o !== c && d.peoples.includes(o.culture) && !isMajor(o) && !o.noAnnex && !warOf(o) && ![...o.allies].some(t => t !== c.tag && isMajor(S.C[t]))).forEach(o => {
          L('unify', say(KINDS.unite.joinText, { nation: N(o), by: N(c) })); regionsOf(o).forEach(r => transfer(r, c, o, 'treaty')); });
      });
    });
  }
  // fixed at birth from the nation's own entry; a union someone else already proclaimed leaves only survival,
  // and only the great powers of the first season can race to be the richest
  function setAmbition(c){
    const a = AMBITIONS[c.ambitionId] || AMBITIONS.survive;
    const gone = (a.kind === 'unite' && a.done) || (a.kind === 'richest' && c.born !== RULES.start);
    c.ambition = gone ? { id: 'survive', kind: 'survive' } : { id: a.id, kind: a.kind };
  }
  alive().forEach(setAmbition);
  // how the ambition stands: 'open', 'met' (so far, or for good at the armistice) or 'lost'
  function ambitionOf(c){
    const a = c.ambition || { id: 'survive', kind: 'survive' };
    // a nation that is gone has lost, but its ambition still names its union
    if (!c.alive) return a.kind === 'unite' ? { ...a, title: AMBITIONS[a.id].title, the: AMBITIONS[a.id].art ?? 'the ', n: 0, need: AMBITIONS[a.id].need, state: 'lost' } : { ...a, state: 'lost' };
    if (a.kind === 'survive') return { ...a, state: S.over ? 'met' : 'open' };
    if (a.kind === 'richest') { const rich = alive().filter(o => o.ambition && o.ambition.kind === 'richest').sort((x, y) => score(y) - score(x));
      return { ...a, rank: rich.indexOf(c) + 1, of: rich.length, state: rich[0] === c ? (S.over ? 'met' : 'open') : S.over ? 'lost' : 'open' }; }
    const d = AMBITIONS[a.id], n = regionsOf(c).filter(r => d.pset.has(r.id)).length, base = { ...a, title: d.title, the: d.art ?? 'the ', n, need: d.need };
    if (d.done && d.done !== c.tag) return { ...base, state: 'lost', by: d.done };
    if (d.done) return { ...base, state: n >= d.need ? 'met' : S.over ? 'lost' : 'open', proclaimed: true };
    return { ...base, state: S.over ? 'lost' : 'open' };
  }
  S.ambitionOf = ambitionOf;

  // ---------- events (content/events.json: when each can happen, how likely, what it does) ----------
  const Q = p => chance(p / 4);   // a yearly chance, rolled each season
  const within = e => S.year >= e.years[0] && S.year <= e.years[1];
  const EVENTS = [
    () => { const e = EV.springtime; if (S.year === e.year && S.q === e.season) { L('event', say(e.text)); S.regions.forEach(r => r.unrest = Math.min(100, r.unrest + e.unrest)); } },
    () => { const e = EV.famine; if (within(e) && !S.flags.famine && Q(e.chance)) { S.flags.famine = 1; const r = RB[e.province]; r.pop *= e.pop; r.unrest = Math.min(100, r.unrest + e.unrest); L('event', say(e.text, { ...e, province: Rn(r) })); } },
    () => { const e = EV.cholera; if (Q(e.chance)) { const vs = alive().sort(() => rng() - 0.5).slice(0, e.nations); vs.forEach(c => regionsOf(c).forEach(r => { r.pop *= e.pop; r.unrest += e.unrest; })); L('event', say(e.text, { ...e, nations: list(vs) })); } },
    () => { const e = EV.railway; if (S.year >= e.from && !S.flags.rail && Q(e.chance)) { S.flags.rail = 1; S.railBoom = S.year + e.lasts; L('event', say(e.text, e)); } },
    () => { const e = EV.panic; if (within(e) && !S.flags.dep && Q(e.chance)) { S.flags.dep = 1; alive().forEach(c => c.treasury *= e.gold); S.depression = S.t + e.seasons; S.regions.forEach(r => r.unrest += e.unrest); L('event', say(e.text, e)); } },
    () => { const e = EV.compromise, a = S.C[e.nation], hp = RB[e.province]; if (a.alive && !S.flags.ausg && S.year >= e.from && hp.owner === e.nation && hp.unrest > e.unrest && Q(e.chance)) {
      S.flags.ausg = 1; a.acc.add(e.people); a.name = e.newName; a.adj = e.newAdj; hp.unrest = e.calm; L('event', say(e.text, { ...e, nation: N(a) })); } },
    () => { const e = EV.serfdom, r = S.C[e.nation]; if (r.alive && !S.flags.serf && S.year >= e.from && Q(e.chance)) { S.flags.serf = 1; e.provinces.forEach(id => { if (RB[id].owner === e.nation) RB[id].fac = RB[id].fac + e.factories; }); L('event', say(e.text, { ...e, nation: N(r) })); } },
    () => { const e = EV.incident; if (Q(e.chance)) { const ps = alive().filter(c => c.rival && S.C[c.rival].alive); if (ps.length) { const c = pick(ps), o = S.C[c.rival]; addRel(c.tag, o.tag, e.relations); L('diplo', say(e.text, { a: N(c), b: N(o) })); } } },
    () => { const e = EV.marriage; if (Q(e.chance)) { const vs = alive().sort(() => rng() - 0.5).slice(0, 2); if (vs.length === 2 && vs[0].rival !== vs[1].tag) { addRel(vs[0].tag, vs[1].tag, e.relations); L('diplo', say(e.text, { a: N(vs[0]), b: N(vs[1]) })); } } },
    () => { const e = EV.harvest; if (S.q === e.season && Q(e.chance)) { const c = pick(alive()); regionsOf(c).forEach(r => r.unrest += e.unrest); L('event', say(e.text, { nation: N(c) })); } },
    // national awakenings raise unrest among a people for good
    () => { const e = EV.shevchenko; if (within(e) && !S.awake[e.people] && Q(e.chance)) { S.awake[e.people] = e.awake; L('event', say(e.text)); } },
    () => { const e = EV.awakening; if (S.year >= e.from && Q(e.chance)) { const cul = pick(e.peoples);
      if (!S.awake[cul] && S.regions.some(r => r.culture === cul && !isAccepted(S.C[r.owner], cul))) { S.awake[cul] = e.awake; L('event', say(e.text, { people: cul })); } } },
    // a military revolution changes who wins battles (content/eras.json)
    () => { const e = EV.revolution; if (S.year - S.era.since >= e.every && Q(e.chance)) {
      const nx = pick(CONTENT.eras.filter(x => !x.start && x.name !== S.era.name)); S.era = { name: nx.name, def: nx.def, fort: nx.fort, since: S.year };
      L('event', say(e.text, { era: nx.name })); } },
    // a coal or railway boom makes one province suddenly valuable
    () => { const e = EV.boom; if (S.year >= e.from && Q(e.chance)) { const r = pick(S.regions.filter(x => !x.occ)); r.fac += e.factories; r.pop *= e.pop; mark(r.i, 'boom');
      L('event', say(e.text, { ...e, find: pick(e.finds), province: Rn(r), nation: N(S.C[r.owner]) })); } },
    // diplomatic crisis: an ultimatum to a rival
    () => { const e = EV.ultimatum; if (Q(e.chance)) { const cs = alive().filter(c => c.rival && S.C[c.rival].alive && !warOf(c) && !warOf(S.C[c.rival]) && isNeighbor(c, S.C[c.rival])); if (!cs.length) return;
      const c = pick(cs), o = S.C[c.rival];
      let best = null; borderRegions(c).filter(r => r.owner === o.tag).forEach(r => { const ev = warEval(c, o, r); if (ev && (!best || ev.ev > best.ev)) best = { ...ev, r }; });
      if (!best || best.ev + e.margin < 0) { if (chance(e.rattle)) L('diplo', say(e.rattleText, { a: N(c), b: N(o), pretext: pick(e.pretexts) })); return; }
      const oFears = believe(o, theirSide(o, c.tag) * S.era.def / Math.max(1, mySide(c))) < e.backDown;
      if (oFears) { const pay = Math.max(0, o.treasury * e.pay); o.treasury -= pay; c.treasury += pay; regionsOf(o).forEach(r => r.unrest += e.unrest); addRel(c.tag, o.tag, e.relations);
        L('diplo', say(e.text, { a: N(c), b: N(o), gold: Math.round(pay) })); }
      else { const name = warName(c, o); declareWar(c, o, best.r, { p: best.p, pTrue: best.pTrue, name, text: say(e.warText, { a: N(c), b: N(o), province: Rn(best.r), war: name }) }); } } },
    // coups in restless countries (rules.json: reign)
    () => { alive().forEach(c => {
      if (unrestOf(c) > RULES.reign.coupUnrest && chance(RULES.reign.coup)) endReign(c, 'coup'); }); },
  ];
  function successions(){
    alive().forEach(c => {
      if (S.t >= c.ruler.until) endReign(c, 'death');
      else if (chance(RULES.reign.murder / 4)) endReign(c, 'murder');
    });
  }
  // what changes during a reign: a Drunk's judgment swings anew every season
  function tickRulers(){
    alive().forEach(c => { if (c.ruler && hasFx(c, 'swing')) c.ruler.swing = rand(-fx(c, 'swing'), fx(c, 'swing')); });
  }
  // reforms: unrest falls everywhere, and can only be passed again after a wait
  function reform(c){
    c.reformCd = S.t + RULES.reform.wait;
    regionsOf(c).forEach(r => r.unrest = Math.max(0, r.unrest - RULES.reform.calm * fx(c, 'reformCalm')));
  }

  function greatWar(){
    if (S.year < RULES.greatWar.year || S.q < RULES.greatWar.season || S.flags.gw) return;
    S.flags.gw = 1;
    const ms = S.majors.map(t => S.C[t]).filter(c => c.alive);
    let best = null, bv = Infinity;
    ms.forEach(a => ms.forEach(b => { if (a.tag < b.tag && !a.allies.has(b.tag)) { const v = rel(a.tag, b.tag) - (a.rival === b.tag || b.rival === a.tag ? 40 : 0); if (v < bv) { bv = v; best = [a, b]; } } }));
    if (!best) return;
    let [a, d] = best; if (power(a) < power(d)) [a, d] = [d, a];
    S.wars.forEach(w => { L('peace', `The <em>${w.name}</em> is abandoned as a greater storm gathers.`); S.regions.forEach(r => { if (r.occ && w.att.concat(w.def).includes(r.occ)) r.occ = null; }); });
    S.wars = [];
    const sideA = new Set([a.tag]), sideD = new Set([d.tag]);
    let changed = true;
    while (changed) { changed = false;
      alive().forEach(c => { if (sideA.has(c.tag) || sideD.has(c.tag)) return;
        const la = [...c.allies].some(t => sideA.has(t)), ld = [...c.allies].some(t => sideD.has(t));
        if (la && !ld) { sideA.add(c.tag); changed = true; } else if (ld && !la) { sideD.add(c.tag); changed = true; } }); }
    const goal = borderRegions(a).find(r => r.owner === d.tag) || regionsOf(d)[0];
    const w = declareWar(a, d, goal, { great: true, name: 'Great War', text: say(EV.greatWar.text, { a: N(a), b: N(d) }) });
    w.att = [...sideA]; w.def = [...sideD];
    const ja = w.att.slice(1).map(t => S.C[t]), jd = w.def.slice(1).map(t => S.C[t]);
    if (ja.length) L('war', `Bound by treaty, ${list(ja)} ${ja.length > 1 ? 'march' : 'marches'} with ${N(a)}.`);
    if (jd.length) L('war', `${list(jd)} ${jd.length > 1 ? 'stand' : 'stands'} with ${N(d)}.`);
    S.greatWar = w;
  }

  // ---------- one season ----------
  function step(){
    if (S.over || S.pending) return;
    const cs = alive();
    cs.forEach(c => {
      let tax = 0, fac = 0, trade = 0; regionsOf(c).forEach(r => { const x = regionIncome(r, c); tax += x.tax; fac += x.fac; trade += x.trade; });
      const lostWork = (tax + fac) / Math.max(0.01, workforce(c)) * (1 - workforce(c));
      const lostAdmin = (tax + fac + trade) / adminOf(c) * (1 - adminOf(c));
      c.ledger = { tax, fac, trade, upkeep: upkeep(c), lostWork, lostAdmin, spent: c.spent }; c.spent = {};
      c.treasury += tax + fac + trade - upkeep(c);
      if (c.crisis && S.t === c.crisis.until && c.ruler.name === c.crisis.winner) L('ruler', `${RN(c.ruler)} wins the civil war in ${N(c)}.`);
      regionsOf(c).forEach(r => r.pop *= 1 + 0.0015 + r.fac * 0.0003);
      c.infamy = Math.max(0, c.infamy - 0.3);
      if (c.treasury < -40) c.army *= 0.97;
      c.army = Math.max(1, c.army);
    });
    cs.forEach(c => cs.forEach(o => { if (c.tag >= o.tag) return;
      let r = rel(c.tag, o.tag) * 0.987;
      if (c.rival === o.tag || o.rival === c.tag) r -= 0.8;
      if (c.allies.has(o.tag)) r += 0.5;
      if (o.infamy > 15 && isNeighbor(c, o)) r -= o.infamy / 40;
      if (c.infamy > 15 && isNeighbor(c, o)) r -= c.infamy / 40;
      setRel(c.tag, o.tag, r); }));
    const guarded = (c, t) => (c.guarantee && c.guarantee.by === t && S.year < c.guarantee.until) || (S.C[t].guarantee && S.C[t].guarantee.by === c.tag && S.year < S.C[t].guarantee.until);
    cs.forEach(c => [...c.allies].forEach(t => { if (rel(c.tag, t) < 0 && chance(0.08) && !warOf(c) && !guarded(c, t)) { c.allies.delete(t); S.C[t].allies.delete(c.tag); L('diplo', `The alliance between ${N(c)} and ${N(S.C[t])} lapses.`); } }));
    if (S.q === 0) { if (S.year % 5 === 0) computeMajors(); alive().forEach(pickRival); }
    S.leader = alive().reduce((b, c) => !b || score(c) > score(b) ? c : b, null).tag;
    EVENTS.forEach(e => e());
    successions();
    tickRulers();
    greatWar();
    tickProvinces();
    alive().sort(() => rng() - 0.5).forEach(c => { if (c.alive) decide(c); });
    tickWars();
    tickUnrest();
    revolts();
    unification();
    if (S.q === 3) S.history.push({ y: S.year, p: Object.fromEntries(alive().map(c => [c.tag, score(c)])) });
    if (S.year === RULES.end.year && S.q === RULES.end.season) {   // the armistice: every world ends here
      if (S.greatWar && S.wars.includes(S.greatWar)) L('peace', say(EV.armistice.text));
      S.wars.slice().forEach(w => endWar(w, w.score > 10 ? 'att' : w.score < -10 ? 'def' : 'white'));
      S.over = true;
      const rich = alive().filter(c => c.ambition.kind === 'richest').sort((a, b) => score(b) - score(a))[0];
      const united = alive().filter(c => c.ambition.kind === 'unite' && ambitionOf(c).state === 'met');
      const survivors = alive().filter(c => c.ambition.kind === 'survive');
      L('event', `<strong>The age ends.</strong> ${rich ? `${N(rich)} is the richest great power. ` : ''}${united.length ? `${list(united)} still ${united.length > 1 ? 'hold their peoples' : 'holds its people'} together. ` : 'No united people outlives the war. '}${survivors.length ? `${list(survivors)} survive${survivors.length > 1 ? '' : 's'}.` : ''}`);
      return;
    }
    S.t++; S.year = RULES.start + Math.floor(S.t / 4); S.q = S.t % 4;
  }

  alive().forEach(pickRival);
  S.history.push({ y: 1835, p: Object.fromEntries(alive().map(c => [c.tag, score(c)])) });
  L('event', say(EV.opening.text, { nations: alive().length }));
  // a human player rules one country: same rules, but they choose its heirs (starting with the ruler of 1836)
  if (opts.player && S.C[opts.player]) { S.player = opts.player; const pc = S.C[opts.player]; pc.player = true; S.rerolls = RULES.rerolls;
    // vary the draw by country, so two countries in the same world are not offered the same three characters
    for (let i = [...pc.tag].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 13; i > 0; i--) rng();
    S.pending = heirCard(pc, true); }
  Object.assign(S, { chooseHeir, rerollHeirs, step, alive, considerations, SEASONS, riskOf, thriftOf, inCrisis, TRAITS, traitDesc, capitalOf, landNeighbors });
  return S;
}

if (typeof module !== 'undefined') module.exports = { createSim, REGIONS, MAP_W, MAP_H, SEASONS };
