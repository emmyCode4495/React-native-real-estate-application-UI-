import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { BottomSheet } from '../components/BottomSheet';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { PrimaryButton } from '../components/PrimaryButton';
import { FeaturedCard, RowCard } from '../components/PropertyCard';
import { PropertyArt } from '../components/PropertyArt';
import { SegmentedControl } from '../components/SegmentedControl';
import { Skeleton } from '../components/Skeleton';
import { Avatar } from '../components/Avatar';
import { PROPERTIES, PType, Property } from '../data/properties';
import { useStore } from '../store';

const c = brand.colors;
const TYPES: ('All' | PType)[] = ['All', 'House', 'Apartment', 'Villa', 'Loft'];
const BEDS = [0, 1, 2, 3, 4];
const MAX_SALE = [0, 500000, 1000000, 2000000];
const MAX_RENT = [0, 2500, 3000];
const layout = LinearTransition.springify().damping(20).stiffness(190);

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function maxLabel(v: number, rent: boolean) {
  if (v === 0) return 'Any';
  return rent ? `$${(v / 1000).toFixed(1)}K/mo` : v >= 1000000 ? `$${v / 1000000}M` : `$${v / 1000}K`;
}

function FeaturedItem({ p, index, scrollX, item, width }: { p: Property; index: number; scrollX: SharedValue<number>; item: number; width: number }) {
  const parallax = useDerivedValue(() => Math.min(1, Math.max(-1, (scrollX.value - index * item) / item)));
  const style = useAnimatedStyle(() => {
    const d = (scrollX.value - index * item) / item;
    return { transform: [{ scale: interpolate(d, [-1, 0, 1], [0.94, 1, 0.94], 'clamp') }] };
  });
  return (
    <Animated.View style={[{ marginRight: 16 }, style]}>
      <FeaturedCard p={p} width={width} parallax={parallax} onPress={() => router.push({ pathname: '/property/[id]', params: { id: p.id } })} />
    </Animated.View>
  );
}

