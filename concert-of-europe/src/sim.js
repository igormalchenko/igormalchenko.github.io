// ===================== SIMULATION CORE v3 =====================
// Every nation pursues one goal: the highest yearly income when the Great War ends.
// Each season it forecasts, in gold over its ruler's planning horizon, what every option is worth, and takes the best.

const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];
const NAMES = {
  English: ['William', 'Victoria', 'Edward', 'George', 'Albert', 'Mary'], Scottish: ['James', 'Robert'],
  French: ['Louis', 'Charles', 'Napoléon', 'Henri', 'Philippe'], German: ['Friedrich', 'Wilhelm', 'Ludwig', 'Otto', 'Maximilian', 'Karl', 'Franz', 'Joseph'],
  Russian: ['Nicholas', 'Alexander', 'Paul', 'Peter', 'Michael'], Turkish: ['Mahmud', 'Abdülmecid', 'Abdülaziz', 'Murad', 'Abdülhamid', 'Mehmed'],
  Spanish: ['Isabella', 'Alfonso', 'Ferdinand', 'Amadeo'], Portuguese: ['Maria', 'Pedro', 'Luís', 'Carlos', 'Manuel'],
  Dutch: ['Willem', 'Wilhelmina', 'Emma'], Belgian: ['Leopold', 'Albert'], Danish: ['Frederik', 'Christian'], Swedish: ['Karl', 'Oscar', 'Gustaf'],
  Italian: ['Carlo Alberto', 'Vittorio Emanuele', 'Umberto', 'Ferdinando', 'Francesco', 'Leopoldo'],
  Greek: ['Otto', 'George', 'Constantine'], Serb: ['Miloš', 'Mihailo', 'Milan', 'Aleksandar', 'Petar'],
  Polish: ['Jan', 'Stanisław', 'Józef'], Hungarian: ['Lajos', 'István', 'Ferenc'], Romanian: ['Alexandru', 'Carol', 'Ferdinand'],
  Bulgarian: ['Alexander', 'Ferdinand', 'Boris'], Irish: ['Daniel', 'Charles'], Norwegian: ['Haakon', 'Olav'], Finnish: ['Kaarlo', 'Pehr'],
  Czech: ['František', 'Tomáš'], Croat: ['Josip', 'Ante'], Lithuanian: ['Antanas', 'Jonas'], Ukrainian: ['Mykhailo', 'Taras'],
  Albanian: ['Skanderbeg', 'Ismail'], Bosniak: ['Husein', 'Ali'], Baltic: ['Kārlis', 'Konstantin'],
};
// Every ruler is one of these. `vibe` is his character in a line, `desc` what he does in the game.
// {friend}, {culture}, {mood} and {landmark} are filled in per ruler (traitDesc).
//   tier    1 common (white) … 5 legendary (gold): how rare he is, and how much he can change the game
//   card    false: never offered on a heir card (comes only from events or growing up)
//   temper  fixes his patience and nerve
const TRAITS = {
  warmonger: { tier: 2, label: 'Warmonger', epi: 'the Warlike', vibe: 'Wants to bathe in the blood of his enemies.', desc: 'Values conquered land 50% more and shrugs off neighbours\' distrust' },
  builder: { tier: 2, label: 'Builder', epi: 'the Builder', vibe: 'Talks of nothing but coal, iron and railways.', desc: 'Factories cost 30% less' },
  paranoid: { tier: 1, label: 'Paranoid', epi: 'the Suspicious', vibe: 'Sleeps with a pistol and trusts no neighbour.', desc: 'Sees every threat as nearly twice as large' },
  revanchist: { tier: 2, label: 'Revanchist', epi: 'the Avenger', vibe: 'Has sworn to take back every acre ever lost.', desc: 'Values winning back lost provinces double' },
  spendthrift: { tier: 1, label: 'Spendthrift', epi: 'the Magnificent', vibe: 'Wants wine, opera and a new palace every spring.', desc: 'Wastes 15% of all gold on the court' },
  reformer: { tier: 2, label: 'Reformer', epi: 'the Liberal', vibe: 'Reads the liberal papers, and agrees with them.', desc: 'Reforms cost half and calm more unrest' },
  soldier: { tier: 3, label: 'Soldier King', epi: 'the Soldier', vibe: 'Happiest on a horse at the head of a column.', desc: 'His armies fight 25% harder but lose half again as many men' },
  cautious: { tier: 1, label: 'Cautious', epi: 'the Careful', vibe: 'Never risks a man he cannot spare.', desc: 'Loses ground less often in war, and gains it less often' },
  arbiter: { tier: 2, label: 'Arbiter', epi: 'the Peacemaker', vibe: 'Loves a conference more than a battle.', desc: 'Values alliances double and is paid to broker peace between his neighbours' },
  shrewd: { tier: 3, label: 'Shrewd', epi: 'the Shrewd', vibe: 'Reads every dispatch twice.', desc: 'Sees his odds in war exactly as they are' },
  admirer: { tier: 2, label: 'Admirer', epi: 'the Courtier', vibe: 'Dresses, dines and thinks like a foreign court.', desc: 'Close friend of {friend}, and joins every war it fights' },
  tolerant: { tier: 3, label: 'Tolerant', epi: 'the Just', vibe: 'Sees no difference between his peoples.', desc: 'Accepts the {culture} people as his own, for good: their provinces calm down' },
  chauvinist: { tier: 2, label: 'Chauvinist', epi: 'the Proud', vibe: 'Thinks only his own people are fit to rule.', desc: 'Provinces of his own people pay 10% more; stops accepting the {culture}, for good' },
  miser: { tier: 1, label: 'Miser', epi: 'the Thrifty', vibe: 'Counts the candles in the palace.', desc: 'Values gold three times over: the hoard grows, little gets built' },
  dynast: { tier: 3, label: 'Dynast', epi: 'the Wise', vibe: 'Rules for his great-grandchildren.', desc: 'Plans 40 years ahead and borrows to build factories', temper: { pat: 0.95, risk: 0.25 } },
  bold: { tier: 2, label: 'Bold', epi: 'the Bold', vibe: 'A gambler at cards, in love and in war.', desc: 'Plans only 8 years ahead and fears no loss', temper: { pat: 0.02, risk: 0.92 } },
  drunk: { tier: 1, label: 'Drunkard', epi: 'the Drunkard', vibe: 'Never seen before noon.', desc: 'Misjudges his odds in war, differently every season' },
  mad: { tier: 1, label: 'Mad', epi: 'the Mad', vibe: 'Talks to the portraits in the gallery.', desc: 'Takes on a new quirk every few years{mood}' },
  lecher: { tier: 1, label: 'Lecher', epi: 'the Charming', vibe: 'Has a mistress in every palace in Europe.', desc: 'Charms every neighbour, but his bastards fight for the throne when he dies' },
  child: { tier: 1, label: 'Child King', epi: 'the Young', vibe: 'Six years old, and already bored.', desc: 'A regent with a random quirk rules until he comes of age; then anything can happen{mood}' },
  incompetent: { tier: 1, label: 'Incompetent', epi: 'the Unready', vibe: 'Cannot tell a map from a menu.', desc: 'The whole nation earns 12% less', card: false },
  usurper: { tier: 1, label: 'Usurper', epi: 'the Usurper', vibe: 'Seized the throne with the army behind him.', desc: 'Unrest everywhere until he wins a war', card: false },
  // epic: a big upside paid for with a big downside
  conqueror: { tier: 4, label: 'Conqueror', epi: 'the Conqueror', vibe: 'Means to redraw the map of Europe.', desc: 'His armies fight 40% harder; every neighbour distrusts him, and his death brings civil war' },
  genius: { tier: 4, label: 'Genius', epi: 'the Great', vibe: 'Speaks nine languages and designs his own engines.', desc: 'Factories cost half and go up twice as fast; he leaves no heir, so a council rules after him' },
  architect: { tier: 4, label: 'Great Builder', epi: 'the Architect', vibe: 'Dreams in marble and iron.', desc: 'Raises {landmark}; leaves no gold behind when he dies' },
  liberator: { tier: 4, label: 'Liberator', epi: 'the Liberator', vibe: 'Would free every serf and every people.', desc: 'Accepts every people of the realm, for good; the nobles plot a coup' },
  saint: { tier: 4, label: 'Saint', epi: 'the Saint', vibe: 'Prays for his enemies, and means it.', desc: 'No unrest while he lives, but he starts no wars and helps no ally' },
  iron: { tier: 4, label: 'Iron King', epi: 'the Iron', vibe: 'Has never pardoned anyone.', desc: 'Crushes uprisings and integrates conquests twice as fast; when he dies, his subject peoples rise' },
  navigator: { tier: 4, label: 'Navigator', epi: 'the Navigator', vibe: 'Happier on a quarterdeck than a throne.', desc: 'Sea trade pays half again and invading across the sea is easy, but the fleet doubles army upkeep' },
  // legendary: can swallow Europe while he lives; when he dies, his empire pays for it
  chancellor: { tier: 5, label: 'Iron Chancellor', epi: 'the Unifier', vibe: 'Decides the great questions of the day by blood and iron.', desc: 'Raises a great army that fights twice as hard, one enemy at a time, and keeps all the land he wins. When he dies, his conquests rise', temper: { pat: 0.8, risk: 0.75 } },
  destiny: { tier: 5, label: 'Man of Destiny', epi: 'the Lion', vibe: 'Has never lost a battle he chose to fight.', desc: 'Raises a great army that fights three times as hard and keeps all the land it wins. When he dies, his conquests rise', temper: { pat: 0.6, risk: 0.9 } },
  prophet: { tier: 5, label: 'Prophet', epi: 'the Prophet', vibe: 'Thousands follow him wherever he rides.', desc: 'Raises a great army that fights two and a half times as hard, and every people he conquers becomes his own at once. When he dies, they are foreigners again', temper: { pat: 0.7, risk: 0.8 } },
  sun: { tier: 5, label: 'Sun King', epi: 'the Radiant', vibe: 'The age will be named after him.', desc: 'The whole nation earns 60% more while he lives. When he dies, the bill comes: three years of gold a year in debt' },
};
const TRAIT_KEYS = Object.keys(TRAITS);
// the chance that one heir is of each tier (white, green, blue, purple, gold)
const TIER_ODDS = [0, 0.46, 0.30, 0.15, 0.08, 0.01];
const OFFERED = TRAIT_KEYS.filter(t => TRAITS[t].card !== false);
const OF_TIER = n => OFFERED.filter(t => TRAITS[t].tier === n);
const FLAVOUR = OFFERED.filter(t => TRAITS[t].tier <= 2);   // what a mad king or a regent can be
const LANDMARKS = [
  { name: 'the Great Railway', fx: 'two more factories in the capital' },
  { name: 'the Fortress Line', fx: 'a fortress in every border province' },
  { name: 'the Grand Exhibition', fx: 'a factory in each of the three richest provinces' },
];
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
const COASTAL = new Set('sco nth lon ire par bri aqu lan pro cat and gal por hol bel jut sch sve got nor pom epr han ven cro pie tus rom nap sic spb don cau cri bes kie lit liv fin con ana bul mac alb the ath'.split(' '));

