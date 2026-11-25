// src/components/FloatingTabBar.js
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const TABS = {
  home: { label: 'Home', on: require('../../assets/images/tab-home-active.png'), off: require('../../assets/images/tab-home.png') },
  browse: { label: 'Browse', on: require('../../assets/images/tab-browse-active.png'), off: require('../../assets/images/tab-browse.png') },
  explore: { label: 'Explore', on: require('../../assets/images/tab-explore-active.png'), off: require('../../assets/images/tab-explore.png') },
  reviews: { label: 'Reviews', on: require('../../assets/images/tab-reviews-active.png'), off: require('../../assets/images/tab-reviews.png') },
};

export default function FloatingTabBar({ state }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[s.bar, { bottom: 20 + insets.bottom * 0.5 }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === i;
        const onPress = () => {
          if (!focused) router.navigate(`/(tabs)/${route.name}`);
        };
        return (
          <Pressable key={route.key} onPress={onPress} style={s.item} accessibilityRole="button" accessibilityLabel={tab.label}>
            <View style={[s.pill, focused && s.pillOn]}>
              <Image source={focused ? tab.on : tab.off} style={s.icon} />
              {focused && <Text style={s.label}>{tab.label}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute', left: 16, right: 16, height: 64, borderRadius: 32,
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: 8, elevation: 12,
    shadowColor: '#593BFA', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { height: 44, minWidth: 44, borderRadius: 22, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: '#F1EDFF' },
  icon: { width: 24, height: 24 },
  label: { marginLeft: 6, fontSize: 13, fontWeight: '800', color: '#593BFA' },
});
