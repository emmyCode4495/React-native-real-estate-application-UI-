// Haven mark: a house outline with a keyhole. Drawn as strokes so it can "write itself" in.
export const LOGO = {
  roof: 'M14 48 L50 16 L86 48',
  walls: 'M22 42 V84 H78 V42',
  ring: 'M50 49 A7 7 0 1 1 49.99 49 Z',
  stem: 'M50 63 L50 74',
  // generous dash lengths (>= real path length) so offset animation fully hides/reveals each path
  len: { roof: 100, walls: 145, ring: 46, stem: 14 },
} as const;
