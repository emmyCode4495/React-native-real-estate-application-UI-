// Procedural illustrations for listings, the welcome hero and the splash skyline.
// Everything here is plain SVG strings (no React Native imports), so the same code can be
// previewed on a laptop (scripts/preview-art.ts) and rendered with react-native-svg's SvgXml.

export type Tod = 'day' | 'dusk' | 'night';
export type Kind = 'villa' | 'townhouse' | 'tower' | 'cottage' | 'loft' | 'interior';

export type Scene = { sky: string; hills: string; house: string; lights: string; fore: string; all: string };

const W = 400;
const H = 300;
const GROUND = 236;

type Pal = {
  sky: [string, string, string];
  sun: string;
  sunPos: [number, number];
  sunR: number;
  hills: [string, string];
  ground: [string, string];
  glass: string;
  glassHi: string;
  dark: string;
  lit: number;
  roof: string;
  tree: [string, string];
  trunk: string;
  water: string;
  dim: number; // how far building colors are pulled toward night
};

const PAL: Record<Tod, Pal> = {
  day: { sky: ['#7FC4E8', '#CBE9F0', '#FCEBD0'], sun: '#FFF3C4', sunPos: [310, 62], sunR: 24, hills: ['#BCD6AE', '#A3C795'], ground: ['#9CC58B', '#86B07A'], glass: '#BFE0EC', glassHi: '#EAF7FB', dark: '#9DB7C2', lit: 0, roof: '#2E3B37', tree: ['#5E9A6B', '#4A8559'], trunk: '#6B5444', water: '#6EC1D6', dim: 0 },
  dusk: { sky: ['#4C5E9C', '#D9889A', '#F8C38C'], sun: '#FFD8A8', sunPos: [292, 176], sunR: 30, hills: ['#8E9FA0', '#728D84'], ground: ['#7F9C74', '#6A8863'], glass: '#F7B878', glassHi: '#FFE2B8', dark: '#4A5878', lit: 0.65, roof: '#2A2F3D', tree: ['#46705A', '#38604B'], trunk: '#4F3E3A', water: '#5BA0B8', dim: 0.2 },
  night: { sky: ['#0B1830', '#1B3157', '#3B5887'], sun: '#F5F2E4', sunPos: [320, 58], sunR: 13, hills: ['#25413F', '#1C3434'], ground: ['#2A4540', '#203832'], glass: '#FFD58A', glassHi: '#FFF0C8', dark: '#26364D', lit: 0.9, roof: '#151C26', tree: ['#1F4A3F', '#183B33'], trunk: '#2A2422', water: '#2B6C86', dim: 0.58 },
};

