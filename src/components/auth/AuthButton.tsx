import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { brand } from '../../brand';
import { HouseLoader } from '../LogoMark';
import { ease, outCubic } from './motion';

const c = brand.colors;

type Props = { label: string; onPress: () => void; loading?: boolean; disabled?: boolean };

// Main action, in the app's pine green with a soft top highlight so it reads on glass. Presses sink and dim with a timed ease, never a spring.
export function AuthButton({ label, onPress, loading, disabled }: Props) {
  const p = useSharedValue(0);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 - p.value * 0.025 }], opacity: 1 - p.value * 0.14 }));
  return (
    <View style={{ opacity: disabled ? 0.5 : 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={() => {
          p.set(withTiming(1, { duration: 120, easing: outCubic }));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => p.set(withTiming(0, { duration: 260, easing: ease }))}
      >
        <Animated.View style={[styles.btn, a]}>
          <LinearGradient colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']} locations={[0, 0.7]} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} />
          {loading ? (
            <HouseLoader size={28} color="#FFFFFF" accent={c.sage} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { height: 56, borderRadius: 18, backgroundColor: c.primary, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: c.primary, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  label: { color: '#FFFFFF', fontSize: 16.5, fontWeight: '700', letterSpacing: 0.1 },
});
