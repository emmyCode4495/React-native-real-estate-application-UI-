import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { Icon } from '../components/Icon';
import { LogoDraw } from '../components/LogoMark';
import { PhotoCycle } from '../components/PropertyPhoto';
import { PrimaryButton } from '../components/PrimaryButton';

const c = brand.colors;

function FloatChip({ children, style, delay, phase }: { children: React.ReactNode; style: object; delay: number; phase: number }) {
  const b = useSharedValue(0);
  useEffect(() => {
    b.value = withRepeat(withTiming(1, { duration: 2600 + phase * 400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [b, phase]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: (b.value - 0.5) * 9 }] }));
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(13)} style={[styles.chipWrap, style]}>
      <Animated.View style={[styles.chip, float]}>{children}</Animated.View>
    </Animated.View>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const artH = Math.min(H * 0.52, 470);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <Animated.View entering={FadeIn.duration(700)} style={styles.art}>
        <PhotoCycle photos={['villa', 'litHouse', 'modernWhite']} kind="villa" tod="day" width={W} height={artH} />
      </Animated.View>

      <View style={[styles.logoPill, { top: insets.top + 12 }]}>
        <LogoDraw size={26} delay={300} duration={900} color={c.primary} accent={c.accent} />
        <Text style={styles.logoText}>{brand.name}</Text>
      </View>

      <FloatChip delay={900} phase={0} style={{ top: artH * 0.34, left: 18 }}>
        <Icon name="calendar" size={18} color={c.primary} />
        <View>
          <Text style={styles.chipTitle}>Open house</Text>
          <Text style={styles.chipSub}>Sat, 11:00 am</Text>
        </View>
      </FloatChip>
      <FloatChip delay={1150} phase={1} style={{ top: artH * 0.62, right: 16 }}>
        <Icon name="star" size={18} color={c.gold} fill={c.gold} strokeWidth={1.2} />
        <View>
          <Text style={styles.chipTitle}>4.9 rated</Text>
          <Text style={styles.chipSub}>Verified listings</Text>
        </View>
      </FloatChip>

      <View style={[styles.sheet, { top: artH - 34, paddingBottom: insets.bottom + 20 }]}>
        <Animated.Text entering={FadeInDown.delay(500).springify().damping(16)} style={styles.title}>
          Find a place that feels like home.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(650).springify().damping(16)} style={styles.sub}>
          Browse verified homes, tour them in minutes and move in with confidence.
        </Animated.Text>
        <View style={styles.spacer} />
        <Animated.View entering={FadeInDown.delay(800).springify().damping(16)} style={styles.buttons}>
          <PrimaryButton label="Get started" onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })} />
          <PrimaryButton label="I already have an account" tone="ghost" height={54} onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  art: { position: 'absolute', top: 0, left: 0, right: 0 },
  logoPill: { position: 'absolute', left: 18, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 10, paddingRight: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)' },
  logoText: { color: c.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  chipWrap: { position: 'absolute' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.96)', ...brand.shadow },
  chipTitle: { color: c.text, fontSize: 14, fontWeight: '800' },
  chipSub: { color: c.muted, fontSize: 12, marginTop: 1 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 30, backgroundColor: c.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34 },
  title: { color: c.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  sub: { color: c.muted, fontSize: 16, lineHeight: 23, marginTop: 10 },
  spacer: { flex: 1 },
  buttons: { gap: 12 },
});
