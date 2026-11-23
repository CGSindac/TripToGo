import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BackHandler,
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
  useWindowDimensions,
} from 'react-native';

const COLORS = {
  background: '#FFFFFF',
  primary: '#593BFA',
  ink: '#17133D',
  muted: '#6B6788',
  border: '#DDD5F5',
  field: '#F8F6FF',
  soft: '#F1EDFF',
  track: '#E3DEF3',
  error: '#D93B4A',
  weak: '#FF5C6A',
  okay: '#FFB13D',
  strong: '#2FB67C',
  pink: '#E83FD0',
  violet: '#7A4DFF',
  coral: '#FF5C6A',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

// Images
const IMG = {
  sun: require('../../assets/images/shape-sun.png'),
  sparkle: require('../../assets/images/shape-sparkle.png'),
  compass: require('../../assets/images/shape-compass.png'),
  mountain: require('../../assets/images/icon-mountain.png'),
  city: require('../../assets/images/icon-city.png'),
  food: require('../../assets/images/icon-food.png'),
  culture: require('../../assets/images/icon-culture.png'),
  road: require('../../assets/images/icon-road.png'),
  moon: require('../../assets/images/icon-moon.png'),
  checkPurple: require('../../assets/images/badge-check-purple.png'),
  checkGreen: require('../../assets/images/badge-check-green.png'),
  checkWhite: require('../../assets/images/check-white.png'),
  envelope: require('../../assets/images/illustration-envelope-plain.png'),
  logo: require('../../assets/images/splash-logo.png'),
  logoShadow: require('../../assets/images/logo-shadow.png'),
};

const INTERESTS = [
  { id: 'beaches', label: 'Beaches', icon: IMG.sun, tint: '#FFE9B8' },
  { id: 'mountains', label: 'Mountains', icon: IMG.mountain, tint: '#E4DBFF' },
  { id: 'city', label: 'City breaks', icon: IMG.city, tint: '#FFD9E2' },
  { id: 'food', label: 'Food trips', icon: IMG.food, tint: '#FFE0D6' },
  { id: 'culture', label: 'Culture', icon: IMG.culture, tint: '#FFE9B8' },
  { id: 'road', label: 'Road trips', icon: IMG.road, tint: '#E4DBFF' },
  { id: 'adventure', label: 'Adventure', icon: IMG.compass, tint: '#FFD9E2' },
  { id: 'relaxing', label: 'Relaxing', icon: IMG.moon, tint: '#D9F2F5' },
];

// Decorative shapes 
const AREA_W = 342;
const at = (x) => `${(x / AREA_W) * 100}%`;

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

// -----------------------------------------------------------
// Header with the back button and the 3-step progress bar
// -----------------------------------------------------------
function Header({ stepNumber, onBack }) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backArrow}>{'‹'}</Text>
      </Pressable>
      <View style={styles.progress} accessible accessibilityLabel={`Step ${stepNumber} of 3`}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[styles.progressSegment, { backgroundColor: n <= stepNumber ? COLORS.primary : COLORS.track }]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>{stepNumber}/3</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, loading, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, style, (pressed || loading) && styles.pressed]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

