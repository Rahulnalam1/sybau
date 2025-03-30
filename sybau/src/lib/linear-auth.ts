import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Get the Linear access token from the cookie
 */
export async function getLinearAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('linear_access_token')?.value;
  
  return token;
}

/**
 * Get the Linear refresh token from the cookie
 */
export async function getLinearRefreshToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('linear_refresh_token')?.value;
  
  return token;
}

/**
 * Check if the user is authenticated with Linear
 */
export async function isLinearAuthenticated() {
  return !!(await getLinearAccessToken());
}

/**
 * Make an authenticated request to the Linear API
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

/**
 * Refresh the Linear access token using the refresh token
 */
export async function refreshLinearToken() {
  const refreshToken = await getLinearRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No Linear refresh token found');
  }
  
  // Prepare form data for the token request
  const formData = new URLSearchParams();
  formData.append('client_id', process.env.LINEAR_CLIENT_ID || '');
  formData.append('client_secret', process.env.LINEAR_CLIENT_SECRET || '');
  formData.append('refresh_token', refreshToken);
  formData.append('grant_type', 'refresh_token');
  
  const response = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh Linear token');
  }
  
  const data = await response.json();
  return data.access_token;
} 