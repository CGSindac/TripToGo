import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ReviewDialog, { ReviewButton, ReviewCard } from '../../components/ReviewDialog';
import type { ReviewDialogState } from '../../components/ReviewDialog';
import { loadLocalReviews, saveLocalReviews, searchReviewPlaces } from '../../data/reviews';
import type { LocalReview, ReviewFields, ReviewPlace } from '../../data/reviews';

const logo = require('../../../assets/images/logo-mark.png');
const avatar = require('../../../assets/images/avatar-default.png');
const searchIcon = require('../../../assets/images/icon-search.png');

const C = {
  primary: '#593BFA', ink: '#17133D', muted: '#6B6788', border: '#DDD5F5',
  field: '#F8F6FF', soft: '#F1EDFF', green: '#176748', greenBg: '#E7F7EF',
  warn: '#A8390A', warnBg: '#FFF0E6', error: '#D93B4A',
};

export default function Reviews() {
  const insets = useSafeAreaInsets();
  const { placeName, placeAddress, reviewRequest } = useLocalSearchParams<{
    placeName?: string;
    placeAddress?: string;
    reviewRequest?: string;
  }>();
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<ReviewPlace>();
  const [dialog, setDialog] = useState<ReviewDialogState | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const handledRequest = useRef<string>(undefined);
  const savingReview = useRef(false);

  useEffect(() => {
    let active = true;
    loadLocalReviews().then((saved) => {
      if (active) {
        setReviews(saved);
        setLoadStatus('ready');
      }
    }).catch(() => {
      if (active) setLoadStatus('error');
    }).finally(() => {
      if (active) setRefreshing(false);
    });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (loadStatus !== 'ready' || typeof reviewRequest !== 'string' || typeof placeName !== 'string'
      || !placeName || handledRequest.current === reviewRequest) return;
    handledRequest.current = reviewRequest;
    setNotice('');
    setDialog({
      mode: 'compose',
      place: { name: placeName, address: typeof placeAddress === 'string' ? placeAddress : '' },
    });
  }, [loadStatus, placeName, placeAddress, reviewRequest]);

  // the success message hides itself after a few seconds
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const results = useMemo(() => (selectedPlace ? [] : searchReviewPlaces(query)), [selectedPlace, query]);
  const needsCorrection = reviews.filter((review) => review.status === 'correction').length;

  const saveReview = async (fields: ReviewFields, existingPlace: boolean, id?: string) => {
    if (savingReview.current) return;
    savingReview.current = true;
    setSaving(true);
    const submitted: LocalReview = {
      ...fields, id: id ?? `local-${Date.now()}`, status: 'pending', existingPlace,
    };
    const next = id ? reviews.map((review) => review.id === id ? submitted : review) : [submitted, ...reviews];
    try {
      await saveLocalReviews(next);
      setReviews(next);
      setDialog(null);
      setQuery('');
      setSelectedPlace(undefined);
      setNotice(id ? 'Correction saved on this device.' : 'Review saved on this device.');
    } finally {
      savingReview.current = false;
      setSaving(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedPlace(undefined);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.primary}
            colors={[C.primary]}
            onRefresh={() => { setRefreshing(true); setAttempt((value) => value + 1); }}
          />
        }
        // extra space at the bottom so the last card is not hidden by the floating tab bar
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 + insets.bottom }}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brand}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brandName}>Trip<Text style={styles.accent}>To</Text>Go</Text>
            </View>
            <Image source={avatar} style={styles.avatar} />
          </View>

          <Text accessibilityRole="header" style={styles.title}>My Reviews</Text>

          <View style={styles.search}>
            <Text style={styles.searchLabel}>Find a place to review</Text>
            <View style={styles.searchBox}>
              <Image source={searchIcon} style={styles.searchIcon} />
              <TextInput accessibilityLabel="Search place name or address" autoCorrect={false} returnKeyType="search"
                placeholder="Search place name or address" placeholderTextColor={C.muted}
                style={styles.searchInput} value={query}
                onChangeText={(value) => { setQuery(value); setSelectedPlace(undefined); }} />
              {!!query && (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={clearSearch}>
                  <Text style={styles.clear}>✕</Text>
                </Pressable>
              )}
            </View>
            {results.length > 0 && (
              <View style={styles.results}>
                {results.map((result, index) => (
                  <Pressable accessibilityRole="button" key={result.id}
                    style={({ pressed }) => [styles.result, index > 0 && styles.resultDivider, pressed && styles.pressed]}
                    onPress={() => {
                      setSelectedPlace(result);
                      setQuery(result.name);
                      Keyboard.dismiss();
                    }}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.muted}>{result.address}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {!!query.trim() && !selectedPlace && results.length === 0 && (
              <Text style={styles.muted}>No matching places. You can enter a new place in the review form.</Text>
            )}
          </View>

          <ReviewButton label="Write a Review" disabled={loadStatus !== 'ready'} onPress={() => {
            Keyboard.dismiss();
            setNotice('');
            setDialog({ mode: 'compose', place: selectedPlace, query: query.trim() });
          }} />

          {loadStatus === 'loading' && <ActivityIndicator color={C.primary} accessibilityLabel="Loading reviews" />}
          {loadStatus === 'error' && (
            <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>Could not load your reviews.</Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => {
                setLoadStatus('loading');
                setAttempt((value) => value + 1);
              }}><Text style={styles.retry}>Try again</Text></Pressable>
            </View>
          )}
          {loadStatus === 'ready' && (
            <>
              {!!notice && (
                <View style={styles.noticeBox}>
                  <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>
                </View>
              )}
              {needsCorrection > 0 && (
                <View style={styles.warnBox}>
                  <Text style={styles.warnText}>
                    {needsCorrection === 1
                      ? '1 review needs your correction.'
                      : `${needsCorrection} reviews need your correction.`}
                  </Text>
                </View>
              )}
              <Text style={styles.muted}>{reviews.length} submitted · Only approved reviews are public</Text>
              {reviews.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No reviews yet</Text>
                  <Text style={styles.muted}>Search for a place above, then tap Write a Review.</Text>
                </View>
              )}
              <View style={styles.cards}>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onPress={() => {
                    setNotice('');
                    setDialog(review.status === 'correction' ? { mode: 'correct', review } : { mode: 'view', review });
                  }} />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {dialog && <ReviewDialog dialog={dialog} saving={saving} onSubmit={saveReview}
        onClose={() => { if (!savingReview.current) setDialog(null); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24, gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 40, height: 29 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  brandName: { color: C.ink, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  accent: { color: '#A83DEB' },
  title: { color: C.ink, fontSize: 32, fontWeight: '900' },
  search: { gap: 8 },
  searchLabel: { color: C.ink, fontSize: 17, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 16, gap: 10,
    borderColor: C.border, borderWidth: 1.5, borderRadius: 26, backgroundColor: C.field,
  },
  searchIcon: { width: 20, height: 20 },
  searchInput: { flex: 1, minHeight: 48, paddingVertical: 10, color: C.ink, fontSize: 16 },
  clear: { color: C.muted, fontSize: 16, fontWeight: '700' },
  results: { borderColor: C.border, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, backgroundColor: '#FFF' },
  result: { paddingVertical: 12, gap: 2 },
  resultDivider: { borderTopWidth: 1, borderTopColor: '#EEE9FB' },
  resultName: { color: C.ink, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.65 },
  muted: { color: C.muted, fontSize: 14, lineHeight: 20 },
  noticeBox: { backgroundColor: C.greenBg, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  notice: { color: C.green, fontSize: 14, fontWeight: '700' },
  warnBox: { backgroundColor: C.warnBg, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  warnText: { color: C.warn, fontSize: 14, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FDECEE', borderRadius: 16, padding: 14,
  },
  errorText: { flex: 1, color: C.error, fontSize: 14, marginRight: 10 },
  retry: { color: C.primary, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', gap: 4, paddingVertical: 24, borderWidth: 1.5, borderColor: '#EEE9FB', borderRadius: 24 },
  emptyTitle: { color: C.ink, fontSize: 16, fontWeight: '800' },
  cards: { gap: 12 },
});
