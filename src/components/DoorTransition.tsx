import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { brand } from '../brand';

const c = brand.colors;
const MS = 2300;

// Signature moment after login: a front door swings open, warm light floods the screen,
// "Welcome home" appears, then the app is revealed.
export function DoorTransition({ name, onDone }: { name: string; onDone: () => void }) {
  const { width: W } = useWindowDimensions();
  const doorW = Math.min(220, W * 0.56);
  const doorH = doorW * 1.55;
  const frameW = doorW + 30;
  const frameH = doorH + 16;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: MS, easing: Easing.inOut(Easing.cubic) });
    const t = setTimeout(onDone, MS + 120);
    return () => clearTimeout(t);
  }, [p, onDone]);

  const door = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${interpolate(p.value, [0.12, 0.55], [0, 74], 'clamp')}deg` }],
  }));
  const shade = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0.12, 0.55], [0, 0.4], 'clamp') }));
  const bloom = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.45, 0.75], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(p.value, [0.4, 0.95], [1, 14], 'clamp') }],
  }));
  const text = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.66, 0.86], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(p.value, [0.66, 0.86], [14, 0], 'clamp') }],
  }));
  const frameStyle = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0.8, 0.95], [1, 0], 'clamp') }));

  const arch = { borderTopLeftRadius: doorW / 2, borderTopRightRadius: doorW / 2 };
  const frameArch = { borderTopLeftRadius: frameW / 2, borderTopRightRadius: frameW / 2 };

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.layer}>
      <Animated.View style={[{ width: frameW, height: frameH, backgroundColor: c.primaryDark, ...frameArch, alignItems: 'center', justifyContent: 'flex-end' }, frameStyle]}>
        <View style={[{ width: doorW, height: doorH, overflow: 'hidden', ...arch }]}>
          <LinearGradient colors={['#FFE7B8', '#FFC27A', '#F6A25B']} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.bloom, { width: doorW, height: doorH, ...arch }, bloom]} />
        </View>
        <Animated.View style={[styles.doorWrap, { width: doorW, height: doorH, ...arch, transformOrigin: 'left center' }, door]}>
          <View style={[{ flex: 1, backgroundColor: c.primary, ...arch, padding: 16, justifyContent: 'center' }]}>
            <View style={[styles.panel, { height: doorH * 0.3, borderTopLeftRadius: doorW / 2.6, borderTopRightRadius: doorW / 2.6 }]} />
            <View style={[styles.panel, { height: doorH * 0.28, marginTop: 14 }]} />
            <View style={styles.knob} />
          </View>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', ...arch }, shade]} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, { pointerEvents: 'none' }]}>
        <Animated.View style={[styles.center, text]}>
          <Text style={styles.small}>Welcome home,</Text>
          <Text style={styles.big}>{name || 'friend'}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', zIndex: 200, elevation: 200 },
  center: { alignItems: 'center', justifyContent: 'center' },
  bloom: { position: 'absolute', left: 0, bottom: 0, backgroundColor: '#FFE7B8' },
  doorWrap: { position: 'absolute', bottom: 0, left: 15, overflow: 'hidden' },
  panel: { borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.14)' },
  knob: { position: 'absolute', right: 18, top: '52%', width: 14, height: 14, borderRadius: 7, backgroundColor: c.gold },
  small: { color: c.primary, fontSize: 18, fontWeight: '600' },
  big: { color: c.text, fontSize: 40, fontWeight: '800', letterSpacing: -1, marginTop: 4 },
});
