// src/app/(tabs)/browse.js
import { StyleSheet, Text, View } from 'react-native';

export default function Browse() {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Browse</Text>
      <Text style={s.sub}>Coming soon</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: '800', color: '#17133D' },
  sub: { marginTop: 6, color: '#6B6788' },
});