function rngFor(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => Math.round(v * 10) / 10;

function hexToRgb(h: string) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
// pull a color toward the night navy
function tone(hex: string, p: Pal) {
  if (p.dim === 0) return hex;
  const [r, g, b] = hexToRgb(hex);
  const [nr, ng, nb] = [14, 22, 44];
  const m = (a: number, z: number) => Math.round(a + (z - a) * p.dim);
  return `#${[m(r, nr), m(g, ng), m(b, nb)].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

type Win = { x: number; y: number; w: number; h: number; lit: boolean; arch?: boolean };

function makeWin(rng: () => number, p: Pal, x: number, y: number, w: number, h: number, arch = false): Win {
  return { x, y, w, h, lit: rng() < p.lit, arch };
}

function winSvg(win: Win, p: Pal, tod: Tod) {
  const { x, y, w, h, lit, arch } = win;
  const fill = tod === 'day' ? p.glass : lit ? p.glass : p.dark;
  const shape = arch
    ? `<path d="M${n(x)} ${n(y + h)} V${n(y + w / 2)} A${n(w / 2)} ${n(w / 2)} 0 0 1 ${n(x + w)} ${n(y + w / 2)} V${n(y + h)} Z" fill="${fill}"/>`
    : `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="1.6" fill="${fill}"/>`;
  const shine =
    tod === 'day'
      ? `<path d="M${n(x)} ${n(y)} L${n(x + w * 0.6)} ${n(y)} L${n(x)} ${n(y + h * 0.75)} Z" fill="#fff" opacity=".4"/>`
      : lit
        ? `<rect x="${n(x + w * 0.12)}" y="${n(y + h * 0.12)}" width="${n(w * 0.76)}" height="${n(h * 0.5)}" rx="1" fill="${p.glassHi}" opacity=".55"/>`
        : `<path d="M${n(x)} ${n(y)} L${n(x + w * 0.5)} ${n(y)} L${n(x)} ${n(y + h * 0.6)} Z" fill="#9FB4D6" opacity=".16"/>`;
  return shape + shine;
}

function haloSvg(wins: Win[], tod: Tod) {
  if (tod === 'day') return '';
  return wins
    .filter((w) => w.lit)
    .map((w) => `<circle cx="${n(w.x + w.w / 2)}" cy="${n(w.y + w.h / 2)}" r="${n(Math.max(w.w, w.h) * 1.5)}" fill="url(#gHalo)"/>`)
    .join('');
}

function wrap(inner: string, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
}

function inner(svg: string) {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

function tree(cx: number, base: number, r: number, p: Pal) {
  return `<rect x="${n(cx - r * 0.1)}" y="${n(base - r * 1.1)}" width="${n(r * 0.2)}" height="${n(r * 1.1)}" fill="${p.trunk}"/>
<circle cx="${n(cx)}" cy="${n(base - r * 1.5)}" r="${n(r)}" fill="${p.tree[0]}"/>
<circle cx="${n(cx - r * 0.45)}" cy="${n(base - r * 1.2)}" r="${n(r * 0.65)}" fill="${p.tree[1]}"/>
<circle cx="${n(cx + r * 0.5)}" cy="${n(base - r * 1.25)}" r="${n(r * 0.6)}" fill="${p.tree[1]}"/>`;
}

function skyLayer(tod: Tod, p: Pal) {
  const rng = rngFor(11);
  const [sx, sy] = p.sunPos;
  let stars = '';
  if (tod === 'night') {
    for (let i = 0; i < 46; i++) {
      stars += `<circle cx="${n(rng() * W)}" cy="${n(rng() * 150)}" r="${n(0.5 + rng() * 1.1)}" fill="#fff" opacity="${n(0.35 + rng() * 0.55)}"/>`;
    }
  }
  const moonCraters =
    tod === 'night'
      ? `<circle cx="${sx - 4}" cy="${sy - 2}" r="2.4" fill="#D9D6C2" opacity=".6"/><circle cx="${sx + 4}" cy="${sy + 4}" r="1.6" fill="#D9D6C2" opacity=".6"/>`
      : '';
  const defs = `<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
<radialGradient id="gSun"><stop offset="0" stop-color="${p.sun}" stop-opacity=".95"/><stop offset=".35" stop-color="${p.sun}" stop-opacity=".35"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>`;
  return wrap(
    `<rect width="${W}" height="${H}" fill="url(#gSky)"/>${stars}<circle cx="${sx}" cy="${sy}" r="${p.sunR * 4.2}" fill="url(#gSun)"/><circle cx="${sx}" cy="${sy}" r="${p.sunR}" fill="${p.sun}"/>${moonCraters}`,
    defs,
  );
}

function hillsLayer(p: Pal) {
  return wrap(
    `<path d="M-20 ${GROUND} C40 168 110 150 190 176 C260 198 320 150 430 172 V${GROUND + 6} H-20 Z" fill="${p.hills[0]}"/>
<path d="M-20 ${GROUND + 4} C60 196 130 190 210 206 C290 222 350 190 430 204 V${GROUND + 8} H-20 Z" fill="${p.hills[1]}"/>`,
  );
}

function groundSvg(p: Pal) {
  return `<rect x="-10" y="${GROUND - 2}" width="${W + 20}" height="${H - GROUND + 12}" fill="url(#gGround)"/>`;
}

function groundDefs(p: Pal) {
  return `<linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ground[0]}"/><stop offset="1" stop-color="${p.ground[1]}"/></linearGradient>`;
}

function lightsWrap(wins: Win[], tod: Tod, extra = '') {
  const defs = `<radialGradient id="gHalo"><stop offset="0" stop-color="#FFC66E" stop-opacity=".6"/><stop offset="1" stop-color="#FFC66E" stop-opacity="0"/></radialGradient>`;
  return wrap(`${haloSvg(wins, tod)}${tod === 'day' ? '' : extra}`, defs);
}

