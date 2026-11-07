import { Easing } from 'react-native-reanimated';

// One easing language for the whole auth flow: fast start, long soft landing. No springs, no overshoot.
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
// Same feel, typed for entering / layout animations.
export const outCubic = Easing.out(Easing.cubic);
