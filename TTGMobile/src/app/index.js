
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Decorative elements */}
      <Image
        source={require('../../assets/images/shape-sparkle.png')}
        style={[styles.sparkle, {
          top: height * 0.11,
          left: width * 0.15,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-sun.png')}
        style={[styles.sun, {
          top: height * 0.19,
          right: width * 0.12,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-blob.png')}
        style={[styles.blob, {
          top: height * 0.29,
          left: width * 0.08,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-squiggle.png')}
        style={[styles.squiggle, {
          top: height * 0.36,
          right: width * 0.10,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-compass.png')}
        style={[styles.compass, {
          top: height * 0.67,
          left: width * 0.09,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-sparkle.png')}
        style={[styles.smallSparkle, {
          top: height * 0.70,
          right: width * 0.12,
        }]}
      />

      <Image
        source={require('../../assets/images/shape-squiggle.png')}
        style={[styles.bottomSquiggle, {
          top: height * 0.81,
          left: width * 0.10,
        }]}
      />

      {/* Main logo and app name */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/splash-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.appName}>
          Trip<Text style={styles.purple}>To</Text>Go
        </Text>

        <Text style={styles.tagline}>
          Unfold your next trip.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 220,
    height: 170,
  },

  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#17143D',
    marginTop: 25,
  },

  purple: {
    color: '#A83DEB',
  },

  tagline: {
    fontSize: 17,
    fontWeight: '600',
    color: '#625F7D',
    marginTop: 12,
  },

  sparkle: {
    position: 'absolute',
    width: 35,
    height: 35,
  },

  sun: {
    position: 'absolute',
    width: 75,
    height: 75,
  },

  blob: {
    position: 'absolute',
    width: 65,
    height: 65,
  },

  squiggle: {
    position: 'absolute',
    width: 90,
    height: 45,
  },

  compass: {
    position: 'absolute',
    width: 55,
    height: 55,
  },

  smallSparkle: {
    position: 'absolute',
    width: 35,
    height: 35,
  },

  bottomSquiggle: {
    position: 'absolute',
    width: 100,
    height: 45,
  },
});
