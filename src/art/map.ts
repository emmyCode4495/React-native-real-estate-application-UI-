// Stylised neighbourhood map (900 x 1100). Static SVG; pins are real views on top of it.
export const MAP_W = 900;
export const MAP_H = 1100;

function rng(seed: number) {
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

export function mapSvg() {
  const r = rng(2024);
  const hy = [120, 270, 420, 590, 730, 880, 1010];
  const vx = [90, 230, 380, 520, 680, 810];
  let blocks = '';
  for (let i = 0; i < hy.length - 1; i++) {
    for (let j = 0; j < vx.length - 1; j++) {
      const x0 = vx[j] + 12, x1 = vx[j + 1] - 12, y0 = hy[i] + 12, y1 = hy[i + 1] - 12;
      blocks += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="10" fill="#F5EEE1"/>`;
      const cols = 3 + Math.floor(r() * 2);
      for (let k = 0; k < cols * 2; k++) {
        const bw = 18 + r() * 26, bh = 14 + r() * 24;
        const bx = x0 + 8 + r() * (x1 - x0 - bw - 16);
        const by = y0 + 8 + r() * (y1 - y0 - bh - 16);
        blocks += `<rect x="${n(bx)}" y="${n(by)}" width="${n(bw)}" height="${n(bh)}" rx="3" fill="${r() > 0.5 ? '#E6DAC6' : '#EADFCC'}"/>`;
      }
    }
  }
  let roads = '';
  hy.forEach((y, i) => (roads += `<path d="M-10 ${y + (i % 2 ? 6 : -4)} L${MAP_W + 10} ${y + (i % 2 ? -6 : 4)}" stroke="#FFFFFF" stroke-width="${i === 3 ? 26 : 13}"/>`));
  vx.forEach((x, j) => (roads += `<path d="M${x + (j % 2 ? 5 : -5)} -10 L${x + (j % 2 ? -5 : 5)} ${MAP_H + 10}" stroke="#FFFFFF" stroke-width="${j === 2 ? 26 : 13}"/>`));
  roads += `<path d="M-10 900 L900 300" stroke="#FFFFFF" stroke-width="18"/>`;
  const trees = (cx: number, cy: number, rx: number, ry: number, count: number) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      s += `<circle cx="${n(cx + Math.cos(a) * rx * d)}" cy="${n(cy + Math.sin(a) * ry * d)}" r="${n(5 + r() * 6)}" fill="#B9D6A8"/>`;
    }
    return s;
  };
  const parks = `<rect x="245" y="285" width="120" height="120" rx="26" fill="#D6E7CA"/>${trees(305, 345, 48, 48, 14)}
<rect x="535" y="605" width="130" height="110" rx="30" fill="#D6E7CA"/>${trees(600, 660, 52, 44, 14)}
<rect x="105" y="745" width="110" height="120" rx="28" fill="#D6E7CA"/>${trees(160, 805, 44, 50, 12)}`;
  const river = `<path d="M-40 40 C 200 160 300 20 470 160 S 760 360 960 300" stroke="#C6E1E8" stroke-width="64" fill="none" stroke-linecap="round"/>
<path d="M-40 40 C 200 160 300 20 470 160 S 760 360 960 300" stroke="#DDF0F3" stroke-width="40" fill="none" stroke-linecap="round" opacity=".7"/>
<ellipse cx="760" cy="960" rx="120" ry="70" fill="#C6E1E8"/><ellipse cx="760" cy="960" rx="90" ry="48" fill="#DDF0F3" opacity=".7"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}"><rect width="${MAP_W}" height="${MAP_H}" fill="#EBE1CF"/>${blocks}<g fill="none" stroke-linecap="round">${roads}</g>${parks}${river}</svg>`;
}
