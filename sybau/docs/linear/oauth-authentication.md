# Linear OAuth Authentication

## Overview

The Linear integration uses OAuth 2.0 to securely authenticate users. This allows users to grant Sybau access to their Linear data without sharing their Linear credentials directly.

## OAuth Flow

1. **User initiates authentication**: User clicks "Connect Linear Account" on the `/integrate/linear` page
2. **Authorization request**: Sybau redirects to Linear's OAuth authorization endpoint
3. **User consents**: User logs into Linear (if not already) and grants permissions to Sybau
4. **Authorization code**: Linear redirects back to Sybau with an authorization code
5. **Token exchange**: Sybau exchanges the code for access and refresh tokens
6. **Store tokens**: Sybau securely stores the tokens in HTTP-only cookies
7. **Use tokens**: Sybau uses the tokens for API requests to Linear

### Authentication Sequence Diagram

```
┌────────┐                 ┌────────┐                 ┌────────┐
│  User  │                 │  Sybau │                 │ Linear │
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
LINEAR_CLIENT_ID=your_client_id
LINEAR_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_LINEAR_CLIENT_ID=your_client_id
NEXT_PUBLIC_LINEAR_REDIRECT_URI=http://localhost:3000/api/auth/linear/callback
```

## OAuth Endpoints

| Purpose | Endpoint | Description |
|---------|----------|-------------|
| Authorization | `https://linear.app/oauth/authorize` | Endpoint to redirect users for authorization |
| Token Exchange | `https://api.linear.app/oauth/token` | Endpoint to exchange authorization code for tokens |

## Implementation Details

### Authentication Initiation

The `/integrate/linear` page contains a button that redirects the user to Linear's OAuth endpoint:

```typescript
const linearAuthUrl = `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,write,issues:create&response_type=code&state=random-state-value`;
```

### Callback Handling

The `/api/auth/linear/callback` API route handles the OAuth callback:

1. Validates the received state parameter to prevent CSRF attacks
2. Exchanges the authorization code for access and refresh tokens
3. Stores the tokens in HTTP-only cookies
4. Redirects the user to the success page

### Token Storage

Tokens are stored in HTTP-only cookies:

```typescript
response.cookies.set({
  name: 'linear_access_token',
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
```

## Security Considerations

1. **CSRF Protection**: Uses a state parameter to prevent cross-site request forgery
2. **Secure Token Storage**: Tokens are stored in HTTP-only cookies to prevent JavaScript access
3. **TLS/SSL**: All communication uses HTTPS to encrypt data in transit
4. **Limited Scopes**: Only necessary permissions are requested from Linear

## Troubleshooting

Common issues and solutions:

1. **"Invalid redirect_uri parameter"**: Ensure the redirect URI in your Linear developer settings exactly matches the one in your environment variables.
2. **"Could not find OAuth client with clientId"**: Verify your client ID is correct in your environment variables.
3. **"Invalid request: content must be application/x-www-form-urlencoded"**: Ensure token requests use the correct content type.
4. **"Your workspace does not have access to this private application"**: Set your Linear OAuth application to "Public" in Linear's developer settings. 