function createSim(seed, geo, opts = {}){
  const rng = mulberry32(seed);
  const rand = (a = 0, b = 1) => a + (b - a) * rng();
  const chance = p => rng() < p;
  const pick = a => a[Math.floor(rng() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sig = x => 1 / (1 + Math.exp(-x));
  // a ruler "has" his own quirk, plus the passing one of a mad king or a child king's regent
  const has = (c, t) => !!c.ruler && (c.ruler.trait === t || c.ruler.mood === t);

  const S = { seed, t: 0, year: 1836, q: 0, regions: [], C: {}, wars: [], log: [], history: [], flags: {}, over: false,
    marks: [], warNames: {}, railBoom: -1, era: { name: 'Napoleonic warfare', def: 1.15, fort: 0.55, since: 1836 }, awake: {}, depression: -1, majors: [], greatWar: null, stats: { wars: 0, revolts: 0, battles: 0, rulers: 0 } };

  REGIONS.forEach((r, i) => S.regions.push({ i, id: r[0], name: r[1], owner: r[4], core: r[4], culture: r[5], pop: r[6],
    fac: Math.min(3, r[7]), fort: 0, build: null, unrest: 10, occ: null, battle: 0, flash: 0, integ: 1,
    coast: geo.regions[i].coast, nb: geo.regions[i].nb, startOwner: r[4] }));
  const RB = {}; S.regions.forEach(r => RB[r.id] = r);

  // ---------- rulers ----------
  const regnal = {};
  const reign = () => S.t + Math.floor(rand(32, 96));   // 8 to 24 years, unless something ends it sooner
  // what a quirk would mean for this nation now; null if it would mean nothing (no people to accept, no great power to admire)
  function quirkSetup(c, t){
    if (t === 'tolerant') { const pops = {}; regionsOf(c).forEach(r => { if (!isAccepted(c, r.culture)) pops[r.culture] = (pops[r.culture] || 0) + r.pop; });
      const best = Object.keys(pops).sort((a, b) => pops[b] - pops[a])[0]; return best ? { cul: best } : null; }
    if (t === 'chauvinist') { const xs = [...c.acc].filter(x => regionsOf(c).some(r => r.culture === x)); return xs.length ? { cul: pick(xs) } : null; }
    if (t === 'admirer') { const ms = S.majors.filter(m => m !== c.tag && S.C[m].alive && c.rival !== m); return ms.length ? { friend: pick(ms) } : null; }
    if (t === 'architect') return { landmark: pick(LANDMARKS) };
    if (t === 'mad') return { mood: pick(FLAVOUR.filter(x => x !== 'mad' && x !== 'child' && !quirkNeedsSetup(x))) };
    if (t === 'child') return { mood: pick(FLAVOUR.filter(x => x !== 'mad' && x !== 'child' && !quirkNeedsSetup(x))), ofAge: S.t + Math.floor(rand(16, 44)) };
    return {};
  }
  const quirkNeedsSetup = t => t === 'tolerant' || t === 'chauvinist' || t === 'admirer';
  // the same odds for every heir in Europe: roll his tier, then a ruler of that tier
  function drawQuirk(c, not = []){
    for (let k = 0; k < 60; k++) {
      let x = rng(), n = 1; while (n < 5 && x >= TIER_ODDS[n]) { x -= TIER_ODDS[n]; n++; }
      const t = pick(OF_TIER(n));
      if (!not.includes(t) && quirkSetup(c, t)) return t;
    }
    return 'builder';
  }
  // makeRuler draws a ruler without crowning him; `want` fixes the name or the quirk (used for heir cards)
  function makeRuler(c, base, want = {}){
    const pool = c.tag === 'PAP' ? ['Gregory', 'Pius', 'Leo'] : c.tag === 'SWI' ? null : (NAMES[c.culture] || NAMES.German);
    if (!pool || want.council) { const b0 = c.lean || { pat: 0.5, risk: 0.5 };
      return { name: pool ? 'the Regency Council' : 'the Federal Council', council: !!pool, pat: clamp(b0.pat + rand(-0.2, 0.2), 0.05, 0.95), risk: clamp(b0.risk + rand(-0.2, 0.2), 0.05, 0.95), trait: null, bias: rand(-0.15, 0.15), since: S.year, until: pool ? S.t + Math.floor(rand(24, 40)) : reign() }; }
    const nm = want.nm || pick(pool);
    const k = c.tag + nm, num = (regnal[k] || 0) + 1;
    const b = base || c.lean || { pat: 0.5, risk: 0.5 };
    const trait = want.trait || drawQuirk(c);
    const T = TRAITS[trait];
    const pat = T.temper ? T.temper.pat : clamp(b.pat + rand(-0.35, 0.35), 0.05, 0.95), risk = T.temper ? T.temper.risk : clamp(b.risk + rand(-0.35, 0.35), 0.05, 0.95);
    const given = `${nm} ${ROMAN[num] || num}`;
    return Object.assign({ name: `${given} ${T.epi}`, given, k, pat, risk, trait, since: S.year, until: reign(),
      bias: trait === 'shrewd' || trait === 'chancellor' ? 0 : trait === 'destiny' ? 0.4 : (risk - 0.5) * 0.9 + rand(-0.3, 0.3) }, quirkSetup(c, trait) || {});
  }
  // what the ruler does, in words, with his own friend, people, landmark or passing mood filled in
  function traitDesc(r){
    if (!r || !r.trait) return '';
    return TRAITS[r.trait].desc.replace('{friend}', r.friend ? S.C[r.friend].name : 'a great power').replace('{culture}', r.cul || 'a minority')
      .replace('{landmark}', r.landmark ? `${r.landmark.name}: ${r.landmark.fx}` : 'a landmark')
      .replace('{mood}', r.mood && S.C && Object.values(S.C).some(c => c.ruler === r) ? ` (now: ${TRAITS[r.mood].label})` : '');
  }
  function crown(c, r, quiet){
    if (r.k) regnal[r.k] = (regnal[r.k] || 0) + 1; r.since = S.year; c.ruler = r;
    if (TRAITS[r.trait] && TRAITS[r.trait].tier === 5) (S.stats.legendary = S.stats.legendary || []).push(`${c.tag} ${r.trait} ${S.year}`);
    return reignBegins(c, r, quiet);
  }
  // what a new reign (or a child king coming of age) changes at once
  function reignBegins(c, r, quiet){
    const t = r.trait, say = h => { if (!quiet) L('ruler', h); };
    if (t === 'tolerant' && r.cul) { c.acc.add(r.cul); say(`${r.name} declares the ${r.cul} people equal subjects of ${N(c)}.`); }
    if (t === 'chauvinist' && r.cul) { c.acc.delete(r.cul); say(`${r.name} of ${N(c)} strips the ${r.cul} people of their old rights.`); }
    if (t === 'liberator') { regionsOf(c).forEach(x => c.acc.add(x.culture)); if (c.tag === 'RUS') S.flags.serf = 1; say(`${r.name} frees the serfs and declares every people of ${N(c)} equal. The nobles are furious.`); }
    if (t === 'admirer' && r.friend) setRel(c.tag, r.friend, Math.max(60, rel(c.tag, r.friend)));
    if (t === 'lecher') neighborsOf(c).forEach(o => addRel(c.tag, o.tag, 15));
    if (t === 'conqueror') { neighborsOf(c).forEach(o => addRel(c.tag, o.tag, -30)); c.infamy += 10; }
    if (t === 'architect') r.works = S.t + 20;
    // volunteers flock to a legendary conqueror's banner
    if (LEGEND_WAR.includes(t)) { c.army = Math.max(c.army * 1.5, popOf(c) * 8); say(`Volunteers flock to the banner of ${r.name}: the army of ${N(c)} swells to ${Math.round(c.army)} thousand.`); }
    return r;
  }
  function newRuler(c, base, quiet){ return crown(c, makeRuler(c, base), quiet); }
  // a heir card: three different characters, each drawn with the same odds as any heir in Europe
  function heirCard(c, opening, why = '', crisis = false){
    const shuffle = a => a.map(x => [rng(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
    const pool = c.tag === 'PAP' ? ['Gregory', 'Pius', 'Leo'] : (NAMES[c.culture] || NAMES.German);
    const names = shuffle(pool.slice());
    const slots = []; for (let k = 0; k < 3; k++) slots.push(drawQuirk(c, slots));
    const options = slots.map((t, i) => makeRuler(c, null, { nm: names[i % names.length], trait: t }));
    return { type: 'heir', tag: c.tag, opening, options, old: c.ruler.name, why, crisis };
  }
  function chooseHeir(i){
    const p = S.pending; if (!p || p.type !== 'heir') return;
    const c = S.C[p.tag], nr = p.options[i]; S.pending = null;
    if (p.opening) { crown(c, nr, true); L('ruler', `${nr.name} takes the throne of ${N(c)}. ${traitDesc(nr)}.`); return; }
    crown(c, nr, true); successionLog(c, p.why, nr, p.crisis);
  }
  function successionLog(c, why, nr, crisis){
    if (crisis) {
      c.crisis = { until: S.t + Math.floor(rand(4, 9)), winner: nr.name };
      regionsOf(c).forEach(r => r.unrest = Math.min(100, r.unrest + 25)); mark(capitalOf(c).i, 'crisis');
      L('ruler', `<strong>Succession crisis in ${N(c)}.</strong> ${why} ${crisis === 'bastard' ? 'His bastard son raises an army' : 'Rival claimants raise armies'} against ${nr.name}. The army is split and unrest soars.`);
    } else L('ruler', `${why} ${TRAITS[nr.trait] && TRAITS[nr.trait].tier === 5 ? `<strong>${nr.name}</strong>` : nr.name} succeeds. ${traitDesc(nr)}.`);
  }
  // A reign ends: by death, defeat, revolution, a bullet or the army. The player picks the heir; everyone else gets one at random.
  function endReign(c, how, ctx = ''){
    const old = c.ruler; if (!old || !c.alive) return;
    if (c.tag === 'SWI') { if (how === 'death') c.ruler = makeRuler(c); return; }   // the council simply rotates
    if (c.player && S.pending) return;
    S.stats.rulers++; c.reigns = (c.reigns || 0) + 1;
    const was = old.name.charAt(0).toUpperCase() + old.name.slice(1);
    if (old.trait === 'architect' && c.treasury > 0) c.treasury = 0;
    if (old.trait === 'iron') regionsOf(c).forEach(r => { if (!isAccepted(c, r.culture)) r.unrest = Math.min(100, r.unrest + 30); });
    // a legendary reign ends: the conquered rise, a prophet's converts are foreigners again, the Sun King's bills arrive
    if (old.trait === 'chancellor' || old.trait === 'destiny') regionsOf(c).forEach(r => { if (r.wonUnder === old) { r.unrest = Math.min(100, r.unrest + 40); r.integ = Math.min(r.integ, 0.3); } });
    if (old.trait === 'prophet') (old.added || []).forEach(cul => { if (cul !== c.culture) c.acc.delete(cul); });
    if (old.trait === 'sun') c.treasury -= income(c) * 4 * 3;
    if (how === 'coup') {
      const nr = crown(c, makeRuler(c, null, { trait: 'usurper' })); c.treasury *= 0.7; regionsOf(c).forEach(r => r.unrest = Math.max(0, r.unrest - 15)); mark(capitalOf(c).i, 'coup');
      L('ruler', `Coup in ${N(c)}: ${old.name} is deposed by the army${ctx}; ${nr.name} takes power.`); return;
    }
    const why = { death: `${was} of ${N(c)} dies.`, council: `The regency council of ${N(c)} hands over power.`,
      abdicate: `Beaten in the <em>${ctx}</em>, ${old.name} of ${N(c)} abdicates.`, revolution: `Revolution in ${ctx}! ${was} of ${N(c)} is overthrown.`,
      murder: `${was} of ${N(c)} is assassinated${S.year >= 1870 ? ' by an anarchist' : ' by a conspirator'}.` }[how];
    if (old.trait === 'genius') { const nr = crown(c, makeRuler(c, null, { council: true })); L('ruler', `${why} With no heir, ${nr.name} rules until one is found.`); return; }
    const crisis = how === 'revolution' || c.tag === 'SWI' ? false : old.trait === 'lecher' ? 'bastard' : old.trait === 'conqueror' || (TRAITS[old.trait] || {}).tier === 5 || chance(0.18);
    if (c.player) { S.pending = heirCard(c, false, why, crisis); return; }
    successionLog(c, why, newRuler(c, null, true), crisis);
  }
  const horizon = c => has(c, 'dynast') ? 40 : Math.round(8 + c.ruler.pat * 22);
  // Gold only matters for what it can buy: a country with a full treasury treats spending as cheap.
  const goldValue = c => clamp((80 + c.army * 0.5) / Math.max(1, c.treasury), 0.1, 1) * (has(c, 'miser') ? 3 : 1);
  const lossW = c => 1.6 - c.ruler.risk;

  function makeCountry(tag, d){
    const c = { tag, name: d.name, adj: d.adj, pre: d.pre || null, color: d.color, culture: d.culture, acc: new Set(d.acc || []),
      lean: { pat: clamp(0.25 + d.p[1] * 0.6, 0.1, 0.9), risk: clamp(d.p[0], 0.1, 0.9) },
      army: d.army * rand(0.9, 1.1), treasury: 30 + rand(0, 20), infamy: 0, allies: new Set(), rival: null, truce: {},
      programme: new Set(d.programme || []), guarantee: null,
      alive: true, unifier: !!d.unifier, noAnnex: !!d.noAnnex, thoughts: [], unified: false, born: S.year,
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
  [['RUS','TUR',-45],['GRE','TUR',-55],['SER','TUR',-40],['AUS','SAR',-35],['FRA','PRU',-10],['GBR','FRA',10],
   ['RUS','AUS',25],['RUS','PRU',20],['AUS','SIC',45],['FRA','PAP',45],['GBR','POR',50],['DEN','PRU',-15]].forEach(([a, b, v]) => setRel(a, b, v));
  const ally = (a, b) => { S.C[a].allies.add(b); S.C[b].allies.add(a); };
  ally('AUS', 'SIC'); ally('FRA', 'PAP'); ally('GBR', 'POR');

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
  const quality = c => (1 + 0.15 * facAvg(c)) * (has(c, 'destiny') ? 3 : has(c, 'prophet') ? 2.5 : has(c, 'chancellor') ? 2 : has(c, 'conqueror') ? 1.4 : has(c, 'soldier') ? 1.25 : 1);
  const inCrisis = c => c.crisis && S.t < c.crisis.until;
  const strength = c => c.army * quality(c) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? 0.5 : 1);
  const warOf = c => S.wars.find(w => w.att.includes(c.tag) || w.def.includes(c.tag));
  const isAccepted = (c, cul) => c.culture === cul || c.acc.has(cul);
  const neighborsOf = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag) s.add(o); })); return [...s].map(t => S.C[t]); };
  const borderRegions = c => { const s = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { if (S.regions[j].owner !== c.tag) s.add(j); })); return [...s].map(j => S.regions[j]); };
  const isNeighbor = (a, b) => neighborsOf(a).includes(b);
  const landNeighbors = c => { const s2 = new Set(); regionsOf(c).forEach(r => r.nb.forEach(j => { const o = S.regions[j].owner; if (o !== c.tag && !geoNaval(r.i, j)) s2.add(o); })); return s2.size; };
  // Big states are harder to run: every province beyond six trims the yield of all of them.
  const admin = n => clamp(1 - 0.03 * Math.max(0, n - 6), 0.55, 1);
  const adminOf = c => admin(regionsOf(c).length);
  // a legendary conqueror's volunteers take half as many workers from the fields
  const LEGEND_WAR = ['chancellor', 'destiny', 'prophet'];
  const workforce = (c, army = c.army) => clamp(1 - army / (Math.max(0.5, popOf(c)) * (LEGEND_WAR.some(t => has(c, t)) ? 90 : 45)), 0.55, 1);
  // income of one province in a season, broken down
  function regionIncome(r, c = S.C[r.owner], opts = {}){
    if (r.occ && !opts.ignoreOcc) return { tax: 0, fac: 0, trade: 0 };
    const u = opts.unrest != null ? opts.unrest : r.unrest;
    const integ = opts.integ != null ? opts.integ : r.integ;
    const m = (1 - u / 200) * (0.1 + 0.9 * integ) * (opts.admin != null ? opts.admin : adminOf(c)) * (has(c, 'incompetent') ? 0.88 : 1) * (S.depression > S.t ? 0.8 : 1)
      * (has(c, 'chauvinist') && r.culture === c.culture ? 1.1 : 1) * (has(c, 'sun') ? 1.6 : 1);
    const serf = c.tag === 'RUS' && !S.flags.serf ? 0.5 : 1;
    const wf = opts.wf != null ? opts.wf : workforce(c);
    const atWar = opts.war != null ? opts.war : !!warOf(c);
    return { tax: r.pop * 0.06 * m * wf, fac: r.pop * 0.7 * (1 - Math.pow(0.8, opts.fac != null ? opts.fac : r.fac)) * m * wf * serf, trade: r.coast && !atWar ? (r.pop * 0.04 + r.fac * 0.25) * m * (has(c, 'navigator') ? 1.5 : 1) : 0 };
  }
  const sumInc = x => x.tax + x.fac + x.trade;
  const income = c => regionsOf(c).reduce((s, r) => s + sumInc(regionIncome(r, c)), 0);
  const score = c => income(c) * 4;
  const upkeep = c => c.army * 0.04 * (has(c, 'navigator') ? 2 : 1);
  const power = c => regionsOf(c).reduce((s, r) => s + r.pop * (1 + 0.5 * r.fac), 0) + c.army * 0.5;
  const isMajor = c => S.majors.includes(c.tag);
  const maxBuilds = c => 1 + Math.floor(regionsOf(c).length / 3);
  function claim(c, r){
    if (r.owner === c.tag) return 0;
    if (r.core === c.tag) return 3;
    if (isAccepted(c, r.culture) || c.programme.has(r.id)) return 2.5;
    return 0;
  }
  // what a province would be worth to c per year once settled
  function provYearly(r, c){
    const foreign = !isAccepted(c, r.culture) && !has(c, 'prophet');
    if (r.owner === c.tag) return sumInc(regionIncome(r, c, { ignoreOcc: true, war: false, integ: 1 })) * 4;
    const n = regionsOf(c).length, a0 = admin(n), a1 = admin(n + 1);
    const own = income(c) * 4;
    return sumInc(regionIncome(r, c, { ignoreOcc: true, unrest: foreign ? 25 + 36 * nationalism() : 10, integ: 1, war: false, admin: a1 })) * 4 - own * (a0 - a1) / a0;
  }
  const settleYears = (r, c) => (!isAccepted(c, r.culture) && !has(c, 'prophet') && r.core !== c.tag && !c.programme.has(r.id)) ? 9 : 4;
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
  alive().forEach(c => { if (c.tag === opts.player && c.tag !== 'SWI') c.ruler = makeRuler(c); else newRuler(c, null, true); });

  function pickRival(c){ // the neighbour that most threatens c's income
    let best = null, bs = 0;
    neighborsOf(c).forEach(o => { if (!o.alive || c.allies.has(o.tag)) return;
      const s = threatOf(o, c).p * 100 + Math.max(0, -rel(c.tag, o.tag)) * 0.3; if (s > bs) { bs = s; best = o.tag; } });
    c.rival = bs > 4 ? best : null;
  }

  // ---------- military forecasting ----------
  const sideStr = ts => ts.reduce((s, t) => s + strength(S.C[t]), 0);
  function mySide(c, extraArmy = 0, extraAlly = null){
    let s = (c.army + extraArmy) * quality(c) * (1 - unrestOf(c) / 250) * (inCrisis(c) ? 0.5 : 1);
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
    const hostility = clamp((20 - rel(o.tag, c.tag)) / 60, 0.1, 1.6) * (0.6 + o.ruler.risk * 0.6) * (1 + o.infamy / 40);
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
      const chanceAttack = Math.min(1, sig((best.ev - 5) / 12) * 0.9 * (0.5 + o.ruler.risk));
      const loss = best.p * (provYearly(best.r, c) * H + Math.max(0, c.treasury) * 0.3 + 20) + c.army * 0.1 * 3;
      const v = chanceAttack * loss;
      total += v; if (v > topV) { topV = v; top = o; }
    });
    if (has(c, 'paranoid')) total *= 1.8;
    return (RISK[key] = { total, top });
  }
  // a's forecast of attacking d for province r (gold over a's horizon)
  // Great powers that would step in to stop a from growing at d's expense, with the chance each joins.
  function interveners(a, d){
    if (has(a, 'chancellor')) return [];   // he isolates every enemy before he strikes
    const leader = S.leader === a.tag;
    return S.majors.map(t => S.C[t]).filter(m => m.alive && m !== a && m !== d && !a.allies.has(m.tag) && !d.allies.has(m.tag) && !warOf(m)
      && (leader || isNeighbor(m, a) || isNeighbor(m, d)) && (leader || rel(m.tag, a.tag) < 10 || m.rival === a.tag))
      .map(m => ({ m, q: Math.min(0.9, 0.25 + 0.35 * clamp(power(a) / Math.max(1, power(m)) - 0.4, 0, 1) + (regionsOf(d).length === 1 ? 0.2 : 0) + (leader ? 0.3 : 0)) }));
  }
  const bySeaOnly = (a, r) => !r.nb.some(j => S.regions[j].owner === a.tag && !geoNaval(j, r.i));
  function geoNaval(i, j){ return (S.navalSet || (S.navalSet = new Set((geo.naval || []).flatMap(([x, y]) => [x + '-' + y, y + '-' + x])))).has(i + '-' + j); }
  function warEval(a, d, r, dExtra = 0, dAlly = null){
    if (a.allies.has(d.tag) || ((a.truce[d.tag] || 0) > S.year && !LEGEND_WAR.some(t => has(a, t)))) return null;   // he ignores old truces
    let their = theirSide(d, a.tag) + dExtra * quality(d);
    if (warOf(d)) their *= 0.5;   // its armies are busy elsewhere
    interveners(a, d).forEach(({ m, q }) => { their += strength(m) * q * 0.45; });
    if (bySeaOnly(a, r) && !has(a, 'navigator')) their *= 2;  // invading across the sea is hard
    if (dAlly && !d.allies.has(dAlly.tag)) their += strength(dAlly) * 0.8;
    const ratio = mySide(a) / Math.max(1, their * S.era.def);
    const pTrue = pWin(ratio), p = pWin(ratio * Math.exp(a.ruler.bias));   // what the ruler believes
    if (p < 0.5) return null;
    const H = horizon(a), T = a.treasury;
    const years = clamp(1 + 1.6 / (Math.abs(Math.log(ratio)) + 0.35), 1, 4.5);
    const yearly = provYearly(r, a) * (has(a, 'revanchist') && r.core === a.tag ? 2 : 1) * (has(a, 'warmonger') ? 1.5 : 1) * (inDream(a, r) ? 1.35 : 1);
    const gv = goldValue(a);
    // a usurper's victory also ends the unrest that dogs his reign
    const legit = has(a, 'usurper') && !a.ruler.legit ? income(a) * 4 * 0.06 * Math.min(H, 12) : 0;
    const gain = yearly * Math.max(0, H - years - settleYears(r, a) * (has(a, 'iron') ? 0.3 : 0.6)) + Math.max(0, d.treasury) * 0.3 * gv + legit;
    const losses = a.army * 0.05 * years * 2 * gv;
    const disruption = years * (regionsOf(a).reduce((s, x) => s + regionIncome(x, a, { war: false }).trade, 0) * 4 + income(a) * 4 * 0.05);
    const lose = Math.max(0, T) * 0.3 * gv + 0.3 * (borderRegions(d).filter(x => x.owner === a.tag).map(x => provYearly(x, a)).sort((x, y) => y - x)[0] || 0) * H;
    const swallow = regionsOf(d).length === 1 ? (S.year < 1860 ? 16 : 8) : 0;
    const infamyCost = ((claim(a, r) >= 2.5 ? 3 : 9) + swallow) * (1.5 + landNeighbors(a) * 0.5) * (has(a, 'warmonger') ? 0.5 : 1);
    const ev = p * gain - (1 - p) * lose * lossW(a) - losses - disruption - infamyCost;
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
    if (!has(a, 'chancellor')) [...d.allies].forEach(t => { const o = S.C[t]; const sure = d.guarantee && d.guarantee.by === t && S.year < d.guarantee.until; if (o.alive && !warOf(o) && !has(o, 'saint') && t !== a.tag && !a.allies.has(t) && (sure || chance(0.85))) w.def.push(t); });
    [...a.allies].forEach(t => { const o = S.C[t]; if (o.alive && !warOf(o) && !has(o, 'saint') && !w.def.includes(t) && rel(a.tag, t) > 25 && chance(0.6)) w.att.push(t); });
    // an admirer follows his favourite court into any war
    alive().forEach(o => { if (!has(o, 'admirer') || warOf(o) || w.att.includes(o.tag) || w.def.includes(o.tag)) return;
      const side = w.att.includes(o.ruler.friend) ? w.att : w.def.includes(o.ruler.friend) ? w.def : null;
      if (side && chance(0.9)) side.push(o.tag); });
    S.wars.push(w); S.stats.wars++; a.lastWar = S.year;
    const cl = claim(a, goal);
    a.infamy += (cl >= 2.5 ? 3 : 9) + (regionsOf(d).length === 1 ? 8 : 0);
    if (!opts.great) interveners(a, d).forEach(({ m, q }) => { if (!w.def.includes(m.tag) && !w.att.includes(m.tag) && chance(q)) w.def.push(m.tag); });
    w.att.forEach(t => w.def.forEach(u => addRel(t, u, -30)));
    let txt = opts.text;
    if (!txt) {
      const why = cl === 3 ? `to win back ${Rn(goal)}` : cl ? `for ${Rn(goal)}, whose ${goal.culture}-speaking people would integrate quickly` : `for ${Rn(goal)} and its ${Math.round(provYearly(goal, a))} gold a year`;
      const mis = opts.pTrue != null && opts.p - opts.pTrue > 0.08 ? `, though his generals privately think ${Math.round(opts.pTrue * 100)}%` : '';
      txt = `${N(a)} invades ${N(d)} ${why}. ${a.ruler.name.charAt(0).toUpperCase() + a.ruler.name.slice(1)} rates the odds at ${Math.round(opts.p * 100)}%${mis}. The <em>${w.name}</em> begins.`;
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
    if (how === 'war') { if (r.fac > 0) r.fac--; r.integ = kin ? 0.4 : 0.1; r.unrest = Math.max(r.unrest, kin ? 25 : 45); r.wonUnder = to.ruler;
      if (has(to, 'prophet') && !kin) { to.acc.add(r.culture); (to.ruler.added = to.ruler.added || []).push(r.culture); r.integ = 1; r.unrest = 20; } }
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
    // a cautious ruler holds his ground, and is slow to take the enemy's
    if ((has(S.C[r.owner], 'cautious') || has(S.C[win[0]], 'cautious')) && chance(0.4)) return;
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
      const sweep = winners.some(t => has(S.C[t], 'chancellor') || has(S.C[t], 'destiny'));
      const cap = sweep ? 99 : w.great ? 3 : 1;
      let extra = 0;
      occupied.filter(r => r.owner && losers.includes(r.owner) && winners.includes(r.occ) && r !== goal)
        .sort((x, y) => (claim(S.C[y.occ], y) - claim(S.C[x.occ], x)) || y.pop - x.pop)
        .forEach(r => { if (extra >= cap) return; const occ = r.occ; if ((sweep || claim(S.C[occ], r) > 0 || w.score >= 85 || w.score <= -85 || w.great) && give(r, occ)) extra++; });
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
    winners.forEach(t => { const c = S.C[t]; if (c.alive && has(c, 'usurper') && !c.ruler.legit) { c.ruler.legit = true; L('ruler', `Victory in the <em>${w.name}</em> makes ${c.ruler.name} of ${N(c)} a lawful king in his people's eyes.`); } });
    // a ruler who led his nation into defeat may have to go (not at the armistice: the age is over)
    const beaten = S.C[losers[0]];
    if (beaten && beaten.alive && !(S.year === 1918 && S.q === 3) && (taken.some(x => x[2] === beaten.tag) || beaten.tag === w.att[0]) && chance(0.5))
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
      if (ratio > 2.2) frontMove(win, lose, w, aWin);
      const bleed = t => has(S.C[t], 'soldier') ? 1.5 : 1;
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
    const T = c.treasury, war = warOf(c), H = horizon(c), λ = lossW(c);
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
        const cost = 22 * Math.pow(1.55, r.fac) * catchup * (has(c, 'genius') ? 0.5 : has(c, 'builder') ? 0.7 : 1) * (S.railBoom > S.year ? 0.7 : 1);
        if (cost > T + (has(c, 'dynast') ? 40 : 0)) return;   // a dynast borrows to build
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
      const upk = delta * 0.04 * 4 * (has(c, 'navigator') ? 2 : 1);
      return (baseRisk.total - r1) - (incLoss + upk * gv) * H - (delta > 0 ? delta * 3 * gv : 0);
    };
    const step = Math.max(5, c.army * 0.15, popOf(c) * 0.5);
    let bestA = null;
    [step, step * 2.5].forEach(st => { if (T < st * 3 + 5) return;
      const ev = armyEV(st) + (war ? 30 + st : 0);
      if (!bestA || ev > bestA.ev) bestA = { type: 'army', amt: st, ev, label: `Grow the army by ${Math.round(st)}k`,
        why: war ? 'At war: the army needs every man' : gwW > 0.3 && !baseRisk.top ? 'Preparing for the general war everyone expects' : baseRisk.top ? `Cuts expected losses to ${baseRisk.top.name} by ${Math.round(baseRisk.total - riskOf(c, st).total)}; costs ${(st * 0.16).toFixed(1)} a year in upkeep plus lost workers` : 'Little danger nearby' }; });
    if (bestA) add(bestA);
    if (!war && c.army - step >= popOf(c) * 0.8) {
      const ev = armyEV(-step);
      add({ type: 'demob', amt: step, ev, label: `Shrink the army by ${Math.round(step)}k`, why: `Workers back in factories and fields; risk rises by ${Math.round(riskOf(c, -step).total - baseRisk.total)}` });
    }

    // fortress facing the most dangerous neighbour
    if (baseRisk.top && building < maxBuilds(c) && T >= 25) {
      const o = baseRisk.top, t = threatOf(o, c);
      const fs = mine.filter(r => !r.fort && !r.build && !r.occ && r.nb.some(j => S.regions[j].owner === o.tag)).sort((a, b) => provYearly(b, c) - provYearly(a, c))[0];
      if (fs) add({ type: 'fort', r: fs, cost: 25, ev: Math.min(1.5, t.p * H) * pWin(t.ratio) * 0.45 * (provYearly(fs, c) * H * 0.6 + 25) - 25 * gv,
        label: `Fortify ${fs.name}`, why: `Guards the richest border with ${o.name}` });
    }

    // reform: income recovered from unrest, plus revolts avoided
    if (T >= 20 && c.reformCd <= S.t) {
      let gain = 0;
      mine.forEach(r => { const now = sumInc(regionIncome(r, c)), calm = sumInc(regionIncome(r, c, { unrest: Math.max(0, r.unrest - 18) }));
        gain += (calm - now) * 4 * 1.6; if (r.unrest > 55) gain += 0.35 * provYearly(r, c) * Math.min(H, 12); });
      if (gain > 1) add({ type: 'reform', ev: gain - (has(c, 'reformer') ? 10 : 20) * gv, label: 'Pass reforms to calm unrest', why: `Average unrest ${Math.round(unrestOf(c))}; recovers lost taxes and heads off uprisings` });
    }

    // diplomacy: alliances lower risk; courting makes them possible
    const allyPool = new Set(); neighborsOf(c).forEach(o => allyPool.add(o)); if (baseRisk.top) neighborsOf(baseRisk.top).forEach(o => allyPool.add(o)); S.majors.forEach(t => allyPool.add(S.C[t]));
    if (!war) [...allyPool].forEach(o => {
      if (!o.alive || o === c || c.allies.has(o.tag) || warOf(o) || c.allies.size >= 3 || o.allies.size >= 3) return;
      const mine2 = baseRisk.total - riskOf(c, 0, o).total;
      const theirs = riskOf(o).total - riskOf(o, 0, c).total;
      const drag = riskOf(o).total * 0.12;
      const ev = (mine2 - drag) * (has(c, 'arbiter') ? 2 : 1);
      if (ev < 3) return;
      const r = rel(c.tag, o.tag);
      const guard = baseRisk.top ? baseRisk.top.name : 'trouble';
      if (r >= 30 && theirs - riskOf(c).total * 0.12 <= 0) return;
      if (r >= 30) add({ type: 'ally', o, ev, guard: baseRisk.top, theirs: theirs - riskOf(c).total * 0.12, label: `Ally with ${o.name}`, why: `Cuts expected losses to ${guard} by ${Math.round(mine2)}` });
      else add({ type: 'court', o, ev: ev * 0.25, label: `Court ${o.name}`, why: `A future ally against ${guard} (relations ${Math.round(r)})` });
    });
    // peaceful union of a fellow-national minor
    if (dreamsOf(c).length && !war) neighborsOf(c).forEach(o => {
      if (isMajor(o) || o.noAnnex || warOf(o) || !dreamsOf(c).some(d => d.cultures.includes(o.culture))) return;
      const val = regionsOf(o).reduce((s, r) => s + provYearly(r, c), 0) * (H - 1.5);
      const r = rel(c.tag, o.tag);
      const ok = r >= 70 && power(c) > 2 * power(o) && ![...o.allies].some(t => t !== c.tag && isMajor(S.C[t]));
      if (ok) add({ type: 'annex', o, ev: val, label: `Unite with ${o.name} by treaty`, why: `Toward ${dreamsOf(c)[0].title}; adds ${Math.round(val / (H - 1.5))} a year with no war` });
      else if (r < 75) add({ type: 'court', o, ev: val * 0.08, label: `Court ${o.name}`, why: `Toward ${dreamsOf(c)[0].title} (relations ${Math.round(r)} of 70 needed)` });
    });

    // war: chance of winning x what the province pays once settled, minus the price of fighting and of losing
    if (!war && T > -10 && unrestOf(c) < 50 && !has(c, 'saint')) {
      let best = null;
      borderRegions(c).forEach(r => {
        const o = S.C[r.owner];
        if (!o.alive) return;
        const e = warEval(c, o, r); if (!e || e.p < 0.55) return;
        if (!best || e.ev > best.ev) best = { type: 'war', o, r, p: e.p, pTrue: e.pTrue, ev: e.ev, label: `Invade ${o.name} for ${r.name}`,
          why: `${Math.abs(e.p - e.pTrue) > 0.07 ? `believes ${Math.round(e.p * 100)}% to win (truly ${Math.round(e.pTrue * 100)}%)` : `${Math.round(e.p * 100)}% to win`}${warOf(o) ? ` while ${o.name} is busy fighting` : ''}${inDream(c, r) ? `; part of the dream of ${dreamsOf(c).find(d => d.pset.has(r.id)).title}` : ''}; ${r.name} pays ${e.yearly.toFixed(0)} a year once integrated${o.treasury > 100 ? `, plus a share of ${o.name}'s ${Math.round(o.treasury)} gold` : ''}; war costs ~${Math.round(e.cost)}` };
      });
      if (best) add(best);
    }
    out.sort((a, b) => b.ev - a.ev);
    return out;
  }

  function act(c, a){
    const spend = (k, v) => { c.treasury -= v; c.spent[k] = (c.spent[k] || 0) + v; };
    switch (a.type) {
      case 'factory': spend('build', a.cost); a.r.build = { type: 'factory', left: has(c, 'genius') ? 2 : 4 }; return;
      case 'fort': spend('build', a.cost); a.r.build = { type: 'fort', left: 3 }; return;
      case 'army': spend('army', a.amt * 3); c.army += a.amt; return;
      case 'demob': c.army = Math.max(3, c.army - a.amt); return;
      case 'reform': { const rf = has(c, 'reformer'); spend('reform', rf ? 10 : 20); c.reformCd = S.t + (rf ? 10 : 16); regionsOf(c).forEach(r => r.unrest = Math.max(0, r.unrest - (rf ? 26 : 18))); return; }
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
      if (r.integ < 1 && !r.occ) { const o = S.C[r.owner]; r.integ = Math.min(1, r.integ + ((isAccepted(o, r.culture) || r.core === o.tag) ? 0.08 : 0.028) * (has(o, 'iron') ? 2 : 1));
        if (r.integ >= 1) L('econ', `${Rn(r)} is now fully integrated into ${N(o)}.`); }
      if (!r.build || r.occ) return;
      if (--r.build.left > 0) return;
      const o = S.C[r.owner];
      if (r.build.type === 'factory') { r.fac++; if (r.fac >= 3) L('econ', `A new factory opens in ${Rn(r)} (${N(o)}); it now has ${r.fac}.`); }
      else { r.fort = 1; L('econ', `${N(o)} completes a fortress in ${Rn(r)}.`); }
      r.build = null;
    });
  }
  function nationalism(){ return 0.3 + (S.year - 1836) / 70; }
  function tickUnrest(){
    S.regions.forEach(r => {
      const o = S.C[r.owner];
      const foreign = !isAccepted(o, r.culture);
      const target = 8 + (foreign ? 25 + 36 * nationalism() + (S.awake[r.culture] || 0) : 0) + (inCrisis(o) ? 12 : 0) + Math.min(18, r.fac * 3) * clamp((S.year - 1848) / 45, 0, 1) + (warOf(o) ? 10 : 0) + (r.occ ? 25 : 0) + (o.treasury < 0 ? 15 : 0) + 15 * (1 - r.integ) + (has(o, 'usurper') && !o.ruler.legit ? 10 : 0);
      r.unrest = has(o, 'saint') ? Math.max(0, r.unrest - 8) : clamp(r.unrest + (target - r.unrest) * 0.07 + rand(-2, 2.5), 0, 100);
    });
  }
  function revolts(){
    S.regions.forEach(r => {
      if (r.unrest < 65 || r.occ) return;
      if (!chance(0.025 * (r.unrest - 60) / 40)) return;
      const o = S.C[r.owner];
      S.stats.revolts++; r.flash = 3; mark(r.i, 'revolt');
      const rebels = r.pop * 2.2 * rand(0.5, 1.6) * (1 + (S.year - 1836) / 80) * (1 + (S.awake[r.culture] || 0) / 10);
      const garrison = o.army * quality(o) * (warOf(o) ? 0.6 : 2.2) / Math.max(1, regionsOf(o).length) * (inCrisis(o) ? 0.5 : 1) * rand(0.6, 1.3) * (r.fort ? 1.6 : 1) * (has(o, 'iron') ? 3 : 1);
      if (rebels < garrison) { r.unrest = 35; o.army *= 0.96; L('revolt', `Riots in ${Rn(r)} are put down by the ${o.adj} army.`); return; }
      if (isAccepted(o, r.culture)) {
        o.treasury *= 0.5; regionsOf(o).forEach(x => x.unrest = Math.max(15, x.unrest - 30)); o.army *= 0.85;
        endReign(o, 'revolution', Rn(r)); return; }
      const kin = r.nb.map(j => S.C[S.regions[j].owner]).find(k => k.alive && k.culture === r.culture && k !== o && !warOf(k));
      const spread = () => regionsOf(o).forEach(x => { if (!isAccepted(o, x.culture) && x.core !== o.tag) x.unrest = Math.min(100, x.unrest + 15); });
      if (kin) { L('revolt', `${Rn(r)} rises against ${N(o)} and declares for ${N(kin)}.`); transfer(r, kin, o, 'treaty'); r.core = kin.tag; r.unrest = 20; spread(); return; }
      // who the rebels fight for: the province's own fallen state if it was of their people, else the template nation
      const home = COUNTRIES[r.core] && COUNTRIES[r.core].culture === r.culture && !S.C[r.core].alive ? r.core : null;
      const t = home ? null : TEMPLATES[r.culture];
      const tag = home || (t && t.tag);
      if (!tag || (S.C[tag] && S.C[tag].alive)) {
        r.unrest = 40; o.army *= 0.93; if (o.treasury > 0) o.treasury *= 0.85;
        L('revolt', `Rebels seize ${Rn(r)} but find no allies; ${N(o)} retakes it at a heavy cost in gold and men.`); return; }
      const restored = !!S.C[tag], wasPlayer = restored && S.C[tag].player;
      const nc = home ? makeCountry(tag, Object.assign({}, COUNTRIES[tag], { army: r.pop * 6 }))
        : makeCountry(tag, { name: t.name, adj: t.adj, pre: t.pre, color: t.color, culture: r.culture, p: [0.55, 0.4, 0.5], army: r.pop * 6, programme: t.programme });
      nc.treasury = 60; nc.born = S.year; nc.restored = restored; if (wasPlayer) nc.player = true;
      dreamsOf(nc).forEach(d => d.provinces.forEach(id => nc.programme.add(id))); S.C[tag] = nc; if (!tags.includes(tag)) tags.push(tag);
      const group = [r].concat(r.nb.map(j => S.regions[j]).filter(x => x.owner === o.tag && x.culture === r.culture && !x.occ && (!home || x.core === home)));
      invalidate(); group.forEach(x => { x.owner = tag; x.core = tag; x.unrest = 15; x.build = null; x.flash = 3; x.integ = 1; });
      killIfEmpty(o);
      tags.forEach(u => u !== tag && setRel(tag, u, u === o.tag ? -60 : rand(-5, 20)));
      nc.truce[o.tag] = S.year + 15; o.truce[tag] = S.year + 15;
      spread();
      const guard = S.majors.map(t2 => S.C[t2]).filter(m => m.alive && m !== o && !warOf(m) && m.allies.size < 3 && (rel(m.tag, o.tag) < 0 || m.rival === o.tag)).sort((x, y) => strength(y) - strength(x))[0];
      if (guard) { ally(guard.tag, tag); setRel(guard.tag, tag, 70); nc.guarantee = { by: guard.tag, until: S.year + 25 }; }
      L('revolt', `Independence! ${rlist(group)} break${group.length > 1 ? '' : 's'} away from ${N(o)} and ${restored ? 'restore' : 'form'}${group.length > 1 ? '' : 's'} ${N(nc)} under ${nc.ruler.name}.${guard ? ` ${N(guard)} guarantees its independence.` : ''}`);
      o.army *= 0.85;
    });
  }

  // ---------- national dreams: unify a people, or build a greater state ----------
  const DREAMS = [
    { id: 'ger', title: 'German Empire', adj: 'German', pre: 'German', cultures: ['German'], leaders: ['PRU', 'AUS', 'BAV'], need: 8, from: 1850,
      provinces: ['bra','pom','epr','sil','rhi','wes','han','hes','sax','bav','wur','vie','tyr','als','sch'] },
    { id: 'ita', title: 'Kingdom of Italy', adj: 'Italian', pre: 'Italo', cultures: ['Italian'], need: 4, from: 1836, provinces: ['pie','lom','ven','tus','rom','nap','sic'] },
    { id: 'sca', title: 'United Scandinavia', adj: 'Scandinavian', pre: 'Scando', cultures: ['Swedish', 'Norwegian', 'Danish'], need: 5, from: 1845, provinces: ['sve','got','nor','jut','fin'] },
    { id: 'ukr', title: 'Greater Ukraine', adj: 'Ukrainian', pre: 'Ukraino', cultures: ['Ukrainian'], need: 3, from: 1836, provinces: ['kie','cri','bes','gli','don'] },
    { id: 'rom', title: 'Greater Romania', adj: 'Romanian', pre: 'Romano', cultures: ['Romanian'], need: 3, from: 1836, provinces: ['wal','mol','trn','bes'] },
    { id: 'bul', title: 'Greater Bulgaria', adj: 'Bulgarian', pre: 'Bulgaro', cultures: ['Bulgarian'], need: 3, from: 1836, provinces: ['bul','mac','the'] },
    { id: 'gre', title: 'Greater Greece', adj: 'Greek', pre: 'Greco', cultures: ['Greek'], need: 3, from: 1836, provinces: ['ath','the','mac','con'] },
    { id: 'yug', title: 'Yugoslavia', adj: 'Yugoslav', pre: 'Yugo', cultures: ['Serb', 'Croat', 'Bosniak'], need: 3, from: 1850, provinces: ['ser','bos','cro'] },
    { id: 'pol', title: 'Polish Commonwealth', adj: 'Polish', pre: 'Polono', cultures: ['Polish', 'Lithuanian'], need: 3, from: 1836, provinces: ['pol','pos','gli','lit'] },
    { id: 'ibe', title: 'Iberian Union', adj: 'Iberian', pre: 'Ibero', cultures: ['Spanish', 'Portuguese'], need: 5, from: 1860, provinces: ['cas','cat','and','gal','por'] },
  ];
  DREAMS.forEach(d => d.pset = new Set(d.provinces));
  function dreamsOf(c){ return DREAMS.filter(d => !d.done && d.cultures.includes(c.culture) && (!d.leaders || d.leaders.includes(c.tag))); }
  const inDream = (c, r) => dreamsOf(c).some(d => d.pset.has(r.id));
  S.DREAMS = DREAMS; S.dreamsOf = dreamsOf;
  S.unifyProgress = () => DREAMS.map(d => {
    const lead = alive().filter(c => d.done ? c.tag === d.done : dreamsOf(c).includes(d)).map(c => ({ c, n: regionsOf(c).filter(r => d.pset.has(r.id)).length })).sort((a, b) => b.n - a.n)[0];
    return { id: d.id, title: d.title, need: d.need, done: d.done && S.C[d.done].alive ? S.C[d.done] : null, lead: lead ? lead.c : null, n: lead ? lead.n : 0, cul: d.cultures.join(', ') };
  });
  function unification(){
    DREAMS.forEach(d => {
      if (d.done || S.year < d.from) return;
      alive().filter(c => dreamsOf(c).includes(d)).forEach(c => {
        if (d.done) return;
        const own = regionsOf(c).filter(r => d.pset.has(r.id)).length;
        if (own < d.need) return;
        d.done = c.tag; c.unified = true; c.name = d.title; c.adj = d.adj; c.pre = d.pre;
        d.cultures.forEach(x => c.acc.add(x)); d.provinces.forEach(id => c.programme.add(id));
        regionsOf(c).forEach(r => { r.unrest = Math.max(0, r.unrest - 25); if (d.cultures.includes(r.culture)) r.integ = 1; });
        mark(capitalOf(c).i, 'crown');
        L('unify', `<strong>A dream fulfilled.</strong> Holding ${own} of its people's lands, ${N(c)} is proclaimed.`);
        alive().filter(o => o !== c && d.cultures.includes(o.culture) && !isMajor(o) && !o.noAnnex && !warOf(o) && ![...o.allies].some(t => t !== c.tag && isMajor(S.C[t]))).forEach(o => {
          L('unify', `${N(o)} votes to join the ${N(c)}.`); regionsOf(o).forEach(r => transfer(r, c, o, 'treaty')); });
      });
    });
  }
  alive().forEach(c => dreamsOf(c).forEach(d => d.provinces.forEach(id => { if (RB[id].owner !== c.tag) c.programme.add(id); })));

  // ---------- events ----------
  const Q = p => chance(p / 4);
  const EVENTS = [
    () => { if (S.year === 1848 && S.q === 1) { L('event', '<strong>The Springtime of Nations.</strong> Revolution sweeps the continent; unrest soars everywhere.'); S.regions.forEach(r => r.unrest = Math.min(100, r.unrest + 40)); } },
    () => { if (S.year >= 1845 && S.year <= 1849 && !S.flags.famine && Q(0.35)) { S.flags.famine = 1; const r = RB.ire; r.pop *= 0.75; r.unrest = Math.min(100, r.unrest + 30); L('event', `The Great Famine devastates ${Rn(r)}: a quarter of its people die or emigrate.`); } },
    () => { if (Q(0.06)) { const vs = alive().sort(() => rng() - 0.5).slice(0, 3); vs.forEach(c => regionsOf(c).forEach(r => { r.pop *= 0.95; r.unrest += 8; })); L('event', `Cholera spreads through ${list(vs)}; one in twenty dies.`); } },
    () => { if (S.year >= 1840 && !S.flags.rail && Q(0.2)) { S.flags.rail = 1; S.railBoom = S.year + 10; L('event', 'Railway mania: for a decade, factories cost 30% less.'); } },
    () => { if (S.year >= 1870 && S.year <= 1878 && !S.flags.dep && Q(0.3)) { S.flags.dep = 1; alive().forEach(c => c.treasury *= 0.5); S.depression = S.t + 12; S.regions.forEach(r => r.unrest += 10); L('event', '<strong>The Panic.</strong> Banks fail across Europe: every nation loses half its gold and earns a fifth less for three years.'); } },
    () => { const a = S.C.AUS; if (a.alive && !S.flags.ausg && S.year >= 1860 && RB.hun.owner === 'AUS' && RB.hun.unrest > 40 && Q(0.4)) {
      S.flags.ausg = 1; a.acc.add('Hungarian'); a.name = 'Austria-Hungary'; a.adj = 'Austro-Hungarian'; RB.hun.unrest = 15; L('event', `The Compromise: ${N(a)} becomes a dual monarchy, and Hungary is calmed.`); } },
    () => { const r = S.C.RUS; if (r.alive && !S.flags.serf && S.year >= 1855 && Q(0.15)) { S.flags.serf = 1; ['mos', 'spb'].forEach(id => { if (RB[id].owner === 'RUS') RB[id].fac = RB[id].fac + 1; }); L('event', `${N(r)} frees the serfs; workers pour into the factories of Moscow and St Petersburg.`); } },
    () => { if (Q(0.3)) { const ps = alive().filter(c => c.rival && S.C[c.rival].alive); if (ps.length) { const c = pick(ps), o = S.C[c.rival]; addRel(c.tag, o.tag, -25); L('diplo', `A border incident sours relations between ${N(c)} and ${N(o)}.`); } } },
    () => { if (Q(0.1)) { const vs = alive().sort(() => rng() - 0.5).slice(0, 2); if (vs.length === 2 && vs[0].rival !== vs[1].tag) { addRel(vs[0].tag, vs[1].tag, 25); L('diplo', `A royal marriage links ${N(vs[0])} and ${N(vs[1])}.`); } } },
    () => { if (S.q === 2 && Q(0.32)) { const c = pick(alive()); regionsOf(c).forEach(r => r.unrest += 18); L('event', `A failed harvest brings bread riots to ${N(c)}.`); } },
    // national awakenings raise unrest among a people for good
    () => { if (S.year >= 1840 && S.year <= 1852 && !S.awake.Ukrainian && Q(0.3)) { S.awake.Ukrainian = 14; L('event', 'Shevchenko\'s poems spark a <strong>Ukrainian national awakening</strong>; unrest grows in Ukrainian lands.'); } },
    () => { if (S.year >= 1845 && Q(0.07)) { const cul = pick(['Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Finnish', 'Irish', 'Croat', 'Lithuanian', 'Baltic', 'Norwegian', 'Albanian', 'Greek', 'Serb']);
      if (!S.awake[cul] && S.regions.some(r => r.culture === cul && !isAccepted(S.C[r.owner], cul))) { S.awake[cul] = 10; L('event', `A national awakening stirs the ${cul} people; their provinces grow restless.`); } } },
    // a military revolution changes who wins battles
    () => { if (S.year - S.era.since >= 12 && Q(0.12)) { const eras = [
        { name: 'Rifled muskets and railways favour the attacker', def: 0.95, fort: 0.35 }, { name: 'Entrenchments and breech-loaders favour the defender', def: 1.4, fort: 0.7 },
        { name: 'Mass conscription and artillery favour the attacker', def: 1.0, fort: 0.4 }, { name: 'Machine guns and barbed wire favour the defender', def: 1.5, fort: 0.75 }];
      const nx = pick(eras.filter(e => e.name !== S.era.name)); S.era = { ...nx, since: S.year };
      L('event', `<strong>Military revolution.</strong> ${nx.name}: every war forecast in Europe shifts.`); } },
    // a coal or railway boom makes one province suddenly valuable
    () => { if (S.year >= 1845 && Q(0.15)) { const r = pick(S.regions.filter(x => !x.occ)); r.fac += 2; r.pop *= 1.1; mark(r.i, 'boom');
      L('event', `${pick(['Coal is found', 'A railway junction booms', 'Iron mines open'])} in ${Rn(r)} (${N(S.C[r.owner])}): two factories' worth of industry overnight.`); } },
    // diplomatic crisis: an ultimatum to a rival
    () => { if (Q(0.25)) { const cs = alive().filter(c => c.rival && !has(c, 'saint') && S.C[c.rival].alive && !warOf(c) && !warOf(S.C[c.rival]) && isNeighbor(c, S.C[c.rival])); if (!cs.length) return;
      const c = pick(cs), o = S.C[c.rival];
      let best = null; borderRegions(c).filter(r => r.owner === o.tag).forEach(r => { const e = warEval(c, o, r); if (e && (!best || e.ev > best.ev)) best = { ...e, r }; });
      if (!best || best.ev + 35 < 0) { if (chance(0.35)) L('diplo', `${N(c)} rattles its sabre at ${N(o)} over ${pick(['a border post', 'a newspaper insult', 'a railway concession', 'a royal snub'])}, then thinks better of it.`); return; }
      const oFears = pWin(theirSide(o, c.tag) * S.era.def / Math.max(1, mySide(c)) * Math.exp(o.ruler.bias)) < 0.45;
      if (oFears) { const pay = Math.max(0, o.treasury * 0.2); o.treasury -= pay; c.treasury += pay; regionsOf(o).forEach(r => r.unrest += 8); addRel(c.tag, o.tag, -20);
        L('diplo', `<strong>Crisis.</strong> ${N(c)} sends ${N(o)} an ultimatum. ${N(o)} backs down, humiliated, and pays ${Math.round(pay)} gold.`); }
      else declareWar(c, o, best.r, { p: best.p, pTrue: best.pTrue, text: `<strong>Crisis.</strong> ${N(c)} sends ${N(o)} an ultimatum over ${Rn(best.r)}. ${N(o)} refuses, and the <em>${warName(c, o)}</em> begins.` }); } },
    // coups in restless countries
    () => { alive().forEach(c => { if (c.tag === 'SWI') return;
      if (unrestOf(c) > 45 && chance(0.03)) endReign(c, 'coup');
      else if (has(c, 'liberator') && chance(0.02)) endReign(c, 'coup', ' at the bidding of the nobles'); }); },
  ];
  // the hard rulers make the most enemies
  const HATED = ['chauvinist', 'iron', 'conqueror', 'liberator', 'usurper'];
  function successions(){
    alive().forEach(c => {
      if (S.t >= c.ruler.until) endReign(c, c.ruler.council ? 'council' : 'death');
      else if (c.tag !== 'SWI' && !c.ruler.council && chance(0.0025 * (HATED.some(t => has(c, t)) ? 3 : 1))) endReign(c, 'murder');
    });
  }
  // what changes during a reign: a drunk's judgment, a madman's mood, a child growing up, a great work finished, a peace brokered
  function tickRulers(){
    alive().forEach(c => { const r = c.ruler; if (!r) return;
      if (has(c, 'drunk')) r.bias = rand(-0.9, 0.9);
      if (r.trait === 'mad' && chance(1 / 12)) { r.mood = quirkSetup(c, 'mad').mood; L('ruler', `${r.name} of ${N(c)} changes again: ${TRAITS[r.mood].desc.charAt(0).toLowerCase() + TRAITS[r.mood].desc.slice(1)}.`); }
      if (r.trait === 'child' && S.t >= r.ofAge) {
        const was = r.name, t = chance(0.15) ? 'incompetent' : drawQuirk(c, ['child', 'mad', ...OF_TIER(4), ...OF_TIER(5)]);
        Object.assign(r, { trait: t, mood: null, name: `${r.given} ${TRAITS[t].epi}` }, quirkSetup(c, t) || {}); reignBegins(c, r, true);
        L('ruler', `${was.charAt(0).toUpperCase() + was.slice(1)} of ${N(c)} comes of age and becomes ${r.name}. ${traitDesc(r)}.`);
      }
      if (r.trait === 'architect' && r.works === S.t) {
        const lm = r.landmark, cap = capitalOf(c);
        if (lm.name === 'the Great Railway') cap.fac += 2;
        else if (lm.name === 'the Fortress Line') regionsOf(c).filter(x => x.nb.some(j => S.regions[j].owner !== c.tag)).forEach(x => x.fort = 1);
        else regionsOf(c).slice().sort((a, b) => sumInc(regionIncome(b, c)) - sumInc(regionIncome(a, c))).slice(0, 3).forEach(x => x.fac++);
        cap.landmark = lm.name.replace(/^the /, ''); mark(cap.i, 'landmark');
        L('econ', `<strong>${lm.name.charAt(0).toUpperCase() + lm.name.slice(1)}</strong> is completed in ${N(c)} under ${r.name}: ${lm.fx}.`);
      }
      if (has(c, 'arbiter') && !warOf(c)) S.wars.slice().forEach(w => {
        if (w.great || w.quarters < 6 || Math.abs(w.score) > 50 || !(isNeighbor(c, S.C[w.att[0]]) || isNeighbor(c, S.C[w.def[0]])) || !chance(0.08)) return;
        const fee = [S.C[w.att[0]], S.C[w.def[0]]].reduce((s, x) => { const f = Math.max(0, Math.min(15, x.treasury * 0.1)); x.treasury -= f; return s + f; }, 0); c.treasury += fee;
        endWar(w, 'white', `${N(c)} brokers the Peace of ${capitalOf(c).name}: the <em>${w.name}</em> ends where it stands, and ${c.ruler.name} is paid ${Math.round(fee)} gold for his trouble.`);
      });
    });
  }

  function greatWar(){
    if (S.year < 1914 || S.q < 2 || S.flags.gw) return;
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
    const w = declareWar(a, d, goal, { great: true, name: 'Great War', text: `<strong>The lamps go out all over Europe.</strong> A shot in the Balkans sets the alliances in motion: ${N(a)} and ${N(d)} go to war. The <em>Great War</em> begins.` });
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
      const waste = has(c, 'spendthrift') ? (tax + fac + trade) * 0.15 : 0;
      c.ledger = { tax, fac, trade, upkeep: upkeep(c), lostWork, lostAdmin, waste, spent: c.spent }; c.spent = {};
      c.treasury += tax + fac + trade - upkeep(c) - waste;
      if (c.crisis && S.t === c.crisis.until && c.ruler.name === c.crisis.winner) L('ruler', `${c.crisis.winner} wins the civil war in ${N(c)}.`);
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
    if (S.year === 1918 && S.q === 3) {   // the armistice: every world ends in autumn 1918
      if (S.greatWar && S.wars.includes(S.greatWar)) L('peace', '<strong>Armistice.</strong> At the eleventh hour the guns fall silent; peace is made on the lines as they stand.');
      S.wars.slice().forEach(w => endWar(w, w.score > 10 ? 'att' : w.score < -10 ? 'def' : 'white'));
      S.over = true; return;
    }
    S.t++; S.year = 1836 + Math.floor(S.t / 4); S.q = S.t % 4;
  }

  alive().forEach(pickRival);
  S.history.push({ y: 1835, p: Object.fromEntries(alive().map(c => [c.tag, score(c)])) });
  L('event', '<strong>Europe, 1836.</strong> Twenty-four nations, one ambition: to be the richest when the guns of the coming great war fall silent.');
  // a human player rules one country: same rules, but they choose its heirs (starting with the ruler of 1836)
  if (opts.player && S.C[opts.player]) { S.player = opts.player; const pc = S.C[opts.player]; pc.player = true;
    // vary the draw by country, so two countries in the same world are not offered the same three characters
    if (pc.tag !== 'SWI') { for (let i = [...pc.tag].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 13; i > 0; i--) rng(); S.pending = heirCard(pc, true); } }
  Object.assign(S, { chooseHeir, step, alive, considerations, SEASONS, riskOf, inCrisis, TRAITS, traitDesc, capitalOf, landNeighbors });
  return S;
}

if (typeof module !== 'undefined') module.exports = { createSim, REGIONS, MAP_W, MAP_H, SEASONS };
