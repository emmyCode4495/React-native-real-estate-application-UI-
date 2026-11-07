import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { brand } from '../../brand';

const c = brand.colors;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const R = 34;
const CIRC = 2 * Math.PI * R;
const CHECK = 'M24 37 L32.5 45.5 L48.5 27.5';
const CHECK_LEN = 40;
const MS = 2000;

function seg(p: number, from: number, to: number) {
  'worklet';
  const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
  return 1 - Math.pow(1 - t, 3); // ease-out cubic
}

// After sign-in: a soft glow swells, a ring and tick draw themselves, then the name settles in. Then the app.
export function AuthSuccess({ name, onDone }: { name: string; onDone: () => void }) {
  const { height: H } = useWindowDimensions();
  const p = useSharedValue(0);

  useEffect(() => {
    p.set(withTiming(1, { duration: MS, easing: Easing.linear }));
    const t = setTimeout(onDone, MS + 150);
    return () => clearTimeout(t);
  }, [p, onDone]);

  const glow = useAnimatedStyle(() => ({ opacity: seg(p.value, 0, 0.5) * 0.9, transform: [{ scale: 0.5 + seg(p.value, 0, 0.7) * 1.1 }] }));
  const ring = useAnimatedProps(() => ({ strokeDashoffset: CIRC * (1 - seg(p.value, 0.06, 0.46)) }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - seg(p.value, 0.4, 0.62)) }));
  const line1 = useAnimatedStyle(() => ({ opacity: seg(p.value, 0.52, 0.74), transform: [{ translateY: (1 - seg(p.value, 0.52, 0.74)) * 14 }] }));
  const line2 = useAnimatedStyle(() => ({ opacity: seg(p.value, 0.6, 0.82), transform: [{ translateY: (1 - seg(p.value, 0.6, 0.82)) * 14 }] }));

  return (
    <Animated.View entering={FadeIn.duration(420)} style={styles.layer}>
      <View style={[styles.content, { marginTop: H * 0.19 }]}>
        <View style={styles.ringWrap}>
          <Animated.View style={[styles.glow, glow]} />
          <Svg width={96} height={96} viewBox="0 0 72 72" fill="none">
            <AnimatedCircle cx={36} cy={36} r={R} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={CIRC} animatedProps={ring} rotation={-90} origin="36, 36" />
            <AnimatedPath d={CHECK} stroke="#FFB9A8" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={CHECK_LEN} animatedProps={tick} />
          </Svg>
        </View>
        <View style={styles.text}>
          <Animated.Text style={[styles.small, line1]}>You're in,</Animated.Text>
          <Animated.Text style={[styles.big, line2]} numberOfLines={1}>
            {name || 'friend'}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, backgroundColor: c.primaryDark, zIndex: 200, elevation: 200 },
  content: { alignItems: 'center' },
  ringWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(226,114,91,0.16)' },
  text: { alignItems: 'center', marginTop: 28, paddingHorizontal: 32 },
  small: { color: 'rgba(255,255,255,0.7)', fontSize: 17, fontWeight: '500', letterSpacing: 0.2 },
  big: { color: '#FFFFFF', fontSize: 38, fontWeight: '700', letterSpacing: -1.2, marginTop: 4 },
});
