// Offline generator for the site's seamlessly tileable topographic map tile (public/topo/*).
// Run: node scripts/topo-gen.mjs public/topo   (deterministic; never run in the browser)
// Heightfield: periodic Perlin fBm + ridged noise with domain warp, plus a dominant summit (where the portrait sits).
// Output: minor.svg, index.svg (index contours broken for labels, labels, spot heights), streams.svg, shade.png, meta.json.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT = process.argv[2] || 'out';
mkdirSync(OUT, { recursive: true });
const W = 1600, H = 1600, G = 4; // tile size (px) and sampling step
const NX = W / G, NY = H / G;
const S = { x: 1120, y: 470 }; // summit location in tile coords (portrait centre)
const P = JSON.parse(process.env.TOPO || '{}');
const cfg = {
  cell: 2, seed: 23, interval: 80, base: 7000, top: 13200, warp: 90, summitR: 600, summitA: 0.65, gamma: 1.0,
  oct: 7, pers: 0.47, erode: 0.6, offset: 1, gain: 2, lac: 0.5, wBase: 1, wRidge: 0.15,
  streamThr: 500, vex: 0.035, eps: 0.6, ...P,
};

// ---- periodic Perlin ----
function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry(cfg.seed);
const perm = new Uint16Array(512);
{
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}
const GR = [...Array(16)].map((_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const mod = (a, n) => ((a % n) + n) % n;
function perlin(x, y, px, py, salt) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const g = (i, j) => GR[perm[(perm[(mod(i, px) + salt) & 255] + mod(j, py)) & 255] & 15];
  const d = (i, j, dx, dy) => { const v = g(i, j); return v[0] * dx + v[1] * dy; };
  const u = fade(fx), v = fade(fy);
  const a = d(ix, iy, fx, fy), b = d(ix + 1, iy, fx - 1, fy), c = d(ix, iy + 1, fx, fy - 1), e = d(ix + 1, iy + 1, fx - 1, fy - 1);
  const top = a + u * (b - a), bot = c + u * (e - c);
  return top + v * (bot - top);
}
// fBm over the tile; base lattice 4x5 cells so every octave stays periodic.
function fbm(x, y, oct, salt, ridged = false) {
  let s = 0, amp = 1, norm = 0, cx = 4, cy = 4;
  for (let o = 0; o < oct; o++) {
    let n = perlin((x / W) * cx, (y / H) * cy, cx, cy, salt + o * 17);
    if (ridged) { n = 1 - Math.abs(n * 1.4); n = n * n; }
    s += n * amp; norm += amp; amp *= 0.5; cx *= 2; cy *= 2;
  }
  return s / norm;
}
// Musgrave ridged multifractal: each octave is weighted by the previous one, so detail gathers on the ridges
// and valleys stay smoother, like eroded mountains.
function ridgedMF(x, y, oct) {
  let sum = 0, weight = 1, cx = cfg.cell, cy = cfg.cell, amp = 1, norm = 0;
  for (let o = 0; o < oct; o++) {
    let s = cfg.offset - Math.abs(perlin((x / W) * cx, (y / H) * cy, cx, cy, 61 + o * 23) * 1.5);
    s *= s;
    s *= weight;
    weight = Math.max(0, Math.min(1, s * cfg.gain));
    sum += s * amp; norm += amp;
    amp *= cfg.lac; cx *= 2; cy *= 2;
  }
  return sum / norm;
}
// "Eroded" fBm (after Inigo Quilez): each octave is damped by the slope accumulated so far, so steep ground
// stays smooth and detail settles into valleys and ridgelines.
function erodedFbm(x, y, oct) {
  let f = 0, dx = 0, dy = 0, amp = 1, norm = 0, cx = cfg.cell, cy = cfg.cell;
  const e = 0.01;
  for (let o = 0; o < oct; o++) {
    const u = (x / W) * cx, v = (y / H) * cy, salt = 200 + o * 31;
    const n = perlin(u, v, cx, cy, salt);
    dx += (perlin(u + e, v, cx, cy, salt) - n) / e;
    dy += (perlin(u, v + e, cx, cy, salt) - n) / e;
    f += (amp * n) / (1 + cfg.erode * (dx * dx + dy * dy));
    norm += amp; amp *= cfg.pers; cx *= 2; cy *= 2;
  }
  return f / norm;
}
const wdist = (x, y) => {
  let dx = Math.abs(x - S.x), dy = Math.abs(y - S.y);
  dx = Math.min(dx, W - dx); dy = Math.min(dy, H - dy);
  return Math.hypot(dx, dy);
};

// ---- heightfield ----
const h = new Float64Array((NX + 1) * (NY + 1));
let mn = Infinity, mx = -Infinity;
for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
  const x = i * G, y = j * G;
  const wx = x + cfg.warp * fbm(x + 311, y + 97, 3, 101), wy = y + cfg.warp * fbm(x + 53, y + 701, 3, 151);
  const terrain = erodedFbm(wx, wy, cfg.oct); // massifs, ridges, spurs and drainages
  const ridge = cfg.wRidge ? ridgedMF(wx, wy, 4) : 0; // optional sharper crests
  const d = wdist(x, y);
  const t = Math.max(0, 1 - d / cfg.summitR);
  const bump = cfg.summitA * Math.pow(t, 1.5) * (0.8 + 0.6 * terrain); // a dominant peak that keeps its spurs
  const v = cfg.wBase * terrain + cfg.wRidge * ridge + bump;
  h[j * (NX + 1) + i] = v;
  if (v < mn) mn = v; if (v > mx) mx = v;
}
for (let k = 0; k < h.length; k++) { const t = (h[k] - mn) / (mx - mn); h[k] = cfg.base + Math.pow(t, cfg.gamma) * (cfg.top - cfg.base); }
const at = (i, j) => h[mod(j, NY) * (NX + 1) + mod(i, NX)];

