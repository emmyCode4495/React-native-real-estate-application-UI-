import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  ZoomIn,
  ZoomOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAP_H, MAP_W, mapSvg } from '../art/map';
import { brand } from '../brand';
import { HeartButton } from '../components/HeartButton';
import { PressableScale } from '../components/PressableScale';
import { PropertyPhoto } from '../components/PropertyPhoto';
import { SegmentedControl } from '../components/SegmentedControl';
import { Specs } from '../components/PropertyCard';
import { PROPERTIES, Property } from '../data/properties';
import { priceFull, priceShort } from '../format';
import { useStore } from '../store';

const c = brand.colors;
const MAP_XML = mapSvg();
const GAP = 12;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function Pin({ p, selected, index, onPress }: { p: Property; selected: boolean; index: number; onPress: () => void }) {
  const s = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(selected ? 1 : 0, { damping: 10, stiffness: 200 });
  }, [selected, s]);
  const scale = useAnimatedStyle(() => ({ transform: [{ scale: 1 + s.value * 0.2 }, { translateY: -s.value * 4 }] }));
  const bg = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(s.value, [0, 1], ['#FFFFFF', c.primary]) }));
  const text = useAnimatedStyle(() => ({ color: interpolateColor(s.value, [0, 1], [c.text, '#FFFFFF']) }));
  return (
    <Animated.View
      entering={ZoomIn.delay(250 + index * 90).springify().damping(11)}
      exiting={ZoomOut.duration(140)}
      style={[styles.pinPos, { left: p.map.x, top: p.map.y, zIndex: selected ? 10 : 1 }]}
    >
      <PressableScale haptic scaleTo={0.92} onPress={onPress} accessibilityLabel={`${p.title}, ${priceFull(p)}`}>
        <Animated.View style={[styles.pinWrap, scale]}>
          <Animated.View style={[styles.pin, bg]}>
            <Animated.Text style={[styles.pinText, text]}>{priceShort(p)}</Animated.Text>
          </Animated.View>
          <Animated.View style={[styles.pinTip, bg]} />
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

function YouAreHere({ x, y }: { x: number; y: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false);
  }, [r]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - r.value), transform: [{ scale: 0.6 + r.value * 2.6 }] }));
  return (
    <View style={[styles.here, { left: x - 30, top: y - 30 }]} pointerEvents="none">
      <Animated.View style={[styles.hereRing, ring]} />
      <View style={styles.hereDot} />
    </View>
  );
}

