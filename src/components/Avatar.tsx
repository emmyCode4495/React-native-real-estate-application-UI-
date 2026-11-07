import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { initials } from '../format';

export function Avatar({ name, color, size = 46 }: { name: string; color: string; size?: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.3 },
});
