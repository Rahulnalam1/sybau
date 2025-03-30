import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.redirect(new URL('/workspace?error=invalid_state', request.url));
    }
    
    // Parse the state JSON
    let stateData;
    try {
      stateData = JSON.parse(state);
    } catch (e) {
      // Fall back to direct comparison for backward compatibility
      if (state !== 'random-state-value') {
        return NextResponse.redirect(new URL('/workspace?error=invalid_state', request.url));
      }
    }

    if (!code) {
      return NextResponse.redirect(new URL('/workspace?error=no_code', request.url));
    }

    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI || 'http://localhost:3000/api/auth/jira/callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code for token:', errorText);
      return NextResponse.redirect(new URL('/workspace?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Redirect to the success page and maintain the state
    const successUrl = new URL('/integrate/jira/success', request.url);
    if (state) {
      successUrl.searchParams.set('state', state);
    }
    
    const response = NextResponse.redirect(successUrl);

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
    return NextResponse.redirect(new URL('/workspace?error=server_error', request.url));
  }
}
