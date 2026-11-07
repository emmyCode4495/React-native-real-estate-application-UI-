import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ease, outCubic } from './motion';

function AppleMark({ size = 20, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </Svg>
  );
}

function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <Path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </Svg>
  );
}

function SocialButton({ kind, onPress }: { kind: 'apple' | 'google'; onPress: () => void }) {
  const p = useSharedValue(0);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 - p.value * 0.03 }], opacity: 1 - p.value * 0.14 }));
  const apple = kind === 'apple';
  return (
    <Pressable
      style={styles.flex}
      accessibilityRole="button"
      accessibilityLabel={apple ? 'Continue with Apple' : 'Continue with Google'}
      onPress={onPress}
      onPressIn={() => {
        p.set(withTiming(1, { duration: 120, easing: outCubic }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => p.set(withTiming(0, { duration: 260, easing: ease }))}
    >
      <Animated.View style={[styles.btn, apple ? styles.apple : styles.google, a]}>
        {apple ? <AppleMark color="#000000" /> : <GoogleMark />}
        <Text style={[styles.label, { color: apple ? '#000000' : '#FFFFFF' }]}>{apple ? 'Apple' : 'Google'}</Text>
      </Animated.View>
    </Pressable>
  );
}

// Two equal buttons: Apple in solid white, Google in a dark glass tile with the four-colour G.
// Hook the onPress props up to expo-apple-authentication / Google Sign-In when you add a backend.
export function SocialButtons({ onApple, onGoogle }: { onApple: () => void; onGoogle: () => void }) {
  return (
    <View style={styles.row}>
      <SocialButton kind="apple" onPress={onApple} />
      <SocialButton kind="google" onPress={onGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  btn: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  apple: { backgroundColor: '#FFFFFF' },
  google: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  label: { fontSize: 15.5, fontWeight: '600', letterSpacing: 0.1 },
});
