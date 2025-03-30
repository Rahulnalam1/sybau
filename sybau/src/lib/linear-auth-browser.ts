import { cookies } from 'next/dist/client/components/headers';

/**
 * Get the Linear access token from server API
 */
export async function getLinearAccessToken() {
  try {
    const response = await fetch('/api/auth/linear/token');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error fetching Linear token:', error);
    return null;
  }
}

/**
 * Check if the user is authenticated with Linear on the client side
 */
export async function isLinearAuthenticated() {
  return !!(await getLinearAccessToken());
}

/**
 * Make an authenticated request to the Linear API from the client
 */
export async function fetchFromLinear<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getLinearAccessToken();
  
  if (!accessToken) {
    throw new Error('No Linear access token found');
  }
  
  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://api.linear.app${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
} 