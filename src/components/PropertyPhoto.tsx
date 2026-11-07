import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Kind, Tod } from '../art/scenes';
import { PhotoKey, photoUrl } from '../data/photos';
import { Skeleton } from './Skeleton';
import { PropertyArt } from './PropertyArt';

type Props = {
  photo: PhotoKey;
  width: number;
  height: number;
  // the illustration shown if the photo cannot load (offline, blocked CDN, bad id)
  kind: Kind;
  tod: Tod;
  // -1..1 slide offset for the detail gallery
  parallax?: SharedValue<number>;
  // slow zoom, used on heroes
  kenBurns?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PropertyPhoto({ photo, width, height, kind, tod, parallax, kenBurns, style }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const zoom = useSharedValue(0);

  useEffect(() => {
    if (!kenBurns) return;
    zoom.value = withRepeat(withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [kenBurns, zoom]);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (parallax ? parallax.value : 0) * -14 }, { scale: 1 + (parallax ? 0.12 : 0) + zoom.value * 0.08 }],
  }));

  if (failed) return <PropertyArt kind={kind} tod={tod} width={width} height={height} style={style} />;

  return (
    <View style={[{ width, height, overflow: 'hidden', backgroundColor: '#E7DDCD' }, style]}>
      {!loaded && height >= 150 && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width={width} height={height} radius={0} />
        </View>
      )}
      <Animated.View style={[StyleSheet.absoluteFill, imgStyle]}>
        <Image
          source={{ uri: photoUrl(photo, width) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={350}
          cachePolicy="memory-disk"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
    </View>
  );
}

function CycleLayer({ index, count, t, children }: { index: number; count: number; t: SharedValue<number>; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    if (index === 0) return { opacity: 1 };
    const d = Math.abs(t.value - index / count);
    const near = Math.min(d, 1 - d);
    return { opacity: Math.max(0, 1 - near * count * 1.6) };
  });
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

// Several photos that crossfade on a slow loop, each with a gentle zoom.
export function PhotoCycle({ photos, width, height, kind, tod, seconds = 7, style }: { photos: PhotoKey[]; width: number; height: number; kind: Kind; tod: Tod; seconds?: number; style?: StyleProp<ViewStyle> }) {
  const t = useSharedValue(0);
  const list = photos.slice(0, 3);
  const n = list.length;
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: seconds * n * 1000, easing: Easing.linear }), -1, false);
  }, [t, seconds, n]);

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      {list.map((p, i) => (
        <CycleLayer key={p} index={i} count={n} t={t}>
          <PropertyPhoto photo={p} width={width} height={height} kind={kind} tod={tod} kenBurns />
        </CycleLayer>
      ))}
    </View>
  );
}
