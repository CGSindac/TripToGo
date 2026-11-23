// src/app/(tabs)/index.js  — Home
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, ImageBackground, Image, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ---------- CONFIG ----------
const API_URL = 'http://10.0.2.2:8080'; // Android emulator -> your Mac
const USE_SAMPLE_DATA = true; // set to false once your backend has GET /api/home

const IMG = {
  logo: require('../../../assets/images/splash-logo.png'),
  hero: require('../../../assets/images/hero-banner.png'),
  placeFallback: require('../../../assets/images/place-fallback.png'),
  tripFallback: require('../../../assets/images/trip-fallback.png'),
  avatar: require('../../../assets/images/avatar-default.png'),
  search: require('../../../assets/images/icon-search.png'),
  filter: require('../../../assets/images/icon-filter.png'),
  heart: require('../../../assets/images/icon-heart.png'),
  heartFilled: require('../../../assets/images/icon-heart-filled.png'),
  star: require('../../../assets/images/icon-star.png'),
  calendar: require('../../../assets/images/icon-calendar.png'),
  chevron: require('../../../assets/images/icon-chevron.png'),
};

const C = {
  primary: '#593BFA', ink: '#17133D', muted: '#6B6788', border: '#DDD5F5',
  field: '#F8F6FF', soft: '#F1EDFF', error: '#D93B4A',
};

// ---------- DATA ----------
// Expected API response (GET /api/home):
// {
//   user: { name, avatarUrl },
//   recommended: { id, name, imageUrl, rating, estimatedCost, currency, description },
//   currentTrip: { id, name, imageUrl, startDate, endDate, description } | null
// }
const SAMPLE = {
  user: { name: 'Kristine', avatarUrl: null },
  recommended: {
    id: 'p1', name: 'El Nido, Palawan', imageUrl: null, rating: 4.8,
    estimatedCost: 12500, currency: 'PHP',
    description: 'Limestone cliffs, hidden lagoons and island hopping.',
  },
  currentTrip: {
    id: 't1', name: 'Baguio Weekend', imageUrl: null,
    startDate: '2026-12-12', endDate: '2026-12-16',
    description: 'Pine trees, markets and cool air.',
  },
};

