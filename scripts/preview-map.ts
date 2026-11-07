import { writeFileSync } from 'fs';
import { mapSvg } from '../src/art/map';
writeFileSync('/tmp/art/map.svg', mapSvg());
