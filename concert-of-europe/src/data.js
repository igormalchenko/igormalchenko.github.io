// ===================== SIMULATION CORE =====================
// Zero-player grand strategy sim, 1836 onwards. Pure logic, no DOM.

const REGIONS = [
  // id, name, lon, lat, owner, culture, pop(millions), industry
  ['sco','Scotland',-4.0,56.6,'GBR','Scottish',2.6,2],
  ['nth','Northern England',-1.6,54.0,'GBR','English',6,3],
  ['lon','London',-0.6,51.6,'GBR','English',8,3],
  ['ire','Ireland',-8.0,53.2,'GBR','Irish',8,0],
  ['par','Paris',2.3,48.9,'FRA','French',7,2],
  ['bri','Brittany',-2.9,48.0,'FRA','French',4,1],
  ['aqu','Aquitaine',-0.3,44.6,'FRA','French',5,1],
  ['lan','Languedoc',2.6,43.9,'FRA','French',4,1],
  ['pro','Provence',5.9,43.8,'FRA','French',3,1],
  ['lyo','Lyonnais',4.6,46.1,'FRA','French',5,1],
  ['lor','Lorraine',5.7,49.0,'FRA','French',3,2],
  ['als','Alsace',7.6,48.3,'FRA','German',1.2,2],
  ['cas','Castile',-3.7,40.4,'SPA','Spanish',5,0],
  ['cat','Catalonia',1.4,41.8,'SPA','Spanish',2,1],
  ['and','Andalusia',-4.8,37.5,'SPA','Spanish',3.5,0],
  ['gal','Galicia',-7.8,42.7,'SPA','Spanish',2,0],
  ['por','Portugal',-8.6,39.5,'POR','Portuguese',3.5,0],
  ['hol','Holland',5.0,52.4,'NET','Dutch',2.6,2],
  ['bel','Flanders',4.3,50.7,'BEL','Belgian',4,2],
  ['jut','Jutland',9.4,56.2,'DEN','Danish',1.4,1],
  ['sch','Schleswig-Holstein',9.8,54.2,'DEN','German',0.8,1],
  ['sve','Svealand',17.5,59.6,'SWE','Swedish',1.6,1],
  ['got','Götaland',13.6,57.2,'SWE','Swedish',1.4,1],
  ['nor','Norway',9.5,60.8,'SWE','Norwegian',1.2,0],
  ['bra','Brandenburg',13.4,52.4,'PRU','German',2.5,2],
  ['pom','Pomerania',15.0,53.9,'PRU','German',1.5,1],
  ['epr','East Prussia',20.8,54.4,'PRU','German',2,1],
  ['sil','Silesia',16.8,50.9,'PRU','German',3,2],
  ['rhi','Rhineland',6.9,50.7,'PRU','German',2.8,2],
  ['wes','Westphalia',8.0,52.0,'PRU','German',1.5,2],
  ['pos','Posen',17.4,52.6,'PRU','Polish',1.2,0],
  ['han','Hanover',10.0,52.8,'HAN','German',1.7,1],
  ['hes','Hesse',9.2,50.4,'HES','German',1.3,1],
  ['sax','Saxony',12.6,51.0,'SAX','German',1.6,2],
  ['bav','Bavaria',11.7,48.6,'BAV','German',4,1],
  ['wur','Württemberg',9.0,48.6,'WUR','German',1.6,1],
  ['swi','Switzerland',8.0,46.8,'SWI','Swiss',2.2,1],
  ['vie','Austria',15.8,47.9,'AUS','German',4,1],
  ['tyr','Tyrol',11.6,47.1,'AUS','German',1,0],
  ['boh','Bohemia',14.5,49.9,'AUS','Czech',4,1],
  ['hun','Hungary',19.4,47.3,'AUS','Hungarian',9,0],
  ['gli','Lemberg',22.6,49.9,'AUS','Polish',4.5,0],
  ['lom','Lombardy',9.6,45.4,'AUS','Italian',2.5,1],
  ['ven','Venetia',12.2,45.7,'AUS','Italian',2,1],
  ['cro','Croatia',16.0,45.4,'AUS','Croat',1.5,0],
  ['trn','Transylvania',24.0,46.6,'AUS','Romanian',2,0],
  ['pie','Piedmont',7.6,44.8,'SAR','Italian',3.5,1],
  ['tus','Tuscany',11.2,43.5,'TUS','Italian',1.6,1],
  ['rom','Papal States',12.8,42.3,'PAP','Italian',2.8,0],
  ['nap','Naples',15.2,40.8,'SIC','Italian',5,0],
  ['sic','Sicily',14.2,37.5,'SIC','Italian',2,0],
  ['spb','St Petersburg',30.3,59.6,'RUS','Russian',3,1],
  ['vol','Vologda',37.5,60.6,'RUS','Russian',2,0],
  ['mos','Moscow',37.5,55.8,'RUS','Russian',8,0],
  ['vlg','Volga',41.5,52.5,'RUS','Russian',6,0],
  ['blr','Belarus',28.0,53.5,'RUS','Russian',3,0],
  ['kie','Ukraine',30.8,50.4,'RUS','Ukrainian',8,0],
  ['don','Don',39.5,47.8,'RUS','Russian',3,0],
  ['cau','Caucasus',41.5,44.0,'RUS','Russian',2,0],
  ['cri','Crimea',34.0,45.2,'RUS','Russian',1,0],
  ['bes','Bessarabia',29.0,47.2,'RUS','Romanian',0.8,0],
  ['pol','Poland',21.0,52.3,'RUS','Polish',4,0],
  ['lit','Lithuania',24.0,55.0,'RUS','Lithuanian',3,0],
  ['liv','Livonia',25.5,57.8,'RUS','Baltic',1.6,0],
  ['fin','Finland',25.0,61.6,'RUS','Finnish',1.4,0],
  ['con','Constantinople',28.9,41.1,'TUR','Turkish',3,0],
  ['ana','Anatolia',32.5,39.2,'TUR','Turkish',8,0],
  ['bul','Bulgaria',25.2,42.8,'TUR','Bulgarian',3,0],
  ['wal','Wallachia',25.6,44.6,'TUR','Romanian',2.4,0],
  ['mol','Moldavia',27.0,46.8,'TUR','Romanian',1.4,0],
  ['bos','Bosnia',17.9,44.1,'TUR','Bosniak',1.2,0],
  ['mac','Macedonia',22.0,41.4,'TUR','Bulgarian',1.5,0],
  ['alb','Albania',20.0,41.0,'TUR','Albanian',1,0],
  ['the','Thessaly',22.2,39.6,'TUR','Greek',1,0],
  ['ath','Greece',22.6,37.9,'GRE','Greek',0.8,0],
  ['ser','Serbia',20.9,44.0,'SER','Serb',0.8,0],
];