async function fetchHome() {
  if (USE_SAMPLE_DATA) {
    await new Promise((r) => setTimeout(r, 1200));
    return SAMPLE;
  }
  // TODO: add the auth token: headers: { Authorization: `Bearer ${token}` }
  const res = await fetch(`${API_URL}/api/home`);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

// ---------- HELPERS ----------
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const formatMoney = (amount, currency = 'PHP') => {
  if (amount == null) return '';
  const symbol = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString('en-US')} est. cost`;
};

const formatRange = (start, end) => {
  const f = (s) => {
    const d = new Date(s);
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const a = f(start), b = f(end);
  return a && b ? `${a} - ${b}` : a || b;
};

// ---------- SMALL COMPONENTS ----------
function Skeleton({ style }) {
  const o = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return <Animated.View style={[{ backgroundColor: '#E8E1FA', borderRadius: 8, opacity: o }, style]} />;
}

// Shows the API image, or a fallback picture if missing / failed
function RemoteImage({ uri, fallback, style }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const source = uri && !failed ? { uri } : fallback;
  return <Image source={source} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}

function PlaceCard({ place, saved, onToggleSave, onPress }) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View>
        <RemoteImage uri={place.imageUrl} fallback={IMG.placeFallback} style={s.placeImg} />
        <Pressable style={s.heartBtn} onPress={onToggleSave} hitSlop={8}>
          <Image source={saved ? IMG.heartFilled : IMG.heart} style={s.icon20} />
        </Pressable>
      </View>
      <View style={s.cardBody}>
        <View style={s.rowBetween}>
          <Text style={s.cardTitle} numberOfLines={1}>{place.name}</Text>
          {place.rating != null && (
            <View style={s.row}>
              <Image source={IMG.star} style={s.icon16} />
              <Text style={s.rating}>{Number(place.rating).toFixed(1)}</Text>
            </View>
          )}
        </View>
        {place.estimatedCost != null && (
          <Text style={s.cost}>{formatMoney(place.estimatedCost, place.currency)}</Text>
        )}
        {!!place.description && <Text style={s.desc} numberOfLines={1}>{place.description}</Text>}
      </View>
    </Pressable>
  );
}

function PlaceSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton style={[s.placeImg, { borderRadius: 0 }]} />
      <View style={s.cardBody}>
        <Skeleton style={{ height: 18, width: '60%' }} />
        <Skeleton style={{ height: 14, width: '40%', marginTop: 10 }} />
        <Skeleton style={{ height: 14, width: '85%', marginTop: 10 }} />
      </View>
    </View>
  );
}

function TripCard({ trip, onPress }) {
  return (
    <Pressable style={[s.card, s.tripCard]} onPress={onPress}>
      <RemoteImage uri={trip.imageUrl} fallback={IMG.tripFallback} style={s.tripImg} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={s.cardTitle} numberOfLines={1}>{trip.name}</Text>
        <View style={[s.row, { marginTop: 6 }]}>
          <Image source={IMG.calendar} style={s.icon16} />
          <Text style={s.tripDates}>{formatRange(trip.startDate, trip.endDate)}</Text>
        </View>
        {!!trip.description && <Text style={s.desc} numberOfLines={1}>{trip.description}</Text>}
      </View>
      <Image source={IMG.chevron} style={s.icon20} />
    </Pressable>
  );
}

function TripSkeleton() {
  return (
    <View style={[s.card, s.tripCard]}>
      <Skeleton style={s.tripImg} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Skeleton style={{ height: 18, width: '55%' }} />
        <Skeleton style={{ height: 14, width: '45%', marginTop: 10 }} />
        <Skeleton style={{ height: 14, width: '80%', marginTop: 10 }} />
      </View>
    </View>
  );
}

function EmptyCard({ title, text }) {
  return (
    <View style={[s.card, s.emptyCard]}>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.desc}>{text}</Text>
    </View>
  );
}

// ---------- SCREEN ----------
export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setData(await fetchHome());
    } catch (e) {
      setError('We could not load your trips. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstName = (data?.user?.name || '').split(' ')[0] || 'traveler';

  const submitSearch = () => {
    const q = query.trim();
    if (q) router.push({ pathname: '/explore', params: { q } });
  };

  const toggleSave = () => {
    setSaved((v) => !v);
    // TODO: POST/DELETE `${API_URL}/api/places/${data.recommended.id}/save`
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.primary} colors={[C.primary]} />}
    >
      {/* Header */}
      <View style={[s.rowBetween, { paddingHorizontal: 24 }]}>
        <View style={s.row}>
          <Image source={IMG.logo} style={s.logo} resizeMode="contain" />
          <Text style={s.brand}>Trip<Text style={{ color: '#A83DEB' }}>To</Text>Go</Text>
        </View>
        <Pressable onPress={() => router.push('/profile')}>
          <RemoteImage uri={data?.user?.avatarUrl} fallback={IMG.avatar} style={s.avatar} />
        </Pressable>
      </View>

      {/* Greeting banner */}
      <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
        <ImageBackground source={IMG.hero} style={s.hero} imageStyle={{ borderRadius: 28 }}>
          <Text style={s.heroTitle}>{greeting()}, {firstName}</Text>
          <Text style={s.heroSub}>Where do you want to go today?</Text>
        </ImageBackground>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Image source={IMG.search} style={s.icon20} />
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submitSearch}
          placeholder="Search places, restaurants, shops"
          placeholderTextColor={C.muted}
          returnKeyType="search"
        />
        <Pressable style={s.filterBtn} onPress={submitSearch}>
          <Image source={IMG.filter} style={s.icon20} />
        </Pressable>
      </View>

      {!!error && (
        <View style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <Pressable onPress={() => load()}><Text style={s.retry}>Try again</Text></Pressable>
        </View>
      )}

      {/* Recommended */}
      <Text style={s.sectionTitle}>Recommended place</Text>
      <View style={s.sectionBody}>
        {loading ? <PlaceSkeleton />
          : data?.recommended ? (
            <PlaceCard
              place={data.recommended}
              saved={saved}
              onToggleSave={toggleSave}
              onPress={() => router.push({ pathname: '/explore', params: { id: data.recommended.id } })}
            />
          ) : <EmptyCard title="No recommendations yet" text="Tell us your travel style and we will suggest places." />}
      </View>

      {/* Current trip */}
      <Text style={s.sectionTitle}>Current trip</Text>
      <View style={s.sectionBody}>
        {loading ? <TripSkeleton />
          : data?.currentTrip ? (
            <TripCard trip={data.currentTrip} onPress={() => {}} />
          ) : <EmptyCard title="No trip planned" text="Your upcoming trip will show up here." />}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  logo: { width: 40, height: 29, marginRight: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon16: { width: 16, height: 16 },
  icon20: { width: 20, height: 20 },
  brand: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  hero: { height: 184, borderRadius: 28, padding: 22, justifyContent: 'flex-start' },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: 6, maxWidth: '75%' },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 6, maxWidth: '65%' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', height: 56, marginHorizontal: 40, marginTop: -28,
    backgroundColor: '#FFF', borderRadius: 28, paddingLeft: 18, paddingRight: 6,
    borderWidth: 1, borderColor: C.border, elevation: 4,
    shadowColor: C.primary, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: C.ink },
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.ink, marginTop: 28, marginHorizontal: 24 },
  sectionBody: { marginTop: 12, paddingHorizontal: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  placeImg: { width: '100%', height: 104 },
  heartBtn: {
    position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: 16 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: C.ink },
  rating: { marginLeft: 4, fontSize: 14, fontWeight: '700', color: C.ink },
  cost: { marginTop: 4, fontSize: 13, fontWeight: '700', color: C.primary },
  desc: { marginTop: 6, fontSize: 13, color: C.muted },
  tripCard: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  tripImg: { width: 88, height: 88, borderRadius: 18, overflow: 'hidden' },
  tripDates: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: C.primary },
  emptyCard: { padding: 20 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  errorBox: { marginHorizontal: 24, marginTop: 16, padding: 14, borderRadius: 16, backgroundColor: '#FDECEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { flex: 1, color: C.error, fontSize: 13, marginRight: 10 },
  retry: { color: C.primary, fontWeight: '800', fontSize: 13 },
});
