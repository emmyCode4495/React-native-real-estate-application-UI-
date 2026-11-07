import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand } from '../brand';
import { AuthButton } from '../components/auth/AuthButton';
import { AuthField } from '../components/auth/AuthField';
import { AuthSuccess } from '../components/auth/AuthSuccess';
import { Glass } from '../components/auth/Glass';
import { ease, outCubic } from '../components/auth/motion';
import { SocialButtons } from '../components/auth/SocialButtons';
import { Icon } from '../components/Icon';
import { LogoDraw } from '../components/LogoMark';
import { PhotoCycle } from '../components/PropertyPhoto';
import { useStore } from '../store';

const c = brand.colors;
type Mode = 'login' | 'signup';
type Step = 'email' | 'details';
type Errors = { name?: string; email?: string; password?: string };

const COPY: Record<Mode, Record<Step, { title: string; sub: string }>> = {
  signup: {
    email: { title: "Let's get you home.", sub: 'Create an account to save homes, book tours and get alerts.' },
    details: { title: 'Almost there.', sub: 'Add your name and choose a password.' },
  },
  login: {
    email: { title: 'Welcome back.', sub: 'Log in to pick up where you left off.' },
    details: { title: 'Good to see you.', sub: 'Enter your password to continue.' },
  },
};

const layout = LinearTransition.duration(340).easing(outCubic);

function strength(pw: string) {
  if (!pw) return { score: 0, label: '' };
  if (pw.length < 8) return { score: 1, label: 'Use at least 8 characters' };
  let s = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return { score: s, label: ['', '', 'Okay', 'Good', 'Strong'][s] };
}

function MeterBar({ on }: { on: boolean }) {
  const f = useSharedValue(0);
  useEffect(() => {
    f.set(withTiming(on ? 1 : 0, { duration: 320, easing: ease }));
  }, [on, f]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: f.value }] }));
  return (
    <View style={styles.meterTrack}>
      <Animated.View style={[styles.meterFill, fill]} />
    </View>
  );
}

