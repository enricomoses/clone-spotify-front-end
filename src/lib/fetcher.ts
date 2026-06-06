import api from './axios';

/**
 * SWR fetcher using our configured Axios instance.
 * Expects Laravel resource responses with { data: T } structure.
 */
export const fetcher = (url: string) =>
  api.get(url).then((res) => res.data.data ?? res.data);

/**
 * Raw fetcher that returns the full response data (not unwrapped).
 */
export const rawFetcher = (url: string) =>
  api.get(url).then((res) => res.data);
