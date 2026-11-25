// src/app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import FloatingTabBar from '../../components/FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs backBehavior="history" tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="browse" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="reviews" />
      <Tabs.Screen name="places/[id]" />
    </Tabs>
  );
}
