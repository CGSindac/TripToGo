import { formatAddress, request } from './api';
import type { Address, Page } from './api';
import { signedInRequest } from './auth';

export type ReviewPlace = { id: number; name: string; address: string };
export type ReviewTag = { code: string; name: string };
export type ProposedLocation = { name: string; address: Address };

type ReviewFields = {
  tagCodes: string[];
  enjoymentRating: number;
  budgetRating: number;
  writtenReview: string;
};

export type ReviewSubmission = ReviewFields & (
  | { locationId: number }
  | { newLocation: ProposedLocation }
);

export type Review = {
  reviewId: number;
  locationId: number | null;
  locationName: string | null;
  locationAddress: Address | null;
  proposedLocation: ProposedLocation | null;
  authorUsername: string | null;
  tagCodes: string[];
  tagNames: string[];
  enjoymentRating: number;
  budgetRating: number;
  writtenReview: string | null;
  status: 'VERIFIED' | 'PENDING' | 'PENDING_LOCATION' | 'REJECTED';
};

export async function searchReviewPlaces(query: string, page: number, signal: AbortSignal): Promise<Page<ReviewPlace>> {
  const result = await request<Page<{ locationId: number; name: string; address: Address }>>(
    `/reviews/locations?search=${encodeURIComponent(query)}&page=${page}`, 'Could not search places.', { signal },
  );
  return {
    ...result,
    content: result.content.map(({ locationId, name, address }) => ({ id: locationId, name, address: formatAddress(address) })),
  };
}

export function getReviewTags(signal: AbortSignal) {
  return request<ReviewTag[]>('/reviews/tags', 'Could not load tags.', { signal });
}

export function getMyReviews(page: number, signal: AbortSignal) {
  return signedInRequest<Page<Review>>(`/reviews/mine?page=${page}`, 'Could not load your reviews.', { signal });
}

export function submitReview(review: ReviewSubmission) {
  return signedInRequest<Review>('/reviews', 'Could not submit your review.', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}