// ---- marching squares ----
const CASES = { 1: [['L', 'B']], 2: [['B', 'R']], 3: [['L', 'R']], 4: [['T', 'R']], 5: [['L', 'T'], ['B', 'R']], 6: [['T', 'B']], 7: [['L', 'T']], 8: [['L', 'T']], 9: [['T', 'B']], 10: [['L', 'B'], ['T', 'R']], 11: [['T', 'R']], 12: [['L', 'R']], 13: [['B', 'R']], 14: [['L', 'B']] };
function contours(level) {
  const segs = [];
  const lerp = (a, b) => (level - a) / (b - a);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    const x = i * G, y = j * G;
    const E = { T: [x + lerp(a, b) * G, y], R: [x + G, y + lerp(b, c) * G], B: [x + lerp(d, c) * G, y + G], L: [x, y + lerp(a, d) * G] };
    for (const [p, q] of CASES[idx]) segs.push([E[p], E[q]]);
  }
  const key = (p) => Math.round(p[0] * 100) + ',' + Math.round(p[1] * 100);
  const adj = new Map();
  segs.forEach((s, k) => { for (const e of [0, 1]) { const kk = key(s[e]); if (!adj.has(kk)) adj.set(kk, []); adj.get(kk).push([k, e]); } });
  const used = new Uint8Array(segs.length), lines = [];
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue;
    used[k] = 1;
    const line = [segs[k][0], segs[k][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const end = dir ? line[line.length - 1] : line[0];
        const nb = (adj.get(key(end)) || []).find(([kk]) => !used[kk]);
        if (!nb) break;
        used[nb[0]] = 1;
        const p = segs[nb[0]][1 - nb[1]];
        if (dir) line.push(p); else line.unshift(p);
      }
    }
    lines.push(line);
  }
  return lines;
}
function chaikin(pts) {
  if (pts.length < 3) return pts;
  const o = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
  }
  o.push(pts[pts.length - 1]);
  return o;
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0;
  const a = pts[0], b = pts[pts.length - 1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 1e-6) {
    // Closed loop: split at the point farthest from the start and simplify each half.
    let far = 1, fd = 0;
    for (let i = 1; i < pts.length - 1; i++) { const d = Math.hypot(pts[i][0] - a[0], pts[i][1] - a[1]); if (d > fd) { fd = d; far = i; } }
    if (fd < 1e-6) return [a, b];
    return [...rdp(pts.slice(0, far + 1), eps).slice(0, -1), ...rdp(pts.slice(far), eps)];
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L;
    if (d > dmax) { dmax = d; idx = i; }
  }
  return dmax > eps ? [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)] : [a, b];
}
const len = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
// Compact relative path with half-pixel precision.
const rel = (pts) => {
  let s = '', px = 0, py = 0;
  pts.forEach((p, i) => {
    const x = Math.round(p[0] * 2) / 2, y = Math.round(p[1] * 2) / 2;
    if (!i) s += `M${x} ${y}`;
    else { const dx = Math.round((x - px) * 2) / 2, dy = Math.round((y - py) * 2) / 2; s += (i === 1 ? 'l' : dx < 0 ? '' : ' ') + dx + (dy < 0 ? '' : ' ') + dy; }
    px = x; py = y;
  });
  return s;
};

