
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();

  async function handleGetStarted() {
    try {
      await AsyncStorage.setItem('hasVisited', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving first launch:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TripToGo!</Text>
      <Text>Your travel journey starts here.</Text>

      <Pressable style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
