// src/app/(tabs)/explore.js  — Trip Preferences + generated recommendations
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---------- CONFIG ----------
const API_URL = 'http://10.0.2.2:8080'; // Android emulator
const USE_SAMPLE_DATA = true; // set to false once backend has POST /api/recommendations

const IMG = {
  logo: require('../../../assets/images/logo-mark.png'),
  avatar: require('../../../assets/images/avatar-default.png'),
  pin: require('../../../assets/images/icon-pin.png'),
  locate: require('../../../assets/images/icon-locate.png'),
  edit: require('../../../assets/images/icon-edit.png'),
  close: require('../../../assets/images/icon-close.png'),
  sparkle: require('../../../assets/images/icon-sparkle.png'),
  star: require('../../../assets/images/icon-star.png'),
};
const FALLBACK = {
  attractions: require('../../../assets/images/fallback-attractions.png'),
  restaurants: require('../../../assets/images/fallback-restaurants.png'),
  shops: require('../../../assets/images/fallback-shops.png'),
};

const C = {
  primary: '#593BFA', ink: '#17133D', muted: '#6B6788', border: '#DDD5F5',
  field: '#F8F6FF', soft: '#F1EDFF', error: '#D93B4A',
};
const TYPE_STYLE = {
  Destination: { bg: '#F1EDFF', fg: '#4B2FD0', img: 'attractions' },
  Attraction: { bg: '#F1EDFF', fg: '#4B2FD0', img: 'attractions' },
  Experience: { bg: '#E3F6F4', fg: '#0B6B66', img: 'attractions' },
  Restaurant: { bg: '#FFF0E6', fg: '#A8390A', img: 'restaurants' },
  Shop: { bg: '#FDE9F8', fg: '#A3208F', img: 'shops' },
};

const MAX_TAGS = 10;
const SUGGESTIONS = ['Nature', 'Local food', 'Family-friendly', 'Beach', 'Historic', 'Nightlife', 'Budget-friendly', 'Relaxing'];

// ---------- DATA ----------
// Request  (POST /api/recommendations):
//   { location: "Lipa City, Batangas", budget: { min: 200, max: 800, currency: "PHP" }, tags: ["nature", "local food"] }
// Response:
//   { results: [{ id, name, type: "Destination"|"Attraction"|"Restaurant"|"Shop"|"Experience",
//                 imageUrl, rating, estimatedCost, currency, matchReason }] }
const SAMPLE_RESULTS = [
  { id: 'r1', name: 'Sampaguita Garden Park', type: 'Destination', imageUrl: null, rating: 4.5, estimatedCost: 100, currency: 'PHP' },
  { id: 'r2', name: 'Barako Coffee House', type: 'Restaurant', imageUrl: null, rating: 4.6, estimatedCost: 250, currency: 'PHP' },
  { id: 'r3', name: 'Lipa Heritage Walk', type: 'Experience', imageUrl: null, rating: 4.7, estimatedCost: 300, currency: 'PHP' },
  { id: 'r4', name: 'Lipa Cathedral Plaza', type: 'Attraction', imageUrl: null, rating: 4.7, estimatedCost: 0, currency: 'PHP' },
];

