import { writeFileSync } from 'fs';
import { ICONS } from '../src/art/icons';
import { LOGO } from '../src/art/logo';

const names = Object.keys(ICONS) as (keyof typeof ICONS)[];
const cols = 9;
const cell = 80;
const rows = Math.ceil(names.length / cols);
let body = '';
names.forEach((nm, i) => {
  const x = (i % cols) * cell + 28;
  const y = Math.floor(i / cols) * cell + 14;
  body += `<g transform="translate(${x} ${y}) scale(1.0)" fill="none" stroke="#14231F" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[nm]}"/></g><text x="${x + 12}" y="${y + 40}" font-size="8" text-anchor="middle" fill="#6B7A74" font-family="sans-serif">${nm}</text>`;
});
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell + 20}" height="${rows * cell + 20}"><rect width="100%" height="100%" fill="#F7F1E8"/>${body}</svg>`;
writeFileSync('/tmp/art/icons.svg', sheet);
const logo = (bg: string, fg: string, acc: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200"><rect width="100" height="100" rx="22" fill="${bg}"/><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="6"><path d="${LOGO.roof}" stroke="${fg}"/><path d="${LOGO.walls}" stroke="${fg}"/><path d="${LOGO.ring}" stroke="${acc}"/><path d="${LOGO.stem}" stroke="${acc}"/></g></svg>`;
writeFileSync('/tmp/art/logo.svg', logo('#0F4A3C', '#F7F1E8', '#E2725B'));
console.log(names.length, 'icons');