function foreLayer(p: Pal, kind: Kind) {
  if (kind === 'interior') return wrap('');
  const blades = (x0: number, x1: number, seed: number) => {
    const r = rngFor(seed);
    let s = '';
    for (let x = x0; x < x1; x += 7) {
      const h = 12 + r() * 14;
      s += `<path d="M${n(x)} ${H} Q${n(x + 2)} ${n(H - h * 0.6)} ${n(x + 5 * (r() - 0.3))} ${n(H - h)} Q${n(x + 4)} ${n(H - h * 0.5)} ${n(x + 6)} ${H} Z" fill="${p.tree[1]}"/>`;
    }
    return s;
  };
  return wrap(`${blades(-6, 70, 3)}${blades(330, 410, 5)}<circle cx="18" cy="${H - 4}" r="20" fill="${p.tree[0]}"/><circle cx="388" cy="${H - 2}" r="22" fill="${p.tree[0]}"/>`);
}

type Built = { body: string; wins: Win[]; extraLights?: string };

function villa(p: Pal, tod: Tod, rng: () => number): Built {
  const wall = tone('#F2EDE4', p);
  const shade = tone('#DDD3C3', p);
  const wood = tone('#B07A4F', p);
  const wins: Win[] = [
    makeWin(rng, p, 140, 182, 80, 44),
    makeWin(rng, p, 232, 182, 86, 44),
    makeWin(rng, p, 162, 128, 60, 36),
    makeWin(rng, p, 232, 128, 56, 36),
  ];
  let slats = '';
  for (let x = 84; x < 128; x += 6) slats += `<rect x="${x}" y="172" width="2" height="64" fill="#000" opacity=".12"/>`;
  const pool = `<rect x="34" y="248" width="150" height="40" rx="6" fill="${tone('#D9C9B0', p)}"/><rect x="42" y="254" width="134" height="28" rx="4" fill="${p.water}"/><path d="M50 262 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none"/><path d="M58 272 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" fill="none"/>`;
  const body = `${pool}
<rect x="80" y="170" width="250" height="66" fill="${wall}"/>
<rect x="150" y="118" width="150" height="54" fill="${shade}"/>
<rect x="150" y="118" width="150" height="54" fill="${wall}" opacity=".6"/>
<rect x="72" y="164" width="266" height="8" rx="2" fill="${p.roof}"/>
<rect x="142" y="112" width="166" height="8" rx="2" fill="${p.roof}"/>
<rect x="80" y="172" width="50" height="64" fill="${wood}"/>${slats}
<rect x="150" y="168" width="150" height="3" fill="${tone('#fff', p)}" opacity=".5"/>
${tree(352, GROUND + 2, 26, p)}
<rect x="318" y="226" width="62" height="10" rx="5" fill="${p.tree[1]}"/>`;
  return { body, wins };
}

function townhouse(p: Pal, tod: Tod, rng: () => number): Built {
  const cols = [tone('#E4A58F', p), tone('#9FBFAE', p), tone('#F0E0BE', p)];
  const doors = [tone('#2F5D50', p), tone('#C9604A', p), tone('#3B4D6B', p)];
  const tops = [122, 106, 126];
  const wins: Win[] = [];
  let body = '';
  for (let i = 0; i < 3; i++) {
    const x = 62 + i * 90;
    const top = tops[i];
    body += `<rect x="${x}" y="${top}" width="90" height="${GROUND - top}" fill="${cols[i]}"/>
<polygon points="${x - 5},${top} ${x + 45},${top - 36} ${x + 95},${top}" fill="${p.roof}"/>
<rect x="${x}" y="${top + 52}" width="90" height="2" fill="#000" opacity=".1"/>
<rect x="${x + 33}" y="${GROUND - 46}" width="24" height="46" rx="2" fill="${doors[i]}"/>
<circle cx="${x + 52}" cy="${GROUND - 22}" r="1.6" fill="${tone('#F2D28B', p)}"/>
<rect x="${x + 28}" y="${GROUND}" width="34" height="6" fill="${tone('#CFC6B6', p)}"/>`;
    wins.push(makeWin(rng, p, x + 12, top + 16, 20, 28), makeWin(rng, p, x + 58, top + 16, 20, 28), makeWin(rng, p, x + 12, top + 70, 20, 28), makeWin(rng, p, x + 58, top + 70, 20, 28));
  }
  body += `<rect x="150" y="${tops[1] + 100}" width="90" height="4" fill="${tone('#4A5A55', p)}"/>${tree(42, GROUND + 2, 20, p)}${tree(352, GROUND + 2, 22, p)}`;
  return { body, wins };
}

