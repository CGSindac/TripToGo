
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

      {/*DECORATIVE CIRCLES & DOTS*/}

      <View style={[styles.circle, {
        top: height * 0.12,
        left: width * 0.75,
      }]} />

      <View style={[styles.smallCircle, {
        top: height * 0.35,
        left: width * 0.20,
      }]} />

      <View style={[styles.purpleCircle, {
        top: height * 0.40,
        right: width * 0.08,
      }]} />

      <View style={[styles.yellowDot, {
        top: height * 0.53,
        left: width * 0.17,
      }]} />

      <View style={[styles.purpleCircle, {
        top: height * 0.78,
        right: width * 0.15,
      }]} />

      <View style={[styles.smallCircle, {
        top: height * 0.88,
        left: width * 0.72,
      }]} />

      <View style={[styles.yellowDot, {
        top: height * 0.91,
        left: width * 0.28,
      }]} />


      {/* DECORATIVE IMAGE ELEMENTS */}

      <Image
        source={require('../../assets/images/shape-sparkle.png')}
        style={[styles.sparkle, {
          top: height * 0.11,
          left: width * 0.15,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-sun.png')}
        style={[styles.sun, {
          top: height * 0.19,
          right: width * 0.12,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-blob.png')}
        style={[styles.blob, {
          top: height * 0.22,
          left: width * 0.08,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-squiggle.png')}
        style={[styles.squiggle, {
          top: height * 0.32,
          right: width * 0.10,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-compass.png')}
        style={[styles.compass, {
          top: height * 0.70,
          left: width * 0.09,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-sparkle.png')}
        style={[styles.smallSparkle, {
          top: height * 0.70,
          right: width * 0.12,
        }]}
        resizeMode="contain"
      />

      <Image
        source={require('../../assets/images/shape-squiggle.png')}
        style={[styles.bottomSquiggle, {
          top: height * 0.81,
          left: width * 0.10,
        }]}
        resizeMode="contain"
      />


      {/* MAIN LOGO & APP NAME*/}

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

  // Main screen
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },


  // Main logo container
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
    letterSpacing: 0.5,
  },

  purple: {
    color: '#A83DEB',
  },

  tagline: {
    fontSize: 17,
    fontWeight: '600',
    color: '#625F7D',
    marginTop: 12,
    letterSpacing: 0.3,
  },


  // Decorative circles
  circle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: '#FCE38A',
  },

  smallCircle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 50,
    backgroundColor: '#A83DEB',
  },

  purpleCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 50,
    backgroundColor: '#A83DEB',
  },

  yellowDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 50,
    backgroundColor: '#FCE38A',
  },


  // Decorative images
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
    width: 45,
    height: 45,
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
