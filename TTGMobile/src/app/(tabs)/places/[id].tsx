import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPlaceDetails, getPlaceReviews, isSamplePlace } from '../../../data/places';
import type { PlaceDetails, PlaceReview } from '../../../data/places';

const colors = { ink: '#17133D', muted: '#6B6788', primary: '#593BFA', border: '#DDD5F5', soft: '#F8F6FF' };
const images = {
  logo: require('../../../../assets/images/logo-mark.png'),
  avatar: require('../../../../assets/images/avatar-default.png'),
  placeholder: require('../../../../assets/images/place-fallback.png'),
  Attractions: require('../../../../assets/images/fallback-attractions.png'),
  Restaurants: require('../../../../assets/images/fallback-restaurants.png'),
  Shops: require('../../../../assets/images/fallback-shops.png'),
};

const explore = { tab: 'explore', label: 'Explore', path: '/(tabs)/explore' } as const;
const destinations = [
  { tab: 'home', label: 'Recommended places', path: '/(tabs)/home' },
  { tab: 'browse', label: 'Browse places', path: '/(tabs)/browse' },
  explore,
  { tab: 'reviews', label: 'Reviews', path: '/(tabs)/reviews' },
] as const;

function formatRating(rating: number | null) {
  return rating == null ? '—' : `${rating.toFixed(1)}/10`;
}

function formatExpense(amount?: number, currency = 'PHP') {
  if (amount == null) return 'Estimate unavailable';
  if (amount === 0) return 'Free entrance';
  const symbol = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-US')}`;
}

function PlaceReviews({ id }: { id: string }) {
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    getPlaceReviews(id, page, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setReviews((current) => page === 0 ? result.content : [...current, ...result.content]);
      setTotal(result.page.totalElements);
      setTotalPages(result.page.totalPages);
      setStatus('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setStatus('error');
    });
    return () => controller.abort();
  }, [id, page, attempt]);

  return (
    <View style={styles.reviews}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        Community reviews{total != null ? ` (${total})` : ''}
      </Text>
      {isSamplePlace(id) && reviews.length > 0 && <Text style={styles.caption}>Sample reviews</Text>}
      {reviews.map((review) => (
        <View key={review.reviewId} style={styles.review}>
          <Text style={styles.reviewAuthor}>{review.authorUsername || 'Community member'}</Text>
          <Text style={styles.caption}>Enjoyment {review.enjoymentRating}/10 · Budget {review.budgetRating}/10</Text>
          {!!review.writtenReview && <Text style={styles.body}>{review.writtenReview}</Text>}
        </View>
      ))}
      {status === 'loading' && <ActivityIndicator color={colors.primary} accessibilityLabel="Loading reviews" />}
      {status === 'error' && (
        <>
          <Text style={styles.body}>Could not load community reviews.</Text>
          <Pressable accessibilityRole="button" onPress={() => {
            setStatus('loading');
            setAttempt((value) => value + 1);
          }} style={styles.linkButton}>
            <Text style={styles.link}>Retry reviews</Text>
          </Pressable>
        </>
      )}
      {status === 'ready' && total === 0 && <Text style={styles.body}>No community reviews yet.</Text>}
      {status === 'ready' && page + 1 < totalPages && (
        <Pressable accessibilityRole="button" onPress={() => {
          setStatus('loading');
          setPage((value) => value + 1);
        }} style={styles.linkButton}>
          <Text style={styles.link}>Load more reviews</Text>
        </Pressable>
      )}
    </View>
  );
}

function PlaceContent({ place }: { place: PlaceDetails }) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const categoryImage = place.category === 'Attractions' || place.category === 'Restaurants' || place.category === 'Shops'
    ? images[place.category]
    : images.placeholder;

  return (
    <>
      <Image
        source={place.imageUrl && !imageFailed ? { uri: place.imageUrl } : categoryImage}
        onError={() => setImageFailed(true)}
        resizeMode="cover"
        style={styles.photo}
      />
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{place.name}</Text>
        {!!place.category && <Text style={styles.category}>{place.category}</Text>}
        {!!place.address && <Text style={styles.body}>{place.address}</Text>}
        {!!place.description && <Text style={styles.body}>{place.description}</Text>}
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Estimated expense</Text>
        <Text style={styles.expense}>{formatExpense(place.estimatedCost, place.currency)}</Text>
        <View style={styles.ratings}>
          <View style={styles.rating}>
            <Text style={styles.caption}>Enjoyment</Text>
            <Text style={styles.score}>{formatRating(place.enjoymentRating)}</Text>
          </View>
          <View style={styles.rating}>
            <Text style={styles.caption}>Budget</Text>
            <Text style={styles.score}>{formatRating(place.budgetRating)}</Text>
          </View>
        </View>
        <Text style={styles.caption}>10 is the most affordable budget rating.</Text>
        {place.tags.length > 0 && (
          <View style={styles.tags}>
            {place.tags.map((tag, index) => <Text key={`${tag}-${index}`} style={styles.tag}>{tag}</Text>)}
          </View>
        )}
      </View>
      <PlaceReviews id={place.id} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate({ pathname: '/(tabs)/reviews', params: { placeName: place.name } })}
        style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
      >
        <Text style={styles.reviewButtonText}>Write a Review</Text>
      </Pressable>
    </>
  );
}

function PlaceDetailsScreen({ id, from }: { id: string; from?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = destinations.find((item) => item.tab === from) ?? explore;
  const [place, setPlace] = useState<PlaceDetails | null>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPlaceDetails(id, controller.signal).then((result) => {
      if (!controller.signal.aborted) setPlace(result);
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [id, attempt]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 112 + insets.bottom }}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandName}>Trip<Text style={styles.brandAccent}>To</Text>Go</Text>
          </View>
          <Image source={images.avatar} style={styles.avatar} />
        </View>
        <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => {
          if (router.canGoBack()) router.back();
          else router.navigate(back.path);
        }}>
          <Text style={styles.link}>‹  {back.label}</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Place Details</Text>
        {failed ? (
          <View style={styles.message}>
            <Text style={styles.body}>Could not load this place.</Text>
            <Pressable accessibilityRole="button" onPress={() => {
              setFailed(false);
              setAttempt((value) => value + 1);
            }} style={styles.linkButton}>
              <Text style={styles.link}>Try again</Text>
            </Pressable>
          </View>
        ) : place === undefined ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading place details" style={styles.message} />
        ) : place === null ? (
          <Text style={[styles.body, styles.message]}>Place not found.</Text>
        ) : (
          <PlaceContent place={place} />
        )}
      </View>
    </ScrollView>
  );
}

export default function PlaceDetailsRoute() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  return <PlaceDetailsScreen key={id} id={id} from={from} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandName: { color: colors.ink, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  brandAccent: { color: '#A83DEB' },
  logo: { width: 40, height: 29 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  linkButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', marginBottom: 16 },
  photo: { width: '100%', height: 168, borderRadius: 20, backgroundColor: colors.soft },
  intro: { marginTop: 16, gap: 6 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  category: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  caption: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  summary: { marginTop: 18, padding: 16, gap: 5, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.soft },
  summaryTitle: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  expense: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  ratings: { flexDirection: 'row', gap: 20, marginTop: 7 },
  rating: { flex: 1 },
  score: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 },
  tag: { color: '#4B2FD0', backgroundColor: '#EEE8FF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '600' },
  reviews: { marginTop: 22, gap: 6 },
  review: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10, gap: 3 },
  reviewAuthor: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  reviewButton: { minHeight: 52, borderRadius: 16, marginTop: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingHorizontal: 12 },
  reviewButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  message: { marginTop: 20 },
});
