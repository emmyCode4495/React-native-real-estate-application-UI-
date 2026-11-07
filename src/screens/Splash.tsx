import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { PropertyArt } from '../components/PropertyArt';
import { ease, outCubic } from '../components/auth/motion';
import { LogoDraw } from '../components/LogoMark';
import { photoUrl, prefetchPhotos } from '../data/photos';

const TOTAL = 3600; // ms before we move on (tap anywhere to skip)

// A real house, a quiet reveal: the mark draws on deep pine, the photo eases in behind it and settles,
// then the name and tagline rise in. One easing curve, no springs, no bounce.
export function Splash({ onDone }: { onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [failed, setFailed] = useState(false);
  const photo = useSharedValue(0);
  const settle = useSharedValue(0);
  const bar = useSharedValue(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    // warm the image cache while the intro plays
    prefetchPhotos(['villa', 'modernWhite', 'cabin', 'cottage'], W);
    prefetchPhotos(['villa', 'townhouse', 'tower', 'cottage', 'loft', 'penthouse', 'rowhomes', 'bungalow'], 300);
    bar.set(withTiming(1, { duration: TOTAL, easing: Easing.inOut(Easing.quad) }));
    const t = setTimeout(onDone, TOTAL);
    return () => clearTimeout(t);
  }, [bar, onDone, W]);

  // Reveal the photo once it has loaded, but never before the mark has had a moment on its own.
  const reveal = useCallback(() => {
    const wait = Math.max(0, 800 - (Date.now() - startedAt.current));
    photo.set(withDelay(wait, withTiming(1, { duration: 1200, easing: ease })));
    settle.set(withDelay(wait, withTiming(1, { duration: 3200, easing: ease })));
  }, [photo, settle]);

  useEffect(() => {
    if (failed) reveal();
  }, [failed, reveal]);

  const photoStyle = useAnimatedStyle(() => ({ opacity: photo.value, transform: [{ scale: 1.1 - settle.value * 0.1 }] }));
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: bar.value }] }));

  return (
    <Pressable style={styles.root} onPress={onDone} accessibilityLabel="Skip intro">
      <StatusBar barStyle="light-content" />

      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        {failed ? (
          <PropertyArt kind="villa" tod="dusk" width={W} height={H} />
        ) : (
          <Image source={{ uri: photoUrl('litHouse', W) }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" onLoad={reveal} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
        )}
      </Animated.View>
      <LinearGradient
        colors={['rgba(5,14,12,0.6)', 'rgba(5,14,12,0.36)', 'rgba(5,14,12,0.5)', 'rgba(5,14,12,0.92)']}
        locations={[0, 0.3, 0.62, 1]}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />

      <View style={[styles.brand, { top: H * 0.33 }]}>
        <LogoDraw size={84} delay={250} duration={1100} color="#FFFFFF" accent="#FFB9A8" strokeWidth={5.5} />
        <Animated.Text entering={FadeInDown.duration(750).delay(1100).easing(outCubic)} style={styles.word}>
          {brand.name}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(750).delay(1400).easing(outCubic)} style={styles.tag}>
          {brand.tagline}
        </Animated.Text>
      </View>

      <View style={[styles.track, { bottom: insets.bottom + 40 }]}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A211F' },
  brand: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32 },
  word: { color: '#FFFFFF', fontSize: 46, fontWeight: '700', letterSpacing: -1.8, marginTop: 18 },
  tag: { color: 'rgba(255,255,255,0.78)', fontSize: 16, letterSpacing: 0.2, marginTop: 8, textAlign: 'center' },
  track: { position: 'absolute', alignSelf: 'center', width: 64, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFFFF', transformOrigin: 'left center' },
});
