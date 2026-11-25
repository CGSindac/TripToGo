// src/app/(tabs)/browse.js  — Browse
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Image, Modal, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { placeDetailsHref, sampleBrowsePlaces } from '../../data/places';

// ---------- CONFIG ----------
const API_URL = 'http://10.0.2.2:8080'; // Android emulator 
const USE_SAMPLE_DATA = true; // set to false once backend has GET /api/places

const IMG = {
  logo: require('../../../assets/images/logo-mark.png'),
  avatar: require('../../../assets/images/avatar-default.png'),
  search: require('../../../assets/images/icon-search.png'),
  pin: require('../../../assets/images/icon-pin.png'),
  filter: require('../../../assets/images/icon-filter-purple.png'),
  sort: require('../../../assets/images/icon-sort.png'),
  heart: require('../../../assets/images/icon-heart.png'),
  heartFilled: require('../../../assets/images/icon-heart-filled.png'),
  star: require('../../../assets/images/icon-star.png'),
};
const FALLBACK = {
  Attractions: require('../../../assets/images/fallback-attractions.png'),
  Restaurants: require('../../../assets/images/fallback-restaurants.png'),
  Shops: require('../../../assets/images/fallback-shops.png'),
};

const C = {
  primary: '#593BFA', ink: '#17133D', muted: '#6B6788', border: '#DDD5F5',
  field: '#F8F6FF', soft: '#F1EDFF', error: '#D93B4A',
};
const TAG = {
  Attractions: { bg: '#F1EDFF', fg: '#4B2FD0' },
  Restaurants: { bg: '#FFF0E6', fg: '#A8390A' },
  Shops: { bg: '#FDE9F8', fg: '#A3208F' },
};
const CATEGORIES = ['All', 'Attractions', 'Restaurants', 'Shops'];
const SORTS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'cost', label: 'Lowest cost' },
  { key: 'name', label: 'A to Z' },
];
const RATINGS = [{ v: 0, label: 'Any rating' }, { v: 4, label: '4.0 and up' }, { v: 4.5, label: '4.5 and up' }];

// ---------- DATA ----------
// Expected API response (GET /api/places?city=&category=&q=&sort=):
// {
//   location: { city: "Lipa City, Batangas" },
//   places: [{ id, name, category: "Attractions"|"Restaurants"|"Shops",
//              imageUrl, rating, estimatedCost, currency, saved }]
// }
const SAMPLE = {
  location: { city: 'Lipa City, Batangas' },
  places: sampleBrowsePlaces,
};

async function fetchPlaces({ category, q }) {
  if (USE_SAMPLE_DATA) {
    await new Promise((r) => setTimeout(r, 700));
    const places = SAMPLE.places.filter(
      (p) => (category === 'All' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q.toLowerCase()))
    );
    return { ...SAMPLE, places };
  }
  const params = new URLSearchParams();
  if (category !== 'All') params.append('category', category);
  if (q) params.append('q', q);
  // TODO: add the auth token: headers: { Authorization: `Bearer ${token}` }
  const res = await fetch(`${API_URL}/api/places?${params.toString()}`);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