// Sea anchor points shape the coastline of the Voronoi map.
const SEA = [
  [-11,59],[-11,54],[-11,49],[-11,44],[-11,39],[-11,35],[-6,46],[-5.5,44.3],[-6.6,50.6],[-1.6,50.1],
  [-5.0,53.4],[-6.6,55.7],[-8,57.5],[-4,59.5],[1,59.5],[2.5,53.4],[3,56.5],[6.4,55.0],[0,57.5],[1.5,61.8],[-2,62],
  [8.6,57.9],[11.8,55.9],[15.6,55.4],[18.5,56.8],[20.5,58.6],[19.8,60.9],[21.5,62.6],
  [-2,36.1],[3,39.2],[4.5,42.3],[8.4,40.4],[8.5,42.8],[11.5,39.5],[10,36.4],[16.5,35.6],[18.6,38.6],[20.5,35.6],
  [14.5,43.3],[17.3,42.2],[13.1,44.6],[25.2,38.6],[26.5,36.4],[24.5,35.6],[29,35.6],[34,35.6],[37.5,36.4],
  [30.8,43.2],[34.5,43.0],[38.5,43.6],[32,45.4],[36.2,45.6],[0.5,36.3],[6,36.5]
];

const NAVAL = [['lon','par'],['lon','hol'],['lon','bel'],['ire','nth'],['ire','sco'],['jut','got'],
  ['fin','sve'],['sic','nap'],['con','ana'],['cri','kie'],['spb','fin']];

