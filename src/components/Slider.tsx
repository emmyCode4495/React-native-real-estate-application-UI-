import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { brand } from '../brand';

const c = brand.colors;
const THUMB = 28;

function clamp01(v: number) {
  'worklet';
  return Math.min(1, Math.max(0, v));
}

type Props = { value: SharedValue<number>; width: number; color?: string; onEnd?: (v: number) => void };

// Draggable slider whose value (0..1) lives in a shared value, so everything derived from it can
// update on the UI thread while the finger moves.
export function Slider({ value, width, color = c.primary, onEnd }: Props) {
  const active = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      active.value = withSpring(1, { damping: 14, stiffness: 260 });
    })
    .onUpdate((e) => {
      value.set(clamp01(e.x / width));
    })
    .onFinalize(() => {
      active.value = withSpring(0, { damping: 14, stiffness: 260 });
      if (onEnd) runOnJS(onEnd)(value.value);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const v = clamp01(e.x / width);
    value.set(withSpring(v, { damping: 18, stiffness: 220 }));
    if (onEnd) runOnJS(onEnd)(v);
  });

  const fill = useAnimatedStyle(() => ({ width: value.value * width }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: value.value * width - THUMB / 2 }, { scale: 1 + active.value * 0.18 }] }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={[styles.hit, { width }]}>
        <View style={styles.track} />
        <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />
        <Animated.View style={[styles.thumb, { borderColor: color }, thumb]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: { height: 40, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: c.surfaceAlt },
  fill: { position: 'absolute', left: 0, height: 6, borderRadius: 3 },
  thumb: { position: 'absolute', left: 0, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#fff', borderWidth: 3, shadowColor: '#14231F', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
});