export function MapTab() {
  const insets = useSafeAreaInsets();
  const { width: VW, height: VH } = useWindowDimensions();
  const { saved, toggleSave } = useStore();
  const [mode, setMode] = useState(0);
  const list = PROPERTIES.filter((p) => p.listing === (mode === 0 ? 'sale' : 'rent'));
  const [selId, setSelId] = useState(list[0].id);
  const sel = list.find((p) => p.id === selId) ?? list[0];

  const minX = Math.min(0, VW - MAP_W);
  const minY = Math.min(0, VH - MAP_H);
  const targetFor = (p: Property) => ({ x: clamp(VW / 2 - p.map.x, minX, 0), y: clamp(VH * 0.34 - p.map.y, minY, 0) });
  const start = targetFor(list[0]);
  const tx = useSharedValue(start.x);
  const ty = useSharedValue(start.y);
  const sx = useSharedValue(0);
  const sy = useSharedValue(0);
  const scroller = useRef<Animated.ScrollView>(null);
  const cardW = VW - 72;

  const focus = (p: Property) => {
    const t = targetFor(p);
    tx.set(withSpring(t.x, { damping: 22, stiffness: 110 }));
    ty.set(withSpring(t.y, { damping: 22, stiffness: 110 }));
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      sx.set(tx.get());
      sy.set(ty.get());
    })
    .onUpdate((e) => {
      tx.set(Math.min(0, Math.max(minX, sx.get() + e.translationX)));
      ty.set(Math.min(0, Math.max(minY, sy.get() + e.translationY)));
    })
    .onEnd((e) => {
      tx.set(withDecay({ velocity: e.velocityX, clamp: [minX, 0] }));
      ty.set(withDecay({ velocity: e.velocityY, clamp: [minY, 0] }));
    });

  const mapStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));

  const select = (p: Property, scroll: boolean) => {
    setSelId(p.id);
    focus(p);
    if (scroll) scroller.current?.scrollTo({ x: list.findIndex((x) => x.id === p.id) * (cardW + GAP), animated: true });
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + GAP));
    const p = list[clamp(i, 0, list.length - 1)];
    if (p && p.id !== sel.id) select(p, false);
  };

  const changeMode = (i: number) => {
    setMode(i);
    const next = PROPERTIES.filter((p) => p.listing === (i === 0 ? 'sale' : 'rent'));
    setSelId(next[0].id);
    const t = targetFor(next[0]);
    tx.set(withSpring(t.x, { damping: 22, stiffness: 110 }));
    ty.set(withSpring(t.y, { damping: 22, stiffness: 110 }));
    scroller.current?.scrollTo({ x: 0, animated: false });
  };

  return (
    <View style={styles.screen}>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[{ width: MAP_W, height: MAP_H }, mapStyle]}>
            <SvgXml xml={MAP_XML} width={MAP_W} height={MAP_H} />
            <YouAreHere x={450} y={560} />
            {list.map((p, i) => (
              <Pin key={p.id} p={p} index={i} selected={p.id === sel.id} onPress={() => select(p, true)} />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>

      <Animated.View entering={FadeIn.delay(150)} style={[styles.top, { top: insets.top + 10 }]} pointerEvents="box-none">
        <View style={styles.topCard}>
          <SegmentedControl options={['Buy', 'Rent']} index={mode} onChange={changeMode} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scroller}
        horizontal
        snapToInterval={cardW + GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={[styles.cards, { bottom: insets.bottom + 92 }]}
        contentContainerStyle={{ paddingHorizontal: 36 }}
      >
        {list.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInUp.delay(300 + i * 80).springify().damping(16)} style={{ marginRight: GAP }}>
            <PressableScale scaleTo={0.97} onPress={() => router.push({ pathname: '/property/[id]', params: { id: p.id } })} style={[styles.card, { width: cardW }]} accessibilityLabel={p.title}>
              <View style={styles.thumb}>
                <PropertyPhoto photo={p.photo} kind={p.kind} tod={p.tod} width={96} height={96} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{p.title}</Text>
                <Text style={styles.cardLoc} numberOfLines={1}>{p.hood}</Text>
                <Specs p={p} size={12} />
                <Text style={styles.cardPrice}>{priceFull(p)}</Text>
              </View>
              <View style={styles.cardHeart}>
                <HeartButton saved={saved.includes(p.id)} onToggle={() => toggleSave(p.id)} size={34} />
              </View>
            </PressableScale>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EBE1CF', overflow: 'hidden' },
  pinPos: { position: 'absolute', marginLeft: -40, marginTop: -50 },
  pinWrap: { alignItems: 'center' },
  pin: { height: 34, paddingHorizontal: 13, borderRadius: 17, alignItems: 'center', justifyContent: 'center', ...brand.shadow, shadowOpacity: 0.22, shadowRadius: 10 },
  pinTip: { width: 12, height: 12, marginTop: -6, transform: [{ rotate: '45deg' }], borderRadius: 2 },
  pinText: { fontSize: 14, fontWeight: '800' },
  here: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  hereRing: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: '#3B82F6' },
  hereDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#3B82F6', borderWidth: 3, borderColor: '#fff' },
  top: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  topCard: { width: 220, padding: 5, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow },
  cards: { position: 'absolute', left: 0, right: 0 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.18 },
  thumb: { borderRadius: 20, overflow: 'hidden' },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { color: c.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3, paddingRight: 34 },
  cardLoc: { color: c.muted, fontSize: 13 },
  cardPrice: { color: c.primary, fontSize: 16, fontWeight: '800', marginTop: 2 },
  cardHeart: { position: 'absolute', top: 10, right: 10 },
});
