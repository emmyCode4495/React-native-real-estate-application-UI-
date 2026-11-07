import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { brand } from '../brand';
import { Icon, IconName } from './Icon';
import { PressableScale } from './PressableScale';

const c = brand.colors;
export const TABS: { label: string; icon: IconName; labelW: number }[] = [
  { label: 'Explore', icon: 'compass', labelW: 58 },
  { label: 'Map', icon: 'map', labelW: 36 },
  { label: 'Saved', icon: 'heart', labelW: 44 },
  { label: 'Profile', icon: 'user', labelW: 50 },
];

function Item({ tab, active, badge, onPress }: { tab: (typeof TABS)[number]; active: boolean; badge?: number; onPress: () => void }) {
  const a = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    a.value = withSpring(active ? 1 : 0, { damping: 16, stiffness: 210 });
  }, [active, a]);
  const box = useAnimatedStyle(() => ({
    width: 50 + a.value * (tab.labelW + 6),
    backgroundColor: interpolateColor(a.value, [0, 1], ['rgba(15,74,60,0)', c.primary]),
  }));
  const label = useAnimatedStyle(() => ({ opacity: a.value, width: a.value * tab.labelW }));
  return (
    <PressableScale scaleTo={0.92} onPress={onPress} accessibilityLabel={tab.label}>
      <Animated.View style={[styles.item, box]}>
        <Icon name={tab.icon} size={22} color={active ? '#FFFFFF' : c.muted} />
        <Animated.View style={[styles.labelWrap, label]}>
          <Text style={styles.label} numberOfLines={1}>
            {tab.label}
          </Text>
        </Animated.View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </Animated.View>
    </PressableScale>
  );
}

type Props = { active: number; onChange: (i: number) => void; bottom: number; savedCount: number };

export function TabBar({ active, onChange, bottom, savedCount }: Props) {
  return (
    <Animated.View entering={FadeInUp.delay(700).springify().damping(16)} style={[styles.bar, { bottom }]}>
      {TABS.map((t, i) => (
        <Item
          key={t.label}
          tab={t}
          active={active === i}
          badge={t.label === 'Saved' && active !== i ? savedCount : undefined}
          onPress={() => {
            if (i !== active) Haptics.selectionAsync();
            onChange(i);
          }}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, padding: 7, borderRadius: 36, backgroundColor: c.surface, zIndex: 5, ...brand.shadow, shadowOpacity: 0.18 },
  item: { height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  labelWrap: { overflow: 'hidden' },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginLeft: 7 },
  badge: { position: 'absolute', top: 5, right: 8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
