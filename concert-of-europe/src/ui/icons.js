// ---------- one coloured icon per concept (16×16) ----------
const IC = {
  gold: '<circle cx="8" cy="8" r="6" fill="#e9c35a" stroke="#8a6a1c" stroke-width="1.2"/><path d="M8 4.6v6.8M6.2 6.3h2.9a1.2 1.2 0 010 2.4H7a1.2 1.2 0 000 2.4h2.9" fill="none" stroke="#8a6a1c" stroke-width="1.1"/>',
  income: '<ellipse cx="8" cy="12" rx="5.5" ry="2" fill="#7fbf6a" stroke="#3d6b33"/><ellipse cx="8" cy="9" rx="5.5" ry="2" fill="#8fcf79" stroke="#3d6b33"/><ellipse cx="8" cy="6" rx="5.5" ry="2" fill="#a2dd8b" stroke="#3d6b33"/><path d="M8 1v3M6.5 2.5L8 1l1.5 1.5" stroke="#3d6b33" fill="none" stroke-width="1.2"/>',
  upkeep: '<circle cx="7" cy="8" r="5.5" fill="#d98a6a" stroke="#7a3a22" stroke-width="1.1"/><path d="M4.5 8h5" stroke="#7a3a22" stroke-width="1.6"/>',
  army: '<g stroke-linecap="round"><path d="M2.5 13.5L12.5 3.5" stroke="#8a5a34" stroke-width="2.4"/><path d="M12.5 3.5l2-2" stroke="#c9ced6" stroke-width="1.1"/><path d="M13.5 13.5L3.5 3.5" stroke="#8a5a34" stroke-width="2.4"/><path d="M3.5 3.5l-2-2" stroke="#c9ced6" stroke-width="1.1"/><path d="M4.2 11.8l1.6 1.6M11.8 11.8l-1.6 1.6" stroke="#4a3018" stroke-width="1.6"/></g>',
  factory: '<path d="M1.5 14V8l3.5-2.2V8l3.5-2.2V8l3-2V2h2.5v12z" fill="#c9ced6" stroke="#41474f" stroke-width="1.1" stroke-linejoin="round"/><path d="M11.8 1.5c1-1 2.2-.2 3-.8" stroke="#8a919b" fill="none"/>',
  pop: '<circle cx="8" cy="4.6" r="2.8" fill="#e8d3b3" stroke="#6b5537"/><path d="M2.8 14.5c0-3.6 2.3-6 5.2-6s5.2 2.4 5.2 6z" fill="#d7b98d" stroke="#6b5537"/>',
  unrest: '<rect x="6" y="10" width="4.6" height="5.2" rx="1" fill="#c9443a" stroke="#5e1a12" stroke-width=".9"/><rect x="3.6" y="2.3" width="9" height="8.2" rx="2.6" fill="#e0503f" stroke="#5e1a12" stroke-width="1"/><path d="M6.4 2.6v3.6M8.6 2.4v3.8M10.7 2.6v3.6" stroke="#5e1a12" stroke-width=".8"/><path d="M3.7 6.9h4.1a1.35 1.35 0 010 2.7H4.4" fill="#e0503f" stroke="#5e1a12" stroke-width=".9" stroke-linejoin="round"/>',
  province: '<path d="M2 4.5L6 2l4.5 1.5L14 2.5v9.5L10 14l-4.5-1.5L2 14z" fill="#8fb36b" stroke="#3d5a26" stroke-width="1" stroke-linejoin="round"/><path d="M6 2v10.5M10.5 3.5V14M2 8.5l4-1 4.5 1L14 7.5" fill="none" stroke="#3d5a26" stroke-width=".8"/>',
  fort: '<path d="M3 15V6H1.8V2.5h2.4v1.5H6V2.5h4v1.5h1.8V2.5h2.4V6H13v9z" fill="#9aa3ad" stroke="#3a4048" stroke-width="1.1" stroke-linejoin="round"/><path d="M6.5 15v-3.5a1.5 1.5 0 013 0V15" fill="#3a4048"/>',
  trade: '<circle cx="8" cy="3.2" r="1.7" fill="none" stroke="#6fa8dc" stroke-width="1.3"/><path d="M8 5v9.5M5 7.5h6M2.5 10c0 2.6 2.5 4.5 5.5 4.5s5.5-1.9 5.5-4.5" fill="none" stroke="#6fa8dc" stroke-width="1.4" stroke-linecap="round"/>',
  reform: '<path d="M3 2.5h8.5a1.5 1.5 0 011.5 1.5v10H4.5A1.5 1.5 0 013 12.5z" fill="#efe2bf" stroke="#7a6a3c"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="#7a6a3c"/>',
  ally: '<path d="M1 8.5l3-3 3 1.5 2-1.5 3 1.5 3 3-3.5 3.5-2-1-2 1z" fill="#8bb6e0" stroke="#2f557e" stroke-width="1" stroke-linejoin="round"/>',
  rival: '<circle cx="8" cy="8" r="6.3" fill="#f2ece6" stroke="#8a2a20" stroke-width="1"/><circle cx="8" cy="8" r="4.2" fill="#d65a4d"/><circle cx="8" cy="8" r="2.2" fill="#f2ece6"/><circle cx="8" cy="8" r=".9" fill="#8a2a20"/>',
  war: '<path d="M13.5 2.5L5 11" stroke="#e0e3e8" stroke-width="2.2" stroke-linecap="round"/><path d="M3 9.5l3.5 3.5M2 14l2.3-2.3" stroke="#d65a4d" stroke-width="2" stroke-linecap="round"/>',
  peace: '<path d="M2 9c2-4 6-5 9-3.5L14.5 4 13 7.5c.5 3-2 6-6 6-2 0-4-1.5-5-4.5z" fill="#f2f4f2" stroke="#4f7a4b" stroke-width="1"/><circle cx="11.8" cy="6.4" r=".7" fill="#4f7a4b"/>',
  ruler: '<path d="M2 12.5L1.5 4l3.3 3L8 2l3.2 5 3.3-3-.5 8.5z" fill="#b9a3d6" stroke="#4e3f66" stroke-width="1.1" stroke-linejoin="round"/><path d="M2 12.5h12v1.8H2z" fill="#8f78ad" stroke="#4e3f66"/>',
  patience: '<path d="M4 1.5h8M4 14.5h8M5 1.5c0 4 6 4.5 6 6.5s-6 2.5-6 6.5M11 1.5c0 4-6 4.5-6 6.5s6 2.5 6 6.5" fill="none" stroke="#c9a45c" stroke-width="1.3"/><path d="M6.5 13.5c.5-1.5 2.5-1.5 3 0z" fill="#c9a45c"/>',
  risk: '<rect x="2" y="2" width="12" height="12" rx="2.5" fill="#f2f0ea" stroke="#5a5650" stroke-width="1.1"/><circle cx="5.3" cy="5.3" r="1.2" fill="#5a5650"/><circle cx="8" cy="8" r="1.2" fill="#5a5650"/><circle cx="10.7" cy="10.7" r="1.2" fill="#5a5650"/>',
  judgment: '<path d="M1 8Q8 1.5 15 8Q8 14.5 1 8z" fill="#e6eef6" stroke="#3f6a94" stroke-width="1.1"/><circle cx="8" cy="8" r="2.6" fill="#3f6a94"/><circle cx="8.8" cy="7.2" r=".8" fill="#fff"/>',
  score: '<path d="M8 14C4 12 2 8 3 3.5M8 14c4-2 6-6 5-10.5" fill="none" stroke="#c9a45c" stroke-width="1.4"/><path d="M3.2 6.5l2 .5M3.6 9.5l2 .2M5.2 12l1.6-.6M12.8 6.5l-2 .5M12.4 9.5l-2 .2M10.8 12l-1.6-.6" stroke="#c9a45c" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="5.5" r="2" fill="#e9c35a"/>',
  settle: '<circle cx="8" cy="8" r="6.3" fill="#3a4048" stroke="#a8c7a0" stroke-width="1.3"/><path d="M8 8V1.7A6.3 6.3 0 0114.1 9.6z" fill="#a8c7a0"/>',
  culture: '<path d="M2 3h12v8H7l-3.5 3v-3H2z" fill="#a8c7a0" stroke="#3f5e3a" stroke-linejoin="round"/><path d="M4.5 6h7M4.5 8.5h5" stroke="#3f5e3a"/>',
  build: '<path d="M3 15V5M3 5h10M3 5l4 0M13 5v4" stroke="#e9c35a" stroke-width="1.5" fill="none"/><path d="M11.5 9h3v2.5h-3z" fill="#e9c35a"/><path d="M1.5 15h4" stroke="#e9c35a" stroke-width="1.5"/><path d="M3 5L7 1.5" stroke="#e9c35a" stroke-width="1.2"/>',
  dream: '<path d="M8 1.2l2 4.6 5 .4-3.8 3.2 1.2 4.9L8 11.7l-4.4 2.6 1.2-4.9L1 6.2l5-.4z" fill="#e9c35a" stroke="#8a6a1c" stroke-linejoin="round"/>',
  event: '<path d="M8 1.5l6.8 12.5H1.2z" fill="#9aa3ad" stroke="#3a4048" stroke-linejoin="round"/><path d="M8 6v4" stroke="#1a1d22" stroke-width="1.6"/><circle cx="8" cy="12" r=".9" fill="#1a1d22"/>',
  revolt: '<path d="M8 1L9.8 5.6 14.8 5.8 10.9 8.9 12.3 13.8 8 11 3.7 13.8 5.1 8.9 1.2 5.8 6.2 5.6z" fill="#e0453a" stroke="#6b1a14" stroke-linejoin="round"/>',
  dead: '<path d="M3 7a5 5 0 0110 0v3l-1.5 1v2.5h-7V11L3 10z" fill="#d9dbe0" stroke="#4a4e55"/><circle cx="6" cy="7.6" r="1.4" fill="#2a2d32"/><circle cx="10" cy="7.6" r="1.4" fill="#2a2d32"/><path d="M7 13.5v-1.5M9 13.5v-1.5" stroke="#4a4e55"/>',
  occupied: '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#c96b5f"/><path d="M1.5 9L9 1.5M1.5 14.5L14.5 1.5M7 14.5L14.5 7" stroke="#5e221c" stroke-width="1.6"/>',
  save: '<path d="M2.5 6.5h11v7.5h-11z" fill="#b08a4a" stroke="#5c4320"/><path d="M2 6.5L8 2l6 4.5" fill="#c9a45c" stroke="#5c4320" stroke-linejoin="round"/><circle cx="8" cy="10" r="1.6" fill="#e9c35a" stroke="#5c4320" stroke-width=".8"/>',
  sea: '<path d="M1 6c2-2 3.5-2 5 0s3 2 5 0 3.5-2 4 0M1 11c2-2 3.5-2 5 0s3 2 5 0 3.5-2 4 0" stroke="#6fa8dc" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  waste: '<path d="M4 4h8l-1 10.5H5z" fill="#c9a45c" stroke="#5c4320" stroke-linejoin="round"/><path d="M3 4h10M6.5 2h3" stroke="#5c4320" stroke-width="1.3"/>',
  ruin: '<path d="M1.5 14V9l3.5-2v2l2-1.2L8.5 12l2-4.5 1 1.5V3h2.5v11z" fill="#8a8f99" stroke="#3a4048" stroke-linejoin="round"/><path d="M9 3l1.5 2-2 1.5" stroke="#e0453a" stroke-width="1.2" fill="none"/>',
};
const IC_NAME = { gold: 'Gold', income: 'Income', upkeep: 'Army upkeep', army: 'Army', factory: 'Factories', pop: 'People', unrest: 'Unrest', province: 'Provinces',
  fort: 'Fortress', trade: 'Sea trade', reform: 'Reforms', ally: 'Alliance', rival: 'Threat', war: 'War', peace: 'Peace', ruler: 'Ruler', patience: 'Patience',
  risk: 'Risk', judgment: 'Judgment', score: 'Score (gold a year)', settle: 'Integration', culture: 'Nationality', build: 'Construction', dream: 'National dream',
  event: 'Event', revolt: 'Uprising', dead: 'Dead', occupied: 'Occupied', save: 'Savings', sea: 'Sea crossing', waste: 'Court extravagance', ruin: 'Ruin' };
// every panel icon names itself on hover
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 16 16" role="img" aria-label="${IC_NAME[name] || name}"><title>${IC_NAME[name] || name}</title>${IC[name] || IC.event}</svg>`;
const TYPE_IC = { war: 'war', peace: 'peace', diplo: 'ally', revolt: 'revolt', unify: 'dream', ruler: 'ruler', event: 'event', econ: 'factory' };
const OPT_IC = { save: 'save', factory: 'factory', army: 'army', demob: 'pop', fort: 'fort', reform: 'reform', court: 'ally', ally: 'ally', annex: 'dream', war: 'war' };
// sprinkle icons into chronicle text: numbers of gold, soldiers, fortresses, factories
const decorate = h => h
  .replace(/(\d[\d,]*) gold/g, (m, n) => `${ic('gold')}${n} gold`)
  .replace(/(\d[\d,]*)k soldiers/g, (m, n) => `${ic('army')}${n}k soldiers`)
  .replace(/\bfortress\b/g, `${ic('fort')}fortress`)
  .replace(/\b(factory|factories)\b/g, m => `${ic('factory')}${m}`);
