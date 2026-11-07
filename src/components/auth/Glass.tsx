import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';

// Real iOS "liquid glass" where the OS supports it, a dark frosted-look surface everywhere else.
function glassSupported() {
  try {
    return Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}
const HAS_GLASS = glassSupported();

type Props = {
  radius?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

// Do not animate `opacity` on a parent of this: glass can render wrong under a translucent ancestor.
export function Glass({ radius = 28, interactive, style, children }: Props) {
  if (HAS_GLASS) {
    return (
      <GlassView glassEffectStyle="regular" tintColor="rgba(8,22,19,0.38)" isInteractive={interactive} style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
        {children}
      </GlassView>
    );
  }
  return <View style={[{ borderRadius: radius, overflow: 'hidden' }, styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: 'rgba(10,24,21,0.62)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.22)' },
});
