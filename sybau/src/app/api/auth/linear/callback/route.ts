import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!state || state !== 'random-state-value') {
      return NextResponse.redirect(new URL('/workspace?error=invalid_state', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/workspace?error=no_code', request.url));
    }

    const formData = new URLSearchParams();
    formData.append('client_id', process.env.LINEAR_CLIENT_ID || '');
    formData.append('client_secret', process.env.LINEAR_CLIENT_SECRET || '');
    formData.append('redirect_uri', process.env.NEXT_PUBLIC_LINEAR_REDIRECT_URI || 'http://localhost:3000/api/auth/linear/callback');
    formData.append('code', code);
    formData.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code for token:', errorText);
      return NextResponse.redirect(new URL('/workspace?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    const response = NextResponse.redirect(new URL('/workspace', request.url));

    response.cookies.set({
      name: 'linear_access_token',
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    if (refresh_token) {
      response.cookies.set({
        name: 'linear_refresh_token',
        value: refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error('Error in Linear OAuth callback:', error);
    return NextResponse.redirect(new URL('/workspace?error=server_error', request.url));
  }
}
