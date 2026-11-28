import { Platform } from 'react-native';

const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const apiUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || defaultApiUrl).replace(/\/+$/, '');

export type Page<T> = {
  content: T[];
  page: { number: number; totalElements: number; totalPages: number };
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function request<T>(path: string, message: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, options);
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    const detail = response.status < 500 ? problem?.detail : null;
    throw new ApiError(response.status, typeof detail === 'string' ? detail : message);
  }
  return response.json();
}

export type Address = {
  barangay: string | null;
  city: string | null;
  province: string;
  country: string;
};

export function formatAddress({ barangay, city, province, country }: Address) {
  return [barangay, city, province, country].filter(Boolean).join(', ');
}