// ---- build contour sets ----
let minor = '', index = '', labels = '', total = 0;
const labelBoxes = [];
const first = Math.ceil(cfg.base / cfg.interval) * cfg.interval;
const charW = 6.6, fs = 11;
for (let lv = first; lv < cfg.top; lv += cfg.interval) {
  const isIndex = lv % (cfg.interval * 5) === 0;
  for (let line of contours(lv)) {
    line = rdp(chaikin(line), cfg.eps);
    const L = len(line);
    if (L < (isIndex ? 40 : 24)) continue;
    total += L;
    if (!isIndex) { minor += rel(line); continue; }
    const text = lv.toLocaleString('en-US'), tw = text.length * charW + 12;
    const cuts = [];
    if (L > 220) {
      let acc = 0, next = 160 + (lv % 7) * 30;
      for (let i = 1; i < line.length; i++) {
        const a = line[i - 1], b = line[i], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
        acc += sl;
        if (acc < next || acc > L - 80) continue;
        const mx2 = (a[0] + b[0]) / 2, my2 = (a[1] + b[1]) / 2;
        if (mx2 < 50 || mx2 > W - 50 || my2 < 30 || my2 > H - 30) continue;
        if (Math.hypot(mx2 - S.x, my2 - S.y) < 150) continue;
        if (labelBoxes.some(([x, y]) => Math.hypot(x - mx2, y - my2) < 170)) continue;
        const back = line[Math.max(0, i - 4)], fwd = line[Math.min(line.length - 1, i + 3)];
        let ang = (Math.atan2(fwd[1] - back[1], fwd[0] - back[0]) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        cuts.push(acc - sl / 2);
        labelBoxes.push([mx2, my2]);
        labels += `<text x="${mx2.toFixed(1)}" y="${my2.toFixed(1)}" transform="rotate(${ang.toFixed(0)} ${mx2.toFixed(1)} ${my2.toFixed(1)})">${text}</text>`;
        next = acc + 560;
      }
    }
    if (!cuts.length) { index += rel(line); continue; }
    // Break the index line where its labels sit, as on a printed quad.
    const gaps = cuts.map((c) => [c - tw / 2, c + tw / 2]);
    const inGap = (s) => gaps.some(([g0, g1]) => s > g0 && s < g1);
    let acc = 0, cur = [line[0]];
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const steps = Math.max(1, Math.ceil(sl / 3));
      for (let k = 1; k <= steps; k++) {
        const t = k / steps, s = acc + sl * t, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        if (inGap(s)) { if (cur.length > 1) index += rel(rdp(cur, cfg.eps)); cur = []; } else cur.push(p);
      }
      acc += sl;
    }
    if (cur.length > 1) index += rel(rdp(cur, cfg.eps));
  }
}

// ---- spot heights at local maxima ----
const spotList = [];
const R = 22;
for (let j = 8; j < NY - 8; j += 2) for (let i = 8; i < NX - 8; i += 2) {
  const v = at(i, j);
  let top = true;
  for (let dj = -R; dj <= R && top; dj += 2) for (let di = -R; di <= R; di += 2) if ((di || dj) && at(i + di, j + dj) > v) { top = false; break; }
  if (!top) continue;
  const x = i * G, y = j * G;
  if (Math.hypot(x - S.x, y - S.y) < 140) continue;
  if (spotList.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 200)) continue;
  spotList.push([x, y, Math.round(v)]);
}
let spots = '', spotText = '';
for (const [x, y, v] of spotList) {
  spots += `M${x - 3} ${y - 3}l6 6m0-6l-6 6`;
  spotText += `<text x="${x + 6}" y="${y - 5}">${v.toLocaleString('en-US')}</text>`;
}

