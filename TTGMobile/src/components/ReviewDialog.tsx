import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, formatAddress } from '../data/api';
import { getReviewTags, submitReview } from '../data/reviews';
import type { Review, ReviewPlace, ReviewTag } from '../data/reviews';

export type ReviewDialogState =
  | { mode: 'compose'; place?: ReviewPlace; query?: string }
  | { mode: 'correct'; review: Review }
  | { mode: 'view'; review: Review };

const reviewStatuses = {
  VERIFIED: { label: 'Published', color: '#176748', background: '#E8F6EE' },
  PENDING: { label: 'Awaiting review approval', color: '#80500C', background: '#FFF2D9' },
  PENDING_LOCATION: { label: 'Awaiting location approval', color: '#80500C', background: '#FFF2D9' },
  REJECTED: { label: 'Rejected', color: '#A03454', background: '#FCEBF0' },
};

export function ReviewButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function ReviewCard({ review, onPress }: { review: Review; onPress: () => void }) {
  return (
    <View style={styles.card}>
      <ReviewSummary review={review} />
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <Text style={styles.link}>{review.status === 'REJECTED' && review.locationId == null
          ? 'Correct Submission' : 'View Review'}</Text>
      </Pressable>
    </View>
  );
}

function ReviewSummary({ review }: { review: Review }) {
  const status = reviewStatuses[review.status];
  return (
    <>
      <Text accessibilityRole="header" style={styles.placeName}>{review.locationName ?? 'Location unavailable'}</Text>
      {review.tagNames.length > 0 && <Text style={styles.body}>Tags: {review.tagNames.join(', ')}</Text>}
      <Text style={styles.body}>Enjoyment: {review.enjoymentRating}/10 · Budget: {review.budgetRating}/10</Text>
      <Text style={[styles.status, { color: status.color, backgroundColor: status.background }]}>{status.label}</Text>
    </>
  );
}

