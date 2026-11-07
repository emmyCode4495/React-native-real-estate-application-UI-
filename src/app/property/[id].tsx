import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Linking, Share, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, SvgXml } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  SharedValue,
  ZoomIn,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAP_H, MAP_W, mapSvg } from '../../art/map';
import { brand } from '../../brand';
import { AnimatedText } from '../../components/AnimatedText';
import { Avatar } from '../../components/Avatar';
import { BottomSheet } from '../../components/BottomSheet';
import { Chip } from '../../components/Chip';
import { Field } from '../../components/Field';
import { HeartButton } from '../../components/HeartButton';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PropertyPhoto } from '../../components/PropertyPhoto';
import { Slider } from '../../components/Slider';
import { useToast } from '../../components/Toast';
import { Kind, Tod } from '../../art/scenes';
import { PHOTOS, PhotoKey } from '../../data/photos';
import { AGENTS, AMENITIES, byId, galleryFor } from '../../data/properties';
import { money, priceFull } from '../../format';
import { useStore } from '../../store';

const c = brand.colors;
const HERO = 400;
const MAP_XML = mapSvg();
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Slide({ photo, kind, tod, index, hx, W }: { photo: PhotoKey; kind: Kind; tod: Tod; index: number; hx: SharedValue<number>; W: number }) {
  const parallax = useDerivedValue(() => Math.min(1, Math.max(-1, (hx.value - index * W) / W)));
  return <PropertyPhoto photo={photo} kind={kind} tod={tod} width={W} height={HERO} parallax={parallax} />;
}

function PagerDot({ index, hx, W }: { index: number; hx: SharedValue<number>; W: number }) {
  const style = useAnimatedStyle(() => {
    const pos = hx.value / W;
    return { width: interpolate(pos, [index - 1, index, index + 1], [6, 22, 6], 'clamp'), opacity: interpolate(pos, [index - 1, index, index + 1], [0.55, 1, 0.55], 'clamp') };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

// ---- mortgage estimator: every number is derived from shared values on the UI thread ----
function calc(price: number, vDown: number, vRate: number, years: number) {
  'worklet';
  const pct = 0.05 + vDown * 0.45;
  const rate = 3 + vRate * 6;
  const down = price * pct;
  const loan = price - down;
  const r = rate / 100 / 12;
  const n = years * 12;
  const k = Math.pow(1 + r, n);
  const monthly = (loan * r * k) / (k - 1);
  const total = monthly * n;
  return { pct, rate, down, loan, monthly, share: loan / total };
}
function fmt(n: number) {
  'worklet';
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function MortgageCard({ price, width }: { price: number; width: number }) {
  const [term, setTerm] = useState(30);
  const vDown = useSharedValue(0.333);
  const vRate = useSharedValue(0.5);
  const years = useSharedValue(30);
  const out = useDerivedValue(() => calc(price, vDown.value, vRate.value, years.value));
  const monthly = useDerivedValue(() => fmt(out.value.monthly));
  const downText = useDerivedValue(() => `${Math.round(out.value.pct * 100)}%, ${fmt(out.value.down)}`);
  const rateText = useDerivedValue(() => `${out.value.rate.toFixed(1)}%`);
  const loanText = useDerivedValue(() => fmt(out.value.loan));
  const interestText = useDerivedValue(() => `${Math.round((1 - out.value.share) * 100)}% of total paid is interest`);
  const C = 2 * Math.PI * 46;
  const ring = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - out.value.share) }));
  const inner = width - 40;
  const init = calc(price, 0.333, 0.5, 30);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mortgage estimate</Text>
      <View style={styles.mRow}>
        <View style={styles.ringWrap}>
          <Svg width={116} height={116} viewBox="0 0 116 116">
            <Circle cx={58} cy={58} r={46} stroke={c.accentSoft} strokeWidth={12} fill="none" />
            <AnimatedCircle cx={58} cy={58} r={46} stroke={c.primary} strokeWidth={12} strokeLinecap="round" fill="none" strokeDasharray={C} animatedProps={ring} rotation={-90} originX={58} originY={58} />
          </Svg>
          <View style={styles.ringCenter}>
            <AnimatedText text={monthly} initial={fmt(init.monthly)} style={styles.monthly} />
            <Text style={styles.perMo}>per month</Text>
          </View>
        </View>
        <View style={styles.flex}>
          <Text style={styles.k}>Loan amount</Text>
          <AnimatedText text={loanText} initial={fmt(init.loan)} style={styles.v} />
          <Text style={[styles.k, { marginTop: 8 }]}>Home price</Text>
          <Text style={styles.v}>{money(price)}</Text>
        </View>
      </View>
      <AnimatedText text={interestText} initial={`${Math.round((1 - init.share) * 100)}% of total paid is interest`} style={styles.note} />

      <View style={styles.sRow}>
        <Text style={styles.sLabel}>Down payment</Text>
        <AnimatedText text={downText} initial={`${Math.round(init.pct * 100)}%, ${fmt(init.down)}`} style={styles.sVal} />
      </View>
      <Slider value={vDown} width={inner} />
      <View style={styles.sRow}>
        <Text style={styles.sLabel}>Interest rate</Text>
        <AnimatedText text={rateText} initial="6.0%" style={styles.sVal} />
      </View>
      <Slider value={vRate} width={inner} color={c.accent} />
      <View style={styles.terms}>
        {[15, 20, 30].map((t) => (
          <Chip key={t} compact label={`${t} yrs`} selected={term === t} onPress={() => { setTerm(t); years.set(withTiming(t, { duration: 350 })); }} />
        ))}
      </View>
      <Text style={styles.fine}>Estimate only. Excludes taxes, insurance and fees.</Text>
    </View>
  );
}

