
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallScreen = height < 750;
  const artHeight = Math.min(width * 0.75, 300);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TRAVEL ILLUSTRATION */}
        <View style={[styles.illustration, { height: artHeight }]}>

          {/* Decorative stars */}
          <Text style={[styles.star, styles.starOrange]}>✦</Text>
          <Text style={[styles.star, styles.starPink]}>✦</Text>
          <Text style={[styles.star, styles.starPurple]}>✦</Text>

          {/* Sun */}
          <View style={styles.sun}>
            <View style={styles.sunCenter} />
            {[0, 45, 90, 135].map((rotation) => (
              <View
                key={rotation}
                style={[
                  styles.sunRay,
                  { transform: [{ rotate: `${rotation}deg` }] },
                ]}
              />
            ))}
          </View>

          {/* Decorative circles */}
          <View style={[styles.dot, styles.dotPink]} />
          <View style={[styles.dot, styles.dotOrange]} />
          <View style={[styles.dot, styles.dotPurple]} />
          <View style={[styles.dot, styles.dotCoral]} />

          {/* Pink flower */}
          <View style={styles.flower}>
            <View style={[styles.flowerPetal, { top: 0, left: 15 }]} />
            <View style={[styles.flowerPetal, { top: 0, right: 15 }]} />
            <View style={[styles.flowerPetal, { bottom: 0, left: 15 }]} />
            <View style={[styles.flowerPetal, { bottom: 0, right: 15 }]} />
            <View style={styles.flowerCenter} />
          </View>

          {/* Suitcase */}
          <View style={styles.suitcase}>
            <View style={styles.suitcaseHandle} />
            <View style={styles.suitcaseBody}>
              <View style={styles.suitcaseLine} />
              <View style={styles.suitcaseLine2} />
            </View>
          </View>

          {/* Folded travel map */}
          <View style={styles.mapShadow} />

          <View style={styles.map}>
            <View style={styles.mapPanel1}>
              <View style={styles.mapFoldLine} />
            </View>

            <View style={styles.mapPanel2}>
              <View style={styles.mapFoldLine} />
            </View>

            <View style={styles.mapPanel3}>
              <View style={styles.mapFoldLine} />
            </View>

            {/* Dotted travel route */}
            {[
              [12, 93], [20, 78], [32, 69], [45, 76],
              [57, 91], [70, 100], [84, 92], [99, 77],
              [114, 63], [129, 51], [145, 44], [160, 48],
            ].map(([left, top], index) => (
              <View
                key={index}
                style={[
                  styles.routeDot,
                  { left, top },
                ]}
              />
            ))}

            <View style={styles.mapDestination} />
          </View>

          {/* Travel ticket */}
          <View style={styles.ticket}>
            <Text style={styles.ticketDots}>⋮</Text>
          </View>

          {/* Compass */}
          <View style={styles.compass}>
            <View style={styles.compassTriangleTop} />
            <View style={styles.compassTriangleBottom} />
          </View>

        </View>

        {/* WELCOME TEXT */}
        <View style={styles.textSection}>
          <Text style={styles.heading}>
            Plan less.{"\n"}Wander more.
          </Text>

          <Text style={styles.description}>
            Build your itinerary, save the places you
            love, and take the whole trip with you.
          </Text>
        </View>

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

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 25,
    paddingBottom: 22,
    justifyContent: 'center',
  },

  // ILLUSTRATION
  illustration: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  star: {
    position: 'absolute',
    fontSize: 35,
    fontWeight: 'bold',
  },

  starOrange: {
    color: '#FFAD38',
    top: '10%',
    left: '3%',
  },

  starPink: {
    color: '#F044D1',
    top: '65%',
    right: '25%',
  },

  starPurple: {
    color: '#FF5970',
    top: '35%',
    left: '24%',
    fontSize: 27,
  },

  sun: {
    position: 'absolute',
    width: 54,
    height: 54,
    top: '7%',
    right: '4%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sunCenter: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#FFAD38',
  },

  sunRay: {
    position: 'absolute',
    width: 8,
    height: 17,
    borderRadius: 5,
    backgroundColor: '#FFAD38',
    top: -7,
  },

  dot: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 20,
  },

  dotPink: {
    backgroundColor: '#F044D1',
    right: '0%',
    top: '32%',
  },

  dotOrange: {
    backgroundColor: '#FFAD38',
    left: '25%',
    bottom: '7%',
  },

  dotPurple: {
    backgroundColor: '#7650FF',
    right: '4%',
    bottom: '5%',
  },

  dotCoral: {
    backgroundColor: '#FF5970',
    left: '0%',
    top: '73%',
  },

  flower: {
    position: 'absolute',
    width: 66,
    height: 66,
    top: '45%',
    left: '0%',
  },

  flowerPetal: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#E941C8',
  },

  flowerCenter: {
    position: 'absolute',
    width: 23,
    height: 23,
    borderRadius: 15,
    backgroundColor: '#E941C8',
    top: 21,
    left: 21,
  },

  // SUITCASE
  suitcase: {
    position: 'absolute',
    top: '38%',
    right: '2%',
    width: 52,
    height: 65,
    transform: [{ rotate: '9deg' }],
    alignItems: 'center',
  },

  suitcaseHandle: {
    width: 22,
    height: 13,
    borderWidth: 5,
    borderColor: '#7650FF',
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },

  suitcaseBody: {
    width: 48,
    height: 51,
    backgroundColor: '#7650FF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    overflow: 'hidden',
  },

  suitcaseLine: {
    width: 7,
    height: '100%',
    backgroundColor: '#A58AFF',
  },

  suitcaseLine2: {
    width: 7,
    height: '100%',
    backgroundColor: '#A58AFF',
  },

  // MAP
  mapShadow: {
    position: 'absolute',
    width: '65%',
    height: 13,
    bottom: '23%',
    borderRadius: 20,
    backgroundColor: '#E9E4FF',
    opacity: 0.75,
  },

  map: {
    position: 'absolute',
    width: 210,
    height: 135,
    top: '43%',
    flexDirection: 'row',
  },

  mapPanel1: {
    flex: 1,
    height: '100%',
    backgroundColor: '#7650FF',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    borderRightWidth: 3,
    borderRightColor: '#A78AFF',
  },

  mapPanel2: {
    flex: 1,
    height: '100%',
    backgroundColor: '#E941C8',
    borderRightWidth: 3,
    borderRightColor: '#F58ADB',
  },

  mapPanel3: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FF9E37',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },

  mapFoldLine: {
    position: 'absolute',
    left: 5,
    top: 10,
    height: '85%',
    width: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.45,
  },

  routeDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  mapDestination: {
    position: 'absolute',
    right: 27,
    top: 42,
    width: 17,
    height: 17,
    borderRadius: 12,
    borderWidth: 6,
    borderColor: '#17133D',
    backgroundColor: '#FFFFFF',
  },

  // TICKET
  ticket: {
    position: 'absolute',
    width: 100,
    height: 57,
    backgroundColor: '#FFAD38',
    borderRadius: 13,
    left: '2%',
    bottom: '17%',
    transform: [{ rotate: '-10deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },

  ticketDots: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    lineHeight: 44,
  },

  // COMPASS
  compass: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#FF5970',
    right: '2%',
    bottom: '9%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  compassTriangleTop: {
    position: 'absolute',
    top: 7,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 19,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF5970',
  },

  compassTriangleBottom: {
    position: 'absolute',
    bottom: 7,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 19,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFAD38',
  },

  // TEXT
  textSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 30,
  },

  heading: {
    fontSize: 43,
    lineHeight: 49,
    fontWeight: '900',
    color: '#17133D',
    textAlign: 'center',
    letterSpacing: -1.8,
    marginBottom: 18,
  },

  description: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    color: '#625D83',
    textAlign: 'center',
    paddingHorizontal: 2,
  },

  // BUTTONS
  buttonSection: {
    width: '100%',
    gap: 16,
  },

  primaryButton: {
    width: '100%',
    height: 76,
    borderRadius: 45,
    backgroundColor: '#593BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    height: 76,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#DDD5F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: '#17133D',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  // FOOTER
  footer: {
    marginTop: 28,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  footerText: {
    color: '#77718F',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },

  footerLink: {
    color: '#17133D',
    fontWeight: '800',
  },
});
