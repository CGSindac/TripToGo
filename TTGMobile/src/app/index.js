
import React, { useEffect, useRef } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';


// ========================================
// ANIMATED ENTRANCE COMPONENT
// ========================================

const AnimatedEntrance = ({
  children,
  style,
  fromX = 0,
  fromY = 0,
  delay = 0,
  duration = 650,
  scaleFrom = 0.3,
  floatDistance = 10,
  floatDuration = 3000,
  rotation = '6deg',
  idle = true,
}) => {
  const entrance = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let floatingAnimation;

    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),

      Animated.parallel([
        Animated.timing(entrance, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(floatAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Start floating after entrance
    const startFloating = () => {
      if (!idle) return;

      floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: floatDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),

          Animated.timing(floatAnim, {
            toValue: 0,
            duration: floatDuration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      floatingAnimation.start();
    };

    // Entrance animation
    const animation = Animated.sequence([
      Animated.delay(delay),

      Animated.parallel([
        Animated.timing(entrance, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(floatAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        startFloating();
      }
    });

    return () => {
      animation.stop();
      floatingAnimation?.stop();
    };
  }, [
    entrance,
    floatAnim,
    delay,
    duration,
    floatDuration,
    idle,
  ]);

  // Entrance movement
  const translateX = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [fromX, 0],
  });

  const entranceY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [fromY, 0],
  });

  // Continuous floating movement
  const floatingY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -floatDistance],
  });

  const translateY = Animated.add(entranceY, floatingY);

  // Pop effect
  const scale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [scaleFrom, 1],
  });

  // Fade in
  const opacity = entrance;

  // Gentle rotation
  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotation],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
            { rotate },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};


// ========================================
// MAIN SPLASH SCREEN
// ========================================

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* ================================== */}
      {/* DECORATIVE CIRCLES AND DOTS */}
      {/* ================================== */}

      <AnimatedEntrance
        style={[
          styles.circle,
          {
            top: height * 0.12,
            left: width * 0.75,
          },
        ]}
        fromX={130}
        fromY={-50}
        delay={100}
        duration={650}
        floatDuration={2800}
      />

      <AnimatedEntrance
        style={[
          styles.smallCircle,
          {
            top: height * 0.35,
            left: width * 0.20,
          },
        ]}
        fromX={-120}
        fromY={0}
        delay={250}
        duration={600}
        floatDuration={3200}
      />

      <AnimatedEntrance
        style={[
          styles.purpleCircle,
          {
            top: height * 0.40,
            right: width * 0.08,
          },
        ]}
        fromX={140}
        fromY={20}
        delay={350}
        duration={650}
        floatDuration={2600}
      />

      <AnimatedEntrance
        style={[
          styles.yellowDot,
          {
            top: height * 0.53,
            left: width * 0.17,
          },
        ]}
        fromX={-100}
        fromY={30}
        delay={450}
        duration={600}
        floatDuration={3000}
      />

      <AnimatedEntrance
        style={[
          styles.purpleCircle,
          {
            top: height * 0.78,
            right: width * 0.15,
          },
        ]}
        fromX={150}
        fromY={50}
        delay={550}
        duration={700}
        floatDuration={3500}
      />

      <AnimatedEntrance
        style={[
          styles.smallCircle,
          {
            top: height * 0.88,
            left: width * 0.72,
          },
        ]}
        fromX={100}
        fromY={70}
        delay={650}
        duration={650}
        floatDuration={2700}
      />

      <AnimatedEntrance
        style={[
          styles.yellowDot,
          {
            top: height * 0.91,
            left: width * 0.28,
          },
        ]}
        fromX={-120}
        fromY={80}
        delay={700}
        duration={650}
        floatDuration={3300}
      />


      {/* ================================== */}
      {/* DECORATIVE IMAGE ELEMENTS */}
      {/* ================================== */}

      {/* Sparkle */}
      <AnimatedEntrance
        style={[
          styles.sparkle,
          {
            top: height * 0.11,
            left: width * 0.15,
          },
        ]}
        fromX={-160}
        fromY={-30}
        delay={0}
        duration={750}
        scaleFrom={0.2}
        rotation="12deg"
        floatDuration={2500}
      >
        <Image
          source={require('../../assets/images/shape-sparkle.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Sun */}
      <AnimatedEntrance
        style={[
          styles.sun,
          {
            top: height * 0.19,
            right: width * 0.12,
          },
        ]}
        fromX={160}
        fromY={-80}
        delay={150}
        duration={800}
        scaleFrom={0.3}
        rotation="-8deg"
        floatDistance={14}
        floatDuration={3800}
      >
        <Image
          source={require('../../assets/images/shape-sun.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Blob */}
      <AnimatedEntrance
        style={[
          styles.blob,
          {
            top: height * 0.22,
            left: width * 0.08,
          },
        ]}
        fromX={-150}
        fromY={20}
        delay={250}
        duration={750}
        scaleFrom={0.3}
        rotation="10deg"
        floatDistance={10}
        floatDuration={4200}
      >
        <Image
          source={require('../../assets/images/shape-blob.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Squiggle */}
      <AnimatedEntrance
        style={[
          styles.squiggle,
          {
            top: height * 0.32,
            right: width * 0.10,
          },
        ]}
        fromX={160}
        fromY={-20}
        delay={350}
        duration={800}
        scaleFrom={0.4}
        rotation="-8deg"
        floatDuration={3200}
      >
        <Image
          source={require('../../assets/images/shape-squiggle.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Compass */}
      <AnimatedEntrance
        style={[
          styles.compass,
          {
            top: height * 0.70,
            left: width * 0.09,
          },
        ]}
        fromX={-150}
        fromY={80}
        delay={450}
        duration={850}
        scaleFrom={0.2}
        rotation="15deg"
        floatDistance={14}
        floatDuration={3500}
      >
        <Image
          source={require('../../assets/images/shape-compass.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Small sparkle */}
      <AnimatedEntrance
        style={[
          styles.smallSparkle,
          {
            top: height * 0.70,
            right: width * 0.12,
          },
        ]}
        fromX={150}
        fromY={70}
        delay={550}
        duration={700}
        scaleFrom={0.2}
        rotation="-15deg"
        floatDuration={2300}
      >
        <Image
          source={require('../../assets/images/shape-sparkle.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* Bottom squiggle */}
      <AnimatedEntrance
        style={[
          styles.bottomSquiggle,
          {
            top: height * 0.81,
            left: width * 0.10,
          },
        ]}
        fromX={-160}
        fromY={100}
        delay={650}
        duration={850}
        scaleFrom={0.4}
        rotation="8deg"
        floatDistance={12}
        floatDuration={4000}
      >
        <Image
          source={require('../../assets/images/shape-squiggle.png')}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </AnimatedEntrance>


      {/* ================================== */}
      {/* MAIN LOGO AND APP NAME */}
      {/* ================================== */}

      <AnimatedEntrance
        style={styles.logoEntrance}
        fromX={0}
        fromY={25}
        delay={550}
        duration={900}
        scaleFrom={0.75}
        idle={false}
      >
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
      </AnimatedEntrance>

    </View>
  );
}


// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  // Main screen
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },


  // Main logo
  logoEntrance: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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

  imageFill: {
    width: '100%',
    height: '100%',
  },

});
