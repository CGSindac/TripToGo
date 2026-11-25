import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ReviewDialog, { ReviewButton, ReviewCard } from '../../components/ReviewDialog';
import type { ReviewDialogState } from '../../components/ReviewDialog';
import { loadLocalReviews, saveLocalReviews, searchReviewPlaces } from '../../data/reviews';
import type { LocalReview, ReviewFields, ReviewPlace } from '../../data/reviews';

const logo = require('../../../assets/images/logo-mark.png');
const avatar = require('../../../assets/images/avatar-default.png');

export default function Reviews() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { placeName, placeAddress, reviewRequest } = useLocalSearchParams<{
    placeName?: string;
    placeAddress?: string;
    reviewRequest?: string;
  }>();
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
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

  const results = selectedPlace ? [] : searchReviewPlaces(query);

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

  return (
    <View style={styles.screen}>
      <ScrollView keyboardShouldPersistTaps="handled" style={{ marginBottom: 84 + insets.bottom * 0.5 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 16 }}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.brand}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brandName}>Trip<Text style={styles.accent}>To</Text>Go</Text>
            </View>
            <Image source={avatar} style={styles.avatar} />
          </View>
          <Pressable accessibilityRole="button" style={styles.back} onPress={() => {
            if (router.canGoBack()) router.back();
            else router.navigate('/(tabs)/home');
          }}>
            <Text style={styles.backText}>‹  Back</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>My Reviews</Text>
          <View style={styles.search}>
            <Text style={styles.searchLabel}>Find a place to review</Text>
            <TextInput accessibilityLabel="Search place name or address" autoCorrect={false} returnKeyType="search"
              placeholder="Search place name or address" placeholderTextColor="#6B6788"
              style={styles.searchInput} value={query}
              onChangeText={(value) => { setQuery(value); setSelectedPlace(undefined); }} />
            {results.length > 0 && (
              <View style={styles.results}>
                {results.map((result) => (
                  <Pressable accessibilityRole="button" key={result.id}
                    style={({ pressed }) => [styles.result, pressed && styles.pressed]}
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

          {loadStatus === 'loading' && <ActivityIndicator color="#593BFA" accessibilityLabel="Loading reviews" />}
          {loadStatus === 'error' && (
            <View style={styles.search}>
              <Text accessibilityRole="alert" style={styles.muted}>Could not load your reviews.</Text>
              <Pressable accessibilityRole="button" style={styles.back} onPress={() => {
                setLoadStatus('loading');
                setAttempt((value) => value + 1);
              }}><Text style={styles.backText}>Try again</Text></Pressable>
            </View>
          )}
          {loadStatus === 'ready' && (
            <>
              <Text style={styles.muted}>{reviews.length} submitted · Only approved reviews are public</Text>
              {!!notice && <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>}
              {reviews.length === 0 && <Text style={styles.muted}>You haven’t submitted a review yet.</Text>}
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
  brandName: { color: '#17133D', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  accent: { color: '#A83DEB' },
  title: { color: '#17133D', fontSize: 32, fontWeight: '900' },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginVertical: -8 },
  backText: { color: '#593BFA', fontSize: 14, fontWeight: '700' },
  search: { gap: 8 },
  searchLabel: { color: '#17133D', fontSize: 17, fontWeight: '700' },
  searchInput: { minHeight: 52, paddingHorizontal: 14, paddingVertical: 10, borderColor: '#DDD5F5', borderWidth: 1, borderRadius: 14, backgroundColor: '#F8F6FF', color: '#17133D', fontSize: 16 },
  results: { borderColor: '#DDD5F5', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  result: { paddingVertical: 10, gap: 2 },
  resultName: { color: '#17133D', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.65 },
  muted: { color: '#6B6788', fontSize: 14, lineHeight: 20 },
  notice: { color: '#176748', fontSize: 14, fontWeight: '700' },
  cards: { gap: 12 },
});
