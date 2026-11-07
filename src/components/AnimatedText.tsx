import React from 'react';
import { StyleProp, TextInput, TextStyle } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

// Text driven by a shared value on the UI thread (no React re-renders while sliding).
export function AnimatedText({ text, initial, style }: { text: SharedValue<string>; initial: string; style?: StyleProp<TextStyle> }) {
  const animatedProps = useAnimatedProps(() => ({ text: text.value, defaultValue: text.value }) as any);
  return <AnimatedInput editable={false} pointerEvents="none" underlineColorAndroid="transparent" defaultValue={initial} animatedProps={animatedProps} style={style} />;
}
