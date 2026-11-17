
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* LOGO */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../assets/images/splash-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* TAGLINE */}
      <View style={styles.textSection}>
        <Text style={styles.heading}>
          Lorem Ipsum.{"\n"}Dolor sit.
        </Text>
      </View>

      {/* BOTTOM SECTION */}
      <View style={styles.bottomSection}>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonSection}>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.primaryButtonText}>
              Get started
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </Pressable>

        </View>

        {/* TERMS AND PRIVACY */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Use</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy.</Text>
          </Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  // MAIN SCREEN
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },

  // LOGO
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 200,
  },

  logo: {
    width: '100%',
    height: 200,
  },

  // TAGLINE
  textSection: {
    alignItems: 'center',
    marginTop: -100,
  },

  heading: {
    height: 300,
    fontSize: 40,
    lineHeight: 47,
    fontWeight: '900',
    color: '#17133D',
    textAlign: 'center',
    letterSpacing: -1.8,
  },

  // BOTTOM SECTION
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: 25,
  },

  // BUTTONS
  buttonSection: {
    width: '100%',
    gap: 13,
  },

  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 35,
    backgroundColor: '#593BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#DDD5F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: '#17133D',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  // FOOTER
  footer: {
    marginTop: 22,
    paddingHorizontal: 5,
    alignItems: 'center',
  },

  footerText: {
    color: '#77718F',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },

  footerLink: {
    color: '#17133D',
    fontWeight: '800',
  },

});
