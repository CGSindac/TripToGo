// src/app/(tabs)/reviews.js
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Reviews() {
  const { placeName } = useLocalSearchParams();
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Reviews</Text>
      <Text style={s.sub}>{typeof placeName === 'string' ? `Review writing for ${placeName} is coming soon.` : 'Coming soon'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: '800', color: '#17133D' },
  sub: { marginTop: 6, color: '#6B6788', textAlign: 'center' },
});
