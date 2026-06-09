import api from './axios';

/**
 * Login a user via the unified /login endpoint.
 */
export async function loginUser(email: string, password: string) {
  const response = await api.post('/login', {
    email,
    password,
    role: 'user',
  });
  return response.data.data; // returns User object
}

/**
 * Login an artist via the unified /login endpoint.
 */
export async function loginArtist(email: string, password: string) {
  const response = await api.post('/login', {
    email,
    password,
    role: 'artist',
  });
  return response.data.data; // returns Artist object
}
