import { cookies } from 'next/headers';

/**
 * Get the JIRA access token from the cookie
 */
export async function getJiraAccessToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jira_access_token')?.value;
  
  return token;
}

/**
 * Get the JIRA refresh token from the cookie
 */
export async function getJiraRefreshToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jira_refresh_token')?.value;
  
  return token;
}

/**
 * Check if the user is authenticated with JIRA
 */
export async function isJiraAuthenticated() {
  return !!(await getJiraAccessToken());
}

/**
 * Make an authenticated request to the JIRA API
 */
export async function fetchFromJira<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getJiraAccessToken();
  
  if (!accessToken) {
    throw new Error('No JIRA access token found');
  }
  
  // Determine if it's a cloud URL or API endpoint
  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://api.atlassian.com${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`JIRA API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Refresh the JIRA access token using the refresh token
 */
export async function refreshJiraToken() {
  const refreshToken = await getJiraRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No JIRA refresh token found');
  }
  
  // Prepare form data for the token request
  const formData = new URLSearchParams();
  formData.append('client_id', process.env.JIRA_CLIENT_ID || '');
  formData.append('client_secret', process.env.JIRA_CLIENT_SECRET || '');
  formData.append('refresh_token', refreshToken);
  formData.append('grant_type', 'refresh_token');
  
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh JIRA token');
  }
  
  const data = await response.json();
  return data.access_token;
} 