function Loading() {
  return (
    <View style={styles.pad}>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
        <Skeleton width={280} height={330} radius={30} />
        <Skeleton width={60} height={330} radius={30} />
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
          <Skeleton width={104} height={104} radius={20} />
          <View style={{ flex: 1, gap: 10, paddingTop: 6 }}>
            <Skeleton width="70%" height={16} radius={8} />
            <Skeleton width="45%" height={12} radius={6} />
            <Skeleton width="55%" height={14} radius={7} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ExploreTab() {
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { profile } = useStore();
  const [mode, setMode] = useState(0); // 0 buy, 1 rent
  const [type, setType] = useState<'All' | PType>('All');
  const [q, setQ] = useState('');
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [draftBeds, setDraftBeds] = useState(0);
  const [draftMax, setDraftMax] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const first = profile.name ? profile.name.split(' ')[0] : 'there';
  const rent = mode === 1;
  const cardW = Math.min(280, W - 80);
  const item = cardW + 16;

  // "loading" is simulated: we show skeletons briefly whenever the result set changes.
  const refresh = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), 700);
  }, []);
  useEffect(() => {
    timer.current = setTimeout(() => setLoading(false), 1100);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const query = q.trim().toLowerCase();
  const list = PROPERTIES.filter(
    (p) =>
      p.listing === (rent ? 'rent' : 'sale') &&
      (type === 'All' || p.type === type) &&
      p.beds >= beds &&
      (maxPrice === 0 || p.price <= maxPrice) &&
      (query === '' || `${p.title} ${p.hood} ${p.address}`.toLowerCase().includes(query)),
  );
  const featured = list.slice(0, 4);
  const activeFilters = (beds > 0 ? 1 : 0) + (maxPrice > 0 ? 1 : 0);
  const openDetail = (id: string) => router.push({ pathname: '/property/[id]', params: { id } });

  const openSheet = () => {
    setDraftBeds(beds);
    setDraftMax(maxPrice);
    setSheet(true);
  };
  const draftCount = PROPERTIES.filter(
    (p) => p.listing === (rent ? 'rent' : 'sale') && (type === 'All' || p.type === type) && p.beds >= draftBeds && (draftMax === 0 || p.price <= draftMax),
  ).length;
  const apply = () => {
    setBeds(draftBeds);
    setMaxPrice(draftMax);
    setSheet(false);
    refresh();
  };

  const scale = useSharedValue(1);
  const searchStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 130 }}>
        <Animated.View entering={FadeIn.duration(450)} style={[styles.pad, styles.header]}>
          <View style={styles.flex}>
            <Text style={styles.hello}>{greeting()}, {first}</Text>
            <View style={styles.loc}>
              <Icon name="pin" size={15} color={c.accent} />
              <Text style={styles.locText}>Marlow Bay</Text>
            </View>
          </View>
          <Avatar name={profile.name || 'Guest'} color={c.primary} size={44} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(80).springify().damping(18)} style={[styles.pad, styles.title]}>
          Find your{'\n'}next home
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(160).springify().damping(18)} style={[styles.pad, styles.searchRow]}>
          <Animated.View style={[styles.search, searchStyle]}>
            <Icon name="search" size={20} color={c.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search area, street or name"
              placeholderTextColor={c.muted}
              selectionColor={c.accent}
              style={styles.input}
              onFocus={() => scale.set(withSpring(1.015, { damping: 14 }))}
              onBlur={() => scale.set(withSpring(1, { damping: 14 }))}
              returnKeyType="search"
            />
          </Animated.View>
          <PressableScale haptic scaleTo={0.9} onPress={openSheet} style={styles.filterBtn} accessibilityLabel="Filters">
            <Icon name="filter" size={22} color="#fff" />
            {activeFilters > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilters}</Text>
              </View>
            )}
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(230).springify().damping(18)} style={[styles.pad, { marginTop: 16 }]}>
          <SegmentedControl options={['Buy', 'Rent']} index={mode} onChange={(i) => { setMode(i); setBeds(0); setMaxPrice(0); refresh(); }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(18)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {TYPES.map((t) => (
              <Chip key={t} label={t} compact selected={type === t} onPress={() => { setType(t); refresh(); }} />
            ))}
          </ScrollView>
        </Animated.View>

        {loading ? (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ marginTop: 22 }}>
            <Loading />
          </Animated.View>
        ) : list.length === 0 ? (
          <Animated.View entering={FadeInDown.springify().damping(16)} style={[styles.pad, styles.empty]}>
            <View style={styles.emptyArt}>
              <PropertyArt kind="interior" tod="day" width={W - 48} height={170} />
            </View>
            <Text style={styles.emptyTitle}>No homes match yet</Text>
            <Text style={styles.emptySub}>Try a wider area or fewer filters.</Text>
            <View style={{ height: 14 }} />
            <PrimaryButton label="Clear filters" onPress={() => { setType('All'); setBeds(0); setMaxPrice(0); setQ(''); refresh(); }} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={[styles.pad, styles.sectionRow]}>
              <Text style={styles.section}>Featured</Text>
              <Text style={styles.count}>{list.length} {list.length === 1 ? 'home' : 'homes'}</Text>
            </View>
            <Animated.ScrollView horizontal snapToInterval={item} decelerationRate="fast" showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 18 }}>
              {featured.map((p, i) => (
                <FeaturedItem key={p.id} p={p} index={i} scrollX={scrollX} item={item} width={cardW} />
              ))}
            </Animated.ScrollView>

            <Text style={[styles.pad, styles.section, { marginTop: 8, marginBottom: 12 }]}>Fresh listings</Text>
            <View style={[styles.pad, { gap: 14 }]}>
              {list.map((p, i) => (
                <Animated.View key={p.id} layout={layout} entering={FadeInDown.delay(80 + i * 70).springify().damping(18)} exiting={FadeOut.duration(120)}>
                  <RowCard p={p} onPress={() => openDetail(p.id)} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <BottomSheet visible={sheet} title="Filters" onClose={() => setSheet(false)}>
        <Text style={styles.fLabel}>Bedrooms</Text>
        <View style={styles.fRow}>
          {BEDS.map((b) => (
            <Chip key={b} compact label={b === 0 ? 'Any' : `${b}+`} selected={draftBeds === b} onPress={() => setDraftBeds(b)} />
          ))}
        </View>
        <Text style={[styles.fLabel, { marginTop: 18 }]}>Max price</Text>
        <View style={styles.fRow}>
          {(rent ? MAX_RENT : MAX_SALE).map((m) => (
            <Chip key={m} compact label={maxLabel(m, rent)} selected={draftMax === m} onPress={() => setDraftMax(m)} />
          ))}
        </View>
        <View style={{ height: 22 }} />
        <PrimaryButton label={`Show ${draftCount} ${draftCount === 1 ? 'home' : 'homes'}`} disabled={draftCount === 0} onPress={apply} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  pad: { paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center' },
  hello: { color: c.muted, fontSize: 15, fontWeight: '600' },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  locText: { color: c.text, fontSize: 16, fontWeight: '800' },
  title: { color: c.text, fontSize: 40, fontWeight: '800', letterSpacing: -1.6, lineHeight: 42, marginTop: 18 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  search: { flex: 1, height: 54, borderRadius: 27, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, ...brand.shadow, shadowOpacity: 0.08 },
  input: { flex: 1, fontSize: 16, color: c.text, paddingVertical: 0 },
  filterBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chips: { paddingHorizontal: 24, gap: 10, paddingTop: 14, paddingBottom: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  section: { color: c.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  count: { color: c.muted, fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 24 },
  emptyArt: { borderRadius: 28, overflow: 'hidden', marginBottom: 18 },
  emptyTitle: { color: c.text, fontSize: 22, fontWeight: '800' },
  emptySub: { color: c.muted, fontSize: 15, marginTop: 4 },
  fLabel: { color: c.muted, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  fRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