function tower(p: Pal, tod: Tod, rng: () => number): Built {
  const wins: Win[] = [];
  let body = `<rect x="85" y="110" width="60" height="${GROUND - 110}" fill="${tone('#D9CDBE', p)}"/>
<rect x="255" y="90" width="66" height="${GROUND - 90}" fill="${tone('#BFD0C9', p)}"/>
<rect x="150" y="40" width="100" height="${GROUND - 40}" fill="${tone('#C9D3D8', p)}"/>
<rect x="150" y="40" width="100" height="${GROUND - 40}" fill="${tone('#8FA2AB', p)}" opacity=".25"/>
<rect x="168" y="28" width="64" height="12" fill="${tone('#AAB8BF', p)}"/>
<rect x="199" y="8" width="2" height="20" fill="${tone('#8C9AA2', p)}"/><circle cx="200" cy="8" r="2.4" fill="#FF6B5B"/>`;
  for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) wins.push(makeWin(rng, p, 158 + c * 22.5, 52 + r * 17, 14, 10));
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) wins.push(makeWin(rng, p, 92 + c * 18, 122 + r * 18, 11, 10));
  for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) wins.push(makeWin(rng, p, 263 + c * 20, 102 + r * 16.5, 12, 9));
  body += `<rect x="40" y="${GROUND - 4}" width="320" height="8" rx="3" fill="${tone('#CFC6B6', p)}"/>${tree(66, GROUND + 2, 15, p)}${tree(338, GROUND + 2, 16, p)}<rect x="176" y="${GROUND - 18}" width="48" height="18" fill="${tone('#4E6671', p)}"/>`;
  return { body, wins };
}

function cottage(p: Pal, tod: Tod, rng: () => number): Built {
  const wins: Win[] = [makeWin(rng, p, 132, 188, 30, 28), makeWin(rng, p, 238, 188, 30, 28), makeWin(rng, p, 192, 138, 16, 16)];
  let clap = '';
  for (let y = 178; y < GROUND; y += 8) clap += `<rect x="110" y="${y}" width="180" height="1.4" fill="#000" opacity=".08"/>`;
  let fence = '';
  for (let x = 30; x < 106; x += 10) fence += `<path d="M${x} ${GROUND + 8} V${GROUND - 14} L${x + 3.5} ${GROUND - 19} L${x + 7} ${GROUND - 14} V${GROUND + 8} Z" fill="${tone('#FFFFFF', p)}" opacity=".92"/>`;
  for (let x = 298; x < 372; x += 10) fence += `<path d="M${x} ${GROUND + 8} V${GROUND - 14} L${x + 3.5} ${GROUND - 19} L${x + 7} ${GROUND - 14} V${GROUND + 8} Z" fill="${tone('#FFFFFF', p)}" opacity=".92"/>`;
  const flowers = [118, 134, 146, 252, 266, 280].map((x, i) => `<circle cx="${x}" cy="${GROUND - 4 + (i % 2) * 3}" r="3" fill="${i % 2 ? '#F4C95D' : '#E2725B'}"/>`).join('');
  const body = `${tree(54, GROUND + 4, 30, p)}
<rect x="110" y="170" width="180" height="${GROUND - 170}" fill="${tone('#F2E6CF', p)}"/>${clap}
<polygon points="94,174 200,106 306,174" fill="${tone('#C9674F', p)}"/>
<polygon points="94,174 200,106 306,174" fill="#000" opacity=".06"/>
<rect x="244" y="124" width="16" height="36" fill="${tone('#9A4B3C', p)}"/><rect x="241" y="120" width="22" height="6" fill="${tone('#7C3F32', p)}"/>
<rect x="124" y="186" width="6" height="32" fill="${tone('#8DB3A0', p)}"/><rect x="164" y="186" width="6" height="32" fill="${tone('#8DB3A0', p)}"/>
<rect x="230" y="186" width="6" height="32" fill="${tone('#8DB3A0', p)}"/><rect x="270" y="186" width="6" height="32" fill="${tone('#8DB3A0', p)}"/>
<path d="M186 ${GROUND} V204 A14 14 0 0 1 214 204 V${GROUND} Z" fill="${tone('#2F5D50', p)}"/><circle cx="209" cy="222" r="1.6" fill="${tone('#F2D28B', p)}"/>
<rect x="176" y="${GROUND}" width="48" height="6" fill="${tone('#CFC6B6', p)}"/>${fence}${flowers}${tree(352, GROUND + 2, 22, p)}`;
  return { body, wins };
}