function MapPeek({ x, y, width }: { x: number; y: number; width: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false);
  }, [r]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - r.value), transform: [{ scale: 0.7 + r.value * 2.2 }] }));
  return (
    <View style={[styles.peek, { width, height: 170 }]}>
      <View style={{ width: MAP_W, height: MAP_H, transform: [{ translateX: width / 2 - x }, { translateY: 85 - y }] }}>
        <SvgXml xml={MAP_XML} width={MAP_W} height={MAP_H} />
      </View>
      <View style={styles.peekPin} pointerEvents="none">
        <Animated.View style={[styles.peekRing, ring]} />
        <View style={styles.peekDot}>
          <Icon name="home" size={18} color="#fff" />
        </View>
      </View>
    </View>
  );
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = byId(id);
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { saved, toggleSave, markViewed, tours } = useStore();
  const { show, node } = useToast();
  const scrollY = useSharedValue(0);
  const hx = useSharedValue(0);
  const [slide, setSlide] = useState(0);
  const [more, setMore] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgErr, setMsgErr] = useState<string | null>(null);

  useEffect(() => {
    if (p) markViewed(p.id);
  }, [p, markViewed]);

  const vScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const hScroll = useAnimatedScrollHandler((e) => {
    hx.value = e.contentOffset.x;
  });
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value > 0 ? scrollY.value * 0.5 : scrollY.value }, { scale: scrollY.value < 0 ? 1 + (-scrollY.value / HERO) * 1.1 : 1 }],
  }));

  if (!p) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.title}>Home not found</Text>
        <View style={{ height: 16 }} />
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  const gallery = galleryFor(p);
  const agent = AGENTS.find((a) => a.id === p.agentId)!;
  const isSaved = saved.includes(p.id);
  const booked = tours.some((t) => t.propertyId === p.id);
  const rent = p.listing === 'rent';
  const est = p.price * 0.8 * (0.065 / 12) * Math.pow(1 + 0.065 / 12, 360) / (Math.pow(1 + 0.065 / 12, 360) - 1);
  const cardW = W - 48;

  const sendMessage = () => {
    if (msg.trim().length < 5) return setMsgErr('Write a short message first.');
    setMsgOpen(false);
    setMsg('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    show(`Message sent to ${agent.name.split(' ')[0]}`);
  };

  const stat = (icon: 'bed' | 'bath' | 'area' | 'clock', value: string, label: string, i: number) => (
    <Animated.View key={label} entering={ZoomIn.delay(350 + i * 80).springify().damping(13)} style={styles.stat}>
      <Icon name={icon} size={22} color={c.primary} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView onScroll={vScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={{ height: HERO, overflow: 'hidden' }}>
          <Animated.View style={[{ height: HERO }, heroStyle]}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={hScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / W))}
            >
              {gallery.map((g, i) => (
                <Slide key={`${g.photo}-${i}`} photo={g.photo} kind={g.kind} tod={g.tod} index={i} hx={hx} W={W} />
              ))}
            </Animated.ScrollView>
          </Animated.View>
          <View style={styles.pager} pointerEvents="none">
            <View style={styles.dots}>
              {gallery.map((g, i) => (
                <PagerDot key={g.label} index={i} hx={hx} W={W} />
              ))}
            </View>
            <View style={styles.label}>
              <Text style={styles.labelText}>{gallery[slide]?.label}</Text>
            </View>
          </View>
          <Text style={styles.credit} pointerEvents="none">
            Photo by {gallery[slide] ? PHOTOS[gallery[slide].photo].by : ''} on Unsplash
          </Text>
        </View>

        <Animated.View entering={FadeInUp.delay(100).springify().damping(18)} style={styles.sheet}>
          <View style={styles.metaRow}>
            <View style={styles.pill}><Text style={styles.pillText}>{p.type}</Text></View>
            <View style={[styles.pill, { backgroundColor: c.accentSoft }]}><Text style={[styles.pillText, { color: c.accent }]}>{rent ? 'For rent' : 'For sale'}</Text></View>
            <View style={styles.flex} />
            <Icon name="star" size={16} color={c.gold} fill={c.gold} strokeWidth={1.2} />
            <Text style={styles.rating}>{p.rating}</Text>
          </View>
          <Text style={styles.title}>{p.title}</Text>
          <View style={styles.addr}>
            <Icon name="pin" size={16} color={c.muted} />
            <Text style={styles.addrText}>{p.address}, {p.hood}</Text>
          </View>
          <Text style={styles.price}>{priceFull(p)}</Text>
          {!rent && <Text style={styles.est}>Est. {money(est)}/mo with 20% down</Text>}

          <View style={styles.stats}>
            {stat('bed', `${p.beds}`, 'Bedrooms', 0)}
            {stat('bath', `${p.baths}`, 'Bathrooms', 1)}
            {stat('area', p.sqft.toLocaleString('en-US'), 'Sq ft', 2)}
            {stat('clock', `${p.year}`, 'Built', 3)}
          </View>

          <Animated.View layout={LinearTransition.springify().damping(20)}>
            <Text style={styles.h}>About this home</Text>
            <Text style={styles.body} numberOfLines={more ? undefined : 3}>{p.desc}</Text>
            <PressableScale scaleTo={0.96} onPress={() => setMore((m) => !m)} accessibilityLabel={more ? 'Read less' : 'Read more'}>
              <Text style={styles.more}>{more ? 'Read less' : 'Read more'}</Text>
            </PressableScale>
          </Animated.View>

          <Text style={styles.h}>Amenities</Text>
          <View style={styles.amen}>
            {p.amenities.map((a, i) => (
              <Animated.View key={a} entering={FadeInDown.delay(200 + i * 60).springify().damping(16)} style={styles.amenItem}>
                <Icon name={AMENITIES[a].icon} size={18} color={c.primary} />
                <Text style={styles.amenText}>{AMENITIES[a].label}</Text>
              </Animated.View>
            ))}
          </View>

          <Text style={styles.h}>Listed by</Text>
          <View style={styles.agent}>
            <Avatar name={agent.name} color={agent.color} size={54} />
            <View style={styles.flex}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentRole}>{agent.role}</Text>
              <View style={styles.agentMeta}>
                <Icon name="star" size={13} color={c.gold} fill={c.gold} strokeWidth={1.2} />
                <Text style={styles.agentRole}>{agent.rating}, {agent.sold} homes sold</Text>
              </View>
            </View>
            <PressableScale haptic scaleTo={0.9} style={styles.roundBtn} accessibilityLabel="Call agent" onPress={() => Linking.openURL('tel:+15550142').catch(() => show('Calling is not available here'))}>
              <Icon name="phone" size={20} color={c.primary} />
            </PressableScale>
            <PressableScale haptic scaleTo={0.9} style={[styles.roundBtn, { backgroundColor: c.primary }]} accessibilityLabel="Message agent" onPress={() => { setMsgErr(null); setMsgOpen(true); }}>
              <Icon name="mail" size={20} color="#fff" />
            </PressableScale>
          </View>

          {!rent ? (
            <MortgageCard price={p.price} width={cardW} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lease terms</Text>
              {[['Monthly rent', priceFull(p)], ['Security deposit', money(p.price)], ['Lease length', '6 or 12 months'], ['Available', 'Next month']].map(([k, v]) => (
                <View key={k} style={styles.lease}>
                  <Text style={styles.k}>{k}</Text>
                  <Text style={styles.v}>{v}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.h}>Location</Text>
          <MapPeek x={p.map.x} y={p.map.y} width={cardW} />
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View entering={FadeIn.delay(200)} style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <PressableScale scaleTo={0.9} onPress={() => router.back()} style={styles.topBtn} accessibilityLabel="Back">
          <Icon name="back" size={20} color={c.text} />
        </PressableScale>
        <View style={styles.flex} />
        <PressableScale
          scaleTo={0.9}
          style={styles.topBtn}
          accessibilityLabel="Share"
          onPress={() => Share.share({ message: `${p.title}, ${priceFull(p)}\n${p.address}, ${p.hood}\nShared from Haven (demo)` }).catch(() => {})}
        >
          <Icon name="share" size={19} color={c.text} />
        </PressableScale>
        <View style={{ width: 10 }} />
        <HeartButton saved={isSaved} onToggle={() => toggleSave(p.id)} size={42} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(450).springify().damping(16)} style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bPrice}>{priceFull(p)}</Text>
          <Text style={styles.bSub}>{booked ? 'Viewing booked' : rent ? 'Tour before you apply' : 'Free to tour'}</Text>
        </View>
        <View style={styles.flex} />
        <View style={{ width: 190 }}>
          <PrimaryButton label={booked ? 'Book another time' : 'Book a viewing'} height={54} onPress={() => router.push({ pathname: '/tour/[id]', params: { id: p.id } })} />
        </View>
      </Animated.View>

      {node}

      <BottomSheet visible={msgOpen} title={`Message ${agent.name.split(' ')[0]}`} onClose={() => setMsgOpen(false)}>
        <View style={styles.quick}>
          {['Is this still available?', 'Can I book a viewing?', 'What are the fees?'].map((t) => (
            <Chip key={t} compact label={t} selected={msg === t} onPress={() => { setMsg(t); setMsgErr(null); }} />
          ))}
        </View>
        <View style={{ height: 14 }} />
        <Field label="Your message" value={msg} onChangeText={(t) => { setMsg(t); if (msgErr) setMsgErr(null); }} error={msgErr} returnKeyType="send" />
        <PrimaryButton label="Send message" onPress={sendMessage} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  pager: { position: 'absolute', left: 0, right: 0, bottom: 52, alignItems: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  credit: { position: 'absolute', right: 14, bottom: 46, color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 4 },
  label: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(20,35,31,0.55)' },
  labelText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  sheet: { marginTop: -34, paddingHorizontal: 24, paddingTop: 24, borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: c.bg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: c.surfaceAlt },
  pillText: { color: c.primary, fontSize: 12, fontWeight: '800' },
  rating: { color: c.text, fontSize: 14, fontWeight: '800', marginLeft: 4 },
  title: { color: c.text, fontSize: 30, fontWeight: '800', letterSpacing: -1, marginTop: 12 },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  addrText: { color: c.muted, fontSize: 14 },
  price: { color: c.primary, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 14 },
  est: { color: c.muted, fontSize: 14, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 20, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.06 },
  statVal: { color: c.text, fontSize: 16, fontWeight: '800' },
  statLabel: { color: c.muted, fontSize: 11, fontWeight: '600' },
  h: { color: c.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginTop: 26, marginBottom: 10 },
  body: { color: c.muted, fontSize: 15, lineHeight: 23 },
  more: { color: c.accent, fontSize: 14, fontWeight: '800', marginTop: 6 },
  amen: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.surface },
  amenText: { color: c.text, fontSize: 14, fontWeight: '600' },
  agent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.07 },
  agentName: { color: c.text, fontSize: 17, fontWeight: '800' },
  agentRole: { color: c.muted, fontSize: 13 },
  agentMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  card: { marginTop: 26, padding: 20, borderRadius: 28, backgroundColor: c.surface, ...brand.shadow, shadowOpacity: 0.07 },
  cardTitle: { color: c.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 14 },
  mRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringWrap: { width: 116, height: 116, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  monthly: { color: c.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.5, padding: 0, textAlign: 'center', width: 100 },
  perMo: { color: c.muted, fontSize: 11, fontWeight: '600' },
  k: { color: c.muted, fontSize: 13 },
  v: { color: c.text, fontSize: 18, fontWeight: '800', padding: 0 },
  note: { color: c.muted, fontSize: 13, marginTop: 12, padding: 0 },
  sRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 16 },
  sLabel: { color: c.text, fontSize: 15, fontWeight: '700' },
  sVal: { color: c.primary, fontSize: 15, fontWeight: '800', padding: 0, textAlign: 'right', minWidth: 140 },
  terms: { flexDirection: 'row', gap: 10, marginTop: 14 },
  fine: { color: c.muted, fontSize: 12, marginTop: 14 },
  lease: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  peek: { borderRadius: 26, overflow: 'hidden', backgroundColor: '#EBE1CF' },
  peekPin: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  peekRing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent },
  peekDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  topBar: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', alignItems: 'center' },
  topBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, backgroundColor: c.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, ...brand.shadow, shadowOpacity: 0.14 },
  bPrice: { color: c.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  bSub: { color: c.muted, fontSize: 13, marginTop: 1 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
