import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { AuthButton } from '../components/auth/AuthButton';
import { Glass } from '../components/auth/Glass';
import { outCubic } from '../components/auth/motion';
import { Icon, IconName } from '../components/Icon';
import { LogoDraw } from '../components/LogoMark';
import { PhotoCycle } from '../components/PropertyPhoto';

const c = brand.colors;

const PERKS: { icon: IconName; label: string }[] = [
  { icon: 'shield', label: 'Verified homes' },
  { icon: 'video', label: 'Video tours' },
  { icon: 'bell', label: 'Price alerts' },
];

function FloatChip({ children, style, delay, phase }: { children: React.ReactNode; style: object; delay: number; phase: number }) {
  const b = useSharedValue(0);
  useEffect(() => {
    b.set(withRepeat(withTiming(1, { duration: 3000 + phase * 500, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [b, phase]);
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: (b.value - 0.5) * 8 }] }));
  return (
    <Animated.View style={[styles.chipWrap, style, float]}>
      <Glass radius={18} style={styles.chip}>
        <Animated.View entering={FadeIn.duration(500).delay(delay)} style={styles.chipInner}>
          {children}
        </Animated.View>
      </Glass>
    </Animated.View>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <Animated.View entering={FadeIn.duration(700)} style={StyleSheet.absoluteFill}>
        <PhotoCycle photos={['villa', 'litHouse', 'modernWhite']} kind="villa" tod="dusk" width={W} height={H} seconds={7} />
        <LinearGradient
          colors={['rgba(5,14,12,0.5)', 'rgba(5,14,12,0.02)', 'rgba(5,14,12,0.5)', 'rgba(5,14,12,0.94)']}
          locations={[0, 0.24, 0.58, 1]}
          style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        />
      </Animated.View>

      <Glass radius={22} style={[styles.logoPill, { top: insets.top + 10 }]}>
        <View style={styles.logoInner}>
          <LogoDraw size={24} delay={300} duration={900} color="#FFFFFF" accent="#FFB9A8" />
          <Text style={styles.logoText}>{brand.name}</Text>
        </View>
      </Glass>

      <FloatChip delay={900} phase={0} style={{ top: insets.top + H * 0.13, right: 18 }}>
        <Icon name="calendar" size={18} color="#FFFFFF" strokeWidth={1.8} />
        <View>
          <Text style={styles.chipTitle}>Open house</Text>
          <Text style={styles.chipSub}>Sat, 11:00 am</Text>
        </View>
      </FloatChip>
      <FloatChip delay={1150} phase={1} style={{ top: insets.top + H * 0.13 + 78, left: 18 }}>
        <Icon name="star" size={18} color={c.gold} fill={c.gold} strokeWidth={1.2} />
        <View>
          <Text style={styles.chipTitle}>4.9 rated</Text>
          <Text style={styles.chipSub}>Verified listings</Text>
        </View>
      </FloatChip>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <Animated.Text entering={FadeInDown.duration(560).delay(350).easing(outCubic)} style={styles.title}>
          Find a place that feels like home.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(560).delay(480).easing(outCubic)} style={styles.sub}>
          Browse verified homes, tour them in minutes and move in with confidence.
        </Animated.Text>

        <View style={styles.panel}>
          <Glass radius={30} style={StyleSheet.absoluteFill} />
          <Animated.View entering={FadeInDown.duration(560).delay(650).easing(outCubic)} style={styles.panelBody}>
            <View style={styles.perks}>
              {PERKS.map((p) => (
                <View key={p.label} style={styles.perk}>
                  <View style={styles.perkIcon}>
                    <Icon name={p.icon} size={17} color="#FFFFFF" strokeWidth={1.8} />
                  </View>
                  <Text style={styles.perkText}>{p.label}</Text>
                </View>
              ))}
            </View>
            <AuthButton label="Get started" onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.duration(500).delay(900)} style={styles.footer}>
          <Pressable hitSlop={10} accessibilityRole="button" onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })}>
            <Text style={styles.footText}>
              Already a member? <Text style={styles.footLink}>Log in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.primaryDark },
  logoPill: { position: 'absolute', left: 18 },
  logoInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingLeft: 12, paddingRight: 16 },
  logoText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  chipWrap: { position: 'absolute' },
  chip: {},
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14 },
  chipTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  chipSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18 },
  title: { color: '#FFFFFF', fontSize: 42, fontWeight: '700', letterSpacing: -1.6, lineHeight: 45, paddingHorizontal: 6 },
  sub: { color: 'rgba(255,255,255,0.74)', fontSize: 16, lineHeight: 23, marginTop: 10, marginBottom: 22, paddingHorizontal: 6 },
  panel: { borderRadius: 30, overflow: 'hidden' },
  panelBody: { padding: 14 },
  perks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 6, marginBottom: 16 },
  perk: { flex: 1, alignItems: 'center', gap: 8 },
  perkIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  perkText: { color: 'rgba(255,255,255,0.82)', fontSize: 12.5, fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 18, minHeight: 44 },
  footText: { color: 'rgba(255,255,255,0.7)', fontSize: 14.5 },
  footLink: { color: '#FFFFFF', fontWeight: '700' },
});
