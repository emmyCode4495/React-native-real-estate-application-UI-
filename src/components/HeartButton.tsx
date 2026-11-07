import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { brand } from '../brand';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

const c = brand.colors;
const BURST = require('../../assets/lottie/heart-burst.json');

type Props = { saved: boolean; onToggle: () => void; size?: number };

// Tap to save. Saving plays the authored heart burst; un-saving just deflates.
export function HeartButton({ saved, onToggle, size = 40 }: Props) {
  const [burstKey, setBurstKey] = useState(0);
  const pop = useSharedValue(0);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pop.value * 0.28 }] }));

  return (
    <View style={{ width: size, height: size }}>
      <PressableScale
        haptic
        scaleTo={0.88}
        accessibilityLabel={saved ? 'Remove from saved' : 'Save home'}
        onPress={() => {
          if (!saved) {
            setBurstKey((k) => k + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          pop.set(withSequence(withTiming(1, { duration: 110 }), withSpring(0, { damping: 6, stiffness: 220 })));
          onToggle();
        }}
        style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Animated.View style={popStyle}>
          <Icon name="heart" size={size * 0.52} color={saved ? c.accent : c.text} fill={saved ? c.accent : 'none'} />
        </Animated.View>
      </PressableScale>
      {burstKey > 0 && (
        <LottieView key={burstKey} source={BURST} autoPlay loop={false} style={[styles.burst, { left: (size - 110) / 2, top: (size - 110) / 2 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  burst: { position: 'absolute', width: 110, height: 110, pointerEvents: 'none' },
});
