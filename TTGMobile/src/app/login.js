import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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
  field: '#F8F6FF',
  error: '#D93B4A',
  pink: '#E83FD0',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null); // 'email' | 'password' | null
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  };

  const validate = () => {
    const next = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (loading || !validate()) return;
    setLoading(true);
    try {
      // TODO: call backend
      Alert.alert('Logged in', 'The form works. Connect it to your backend next.');
    } catch (e) {
      setErrors({ form: e?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name) => [
    styles.input,
    focused === name && styles.inputFocused,
    errors[name] && styles.inputError,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* Decorative shapes */}
        <Image
          source={require('../../assets/images/shape-sun.png')}
          style={[styles.sun, { top: insets.top + 74 }]}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Image
          source={require('../../assets/images/shape-sparkle.png')}
          style={[styles.star, { top: insets.top + 56 }]}
          resizeMode="contain"
          accessibilityElementsHidden
          importantForAccessibility="no"
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={goBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backArrow}>{'‹'}</Text>
          </Pressable>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.heading} accessibilityRole="header">
              Welcome{'\n'}back
            </Text>
            <Text style={styles.subtitle}>
              Log in to pick up your trips right where you left off.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={fieldStyle('email')}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Email"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View>
                <TextInput
                  ref={passwordRef}
                  style={[...fieldStyle('password'), styles.passwordInput]}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword((s) => !s)}
                  hitSlop={8}
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/forgot-password')}
              style={styles.forgot}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {!!errors.form && <Text style={[styles.errorText, styles.formError]}>{errors.form}</Text>}

          {/* Log in */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loading, busy: loading }}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            disabled={loading}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || loading) && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(89,59,250,0.10)' }}
              style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}
              onPress={() => Alert.alert('Google', 'Google sign-in is not connected yet.')}
            >
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(89,59,250,0.10)' }}
              style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}
              onPress={() => Alert.alert('Apple', 'Apple sign-in is not connected yet.')}
            >
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          {/* Footer */}
          <Text style={styles.footer}>
            New to TripToGo?{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/signup')} accessibilityRole="link">
              Create an account
            </Text>
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background, overflow: 'hidden' },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  // Decorations 
  sun: { position: 'absolute', right: -12, width: 84, height: 84 },
  star: { position: 'absolute', right: 72, width: 22, height: 22, tintColor: COLORS.pink },

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

  // Heading
  header: { marginTop: 28 },
  heading: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: COLORS.ink,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 270,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
    color: COLORS.muted,
  },

  // Form
  form: { marginTop: 28, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.ink },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.field,
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
  passwordInput: { paddingRight: 72 },
  showButton: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  errorText: { fontSize: 13, fontWeight: '600', color: COLORS.error },
  formError: { marginTop: 12 },
  forgot: { alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center' },
  forgotText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },

  // Buttons
  primaryButton: {
    marginTop: 8,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },

  // Divider
  divider: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 14, fontWeight: '500', color: COLORS.muted },

  // Social
  socialRow: { marginTop: 20, flexDirection: 'row', gap: 12 },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  socialText: { fontSize: 16, fontWeight: '700', color: COLORS.ink },

  // Footer
  spacer: { flex: 1, minHeight: 24 },
  footer: { textAlign: 'center', fontSize: 15, fontWeight: '500', color: COLORS.muted },
  footerLink: { fontWeight: '800', color: COLORS.primary },
});