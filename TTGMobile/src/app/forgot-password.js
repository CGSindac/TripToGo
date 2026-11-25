import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  background: '#FFFFFF',
  primary: '#593BFA',
  ink: '#17133D',
  muted: '#6B6788',
  border: '#DDD5F5',
  error: '#D93B4A',
  pink: '#E83FD0',
  violet: '#7A4DFF',
  coral: '#FF5C6A',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

// Shapes are placed with x / y measured on the 342 px wide content area of the design.
const AREA_W = 342;
const at = (x) => `${(x / AREA_W) * 100}%`;

const SPARKLE = require('../../assets/images/shape-sparkle.png');
const SUN = require('../../assets/images/shape-sun.png');
const BLOB = require('../../assets/images/shape-blob.png');
const SQUIGGLE = require('../../assets/images/shape-squiggle.png');

function Shape({ source, x, y, w, h = w, tint }) {
  return (
    <Image
      source={source}
      resizeMode="contain"
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ position: 'absolute', left: at(x), top: y, width: w, height: h, tintColor: tint }}
    />
  );
}

function Dot({ x, y, size, color }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        position: 'absolute',
        left: at(x),
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState('request'); // 'request' | 'sent'
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState('');

  // Count down the "Resend" timer
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  const backToLogin = () => router.replace('/login');

  const sendLink = async (isResend = false) => {
    if (loading) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);
    try {
      // TODO: call backend here, for example:
      // const res = await fetch(`${API_URL}/auth/forgot-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim() }),
      // });
      // if (!res.ok) throw new Error('We could not send the link. Please try again.');
      setStep('sent');
      setCooldown(RESEND_SECONDS);
      if (isResend) setNotice('We sent the link again.');
    } catch (e) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEmailApp = async () => {
    try {
      await Linking.openURL('mailto:');
    } catch {
      Alert.alert('No email app found', 'Open your email app and look for our message.');
    }
  };

  const contentStyle = [
    styles.content,
    { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) + 16 },
  ];

  // ------------------------------------------------------------------
  // STEP 2: "Check your inbox"
  // ------------------------------------------------------------------
  if (step === 'sent') {
    const timer = `0:${String(cooldown).padStart(2, '0')}`;
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScrollView
          contentContainerStyle={[...contentStyle, styles.centered]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.area, { height: 300, marginTop: 44 }]}>
            <Shape source={SUN} x={14} y={20} w={64} />
            <Shape source={SPARKLE} x={282} y={36} w={30} tint={COLORS.pink} />
            <Shape source={SQUIGGLE} x={6} y={236} w={72} h={22} />
            <Shape source={SPARKLE} x={290} y={232} w={24} tint={COLORS.violet} />
            <Dot x={308} y={150} size={12} color={COLORS.coral} />
            <Dot x={30} y={170} size={12} color={COLORS.pink} />
            <View style={styles.illustrationWrap}>
              <Image
                source={require('../../assets/images/illustration-envelope.png')}
                style={{ width: 230, height: 230, marginTop: 34 }}
                resizeMode="contain"
                accessibilityLabel="An envelope with a check mark"
              />
            </View>
          </View>

          <Text style={[styles.heading, styles.center]} accessibilityRole="header">
            Check your{'\n'}inbox
          </Text>
          <Text style={[styles.subtitle, styles.center, { maxWidth: 300 }]}>
            We sent a password reset link to{' '}
            <Text style={styles.emailInline}>{email.trim()}</Text>. It may take a minute to arrive.
          </Text>
          {!!notice && <Text style={styles.notice}>{notice}</Text>}

          <View style={styles.spacer} />

          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
              onPress={openEmailApp}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Open email app</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(89,59,250,0.10)' }}
              onPress={backToLogin}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Back to log in</Text>
            </Pressable>

            <View style={styles.resendRow}>
              <Text style={styles.footerText}>Did not get it? </Text>
              {cooldown > 0 ? (
                <Text style={styles.resendWait}>Resend in {timer}</Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => sendLink(true)}
                  hitSlop={8}
                >
                  <Text style={styles.link}>{loading ? 'Sending...' : 'Resend link'}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // STEP 1: "Forgot your password?"
  // ------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'‹'}</Text>
        </Pressable>

        <View style={[styles.area, { height: 200, marginTop: 16 }]}>
          <Shape source={SPARKLE} x={40} y={24} w={30} />
          <Shape source={BLOB} x={266} y={20} w={48} />
          <Shape source={SPARKLE} x={252} y={150} w={22} tint={COLORS.violet} />
          <Dot x={62} y={150} size={12} color={COLORS.coral} />
          <View style={styles.illustrationWrap}>
            <Image
              source={require('../../assets/images/illustration-lock.png')}
              style={{ width: 150, height: 150, marginTop: 22 }}
              resizeMode="contain"
              accessibilityLabel="A padlock"
            />
          </View>
        </View>

        <Text style={[styles.heading, { marginTop: 8 }]} accessibilityRole="header">
          Forgot your{'\n'}password?
        </Text>
        <Text style={styles.subtitle}>
          No worries. Enter your email and we will send you a link to reset it.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError]}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError('');
            }}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => sendLink(false)}
            accessibilityLabel="Email"
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: loading, busy: loading }}
          android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
          disabled={loading}
          onPress={() => sendLink(false)}
          style={({ pressed }) => [
            styles.primaryButton,
            { marginTop: 24 },
            (pressed || loading) && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send reset link'}</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Text style={[styles.footerText, styles.center]}>
          Remembered it?{' '}
          <Text style={styles.link} onPress={backToLogin} accessibilityRole="link">
            Back to log in
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  centered: { alignItems: 'center' },
  center: { textAlign: 'center' },

  // Back
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    marginTop: -3,
    marginRight: 2,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.ink,
    includeFontPadding: false,
  },

  // Illustration area
  area: { width: '100%', position: 'relative' },
  illustrationWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
  },

  // Text
  heading: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.7,
    color: COLORS.ink,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
    color: COLORS.muted,
  },
  emailInline: { fontWeight: '800', color: COLORS.ink },
  notice: { marginTop: 12, fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },

  // Field
  field: { marginTop: 28, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.ink },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F8F6FF',
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.ink,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.18,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 13, fontWeight: '600', color: COLORS.error },

  // Buttons
  buttons: { width: '100%', gap: 12 },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 4, shadowColor: COLORS.primary },
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  secondaryButtonText: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },

  // Footer
  spacer: { flex: 1, minHeight: 24 },
  footerText: { fontSize: 15, fontWeight: '500', color: COLORS.muted },
  link: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  resendRow: {
    marginTop: 8,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendWait: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
});
