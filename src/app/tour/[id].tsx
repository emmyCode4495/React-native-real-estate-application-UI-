import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, Share, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../../brand';
import { Chip } from '../../components/Chip';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Confetti } from '../../components/Confetti';
import { Icon } from '../../components/Icon';
import { HouseLoader } from '../../components/LogoMark';
import { PressableScale } from '../../components/PressableScale';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PropertyPhoto } from '../../components/PropertyPhoto';
import { SegmentedControl } from '../../components/SegmentedControl';
import { AGENTS, byId } from '../../data/properties';
import { Day, newReference, priceFull, upcomingDays } from '../../format';
import { useStore } from '../../store';

const c = brand.colors;
const KEY = require('../../../assets/lottie/key-turn.json');
const SLOTS = ['9:00 am', '10:30 am', '12:00 pm', '2:00 pm', '3:30 pm', '5:00 pm'];
const MSGS = ['Checking the agent’s calendar', 'Holding your slot', 'Sending your confirmation'];
type Stage = 'form' | 'processing' | 'success';

// Deterministic "already taken" slots so the demo looks real and records the same every time.
const taken = (d: number, s: number) => (d * 2 + s) % 5 === 0;

function DayChip({ day, selected, onPress }: { day: Day; selected: boolean; onPress: () => void }) {
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(selected ? 1 : 0, { damping: 15, stiffness: 240 });
  }, [selected, p]);
  const box = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [c.surface, c.primary]),
    borderColor: interpolateColor(p.value, [0, 1], [c.line, c.primary]),
  }));
  const t1 = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [c.muted, 'rgba(255,255,255,0.8)']) }));
  const t2 = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [c.text, '#FFFFFF']) }));
  return (
    <PressableScale haptic scaleTo={0.93} onPress={onPress} accessibilityLabel={day.label}>
      <Animated.View style={[styles.day, box]}>
        <Animated.Text style={[styles.dayDow, t1]}>{day.dow}</Animated.Text>
        <Animated.Text style={[styles.dayNum, t2]}>{day.num}</Animated.Text>
        <Animated.Text style={[styles.dayDow, t1]}>{day.month}</Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

export default function Tour() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = byId(id);
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { addTour } = useStore();
  const [days] = useState(() => upcomingDays(7));
  const [mode, setMode] = useState(0);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [dialog, setDialog] = useState<null | 'confirm' | 'discard'>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [ref, setRef] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const dirty = dayIdx !== null || slot !== null;
  const close = () => {
    if (stage !== 'form') return;
    if (dirty) setDialog('discard');
    else router.back();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dialog) {
        setDialog(null);
        return true;
      }
      if (stage !== 'form') return true;
      if (dirty) {
        setDialog('discard');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [dialog, stage, dirty]);

  if (!p) return null;
  const agent = AGENTS.find((a) => a.id === p.agentId)!;
  const day = dayIdx !== null ? days[dayIdx] : null;
  const time = slot !== null ? SLOTS[slot] : null;
  const ready = day !== null && time !== null;
  const modeLabel = mode === 0 ? 'In person' : 'Video call';

  const start = () => {
    setDialog(null);
    setRef(newReference());
    setMsgIndex(0);
    setStage('processing');
    MSGS.forEach((_, i) => i > 0 && later(() => setMsgIndex(i), i * 700));
    later(() => {
      setStage('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, MSGS.length * 700 + 200);
  };

  const finish = () => {
    if (day && time) addTour({ id: `tour-${ref}`, propertyId: p.id, dow: day.dow, num: day.num, month: day.month, time, mode: modeLabel as 'In person' | 'Video call', ref });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <PressableScale scaleTo={0.9} onPress={close} style={styles.roundBtn} accessibilityLabel="Close">
          <Icon name="close" size={20} color={c.text} />
        </PressableScale>
        <View style={styles.flex}>
          <Text style={styles.headerTitle}>Book a viewing</Text>
          <Text style={styles.headerSub}>Free, and you can cancel anytime</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Animated.View entering={FadeInDown.springify().damping(16)} style={styles.prop}>
          <View style={styles.thumb}>
            <PropertyPhoto photo={p.photo} kind={p.kind} tod={p.tod} width={72} height={72} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.propTitle} numberOfLines={1}>{p.title}</Text>
            <Text style={styles.propSub} numberOfLines={1}>{p.address}, {p.hood}</Text>
            <Text style={styles.propPrice}>{priceFull(p)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify().damping(16)} style={{ marginTop: 20 }}>
          <SegmentedControl options={['In person', 'Video call']} index={mode} onChange={setMode} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(140)} style={styles.h}>Pick a day</Animated.Text>
        <Animated.View entering={FadeInDown.delay(180).springify().damping(16)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={styles.days}>
            {days.map((d, i) => (
              <DayChip key={d.key} day={d} selected={dayIdx === i} onPress={() => { setDayIdx(i); setSlot(null); }} />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(220)} style={styles.h}>Pick a time</Animated.Text>
        <Animated.View entering={FadeInDown.delay(260).springify().damping(16)} style={styles.slots}>
          {SLOTS.map((s, i) => {
            const off = dayIdx === null || taken(dayIdx, i);
            return (
              <View key={s} style={{ width: (W - 48 - 20) / 3, flexDirection: 'row' }}>
                <Chip flex compact label={s} selected={slot === i} disabled={off} onPress={() => setSlot(i)} />
              </View>
            );
          })}
        </Animated.View>
        <Text style={styles.hint}>{dayIdx === null ? 'Choose a day to see open times.' : 'Crossed-out times are already booked.'}</Text>

        <View style={styles.agent}>
          <Icon name={mode === 0 ? 'walk' : 'video'} size={20} color={c.primary} />
          <Text style={styles.agentText}>{mode === 0 ? `${agent.name} will meet you at the property.` : `${agent.name} will send a video link.`}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <PrimaryButton label="Confirm viewing" disabled={!ready} onPress={() => setDialog('confirm')} />
      </View>

      {stage === 'processing' && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={[styles.overlay, styles.center]}>
          <HouseLoader size={104} />
          <Animated.Text key={msgIndex} entering={FadeInDown.duration(260)} style={styles.proc}>
            {MSGS[msgIndex]}...
          </Animated.Text>
        </Animated.View>
      )}

      {stage === 'success' && day && time && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.successScroll, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.keyWrap}>
              <LottieView source={KEY} autoPlay loop={false} style={styles.key} />
              <View style={styles.confettiOrigin}>
                <Confetti />
              </View>
            </View>
            <Animated.Text entering={FadeInDown.delay(500).springify().damping(16)} style={styles.successTitle}>Viewing booked</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(600).springify().damping(16)} style={styles.successSub}>
              {agent.name.split(' ')[0]} is expecting you. We sent the details to your email.
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(750).springify().damping(16)} style={styles.ticket}>
              <View style={styles.tDate}>
                <Text style={styles.tDow}>{day.dow}</Text>
                <Text style={styles.tNum}>{day.num}</Text>
                <Text style={styles.tDow}>{day.month}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.tTime}>{time}, {modeLabel}</Text>
                <Text style={styles.tTitle} numberOfLines={1}>{p.title}</Text>
                <Text style={styles.tSub} numberOfLines={1}>{p.address}</Text>
                <Text style={styles.tRef}>{ref}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(1000)} style={styles.successBtns}>
              <PrimaryButton label="Done" onPress={finish} />
              <PrimaryButton
                label="Share details"
                tone="ghost"
                height={52}
                onPress={() => Share.share({ message: `Viewing booked: ${p.title}\n${day.label} at ${time} (${modeLabel})\nRef ${ref}` }).catch(() => {})}
              />
            </Animated.View>
          </ScrollView>
        </Animated.View>
      )}

      <ConfirmDialog
        visible={dialog === 'confirm'}
        icon="calendar"
        title="Book this viewing?"
        message={`${p.title}\n${day?.label} at ${time}, ${modeLabel.toLowerCase()} with ${agent.name.split(' ')[0]}.`}
        confirmLabel="Book viewing"
        onConfirm={start}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        visible={dialog === 'discard'}
        tone="danger"
        icon="close"
        title="Discard this booking?"
        message="Nothing has been booked yet."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setDialog(null);
          router.back();
        }}
        onCancel={() => setDialog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingBottom: 14 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', ...brand.shadow, shadowOpacity: 0.08 },
  headerTitle: { color: c.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  headerSub: { color: c.muted, fontSize: 13, marginTop: 1 },
  prop: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 8, borderRadius: 24, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.07 },
  thumb: { borderRadius: 18, overflow: 'hidden' },
  propTitle: { color: c.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  propSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  propPrice: { color: c.primary, fontSize: 15, fontWeight: '800', marginTop: 4 },
  h: { color: c.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginTop: 24, marginBottom: 12 },
  days: { paddingHorizontal: 24, gap: 10 },
  day: { width: 64, height: 92, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayDow: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  dayNum: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hint: { color: c.muted, fontSize: 13, marginTop: 10 },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, padding: 16, borderRadius: 22, backgroundColor: c.surfaceAlt },
  agentText: { flex: 1, color: c.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingTop: 10 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: c.bg, zIndex: 50, elevation: 50 },
  proc: { color: c.text, fontSize: 17, fontWeight: '700', marginTop: 18 },
  successScroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  keyWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  key: { width: 220, height: 220, position: 'absolute', pointerEvents: 'none' },
  confettiOrigin: { position: 'absolute', left: 75, top: 75 },
  successTitle: { color: c.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  successSub: { color: c.muted, fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'center', paddingHorizontal: 16 },
  ticket: { alignSelf: 'stretch', flexDirection: 'row', gap: 14, marginTop: 28, padding: 12, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow },
  tDate: { width: 72, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tDow: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  tNum: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -1, marginVertical: 1 },
  tTime: { color: c.accent, fontSize: 14, fontWeight: '800' },
  tTitle: { color: c.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 3 },
  tSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  tRef: { color: c.muted, fontSize: 12, fontWeight: '600', marginTop: 8 },
  successBtns: { alignSelf: 'stretch', gap: 12, marginTop: 24 },
});