function loft(p: Pal, tod: Tod, rng: () => number): Built {
  const wins: Win[] = [];
  let brick = '';
  for (let y = 106; y < GROUND; y += 6) brick += `<rect x="70" y="${y}" width="260" height="1" fill="#000" opacity=".1"/>`;
  let body = `<rect x="70" y="100" width="260" height="${GROUND - 100}" fill="${tone('#B5654F', p)}"/>${brick}
<rect x="64" y="92" width="272" height="10" fill="${tone('#7C3F32', p)}"/>
<rect x="270" y="60" width="4" height="32" fill="${tone('#4A3A34', p)}"/><rect x="296" y="60" width="4" height="32" fill="${tone('#4A3A34', p)}"/>
<rect x="264" y="38" width="42" height="26" rx="3" fill="${tone('#8A5B45', p)}"/><polygon points="262,38 285,26 308,38" fill="${tone('#5D3C30', p)}"/>
<rect x="190" y="${GROUND - 38}" width="42" height="38" fill="${tone('#2B3640', p)}"/><rect x="178" y="${GROUND - 46}" width="66" height="6" rx="2" fill="${tone('#F2C14E', p)}" opacity="${tod === 'day' ? 0.8 : 1}"/>`;
  for (let c = 0; c < 5; c++) {
    wins.push(makeWin(rng, p, 88 + c * 46, 118, 30, 44, true));
    if (c !== 2) wins.push(makeWin(rng, p, 88 + c * 46, 176, 30, 44, true));
  }
  body += `<path d="M334 120 l-14 14 l14 14 l-14 14 l14 14" stroke="${tone('#3E4A52', p)}" stroke-width="2.2" fill="none"/>${tree(46, GROUND + 2, 18, p)}${tree(362, GROUND + 2, 18, p)}
<rect x="58" y="${GROUND - 40}" width="3" height="40" fill="${tone('#3E4A52', p)}"/><circle cx="59.5" cy="${GROUND - 42}" r="4" fill="${tone('#F5D78B', p)}"/>`;
  return { body, wins, extraLights: `<circle cx="59.5" cy="${GROUND - 42}" r="22" fill="url(#gHalo)"/>` };
}

