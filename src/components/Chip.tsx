import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { brand } from '../brand';
import { PressableScale } from './PressableScale';

const c = brand.colors;

type Props = { label: string; selected: boolean; onPress: () => void; disabled?: boolean; compact?: boolean; flex?: boolean };

export function Chip({ label, selected, onPress, disabled, compact, flex }: Props) {
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(selected ? 1 : 0, { damping: 15, stiffness: 240 });
  }, [selected, p]);
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [c.surface, c.primary]),
    borderColor: interpolateColor(p.value, [0, 1], [c.line, c.primary]),
  }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [c.text, '#FFFFFF']) }));
  return (
    <PressableScale haptic scaleTo={0.94} disabled={disabled} onPress={onPress} accessibilityLabel={label} containerStyle={flex ? styles.flex : undefined}>
      <Animated.View style={[styles.chip, compact && styles.compact, disabled && styles.disabled, box]}>
        <Animated.Text style={[styles.text, compact && { fontSize: 13 }, text, disabled && { textDecorationLine: 'line-through' }]}>{label}</Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: { height: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  compact: { height: 38, paddingHorizontal: 15 },
  disabled: { opacity: 0.4 },
  text: { fontSize: 15, fontWeight: '700' },
});
