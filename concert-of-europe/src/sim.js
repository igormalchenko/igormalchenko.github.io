// ===================== SIMULATION CORE v3 =====================
// Every nation pursues one goal: the highest yearly income when the Great War ends.
// Each season it forecasts, in gold over its ruler's planning horizon, what every option is worth, and takes the best.

// the content the engine runs on (content/*.json)
const RULES = CONTENT.rules, EV = CONTENT.events, PEOPLES = CONTENT.peoples, SEASONS = RULES.seasons;
// rulers: one trait each (content/rulers.json), at one rarity (content/rarities.json, 0 = Common … 4 = Legendary).
// A trait has a main bonus, from Rare on a one-time flat bonus, and a malus; the rarity says which of each one's values applies.
const TRAITS = CONTENT.rulers, RARITY = CONTENT.rarities, EFFECTS = CONTENT.effects;
const TRAIT_KEYS = Object.keys(TRAITS);
const NEUTRAL_FX = Object.fromEntries(Object.entries(EFFECTS).map(([k, e]) => [k, e.none]));
const DEFAULT_AMBITION = Object.keys(CONTENT.ambitions).find(id => CONTENT.ambitions[id].fallback);
// the effects one trait has at one rarity, in card order: [{slot, fx, value, text}]
function traitEffects(t, g){
  const T = TRAITS[t], R = RARITY[g], out = [];
  for (const slot of ['main', 'flat', 'malus']) if (R[slot] !== null) {
    const e = T[slot][R[slot]];
    out.push({ slot, ...e, text: say(e.text, { v: e.value }) });
  }
  return out;
}
// One formatter for chooser, owned-card hovers and Almanac; acquisitions contain IDs and runtime parameters only.
function advanceEffects(a, nation = a.target ? CONTENT.nations[a.target].name : ''){
  return CONTENT.advances.cards[a.id].effects.map(e => ({ fx: e.fx, value: e.values[a.grade],
    text: say(e.text, { v: e.values[a.grade], nation }) }));
}
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

