// Generates map/geo.json: Voronoi provinces with irregular borders, clipped to the real coastline,
// plus land adjacency, coastlines and sea crossings. Prints an audit table. Run: npm run map
// Precompute province shapes: Voronoi cells with irregular shared borders, clipped to the real coastline.
const fs = require('fs');
const topo = require('topojson-client');
const pc = require('polygon-clipping');
const { Delaunay } = require('d3-delaunay');
const vm = require('vm');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/../src/data.js', 'utf8') + '\nthis.REGIONS=REGIONS;this.SEA=SEA;this.NAVAL=NAVAL;this.proj=proj;this.MAP_W=MAP_W;this.MAP_H=MAP_H;', ctx);
const { REGIONS, SEA, NAVAL, proj, MAP_W, MAP_H } = ctx;

// ---- land ----
const land = topo.feature(require('world-atlas/land-50m.json'), require('world-atlas/land-50m.json').objects.land);
const bboxLL = [[[-12, 33.5], [44, 33.5], [44, 63.5], [-12, 63.5], [-12, 33.5]]];
let landLL = pc.intersection(...(land.features || [land]).map(f => f.geometry.coordinates), bboxLL);
// project and thin points
function thin(ring, tol){ const out = [ring[0]]; for (let i = 1; i < ring.length; i++) { const p = ring[i], q = out[out.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= tol || i === ring.length - 1) out.push(p); } return out; }
// Africa is a separate landmass inside the frame. The Levant and Mesopotamia stay in and join Anatolia (see below).
landLL = landLL.filter(poly => { const r = poly[0]; const cy = r.reduce((s, p) => s + p[1], 0) / r.length, cx = r.reduce((s, p) => s + p[0], 0) / r.length; return !(cy < 37.6 && cx < 12 && r.length > 50) && !(cy < 37.5 && cx < 11.5 && cx > -12 && cy < 37); });
const fullLandLL = pc.intersection(...(land.features || [land]).map(f => f.geometry.coordinates), bboxLL);
let landXY = landLL.map(poly => poly.map(ring => thin(ring.map(([lo, la]) => proj(lo, la)), 1.1))).filter(poly => poly[0].length >= 4);
// drop specks
const ringArea = r => { let a = 0; for (let i = 0, n = r.length; i < n; i++) { const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % n]; a += x1 * y2 - x2 * y1; } return Math.abs(a / 2); };
landXY = landXY.filter(poly => ringArea(poly[0]) > 6);
console.error('land polys', landXY.length, 'pts', landXY.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0));

// ---- voronoi ----
const pts = [];
REGIONS.forEach(r => pts.push(proj(r[2], r[3])));
const n = REGIONS.length;
const del = Delaunay.from(pts);
const vor = del.voronoi([0, 0, MAP_W, MAP_H]);

// deterministic noise
function hash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
const key = p => Math.round(p[0] * 10) + ',' + Math.round(p[1] * 10);
const onFrame = (p, q) => (Math.abs(p[0] - q[0]) < .01 && (p[0] < .01 || p[0] > MAP_W - .01)) || (Math.abs(p[1] - q[1]) < .01 && (p[1] < .01 || p[1] > MAP_H - .01));
const edgeCache = {};
function noisyEdge(p, q){
  const kp = key(p), kq = key(q);
  const fwd = kp < kq; const a = fwd ? p : q, b = fwd ? q : p;
  const k = (fwd ? kp + '|' + kq : kq + '|' + kp);
  if (!edgeCache[k]) {
    let seg = [a, b];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let amp = Math.min(14, len * 0.16);
    for (let depth = 0; depth < 4; depth++) {
      const nxt = [seg[0]];
      for (let i = 0; i < seg.length - 1; i++) {
        const u = seg[i], v = seg[i + 1];
        const mx = (u[0] + v[0]) / 2, my = (u[1] + v[1]) / 2;
        const dx = v[0] - u[0], dy = v[1] - u[1], L = Math.hypot(dx, dy) || 1;
        const off = (hash(k + ':' + depth + ':' + i) - 0.5) * 2 * amp;
        nxt.push([mx - dy / L * off, my + dx / L * off], v);
      }
      seg = nxt; amp *= 0.5;
    }
    edgeCache[k] = seg;
  }
  const s = edgeCache[k];
  return fwd ? s : s.slice().reverse();
}
function noisyCell(i){
  const poly = vor.cellPolygon(i); if (!poly) return null;
  const out = [];
  for (let j = 0; j < poly.length - 1; j++) {
    const p = poly[j], q = poly[j + 1];
    if (onFrame(p, q)) { out.push(p); continue; }
    const e = noisyEdge(p, q); e.slice(0, -1).forEach(x => out.push(x));
  }
  out.push(out[0]);
  return out;
}

