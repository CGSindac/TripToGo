
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

export default function Index() {
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisited');

        setDestination(hasVisited ? '/(tabs)' : '/welcome');
      } catch (error) {
        console.error('Error checking first launch:', error);
        setDestination('/welcome');
      }
    }

    checkFirstLaunch();
  }, []);

  if (!destination) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