// ---------- HELPERS ----------
const formatCost = (amount, currency = 'PHP') => {
  if (amount == null) return '';
  if (amount === 0) return 'Free entrance';
  const symbol = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString('en-US')}`;
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

function RemoteImage({ uri, fallback, style }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const source = uri && !failed ? { uri } : fallback;
  return <Image source={source} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
}

function PlaceRow({ place, saved, onToggleSave, onPress }) {
  const tag = TAG[place.category] || TAG.Attractions;
  return (
    <Pressable style={s.card} onPress={onPress}>
      <RemoteImage uri={place.imageUrl} fallback={FALLBACK[place.category] || FALLBACK.Attractions} style={s.thumb} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.name} numberOfLines={1}>{place.name}</Text>
        <View style={[s.tag, { backgroundColor: tag.bg }]}>
          <Text style={[s.tagText, { color: tag.fg }]}>{place.category}</Text>
        </View>
        <View style={[s.row, { marginTop: 4 }]}>
          {place.rating != null && (
            <>
              <Image source={IMG.star} style={s.icon16} />
              <Text style={s.rating}>{Number(place.rating).toFixed(1)}</Text>
              <Text style={s.dot}>•</Text>
            </>
          )}
          <Text style={s.cost} numberOfLines={1}>{formatCost(place.estimatedCost, place.currency)}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <Pressable style={s.heartBtn} onPress={onToggleSave} hitSlop={6} accessibilityLabel={`Save ${place.name}`}>
          <Image source={saved ? IMG.heartFilled : IMG.heart} style={s.icon20} />
        </Pressable>
        <Pressable onPress={onPress} hitSlop={8}><Text style={s.view}>View</Text></Pressable>
      </View>
    </Pressable>
  );
}

function RowSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton style={[s.thumb, { borderRadius: 16 }]} />
      <View style={{ flex: 1 }}>
        <Skeleton style={{ height: 18, width: '65%' }} />
        <Skeleton style={{ height: 14, width: '35%', marginTop: 8 }} />
        <Skeleton style={{ height: 14, width: '50%', marginTop: 8 }} />
      </View>
      <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
    </View>
  );
}

function ToolButton({ icon, label, onPress }) {
  return (
    <Pressable style={s.toolBtn} onPress={onPress}>
      <Image source={icon} style={s.icon16} />
      <Text style={s.toolText}>{label}</Text>
    </Pressable>
  );
}

// ---------- SCREEN ----------
export default function Browse() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortIdx, setSortIdx] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(null); // null until data arrives

  // wait 400 ms after typing before searching
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await fetchPlaces({ category, q: debouncedQuery });
      setData(res);
      setSavedIds((prev) => {
        const fromApi = res.places.filter((p) => p.saved).map((p) => p.id);
        return prev ? Array.from(new Set([...prev, ...fromApi])) : fromApi;
      });
    } catch (e) {
      setError('We could not load places. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, debouncedQuery]);

  useEffect(() => { load(); }, [load]);

  const toggleSave = (id) => {
    setSavedIds((prev) => (prev || []).includes(id) ? prev.filter((x) => x !== id) : [...(prev || []), id]);
    // TODO: POST/DELETE `${API_URL}/api/places/${id}/save`
  };

  // sort + rating filter on the phone (move to the API later if the list gets long)
  const sortKey = SORTS[sortIdx].key;
  const places = (data?.places || [])
    .filter((p) => (p.rating ?? 0) >= minRating)
    .sort((a, b) =>
      sortKey === 'rating' ? (b.rating ?? 0) - (a.rating ?? 0)
        : sortKey === 'cost' ? (a.estimatedCost ?? 0) - (b.estimatedCost ?? 0)
        : a.name.localeCompare(b.name)
    );

  const changeLocation = () => {
    // TODO: open a location picker and save the chosen city
    Alert.alert('Change location', 'Location picker coming soon.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView
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
            <Image source={IMG.avatar} style={s.avatar} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Image source={IMG.search} style={s.icon20} />
          <TextInput
            style={s.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search places, restaurants, shops"
            placeholderTextColor={C.muted}
            returnKeyType="search"
          />
        </View>

        {/* Location */}
        <View style={[s.rowBetween, s.locRow]}>
          <View style={s.row}>
            <Image source={IMG.pin} style={s.icon20} />
            <Text style={s.city}>{data?.location?.city || 'Your location'}</Text>
          </View>
          <Pressable onPress={changeLocation} hitSlop={8}><Text style={s.link}>Change</Text></Pressable>
        </View>

        {/* Categories */}
        <View style={s.chips}>
          {CATEGORIES.map((c) => {
            const on = c === category;
            return (
              <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, on && s.chipOn]}>
                <Text style={[s.chipText, on && { color: '#FFF' }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Title + tools */}
        <View style={[s.rowBetween, s.titleRow]}>
          <Text style={s.sectionTitle}>Browse Places</Text>
          <View style={s.row}>
            <ToolButton icon={IMG.filter} label="Filter" onPress={() => setFilterOpen(true)} />
            <View style={{ width: 8 }} />
            <ToolButton icon={IMG.sort} label="Sort" onPress={() => setSortIdx((i) => (i + 1) % SORTS.length)} />
          </View>
        </View>
        <Text style={s.hint}>Sorted by {SORTS[sortIdx].label.toLowerCase()}{minRating ? ` • ${minRating.toFixed(1)}+ stars` : ''}</Text>

        {!!error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <Pressable onPress={() => load()}><Text style={s.retry}>Try again</Text></Pressable>
          </View>
        )}

        {/* List */}
        <View style={s.list}>
          {loading ? (
            [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : places.length ? (
            places.map((p) => (
              <PlaceRow
                key={p.id}
                place={p}
                saved={(savedIds || []).includes(p.id)}
                onToggleSave={() => toggleSave(p.id)}
                onPress={() => router.navigate(placeDetailsHref(p.locationId ?? p.id, 'browse'))}
              />
            ))
          ) : !error ? (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No places found</Text>
              <Text style={s.emptyText}>Try another category or search.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Filter sheet */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setFilterOpen(false)} />
        <View style={[s.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <Text style={s.sheetTitle}>Filter</Text>
          <Text style={s.sheetLabel}>Minimum rating</Text>
          {RATINGS.map((r) => {
            const on = r.v === minRating;
            return (
              <Pressable key={r.v} style={[s.option, on && s.optionOn]} onPress={() => setMinRating(r.v)}>
                <Text style={[s.optionText, on && { color: C.primary }]}>{r.label}</Text>
              </Pressable>
            );
          })}
          <Pressable style={s.done} onPress={() => setFilterOpen(false)}>
            <Text style={s.doneText}>Show results</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon16: { width: 16, height: 16 },
  icon20: { width: 20, height: 20 },
  logo: { width: 40, height: 29, marginRight: 8 },
  brand: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', height: 52, marginHorizontal: 24, marginTop: 16,
    backgroundColor: C.field, borderRadius: 26, paddingHorizontal: 18, borderWidth: 1.5, borderColor: C.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: C.ink },
  locRow: { marginHorizontal: 24, marginTop: 14, height: 32 },
  city: { marginLeft: 6, fontSize: 18, fontWeight: '800', color: C.ink },
  link: { fontSize: 14, fontWeight: '800', color: C.primary },
  chips: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginTop: 8 },
  chip: { height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: C.ink },
  titleRow: { marginHorizontal: 24, marginTop: 18, height: 36 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  toolBtn: { height: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  toolText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: C.ink },
  hint: { marginHorizontal: 24, marginTop: 6, fontSize: 12, color: C.muted },
  list: { marginTop: 12, paddingHorizontal: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 12, marginBottom: 12,
    backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#EEE9FB',
    elevation: 2, shadowColor: C.ink, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  thumb: { width: 80, height: 80, borderRadius: 16, marginRight: 12, overflow: 'hidden' },
  name: { fontSize: 17, fontWeight: '800', color: C.ink },
  tag: { alignSelf: 'flex-start', marginTop: 3, paddingHorizontal: 10, borderRadius: 10 },
  tagText: { fontSize: 12, lineHeight: 18, fontWeight: '700' },
  rating: { marginLeft: 4, fontSize: 13, fontWeight: '700', color: C.ink },
  dot: { marginHorizontal: 5, color: '#B9B3D1' },
  cost: { flexShrink: 1, fontSize: 13, color: C.muted },
  actions: { width: 48, alignItems: 'center' },
  heartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF1FB', alignItems: 'center', justifyContent: 'center' },
  view: { marginTop: 4, fontSize: 13, fontWeight: '800', color: C.primary },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  emptyText: { marginTop: 6, fontSize: 13, color: C.muted },
  errorBox: { marginHorizontal: 24, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: '#FDECEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { flex: 1, color: C.error, fontSize: 13, marginRight: 10 },
  retry: { color: C.primary, fontWeight: '800', fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,19,61,0.45)' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  sheetLabel: { marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: '700', color: C.muted },
  option: { height: 48, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1.5, borderColor: C.border, marginBottom: 8 },
  optionOn: { backgroundColor: C.soft, borderColor: C.primary },
  optionText: { fontSize: 15, fontWeight: '600', color: C.ink },
  done: { height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  doneText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