const COUNTRIES = {
  GBR:{name:'Great Britain',adj:'British',pre:'Anglo',color:'#b8524a',culture:'English',acc:['Scottish'],p:[0.45,0.95,0.6,1.0],army:30,col:6,coastal:1},
  FRA:{name:'France',adj:'French',pre:'Franco',color:'#4f72a8',culture:'French',p:[0.6,0.6,0.55,0.7],army:60,col:2,coastal:1},
  PRU:{name:'Prussia',adj:'Prussian',pre:'Prusso',color:'#5e6573',culture:'German',p:[0.85,0.8,0.5,0.15],army:50,unifier:1,coastal:1},
  AUS:{name:'Austria',adj:'Austrian',pre:'Austro',color:'#cdb36a',culture:'German',p:[0.45,0.45,0.7,0.05],army:60,unifier:1},
  RUS:{name:'Russia',adj:'Russian',pre:'Russo',color:'#6b8a4f',culture:'Russian',p:[0.7,0.3,0.4,0.25],army:90,coastal:1},
  TUR:{name:'Ottoman Empire',adj:'Ottoman',pre:'Turco',color:'#4b8b84',culture:'Turkish',acc:['Bosniak'],p:[0.35,0.2,0.45,0],army:50,coastal:1},
  SPA:{name:'Spain',adj:'Spanish',pre:'Hispano',color:'#d4a043',culture:'Spanish',p:[0.3,0.3,0.4,0.4],army:25,col:3,coastal:1},
  POR:{name:'Portugal',adj:'Portuguese',pre:'Luso',color:'#8aa86a',culture:'Portuguese',p:[0.2,0.3,0.5,0.5],army:8,col:3,coastal:1},
  NET:{name:'Netherlands',adj:'Dutch',pre:'Dutch',color:'#de8a3e',culture:'Dutch',p:[0.25,0.7,0.6,0.6],army:10,col:3,coastal:1},
  BEL:{name:'Belgium',adj:'Belgian',pre:'Belgo',color:'#a38c55',culture:'Belgian',p:[0.15,0.85,0.5,0.4],army:8,coastal:1},
  DEN:{name:'Denmark',adj:'Danish',pre:'Dano',color:'#b06a62',culture:'Danish',p:[0.3,0.5,0.5,0.2],army:10,coastal:1},
  SWE:{name:'Sweden',adj:'Swedish',pre:'Swedo',color:'#6d9fc8',culture:'Swedish',acc:['Norwegian'],p:[0.3,0.55,0.5,0.1],army:15,coastal:1},
  HAN:{name:'Hanover',adj:'Hanoverian',color:'#c3b05b',culture:'German',p:[0.2,0.5,0.5,0],army:8},
  HES:{name:'Hesse',adj:'Hessian',color:'#9d82a8',culture:'German',p:[0.2,0.5,0.5,0],army:5},
  SAX:{name:'Saxony',adj:'Saxon',color:'#7d9a8b',culture:'German',p:[0.2,0.6,0.5,0],army:8},
  BAV:{name:'Bavaria',adj:'Bavarian',color:'#8eb2d6',culture:'German',p:[0.3,0.5,0.5,0],army:15},
  WUR:{name:'Württemberg',adj:'Württemberg',color:'#c69a6e',culture:'German',p:[0.2,0.5,0.5,0],army:7},
  SWI:{name:'Switzerland',adj:'Swiss',color:'#a4465c',culture:'Swiss',p:[0.05,0.6,0.3,0],army:6},
  SAR:{name:'Sardinia',adj:'Sardinian',pre:'Sardo',color:'#9fbd6c',culture:'Italian',p:[0.75,0.5,0.6,0.1],army:20,unifier:1,coastal:1},
  TUS:{name:'Tuscany',adj:'Tuscan',color:'#b6a06b',culture:'Italian',p:[0.1,0.4,0.5,0],army:4},
  PAP:{name:'Papal States',adj:'Papal',color:'#ece1bb',culture:'Italian',p:[0.05,0.2,0.5,0],army:5,noAnnex:1},
  SIC:{name:'Two Sicilies',adj:'Neapolitan',color:'#c58b8b',culture:'Italian',p:[0.35,0.25,0.5,0],army:20,unifier:1,coastal:1},
  GRE:{name:'Greece',adj:'Greek',pre:'Greco',color:'#6ea4c8',culture:'Greek',p:[0.6,0.3,0.4,0],army:6,coastal:1,programme:['the','mac','con']},
  SER:{name:'Serbia',adj:'Serbian',pre:'Serbo',color:'#a35d5d',culture:'Serb',p:[0.65,0.25,0.4,0],army:6,programme:['bos']},
};