function ReviewForm({ dialog, saving, onSaving, onSubmitted, onSignIn }: {
  dialog: Exclude<ReviewDialogState, { mode: 'view' }>;
  saving: boolean;
  onSaving: (saving: boolean) => void;
  onSubmitted: (review: Review) => void;
  onSignIn: () => void;
}) {
  const review = dialog.mode === 'correct' ? dialog.review : undefined;
  const place = dialog.mode === 'compose' ? dialog.place : undefined;
  const proposal = review?.proposedLocation;
  const [name, setName] = useState(proposal?.name ?? (dialog.mode === 'compose' ? dialog.query : '') ?? '');
  const [barangay, setBarangay] = useState(proposal?.address.barangay ?? '');
  const [city, setCity] = useState(proposal?.address.city ?? '');
  const [province, setProvince] = useState(proposal?.address.province ?? '');
  const [country, setCountry] = useState(proposal?.address.country ?? 'Philippines');
  const [tagOptions, setTagOptions] = useState<ReviewTag[]>([]);
  const [tagStatus, setTagStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [tagAttempt, setTagAttempt] = useState(0);
  const [tagCodes, setTagCodes] = useState(review?.tagCodes ?? []);
  const [enjoyment, setEnjoyment] = useState(review?.enjoymentRating.toString() ?? '');
  const [budget, setBudget] = useState(review?.budgetRating.toString() ?? '');
  const [text, setText] = useState(review?.writtenReview ?? '');
  const [error, setError] = useState('');
  const [signInRequired, setSignInRequired] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getReviewTags(controller.signal).then((options) => {
      if (!controller.signal.aborted) {
        setTagOptions(options);
        setTagStatus('ready');
      }
    }).catch(() => {
      if (!controller.signal.aborted) setTagStatus('error');
    });
    return () => controller.abort();
  }, [tagAttempt]);

  const submit = async () => {
    if (submitting.current) return;
    const rating = /^(?:[1-9]|10)$/;
    const address = { barangay: barangay.trim(), city: city.trim(), province: province.trim(), country: country.trim() };
    if (!place && (!name.trim() || Object.values(address).some((field) => !field))) {
      return setError('Enter a place name and complete address.');
    }
    if (!rating.test(enjoyment.trim()) || !rating.test(budget.trim())) {
      return setError('Enter a whole number from 1 to 10 for each rating.');
    }
    if (!text.trim()) return setError('Write a comment about your visit.');

    submitting.current = true;
    onSaving(true);
    setError('');
    try {
      const saved = await submitReview({
        ...(place ? { locationId: place.id } : { newLocation: { name: name.trim(), address } }),
        tagCodes, enjoymentRating: Number(enjoyment), budgetRating: Number(budget), writtenReview: text.trim(),
      });
      onSubmitted(saved);
    } catch (error) {
      setError(error instanceof ApiError ? error.message : 'Could not submit your review. Please try again.');
      setSignInRequired(error instanceof ApiError && error.status === 401);
    } finally {
      submitting.current = false;
      onSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      {place ? (
        <View style={styles.card}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.body}>{place.address}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.body}>New locations are reviewed before publication.</Text>
          <Field label="Place name" value={name} onChangeText={setName} maxLength={255} editable={!saving} />
          <Field label="Barangay" value={barangay} onChangeText={setBarangay} maxLength={255} editable={!saving} />
          <Field label="City" value={city} onChangeText={setCity} maxLength={255} editable={!saving} />
          <Field label="Province" value={province} onChangeText={setProvince} maxLength={255} editable={!saving} />
          <Field label="Country" value={country} onChangeText={setCountry} maxLength={25} editable={!saving} />
        </>
      )}
      <View style={styles.ratingRow}>
        <Field label="Enjoyment (1–10)" value={enjoyment} onChangeText={setEnjoyment} keyboardType="number-pad" maxLength={2} editable={!saving} />
        <Field label="Budget (1–10)" value={budget} onChangeText={setBudget} keyboardType="number-pad" maxLength={2} editable={!saving} />
      </View>
      <Field label="Comment" value={text} onChangeText={setText} maxLength={2000} multiline editable={!saving} />
      {tagStatus === 'loading' && <Text style={styles.body}>Loading tags…</Text>}
      {tagStatus === 'error' && (
        <Pressable accessibilityRole="button" style={styles.action} onPress={() => {
          setTagStatus('loading');
          setTagAttempt((attempt) => attempt + 1);
        }}>
          <Text style={styles.link}>Could not load tags. Try again.</Text>
        </Pressable>
      )}
      {tagOptions.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tags (optional)</Text>
          <View style={styles.tags}>
            {tagOptions.map((tag) => {
              const selected = tagCodes.includes(tag.code);
              return (
                <Pressable key={tag.code} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}
                  disabled={saving} style={[styles.tag, selected && styles.tagSelected]}
                  onPress={() => setTagCodes((codes) => selected ? codes.filter((code) => code !== tag.code) : [...codes, tag.code])}>
                  <Text style={[styles.fieldLabel, selected && styles.tagTextSelected]}>{tag.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {signInRequired ? <ReviewButton label="Log In" onPress={onSignIn} />
        : <ReviewButton label={saving ? 'Saving…' : review ? 'Resubmit Review' : 'Submit Review'} onPress={submit} disabled={saving} />}
    </View>
  );
}

function Field({ label, ...props }: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor="#6B6788"
        style={[styles.input, props.multiline && styles.multiline]} />
    </View>
  );
}

export default function ReviewDialog({ dialog, onClose, onSubmitted, onSignIn, onViewPlace }: {
  dialog: ReviewDialogState;
  onClose: () => void;
  onSubmitted: (review: Review) => void;
  onSignIn: () => void;
  onViewPlace?: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const title = dialog.mode === 'compose' ? 'Write a Review'
    : dialog.mode === 'correct' ? 'Correct Submission' : 'View Review';
  const address = dialog.mode === 'view' ? dialog.review.locationAddress ?? dialog.review.proposedLocation?.address : null;
  const locationId = dialog.mode === 'view' ? dialog.review.locationId : null;

  return (
    <Modal animationType="slide" onRequestClose={() => { if (!saving) onClose(); }}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}>
          <View style={styles.content}>
            <Pressable accessibilityRole="button" onPress={onClose} disabled={saving} style={styles.action}>
              <Text style={styles.link}>‹ Back</Text>
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            {dialog.mode === 'view' ? (
              <View style={styles.card}>
                <ReviewSummary review={dialog.review} />
                {address && <Text style={styles.body}>{formatAddress(address)}</Text>}
                {!!dialog.review.writtenReview && <Text style={styles.writtenReview}>{dialog.review.writtenReview}</Text>}
                {locationId != null && onViewPlace && (
                  <Pressable accessibilityRole="button" onPress={() => onViewPlace(locationId)} style={styles.action}>
                    <Text style={styles.link}>View Place</Text>
                  </Pressable>
                )}
              </View>
            ) : <ReviewForm dialog={dialog} saving={saving} onSaving={setSaving} onSubmitted={onSubmitted} onSignIn={onSignIn} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24, gap: 12 },
  title: { color: '#17133D', fontSize: 30, fontWeight: '900' },
  card: { padding: 12, gap: 3, borderWidth: 1, borderColor: '#DDD5F5', borderRadius: 16, backgroundColor: '#FFF' },
  placeName: { color: '#17133D', fontSize: 18, fontWeight: '800' },
  body: { color: '#6B6788', fontSize: 14, lineHeight: 20 },
  status: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginVertical: 2 },
  writtenReview: { color: '#17133D', fontSize: 16, lineHeight: 24, marginTop: 6 },
  action: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  link: { color: '#593BFA', fontSize: 15, fontWeight: '800' },
  button: { backgroundColor: '#593BFA', paddingHorizontal: 16, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
  form: { gap: 14 },
  ratingRow: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, minWidth: 0, gap: 5 },
  fieldLabel: { color: '#17133D', fontSize: 14, fontWeight: '700' },
  input: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderColor: '#DDD5F5', borderWidth: 1, borderRadius: 12, backgroundColor: '#F8F6FF', color: '#17133D', fontSize: 16 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F1EDFF' },
  tagSelected: { backgroundColor: '#593BFA' },
  tagTextSelected: { color: '#FFF' },
  error: { color: '#A03454', fontSize: 14, lineHeight: 20 },
});
