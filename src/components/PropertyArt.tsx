import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Kind, Tod, cloudStrip, sceneCached } from '../art/scenes';

type Props = {
  kind: Kind;
  tod: Tod;
  width: number;
  height: number;
  // animated: layered sky, drifting clouds, breathing window light, parallax
  animated?: boolean;
  // -1..1, e.g. derived from a pager's scroll position
  parallax?: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
};

function Layer({ xml, style }: { xml: string; style?: any }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <SvgXml xml={xml} width="100%" height="100%" />
    </Animated.View>
  );
}

export function PropertyArt({ kind, tod, width, height, animated, parallax, style }: Props) {
  const sc = sceneCached(kind, tod);
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    drift.value = withRepeat(withTiming(1, { duration: 70000, easing: Easing.linear }), -1, false);
    breathe.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [animated, drift, breathe]);

  const cloudStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -drift.value * width }] }));
  const lightStyle = useAnimatedStyle(() => ({ opacity: 0.7 + breathe.value * 0.3 }));
  const hillsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (parallax ? parallax.value : 0) * -9 }, { scale: 1.07 }] }));
  const houseStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (parallax ? parallax.value : 0) * -16 }, { scale: 1.07 }] }));
  const foreStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (parallax ? parallax.value : 0) * 26 }, { scale: 1.1 }] }));
  const flat = useAnimatedStyle(() => ({ transform: [{ translateX: (parallax ? parallax.value : 0) * -12 }, { scale: parallax ? 1.12 : 1 }] }));

  if (!animated) {
    return (
      <View style={[{ width, height, overflow: 'hidden' }, style]}>
        <Layer xml={sc.all} style={flat} />
      </View>
    );
  }

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <Layer xml={sc.sky} />
      <Animated.View pointerEvents="none" style={[styles.clouds, { top: height * 0.04, width: width * 2, height: width / 4 }, cloudStyle]}>
        <SvgXml xml={cloudStrip(tod)} width="100%" height="100%" />
      </Animated.View>
      <Layer xml={sc.hills} style={hillsStyle} />
      <Layer xml={sc.house} style={houseStyle} />
      <Layer xml={sc.lights} style={[houseStyle, lightStyle]} />
      <Layer xml={sc.fore} style={foreStyle} />
    </View>
  );
}

// "A day in the life of the house": day, golden hour and night crossfade on a slow loop.
export function DayCycleArt({ kind, width, height, style }: { kind: Kind; width: number; height: number; style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  const drift = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 21000, easing: Easing.linear }), -1, false);
    drift.value = withRepeat(withTiming(1, { duration: 70000, easing: Easing.linear }), -1, false);
  }, [t, drift]);

  const near = (v: number, c: number) => {
    'worklet';
    const d = Math.abs(v - c);
    return Math.min(d, 1 - d);
  };
  const dusk = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - near(t.value, 1 / 3) * 3) }));
  const night = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - near(t.value, 2 / 3) * 3) }));
  const cloudStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -drift.value * width }] }));

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      <Layer xml={sceneCached(kind, 'day').all} />
      <Layer xml={sceneCached(kind, 'dusk').all} style={dusk} />
      <Layer xml={sceneCached(kind, 'night').all} style={night} />
      <Animated.View pointerEvents="none" style={[styles.clouds, { top: height * 0.05, width: width * 2, height: width / 4, opacity: 0.8 }, cloudStyle]}>
        <SvgXml xml={cloudStrip('day')} width="100%" height="100%" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ clouds: { position: 'absolute', left: 0 } });