async function fetchRecommendations(prefs) {
  if (USE_SAMPLE_DATA) {
    await new Promise((r) => setTimeout(r, 1500));
    const reason = prefs.tags.length
      ? `Matches ${prefs.tags.slice(0, 2).join(' and ').toLowerCase()}`
      : 'Popular near you';
    return {
      results: SAMPLE_RESULTS
        .filter((p) => p.estimatedCost <= prefs.budget.max)
        .map((p) => ({ ...p, matchReason: reason })),
    };
  }
  // TODO: add the auth token: headers: { Authorization: `Bearer ${token}` }
  const res = await fetch(`${API_URL}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
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

function ResultCard({ place, onPress }) {
  const t = TYPE_STYLE[place.type] || TYPE_STYLE.Attraction;
  return (
    <Pressable style={s.card} onPress={onPress}>
      <RemoteImage uri={place.imageUrl} fallback={FALLBACK[t.img]} style={s.thumb} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.name} numberOfLines={1}>{place.name}</Text>
        <View style={[s.tag, { backgroundColor: t.bg }]}>
          <Text style={[s.tagText, { color: t.fg }]}>{place.type}</Text>
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
        {!!place.matchReason && <Text style={s.reason} numberOfLines={1}>{place.matchReason}</Text>}
      </View>
    </Pressable>
  );
}

function ResultSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton style={[s.thumb, { borderRadius: 16 }]} />
      <View style={{ flex: 1 }}>
        <Skeleton style={{ height: 18, width: '65%' }} />
        <Skeleton style={{ height: 14, width: '35%', marginTop: 8 }} />
        <Skeleton style={{ height: 14, width: '55%', marginTop: 8 }} />
      </View>
    </View>
  );
}

// ---------- SCREEN ----------
export default function Explore() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const locationRef = useRef(null);
  const tagInputRef = useRef(null);
  const resultsY = useRef(0);

  const [location, setLocation] = useState('Lipa City, Batangas');
  const [minBudget, setMinBudget] = useState('200');
  const [maxBudget, setMaxBudget] = useState('800');
  const [tags, setTags] = useState(['Nature', 'Local food', 'Family-friendly']);
  const [addingTag, setAddingTag] = useState(false);
  const [tagText, setTagText] = useState('');
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [results, setResults] = useState([]);

  const min = Number(minBudget || 0);
  const max = Number(maxBudget || 0);

  // ----- tags -----
  const addTag = (raw) => {
    const t = (raw ?? tagText).trim().slice(0, 24);
    if (!t) { setAddingTag(false); setTagText(''); return; }
    const exists = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    if (!exists && tags.length < MAX_TAGS) setTags([...tags, t]);
    setTagText('');
    setAddingTag(false);
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));
  const startAddTag = () => {
    setAddingTag(true);
    setTimeout(() => tagInputRef.current?.focus(), 50);
  };

  // ----- location -----
  const useCurrentLocation = () => {
    // TODO: install expo-location (`npx expo install expo-location`), ask permission with
    // Location.requestForegroundPermissionsAsync(), then read the position and turn it into
    // a city name with Location.reverseGeocodeAsync(), and call setLocation(cityName).
    Alert.alert('Use current location', 'This will be connected soon.');
  };
  const changeDestination = () => {
    setLocation('');
    setErrors((e) => ({ ...e, location: undefined }));
    setTimeout(() => locationRef.current?.focus(), 50);
  };

  // ----- generate -----
  const validate = () => {
    const next = {};
    if (!location.trim()) next.location = 'Enter where you are or where you want to go.';
    if (!maxBudget || max <= 0) next.budget = 'Enter a maximum budget.';
    else if (min > max) next.budget = 'The minimum cannot be more than the maximum.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generate = async () => {
    if (status === 'loading' || !validate()) return;
    setStatus('loading');
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, resultsY.current - 12), animated: true }), 100);
    try {
      const data = await fetchRecommendations({
        location: location.trim(),
        budget: { min, max, currency: 'PHP' },
        tags: tags.map((t) => t.toLowerCase()),
      });
      setResults(data.results || []);
      setStatus('ready');
    } catch (e) {
      setStatus('error');
    }
  };

  const fieldStyle = (name, hasError) => [s.input, focused === name && s.inputFocused, hasError && s.inputError];

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: '#FFF' }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={s.content}>
        {/* Header */}
        <View style={s.rowBetween}>
          <View style={s.row}>
            <Image source={IMG.logo} style={s.logo} resizeMode="contain" />
            <Text style={s.brand}>Trip<Text style={{ color: '#A83DEB' }}>To</Text>Go</Text>
          </View>
          <Image source={IMG.avatar} style={s.avatar} />
        </View>

        <Text style={s.title} accessibilityRole="header">Trip Preferences</Text>
        <Text style={s.subtitle}>Tell us what you like and we will suggest places and experiences for your trip.</Text>

        {/* Location */}
        <Text style={s.label}>Current location or destination</Text>
        <View style={fieldStyle('location', !!errors.location)}>
          <Image source={IMG.pin} style={s.icon20} />
          <TextInput
            ref={locationRef}
            style={s.inputText}
            value={location}
            onChangeText={(t) => { setLocation(t); if (errors.location) setErrors((e) => ({ ...e, location: undefined })); }}
            placeholder="City or place"
            placeholderTextColor={C.muted}
            returnKeyType="done"
            onFocus={() => setFocused('location')}
            onBlur={() => setFocused(null)}
            accessibilityLabel="Current location or destination"
          />
        </View>
        {!!errors.location && <Text style={s.errorText}>{errors.location}</Text>}
        <View style={s.linkRow}>
          <Pressable style={s.link} onPress={useCurrentLocation} hitSlop={6}>
            <Image source={IMG.locate} style={s.icon18} />
            <Text style={s.linkText}>Use current location</Text>
          </Pressable>
          <Pressable style={s.link} onPress={changeDestination} hitSlop={6}>
            <Image source={IMG.edit} style={s.icon18} />
            <Text style={s.linkText}>Change destination</Text>
          </Pressable>
        </View>

        {/* Budget */}
        <Text style={s.label}>Budget range • PHP per person</Text>
        <View style={s.budgetRow}>
          {[['Minimum', minBudget, setMinBudget, 'min'], ['Maximum', maxBudget, setMaxBudget, 'max']].map(([name, value, set, key], i) => (
            <View key={key} style={{ flex: 1 }}>
              <Text style={s.smallLabel}>{name}</Text>
              <View style={fieldStyle(key, !!errors.budget)}>
                <Text style={s.peso}>₱</Text>
                <TextInput
                  style={s.inputText}
                  value={value}
                  onChangeText={(t) => { set(t.replace(/\D/g, '').slice(0, 6)); if (errors.budget) setErrors((e) => ({ ...e, budget: undefined })); }}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  accessibilityLabel={`${name} budget in pesos`}
                />
              </View>
            </View>
          ))}
        </View>
        {!!errors.budget && <Text style={s.errorText}>{errors.budget}</Text>}

        {/* Tags */}
        <Text style={s.label}>Tags</Text>
        <View style={s.tagsBox}>
          {tags.map((t) => (
            <View key={t} style={s.chip}>
              <Text style={s.chipText}>{t}</Text>
              <Pressable onPress={() => removeTag(t)} hitSlop={8} accessibilityLabel={`Remove ${t}`} style={s.chipX}>
                <Image source={IMG.close} style={{ width: 14, height: 14 }} />
              </Pressable>
            </View>
          ))}
          {addingTag ? (
            <TextInput
              ref={tagInputRef}
              style={s.tagInput}
              value={tagText}
              onChangeText={setTagText}
              onSubmitEditing={() => addTag()}
              onBlur={() => addTag()}
              placeholder="New tag"
              placeholderTextColor={C.muted}
              maxLength={24}
              returnKeyType="done"
              autoCapitalize="sentences"
            />
          ) : tags.length < MAX_TAGS ? (
            <Pressable style={s.addChip} onPress={startAddTag}>
              <Text style={s.addChipText}>+ Add tag</Text>
            </Pressable>
          ) : null}
        </View>
        {tags.length < MAX_TAGS && (
          <View style={s.suggestRow}>
            {SUGGESTIONS.filter((x) => !tags.some((t) => t.toLowerCase() === x.toLowerCase())).slice(0, 5).map((x) => (
              <Pressable key={x} style={s.suggest} onPress={() => addTag(x)}>
                <Text style={s.suggestText}>+ {x}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={s.note}>We rank places by relevance, community reviews, enjoyment and budget ratings.</Text>

        {/* Generate */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: status === 'loading', busy: status === 'loading' }}
          android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
          disabled={status === 'loading'}
          onPress={generate}
          style={({ pressed }) => [s.primary, (pressed || status === 'loading') && s.pressed]}
        >
          <Image source={IMG.sparkle} style={s.icon22} />
          <Text style={s.primaryText}>{status === 'loading' ? 'Finding places...' : 'Generate Recommendations'}</Text>
        </Pressable>

        {/* Results */}
        <View onLayout={(e) => { resultsY.current = e.nativeEvent.layout.y; }}>
          {status !== 'idle' && <Text style={s.resultsTitle}>Recommended for you</Text>}
          {status === 'loading' && [0, 1, 2].map((i) => <ResultSkeleton key={i} />)}
          {status === 'error' && (
            <View style={s.errorBox}>
              <Text style={s.errorBoxText}>We could not generate recommendations. Please try again.</Text>
              <Pressable onPress={generate}><Text style={s.retry}>Try again</Text></Pressable>
            </View>
          )}
          {status === 'ready' && (results.length ? (
            results.map((p) => (
              <ResultCard
                key={p.id}
                place={p}
                onPress={() => {
                  // TODO: open the place details screen, e.g. router.push(`/places/${p.id}`)
                }}
              />
            ))
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No matches yet</Text>
              <Text style={s.emptyText}>Try a higher budget or fewer tags.</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon16: { width: 16, height: 16 },
  icon18: { width: 18, height: 18 },
  icon20: { width: 20, height: 20 },
  icon22: { width: 22, height: 22 },
  logo: { width: 40, height: 29, marginRight: 8 },
  brand: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  title: { marginTop: 18, fontSize: 32, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22, color: C.muted },
  label: { marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: '800', color: C.ink },
  smallLabel: { marginBottom: 6, fontSize: 13, fontWeight: '600', color: C.muted },
  input: {
    flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 18, paddingHorizontal: 16, gap: 10,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.field,
  },
  inputFocused: { borderColor: C.primary, backgroundColor: '#FFF' },
  inputError: { borderColor: C.error },
  inputText: { flex: 1, minWidth: 0, height: 48, padding: 0, fontSize: 16, fontWeight: '600', color: C.ink },
  peso: { fontSize: 16, fontWeight: '800', color: C.primary },
  errorText: { marginTop: 6, fontSize: 13, fontWeight: '600', color: C.error },
  linkRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 },
  linkText: { fontSize: 14, fontWeight: '800', color: C.primary },
  budgetRow: { flexDirection: 'row', gap: 12 },
  tagsBox: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderRadius: 18,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.field,
  },
  chip: { height: 34, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 8, borderRadius: 17, backgroundColor: C.soft },
  chipText: { fontSize: 14, fontWeight: '600', color: '#4B2FD0', marginRight: 6 },
  chipX: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  addChip: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B9B3D1', justifyContent: 'center' },
  addChipText: { fontSize: 14, fontWeight: '600', color: C.primary },
  tagInput: { height: 34, minWidth: 110, paddingHorizontal: 14, paddingVertical: 0, borderRadius: 17, borderWidth: 1.5, borderColor: C.primary, backgroundColor: '#FFF', fontSize: 14, color: C.ink },
  suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  suggest: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center' },
  suggestText: { fontSize: 13, fontWeight: '600', color: C.muted },
  note: { marginTop: 14, fontSize: 13, lineHeight: 19, color: C.muted },
  primary: {
    marginTop: 20, height: 56, borderRadius: 28, backgroundColor: C.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden',
    elevation: 4, shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  primaryText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  resultsTitle: { marginTop: 28, marginBottom: 12, fontSize: 20, fontWeight: '800', color: C.ink },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 10, paddingRight: 14, marginBottom: 12,
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
  reason: { marginTop: 3, fontSize: 12, fontWeight: '600', color: C.primary },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: C.ink },
  emptyText: { marginTop: 6, fontSize: 13, color: C.muted },
  errorBox: { padding: 14, borderRadius: 16, backgroundColor: '#FDECEE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorBoxText: { flex: 1, color: C.error, fontSize: 13, marginRight: 10 },
  retry: { color: C.primary, fontWeight: '800', fontSize: 13 },
});
