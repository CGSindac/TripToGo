import { ApiError, formatAddress, request } from './api';
import type { Address, Page } from './api';
import type { Review } from './reviews';

export type PlaceDetails = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  tags: string[];
  enjoymentRating: number | null;
  budgetRating: number | null;
  category?: string;
  imageUrl?: string | null;
  estimatedCost?: number;
  currency?: string;
};

type SamplePlace = PlaceDetails & {
  rating: number;
  saved?: boolean;
};

type LocationResponse = {
  locationId: number;
  name: string;
  address: Address;
  description: string | null;
  tags: { name: string }[];
  enjoymentRating: number;
  budgetRating: number;
};

const LIPA_ADDRESS = 'Lipa City, Batangas, Philippines';

export const sampleRecommendedPlace: SamplePlace = {
  id: 'p1', name: 'El Nido, Palawan', category: 'Attractions', imageUrl: null,
  rating: 4.8, estimatedCost: 12500, currency: 'PHP', enjoymentRating: null, budgetRating: null,
  address: 'El Nido, Palawan, Philippines', tags: ['Beach', 'Island hopping'],
  description: 'Limestone cliffs, hidden lagoons and island hopping.',
};

export const sampleBrowsePlaces: SamplePlace[] = [
  {
    id: 'a1', name: 'Lipa Cathedral Plaza', category: 'Attractions', imageUrl: null,
    rating: 4.7, estimatedCost: 0, currency: 'PHP', saved: false, enjoymentRating: null, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Heritage', 'Walking'],
    description: 'An open plaza outside the cathedral with space to walk and take in the architecture.',
  },
  {
    id: 'a2', name: 'Barako Coffee House', category: 'Restaurants', imageUrl: null,
    rating: 4.6, estimatedCost: 250, currency: 'PHP', saved: true, enjoymentRating: null, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Coffee', 'Local food'],
    description: 'A café stop for barako coffee and a light snack.',
  },
  {
    id: 'a3', name: 'Lipa Public Market', category: 'Shops', imageUrl: null,
    rating: 4.4, estimatedCost: 150, currency: 'PHP', saved: false, enjoymentRating: null, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Market', 'Local shopping'],
    description: 'A public market with produce, snacks and goods from local vendors.',
  },
  {
    id: 'a4', name: 'Sampaguita Garden Park', category: 'Attractions', imageUrl: null,
    rating: 4.5, estimatedCost: 100, currency: 'PHP', saved: false, enjoymentRating: null, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Nature', 'Walking', 'Family-friendly'],
    description: 'A garden stop for a stroll and a break outdoors.',
  },
];

const samplePlaces = [sampleRecommendedPlace, ...sampleBrowsePlaces];

export function placeDetailsHref(id: string | number, from: 'home' | 'browse' | 'explore' | 'reviews') {
  return { pathname: '/(tabs)/places/[id]' as const, params: { id: String(id), from } };
}

export function isSamplePlace(id: string) {
  return samplePlaces.some((place) => place.id === id);
}

export async function getPlaceDetails(id: string, signal: AbortSignal): Promise<PlaceDetails | null> {
  const sample = samplePlaces.find((place) => place.id === id);
  if (sample) return sample;
  if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2147483647) return null;

  try {
    return toPlaceDetails(await request<LocationResponse>(`/locations/${id}`, 'Could not load place details.', { signal }));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function toPlaceDetails(location: LocationResponse): PlaceDetails {
  return {
    id: String(location.locationId),
    name: location.name,
    address: formatAddress(location.address),
    description: location.description,
    tags: location.tags.map((tag) => tag.name),
    enjoymentRating: location.enjoymentRating || null,
    budgetRating: location.budgetRating || null,
  };
}

export async function getPlaces(query: string, page: number, signal: AbortSignal): Promise<Page<PlaceDetails>> {
  const result = await request<Page<LocationResponse>>(
    `/locations?search=${encodeURIComponent(query)}&page=${page}`, 'Could not load places.', { signal },
  );
  return { ...result, content: result.content.map(toPlaceDetails) };
}

export function getPlaceReviews(id: string, page: number, signal: AbortSignal) {
  return request<Page<Review>>(`/locations/${id}/reviews?page=${page}`, 'Could not load community reviews.', { signal });
}
