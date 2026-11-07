import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { brand } from '../brand';
import { Property } from '../data/properties';
import { priceFull } from '../format';
import { useStore } from '../store';
import { HeartButton } from './HeartButton';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { PropertyPhoto } from './PropertyPhoto';

const c = brand.colors;

export function Specs({ p, size = 13 }: { p: Property; size?: number }) {
  const item = (icon: 'bed' | 'bath' | 'area', text: string) => (
    <View style={styles.spec}>
      <Icon name={icon} size={size + 3} color={c.muted} strokeWidth={1.8} />
      <Text style={[styles.specText, { fontSize: size }]}>{text}</Text>
    </View>
  );
  return (
    <View style={styles.specs}>
      {item('bed', `${p.beds}`)}
      {item('bath', `${p.baths}`)}
      {item('area', `${p.sqft.toLocaleString('en-US')} sqft`)}
    </View>
  );
}

type CardProps = { p: Property; onPress: () => void };

export function FeaturedCard({ p, width, parallax, onPress }: CardProps & { width: number; parallax?: SharedValue<number> }) {
  const { saved, toggleSave, budget } = useStore();
  const inBudget = p.listing === 'sale' && p.price <= budget;
  return (
    <PressableScale scaleTo={0.97} onPress={onPress} style={[styles.card, { width }]} accessibilityLabel={`${p.title}, ${priceFull(p)}`}>
      <View style={styles.artWrap}>
        <PropertyPhoto photo={p.photo} kind={p.kind} tod={p.tod} width={width - 16} height={196} parallax={parallax} />
        {p.tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{p.tag}</Text>
          </View>
        ) : null}
        <View style={styles.heart}>
          <HeartButton saved={saved.includes(p.id)} onToggle={() => toggleSave(p.id)} size={38} />
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{priceFull(p)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {p.title}
          </Text>
          <View style={styles.rating}>
            <Icon name="star" size={14} color={c.gold} fill={c.gold} strokeWidth={1.2} />
            <Text style={styles.ratingText}>{p.rating}</Text>
          </View>
        </View>
        <View style={styles.loc}>
          <Icon name="pin" size={15} color={c.muted} strokeWidth={1.8} />
          <Text style={styles.locText}>{p.hood}</Text>
          {inBudget ? <Text style={styles.budget}>Within budget</Text> : null}
        </View>
        <Specs p={p} />
      </View>
    </PressableScale>
  );
}

export function RowCard({ p, onPress }: CardProps) {
  const { saved, toggleSave } = useStore();
  return (
    <PressableScale scaleTo={0.98} onPress={onPress} style={styles.row} accessibilityLabel={`${p.title}, ${priceFull(p)}`}>
      <View style={styles.thumb}>
        <PropertyPhoto photo={p.photo} kind={p.kind} tod={p.tod} width={104} height={104} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {p.title}
        </Text>
        <Text style={styles.locText} numberOfLines={1}>
          {p.hood}, {p.type}
        </Text>
        <Specs p={p} size={12} />
        <Text style={styles.rowPrice}>{priceFull(p)}</Text>
      </View>
      <View style={styles.rowHeart}>
        <HeartButton saved={saved.includes(p.id)} onToggle={() => toggleSave(p.id)} size={34} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { padding: 8, borderRadius: 30, backgroundColor: c.surface, ...brand.shadow },
  artWrap: { borderRadius: 22, overflow: 'hidden' },
  tag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 14, backgroundColor: c.primary },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  heart: { position: 'absolute', top: 8, right: 8 },
  pricePill: { position: 'absolute', left: 10, bottom: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.95)' },
  priceText: { color: c.text, fontSize: 15, fontWeight: '800' },
  body: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: c.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: c.text, fontSize: 13, fontWeight: '700' },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locText: { color: c.muted, fontSize: 13 },
  budget: { marginLeft: 8, color: c.success, fontSize: 12, fontWeight: '800' },
  specs: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  specText: { color: c.muted, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 8, borderRadius: 26, backgroundColor: c.surface, ...brand.shadow },
  thumb: { borderRadius: 20, overflow: 'hidden' },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { color: c.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  rowPrice: { color: c.primary, fontSize: 16, fontWeight: '800', marginTop: 2 },
  rowHeart: { position: 'absolute', top: 10, right: 10 },
});
