import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { brand } from '../brand';

const c = brand.colors;

// Shimmering placeholder. Used instead of spinners while "loading" lists.
export function Skeleton({ width = '100%', height, radius = 14, style }: { width?: DimensionValue; height: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [x]);
  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: -260 + x.value * 620 }] }));
  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: c.surfaceAlt, overflow: 'hidden' }, style]}>
      <Animated.View style={[styles.sweep, sweep]}>
        <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ sweep: { position: 'absolute', top: 0, bottom: 0, width: 200 } });
