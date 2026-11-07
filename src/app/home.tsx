import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { TabBar } from '../components/TabBar';
import { ExploreTab } from '../screens/ExploreTab';
import { MapTab } from '../screens/MapTab';
import { ProfileTab } from '../screens/ProfileTab';
import { SavedTab } from '../screens/SavedTab';
import { useStore } from '../store';

// Tab shell. A tab mounts the first time it is opened, then stays mounted (state and scroll are kept).
export default function Home() {
  const insets = useSafeAreaInsets();
  const { saved } = useStore();
  const [tab, setTab] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const go = (i: number) => {
    setTab(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };
  const pane = (i: number) => [styles.pane, tab !== i && styles.hidden];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={pane(0)}>
        <ExploreTab />
      </View>
      {visited.includes(1) && (
        <Animated.View entering={FadeIn.duration(250)} style={pane(1)}>
          <MapTab />
        </Animated.View>
      )}
      {visited.includes(2) && (
        <Animated.View entering={FadeIn.duration(250)} style={pane(2)}>
          <SavedTab onExplore={() => go(0)} />
        </Animated.View>
      )}
      {visited.includes(3) && (
        <Animated.View entering={FadeIn.duration(250)} style={pane(3)}>
          <ProfileTab />
        </Animated.View>
      )}
      <TabBar active={tab} onChange={go} bottom={insets.bottom + 12} savedCount={saved.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.colors.bg },
  pane: { ...StyleSheet.absoluteFill },
  hidden: { display: 'none' },
});