function interiorLayers(tod: Tod, p: Pal): Scene {
  const rng = rngFor(77);
  const wall = tone('#F3E9DA', p);
  const wall2 = tone('#E7DAC4', p);
  const floorA = tone('#C99C6E', p);
  const floorB = tone('#B58757', p);
  const sofa = tone('#5E8C78', p);
  const sofaD = tone('#4B7664', p);
  let planks = '';
  for (let x = 0; x < W; x += 36) planks += `<rect x="${x}" y="226" width="1.4" height="74" fill="#000" opacity=".12"/>`;
  const defs = `<linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="${wall2}"/></linearGradient>
<linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${floorA}"/><stop offset="1" stop-color="${floorB}"/></linearGradient>
<linearGradient id="gView" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".65" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
<radialGradient id="gHalo"><stop offset="0" stop-color="#FFC66E" stop-opacity=".7"/><stop offset="1" stop-color="#FFC66E" stop-opacity="0"/></radialGradient>`;
  const sky = wrap(`<rect width="${W}" height="${H}" fill="url(#gWall)"/>
<rect x="36" y="40" width="150" height="150" fill="url(#gView)"/>
<circle cx="${tod === 'dusk' ? 140 : 150}" cy="${tod === 'dusk' ? 150 : 76}" r="${tod === 'night' ? 9 : 16}" fill="${p.sun}"/>`, defs);
  const hills = wrap(`<path d="M36 170 C70 146 110 150 140 160 C160 166 176 160 186 156 V190 H36 Z" fill="${p.hills[0]}"/><path d="M36 182 C80 166 130 176 186 172 V190 H36 Z" fill="${p.hills[1]}"/>${tree(70, 190, 14, p)}${tree(160, 190, 11, p)}`);
  let wallArt = `<rect x="252" y="58" width="52" height="72" rx="2" fill="${tone('#FFFFFF', p)}"/><rect x="258" y="64" width="40" height="60" fill="${tone('#F9E0D8', p)}"/><circle cx="278" cy="88" r="12" fill="${tone('#E2725B', p)}"/><rect x="262" y="104" width="32" height="14" rx="7" fill="${tone('#0F4A3C', p)}"/>
<rect x="314" y="82" width="38" height="48" rx="2" fill="${tone('#FFFFFF', p)}"/><path d="M319 124 q8 -26 14 -4 t14 -22 V124 Z" fill="${tone('#9CC3AE', p)}"/>`;
  const room = `<rect x="0" y="226" width="${W}" height="74" fill="url(#gFloor)"/>${planks}<rect x="0" y="222" width="${W}" height="6" fill="${tone('#FFFFFF', p)}" opacity=".7"/>
<rect x="30" y="34" width="162" height="162" fill="none" stroke="${tone('#FFFFFF', p)}" stroke-width="8"/>
<rect x="108" y="38" width="6" height="154" fill="${tone('#FFFFFF', p)}"/><rect x="34" y="112" width="154" height="6" fill="${tone('#FFFFFF', p)}"/>
<rect x="24" y="192" width="174" height="9" rx="2" fill="${tone('#FFFFFF', p)}"/>
${wallArt}
<line x1="240" y1="0" x2="240" y2="40" stroke="${tone('#2B3A36', p)}" stroke-width="1.6"/><path d="M228 54 q12 -20 24 0 Z" fill="${tone('#E9B949', p)}"/>
<ellipse cx="270" cy="262" rx="92" ry="14" fill="${tone('#E7C9A5', p)}"/><ellipse cx="270" cy="262" rx="70" ry="9" fill="none" stroke="${tone('#E2725B', p)}" stroke-width="2"/>
<rect x="200" y="168" width="162" height="34" rx="14" fill="${sofaD}"/>
<rect x="194" y="184" width="174" height="44" rx="14" fill="${sofa}"/>
<rect x="188" y="176" width="22" height="56" rx="10" fill="${sofaD}"/><rect x="352" y="176" width="22" height="56" rx="10" fill="${sofaD}"/>
<rect x="214" y="190" width="58" height="30" rx="10" fill="${tone('#F2D2A9', p)}"/><rect x="282" y="190" width="58" height="30" rx="10" fill="${tone('#E2725B', p)}"/>
<rect x="206" y="228" width="6" height="8" rx="2" fill="${tone('#4A3A34', p)}"/><rect x="350" y="228" width="6" height="8" rx="2" fill="${tone('#4A3A34', p)}"/>
<path d="M54 232 h30 l-4 -34 h-22 z" fill="${tone('#C8765E', p)}"/>
<path d="M69 198 C54 178 56 160 62 150 C70 164 72 180 69 198 Z" fill="${tone('#4A8559', p)}"/><path d="M69 198 C84 176 86 160 78 148 C72 164 70 180 69 198 Z" fill="${tone('#5E9A6B', p)}"/><path d="M69 198 C62 188 46 184 40 176 C54 176 64 184 69 198 Z" fill="${tone('#5E9A6B', p)}"/>
<rect x="386" y="104" width="3" height="124" fill="${tone('#3D4A47', p)}"/><path d="M372 88 h32 l-6 26 h-20 z" fill="${tone('#F2D2A9', p)}"/>`;
  const lampOn = tod !== 'day';
  const lights = wrap(
    `${lampOn ? `<circle cx="388" cy="108" r="${tod === 'night' ? 90 : 56}" fill="url(#gHalo)"/><circle cx="240" cy="56" r="${tod === 'night' ? 56 : 30}" fill="url(#gHalo)"/>` : ''}`,
    defs,
  );
  const dusk = tod === 'dusk' ? `<rect width="${W}" height="${H}" fill="#E58F6A" opacity=".10"/>` : tod === 'night' ? `<rect width="${W}" height="${H}" fill="#0B1830" opacity=".14"/>` : '';
  const house = wrap(`${room}${dusk}`);
  const fore = wrap('');
  void rng;
  return { sky, hills, house, lights, fore, all: wrap(`${inner(sky)}${inner(hills)}${inner(house)}${inner(lights)}`, defs) };
}

