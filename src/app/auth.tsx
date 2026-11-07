import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp, LinearTransition, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { DoorTransition } from '../components/DoorTransition';
import { Field } from '../components/Field';
import { Icon } from '../components/Icon';
import { PhotoCycle } from '../components/PropertyPhoto';
import { PressableScale } from '../components/PressableScale';
import { PrimaryButton } from '../components/PrimaryButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { useStore } from '../store';

const c = brand.colors;
type Mode = 'login' | 'signup';
type Errors = { name?: string; email?: string; password?: string };
const COPY = {
  signup: { title: 'Create your account', sub: 'Save homes, book tours and get alerts.', cta: 'Create account' },
  login: { title: 'Welcome back', sub: 'Log in to pick up where you left off.', cta: 'Log in' },
};
const layout = LinearTransition.springify().damping(20).stiffness(180);

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { setProfile } = useStore();
  const [mode, setMode] = useState<Mode>(params.mode === 'login' ? 'login' : 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [door, setDoor] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shake = useSharedValue(0);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const formStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const runShake = () =>
    shake.set(withSequence(withTiming(-12, { duration: 50 }), withRepeat(withTiming(12, { duration: 90 }), 5, true), withTiming(0, { duration: 50 })));

  const validate = (): Errors => {
    const e: Errors = {};
    if (mode === 'signup' && name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email, like you@example.com.';
    if (password.length < 8) e.password = 'Use at least 8 characters.';
    return e;
  };

  const submit = () => {
    if (loading) return;
    Keyboard.dismiss();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      runShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    const raw = name.trim() || email.trim().split('@')[0];
    const display = raw.charAt(0).toUpperCase() + raw.slice(1);
    timers.current.push(
      setTimeout(() => {
        setProfile({ name: display, email: email.trim() });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDoor(display.split(' ')[0]);
      }, 1700),
    );
  };

  const enterApp = useCallback(() => router.replace('/home'), []);
  const copy = COPY[mode];
  const artH = 210;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <Animated.View entering={FadeIn.duration(600)}>
            <PhotoCycle photos={['cabin', 'cottage']} kind="cottage" tod="day" width={W} height={artH + insets.top} seconds={6} />
            <PressableScale scaleTo={0.9} onPress={() => router.back()} accessibilityLabel="Back" style={[styles.back, { top: insets.top + 10 }]}>
              <Icon name="back" size={20} color={c.text} />
            </PressableScale>
          </Animated.View>

          <View style={styles.body}>
            <Animated.View key={mode} entering={FadeInDown.springify().damping(18)}>
              <Text style={styles.title}>{copy.title}</Text>
              <Text style={styles.sub}>{copy.sub}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={styles.seg}>
              <SegmentedControl options={['Log in', 'Sign up']} index={mode === 'login' ? 0 : 1} onChange={(i) => { setMode(i === 0 ? 'login' : 'signup'); setErrors({}); }} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).springify().damping(18)} style={formStyle}>
              {mode === 'signup' && (
                <Animated.View key="name" entering={FadeInDown.springify().damping(16)} exiting={FadeOutUp.duration(150)} layout={layout}>
                  <Field label="Full name" value={name} onChangeText={(t) => { setName(t); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }} error={errors.name} autoCapitalize="words" autoComplete="name" />
                </Animated.View>
              )}
              <Animated.View layout={layout}>
                <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              </Animated.View>
              <Animated.View layout={layout}>
                <Field label="Password" value={password} onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }} error={errors.password} password autoCapitalize="none" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </Animated.View>
              {mode === 'login' && (
                <Animated.View entering={FadeIn.duration(250)} exiting={FadeOutUp.duration(120)} layout={layout}>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </Animated.View>
              )}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(260).springify().damping(18)} layout={layout} style={styles.cta}>
              <PrimaryButton label={copy.cta} loading={loading} onPress={submit} />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(500)} layout={layout}>
              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.or}>or continue with</Text>
                <View style={styles.line} />
              </View>
              <View style={styles.socialRow}>
                {['Apple', 'Google'].map((p) => (
                  <PressableScale key={p} haptic containerStyle={styles.flex} style={styles.social} onPress={() => {}} accessibilityLabel={`Continue with ${p}`}>
                    <Text style={styles.socialText}>{p}</Text>
                  </PressableScale>
                ))}
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {door !== null && <DoorTransition name={door} onDone={enterApp} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  back: { position: 'absolute', left: 18, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  body: { marginTop: -26, paddingHorizontal: 24, paddingTop: 26, backgroundColor: c.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  title: { color: c.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sub: { color: c.muted, fontSize: 15, lineHeight: 21, marginTop: 6 },
  seg: { marginTop: 20, marginBottom: 18 },
  forgot: { color: c.accent, fontSize: 14, fontWeight: '700', textAlign: 'right', marginBottom: 6, marginTop: -2 },
  cta: { marginTop: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 26, marginBottom: 16 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.line },
  or: { color: c.muted, fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12 },
  social: { height: 54, borderRadius: 27, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  socialText: { color: c.text, fontSize: 15, fontWeight: '700' },
});
