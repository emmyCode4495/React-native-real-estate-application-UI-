import React, { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LOGO } from '../art/logo';
import { brand } from '../brand';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const c = brand.colors;

type Props = {
  size: number;
  // 0..1 draws the mark: roof, then walls, then the keyhole
  progress: SharedValue<number>;
  color?: string;
  accent?: string;
  strokeWidth?: number;
};

function seg(p: number, from: number, to: number) {
  'worklet';
  return Math.min(1, Math.max(0, (p - from) / (to - from)));
}

export function LogoMark({ size, progress, color = c.text, accent = c.accent, strokeWidth = 6 }: Props) {
  const roof = useAnimatedProps(() => ({ strokeDashoffset: LOGO.len.roof * (1 - seg(progress.value, 0, 0.4)) }));
  const walls = useAnimatedProps(() => ({ strokeDashoffset: LOGO.len.walls * (1 - seg(progress.value, 0.25, 0.75)) }));
  const ring = useAnimatedProps(() => ({ strokeDashoffset: LOGO.len.ring * (1 - seg(progress.value, 0.65, 0.92)) }));
  const stem = useAnimatedProps(() => ({ strokeDashoffset: LOGO.len.stem * (1 - seg(progress.value, 0.88, 1)) }));
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <AnimatedPath d={LOGO.roof} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LOGO.len.roof} animatedProps={roof} />
      <AnimatedPath d={LOGO.walls} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LOGO.len.walls} animatedProps={walls} />
      <AnimatedPath d={LOGO.ring} stroke={accent} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LOGO.len.ring} animatedProps={ring} />
      <AnimatedPath d={LOGO.stem} stroke={accent} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={LOGO.len.stem} animatedProps={stem} />
    </Svg>
  );
}

// Draws once on mount.
export function LogoDraw({ size, delay = 0, duration = 1300, ...rest }: Omit<Props, 'progress'> & { delay?: number; duration?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }));
  }, [p, delay, duration]);
  return <LogoMark size={size} progress={p} {...rest} />;
}

// The app's loader. No spinner: a little house that draws itself, then erases, on a loop.
export function HouseLoader({ size = 56, color = c.primary, accent = c.accent }: { size?: number; color?: string; accent?: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(
      withSequence(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), withDelay(280, withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }))),
      -1,
      false,
    );
  }, [p]);
  return <LogoMark size={size} progress={p} color={color} accent={accent} strokeWidth={6.5} />;
}
