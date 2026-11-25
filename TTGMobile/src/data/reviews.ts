import AsyncStorage from '@react-native-async-storage/async-storage';

import { sampleBrowsePlaces, sampleRecommendedPlace } from './places';

export type ReviewPlace = { id: string; name: string; address: string };

export type ReviewFields = {
  placeName: string;
  address: string;
  tags: string[];
  enjoyment: number;
  budget: number;
  text: string;
};

export type LocalReview = ReviewFields & {
  id: string;
  status: 'approved' | 'pending' | 'correction';
  existingPlace: boolean;
};

const STORAGE_KEY = 'triptogo.my-reviews.v1';
const gardenAddress = '24 Garden Road, Brgy. Balintawak, Lipa City, Batangas';
const cafeAddress = 'Balete, Batangas';
const places: ReviewPlace[] = [
  ...sampleBrowsePlaces,
  sampleRecommendedPlace,
  { id: 'garden', name: 'Lipa Community Garden', address: gardenAddress },
];

const sampleReviews: LocalReview[] = [
  {
    id: 'sample-garden', placeName: 'Lipa Community Garden', address: gardenAddress,
    tags: ['nature', 'walking'], enjoyment: 8, budget: 7,
    status: 'approved', existingPlace: true, text: 'Quiet paths and plenty of shade for an afternoon walk.',
  },
  {
    id: 'sample-cafe', placeName: 'Balete Lakeside Café', address: cafeAddress,
    tags: ['local food', 'lake view'], enjoyment: 8, budget: 7,
    status: 'pending', existingPlace: false, text: 'A good stop for a snack with a view of the lake.',
  },
  {
    id: 'sample-food', placeName: 'Old Town Food Stop', address: '',
    tags: ['local food', 'affordable'], enjoyment: 7, budget: 9,
    status: 'correction', existingPlace: false, text: 'Affordable meals and a quick stop for lunch.',
  },
];

export function searchReviewPlaces(query: string) {
  const searchTerms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (searchTerms.length === 0) return [];
  // TODO: Query the place catalog here when review search is connected to the backend.
  return places.filter((place) => {
    const searchable = `${place.name} ${place.address}`.toLocaleLowerCase();
    return searchTerms.every((term) => searchable.includes(term));
  });
}

export async function loadLocalReviews(): Promise<LocalReview[]> {
  // TODO: Load the signed-in user's reviews and moderation statuses here.
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved === null ? sampleReviews : JSON.parse(saved);
}

export async function saveLocalReviews(reviews: LocalReview[]) {
  // TODO: Submit new or corrected reviews here and use the returned moderation status.
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}
