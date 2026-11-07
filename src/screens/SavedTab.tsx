import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { PrimaryButton } from '../components/PrimaryButton';
import { PropertyArt } from '../components/PropertyArt';
import { RowCard } from '../components/PropertyCard';
import { SegmentedControl } from '../components/SegmentedControl';
import { useToast } from '../components/Toast';
import { AGENTS, byId } from '../data/properties';
import { Tour, useStore } from '../store';

const c = brand.colors;
const layout = LinearTransition.springify().damping(20).stiffness(190);

function Empty({ title, sub, cta, onPress, width }: { title: string; sub: string; cta: string; onPress: () => void; width: number }) {
  return (
    <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.empty}>
      <View style={styles.emptyArt}>
        <PropertyArt kind="interior" tod="dusk" width={width} height={180} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
      <View style={{ height: 16 }} />
      <PrimaryButton label={cta} onPress={onPress} />
    </Animated.View>
  );
}

function TourCard({ tour, onCancel }: { tour: Tour; onCancel: () => void }) {
  const p = byId(tour.propertyId);
  if (!p) return null;
  const agent = AGENTS.find((a) => a.id === p.agentId);
  return (
    <PressableScale scaleTo={0.98} onPress={() => router.push({ pathname: '/property/[id]', params: { id: p.id } })} style={styles.tour} accessibilityLabel={`Tour of ${p.title}`}>
      <View style={styles.date}>
        <Text style={styles.dateDow}>{tour.dow}</Text>
        <Text style={styles.dateNum}>{tour.num}</Text>
        <Text style={styles.dateMon}>{tour.month}</Text>
      </View>
      <View style={styles.tourBody}>
        <View style={styles.tourMeta}>
          <Icon name={tour.mode === 'Video call' ? 'video' : 'walk'} size={16} color={c.accent} />
          <Text style={styles.tourTime}>{tour.time}, {tour.mode}</Text>
        </View>
        <Text style={styles.tourTitle} numberOfLines={1}>{p.title}</Text>
        <Text style={styles.tourSub} numberOfLines={1}>{p.address}, with {agent?.name.split(' ')[0]}</Text>
        <View style={styles.tourFoot}>
          <Text style={styles.ref}>{tour.ref}</Text>
          <PressableScale haptic scaleTo={0.94} onPress={onCancel} style={styles.cancel} accessibilityLabel="Cancel tour">
            <Text style={styles.cancelText}>Cancel</Text>
          </PressableScale>
        </View>
      </View>
    </PressableScale>
  );
}

export function SavedTab({ onExplore }: { onExplore: () => void }) {
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { saved, tours, cancelTour } = useStore();
  const { show, node } = useToast();
  const [seg, setSeg] = useState(0);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const savedProps = saved.map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const cancelling = tours.find((t) => t.id === cancelId);
  const cancelProp = cancelling ? byId(cancelling.propertyId) : undefined;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 130, paddingHorizontal: 24 }}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.title}>Saved</Text>
          <Text style={styles.sub}>{savedProps.length} saved, {tours.length} {tours.length === 1 ? 'tour' : 'tours'} booked</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={{ marginTop: 18, marginBottom: 18 }}>
          <SegmentedControl options={['Homes', 'Tours']} index={seg} onChange={setSeg} />
        </Animated.View>

        {seg === 0 ? (
          savedProps.length === 0 ? (
            <Empty width={W - 48} title="Nothing saved yet" sub="Tap the heart on any home to keep it here." cta="Explore homes" onPress={onExplore} />
          ) : (
            <View style={{ gap: 14 }}>
              {savedProps.map((p, i) => (
                <Animated.View key={p.id} layout={layout} entering={FadeInDown.delay(i * 70).springify().damping(18)} exiting={FadeOut.duration(160)}>
                  <RowCard p={p} onPress={() => router.push({ pathname: '/property/[id]', params: { id: p.id } })} />
                </Animated.View>
              ))}
            </View>
          )
        ) : tours.length === 0 ? (
          <Empty width={W - 48} title="No tours booked" sub="Open a home and tap Book a viewing." cta="Browse homes" onPress={onExplore} />
        ) : (
          <View style={{ gap: 14 }}>
            {tours.map((t, i) => (
              <Animated.View key={t.id} layout={layout} entering={FadeInDown.delay(i * 70).springify().damping(18)} exiting={FadeOut.duration(160)}>
                <TourCard tour={t} onCancel={() => setCancelId(t.id)} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {node}

      <ConfirmDialog
        visible={cancelId !== null}
        tone="danger"
        icon="calendar"
        title="Cancel this tour?"
        message={`Your viewing of ${cancelProp?.title ?? 'this home'} will be released. You can book another time anytime.`}
        confirmLabel="Cancel tour"
        cancelLabel="Keep it"
        onConfirm={() => {
          if (cancelId) cancelTour(cancelId);
          setCancelId(null);
          show('Tour cancelled');
        }}
        onCancel={() => setCancelId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  title: { color: c.text, fontSize: 36, fontWeight: '800', letterSpacing: -1.4 },
  sub: { color: c.muted, fontSize: 15, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 10 },
  emptyArt: { borderRadius: 28, overflow: 'hidden', marginBottom: 20 },
  emptyTitle: { color: c.text, fontSize: 22, fontWeight: '800' },
  emptySub: { color: c.muted, fontSize: 15, marginTop: 4, textAlign: 'center' },
  tour: { flexDirection: 'row', gap: 14, padding: 10, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow },
  date: { width: 68, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  dateDow: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  dateNum: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -1, marginVertical: 1 },
  dateMon: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  tourBody: { flex: 1, gap: 3, justifyContent: 'center' },
  tourMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tourTime: { color: c.accent, fontSize: 13, fontWeight: '800' },
  tourTitle: { color: c.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  tourSub: { color: c.muted, fontSize: 13 },
  tourFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  ref: { color: c.muted, fontSize: 12, fontWeight: '600' },
  cancel: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: c.accentSoft },
  cancelText: { color: c.danger, fontSize: 13, fontWeight: '800' },
});