function createSim(seed, geo, opts = {}){
  if (opts.player && !Object.hasOwn(COUNTRIES, opts.player)) throw new Error(`Unknown starting player nation: ${opts.player}`);
  const NAVAL = new Set(geo.naval.flatMap(([a, b]) => [a + '-' + b, b + '-' + a]));
  const rng = mulberry32(seed);
  const rand = (a = 0, b = 1) => a + (b - a) * rng();
  const chance = p => rng() < p;
  const pick = a => a[Math.floor(rng() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sig = x => 1 / (1 + Math.exp(-x));
  // Resolve ruler and permanent national contributions in one path. Zero-neutral effects add; unit-neutral effects multiply.
  // A nation's advance values grouped by effect, in acquisition order; rebuilt only when its list grows or is replaced.
  // A targeted effect (effects.json `targeted`) keeps the nation it is aimed at and applies only against it.
  const ADV_FX = new WeakMap();
  const emptyAdvanceFx = () => Object.fromEntries(Object.keys(EFFECTS).map(k => [k, []]));
  const NO_ADVANCES = emptyAdvanceFx();
  const advFx = c => {
    const list = c.advances; if (!list.length) return NO_ADVANCES;
    let m = ADV_FX.get(list);
    if (!m || m.len !== list.length) {
      m = { len: list.length, by: emptyAdvanceFx() };
      for (const a of list) for (const e of CONTENT.advances.cards[a.id].effects)
        m.by[e.fx].push({ v: e.values[a.grade], target: EFFECTS[e.fx].targeted ? a.target : null });
      ADV_FX.set(list, m);
    }
    return m.by;
  };
  const fx = (c, k, against = []) => {
    let value = c.ruler === null || c.ruler.ended ? EFFECTS[k].none : c.ruler.fx[k];
    const vs = advFx(c)[k];
    const mul = EFFECTS[k].none === 1, foes = EFFECTS[k].targeted && (Array.isArray(against) ? against : [typeof against === 'string' ? against : against.tag]);
    for (const { v, target } of vs) {
      if (foes && !foes.includes(target)) continue;
      value = mul ? value * v : value + v;
    }
    return value;
  };
  const hasFx = (c, k) => fx(c, k) !== EFFECTS[k].none;
  // a nation's ruler names, or else its people's (the check makes sure one of them has some)
  const namesOf = c => c.namePool === 'people' ? PEOPLES[c.culture].names : c.rulerNames;

  const S = { seed, player: opts.player || null, pending: null, rerolls: { heir: opts.player ? RULES.rerolls.heir : 0, advance: opts.player ? RULES.rerolls.advance : 0 }, t: 0, year: RULES.start, q: 0, regions: [], C: Object.create(null), wars: [], log: [], history: [], events: Object.fromEntries(Object.keys(EV).map(id => [id, false])), modifiers: [], over: false, forecastLeader: null, phase: 'season', inSeason: false, reignQueue: [],
    marks: [], warNames: {}, era: (e => ({ of: e, name: e.name, def: e.def, fort: e.fort, since: RULES.start }))(CONTENT.eras.find(e => e.start)), awake: Object.fromEntries(Object.keys(PEOPLES).map(id => [id, 0])), majors: [], greatWar: null, stats: { wars: 0, revolts: 0, battles: 0, rulers: 0, dead: 0 } };

  REGIONS.forEach((r, i) => S.regions.push({ i, id: r[0], name: r[1], owner: r[4], core: r[4], culture: r[5], pop: r[6],
    fac: r[7], fort: 0, build: null, unrest: RULES.setup.unrest, occ: null, battle: 0, flash: 0, integ: 1,
    coast: geo.regions[i].coast, nb: geo.regions[i].nb, startOwner: r[4] }));
  const RB = {}; S.regions.forEach(r => RB[r.id] = r);

  const freshLedger = opening => ({ opening, closing: opening, tax: 0, fac: 0, trade: 0, upkeep: 0,
    lostWork: 0, lostAdmin: 0, other: 0, spent: { build: 0, army: 0, reform: 0 } });
  function changeGold(c, amount, cause){
    c.treasury += amount;
    const l = c.ledger;
    if (['tax', 'fac', 'trade'].includes(cause)) l[cause] += amount;
    else if (cause === 'upkeep') l.upkeep -= amount;
    else if (['build', 'army', 'reform'].includes(cause)) l.spent[cause] -= amount;
    else l.other += amount;
    l.closing = c.treasury;
  }
  function scaleGold(c, factor, cause){ changeGold(c, c.treasury * (factor - 1), cause); }
  function transferGold(from, payees, amount, cause){
    if (!payees.length) return;
    changeGold(from, -amount, cause); payees.forEach(c => changeGold(c, amount / payees.length, cause));
  }
  function setUnrest(r, value){ r.unrest = clamp(value, 0, 100); }
  function changeUnrest(r, amount){ setUnrest(r, r.unrest + amount); }

  // ---------- rulers ----------
  const regnal = Object.create(null);   // how many rulers of each name a nation has had
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
    const b = c.lean;
    // patience and judgment lean the way his nation does; thrift is his own
    const pat = clamp(b.pat + rand(-0.35, 0.35), 0.05, 0.95), hawk = clamp(b.hawk + rand(-0.35, 0.35), 0.05, 0.95);
    const effects = traitEffects(trait, grade);
    return { name: `${nm} ${ROMAN[num] || num} the ${TRAITS[trait].label}`, given: `${nm} ${ROMAN[num] || num}`, k, trait, grade, effects, fx: { ...NEUTRAL_FX, ...Object.fromEntries(effects.map(e => [e.fx, e.value])) },
      pat, bias: (hawk - 0.5) * 0.9 + rand(-0.3, 0.3), thrift: rand(0.1, 0.9), swing: 0, since: S.year, ended: false, cause: '', until: reign() };
  }
  // what the ruler does, in words
  const traitDesc = r => r.effects.map(e => e.text).join('. ');
  // a ruler's name in the chronicle, in his rarity's colour
  const RN = r => `<b class="rn" style="color:${RARITY[r.grade].color}">${r.name}</b>`;
  function appointRuler(c, r){ c.ruler = r; }
  function crown(c, r, quiet){ regnal[r.k] = (regnal[r.k] || 0) + 1; r.since = S.year; appointRuler(c, r); coronation(c, r, quiet); return r; }
  // the one-time bonus of a ruler from Rare up, the moment he is crowned
  function coronation(c, r, quiet){
    const say1 = h => { if (!quiet) L('ruler', h); };
    const mine = regionsOf(c), shuffled = () => mine.map(x => [rng(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    const own = x => isAccepted(c, x.culture);
    const calm = (v, f) => mine.forEach(x => { if (f(x)) changeUnrest(x, -v); });
    const v = k => r.fx[k];
    if (v('army')) c.army += v('army');
    changeGold(c, v('gold'), 'coronation');
    if (v('factoryCapital') && mine.length) capitalOf(c).fac += v('factoryCapital');
    if (v('factoryRandom') && mine.length) pick(mine).fac += v('factoryRandom');
    if (v('fortify')) shuffled().slice(0, v('fortify')).forEach(x => x.fort = 1);
    if (v('calmAll')) calm(v('calmAll'), () => true);
    if (v('calmOwn')) calm(v('calmOwn'), own);
    if (v('calmOther')) calm(v('calmOther'), x => !own(x));
    for (let k = 0; k < v('reforms'); k++) reform(c);
    if (v('truce')) neighborsOf(c).forEach(o => { c.truce[o.tag] = S.year + v('truce'); o.truce[c.tag] = S.year + v('truce'); });
    if (v('rights')) { const ps = [...new Set(mine.map(x => x.culture))].map(p => [rng(), p]).sort((p, q) => p[0] - q[0]).map(x => x[1]).slice(0, v('rights'));
      ps.forEach(p => c.acc.add(p)); if (ps.length) say1(`${RN(r)} of ${N(c)} declares the ${ps.map(peopleName).join(' and ')} people equal subjects.`); }
    for (let k = 0; k < v('province'); k++) { const bs = borderRegions(c); if (!bs.length) break;
      const x = pick(bs), from = S.C[x.owner]; transfer(x, c, from, 'treaty');
      L('ruler', say(r.effects.find(e => e.fx === 'province').news, { ruler: RN(r), nation: N(c), province: Rn(x), from: N(from) })); }
  }
  // the player's heir card: three different traits, each drawn with the same odds as any heir in Europe
  function heirCard(c, opening, why = '', crisis = false){
    const slots = []; for (let k = 0; k < RULES.heirs; k++) slots.push(drawHeir(slots.map(s => s.trait)));
    const names = namesOf(c).map(n => [rng(), n]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    return { type: 'heir', tag: c.tag, opening, year: S.year, options: slots.map((s, i) => makeRuler(c, { ...s, nm: names[i % names.length] })), old: c.ruler.name, why, crisis };
  }
  // the player may deal a waiting card again, a few times a game for each kind of card; AI nations pick at random and never need to
  const redeal = { heir: p => heirCard(S.C[p.tag], p.opening, p.why, p.crisis), advance: p => ({ ...p, options: drawAdvances(S.C[p.tag]) }) };
  function reroll(){
    const p = S.pending; if (!p || !(S.rerolls[p.type] > 0)) return false;
    S.rerolls[p.type]--; S.pending = redeal[p.type](p); return true;
  }
  function chooseHeir(i){
    const p = S.pending; if (!p || p.type !== 'heir' || !Number.isInteger(i) || !p.options[i]) return false;
    const c = S.C[p.tag], nr = p.options[i]; S.pending = null;
    if (p.opening) { crown(c, nr, false); L('ruler', `${RN(nr)} takes the throne of ${N(c)}. ${traitDesc(nr)}.`); if (S.phase === 'season') offerAdvances(); return true; }
    successionLog(c, p.why, crown(c, nr, false), p.crisis); if (S.phase === 'season') offerAdvances(); return true;
  }
  // a civil war follows some successions: rival claimants split the army and unrest soars (by `crisis` if it is a number)
  function successionLog(c, why, nr, crisis){
    if (crisis) civilWar(c, nr, crisis, why + ' ');
    else L('ruler', `${why} ${RN(nr)} succeeds. ${traitDesc(nr)}.`);
  }
  function civilWar(c, nr, crisis, why = ''){
    c.crisis = { until: S.t + Math.floor(rand(RULES.reign.crisisYears[0] * 4, RULES.reign.crisisYears[1] * 4)), winner: nr.name };
    const u = typeof crisis === 'number' ? crisis : RULES.reign.crisisUnrest;
    regionsOf(c).forEach(r => changeUnrest(r, u)); mark(capitalOf(c).i, 'crisis');
    L('ruler', `<strong>Civil war in ${N(c)}.</strong> ${why}Rival claimants raise armies against ${RN(nr)}. The army is split and unrest soars.`);
  }
  // A reign ends: by death, defeat, revolution, a bullet or the army. The player picks the heir; everyone else gets one at random.
  function endReign(c, how, ctx = ''){
    if (how === 'extinction') { if (c.ruler) { c.ruler.ended = true; c.ruler.cause = how; } return; }
    if (S.inSeason) {
      if (!S.reignQueue.some(r => r.tag === c.tag)) S.reignQueue.push({ tag: c.tag, how, ctx });
      return;
    }
    const old = c.ruler; if (!old || !c.alive) return;
    if (c.player && S.pending) return;
    // what his reign leaves behind: a spent treasury, restless subject peoples
    changeGold(c, -Math.max(0, c.treasury) * fx(c, 'endGold'), 'reign');
    if (fx(c, 'endUnrestOther')) regionsOf(c).forEach(r => { if (!isAccepted(c, r.culture)) changeUnrest(r, fx(c, 'endUnrestOther')); });
    // Capture the outgoing effect before marking its reign ended; ended rulers supply neutral effects.
    const civilUnrest = fx(c, 'civilWar');
    old.ended = true; old.cause = how; S.stats.rulers++; c.reigns++;
    if (how === 'coup') {   // the army doesn't ask: no heir card
      const nr = crown(c, makeRuler(c), true); mark(capitalOf(c).i, 'coup');
      L('ruler', `Coup in ${N(c)}: ${RN(old)} is deposed by the army${ctx}; ${RN(nr)} takes power. ${traitDesc(nr)}.`);
      if (civilUnrest) civilWar(c, nr, civilUnrest);
      return;
    }
    const why = { death: `${RN(old)} of ${N(c)} dies.`,
      abdicate: `Beaten in the <em>${ctx}</em>, ${RN(old)} of ${N(c)} abdicates.`, revolution: `Revolution in ${ctx}! ${RN(old)} of ${N(c)} is overthrown.`,
      murder: `${RN(old)} of ${N(c)} is assassinated${S.year >= RULES.reign.anarchists ? ' by an anarchist' : ' by a conspirator'}.` }[how];
    const crisis = civilUnrest || (how !== 'revolution' && chance(RULES.reign.crisis));
    if (c.player) { S.pending = heirCard(c, false, why, crisis); return; }
    successionLog(c, why, crown(c, makeRuler(c), true), crisis);
  }
  // how far ahead he plans: by his patience, plus or minus what his trait adds, never below the minimum
  const horizon = c => Math.max(RULES.horizon.min, Math.round(RULES.horizon.min + c.ruler.pat * RULES.horizon.span + fx(c, 'horizon')));
  // Gold only matters for what it can buy: a country with a full treasury treats spending as cheap.
  // Thrift: how dear the ruler holds his gold, from a third (lavish) to three times (thrifty)
  const thriftOf = c => Math.pow(3, (c.ruler.thrift - 0.5) * 2);
  const goldValue = c => clamp((80 + c.army * 0.5) / Math.max(1, c.treasury), 0.1, 1) * thriftOf(c);
  // what he believes his chance of winning is: his judgment, a Bold or Drunk ruler's misreading, a Sharp ruler seeing through it
  const believe = (c, ratio) => { const pTrue = pWin(ratio);
    const p = clamp(pWin(ratio * Math.exp(c.ruler.bias)) + fx(c, 'bias') + c.ruler.swing, 0, 1);
    return pTrue + (p - pTrue) * (1 - fx(c, 'sharp')); };
  const newRuler = (c, quiet) => crown(c, makeRuler(c), quiet);

  function makeCountry(tag, d){
    const c = { tag, name: d.name, adj: d.adj, pre: d.pre, color: d.color, culture: d.culture, acc: new Set(d.acc),
      lean: { pat: clamp(0.25 + d.p[1] * 0.6, 0.1, 0.9), hawk: clamp(d.p[0], 0.1, 0.9) },
      army: d.army * rand(RULES.setup.army[0], RULES.setup.army[1]), treasury: 0, infamy: 0, allies: new Set(), rival: null, truce: {},
      guarantee: { by: null, until: -1 }, crisis: { until: -1, winner: '' }, restored: false, player: false, reigns: 0, ruler: null,
      alive: false, noAnnex: d.noAnnex, namePool: d.namePool, rulerNames: d.rulerNames, factoryMultiplier: d.factoryMultiplier, ambitionId: d.ambition, ambition: { id: DEFAULT_AMBITION, kind: AMBITIONS[DEFAULT_AMBITION].kind }, didThisSeason: [], born: S.year,
      advances: [], advanceYear: null, startRegions: 0, reformCd: 0, ledger: freshLedger(0), lastWar: 1830 };
    return c;
  }
  const tags = [];

  // ---------- relations ----------
  const REL = Object.create(null);
  const rk = (a, b) => a < b ? a + '\0' + b : b + '\0' + a;
  const rel = (a, b) => REL[rk(a, b)] || 0;
  const setRel = (a, b, v) => { REL[rk(a, b)] = clamp(v, -100, 100); };
  const addRel = (a, b, d) => setRel(a, b, rel(a, b) + d);
  S.rel = rel;
  const ally = (a, b) => { S.C[a].allies.add(b); S.C[b].allies.add(a); };

  // ---------- helpers ----------
  const alive = () => tags.filter(t => S.C[t].alive).map(t => S.C[t]);
  let OWN = null;
  const invalidate = () => { OWN = null; };
  const regionsOf = c => { if (!OWN) { OWN = Object.create(null); S.regions.forEach(r => (OWN[r.owner] || (OWN[r.owner] = [])).push(r)); } return OWN[c.tag] || []; };
  const popOf = c => regionsOf(c).reduce((s, r) => s + r.pop, 0);
  const facOf = c => regionsOf(c).reduce((s, r) => s + r.fac, 0);
  const facAvg = c => { const rs = regionsOf(c); const p = rs.reduce((s, r) => s + r.pop, 0) || 1; return rs.reduce((s, r) => s + r.fac * r.pop, 0) / p; };
  const unrestOf = c => { const rs = regionsOf(c); const p = rs.reduce((s, r) => s + r.pop, 0) || 1; return rs.reduce((s, r) => s + r.unrest * r.pop, 0) / p; };
  // how well the armies fight: industry, and a soldier or conqueror at their head
  const quality = (c, against = []) => (1 + RULES.battle.industry * facAvg(c)) * fx(c, 'fight') * fx(c, 'targetFight', against);
  const inCrisis = c => S.t < c.crisis.until;
  const strength = (c, against = []) => c.army * quality(c, against) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? RULES.reign.crisisArmy : 1);
  const warOf = c => S.wars.find(w => w.att.includes(c.tag) || w.def.includes(c.tag));
  const isAccepted = (c, cul) => c.culture === cul || c.acc.has(cul);
  const neighborsOf = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag) s.add(o); })); return [...s].map(t => S.C[t]); };
  const borderRegions = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { if (S.regions[j].owner !== c.tag) s.add(j); })); return [...s].map(j => S.regions[j]); };
  const isNeighbor = (a, b) => neighborsOf(a).includes(b);
  const landNeighbors = c => { const s2 = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag && !geoNaval(r.i, j)) s2.add(o); })); return s2.size; };
  // Big states are harder to run: every province beyond six trims the yield of all of them.
  const admin = n => clamp(1 - RULES.admin.cost * Math.max(0, n - RULES.admin.free), RULES.admin.floor, 1);
  const adminOf = c => admin(regionsOf(c).length);
  const workforce = (c, army = c.army) => clamp(1 - army / (Math.max(0.5, popOf(c)) * RULES.workers), RULES.workersMin, 1);
  // the share of its gold a province pays while it becomes integrated
  const paysWhile = integ => 0.1 + 0.9 * integ;
  // income of one province in a season, broken down
  function regionIncome(r, c = S.C[r.owner], opts = {}){
    if (r.occ && !opts.ignoreOcc) return { tax: 0, fac: 0, trade: 0 };
    const u = opts.unrest != null ? opts.unrest : r.unrest;
    const integ = opts.integ != null ? opts.integ : r.integ;
    const m = (1 - u / 200) * paysWhile(integ) * (opts.admin != null ? opts.admin : adminOf(c)) * fx(c, 'earns') * globalFx('earns');
    const taxed = fx(c, 'taxes') * (isAccepted(c, r.culture) ? fx(c, 'ownTaxes') : 1);
    const serf = c.factoryMultiplier;
    const wf = opts.wf != null ? opts.wf : workforce(c);
    const atWar = opts.war != null ? opts.war : !!warOf(c);
    return { tax: r.pop * 0.06 * m * wf * taxed, fac: r.pop * 0.7 * (1 - Math.pow(0.8, opts.fac != null ? opts.fac : r.fac)) * m * wf * serf, trade: r.coast && !atWar ? (r.pop * 0.04 + r.fac * 0.25) * m * fx(c, 'trade') : 0 };
  }
  const sumInc = x => x.tax + x.fac + x.trade;
  const income = c => regionsOf(c).reduce((s, r) => s + sumInc(regionIncome(r, c)), 0);
  const score = c => income(c) * 4;
  // what an army of `men` (thousands) costs c a season
  const upkeepOf = (c, men) => men * RULES.price.upkeep * fx(c, 'upkeep');
  const upkeep = c => upkeepOf(c, c.army);
  const power = c => regionsOf(c).reduce((s, r) => s + r.pop * (1 + 0.5 * r.fac), 0) + c.army * 0.5;
  const isMajor = c => S.majors.includes(c.tag);
  const maxBuilds = c => RULES.build.slots.base + Math.floor(regionsOf(c).length / RULES.build.slots.per);
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
  const surviveW = c => c.ambition.kind === 'survive' ? KINDS.survive.losses : 1;
  // years until a conquest is integrated, as his trait speeds or slows it
  const settleYears = (r, c) => (!isAccepted(c, r.culture) && r.core !== c.tag) ? 9 / fx(c, 'integrateOther') / fx(c, 'integrate') : 4 / fx(c, 'integrate');
  Object.assign(S, { paysWhile, adminOf, regionsOf, popOf, facOf, facAvg, unrestOf, power, income, score, upkeep, regionIncome, sumInc, strength, warOf, claim, RB, isAccepted, maxBuilds, workforce, horizon });

  const N = c => `<b class="cn" data-tag="${c.tag}" style="--c:${c.color}">${c.name}</b>`;
  const Rn = r => `<i data-p="${r.i}">${r.name}</i>`;
  const list = cs => cs.length <= 1 ? cs.map(N).join('') : cs.slice(0, -1).map(N).join(', ') + ' and ' + N(cs[cs.length - 1]);
  const rlist = rs => rs.length <= 1 ? rs.map(Rn).join('') : rs.slice(0, -1).map(Rn).join(', ') + ' and ' + Rn(rs[rs.length - 1]);
  const L = (t, h) => S.log.push({ y: S.year, q: S.q, t, h });
  const mark = (i, type) => S.marks.push({ i, type, t: S.t });
  const capitalOf = c => regionsOf(c).slice().sort((a, b) => b.pop * (1 + b.fac) - a.pop * (1 + a.fac))[0];
  const g = v => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v))}`;

  // the living nation with the most gold a year, as things stand now (the interface shows this one)
  const leaderNow = () => alive().reduce((b, c) => !b || score(c) > score(b) ? c : b, null).tag;
  // the same, fixed once a season so every forecast of the season sees the same leader
  function computeLeader(){ S.forecastLeader = leaderNow(); }
  S.leaderNow = leaderNow;
  function computeMajors(){ S.majors = alive().sort((a, b) => power(b) - power(a)).slice(0, RULES.majors.count).map(c => c.tag); }

  function pickRival(c){ // the neighbour that most threatens c's income
    let best = null, bs = 0;
    neighborsOf(c).forEach(o => { if (!o.alive || c.allies.has(o.tag)) return;
      const s = threatOf(o, c).p * 100 + Math.max(0, -rel(c.tag, o.tag)) * 0.3; if (s > bs) { bs = s; best = o.tag; } });
    c.rival = bs > 4 ? best : null;
  }

  // ---------- military forecasting ----------
  // Targeted modifiers see possible opposing participants, never an ally already busy in another war.
  const forecastFoes = (c, own, extra = null) => [c.tag, ...c.allies, ...(extra ? [extra.tag] : [])]
    .filter(t => t === c.tag || (S.C[t].alive && !warOf(S.C[t]) && !own.allies.has(t)));
  const sideStr = (ts, against) => ts.reduce((s, t) => s + strength(S.C[t], against), 0);
  function mySide(c, extraArmy = 0, extraAlly = null, against = []){
    let s = (c.army + extraArmy) * quality(c, against) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? RULES.reign.crisisArmy : 1);
    c.allies.forEach(t => { if (!warOf(S.C[t])) s += strength(S.C[t], against) * 0.65; });
    if (extraAlly) s += strength(extraAlly, against) * 0.65;
    return s;
  }
  function theirSide(o, exclude){
    const against = forecastFoes(S.C[exclude], o);
    let s = strength(o, against);
    o.allies.forEach(t => { if (t !== exclude && !warOf(S.C[t])) s += strength(S.C[t], against) * 0.8; });
    return s;
  }
  const pWin = ratio => sig(3.2 * Math.log(Math.max(0.05, ratio)));
  // yearly chance that o attacks c, and what c would lose
  function threatOf(o, c, extraArmy = 0, extraAlly = null){
    const ratio = theirSide(o, c.tag) / Math.max(1, mySide(c, extraArmy, extraAlly, forecastFoes(o, c)) * 1.15);
    const hostility = clamp((20 - rel(o.tag, c.tag)) / 60, 0.1, 1.6) * 0.82 * (1 + o.infamy / 40);
    const p = 0.2 * sig(4 * (ratio - 1.2)) * hostility;
    return { p, ratio };
  }
  // How much c expects to lose over its horizon: for each neighbour, run that neighbour's own war forecast against c.
  function riskOf(c, extraArmy = 0, extraAlly = null){
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
    return { total, top };
  }
  // a's forecast of attacking d for province r (gold over a's horizon)
  // Great powers that would step in to stop a from growing at d's expense, with the chance each joins.
  function interveners(a, d){
    const leader = S.forecastLeader === a.tag;
    return S.majors.map(t => S.C[t]).filter(m => m.alive && m !== a && m !== d && !a.allies.has(m.tag) && !d.allies.has(m.tag) && !warOf(m)
      && (leader || isNeighbor(m, a) || isNeighbor(m, d)) && (leader || rel(m.tag, a.tag) < 10 || m.rival === a.tag))
      .map(m => ({ m, q: Math.min(0.9, 0.25 + 0.35 * clamp(power(a) / Math.max(1, power(m)) - 0.4, 0, 1) + (regionsOf(d).length === 1 ? 0.2 : 0) + (leader ? 0.3 : 0)) }));
  }
  function geoNaval(i, j){ return NAVAL.has(i + '-' + j); }
  function warEval(a, d, r, dExtra = 0, dAlly = null){
    if (a.allies.has(d.tag) || (a.truce[d.tag] || 0) > S.year) return null;
    const foesOfD = forecastFoes(a, d);   // who d's side would face, for targeted modifiers
    let their = theirSide(d, a.tag) + dExtra * quality(d, foesOfD);
    if (warOf(d)) their *= 0.5;   // its armies are busy elsewhere
    interveners(a, d).forEach(({ m, q }) => { their += strength(m, foesOfD) * q * 0.45; });
    // Sea crossings grant access to a front; combat gives them no separate strength penalty.
    if (r.core === d.tag) their *= fx(d, 'homeFight');   // a Vengeful defender fights harder for his own land
    if (dAlly && !d.allies.has(dAlly.tag)) their += strength(dAlly, foesOfD) * 0.8;
    const ratio = mySide(a, 0, null, forecastFoes(d, a, dAlly)) * (r.core === a.tag ? fx(a, 'homeFight') : 1) / Math.max(1, their * S.era.def);
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
    const base = `${a.pre}-${d.adj} War`;
    const n = (S.warNames[base] || 0) + 1; S.warNames[base] = n;
    return `${['', 'Second ', 'Third ', 'Fourth ', 'Fifth '][n - 1] ?? n + 'th '}${base}`;
  }
  function declareWar(a, d, goal, opts = {}){
    opts = { great: false, name: '', text: '', sides: [], ...opts };
    const w = { id: S.stats.wars, name: opts.name || warName(a, d), att: opts.sides.length ? [...opts.sides[0]] : [a.tag], def: opts.sides.length ? [...opts.sides[1]] : [d.tag], goal: goal.id, score: 0, quarters: 0,
      battles: 0, start: S.year, great: !!opts.great };
    if (!opts.sides.length) {
    [...d.allies].forEach(t => { const o = S.C[t]; const sure = d.guarantee.by === t && S.year < d.guarantee.until; if (o.alive && !warOf(o) && t !== a.tag && !a.allies.has(t) && (sure || chance(RULES.allies.defend))) w.def.push(t); });
    [...a.allies].forEach(t => { const o = S.C[t]; if (o.alive && !warOf(o) && !w.def.includes(t) && rel(a.tag, t) > 25 && chance(RULES.allies.attack)) w.att.push(t); });
    }
    S.wars.push(w); S.stats.wars++; a.lastWar = S.year;
    const cl = claim(a, goal);
    a.infamy += (cl >= 2.5 ? 3 : 9) + (regionsOf(d).length === 1 ? 8 : 0);
    if (!opts.great) interveners(a, d).forEach(({ m, q }) => { if (!w.def.includes(m.tag) && !w.att.includes(m.tag) && chance(q)) w.def.push(m.tag); });
    w.att.forEach(t => w.def.forEach(u => addRel(t, u, -30)));
    let txt = opts.text;
    if (!txt) {
      const why = cl === 3 ? `to win back ${Rn(goal)}` : cl && isAccepted(a, goal.culture) ? `for ${Rn(goal)}, whose ${peopleName(goal.culture)}-speaking people would integrate quickly`
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
    if (!c.alive || regionsOf(c).length) return;
    endReign(c, 'extinction'); c.alive = false;
    S.reignQueue = S.reignQueue.filter(r => r.tag !== c.tag);
    if (S.pending && S.pending.tag === c.tag) S.pending = null;
    L('war', `${N(c)} has ceased to exist.`);
    tags.forEach(t => S.C[t].allies.delete(c.tag)); c.allies.clear();
    S.wars.forEach(w => { w.att = w.att.filter(x => x !== c.tag); w.def = w.def.filter(x => x !== c.tag); });
    S.wars.slice().filter(w => !w.att.length || !w.def.length).forEach(w => closeWar(w, 0));
    S.regions.forEach(r => { if (r.occ === c.tag) r.occ = null; });
  }
  function setProvinceOwner(r, tag){ r.owner = tag; r.occ = null; r.build = null; invalidate(); }
  function transfer(r, to, from, how = 'war'){
    const kin = isAccepted(to, r.culture) || r.core === to.tag;
    setProvinceOwner(r, to.tag);
    if (how === 'war') { if (r.fac > 0) r.fac--; r.integ = kin ? RULES.conquest.kin.integrated : RULES.conquest.other.integrated; setUnrest(r, Math.max(r.unrest, kin ? RULES.conquest.kin.unrest : RULES.conquest.other.unrest)); }
    else if (how === 'independence') { r.core = to.tag; r.integ = 1; r.flash = 3; setUnrest(r, RULES.uprising.free.unrest); }
    else if (how === 'treaty') r.integ = Math.min(r.integ, RULES.conquest.treaty);
    if (from && from !== to) killIfEmpty(from);
  }
  const controlledBy = (r, side) => (side.includes(r.owner) && !r.occ) || side.includes(r.occ);
  // the members of a side that border land they could take from the foe or free from him
  function atFront(side, foe){
    const targets = S.regions.filter(r => (foe.includes(r.owner) && !r.occ) || (side.includes(r.owner) && foe.includes(r.occ)));
    return side.filter(t => targets.some(r => r.nb.some(j => controlledBy(S.regions[j], [t]))));
  }
  // Report an engagement, even if an assault is repulsed; no reachable front means no battle.
  function frontMove(win, lose, w, isAtt){
    const lib = S.regions.filter(r => win.includes(r.owner) && r.occ && lose.includes(r.occ) && r.nb.some(j => controlledBy(S.regions[j], win)));
    if (lib.length) { const r = pick(lib); r.occ = null; r.battle = 2; return true; }
    const cands = S.regions.filter(r => lose.includes(r.owner) && !r.occ && r.nb.some(j => controlledBy(S.regions[j], win)));
    if (!cands.length) return false;
    const goal = RB[w.goal];
    const r = isAtt && cands.includes(goal) ? goal : cands.sort((a, b) => b.pop - a.pop)[Math.floor(rng() * Math.min(3, cands.length))];
    r.battle = 2; S.stats.battles++;
    r.pop *= 1 - RULES.battle.dead; S.stats.dead = S.stats.dead + r.pop * RULES.battle.dead;
    if (r.fac > 0 && chance(RULES.battle.ruin)) { r.fac--; mark(r.i, 'ruin'); }
    if (r.fort && chance(S.era.fort)) return true;
    // a Cautious ruler stops some advances into his land
    if (chance(fx(S.C[r.owner], 'hold'))) return true;
    if (r.fort) { r.fort = 0; mark(r.i, 'ruin'); L('war', `The fortress of ${Rn(r)} falls and is razed.`); }
    // credit the ally whose land (or occupied land) actually borders it
    const counts = {};
    r.nb.forEach(j => { const x = S.regions[j]; const holder = x.occ && win.includes(x.occ) ? x.occ : (win.includes(x.owner) && !x.occ ? x.owner : null); if (holder) counts[holder] = (counts[holder] || 0) + 1; });
    r.occ = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (a === win[0] ? -1 : 1))[0] || win[0];
    changeUnrest(r, RULES.battle.occupied);
    return true;
  }
  function warScore(w){
    const pops = side => S.regions.filter(r => side.includes(r.owner)).reduce((s, r) => s + r.pop, 0) || 1;
    const occBy = (side, other) => S.regions.filter(r => other.includes(r.owner) && side.includes(r.occ)).reduce((s, r) => s + r.pop, 0);
    let s = 110 * (occBy(w.att, w.def) / pops(w.def) - occBy(w.def, w.att) / pops(w.att)) + w.battles * 2.5;
    if (w.att.includes(RB[w.goal].occ)) s += 22;
    return clamp(s, -100, 100);
  }
  const reachable = (r, t) => r.nb.some(j => S.regions[j].owner === t);
  function closeWar(w, truceYears){
    const all = w.att.concat(w.def);
    S.regions.forEach(r => { if (r.occ && all.includes(r.occ) && all.includes(r.owner)) r.occ = null; });
    if (truceYears) all.forEach(t => all.forEach(u => { if (t !== u) S.C[t].truce[u] = S.year + truceYears; }));
    S.wars = S.wars.filter(x => x !== w);
  }
  function endWar(w, outcome, whiteText){
    const A = S.C[w.att[0]], D = S.C[w.def[0]];
    const goal = RB[w.goal];
    const all = w.att.concat(w.def);
    const occupied = S.regions.filter(r => r.occ && all.includes(r.occ) && all.includes(r.owner));
    const [winners, losers] = outcome === 'att' ? [w.att, w.def] : [w.def, w.att];
    const taken = [];
    const give = (r, to) => { const from = S.C[r.owner]; if (!from.alive || !reachable(r, to)) return false; transfer(r, S.C[to], from); taken.push([r, to, from.tag]); return true; };
    if (outcome === 'lines') {   // the armistice: every occupier keeps what it holds
      const kept = {};
      occupied.forEach(r => { if (S.C[r.occ].alive && S.C[r.owner].alive) (kept[r.occ] = kept[r.occ] || []).push(r); });
      // the treaty first, then what it does (a nation may cease to exist)
      L('peace', `The <em>${w.name}</em> ends on the lines as they stand${Object.keys(kept).length ? ': ' + Object.entries(kept).map(([t, rs]) => `${N(S.C[t])} keeps ${rlist(rs)}`).join('; ') : ', and no land changes hands'}.`);
      Object.entries(kept).forEach(([t, rs]) => rs.forEach(r => { const from = S.C[r.owner]; if (from.alive && S.C[t].alive) transfer(r, S.C[t], from); }));
    } else if (outcome !== 'white') {
      const lead = S.C[winners[0]], loser = S.C[losers[0]];
      // the war goal goes to the attacker if it won and can reach it
      if (outcome === 'att' && w.def.includes(goal.owner)) { const holder = goal.occ && w.att.includes(goal.occ) ? goal.occ : A.tag; give(goal, reachable(goal, holder) ? holder : A.tag); }
      // occupied land the occupier can reach and has a reason to keep
      const most = w.great ? RULES.war.greatExtra : RULES.war.extra;
      let extra = 0;
      occupied.filter(r => r.owner && losers.includes(r.owner) && winners.includes(r.occ) && r !== goal)
        .sort((x, y) => (claim(S.C[y.occ], y) - claim(S.C[x.occ], x)) || y.pop - x.pop)
        .forEach(r => { if (extra >= most) return; const occ = r.occ; if ((claim(S.C[occ], r) > 0 || w.score >= RULES.war.crushing || w.score <= -RULES.war.crushing || w.great) && give(r, occ)) extra++; });
      // reparations: a third of the loser's treasury, shared by winners who gained no land (or by all)
      const rep = Math.max(0, loser.treasury * RULES.war.reparations);
      const gainers = new Set(taken.map(x => x[1]));
      const payees = winners.filter(t => S.C[t].alive && !gainers.has(t));
      transferGold(loser, (payees.length ? payees : winners.filter(t => S.C[t].alive)).map(t => S.C[t]), rep, 'reparations');
      taken.forEach(([r, to]) => { S.C[to].infamy += claim(S.C[to], r) >= 2.5 ? 2 : 6; });
      const byTo = {}; taken.forEach(([r, to]) => (byTo[to] = byTo[to] || []).push(r));
      const landTxt = taken.length ? '. ' + Object.entries(byTo).map(([to, rs]) => `${N(S.C[to])} gains ${rlist(rs)}`).join('; ') : '';
      L('peace', outcome === 'att'
        ? `The <em>${w.name}</em> ends in victory for ${N(lead)}${landTxt}${rep > 5 ? `${taken.length ? ', and' : ';'} ${N(loser)} pays ${Math.round(rep)} gold` : ''}.`
        : `${N(lead)} holds out: the <em>${w.name}</em> ends in defeat for ${N(loser)}${landTxt}${rep > 5 ? `, who pays ${Math.round(rep)} gold` : ''}.`);
    } else L('peace', whiteText || `Exhausted after ${Math.round(w.quarters / 4 * 10) / 10} years, the sides of the <em>${w.name}</em> agree to a white peace.`);
    closeWar(w, RULES.war.truce);
    if (outcome === 'white' || outcome === 'lines') return;
    // a ruler who led his nation into defeat may have to go (not at the armistice: the age is over)
    const beaten = S.C[losers[0]];
    if (beaten && beaten.alive && !(S.year === RULES.end.year && S.q === RULES.end.season) && (taken.some(x => x[2] === beaten.tag) || beaten.tag === w.att[0]) && chance(RULES.reign.abdicate))
      endReign(beaten, 'abdicate', w.name);
  }
  function tickWars(){
    S.wars.slice().forEach(w => {
      w.att = w.att.filter(t => S.C[t].alive); w.def = w.def.filter(t => S.C[t].alive);
      if (!w.att.length || !w.def.length) { closeWar(w, 0); return; }
      w.quarters++;
      // a Vengeful leader's side fights harder for his own land
      const goal = RB[w.goal], home = t => goal.core === t ? fx(S.C[t], 'homeFight') : 1;
      // only the armies that can reach the front fight, and only they bleed
      const fA = atFront(w.att, w.def), fD = atFront(w.def, w.att);
      if (fA.length || fD.length) {
        const sA = sideStr(fA, fD) * home(w.att[0]) * rand(0.7, 1.3), sD = sideStr(fD, fA) * home(w.def[0]) * S.era.def * rand(0.7, 1.3);
        const aWin = sA > sD, ratio = aWin ? sA / sD : sD / sA;
        const [win, lose] = aWin ? [w.att, w.def] : [w.def, w.att];
        let engaged = frontMove(win, lose, w, aWin);
        // a crushing advantage breaks through twice; a Bold leader needs less of one, a Cautious one more
        if (engaged && ratio > RULES.breakthrough * fx(S.C[win[0]], 'breakthrough')) frontMove(win, lose, w, aWin);
        if (engaged) {
          w.battles = clamp(w.battles + (aWin ? 1 : -1), -14, 14);
          const bleed = t => fx(S.C[t], 'bleed');
          (aWin ? fA : fD).forEach(t => { S.C[t].army *= 1 - rand(RULES.battle.losses.win[0], RULES.battle.losses.win[1]) * bleed(t); });
          (aWin ? fD : fA).forEach(t => { S.C[t].army *= 1 - rand(RULES.battle.losses.lose[0], RULES.battle.losses.lose[1]) * bleed(t); });
        }
      }
      w.score = warScore(w);
      const WR = RULES.war, thr = w.great ? WR.greatWin : WR.win, maxQ = w.great ? WR.greatSeasons : WR.seasons;
      const allTaken = S.regions.filter(r => r.owner === w.def[0]).every(r => w.att.includes(r.occ));
      if (w.quarters < WR.minSeasons && !allTaken) return;
      if (w.score >= thr || allTaken) endWar(w, 'att');
      else if (w.score <= -thr) endWar(w, 'def');
      else if (w.quarters >= maxQ) endWar(w, w.score > WR.timeoutLead ? 'att' : w.score < -WR.timeoutLead ? 'def' : 'white');
      else if (w.quarters >= WR.stalemate.after && Math.abs(w.score) < WR.stalemate.below && chance(WR.stalemate.chance)) endWar(w, 'white');
    });
  }

  // ---------- AI: forecast every option in gold over the ruler's horizon ----------
  function considerations(c){
    const out = [], risks = new Map();
    const risk = (nation, army = 0, ally = null) => {
      const key = JSON.stringify([nation.tag, army, ally && ally.tag]);
      if (!risks.has(key)) risks.set(key, riskOf(nation, army, ally));
      return risks.get(key);
    };
    const T = c.treasury, war = warOf(c), H = horizon(c);
    const mine = regionsOf(c);
    const building = mine.filter(r => r.build).length;
    const baseRisk = risk(c);
    const gv = goldValue(c);
    const add = o => { o.ev = Math.round(o.ev); out.push(o); };
    add({ type: 'save', ev: 0, label: 'Saving gold', why: 'Nothing else is expected to pay off' });

    // factory: pays back over the horizon
    const leaderFac = Math.max(0.5, ...alive().map(facAvg));
    const catchup = (1 - RULES.price.copy) + RULES.price.copy * Math.min(1, facAvg(c) / leaderFac);
    const maxFac = RULES.build.maxFactories;
    if (building < maxBuilds(c)) {
      mine.filter(r => r.fac < maxFac && !r.build && !r.occ).forEach(r => {
        const cost = RULES.price.factory * Math.pow(RULES.price.factoryGrowth, r.fac) * catchup * fx(c, 'factoryCost') * globalFx('factoryCost');
        if (cost > T) return;
        const gain = (sumInc(regionIncome(r, c, { fac: r.fac + 1, war: false, ignoreOcc: true })) - sumInc(regionIncome(r, c, { war: false, ignoreOcc: true }))) * 4;
        const ev = gain * (H - 1) - cost * gv;
        add({ type: 'factory', r, cost, ev, label: `Building a factory in ${r.name}`,
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
      const r1 = risk(c, delta).total + gwLoss(delta) - gwLoss(0);
      const incLoss = (inc0 / Math.max(0.01, wf0)) * (wf0 - workforce(c, c.army + delta)) * 0.85; // tax and factory part
      const upk = upkeepOf(c, delta) * 4;
      return (baseRisk.total - r1) - (incLoss + upk * gv) * H - (delta > 0 ? delta * RULES.price.recruit * fx(c, 'recruit') * gv : 0);
    };
    const step = Math.max(5, c.army * 0.15, popOf(c) * 0.5);
    let bestA = null;
    [step, step * 2.5].forEach(st => { if (T < st * RULES.price.recruit * fx(c, 'recruit') + 5) return;
      const ev = armyEV(st) + (war ? 30 + st : 0);
      if (!bestA || ev > bestA.ev) bestA = { type: 'army', amt: st, ev, label: `Growing the army by ${Math.round(st)}k`,
        why: war ? 'At war: the army needs every man' : gwW > 0.3 && !baseRisk.top ? 'Preparing for the general war everyone expects' : baseRisk.top ? `Cuts expected losses to ${baseRisk.top.name} by ${Math.round(baseRisk.total - risk(c, st).total)}; costs ${(upkeepOf(c, st) * 4).toFixed(1)} a year in upkeep plus lost workers` : 'Little danger nearby' }; });
    if (bestA) add(bestA);
    if (!war && c.army - step >= popOf(c) * 0.8) {
      const ev = armyEV(-step);
      add({ type: 'demob', amt: step, ev, label: `Shrinking the army by ${Math.round(step)}k`, why: `Workers back in factories and fields; expected losses rise by ${Math.round(risk(c, -step).total - baseRisk.total)}` });
    }

    // fortress facing the most dangerous neighbour
    const fc = RULES.price.fort * fx(c, 'fortCost');
    if (baseRisk.top && building < maxBuilds(c) && T >= fc) {
      const o = baseRisk.top, t = threatOf(o, c);
      const fs = mine.filter(r => !r.fort && !r.build && !r.occ && r.nb.some(j => S.regions[j].owner === o.tag)).sort((a, b) => provYearly(b, c) - provYearly(a, c))[0];
      if (fs) add({ type: 'fort', r: fs, cost: fc, ev: Math.min(1.5, t.p * H) * pWin(t.ratio) * 0.45 * (provYearly(fs, c) * H * 0.6 + 25) - fc * gv,
        label: `Fortifying ${fs.name}`, why: `Guards the richest border with ${o.name}` });
    }

    // reform: income recovered from unrest, plus revolts avoided
    if (T >= RULES.reform.cost * fx(c, 'reformCost') && c.reformCd <= S.t) {
      let gain = 0;
      mine.forEach(r => { const now = sumInc(regionIncome(r, c)), calm = sumInc(regionIncome(r, c, { unrest: Math.max(0, r.unrest - RULES.reform.calm * fx(c, 'reformCalm')) }));
        gain += (calm - now) * 4 * 1.6; if (r.unrest > 55) gain += 0.35 * provYearly(r, c) * Math.min(H, 12); });
      if (gain > 1) add({ type: 'reform', ev: gain - RULES.reform.cost * fx(c, 'reformCost') * gv, label: 'Passing reforms to calm unrest', why: `Average unrest ${Math.round(unrestOf(c))}; recovers lost taxes and heads off uprisings` });
    }

    // diplomacy: alliances cut expected losses; courting makes them possible
    const allyPool = new Set(); neighborsOf(c).forEach(o => allyPool.add(o)); if (baseRisk.top) neighborsOf(baseRisk.top).forEach(o => allyPool.add(o)); S.majors.forEach(t => allyPool.add(S.C[t]));
    if (!war) [...allyPool].forEach(o => {
      if (!o.alive || o === c || c.allies.has(o.tag) || warOf(o) || c.allies.size >= RULES.allies.max || o.allies.size >= RULES.allies.max) return;
      const mine2 = baseRisk.total - risk(c, 0, o).total;
      const theirs = risk(o).total - risk(o, 0, c).total;
      const drag = risk(o).total * 0.12;
      const ev = mine2 - drag;
      if (ev < 3) return;
      const r = rel(c.tag, o.tag);
      const guard = baseRisk.top ? baseRisk.top.name : 'trouble';
      if (r >= 30 && theirs - risk(c).total * 0.12 <= 0) return;
      if (r >= 30) add({ type: 'ally', o, ev, guard: baseRisk.top, theirs: theirs - risk(c).total * 0.12, label: `Allying with ${o.name}`, why: `Cuts expected losses to ${guard} by ${Math.round(mine2)}` });
      else add({ type: 'court', o, ev: ev * 0.25, label: `Courting ${o.name}`, why: `A future ally against ${guard} (relations ${Math.round(r)})` });
    });
    // peaceful union of a fellow-national minor
    const union = unionOf(c);
    if (union && !war) neighborsOf(c).forEach(o => {
      if (isMajor(o) || o.noAnnex || warOf(o) || !union.peoples.includes(o.culture)) return;
      const val = regionsOf(o).reduce((s, r) => s + provYearly(r, c) * ambitionW(c, r), 0) * (H - 1.5);
      const r = rel(c.tag, o.tag);
      const ok = r >= RULES.unite.relations && power(c) > RULES.unite.power * power(o) && ![...o.allies].some(t => t !== c.tag && isMajor(S.C[t]));
      if (ok) add({ type: 'annex', o, ev: val, label: `Uniting with ${o.name} by treaty`, why: `Toward ${theTitle(union)}; adds ${Math.round(val / (H - 1.5))} a year with no war` });
      else if (r < 75) add({ type: 'court', o, ev: val * 0.08, label: `Courting ${o.name}`, why: `Toward ${theTitle(union)} (relations ${Math.round(r)} of ${RULES.unite.relations} needed)` });
    });

    // war: chance of winning x what the province pays once settled, minus the price of fighting and of losing
    if (!war && T > -10 && unrestOf(c) < RULES.war.maxUnrest) {
      let best = null;
      borderRegions(c).forEach(r => {
        const o = S.C[r.owner];
        if (!o.alive) return;
        const e = warEval(c, o, r); if (!e || e.p < 0.55) return;
        if (!best || e.ev > best.ev) best = { type: 'war', o, r, p: e.p, pTrue: e.pTrue, ev: e.ev, label: `Invading ${o.name} for ${r.name}`,
          why: `${Math.abs(e.p - e.pTrue) > 0.07 ? `believes ${Math.round(e.p * 100)}% to win (truly ${Math.round(e.pTrue * 100)}%)` : `${Math.round(e.p * 100)}% to win`}${warOf(o) ? ` while ${o.name} is busy fighting` : ''}${inUnion(c, r) ? `; toward ${theTitle(unionOf(c))}` : ''}; ${r.name} pays ${e.yearly.toFixed(0)} a year once integrated${o.treasury > 100 ? `, plus a share of ${o.name}'s ${Math.round(o.treasury)} gold` : ''}; war costs ~${Math.round(e.cost)}` };
      });
      if (best) add(best);
    }
    out.sort((a, b) => b.ev - a.ev);
    return out;
  }

  function act(c, a){
    const spend = (k, v) => changeGold(c, -v, k);
    switch (a.type) {
      case 'factory': spend('build', a.cost); a.r.build = { type: 'factory', left: RULES.build.factory }; return;
      case 'fort': spend('build', a.cost); a.r.build = { type: 'fort', left: RULES.build.fort }; return;
      case 'army': spend('army', a.amt * RULES.price.recruit * fx(c, 'recruit')); c.army += a.amt; return;
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
    const done = [];
    for (let k = 0; k < RULES.actions && c.alive; k++) {
      const cands = considerations(c);
      const choice = cands[0];
      if (!choice || choice.type === 'save' || choice.ev <= 0) break;
      done.push({ type: choice.type, label: choice.label, r: choice.r ? choice.r.i : null });
      act(c, choice);
      if (choice.type === 'war' || choice.type === 'annex' || choice.type === 'ally') break;
    }
    c.didThisSeason = done;
  }

  // ---------- construction, settling, unrest, revolts ----------
  function tickProvinces(){
    S.regions.forEach(r => {
      if (r.battle > 0) r.battle--;
      if (r.flash > 0) r.flash--;
      if (r.integ < 1 && !r.occ) { const o = S.C[r.owner]; r.integ = Math.min(1, r.integ + ((isAccepted(o, r.culture) || r.core === o.tag) ? RULES.integrate.kin : RULES.integrate.other * fx(o, 'integrateOther')) * fx(o, 'integrate'));
        if (r.integ >= 1) L('econ', `${Rn(r)} is now fully integrated into ${N(o)}.`); }
      if (!r.build || r.occ) return;
      if (--r.build.left > 0) return;
      const o = S.C[r.owner];
      if (r.build.type === 'factory') { r.fac++; if (r.fac >= 3) L('econ', `A new factory opens in ${Rn(r)} (${N(o)}); it now has ${r.fac}.`); }
      else { r.fort = 1; L('econ', `${N(o)} completes a fortress in ${Rn(r)}.`); }
      r.build = null;
    });
  }
  function nationalism(){ return RULES.unrest.nationalism.start + (S.year - RULES.start) / RULES.unrest.nationalism.years; }
  function tickUnrest(){
    S.regions.forEach(r => {
      const o = S.C[r.owner];
      const foreign = !isAccepted(o, r.culture);
      const UT = RULES.unrest.target, WK = RULES.unrest.workers;
      const target = UT.base + (foreign ? UT.foreign + UT.nationalism * nationalism() + S.awake[r.culture] : 0) + (inCrisis(o) ? UT.crisis : 0) + Math.min(WK.max, r.fac * WK.perFactory) * clamp((S.year - WK.from) / WK.years, 0, 1) + (warOf(o) ? UT.war : 0) + (r.occ ? UT.occupied : 0) + (o.treasury < 0 ? RULES.debt.unrest : 0) + UT.unsettled * (1 - r.integ) + fx(o, 'unrest') + (foreign ? fx(o, 'unrestOther') : fx(o, 'unrestOwn'));
      changeUnrest(r, (target - r.unrest) * RULES.unrest.pull + rand(-2, 2.5));
    });
  }
  function revolts(){
    S.regions.forEach(r => {
      if (r.unrest < RULES.unrest.uprising || r.occ) return;
      if (!chance(0.025 * (r.unrest - RULES.unrest.uprising) / (100 - RULES.unrest.uprising))) return;
      const o = S.C[r.owner];
      S.stats.revolts++; r.flash = 3; mark(r.i, 'revolt');
      const rebels = r.pop * 2.2 * rand(0.5, 1.6) * (1 + (S.year - RULES.start) / 80) * (1 + S.awake[r.culture] / 10);
      const garrison = o.army * quality(o) * (warOf(o) ? 0.6 : 2.2) / Math.max(1, regionsOf(o).length) * (inCrisis(o) ? RULES.reign.crisisArmy : 1) * rand(0.6, 1.3) * (r.fort ? 1.6 : 1) * fx(o, 'garrison');
      const UP = RULES.uprising;
      if (rebels < garrison) { setUnrest(r, UP.crushed.unrest); o.army *= UP.crushed.army; L('revolt', `Riots in ${Rn(r)} are put down by the ${o.adj} army.`); return; }
      if (isAccepted(o, r.culture)) {
        scaleGold(o, UP.revolution.gold, 'revolution'); regionsOf(o).forEach(x => setUnrest(x, Math.max(UP.revolution.floor, x.unrest - UP.revolution.calm))); o.army *= UP.revolution.army;
        endReign(o, 'revolution', Rn(r)); return; }
      const kin = r.nb.map(j => S.C[S.regions[j].owner]).find(k => k.alive && k.culture === r.culture && k !== o && !warOf(k));
      const spread = () => regionsOf(o).forEach(x => { if (!isAccepted(o, x.culture) && x.core !== o.tag) changeUnrest(x, UP.spread); });
      if (kin) { L('revolt', `${Rn(r)} rises against ${N(o)} and declares for ${N(kin)}.`); transfer(r, kin, o, 'treaty'); r.core = kin.tag; setUnrest(r, UP.joins.unrest); spread(); return; }
      // who the rebels fight for: the province's own fallen nation if it was of their people, else the nation their people rises as
      const home = NATIONS[r.core] && NATIONS[r.core].culture === r.culture && !S.C[r.core].alive ? r.core : null;
      const tag = home || risesAs(r.culture);
      if (!tag || (S.C[tag] && S.C[tag].alive)) {
        setUnrest(r, UP.alone.unrest); o.army *= UP.alone.army; changeGold(o, -Math.max(0, o.treasury) * (1 - UP.alone.gold), 'uprising');
        L('revolt', `Rebels seize ${Rn(r)} but find no allies; ${N(o)} retakes it at a heavy cost in gold and men.`); return; }
      const restored = !!S.C[tag];
      const group = [r].concat(r.nb.map(j => S.regions[j]).filter(x => x.owner === o.tag && x.culture === r.culture && !x.occ && (!home || x.core === home)));
      const [nc] = birthNations([{ tag, provinces: group, from: o }]);
      spread();
      const guard = nc.guarantee.by === null ? null : S.C[nc.guarantee.by];
      L('revolt', `Independence! ${rlist(group)} break${group.length > 1 ? '' : 's'} away from ${N(o)} and ${restored ? 'restore' : 'form'}${group.length > 1 ? '' : 's'} ${N(nc)}${nc.ruler.ended ? '' : ` under ${RN(nc.ruler)}`}.${guard ? ` ${N(guard)} guarantees its independence.` : ''}`);
      o.army *= UP.free.army;
    });
  }

  function birthNations(specs){
    const born = specs.map(spec => {
      const { tag, provinces, from } = spec, previous = S.C[tag], starting = from === null;
      const d = { ...NATIONS[tag], army: starting ? NATIONS[tag].army : provinces[0].pop * RULES.newNation.armyPerMillion };
      const c = makeCountry(tag, d);
      const openingGold = RULES.setup.gold[0] + rand(0, RULES.setup.gold[1] - RULES.setup.gold[0]);
      c.alive = true; c.restored = !!previous; c.player = previous ? previous.player : tag === opts.player;
      if (previous) { c.advances = previous.advances; c.advanceYear = previous.advanceYear; c.factoryMultiplier = previous.factoryMultiplier; }
      changeGold(c, starting ? openingGold : RULES.newNation.gold, 'birth');
      S.C[tag] = c; if (!tags.includes(tag)) tags.push(tag);
      return { ...spec, c, starting };
    });
    born.forEach(({ c, provinces, from, starting }) => {
      provinces.forEach(r => transfer(r, c, from, starting ? 'initial' : 'independence'));
      c.startRegions = starting ? provinces.length : 0;
    });
    if (born.every(x => x.starting)) {
      tags.forEach(a => tags.forEach(b => { if (a < b) setRel(a, b, rand(-10, 15)); }));
      tags.forEach(a => Object.entries(NATIONS[a].relations).forEach(([b, v]) => setRel(a, b, v)));
      tags.forEach(a => NATIONS[a].allies.forEach(b => ally(a, b)));
      computeMajors();
    }
    born.forEach(({ c, from, starting }) => {
      if (!c.alive) return;
      if (!starting) {
        tags.forEach(t => t !== c.tag && setRel(c.tag, t, t === from.tag ? RULES.newNation.hostility : rand(-5, 20)));
        c.truce[from.tag] = S.year + RULES.newNation.truce; from.truce[c.tag] = S.year + RULES.newNation.truce;
        const guard = S.majors.map(t => S.C[t]).filter(m => m.alive && m !== from && !warOf(m) && m.allies.size < RULES.allies.max &&
          (rel(m.tag, from.tag) < 0 || m.rival === from.tag)).sort((a, b) => strength(b) - strength(a))[0];
        if (guard) { ally(guard.tag, c.tag); setRel(guard.tag, c.tag, 70); c.guarantee = { by: guard.tag, until: S.year + RULES.newNation.guarantee }; }
      }
      setAmbition(c);
    });
    // All ambitions exist before the first grant can end another nation in this batch.
    born.forEach(({ c, starting }) => {
      if (!c.alive) return;
      // the player's stand-in never reigns: his effects are neutral until the player crowns a real ruler from the card
      if (c.player) { appointRuler(c, { ...makeRuler(c), ended: true, cause: 'standIn' }); if (!starting) S.pending = heirCard(c, true); }
      else newRuler(c, starting);
    });
    return born.map(x => x.c);
  }

  // ---------- ambitions (content/ambitions.json): what each nation must achieve by the armistice ----------
  // Every nation names its ambition in its own entry, and several can share one. The great powers race to be the richest;
  // the nations of a divided people race to unite it, and the first to proclaim it wins while the rest have lost.
  const KINDS = CONTENT.ambitionKinds;
  const AMBITIONS = Object.fromEntries(Object.entries(CONTENT.ambitions).map(([id, a]) => [id, Object.assign({ id, done: null }, a, { title: say(a.title), pset: new Set(a.provinces) })]));
  const UNIONS = Object.values(AMBITIONS).filter(a => a.kind === 'unite');
  // the union a nation is still working toward, if any
  const unionOf = c => { const a = AMBITIONS[c.ambition.id]; return a && a.kind === 'unite' && !a.done ? a : null; };
  const inUnion = (c, r) => { const u = unionOf(c); return !!u && u.pset.has(r.id); };
  // the union whose provinces a nation claims: the one it works toward, or has proclaimed; when a rival proclaims it, the claims go with it
  const claimedUnion = c => { const a = AMBITIONS[c.ambition.id]; return a && a.kind === 'unite' && (!a.done || a.done === c.tag) ? a : null; };
  const inClaimedUnion = (c, r) => { const u = claimedUnion(c); return !!u && u.pset.has(r.id); };
  const theTitle = u => `${u.art}${u.title}`;
  S.UNIONS = UNIONS; S.unionOf = unionOf; S.claimedUnion = claimedUnion; S.theTitle = theTitle;
  S.unionProgress = () => UNIONS.map(d => {
    const lead = alive().filter(c => d.done ? c.tag === d.done : unionOf(c) === d).map(c => ({ c, n: regionsOf(c).filter(r => d.pset.has(r.id)).length })).sort((a, b) => b.n - a.n)[0];
    return { id: d.id, title: d.title, need: d.need, done: d.done && S.C[d.done].alive ? S.C[d.done] : null, lead: lead ? lead.c : null, n: lead ? lead.n : 0, peoples: d.peoples.map(peopleName).join(', ') };
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
        regionsOf(c).forEach(r => { changeUnrest(r, -RULES.unite.calm); if (d.peoples.includes(r.culture)) r.integ = 1; });
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
    const a = AMBITIONS[c.ambitionId];
    const gone = (a.kind === 'unite' && a.done) || (a.kind === 'richest' && (c.restored || c.born !== RULES.start));
    c.ambition = gone ? { id: DEFAULT_AMBITION, kind: AMBITIONS[DEFAULT_AMBITION].kind } : { id: a.id, kind: a.kind };
  }
  // how the ambition stands: 'open', 'met' (so far, or for good at the armistice) or 'lost'
  function ambitionOf(c){
    const definition = AMBITIONS[c.ambition.id];
    const a = { ...c.ambition, title: definition.title, the: definition.art, n: 0, need: definition.need,
      rank: 0, of: 0, by: null, proclaimed: false };
    // a nation that is gone has lost, but its ambition still names its union
    if (!c.alive) return { ...a, state: 'lost' };
    if (a.kind === 'survive') return { ...a, state: S.over ? 'met' : 'open' };
    if (a.kind === 'richest') { const rich = alive().filter(o => o.ambition.kind === 'richest').sort((x, y) => score(y) - score(x));
      return { ...a, rank: rich.indexOf(c) + 1, of: rich.length, state: rich[0] === c ? (S.over ? 'met' : 'open') : S.over ? 'lost' : 'open' }; }
    const d = AMBITIONS[a.id], n = regionsOf(c).filter(r => d.pset.has(r.id)).length, base = { ...a, title: d.title, the: d.art, n, need: d.need };
    if (d.done && d.done !== c.tag) return { ...base, state: 'lost', by: d.done };
    if (d.done) return { ...base, state: n >= d.need ? 'met' : S.over ? 'lost' : 'open', proclaimed: true };
    return { ...base, state: S.over ? 'lost' : 'open' };
  }
  S.ambitionOf = ambitionOf;

  // ---------- events: a schedule, selector and operation; IDs never choose behavior ----------
  // the modifiers in force; expired ones leave at the season boundary (tickModifiers)
  const globalFx = key => { let v = 1; for (const m of S.modifiers) if (m.fx === key) v *= m.value; return v; };
  function tickModifiers(){ S.modifiers = S.modifiers.filter(m => S.t < m.until); }
  function eventTargets(t){
    let cs = [], rs = [], people = '', pair = null;
    if (t.kind === 'world') { cs = alive(); rs = S.regions; }
    if (t.kind === 'province') {
      const pool = (t.provinces.length ? t.provinces.map(id => RB[id]) : S.regions).filter(r => !t.unoccupied || !r.occ);
      if (!pool.length) return null;
      rs = t.mode === 'random' ? [pick(pool)] : pool;
      cs = t.nations.length ? t.nations.map(tag => S.C[tag]).filter(c => c && c.alive) : [...new Set(rs.map(r => S.C[r.owner]))];
    }
    if (t.kind === 'nation') {
      const pool = t.nations.length ? t.nations.map(tag => S.C[tag]).filter(c => c && c.alive) : alive();
      if (!pool.length) return null;
      cs = t.mode === 'random' ? [pick(pool)] : t.mode === 'sample' ? pool.sort(() => rng() - 0.5).slice(0, t.count) : pool;
      rs = t.provinces.length ? t.provinces.map(id => RB[id]) : cs.flatMap(regionsOf);
    }
    if (t.kind === 'people') {
      people = t.mode === 'random' ? pick(t.peoples) : t.peoples[0];
      rs = S.regions.filter(r => r.culture === people);
    }
    if (t.kind === 'pair') {
      if (t.mode === 'rivals') {
        const pool = alive().filter(c => c.rival && S.C[c.rival].alive &&
          (!t.peace || (!warOf(c) && !warOf(S.C[c.rival]))) && (!t.neighbors || isNeighbor(c, S.C[c.rival])));
        if (!pool.length) return null;
        const c = pick(pool); pair = [c, S.C[c.rival]];
      } else if (t.mode === 'hostile') {
        const majors = S.majors.map(tag => S.C[tag]).filter(c => c.alive); let best = Infinity;
        majors.forEach(a => majors.forEach(b => { if (a.tag < b.tag && !a.allies.has(b.tag)) {
          const v = rel(a.tag, b.tag) - (a.rival === b.tag || b.rival === a.tag ? 40 : 0);
          if (v < best) { best = v; pair = [a, b]; }
        } }));
      } else { const pool = alive().sort(() => rng() - 0.5).slice(0, 2); if (pool.length === 2) pair = pool; }
      if (!pair || (t.nonrival && pair[0].rival === pair[1].tag)) return null;
      cs = pair; rs = cs.flatMap(regionsOf);
    }
    if (t.owned && (!cs.length || rs.some(r => r.owner !== cs[0].tag)) && t.kind === 'province') return null;
    if (t.unrestAbove >= 0 && !rs.some(r => r.unrest > t.unrestAbove)) return null;
    if (t.unawakened && S.awake[people]) return null;
    if (t.foreign && !rs.some(r => !isAccepted(S.C[r.owner], r.culture))) return null;
    return { cs, rs: t.owned ? rs.filter(r => cs.some(c => c.tag === r.owner)) : rs, people, pair };
  }
  function eventWords(e, x){
    return { ...e, count: alive().length, people: x.people, province: x.rs.length ? Rn(x.rs[0]) : '',
      nation: x.cs.length ? N(x.cs[0]) : '', nations: list(x.cs), a: x.cs.length ? N(x.cs[0]) : '', b: x.cs.length > 1 ? N(x.cs[1]) : '' };
  }
  function applyEvent(e, x){
    const f = e.effects;
    x.cs.forEach(c => {
      scaleGold(c, f.gold, 'event');
      if (f.people) c.acc.add(f.people);
      if (f.newName) c.name = f.newName;
      if (f.newAdj) c.adj = f.newAdj;
      if (f.emancipate) c.factoryMultiplier = 1;
    });
    x.rs.forEach(r => { r.pop *= f.pop; r.fac += f.factories; setUnrest(r, f.unrestSet < 0 ? r.unrest + f.unrest : f.unrestSet); });
    if (x.pair) addRel(x.pair[0].tag, x.pair[1].tag, f.relations);
    f.modifiers.forEach(m => S.modifiers.push({ ...m, name: e.name, until: S.t + m.seasons }));
    const words = eventWords(e, x);
    if (e.finds.length) words.find = pick(e.finds);
    if (e.mark) x.rs.forEach(r => mark(r.i, e.mark));
    L(e.log, say(e.text, words));
  }
  function issueUltimatum(e, x){
    const [c, o] = x.pair, k = e.crisis;
    let best = null;
    borderRegions(c).filter(r => r.owner === o.tag).forEach(r => { const v = warEval(c, o, r); if (v && (!best || v.ev > best.ev)) best = { ...v, r }; });
    if (!best || best.ev + k.margin < 0) {
      if (chance(k.rattle)) L(e.log, say(e.rattleText, { ...e, a: N(c), b: N(o), pretext: pick(k.pretexts) }));
      return;
    }
    const fears = believe(o, theirSide(o, c.tag) * S.era.def / Math.max(1, mySide(c, 0, null, forecastFoes(o, c)))) < k.backDown;
    if (fears) {
      const pay = Math.max(0, o.treasury * k.pay); transferGold(o, [c], pay, 'ultimatum');
      regionsOf(o).forEach(r => changeUnrest(r, k.unrest)); addRel(c.tag, o.tag, k.relations);
      L(e.log, say(e.text, { ...e, a: N(c), b: N(o), gold: Math.round(pay) }));
    } else {
      const name = warName(c, o);
      declareWar(c, o, best.r, { p: best.p, pTrue: best.pTrue, name, text: say(e.warText, { ...e, a: N(c), b: N(o), province: Rn(best.r), war: name }) });
    }
  }
  const EVENT_ACTIONS = {
    apply: applyEvent,
    awaken(e, x){ S.awake[x.people] = e.effects.awake; L(e.log, say(e.text, eventWords(e, x))); },
    era(e, x){
      const next = pick(CONTENT.eras.filter(a => !a.start && a !== S.era.of));
      S.era = { of: next, name: next.name, def: next.def, fort: next.fort, since: S.year };
      L(e.log, say(e.text, { ...e, era: next.name }));
    },
    ultimatum: issueUltimatum,
    war(e, x){ startGeneralWar(x.pair, e); },
    settle(e){
      if (S.greatWar && S.wars.includes(S.greatWar)) L('peace', say(e.text, e));
      S.wars.slice().forEach(w => endWar(w, 'lines'));
    },
    message(e, x){ L(e.log, say(e.text, eventWords(e, x))); },
  };
  function runEvents(phase){
    for (const [id, e] of Object.entries(EV)) {
      const d = e.schedule;
      if (e.phase !== phase || (d.once && S.events[id]) || S.year < d.from || S.year > d.to ||
          (d.season >= 0 && S.q !== d.season) || S.year - S.era.since < d.eraAge) continue;
      let targets = d.beforeRoll ? eventTargets(e.target) : null;
      if (d.beforeRoll && !targets) continue;
      if (d.period && !chance(d.chance / d.period)) continue;
      if (!d.beforeRoll) targets = eventTargets(e.target);
      if (!targets) continue;
      EVENT_ACTIONS[e.operation](e, targets); S.events[id] = true;
    }
  }
  function coups(){
    alive().forEach(c => { if (unrestOf(c) > RULES.reign.coupUnrest && chance(RULES.reign.coup)) endReign(c, 'coup'); });
  }

  // during the season a ruler can be murdered; a reign whose years have run out ends at the closing boundary,
  // so anything that ended it sooner (a revolution, a lost war, a coup) is what the chronicle records
  function successions(){
    alive().forEach(c => { if (S.t < c.ruler.until && chance(RULES.reign.murder / 4)) endReign(c, 'murder'); });
  }
  // what changes during a reign: a Drunk's judgment swings anew every season
  function tickRulers(){
    alive().forEach(c => { if (c.ruler && hasFx(c, 'swing')) c.ruler.swing = rand(-fx(c, 'swing'), fx(c, 'swing')); });
  }
  // reforms: unrest falls everywhere, and can only be passed again after a wait
  function reform(c){
    c.reformCd = S.t + RULES.reform.wait;
    regionsOf(c).forEach(r => changeUnrest(r, -RULES.reform.calm * fx(c, 'reformCalm')));
  }

  function startGeneralWar(pair, e){
    let [a, d] = pair; if (power(a) < power(d)) [a, d] = [d, a];
    S.wars.slice().forEach(w => { L('peace', `The <em>${w.name}</em> is abandoned as a greater storm gathers.`); closeWar(w, 0); });
    const sideA = new Set([a.tag]), sideD = new Set([d.tag]);
    let changed = true;
    while (changed) { changed = false;
      alive().forEach(c => { if (sideA.has(c.tag) || sideD.has(c.tag)) return;
        const la = [...c.allies].some(t => sideA.has(t)), ld = [...c.allies].some(t => sideD.has(t));
        if (la && !ld) { sideA.add(c.tag); changed = true; } else if (ld && !la) { sideD.add(c.tag); changed = true; } }); }
    const goal = borderRegions(a).find(r => r.owner === d.tag) || regionsOf(d)[0];
    const w = declareWar(a, d, goal, { great: true, sides: [[...sideA], [...sideD]], name: e.name, text: say(e.text, { ...e, a: N(a), b: N(d) }) });
    S.greatWar = w;
  }

  // ---------- one season ----------
  // ---------- scheduled permanent national advances ----------
  function drawAdvances(c){
    const neighbours = neighborsOf(c).filter(o => o.alive);
    const targets = neighbours.filter(o => !c.allies.has(o.tag)).sort((a, b) =>
      Number(b.tag === c.rival) - Number(a.tag === c.rival) || strength(b) - strength(a));
    const eligible = Object.entries(CONTENT.advances.cards).filter(([id, a]) => !c.advances.some(owned => owned.id === id)
      && (a.requires !== 'coast' || regionsOf(c).some(r => r.coast))
      && (a.requires !== 'border' || neighbours.length)
      && (a.requires !== 'target' || targets.length));
    const options = [];
    for (const category of Object.keys(CONTENT.advances.categories)) {
      const pool = eligible.filter(([id, a]) => a.category === category && !options.some(o => o.id === id));
      if (pool.length) options.push({ id: pick(pool)[0] });
    }
    while (options.length < Object.keys(CONTENT.advances.categories).length) {
      const pool = eligible.filter(([id]) => !options.some(o => o.id === id));
      if (!pool.length) break;
      options.push({ id: pick(pool)[0] });
    }
    return options.map(a => {
      let x = rng(), grade = 0;
      while (grade < RARITY.length - 1 && x >= RARITY[grade].odds) { x -= RARITY[grade].odds; grade++; }
      return { ...a, grade, target: CONTENT.advances.cards[a.id].requires === 'target' ? targets[0].tag : null };
    });
  }
  function acquireAdvance(c, a){
    c.advances.push(a);
    const d = CONTENT.advances.cards[a.id];
    L('event', say(CONTENT.advances.acquisitionText, { nation: N(c), advance: `<span style="color:${RARITY[a.grade].color}">${d.name}</span>` }));
  }
  function offerAdvances(){
    if (S.over || S.q !== CONTENT.advances.season || !CONTENT.advances.years.includes(S.year)) return;
    for (const c of alive()) {
      if (c.advanceYear === S.year || (c.player && S.pending)) continue;
      const options = drawAdvances(c); c.advanceYear = S.year;
      if (!options.length) continue;
      if (c.player) S.pending = { type: 'advance', tag: c.tag, year: S.year, options };
      else acquireAdvance(c, pick(options));
    }
  }
  function chooseAdvance(i){
    const p = S.pending;
    if (!p || p.type !== 'advance' || !Number.isInteger(i) || !p.options[i]) return false;
    const c = S.C[p.tag];
    if (!c.alive || c.advances.some(a => a.id === p.options[i].id)) return false;
    acquireAdvance(c, p.options[i]); S.pending = null; return true;
  }
  function nextAdvanceYear(){
    const c = S.player && S.C[S.player];
    if (S.over || (c && !c.alive)) return null;
    return CONTENT.advances.years.find(y => y > S.year || (y === S.year && S.phase === 'season' && S.q <= CONTENT.advances.season && (c && (c.advanceYear !== y || S.pending?.type === 'advance')))) ?? null;
  }

  function collectIncome(){
    alive().forEach(c => {
      c.ledger = freshLedger(c.treasury);
      let tax = 0, fac = 0, trade = 0; regionsOf(c).forEach(r => { const x = regionIncome(r, c); tax += x.tax; fac += x.fac; trade += x.trade; });
      c.ledger.lostWork = (tax + fac) / Math.max(0.01, workforce(c)) * (1 - workforce(c));
      c.ledger.lostAdmin = (tax + fac + trade) / adminOf(c) * (1 - adminOf(c));
      changeGold(c, tax, 'tax'); changeGold(c, fac, 'fac'); changeGold(c, trade, 'trade'); changeGold(c, -upkeep(c), 'upkeep');
    });
  }
  function tickPopulation(){ S.regions.forEach(r => r.pop *= 1 + RULES.growth.base + r.fac * RULES.growth.perFactory); }
  function tickArmies(){ alive().forEach(c => { if (c.treasury < RULES.debt.below) c.army *= RULES.debt.army; c.army = Math.max(1, c.army); }); }
  function tickCrises(){ alive().forEach(c => {
    if (S.t === c.crisis.until && c.ruler.name === c.crisis.winner) L('ruler', `${RN(c.ruler)} wins the civil war in ${N(c)}.`);
  }); }
  function tickDiplomacy(){
    const cs = alive(); cs.forEach(c => c.infamy = Math.max(0, c.infamy - 0.3));
    cs.forEach(c => cs.forEach(o => { if (c.tag >= o.tag) return;
      let r = rel(c.tag, o.tag) * 0.987;
      if (c.rival === o.tag || o.rival === c.tag) r -= 0.8;
      if (c.allies.has(o.tag)) r += 0.5;
      if (o.infamy > 15 && isNeighbor(c, o)) r -= o.infamy / 40;
      if (c.infamy > 15 && isNeighbor(c, o)) r -= c.infamy / 40;
      setRel(c.tag, o.tag, r); }));
    const guarded = (c, t) => (c.guarantee.by === t && S.year < c.guarantee.until) || (S.C[t].guarantee.by === c.tag && S.year < S.C[t].guarantee.until);
    cs.forEach(c => [...c.allies].forEach(t => { if (rel(c.tag, t) < 0 && chance(RULES.allies.lapse) && !warOf(c) && !guarded(c, t)) { c.allies.delete(t); S.C[t].allies.delete(c.tag); L('diplo', `The alliance between ${N(c)} and ${N(S.C[t])} lapses.`); } }));
    if (S.q === 0) { if (S.year % RULES.majors.every === 0) computeMajors(); alive().forEach(pickRival); }
    computeLeader();
  }
  function resolveReigns(){
    const queue = S.reignQueue; S.reignQueue = [];
    if (S.year === RULES.end.year && S.q === RULES.end.season) return;
    queue.forEach(r => { const c = S.C[r.tag]; if (c.alive) endReign(c, r.how, r.ctx); });
    alive().forEach(c => { if (!c.ruler.ended && S.t >= c.ruler.until) endReign(c, 'death'); });
  }
  function recordHistory(){ if (S.q === 3) S.history.push({ y: S.year, p: Object.fromEntries(alive().map(c => [c.tag, score(c)])) }); }
  function step(){
    if (S.over || S.pending) return;
    if (S.phase === 'season') {
      S.inSeason = true;
      collectIncome(); tickPopulation(); tickArmies(); tickCrises(); tickDiplomacy();
      runEvents('events');
      coups();
      successions();
      tickRulers();
      runEvents('war');
      tickProvinces();
      alive().sort(() => rng() - 0.5).forEach(c => { if (c.alive) decide(c); });
      tickWars();
      tickUnrest();
      revolts();
      unification();
      S.inSeason = false; S.phase = 'closing'; resolveReigns();
      if (S.pending) return;
    }
    if (S.year === RULES.end.year && S.q === RULES.end.season) {   // the armistice: every world ends here
      runEvents('closing');
      S.over = true; recordHistory();
      const rich = alive().filter(c => c.ambition.kind === 'richest').sort((a, b) => score(b) - score(a))[0];
      const united = alive().filter(c => c.ambition.kind === 'unite' && ambitionOf(c).state === 'met');
      const survivors = alive().filter(c => c.ambition.kind === 'survive');
      L('event', `<strong>The age ends.</strong> ${rich ? `${N(rich)} is the richest great power. ` : ''}${united.length ? `${list(united)} still ${united.length > 1 ? 'hold their peoples' : 'holds its people'} together. ` : 'No united people outlives the war. '}${survivors.length ? `${list(survivors)} survive${survivors.length > 1 ? '' : 's'}.` : ''}`);
      return;
    }
    recordHistory(); S.phase = 'season';
    S.t++; S.year = RULES.start + Math.floor(S.t / 4); S.q = S.t % 4;
    tickModifiers();
    offerAdvances();
  }

  birthNations(Object.keys(COUNTRIES).map(tag => ({ tag, provinces: S.regions.filter(r => r.owner === tag), from: null })));
  computeLeader();
  alive().forEach(pickRival);
  S.history.push({ y: RULES.start - 1, p: Object.fromEntries(alive().map(c => [c.tag, score(c)])) });
  runEvents('opening');
  // a human player rules one country: same rules, but they choose its heirs (starting with the ruler of 1836)
  if (opts.player && S.C[opts.player].alive) { const pc = S.C[opts.player];
    // vary the draw by country, so two countries in the same world are not offered the same three characters
    for (let i = [...pc.tag].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 13; i > 0; i--) rng();
    S.pending = heirCard(pc, true); }
  offerAdvances();
  Object.assign(S, { chooseAdvance, nextAdvanceYear, chooseHeir, reroll, step, alive, considerations, SEASONS, riskOf, thriftOf, inCrisis, TRAITS, traitDesc, capitalOf, landNeighbors });
  return S;
}

if (typeof module !== 'undefined') module.exports = { createSim, REGIONS, MAP_W, MAP_H, SEASONS };
