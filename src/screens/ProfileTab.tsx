import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { AnimatedText } from '../components/AnimatedText';
import { Avatar } from '../components/Avatar';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Field } from '../components/Field';
import { Icon, IconName } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { PrimaryButton } from '../components/PrimaryButton';
import { Slider } from '../components/Slider';
import { Toggle } from '../components/Toggle';
import { useToast } from '../components/Toast';
import { money } from '../format';
import { Settings, useStore } from '../store';

const c = brand.colors;
const MIN = 200000;
const MAX = 2000000;

function moneyW(n: number) {
  'worklet';
  return '$' + Math.round(n / 10000) * 10000 + '';
}
function commas(s: string) {
  'worklet';
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function Row({ icon, title, sub, right, onPress, tint = c.primary }: { icon: IconName; title: string; sub?: string; right: React.ReactNode; onPress?: () => void; tint?: string }) {
  const body = (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint + '1A' }]}>
        <Icon name={icon} size={21} color={tint} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.rowTitle, tint === c.danger && { color: c.danger }]}>{title}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
  return onPress ? (
    <PressableScale haptic scaleTo={0.98} onPress={onPress} accessibilityLabel={title}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

export function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { profile, saved, tours, viewed, settings, setSetting, setProfile, budget, setBudget } = useStore();
  const { show, node } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftErr, setDraftErr] = useState<string | null>(null);
  const [logout, setLogout] = useState(false);
  const [sliderW, setSliderW] = useState(0);
  const v = useSharedValue((budget - MIN) / (MAX - MIN));
  const label = useDerivedValue(() => commas(moneyW(MIN + v.value * (MAX - MIN))));

  const name = profile.name || 'Guest';
  const toggle = (k: keyof Settings, text: string) => (on: boolean) => {
    setSetting(k, on);
    show(`${text} ${on ? 'on' : 'off'}`);
  };
  const saveName = () => {
    if (draft.trim().length < 2) return setDraftErr('Enter at least 2 characters.');
    setProfile({ ...profile, name: draft.trim() });
    setEditOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    show('Profile updated');
  };

  const stat = (n: number, l: string, i: number) => (
    <Animated.View key={l} entering={ZoomIn.delay(250 + i * 90).springify().damping(12)} style={styles.stat}>
      <Text style={styles.statNum}>{n}</Text>
      <Text style={styles.statLabel}>{l}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 130, paddingHorizontal: 24 }}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.head}>
          <Avatar name={name} color={c.primary} size={72} />
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.email} numberOfLines={1}>{profile.email || 'Haven member'}</Text>
          </View>
          <PressableScale haptic scaleTo={0.9} accessibilityLabel="Edit name" style={styles.editBtn} onPress={() => { setDraft(profile.name); setDraftErr(null); setEditOpen(true); }}>
            <Icon name="user" size={20} color={c.text} />
          </PressableScale>
        </Animated.View>

        <View style={styles.stats}>
          {stat(saved.length, 'Saved', 0)}
          {stat(tours.length, 'Tours', 1)}
          {stat(viewed.length, 'Viewed', 2)}
        </View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(16)} style={styles.card}>
          <Text style={styles.cardLabel}>Your buying budget</Text>
          <AnimatedText text={label} initial={money(budget)} style={styles.budget} />
          <Text style={styles.cardSub}>We flag homes within this budget on Explore.</Text>
          <View style={{ height: 8 }} onLayout={(e) => setSliderW(e.nativeEvent.layout.width)} />
          {sliderW > 0 && (
            <Slider
              value={v}
              width={sliderW}
              onEnd={(x) => {
                setBudget(Math.round((MIN + x * (MAX - MIN)) / 10000) * 10000);
                Haptics.selectionAsync();
              }}
            />
          )}
          <View style={styles.range}>
            <Text style={styles.rangeText}>$200K</Text>
            <Text style={styles.rangeText}>$2M</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify().damping(16)} style={styles.group}>
          <Row icon="tag" title="Price drop alerts" sub="When a saved home gets cheaper" right={<Toggle value={settings.priceAlerts} onChange={toggle('priceAlerts', 'Price alerts')} />} />
          <View style={styles.sep} />
          <Row icon="bell" title="New listings" sub="Homes that match your search" right={<Toggle value={settings.newListings} onChange={toggle('newListings', 'New listing alerts')} />} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).springify().damping(16)} style={styles.group}>
          <Row icon="mail" title="Contact support" sub="We usually reply within a day" right={<Icon name="chevron" size={20} color={c.muted} />} onPress={() => Linking.openURL('mailto:hello@haven.example').catch(() => show('No mail app found'))} />
          <View style={styles.sep} />
          <Row icon="logout" title="Log out" tint={c.danger} right={<Icon name="chevron" size={20} color={c.danger} />} onPress={() => setLogout(true)} />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(700)} style={styles.version}>Haven 1.0, demo build</Animated.Text>
      </ScrollView>

      {node}

      <BottomSheet visible={editOpen} title="Edit name" onClose={() => setEditOpen(false)}>
        <Field label="Full name" value={draft} onChangeText={(t) => { setDraft(t); if (draftErr) setDraftErr(null); }} error={draftErr} autoCapitalize="words" returnKeyType="done" />
        <View style={{ height: 6 }} />
        <PrimaryButton label="Save" onPress={saveName} />
      </BottomSheet>

      <ConfirmDialog
        visible={logout}
        tone="danger"
        icon="logout"
        title="Log out of Haven?"
        message="Your saved homes and tours stay on this device while the demo is open."
        confirmLabel="Log out"
        onConfirm={() => { setLogout(false); router.replace('/welcome'); }}
        onCancel={() => setLogout(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { color: c.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.8 },
  email: { color: c.muted, fontSize: 14, marginTop: 3 },
  editBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', ...brand.shadow, shadowOpacity: 0.08 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 22 },
  stat: { flex: 1, paddingVertical: 16, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', ...brand.shadow, shadowOpacity: 0.07 },
  statNum: { color: c.primary, fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statLabel: { color: c.muted, fontSize: 13, fontWeight: '600', marginTop: 2 },
  card: { marginTop: 18, padding: 20, borderRadius: 28, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.08 },
  cardLabel: { color: c.muted, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  budget: { color: c.text, fontSize: 38, fontWeight: '800', letterSpacing: -1.4, padding: 0, marginTop: 4 },
  cardSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  range: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { color: c.muted, fontSize: 12, fontWeight: '600' },
  group: { marginTop: 18, padding: 14, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.07 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  rowIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: c.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: 12, marginLeft: 58 },
  version: { color: c.muted, fontSize: 13, textAlign: 'center', marginTop: 26 },
});