// Nations that can appear through independence movements
const TEMPLATES = {
  Polish:{tag:'POL',name:'Poland',adj:'Polish',pre:'Polono',color:'#c45a6c',programme:['pos','gli','lit']},
  Hungarian:{tag:'HUN',name:'Hungary',adj:'Hungarian',pre:'Magyar',color:'#a07d50',programme:['trn','cro']},
  Romanian:{tag:'ROM',name:'Romania',adj:'Romanian',pre:'Romano',color:'#d6b84c',programme:['bes','trn','wal','mol']},
  Bulgarian:{tag:'BUL',name:'Bulgaria',adj:'Bulgarian',pre:'Bulgaro',color:'#7e9b58',programme:['mac','the']},
  Irish:{tag:'IRE',name:'Ireland',adj:'Irish',pre:'Hiberno',color:'#5aa46d'},
  Norwegian:{tag:'NOR',name:'Norway',adj:'Norwegian',pre:'Norwego',color:'#b46a6a'},
  Finnish:{tag:'FIN',name:'Finland',adj:'Finnish',pre:'Finno',color:'#c9d6de'},
  Czech:{tag:'CZE',name:'Bohemia',adj:'Bohemian',pre:'Czecho',color:'#8b6fa1'},
  Croat:{tag:'CRO',name:'Croatia',adj:'Croatian',pre:'Croato',color:'#c47e68'},
  Lithuanian:{tag:'LIT',name:'Lithuania',adj:'Lithuanian',pre:'Lithuano',color:'#c8a55a',programme:['blr','pol']},
  Ukrainian:{tag:'UKR',name:'Ukraine',adj:'Ukrainian',pre:'Ukraino',color:'#2f86e6',programme:['cri','bes','gli']},
  Baltic:{tag:'BAL',name:'Baltic Republic',adj:'Baltic',pre:'Balto',color:'#9bb0a0'},
  Albanian:{tag:'ALB',name:'Albania',adj:'Albanian',pre:'Albano',color:'#9f515b'},
  Bosniak:{tag:'BOS',name:'Bosnia',adj:'Bosnian',pre:'Bosno',color:'#8b916b'},
  Greek:{tag:'GRE',name:'Greece',adj:'Greek',pre:'Greco',color:'#6ea4c8'},
  Serb:{tag:'SER',name:'Serbia',adj:'Serbian',pre:'Serbo',color:'#a35d5d'},
  Italian:{tag:'ITA',name:'Italian Republic',adj:'Italian',pre:'Italo',color:'#9fbd6c'},
  Belgian:{tag:'BEL',name:'Belgium',adj:'Belgian',pre:'Belgo',color:'#a38c55'},
  Danish:{tag:'DEN',name:'Denmark',adj:'Danish',pre:'Dano',color:'#b06a62'},
  Dutch:{tag:'NET',name:'Netherlands',adj:'Dutch',pre:'Dutch',color:'#de8a3e'},
  Portuguese:{tag:'POR',name:'Portugal',adj:'Portuguese',pre:'Luso',color:'#8aa86a'},
  Scottish:{tag:'SCO',name:'Scotland',adj:'Scottish',pre:'Scoto',color:'#6d7fb0'},
};


function proj(lon, lat){ return [(lon + 10.5) * 18.7, (62.5 - lat) * 25.5]; }
const MAP_W = 1000, MAP_H = 720;

function buildGeometry(Delaunay){
  const pts = [], kinds = [];
  REGIONS.forEach(r => { pts.push(proj(r[2], r[3])); kinds.push('land'); });
  SEA.forEach(s => { pts.push(proj(s[0], s[1])); kinds.push('sea'); });
  const del = Delaunay.from(pts);
  const vor = del.voronoi([0, 0, MAP_W, MAP_H]);
  const n = REGIONS.length;
  const cells = pts.map((_, i) => vor.cellPolygon(i));
  const neighbors = REGIONS.map(() => new Set());
  const edges = [];
  const key = p => Math.round(p[0] * 10) + ',' + Math.round(p[1] * 10);
  for (let i = 0; i < n; i++) {
    for (const j of del.neighbors(i)) {
      if (j <= i || j >= n) continue;
      // shared edge = common vertices of both polygons
      const a = cells[i], b = cells[j];
      if (!a || !b) continue;
      const bk = new Set(b.map(key));
      const common = [];
      const seen = new Set();
      for (const p of a) { const k = key(p); if (bk.has(k) && !seen.has(k)) { seen.add(k); common.push(p); } }
      if (common.length >= 2) {
        neighbors[i].add(j); neighbors[j].add(i);
        edges.push({ a: i, b: j, p: common.slice(0, 2) });
      }
    }
  }
  const idx = {}; REGIONS.forEach((r, i) => idx[r[0]] = i);
  const naval = [];
  NAVAL.forEach(([a, b]) => { const i = idx[a], j = idx[b];
    if (!neighbors[i].has(j)) { neighbors[i].add(j); neighbors[j].add(i); naval.push([i, j]); } });
  return { pts, kinds, cells, neighbors: neighbors.map(s => [...s]), edges, naval, n, del };
}

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

