import { useState } from 'react';
import type { ComponentProps } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LocalReview, ReviewFields, ReviewPlace } from '../data/reviews';

export type ReviewDialogState =
  | { mode: 'compose'; place?: Pick<ReviewPlace, 'name' | 'address'>; query?: string }
  | { mode: 'correct'; review: LocalReview }
  | { mode: 'view'; review: LocalReview };

const reviewStatuses = {
  approved: { label: 'Approved · Public', action: 'View Review', color: '#176748', background: '#E8F6EE' },
  pending: { label: 'Pending admin · Not public', action: 'View Submission Status', color: '#80500C', background: '#FFF2D9' },
  correction: { label: 'Needs correction · Not public', action: 'Correct Submission', color: '#A03454', background: '#FCEBF0' },
};

function reviewNote(review: LocalReview) {
  if (review.status === 'approved') return 'Existing place · Checked and published';
  if (review.status === 'correction') return 'Address is incomplete. Add street or barangay.';
  return review.existingPlace ? 'Existing place · Awaiting review' : 'New location · Awaiting verification';
}

export function ReviewButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function ReviewCard({ review, onPress }: { review: LocalReview; onPress: () => void }) {
  return (
    <View style={styles.card}>
      <ReviewSummary review={review} />
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <Text style={styles.link}>{reviewStatuses[review.status].action}</Text>
      </Pressable>
    </View>
  );
}

function ReviewSummary({ review }: { review: LocalReview }) {
  const status = reviewStatuses[review.status];
  return (
    <>
      <Text accessibilityRole="header" style={styles.placeName}>{review.placeName}</Text>
      <Text style={styles.body}>Tags: {review.tags.join(', ')}</Text>
      <Text style={styles.body}>Enjoyment: {review.enjoyment}/10 · Budget: {review.budget}/10</Text>
      <Text style={[styles.status, { color: status.color, backgroundColor: status.background }]}>{status.label}</Text>
      <Text style={styles.body}>{reviewNote(review)}</Text>
    </>
  );
}

type SubmitReview = (fields: ReviewFields, existingPlace: boolean, id?: string) => Promise<void>;

function ReviewForm({ dialog, saving, onSubmit }: {
  dialog: Exclude<ReviewDialogState, { mode: 'view' }>;
  saving: boolean;
  onSubmit: SubmitReview;
}) {
  const review = dialog.mode === 'correct' ? dialog.review : undefined;
  const place = dialog.mode === 'compose' ? dialog.place : undefined;
  const [name, setName] = useState(review?.placeName ?? place?.name ?? (dialog.mode === 'compose' ? dialog.query : '') ?? '');
  const [address, setAddress] = useState(review?.address ?? place?.address ?? '');
  const [tags, setTags] = useState(review?.tags.join(', ') ?? '');
  const [enjoyment, setEnjoyment] = useState(review?.enjoyment.toString() ?? '');
  const [budget, setBudget] = useState(review?.budget.toString() ?? '');
  const [text, setText] = useState(review?.text ?? '');
  const [error, setError] = useState('');

  const submit = async () => {
    const placeName = name.trim();
    const fullAddress = address.trim();
    const selectedTags = Array.from(new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean)));
    const rating = /^(?:[1-9]|10)$/;
    // TODO: Validate the place and review data against the signed-in account and backend rules.
    if (!placeName || !fullAddress) return setError('Enter a place name and address.');
    if (review?.status === 'correction' && fullAddress === review.address) {
      return setError('Update the address to correct this submission.');
    }
    if (selectedTags.length === 0) return setError('Enter at least one tag.');
    if (!rating.test(enjoyment.trim()) || !rating.test(budget.trim())) {
      return setError('Enter a whole number from 1 to 10 for each rating.');
    }
    setError('');
    try {
      await onSubmit({
        placeName, address: fullAddress, tags: selectedTags,
        enjoyment: Number(enjoyment), budget: Number(budget), text: text.trim(),
      }, review?.existingPlace ?? (place?.name === placeName && place?.address === fullAddress), review?.id);
    } catch {
      setError('Could not save your review. Please try again.');
    }
  };

  return (
    <View style={styles.form}>
      {review?.status === 'correction' && <Text style={styles.body}>{reviewNote(review)}</Text>}
      <Field label="Place name" value={name} onChangeText={setName} maxLength={100} editable={!saving} />
      <Field label="Address" value={address} onChangeText={setAddress} maxLength={255} editable={!saving} />
      <Field label="Tags" value={tags} onChangeText={setTags} maxLength={150} placeholder="Nature, walking" editable={!saving} />
      <View style={styles.ratingRow}>
        <Field label="Enjoyment (1–10)" value={enjoyment} onChangeText={setEnjoyment} keyboardType="number-pad" maxLength={2} editable={!saving} />
        <Field label="Budget (1–10)" value={budget} onChangeText={setBudget} keyboardType="number-pad" maxLength={2} editable={!saving} />
      </View>
      <Field label="Your review (optional)" value={text} onChangeText={setText} maxLength={2000} multiline editable={!saving} />
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <ReviewButton label={saving ? 'Saving…' : review ? 'Resubmit Review' : 'Submit Review'} onPress={submit} disabled={saving} />
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

export default function ReviewDialog({ dialog, saving, onClose, onSubmit }: {
  dialog: ReviewDialogState;
  saving: boolean;
  onClose: () => void;
  onSubmit: SubmitReview;
}) {
  const insets = useSafeAreaInsets();
  const title = dialog.mode === 'compose' ? 'Write a Review'
    : dialog.mode === 'correct' ? 'Correct Submission'
      : dialog.review.status === 'approved' ? 'View Review' : 'Submission Status';

  return (
    <Modal animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}>
          <View style={styles.content}>
            <Pressable accessibilityRole="button" onPress={onClose} disabled={saving} style={styles.action}>
              <Text style={styles.link}>‹  My Reviews</Text>
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            {dialog.mode === 'view' ? (
              <View style={styles.card}>
                <ReviewSummary review={dialog.review} />
                {!!dialog.review.address && <Text style={styles.body}>{dialog.review.address}</Text>}
                {!!dialog.review.text && <Text style={styles.writtenReview}>{dialog.review.text}</Text>}
              </View>
            ) : <ReviewForm dialog={dialog} saving={saving} onSubmit={onSubmit} />}
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
  error: { color: '#A03454', fontSize: 14, lineHeight: 20 },
});