// -----------------------
// Screen
// -----------------------
export default function Signup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [step, setStep] = useState('details'); // 'details' | 'verify' | 'interests' | 'done'
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Step 2
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState('');
  const codeRefs = useRef([]);

  // Step 3
  const [picked, setPicked] = useState([]);

  const clearError = (key) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ----- Android hardware back button moves between steps -----
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'verify') {
        setStep('details');
        return true;
      }
      if (step === 'interests') {
        setStep('verify');
        return true;
      }
      if (step === 'done') return true;
      return false;
    });
    return () => sub.remove();
  }, [step]);

  // ----- Resend countdown -----
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ----- Focus the first code box when the verify step opens -----
  useEffect(() => {
    if (step !== 'verify') return undefined;
    const t = setTimeout(() => codeRefs.current[0]?.focus(), 250);
    return () => clearTimeout(t);
  }, [step]);

  const goBackFromDetails = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  };

  // ----- Password strength -----
  const score = !password
    ? 0
    : Math.max(
        1,
        (password.length >= 8 ? 1 : 0) +
          (/\d/.test(password) ? 1 : 0) +
          (password.length >= 12 || (/[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) ? 1 : 0)
      );
  const strengthColor = [COLORS.track, COLORS.weak, COLORS.okay, COLORS.strong][score];
  const strengthHint =
    score === 0
      ? 'Use 8 or more characters with a number.'
      : score === 1
        ? 'Weak. Use 8 or more characters with a number.'
        : score === 2
          ? 'Okay. Add more characters to make it stronger.'
          : 'Strong password.';

  // ----- Step 1: details -----
  const submitDetails = async () => {
    if (loading) return;
    const next = {};
    if (!name.trim()) next.name = 'Enter your name.';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8 || !/\d/.test(password)) next.password = 'Use 8 or more characters with a number.';
    if (!agree) next.agree = 'Please accept the Terms of Use and Privacy Policy.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      // TODO: create the account on backend, which should email a 6-digit code, for example:
      // const res = await fetch(`${API_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      // });
      // if (!res.ok) throw new Error('We could not create your account.');
      setCode(Array(CODE_LENGTH).fill(''));
      setNotice('');
      setCooldown(RESEND_SECONDS);
      setStep('verify');
    } catch (e) {
      setErrors({ form: e?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ----- Step 2: verify code -----
  const handleCodeChange = (index, text) => {
    const digits = text.replace(/\D/g, '');
    setErrors((e) => ({ ...e, code: undefined }));

    if (!digits) {
      setCode((c) => c.map((d, i) => (i === index ? '' : d)));
      return;
    }
    if (digits.length === 1) {
      setCode((c) => c.map((d, i) => (i === index ? digits : d)));
      if (index < CODE_LENGTH - 1) codeRefs.current[index + 1]?.focus();
      return;
    }

    setCode((c) => {
      const next = [...c];
      digits
        .slice(0, CODE_LENGTH - index)
        .split('')
        .forEach((d, i) => {
          next[index + i] = d;
        });
      return next;
    });
    const last = Math.min(index + digits.length, CODE_LENGTH) - 1;
    codeRefs.current[Math.min(last + 1, CODE_LENGTH - 1)]?.focus();
  };

  const handleCodeKey = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      setCode((c) => c.map((d, i) => (i === index - 1 ? '' : d)));
      codeRefs.current[index - 1]?.focus();
    }
  };

  const submitCode = async () => {
    if (loading) return;
    if (code.join('').length < CODE_LENGTH) {
      setErrors({ code: 'Enter the 6-digit code.' });
      return;
    }
    setLoading(true);
    try {
      // TODO: check the code on backend, for example:
      // const res = await fetch(`${API_URL}/auth/verify`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim(), code: code.join('') }),
      // });
      // if (!res.ok) throw new Error('That code is not right. Please try again.');
      setErrors({});
      setStep('interests');
    } catch (e) {
      setErrors({ code: e?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (cooldown > 0) return;
    // TODO: ask your backend to send a new code.
    setNotice('We sent you a new code.');
    setCooldown(RESEND_SECONDS);
  };

  // ----- Step 3: interests -----
  const toggleInterest = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const finishInterests = () => {
    // TODO: save `picked` to the user's profile on your backend.
    setStep('done');
  };

  // ----- Layout helpers -----
  const contentWidth = Math.min(width, 480);
  const cardWidth = (contentWidth - 48 - 12) / 2;
  const isShort = height < 700;
  const timer = `0:${String(cooldown).padStart(2, '0')}`;

  const contentStyle = [
    styles.content,
    { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) + 16 },
  ];

  const fieldStyle = (key) => [
    styles.input,
    focused === key && styles.inputFocused,
    errors[key] && styles.inputError,
  ];

  // ===============================
  // STEP 1: Create your account
  // ===============================
  const renderDetails = () => (
    <>
      <Image
        source={IMG.sun}
        style={[styles.sun, { top: insets.top + 74 }]}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <Image
        source={IMG.sparkle}
        style={[styles.star, { top: insets.top + 56 }]}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <ScrollView
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header stepNumber={1} onBack={goBackFromDetails} />

        <Text style={[styles.heading, { marginTop: 28 }]} accessibilityRole="header">
          Create your{'\n'}account
        </Text>
        <Text style={[styles.subtitle, { maxWidth: 270 }]}>Start planning trips in just a few minutes.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={fieldStyle('name')}
              value={name}
              onChangeText={(t) => {
                setName(t);
                clearError('name');
              }}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              onSubmitEditing={() => emailRef.current?.focus()}
              accessibilityLabel="Full name"
            />
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={fieldStyle('email')}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError('email');
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
                style={[...fieldStyle('password'), { paddingRight: 72 }]}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  clearError('password');
                }}
                placeholder="Create a password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
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
            <View style={styles.strengthRow} accessible accessibilityLabel={`Password strength: ${score} of 3`}>
              {[1, 2, 3].map((n) => (
                <View
                  key={n}
                  style={[styles.strengthBar, { backgroundColor: n <= score ? strengthColor : COLORS.track }]}
                />
              ))}
            </View>
            <Text style={[styles.hint, !!errors.password && { color: COLORS.error, fontWeight: '600' }]}>
              {errors.password || strengthHint}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => {
            setAgree((a) => !a);
            clearError('agree');
          }}
          style={styles.agreeRow}
        >
          <View style={[styles.checkbox, agree && styles.checkboxOn, !!errors.agree && !agree && styles.inputError]}>
            {agree && <Image source={IMG.checkWhite} style={styles.checkboxTick} />}
          </View>
          <Text style={styles.agreeText}>
            I agree to the <Text style={styles.agreeLink}>Terms of Use</Text> and{' '}
            <Text style={styles.agreeLink}>Privacy Policy</Text>.
          </Text>
        </Pressable>
        {!!errors.agree && <Text style={[styles.errorText, { marginTop: 6 }]}>{errors.agree}</Text>}
        {!!errors.form && <Text style={[styles.errorText, { marginTop: 10 }]}>{errors.form}</Text>}

        <PrimaryButton
          label={loading ? 'Creating account...' : 'Continue'}
          onPress={submitDetails}
          loading={loading}
          style={{ marginTop: 20 }}
        />

        <View style={styles.spacer} />

        <Text style={[styles.footer, styles.center]}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.replace('/login')} accessibilityRole="link">
            Log in
          </Text>
        </Text>
      </ScrollView>
    </>
  );

  // ================================
  // STEP 2: Verify your email
  // ================================
  const renderVerify = () => (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Header stepNumber={2} onBack={() => setStep('details')} />

      <View style={[styles.area, { height: 150, marginTop: 20 }]}>
        <Shape source={IMG.sparkle} x={38} y={20} w={28} />
        <Shape source={IMG.sparkle} x={290} y={96} w={22} tint={COLORS.pink} />
        <Dot x={300} y={30} size={12} color={COLORS.violet} />
        <Dot x={62} y={110} size={12} color={COLORS.coral} />
        <View style={styles.illustrationWrap}>
          <Image
            source={IMG.envelope}
            style={{ width: 190, height: 133, marginTop: 8 }}
            resizeMode="contain"
            accessibilityLabel="An envelope"
          />
        </View>
      </View>

      <Text style={[styles.heading, { marginTop: 8 }]} accessibilityRole="header">
        Verify your{'\n'}email
      </Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code we sent to <Text style={styles.emailInline}>{email.trim() || 'your email'}</Text>.
      </Text>

      <View style={styles.codeRow}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              codeRefs.current[i] = r;
            }}
            style={[
              styles.codeBox,
              !!digit && styles.codeBoxFilled,
              focused === `code${i}` && styles.inputFocused,
              !!errors.code && styles.inputError,
            ]}
            value={digit}
            onChangeText={(t) => handleCodeChange(i, t)}
            onKeyPress={(e) => handleCodeKey(i, e)}
            onFocus={() => setFocused(`code${i}`)}
            onBlur={() => setFocused(null)}
            keyboardType="number-pad"
            autoComplete={i === 0 ? 'sms-otp' : 'off'}
            textContentType={i === 0 ? 'oneTimeCode' : 'none'}
            selectTextOnFocus
            maxLength={i === 0 ? CODE_LENGTH : 2}
            caretHidden
            accessibilityLabel={`Digit ${i + 1}`}
          />
        ))}
      </View>
      {!!errors.code && <Text style={[styles.errorText, styles.center, { marginTop: 10 }]}>{errors.code}</Text>}

      <View style={styles.resendRow}>
        <Text style={styles.footer}>Did not get a code? </Text>
        {cooldown > 0 ? (
          <Text style={styles.resendWait}>Resend in {timer}</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={resendCode} hitSlop={8}>
            <Text style={styles.footerLink}>Resend code</Text>
          </Pressable>
        )}
      </View>
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <PrimaryButton
        label={loading ? 'Verifying...' : 'Verify'}
        onPress={submitCode}
        loading={loading}
        style={{ marginTop: 24 }}
      />

      <View style={styles.spacer} />

      <Text style={[styles.footer, styles.center]}>
        Wrong email?{' '}
        <Text style={styles.footerLink} onPress={() => setStep('details')} accessibilityRole="link">
          Change it
        </Text>
      </Text>
    </ScrollView>
  );

  // ================================
  // STEP 3: Travel style
  // ================================
  const renderInterests = () => (
    <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
      <Header stepNumber={3} onBack={() => setStep('verify')} />

      <Text style={[styles.heading, { marginTop: 28 }]} accessibilityRole="header">
        What is your{'\n'}travel style?
      </Text>
      <Text style={styles.subtitle}>Pick a few and we will suggest trips you will love.</Text>

      <View style={styles.grid}>
        {INTERESTS.map((item) => {
          const on = picked.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => toggleInterest(item.id)}
              style={({ pressed }) => [
                styles.card,
                { width: cardWidth },
                on && styles.cardOn,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.tint }]}>
                <Image source={item.icon} style={styles.cardIconImage} resizeMode="contain" />
              </View>
              <Text style={styles.cardLabel} numberOfLines={1}>
                {item.label}
              </Text>
              {on && <Image source={IMG.checkPurple} style={styles.cardCheck} />}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton label="Continue" onPress={finishInterests} style={{ marginTop: 24 }} />

      <View style={styles.spacer} />

      <Pressable accessibilityRole="button" onPress={finishInterests} style={styles.skip}>
        <Text style={styles.footerLink}>Skip for now</Text>
      </Pressable>
    </ScrollView>
  );

  // ==================================
  // COMPLETED SCREEN: You are all set
  // ==================================
  const renderDone = () => {
    const stage = isShort ? 320 : 420;
    return (
      <ScrollView
        contentContainerStyle={[...contentStyle, { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', height: stage, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.logoBox}>
            <Image source={IMG.logoShadow} style={styles.logoShadow} resizeMode="contain" />
            <Image
              source={IMG.logo}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="TripToGo logo"
            />
            <Image
              source={IMG.checkGreen}
              style={styles.logoCheck}
              accessibilityLabel="Success"
            />
          </View>
        </View>

        <Text style={[styles.heading, styles.center, { fontSize: 38, lineHeight: 42 }]} accessibilityRole="header">
          You are all set!
        </Text>
        <Text style={[styles.subtitle, styles.center, { maxWidth: 300 }]}>
          Your account is ready. Let us plan your first trip.
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton
          label="Start exploring"
          // TODO: send the user to your real home screen once the account is saved.
          onPress={() => router.replace('/(tabs)')}
          style={{ width: '100%' }}
        />
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.flex}>
        {step === 'details' && renderDetails()}
        {step === 'verify' && renderVerify()}
        {step === 'interests' && renderInterests()}
        {step === 'done' && renderDone()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, overflow: 'hidden' },
  screen: { flex: 1, backgroundColor: COLORS.background },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  center: { textAlign: 'center' },
  spacer: { flex: 1, minHeight: 24 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },

  // Decorations on step 1
  sun: { position: 'absolute', right: -12, width: 84, height: 84 },
  star: { position: 'absolute', right: 72, width: 22, height: 22, tintColor: COLORS.pink },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
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
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 6, borderRadius: 3 },
  progressText: { fontSize: 14, fontWeight: '700', color: COLORS.muted },

  // Illustration area (verify step)
  area: { width: '100%', position: 'relative' },
  illustrationWrap: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center' },

  // Text
  heading: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: COLORS.ink,
    includeFontPadding: false,
  },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 23, fontWeight: '500', color: COLORS.muted },
  emailInline: { fontWeight: '800', color: COLORS.ink },
  notice: { marginTop: 8, fontSize: 14, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },

  // Form
  form: { marginTop: 24, gap: 16 },
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
  errorText: { fontSize: 13, fontWeight: '600', color: COLORS.error },
  hint: { fontSize: 13, fontWeight: '500', color: COLORS.muted },
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
  strengthRow: { flexDirection: 'row', gap: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },

  // Terms checkbox
  agreeRow: { marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTick: { width: 18, height: 18 },
  agreeText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500', color: COLORS.muted },
  agreeLink: { fontWeight: '800', color: COLORS.ink },

  // Verify code
  codeRow: { marginTop: 28, flexDirection: 'row', gap: 10 },
  codeBox: {
    flex: 1,
    minWidth: 0,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.field,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.ink,
    padding: 0,
  },
  codeBoxFilled: { backgroundColor: '#FFFFFF' },
  resendRow: {
    marginTop: 20,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendWait: { fontSize: 15, fontWeight: '800', color: COLORS.ink },

  // Travel style cards
  grid: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    height: 84,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardOn: { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.soft },
  cardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardIconImage: { width: 30, height: 30 },
  cardLabel: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.ink },
  cardCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22 },
  skip: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },

  // Done
  logoBox: { width: 250, height: 180 },
  logoImage: { width: 250, height: 180 },
  logoShadow: { position: 'absolute', left: 15, top: 173, width: 220, height: 40 },
  logoCheck: { position: 'absolute', right: -7, top: -20, width: 64, height: 64 },

  // Buttons and footer
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
  footer: { fontSize: 15, fontWeight: '500', color: COLORS.muted },
  footerLink: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
});
