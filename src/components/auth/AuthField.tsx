import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Animated, { FadeInDown, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon, IconName } from '../Icon';
import { ease, outCubic } from './motion';

type Props = TextInputProps & { icon: IconName; error?: string | null; password?: boolean };

// Quiet, frosted input: leading icon, a border that brightens on focus, an error tint that fades in.
export function AuthField({ icon, error, password, onFocus, onBlur, ...rest }: Props) {
  const focus = useSharedValue(0);
  const err = useSharedValue(0);
  const [hidden, setHidden] = useState(!!password);

  useEffect(() => {
    err.set(withTiming(error ? 1 : 0, { duration: 240, easing: outCubic }));
  }, [error, err]);

  const box = useAnimatedStyle(() => {
    const idle = interpolateColor(focus.value, [0, 1], ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.75)']);
    return {
      backgroundColor: interpolateColor(focus.value, [0, 1], ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.16)']),
      borderColor: interpolateColor(err.value, [0, 1], [idle, '#FF9C8A']),
    };
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.box, box]}>
        <View style={styles.icon}>
          <Icon name={icon} size={19} color="rgba(255,255,255,0.7)" strokeWidth={1.7} />
        </View>
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor="rgba(255,255,255,0.48)"
          selectionColor="#FFB9A8"
          keyboardAppearance="dark"
          onFocus={(e) => {
            focus.set(withTiming(1, { duration: 260, easing: ease }));
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.set(withTiming(0, { duration: 260, easing: ease }));
            onBlur?.(e);
          }}
          style={[styles.input, password && { paddingRight: 64 }]}
        />
        {password && (
          <Pressable hitSlop={12} onPress={() => setHidden((h) => !h)} style={styles.toggle} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Text style={styles.toggleText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        )}
      </Animated.View>
      {error ? (
        <Animated.Text entering={FadeInDown.duration(220).easing(outCubic)} style={styles.error}>
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  box: { height: 56, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  icon: { position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'center', pointerEvents: 'none' },
  input: { height: 56, paddingLeft: 46, paddingRight: 16, fontSize: 16, color: '#FFFFFF' },
  toggle: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  toggleText: { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '600' },
  error: { color: '#FFB4A6', fontSize: 13, marginTop: 6, marginLeft: 4 },
});
