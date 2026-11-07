import { mkdirSync, writeFileSync } from 'fs';
import { KINDS, TODS, scene } from '../src/art/scenes';

mkdirSync('/tmp/art', { recursive: true });
for (const k of KINDS) for (const t of TODS) writeFileSync(`/tmp/art/${k}-${t}.svg`, scene(k, t).all);
console.log('written', KINDS.length * TODS.length);
