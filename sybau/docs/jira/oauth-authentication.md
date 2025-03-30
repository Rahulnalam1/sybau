# JIRA OAuth Authentication

## Overview

The JIRA integration uses OAuth 2.0 to securely authenticate users. This allows users to grant Sybau access to their JIRA data without sharing their Atlassian credentials directly.

## OAuth Flow

1. **User initiates authentication**: User clicks "Connect JIRA Account" on the `/integrate/jira` page
2. **Authorization request**: Sybau redirects to Atlassian's OAuth authorization endpoint
3. **User consents**: User logs into Atlassian (if not already) and grants permissions to Sybau
4. **Authorization code**: Atlassian redirects back to Sybau with an authorization code
5. **Token exchange**: Sybau exchanges the code for access and refresh tokens
6. **Store tokens**: Sybau securely stores the tokens in HTTP-only cookies
7. **Use tokens**: Sybau uses the tokens for API requests to JIRA

### Authentication Sequence Diagram

```
┌────────┐                 ┌────────┐                 ┌────────┐
│  User  │                 │  Sybau │                 │ JIRA   │
└───┬────┘                 └───┬────┘                 └───┬────┘
    │                          │                          │
    │ Click Connect            │                          │
    │────────────────────────>│                          │
    │                          │                          │
    │                          │ Redirect to OAuth URL    │
    │                          │────────────────────────>│
    │                          │                          │
    │ Log in & Authorize       │                          │
    │────────────────────────────────────────────────────>│
    │                          │                          │
    │                          │      Authorization Code  │
    │                          │<─────────────────────────│
    │                          │                          │
    │                          │ Exchange Code for Tokens │
    │                          │────────────────────────>│
    │                          │                          │
    │                          │      Access & Refresh    │
    │                          │<─────────────────────────│
    │                          │                          │
    │ Redirect to Success Page │                          │
    │<─────────────────────────│                          │
    │                          │                          │
```

## Environment Configuration

The following environment variables must be set:

```
JIRA_CLIENT_ID=your_client_id
JIRA_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_JIRA_CLIENT_ID=your_client_id
NEXT_PUBLIC_JIRA_REDIRECT_URI=http://localhost:3000/api/auth/jira/callback
```

## OAuth Endpoints

| Purpose | Endpoint | Description |
|---------|----------|-------------|
| Authorization | `https://auth.atlassian.com/authorize` | Endpoint to redirect users for authorization |
| Token Exchange | `https://auth.atlassian.com/oauth/token` | Endpoint to exchange authorization code for tokens |

## Implementation Details

### Authentication Initiation

The `/integrate/jira` page contains a button that redirects the user to Atlassian's OAuth endpoint:

```typescript
const jiraAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=offline_access%20read%3Ajira-work%20write%3Ajira-work%20manage%3Ajira-project&redirect_uri=${encodeURIComponent(redirectUri)}&state=random-state-value&response_type=code&prompt=consent`;
```

### Callback Handling

The `/api/auth/jira/callback` API route handles the OAuth callback:

1. Validates the received state parameter to prevent CSRF attacks
2. Exchanges the authorization code for access and refresh tokens
3. Stores the tokens in HTTP-only cookies
4. Redirects the user to the success page

### Token Storage

Tokens are stored in HTTP-only cookies:

```typescript
response.cookies.set({
  name: 'jira_access_token',
  value: access_token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 1 week
});
```

### Token Refreshing

When the access token expires, the refresh token is used to obtain a new access token:

```typescript
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
```

## Security Considerations

1. **CSRF Protection**: Uses a state parameter to prevent cross-site request forgery
2. **Secure Token Storage**: Tokens are stored in HTTP-only cookies to prevent JavaScript access
3. **TLS/SSL**: All communication uses HTTPS to encrypt data in transit
4. **Limited Scopes**: Only necessary permissions are requested from Atlassian

## Required Scopes

The integration requires the following scopes:

1. **offline_access**: To get a refresh token for long-term access
2. **read:jira-work**: To read JIRA project and issue data
3. **write:jira-work**: To create and update JIRA issues
4. **manage:jira-project**: For advanced project management features

## Troubleshooting

Common issues and solutions:

1. **"Invalid redirect_uri parameter"**: Ensure the redirect URI in your Atlassian developer settings exactly matches the one in your environment variables.
2. **"Invalid client_id"**: Verify your client ID is correct in your environment variables.
3. **"invalid_grant"**: This usually means the authorization code has expired or has already been used.
4. **"Invalid request: content must be application/json"**: Atlassian requires JSON content type for token requests, not form-urlencoded.
5. **Token not found**: Check that cookies are being properly set and not blocked by browser settings. 