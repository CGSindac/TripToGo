import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

/* ------------------------------------------------------------------ */
/* ASSETS                                                              */
/* ------------------------------------------------------------------ */
const IMG = {
  logo: require('../../assets/images/splash-logo.png'),
  blob: require('../../assets/images/shape-blob.png'),
  compass: require('../../assets/images/shape-compass.png'),
  sparkle: require('../../assets/images/shape-sparkle.png'),
  squiggle: require('../../assets/images/shape-squiggle.png'),
  suitcase: require('../../assets/images/shape-suitcase.png'),
  sun: require('../../assets/images/shape-sun.png'),
  ticket: require('../../assets/images/shape-ticket.png'),
  shadow: require('../../assets/images/shape-shadow.png'), 
};

const logoAsset = Image.resolveAssetSource(IMG.logo);
const LOGO_RATIO =
  logoAsset?.width && logoAsset?.height ? logoAsset.width / logoAsset.height : 1.5;

/* ------------------------------------------------------------------ */
/* THEME                                                               */
/* ------------------------------------------------------------------ */
const COLORS = {
  background: '#FFFFFF',
  primary: '#593BFA',
  ink: '#17133D',
  body: '#5E5A7A',
  muted: '#77718F',
  border: '#DDD5F5',
  orange: '#F4B24F',
  purple: '#6F52F5',
  magenta: '#D94FC8',
  red: '#EF5B5B',
};

const STAGE_RATIO = 1.07;

const SHAPES = [
  { src: IMG.sparkle, cx: 0.145, cy: 0.11, w: 0.085, ratio: 1, dir: 1 },
  { src: IMG.squiggle, cx: 0.44, cy: 0.105, w: 0.2, ratio: 0.45, dir: -1 },
  { src: IMG.sun, cx: 0.83, cy: 0.105, w: 0.17, ratio: 1, dir: 1 },
  { src: IMG.sparkle, cx: 0.31, cy: 0.27, w: 0.06, ratio: 1, tint: COLORS.red, dir: -1 },
  { src: IMG.blob, cx: 0.13, cy: 0.355, w: 0.145, ratio: 1, dir: 1 },
  { src: IMG.suitcase, cx: 0.85, cy: 0.41, w: 0.14, ratio: 1, dir: -1 },
  { src: IMG.ticket, cx: 0.19, cy: 0.79, w: 0.205, ratio: 0.8, dir: -1 },
  { src: IMG.compass, cx: 0.85, cy: 0.79, w: 0.125, ratio: 1, dir: 1 },
  { src: IMG.sparkle, cx: 0.648, cy: 0.93, w: 0.075, ratio: 1, tint: COLORS.magenta, dir: 1 },
];

const DOTS = [
  { cx: 0.915, cy: 0.22, d: 0.03, color: COLORS.magenta, dir: -1 },
  { cx: 0.067, cy: 0.58, d: 0.033, color: COLORS.red, dir: 1 },
  { cx: 0.33, cy: 0.94, d: 0.04, color: COLORS.orange, dir: -1 },
  { cx: 0.89, cy: 0.94, d: 0.037, color: COLORS.purple, dir: 1 },
  { cx: 0.17, cy: 0.98, d: 0.025, color: COLORS.purple, dir: -1 },
];

/* --------------------------------- */
/* FLOATING WRAPPER                  */
/* --------------------------------- */
function Floating({ anim, dir = 1, style, children }) {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4 * dir, 4 * dir],
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* SCREEN                                                              */
/* ------------------------------------------------------------------ */
export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [heroBox, setHeroBox] = useState(null);

  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  let stageW = 0;
  let stageH = 0;
  if (heroBox) {
    stageW = Math.min(heroBox.w, heroBox.h / STAGE_RATIO, 460);
    stageH = stageW * STAGE_RATIO;
  }

  const compact = screenH < 700;
  const headingSize = Math.round(Math.min(Math.max(Math.min(screenW, 480) * 0.095, 30), 40));

  const place = (cx, cy, w, h) => ({
    position: 'absolute',
    width: w,
    height: h,
    left: cx * stageW - w / 2,
    top: cy * stageH - h / 2,
  });

  const logoW = stageW * 0.47;
  const logoH = logoW / LOGO_RATIO;

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View
        style={styles.hero}
        onLayout={(e) =>
          setHeroBox({
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          })
        }
      >
        {heroBox && (
          <View style={{ width: stageW, height: stageH }}>
            {SHAPES.map((s, i) => { //shapes
              const w = s.w * stageW;
              return (
                <Floating key={`s${i}`} anim={float} dir={s.dir} style={place(s.cx, s.cy, w, w * s.ratio)}>
                  <Image
                    source={s.src}
                    style={[styles.fill, s.tint && { tintColor: s.tint }]}
                    resizeMode="contain"
                  />
                </Floating>
              );
            })}

            {/* confetti dots */}
            {DOTS.map((d, i) => {
              const size = d.d * stageW;
              return (
                <Floating key={`d${i}`} anim={float} dir={d.dir} style={place(d.cx, d.cy, size, size)}>
                  <View style={[styles.fill, { borderRadius: size / 2, backgroundColor: d.color }]} />
                </Floating>
              );
            })}

            {/* soft shadow */}
            <Image
              source={IMG.shadow}
              pointerEvents="none"
              resizeMode="contain"
              style={place(
                0.5,
                (0.54 * stageH + logoH / 2 + stageW * 0.03) / stageH,
                logoW * 1.15,
                logoW * 1.15 * 0.22
              )}
            />

            {/* LOGO */}
            <Image
              source={IMG.logo}
              style={place(0.5, 0.54, logoW, logoH)}
              resizeMode="contain"
              accessibilityLabel="TripToGo logo"
            />
          </View>
        )}
      </View>

      {/* WELCOME MESSAGE */}
      <View style={[styles.textSection, { marginTop: compact ? 4 : 12, marginBottom: compact ? 20 : 28 }]}>
        <Text
          style={[styles.heading, { fontSize: headingSize, lineHeight: Math.round(headingSize * 1.14) }]}
          accessibilityRole="header"
        >
          TagLine.{'\n'}or Trip TO Go.
        </Text>
        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet consectetur adipiscing elit mollit dolore soluta eum voluptas ullamco odio
        </Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.bottomSection}>
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.primaryButtonText}>Get started</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(89,59,250,0.10)' }}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </Pressable>

        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.footerLink}>Terms of Use</Text> and{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                              */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  hero: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  logoShadow: {
    borderRadius: 999,
    backgroundColor: 'rgba(111, 82, 245, 0.16)',
  },

  // Text
  textSection: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  heading: {
    color: COLORS.ink,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 12,
    paddingHorizontal: 8,
    color: COLORS.body,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Actions
  bottomSection: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
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
  secondaryButtonText: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Footer
  footerText: {
    marginTop: 8,
    paddingHorizontal: 12,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.ink,
    fontWeight: '700',
  },
});