export function scene(kind: Kind, tod: Tod): Scene {
  const p = PAL[tod];
  if (kind === 'interior') return interiorLayers(tod, p);
  const seed = { villa: 1, townhouse: 2, tower: 3, cottage: 4, loft: 5 }[kind] * 97 + (tod === 'day' ? 1 : tod === 'dusk' ? 2 : 3);
  const rng = rngFor(seed);
  const built = { villa, townhouse, tower, cottage, loft }[kind](p, tod, rng);
  const sky = skyLayer(tod, p);
  const hills = hillsLayer(p);
  const wins = built.wins.map((w) => winSvg(w, p, tod)).join('');
  const house = wrap(`${groundSvg(p)}${built.body}${wins}`, groundDefs(p));
  const lights = lightsWrap(built.wins, tod, built.extraLights ?? '');
  const fore = foreLayer(p, kind);
  const defsAll = `${groundDefs(p)}<radialGradient id="gHalo"><stop offset="0" stop-color="#FFC66E" stop-opacity=".6"/><stop offset="1" stop-color="#FFC66E" stop-opacity="0"/></radialGradient>`;
  const skyDefs = `<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".6" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><radialGradient id="gSun"><stop offset="0" stop-color="${p.sun}" stop-opacity=".95"/><stop offset=".35" stop-color="${p.sun}" stop-opacity=".35"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>`;
  const all = wrap(`${inner(sky)}${inner(hills)}${inner(house)}${inner(lights)}${inner(fore)}`, `${defsAll}${skyDefs}`);
  return { sky, hills, house, lights, fore, all };
}

// A 800x100 strip (two identical 400px halves) so translateX(-400) loops seamlessly.
export function cloudStrip(tod: Tod) {
  const color = tod === 'day' ? '#FFFFFF' : tod === 'dusk' ? '#FBD9D0' : '#8EA3C7';
  const op = tod === 'day' ? 0.92 : tod === 'dusk' ? 0.6 : 0.22;
  const cloud = (x: number, y: number, s: number) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}" opacity="${op}"><circle cx="20" cy="22" r="14"/><circle cx="40" cy="14" r="18"/><circle cx="62" cy="22" r="14"/><rect x="8" y="20" width="66" height="16" rx="8"/></g>`;
  const half = (dx: number) => `${cloud(dx + 20, 10, 1)}${cloud(dx + 190, 34, 0.7)}${cloud(dx + 300, 4, 0.85)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 100" preserveAspectRatio="xMinYMid meet">${half(0)}${half(400)}</svg>`;
}

// ---- skyline silhouettes for the splash / welcome (viewBox 400 x 200) ----
export function skyline(layer: 0 | 1 | 2, color: string) {
  const rng = rngFor(900 + layer * 13);
  const heights = [[70, 110], [50, 90], [30, 60]][layer];
  let x = -10;
  let s = '';
  const base = 200;
  while (x < 410) {
    const w = 26 + rng() * 34;
    const h = heights[0] + rng() * (heights[1] - heights[0]);
    const roof = rng();
    if (roof < 0.35) {
      s += `<polygon points="${n(x)},${base - h} ${n(x + w / 2)},${n(base - h - 18)} ${n(x + w)},${base - h}" fill="${color}"/>`;
    }
    s += `<rect x="${n(x)}" y="${n(base - h)}" width="${n(w)}" height="${n(h + 4)}" fill="${color}"/>`;
    if (roof > 0.8) s += `<rect x="${n(x + w * 0.6)}" y="${n(base - h - 14)}" width="5" height="14" fill="${color}"/>`;
    x += w + rng() * 5;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
}

// Warm windows for the splash, in three groups so they can light up one after another.
export function skylineWindows(group: 0 | 1 | 2) {
  const rng = rngFor(40 + group);
  let s = '';
  for (let i = 0; i < 26; i++) {
    const x = 6 + rng() * 380;
    const y = 96 + rng() * 90;
    s += `<rect x="${n(x)}" y="${n(y)}" width="4" height="5" rx="1" fill="#FFD08A"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">${s}</svg>`;
}

export const KINDS: Kind[] = ['villa', 'townhouse', 'tower', 'cottage', 'loft', 'interior'];
export const TODS: Tod[] = ['day', 'dusk', 'night'];

const sceneCache = new Map<string, Scene>();
export function sceneCached(kind: Kind, tod: Tod): Scene {
  const key = `${kind}-${tod}`;
  let s = sceneCache.get(key);
  if (!s) {
    s = scene(kind, tod);
    sceneCache.set(key, s);
  }
  return s;
}
