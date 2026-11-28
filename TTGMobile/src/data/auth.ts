import { ApiError, request } from './api';
import { placeDetailsHref } from './places';

let sessionToken: string | undefined;

export function isSignedIn() {
  return sessionToken !== undefined;
}

export function signedInDestination(returnTo?: string, placeId?: string) {
  if (returnTo === 'place' && typeof placeId === 'string' && /^[1-9]\d{0,9}$/.test(placeId)) {
    return placeDetailsHref(placeId, 'reviews');
  }
  return returnTo === 'reviews' ? '/(tabs)/reviews' : '/(tabs)/home';
}

export async function login(login: string, password: string) {
  await startSession('/auth/login', { login, password });
}

export async function register(username: string, email: string, password: string) {
  await startSession('/auth/register', { username, email, password });
}

async function startSession(path: string, details: Record<string, string>) {
  const { token } = await request<{ token: string }>(path, 'Could not connect to your account.', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  sessionToken = token;
}

export async function signedInRequest<T>(path: string, message: string, options?: RequestInit) {
  const token = sessionToken;
  if (!token) throw new ApiError(401, 'Log in to continue.');
  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  try {
    return await request<T>(path, message, { ...options, headers });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && sessionToken === token) {
      sessionToken = undefined;
    }
    throw error;
  }
}
