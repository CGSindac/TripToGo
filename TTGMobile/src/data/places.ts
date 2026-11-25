import { Platform } from 'react-native';

export type PlaceReview = {
  reviewId: number;
  authorUsername: string | null;
  enjoymentRating: number;
  budgetRating: number;
  writtenReview: string | null;
};

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
  reviews?: PlaceReview[];
};

type LocationResponse = {
  locationId: number;
  name: string;
  address: { barangay: string | null; city: string | null; province: string; country: string };
  description: string | null;
  tags: { name: string }[];
  enjoymentRating: number;
  budgetRating: number;
};

type ReviewPage = {
  content: PlaceReview[];
  page: { number: number; totalElements: number; totalPages: number };
};

const LIPA_ADDRESS = 'Lipa City, Batangas, Philippines';

export const sampleRecommendedPlace: SamplePlace = {
  id: 'p1', name: 'El Nido, Palawan', category: 'Attractions', imageUrl: null,
  rating: 4.8, estimatedCost: 12500, currency: 'PHP', enjoymentRating: 9.6, budgetRating: null,
  address: 'El Nido, Palawan, Philippines', tags: ['Beach', 'Island hopping'],
  description: 'Limestone cliffs, hidden lagoons and island hopping.',
};

export const sampleBrowsePlaces: SamplePlace[] = [
  {
    id: 'a1', name: 'Lipa Cathedral Plaza', category: 'Attractions', imageUrl: null,
    rating: 4.7, estimatedCost: 0, currency: 'PHP', saved: false, enjoymentRating: 9.4, budgetRating: 10,
    address: LIPA_ADDRESS, tags: ['Heritage', 'Walking'],
    description: 'An open plaza outside the cathedral with space to walk and take in the architecture.',
    reviews: [
      { reviewId: 1, authorUsername: 'Sample visitor', enjoymentRating: 9, budgetRating: 10, writtenReview: 'An easy stop for a short walk and a look at the cathedral.' },
    ],
  },
  {
    id: 'a2', name: 'Barako Coffee House', category: 'Restaurants', imageUrl: null,
    rating: 4.6, estimatedCost: 250, currency: 'PHP', saved: true, enjoymentRating: 9.2, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Coffee', 'Local food'],
    description: 'A café stop for barako coffee and a light snack.',
  },
  {
    id: 'a3', name: 'Lipa Public Market', category: 'Shops', imageUrl: null,
    rating: 4.4, estimatedCost: 150, currency: 'PHP', saved: false, enjoymentRating: 8.8, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Market', 'Local shopping'],
    description: 'A public market with produce, snacks and goods from local vendors.',
  },
  {
    id: 'a4', name: 'Sampaguita Garden Park', category: 'Attractions', imageUrl: null,
    rating: 4.5, estimatedCost: 100, currency: 'PHP', saved: false, enjoymentRating: 9, budgetRating: null,
    address: LIPA_ADDRESS, tags: ['Nature', 'Walking', 'Family-friendly'],
    description: 'A garden stop for a stroll and a break outdoors.',
  },
];

const samplePlaces = [sampleRecommendedPlace, ...sampleBrowsePlaces];
const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
const apiUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || defaultApiUrl).replace(/\/+$/, '');

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

  const response = await fetch(`${apiUrl}/locations/${id}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Could not load place details.');

  const location: LocationResponse = await response.json();
  const { barangay, city, province, country } = location.address;
  return {
    id: String(location.locationId),
    name: location.name,
    address: [barangay, city, province, country].filter(Boolean).join(', '),
    description: location.description,
    tags: location.tags.map((tag) => tag.name),
    enjoymentRating: location.enjoymentRating || null,
    budgetRating: location.budgetRating || null,
  };
}

export async function getPlaceReviews(id: string, page: number, signal: AbortSignal): Promise<ReviewPage> {
  const sample = samplePlaces.find((place) => place.id === id);
  if (sample) {
    const content = sample.reviews ?? [];
    return { content, page: { number: 0, totalElements: content.length, totalPages: 1 } };
  }

  const response = await fetch(`${apiUrl}/locations/${id}/reviews?page=${page}`, { signal });
  if (!response.ok) throw new Error('Could not load community reviews.');
  return response.json();
}
