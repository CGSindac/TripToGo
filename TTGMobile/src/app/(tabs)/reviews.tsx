import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ReviewDialog, { ReviewButton, ReviewCard } from '../../components/ReviewDialog';
import type { ReviewDialogState } from '../../components/ReviewDialog';
import { ApiError } from '../../data/api';
import { isSignedIn } from '../../data/auth';
import { placeDetailsHref } from '../../data/places';
import { getMyReviews, searchReviewPlaces } from '../../data/reviews';
import type { Review, ReviewPlace } from '../../data/reviews';

const logo = require('../../../assets/images/logo-mark.png');
const avatar = require('../../../assets/images/avatar-default.png');
const searchIcon = require('../../../assets/images/icon-search.png');

const C = {
  primary: '#593BFA', ink: '#17133D', muted: '#6B6788', border: '#DDD5F5',
  field: '#F8F6FF', green: '#176748', greenBg: '#E7F7EF', error: '#D93B4A',
};

export default function Reviews() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error' | 'signedOut'>('loading');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReviewPlace[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<ReviewPlace>();
  const [dialog, setDialog] = useState<ReviewDialogState | null>(null);
  const [notice, setNotice] = useState('');

  const reloadReviews = useCallback(() => {
    setPage(0);
    setLoadStatus('loading');
    setAttempt((value) => value + 1);
  }, []);

  useFocusEffect(useCallback(() => {
    reloadReviews();
  }, [reloadReviews]));

  useEffect(() => {
    const controller = new AbortController();
    getMyReviews(page, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setReviews((current) => page === 0 ? result.content : [...current, ...result.content]);
      setTotalPages(result.page.totalPages);
      setTotal(result.page.totalElements);
      setLoadStatus('ready');
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setLoadStatus(error instanceof ApiError && error.status === 401 ? 'signedOut' : 'error');
    }).finally(() => {
      if (!controller.signal.aborted) setRefreshing(false);
    });
    return () => controller.abort();
  }, [page, attempt]);

  useEffect(() => {
    if (selectedPlace || !query.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchReviewPlaces(query.trim(), 0, controller.signal).then((matches) => {
        if (controller.signal.aborted) return;
        setResults(matches.content);
        setSearchStatus('ready');
      }).catch(() => {
        if (!controller.signal.aborted) setSearchStatus('error');
      });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, selectedPlace, searchAttempt]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const changeSearch = (value: string) => {
    setQuery(value);
    setSelectedPlace(undefined);
    setResults([]);
    setSearchStatus(value.trim() ? 'loading' : 'idle');
  };

  const signIn = () => {
    setDialog(null);
    router.push({ pathname: '/login', params: { returnTo: 'reviews' } });
  };

  const viewPlace = (id: number) => {
    setDialog(null);
    router.navigate(placeDetailsHref(id, 'reviews'));
  };

  const openForm = (newLocation = false) => {
    Keyboard.dismiss();
    if (!isSignedIn()) return signIn();
    setNotice('');
    setDialog(newLocation
      ? { mode: 'compose', query: query.trim() }
      : { mode: 'compose', place: selectedPlace });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={C.primary} colors={[C.primary]}
            onRefresh={() => { setRefreshing(true); reloadReviews(); }} />
        }
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
              <TextInput accessibilityLabel="Search place name" autoCorrect={false} returnKeyType="search"
                placeholder="Search place name" placeholderTextColor={C.muted}
                style={styles.searchInput} value={query} onChangeText={changeSearch} />
              {!!query && (
                <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10} onPress={() => changeSearch('')}>
                  <Text style={styles.clear}>✕</Text>
                </Pressable>
              )}
            </View>
            {!selectedPlace && searchStatus === 'loading' && <ActivityIndicator color={C.primary} accessibilityLabel="Searching places" />}
            {!selectedPlace && searchStatus === 'error' && (
              <Pressable accessibilityRole="button" onPress={() => {
                setSearchStatus('loading');
                setSearchAttempt((value) => value + 1);
              }}>
                <Text style={styles.retry}>Could not search places. Try again.</Text>
              </Pressable>
            )}
            {!selectedPlace && searchStatus === 'ready' && results.length > 0 && (
              <View style={styles.results}>
                {results.map((result, index) => (
                  <Pressable accessibilityRole="button" key={result.id}
                    style={({ pressed }) => [styles.result, index > 0 && styles.resultDivider, pressed && styles.pressed]}
                    onPress={() => { setSelectedPlace(result); setQuery(result.name); Keyboard.dismiss(); }}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.muted}>{result.address}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {!selectedPlace && searchStatus === 'ready' && results.length === 0 && (
              <Text style={styles.muted}>No matching places.</Text>
            )}
            {selectedPlace && (
              <View style={styles.results}>
                <Pressable accessibilityRole="button" style={styles.result} onPress={() => viewPlace(selectedPlace.id)}>
                  <Text style={styles.resultName}>View {selectedPlace.name}</Text>
                  <Text style={styles.muted}>{selectedPlace.address}</Text>
                </Pressable>
              </View>
            )}
          </View>

          <ReviewButton label="Write a Review" disabled={!selectedPlace} onPress={() => openForm()} />
          {!selectedPlace && (
            <Pressable accessibilityRole="button" style={styles.result} onPress={() => openForm(true)}>
              <Text style={styles.retry}>Review a new location</Text>
            </Pressable>
          )}

          {!!notice && (
            <View style={styles.noticeBox}>
              <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>
            </View>
          )}
          {loadStatus === 'loading' && <ActivityIndicator color={C.primary} accessibilityLabel="Loading my reviews" />}
          {loadStatus === 'signedOut' && <ReviewButton label="Log In to See My Reviews" onPress={signIn} />}
          {loadStatus === 'error' && (
            <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>Could not load your reviews.</Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={reloadReviews}>
                <Text style={styles.retry}>Try again</Text>
              </Pressable>
            </View>
          )}
          {(loadStatus === 'ready' || (loadStatus === 'loading' && page > 0)) && (
            <>
              <Text style={styles.muted}>{total} submitted</Text>
              {total === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No reviews yet</Text>
                  <Text style={styles.muted}>Search for a place above, then tap Write a Review.</Text>
                </View>
              )}
              <View style={styles.cards}>
                {reviews.map((review) => (
                  <ReviewCard key={review.reviewId} review={review} onPress={() => {
                    setNotice('');
                    setDialog(review.status === 'REJECTED' && review.locationId == null && review.proposedLocation
                      ? { mode: 'correct', review } : { mode: 'view', review });
                  }} />
                ))}
              </View>
              {loadStatus === 'ready' && page + 1 < totalPages && (
                <Pressable accessibilityRole="button" style={styles.result} onPress={() => {
                  setLoadStatus('loading');
                  setPage((value) => value + 1);
                }}>
                  <Text style={styles.retry}>Load more reviews</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {dialog && <ReviewDialog dialog={dialog} onSignIn={signIn} onViewPlace={viewPlace}
        onClose={() => setDialog(null)} onSubmitted={(saved) => {
          setDialog(null);
          changeSearch('');
          setNotice(saved.status === 'VERIFIED' ? 'Review published.' : 'Review submitted for approval.');
          reloadReviews();
        }} />}
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