// ---- clip provinces to land ----
const r1 = v => Math.round(v * 10) / 10;
const pathOf = mp => mp.map(poly => poly.map(ring => 'M' + ring.slice(0, -1).map(p => r1(p[0]) + ',' + r1(p[1])).join('L') + 'Z').join('')).join('');
const regions = [];
const cellsNoisy = [];
for (let i = 0; i < n; i++) {
  const cell = noisyCell(i); cellsNoisy.push(cell);
  let mp = pc.intersection([cell], landXY);
  mp = mp.filter(poly => ringArea(poly[0]) > 3);
  if (!mp.length) { console.error('EMPTY', REGIONS[i][1]); }
  const area = mp.reduce((s, poly) => s + ringArea(poly[0]), 0);
  // anchor: seed if on land, else centroid of the largest piece
  const inside = (pt, poly) => { let c = false; const r = poly[0]; for (let a = 0, b = r.length - 1; a < r.length; b = a++) { const [xi, yi] = r[a], [xj, yj] = r[b]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  let anchor = pts[i];
  if (!mp.some(poly => inside(anchor, poly))) {
    const big = mp.slice().sort((a, b) => ringArea(b[0]) - ringArea(a[0]))[0];
    let cx = 0, cy = 0, A = 0; const r = big[0];
    for (let a = 0; a < r.length - 1; a++) { const [x1, y1] = r[a], [x2, y2] = r[a + 1]; const f = x1 * y2 - x2 * y1; cx += (x1 + x2) * f; cy += (y1 + y2) * f; A += f; }
    anchor = [cx / (3 * A), cy / (3 * A)];
  }
  // label point: area-weighted centroid of pieces
  regions.push({ d: pathOf(mp), ax: r1(anchor[0]), ay: r1(anchor[1]), area: Math.round(area), mp });
}

// ---- the Ottoman south: land south of the Caucasus goes to Anatolia, along a ragged line rather than a straight cut ----
let cutLine;
{
  const ia = REGIONS.findIndex(r => r[0] === 'ana'), ic = REGIONS.findIndex(r => r[0] === 'cau');
  const yCut = proj(0, 36.9)[1];
  cutLine = noisyEdge([930, yCut], [MAP_W + 5, yCut + 3]);
  const south = [[...cutLine, [MAP_W + 5, MAP_H + 5], [930, MAP_H + 5], [930, yCut]]];
  const piece = pc.intersection(regions[ic].mp, south).filter(poly => ringArea(poly[0]) > 3);
  regions[ic].mp = pc.difference(regions[ic].mp, south).filter(poly => ringArea(poly[0]) > 3);
  regions[ia].mp = pc.union(regions[ia].mp, ...piece);
  [ia, ic].forEach(i => { const r = regions[i]; r.d = pathOf(r.mp); r.area = Math.round(r.mp.reduce((s, poly) => s + ringArea(poly[0]), 0)); });
}

// ---- clean-up: detached pieces go to the province they touch; islands stay whole ----
{
  const vk = p => Math.round(p[0] * 20) + ',' + Math.round(p[1] * 20);
  const pieces = []; // {prov, poly, area, main}
  regions.forEach((r, i) => { const sorted = r.mp.slice().sort((a, b) => ringArea(b[0]) - ringArea(a[0])); sorted.forEach((poly, k) => pieces.push({ prov: i, poly, area: ringArea(poly[0]), main: k === 0, keys: new Set(poly[0].map(vk)) })); });
  const touch = (a, b) => { let n = 0; for (const k of a.keys) if (b.keys.has(k) && ++n >= 2) return true; return false; };
  // 1) secondary piece touching another province's main piece
  pieces.filter(p => !p.main).forEach(p => {
    const host = pieces.find(q => q.main && q.prov !== p.prov && touch(p, q));
    if (host) p.prov = host.prov, p.moved = true;
  });
  // 2) remaining secondary pieces: group touching ones into islands, give each island to its largest contributor
  const rest = pieces.filter(p => !p.main && !p.moved);
  const seen = new Set();
  rest.forEach(p => { if (seen.has(p)) return;
    const group = [p]; seen.add(p);
    for (let k = 0; k < group.length; k++) rest.forEach(q => { if (!seen.has(q) && touch(group[k], q)) { seen.add(q); group.push(q); } });
    if (group.length > 1) { const by = {}; group.forEach(g => by[g.prov] = (by[g.prov] || 0) + g.area); const best = +Object.entries(by).sort((a, b) => b[1] - a[1])[0][0]; group.forEach(g => g.prov = best); }
  });
  regions.forEach((r, i) => { const mine = pieces.filter(p => p.prov === i).map(p => p.poly); r.mp = mine.length > 1 ? pc.union(...mine.map(m => [m])) : mine; r.d = pathOf(r.mp); r.area = Math.round(r.mp.reduce((s, poly) => s + ringArea(poly[0]), 0)); });
}
function provAt(pt){
  for (let i = 0; i < n; i++) for (const poly of regions[i].mp) {
    let c = false; const r = poly[0];
    for (let a = 0, b = r.length - 1; a < r.length; b = a++) { const [xi, yi] = r[a], [xj, yj] = r[b]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; }
    if (c) return i;
  }
  return -1;
}
// ---- adjacency via shared borders that run over land ----
function pointOnLand(pt){
  for (const poly of landXY) {
    let c = false; const r = poly[0];
    for (let a = 0, b = r.length - 1; a < r.length; b = a++) { const [xi, yi] = r[a], [xj, yj] = r[b]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; }
    if (c) return true;
  }
  return false;
}
const nb = REGIONS.map(() => new Set());
const borders = [];
// split a line into the stretches that run over land
const landRuns = e => { const runs = []; let cur = []; e.forEach(p => { if (pointOnLand(p)) cur.push(p); else { if (cur.length > 1) runs.push(cur); cur = []; } }); if (cur.length > 1) runs.push(cur); return runs; };
// drawing: look at both sides of every segment, so a line that changes neighbours partway (or stops being a border) is cut there
function emitBorder(run){
  const sideKey = (p, q) => { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const sA = provAt([mx - dy / L * 1.2, my + dx / L * 1.2]), sB = provAt([mx + dy / L * 1.2, my - dx / L * 1.2]);
    return sA < 0 || sB < 0 || sA === sB ? null : [Math.min(sA, sB), Math.max(sA, sB)]; };
  let cur = [run[0]], ck = undefined;
  const flush = () => { if (!ck || cur.length < 2) return; const [a, b] = ck;
    borders.push({ a, b, d: 'M' + cur.map(x => r1(x[0]) + ',' + r1(x[1])).join('L') }); };
  for (let k = 0; k < run.length - 1; k++) {
    const sk = sideKey(run[k], run[k + 1]);
    if (ck !== undefined && String(sk) === String(ck)) { cur.push(run[k + 1]); continue; }
    if (ck === undefined) { cur = [run[k], run[k + 1]]; ck = sk; continue; }
    // the neighbours change somewhere between the middles of the previous and this segment: find where, to a twentieth
    const lerp = (u, v, t) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
    const pos = t => t < 1 ? lerp(run[k - 1], run[k], t) : lerp(run[k], run[k + 1], t - 1);
    let t = 0.5; while (t < 1.45 && String(sideKey(pos(t), pos(t + 0.05))) !== String(sk)) t += 0.05;
    const split = pos(t);
    if (t < 1) { cur[cur.length - 1] = split; flush(); cur = [split, run[k], run[k + 1]]; }
    else { cur.push(split); flush(); cur = [split, run[k + 1]]; }
    ck = sk;
  }
  flush();
}
for (let i = 0; i < n; i++) for (const j of del.neighbors(i)) {
  if (j <= i || j >= n) continue;
  const a = vor.cellPolygon(i), b = vor.cellPolygon(j);
  const bk = new Set(b.map(key)); const common = []; const seen = new Set();
  for (const p of a) { const k = key(p); if (bk.has(k) && !seen.has(k)) { seen.add(k); common.push(p); } }
  if (common.length < 2) continue;
  landRuns(noisyEdge(common[0], common[1])).forEach(run => {
    // adjacency: the side test at the middle of each land stretch
    if (run.length >= 3) { const m = Math.floor(run.length / 2), p = run[m], q = run[Math.min(run.length - 1, m + 1)];
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      const sA = provAt([p[0] - dy / L * 1.2, p[1] + dx / L * 1.2]), sB = provAt([p[0] + dy / L * 1.2, p[1] - dx / L * 1.2]);
      if (sA >= 0 && sB >= 0 && sA !== sB) { nb[sA].add(sB); nb[sB].add(sA); } }
    emitBorder(run);
  });
}
landRuns(cutLine).forEach(emitBorder);
const idx = {}; REGIONS.forEach((r, i) => idx[r[0]] = i);
// ---- coastline from the shapes: outline points with open sea just beside them ----
const edgeOK = p => p[0] > 4 && p[0] < MAP_W - 4 && p[1] > 4 && p[1] < MAP_H - 4;
const coastPts = regions.map(r => {
  const pts2 = [];
  r.mp.forEach(poly => { const ring = poly[0];
    for (let k = 0; k < ring.length - 1; k++) { const p = ring[k]; if (!edgeOK(p)) continue;
      const q = ring[k + 1]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      const o1 = [p[0] - dy / L * 2.5, p[1] + dx / L * 2.5], o2 = [p[0] + dy / L * 2.5, p[1] - dx / L * 2.5];
      if (!pointOnLand(o1) || !pointOnLand(o2)) pts2.push(p); } });
  return pts2;
});
const coastal = coastPts.map(p => p.length >= 4 ? 1 : 0);
// ---- sea crossings: coastal provinces facing each other across narrow water ----
const naval = [];
const linkPts = {};
const nearest = (A, B) => { let best = [Infinity, null, null]; for (let a2 = 0; a2 < A.length; a2 += 2) for (let b2 = 0; b2 < B.length; b2 += 2) { const d = Math.hypot(A[a2][0] - B[b2][0], A[a2][1] - B[b2][1]); if (d < best[0]) best = [d, A[a2], B[b2]]; } return best; };
const MAXD = 70;
const cands = [];
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
  if (!coastal[i] || !coastal[j] || nb[i].has(j)) continue;
  const [d, p, q] = nearest(coastPts[i], coastPts[j]);
  if (d > MAXD) continue;
  // the straight crossing should run mostly over water
  let dry = 0; for (let k = 1; k < 20; k++) { const t = k / 20; if (pointOnLand([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])) dry++; }
  if (dry > 1) continue;   // the crossing must stay over water
  // skip if the two are already two land steps apart
  if ([...nb[i]].some(k => nb[k].has(j))) continue;
  cands.push({ i, j, d, p, q });
}
// keep the shortest few per province so the map isn't a cobweb
cands.sort((a, b) => a.d - b.d);
const per = {};
const mids = [];
cands.forEach(c => { if ((per[c.i] || 0) >= 3 || (per[c.j] || 0) >= 3) return;
  const mid = [(c.p[0] + c.q[0]) / 2, (c.p[1] + c.q[1]) / 2]; if (mids.some(m => Math.hypot(m[0] - mid[0], m[1] - mid[1]) < 30)) return; mids.push(mid); per[c.i] = (per[c.i] || 0) + 1; per[c.j] = (per[c.j] || 0) + 1;
  nb[c.i].add(c.j); nb[c.j].add(c.i); naval.push([c.i, c.j]); linkPts[c.i + '-' + c.j] = [c.p.map(r1), c.q.map(r1)]; });
// hand corrections from the audit
[['con', 'bul'], ['con', 'mac']].forEach(([x, y]) => { const i = idx[x], j = idx[y]; nb[i].add(j); nb[j].add(i);
  const k = naval.findIndex(([p, q]) => (p === i && q === j) || (p === j && q === i)); if (k >= 0) { naval.splice(k, 1); delete linkPts[i + '-' + j]; delete linkPts[j + '-' + i]; } });
[['lon', 'hol'], ['sco', 'nor'], ['nth', 'jut']].forEach(([x, y]) => { const i = idx[x], j = idx[y]; if (nb[i].has(j)) return; nb[i].add(j); nb[j].add(i);
  const [d, p, q] = nearest(coastPts[i], coastPts[j]); naval.push([i, j]); linkPts[i + '-' + j] = [p.map(r1), q.map(r1)]; });
const out = {
  W: MAP_W, H: MAP_H,
  land: pathOf(fullLandLL.map(poly => poly.map(ring => thin(ring.map(([lo, la]) => proj(lo, la)), 1.1))).filter(poly => poly[0].length >= 4)),
  regions: regions.map((r, i) => ({ d: r.d, ax: r.ax, ay: r.ay, area: r.area, nb: [...nb[i]], coast: coastal[i] })),
  borders, naval, navalPts: naval.map(([a2, b2]) => linkPts[a2 + '-' + b2]),
};
fs.writeFileSync(__dirname + '/geo.json', JSON.stringify(out));
console.error('size', JSON.stringify(out).length);
console.error('SEA LINKS (' + naval.length + '):', naval.map(([a2, b2]) => REGIONS[a2][0] + '-' + REGIONS[b2][0]).join(' '));
console.error('COASTAL:', REGIONS.filter((r, i) => coastal[i]).map(r => r[0]).join(' '));
console.error('INLAND:', REGIONS.filter((r, i) => !coastal[i]).map(r => r[0]).join(' '));
REGIONS.forEach((r, i) => console.error(r[0].padEnd(4), (coastal[i] ? 'coast ' : 'inland'), 'land:', [...nb[i]].filter(j => !naval.some(([x, y]) => (x === i && y === j) || (x === j && y === i))).map(j => REGIONS[j][0]).join(','), '| sea:', naval.filter(([x, y]) => x === i || y === i).map(([x, y]) => REGIONS[x === i ? y : x][0]).join(',')));