// ---- streams: D8 flow accumulation on a coarse periodic grid ----
const C = 2, SX = NX / C, SY = NY / C;
const sh = (i, j) => at(i * C, j * C);
const accu = new Float64Array(SX * SY).fill(1), down = new Int32Array(SX * SY).fill(-1);
const order = [...Array(SX * SY).keys()].sort((a, b) => sh(b % SX, Math.floor(b / SX)) - sh(a % SX, Math.floor(a / SX)));
for (const k of order) {
  const i = k % SX, j = Math.floor(k / SX), v = sh(i, j);
  let best = -1, bd = 0;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    if (!di && !dj) continue;
    const ni = mod(i + di, SX), nj = mod(j + dj, SY);
    const drop = (v - sh(ni, nj)) / Math.hypot(di, dj);
    if (drop > bd) { bd = drop; best = nj * SX + ni; }
  }
  if (best >= 0) { down[k] = best; accu[best] += accu[k]; }
}
const visited = new Uint8Array(SX * SY);
let streams = '';
for (const k of order) {
  if (accu[k] < cfg.streamThr || visited[k]) continue;
  const pts = [];
  let c = k;
  while (c >= 0 && accu[c] >= cfg.streamThr) {
    const i = c % SX, j = Math.floor(c / SX), p = [i * C * G, j * C * G];
    if (pts.length && Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]) > C * G * 2) break;
    pts.push(p);
    if (visited[c]) break;
    visited[c] = 1;
    c = down[c];
  }
  if (pts.length > 4) streams += rel(rdp(chaikin(chaikin(pts)), 0.8));
}

// ---- hillshade: grey+alpha PNG at 1/8 resolution (scaled up by CSS) ----
const HS = 8, hw = W / HS, hh = H / HS;
const raw = Buffer.alloc((hw * 2 + 1) * hh);
const L0 = [-0.6, -0.6, 0.53], ln = Math.hypot(...L0), Lv = L0.map((v) => v / ln);
for (let y = 0; y < hh; y++) {
  raw[y * (hw * 2 + 1)] = 0;
  for (let x = 0; x < hw; x++) {
    const i = (x * HS) / G, j = (y * HS) / G;
    const dzdx = (at(i + 2, j) - at(i - 2, j)) / (4 * G), dzdy = (at(i, j + 2) - at(i, j - 2)) / (4 * G);
    const n = [-dzdx * cfg.vex, -dzdy * cfg.vex, 1], nl = Math.hypot(...n);
    const lit = (n[0] * Lv[0] + n[1] * Lv[1] + n[2] * Lv[2]) / nl;
    const shade = Math.max(0, Math.min(1, (Lv[2] - lit) * 2.4));
    const o = y * (hw * 2 + 1) + 1 + x * 2;
    raw[o] = 0;
    raw[o + 1] = Math.round(shade * 255);
  }
}
function png(w, hgt, data) {
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(w, 0); ih.writeUInt32BE(hgt, 4); ih[8] = 8; ih[9] = 4;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(data, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const MONO = "ui-monospace,Menlo,Consolas,'DejaVu Sans Mono',monospace";
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;
writeFileSync(`${OUT}/minor.svg`, svg(`<path fill="none" stroke="#000" stroke-width="1" d="${minor}"/>`));
writeFileSync(`${OUT}/index.svg`, svg(
  `<path fill="none" stroke="#000" stroke-width="1.6" d="${index}"/>` +
  `<g font-family="${MONO}" font-size="${fs}" text-anchor="middle" dominant-baseline="central">${labels}</g>` +
  `<path fill="none" stroke="#000" stroke-width="1.3" d="${spots}"/><g font-family="${MONO}" font-size="10">${spotText}</g>`));
writeFileSync(`${OUT}/streams.svg`, svg(`<path fill="none" stroke="#000" stroke-width="1.2" stroke-dasharray="8 3 1.5 3" stroke-linecap="round" d="${streams}"/>`));
writeFileSync(`${OUT}/shade.png`, png(hw, hh, raw));
const meta = { W, H, summit: S, total: Math.round(total), labels: labelBoxes.length, spots: spotList.length, cfg };
writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta));
