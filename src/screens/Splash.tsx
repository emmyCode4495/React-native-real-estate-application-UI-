import React, { useEffect } from 'react';
import { Pressable, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { skyline, skylineWindows } from '../art/scenes';
import { DAWN_SKSL } from '../art/dawnShader';
import { LogoDraw } from '../components/LogoMark';
import { prefetchPhotos } from '../data/photos';
import { brand } from '../brand';

const c = brand.colors;
// Compiled once. If a device ever fails to compile it, we fall back to a plain gradient.
const dawn = Skia.RuntimeEffect.Make(DAWN_SKSL);

const LAYERS = [
  { color: '#2A6B5E', delay: 500 },
  { color: '#164A40', delay: 800 },
  { color: '#0A211F', delay: 1100 },
] as const;

function Skyline({ index, width, height }: { index: 0 | 1 | 2; width: number; height: number }) {
  const y = useSharedValue(90);
  const glow = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(LAYERS[index].delay, withSpring(0, { damping: 18, stiffness: 70 }));
    glow.value = withDelay(1700 + index * 380, withTiming(1, { duration: 700 }));
  }, [index, y, glow]);
  const rise = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const lights = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <Animated.View style={[styles.sky, { width, height }, rise]} pointerEvents="none">
      <SvgXml xml={skyline(index, LAYERS[index].color)} width="100%" height="100%" />
      <Animated.View style={[StyleSheet.absoluteFill, lights]}>
        <SvgXml xml={skylineWindows(index)} width="100%" height="100%" />
      </Animated.View>
    </Animated.View>
  );
}

// Dawn over a small town: the shader sky rises, three skyline layers slide up with windows
// lighting one by one, and the Haven mark draws itself.
export function Splash({ onDone }: { onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const rise = useSharedValue(0);
  const clock = useClock();

  useEffect(() => {
    // warm the image cache while the sunrise plays
    prefetchPhotos(['villa', 'litHouse', 'modernWhite', 'cabin', 'cottage'], W);
    prefetchPhotos(['villa', 'townhouse', 'tower', 'cottage', 'loft', 'penthouse', 'rowhomes', 'bungalow'], 300);
    rise.value = withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.cubic) });
    const t = setTimeout(onDone, 4300);
    return () => clearTimeout(t);
  }, [rise, onDone, W]);

  const uniforms = useDerivedValue(() => ({ res: [W, H], t: clock.value / 1000, rise: rise.value }));

  return (
    <Pressable style={styles.root} onPress={onDone} accessibilityLabel="Skip intro">
      <StatusBar barStyle="light-content" />
      {dawn ? (
        <Canvas style={StyleSheet.absoluteFill}>
          <Fill>
            <Shader source={dawn} uniforms={uniforms} />
          </Fill>
        </Canvas>
      ) : (
        <LinearGradient colors={['#0A211F', '#2A6B5E', '#E2A07F']} style={StyleSheet.absoluteFill} />
      )}

      <Skyline index={0} width={W} height={W * 0.5} />
      <Skyline index={1} width={W} height={W * 0.5} />
      <Skyline index={2} width={W} height={W * 0.5} />

      <View style={[styles.brand, { top: H * 0.2 }]}>
        <LogoDraw size={104} delay={900} duration={1500} color={c.bg} accent={c.accent} />
        <Animated.Text entering={FadeInDown.delay(2100).springify().damping(16)} style={styles.word}>
          {brand.name}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(2500).springify().damping(16)} style={styles.tag}>
          {brand.tagline}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A211F' },
  sky: { position: 'absolute', left: 0, bottom: 0 },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  word: { color: c.bg, fontSize: 48, fontWeight: '800', letterSpacing: -1.8, marginTop: 14 },
  tag: { color: 'rgba(247,241,232,0.85)', fontSize: 16, marginTop: 6 },
});
