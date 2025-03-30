import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Extract the authorization code from the URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Validate the state parameter to prevent CSRF attacks
    // In a real implementation, you would compare this with a state you stored in the session
    if (!state || state !== 'random-state-value') {
      return NextResponse.redirect(new URL('/integrate/jira/error?error=invalid_state', request.url));
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/integrate/jira/error?error=no_code', request.url));
    }
    
    // Prepare form data for the token request
    const formData = new URLSearchParams();
    formData.append('client_id', process.env.JIRA_CLIENT_ID || '');
    formData.append('client_secret', process.env.JIRA_CLIENT_SECRET || '');
    formData.append('redirect_uri', process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI || 'http://localhost:3000/api/auth/jira/callback');
    formData.append('code', code);
    formData.append('grant_type', 'authorization_code');

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI || 'http://localhost:3000/api/auth/jira/callback'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code for token:', errorText);
      return NextResponse.redirect(new URL('/integrate/jira/error?error=token_exchange_failed', request.url));
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;
    
    // In a real application, you should store these tokens securely
    // For example, in a database associated with the user's session
    
    // For this example, we'll store it in a secure HTTP-only cookie
    const response = NextResponse.redirect(new URL('/integrate/jira/success', request.url));
    
    // Set secure HTTP-only cookies
    response.cookies.set({
      name: 'jira_access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    if (refresh_token) {
      response.cookies.set({
        name: 'jira_refresh_token',
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error in JIRA OAuth callback:', error);
    return NextResponse.redirect(new URL('/integrate/jira/error?error=server_error', request.url));
  }
} 