function PasswordMeter({ password }: { password: string }) {
  const { score, label } = strength(password);
  if (!password) return null;
  return (
    <Animated.View entering={FadeInDown.duration(240).easing(outCubic)} style={styles.meter}>
      <View style={styles.meterBars}>
        {[1, 2, 3, 4].map((i) => (
          <MeterBar key={i} on={score >= i} />
        ))}
      </View>
      <Text style={styles.meterLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function Auth() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const { setProfile } = useStore();
  const [mode, setMode] = useState<Mode>(params.mode === 'login' ? 'login' : 'signup');
  const [step, setStep] = useState<Step>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nudge = useSharedValue(0);

  // The photo sits behind the keyboard, so keep it at the tallest height we have seen.
  const photoH = useRef(H);
  if (H > photoH.current) photoH.current = H;

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const nudgeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: nudge.value }] }));
  const runNudge = () => {
    const t = { duration: 70, easing: outCubic };
    nudge.set(withSequence(withTiming(-8, t), withTiming(8, t), withTiming(-5, t), withTiming(0, { duration: 140, easing: ease })));
  };

  const clear = (k: keyof Errors) => setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p));
  const emailOk = () => /^\S+@\S+\.\S+$/.test(email.trim());

  const fail = (e: Errors) => {
    setErrors(e);
    runNudge();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const next = () => {
    if (!emailOk()) return fail({ email: 'Enter a valid email, like you@example.com.' });
    Keyboard.dismiss();
    setErrors({});
    Haptics.selectionAsync();
    setStep('details');
  };

  const submit = () => {
    if (loading) return;
    const e: Errors = {};
    if (mode === 'signup' && name.trim().length < 2) e.name = 'Enter your full name.';
    if (password.length < 8) e.password = 'Use at least 8 characters.';
    if (Object.keys(e).length > 0) return fail(e);
    Keyboard.dismiss();
    setErrors({});
    setLoading(true);
    const raw = name.trim() || email.trim().split('@')[0];
    const display = raw.charAt(0).toUpperCase() + raw.slice(1);
    timers.current.push(
      setTimeout(() => {
        setProfile({ name: display, email: email.trim() });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setWelcome(display.split(' ')[0]);
      }, 1500),
    );
  };

  const goBack = () => {
    if (step === 'details') {
      setStep('email');
      setErrors({});
      setPassword('');
    } else router.back();
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setErrors({});
    Haptics.selectionAsync();
  };

  const enterApp = useCallback(() => router.replace('/home'), []);
  const copy = COPY[mode][step];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={StyleSheet.absoluteFill}>
        <PhotoCycle photos={['litHouse', 'cabin', 'townhouse']} kind="villa" tod="dusk" width={W} height={photoH.current} seconds={7} />
        <LinearGradient
          colors={['rgba(5,14,12,0.5)', 'rgba(5,14,12,0.04)', 'rgba(5,14,12,0.55)', 'rgba(5,14,12,0.93)']}
          locations={[0, 0.26, 0.6, 1]}
          style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
        />
      </View>

      <View style={[styles.top, { top: insets.top + 8 }]}>
        <Pressable onPress={goBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <Glass radius={21} interactive style={styles.back}>
            <Icon name="back" size={19} color="#FFFFFF" strokeWidth={2} />
          </Glass>
        </Pressable>
        <View style={styles.brandRow}>
          <LogoDraw size={24} delay={200} duration={900} color="#FFFFFF" accent="#FFB9A8" />
          <Text style={styles.brandText}>{brand.name}</Text>
        </View>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 14 }]}>
          <Animated.View layout={layout} style={styles.head}>
            <Animated.View key={`${mode}-${step}`} entering={FadeInDown.duration(420).easing(outCubic)}>
              <Text style={styles.title}>{copy.title}</Text>
              <Text style={styles.sub}>{copy.sub}</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View layout={layout} style={[styles.panel, nudgeStyle]}>
            <Glass radius={30} style={StyleSheet.absoluteFill} />
            <Animated.View key={`${mode}-${step}`} entering={FadeInDown.duration(380).delay(60).easing(outCubic)} style={styles.panelBody}>
              {step === 'email' ? (
                <>
                  <AuthField icon="mail" placeholder="Email address" value={email} onChangeText={(t) => { setEmail(t); clear('email'); }} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={next} />
                  <AuthButton label="Continue" onPress={next} />
                  <View style={styles.dividerRow}>
                    <View style={styles.line} />
                    <Text style={styles.or}>or</Text>
                    <View style={styles.line} />
                  </View>
                  <SocialButtons onApple={() => {}} onGoogle={() => {}} />
                </>
              ) : (
                <>
                  <Pressable onPress={goBack} style={styles.chip} accessibilityRole="button" accessibilityLabel="Change email">
                    <Icon name="mail" size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.7} />
                    <Text style={styles.chipText} numberOfLines={1}>{email.trim()}</Text>
                    <Text style={styles.chipEdit}>Edit</Text>
                  </Pressable>
                  {mode === 'signup' && (
                    <AuthField icon="user" placeholder="Full name" value={name} onChangeText={(t) => { setName(t); clear('name'); }} error={errors.name} autoCapitalize="words" autoComplete="name" returnKeyType="next" />
                  )}
                  <AuthField icon="lock" placeholder={mode === 'login' ? 'Password' : 'Create a password'} value={password} onChangeText={(t) => { setPassword(t); clear('password'); }} error={errors.password} password autoCapitalize="none" autoCorrect={false} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} returnKeyType="go" onSubmitEditing={submit} />
                  {mode === 'login' ? (
                    <Text style={styles.forgot}>Forgot password?</Text>
                  ) : (
                    <PasswordMeter password={password} />
                  )}
                  <AuthButton label={mode === 'login' ? 'Log in' : 'Create account'} loading={loading} onPress={submit} />
                </>
              )}
            </Animated.View>
          </Animated.View>

          <Animated.View layout={layout} style={styles.footer}>
            {step === 'email' ? (
              <Pressable onPress={switchMode} hitSlop={10} accessibilityRole="button">
                <Text style={styles.footText}>
                  {mode === 'signup' ? 'Already have an account? ' : 'New to Haven? '}
                  <Text style={styles.footLink}>{mode === 'signup' ? 'Log in' : 'Create one'}</Text>
                </Text>
              </Pressable>
            ) : mode === 'signup' ? (
              <Text style={styles.terms}>By continuing you agree to our Terms and Privacy Policy.</Text>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {welcome !== null && <AuthSuccess name={welcome} onDone={enterApp} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.primaryDark },
  flex: { flex: 1 },
  top: { position: 'absolute', left: 20, right: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 18 },
  head: { paddingHorizontal: 6, marginBottom: 22 },
  title: { color: '#FFFFFF', fontSize: 40, fontWeight: '700', letterSpacing: -1.5, lineHeight: 44 },
  sub: { color: 'rgba(255,255,255,0.74)', fontSize: 16, lineHeight: 22, marginTop: 8 },
  panel: { borderRadius: 30, overflow: 'hidden' },
  panelBody: { padding: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.22)' },
  or: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '500' },
  chip: { height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 12 },
  chipText: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  chipEdit: { color: '#FFB9A8', fontSize: 13, fontWeight: '700' },
  forgot: { color: 'rgba(255,255,255,0.8)', fontSize: 13.5, fontWeight: '600', textAlign: 'right', marginBottom: 14, marginTop: 2 },
  meter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 2, paddingHorizontal: 2 },
  meterBars: { flex: 1, flexDirection: 'row', gap: 5 },
  meterTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  meterFill: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFB9A8', transformOrigin: 'left center' },
  meterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: '500', minWidth: 60, textAlign: 'right' },
  footer: { alignItems: 'center', paddingTop: 18, minHeight: 44 },
  footText: { color: 'rgba(255,255,255,0.7)', fontSize: 14.5 },
  footLink: { color: '#FFFFFF', fontWeight: '700' },
  terms: { color: 'rgba(255,255,255,0.5)', fontSize: 12.5, textAlign: 'center', paddingHorizontal: 20 },
});
