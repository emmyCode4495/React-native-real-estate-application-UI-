import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { brand } from '../brand';
import { HouseLoader } from './LogoMark';
import { PressableScale } from './PressableScale';

const c = brand.colors;

type Props = {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'accent' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean; // shows the house loader, never a spinner
  flex?: boolean;
  height?: number;
};

export function PrimaryButton({ label, onPress, tone = 'primary', disabled, loading, flex, height = 58 }: Props) {
  const bg = tone === 'primary' ? c.primary : tone === 'accent' ? c.accent : tone === 'danger' ? c.danger : c.surface;
  const fg = tone === 'ghost' ? c.text : '#FFFFFF';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      haptic
      accessibilityLabel={label}
      containerStyle={flex ? styles.flex : undefined}
      style={[styles.btn, { height, borderRadius: height / 2, backgroundColor: bg, opacity: disabled ? 0.45 : 1 }, tone === 'ghost' && styles.ghost, tone === 'primary' && styles.glow]}
    >
      {loading ? (
        <View>
          <HouseLoader size={height * 0.5} color="#FFFFFF" accent="#F4B7A8" />
        </View>
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  btn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  ghost: { borderWidth: 1.5, borderColor: c.line },
  glow: { shadowColor: c.primary, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.1 },
});
